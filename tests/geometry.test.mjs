import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  cylinderVolumeAtCrankAngle,
  deriveCylinderGeometry,
  deriveUniformEngineGeometry,
  meanPistonSpeedMetersPerSecond,
} from '../src/core/geometry/index.ts';
import {
  fromDisplayValue,
  quantityField,
  toDisplayValue,
} from '../src/contracts/configurator/units.ts';

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/geometry/i4-86mm.json', import.meta.url),
    'utf8',
  ),
);
const length = quantityField('engine.boreMeters', 'length');
const displacement = quantityField('engine.displacement', 'displacement');
const input = {
  boreMeters: fromDisplayValue(fixture.boreMm, length, 'mm'),
  strokeMeters: fromDisplayValue(fixture.strokeMm, length, 'mm'),
  connectingRodMeters: fromDisplayValue(fixture.rodMm, length, 'mm'),
  compressionRatio: fixture.compressionRatio,
  cylinderCount: fixture.cylinderCount,
};
const approximately = (actual, expected, tolerance = 1e-12) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );

test('86 mm I4 displacement follows the pi/4 cylinder formula', () => {
  const calculated = deriveUniformEngineGeometry(input);
  const oneCylinder = (Math.PI / 4) * 0.086 ** 2 * 0.086;
  approximately(calculated.cylinder.sweptVolumeCubicMeters, oneCylinder);
  approximately(calculated.totalDisplacementCubicMeters, oneCylinder * 4);
  approximately(calculated.totalDisplacementLiters, oneCylinder * 4 * 1000);
  approximately(calculated.totalDisplacementCc, oneCylinder * 4 * 1_000_000);
  approximately(
    toDisplayValue(calculated.totalDisplacementCubicMeters, displacement, 'L'),
    calculated.totalDisplacementLiters,
  );
  approximately(
    calculated.cylinder.volumeAtBdcCubicMeters /
      calculated.cylinder.volumeAtTdcCubicMeters,
    10,
  );
  approximately(calculated.cylinder.crankRadiusMeters, 0.043);
});

test('mm and inches roundtrip through shared SI display-unit boundary', () => {
  for (const mm of [1, 86, 143, 500]) {
    const meters = fromDisplayValue(mm, length, 'mm');
    const inches = toDisplayValue(meters, length, 'in');
    approximately(fromDisplayValue(inches, length, 'in'), meters);
    approximately(toDisplayValue(meters, length, 'mm'), mm);
  }
  approximately(fromDisplayValue(1, length, 'in'), 0.0254);
  approximately(toDisplayValue(0.086, length, 'in'), 86 / 25.4);
  const result = deriveUniformEngineGeometry({
    ...input,
    boreMeters: fromDisplayValue(
      toDisplayValue(input.boreMeters, length, 'in'),
      length,
      'in',
    ),
  });
  approximately(
    result.totalDisplacementCubicMeters,
    deriveUniformEngineGeometry(input).totalDisplacementCubicMeters,
  );
});

test('slider-crank volume reaches TDC/BDC and mean piston speed is SI', () => {
  const cylinder = deriveCylinderGeometry(input);
  approximately(
    cylinderVolumeAtCrankAngle(input, 0),
    cylinder.volumeAtTdcCubicMeters,
  );
  approximately(
    cylinderVolumeAtCrankAngle(input, Math.PI),
    cylinder.volumeAtBdcCubicMeters,
  );
  approximately(
    cylinderVolumeAtCrankAngle(input, 2 * Math.PI),
    cylinder.volumeAtTdcCubicMeters,
  );
  const mid = cylinderVolumeAtCrankAngle(input, Math.PI / 2);
  assert.ok(mid > cylinder.volumeAtTdcCubicMeters);
  assert.ok(mid < cylinder.volumeAtBdcCubicMeters);
  approximately(meanPistonSpeedMetersPerSecond(input.strokeMeters, 3000), 8.6);
  assert.equal(meanPistonSpeedMetersPerSecond(input.strokeMeters, 0), 0);
});

test('invalid geometry and rod/crank collisions fail closed', () => {
  for (const [change, expected] of [
    [{ boreMeters: -0.086 }, /boreMeters/],
    [{ boreMeters: Number.NaN }, /boreMeters/],
    [{ strokeMeters: 0 }, /strokeMeters/],
    [{ strokeMeters: Infinity }, /strokeMeters/],
    [{ connectingRodMeters: 0.043 }, /rod must exceed crank radius/],
    [{ connectingRodMeters: 0.042 }, /rod must exceed crank radius/],
    [{ compressionRatio: 1 }, /compressionRatio/],
    [{ compressionRatio: -2 }, /compressionRatio/],
    [{ compressionRatio: Infinity }, /compressionRatio/],
  ]) {
    assert.throws(
      () => deriveCylinderGeometry({ ...input, ...change }),
      expected,
    );
  }
  for (const count of [0, 1.5, 13, Number.NaN, Infinity]) {
    assert.throws(
      () => deriveUniformEngineGeometry({ ...input, cylinderCount: count }),
      /cylinderCount/,
    );
  }
  assert.throws(
    () => cylinderVolumeAtCrankAngle(input, Infinity),
    /crankAngleRadians/,
  );
  assert.throws(
    () => meanPistonSpeedMetersPerSecond(-0.1, 3000),
    /strokeMeters/,
  );
  assert.throws(() => meanPistonSpeedMetersPerSecond(0.086, -10), /rpm/);
});

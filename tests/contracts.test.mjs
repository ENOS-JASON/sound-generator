import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  ContractValidationError,
  parseVehicleDefinitionJson,
  validateVehicleDefinitionV2,
} from '../src/contracts/vehicle-definition.ts';
import { validateEngineEventEnvelopeV2 } from '../src/contracts/engine-event.ts';
import { createSeededRandom } from '../src/contracts/prng.ts';
import {
  SI,
  barToPascals,
  celsiusToKelvin,
  cubicCentimetersToCubicMeters,
  degreesToRadians,
  litersToCubicMeters,
  mechanicalHorsepowerToWatts,
  millimetersToMeters,
  psiToPascals,
  radiansPerSecondToRpm,
  rpmToRadiansPerSecond,
} from '../src/contracts/units.ts';

function fixture(name) {
  return readFileSync(new URL(`./fixtures/contracts/${name}`, import.meta.url), 'utf8');
}

const mechanical = JSON.parse(fixture('i4-mechanical.v2.json'));
const efi = JSON.parse(fixture('i4-efi.v2.json'));
const clone = structuredClone;

test('both exclusive versioned I4 structural imports are valid', () => {
  for (const value of [mechanical, efi]) {
    assert.deepEqual(parseVehicleDefinitionJson(JSON.stringify(value)), value);
    assert.ok(value.manifest.components.every((component) => component.modelSupport === 'planned'));
    assert.deepEqual(value.engine.firingOrder, [1, 3, 4, 2]);
  }
  assert.equal(mechanical.control.kind, 'mechanical');
  assert.equal(efi.control.kind, 'ecu');
});

test('invalid JSON, unknown versions and unsupported legacy migration fail closed', () => {
  assert.throws(() => parseVehicleDefinitionJson(fixture('unknown-version.json')), /expected 2/);
  assert.throws(() => parseVehicleDefinitionJson(fixture('legacy-v1.json')), /v1 migration unavailable/);
  assert.throws(() => parseVehicleDefinitionJson('{'), /invalid JSON syntax/);
  assert.throws(() => parseVehicleDefinitionJson('x'.repeat(262_145)), /exceeds 256 KiB/);
  assert.throws(() => parseVehicleDefinitionJson('null'), ContractValidationError);
});

test('mechanical controllers reject ECU maps and simultaneous ECU components', () => {
  const map = clone(mechanical);
  map.control.fuelMapId = 'forbidden';
  assert.throws(() => validateVehicleDefinitionV2(map), /control.fuelMapId.*unknown property/);
  const mixed = clone(mechanical);
  mixed.manifest.components.push(efi.manifest.components[1]);
  assert.throws(() => validateVehicleDefinitionV2(mixed), /mixed mechanical\/ECU controllers/);
  const wrong = clone(efi);
  wrong.control.kind = 'mechanical';
  assert.throws(() => validateVehicleDefinitionV2(wrong), /control.*unknown property/);
});

test('missing starter, battery, manual driveline and road-load links fail validation', () => {
  const starter = clone(mechanical);
  starter.electrical.starterCranksEngineId = 'missing';
  assert.throws(() => validateVehicleDefinitionV2(starter), /starter\/battery\/engine/);
  const battery = clone(mechanical);
  battery.electrical.starterPoweredByBatteryId = 'missing';
  assert.throws(() => validateVehicleDefinitionV2(battery), /starter\/battery\/engine/);
  for (const key of ['clutchId', 'gearboxId', 'drivenAxleId', 'roadLoadId']) {
    const broken = clone(mechanical);
    delete broken.driveline[key];
    assert.throws(() => validateVehicleDefinitionV2(broken), /missing property/);
  }
});

test('invalid geometry, duplicates, firing order and unknown fields are rejected', () => {
  const duplicated = clone(mechanical);
  duplicated.engine.banks[0].cylinderIds = [1, 2, 2, 4];
  assert.throws(() => validateVehicleDefinitionV2(duplicated), /duplicate cylinder/);
  const order = clone(efi);
  order.engine.firingOrder = [1, 2, 2, 4];
  assert.throws(() => validateVehicleDefinitionV2(order), /permutation/);
  const collision = clone(mechanical);
  collision.manifest.components[1].id = 'engine';
  assert.throws(() => validateVehicleDefinitionV2(collision), /duplicate component/);
  const nan = clone(efi);
  nan.engine.boreMeters = Number.NaN;
  assert.throws(() => validateVehicleDefinitionV2(nan), /finite number/);
  const rod = clone(mechanical);
  rod.engine.connectingRodMeters = 0.001;
  assert.throws(() => validateVehicleDefinitionV2(rod), /crank radius/);
  const bad = clone(mechanical);
  bad.evaluate = '() => globalThis';
  assert.throws(() => validateVehicleDefinitionV2(bad), /unknown property/);
});

test('SI conversions use declared physical factors', () => {
  assert.equal(millimetersToMeters(1000), 1);
  assert.equal(cubicCentimetersToCubicMeters(1000), 0.001);
  assert.equal(litersToCubicMeters(2), 0.002);
  assert.equal(barToPascals(1), 100000);
  assert.equal(psiToPascals(1), SI.pascalsPerPsi);
  assert.equal(rpmToRadiansPerSecond(60), 2 * Math.PI);
  assert.equal(radiansPerSecondToRpm(2 * Math.PI), 60);
  assert.equal(degreesToRadians(180), Math.PI);
  assert.equal(celsiusToKelvin(0), 273.15);
  assert.equal(mechanicalHorsepowerToWatts(1), SI.wattsPerMechanicalHorsepower);
  assert.throws(() => rpmToRadiansPerSecond(Infinity), /finite/);
});

test('seeded sequence is reproducible and rejects invalid seeds', () => {
  const sequence = [
    0.6011037519201636,
    0.44829055899754167,
    0.8524657934904099,
    0.6697340414393693,
    0.17481389874592423,
  ];
  assert.deepEqual(Array.from({ length: 5 }, createSeededRandom(42)), sequence);
  assert.deepEqual(Array.from({ length: 5 }, createSeededRandom(42)), sequence);
  assert.notDeepEqual(Array.from({ length: 5 }, createSeededRandom(0)), sequence);
  for (const invalid of [-1, 1.5, 4294967296]) {
    assert.throws(() => createSeededRandom(invalid), /uint32/);
  }
});

test('event envelope shape imports and invalid events fail', () => {
  const value = JSON.parse(fixture('engine-event.v2.json'));
  assert.deepEqual(validateEngineEventEnvelopeV2(value), value);
  const badVersion = clone(value);
  badVersion.schemaVersion = 1;
  assert.throws(() => validateEngineEventEnvelopeV2(badVersion), /schemaVersion/);
  const badSequence = clone(value);
  badSequence.sequence = 0;
  assert.throws(() => validateEngineEventEnvelopeV2(badSequence), /sequence/);
  const executable = clone(value);
  executable.payload.fn = () => 1;
  assert.throws(() => validateEngineEventEnvelopeV2(executable), /invalid JSON value/);
});

test('published JSON schemas are version 2 draft 2020-12', () => {
  for (const file of ['vehicle-definition.v2.schema.json', 'engine-event.v2.schema.json']) {
    const schema = JSON.parse(readFileSync(new URL(`../src/contracts/${file}`, import.meta.url), 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(schema.properties.schemaVersion.const, 2);
    assert.equal(schema.additionalProperties, false);
  }
});

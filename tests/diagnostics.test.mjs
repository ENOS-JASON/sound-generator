import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  resolveDisplayUnit,
  toDisplayValue,
} from '../src/contracts/configurator/units.ts';
import { DiagnosticsHub } from '../src/diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

const fixturePath = './fixtures/diagnostics/pressure-channels.v1.json';
const url = new URL(fixturePath, import.meta.url);
const fixture = JSON.parse(readFileSync(url, 'utf8'));

function setup() {
  const registry = new TelemetryRegistry();
  const definitions = fixture.channels.map((c) => registry.register(c));
  const { clock, state } = createMockRun(48000);
  const hub = new DiagnosticsHub(registry, clock.snapshot().runId);
  return { registry, definitions, clock, state, hub };
}

function sample(definition, clock, valueSI, changes = {}) {
  return {
    schemaVersion: 1,
    ...clock.snapshot(),
    sourceComponentId: definition.componentId,
    fieldId: definition.fieldId,
    valueSI,
    ...changes,
  };
}

test('mock clock retains source, SI units and bounded sampling', () => {
  const { definitions, clock, hub } = setup();
  const [boost] = definitions;
  const read = hub.subscribe({ fieldIds: [boost.fieldId] });
  assert.equal(read()[0].latest, null);
  clock.advanceFrames(480);
  const observation = sample(boost, clock, 10000);
  assert.equal(hub.publish(observation), 'accepted');
  observation.valueSI = 99999;
  assert.equal(read()[0].latest.valueSI, 10000);
  assert.equal(read()[0].latest.simulationTick, 10);
  assert.equal(read()[0].latest.sampleFrame, 480);
  assert.equal(read()[0].latest.sourceComponentId, 'intake');
  assert.equal(read()[0].definition.canonicalUnitId, 'Pa');
  assert.equal(read()[0].definition.sampleInterval, 10);
  clock.advanceFrames(48);
  assert.equal(hub.publish(sample(boost, clock, 20000)), 'rate-limited');
  clock.advanceFrames(1392);
  assert.equal(hub.publish(sample(boost, clock, 30000)), 'accepted');
  const [projection] = read();
  assert.equal(projection.latest.simulationTick, 40);
  assert.equal(projection.accepted, 2);
  assert.equal(projection.rateLimited, 1);
  assert.equal(projection.missedIntervals, 2);
  assert.equal(hub.read().length, 2);
  assert.equal(hub.read({ componentId: 'oil' })[0].latest, null);
  const { latest, definition } = projection;
  assert.throws(() => {
    latest.valueSI = 0;
  }, TypeError);
  assert.throws(() => {
    definition.bounds.maxSI = 1;
  }, TypeError);
  assert.throws(() => definition.allowedDisplayUnitIds.push('W'), TypeError);
  assert.throws(() => read().push(projection), TypeError);
});

test('mixed pressure display units preserve SI and solver state', () => {
  const { definitions, clock, state, hub } = setup();
  const [boost, oil] = definitions;
  clock.advanceFrames(480);
  for (const [i, definition] of definitions.entries()) {
    hub.publish(sample(definition, clock, fixture.valuesSI[i]));
  }
  assert.notEqual(boost.fieldId, oil.fieldId);
  assert.equal(boost.pressureBasis, 'gauge');
  assert.equal(oil.pressureBasis, 'absolute');
  const before = hub.read();
  const solverBefore = state();
  const clockBefore = clock.snapshot();
  const choices = {
    quantityDefaults: { pressure: 'kPa' },
    perStatUnitIds: { [boost.fieldId]: 'psi', [oil.fieldId]: 'bar' },
  };
  const values = before.map(({ definition, latest }) => {
    const unit = resolveDisplayUnit(definition, choices);
    return toDisplayValue(latest.valueSI, definition, unit);
  });
  for (const [i, value] of values.entries()) {
    assert.ok(Math.abs(value - fixture.expectedDisplay[i]) < 1e-10);
  }
  assert.throws(() => toDisplayValue(1, boost, 'W'), /incompatible unit/);
  const absolute = { displayBasis: 'absolute' };
  const convert = () => toDisplayValue(1, boost, 'Pa', absolute);
  assert.throws(convert, /ambient reference/);
  assert.deepEqual(hub.read(), before);
  assert.deepEqual(state(), solverBefore);
  assert.deepEqual(clock.snapshot(), clockBefore);
});

test('registration rejects invalid units, basis and capacity', () => {
  const registry = new TelemetryRegistry(1);
  const channel = fixture.channels[0];
  for (const invalid of [
    { canonicalUnitId: 'W' },
    { canonicalUnitId: 'psi' },
    { pressureBasis: undefined },
    { pressureBasis: 'unknown' },
    { sampleInterval: 0 },
    { sampleInterval: Infinity },
    { channelId: 'bad.channel' },
    { bounds: { minSI: 1, maxSI: 0 } },
    { numericType: 'string' },
    { availability: 'maybe' },
  ]) {
    assert.throws(() => registry.register({ ...channel, ...invalid }));
  }
  assert.equal(registry.list().length, 0);
  registry.register(channel);
  assert.throws(() => registry.register(channel), /duplicate/);
  assert.throws(() => registry.register(fixture.channels[1]), /capacity/);
  assert.throws(() => registry.require('unknown'), /unknown/);
  assert.equal(registry.list().length, 1);
});

test('invalid publications preserve projection and sampling quota', () => {
  const { definitions, clock, hub } = setup();
  const [boost, oil] = definitions;
  clock.advanceFrames(480);
  hub.publish(sample(boost, clock, 10000));
  clock.advanceFrames(480);
  const before = hub.read();
  for (const invalid of [
    { fieldId: 'unknown.channel' },
    { schemaVersion: 2 },
    { runId: 'stale' },
    { sourceComponentId: 'oil' },
    { valueSI: NaN },
    { valueSI: Infinity },
    { valueSI: 300001 },
    { simulationTick: -1 },
    { simulationTick: 9 },
    { simulationTimeSeconds: 0.001 },
    { sampleFrame: 1 },
    { crankAngleRadians: NaN },
  ]) {
    assert.throws(() => hub.publish(sample(boost, clock, 20000, invalid)));
    assert.deepEqual(hub.read(), before);
  }
  assert.throws(() => hub.publish(sample(oil, clock, -1)), /SI value/);
  assert.equal(hub.publish(sample(boost, clock, 20000)), 'accepted');
  assert.equal(hub.read()[0].accepted, 2);
  assert.equal(hub.read()[0].rateLimited, 0);
});

test('audio sampling works at a fixed tick and reports gaps', () => {
  const { registry, clock, hub } = setup();
  const audio = registry.register({
    ...fixture.channels[0],
    componentId: 'audio',
    channelId: 'peak',
    label: 'Synthetic peak',
    quantityKind: 'ratio',
    canonicalUnitId: '1',
    pressureBasis: undefined,
    bounds: { minSI: 0, maxSI: 1 },
    sampleClock: 'sampleFrame',
    sampleInterval: 128,
  });
  const frame = (sampleFrame) => sample(audio, clock, 0.5, { sampleFrame });
  assert.throws(() => hub.publish(frame(undefined)), /sample frame/);
  assert.equal(hub.publish(frame(128)), 'accepted');
  assert.equal(hub.publish(frame(192)), 'rate-limited');
  assert.throws(() => hub.publish(frame(160)), /regressing/);
  assert.equal(hub.publish(frame(384)), 'accepted');
  const [result] = hub.read({ sampleClock: 'sampleFrame' });
  assert.equal(result.latest.simulationTick, 0);
  assert.equal(result.latest.sampleFrame, 384);
  assert.equal(result.missedIntervals, 1);
  assert.equal(result.rateLimited, 1);
});

test('unavailable channels stay explicit and pull filters are copied', () => {
  const { registry, definitions, hub, clock } = setup();
  const missing = registry.register({
    ...fixture.channels[0],
    channelId: 'planned',
    availability: 'unavailable',
  });
  const publish = () => hub.publish(sample(missing, clock, 10000));
  assert.throws(publish, /availability/);
  const ids = [definitions[0].fieldId];
  const read = hub.subscribe({ fieldIds: ids });
  ids.push(missing.fieldId);
  assert.equal(read().length, 1);
  assert.equal(hub.read().length, 3);
  assert.equal(hub.read({ includeUnavailable: false }).length, 2);
  assert.equal(hub.read({ fieldIds: [missing.fieldId] })[0].latest, null);
  assert.throws(() => hub.read({ fieldIds: ['unknown.channel'] }), /unknown/);
});

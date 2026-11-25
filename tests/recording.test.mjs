import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DiagnosticsHub } from '../src/diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { TraceRecorder } from '../src/recording/TraceRecorder.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

const fixturePath = './fixtures/diagnostics/pressure-channels.v1.json';
const fixture = JSON.parse(
  readFileSync(new URL(fixturePath, import.meta.url), 'utf8'),
);

function setup(maxRecords = 64, chunkSize = 3) {
  const registry = new TelemetryRegistry();
  const definition = registry.register(fixture.channels[0]);
  const { clock, state } = createMockRun(48000);
  const hub = new DiagnosticsHub(registry, clock.snapshot().runId);
  const recorder = new TraceRecorder(registry, maxRecords, chunkSize);
  const start = {
    initialClock: { ...clock.snapshot() },
    seed: 42,
    presetHash: 'mock-i4-fixture',
    solverVersion: 'mock-i4-v1',
    domainSequenceWatermark: 0,
    diagnosticSequenceWatermark: 0,
  };
  function sample(valueSI) {
    const { runId, simulationTick, simulationTimeSeconds, sampleFrame } =
      clock.snapshot();
    const input = {
      schemaVersion: 1,
      runId,
      simulationTick,
      simulationTimeSeconds,
      sampleFrame,
      sourceComponentId: definition.componentId,
      fieldId: definition.fieldId,
      valueSI,
    };
    assert.equal(hub.publish(input), 'accepted');
    return { ...hub.read()[0].latest };
  }
  function control(type, payload = {}) {
    const s = clock.snapshot();
    return clock.applyControl({
      schemaVersion: 1,
      category: 'command',
      runId: s.runId,
      commandId: 'test-' + type,
      origin: 'automation',
      targetSimulationTick: s.simulationTick,
      targetSampleFrame: s.sampleFrame,
      causationId: null,
      correlationId: null,
      type,
      payload,
    });
  }
  return { registry, clock, state, hub, recorder, start, sample, control };
}

test('record ordered mock events, scale changes and SI chunks', () => {
  const { clock, state, hub, recorder, start, sample, control } = setup();
  assert.equal(recorder.active, false);
  recorder.start(start);
  assert.equal(recorder.active, true);
  assert.throws(() => recorder.start(start), /already active/);
  start.initialClock.playbackScale = 0;
  const { command, diagnostics } = control('SET_TIME_SCALE', {
    playbackScale: 0.1,
  });
  const mutableCommand = { ...command, payload: { ...command.payload } };
  assert.equal(recorder.recordCommand(mutableCommand), 'recorded');
  mutableCommand.payload.playbackScale = 1;
  for (const event of diagnostics) {
    assert.equal(recorder.recordEvent(event), 'recorded');
  }
  const result = clock.advanceFrames(4096);
  for (const event of result.events) {
    assert.equal(recorder.recordEvent(event), 'recorded');
  }
  clock.advanceFrames(704);
  const observation = sample(10000);
  assert.equal(recorder.recordTelemetry(observation), 'recorded');
  observation.valueSI = 99999;
  const sourceBefore = hub.read();
  const solverBefore = state();
  const clockBefore = clock.snapshot();
  const trace = recorder.stop();
  const entries = trace.chunks.flat();
  assert.equal(trace.status, 'complete');
  assert.equal(trace.start.initialClock.playbackScale, 1);
  assert.equal(trace.start.seed, 42);
  assert.equal(trace.channels[0].canonicalUnitId, 'Pa');
  assert.equal(trace.stats.recorded, 5);
  assert.deepEqual(
    trace.chunks.map((chunk) => chunk.length),
    [3, 2],
  );
  assert.deepEqual(
    entries.map((entry) => entry.kind),
    ['command', 'diagnostic', 'diagnostic', 'domain', 'telemetry'],
  );
  assert.equal(entries[0].value.payload.playbackScale, 0.1);
  assert.equal(entries[1].value.type, 'CLOCK_SCALE_CHANGED');
  assert.equal(entries[3].value.type, 'STARTER_ENGAGED');
  assert.equal(entries[4].value.valueSI, 10000);
  assert.equal(entries[4].value.simulationTick, 10);
  assert.equal(entries[4].value.sampleFrame, 4800);
  assert.deepEqual(hub.read(), sourceBefore);
  assert.deepEqual(state(), solverBefore);
  assert.deepEqual(clock.snapshot(), clockBefore);
  assert.throws(() => trace.chunks[0].push(entries[0]), TypeError);
  assert.throws(() => {
    entries[0].value.payload.playbackScale = 0;
  }, TypeError);
  assert.throws(() => {
    trace.start.initialClock.playbackScale = 0;
  }, TypeError);
  assert.equal(recorder.active, false);
  assert.equal(recorder.recordCommand(command), 'inactive');
  assert.throws(() => recorder.stop(), /not active/);
});

test('overflow stays bounded without stopping the mock', () => {
  const { clock, state, recorder, start, sample } = setup(2, 1);
  recorder.start(start);
  for (const event of clock.advanceFrames(480).events) {
    assert.equal(recorder.recordEvent(event), 'recorded');
  }
  assert.equal(recorder.recordTelemetry(sample(10000)), 'recorded');
  for (let i = 0; i < 1000; i++) {
    clock.advanceFrames(480);
    assert.equal(recorder.recordTelemetry(sample(20000)), 'overflow');
  }
  const trace = recorder.stop();
  assert.equal(trace.status, 'incomplete');
  assert.equal(trace.stats.recorded, 2);
  assert.equal(trace.stats.dropped, 1000);
  assert.equal(trace.chunks.length, 2);
  assert.equal(trace.chunks[1][0].value.valueSI, 10000);
  assert.equal(clock.snapshot().simulationTick, 10010);
  assert.ok(state().angularSpeed > 0);
  recorder.start(start);
  const second = recorder.stop();
  assert.equal(second.stats.recorded, 0);
  assert.equal(second.stats.dropped, 0);
  assert.equal(trace.stats.dropped, 1000);
});

test('detect gaps and invalid entries', () => {
  const { clock, recorder, start, sample, control } = setup();
  recorder.start(start);
  const { command, diagnostics } = control('SET_TIME_SCALE', {
    playbackScale: 1,
  });
  assert.equal(recorder.recordCommand(command), 'recorded');
  assert.equal(recorder.recordCommand(command), 'invalid');
  assert.equal(
    recorder.recordCommand({ ...command, runId: 'stale-run' }),
    'invalid',
  );
  for (const event of diagnostics) {
    assert.equal(recorder.recordEvent(event), 'recorded');
  }
  const first = clock.advanceFrames(480).events[0];
  assert.equal(recorder.recordEvent({ ...first, sequence: 3 }), 'recorded');
  assert.equal(recorder.recordEvent(first), 'invalid');
  const observation = sample(10000);
  assert.equal(
    recorder.recordTelemetry({ ...observation, valueSI: Infinity }),
    'invalid',
  );
  assert.equal(recorder.recordTelemetry(observation), 'recorded');
  clock.advanceFrames(1440);
  assert.equal(recorder.recordTelemetry(sample(20000)), 'recorded');
  const trace = recorder.stop();
  assert.equal(trace.status, 'incomplete');
  assert.equal(trace.stats.domainGaps, 2);
  assert.equal(trace.stats.telemetryGaps, 2);
  assert.equal(trace.stats.invalid, 4);
});

test('reject invalid start, capacity and channels', () => {
  const { registry, clock, recorder, start, sample } = setup();
  assert.throws(() => new TraceRecorder(registry, 65537), RangeError);
  assert.throws(() => new TraceRecorder(registry, 3, 4), RangeError);
  assert.throws(() => recorder.start({ ...start, seed: NaN }), /invalid/);
  assert.equal(recorder.active, false);
  registry.register({ ...fixture.channels[1], recorderRouting: 'none' });
  recorder.start(start);
  clock.advanceFrames(480);
  const observation = sample(10000);
  for (const patch of [
    { schemaVersion: 99 },
    { fieldId: 'unknown.field' },
    { fieldId: 'oil.pressure', sourceComponentId: 'oil' },
    { runId: 'stale-run' },
  ]) {
    assert.equal(
      recorder.recordTelemetry({ ...observation, ...patch }),
      'invalid',
    );
  }
  const trace = recorder.stop();
  assert.equal(trace.status, 'incomplete');
  assert.equal(trace.stats.invalid, 4);
  assert.equal(trace.stats.recorded, 0);
  assert.deepEqual(trace.chunks, []);
});

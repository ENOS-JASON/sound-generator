import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  compareEvents,
  ComparisonEngine,
} from '../src/comparison/ComparisonEngine.ts';
import { ReplayController } from '../src/comparison/ReplayController.ts';
import { DiagnosticsHub } from '../src/diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { TraceRecorder } from '../src/recording/TraceRecorder.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

const fixturePath = './fixtures/diagnostics/pressure-channels.v1.json';
const fixture = JSON.parse(
  readFileSync(new URL(fixturePath, import.meta.url), 'utf8'),
);

function recordRun(scale = 1, offsetSI = 0, maxRecords = 128) {
  const registry = new TelemetryRegistry();
  const def = registry.register(fixture.channels[0]);
  const { clock, state } = createMockRun(48000, 42);
  const hub = new DiagnosticsHub(registry, 'mock-i4');
  const recorder = new TraceRecorder(registry, maxRecords, 8);
  recorder.start({
    initialClock: clock.snapshot(),
    seed: 42,
    presetHash: 'mock-i4-fixture',
    solverVersion: 'mock-i4-v1',
    domainSequenceWatermark: 0,
    diagnosticSequenceWatermark: 0,
  });
  function control(type, payload = {}) {
    const s = clock.snapshot();
    const result = clock.applyControl({
      schemaVersion: 1,
      category: 'command',
      runId: s.runId,
      commandId: 'fixture-' + type,
      origin: 'automation',
      targetSimulationTick: s.simulationTick,
      targetSampleFrame: s.sampleFrame,
      causationId: null,
      correlationId: null,
      type,
      payload,
    });
    recorder.recordCommand(result.command);
    for (const event of [...result.events, ...result.diagnostics]) {
      recorder.recordEvent(event);
    }
  }
  function advance(frames) {
    while (frames > 0) {
      const n = Math.min(frames, 4096);
      for (const event of clock.advanceFrames(n).events) {
        recorder.recordEvent(event);
      }
      frames -= n;
    }
  }
  function observe() {
    const s = clock.snapshot();
    hub.publish({
      ...s,
      schemaVersion: 1,
      sourceComponentId: def.componentId,
      fieldId: def.fieldId,
      valueSI: 10000 + s.simulationTick * 2 + offsetSI,
    });
    recorder.recordTelemetry(hub.read()[0].latest);
  }
  control('SET_TIME_SCALE', { playbackScale: scale });
  for (let i = 0; i < 10; i++) {
    advance(480 / scale);
    observe();
  }
  control('PAUSE');
  advance(480);
  control('STEP_TICKS', { count: 10 });
  observe();
  control('RESUME');
  for (let i = 0; i < 29; i++) {
    advance(480 / scale);
    observe();
  }
  return {
    trace: recorder.stop(),
    end: clock.snapshot(),
    state: state(),
  };
}

function factory(start) {
  assert.equal(start.presetHash, 'mock-i4-fixture');
  assert.equal(start.solverVersion, 'mock-i4-v1');
  return createMockRun(start.initialClock.sampleRate, start.seed);
}

function category(replay, kind) {
  return replay.trace.chunks
    .flat()
    .filter((entry) => entry.kind === kind)
    .map((entry) => entry.value);
}

test('replay seeded commands and paused stepping exactly', () => {
  for (const scale of [1, 0.1]) {
    const original = recordRun(scale);
    assert.equal(original.trace.status, 'complete');
    const input = JSON.parse(JSON.stringify(original.trace));
    const replay = new ReplayController(input);
    const result = replay.resimulate(factory, original.end);
    assert.equal(result.mode, 'deterministicResimulation');
    assert.deepEqual(result.clock, original.end);
    assert.equal(result.clock.simulationTick, 400);
    for (const key of Object.keys(original.state)) {
      assert.ok(Math.abs(result.state[key] - original.state[key]) < 1e-12);
    }
    assert.deepEqual(
      compareEvents(category(replay, 'domain'), result.domain, true),
      [],
    );
    assert.deepEqual(
      compareEvents(category(replay, 'diagnostic'), result.diagnostics, true),
      [],
    );
    const before = replay.telemetryAt(100);
    assert.equal(before[0].valueSI, 10200);
    input.chunks[0][0].value.payload.playbackScale = 0;
    assert.deepEqual(replay.telemetryAt(100), before);
    assert.throws(() => {
      before[0].valueSI = 0;
    }, TypeError);
  }
});

test('compare SI curves across speeds and event deltas', () => {
  const a = new ReplayController(recordRun(1).trace);
  const b = new ReplayController(recordRun(0.1, 25).trace);
  const comparison = new ComparisonEngine().compare(a, b);
  assert.equal(comparison.status, 'comparable');
  assert.deepEqual(comparison.domainDeltas, []);
  const [channel] = comparison.channels;
  assert.equal(channel.matched, 40);
  assert.equal(channel.maxAbsSI, 25);
  assert.equal(channel.rmsSI, 25);
  assert.equal(channel.unitId, 'Pa');
  const changed = JSON.parse(JSON.stringify(b.trace));
  const event = changed.chunks.flat().find((e) => e.kind === 'domain');
  event.value.payload.starterTorqueNm = 23;
  const delta = new ComparisonEngine().compare(
    a,
    new ReplayController(changed),
  ).domainDeltas;
  assert.equal(delta.length, 1);
  assert.equal(delta[0].reason, 'changed');
  assert.equal(delta[0].tickDelta, 0);
});

test('reject invalid schemas, counts and replay boundaries', () => {
  const { trace, end } = recordRun();
  assert.throws(
    () => new ReplayController({ ...trace, schemaVersion: 999 }),
    /schema/,
  );
  assert.throws(
    () =>
      new ReplayController({
        ...trace,
        stats: { ...trace.stats, recorded: 1 },
      }),
    /metadata/,
  );
  const replay = new ReplayController(trace);
  assert.throws(
    () => replay.resimulate(factory, { ...end, simulationTick: 20 }),
    /endpoint/,
  );
  assert.throws(
    () => replay.resimulate(factory, { ...end, sampleFrame: 10_000_001 }),
    /bounds/,
  );
});

test('incomplete capture cannot prove replay', () => {
  const a = new ReplayController(recordRun().trace);
  const partial = recordRun(1, 0, 8);
  const b = new ReplayController(partial.trace);
  assert.equal(b.trace.status, 'incomplete');
  assert.throws(() => b.resimulate(factory, partial.end), /incomplete/);
  const compared = new ComparisonEngine().compare(a, b);
  assert.equal(compared.status, 'incomplete');
  assert.ok(compared.channels[0].missingB > 0);
});

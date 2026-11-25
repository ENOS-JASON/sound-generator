import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { ReplayController } from '../src/comparison/ReplayController.ts';
import { radiansPerSecondToRpm } from '../src/contracts/units.ts';
import { DiagnosticsHub } from '../src/diagnostics/DiagnosticsHub.ts';
import { GraphInspector } from '../src/diagnostics/GraphInspector.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { TraceRecorder } from '../src/recording/TraceRecorder.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

const fixturePath = './fixtures/diagnostics/pressure-channels.v1.json';
const fixture = JSON.parse(
  readFileSync(new URL(fixturePath, import.meta.url), 'utf8'),
);

function liveSetup() {
  const registry = new TelemetryRegistry();
  const level = registry.register({
    componentId: 'synthetic-audio',
    channelId: 'level',
    label: 'Synthetic normalized level',
    quantityKind: 'ratio',
    canonicalUnitId: '1',
    numericType: 'float64',
    availability: 'available',
    sampleClock: 'simulationTick',
    sampleInterval: 1,
    bounds: { minSI: 0, maxSI: 1 },
    instrumentVersion: 1,
    performanceClass: 'normal',
    recorderRouting: 'standard',
  });
  const { clock, state } = createMockRun(48000);
  const hub = new DiagnosticsHub(registry, 'mock-i4');
  let reads = 0;
  const graph = new GraphInspector(
    {
      kind: 'live',
      hub,
      readCrank: () => {
        reads++;
        return {
          ...clock.snapshot(),
          schemaVersion: 1,
          category: 'snapshot',
          domainSequenceWatermark: 0,
          state: {
            angularVelocityRadPerSecond: state().angularSpeed,
          },
        };
      },
    },
    {
      fieldIds: [level.fieldId],
      includeCrankRpm: true,
      historyCapacity: 6,
      maxPoints: 4,
    },
  );
  function publish(valueSI) {
    clock.advanceFrames(48);
    hub.publish({
      ...clock.snapshot(),
      schemaVersion: 1,
      sourceComponentId: level.componentId,
      fieldId: level.fieldId,
      valueSI,
    });
  }
  return { clock, state, hub, graph, publish, reads: () => reads };
}

test('live RPM and level overlays preserve extrema and cursor', () => {
  const { graph, publish, state, clock, hub } = liveSetup();
  for (const value of [0.1, 0.2, 0.3, 1, 0.4, 0.5, 0.6, 0.7]) {
    publish(value);
    graph.refresh();
  }
  const before = state();
  const clockBefore = clock.snapshot();
  const telemetryBefore = hub.read();
  const result = graph.refresh({ fromTick: 3, toTick: 8, cursorTick: 5 });
  const [level, rpm] = result.series;
  assert.equal(level.evicted, 2);
  assert.equal(level.sourceCount, 6);
  assert.ok(level.points.length <= 4);
  assert.ok(level.points.some((p) => p.displayValue === 1));
  assert.equal(level.cursor.displayValue, 0.4);
  assert.equal(level.points[0].simulationTick, 3);
  assert.equal(level.points.at(-1).simulationTick, 8);
  assert.equal(rpm.origin, 'derived-state');
  assert.equal(rpm.unitSI, 'rad/s');
  assert.equal(rpm.displayUnit, 'rpm');
  assert.equal(
    rpm.points.at(-1).displayValue,
    radiansPerSecondToRpm(before.angularSpeed),
  );
  assert.deepEqual(state(), before);
  assert.deepEqual(clock.snapshot(), clockBefore);
  assert.deepEqual(hub.read(), telemetryBefore);
  assert.throws(() => {
    level.points[0].displayValue = 10;
  }, TypeError);
});

test('hidden and closed graph does no source work', () => {
  const { graph, publish, hub, reads } = liveSetup();
  let hubReads = 0;
  const read = hub.read.bind(hub);
  hub.read = (...args) => {
    hubReads++;
    return read(...args);
  };
  publish(0.1);
  graph.refresh();
  graph.setVisible(false);
  for (let i = 0; i < 10; i++) {
    publish(0.2);
    assert.equal(graph.refresh(), null);
  }
  assert.equal(reads(), 1);
  assert.equal(hubReads, 1);
  graph.setVisible(true);
  const result = graph.refresh();
  assert.equal(result.series[0].sourceCount, 2);
  assert.equal(result.series[0].observedGaps, 9);
  assert.equal(reads(), 2);
  assert.equal(hubReads, 2);
  graph.close();
  graph.setVisible(true);
  assert.equal(graph.refresh(), null);
  assert.equal(reads(), 2);
  assert.equal(hubReads, 2);
});

test('recorded graph keeps independent units and SI source', () => {
  const registry = new TelemetryRegistry();
  const definitions = fixture.channels.map((c) => registry.register(c));
  const { clock } = createMockRun(48000);
  const recorder = new TraceRecorder(registry);
  recorder.start({
    initialClock: clock.snapshot(),
    seed: 42,
    presetHash: 'mock-i4-fixture',
    solverVersion: 'mock-i4-v1',
    domainSequenceWatermark: 0,
    diagnosticSequenceWatermark: 0,
  });
  for (let tick = 10; tick <= 30; tick += 10) {
    for (const event of clock.advanceFrames(480).events) {
      recorder.recordEvent(event);
    }
    for (const [i, d] of definitions.entries()) {
      assert.equal(
        recorder.recordTelemetry({
          ...clock.snapshot(),
          schemaVersion: 1,
          sourceComponentId: d.componentId,
          fieldId: d.fieldId,
          valueSI: fixture.valuesSI[i],
        }),
        'recorded',
      );
    }
  }
  const replay = new ReplayController(recorder.stop());
  const graph = new GraphInspector(
    { kind: 'recorded', replay },
    {
      fieldIds: definitions.map((d) => d.fieldId),
      unitChoices: {
        perStatUnitIds: {
          [definitions[0].fieldId]: 'psi',
          [definitions[1].fieldId]: 'bar',
        },
      },
    },
  );
  const before = replay.trace;
  const [boost, oil] = graph.refresh({
    fromTick: 10,
    toTick: 30,
    cursorTick: 20,
  }).series;
  assert.equal(boost.displayUnit, 'psi (g)');
  assert.equal(oil.displayUnit, 'bar (a)');
  assert.ok(Math.abs(boost.cursor.displayValue - 10) < 1e-10);
  assert.equal(oil.cursor.displayValue, 3.5);
  assert.equal(boost.cursor.valueSI, fixture.valuesSI[0]);
  assert.equal(oil.cursor.valueSI, fixture.valuesSI[1]);
  assert.equal(replay.trace, before);
  graph.setUnitChoices({ quantityDefaults: { pressure: 'Pa' } });
  assert.equal(graph.refresh().series[0].displayUnit, 'Pa (g)');
  assert.equal(replay.trace, before);
});

test('invalid graph settings or units fail rather than coercing', () => {
  const { hub, graph } = liveSetup();
  assert.throws(
    () =>
      new GraphInspector(
        { kind: 'live', hub },
        { fieldIds: ['synthetic-audio.level'], maxPoints: 0 },
      ),
    /capacity/,
  );
  assert.throws(
    () => graph.refresh({ fromTick: 10, toTick: 9 }),
    /window/,
  );
  graph.setUnitChoices({
    perStatUnitIds: { 'synthetic-audio.level': 'Pa' },
  });
  assert.throws(() => graph.refresh(), /incompatible unit/);
});

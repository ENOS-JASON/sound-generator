import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SimulationClock,
  TICK_RATE,
} from '../src/core/clock/SimulationClock.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';
import {
  createBlockProducer,
  appendPcmHash,
} from '../src/testing/mock-solver/benchmark-protocol.ts';
import {
  appendEventHash,
  createBenchmarkRun,
} from '../src/testing/mock-solver/benchmark-core.ts';

function control(clock, type, payload = {}, override = {}) {
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
    ...override,
  });
}

function advance(clock, frames, block = 128) {
  const events = [];
  while (frames > 0) {
    const count = Math.min(block, frames);
    events.push(...clock.advanceFrames(count).events);
    frames -= count;
  }
  return events;
}

function physical(events) {
  return events.map(({ sampleFrame, ...event }) => {
    void sampleFrame;
    return event;
  });
}

test('I4 physical event trace and state agree at 1x and 0.1x', () => {
  for (const rate of [44100, 48000]) {
    const fast = createMockRun(rate);
    const slow = createMockRun(rate);
    control(slow.clock, 'SET_TIME_SCALE', { playbackScale: 0.1 });
    const a = advance(fast.clock, rate * 3);
    const b = advance(slow.clock, rate * 30, 511);
    assert.ok(a.some((event) => event.type === 'COMBUSTION'));
    assert.ok(a.some((event) => event.type === 'GEAR_CHANGED'));
    assert.deepEqual(physical(a), physical(b));
    assert.deepEqual(fast.state(), slow.state());
    assert.equal(slow.clock.snapshot().simulationTick, 3 * TICK_RATE);
    for (const event of b) {
      assert.equal(
        event.sampleFrame,
        Math.ceil((event.simulationTick * rate) / 100),
      );
    }
  }
});

test('exact integer phase at all approved scales and sample rates', () => {
  for (const rate of [44100, 48000, 96000]) {
    for (const scale of [0.05, 0.1, 0.25, 0.5, 1]) {
      const { clock } = createMockRun(rate);
      control(clock, 'SET_TIME_SCALE', { playbackScale: scale });
      advance(clock, rate, 997);
      const s = clock.snapshot();
      assert.equal(s.simulationTick, TICK_RATE * scale);
      assert.equal(s.phaseNumerator, 0);
      assert.equal(s.sampleFrame, rate);
    }
  }
});

test('pause, resume and scale switches preserve firing and phase', () => {
  const reference = createMockRun(48000);
  const changed = createMockRun(48000);
  const { clock } = changed;
  const events = advance(clock, 48001);
  const before = clock.snapshot();
  const paused = control(clock, 'PAUSE');
  assert.deepEqual(
    paused.diagnostics.map((event) => event.type),
    ['CLOCK_SCALE_CHANGED', 'RUN_PAUSED', 'COMMAND_APPLIED'],
  );
  assert.equal(advance(clock, 1234).length, 0);
  assert.equal(clock.snapshot().simulationTick, before.simulationTick);
  assert.equal(clock.snapshot().phaseNumerator, before.phaseNumerator);
  control(clock, 'RESUME');
  control(clock, 'SET_TIME_SCALE', { playbackScale: 0.25 });
  events.push(...advance(clock, 191996));
  const expected = advance(reference.clock, 96000);
  assert.deepEqual(physical(events), physical(expected));
  assert.deepEqual(changed.state(), reference.state());
  assert.equal(clock.snapshot().phaseNumerator, 0);
});

test('both audio-mode selections preserve the physics and domain hash', () => {
  const a = createMockRun(44100);
  const b = createMockRun(44100);
  assert.equal(a.clock.snapshot().slowMotionAudioMode, 'physical');
  const result = control(b.clock, 'SET_SLOW_MOTION_AUDIO_MODE', {
    mode: 'pitch-preserved',
  });
  assert.equal(result.diagnostics[0].type, 'SLOW_MOTION_AUDIO_MODE_CHANGED');
  const eventsA = advance(a.clock, 44100);
  const eventsB = advance(b.clock, 44100);
  assert.deepEqual(eventsA, eventsB);
  assert.equal(
    eventsA.reduce(appendEventHash, 2166136261),
    eventsB.reduce(appendEventHash, 2166136261),
  );
});

test('paused stepping is bounded and reports unreachable targets', () => {
  const { clock } = createMockRun(48000);
  assert.throws(() => control(clock, 'STEP_TICKS', { count: 1 }), /pause/);
  control(clock, 'PAUSE');
  const single = control(clock, 'STEP_TICKS', { count: 1 });
  assert.equal(single.ticksAdvanced, 1);
  assert.equal(single.events[0].type, 'STARTER_ENGAGED');
  const event = control(clock, 'STEP_UNTIL_EVENT', {
    eventType: 'ENGINE_RUNNING',
    maxTicks: 300,
  });
  assert.equal(event.reached, true);
  assert.equal(event.ticksAdvanced, 250);
  const angle = control(clock, 'STEP_TO_CRANK_ANGLE', {
    angleDeltaRadians: Math.PI,
    maxTicks: 1000,
  });
  assert.equal(angle.reached, true);
  assert.equal(clock.snapshot().sampleFrame, 0);
  const stopped = new SimulationClock('stopped', 48000, () => ({
    crankAngleRadians: 0,
    events: [],
  }));
  control(stopped, 'PAUSE');
  for (const [type, payload] of [
    ['STEP_TO_CRANK_ANGLE', { angleDeltaRadians: 1, maxTicks: 10 }],
    ['STEP_UNTIL_EVENT', { eventType: 'COMBUSTION', maxTicks: 10 }],
  ]) {
    const result = control(stopped, type, payload);
    assert.equal(result.reached, false);
    assert.equal(result.ticksAdvanced, 10);
  }
});

test('invalid, stale and excessive clock commands do not change state', () => {
  const { clock } = createMockRun(48000);
  control(clock, 'PAUSE');
  const before = clock.snapshot();
  for (const scale of [-1, 2, NaN, 0.0000001]) {
    assert.throws(() =>
      control(clock, 'SET_TIME_SCALE', { playbackScale: scale }),
    );
  }
  assert.throws(() => control(clock, 'STEP_TICKS', { count: 10001 }));
  assert.throws(() => control(clock, 'RESUME', {}, { runId: 'stale' }));
  assert.throws(() =>
    control(clock, 'RESUME', {}, { targetSimulationTick: 1 }),
  );
  assert.throws(() => control(clock, 'RESUME', {}, { targetSampleFrame: 1 }));
  assert.throws(() => clock.advanceFrames(4097));
  assert.throws(() => clock.advanceFrames(-1));
  assert.deepEqual(clock.snapshot(), before);
});

test('benchmark runners share identical samples and physical hashes', () => {
  const a = createBenchmarkRun(48000, 1);
  const b = createBenchmarkRun(48000, 1);
  for (let i = 0; i < 400; i++) {
    assert.deepEqual(a.block(), b.block());
  }
  assert.deepEqual(a.summary(), b.summary());
  assert.ok(a.summary().eventCount > 2);
});

test('sequential producer trims the last padded quantum', () => {
  const options = {
    owner: 'worker',
    sampleRate: 44100,
    scale: 1,
    totalFrames: 132300,
  };
  const produce = createBlockProducer(options);
  const worklet = createBlockProducer({ ...options, owner: 'worklet' });
  assert.throws(() => produce(1), /nonsequential/);
  let hash = 2166136261;
  let otherHash = hash;
  const blocks = Math.ceil(options.totalFrames / 128);
  for (let i = 0; i < blocks; i++) {
    const a = produce(i);
    const b = worklet(i);
    hash = appendPcmHash(hash, a.samples);
    otherHash = appendPcmHash(otherHash, b.samples);
    assert.deepEqual(a.samples, b.samples);
    assert.deepEqual(a.summary, b.summary);
    if (i === blocks - 1) {
      assert.equal(a.summary.clock.simulationTick, 3000);
      assert.equal(a.summary.clock.sampleFrame, options.totalFrames);
    }
  }
  assert.equal(hash, otherHash);
  assert.throws(() => produce(blocks), /nonsequential/);
});

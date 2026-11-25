import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analyzeFeature,
  fftMagnitude,
  publishAudioMeters,
  registerAudioMeters,
} from '../src/audio/feature-bridge/analysis.ts';
import {
  FFT_SIZE,
  SyntheticStimulus,
} from '../src/audio/synthetic-worklet/stimulus.ts';
import { DiagnosticsHub } from '../src/diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

function options(timeline = []) {
  return {
    runId: 'mock-i4',
    sampleRate: 48000,
    seed: 42,
    toneHz: (20 * 48000) / FFT_SIZE,
    frameCount: 8192,
    captureFrames: 8192,
    timeline,
  };
}

function control(clock, type, payload) {
  return clock.applyControl({
    schemaVersion: 1,
    category: 'command',
    runId: 'mock-i4',
    commandId: 'audio-' + type + '-' + clock.snapshot().sampleFrame,
    origin: 'automation',
    targetSimulationTick: clock.snapshot().simulationTick,
    targetSampleFrame: clock.snapshot().sampleFrame,
    causationId: null,
    correlationId: null,
    type,
    payload,
  }).diagnostics;
}

function render(config, block = 128) {
  const stimulus = new SyntheticStimulus(config);
  const features = [];
  while (!stimulus.complete) {
    stimulus.render(new Float32Array(block));
    const frame = stimulus.takeFeature();
    if (frame) features.push(frame);
  }
  return { features, report: stimulus.report() };
}

test('seeded sine has expected FFT and bounded pre/post meters', () => {
  const a = render(options());
  const b = render(options(), 64);
  assert.deepEqual(a.report.rawMaster, b.report.rawMaster);
  const feature = a.features[0];
  const result = analyzeFeature(feature);
  assert.equal(result.peakBin, 20);
  assert.ok(Math.abs(result.spectrum[20] - 0.06) < 1e-6);
  assert.ok(Math.abs(feature.source.rms - 0.12 / Math.sqrt(2)) < 1e-8);
  assert.equal(feature.master.peak, feature.source.peak * 0.5);
  assert.equal(a.report.clippedSamples, 0);
  assert.equal(a.report.nonfiniteSamples, 0);
  assert.equal(a.report.rawMaster.length, 8192);
  const impulse = new Float32Array(FFT_SIZE);
  impulse[0] = 1;
  const flat = fftMagnitude(impulse);
  assert.ok(Math.abs(flat[0] - 1 / FFT_SIZE) < 1e-12);
  assert.ok(flat.slice(1, -1).every((v) => Math.abs(v - 2 / FFT_SIZE) < 1e-12));
});

test('scale change retains phase and gives the physical slow tone', () => {
  const { clock } = createMockRun(48000);
  clock.advanceFrames(4096);
  const events = control(clock, 'SET_TIME_SCALE', { playbackScale: 0.1 });
  const slow = render(options(events));
  const normal = render(options());
  assert.deepEqual(
    slow.report.rawMaster.slice(0, 4096),
    normal.report.rawMaster.slice(0, 4096),
  );
  assert.equal(slow.report.rawMaster[4096], normal.report.rawMaster[4096]);
  assert.equal(analyzeFeature(slow.features[1]).peakBin, 2);
  assert.equal(slow.features[1].playbackScale, 0.1);
});

test('unsupported pitch-preserved mode is explicit and silent', () => {
  const { clock } = createMockRun(48000);
  const events = control(clock, 'SET_SLOW_MOTION_AUDIO_MODE', {
    mode: 'pitch-preserved',
  });
  const result = render(options(events));
  assert.equal(result.report.mode, 'pitch-preserved');
  assert.equal(result.report.supported, false);
  assert.equal(result.report.unsupportedFrames, 8192);
  assert.ok(result.report.rawMaster.every((v) => v === 0));
  assert.ok(
    result.report.timeline.some(
      (e) => e.type === 'SLOW_MOTION_AUDIO_MODE_CHANGED',
    ),
  );
});

test('meter bridge preserves authoritative frame and rejects bad data', () => {
  const registry = new TelemetryRegistry();
  registerAudioMeters(registry);
  const hub = new DiagnosticsHub(registry, 'mock-i4');
  const { clock } = createMockRun(48000);
  const frame = render(options()).features[0];
  clock.advanceFrames(4096);
  publishAudioMeters(hub, frame, clock.snapshot());
  assert.equal(hub.read().length, 4);
  assert.ok(hub.read().every((p) => p.latest.sampleFrame === 4096));
  assert.throws(
    () =>
      publishAudioMeters(hub, frame, { ...clock.snapshot(), sampleFrame: 0 }),
    /clock/,
  );
  assert.throws(
    () => new SyntheticStimulus({ ...options(), captureFrames: 65537 }),
    /options/,
  );
  assert.throws(() => fftMagnitude(new Float32Array(2)), /FFT/);
  const bad = { ...frame, window: new Float32Array(FFT_SIZE).fill(NaN) };
  assert.throws(() => analyzeFeature(bad), /nonfinite/);
});

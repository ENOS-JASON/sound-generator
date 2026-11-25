import type { ClockReference } from '../../contracts/events/index.ts';
import type { DiagnosticsHub } from '../../diagnostics/DiagnosticsHub.ts';
import type { TelemetryRegistry } from '../../diagnostics/TelemetryRegistry.ts';
import {
  FFT_SIZE,
  MASTER_ID,
  SOURCE_ID,
} from '../synthetic-worklet/stimulus.ts';
import type { FeatureFrame, Meter } from '../synthetic-worklet/stimulus.ts';

/** Radix-2 FFT on the consumer thread, rectangular window for test tones. */
export function fftMagnitude(input: Float32Array): Float64Array {
  if (input.length !== FFT_SIZE) throw new Error('invalid FFT window length');
  const real = new Float64Array(input);
  const imag = new Float64Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    if (!Number.isFinite(real[i])) throw new Error('nonfinite audio window');
  }
  for (let i = 1, j = 0; i < FFT_SIZE; i++) {
    let bit = FFT_SIZE >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const temp = real[i]!;
      real[i] = real[j]!;
      real[j] = temp;
    }
  }
  for (let length = 2; length <= FFT_SIZE; length *= 2) {
    const half = length / 2;
    for (let start = 0; start < FFT_SIZE; start += length) {
      for (let k = 0; k < half; k++) {
        const angle = (-2 * Math.PI * k) / length;
        const a = start + k;
        const b = a + half;
        const wr = Math.cos(angle);
        const wi = Math.sin(angle);
        const tr = real[b]! * wr - imag[b]! * wi;
        const ti = real[b]! * wi + imag[b]! * wr;
        real[b] = real[a]! - tr;
        imag[b] = imag[a]! - ti;
        real[a] = real[a]! + tr;
        imag[a] = imag[a]! + ti;
      }
    }
  }
  const magnitude = new Float64Array(FFT_SIZE / 2 + 1);
  for (let i = 0; i < magnitude.length; i++) {
    const factor = i === 0 || i === FFT_SIZE / 2 ? 1 : 2;
    magnitude[i] = (factor * Math.hypot(real[i]!, imag[i]!)) / FFT_SIZE;
  }
  return magnitude;
}

function validMeter(m: Meter): boolean {
  return (
    Number.isFinite(m.peak) &&
    Number.isFinite(m.rms) &&
    m.peak >= 0 &&
    m.peak <= 1 &&
    m.rms >= 0 &&
    m.rms <= m.peak + 1e-12
  );
}

export function analyzeFeature(frame: FeatureFrame) {
  if (
    frame.schemaVersion !== 1 ||
    !Number.isSafeInteger(frame.sequence) ||
    frame.sequence < 1 ||
    !Number.isSafeInteger(frame.startSampleFrame) ||
    frame.startSampleFrame < 0 ||
    !Number.isSafeInteger(frame.endSampleFrame) ||
    frame.endSampleFrame <= frame.startSampleFrame ||
    frame.endSampleFrame - frame.startSampleFrame > 4096 ||
    ![44100, 48000, 96000].includes(frame.sampleRate) ||
    !validMeter(frame.source) ||
    !validMeter(frame.master) ||
    !['physical', 'pitch-preserved'].includes(frame.mode) ||
    frame.supported !== (frame.mode === 'physical') ||
    !Number.isFinite(frame.playbackScale) ||
    frame.playbackScale < 0 ||
    frame.playbackScale > 1
  ) {
    throw new Error('invalid audio feature frame');
  }
  const spectrum = fftMagnitude(frame.window);
  let peakBin = 0;
  for (let i = 1; i < spectrum.length; i++) {
    if (spectrum[i]! > spectrum[peakBin]!) peakBin = i;
  }
  return {
    waveform: new Float32Array(frame.window),
    spectrum,
    peakBin,
    peakHz: (peakBin * frame.sampleRate) / FFT_SIZE,
  };
}

export function registerAudioMeters(registry: TelemetryRegistry): void {
  for (const componentId of [SOURCE_ID, MASTER_ID]) {
    for (const channelId of ['peak', 'rms']) {
      registry.register({
        componentId,
        channelId,
        label: componentId + ' ' + channelId,
        quantityKind: 'ratio',
        canonicalUnitId: '1',
        numericType: 'float64',
        availability: 'available',
        sampleClock: 'sampleFrame',
        sampleInterval: 1,
        bounds: { minSI: 0, maxSI: 1 },
        instrumentVersion: 1,
        performanceClass: 'normal',
        recorderRouting: 'standard',
      });
    }
  }
}

/** Clock mapping is supplied by the actual authoritative run, not DSP. */
export function publishAudioMeters(
  hub: DiagnosticsHub,
  frame: FeatureFrame,
  clock: ClockReference & { readonly runId: string },
): void {
  if (
    clock.runId !== frame.runId ||
    clock.sampleFrame !== frame.endSampleFrame ||
    !validMeter(frame.source) ||
    !validMeter(frame.master)
  ) {
    throw new Error('audio feature clock or meter mismatch');
  }
  for (const [componentId, meter] of [
    [SOURCE_ID, frame.source],
    [MASTER_ID, frame.master],
  ] as const) {
    for (const channelId of ['peak', 'rms'] as const) {
      hub.publish({
        ...clock,
        schemaVersion: 1,
        sourceComponentId: componentId,
        fieldId: componentId + '.' + channelId,
        valueSI: meter[channelId],
      });
    }
  }
}

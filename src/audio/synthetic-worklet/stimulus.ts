import {
  validateDiagnosticEvent,
  validateDomainEvent,
} from '../../contracts/events/index.ts';
import type {
  DiagnosticEvent,
  DomainEvent,
} from '../../contracts/events/index.ts';
import { createSeededRandom } from '../../contracts/prng.ts';
import type { SlowMotionAudioMode } from '../../core/clock/SimulationClock.ts';

export const FFT_SIZE = 1024;
export const FEATURE_FRAMES = 4096;
export const SOURCE_ID = 'synthetic-audio';
export const MASTER_ID = 'synthetic-master';

type TimelineEvent = DomainEvent | DiagnosticEvent;

export interface SyntheticOptions {
  readonly runId: string;
  readonly sampleRate: number;
  readonly seed: number;
  readonly toneHz: number;
  readonly frameCount: number;
  readonly captureFrames: number;
  readonly timeline: readonly TimelineEvent[];
}

export interface Meter {
  readonly peak: number;
  readonly rms: number;
}

export interface FeatureFrame {
  readonly schemaVersion: 1;
  readonly runId: string;
  readonly sequence: number;
  readonly startSampleFrame: number;
  readonly endSampleFrame: number;
  readonly sampleRate: number;
  readonly playbackScale: number;
  readonly mode: SlowMotionAudioMode;
  readonly supported: boolean;
  readonly source: Meter;
  readonly master: Meter;
  readonly window: Float32Array;
}

function index(value: number, max: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= max;
}

function validateOptions(input: SyntheticOptions): SyntheticOptions {
  if (
    !/^[a-z][a-z0-9-]{0,63}$/.test(input.runId) ||
    ![44100, 48000, 96000].includes(input.sampleRate) ||
    !index(input.seed, 0xffffffff) ||
    !Number.isFinite(input.toneHz) ||
    input.toneHz <= 0 ||
    input.toneHz >= input.sampleRate / 2 ||
    !index(input.frameCount, input.sampleRate * 10) ||
    input.frameCount < FFT_SIZE ||
    !index(input.captureFrames, Math.min(65536, input.frameCount)) ||
    !Array.isArray(input.timeline) ||
    input.timeline.length > 1024
  ) {
    throw new RangeError('invalid synthetic audio options');
  }
  let previousFrame = 0;
  const sequences = { domain: 0, diagnostic: 0 };
  const timeline = input.timeline.map((event) => {
    const e =
      event.category === 'domain'
        ? validateDomainEvent(event)
        : validateDiagnosticEvent(event);
    if (
      e.runId !== input.runId ||
      e.sampleFrame === undefined ||
      e.sampleFrame < previousFrame ||
      e.sampleFrame >= input.frameCount ||
      e.sequence <= sequences[e.category] ||
      (e.type === 'CLOCK_SCALE_CHANGED' && e.payload.playbackScale > 1)
    ) {
      throw new Error('invalid synthetic event timeline');
    }
    previousFrame = e.sampleFrame;
    sequences[e.category] = e.sequence;
    return e;
  });
  return Object.freeze({ ...input, timeline: Object.freeze(timeline) });
}

/**
 * A quiet deterministic test stimulus, not a physical engine or clock owner.
 * It consumes pre-scheduled canonical events and never calls the solver.
 */
export class SyntheticStimulus {
  readonly options: SyntheticOptions;
  readonly #ring = new Float32Array(FFT_SIZE);
  readonly #capture: Float32Array;
  #phase: number;
  #frame = 0;
  #eventIndex = 0;
  #scale = 1;
  #mode: SlowMotionAudioMode = 'physical';
  #sourcePeak = 0;
  #masterPeak = 0;
  #sourceSquares = 0;
  #masterSquares = 0;
  #interval = 0;
  #intervalStart = 0;
  #sequence = 0;
  #clipped = 0;
  #nonfinite = 0;
  #unsupportedFrames = 0;
  #impulses = 0;
  #maxOutput = 0;

  constructor(options: SyntheticOptions) {
    this.options = validateOptions(options);
    this.#phase = createSeededRandom(options.seed)() * 2 * Math.PI;
    this.#capture = new Float32Array(options.captureFrames);
  }

  get renderedFrames(): number {
    return this.#frame;
  }

  get complete(): boolean {
    return this.#frame === this.options.frameCount;
  }

  get featureReady(): boolean {
    return (
      this.#interval === FEATURE_FRAMES || (this.complete && this.#interval > 0)
    );
  }

  /** Render into the caller's buffer; no per-sample allocations or waits. */
  render(output: Float32Array): void {
    if (
      !index(output.length, FEATURE_FRAMES) ||
      this.#interval + output.length > FEATURE_FRAMES
    ) {
      throw new RangeError('render crosses feature boundary');
    }
    const n = Math.min(output.length, this.options.frameCount - this.#frame);
    output.fill(0);
    for (let i = 0; i < n; i++) {
      let impulse = 0;
      while (
        this.options.timeline[this.#eventIndex]?.sampleFrame === this.#frame
      ) {
        const e = this.options.timeline[this.#eventIndex++]!;
        if (e.type === 'CLOCK_SCALE_CHANGED') {
          this.#scale = e.payload.playbackScale;
        } else if (e.type === 'SLOW_MOTION_AUDIO_MODE_CHANGED') {
          this.#mode = e.payload.mode;
        } else if (e.type === 'COMBUSTION') {
          impulse += 0.08;
          this.#impulses++;
        }
      }
      let sample = 0;
      if (this.#mode === 'pitch-preserved') {
        // The requested DSP is not implemented. Never claim or silently
        // substitute pitch preservation; emit silence and count the frames.
        this.#unsupportedFrames++;
      } else if (this.#scale > 0) {
        sample = 0.12 * Math.sin(this.#phase) + Math.min(impulse, 0.24);
      }
      this.#phase =
        (this.#phase +
          (2 * Math.PI * this.options.toneHz * this.#scale) /
            this.options.sampleRate) %
        (2 * Math.PI);
      let master = sample * 0.5;
      if (!Number.isFinite(master) || !Number.isFinite(sample)) {
        this.#nonfinite++;
        sample = 0;
        master = 0;
      }
      if (Math.abs(master) >= 1) {
        this.#clipped++;
        master = Math.max(-1, Math.min(1, master));
      }
      output[i] = master;
      this.#ring[this.#frame % FFT_SIZE] = output[i]!;
      if (this.#frame < this.#capture.length) {
        this.#capture[this.#frame] = output[i]!;
      }
      this.#sourcePeak = Math.max(this.#sourcePeak, Math.abs(sample));
      this.#masterPeak = Math.max(this.#masterPeak, Math.abs(master));
      this.#maxOutput = Math.max(this.#maxOutput, Math.abs(master));
      this.#sourceSquares += sample * sample;
      this.#masterSquares += master * master;
      this.#interval++;
      this.#frame++;
    }
  }

  /** One bounded feature message per interval; FFT stays on the consumer. */
  takeFeature(): FeatureFrame | null {
    if (!this.featureReady) return null;
    const count = this.#interval;
    const window = new Float32Array(FFT_SIZE);
    const available = Math.min(this.#frame, FFT_SIZE);
    for (let i = 0; i < available; i++) {
      window[FFT_SIZE - available + i] =
        this.#ring[(this.#frame - available + i) % FFT_SIZE]!;
    }
    const result: FeatureFrame = {
      schemaVersion: 1,
      runId: this.options.runId,
      sequence: ++this.#sequence,
      startSampleFrame: this.#intervalStart,
      endSampleFrame: this.#frame,
      sampleRate: this.options.sampleRate,
      playbackScale: this.#scale,
      mode: this.#mode,
      supported: this.#mode === 'physical',
      source: {
        peak: this.#sourcePeak,
        rms: Math.sqrt(this.#sourceSquares / count),
      },
      master: {
        peak: this.#masterPeak,
        rms: Math.sqrt(this.#masterSquares / count),
      },
      window,
    };
    this.#intervalStart = this.#frame;
    this.#interval = 0;
    this.#sourcePeak = 0;
    this.#masterPeak = 0;
    this.#sourceSquares = 0;
    this.#masterSquares = 0;
    return result;
  }

  report() {
    const timeline = this.options.timeline.slice(0, this.#eventIndex);
    return {
      runId: this.options.runId,
      sampleRate: this.options.sampleRate,
      renderedFrames: this.#frame,
      playbackScale: this.#scale,
      mode: this.#mode,
      supported: this.#mode === 'physical',
      unsupportedFrames: this.#unsupportedFrames,
      clippedSamples: this.#clipped,
      nonfiniteSamples: this.#nonfinite,
      maxOutput: this.#maxOutput,
      impulseCount: this.#impulses,
      timeline,
      rawMaster: this.#capture.slice(0, this.#frame),
    };
  }
}

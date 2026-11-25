import { BENCHMARK_QUANTUM, createBenchmarkRun } from './benchmark-core.ts';
import type { BenchmarkRun } from './benchmark-core.ts';

export type SolverLocation = 'worklet' | 'worker';

export interface BenchmarkOptions {
  readonly owner: SolverLocation;
  readonly sampleRate: number;
  readonly scale: number;
  readonly totalFrames: number;
}

export type BenchmarkSummary = ReturnType<BenchmarkRun['summary']>;

export interface BlockMessage {
  readonly type: 'block';
  readonly index: number;
  readonly samples: Float32Array<ArrayBuffer>;
  readonly computeMs: number | null;
  readonly summary: BenchmarkSummary | null;
}

export interface TimingStats {
  readonly count: number;
  readonly meanMs: number | null;
  readonly p95Ms: number | null;
  readonly maxMs: number | null;
}

export interface RenderReport {
  readonly owner: SolverLocation;
  readonly summary: BenchmarkSummary;
  readonly blocks: number;
  readonly audioFrames: number;
  readonly renderedFrames: number;
  readonly underrunFrames: number;
  readonly audioFrameGapCount: number;
  readonly pcmHash: number;
  readonly solverCompute: TimingStats;
  readonly callbackJitter: TimingStats;
  readonly workerRoundTrip: TimingStats;
}

export type ProcessorMessage =
  | { type: 'ready' }
  | { type: 'progress'; blocks: number }
  | { type: 'result'; report: RenderReport }
  | { type: 'pong'; id: number }
  | { type: 'failure'; message: string };

export type ProcessorControl =
  | { type: 'configure'; options: BenchmarkOptions; port?: MessagePort }
  | { type: 'start' }
  | { type: 'ping'; id: number };

export type WorkerControl =
  | { type: 'configure'; options: BenchmarkOptions; port: MessagePort }
  | { type: 'ping'; id: number };

export type BlockRequest = { type: 'produce'; index: number };
export type WorkerReply = BlockMessage | { type: 'failure'; message: string };

export function nowMs(): number | null {
  return globalThis.performance?.now() ?? null;
}

export class TimingSeries {
  readonly #values = new Float64Array(24000);
  #length = 0;

  add(value: number | null): void {
    if (
      value !== null &&
      Number.isFinite(value) &&
      this.#length < this.#values.length
    ) {
      this.#values[this.#length++] = value;
    }
  }

  report(): TimingStats {
    if (this.#length === 0) {
      return { count: 0, meanMs: null, p95Ms: null, maxMs: null };
    }
    const sorted = this.#values.slice(0, this.#length).sort();
    return {
      count: sorted.length,
      meanMs: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
      p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1] ?? null,
      maxMs: sorted[sorted.length - 1] ?? null,
    };
  }
}

export function totalBlocks(options: BenchmarkOptions): number {
  if (
    ![44100, 48000].includes(options.sampleRate) ||
    ![0.1, 1].includes(options.scale) ||
    !['worklet', 'worker'].includes(options.owner) ||
    !Number.isSafeInteger(options.totalFrames) ||
    options.totalFrames < 1 ||
    options.totalFrames > options.sampleRate * 30
  ) {
    throw new RangeError('invalid benchmark options');
  }
  return Math.ceil(options.totalFrames / BENCHMARK_QUANTUM);
}

/** Both solver locations call this exact sequential producer. */
export function createBlockProducer(options: BenchmarkOptions) {
  const blocks = totalBlocks(options);
  const run = createBenchmarkRun(options.sampleRate, options.scale);
  let next = 0;
  return (index: number): BlockMessage => {
    if (index !== next || index >= blocks) {
      throw new Error('nonsequential benchmark block');
    }
    const start = nowMs();
    const samples = run.block(
      Math.min(
        BENCHMARK_QUANTUM,
        options.totalFrames - index * BENCHMARK_QUANTUM,
      ),
    );
    const summary = index + 1 === blocks ? run.summary() : null;
    const end = nowMs();
    next++;
    return {
      type: 'block',
      index,
      samples,
      computeMs: start === null || end === null ? null : end - start,
      summary,
    };
  };
}

/** Exact hash of the synthetic impulse samples in consumption order. */
export function appendPcmHash(hash: number, samples: Float32Array): number {
  const bits = new Uint32Array(
    samples.buffer,
    samples.byteOffset,
    samples.length,
  );
  for (const value of bits) {
    hash = Math.imul(hash ^ value, 16777619) >>> 0;
  }
  return hash;
}

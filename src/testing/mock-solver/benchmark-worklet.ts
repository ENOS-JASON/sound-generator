import { BENCHMARK_QUANTUM, LOOKAHEAD_BLOCKS } from './benchmark-core.ts';
import {
  appendPcmHash,
  createBlockProducer,
  nowMs,
  TimingSeries,
  totalBlocks,
} from './benchmark-protocol.ts';
import type {
  BenchmarkOptions,
  BlockMessage,
  ProcessorControl,
  ProcessorMessage,
  WorkerReply,
} from './benchmark-protocol.ts';

const scope = globalThis as unknown as {
  AudioWorkletProcessor: new () => { port: MessagePort };
  registerProcessor(
    name: string,
    processor: new () => { port: MessagePort },
  ): void;
  readonly currentFrame: number;
  readonly sampleRate: number;
};

class BenchmarkProcessor extends scope.AudioWorkletProcessor {
  #options: BenchmarkOptions | undefined;
  #produce: ReturnType<typeof createBlockProducer> | undefined;
  #workerPort: MessagePort | undefined;
  #queue = new Map<number, BlockMessage>();
  #requests = new Map<number, number | null>();
  #count = 0;
  #requested = 0;
  #index = 0;
  #ready = false;
  #started = false;
  #finished = false;
  #firstFrame: number | undefined;
  #lastFrame: number | undefined;
  #lastTime: number | null = null;
  #gapCount = 0;
  #underrunFrames = 0;
  #renderedFrames = 0;
  #pcmHash = 2166136261;
  readonly #compute = new TimingSeries();
  readonly #jitter = new TimingSeries();
  readonly #roundTrip = new TimingSeries();

  constructor() {
    super();
    this.port.onmessage = ({ data }: MessageEvent<ProcessorControl>) => {
      try {
        if (data.type === 'ping') {
          this.#send({ type: 'pong', id: data.id });
        } else if (data.type === 'start') {
          if (!this.#ready) throw new Error('benchmark not ready');
          this.#started = true;
        } else {
          this.#configure(data.options, data.port);
        }
      } catch (error) {
        this.#fail(error);
      }
    };
  }

  #send(message: ProcessorMessage): void {
    this.port.postMessage(message);
  }

  #fail(error: unknown): void {
    this.#finished = true;
    this.#workerPort?.close();
    this.#send({ type: 'failure', message: String(error) });
  }

  #markReady(): void {
    if (!this.#ready) {
      this.#ready = true;
      this.#send({ type: 'ready' });
    }
  }

  #configure(options: BenchmarkOptions, port?: MessagePort): void {
    if (this.#options || options.sampleRate !== scope.sampleRate) {
      throw new Error('invalid processor configuration');
    }
    this.#count = totalBlocks(options);
    this.#options = options;
    if (options.owner === 'worklet') {
      this.#produce = createBlockProducer(options);
      this.#markReady();
      return;
    }
    if (!port) throw new Error('worker port is required');
    this.#workerPort = port;
    port.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      try {
        if (data.type === 'failure') throw new Error(data.message);
        const sent = this.#requests.get(data.index);
        if (
          sent === undefined ||
          data.index < this.#index ||
          this.#queue.has(data.index) ||
          data.samples.length !== BENCHMARK_QUANTUM ||
          this.#queue.size >= LOOKAHEAD_BLOCKS
        ) {
          throw new Error('invalid or overflowing worker block');
        }
        const now = nowMs();
        this.#roundTrip.add(
          sent === null || now === null ? null : now - sent,
        );
        this.#requests.delete(data.index);
        this.#queue.set(data.index, data);
        if (this.#queue.size === Math.min(this.#count, LOOKAHEAD_BLOCKS)) {
          this.#markReady();
        }
      } catch (error) {
        this.#fail(error);
      }
    };
    this.#fill();
  }

  #fill(): void {
    while (
      this.#workerPort &&
      this.#requested < Math.min(this.#count, this.#index + LOOKAHEAD_BLOCKS)
    ) {
      this.#requests.set(this.#requested, nowMs());
      this.#workerPort.postMessage({
        type: 'produce',
        index: this.#requested++,
      });
    }
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0]?.[0];
    if (this.#finished) return false;
    if (!this.#started || !this.#options || !output) return true;
    try {
      if (output.length !== BENCHMARK_QUANTUM) {
        throw new Error('unsupported audio render quantum');
      }
      const frame = scope.currentFrame;
      const time = nowMs();
      const expectedMs =
        (BENCHMARK_QUANTUM / this.#options.sampleRate) * 1000;
      if (this.#firstFrame === undefined) this.#firstFrame = frame;
      if (
        this.#lastFrame !== undefined &&
        frame !== this.#lastFrame + BENCHMARK_QUANTUM
      ) {
        this.#gapCount++;
      }
      if (time !== null && this.#lastTime !== null) {
        this.#jitter.add(Math.abs(time - this.#lastTime - expectedMs));
      }
      this.#lastFrame = frame;
      this.#lastTime = time;
      this.#renderedFrames += output.length;
      const block =
        this.#produce?.(this.#index) ?? this.#queue.get(this.#index);
      if (!block) {
        // Output silence but never skip a physical block or replay it twice.
        output.fill(0);
        this.#underrunFrames += output.length;
        return true;
      }
      this.#queue.delete(this.#index);
      output.set(block.samples);
      this.#pcmHash = appendPcmHash(this.#pcmHash, block.samples);
      this.#compute.add(block.computeMs);
      this.#index++;
      this.#fill();
      if (this.#index % 128 === 0) {
        this.#send({ type: 'progress', blocks: this.#index });
      }
      if (this.#index === this.#count) {
        if (!block.summary) throw new Error('missing final solver summary');
        this.#finished = true;
        this.#workerPort?.close();
        this.#send({
          type: 'result',
          report: {
            owner: this.#options.owner,
            summary: block.summary,
            blocks: this.#index,
            audioFrames: frame + output.length - this.#firstFrame,
            renderedFrames: this.#renderedFrames,
            underrunFrames: this.#underrunFrames,
            audioFrameGapCount: this.#gapCount,
            pcmHash: this.#pcmHash,
            solverCompute: this.#compute.report(),
            callbackJitter: this.#jitter.report(),
            workerRoundTrip: this.#roundTrip.report(),
          },
        });
        return false;
      }
      return true;
    } catch (error) {
      this.#fail(error);
      return false;
    }
  }
}

scope.registerProcessor('solver-benchmark', BenchmarkProcessor);

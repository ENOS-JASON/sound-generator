import { SyntheticStimulus } from './stimulus.ts';
import type { SyntheticOptions } from './stimulus.ts';

const scope = globalThis as unknown as {
  AudioWorkletProcessor: new (options: {
    processorOptions: SyntheticOptions;
  }) => { port: MessagePort };
  registerProcessor(
    name: string,
    processor: new (options: { processorOptions: SyntheticOptions }) => {
      port: MessagePort;
    },
  ): void;
  readonly currentFrame: number;
  readonly sampleRate: number;
};

class SyntheticProcessor extends scope.AudioWorkletProcessor {
  readonly #stimulus: SyntheticStimulus;
  #started = false;
  #outstanding = 0;
  #dropped = 0;
  #firstFrame: number | undefined;
  #expectedFrame: number | undefined;
  #gaps = 0;
  #timed = 0;
  #maxMs = 0;
  #overruns = 0;

  constructor(options: { processorOptions: SyntheticOptions }) {
    super(options);
    if (options.processorOptions.sampleRate !== scope.sampleRate) {
      throw new Error('synthetic device sample rate mismatch');
    }
    this.#stimulus = new SyntheticStimulus(options.processorOptions);
    this.port.onmessage = ({ data }: MessageEvent<{ type: string }>) => {
      if (data.type === 'start') this.#started = true;
      if (data.type === 'ack')
        this.#outstanding = Math.max(0, this.#outstanding - 1);
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0]?.[0];
    if (!this.#started || !output) return true;
    try {
      if (output.length !== 128) {
        throw new Error('unsupported synthetic render quantum');
      }
      const frame = scope.currentFrame;
      this.#firstFrame ??= frame;
      if (this.#expectedFrame !== undefined && frame !== this.#expectedFrame) {
        this.#gaps++;
      }
      this.#expectedFrame = frame + output.length;
      const start = globalThis.performance?.now();
      this.#stimulus.render(output);
      const feature = this.#stimulus.takeFeature();
      if (feature) {
        if (this.#outstanding < 2) {
          this.#outstanding++;
          this.port.postMessage({ type: 'feature', frame: feature });
        } else {
          this.#dropped++;
        }
      }
      const end = globalThis.performance?.now();
      if (start !== undefined && end !== undefined) {
        const elapsed = end - start;
        this.#timed++;
        this.#maxMs = Math.max(this.#maxMs, elapsed);
        if (elapsed > (output.length * 1000) / scope.sampleRate) {
          this.#overruns++;
        }
      }
      if (!this.#stimulus.complete) return true;
      const result = this.#stimulus.report();
      this.port.postMessage({
        type: 'result',
        report: {
          ...result,
          contextStartFrame: this.#firstFrame,
          frameGaps: this.#gaps,
          droppedFeatures: this.#dropped,
          deadline: {
            budgetMs: (output.length * 1000) / scope.sampleRate,
            timedBlocks: this.#timed,
            maxComputeMs: this.#timed ? this.#maxMs : null,
            overruns: this.#timed ? this.#overruns : null,
          },
        },
      });
      return false;
    } catch (error) {
      output.fill(0);
      this.port.postMessage({ type: 'failure', message: String(error) });
      return false;
    }
  }
}

scope.registerProcessor('synthetic-diagnostics', SyntheticProcessor);

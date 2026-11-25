import workletUrl from './processor.ts?worker&url';
import { createMockRun } from '../../testing/mock-solver/i4.ts';
import type {
  ClockReference,
  DiagnosticEvent,
  DomainEvent,
} from '../../contracts/events/index.ts';
import { DiagnosticsHub } from '../../diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../../diagnostics/TelemetryRegistry.ts';
import {
  analyzeFeature,
  publishAudioMeters,
  registerAudioMeters,
} from '../feature-bridge/analysis.ts';
import { FEATURE_FRAMES, FFT_SIZE } from './stimulus.ts';
import type { FeatureFrame, SyntheticOptions } from './stimulus.ts';

const button = document.querySelector<HTMLButtonElement>('#run')!;
const rate = document.querySelector<HTMLSelectElement>('#rate')!;
const scale = document.querySelector<HTMLSelectElement>('#scale')!;
const status = document.querySelector<HTMLElement>('#status')!;
const report = document.querySelector<HTMLElement>('#report')!;
const waveform = document.querySelector<HTMLCanvasElement>('#waveform')!;
const spectrum = document.querySelector<HTMLCanvasElement>('#spectrum')!;

function draw(
  canvas: HTMLCanvasElement,
  values: ArrayLike<number>,
  bipolar: boolean,
) {
  const c = canvas.getContext('2d');
  if (!c) return;
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.strokeStyle = '#1769aa';
  c.beginPath();
  for (let i = 0; i < values.length; i++) {
    const x = (i / (values.length - 1)) * canvas.width;
    const value = values[i]!;
    const y = bipolar
      ? canvas.height * (0.5 - value * 2)
      : canvas.height * (1 - Math.min(1, value * 8));
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
}

button.onclick = async () => {
  button.disabled = true;
  status.dataset.state = 'running';
  status.textContent = 'Unlocking audio';
  let context: AudioContext | undefined;
  let node: AudioWorkletNode | undefined;
  let timer = 0;
  try {
    const sampleRate = Number(rate.value);
    const playbackScale = Number(scale.value);
    context = new AudioContext({ sampleRate });
    await context.resume();
    if (context.state !== 'running') throw new Error('audio unlock failed');
    await context.audioWorklet.addModule(workletUrl);
    const { clock } = createMockRun(sampleRate, 42);
    const { diagnostics } = clock.applyControl({
      schemaVersion: 1,
      category: 'command',
      runId: 'mock-i4',
      commandId: 'synthetic-scale',
      origin: 'automation',
      targetSimulationTick: 0,
      targetSampleFrame: 0,
      causationId: null,
      correlationId: null,
      type: 'SET_TIME_SCALE',
      payload: { playbackScale },
    });
    const total = Math.round((sampleRate * 0.4) / playbackScale);
    const timeline: (DomainEvent | DiagnosticEvent)[] = [...diagnostics];
    const clocks = new Map<number, ClockReference & { runId: string }>();
    while (clock.snapshot().sampleFrame < total) {
      const n = Math.min(FEATURE_FRAMES, total - clock.snapshot().sampleFrame);
      timeline.push(...clock.advanceFrames(n).events);
      const current = clock.snapshot();
      clocks.set(current.sampleFrame, current);
    }
    const options: SyntheticOptions = {
      runId: 'mock-i4',
      sampleRate,
      seed: 42,
      toneHz: (20 * sampleRate) / FFT_SIZE,
      frameCount: total,
      captureFrames: 4096,
      timeline: timeline.filter((e) => e.sampleFrame! < total),
    };
    const registry = new TelemetryRegistry();
    registerAudioMeters(registry);
    const hub = new DiagnosticsHub(registry, options.runId);
    const features: { peakBin: number; peakHz: number; sequence: number }[] =
      [];
    node = new AudioWorkletNode(context, 'synthetic-diagnostics', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: options,
    });
    const active = node;
    await new Promise<void>((resolve, reject) => {
      timer = window.setTimeout(
        () => reject(new Error('audio fixture timeout')),
        15000,
      );
      active.onprocessorerror = () => reject(new Error('worklet error'));
      active.port.onmessage = ({ data }) => {
        try {
          if (data.type === 'failure') throw new Error(data.message);
          if (data.type === 'feature') {
            const frame: FeatureFrame = data.frame;
            const result = analyzeFeature(frame);
            const mapped = clocks.get(frame.endSampleFrame);
            if (!mapped) throw new Error('missing authoritative clock mapping');
            publishAudioMeters(hub, frame, mapped);
            features.push({
              sequence: frame.sequence,
              peakBin: result.peakBin,
              peakHz: result.peakHz,
            });
            draw(waveform, result.waveform, true);
            draw(spectrum, result.spectrum, false);
            active.port.postMessage({ type: 'ack' });
          } else if (data.type === 'result') {
            const { rawMaster, ...summary } = data.report;
            report.textContent = JSON.stringify(
              {
                ...summary,
                audioUnlocked: true,
                rawCapturedFrames: rawMaster.length,
                captureFinite: Array.from(rawMaster as Float32Array).every(
                  Number.isFinite,
                ),
                features,
                meters: hub.read().map((p) => ({
                  fieldId: p.definition.fieldId,
                  valueSI: p.latest?.valueSI ?? null,
                  sampleFrame: p.latest?.sampleFrame ?? null,
                })),
              },
              null,
              2,
            );
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      };
      active.connect(context!.destination);
      active.port.postMessage({ type: 'start' });
    });
    status.dataset.state = 'complete';
    status.textContent = 'Synthetic audio fixture complete';
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = String(error);
  } finally {
    window.clearTimeout(timer);
    node?.disconnect();
    node?.port.close();
    await context?.close();
    button.disabled = false;
  }
};

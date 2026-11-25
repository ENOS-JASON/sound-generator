import workletUrl from './benchmark-worklet.ts?worker&url';
import {
  BENCHMARK_QUANTUM,
  LOOKAHEAD_BLOCKS,
} from './benchmark-core.ts';
import { TimingSeries, totalBlocks } from './benchmark-protocol.ts';
import type {
  BenchmarkOptions,
  ProcessorMessage,
  RenderReport,
  SolverLocation,
} from './benchmark-protocol.ts';

const runButton = document.querySelector<HTMLButtonElement>('#run')!;
const cancelButton = document.querySelector<HTMLButtonElement>('#cancel')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const status = document.querySelector<HTMLElement>('#status')!;
const report = document.querySelector<HTMLElement>('#report')!;
const rate = document.querySelector<HTMLSelectElement>('#rate')!;
const scale = document.querySelector<HTMLSelectElement>('#scale')!;
const reverse = document.querySelector<HTMLInputElement>('#reverse')!;
const hardware = document.querySelector<HTMLInputElement>('#hardware')!;
let active: AbortController | undefined;

function setStatus(state: string, message: string): void {
  status.dataset.state = state;
  status.textContent = message;
}

async function runLocation(
  context: AudioContext,
  options: BenchmarkOptions,
  signal: AbortSignal,
) {
  const count = totalBlocks(options);
  const initAt = performance.now();
  const node = new AudioWorkletNode(context, 'solver-benchmark', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });
  const worker =
    options.owner === 'worker'
      ? new Worker(new URL('./benchmark-worker.ts', import.meta.url), {
          type: 'module',
        })
      : undefined;
  const probes = new Map<number, number>();
  const roundTrip = new TimingSeries();
  let nextProbe = 0;
  let readyMs = 0;
  let hidden = document.hidden;
  let suspended = context.state !== 'running';
  let startAt = 0;
  let timeout = 0;
  let interval = 0;
  const visibility = () => {
    hidden ||= document.hidden;
  };
  const stateChange = () => {
    suspended ||= context.state !== 'running';
  };
  try {
    const result = await new Promise<RenderReport>((resolve, reject) => {
      const fail = (message: string) => reject(new Error(message));
      const abort = () => fail('benchmark cancelled');
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) return abort();
      document.addEventListener('visibilitychange', visibility);
      context.addEventListener('statechange', stateChange);
      timeout = window.setTimeout(
        () => fail('benchmark timed out'),
        (options.totalFrames / options.sampleRate) * 2000 + 15000,
      );
      const receive = (message: ProcessorMessage) => {
        if (message.type === 'pong') {
          const sent = probes.get(message.id);
          if (sent !== undefined) {
            roundTrip.add(performance.now() - sent);
            probes.delete(message.id);
          }
        } else if (message.type === 'ready') {
          readyMs = performance.now() - initAt;
          startAt = performance.now();
          node.port.postMessage({ type: 'start' });
          interval = window.setInterval(() => {
            const id = nextProbe++;
            if (probes.size >= 16) return;
            probes.set(id, performance.now());
            (worker ?? node.port).postMessage({ type: 'ping', id });
          }, 250);
        } else if (message.type === 'progress') {
          setStatus('running', options.owner + ': ' + message.blocks + '/' + count);
        } else if (message.type === 'result') {
          resolve(message.report);
        } else if (message.type === 'failure') {
          fail(message.message);
        }
      };
      node.port.onmessage = ({ data }: MessageEvent<ProcessorMessage>) =>
        receive(data);
      node.onprocessorerror = () => fail('AudioWorklet processor error');
      node.connect(context.destination);
      if (worker) {
        worker.onmessage = ({ data }: MessageEvent<ProcessorMessage>) =>
          receive(data);
        worker.onerror = () => fail('Worker error');
        const channel = new MessageChannel();
        worker.postMessage(
          { type: 'configure', options, port: channel.port1 },
          [channel.port1],
        );
        node.port.postMessage(
          { type: 'configure', options, port: channel.port2 },
          [channel.port2],
        );
      } else {
        node.port.postMessage({ type: 'configure', options });
      }
    });
    return {
      ...result,
      startupMs: readyMs,
      mainElapsedMs: performance.now() - startAt,
      mainToSolverPing: roundTrip.report(),
      unansweredPings: probes.size,
      hiddenDuringRun: hidden,
      suspendedDuringRun: suspended,
    };
  } finally {
    window.clearInterval(interval);
    window.clearTimeout(timeout);
    document.removeEventListener('visibilitychange', visibility);
    context.removeEventListener('statechange', stateChange);
    node.disconnect();
    node.port.close();
    worker?.terminate();
  }
}

runButton.onclick = async () => {
  active = new AbortController();
  runButton.disabled = true;
  cancelButton.disabled = false;
  saveButton.disabled = true;
  report.textContent = '';
  setStatus('running', 'Initializing audio');
  let context: AudioContext | undefined;
  try {
    const sampleRate = Number(rate.value);
    const playbackScale = Number(scale.value);
    const owners: SolverLocation[] = reverse.checked
      ? ['worker', 'worklet']
      : ['worklet', 'worker'];
    // CI uses a short functional smoke run, never a hardware benchmark.
    const smoke = new URLSearchParams(location.search).has('smoke');
    const simulationSeconds = smoke ? 0.4 : 3;
    const totalFrames = Math.round(
      (sampleRate * simulationSeconds) / playbackScale,
    );
    const hardwareNotes = hardware.value;
    context = new AudioContext({ sampleRate, latencyHint: 'interactive' });
    await context.resume();
    if (context.sampleRate !== sampleRate) {
      throw new Error('browser did not provide requested sample rate');
    }
    await context.audioWorklet.addModule(workletUrl);
    const results = [];
    for (const owner of owners) {
      setStatus('running', 'Starting ' + owner);
      results.push(
        await runLocation(
          context,
          { owner, sampleRate, scale: playbackScale, totalFrames },
          active.signal,
        ),
      );
    }
    const [a, b] = results;
    if (!a || !b) throw new Error('missing comparison result');
    const equivalent =
      JSON.stringify(a.summary) === JSON.stringify(b.summary) &&
      a.pcmHash === b.pcmHash &&
      a.blocks === b.blocks;
    const data = {
      schemaVersion: 1,
      benchmark: 'AG-M0-10-synthetic-i4-v1',
      measuredAt: new Date().toISOString(),
      smoke,
      hardwareNotes,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      logicalProcessors: navigator.hardwareConcurrency,
      sampleRate,
      playbackScale,
      simulationSeconds,
      totalFrames,
      quantumFrames: BENCHMARK_QUANTUM,
      workerLookaheadBlocks: LOOKAHEAD_BLOCKS,
      baseLatencySeconds: context.baseLatency,
      outputLatencySeconds: context.outputLatency ?? null,
      equivalent,
      results,
    };
    report.textContent = JSON.stringify(data, null, 2);
    saveButton.disabled = false;
    setStatus(
      equivalent ? 'complete' : 'error',
      equivalent ? 'Comparison complete' : 'Solver traces differ',
    );
  } catch (error) {
    setStatus('error', String(error));
  } finally {
    await context?.close();
    active = undefined;
    runButton.disabled = false;
    cancelButton.disabled = true;
  }
};

cancelButton.onclick = () => active?.abort();
saveButton.onclick = () => {
  const blob = new Blob([report.textContent ?? ''], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ag-m0-10-benchmark-' + Date.now() + '.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

import type { DomainEvent } from '../../contracts/events/index.ts';
import { createMockRun } from './i4.ts';

export const BENCHMARK_QUANTUM = 128;
export const LOOKAHEAD_BLOCKS = 4;

/** Domain signature excludes playback sample frames by design. */
export function appendEventHash(hash: number, event: DomainEvent): number {
  const { sampleFrame, ...physical } = event;
  void sampleFrame;
  const data = JSON.stringify(physical);
  for (let i = 0; i < data.length; i++) {
    hash = Math.imul(hash ^ data.charCodeAt(i), 16777619) >>> 0;
  }
  return hash;
}

/** Identical physics and synthetic event impulse generation in both locations. */
export function createBenchmarkRun(sampleRate: number, scale: number) {
  const run = createMockRun(sampleRate);
  run.clock.applyControl({
    schemaVersion: 1,
    category: 'command',
    runId: 'mock-i4',
    commandId: 'benchmark-scale',
    origin: 'automation',
    targetSimulationTick: 0,
    causationId: null,
    correlationId: null,
    type: 'SET_TIME_SCALE',
    payload: { playbackScale: scale },
  });
  let hash = 2166136261;
  let eventCount = 0;
  let pendingImpulse = 0;
  return {
    block(frames = BENCHMARK_QUANTUM) {
      if (
        !Number.isInteger(frames) ||
        frames < 1 ||
        frames > BENCHMARK_QUANTUM
      ) {
        throw new RangeError('invalid benchmark block length');
      }
      const before = run.clock.snapshot().sampleFrame;
      const result = run.clock.advanceFrames(frames);
      const samples = new Float32Array(BENCHMARK_QUANTUM);
      samples[0] = pendingImpulse;
      pendingImpulse = 0;
      for (const event of result.events) {
        hash = appendEventHash(hash, event);
        eventCount++;
        if (event.type !== 'COMBUSTION') continue;
        const index = (event.sampleFrame ?? before) - before;
        if (index === frames) pendingImpulse += 0.05;
        else samples[index] = (samples[index] ?? 0) + 0.05;
      }
      return samples;
    },
    summary() {
      return {
        hash,
        eventCount,
        clock: run.clock.snapshot(),
        state: run.state(),
      };
    },
  };
}

export type BenchmarkRun = ReturnType<typeof createBenchmarkRun>;

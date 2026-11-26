import { createMockRun } from '../../testing/mock-solver/i4.ts';
import type { DomainEvent } from '../../contracts/events/index.ts';

export const mockScales = [0.05, 0.1, 0.25, 0.5, 1] as const;

// A UI fixture only. The production physics/audio owner remains ADR-001.
export function createShellRuntime() {
  const { clock, state } = createMockRun(48000);
  let commandSequence = 0;
  let eventCount = 0;
  let lastEvent: DomainEvent['type'] | null = null;

  function observe(events: readonly DomainEvent[]) {
    eventCount += events.length;
    if (events.length > 0) lastEvent = events[events.length - 1]!.type;
  }

  function control(
    type: 'PAUSE' | 'RESUME' | 'SET_TIME_SCALE' | 'STEP_TICKS',
    payload: object = {},
  ) {
    const current = clock.snapshot();
    const result = clock.applyControl({
      schemaVersion: 1,
      category: 'command',
      runId: current.runId,
      commandId: 'shell-' + ++commandSequence,
      origin: 'ui',
      targetSimulationTick: current.simulationTick,
      targetSampleFrame: current.sampleFrame,
      causationId: null,
      correlationId: null,
      type,
      payload,
    });
    observe(result.events);
  }

  function snapshot() {
    return Object.freeze({
      ...clock.snapshot(),
      rpm: (state().angularSpeed * 60) / (2 * Math.PI),
      eventCount,
      lastEvent,
    });
  }

  // A newly loaded document starts paused; routing never calls this again.
  control('PAUSE');

  return {
    snapshot,
    // Fixed synthetic 25 ms blocks, not an audio callback or wall-clock
    // accuracy claim. The clock, not rendering, advances the mock solver.
    pulse() {
      observe(clock.advanceFrames(1200).events);
      return snapshot();
    },
    pause() {
      control('PAUSE');
      return snapshot();
    },
    resume() {
      control('RESUME');
      return snapshot();
    },
    setScale(scale: number) {
      if (!mockScales.some((candidate) => candidate === scale)) {
        throw new RangeError('unsupported mock playback scale');
      }
      control('SET_TIME_SCALE', { playbackScale: scale });
      return snapshot();
    },
    step() {
      control('STEP_TICKS', { count: 1 });
      return snapshot();
    },
  };
}

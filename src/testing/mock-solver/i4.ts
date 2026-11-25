import { validateDomainEvent } from '../../contracts/events/index.ts';
import type { DomainEvent, EventType } from '../../contracts/events/index.ts';
import { createSeededRandom } from '../../contracts/prng.ts';
import {
  SimulationClock,
  TICK_RATE,
} from '../../core/clock/SimulationClock.ts';
import type {
  TickContext,
  TickOutput,
} from '../../core/clock/SimulationClock.ts';

/**
 * Synthetic I4 starter/manual/road-load fixture, not a calibrated engine.
 * All inputs are scheduled by simulation tick and use the same seeded stream
 * in headless, Worker and AudioWorklet runs.
 */
export function createMockI4(seed = 42) {
  const random = createSeededRandom(seed);
  let angularSpeed = 0;
  let angle = 0;
  let sequence = 0;
  let firing = 0;
  const order = [1, 3, 4, 2] as const;

  function advance(context: TickContext): TickOutput {
    const tick = context.simulationTick;
    const starter = tick <= 250;
    const running = tick > 250;
    const throttle = tick < 1500 ? 0.22 : 0.48;
    const gearRatio = tick < 2200 ? 3.4 : 2.1;
    const roadLoad = running ? 0.018 * angularSpeed * gearRatio : 0;
    const cylinderTorque = running
      ? 12 + 38 * throttle + 7 * Math.sin(2 * angle)
      : 0;
    const torque =
      (starter ? 24 : 0) +
      cylinderTorque -
      0.16 * angularSpeed -
      roadLoad +
      (random() - 0.5) * 0.2;
    angularSpeed = Math.max(0, angularSpeed + torque / (0.18 * TICK_RATE));
    angle += angularSpeed / TICK_RATE;
    const events: DomainEvent[] = [];
    function emit(type: EventType, source: string, payload: object) {
      events.push(
        validateDomainEvent({
          schemaVersion: 3,
          category: 'domain',
          ...context,
          crankAngleRadians: angle,
          sequence: ++sequence,
          sourceComponentId: source,
          causationId: null,
          correlationId: null,
          type,
          payload,
        }),
      );
    }
    if (tick === 1) {
      emit('STARTER_ENGAGED', 'starter', { starterTorqueNm: 24 });
    }
    if (tick === 251) {
      emit('STARTER_DISENGAGED', 'starter', {});
      emit('ENGINE_RUNNING', 'engine', {});
      firing = Math.floor(angle / Math.PI);
    }
    if (tick === 2200) {
      emit('GEAR_CHANGED', 'drivetrain', { gear: 2 });
    }
    while (running && angle >= (firing + 1) * Math.PI) {
      const cylinderId = order[firing % order.length]!;
      firing++;
      emit('COMBUSTION', 'cylinder-' + cylinderId, { cylinderId });
    }
    return { crankAngleRadians: angle, events };
  }

  return {
    advance,
    state: () => Object.freeze({ angularSpeed, crankAngleRadians: angle }),
  };
}

export function createMockRun(sampleRate: number, seed = 42) {
  const solver = createMockI4(seed);
  return {
    clock: new SimulationClock('mock-i4', sampleRate, solver.advance),
    state: solver.state,
  };
}

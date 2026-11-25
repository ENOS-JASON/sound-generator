import {
  validateCommand,
  validateDiagnosticEvent,
} from '../../contracts/events/index.ts';
import type {
  CommandEnvelope,
  DiagnosticEvent,
  DiagnosticType,
  DomainEvent,
  EventType,
} from '../../contracts/events/index.ts';

export const TICK_RATE = 1000;
const SCALE_DENOMINATOR = 1_000_000;
const MAX_BLOCK_FRAMES = 4096;
const MAX_STEP_TICKS = 10_000;

export type SlowMotionAudioMode = 'physical' | 'pitch-preserved';

export interface TickContext {
  readonly runId: string;
  readonly simulationTick: number;
  readonly simulationTimeSeconds: number;
  readonly sampleFrame: number;
}

export interface TickOutput {
  readonly crankAngleRadians: number;
  readonly events: readonly DomainEvent[];
}

export type AdvanceTick = (context: TickContext) => TickOutput;

export interface ClockSnapshot extends TickContext {
  readonly sampleRate: number;
  readonly crankAngleRadians: number;
  readonly playbackScale: number;
  readonly paused: boolean;
  readonly slowMotionAudioMode: SlowMotionAudioMode;
  readonly phaseNumerator: number;
  readonly phaseDenominator: number;
}

export interface StepResult {
  readonly events: readonly DomainEvent[];
  readonly ticksAdvanced: number;
  readonly reached: boolean;
}

export interface ControlResult extends StepResult {
  readonly command: CommandEnvelope;
  readonly diagnostics: readonly DiagnosticEvent[];
}

function boundedInteger(value: number, min: number, max: number): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError('integer outside clock bounds');
  }
}

function scaleUnits(value: number): number {
  const units = Math.round(value * SCALE_DENOMINATOR);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1 ||
    units / SCALE_DENOMINATOR !== value
  ) {
    throw new RangeError('scale must be in [0, 1] at 0.000001 resolution');
  }
  return units;
}

/**
 * A single-owner fixed-step clock. Integer phase is carried across blocks,
 * scale changes and pauses; crossing frames use the first sample boundary at
 * or after a tick. Manual steps advance simulated time at the paused frame.
 * No wall/render clock, scheduler, transport or DSP ownership is assumed.
 */
export class SimulationClock {
  readonly #runId: string;
  readonly #sampleRate: number;
  readonly #advanceTick: AdvanceTick;
  readonly #denominator: number;
  #tick = 0;
  #frame = 0;
  #phase = 0;
  #angle = 0;
  #scale = SCALE_DENOMINATOR;
  #resumeScale = SCALE_DENOMINATOR;
  #mode: SlowMotionAudioMode = 'physical';
  #diagnosticSequence = 0;

  constructor(runId: string, sampleRate: number, advanceTick: AdvanceTick) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(runId)) {
      throw new Error('invalid run ID');
    }
    boundedInteger(sampleRate, 8000, 192000);
    this.#runId = runId;
    this.#sampleRate = sampleRate;
    this.#advanceTick = advanceTick;
    this.#denominator = sampleRate * SCALE_DENOMINATOR;
  }

  snapshot(): ClockSnapshot {
    return Object.freeze({
      runId: this.#runId,
      simulationTick: this.#tick,
      simulationTimeSeconds: this.#tick / TICK_RATE,
      sampleFrame: this.#frame,
      sampleRate: this.#sampleRate,
      crankAngleRadians: this.#angle,
      playbackScale: this.#scale / SCALE_DENOMINATOR,
      paused: this.#scale === 0,
      slowMotionAudioMode: this.#mode,
      phaseNumerator: this.#phase,
      phaseDenominator: this.#denominator,
    });
  }

  #step(): readonly DomainEvent[] {
    const tick = this.#tick + 1;
    boundedInteger(tick, 1, Number.MAX_SAFE_INTEGER);
    const result = this.#advanceTick({
      runId: this.#runId,
      simulationTick: tick,
      simulationTimeSeconds: tick / TICK_RATE,
      sampleFrame: this.#frame,
    });
    if (!Number.isFinite(result.crankAngleRadians)) {
      throw new Error('nonfinite solver crank angle');
    }
    this.#tick = tick;
    this.#angle = result.crankAngleRadians;
    return result.events;
  }

  advanceFrames(count: number): StepResult {
    boundedInteger(count, 0, MAX_BLOCK_FRAMES);
    boundedInteger(this.#frame + count, 0, Number.MAX_SAFE_INTEGER);
    const initialTick = this.#tick;
    const events: DomainEvent[] = [];
    const increment = TICK_RATE * this.#scale;
    let remaining = count;
    while (remaining > 0 && increment > 0) {
      const untilTick = Math.ceil(
        (this.#denominator - this.#phase) / increment,
      );
      const frames = Math.min(remaining, untilTick);
      this.#phase += frames * increment;
      this.#frame += frames;
      remaining -= frames;
      if (this.#phase >= this.#denominator) {
        this.#phase -= this.#denominator;
        events.push(...this.#step());
      }
    }
    this.#frame += remaining;
    return {
      events,
      ticksAdvanced: this.#tick - initialTick,
      reached: true,
    };
  }

  #manualStep(
    limit: number,
    goal?: { eventType: EventType } | { angleDeltaRadians: number },
  ): StepResult {
    if (this.#scale !== 0) throw new Error('manual stepping requires pause');
    boundedInteger(limit, 1, MAX_STEP_TICKS);
    const start = this.#angle;
    const events: DomainEvent[] = [];
    for (let i = 1; i <= limit; i++) {
      const emitted = this.#step();
      events.push(...emitted);
      if (
        goal &&
        ('eventType' in goal
          ? emitted.some((event) => event.type === goal.eventType)
          : Math.abs(this.#angle - start) >= goal.angleDeltaRadians)
      ) {
        return { events, ticksAdvanced: i, reached: true };
      }
    }
    return { events, ticksAdvanced: limit, reached: goal === undefined };
  }

  #diagnostic(
    command: CommandEnvelope,
    type: DiagnosticType,
    payload: object,
  ): DiagnosticEvent {
    return validateDiagnosticEvent({
      schemaVersion: 3,
      category: 'diagnostic',
      runId: this.#runId,
      sequence: ++this.#diagnosticSequence,
      simulationTick: this.#tick,
      simulationTimeSeconds: this.#tick / TICK_RATE,
      sampleFrame: this.#frame,
      crankAngleRadians: this.#angle,
      sourceComponentId: 'simulation-clock',
      causationId: command.commandId,
      correlationId: command.correlationId,
      type,
      payload,
    });
  }

  /**
   * Apply already scheduled controls only at the current tick/frame boundary.
   * The caller records the returned command and diagnostics; future scheduling
   * and command deduplication remain the command transport owner's work.
   */
  applyControl(input: unknown): ControlResult {
    const command = validateCommand(input);
    if (
      command.runId !== this.#runId ||
      command.targetSimulationTick !== this.#tick ||
      (command.targetSampleFrame !== undefined &&
        command.targetSampleFrame !== this.#frame)
    ) {
      throw new Error('control must target current run and boundary');
    }
    const previousScale = this.#scale;
    const previousMode = this.#mode;
    let step: StepResult = { events: [], ticksAdvanced: 0, reached: true };
    switch (command.type) {
      case 'SET_TIME_SCALE':
        this.#scale = scaleUnits(command.payload.playbackScale);
        break;
      case 'PAUSE':
        this.#scale = 0;
        break;
      case 'RESUME':
        if (this.#scale === 0) this.#scale = this.#resumeScale;
        break;
      case 'SET_SLOW_MOTION_AUDIO_MODE':
        this.#mode = command.payload.mode;
        break;
      case 'STEP_TICKS':
        step = this.#manualStep(command.payload.count);
        break;
      case 'STEP_TO_CRANK_ANGLE':
        step = this.#manualStep(command.payload.maxTicks, {
          angleDeltaRadians: command.payload.angleDeltaRadians,
        });
        break;
      case 'STEP_UNTIL_EVENT':
        step = this.#manualStep(command.payload.maxTicks, {
          eventType: command.payload.eventType,
        });
        break;
      default:
        throw new Error('not a clock control');
    }
    if (this.#scale > 0) this.#resumeScale = this.#scale;
    const diagnostics: DiagnosticEvent[] = [];
    if (previousScale !== this.#scale) {
      diagnostics.push(
        this.#diagnostic(command, 'CLOCK_SCALE_CHANGED', {
          playbackScale: this.#scale / SCALE_DENOMINATOR,
        }),
      );
      if (previousScale === 0 || this.#scale === 0) {
        diagnostics.push(
          this.#diagnostic(
            command,
            this.#scale === 0 ? 'RUN_PAUSED' : 'RUN_RESUMED',
            {},
          ),
        );
      }
    }
    if (previousMode !== this.#mode) {
      diagnostics.push(
        this.#diagnostic(command, 'SLOW_MOTION_AUDIO_MODE_CHANGED', {
          mode: this.#mode,
        }),
      );
    }
    diagnostics.push(
      this.#diagnostic(command, 'COMMAND_APPLIED', {
        commandId: command.commandId,
      }),
    );
    return { ...step, command, diagnostics };
  }
}

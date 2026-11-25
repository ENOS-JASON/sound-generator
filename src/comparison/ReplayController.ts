import type {
  DiagnosticEvent,
  DomainEvent,
} from '../contracts/events/index.ts';
import type {
  ClockSnapshot,
  SimulationClock,
} from '../core/clock/SimulationClock.ts';
import type { TelemetrySample } from '../diagnostics/DiagnosticsHub.ts';
import { TelemetryRegistry } from '../diagnostics/TelemetryRegistry.ts';
import { RECORDER_VERSION, TraceRecorder } from '../recording/TraceRecorder.ts';
import type {
  CaptureStats,
  RecordedTrace,
} from '../recording/TraceRecorder.ts';

const MAX_RECORDS = 65536;
const MAX_REPLAY_FRAMES = 10_000_000;
const MAX_REPLAY_TICKS = 100_000;

function index(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Validate parsed local recorder data; archive decoding belongs to AG-M0-13. */
function validateTrace(input: unknown): RecordedTrace {
  if (input === null || typeof input !== 'object') {
    throw new Error('invalid trace object');
  }
  const trace = input as RecordedTrace;
  if (trace.schemaVersion !== RECORDER_VERSION) {
    throw new Error('unsupported trace schema');
  }
  if (
    !Array.isArray(trace.channels) ||
    trace.channels.length > 4096 ||
    !Array.isArray(trace.chunks) ||
    trace.chunks.length > MAX_RECORDS ||
    !trace.start ||
    !trace.stats ||
    !['complete', 'incomplete'].includes(trace.status)
  ) {
    throw new Error('invalid trace structure');
  }

  const registry = new TelemetryRegistry(4096);
  for (const channel of trace.channels) {
    const definition = registry.register(channel);
    if (
      definition.fieldId !== channel.fieldId ||
      definition.schemaVersion !== channel.schemaVersion ||
      definition.aggregation !== channel.aggregation ||
      definition.privacyClass !== channel.privacyClass ||
      !Array.isArray(channel.allowedDisplayUnitIds) ||
      channel.allowedDisplayUnitIds.length !==
        definition.allowedDisplayUnitIds.length ||
      definition.allowedDisplayUnitIds.some(
        (unit, i) => unit !== channel.allowedDisplayUnitIds[i],
      )
    ) {
      throw new Error('incompatible telemetry catalog');
    }
  }
  const recorder = new TraceRecorder(registry, MAX_RECORDS, 128);
  recorder.start(trace.start);
  let count = 0;
  for (const chunk of trace.chunks) {
    if (!Array.isArray(chunk) || chunk.length < 1 || chunk.length > 1024) {
      throw new Error('invalid trace chunk');
    }
    count += chunk.length;
    if (count > MAX_RECORDS) throw new Error('trace exceeds record budget');
    for (const entry of chunk) {
      let result;
      switch (entry.kind) {
        case 'command':
          result = recorder.recordCommand(entry.value);
          break;
        case 'domain':
        case 'diagnostic':
          if (entry.value.category !== entry.kind) {
            throw new Error('trace event category mismatch');
          }
          result = recorder.recordEvent(entry.value);
          break;
        case 'telemetry':
          result = recorder.recordTelemetry(entry.value);
          break;
        default:
          throw new Error('unknown trace record kind');
      }
      if (result !== 'recorded') throw new Error('invalid trace record');
    }
  }

  const validated = recorder.stop();
  const keys = Object.keys(validated.stats) as (keyof CaptureStats)[];
  if (
    keys.some((key) => !index(trace.stats[key])) ||
    keys.some(
      (key) =>
        key !== 'dropped' &&
        key !== 'invalid' &&
        validated.stats[key] !== trace.stats[key],
    )
  ) {
    throw new Error('trace loss or count metadata mismatch');
  }
  const stats = Object.freeze({
    ...validated.stats,
    dropped: trace.stats.dropped,
    invalid: trace.stats.invalid,
  });
  const status = keys.some((key) => key !== 'recorded' && stats[key] > 0)
    ? 'incomplete'
    : 'complete';
  if (trace.status !== status) throw new Error('trace status mismatch');
  return Object.freeze({ ...validated, stats, status });
}

export interface ReplayRuntime<S extends object> {
  readonly clock: SimulationClock;
  readonly state: () => Readonly<S>;
}

export type ReplayFactory<S extends object> = (
  start: RecordedTrace['start'],
) => ReplayRuntime<S>;

export interface ReplayResult<S extends object> {
  readonly mode: 'deterministicResimulation';
  readonly clock: ClockSnapshot;
  readonly state: Readonly<S>;
  readonly domain: readonly DomainEvent[];
  readonly diagnostics: readonly DiagnosticEvent[];
}

export interface ReplayBoundary {
  readonly sampleFrame: number;
  readonly simulationTick: number;
}

/** A validated immutable source; seeking never touches a live solver. */
export class ReplayController {
  readonly trace: RecordedTrace;

  constructor(input: unknown) {
    this.trace = validateTrace(input);
  }

  telemetryAt(tick: number): readonly TelemetrySample[] {
    if (!index(tick)) throw new RangeError('invalid replay tick');
    const latest = new Map<string, TelemetrySample>();
    for (const chunk of this.trace.chunks) {
      for (const entry of chunk) {
        if (entry.kind === 'telemetry' && entry.value.simulationTick <= tick) {
          latest.set(entry.value.fieldId, entry.value);
        }
      }
    }
    return Object.freeze([...latest.values()]);
  }

  /**
   * The recorder v1 has no terminal checkpoint. The caller supplies the
   * observed endpoint; we do not infer it from the last sparse record.
   * Only a fresh compatible runtime with applied clock commands is supported.
   */
  resimulate<S extends object>(
    factory: ReplayFactory<S>,
    end: ReplayBoundary,
  ): ReplayResult<S> {
    const { start, status, chunks } = this.trace;
    if (
      status !== 'complete' ||
      start.initialClock.simulationTick !== 0 ||
      start.initialClock.sampleFrame !== 0 ||
      start.domainSequenceWatermark !== 0 ||
      start.diagnosticSequenceWatermark !== 0 ||
      !index(end.sampleFrame) ||
      end.sampleFrame > MAX_REPLAY_FRAMES ||
      !index(end.simulationTick) ||
      end.simulationTick > MAX_REPLAY_TICKS
    ) {
      throw new Error('incomplete or unsupported replay bounds/start');
    }
    const { clock, state } = factory(start);
    const initial = clock.snapshot();
    const keys = Object.keys(initial) as (keyof ClockSnapshot)[];
    if (keys.some((key) => initial[key] !== start.initialClock[key])) {
      throw new Error('incompatible initial clock');
    }
    const domain: DomainEvent[] = [];
    const diagnostics: DiagnosticEvent[] = [];
    function append(
      events: readonly DomainEvent[],
      control: readonly DiagnosticEvent[] = [],
    ) {
      if (
        domain.length + diagnostics.length + events.length + control.length >
        MAX_RECORDS
      ) {
        throw new Error('replay event budget exceeded');
      }
      domain.push(...events);
      diagnostics.push(...control);
    }
    function advanceTo(frame: number) {
      const current = clock.snapshot().sampleFrame;
      if (!index(frame) || frame < current || frame > end.sampleFrame) {
        throw new Error('regressing or out-of-range command frame');
      }
      let remaining = frame - current;
      while (remaining > 0) {
        const block = Math.min(remaining, 4096);
        append(clock.advanceFrames(block).events);
        if (clock.snapshot().simulationTick > end.simulationTick) {
          throw new Error('replay exceeds endpoint tick');
        }
        remaining -= block;
      }
    }

    for (const chunk of chunks) {
      for (const entry of chunk) {
        if (entry.kind !== 'command') {
          if (
            entry.value.simulationTick > end.simulationTick ||
            (entry.value.sampleFrame !== undefined &&
              entry.value.sampleFrame > end.sampleFrame)
          ) {
            throw new Error('endpoint precedes recorded observations');
          }
          continue;
        }
        const value = entry.value;
        const frame = value.targetSampleFrame;
        if (frame === undefined) {
          throw new Error('replay requires applied command frame');
        }
        advanceTo(frame);
        if (clock.snapshot().simulationTick !== value.targetSimulationTick) {
          throw new Error('command tick/frame mismatch');
        }
        const result = clock.applyControl(value);
        append(result.events, result.diagnostics);
        if (clock.snapshot().simulationTick > end.simulationTick) {
          throw new Error('replay exceeds endpoint tick');
        }
      }
    }
    advanceTo(end.sampleFrame);
    const final = clock.snapshot();
    if (final.simulationTick !== end.simulationTick) {
      throw new Error('replay endpoint tick mismatch');
    }
    return Object.freeze({
      mode: 'deterministicResimulation',
      clock: final,
      state: Object.freeze({ ...state() }),
      domain: Object.freeze(domain),
      diagnostics: Object.freeze(diagnostics),
    });
  }
}

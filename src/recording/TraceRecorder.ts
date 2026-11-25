import {
  validateCommand,
  validateDiagnosticEvent,
  validateDomainEvent,
} from '../contracts/events/index.ts';
import type {
  CommandEnvelope,
  DiagnosticEvent,
  DomainEvent,
} from '../contracts/events/index.ts';
import type { ClockSnapshot } from '../core/clock/SimulationClock.ts';
import type { TelemetrySample } from '../diagnostics/DiagnosticsHub.ts';
import {
  TELEMETRY_SCHEMA_VERSION,
  TelemetryRegistry,
} from '../diagnostics/TelemetryRegistry.ts';
import type { TelemetryChannelDefinition } from '../diagnostics/TelemetryRegistry.ts';

/** Local in-memory capture revision, not the future ADR-006 ZIP format. */
export const RECORDER_VERSION = 1 as const;

export interface CaptureStart {
  readonly initialClock: ClockSnapshot;
  readonly seed: number;
  readonly presetHash: string;
  readonly solverVersion: string;
  readonly domainSequenceWatermark: number;
  readonly diagnosticSequenceWatermark: number;
}

export type CaptureRecord =
  | { readonly kind: 'command'; readonly value: CommandEnvelope }
  | { readonly kind: 'domain'; readonly value: DomainEvent }
  | { readonly kind: 'diagnostic'; readonly value: DiagnosticEvent }
  | { readonly kind: 'telemetry'; readonly value: TelemetrySample };

export type RecordResult = 'recorded' | 'inactive' | 'overflow' | 'invalid';

export interface CaptureStats {
  readonly recorded: number;
  readonly dropped: number;
  readonly invalid: number;
  readonly domainGaps: number;
  readonly diagnosticGaps: number;
  readonly telemetryGaps: number;
  readonly upstreamLossEvents: number;
}

export interface RecordedTrace {
  readonly schemaVersion: typeof RECORDER_VERSION;
  readonly start: CaptureStart;
  readonly channels: readonly TelemetryChannelDefinition[];
  readonly chunks: readonly (readonly CaptureRecord[])[];
  readonly stats: CaptureStats;
  readonly status: 'complete' | 'incomplete';
}

interface Cursor {
  sequence: number;
  tick: number;
  time: number;
  frame: number | undefined;
}

function index(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function label(value: string): boolean {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

function emptyStats() {
  return {
    recorded: 0,
    dropped: 0,
    invalid: 0,
    domainGaps: 0,
    diagnosticGaps: 0,
    telemetryGaps: 0,
    upstreamLossEvents: 0,
  };
}

function copyStart(input: CaptureStart): CaptureStart {
  const c = input.initialClock;
  if (
    !/^[a-z][a-z0-9-]{0,63}$/.test(c.runId) ||
    !index(c.simulationTick) ||
    !Number.isFinite(c.simulationTimeSeconds) ||
    c.simulationTimeSeconds < 0 ||
    !index(c.sampleFrame) ||
    !index(c.sampleRate) ||
    c.sampleRate < 8000 ||
    c.sampleRate > 192000 ||
    !Number.isFinite(c.crankAngleRadians) ||
    !Number.isFinite(c.playbackScale) ||
    c.playbackScale < 0 ||
    c.playbackScale > 1 ||
    c.paused !== (c.playbackScale === 0) ||
    !['physical', 'pitch-preserved'].includes(c.slowMotionAudioMode) ||
    !index(c.phaseNumerator) ||
    !index(c.phaseDenominator) ||
    c.phaseDenominator === 0 ||
    c.phaseNumerator >= c.phaseDenominator ||
    !index(input.seed) ||
    !label(input.presetHash) ||
    !label(input.solverVersion) ||
    !index(input.domainSequenceWatermark) ||
    !index(input.diagnosticSequenceWatermark)
  ) {
    throw new Error('invalid capture start');
  }
  return Object.freeze({
    initialClock: Object.freeze({
      runId: c.runId,
      simulationTick: c.simulationTick,
      simulationTimeSeconds: c.simulationTimeSeconds,
      sampleFrame: c.sampleFrame,
      sampleRate: c.sampleRate,
      crankAngleRadians: c.crankAngleRadians,
      playbackScale: c.playbackScale,
      paused: c.paused,
      slowMotionAudioMode: c.slowMotionAudioMode,
      phaseNumerator: c.phaseNumerator,
      phaseDenominator: c.phaseDenominator,
    }),
    seed: input.seed,
    presetHash: input.presetHash,
    solverVersion: input.solverVersion,
    domainSequenceWatermark: input.domainSequenceWatermark,
    diagnosticSequenceWatermark: input.diagnosticSequenceWatermark,
  });
}

/**
 * Bounded, append-only consumer of already delivered local runtime data.
 * Call on the consumer side, never inside AudioWorklet.process().
 * No I/O, waiting, producer callbacks or mutation of authoritative state.
 */
export class TraceRecorder {
  readonly #registry: TelemetryRegistry;
  readonly #maxRecords: number;
  readonly #chunkSize: number;
  #start: CaptureStart | undefined;
  #channels: readonly TelemetryChannelDefinition[] = [];
  #catalog = new Map<string, TelemetryChannelDefinition>();
  #cursors = new Map<'domain' | 'diagnostic', Cursor>();
  #lastTelemetry = new Map<string, TelemetrySample>();
  #commandIds = new Set<string>();
  #chunks: (readonly CaptureRecord[])[] = [];
  #pending: CaptureRecord[] = [];
  #stats = emptyStats();

  constructor(registry: TelemetryRegistry, maxRecords = 4096, chunkSize = 128) {
    if (
      !index(maxRecords) ||
      maxRecords < 1 ||
      maxRecords > 65536 ||
      !index(chunkSize) ||
      chunkSize < 1 ||
      chunkSize > 1024 ||
      chunkSize > maxRecords
    ) {
      throw new RangeError('invalid recorder capacity or chunk size');
    }
    this.#registry = registry;
    this.#maxRecords = maxRecords;
    this.#chunkSize = chunkSize;
  }

  get active(): boolean {
    return this.#start !== undefined;
  }

  start(input: CaptureStart): void {
    if (this.active) throw new Error('capture already active');
    const start = copyStart(input);
    const clock = start.initialClock;
    this.#channels = this.#registry.list();
    this.#catalog = new Map(this.#channels.map((c) => [c.fieldId, c]));
    this.#cursors.clear();
    for (const category of ['domain', 'diagnostic'] as const) {
      this.#cursors.set(category, {
        sequence:
          category === 'domain'
            ? start.domainSequenceWatermark
            : start.diagnosticSequenceWatermark,
        tick: clock.simulationTick,
        time: clock.simulationTimeSeconds,
        frame: clock.sampleFrame,
      });
    }
    this.#lastTelemetry.clear();
    this.#commandIds.clear();
    this.#chunks = [];
    this.#pending = [];
    this.#stats = emptyStats();
    this.#start = start;
  }

  #ready(): RecordResult | undefined {
    if (!this.active) return 'inactive';
    if (this.#stats.recorded >= this.#maxRecords) {
      this.#stats.dropped++;
      return 'overflow';
    }
    return undefined;
  }

  #invalid(): 'invalid' {
    this.#stats.invalid++;
    return 'invalid';
  }

  #append(record: CaptureRecord): 'recorded' {
    this.#pending.push(Object.freeze(record));
    this.#stats.recorded++;
    if (this.#pending.length === this.#chunkSize) {
      this.#chunks.push(Object.freeze(this.#pending));
      this.#pending = [];
    }
    return 'recorded';
  }

  recordCommand(input: CommandEnvelope): RecordResult {
    const blocked = this.#ready();
    if (blocked) return blocked;
    try {
      const value = validateCommand(input);
      if (
        value.runId !== this.#start?.initialClock.runId ||
        this.#commandIds.has(value.commandId)
      ) {
        return this.#invalid();
      }
      this.#commandIds.add(value.commandId);
      return this.#append({ kind: 'command', value });
    } catch {
      return this.#invalid();
    }
  }

  recordEvent(input: DomainEvent | DiagnosticEvent): RecordResult {
    const blocked = this.#ready();
    if (blocked) return blocked;
    try {
      const event =
        input.category === 'domain'
          ? validateDomainEvent(input)
          : validateDiagnosticEvent(input);
      const cursor = this.#cursors.get(event.category);
      if (
        !cursor ||
        event.runId !== this.#start?.initialClock.runId ||
        event.sequence <= cursor.sequence ||
        event.simulationTick < cursor.tick ||
        event.simulationTimeSeconds < cursor.time ||
        (event.simulationTick === cursor.tick &&
          event.simulationTimeSeconds !== cursor.time) ||
        (event.sampleFrame !== undefined &&
          cursor.frame !== undefined &&
          event.sampleFrame < cursor.frame)
      ) {
        return this.#invalid();
      }
      const gap = event.sequence - cursor.sequence - 1;
      if (event.category === 'domain') {
        this.#stats.domainGaps += gap;
      } else {
        this.#stats.diagnosticGaps += gap;
        if (['EVENT_STREAM_GAP', 'QUEUE_OVERFLOW'].includes(event.type)) {
          this.#stats.upstreamLossEvents++;
        }
      }
      cursor.sequence = event.sequence;
      cursor.tick = event.simulationTick;
      cursor.time = event.simulationTimeSeconds;
      cursor.frame = event.sampleFrame ?? cursor.frame;
      return event.category === 'domain'
        ? this.#append({ kind: 'domain', value: event })
        : this.#append({ kind: 'diagnostic', value: event });
    } catch {
      return this.#invalid();
    }
  }

  /** Record accepted SI samples from the diagnostics consumer, not raw PCM. */
  recordTelemetry(input: TelemetrySample): RecordResult {
    const blocked = this.#ready();
    if (blocked) return blocked;
    const start = this.#start?.initialClock;
    const def = this.#catalog.get(input.fieldId);
    if (
      !start ||
      !def ||
      def.availability !== 'available' ||
      def.recorderRouting === 'none' ||
      input.schemaVersion !== TELEMETRY_SCHEMA_VERSION ||
      input.runId !== start.runId ||
      input.sourceComponentId !== def.componentId ||
      !index(input.simulationTick) ||
      input.simulationTick < start.simulationTick ||
      !Number.isFinite(input.simulationTimeSeconds) ||
      input.simulationTimeSeconds < start.simulationTimeSeconds ||
      (input.sampleFrame !== undefined &&
        (!index(input.sampleFrame) || input.sampleFrame < start.sampleFrame)) ||
      (input.crankAngleRadians !== undefined &&
        !Number.isFinite(input.crankAngleRadians)) ||
      !Number.isFinite(input.valueSI) ||
      (def.numericType === 'integer' && !Number.isSafeInteger(input.valueSI)) ||
      (def.pressureBasis === 'absolute' && input.valueSI < 0) ||
      (def.bounds !== undefined &&
        (input.valueSI < def.bounds.minSI || input.valueSI > def.bounds.maxSI))
    ) {
      return this.#invalid();
    }
    const sampleIndex =
      def.sampleClock === 'simulationTick'
        ? input.simulationTick
        : input.sampleFrame;
    if (sampleIndex === undefined) return this.#invalid();
    const previous = this.#lastTelemetry.get(input.fieldId);
    if (previous) {
      const previousIndex =
        def.sampleClock === 'simulationTick'
          ? previous.simulationTick
          : previous.sampleFrame;
      if (
        previousIndex === undefined ||
        sampleIndex - previousIndex < def.sampleInterval ||
        input.simulationTick < previous.simulationTick ||
        input.simulationTimeSeconds < previous.simulationTimeSeconds ||
        (input.simulationTick === previous.simulationTick &&
          input.simulationTimeSeconds !== previous.simulationTimeSeconds) ||
        (input.sampleFrame !== undefined &&
          previous.sampleFrame !== undefined &&
          input.sampleFrame < previous.sampleFrame)
      ) {
        return this.#invalid();
      }
      this.#stats.telemetryGaps +=
        Math.floor((sampleIndex - previousIndex) / def.sampleInterval) - 1;
    }
    const value: TelemetrySample = Object.freeze({
      schemaVersion: TELEMETRY_SCHEMA_VERSION,
      runId: input.runId,
      fieldId: input.fieldId,
      sourceComponentId: input.sourceComponentId,
      valueSI: input.valueSI,
      simulationTick: input.simulationTick,
      simulationTimeSeconds: input.simulationTimeSeconds,
      ...(input.sampleFrame === undefined
        ? {}
        : { sampleFrame: input.sampleFrame }),
      ...(input.crankAngleRadians === undefined
        ? {}
        : { crankAngleRadians: input.crankAngleRadians }),
    });
    this.#lastTelemetry.set(value.fieldId, value);
    return this.#append({ kind: 'telemetry', value });
  }

  stop(): RecordedTrace {
    const start = this.#start;
    if (!start) throw new Error('capture is not active');
    if (this.#pending.length > 0) {
      this.#chunks.push(Object.freeze(this.#pending));
    }
    const stats = Object.freeze({ ...this.#stats });
    const incomplete =
      stats.dropped > 0 ||
      stats.invalid > 0 ||
      stats.domainGaps > 0 ||
      stats.diagnosticGaps > 0 ||
      stats.telemetryGaps > 0 ||
      stats.upstreamLossEvents > 0;
    const trace: RecordedTrace = Object.freeze({
      schemaVersion: RECORDER_VERSION,
      start,
      channels: this.#channels,
      chunks: Object.freeze(this.#chunks),
      stats,
      status: incomplete ? 'incomplete' : 'complete',
    });
    this.#start = undefined;
    this.#channels = [];
    this.#catalog.clear();
    this.#cursors.clear();
    this.#lastTelemetry.clear();
    this.#commandIds.clear();
    this.#pending = [];
    this.#chunks = [];
    return trace;
  }
}

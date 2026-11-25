import type {
  DiagnosticEvent,
  DomainEvent,
} from '../contracts/events/index.ts';
import type { TelemetrySample } from '../diagnostics/DiagnosticsHub.ts';
import type { TelemetryChannelDefinition } from '../diagnostics/TelemetryRegistry.ts';
import type { ReplayController } from './ReplayController.ts';

type Event = DomainEvent | DiagnosticEvent;

export interface EventDelta {
  readonly sequence: number;
  readonly reason: 'missing-a' | 'missing-b' | 'changed';
  readonly tickDelta: number | null;
  readonly a: Event | null;
  readonly b: Event | null;
}

function payloadKey(event: Event): string {
  return JSON.stringify(
    Object.entries(event.payload).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    ),
  );
}

/** Compare one category's canonical sequence; playback frames are optional. */
export function compareEvents(
  a: readonly Event[],
  b: readonly Event[],
  includeAudioFrame = false,
): readonly EventDelta[] {
  const left = new Map(a.map((event) => [event.sequence, event]));
  const right = new Map(b.map((event) => [event.sequence, event]));
  if (left.size !== a.length || right.size !== b.length) {
    throw new Error('duplicate event sequence');
  }
  const keys = [...new Set([...left.keys(), ...right.keys()])].sort(
    (x, y) => x - y,
  );
  const result: EventDelta[] = [];
  for (const sequence of keys) {
    const x = left.get(sequence);
    const y = right.get(sequence);
    if (
      x &&
      y &&
      x.category === y.category &&
      x.type === y.type &&
      x.simulationTick === y.simulationTick &&
      x.simulationTimeSeconds === y.simulationTimeSeconds &&
      x.crankAngleRadians === y.crankAngleRadians &&
      x.sourceComponentId === y.sourceComponentId &&
      x.causationId === y.causationId &&
      x.correlationId === y.correlationId &&
      payloadKey(x) === payloadKey(y) &&
      (!includeAudioFrame || x.sampleFrame === y.sampleFrame)
    ) {
      continue;
    }
    result.push(
      Object.freeze({
        sequence,
        reason: !x ? 'missing-a' : !y ? 'missing-b' : 'changed',
        tickDelta: x && y ? y.simulationTick - x.simulationTick : null,
        a: x ?? null,
        b: y ?? null,
      }),
    );
  }
  return Object.freeze(result);
}

export interface SampleDelta {
  readonly at: number;
  readonly deltaSI: number;
}

export interface ChannelComparison {
  readonly fieldId: string;
  readonly unitId: string | null;
  readonly status: 'compared' | 'missing-channel' | 'incompatible';
  readonly matched: number;
  readonly missingA: number;
  readonly missingB: number;
  readonly maxAbsSI: number | null;
  readonly rmsSI: number | null;
  readonly differences: readonly SampleDelta[];
}

export interface TraceComparison {
  readonly status: 'comparable' | 'incomplete';
  readonly channels: readonly ChannelComparison[];
  readonly domainDeltas: readonly EventDelta[];
}

function compatible(
  a: TelemetryChannelDefinition,
  b: TelemetryChannelDefinition,
  sameSampleRate: boolean,
): boolean {
  return (
    a.quantityKind === b.quantityKind &&
    a.canonicalUnitId === b.canonicalUnitId &&
    a.pressureBasis === b.pressureBasis &&
    a.instrumentVersion === b.instrumentVersion &&
    a.numericType === b.numericType &&
    a.sampleClock === b.sampleClock &&
    (a.sampleClock !== 'sampleFrame' || sameSampleRate)
  );
}

function series(replay: ReplayController) {
  const values = new Map<string, TelemetrySample[]>();
  const events: DomainEvent[] = [];
  for (const chunk of replay.trace.chunks) {
    for (const entry of chunk) {
      if (entry.kind === 'domain') events.push(entry.value);
      if (entry.kind !== 'telemetry') continue;
      const key = entry.value.fieldId;
      const samples = values.get(key) ?? [];
      samples.push(entry.value);
      values.set(key, samples);
    }
  }
  return {
    catalog: new Map(replay.trace.channels.map((c) => [c.fieldId, c])),
    values,
    events,
  };
}

function aligned(
  samples: readonly TelemetrySample[],
  def: TelemetryChannelDefinition,
) {
  return new Map(
    samples.map((sample) => [
      def.sampleClock === 'simulationTick'
        ? sample.simulationTick
        : sample.sampleFrame!,
      sample.valueSI,
    ]),
  );
}

function compareChannel(
  id: string,
  a: ReturnType<typeof series>,
  b: ReturnType<typeof series>,
  sameSampleRate: boolean,
): ChannelComparison {
  const x = a.catalog.get(id);
  const y = b.catalog.get(id);
  const av = a.values.get(id) ?? [];
  const bv = b.values.get(id) ?? [];
  const missing = !x || !y;
  if (missing || !compatible(x, y, sameSampleRate)) {
    return Object.freeze({
      fieldId: id,
      unitId: null,
      status: missing ? 'missing-channel' : 'incompatible',
      matched: 0,
      missingA: missing && !x ? bv.length : 0,
      missingB: missing && !y ? av.length : 0,
      maxAbsSI: null,
      rmsSI: null,
      differences: Object.freeze([]),
    });
  }
  const left = aligned(av, x);
  const right = aligned(bv, y);
  const differences: SampleDelta[] = [];
  let missingA = 0;
  let missingB = 0;
  let maxAbs = 0;
  let scaledSquares = 0;
  for (const [at, value] of left) {
    const other = right.get(at);
    if (other === undefined) {
      missingB++;
      continue;
    }
    const deltaSI = other - value;
    if (!Number.isFinite(deltaSI)) {
      throw new RangeError('nonfinite comparison delta');
    }
    const magnitude = Math.abs(deltaSI);
    if (magnitude > maxAbs) {
      scaledSquares = scaledSquares * (maxAbs / magnitude) ** 2 + 1;
      maxAbs = magnitude;
    } else if (maxAbs > 0) {
      scaledSquares += (magnitude / maxAbs) ** 2;
    }
    differences.push(Object.freeze({ at, deltaSI }));
  }
  for (const at of right.keys()) {
    if (!left.has(at)) missingA++;
  }
  const matched = differences.length;
  return Object.freeze({
    fieldId: id,
    unitId: x.canonicalUnitId,
    status: 'compared',
    matched,
    missingA,
    missingB,
    maxAbsSI: matched ? maxAbs : null,
    rmsSI: matched ? maxAbs * Math.sqrt(scaledSquares / matched) : null,
    differences: Object.freeze(differences),
  });
}

/** Exact source-clock alignment, without interpolation or display conversion. */
export class ComparisonEngine {
  compare(a: ReplayController, b: ReplayController): TraceComparison {
    const left = series(a);
    const right = series(b);
    const ids = [...new Set([...left.catalog.keys(), ...right.catalog.keys()])];
    const sameSampleRate =
      a.trace.start.initialClock.sampleRate ===
      b.trace.start.initialClock.sampleRate;
    const channels = ids.map((id) =>
      compareChannel(id, left, right, sameSampleRate),
    );
    const incomplete =
      a.trace.status !== 'complete' ||
      b.trace.status !== 'complete' ||
      channels.some(
        (c) =>
          c.status !== 'compared' ||
          !c.matched ||
          c.missingA > 0 ||
          c.missingB > 0,
      );
    return Object.freeze({
      status: incomplete ? 'incomplete' : 'comparable',
      channels: Object.freeze(channels),
      domainDeltas: compareEvents(left.events, right.events),
    });
  }
}

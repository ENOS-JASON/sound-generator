import type { ReplayController } from '../comparison/ReplayController.ts';
import {
  displayUnitLabel,
  resolveDisplayUnit,
  toDisplayValue,
} from '../contracts/configurator/units.ts';
import type { UnitChoices } from '../contracts/configurator/units.ts';
import type {
  ClockReference,
  StateSnapshot,
} from '../contracts/events/index.ts';
import { radiansPerSecondToRpm } from '../contracts/units.ts';
import type {
  DiagnosticsHub,
  DiagnosticProjection,
} from './DiagnosticsHub.ts';
import type { TelemetryChannelDefinition } from './TelemetryRegistry.ts';

const RPM_VIEW_ID = 'engine.crank-rpm-view';

export type GraphSource =
  | {
      readonly kind: 'live';
      readonly hub: DiagnosticsHub;
      /** Read-only state projection, not a registered telemetry channel. */
      readonly readCrank?: () => StateSnapshot<{
        angularVelocityRadPerSecond: number;
      }>;
    }
  | { readonly kind: 'recorded'; readonly replay: ReplayController };

export interface GraphOptions {
  readonly fieldIds: readonly string[];
  readonly historyCapacity?: number;
  readonly maxPoints?: number;
  readonly unitChoices?: UnitChoices;
  readonly includeCrankRpm?: boolean;
}

export interface GraphWindow {
  readonly fromTick: number;
  readonly toTick: number;
  readonly cursorTick?: number;
}

interface Observation extends ClockReference {
  readonly runId: string;
  readonly valueSI: number;
}

export interface GraphPoint extends ClockReference {
  readonly valueSI: number;
  readonly displayValue: number;
}

export interface GraphSeries {
  readonly fieldId: string;
  readonly label: string;
  readonly origin: 'telemetry' | 'derived-state';
  readonly unitSI: string;
  readonly displayUnit: string;
  readonly availability: 'available' | 'unavailable';
  readonly points: readonly GraphPoint[];
  readonly cursor: GraphPoint | null;
  readonly sourceCount: number;
  readonly evicted: number;
  readonly observedGaps: number;
}

export interface GraphProjection {
  readonly source: GraphSource['kind'];
  readonly incompleteCapture: boolean;
  readonly series: readonly GraphSeries[];
}

interface History {
  samples: Observation[];
  evicted: number;
  gaps: number;
}

function integer(value: number, min: number, max: number): boolean {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}

/** Preserve endpoints and local extrema without fabricating samples. */
function reduce(
  points: readonly GraphPoint[],
  limit: number,
): readonly GraphPoint[] {
  if (points.length <= limit) return Object.freeze([...points]);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const buckets = Math.floor((limit - 2) / 2);
  if (buckets === 0) return Object.freeze([first, last]);
  const result: GraphPoint[] = [first];
  const interior = points.length - 2;
  for (let i = 0; i < buckets; i++) {
    const start = 1 + Math.floor((i * interior) / buckets);
    const end = 1 + Math.floor(((i + 1) * interior) / buckets);
    let low = start;
    let high = start;
    for (let j = start + 1; j < end; j++) {
      if (points[j]!.displayValue < points[low]!.displayValue) low = j;
      if (points[j]!.displayValue > points[high]!.displayValue) high = j;
    }
    result.push(points[Math.min(low, high)]!);
    if (low !== high) result.push(points[Math.max(low, high)]!);
  }
  result.push(last);
  return Object.freeze(result);
}

function point(sample: Observation, displayValue: number): GraphPoint {
  return Object.freeze({
    simulationTick: sample.simulationTick,
    simulationTimeSeconds: sample.simulationTimeSeconds,
    ...(sample.sampleFrame === undefined
      ? {}
      : { sampleFrame: sample.sampleFrame }),
    ...(sample.crankAngleRadians === undefined
      ? {}
      : { crankAngleRadians: sample.crankAngleRadians }),
    valueSI: sample.valueSI,
    displayValue,
  });
}

function snapshotChoices(choices: UnitChoices = {}): UnitChoices {
  return Object.freeze({
    quantityDefaults: Object.freeze({ ...choices.quantityDefaults }),
    perStatUnitIds: Object.freeze({ ...choices.perStatUnitIds }),
  });
}

/**
 * One consumer-owned graph session. The caller controls its refresh cadence.
 * No timers, producer subscriptions, DSP work or solver writes are performed.
 */
export class GraphInspector {
  #source: GraphSource | undefined;
  readonly #ids: readonly string[];
  readonly #capacity: number;
  readonly #maxPoints: number;
  readonly #includeCrank: boolean;
  readonly #history = new Map<string, History>();
  #choices: UnitChoices;
  #visible = true;
  #runId: string | undefined;

  constructor(source: GraphSource, options: GraphOptions) {
    const ids = [...options.fieldIds];
    const capacity = options.historyCapacity ?? 512;
    const maxPoints = options.maxPoints ?? 128;
    const includeCrank = options.includeCrankRpm ?? false;
    if (
      ids.length + Number(includeCrank) < 1 ||
      ids.length > 16 ||
      new Set(ids).size !== ids.length ||
      ids.includes(RPM_VIEW_ID) ||
      !integer(capacity, 2, 4096) ||
      !integer(maxPoints, 2, 1024) ||
      maxPoints > capacity ||
      (includeCrank && (source.kind !== 'live' || !source.readCrank))
    ) {
      throw new RangeError('invalid graph selection or capacity');
    }
    this.#source = source;
    this.#ids = Object.freeze(ids);
    this.#capacity = capacity;
    this.#maxPoints = maxPoints;
    this.#includeCrank = includeCrank;
    this.#choices = snapshotChoices(options.unitChoices);
  }

  setVisible(visible: boolean): void {
    this.#visible = visible;
  }

  setUnitChoices(choices: UnitChoices): void {
    this.#choices = snapshotChoices(choices);
  }

  close(): void {
    this.#source = undefined;
    this.#history.clear();
  }

  #store(
    id: string,
    observation: Observation,
    indexOf: (value: Observation) => number,
    interval: number,
  ): void {
    if (this.#runId !== undefined && observation.runId !== this.#runId) {
      throw new Error('graph observations belong to different runs');
    }
    this.#runId = observation.runId;
    const h = this.#history.get(id) ?? { samples: [], evicted: 0, gaps: 0 };
    const previous = h.samples[h.samples.length - 1];
    const index = indexOf(observation);
    if (previous) {
      const delta = index - indexOf(previous);
      if (delta < 0) throw new Error('regressing graph observation');
      if (delta === 0) return;
      h.gaps += Math.max(0, Math.floor(delta / interval) - 1);
    }
    if (h.samples.length === this.#capacity) {
      h.samples.shift();
      h.evicted++;
    }
    h.samples.push(observation);
    this.#history.set(id, h);
  }

  #live(projections: readonly DiagnosticProjection[]): void {
    for (const { definition: d, latest } of projections) {
      if (!latest) continue;
      this.#store(
        d.fieldId,
        latest,
        (v) =>
          d.sampleClock === 'simulationTick'
            ? v.simulationTick
            : v.sampleFrame!,
        d.sampleInterval,
      );
    }
  }

  #rpm(source: Extract<GraphSource, { kind: 'live' }>): void {
    const s = source.readCrank!();
    const omega = s.state.angularVelocityRadPerSecond;
    if (
      s.schemaVersion !== 1 ||
      s.category !== 'snapshot' ||
      !integer(s.simulationTick, 0, Number.MAX_SAFE_INTEGER) ||
      !Number.isFinite(s.simulationTimeSeconds) ||
      s.simulationTimeSeconds < 0 ||
      !Number.isFinite(omega) ||
      (s.sampleFrame !== undefined &&
        !integer(s.sampleFrame, 0, Number.MAX_SAFE_INTEGER))
    ) {
      throw new Error('invalid crank state projection');
    }
    const observation = Object.freeze({
      runId: s.runId,
      simulationTick: s.simulationTick,
      simulationTimeSeconds: s.simulationTimeSeconds,
      ...(s.sampleFrame === undefined ? {} : { sampleFrame: s.sampleFrame }),
      valueSI: omega,
    });
    // Read-only RPM graph projection. The quantity catalog does not yet
    // register angular velocity; do not forge a telemetry definition.
    this.#store(RPM_VIEW_ID, observation, (v) => v.simulationTick, 1);
  }

  #project(
    info: Omit<GraphSeries, 'points' | 'cursor' | 'sourceCount'>,
    samples: readonly Observation[],
    convert: (value: number) => number,
    window: GraphWindow,
  ): GraphSeries {
    const visible = samples.filter(
      (s) =>
        s.simulationTick >= window.fromTick &&
        s.simulationTick <= window.toTick,
    );
    const points = visible.map((s) => point(s, convert(s.valueSI)));
    let cursor: GraphPoint | null = null;
    if (window.cursorTick !== undefined) {
      for (const p of points) {
        if (p.simulationTick <= window.cursorTick) cursor = p;
        else break;
      }
    }
    return Object.freeze({
      ...info,
      points: reduce(points, this.#maxPoints),
      cursor,
      sourceCount: points.length,
    });
  }

  #series(
    d: TelemetryChannelDefinition,
    h: History,
    window: GraphWindow,
  ): GraphSeries {
    const unit = resolveDisplayUnit(d, this.#choices);
    return this.#project(
      {
        fieldId: d.fieldId,
        label: d.label,
        origin: 'telemetry',
        unitSI: d.canonicalUnitId,
        displayUnit: displayUnitLabel(d, unit),
        availability: d.availability,
        evicted: h.evicted,
        observedGaps: h.gaps,
      },
      h.samples,
      (value) => toDisplayValue(value, d, unit),
      window,
    );
  }

  refresh(
    window: GraphWindow = {
      fromTick: 0,
      toTick: Number.MAX_SAFE_INTEGER,
    },
  ): GraphProjection | null {
    const source = this.#source;
    if (!source || !this.#visible) return null;
    if (
      !integer(window.fromTick, 0, Number.MAX_SAFE_INTEGER) ||
      !integer(window.toTick, window.fromTick, Number.MAX_SAFE_INTEGER) ||
      (window.cursorTick !== undefined &&
        !integer(window.cursorTick, window.fromTick, window.toTick))
    ) {
      throw new RangeError('invalid graph window or cursor');
    }

    const series: GraphSeries[] = [];
    const empty = () => ({ samples: [], evicted: 0, gaps: 0 });
    if (source.kind === 'live') {
      const projections = source.hub.read({ fieldIds: this.#ids });
      this.#live(projections);
      for (const { definition: d } of projections) {
        series.push(
          this.#series(d, this.#history.get(d.fieldId) ?? empty(), window),
        );
      }
      if (this.#includeCrank) {
        this.#rpm(source);
        const h = this.#history.get(RPM_VIEW_ID) ?? empty();
        series.push(
          this.#project(
            {
              fieldId: RPM_VIEW_ID,
              label: 'Crank RPM (derived)',
              origin: 'derived-state',
              unitSI: 'rad/s',
              displayUnit: 'rpm',
              availability: 'available',
              evicted: h.evicted,
              observedGaps: h.gaps,
            },
            h.samples,
            radiansPerSecondToRpm,
            window,
          ),
        );
      }
    } else {
      const trace = source.replay.trace;
      const histories = new Map<string, History>();
      const catalog = new Map(trace.channels.map((d) => [d.fieldId, d]));
      for (const id of this.#ids) {
        if (!catalog.has(id)) throw new Error('unknown graph channel: ' + id);
        histories.set(id, empty());
      }
      for (const chunk of trace.chunks) {
        for (const entry of chunk) {
          if (entry.kind !== 'telemetry') continue;
          const h = histories.get(entry.value.fieldId);
          if (h) h.samples.push(entry.value);
        }
      }
      for (const [id, h] of histories) {
        const d = catalog.get(id)!;
        for (let i = 1; i < h.samples.length; i++) {
          const a = h.samples[i - 1]!;
          const b = h.samples[i]!;
          const delta =
            d.sampleClock === 'simulationTick'
              ? b.simulationTick - a.simulationTick
              : b.sampleFrame! - a.sampleFrame!;
          h.gaps += Math.max(0, Math.floor(delta / d.sampleInterval) - 1);
        }
        series.push(this.#series(d, h, window));
      }
    }
    return Object.freeze({
      source: source.kind,
      incompleteCapture:
        source.kind === 'recorded' &&
        source.replay.trace.status === 'incomplete',
      series: Object.freeze(series),
    });
  }
}

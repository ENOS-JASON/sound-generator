import type { QuantityKind } from '../contracts/configurator/units.ts';
import type { ClockReference } from '../contracts/events/index.ts';
import {
  TELEMETRY_SCHEMA_VERSION,
  TelemetryRegistry,
} from './TelemetryRegistry.ts';
import type {
  TelemetryChannelDefinition,
  TelemetryClock,
} from './TelemetryRegistry.ts';

export interface TelemetrySample extends ClockReference {
  readonly schemaVersion: typeof TELEMETRY_SCHEMA_VERSION;
  readonly runId: string;
  readonly sourceComponentId: string;
  readonly fieldId: string;
  readonly valueSI: number;
}

export interface DiagnosticProjection {
  readonly definition: TelemetryChannelDefinition;
  readonly latest: TelemetrySample | null;
  readonly accepted: number;
  readonly rateLimited: number;
  /** Missed sampling opportunities relative to the last accepted sample. */
  readonly missedIntervals: number;
}

export interface DiagnosticFilter {
  readonly componentId?: string;
  readonly fieldIds?: readonly string[];
  readonly quantityKind?: QuantityKind;
  readonly sampleClock?: TelemetryClock;
  readonly includeUnavailable?: boolean;
}

interface ChannelState {
  latest: TelemetrySample;
  lastSeen: ClockReference;
  lastFrame: number | undefined;
  accepted: number;
  rateLimited: number;
  missedIntervals: number;
}

function validIndex(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function sourceIndex(sample: ClockReference, clock: TelemetryClock): number {
  if (clock === 'simulationTick') return sample.simulationTick;
  if (sample.sampleFrame === undefined) {
    throw new Error('audio-clock telemetry requires a sample frame');
  }
  return sample.sampleFrame;
}

/**
 * One run, one latest accepted observation per registered channel.
 * Producers publish data only. Readers pull immutable filtered projections;
 * no subscriber code is invoked on a solver/audio publishing path.
 */
export class DiagnosticsHub {
  readonly #registry: TelemetryRegistry;
  readonly #runId: string;
  readonly #states = new Map<string, ChannelState>();

  constructor(registry: TelemetryRegistry, runId: string) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(runId)) {
      throw new Error('invalid telemetry run ID');
    }
    this.#registry = registry;
    this.#runId = runId;
  }

  publish(input: TelemetrySample): 'accepted' | 'rate-limited' {
    const definition = this.#registry.require(input.fieldId);
    if (
      input.schemaVersion !== TELEMETRY_SCHEMA_VERSION ||
      input.runId !== this.#runId ||
      input.sourceComponentId !== definition.componentId ||
      definition.availability !== 'available'
    ) {
      throw new Error('invalid telemetry version, run, owner or availability');
    }
    if (
      !validIndex(input.simulationTick) ||
      !Number.isFinite(input.simulationTimeSeconds) ||
      input.simulationTimeSeconds < 0 ||
      (input.sampleFrame !== undefined && !validIndex(input.sampleFrame)) ||
      (input.crankAngleRadians !== undefined &&
        !Number.isFinite(input.crankAngleRadians))
    ) {
      throw new RangeError('invalid telemetry clock reference');
    }
    if (
      !Number.isFinite(input.valueSI) ||
      (definition.numericType === 'integer' &&
        !Number.isSafeInteger(input.valueSI)) ||
      (definition.quantityKind === 'pressure' &&
        definition.pressureBasis === 'absolute' &&
        input.valueSI < 0) ||
      (definition.bounds !== undefined &&
        (input.valueSI < definition.bounds.minSI ||
          input.valueSI > definition.bounds.maxSI))
    ) {
      throw new RangeError('invalid telemetry SI value');
    }
    const index = sourceIndex(input, definition.sampleClock);
    const previous = this.#states.get(input.fieldId);
    if (
      previous &&
      (input.simulationTick < previous.lastSeen.simulationTick ||
        input.simulationTimeSeconds < previous.lastSeen.simulationTimeSeconds ||
        (input.simulationTick === previous.lastSeen.simulationTick &&
          input.simulationTimeSeconds !==
            previous.lastSeen.simulationTimeSeconds) ||
        (input.sampleFrame !== undefined &&
          previous.lastFrame !== undefined &&
          input.sampleFrame < previous.lastFrame))
    ) {
      throw new Error('regressing or inconsistent telemetry clock');
    }
    const observation: TelemetrySample = Object.freeze({
      schemaVersion: TELEMETRY_SCHEMA_VERSION,
      runId: input.runId,
      sourceComponentId: input.sourceComponentId,
      fieldId: input.fieldId,
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
    if (previous) {
      const delta =
        index - sourceIndex(previous.latest, definition.sampleClock);
      previous.lastSeen = observation;
      previous.lastFrame = observation.sampleFrame ?? previous.lastFrame;
      if (delta < definition.sampleInterval) {
        previous.rateLimited++;
        return 'rate-limited';
      }
      previous.missedIntervals +=
        Math.floor(delta / definition.sampleInterval) - 1;
      previous.accepted++;
      previous.latest = observation;
    } else {
      this.#states.set(input.fieldId, {
        latest: observation,
        lastSeen: observation,
        lastFrame: observation.sampleFrame,
        accepted: 1,
        rateLimited: 0,
        missedIntervals: 0,
      });
    }
    return 'accepted';
  }

  read(filter: DiagnosticFilter = {}): readonly DiagnosticProjection[] {
    const ids = filter.fieldIds;
    for (const id of ids ?? []) this.#registry.require(id);
    return Object.freeze(
      this.#registry
        .list()
        .filter(
          (definition) =>
            (ids === undefined || ids.includes(definition.fieldId)) &&
            (filter.componentId === undefined ||
              definition.componentId === filter.componentId) &&
            (filter.quantityKind === undefined ||
              definition.quantityKind === filter.quantityKind) &&
            (filter.sampleClock === undefined ||
              definition.sampleClock === filter.sampleClock) &&
            (filter.includeUnavailable !== false ||
              definition.availability === 'available'),
        )
        .map((definition) => {
          const state = this.#states.get(definition.fieldId);
          return Object.freeze({
            definition,
            latest: state?.latest ?? null,
            accepted: state?.accepted ?? 0,
            rateLimited: state?.rateLimited ?? 0,
            missedIntervals: state?.missedIntervals ?? 0,
          });
        }),
    );
  }

  /** Pull-only subscription. The hub retains no callbacks or UI references. */
  subscribe(
    filter: DiagnosticFilter = {},
  ): () => readonly DiagnosticProjection[] {
    const captured = Object.freeze({
      ...filter,
      ...(filter.fieldIds === undefined
        ? {}
        : { fieldIds: Object.freeze([...filter.fieldIds]) }),
    });
    return () => this.read(captured);
  }
}

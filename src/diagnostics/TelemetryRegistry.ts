import { quantityField } from '../contracts/configurator/units.ts';
import type {
  QuantityField,
  QuantityKind,
  PressureBasis,
} from '../contracts/configurator/units.ts';

export const TELEMETRY_SCHEMA_VERSION = 1 as const;

export type TelemetryClock = 'simulationTick' | 'sampleFrame';

export interface TelemetryRegistration {
  readonly componentId: string;
  readonly channelId: string;
  readonly label: string;
  readonly quantityKind: QuantityKind;
  readonly canonicalUnitId: string;
  readonly pressureBasis?: PressureBasis;
  readonly numericType: 'float64' | 'integer';
  readonly availability: 'available' | 'unavailable';
  readonly sampleClock: TelemetryClock;
  /** Minimum interval in units of the selected source clock. */
  readonly sampleInterval: number;
  readonly bounds?: Readonly<{ minSI: number; maxSI: number }>;
  readonly precisionDigits?: number;
  readonly instrumentVersion: number;
  readonly performanceClass: 'normal' | 'high-rate';
  readonly recorderRouting: 'none' | 'standard' | 'deep';
}

/** The stable fieldId is also the per-stat display-unit preference key. */
export interface TelemetryChannelDefinition
  extends QuantityField, TelemetryRegistration {
  readonly schemaVersion: typeof TELEMETRY_SCHEMA_VERSION;
  readonly aggregation: 'latest';
  readonly privacyClass: 'local-only';
}

function positiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function validId(id: string): boolean {
  return typeof id === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(id);
}

/** A bounded catalog of immutable definitions, not a second unit registry. */
export class TelemetryRegistry {
  readonly #capacity: number;
  readonly #entries = new Map<string, TelemetryChannelDefinition>();

  constructor(capacity = 256) {
    if (!positiveInteger(capacity) || capacity > 4096) {
      throw new RangeError('invalid telemetry channel capacity');
    }
    this.#capacity = capacity;
  }

  register(input: TelemetryRegistration): TelemetryChannelDefinition {
    if (!validId(input.componentId) || !validId(input.channelId)) {
      throw new Error('invalid telemetry component or channel ID');
    }
    const fieldId = input.componentId + '.' + input.channelId;
    if (this.#entries.has(fieldId)) {
      throw new Error('duplicate telemetry channel: ' + fieldId);
    }
    if (this.#entries.size >= this.#capacity) {
      throw new RangeError('telemetry channel capacity exceeded');
    }
    const field = quantityField(
      fieldId,
      input.quantityKind,
      input.pressureBasis,
    );
    if (input.canonicalUnitId !== field.canonicalUnitId) {
      throw new RangeError('invalid canonical SI unit: ' + fieldId);
    }
    if (
      typeof input.label !== 'string' ||
      !input.label.trim() ||
      input.label.length > 128 ||
      !['float64', 'integer'].includes(input.numericType) ||
      !['available', 'unavailable'].includes(input.availability) ||
      !['simulationTick', 'sampleFrame'].includes(input.sampleClock) ||
      !positiveInteger(input.sampleInterval) ||
      !positiveInteger(input.instrumentVersion) ||
      !['normal', 'high-rate'].includes(input.performanceClass) ||
      !['none', 'standard', 'deep'].includes(input.recorderRouting)
    ) {
      throw new Error('invalid telemetry metadata: ' + fieldId);
    }
    const bounds = input.bounds;
    if (
      bounds !== undefined &&
      (!Number.isFinite(bounds.minSI) ||
        !Number.isFinite(bounds.maxSI) ||
        bounds.minSI > bounds.maxSI)
    ) {
      throw new RangeError('invalid telemetry SI bounds: ' + fieldId);
    }
    const precision = input.precisionDigits;
    if (
      precision !== undefined &&
      (!Number.isInteger(precision) || precision < 0 || precision > 15)
    ) {
      throw new RangeError('invalid telemetry display precision: ' + fieldId);
    }
    const definition: TelemetryChannelDefinition = Object.freeze({
      ...field,
      allowedDisplayUnitIds: Object.freeze([...field.allowedDisplayUnitIds]),
      schemaVersion: TELEMETRY_SCHEMA_VERSION,
      componentId: input.componentId,
      channelId: input.channelId,
      label: input.label,
      numericType: input.numericType,
      availability: input.availability,
      sampleClock: input.sampleClock,
      sampleInterval: input.sampleInterval,
      ...(bounds === undefined
        ? {}
        : {
            bounds: Object.freeze({
              minSI: bounds.minSI,
              maxSI: bounds.maxSI,
            }),
          }),
      ...(precision === undefined ? {} : { precisionDigits: precision }),
      instrumentVersion: input.instrumentVersion,
      performanceClass: input.performanceClass,
      recorderRouting: input.recorderRouting,
      aggregation: 'latest',
      privacyClass: 'local-only',
    });
    this.#entries.set(fieldId, definition);
    return definition;
  }

  require(fieldId: string): TelemetryChannelDefinition {
    const definition = this.#entries.get(fieldId);
    if (!definition) throw new Error('unknown telemetry channel: ' + fieldId);
    return definition;
  }

  list(): readonly TelemetryChannelDefinition[] {
    return Object.freeze([...this.#entries.values()]);
  }
}

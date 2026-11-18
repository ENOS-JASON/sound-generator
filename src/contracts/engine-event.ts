/** Structural envelope only: AG-M0-09 owns typed event/command maps and ordering. */
export const ENGINE_EVENT_ENVELOPE_VERSION = 2 as const;
export type EventJsonValue =
  | null
  | boolean
  | number
  | string
  | EventJsonValue[]
  | { [key: string]: EventJsonValue };

export interface EngineEventEnvelopeV2 {
  schemaVersion: typeof ENGINE_EVENT_ENVELOPE_VERSION;
  runId: string;
  sequence: number;
  simulationTick: number;
  simulationTimeSeconds: number;
  type: string;
  sourceComponentId: string;
  causationId: string | null;
  correlationId: string | null;
  payload: { [key: string]: EventJsonValue };
}

export function validateEngineEventEnvelopeV2(input: unknown): EngineEventEnvelopeV2 {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('event: expected object');
  }
  const event = input as Record<string, unknown>;
  const fields = [
    'schemaVersion', 'runId', 'sequence', 'simulationTick', 'simulationTimeSeconds',
    'type', 'sourceComponentId', 'causationId', 'correlationId', 'payload',
  ];
  if (Object.keys(event).some((key) => !fields.includes(key)) ||
      fields.some((key) => !Object.hasOwn(event, key))) {
    throw new Error('event: unexpected or missing field');
  }
  if (event.schemaVersion !== 2) throw new Error('event.schemaVersion: expected 2');
  for (const key of ['runId', 'sourceComponentId']) {
    if (typeof event[key] !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(event[key])) {
      throw new Error(`event.${key}: invalid identifier`);
    }
  }
  if (typeof event.type !== 'string' || !/^[A-Z][A-Z0-9_]{0,63}$/.test(event.type)) {
    throw new Error('event.type: invalid type identifier');
  }
  for (const key of ['sequence', 'simulationTick']) {
    if (typeof event[key] !== 'number' || !Number.isSafeInteger(event[key]) ||
        event[key] < (key === 'sequence' ? 1 : 0)) {
      throw new Error(`event.${key}: invalid integer`);
    }
  }
  if (typeof event.simulationTimeSeconds !== 'number' ||
      !Number.isFinite(event.simulationTimeSeconds) || event.simulationTimeSeconds < 0) {
    throw new Error('event.simulationTimeSeconds: invalid time');
  }
  for (const key of ['causationId', 'correlationId']) {
    if (event[key] !== null && (typeof event[key] !== 'string' ||
        event[key].length < 1 || event[key].length > 128)) {
      throw new Error(`event.${key}: invalid id`);
    }
  }
  const seen = new WeakSet<object>();
  function json(value: unknown, depth = 0): void {
    if (depth > 16) throw new Error('event.payload: excessive nesting');
    if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (typeof value !== 'object') throw new Error('event.payload: invalid JSON value');
    if (seen.has(value)) throw new Error('event.payload: circular JSON value');
    seen.add(value);
    if (Array.isArray(value)) {
      if (value.length > 1024) throw new Error('event.payload: too many elements');
      value.forEach((item) => json(item, depth + 1));
    } else {
      if (Object.getPrototypeOf(value) !== Object.prototype &&
          Object.getPrototypeOf(value) !== null) throw new Error('event.payload: invalid object');
      const entries = Object.entries(value);
      if (entries.length > 256) throw new Error('event.payload: too many fields');
      for (const [key, item] of entries) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) {
          throw new Error('event.payload: unsafe property');
        }
        json(item, depth + 1);
      }
    }
    seen.delete(value);
  }
  if (event.payload === null || typeof event.payload !== 'object' ||
      Array.isArray(event.payload)) throw new Error('event.payload: expected object');
  json(event.payload);
  return event as unknown as EngineEventEnvelopeV2;
}

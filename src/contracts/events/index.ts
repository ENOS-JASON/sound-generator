import { validateEngineEventEnvelopeV2 } from '../engine-event.ts';
import type { EngineEventEnvelopeV2 } from '../engine-event.ts';

/** ADR-004 proposal: v2 remains the structural import format. */
export const EVENT_VERSION = 3 as const;
export const COMMAND_VERSION = 1 as const;

type Rule<T> = (value: unknown) => value is T;
type Fields = Readonly<Record<string, Rule<unknown>>>;
type Payload<S extends Fields> = keyof S extends never
  ? Readonly<Record<string, never>>
  : { readonly [K in keyof S]: S[K] extends Rule<infer T> ? T : never };

const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const nonnegative = (v: unknown): v is number => finite(v) && v >= 0;
const positive = (v: unknown): v is number => finite(v) && v > 0;
const tick = (v: unknown): v is number =>
  nonnegative(v) && Number.isSafeInteger(v);
const count = (v: unknown): v is number => tick(v) && v > 0;
const fraction = (v: unknown): v is number => nonnegative(v) && v <= 1;
const cylinderId = (v: unknown): v is number => count(v) && v <= 12;
const gear = (v: unknown): v is number =>
  finite(v) && Number.isSafeInteger(v) && v >= -1;
const text = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= 128;
const id = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(v);
const flag = (v: unknown): v is boolean => typeof v === 'boolean';
const traceId = (v: unknown): v is string | null => v === null || text(v);
const audioMode = (v: unknown): v is 'physical' | 'pitch-preserved' =>
  v === 'physical' || v === 'pitch-preserved';

export type DomainOwner =
  | 'engine'
  | 'starter'
  | 'cylinder'
  | 'ecu'
  | 'drivetrain'
  | 'exhaust'
  | 'induction'
  | 'electrical';

function owned<R extends DomainOwner, S extends Fields>(role: R, fields: S) {
  return { role, fields } as const;
}

/** Only the physical component owning a transition may publish that fact. */
const domainCatalog = {
  KEY_ON: owned('engine', {}),
  KEY_OFF: owned('engine', {}),
  STARTER_ENGAGED: owned('starter', { starterTorqueNm: finite }),
  STARTER_DISENGAGED: owned('starter', {}),
  CRANKING: owned('engine', {}),
  FIRST_FIRE: owned('cylinder', { cylinderId }),
  ENGINE_RUNNING: owned('engine', {}),
  FAILED_START: owned('engine', { reason: text }),
  ENGINE_STALLING: owned('engine', {}),
  ENGINE_STALLED: owned('engine', {}),
  ENGINE_STOPPING: owned('engine', {}),
  ENGINE_OFF: owned('engine', {}),
  COMBUSTION: owned('cylinder', { cylinderId }),
  MISFIRE: owned('cylinder', { cylinderId }),
  IGNITION_CUT: owned('cylinder', { cylinderId }),
  FUEL_CUT: owned('cylinder', { cylinderId }),
  VALVE_EVENT: owned('cylinder', { cylinderId, valve: text, open: flag }),
  LIMITER_ENTER: owned('ecu', {}),
  LIMITER_EXIT: owned('ecu', {}),
  FUEL_CUT_ENTER: owned('ecu', {}),
  FUEL_CUT_EXIT: owned('ecu', {}),
  LAUNCH_CONTROL_ENTER: owned('ecu', {}),
  LAUNCH_CONTROL_EXIT: owned('ecu', {}),
  CLUTCH_ENGAGED: owned('drivetrain', {}),
  CLUTCH_SLIPPING: owned('drivetrain', {}),
  GEAR_SHIFT_STARTED: owned('drivetrain', { gear }),
  GEAR_CHANGED: owned('drivetrain', { gear }),
  SHIFT_COMPLETED: owned('drivetrain', { gear }),
  SLIP_ENTER: owned('drivetrain', {}),
  SLIP_EXIT: owned('drivetrain', {}),
  TRACTION_LOST: owned('drivetrain', {}),
  TRACTION_REGAINED: owned('drivetrain', {}),
  AFTERFIRE: owned('exhaust', {}),
  TURBO_WASTEGATE_OPEN: owned('induction', {}),
  BLOW_OFF: owned('induction', {}),
  BATTERY_VOLTAGE_LOW: owned('electrical', { voltageVolts: nonnegative }),
  STARTER_ENGAGEMENT_FAILED: owned('starter', { reason: text }),
  STARTER_OVERHEATED: owned('starter', { temperatureKelvin: nonnegative }),
  CHARGING_FAILED: owned('electrical', { reason: text }),
  INTAKE_BACKFIRE: owned('induction', {}),
  BOOST_LIMITED: owned('induction', {}),
  WASTEGATE_CHANGED: owned('induction', { opening: fraction }),
  CONVERTER_LOCKED: owned('drivetrain', {}),
  TRANSFER_CASE_MODE_CHANGED: owned('drivetrain', { mode: text }),
  DIFF_LOCK_CHANGED: owned('drivetrain', { locked: flag }),
} as const;

export type EventMap = {
  readonly [K in keyof typeof domainCatalog]: Payload<
    (typeof domainCatalog)[K]['fields']
  >;
};
export type EventType = keyof EventMap;

const eventType = (v: unknown): v is EventType =>
  typeof v === 'string' && Object.hasOwn(domainCatalog, v);

const diagnosticCatalog = {
  ENGINE_RESET: {},
  RUN_PAUSED: {},
  RUN_RESUMED: {},
  CLOCK_SCALE_CHANGED: { playbackScale: nonnegative },
  SLOW_MOTION_AUDIO_MODE_CHANGED: { mode: audioMode },
  COMMAND_ACCEPTED: { commandId: text },
  COMMAND_APPLIED: { commandId: text },
  COMMAND_REJECTED: { commandId: text, reason: text },
  QUEUE_OVERFLOW: { reason: text },
  EVENT_STREAM_GAP: { reason: text },
  AUDIO_UNDERRUN: { droppedFrames: count },
  PROFILE_ACTIVATED: { profileHash: text },
  WORKER_READY: {},
  LATE_COMMAND: { commandId: text },
  UNSUPPORTED_FEATURE: { reason: text },
} as const;

export type DiagnosticMap = {
  readonly [K in keyof typeof diagnosticCatalog]: Payload<
    (typeof diagnosticCatalog)[K]
  >;
};
export type DiagnosticType = keyof DiagnosticMap;

const commandCatalog = {
  SET_IGNITION: { on: flag },
  SET_STARTER: { engaged: flag },
  SET_THROTTLE: { fraction },
  SET_CLUTCH: { fraction },
  SHIFT_GEAR: { gear },
  SET_BRAKE: { fraction },
  RESET: {},
  APPLY_TUNE: { tuneId: id },
  ACTIVATE_PROFILE: { profileHash: text },
  SET_TIME_SCALE: { playbackScale: nonnegative },
  PAUSE: {},
  RESUME: {},
  STEP_TICKS: { count },
  STEP_TO_CRANK_ANGLE: { angleDeltaRadians: positive, maxTicks: count },
  STEP_UNTIL_EVENT: { eventType, maxTicks: count },
  SET_SLOW_MOTION_AUDIO_MODE: { mode: audioMode },
} as const;

export type CommandMap = {
  readonly [K in keyof typeof commandCatalog]: Payload<
    (typeof commandCatalog)[K]
  >;
};
export type CommandType = keyof CommandMap;

export interface ClockReference {
  readonly simulationTick: number;
  readonly simulationTimeSeconds: number;
  readonly sampleFrame?: number;
  readonly crankAngleRadians?: number;
}

interface EventHeader extends ClockReference {
  readonly schemaVersion: typeof EVENT_VERSION;
  readonly runId: string;
  /** Sequence is local to this run and category; domain has one total order. */
  readonly sequence: number;
  readonly sourceComponentId: string;
  readonly causationId: string | null;
  readonly correlationId: string | null;
}

export type DomainEvent<K extends EventType = EventType> = {
  [T in K]: EventHeader & {
    readonly category: 'domain';
    readonly type: T;
    readonly payload: EventMap[T];
  };
}[K];

export type DiagnosticEvent<K extends DiagnosticType = DiagnosticType> = {
  [T in K]: EventHeader & {
    readonly category: 'diagnostic';
    readonly type: T;
    readonly payload: DiagnosticMap[T];
  };
}[K];

export type CommandOrigin = 'ui' | 'scenario' | 'automation' | 'subscriber';

export type CommandEnvelope<K extends CommandType = CommandType> = {
  [T in K]: {
    readonly schemaVersion: typeof COMMAND_VERSION;
    readonly category: 'command';
    readonly runId: string;
    readonly commandId: string;
    readonly origin: CommandOrigin;
    readonly targetSimulationTick: number;
    readonly targetSampleFrame?: number;
    readonly causationId: string | null;
    readonly correlationId: string | null;
    readonly type: T;
    readonly payload: CommandMap[T];
  };
}[K];

/** A replaceable observation, never a source of authoritative mutations. */
export interface StateSnapshot<T extends object> extends ClockReference {
  readonly schemaVersion: 1;
  readonly category: 'snapshot';
  readonly runId: string;
  readonly domainSequenceWatermark: number;
  readonly state: Readonly<T>;
}

function record(value: unknown): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    throw new Error('expected plain object');
  }
  return value as Record<string, unknown>;
}

function validateFields(value: unknown, fields: Fields): void {
  const object = record(value);
  if (
    Object.keys(object).some((key) => !Object.hasOwn(fields, key)) ||
    Object.entries(fields).some(
      ([key, rule]) => !Object.hasOwn(object, key) || !rule(object[key]),
    )
  ) {
    throw new Error('invalid payload fields');
  }
}

function validateEvent(
  input: unknown,
  category: 'domain' | 'diagnostic',
): DomainEvent | DiagnosticEvent {
  const object = record(input);
  if (object.schemaVersion !== EVENT_VERSION || object.category !== category) {
    throw new Error('invalid event version or category');
  }
  const { sampleFrame, crankAngleRadians, ...structural } = object;
  delete structural.category;
  // Reuse the accepted strict v2 envelope validator without altering v2.
  const base = validateEngineEventEnvelopeV2({
    ...structural,
    schemaVersion: 2,
  });
  if (
    (Object.hasOwn(object, 'sampleFrame') && !tick(sampleFrame)) ||
    (Object.hasOwn(object, 'crankAngleRadians') && !finite(crankAngleRadians))
  ) {
    throw new Error('invalid event clock reference');
  }
  if (category === 'domain') {
    if (!eventType(base.type)) throw new Error('unknown domain event');
    validateFields(base.payload, domainCatalog[base.type].fields);
  } else {
    if (!Object.hasOwn(diagnosticCatalog, base.type)) {
      throw new Error('unknown diagnostic event');
    }
    validateFields(base.payload, diagnosticCatalog[base.type as DiagnosticType]);
  }
  return Object.freeze({
    ...base,
    schemaVersion: EVENT_VERSION,
    category,
    ...(sampleFrame === undefined ? {} : { sampleFrame }),
    ...(crankAngleRadians === undefined ? {} : { crankAngleRadians }),
    payload: Object.freeze({ ...base.payload }),
  }) as unknown as DomainEvent | DiagnosticEvent;
}

export function validateDomainEvent(input: unknown): DomainEvent {
  return validateEvent(input, 'domain') as DomainEvent;
}

export function validateDiagnosticEvent(input: unknown): DiagnosticEvent {
  return validateEvent(input, 'diagnostic') as DiagnosticEvent;
}

/** Trusted registry provided by the authoritative runtime, not by wire data. */
export interface DomainAuthority {
  readonly runId: string;
  readonly owners: ReadonlyMap<string, DomainOwner>;
}

export function assertDomainAuthority(
  event: DomainEvent,
  authority: DomainAuthority,
): void {
  if (
    event.runId !== authority.runId ||
    authority.owners.get(event.sourceComponentId) !==
      domainCatalog[event.type].role
  ) {
    throw new Error('unauthorized domain event source');
  }
}

export function validateCommand(input: unknown): CommandEnvelope {
  const object = record(input);
  const required = [
    'schemaVersion',
    'category',
    'runId',
    'commandId',
    'origin',
    'targetSimulationTick',
    'causationId',
    'correlationId',
    'type',
    'payload',
  ];
  if (
    required.some((key) => !Object.hasOwn(object, key)) ||
    Object.keys(object).some(
      (key) => !required.includes(key) && key !== 'targetSampleFrame',
    ) ||
    object.schemaVersion !== COMMAND_VERSION ||
    object.category !== 'command' ||
    !id(object.runId) ||
    !text(object.commandId) ||
    !['ui', 'scenario', 'automation', 'subscriber'].some(
      (origin) => origin === object.origin,
    ) ||
    !tick(object.targetSimulationTick) ||
    (Object.hasOwn(object, 'targetSampleFrame') &&
      !tick(object.targetSampleFrame)) ||
    !traceId(object.causationId) ||
    !traceId(object.correlationId) ||
    typeof object.type !== 'string' ||
    !Object.hasOwn(commandCatalog, object.type)
  ) {
    throw new Error('invalid command envelope');
  }
  validateFields(object.payload, commandCatalog[object.type as CommandType]);
  return Object.freeze({
    ...object,
    payload: Object.freeze({ ...record(object.payload) }),
  }) as unknown as CommandEnvelope;
}

/** Import only: live v3 envelopes must use canonical IDs. */
export function adaptLegacyEventV2(
  input: unknown,
): DomainEvent | DiagnosticEvent {
  const legacy: EngineEventEnvelopeV2 = validateEngineEventEnvelopeV2(input);
  const aliases = {
    REV_LIMIT_ENTER: 'LIMITER_ENTER',
    REV_LIMIT_EXIT: 'LIMITER_EXIT',
    CLOCK_PAUSED: 'RUN_PAUSED',
    CLOCK_RESUMED: 'RUN_RESUMED',
  } as const;
  const type = Object.hasOwn(aliases, legacy.type)
    ? aliases[legacy.type as keyof typeof aliases]
    : legacy.type;
  const category = Object.hasOwn(diagnosticCatalog, type)
    ? 'diagnostic'
    : 'domain';
  return validateEvent(
    { ...legacy, schemaVersion: EVENT_VERSION, category, type },
    category,
  );
}

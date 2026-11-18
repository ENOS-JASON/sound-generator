/**
 * ADR-003. This is an import-level structural contract; AG-M0-04 owns
 * detailed typed ports/capability registry and AG-M1-12 owns runnable presets.
 */
export const VEHICLE_SCHEMA_VERSION = 2 as const;
export const MAX_VEHICLE_JSON_BYTES = 262_144;

export type ModelSupport = 'implemented' | 'approximate' | 'planned' | 'unsupported';
export type ComponentKind =
  | 'engine'
  | 'carburetor'
  | 'distributor'
  | 'ecu'
  | 'efi'
  | 'ignition-coil'
  | 'battery'
  | 'starter'
  | 'clutch'
  | 'manual-gearbox'
  | 'driven-axle'
  | 'road-load';

export interface ComponentManifestV2 {
  schemaVersion: 2;
  components: {
    id: string;
    kind: ComponentKind;
    componentSchemaVersion: 1;
    modelSupport: ModelSupport;
  }[];
}

export interface VehicleDefinitionV2 {
  schemaVersion: 2;
  id: string;
  label: string;
  seed: number;
  engine: {
    componentId: string;
    family: 'spark-four-stroke';
    banks: { id: string; angleRadians: number; cylinderIds: number[] }[];
    firingOrder: number[];
    boreMeters: number;
    strokeMeters: number;
    connectingRodMeters: number;
    compressionRatio: number;
  };
  control:
    | { kind: 'mechanical'; carburetorId: string; distributorId: string }
    | {
        kind: 'ecu';
        ecuId: string;
        efiId: string;
        ignitionCoilId: string;
        fuelMapId: string;
        sparkMapId: string;
      };
  electrical: {
    batteryId: string;
    starterId: string;
    starterCranksEngineId: string;
    starterPoweredByBatteryId: string;
    batteryNominalVolts: number;
    starterMaxTorqueNm: number;
  };
  driveline: {
    kind: 'manual';
    engineId: string;
    clutchId: string;
    gearboxId: string;
    drivenAxleId: string;
    roadLoadId: string;
    forwardGearRatios: number[];
    finalDriveRatio: number;
    vehicleMassKg: number;
    wheelRadiusMeters: number;
  };
  manifest: ComponentManifestV2;
}

export class ContractValidationError extends Error {
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = 'ContractValidationError';
  }
}

const kinds: readonly ComponentKind[] = [
  'engine', 'carburetor', 'distributor', 'ecu', 'efi', 'ignition-coil',
  'battery', 'starter', 'clutch', 'manual-gearbox', 'driven-axle', 'road-load',
];
const support: readonly ModelSupport[] = ['implemented', 'approximate', 'planned', 'unsupported'];
const slug = /^[a-z][a-z0-9-]{0,63}$/;

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype &&
       Object.getPrototypeOf(value) !== null)) {
    throw new ContractValidationError(path, 'expected plain object');
  }
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, expected: string[], path: string): void {
  for (const key of Object.keys(value)) {
    if (!expected.includes(key)) throw new ContractValidationError(`${path}.${key}`, 'unknown property');
  }
  for (const key of expected) {
    if (!Object.hasOwn(value, key)) throw new ContractValidationError(`${path}.${key}`, 'missing property');
  }
}
function id(value: unknown, path: string): string {
  if (typeof value !== 'string' || !slug.test(value)) {
    throw new ContractValidationError(path, 'invalid identifier');
  }
  return value;
}
function num(value: unknown, path: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new ContractValidationError(path, `expected finite number in [${min}, ${max}]`);
  }
  return value;
}
function int(value: unknown, path: string, min: number, max: number): number {
  const n = num(value, path, min, max);
  if (!Number.isSafeInteger(n)) throw new ContractValidationError(path, 'expected integer');
  return n;
}
function items(value: unknown, path: string, min: number, max: number): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new ContractValidationError(path, `expected array of ${min}-${max} items`);
  }
  return value;
}
function choice<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ContractValidationError(path, 'unsupported value');
  }
  return value as T;
}

export function validateVehicleDefinitionV2(input: unknown): VehicleDefinitionV2 {
  const v = record(input, 'vehicle');
  if (v.schemaVersion !== 2) {
    throw new ContractValidationError(
      'vehicle.schemaVersion',
      v.schemaVersion === 1
        ? 'v1 migration unavailable: required topology missing; guided rebuild required'
        : 'unsupported version (expected 2)',
    );
  }
  keys(v, ['schemaVersion', 'id', 'label', 'seed', 'engine', 'control',
    'electrical', 'driveline', 'manifest'], 'vehicle');
  id(v.id, 'vehicle.id');
  if (typeof v.label !== 'string' || !v.label.trim() || v.label.trim() !== v.label ||
      v.label.length > 100) throw new ContractValidationError('vehicle.label', 'invalid label');
  int(v.seed, 'vehicle.seed', 0, 0xffff_ffff);

  const e = record(v.engine, 'engine');
  keys(e, ['componentId', 'family', 'banks', 'firingOrder', 'boreMeters',
    'strokeMeters', 'connectingRodMeters', 'compressionRatio'], 'engine');
  id(e.componentId, 'engine.componentId');
  if (e.family !== 'spark-four-stroke') {
    throw new ContractValidationError('engine.family', 'unsupported engine family');
  }
  const cylinderIds: number[] = [];
  const bankIds = new Set<string>();
  for (const [i, raw] of items(e.banks, 'engine.banks', 1, 12).entries()) {
    const path = `engine.banks[${i}]`;
    const bank = record(raw, path);
    keys(bank, ['id', 'angleRadians', 'cylinderIds'], path);
    const bankId = id(bank.id, `${path}.id`);
    if (bankIds.has(bankId)) throw new ContractValidationError(path, 'duplicate bank id');
    bankIds.add(bankId);
    num(bank.angleRadians, `${path}.angleRadians`, -Math.PI, Math.PI);
    for (const [j, n] of items(bank.cylinderIds, `${path}.cylinderIds`, 1, 12).entries()) {
      cylinderIds.push(int(n, `${path}.cylinderIds[${j}]`, 1, 12));
    }
  }
  if (cylinderIds.length > 12 || new Set(cylinderIds).size !== cylinderIds.length ||
      cylinderIds.some((n) => n > cylinderIds.length)) {
    throw new ContractValidationError('engine.banks', 'invalid or duplicate cylinder ids');
  }
  const order = items(e.firingOrder, 'engine.firingOrder', 1, 12);
  if (order.length !== cylinderIds.length ||
      new Set(order).size !== order.length ||
      order.some((n) => !cylinderIds.includes(n as number))) {
    throw new ContractValidationError('engine.firingOrder', 'not a cylinder permutation');
  }
  order.forEach((n, i) => int(n, `engine.firingOrder[${i}]`, 1, 12));
  num(e.boreMeters, 'engine.boreMeters', 0.001, 0.5);
  const stroke = num(e.strokeMeters, 'engine.strokeMeters', 0.001, 0.5);
  if (num(e.connectingRodMeters, 'engine.connectingRodMeters', 0.001, 1) <= stroke / 2) {
    throw new ContractValidationError('engine.connectingRodMeters', 'rod must exceed crank radius');
  }
  num(e.compressionRatio, 'engine.compressionRatio', 1.01, 30);

  const m = record(v.manifest, 'manifest');
  keys(m, ['schemaVersion', 'components'], 'manifest');
  if (m.schemaVersion !== 2) throw new ContractValidationError('manifest.schemaVersion', 'expected 2');
  const byId = new Map<string, ComponentKind>();
  const byKind = new Set<ComponentKind>();
  for (const [i, raw] of items(m.components, 'manifest.components', 1, 64).entries()) {
    const path = `manifest.components[${i}]`;
    const c = record(raw, path);
    keys(c, ['id', 'kind', 'componentSchemaVersion', 'modelSupport'], path);
    const componentId = id(c.id, `${path}.id`);
    const kind = choice(c.kind, kinds, `${path}.kind`);
    if (c.componentSchemaVersion !== 1) throw new ContractValidationError(path, 'unsupported component version');
    choice(c.modelSupport, support, `${path}.modelSupport`);
    if (byId.has(componentId) || byKind.has(kind)) {
      throw new ContractValidationError(path, 'duplicate component id or kind');
    }
    byId.set(componentId, kind);
    byKind.add(kind);
  }
  function requireKind(value: unknown, kind: ComponentKind, path: string): string {
    const componentId = id(value, path);
    if (byId.get(componentId) !== kind) {
      throw new ContractValidationError(path, `missing linked ${kind} component`);
    }
    return componentId;
  }
  const engineId = requireKind(e.componentId, 'engine', 'engine.componentId');

  const c = record(v.control, 'control');
  if (c.kind === 'mechanical') {
    keys(c, ['kind', 'carburetorId', 'distributorId'], 'control');
    requireKind(c.carburetorId, 'carburetor', 'control.carburetorId');
    requireKind(c.distributorId, 'distributor', 'control.distributorId');
    for (const kind of ['ecu', 'efi', 'ignition-coil'] as const) {
      if (byKind.has(kind)) throw new ContractValidationError('manifest', 'mixed mechanical/ECU controllers');
    }
  } else if (c.kind === 'ecu') {
    keys(c, ['kind', 'ecuId', 'efiId', 'ignitionCoilId', 'fuelMapId', 'sparkMapId'], 'control');
    requireKind(c.ecuId, 'ecu', 'control.ecuId');
    requireKind(c.efiId, 'efi', 'control.efiId');
    requireKind(c.ignitionCoilId, 'ignition-coil', 'control.ignitionCoilId');
    id(c.fuelMapId, 'control.fuelMapId');
    id(c.sparkMapId, 'control.sparkMapId');
    if (byKind.has('carburetor') || byKind.has('distributor')) {
      throw new ContractValidationError('manifest', 'mixed mechanical/ECU controllers');
    }
  } else {
    throw new ContractValidationError('control.kind', 'unsupported controller');
  }

  const a = record(v.electrical, 'electrical');
  keys(a, ['batteryId', 'starterId', 'starterCranksEngineId',
    'starterPoweredByBatteryId', 'batteryNominalVolts', 'starterMaxTorqueNm'], 'electrical');
  const batteryId = requireKind(a.batteryId, 'battery', 'electrical.batteryId');
  requireKind(a.starterId, 'starter', 'electrical.starterId');
  if (a.starterCranksEngineId !== engineId || a.starterPoweredByBatteryId !== batteryId) {
    throw new ContractValidationError('electrical', 'missing starter/battery/engine relationship');
  }
  num(a.batteryNominalVolts, 'electrical.batteryNominalVolts', 1, 1000);
  num(a.starterMaxTorqueNm, 'electrical.starterMaxTorqueNm', 0.01, 100_000);

  const d = record(v.driveline, 'driveline');
  keys(d, ['kind', 'engineId', 'clutchId', 'gearboxId', 'drivenAxleId',
    'roadLoadId', 'forwardGearRatios', 'finalDriveRatio',
    'vehicleMassKg', 'wheelRadiusMeters'], 'driveline');
  if (d.kind !== 'manual' || d.engineId !== engineId) {
    throw new ContractValidationError('driveline', 'manual gearbox must connect to engine');
  }
  requireKind(d.clutchId, 'clutch', 'driveline.clutchId');
  requireKind(d.gearboxId, 'manual-gearbox', 'driveline.gearboxId');
  requireKind(d.drivenAxleId, 'driven-axle', 'driveline.drivenAxleId');
  requireKind(d.roadLoadId, 'road-load', 'driveline.roadLoadId');
  items(d.forwardGearRatios, 'driveline.forwardGearRatios', 1, 12)
    .forEach((n, i) => num(n, `driveline.forwardGearRatios[${i}]`, 0.01, 100));
  num(d.finalDriveRatio, 'driveline.finalDriveRatio', 0.01, 100);
  num(d.vehicleMassKg, 'driveline.vehicleMassKg', 1, 1_000_000);
  num(d.wheelRadiusMeters, 'driveline.wheelRadiusMeters', 0.01, 10);
  const expectedKinds = c.kind === 'mechanical'
    ? ['engine', 'carburetor', 'distributor', 'battery', 'starter', 'clutch',
        'manual-gearbox', 'driven-axle', 'road-load']
    : ['engine', 'ecu', 'efi', 'ignition-coil', 'battery', 'starter', 'clutch',
        'manual-gearbox', 'driven-axle', 'road-load'];
  if (expectedKinds.length !== byKind.size ||
      expectedKinds.some((kind) => !byKind.has(kind as ComponentKind))) {
    throw new ContractValidationError('manifest', 'unknown, missing or unconnected component');
  }
  return v as unknown as VehicleDefinitionV2;
}

export function parseVehicleDefinitionJson(source: string): VehicleDefinitionV2 {
  if (typeof source !== 'string' || new TextEncoder().encode(source).length > MAX_VEHICLE_JSON_BYTES) {
    throw new ContractValidationError('vehicle', 'JSON import exceeds 256 KiB');
  }
  let input: unknown;
  try {
    input = JSON.parse(source) as unknown;
  } catch {
    throw new ContractValidationError('vehicle', 'invalid JSON syntax');
  }
  return validateVehicleDefinitionV2(input);
}

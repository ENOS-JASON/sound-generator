/** AG-M0-06: UI/input boundary conversions. Physics and presets stay in SI. */
export type QuantityKind =
  | 'power'
  | 'torque'
  | 'pressure'
  | 'temperature'
  | 'speed'
  | 'distance'
  | 'length'
  | 'displacement'
  | 'mass'
  | 'force'
  | 'airflow'
  | 'energy'
  | 'fuel-volume'
  | 'fuel-economy'
  | 'voltage'
  | 'ratio';

export type PressureBasis = 'gauge' | 'absolute';

export interface QuantityField {
  readonly fieldId: string;
  readonly quantityKind: QuantityKind;
  readonly canonicalUnitId: string;
  readonly allowedDisplayUnitIds: readonly string[];
  /** Required for pressure; a unit by itself cannot imply a pressure basis. */
  readonly pressureBasis?: PressureBasis;
}

/** Transient resolver input only; AG-M0-18 owns versioned storage/migration. */
export interface UnitChoices {
  readonly quantityDefaults?: Readonly<Partial<Record<QuantityKind, string>>>;
  readonly perStatUnitIds?: Readonly<Record<string, string>>;
}

interface UnitDefinition {
  readonly id: string;
  readonly kind: QuantityKind;
  readonly toSI: (value: number) => number;
  readonly fromSI: (value: number) => number;
}

const scale = (factor: number) => ({
  toSI: (value: number) => value * factor,
  fromSI: (value: number) => value / factor,
});
const affine = (factor: number, offset: number) => ({
  toSI: (value: number) => value * factor + offset,
  fromSI: (value: number) => (value - offset) / factor,
});
const inverse = (volumePerDistance: number) => ({
  toSI: (value: number) => volumePerDistance / value,
  fromSI: (value: number) => volumePerDistance / value,
});
const make = (
  kind: QuantityKind,
  id: string,
  conversion: ReturnType<typeof scale>,
): UnitDefinition => ({ kind, id, ...conversion });

const US_GALLON_M3 = 0.003785411784;
const IMPERIAL_GALLON_M3 = 0.00454609;
const MILE_METERS = 1609.344;
const UNITS: readonly UnitDefinition[] = [
  make('power', 'W', scale(1)),
  make('power', 'kW', scale(1000)),
  make('power', 'hp', scale(745.6998715822702)),
  make('power', 'PS', scale(735.49875)),
  make('torque', 'Nm', scale(1)),
  make('torque', 'lb-ft', scale(1.3558179483314)),
  make('torque', 'lb-in', scale(0.1129848290276167)),
  make('pressure', 'Pa', scale(1)),
  make('pressure', 'kPa', scale(1000)),
  make('pressure', 'bar', scale(100000)),
  make('pressure', 'psi', scale(6894.757293168)),
  make('pressure', 'inHg', scale(3386.38815789)),
  make('temperature', 'K', scale(1)),
  make('temperature', 'degC', affine(1, 273.15)),
  make('temperature', 'degF', affine(5 / 9, 255.3722222222222)),
  make('speed', 'm/s', scale(1)),
  make('speed', 'km/h', scale(1 / 3.6)),
  make('speed', 'mph', scale(0.44704)),
  make('distance', 'm', scale(1)),
  make('distance', 'km', scale(1000)),
  make('distance', 'mi', scale(MILE_METERS)),
  make('length', 'm', scale(1)),
  make('length', 'cm', scale(0.01)),
  make('length', 'mm', scale(0.001)),
  make('length', 'in', scale(0.0254)),
  make('length', 'ft', scale(0.3048)),
  make('displacement', 'm3', scale(1)),
  make('displacement', 'cc', scale(1e-6)),
  make('displacement', 'L', scale(0.001)),
  make('displacement', 'cu-in', scale(0.000016387064)),
  make('mass', 'kg', scale(1)),
  make('mass', 'lb', scale(0.45359237)),
  make('force', 'N', scale(1)),
  make('force', 'lbf', scale(4.4482216152605)),
  make('airflow', 'kg/s', scale(1)),
  make('airflow', 'g/s', scale(0.001)),
  make('airflow', 'lb/min', scale(0.45359237 / 60)),
  make('energy', 'J', scale(1)),
  make('energy', 'kJ', scale(1000)),
  make('energy', 'kWh', scale(3_600_000)),
  make('fuel-volume', 'm3', scale(1)),
  make('fuel-volume', 'L', scale(0.001)),
  make('fuel-volume', 'us-gal', scale(US_GALLON_M3)),
  make('fuel-volume', 'imp-gal', scale(IMPERIAL_GALLON_M3)),
  make('fuel-economy', 'm3/m', scale(1)),
  make('fuel-economy', 'L/100km', scale(1e-8)),
  make('fuel-economy', 'us-mpg', inverse(US_GALLON_M3 / MILE_METERS)),
  make(
    'fuel-economy',
    'imp-mpg',
    inverse(IMPERIAL_GALLON_M3 / MILE_METERS),
  ),
  make('voltage', 'V', scale(1)),
  make('ratio', '1', scale(1)),
];

export const CANONICAL_UNIT_IDS: Readonly<Record<QuantityKind, string>> =
  Object.freeze({
    power: 'W',
    torque: 'Nm',
    pressure: 'Pa',
    temperature: 'K',
    speed: 'm/s',
    distance: 'm',
    length: 'm',
    displacement: 'm3',
    mass: 'kg',
    force: 'N',
    airflow: 'kg/s',
    energy: 'J',
    'fuel-volume': 'm3',
    'fuel-economy': 'm3/m',
    voltage: 'V',
    ratio: '1',
  });

function finite(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError('quantity must be finite');
  }
  return value;
}

function unit(field: QuantityField, unitId: string): UnitDefinition {
  if (
    field.canonicalUnitId !== CANONICAL_UNIT_IDS[field.quantityKind] ||
    !field.allowedDisplayUnitIds.includes(field.canonicalUnitId) ||
    (field.quantityKind === 'pressure'
      ? !['gauge', 'absolute'].includes(field.pressureBasis ?? '')
      : field.pressureBasis !== undefined)
  ) {
    throw new RangeError(`${field.fieldId}: invalid quantity metadata`);
  }
  for (const id of field.allowedDisplayUnitIds) {
    if (!UNITS.some((entry) => entry.kind === field.quantityKind && entry.id === id)) {
      throw new RangeError(`${field.fieldId}: incompatible allowed unit ${id}`);
    }
  }
  const found = UNITS.find(
    (entry) => entry.id === unitId && entry.kind === field.quantityKind,
  );
  if (!found || !field.allowedDisplayUnitIds.includes(unitId)) {
    throw new RangeError(`${field.fieldId}: incompatible unit ${unitId}`);
  }
  return found;
}

export function availableUnits(kind: QuantityKind): readonly string[] {
  return UNITS.filter((entry) => entry.kind === kind).map((entry) => entry.id);
}

export function quantityField(
  fieldId: string,
  quantityKind: QuantityKind,
  pressureBasis?: PressureBasis,
): QuantityField {
  const field: QuantityField = {
    fieldId,
    quantityKind,
    canonicalUnitId: CANONICAL_UNIT_IDS[quantityKind],
    allowedDisplayUnitIds: availableUnits(quantityKind),
    ...(pressureBasis === undefined ? {} : { pressureBasis }),
  };
  unit(field, field.canonicalUnitId);
  return Object.freeze(field);
}

export function resolveDisplayUnit(
  field: QuantityField,
  choices: UnitChoices = {},
): string {
  const selected =
    choices.perStatUnitIds?.[field.fieldId] ??
    choices.quantityDefaults?.[field.quantityKind] ??
    field.canonicalUnitId;
  unit(field, selected);
  return selected;
}

function pressureInBasis(
  siValue: number,
  from: PressureBasis | undefined,
  to: PressureBasis | undefined,
  ambientPressurePa: number | undefined,
): number {
  if (from === to) return siValue;
  if (!from || !to || ambientPressurePa === undefined) {
    throw new RangeError('pressure basis mismatch: ambient reference required');
  }
  if (!Number.isFinite(ambientPressurePa) || ambientPressurePa <= 0) {
    throw new RangeError('ambient pressure must be finite and positive');
  }
  return from === 'gauge'
    ? siValue + ambientPressurePa
    : siValue - ambientPressurePa;
}

export interface PressureConversion {
  readonly displayBasis?: PressureBasis;
  readonly ambientPressurePa?: number;
}

export function toDisplayValue(
  siValue: number,
  field: QuantityField,
  unitId: string,
  pressure: PressureConversion = {},
): number {
  const converter = unit(field, unitId);
  const basis = pressure.displayBasis ?? field.pressureBasis;
  return finite(
    converter.fromSI(
      pressureInBasis(
        finite(siValue),
        field.pressureBasis,
        basis,
        pressure.ambientPressurePa,
      ),
    ),
  );
}

export function fromDisplayValue(
  displayValue: number,
  field: QuantityField,
  unitId: string,
  pressure: PressureConversion = {},
): number {
  const converter = unit(field, unitId);
  const basis = pressure.displayBasis ?? field.pressureBasis;
  return finite(
    pressureInBasis(
      finite(converter.toSI(finite(displayValue))),
      basis,
      field.pressureBasis,
      pressure.ambientPressurePa,
    ),
  );
}

export function displayUnitLabel(
  field: QuantityField,
  unitId: string,
  basis: PressureBasis | undefined = field.pressureBasis,
): string {
  unit(field, unitId);
  return field.quantityKind === 'pressure'
    ? `${unitId} (${basis === 'gauge' ? 'g' : 'a'})`
    : unitId;
}

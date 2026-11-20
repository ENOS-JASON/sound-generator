import type { VehicleDefinitionV2 } from '../vehicle-definition.ts';
import {
  quantityField,
  type QuantityField,
  type QuantityKind,
  type UnitChoices,
  resolveDisplayUnit,
} from './units.ts';

export const CONFIGURATOR_SCHEMA_VERSION = 1 as const;
export type WizardContext = {
  readonly vehicle: Readonly<Partial<VehicleDefinitionV2>>;
  readonly capabilities: ReadonlySet<string>;
};
export type WizardIssue = {
  readonly fieldId: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
};

export interface ConfiguratorFieldDefinition {
  readonly fieldId: string;
  readonly path: string;
  readonly label: string;
  readonly type: 'number' | 'choice' | 'text';
  readonly quantity?: QuantityField;
  readonly dependsOn?: readonly string[];
  readonly visibleWhen: (context: WizardContext) => boolean;
  readonly enabledWhen: (context: WizardContext) => boolean;
  readonly requiredWhen: (context: WizardContext) => boolean;
  readonly options: (context: WizardContext) => readonly string[];
  readonly constraints: (context: WizardContext) => {
    readonly min?: number;
    readonly max?: number;
  };
  readonly derive?: (context: WizardContext) => number | string | undefined;
}

export interface ConfiguratorStepDefinition {
  readonly stepId: string;
  readonly title: string;
  readonly prerequisites: readonly string[];
  readonly fields: readonly ConfiguratorFieldDefinition[];
  readonly applicableWhen: (context: WizardContext) => boolean;
}

const yes = () => true;
const no = () => false;
const none = () => [] as readonly string[];
const empty = () => ({});
const controller = (context: WizardContext) => context.vehicle.control?.kind;
const mechanical = (context: WizardContext) => controller(context) === 'mechanical';
const ecu = (context: WizardContext) => controller(context) === 'ecu';

interface FieldOptions {
  readonly quantityKind?: QuantityKind;
  readonly visibleWhen?: ConfiguratorFieldDefinition['visibleWhen'];
  readonly enabledWhen?: ConfiguratorFieldDefinition['enabledWhen'];
  readonly requiredWhen?: ConfiguratorFieldDefinition['requiredWhen'];
  readonly options?: ConfiguratorFieldDefinition['options'];
  readonly constraints?: ConfiguratorFieldDefinition['constraints'];
  readonly dependsOn?: readonly string[];
  readonly derive?: ConfiguratorFieldDefinition['derive'];
}

function field(
  path: string,
  label: string,
  type: ConfiguratorFieldDefinition['type'],
  options: FieldOptions = {},
): ConfiguratorFieldDefinition {
  return {
    fieldId: path,
    path,
    label,
    type,
    ...(options.quantityKind === undefined
      ? {}
      : { quantity: quantityField(path, options.quantityKind) }),
    dependsOn: options.dependsOn ?? [],
    visibleWhen: options.visibleWhen ?? yes,
    enabledWhen: options.enabledWhen ?? yes,
    requiredWhen: options.requiredWhen ?? yes,
    options: options.options ?? none,
    constraints: options.constraints ?? empty,
    ...(options.derive === undefined ? {} : { derive: options.derive }),
  };
}

const engineFields = [
  field('engine.boreMeters', 'Bore', 'number', {
    quantityKind: 'length',
    constraints: () => ({ min: 0.001, max: 0.5 }),
  }),
  field('engine.strokeMeters', 'Stroke', 'number', {
    quantityKind: 'length',
    constraints: () => ({ min: 0.001, max: 0.5 }),
  }),
  field('engine.connectingRodMeters', 'Connecting rod', 'number', {
    quantityKind: 'length',
    constraints: (ctx) => ({
      min: (ctx.vehicle.engine?.strokeMeters ?? 0) / 2,
      max: 1,
    }),
    dependsOn: ['engine.strokeMeters'],
  }),
  field('engine.compressionRatio', 'Compression ratio', 'number', {
    quantityKind: 'ratio',
    constraints: () => ({ min: 1.01, max: 30 }),
  }),
];

const controlFields = [
  field('control.kind', 'Controller', 'choice', {
    options: () => ['mechanical', 'ecu'],
  }),
  field('control.carburetorId', 'Carburetor', 'text', {
    visibleWhen: mechanical,
    dependsOn: ['control.kind'],
  }),
  field('control.distributorId', 'Distributor', 'text', {
    visibleWhen: mechanical,
    dependsOn: ['control.kind'],
  }),
  field('control.ecuId', 'ECU', 'text', {
    visibleWhen: ecu,
    dependsOn: ['control.kind'],
  }),
  field('control.efiId', 'EFI', 'text', {
    visibleWhen: ecu,
    dependsOn: ['control.kind'],
  }),
  field('control.ignitionCoilId', 'Ignition coils', 'text', {
    visibleWhen: ecu,
    dependsOn: ['control.kind'],
  }),
  field('control.fuelMapId', 'Fuel map', 'text', {
    visibleWhen: ecu,
    dependsOn: ['control.kind'],
  }),
  field('control.sparkMapId', 'Spark map', 'text', {
    visibleWhen: ecu,
    dependsOn: ['control.kind'],
  }),
];

export const CONFIGURATOR_STEPS: readonly ConfiguratorStepDefinition[] =
  Object.freeze([
    {
      stepId: 'engine',
      title: 'Engine geometry',
      prerequisites: [],
      fields: engineFields,
      applicableWhen: yes,
    },
    {
      stepId: 'control',
      title: 'Fuel and ignition',
      prerequisites: ['engine'],
      fields: controlFields,
      applicableWhen: yes,
    },
    {
      stepId: 'electrical',
      title: 'Electrical starting',
      prerequisites: ['engine'],
      fields: [
        field('electrical.batteryNominalVolts', 'Battery voltage', 'number', {
          quantityKind: 'voltage',
          constraints: () => ({ min: 1, max: 1000 }),
        }),
        field('electrical.starterMaxTorqueNm', 'Starter torque', 'number', {
          quantityKind: 'torque',
          constraints: () => ({ min: 0.01, max: 100000 }),
        }),
      ],
      applicableWhen: yes,
    },
    {
      stepId: 'driveline',
      title: 'Manual drivetrain and vehicle',
      prerequisites: ['engine'],
      fields: [
        field('driveline.vehicleMassKg', 'Vehicle mass', 'number', {
          quantityKind: 'mass',
          constraints: () => ({ min: 1, max: 1_000_000 }),
        }),
        field('driveline.wheelRadiusMeters', 'Wheel radius', 'number', {
          quantityKind: 'length',
          constraints: () => ({ min: 0.01, max: 10 }),
        }),
        field('driveline.finalDriveRatio', 'Final drive', 'number', {
          quantityKind: 'ratio',
          constraints: () => ({ min: 0.01, max: 100 }),
        }),
      ],
      applicableWhen: yes,
    },
    {
      stepId: 'review',
      title: 'Validate and save',
      prerequisites: ['engine', 'control', 'electrical', 'driveline'],
      fields: [],
      applicableWhen: yes,
    },
  ]);

export function fieldById(fieldId: string): ConfiguratorFieldDefinition {
  const found = CONFIGURATOR_STEPS.flatMap((step) => step.fields).find(
    (candidate) => candidate.fieldId === fieldId,
  );
  if (!found) throw new RangeError(`unknown configurator field: ${fieldId}`);
  return found;
}

export function visibleFields(
  step: ConfiguratorStepDefinition,
  context: WizardContext,
): readonly ConfiguratorFieldDefinition[] {
  return step.applicableWhen(context)
    ? step.fields.filter((entry) => entry.visibleWhen(context))
    : [];
}

export function resolvedFieldUnit(
  fieldId: string,
  choices: UnitChoices = {},
): string {
  const descriptor = fieldById(fieldId);
  if (!descriptor.quantity) {
    throw new RangeError(`${fieldId}: field has no physical unit`);
  }
  return resolveDisplayUnit(descriptor.quantity, choices);
}

/**
 * Preview fields affected by a controller toggle without silently modifying a
 * preset or losing unrelated overrides. Caller must explicitly accept a reset.
 */
export function impactedFields(
  before: WizardContext,
  after: WizardContext,
): readonly string[] {
  return CONFIGURATOR_STEPS.flatMap((step) => step.fields)
    .filter(
      (entry) =>
        entry.visibleWhen(before) !== entry.visibleWhen(after) ||
        entry.enabledWhen(before) !== entry.enabledWhen(after) ||
        entry.options(before).join('\0') !== entry.options(after).join('\0'),
    )
    .map((entry) => entry.fieldId);
}

export function canVisitStep(
  step: ConfiguratorStepDefinition,
  completedSteps: ReadonlySet<string>,
  context: WizardContext,
): boolean {
  return (
    step.applicableWhen(context) &&
    step.prerequisites.every((id) => completedSteps.has(id))
  );
}

export const SUPPORTS_MECHANICAL = mechanical;
export const SUPPORTS_ECU = ecu;
export const NOT_REQUIRED = no;

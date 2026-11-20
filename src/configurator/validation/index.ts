import {
  ContractValidationError,
  validateVehicleDefinitionV2,
  type VehicleDefinitionV2,
} from '../../contracts/vehicle-definition.ts';
import {
  CONFIGURATOR_STEPS,
  type WizardContext,
  type WizardIssue,
} from '../../contracts/configurator/index.ts';

export interface ConfiguratorValidation {
  readonly status: 'draft' | 'structurally-valid' | 'runnable';
  readonly issues: readonly WizardIssue[];
  readonly vehicle?: VehicleDefinitionV2;
}

function getPath(value: unknown, path: string): unknown {
  let result: unknown = value;
  for (const segment of path.split('.')) {
    if (!result || typeof result !== 'object') return undefined;
    result = (result as Record<string, unknown>)[segment];
  }
  return result;
}

function issue(fieldId: string, message: string): WizardIssue {
  return { fieldId, severity: 'error', message };
}

/**
 * UI, preset import and future scenario preflight call this same boundary.
 * Drafts remain distinguishable from schema-valid (but not runnable) models.
 */
export function validateConfigurator(
  candidate: unknown,
  capabilities: ReadonlySet<string> = new Set(),
): ConfiguratorValidation {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {
      status: 'draft',
      issues: [issue('vehicle', 'expected vehicle object')],
    };
  }
  const vehicle = candidate as Partial<VehicleDefinitionV2>;
  const context: WizardContext = { vehicle, capabilities };
  const issues: WizardIssue[] = [];
  for (const step of CONFIGURATOR_STEPS) {
    if (!step.applicableWhen(context)) continue;
    for (const field of step.fields) {
      const value = getPath(vehicle, field.path);
      const visible = field.visibleWhen(context);
      if (!visible) {
        if (value !== undefined) {
          issues.push(
            issue(field.fieldId, 'hidden/incompatible field supplied'),
          );
        }
        continue;
      }
      if (!field.enabledWhen(context)) {
        if (value !== undefined) {
          issues.push(issue(field.fieldId, 'unavailable capability'));
        }
        continue;
      }
      if (value === undefined || value === null || value === '') {
        if (field.requiredWhen(context)) {
          issues.push(issue(field.fieldId, 'required field missing'));
        }
        continue;
      }
      if (field.type === 'number') {
        const limits = field.constraints(context);
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (limits.min !== undefined && value < limits.min) ||
          (limits.max !== undefined && value > limits.max)
        ) {
          issues.push(issue(field.fieldId, 'invalid SI quantity or range'));
        }
        // Rod equality is invalid per canonical VehicleDefinitionV2.
        if (
          field.fieldId === 'engine.connectingRodMeters' &&
          typeof value === 'number' &&
          limits.min !== undefined &&
          value <= limits.min
        ) {
          issues.push(issue(field.fieldId, 'rod must exceed crank radius'));
        }
      }
      if (field.type === 'text' && typeof value !== 'string') {
        issues.push(issue(field.fieldId, 'expected string'));
      }
      if (
        field.type === 'choice' &&
        !field.options(context).includes(value as string)
      ) {
        issues.push(issue(field.fieldId, 'unsupported option'));
      }
    }
  }

  let canonical: VehicleDefinitionV2 | undefined;
  try {
    canonical = validateVehicleDefinitionV2(candidate);
  } catch (error) {
    issues.push(
      issue(
        'vehicle',
        error instanceof ContractValidationError
          ? error.message
          : 'invalid vehicle',
      ),
    );
  }
  if (issues.length || canonical === undefined) {
    return { status: 'draft', issues };
  }
  const unavailable = canonical.manifest.components.filter(
    (component) =>
      component.modelSupport !== 'implemented' &&
      component.modelSupport !== 'approximate',
  );
  if (unavailable.length) {
    return {
      status: 'structurally-valid',
      issues: unavailable.map((component) => ({
        fieldId: `manifest.components.${component.id}`,
        severity: 'info' as const,
        message: `${component.kind}: ${component.modelSupport} provider is not runnable`,
      })),
      vehicle: canonical,
    };
  }
  // Structural capability alone does not prove a runnable physical model.
  return { status: 'structurally-valid', issues: [], vehicle: canonical };
}

/**
 * Imported JSON and wizard state deliberately share the same validator.
 * Malformed JSON cannot be treated as a valid incomplete vehicle.
 */
export function validateConfiguratorImport(
  source: string,
  capabilities: ReadonlySet<string> = new Set(),
): ConfiguratorValidation {
  let candidate: unknown;
  try {
    candidate = JSON.parse(source) as unknown;
  } catch {
    return {
      status: 'draft',
      issues: [issue('vehicle', 'invalid JSON syntax')],
    };
  }
  return validateConfigurator(candidate, capabilities);
}

export interface ConfiguratorDraft {
  readonly schemaVersion: 1;
  readonly vehicle: Readonly<Partial<VehicleDefinitionV2>>;
  readonly history: readonly Readonly<Partial<VehicleDefinitionV2>>[];
  readonly validation: ConfiguratorValidation;
}

/** Explicit immutable changes; no hidden-field cleanup without user review. */
export function startDraft(
  vehicle: Partial<VehicleDefinitionV2>,
): ConfiguratorDraft {
  const snapshot = structuredClone(vehicle);
  return {
    schemaVersion: 1,
    vehicle: snapshot,
    history: [],
    validation: validateConfigurator(snapshot),
  };
}

export function updateDraft(
  draft: ConfiguratorDraft,
  next: Partial<VehicleDefinitionV2>,
): ConfiguratorDraft {
  const snapshot = structuredClone(next);
  return {
    schemaVersion: 1,
    vehicle: snapshot,
    history: [...draft.history, structuredClone(draft.vehicle)].slice(-32),
    validation: validateConfigurator(snapshot),
  };
}

export function undoDraft(draft: ConfiguratorDraft): ConfiguratorDraft {
  if (!draft.history.length) return draft;
  const previous = draft.history[draft.history.length - 1]!;
  return {
    schemaVersion: 1,
    vehicle: structuredClone(previous),
    history: draft.history.slice(0, -1),
    validation: validateConfigurator(previous),
  };
}

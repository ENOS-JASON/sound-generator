import { APPROXIMATION_VERSION } from '../contracts/approximation/index.ts';
import type {
  ApproximationProfile,
  ApproximationResult,
  ComponentModelBinding,
  FallbackReason,
  FastComponentModel,
  Fields,
  QuantityUnit,
  Range,
  ReferenceBoundarySample,
  Units,
  Values,
} from '../contracts/approximation/index.ts';

const MAX_KNOTS = 4096;
const SI_UNITS = new Set([
  '1',
  'rad',
  'rad/s',
  'N*m',
  'Pa',
  'K',
  'kg/s',
  'kg',
  'm',
  'm2',
  'm3',
  'm/s',
  'N',
  'W',
  'J',
  'V',
  'A',
  's',
]);

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new RangeError(message);
}

function identifier(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function version(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function validRange(range: Range): boolean {
  return (
    Array.isArray(range) &&
    range.length === 2 &&
    Number.isFinite(range[0]) &&
    Number.isFinite(range[1]) &&
    range[0] <= range[1]
  );
}

function inside(value: number | undefined, range: Range): boolean {
  return (
    value !== undefined &&
    Number.isFinite(value) &&
    value >= range[0] &&
    value <= range[1]
  );
}

function sameKeys(a: object, b: object): boolean {
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => Object.hasOwn(b, key))
  );
}

function validUnit(unit: QuantityUnit): boolean {
  return (
    SI_UNITS.has(unit.unit) &&
    (unit.unit === 'Pa'
      ? unit.pressureBasis === 'absolute' || unit.pressureBasis === 'gauge'
      : unit.pressureBasis === undefined)
  );
}

function validateFields(fields: Fields): void {
  for (const [id, spec] of Object.entries(fields)) {
    requireValid(
      identifier(id) && validUnit(spec) && validRange(spec.bounds),
      'invalid SI field: ' + id,
    );
  }
}

function validateUnits(expected: Fields, actual: Units): void {
  requireValid(sameKeys(expected, actual), 'incompatible quantity keys');
  for (const [id, spec] of Object.entries(expected)) {
    const unit = actual[id];
    requireValid(
      unit &&
        validUnit(unit) &&
        unit.unit === spec.unit &&
        unit.pressureBasis === spec.pressureBasis,
      'incompatible SI unit or pressure basis: ' + id,
    );
  }
}

function validateValues(fields: Fields, values: Values): void {
  requireValid(sameKeys(fields, values), 'incompatible value keys');
  for (const [id, spec] of Object.entries(fields)) {
    requireValid(inside(values[id], spec.bounds), 'invalid value: ' + id);
  }
}

function freezeFields(fields: Fields): Fields {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(fields).map(([id, spec]) => [
        id,
        Object.freeze({ ...spec, bounds: Object.freeze([...spec.bounds]) }),
      ]),
    ),
  ) as Fields;
}

function validateProfile(
  model: FastComponentModel,
  binding: ComponentModelBinding,
  profile: ApproximationProfile,
): void {
  requireValid(
    profile.schemaVersion === APPROXIMATION_VERSION &&
      identifier(profile.profileHash) &&
      identifier(profile.datasetHash) &&
      profile.modelId === model.modelId &&
      profile.modelVersion === model.modelVersion &&
      profile.componentId === binding.componentId &&
      profile.componentSchemaVersion === binding.componentSchemaVersion &&
      profile.contextHash === binding.contextHash &&
      Number.isFinite(profile.uncertainty) &&
      profile.uncertainty >= 0 &&
      sameKeys(model.inputs, profile.inputDomain),
    'incompatible profile identity',
  );
  for (const [id, domain] of Object.entries(profile.inputDomain)) {
    const field = model.inputs[id];
    requireValid(
      field &&
        validRange(domain) &&
        inside(domain[0], field.bounds) &&
        inside(domain[1], field.bounds),
      'invalid calibration domain',
    );
  }
  if (profile.kind === 'coefficients') {
    requireValid(
      model.coefficients && model.calibrated,
      'unsupported coefficients',
    );
    validateValues(model.coefficients, profile.values);
    return;
  }
  requireValid(profile.kind === 'lookup1d', 'unsupported profile kind');
  const domain = profile.inputDomain[profile.input];
  requireValid(
    domain &&
      Object.hasOwn(model.outputs, profile.output) &&
      profile.knots.length >= 2 &&
      profile.knots.length <= MAX_KNOTS &&
      profile.knots.length === profile.corrections.length &&
      profile.knots[0] === domain[0] &&
      profile.knots.at(-1) === domain[1],
    'invalid lookup shape',
  );
  let previous = -Infinity;
  for (let i = 0; i < profile.knots.length; i++) {
    const knot = profile.knots[i];
    requireValid(
      knot !== undefined &&
        Number.isFinite(knot) &&
        knot > previous &&
        Number.isFinite(profile.corrections[i]),
      'invalid lookup point',
    );
    previous = knot;
  }
}

function interpolate(
  x: number,
  knots: readonly number[],
  corrections: readonly number[],
): number {
  let low = 0;
  let high = knots.length - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (x < knots[mid]!) high = mid;
    else low = mid;
  }
  const fraction = (x - knots[low]!) / (knots[high]! - knots[low]!);
  const delta = corrections[high]! - corrections[low]!;
  return corrections[low]! + fraction * delta;
}

function evaluateOutputs(
  model: FastComponentModel,
  binding: ComponentModelBinding,
  inputs: Values,
  outputs: Values,
): Values {
  validateValues(model.outputs, outputs);
  requireValid(
    !model.invariant || model.invariant(inputs, binding.parameters, outputs),
    'physical invariant violated',
  );
  return Object.freeze({ ...outputs });
}

/** Registry owns immutable model metadata, never solver or event state. */
export class ApproximationRegistry {
  readonly #models = new Map<string, FastComponentModel>();

  register(model: FastComponentModel): void {
    requireValid(
      model.schemaVersion === APPROXIMATION_VERSION &&
        identifier(model.modelId) &&
        version(model.modelVersion) &&
        identifier(model.operatingDomain) &&
        identifier(model.purpose) &&
        identifier(model.estimatedCost) &&
        typeof model.baseline === 'function',
      'invalid model identity',
    );
    validateFields(model.inputs);
    validateFields(model.outputs);
    validateFields(model.parameters);
    requireValid(
      (model.coefficients === undefined) === (model.calibrated === undefined),
      'coefficient contract and kernel must be paired',
    );
    if (model.coefficients) validateFields(model.coefficients);
    const key = JSON.stringify([model.modelId, model.modelVersion]);
    requireValid(!this.#models.has(key), 'duplicate model version');
    this.#models.set(
      key,
      Object.freeze({
        ...model,
        inputs: freezeFields(model.inputs),
        parameters: freezeFields(model.parameters),
        outputs: freezeFields(model.outputs),
        observedState: Object.freeze([...model.observedState]),
        ...(model.coefficients
          ? { coefficients: freezeFields(model.coefficients) }
          : {}),
      }),
    );
  }

  #resolve(binding: ComponentModelBinding): FastComponentModel {
    const model = this.#models.get(
      JSON.stringify([binding.modelId, binding.modelVersion]),
    );
    requireValid(
      model &&
        binding.schemaVersion === APPROXIMATION_VERSION &&
        identifier(binding.componentId) &&
        version(binding.componentSchemaVersion) &&
        identifier(binding.contextHash) &&
        binding.operatingDomain === model.operatingDomain,
      'incompatible model binding',
    );
    validateUnits(model.inputs, binding.inputs);
    validateUnits(model.outputs, binding.outputs);
    validateValues(model.parameters, binding.parameters);
    return model;
  }

  evaluate(
    binding: ComponentModelBinding,
    inputs: Values,
  ): ApproximationResult {
    const model = this.#resolve(binding);
    validateValues(model.inputs, inputs);
    const inputSnapshot = Object.freeze({ ...inputs });
    const parameters = Object.freeze({ ...binding.parameters });
    const baseline = evaluateOutputs(
      model,
      binding,
      inputSnapshot,
      model.baseline(inputSnapshot, parameters),
    );
    const identity = {
      componentId: binding.componentId,
      modelId: model.modelId,
      modelVersion: model.modelVersion,
    };
    const profile = binding.profile;
    if (!profile) {
      return { ...identity, modelStatus: 'baseline', outputs: baseline };
    }
    const fallback = (fallbackReason: FallbackReason): ApproximationResult => ({
      ...identity,
      modelStatus: 'fallback',
      outputs: baseline,
      fallbackReason,
    });
    try {
      validateProfile(model, binding, profile);
    } catch {
      return fallback('incompatible-profile');
    }
    for (const [id, range] of Object.entries(profile.inputDomain)) {
      if (!inside(inputSnapshot[id], range)) {
        return fallback('outside-calibration-domain');
      }
    }
    try {
      const candidate =
        profile.kind === 'coefficients'
          ? model.calibrated!(
              inputSnapshot,
              parameters,
              Object.freeze({ ...profile.values }),
              baseline,
            )
          : {
              ...baseline,
              [profile.output]:
                baseline[profile.output]! +
                interpolate(
                  inputSnapshot[profile.input]!,
                  profile.knots,
                  profile.corrections,
                ),
            };
      return {
        ...identity,
        modelStatus: 'trained',
        outputs: evaluateOutputs(model, binding, inputSnapshot, candidate),
        profileHash: profile.profileHash,
      };
    } catch {
      return fallback('invalid-calibrated-output');
    }
  }

  /** Verify a reference adapter's projection onto the same SI boundary. */
  projectReference(
    binding: ComponentModelBinding,
    sample: ReferenceBoundarySample,
  ): Values {
    const model = this.#resolve(binding);
    requireValid(
      sample.schemaVersion === APPROXIMATION_VERSION &&
        sample.componentId === binding.componentId &&
        sample.componentSchemaVersion === binding.componentSchemaVersion &&
        sample.contextHash === binding.contextHash &&
        identifier(sample.runId) &&
        identifier(sample.referenceModelVersion) &&
        Number.isSafeInteger(sample.simulationTick) &&
        sample.simulationTick >= 0 &&
        Number.isFinite(sample.uncertainty) &&
        sample.uncertainty >= 0,
      'incompatible reference projection',
    );
    validateUnits(model.outputs, sample.units);
    validateValues(model.outputs, sample.outputs);
    return Object.freeze({ ...sample.outputs });
  }
}

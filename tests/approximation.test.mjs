import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApproximationRegistry } from '../src/approximations/ApproximationRegistry.ts';

const flow = { unit: 'kg/s' };
const pressure = { unit: 'Pa', pressureBasis: 'absolute' };
const model = {
  schemaVersion: 1,
  modelId: 'mock-flow-restriction',
  modelVersion: 1,
  purpose: 'Illustrative bounded flow restriction',
  operatingDomain: 'mock-uncompressed-flow',
  inputs: { pressure: { ...pressure, bounds: [0, 100] } },
  parameters: { area: { unit: 'm2', bounds: [0, 2] } },
  outputs: { flow: { ...flow, bounds: [0, 20] } },
  observedState: ['pressure', 'flow'],
  estimatedCost: 'constant-time analytic kernel',
  baseline: ({ pressure }, { area }) => {
    const scaled = pressure * area;
    return { flow: scaled / 10 };
  },
  coefficients: { gain: { unit: '1', bounds: [0, 4] } },
  calibrated: (_inputs, _parameters, { gain }, { flow }) => ({
    flow: flow * gain,
  }),
  invariant: (_inputs, _parameters, { flow }) => flow >= 0,
};

function binding(componentId = 'mock-filter', area = 1) {
  return {
    schemaVersion: 1,
    componentId,
    componentSchemaVersion: 1,
    operatingDomain: model.operatingDomain,
    contextHash: componentId + '-geometry-v1',
    modelId: model.modelId,
    modelVersion: model.modelVersion,
    inputs: { pressure },
    outputs: { flow },
    parameters: { area },
  };
}

function profile(component, overrides = {}) {
  return {
    schemaVersion: 1,
    kind: 'coefficients',
    profileHash: 'mock-profile-v1',
    datasetHash: 'mock-dataset-v1',
    modelId: component.modelId,
    modelVersion: component.modelVersion,
    componentId: component.componentId,
    componentSchemaVersion: component.componentSchemaVersion,
    contextHash: component.contextHash,
    inputDomain: { pressure: [10, 60] },
    uncertainty: 0.1,
    values: { gain: 1.5 },
    ...overrides,
  };
}

function registry() {
  const registry = new ApproximationRegistry();
  registry.register(model);
  return registry;
}

test('two components reuse a baseline with independent parameters', () => {
  const models = registry();
  const a = models.evaluate(binding(), { pressure: 40 });
  const b = models.evaluate(binding('mock-throttle', 2), { pressure: 40 });
  assert.equal(a.outputs.flow, 4);
  assert.equal(b.outputs.flow, 8);
  assert.equal(a.modelStatus, 'baseline');
  assert.equal(b.modelId, a.modelId);
  assert.notEqual(a.componentId, b.componentId);
  assert.throws(() => models.register(model), /duplicate/);
});

test('coefficients are versioned, bounded and component-specific', () => {
  const models = registry();
  const component = binding();
  const trained = { ...component, profile: profile(component) };
  const result = models.evaluate(trained, { pressure: 40 });
  assert.equal(result.outputs.flow, 6);
  assert.equal(result.modelStatus, 'trained');
  assert.equal(result.profileHash, 'mock-profile-v1');
  const other = { ...binding('mock-throttle'), profile: trained.profile };
  assert.equal(
    models.evaluate(other, { pressure: 40 }).fallbackReason,
    'incompatible-profile',
  );
  for (const overrides of [
    { modelVersion: 2 },
    { contextHash: 'changed-geometry' },
    { values: { gain: NaN } },
  ]) {
    const invalid = { ...component, profile: profile(component, overrides) };
    const fallback = models.evaluate(invalid, { pressure: 40 });
    assert.equal(fallback.modelStatus, 'fallback');
    assert.equal(fallback.outputs.flow, 4);
    assert.equal(fallback.fallbackReason, 'incompatible-profile');
  }
});

test('lookup interpolation and safe analytic out-of-domain fallback', () => {
  const models = registry();
  const component = binding();
  const lookup = profile(component, {
    kind: 'lookup1d',
    input: 'pressure',
    output: 'flow',
    knots: [10, 60],
    corrections: [0, 5],
  });
  const trained = { ...component, profile: lookup };
  assert.equal(models.evaluate(trained, { pressure: 35 }).outputs.flow, 6);
  assert.equal(models.evaluate(trained, { pressure: 60 }).outputs.flow, 11);
  const fallback = models.evaluate(trained, { pressure: 80 });
  assert.equal(fallback.outputs.flow, 8);
  assert.equal(fallback.fallbackReason, 'outside-calibration-domain');
  const malformed = {
    ...component,
    profile: { ...lookup, knots: [10, 10, 60], corrections: [0, 1, 5] },
  };
  assert.equal(
    models.evaluate(malformed, { pressure: 40 }).fallbackReason,
    'incompatible-profile',
  );
});

test('invalid trained output falls back; invalid baseline is rejected', () => {
  const models = registry();
  const component = binding('mock-throttle', 2);
  const trained = {
    ...component,
    profile: profile(component, { values: { gain: 4 } }),
  };
  const fallback = models.evaluate(trained, { pressure: 60 });
  assert.equal(fallback.outputs.flow, 12);
  assert.equal(fallback.fallbackReason, 'invalid-calibrated-output');
  assert.throws(() => models.evaluate(component, { pressure: NaN }));
  assert.throws(() => models.evaluate(component, { pressure: 101 }));
});

test('binding rejects incompatible units and pressure basis', () => {
  const models = registry();
  const component = binding();
  for (const unit of [
    { unit: 'W' },
    { unit: 'psi', pressureBasis: 'absolute' },
    { unit: 'Pa', pressureBasis: 'gauge' },
  ]) {
    assert.throws(
      () =>
        models.evaluate(
          { ...component, inputs: { pressure: unit } },
          { pressure: 40 },
        ),
      /incompatible SI unit/,
    );
  }
});

test('reference projection rejects incompatible identity and units', () => {
  const models = registry();
  const component = binding();
  const sample = {
    schemaVersion: 1,
    runId: 'mock-reference-run',
    componentId: component.componentId,
    componentSchemaVersion: 1,
    contextHash: component.contextHash,
    referenceModelVersion: 'mock-reference-v1',
    simulationTick: 40,
    units: { flow },
    outputs: { flow: 4.2 },
    uncertainty: 0.1,
  };
  const projection = models.projectReference(component, sample);
  assert.deepEqual(projection, { flow: 4.2 });
  assert.ok(Object.isFrozen(projection));
  assert.throws(() => {
    models.projectReference(component, { ...sample, componentId: 'other' });
  });
  assert.throws(() => {
    models.projectReference(component, { ...sample, units: { flow: pressure } });
  });
});

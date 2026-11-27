import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CapabilityRegistry } from '../src/core/physics-ports/registry.ts';
import { makeReferenceProfile } from '../src/contracts/reference/index.ts';
import {
  decodeExperiment,
  diffReferenceManifests,
  encodeExperiment,
  experimentContentHash,
  selectReferenceBackend,
} from '../src/contracts/experiments/index.ts';

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL('./fixtures/contracts/' + name, import.meta.url),
      'utf8',
    ),
  );
const graph = fixture('port-graph.v1.json');
const seed = fixture('experiment.v1.json');
function registry() {
  const result = new CapabilityRegistry();
  for (const node of graph.components) {
    result.register({
      descriptor: {
        providerId: node.providerId,
        kind: node.kind,
        componentSchemaVersion: node.componentSchemaVersion,
        capabilities: ['physical-port'],
        support: [{ domain: 'mock', status: 'implemented' }],
      },
      create: (componentId) => ({ componentId }),
    });
  }
  return result;
}
function manifest() {
  return {
    schemaVersion: 1,
    graph: structuredClone(graph),
    parts: Object.fromEntries(
      graph.components.map((node) => [
        node.id,
        {
          providerVersion: '1',
          geometry: {},
          materials: {},
          parameters: { scale: { value: 1, unit: '1' } },
          subcomponents: {},
          mesh: {},
          acousticSources: {},
        },
      ]),
    ),
  };
}
function definition() {
  const {
    schemaVersion,
    studyId,
    resources,
    retryLimit,
    checkpointIntervalSteps,
    ...paired
  } = seed;
  return {
    schemaVersion,
    studyId,
    baseline: manifest(),
    variations: [],
    paired: {
      ...paired,
      fidelity: makeReferenceProfile('quick', {
        cylinderGas: 'mock-gas',
        cylinderWall: 'mock-wall',
        intakeRunner: 'mock-intake',
        exhaustRunner: 'mock-exhaust',
      }),
    },
    resources,
    retryLimit,
    checkpointIntervalSteps,
  };
}
function addVariation(study, ids, reg) {
  const variant = structuredClone(study.baseline);
  for (const id of ids) variant.parts[id].parameters.scale.value = 2;
  study.variations.push({
    id: ids.join('-'),
    kind: ids.length === 1 ? 'one-part' : 'part-set',
    manifest: variant,
    declared: diffReferenceManifests(study.baseline, variant, reg),
  });
}

test('one-part and part-set manifests roundtrip with exact paired seeds', async () => {
  const reg = registry();
  const study = definition();
  addVariation(study, ['intake'], reg);
  addVariation(study, ['intake', 'clutch'], reg);
  const json = encodeExperiment(study, reg);
  const restored = decodeExperiment(json, reg);
  assert.deepEqual(restored, study);
  assert.equal(restored.variations[0].declared.parts.length, 1);
  assert.deepEqual(restored.variations[0].declared.parts[0].paths, [
    '/part/parameters/scale/value',
  ]);
  assert.equal(restored.variations[1].declared.parts.length, 2);
  assert.deepEqual(restored.paired.seeds, [42, 43]);
  assert.equal(
    await experimentContentHash(restored),
    await experimentContentHash(study),
  );
  assert.notEqual(
    await experimentContentHash(study.baseline),
    await experimentContentHash(study.variations[0].manifest),
  );
});

test('unknown components, undeclared changes and false one-part claims fail', () => {
  const reg = registry();
  const study = definition();
  addVariation(study, ['intake'], reg);
  const unknown = structuredClone(study);
  unknown.variations[0].manifest.parts.unknown = manifest().parts.intake;
  assert.throws(() => encodeExperiment(unknown, reg), /unknown or missing/);
  const extra = structuredClone(study);
  extra.variations[0].manifest.parts.clutch.parameters.scale.value = 3;
  assert.throws(() => encodeExperiment(extra, reg), /scope/);
  const wrong = structuredClone(study);
  wrong.variations[0].declared.parts[0].paths = ['/part/geometry'];
  assert.throws(() => encodeExperiment(wrong, reg), /undeclared/);
  const changed = structuredClone(study);
  changed.variations[0].manifest.parts.intake.geometry.diameter = 0.02;
  assert.throws(() => encodeExperiment(changed, reg), /undeclared/);
  const version = structuredClone(study);
  version.schemaVersion = 2;
  assert.throws(() => encodeExperiment(version, reg), /version/);
});

test('invalid port graph and unrelated topology changes are rejected', () => {
  const reg = registry();
  const study = definition();
  addVariation(study, ['intake'], reg);
  const variant = study.variations[0];
  variant.manifest.graph.links[0].from.componentId = 'unknown';
  assert.throws(() => encodeExperiment(study, reg), /orphan/);
  variant.manifest.graph.links[0].from.componentId = 'engine';
  variant.manifest.graph.links[0].id = 'new-shaft-link';
  variant.declared = diffReferenceManifests(study.baseline, variant.manifest, reg);
  assert.throws(() => encodeExperiment(study, reg), /unrelated/);
});

test('variant cannot override paired inputs or hide non-finite data', () => {
  const reg = registry();
  const study = definition();
  addVariation(study, ['intake'], reg);
  study.variations[0].seeds = [99];
  assert.throws(() => encodeExperiment(study, reg), /unknown or missing/);
  delete study.variations[0].seeds;
  study.paired.environment.temperatureK = NaN;
  assert.throws(() => encodeExperiment(study, reg), /non-finite/);
});

function backend(kind, platform = 'windows') {
  return {
    schemaVersion: 1,
    id: 'mock-' + kind,
    version: '1',
    buildHash: 'mock-build',
    kind,
    platform,
    device: kind === 'cuda' ? 'GTX1080 mock' : 'mock multicore',
    runtimeVersion: 'mock-runtime',
    driverVersion: 'mock-driver',
    available: true,
    precisions: ['float32', 'float64'],
    solverFamilies: ['mock'],
    tiers: ['quick'],
    resources: seed.resources,
    reductionPolicy: 'fixed-order mock',
    checkpointVersion: 1,
    serializationVersion: 1,
    ...(kind === 'cuda'
      ? {
          cuda: {
            toolkitMajor: 12,
            computeCapability: 'sm_61',
            compiledTargets: ['sm_61'],
          },
        }
      : {}),
  };
}

test('Windows/Linux CUDA12 Pascal metadata and explicit CPU fallback', () => {
  for (const platform of ['windows', 'linux']) {
    const cpu = backend('cpu', platform);
    const gpu = backend('cuda', platform);
    const request = {
      platform,
      preferredKind: 'cuda',
      allowCpuFallback: true,
      precision: 'float64',
      solverFamily: 'mock',
      tier: 'quick',
      resources: seed.resources,
    };
    assert.equal(selectReferenceBackend(request, [cpu, gpu]).backend, gpu);
    gpu.cuda.toolkitMajor = 13;
    const fallback = selectReferenceBackend(request, [cpu, gpu]);
    assert.equal(fallback.status, 'cpu-fallback');
    assert.equal(fallback.backend, cpu);
    assert.ok(fallback.reason);
    gpu.cuda.toolkitMajor = 12;
    gpu.precisions = ['float32'];
    assert.equal(selectReferenceBackend(request, [cpu, gpu]).status, 'cpu-fallback');
    assert.equal(
      selectReferenceBackend({ ...request, allowCpuFallback: false }, [cpu, gpu]).status,
      'unavailable',
    );
    cpu.available = false;
    assert.equal(selectReferenceBackend(request, [cpu, gpu]).status, 'unavailable');
  }
});

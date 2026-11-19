import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { MODEL_INTERFACE_VERSION } from '../src/contracts/models/index.ts';
import { ModelProviderRegistry } from '../src/contracts/models/registry.ts';

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/contracts/model-providers.v1.json', import.meta.url),
    'utf8',
  ),
);
assert.equal(fixture.schemaVersion, 1);

function model(family, componentId, providerId, ports = []) {
  const base = {
    family,
    componentId,
    ports,
    interfaceVersion: MODEL_INTERFACE_VERSION,
  };
  switch (family) {
    case 'controller':
      return {
        ...base,
        controlKind: providerId === 'mock-mechanical' ? 'mechanical' : 'ecu',
        calculate: (_sensors, demand) => ({
          throttleFraction: demand.throttleFraction,
          fuelMassKgPerCycle: 0.00001,
          sparkAdvanceRadiansBeforeTdc: 0,
        }),
      };
    case 'induction':
      return {
        ...base,
        contribute: (inlet) => ({
          outlet: inlet,
          shaftPowerIntoComponentW: 0,
          electricalPowerIntoComponentW: 0,
          exhaustPowerIntoComponentW: 0,
          thermalPowerIntoComponentW: 0,
        }),
      };
    case 'engine':
      return {
        ...base,
        createAssembly: (definition) => ({
          familyId: definition.family,
          components: [],
          bankIds: definition.banks.map((bank) => bank.id),
        }),
      };
    case 'transmission':
      return {
        ...base,
        contribute: (shafts) => ({
          ports: shafts,
          dissipatedPowerW: 0,
          storedEnergyRateW: 0,
        }),
      };
    case 'differential':
      return {
        ...base,
        contribute: (shafts) => ({
          ports: shafts,
          dissipatedPowerW: 0,
          storedEnergyRateW: 0,
        }),
      };
    case 'electrical':
      return {
        ...base,
        contribute: (input) => ({
          currentIntoComponentA: input.currentIntoComponentA,
          shaftPowerIntoComponentW: 0,
          dissipatedPowerW: 0,
          storedEnergyRateW: 0,
        }),
      };
    case 'audio':
      return {
        ...base,
        render: (_frame, output) => output.fill(0.125),
      };
    case 'renderer':
      return { ...base, project: () => [] };
    default:
      throw new Error(`unsupported mock family ${family}`);
  }
}

function node(provider, overrides = {}) {
  return {
    id: provider.componentId,
    providerId: provider.providerId,
    kind: provider.kind,
    componentSchemaVersion: 1,
    operatingDomain: 'mock',
    modelSupport: 'implemented',
    requiredCapabilities: provider.capabilities,
    ports: [],
    ...overrides,
  };
}

function registerMock(registry, provider) {
  registry.register({
    family: provider.family,
    descriptor: {
      providerId: provider.providerId,
      kind: provider.kind,
      componentSchemaVersion: 1,
      capabilities: provider.capabilities,
      support: [{ domain: 'mock', status: 'implemented' }],
    },
    create: (componentId) =>
      model(provider.family, componentId, provider.providerId),
  });
}

test('register and instantiate every independent model family explicitly', () => {
  const registry = new ModelProviderRegistry();
  for (const provider of fixture.providers) {
    registerMock(registry, provider);
    const instance = registry.instantiate(provider.family, node(provider));
    assert.equal(instance.family, provider.family);
    assert.equal(instance.componentId, provider.componentId);
    assert.equal(instance.interfaceVersion, 1);
    assert.deepEqual(instance.ports, []);
  }
  const mechanical = registry.instantiate(
    'controller',
    node(fixture.providers[0]),
  );
  const electronic = registry.instantiate(
    'controller',
    node(fixture.providers[1]),
  );
  assert.equal(mechanical.controlKind, 'mechanical');
  assert.equal(electronic.controlKind, 'ecu');
  assert.notEqual(mechanical, electronic);
  const audio = registry.instantiate('audio', node(fixture.providers[7]));
  const samples = new Float32Array(4);
  audio.render(
    { firstSampleFrame: 0, sampleCount: 4, sampleRateHz: 48_000 },
    samples,
  );
  assert.deepEqual(Array.from(samples), [0.125, 0.125, 0.125, 0.125]);
});

test('registration rejects missing declared capability, wrong family/version/domain', () => {
  const provider = fixture.providers[0];
  const registry = new ModelProviderRegistry();
  registerMock(registry, provider);
  assert.throws(
    () =>
      registry.instantiate(
        'controller',
        node(provider, { requiredCapabilities: ['ecu-only'] }),
      ),
    /missing capability/,
  );
  assert.throws(
    () => registry.instantiate('engine', node(provider)),
    /family mismatch/,
  );
  assert.throws(
    () =>
      registry.instantiate(
        'controller',
        node(provider, { componentSchemaVersion: 2 }),
      ),
    /version mismatch/,
  );
  assert.throws(
    () =>
      registry.instantiate(
        'controller',
        node(provider, { operatingDomain: 'diesel' }),
      ),
    /operating domain\/support mismatch/,
  );
  assert.throws(() => registerMock(registry, provider), /duplicate/);
});

test('planned models cannot instantiate, and false factory identity/ports fail closed', () => {
  const provider = fixture.providers[0];
  const registry = new ModelProviderRegistry();
  registry.register({
    family: 'controller',
    descriptor: {
      providerId: 'future-controller',
      kind: 'ecu',
      componentSchemaVersion: 1,
      capabilities: ['future-control'],
      support: [{ domain: 'future', status: 'planned' }],
    },
  });
  assert.throws(
    () =>
      registry.instantiate('controller', {
        ...node(provider),
        providerId: 'future-controller',
        kind: 'ecu',
        operatingDomain: 'future',
        modelSupport: 'planned',
        requiredCapabilities: ['future-control'],
      }),
    /technology unavailable/,
  );
  registerMock(registry, provider);
  assert.throws(
    () =>
      registry.instantiate(
        'controller',
        node(provider, {
          ports: [
            {
              id: 'air',
              kind: 'air',
              effortUnit: 'Pa',
              flowUnit: 'kg/s',
              pressureBasis: 'absolute',
              direction: 'in',
              required: false,
            },
          ],
        }),
      ),
    /identity\/ports mismatch/,
  );
  const bad = new ModelProviderRegistry();
  bad.register({
    family: 'controller',
    descriptor: {
      providerId: 'broken-controller',
      kind: 'ecu',
      componentSchemaVersion: 1,
      capabilities: [],
      support: [{ domain: 'mock', status: 'implemented' }],
    },
    create: () => model('engine', 'wrong-component', 'broken-controller'),
  });
  assert.throws(
    () =>
      bad.instantiate('controller', {
        ...node(provider),
        id: 'test-1',
        providerId: 'broken-controller',
        kind: 'ecu',
        requiredCapabilities: [],
      }),
    /identity\/ports mismatch/,
  );
});

test('registry state remains per instance with no singleton or fallback', () => {
  const provider = fixture.providers[0];
  const first = new ModelProviderRegistry();
  const second = new ModelProviderRegistry();
  registerMock(first, provider);
  assert.throws(
    () => second.instantiate('controller', node(provider)),
    /family mismatch/,
  );
  assert.throws(
    () =>
      first.instantiate('controller', {
        ...node(provider),
        providerId: 'missing',
      }),
    /family mismatch/,
  );
});

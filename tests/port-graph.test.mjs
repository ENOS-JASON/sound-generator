import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { build } from 'esbuild';
import { validateVehicleDefinitionV2 } from '../src/contracts/vehicle-definition.ts';

// Bundle the contract modules for Node ESM tests without changing the
// application's intentional extensionless TS imports or tsconfig.
const compiled = await build({
  stdin: {
    contents: `
      export { CapabilityRegistry } from './src/core/physics-ports/registry';
      export { validatePortGraph } from './src/core/physics-ports/graph';
      export { defineCylinderTopology } from './src/core/physics-ports/cylinders';
      export { checkRotationalPowerBalance, rotationalPowerIntoComponentW }
        from './src/core/physics-ports/power';
    `,
    resolveDir: process.cwd(),
    sourcefile: 'port-graph-test-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const {
  CapabilityRegistry,
  validatePortGraph,
  defineCylinderTopology,
  checkRotationalPowerBalance,
  rotationalPowerIntoComponentW,
} = await import(
  'data:text/javascript;base64,' +
    Buffer.from(compiled.outputFiles[0].contents).toString('base64')
);

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`./fixtures/contracts/${name}`, import.meta.url),
      'utf8',
    ),
  );
const graphFixture = fixture('port-graph.v1.json');
function registryFor(graph) {
  const registry = new CapabilityRegistry();
  for (const node of graph.components) {
    registry.register({
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
  return registry;
}
const clone = structuredClone;

test('fixture graph is valid, explicit capability registry builds mock providers', () => {
  const registry = registryFor(graphFixture);
  assert.equal(validatePortGraph(graphFixture, registry), graphFixture);
  assert.deepEqual(registry.create('mock-engine', 'mock', 'engine'), {
    componentId: 'engine',
  });
  assert.equal(
    registry.describe('mock-engine').support[0].status,
    'implemented',
  );
});

test('graph rejects wrong units, directions, pressure bases and control signals', () => {
  const cases = [
    [
      (g) => {
        g.components[0].ports[0].effortUnit = 'lb-ft';
      },
      /SI units/,
    ],
    [
      (g) => {
        g.components[0].ports[0].direction = 'in';
      },
      /direction/,
    ],
    [
      (g) => {
        g.components[0].ports[0].kind = 'electrical';
        g.components[0].ports[0].effortUnit = 'V';
        g.components[0].ports[0].flowUnit = 'A';
      },
      /kind mismatch/,
    ],
    [
      (g) => {
        g.components[0].ports[1].pressureBasis = 'gauge';
      },
      /pressure basis mismatch/,
    ],
    [
      (g) => {
        g.components[0].ports[2].signalType = 'wrong';
      },
      /signal type mismatch/,
    ],
  ];
  for (const [breakGraph, pattern] of cases) {
    const graph = clone(graphFixture);
    breakGraph(graph);
    assert.throws(
      () => validatePortGraph(graph, registryFor(graphFixture)),
      pattern,
    );
  }
});

test('graph rejects orphan links, invalid topology, duplicate ports, and disconnected requirements', () => {
  const cases = [
    [
      (g) => {
        g.links[0].to.componentId = 'missing';
      },
      /orphan endpoint/,
    ],
    [
      (g) => {
        g.links[0].to.componentId = 'engine';
        g.links[0].to.portId = 'air';
      },
      /self connection/,
    ],
    [
      (g) => {
        g.links.push(clone(g.links[0]));
        g.links.at(-1).id = 'another';
      },
      /duplicate physical connection/,
    ],
    [
      (g) => {
        g.links.splice(0, 1);
      },
      /required port disconnected/,
    ],
    [
      (g) => {
        g.components[0].ports.push(clone(g.components[0].ports[0]));
      },
      /duplicate port/,
    ],
    [
      (g) => {
        g.requiredPaths[0].toComponentId = 'electrical';
      },
      /missing required physical path/,
    ],
  ];
  for (const [breakGraph, pattern] of cases) {
    const graph = clone(graphFixture);
    breakGraph(graph);
    assert.throws(
      () => validatePortGraph(graph, registryFor(graphFixture)),
      pattern,
    );
  }
});

test('registry rejects unsupported factories, absent capabilities, version drift and duplicate registrations', () => {
  const registry = registryFor(graphFixture);
  const original = graphFixture.components[0];
  assert.throws(
    () =>
      registry.assertCompatible({
        ...original,
        requiredCapabilities: ['cuda-only'],
      }),
    /missing capability/,
  );
  assert.throws(
    () => registry.assertCompatible({ ...original, componentSchemaVersion: 2 }),
    /version mismatch/,
  );
  assert.throws(
    () => registry.register({ descriptor: registry.describe('mock-engine') }),
    /duplicate/,
  );
  const planned = new CapabilityRegistry();
  planned.register({
    descriptor: {
      providerId: 'diesel-future',
      kind: 'engine',
      componentSchemaVersion: 1,
      capabilities: [],
      support: [{ domain: 'diesel', status: 'planned' }],
    },
  });
  assert.throws(
    () => planned.create('diesel-future', 'diesel', 'new-engine'),
    /unavailable/,
  );
  assert.throws(
    () =>
      planned.register({
        descriptor: {
          providerId: 'fake-runnable',
          kind: 'engine',
          componentSchemaVersion: 1,
          capabilities: [],
          support: [{ domain: 'diesel', status: 'implemented' }],
        },
      }),
    /explicit factory/,
  );
});

test('signed power balances forward, reverse, loss and storage without free power', () => {
  assert.equal(rotationalPowerIntoComponentW(200, 2 * Math.PI), 400 * Math.PI);
  function samples(aTorque, aOmega, bTorque, bOmega) {
    return [
      {
        componentId: 'engine',
        portId: 'shaft',
        simulationTick: 5,
        torqueOnComponentNm: aTorque,
        angularVelocityRadPerSecond: aOmega,
      },
      {
        componentId: 'clutch',
        portId: 'input',
        simulationTick: 5,
        torqueOnComponentNm: bTorque,
        angularVelocityRadPerSecond: bOmega,
      },
    ];
  }
  assert.equal(
    checkRotationalPowerBalance(samples(-200, 100, 200, 100)).balanced,
    true,
  );
  assert.equal(
    checkRotationalPowerBalance(samples(200, 100, -200, 100)).balanced,
    true,
  );
  assert.equal(
    checkRotationalPowerBalance(samples(-100, 100, 90, 100), {
      dissipatedPowerW: 1000,
    }).balanced,
    true,
  );
  assert.equal(
    checkRotationalPowerBalance(samples(-200, 100, 190, 100), {
      storedEnergyRateW: 1000,
    }).balanced,
    true,
  );
  assert.equal(
    checkRotationalPowerBalance(samples(-200, 100, 250, 100)).balanced,
    false,
  );
  assert.throws(
    () =>
      checkRotationalPowerBalance(samples(-200, 100, 200, 100), {
        dissipatedPowerW: -1,
      }),
    /nonnegative/,
  );
  assert.throws(
    () =>
      checkRotationalPowerBalance(
        samples(-200, 100, 200, 100).map((s, i) =>
          i ? { ...s, simulationTick: 4 } : s,
        ),
      ),
    /different simulation ticks/,
  );
});

test('bank geometry preserves IDs for 1-12 cylinders and four-stroke cycle', () => {
  for (const count of [1, 2, 4, 6, 8, 12]) {
    const banks =
      count === 1
        ? [{ id: 'bank-a', angleRadians: 0, cylinderIds: [1] }]
        : [
            {
              id: 'bank-a',
              angleRadians: -0.4,
              cylinderIds: Array.from({ length: count / 2 }, (_, i) => i + 1),
            },
            {
              id: 'bank-b',
              angleRadians: 0.4,
              cylinderIds: Array.from(
                { length: count / 2 },
                (_, i) => i + 1 + count / 2,
              ),
            },
          ];
    const geometry = defineCylinderTopology({
      banks,
      firingOrder: Array.from({ length: count }, (_, i) => i + 1),
    });
    assert.equal(geometry.cylinders.length, count);
    assert.equal(geometry.cycleRadians, 4 * Math.PI);
    assert.equal(
      new Set(geometry.cylinders.map((c) => c.cylinderId)).size,
      count,
    );
    assert.equal(
      geometry.cylinders.at(-1).firingPhaseRadians,
      ((count - 1) * 4 * Math.PI) / count,
    );
  }
  const mechanical = validateVehicleDefinitionV2(
    fixture('i4-mechanical.v2.json'),
  );
  const efi = validateVehicleDefinitionV2(fixture('i4-efi.v2.json'));
  assert.deepEqual(
    defineCylinderTopology(mechanical.engine),
    defineCylinderTopology(efi.engine),
  );
  assert.throws(
    () =>
      defineCylinderTopology({
        banks: [{ id: 'bank-a', angleRadians: 0, cylinderIds: [1, 1] }],
        firingOrder: [1, 1],
      }),
    /duplicate cylinder/,
  );
  assert.throws(
    () =>
      defineCylinderTopology({
        banks: [{ id: 'bank-a', angleRadians: 0, cylinderIds: [1, 2] }],
        firingOrder: [2, 2],
      }),
    /permutation/,
  );
});

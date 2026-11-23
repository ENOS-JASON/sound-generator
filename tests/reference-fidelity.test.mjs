import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { REFERENCE_KINDS, REFERENCE_TIER_RESOLUTIONS, makeReferenceProfile } from '../src/contracts/reference/index.ts';
import { ReferenceSolverRegistry, preflightReferenceRun } from '../src/reference/contracts/index.ts';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/reference/expected-tiers.v1.json', import.meta.url)));
const kinds = REFERENCE_KINDS;
const solverIds = tier => Object.fromEntries(kinds.map(kind => [kind, `mock-${tier}-${kind}`]));
const topology = [
  { componentId: 'gas-1', kind: 'cylinderGas' },
  { componentId: 'wall-1', kind: 'cylinderWall' },
  { componentId: 'intake-1', kind: 'intakeRunner', lengthMeters: 0.5, maxCharacteristicSpeedMetersPerSecond: 450 },
  { componentId: 'exhaust-1', kind: 'exhaustRunner', lengthMeters: 0.8, maxCharacteristicSpeedMetersPerSecond: 500 },
];
const run = { durationSeconds: 0.01, scenarioCount: 2, maximumRpm: 6000,
  execution: 'cli', topology, availableMemoryMiB: 2048 };
const axes = {
  cylinderGas: ['gasZones', 'nearWallGasZones'],
  cylinderWall: ['linerAxialBands', 'linerRadialLayers', 'headLayers', 'pistonCrownLayers'],
  intakeRunner: ['axialCellsPerRunner', 'wallAxialBands', 'wallRadialLayers'],
  exhaustRunner: ['axialCellsPerRunner', 'wallAxialBands', 'wallRadialLayers'],
};
function registryFor({ research = false, unavailable = null, planned = null } = {}) {
  const registry = new ReferenceSolverRegistry();
  for (const tier of ['quick', 'balanced', 'detailed', ...(research ? ['research'] : [])]) {
    for (const kind of kinds) {
      const resolution = REFERENCE_TIER_RESOLUTIONS[tier][kind];
      const resolutionBounds = Object.fromEntries(axes[kind].map(axis => [axis,
        { min: axis === 'nearWallGasZones' ? 0 : 1, max: Math.max(1, resolution[axis] * 2) }]));
      const solverId = `mock-${tier}-${kind}`;
      registry.register({
        contractVersion: 1, solverId, kind, solverFamily: `synthetic-${kind}`,
        solverVersion: 'fixture-1', support: solverId === planned ? 'planned' : 'implemented',
        tiers: [tier], precisions: ['float64'], adaptiveStep: true, resolutionBounds,
        stateScalarsPerCell: 5, scratchBytesPerCell: 32,
        traceScalarsPerCell: 2, baseMemoryBytes: 512, relativeWorkPerCell: 2,
      }, () => solverId !== unavailable);
    }
  }
  return registry;
}
const ready = registryFor();
const check = (tier, changes = {}, input = run, registry = ready) =>
  preflightReferenceRun({ ...makeReferenceProfile(tier, solverIds(tier)), ...changes }, input, registry);

test('Quick, Balanced and Detailed use distinct resolution budgets with ready mock providers', () => {
  assert.equal(fixture.schemaVersion, 1);
  const counts = [];
  for (const expected of fixture.tiers.slice(0, 3)) {
    const profile = makeReferenceProfile(expected.tier, solverIds(expected.tier));
    assert.equal(profile.components.cylinderGas.resolution.gasZones, expected.gasZones);
    assert.equal(profile.components.cylinderWall.resolution.linerAxialBands, expected.linerAxialBands);
    assert.equal(profile.components.exhaustRunner.resolution.axialCellsPerRunner, expected.exhaustAxialCells);
    const result = check(expected.tier);
    assert.equal(result.canLaunch, true, result.errors.join('; '));
    assert.ok(result.estimated.peakMemoryBytes > 0 && result.estimated.traceBytes > 0);
    assert.ok(result.estimated.steps > 0 && result.estimated.stateScalars > 0);
    counts.push(result.estimated.cells);
  }
  assert.ok(counts[0] < counts[1] && counts[1] < counts[2]);
});
test('Research is unavailable without an explicitly registered ready numerical provider', () => {
  assert.equal(check('research').canLaunch, false);
  assert.equal(check('research', {}, run, registryFor({ research: true })).canLaunch, true);
  assert.equal(check('research', {}, run, registryFor({
    research: true, planned: 'mock-research-cylinderGas',
  })).canLaunch, false);
});
test('per-component override changes only its cells and never physical runner dimensions', () => {
  const base = makeReferenceProfile('detailed', solverIds('detailed'));
  const overrides = { 'exhaust-1': {
    ...base.components.exhaustRunner,
    resolution: { ...base.components.exhaustRunner.resolution, axialCellsPerRunner: 100 },
  } };
  const changed = check('detailed', { overrides });
  assert.equal(changed.canLaunch, true, changed.errors.join('; '));
  assert.equal(changed.estimated.cells - check('detailed').estimated.cells, 36);
  assert.equal(topology[3].lengthMeters, 0.8);
  assert.match(check('detailed', { overrides: { 'exhaust-1': base.components.cylinderGas } })
    .errors.join(' '), /wrong or missing/);
  assert.match(check('detailed', { overrides: { 'missing-1': base.components.cylinderGas } })
    .errors.join(' '), /unknown component/);
});
test('missing, wrong-kind, unready and planned solvers reject the launch', () => {
  const base = makeReferenceProfile('quick', solverIds('quick'));
  const changed = { components: { ...base.components, cylinderGas: {
    ...base.components.cylinderGas, solverId: 'missing',
  } } };
  assert.match(check('quick', changed).errors.join(' '), /solver missing unavailable/);
  assert.equal(check('quick', {}, run, registryFor({ unavailable: 'mock-quick-cylinderGas' })).canLaunch, false);
  changed.components.cylinderGas.solverId = 'mock-quick-cylinderWall';
  assert.equal(check('quick', changed).canLaunch, false);
});
test('reject invalid zones, numeric budgets, cell, memory, trace and step overruns', () => {
  const base = makeReferenceProfile('detailed', solverIds('detailed'));
  assert.match(check('detailed', { components: { ...base.components,
    cylinderGas: { ...base.components.cylinderGas,
      resolution: { gasZones: 16, nearWallGasZones: 16 } },
  } }).errors.join(' '), /proper subset/);
  assert.match(check('detailed', { components: { ...base.components,
    cylinderWall: { ...base.components.cylinderWall,
      resolution: { ...base.components.cylinderWall.resolution, linerAxialBands: -1 } },
  } }).errors.join(' '), /outside solver/);
  for (const [field, value, pattern] of [
    ['maxCells', 1, /cell budget/], ['maxMemoryMiB', 0.0001, /memory budget/],
    ['maxTraceMiB', 0.00001, /trace budget/], ['maxSteps', 1, /step budget/],
  ]) assert.match(check('detailed', { numerics: { ...base.numerics, [field]: value } })
    .errors.join(' '), pattern);
  assert.match(check('detailed', {}, { ...run, availableMemoryMiB: 0.00001 })
    .errors.join(' '), /memory budget/);
});
test('CFL reduces adaptive steps or rejects fixed steps and missing 1D geometry', () => {
  const base = makeReferenceProfile('detailed', solverIds('detailed'));
  const numerics = { ...base.numerics, maxStepSeconds: 0.001,
    maxCrankAngleDegrees: 360, adaptiveStep: false };
  assert.match(check('detailed', { numerics }).errors.join(' '), /fixed step violates CFL/);
  const adapt = check('detailed', { numerics: { ...numerics, adaptiveStep: true } });
  assert.equal(adapt.canLaunch, true);
  assert.ok(adapt.resolvedMaxStepSeconds < numerics.maxStepSeconds);
  assert.match(adapt.warnings.join(' '), /timestep reduced for CFL/);
  const short = { ...run, topology: topology.map(c => c.kind === 'exhaustRunner'
    ? { componentId: c.componentId, kind: c.kind } : c) };
  assert.match(check('detailed', {}, short).errors.join(' '), /1D CFL needs length/);
});
test('reject invalid version, NaN, duplicate IDs and invalid solver registrations', () => {
  const base = makeReferenceProfile('quick', solverIds('quick'));
  assert.match(check('quick', { schemaVersion: 2 }).errors.join(' '), /invalid reference profile/);
  assert.match(check('quick', { numerics: { ...base.numerics, maxStepSeconds: NaN } })
    .errors.join(' '), /invalid numerical/);
  assert.match(check('quick', {}, { ...run, topology: [topology[0], topology[0]] })
    .errors.join(' '), /duplicate/);
  const registry = new ReferenceSolverRegistry();
  assert.throws(() => registry.register({ contractVersion: 2, solverId: 'bad',
    kind: 'cylinderGas', solverFamily: 'fake', solverVersion: '1', support: 'implemented',
    tiers: ['quick'], precisions: ['float64'], adaptiveStep: true, resolutionBounds: {},
    stateScalarsPerCell: 5, scratchBytesPerCell: 0, traceScalarsPerCell: 2,
    baseMemoryBytes: 0, relativeWorkPerCell: 1,
  }, () => true), /registration/);
});

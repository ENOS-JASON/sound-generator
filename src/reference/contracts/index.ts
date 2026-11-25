import {
  REFERENCE_KINDS,
  REFERENCE_PROFILE_VERSION,
  REFERENCE_TIERS,
  type ReferenceComponentSelection,
  type ReferenceKind,
  type ReferencePreflightInputV1,
  type ReferenceProfileV1,
  type ReferenceSolverCapabilityV1,
} from '../../contracts/reference/index.ts';

/** A capability description alone cannot authorize a run. Registration requires readiness. */
export class ReferenceSolverRegistry {
  private readonly providers = new Map<
    string,
    {
      readonly capability: ReferenceSolverCapabilityV1;
      readonly ready: () => boolean;
    }
  >();

  register(
    capability: ReferenceSolverCapabilityV1,
    ready: () => boolean,
  ): void {
    if (
      capability.contractVersion !== REFERENCE_PROFILE_VERSION ||
      !capability.solverId ||
      !REFERENCE_KINDS.includes(capability.kind) ||
      !capability.solverFamily ||
      !capability.solverVersion ||
      !['implemented', 'approximate', 'planned', 'unsupported'].includes(
        capability.support,
      ) ||
      !Array.isArray(capability.tiers) ||
      capability.tiers.length === 0 ||
      !Array.isArray(capability.precisions) ||
      capability.tiers.some((tier) => !REFERENCE_TIERS.includes(tier)) ||
      capability.precisions.length === 0 ||
      capability.precisions.some((p) => p !== 'float32' && p !== 'float64') ||
      typeof ready !== 'function' ||
      this.providers.has(capability.solverId)
    ) {
      throw new RangeError(
        'invalid or duplicate reference solver registration',
      );
    }
    for (const value of [
      capability.stateScalarsPerCell,
      capability.traceScalarsPerCell,
      capability.scratchBytesPerCell,
      capability.baseMemoryBytes,
      capability.relativeWorkPerCell,
    ]) {
      if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError('invalid solver resource coefficient');
    }
    if (
      capability.stateScalarsPerCell === 0 ||
      capability.relativeWorkPerCell === 0
    ) {
      throw new RangeError('solver needs nonzero state/work coefficients');
    }
    for (const range of Object.values(capability.resolutionBounds)) {
      if (
        !range ||
        !Number.isSafeInteger(range.min) ||
        !Number.isSafeInteger(range.max) ||
        range.min < 0 ||
        range.max < range.min
      )
        throw new RangeError('invalid resolution bounds');
    }
    this.providers.set(capability.solverId, { capability, ready });
  }

  resolve(solverId: string) {
    return this.providers.get(solverId);
  }
}

export interface ReferencePreflightResultV1 {
  readonly canLaunch: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly resolvedMaxStepSeconds: number | null;
  readonly estimated: {
    readonly cells: number;
    readonly gasCells: number;
    readonly metalCells: number;
    readonly stateScalars: number;
    readonly peakMemoryBytes: number;
    readonly traceBytes: number;
    readonly steps: number;
    /** Relative operation units, NOT a runtime duration estimate. */
    readonly relativeWork: number;
  };
}

const axes: Record<ReferenceKind, readonly string[]> = {
  cylinderGas: ['gasZones', 'nearWallGasZones'],
  cylinderWall: [
    'linerAxialBands',
    'linerRadialLayers',
    'headLayers',
    'pistonCrownLayers',
  ],
  intakeRunner: ['axialCellsPerRunner', 'wallAxialBands', 'wallRadialLayers'],
  exhaustRunner: ['axialCellsPerRunner', 'wallAxialBands', 'wallRadialLayers'],
};
function positive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
function safeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}
function isReady(check: () => boolean): boolean {
  try {
    return check() === true;
  } catch {
    return false;
  }
}
function cellsFor(config: ReferenceComponentSelection): {
  cells: number;
  gas: number;
  metal: number;
} {
  switch (config.kind) {
    case 'cylinderGas':
      return {
        cells: config.resolution.gasZones,
        gas: config.resolution.gasZones,
        metal: 0,
      };
    case 'cylinderWall': {
      const r = config.resolution;
      const metal =
        r.linerAxialBands * r.linerRadialLayers +
        r.headLayers +
        r.pistonCrownLayers;
      return { cells: metal, gas: 0, metal };
    }
    case 'intakeRunner':
    case 'exhaustRunner': {
      const r = config.resolution;
      const metal = r.wallAxialBands * r.wallRadialLayers;
      return {
        cells: r.axialCellsPerRunner + metal,
        gas: r.axialCellsPerRunner,
        metal,
      };
    }
  }
}

/** Never launches a job: consumes versioned profile + topology and checks readiness first. */
export function preflightReferenceRun(
  profile: ReferenceProfileV1,
  run: ReferencePreflightInputV1,
  registry: ReferenceSolverRegistry,
): ReferencePreflightResultV1 {
  const errors: string[] = [];
  const warnings: string[] = [];
  const global = profile.numerics;
  const empty = {
    cells: 0,
    gasCells: 0,
    metalCells: 0,
    stateScalars: 0,
    peakMemoryBytes: 0,
    traceBytes: 0,
    steps: 0,
    relativeWork: 0,
  };
  if (
    profile.schemaVersion !== REFERENCE_PROFILE_VERSION ||
    !REFERENCE_TIERS.includes(profile.tier) ||
    typeof profile.profileId !== 'string' ||
    !profile.profileId.trim()
  )
    errors.push('invalid reference profile/version');
  if (
    !positive(run.durationSeconds) ||
    !safeInteger(run.scenarioCount) ||
    run.scenarioCount === 0 ||
    !positive(run.maximumRpm) ||
    !positive(run.availableMemoryMiB) ||
    !['browser', 'cli'].includes(run.execution) ||
    !Array.isArray(run.topology) ||
    !run.topology.length
  )
    errors.push('invalid run or topology bounds');
  if (
    !positive(global.maxStepSeconds) ||
    !positive(global.maxCrankAngleDegrees) ||
    !positive(global.outputIntervalSeconds) ||
    !positive(global.maxMemoryMiB) ||
    !positive(global.maxTraceMiB) ||
    !safeInteger(global.maxCells) ||
    global.maxCells === 0 ||
    !safeInteger(global.maxSteps) ||
    global.maxSteps === 0 ||
    !positive(global.cflTarget) ||
    global.cflTarget > 1 ||
    !positive(global.massResidualFraction) ||
    global.massResidualFraction > 1 ||
    !positive(global.energyResidualFraction) ||
    global.energyResidualFraction > 1 ||
    !['float32', 'float64'].includes(global.precision) ||
    typeof global.adaptiveStep !== 'boolean' ||
    !profile.components ||
    !profile.overrides ||
    typeof profile.overrides !== 'object'
  ) {
    errors.push('invalid numerical tolerances, precision or resource budgets');
  }
  if (errors.length)
    return {
      canLaunch: false,
      errors,
      warnings,
      resolvedMaxStepSeconds: null,
      estimated: empty,
    };

  const ids = new Set<string>();
  const instances = new Map(run.topology.map((c) => [c.componentId, c]));
  if (instances.size !== run.topology.length)
    errors.push('duplicate topology component ID');
  for (const key of Object.keys(profile.overrides)) {
    if (!instances.has(key)) errors.push(`override ${key}: unknown component`);
  }
  let cells = 0,
    gasCells = 0,
    metalCells = 0,
    stateScalars = 0,
    memoryBytes = 0,
    traceScalars = 0,
    workPerStep = 0;
  let dt = Math.min(
    global.maxStepSeconds,
    global.maxCrankAngleDegrees / (run.maximumRpm * 6),
  );
  const bytesPerScalar = global.precision === 'float64' ? 8 : 4;

  for (const instance of run.topology) {
    if (
      !instance.componentId.trim() ||
      ids.has(instance.componentId) ||
      !REFERENCE_KINDS.includes(instance.kind)
    ) {
      errors.push(
        `invalid or duplicate topology component ${instance.componentId}`,
      );
      continue;
    }
    ids.add(instance.componentId);
    const config =
      profile.overrides[instance.componentId] ??
      profile.components[instance.kind];
    if (
      !config ||
      config.kind !== instance.kind ||
      !REFERENCE_TIERS.includes(config.tier) ||
      typeof config.solverId !== 'string' ||
      !config.resolution ||
      typeof config.resolution !== 'object'
    ) {
      errors.push(
        `${instance.componentId}: wrong or missing reference component configuration`,
      );
      continue;
    }
    const descriptor = registry.resolve(config.solverId);
    if (
      !descriptor ||
      descriptor.capability.kind !== instance.kind ||
      !descriptor.capability.tiers.includes(config.tier) ||
      !descriptor.capability.precisions.includes(global.precision) ||
      (global.adaptiveStep && !descriptor.capability.adaptiveStep) ||
      !['implemented', 'approximate'].includes(descriptor.capability.support) ||
      !isReady(descriptor.ready)
    ) {
      errors.push(
        `${instance.componentId}: solver ${config.solverId} unavailable or unsupported before launch`,
      );
      continue;
    }
    if (descriptor.capability.support === 'approximate') {
      warnings.push(
        `${instance.componentId}: approximate solver, not measurement-verified`,
      );
    }
    const resolution = config.resolution as unknown as Record<string, number>;
    const expectedAxes = axes[instance.kind];
    for (const axis of expectedAxes) {
      const value = resolution[axis];
      const range =
        descriptor.capability.resolutionBounds[
          axis as keyof typeof descriptor.capability.resolutionBounds
        ];
      if (
        typeof value !== 'number' ||
        !safeInteger(value) ||
        (axis !== 'nearWallGasZones' && value === 0) ||
        !range ||
        value < range.min ||
        value > range.max
      ) {
        errors.push(
          `${instance.componentId}: ${axis} outside solver capability bounds`,
        );
      }
    }
    if (Object.keys(resolution).some((axis) => !expectedAxes.includes(axis))) {
      errors.push(`${instance.componentId}: invalid resolution axis`);
    }
    if (
      config.kind === 'cylinderGas' &&
      config.resolution.nearWallGasZones >= config.resolution.gasZones &&
      config.resolution.nearWallGasZones !== 0
    )
      errors.push(
        `${instance.componentId}: near-wall zones must be a proper subset`,
      );
    const count = cellsFor(config);
    if (!safeInteger(count.cells))
      errors.push(`${instance.componentId}: zone/cell integer overflow`);
    cells += count.cells;
    gasCells += count.gas;
    metalCells += count.metal;
    const cap = descriptor.capability;
    stateScalars += count.cells * cap.stateScalarsPerCell;
    memoryBytes +=
      count.cells *
        (cap.stateScalarsPerCell * bytesPerScalar + cap.scratchBytesPerCell) +
      cap.baseMemoryBytes;
    traceScalars += count.cells * cap.traceScalarsPerCell;
    workPerStep += count.cells * cap.relativeWorkPerCell;
    if (
      (config.kind === 'intakeRunner' || config.kind === 'exhaustRunner') &&
      config.resolution.axialCellsPerRunner > 1
    ) {
      if (
        !positive(instance.lengthMeters ?? NaN) ||
        !positive(instance.maxCharacteristicSpeedMetersPerSecond ?? NaN)
      ) {
        errors.push(
          `${instance.componentId}: 1D CFL needs length and conservative wave-speed bound`,
        );
      } else {
        const cflDt =
          (global.cflTarget * instance.lengthMeters!) /
          (config.resolution.axialCellsPerRunner *
            instance.maxCharacteristicSpeedMetersPerSecond!);
        if (!global.adaptiveStep && dt > cflDt)
          errors.push(`${instance.componentId}: fixed step violates CFL`);
        if (global.adaptiveStep && dt > cflDt) {
          dt = cflDt;
          warnings.push(`${instance.componentId}: timestep reduced for CFL`);
        }
      }
    }
  }

  const steps = Math.ceil(run.durationSeconds / dt) * run.scenarioCount;
  const sampleCount =
    (Math.ceil(run.durationSeconds / global.outputIntervalSeconds) + 1) *
    run.scenarioCount;
  const traceBytes = traceScalars * bytesPerScalar * sampleCount;
  const relativeWork = workPerStep * steps;
  const estimated = {
    cells,
    gasCells,
    metalCells,
    stateScalars,
    peakMemoryBytes: memoryBytes,
    traceBytes,
    steps,
    relativeWork,
  };
  if (
    [
      cells,
      gasCells,
      metalCells,
      stateScalars,
      memoryBytes,
      traceBytes,
      steps,
      relativeWork,
    ].some((value) => !Number.isSafeInteger(value))
  )
    errors.push('resource estimate overflows safe integer');
  if (cells > global.maxCells) errors.push('cell budget exceeded');
  if (
    memoryBytes >
    Math.min(global.maxMemoryMiB, run.availableMemoryMiB) * 1_048_576
  ) {
    errors.push('memory budget exceeded');
  }
  if (traceBytes > global.maxTraceMiB * 1_048_576)
    errors.push('trace budget exceeded');
  if (
    run.execution === 'browser' &&
    memoryBytes + traceBytes > run.availableMemoryMiB * 1_048_576
  ) {
    errors.push('browser output memory budget exceeded');
  }
  if (steps > global.maxSteps) errors.push('step budget exceeded');
  // The estimator is a declared solver footprint, not a wall-time or peak-RSS benchmark.
  return {
    canLaunch: errors.length === 0,
    errors,
    warnings,
    resolvedMaxStepSeconds: Number.isFinite(dt) && dt > 0 ? dt : null,
    estimated,
  };
}

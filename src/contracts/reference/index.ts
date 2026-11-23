/** AG-M0-08: reference-only configuration, independent of the real-time solver. */
import type { ModelSupport } from '../vehicle-definition.ts';
export const REFERENCE_PROFILE_VERSION = 1 as const;
export const REFERENCE_TIERS = ['quick', 'balanced', 'detailed', 'research'] as const;
export type ReferenceTier = (typeof REFERENCE_TIERS)[number];
export const REFERENCE_KINDS = [
  'cylinderGas',
  'cylinderWall',
  'intakeRunner',
  'exhaustRunner',
] as const;
export type ReferenceKind = (typeof REFERENCE_KINDS)[number];
export type ReferencePrecision = 'float32' | 'float64';
export type ReferenceSupport = ModelSupport;

export interface CylinderGasResolution {
  readonly gasZones: number;
  /** A subset of gasZones, never an additional number of gas cells. */
  readonly nearWallGasZones: number;
}
export interface CylinderWallResolution {
  readonly linerAxialBands: number;
  readonly linerRadialLayers: number;
  readonly headLayers: number;
  readonly pistonCrownLayers: number;
}
export interface RunnerResolution {
  readonly axialCellsPerRunner: number;
  readonly wallAxialBands: number;
  readonly wallRadialLayers: number;
}
export interface ReferenceResolutionMap {
  readonly cylinderGas: CylinderGasResolution;
  readonly cylinderWall: CylinderWallResolution;
  readonly intakeRunner: RunnerResolution;
  readonly exhaustRunner: RunnerResolution;
}
export type ResolutionAxis = keyof CylinderGasResolution | keyof CylinderWallResolution | keyof RunnerResolution;
export interface ReferenceComponentConfig<K extends ReferenceKind = ReferenceKind> {
  readonly kind: K;
  readonly tier: ReferenceTier;
  readonly solverId: string;
  readonly resolution: ReferenceResolutionMap[K];
}
export type ReferenceComponentSelection = {
  [K in ReferenceKind]: ReferenceComponentConfig<K>;
}[ReferenceKind];
export interface ReferenceNumericsV1 {
  readonly maxStepSeconds: number;
  readonly maxCrankAngleDegrees: number;
  readonly adaptiveStep: boolean;
  readonly cflTarget: number;
  readonly precision: ReferencePrecision;
  readonly outputIntervalSeconds: number;
  readonly massResidualFraction: number;
  readonly energyResidualFraction: number;
  readonly maxCells: number;
  readonly maxMemoryMiB: number;
  readonly maxTraceMiB: number;
  readonly maxSteps: number;
}
export interface ReferenceProfileV1 {
  readonly schemaVersion: typeof REFERENCE_PROFILE_VERSION;
  readonly profileId: string;
  readonly tier: ReferenceTier;
  readonly numerics: ReferenceNumericsV1;
  readonly components: { readonly [K in ReferenceKind]: ReferenceComponentConfig<K> };
  /** Exact physical component IDs; overrides must match topology and kind. */
  readonly overrides: Readonly<Record<string, ReferenceComponentSelection>>;
}

export interface ReferenceSolverCapabilityV1 {
  readonly contractVersion: typeof REFERENCE_PROFILE_VERSION;
  readonly solverId: string;
  readonly kind: ReferenceKind;
  readonly solverFamily: string;
  readonly solverVersion: string;
  readonly support: ReferenceSupport;
  readonly tiers: readonly ReferenceTier[];
  readonly precisions: readonly ReferencePrecision[];
  readonly adaptiveStep: boolean;
  readonly resolutionBounds: Readonly<Partial<Record<ResolutionAxis, { readonly min: number; readonly max: number }>>>;
  /** Resource estimator coefficients; not measured execution-time guarantees. */
  readonly stateScalarsPerCell: number;
  readonly scratchBytesPerCell: number;
  readonly traceScalarsPerCell: number;
  readonly baseMemoryBytes: number;
  readonly relativeWorkPerCell: number;
}
export interface ReferenceTopologyComponentV1 {
  readonly componentId: string;
  readonly kind: ReferenceKind;
  /** Required for 1D runners, where axialCellsPerRunner > 1. */
  readonly lengthMeters?: number;
  /** Conservative upper bound on |flow velocity| + sound speed, m/s. */
  readonly maxCharacteristicSpeedMetersPerSecond?: number;
}
export interface ReferencePreflightInputV1 {
  readonly durationSeconds: number;
  readonly scenarioCount: number;
  readonly maximumRpm: number;
  readonly execution: 'browser' | 'cli';
  readonly topology: readonly ReferenceTopologyComponentV1[];
  /** Execution environment resource ceiling, independent of user profile. */
  readonly availableMemoryMiB: number;
}

/** Template choices are *not* registered runnable solver implementations. */
export const REFERENCE_TIER_RESOLUTIONS: Readonly<{ [K in ReferenceTier]: ReferenceResolutionMap }> = {
  quick: {
    cylinderGas: { gasZones: 1, nearWallGasZones: 0 },
    cylinderWall: { linerAxialBands: 1, linerRadialLayers: 1, headLayers: 1, pistonCrownLayers: 1 },
    intakeRunner: { axialCellsPerRunner: 1, wallAxialBands: 1, wallRadialLayers: 1 },
    exhaustRunner: { axialCellsPerRunner: 1, wallAxialBands: 1, wallRadialLayers: 1 },
  },
  balanced: {
    cylinderGas: { gasZones: 2, nearWallGasZones: 0 },
    cylinderWall: { linerAxialBands: 3, linerRadialLayers: 1, headLayers: 1, pistonCrownLayers: 1 },
    intakeRunner: { axialCellsPerRunner: 1, wallAxialBands: 1, wallRadialLayers: 1 },
    exhaustRunner: { axialCellsPerRunner: 1, wallAxialBands: 1, wallRadialLayers: 1 },
  },
  detailed: {
    cylinderGas: { gasZones: 16, nearWallGasZones: 4 },
    cylinderWall: { linerAxialBands: 8, linerRadialLayers: 3, headLayers: 3, pistonCrownLayers: 3 },
    intakeRunner: { axialCellsPerRunner: 32, wallAxialBands: 8, wallRadialLayers: 2 },
    exhaustRunner: { axialCellsPerRunner: 64, wallAxialBands: 16, wallRadialLayers: 3 },
  },
  research: {
    cylinderGas: { gasZones: 48, nearWallGasZones: 12 },
    cylinderWall: { linerAxialBands: 20, linerRadialLayers: 6, headLayers: 6, pistonCrownLayers: 6 },
    intakeRunner: { axialCellsPerRunner: 128, wallAxialBands: 32, wallRadialLayers: 5 },
    exhaustRunner: { axialCellsPerRunner: 256, wallAxialBands: 64, wallRadialLayers: 6 },
  },
};

/** Caller supplies explicit provider IDs; no implicit solver or tier fallback. */
export function makeReferenceProfile(
  tier: ReferenceTier,
  solverIds: Readonly<Record<ReferenceKind, string>>,
): ReferenceProfileV1 {
  if (!REFERENCE_TIERS.includes(tier)) throw new RangeError('unsupported reference tier');
  const resolution = REFERENCE_TIER_RESOLUTIONS[tier];
  const components = Object.fromEntries(REFERENCE_KINDS.map((kind) => [
    kind, { kind, tier, solverId: solverIds[kind], resolution: { ...resolution[kind] } },
  ])) as unknown as ReferenceProfileV1['components'];
  const steps = { quick: 0.001, balanced: 0.0001, detailed: 0.00001, research: 0.000001 };
  const degrees = { quick: 5, balanced: 1, detailed: 0.25, research: 0.05 };
  return {
    schemaVersion: REFERENCE_PROFILE_VERSION,
    profileId: `reference-${tier}`,
    tier,
    components,
    overrides: {},
    numerics: {
      maxStepSeconds: steps[tier], maxCrankAngleDegrees: degrees[tier], adaptiveStep: true,
      cflTarget: 0.6, precision: 'float64', outputIntervalSeconds: 0.001,
      massResidualFraction: 1e-5, energyResidualFraction: 1e-5,
      maxCells: 250_000, maxMemoryMiB: 1024, maxTraceMiB: 1024,
      maxSteps: 100_000_000,
    },
  };
}

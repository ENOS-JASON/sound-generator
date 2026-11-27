import type { PressureBasis } from '../ports/index.ts';

export const APPROXIMATION_VERSION = 1 as const;

/** Canonical SI quantities only; display conversion belongs outside the solver. */
export type ApproximationUnit =
  | '1'
  | 'rad'
  | 'rad/s'
  | 'N*m'
  | 'Pa'
  | 'K'
  | 'kg/s'
  | 'kg'
  | 'm'
  | 'm2'
  | 'm3'
  | 'm/s'
  | 'N'
  | 'W'
  | 'J'
  | 'V'
  | 'A'
  | 's';

export type QuantityUnit =
  | { readonly unit: 'Pa'; readonly pressureBasis: PressureBasis }
  | {
      readonly unit: Exclude<ApproximationUnit, 'Pa'>;
      readonly pressureBasis?: never;
    };

export type Range = readonly [minimum: number, maximum: number];
export type QuantitySpec = QuantityUnit & { readonly bounds: Range };
export type Fields = Readonly<Record<string, QuantitySpec>>;
export type Units = Readonly<Record<string, QuantityUnit>>;
export type Values = Readonly<Record<string, number>>;

export interface FastComponentModel {
  readonly schemaVersion: typeof APPROXIMATION_VERSION;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly purpose: string;
  readonly operatingDomain: string;
  readonly inputs: Fields;
  readonly parameters: Fields;
  readonly outputs: Fields;
  readonly observedState: readonly string[];
  /** Descriptive estimate, not a measured runtime budget. */
  readonly estimatedCost: string;
  readonly baseline: (inputs: Values, parameters: Values) => Values;
  readonly coefficients?: Fields;
  /** Trusted registered code, never executable code from imported profiles. */
  readonly calibrated?: (
    inputs: Values,
    parameters: Values,
    coefficients: Values,
    baseline: Values,
  ) => Values;
  readonly invariant?: (
    inputs: Values,
    parameters: Values,
    outputs: Values,
  ) => boolean;
}

interface ProfileIdentity {
  readonly schemaVersion: typeof APPROXIMATION_VERSION;
  readonly profileHash: string;
  readonly datasetHash: string;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly componentId: string;
  readonly componentSchemaVersion: number;
  /** Identity of geometry, topology, parameters and calibration conditions. */
  readonly contextHash: string;
  readonly inputDomain: Readonly<Record<string, Range>>;
  readonly uncertainty: number;
}

export type ApproximationProfile = ProfileIdentity &
  (
    | { readonly kind: 'coefficients'; readonly values: Values }
    | {
        readonly kind: 'lookup1d';
        readonly input: string;
        readonly output: string;
        readonly knots: readonly number[];
        /** Additive correction in the declared output SI unit. */
        readonly corrections: readonly number[];
      }
  );

export interface ComponentModelBinding {
  readonly schemaVersion: typeof APPROXIMATION_VERSION;
  readonly componentId: string;
  readonly componentSchemaVersion: number;
  readonly operatingDomain: string;
  readonly contextHash: string;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly inputs: Units;
  readonly outputs: Units;
  readonly parameters: Values;
  readonly profile?: ApproximationProfile;
}

export type ModelStatus = 'baseline' | 'trained' | 'fallback';
export type FallbackReason =
  | 'incompatible-profile'
  | 'outside-calibration-domain'
  | 'invalid-calibrated-output';

export interface ApproximationResult {
  readonly componentId: string;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly modelStatus: ModelStatus;
  readonly outputs: Values;
  readonly profileHash?: string;
  readonly fallbackReason?: FallbackReason;
}

/** A reference adapter supplies matching boundary quantities, not mesh state. */
export interface ReferenceBoundarySample {
  readonly schemaVersion: typeof APPROXIMATION_VERSION;
  readonly runId: string;
  readonly componentId: string;
  readonly componentSchemaVersion: number;
  readonly contextHash: string;
  readonly referenceModelVersion: string;
  readonly simulationTick: number;
  readonly units: Units;
  readonly outputs: Values;
  readonly uncertainty: number;
}

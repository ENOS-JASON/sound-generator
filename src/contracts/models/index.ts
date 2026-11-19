import type { ComponentNodeV1, PhysicalPort } from '../ports/index.ts';
import type { VehicleDefinitionV2 } from '../vehicle-definition.ts';

/** AG-M0-05. Additive plugin contracts; no VehicleDefinitionV2 migration. */
export const MODEL_INTERFACE_VERSION = 1 as const;
export const MODEL_FAMILIES = [
  'controller',
  'induction',
  'engine',
  'transmission',
  'differential',
  'electrical',
  'audio',
  'renderer',
] as const;
export type ModelFamily = (typeof MODEL_FAMILIES)[number];

/** Every plugin belongs to one explicit per-run registry and graph component. */
export interface ModelIdentity<F extends ModelFamily> {
  readonly interfaceVersion: typeof MODEL_INTERFACE_VERSION;
  readonly family: F;
  readonly componentId: string;
  readonly ports: readonly PhysicalPort[];
}

/** Controller output requests actuators; it never advances the solver clock. */
export interface ControlSensors {
  readonly engineSpeedRadPerSecond: number;
  readonly manifoldPressurePaAbsolute: number;
  readonly intakeTemperatureK: number;
  readonly coolantTemperatureK: number;
  readonly electricalBusVoltageV: number;
}
export interface DriverDemand {
  readonly throttleFraction: number;
  readonly starterRequested: boolean;
}
export interface ControlActions {
  readonly throttleFraction: number;
  readonly fuelMassKgPerCycle: number;
  readonly sparkAdvanceRadiansBeforeTdc: number;
}
export interface MechanicalControlStrategy extends ModelIdentity<'controller'> {
  readonly controlKind: 'mechanical';
  calculate(
    sensors: Readonly<ControlSensors>,
    demand: Readonly<DriverDemand>,
  ): Readonly<ControlActions>;
}
export interface EcuControlStrategy extends ModelIdentity<'controller'> {
  readonly controlKind: 'ecu';
  calculate(
    sensors: Readonly<ControlSensors>,
    demand: Readonly<DriverDemand>,
  ): Readonly<ControlActions>;
}
export type ControlStrategy = MechanicalControlStrategy | EcuControlStrategy;

/** Physical contributions are resolved by the future coupled solver, not here. */
export interface GasBoundary {
  readonly pressurePaAbsolute: number;
  readonly temperatureK: number;
  readonly massFlowKgPerSecond: number;
}
export interface InductionContribution {
  readonly outlet: Readonly<GasBoundary>;
  /** Positive power enters the named component; no free compressor power. */
  readonly shaftPowerIntoComponentW: number;
  readonly electricalPowerIntoComponentW: number;
  readonly exhaustPowerIntoComponentW: number;
  readonly thermalPowerIntoComponentW: number;
}
export interface InductionModel extends ModelIdentity<'induction'> {
  contribute(inlet: Readonly<GasBoundary>): Readonly<InductionContribution>;
}

export interface EngineAssembly {
  readonly familyId: string;
  readonly components: readonly ComponentNodeV1[];
  readonly bankIds: readonly string[];
}
export interface EngineFamilyModel extends ModelIdentity<'engine'> {
  /** Initially uses the accepted v2 four-stroke definition, not a new schema. */
  createAssembly(
    definition: Readonly<VehicleDefinitionV2['engine']>,
  ): Readonly<EngineAssembly>;
}

export interface RotationalBoundary {
  readonly portId: string;
  readonly angularVelocityRadPerSecond: number;
  readonly torqueOnComponentNm: number;
}
export interface RotationalContribution {
  readonly ports: readonly RotationalBoundary[];
  readonly dissipatedPowerW: number;
  readonly storedEnergyRateW: number;
}
export interface TransmissionModel extends ModelIdentity<'transmission'> {
  contribute(
    shafts: readonly Readonly<RotationalBoundary>[],
    selectedGear: number | 'neutral',
  ): Readonly<RotationalContribution>;
}
export interface DifferentialModel extends ModelIdentity<'differential'> {
  contribute(
    shafts: readonly Readonly<RotationalBoundary>[],
  ): Readonly<RotationalContribution>;
}

export interface ElectricalBoundary {
  readonly voltageV: number;
  readonly currentIntoComponentA: number;
  readonly temperatureK: number;
}
export interface ElectricalContribution {
  readonly currentIntoComponentA: number;
  readonly shaftPowerIntoComponentW: number;
  readonly dissipatedPowerW: number;
  readonly storedEnergyRateW: number;
}
export interface ElectricalModel extends ModelIdentity<'electrical'> {
  contribute(
    input: Readonly<ElectricalBoundary>,
  ): Readonly<ElectricalContribution>;
}

/** Snapshots are read-only observations, never authoritative VehicleState. */
export interface ModelObservation {
  readonly simulationTick: number;
  readonly simulatedTimeSeconds: number;
  /** Values are SI; AG-M0-11 owns stable metric IDs and quantity metadata. */
  readonly valuesSI: Readonly<Record<string, number>>;
}
export interface AudioFrameContext {
  readonly firstSampleFrame: number;
  readonly sampleCount: number;
  readonly sampleRateHz: number;
  readonly observation: Readonly<ModelObservation>;
}
export interface AudioSourceModel extends ModelIdentity<'audio'> {
  /** Writes synthesized samples into a caller-owned buffer, not into physics. */
  render(frame: Readonly<AudioFrameContext>, output: Float32Array): void;
}
export interface CylinderVisualState {
  readonly cylinderId: number;
  readonly bankId: string;
  readonly pistonTravelFraction: number;
  readonly intakeValveLiftMeters: number;
  readonly exhaustValveLiftMeters: number;
  readonly combustionFraction: number;
}
export interface EngineVisualProjection extends ModelIdentity<'renderer'> {
  /** Independent of camera/listening perspective; no solver mutation. */
  project(observation: Readonly<ModelObservation>): readonly CylinderVisualState[];
}

export interface ModelInstanceMap {
  readonly controller: ControlStrategy;
  readonly induction: InductionModel;
  readonly engine: EngineFamilyModel;
  readonly transmission: TransmissionModel;
  readonly differential: DifferentialModel;
  readonly electrical: ElectricalModel;
  readonly audio: AudioSourceModel;
  readonly renderer: EngineVisualProjection;
}

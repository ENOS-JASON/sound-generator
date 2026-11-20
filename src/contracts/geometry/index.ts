import type { VehicleDefinitionV2 } from '../vehicle-definition.ts';

/**
 * AG-M0-07: physical dimensions are canonical SI, matching the v2 vehicle
 * engine. Display-unit selection and conversion remain in the configurator.
 * No independently editable displacement is stored in this contract.
 */
export type CylinderGeometrySI = Readonly<
  Pick<
    VehicleDefinitionV2['engine'],
    'boreMeters' | 'strokeMeters' | 'connectingRodMeters' | 'compressionRatio'
  >
>;

/** Uniform geometry only; later heterogeneous families must sum actual cylinders. */
export type UniformEngineGeometrySI = CylinderGeometrySI & {
  readonly cylinderCount: number;
};

export interface DerivedCylinderGeometrySI {
  readonly boreAreaSquareMeters: number;
  readonly crankRadiusMeters: number;
  readonly sweptVolumeCubicMeters: number;
  readonly clearanceVolumeCubicMeters: number;
  readonly volumeAtTdcCubicMeters: number;
  readonly volumeAtBdcCubicMeters: number;
}

export interface DerivedUniformEngineGeometrySI {
  readonly cylinderCount: number;
  readonly cylinder: DerivedCylinderGeometrySI;
  readonly totalDisplacementCubicMeters: number;
  readonly totalDisplacementLiters: number;
  readonly totalDisplacementCc: number;
}

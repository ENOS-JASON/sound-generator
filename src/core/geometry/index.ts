import type {
  CylinderGeometrySI,
  DerivedCylinderGeometrySI,
  DerivedUniformEngineGeometrySI,
  UniformEngineGeometrySI,
} from '../../contracts/geometry/index.ts';

function positiveFinite(value: number, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field}: expected positive finite SI value`);
  }
  return value;
}

function finiteResult(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `${field}: non-finite or non-positive derived geometry`,
    );
  }
  return value;
}

/**
 * Derive swept and clearance volumes from geometry, never a separate input.
 * This enforces universal physical constraints; the versioned vehicle importer
 * separately enforces its model-specific size and compression-ratio ranges.
 */
export function deriveCylinderGeometry(
  geometry: CylinderGeometrySI,
): DerivedCylinderGeometrySI {
  const bore = positiveFinite(geometry.boreMeters, 'boreMeters');
  const stroke = positiveFinite(geometry.strokeMeters, 'strokeMeters');
  const rod = positiveFinite(
    geometry.connectingRodMeters,
    'connectingRodMeters',
  );
  const ratio = positiveFinite(geometry.compressionRatio, 'compressionRatio');
  const crankRadius = finiteResult(stroke / 2, 'crankRadiusMeters');
  if (rod <= crankRadius) {
    throw new RangeError('connectingRodMeters: rod must exceed crank radius');
  }
  if (ratio <= 1) {
    throw new RangeError('compressionRatio: must exceed 1');
  }

  const boreArea = finiteResult(
    (Math.PI / 4) * bore ** 2,
    'boreAreaSquareMeters',
  );
  const swept = finiteResult(boreArea * stroke, 'sweptVolumeCubicMeters');
  const clearance = finiteResult(
    swept / (ratio - 1),
    'clearanceVolumeCubicMeters',
  );
  const bdc = finiteResult(clearance + swept, 'volumeAtBdcCubicMeters');
  return Object.freeze({
    boreAreaSquareMeters: boreArea,
    crankRadiusMeters: crankRadius,
    sweptVolumeCubicMeters: swept,
    clearanceVolumeCubicMeters: clearance,
    volumeAtTdcCubicMeters: clearance,
    volumeAtBdcCubicMeters: bdc,
  });
}

/** One uniform piston-cylinder geometry repeated for 1..12 cylinders. */
export function deriveUniformEngineGeometry(
  geometry: UniformEngineGeometrySI,
): DerivedUniformEngineGeometrySI {
  if (
    !Number.isSafeInteger(geometry.cylinderCount) ||
    geometry.cylinderCount < 1 ||
    geometry.cylinderCount > 12
  ) {
    throw new RangeError('cylinderCount: expected integer in [1, 12]');
  }
  const cylinder = deriveCylinderGeometry(geometry);
  const total = finiteResult(
    cylinder.sweptVolumeCubicMeters * geometry.cylinderCount,
    'totalDisplacementCubicMeters',
  );
  return Object.freeze({
    cylinderCount: geometry.cylinderCount,
    cylinder,
    totalDisplacementCubicMeters: total,
    totalDisplacementLiters: finiteResult(
      total * 1000,
      'totalDisplacementLiters',
    ),
    totalDisplacementCc: finiteResult(total * 1_000_000, 'totalDisplacementCc'),
  });
}

/** Exact slider-crank cylinder volume for a conventional centered rod/piston. */
export function cylinderVolumeAtCrankAngle(
  geometry: CylinderGeometrySI,
  crankAngleRadians: number,
): number {
  if (!Number.isFinite(crankAngleRadians)) {
    throw new RangeError('crankAngleRadians: expected finite angle');
  }
  const derived = deriveCylinderGeometry(geometry);
  const radius = derived.crankRadiusMeters;
  const rod = geometry.connectingRodMeters;
  const theta = crankAngleRadians % (2 * Math.PI);
  const travel =
    radius * (1 - Math.cos(theta)) +
    rod -
    Math.sqrt(rod ** 2 - (radius * Math.sin(theta)) ** 2);
  return finiteResult(
    derived.volumeAtTdcCubicMeters + derived.boreAreaSquareMeters * travel,
    'cylinderVolumeCubicMeters',
  );
}

/** Mean piston speed (m/s) for non-negative engine speed in RPM. */
export function meanPistonSpeedMetersPerSecond(
  strokeMeters: number,
  rpm: number,
): number {
  const stroke = positiveFinite(strokeMeters, 'strokeMeters');
  if (!Number.isFinite(rpm) || rpm < 0) {
    throw new RangeError('rpm: expected finite non-negative value');
  }
  const speed = (2 * stroke * rpm) / 60;
  if (!Number.isFinite(speed)) {
    throw new RangeError('meanPistonSpeed: non-finite result');
  }
  return speed;
}

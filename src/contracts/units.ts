export const SI = Object.freeze({
  metersPerMillimeter: 0.001,
  cubicMetersPerCubicCentimeter: 1e-6,
  cubicMetersPerLiter: 0.001,
  pascalsPerBar: 100_000,
  pascalsPerPsi: 6_894.757293168,
  wattsPerMechanicalHorsepower: 745.6998715822702,
});

function finite(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('quantity must be finite');
  return value;
}

export const millimetersToMeters = (mm: number): number =>
  finite(mm) * SI.metersPerMillimeter;
export const cubicCentimetersToCubicMeters = (cc: number): number =>
  finite(cc) * SI.cubicMetersPerCubicCentimeter;
export const litersToCubicMeters = (liters: number): number =>
  finite(liters) * SI.cubicMetersPerLiter;
export const barToPascals = (bar: number): number =>
  finite(bar) * SI.pascalsPerBar;
export const psiToPascals = (psi: number): number =>
  finite(psi) * SI.pascalsPerPsi;
export const rpmToRadiansPerSecond = (rpm: number): number =>
  (finite(rpm) / 60) * (2 * Math.PI);
export const radiansPerSecondToRpm = (omega: number): number =>
  (finite(omega) / (2 * Math.PI)) * 60;
export const degreesToRadians = (degrees: number): number =>
  (finite(degrees) / 180) * Math.PI;
export const celsiusToKelvin = (celsius: number): number =>
  finite(celsius) + 273.15;
export const mechanicalHorsepowerToWatts = (hp: number): number =>
  finite(hp) * SI.wattsPerMechanicalHorsepower;

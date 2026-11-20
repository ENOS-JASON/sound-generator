# AG-M0-07 — piston-cylinder geometry

`CylinderGeometrySI` directly references the accepted v2 vehicle engine's bore,
stroke, connecting-rod length and compression-ratio fields. Lengths are meters,
angles radians, area square meters and volumes cubic meters. Displacement is
**derived**, never stored as a second editable geometry parameter.

- `deriveCylinderGeometry` calculates bore area, crank radius, swept volume,
  clearance volume, and TDC/BDC volumes for a conventional piston cylinder.
- `deriveUniformEngineGeometry` multiplies the swept volume for **1–12 equal
  cylinders**, exposing m³, liters and cc without display rounding. It must not
  be used for engines with different bore/stroke per cylinder; sum those actual
  per-cylinder volumes when that family is implemented.
- `cylinderVolumeAtCrankAngle` uses centered slider-crank kinematics in SI.
  `meanPistonSpeedMetersPerSecond` uses the explicit `2 × stroke × RPM / 60`
  relation.
- The pure functions reject non-finite/non-positive dimensions,
  `connectingRodMeters <= strokeMeters / 2`, impossible compression ratio
  `<= 1`, and invalid cylinder counts. The v2 importer separately enforces
  its published bore/stroke/rod/ratio operating ranges and bank geometry.
- For mm/in **input and display**, use the existing configurator
  `quantityField('...', 'length')` and `fromDisplayValue` / `toDisplayValue`.
  Do not round or persist display units into physics inputs.

**Boundaries:** This library does not validate deck height, piston crown, valve
interference, unequal-cylinder topology or material-specific engine limits;
those require additional parameters/providers and must not be reported as
verified by the current acceptance tests. It does not start an engine or
implement simulation physics.

**Evidence:** `tests/fixtures/geometry/i4-86mm.json` is a synthetic square
I4, not a production-car preset. Run `node --experimental-strip-types --test
tests/geometry.test.mjs` for formula, SI/display roundtrips, slider-crank,
and invalid rod/dimension cases. Run `npm run check` for the full CI gate.

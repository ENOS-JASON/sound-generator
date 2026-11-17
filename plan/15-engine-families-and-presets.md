# 15 — Engine families, geometry, firing characteristics and preset library

## Goal and support boundary

Support **configurable single-cylinder through twelve-cylinder** conventional piston engines from the outset at the data-model level, with realistic bank, crank and firing relationships. Engine-family models must be independently extensible for technologies from older cars through contemporary vehicles. A configurable schema does **not** imply that every combination has validated acoustic and thermodynamic behavior immediately.

## Initial piston-engine geometry and presets

| Layout | Bank count | Representative presets | Physically relevant differences |
|---|---:|---|---|
| Single | 1 | I1 4-stroke | large pulse-to-pulse speed variation, flywheel effects |
| Inline | 1 | I2, I3, I4, I5, I6 | firing interval, crank offsets, balance, primary/secondary vibration, length |
| V | 2 | V2, V4, V6, V8, V10, V12 | bank angle, crankpin strategy, shared/split pins, even/odd fire, manifold routing |
| Flat / boxer / opposed | 2 | flat-2, flat-4, flat-6, flat-12 | opposing piston movement, bank grouping, exhaust path, distinct boxer versus 180-degree V crank |
| Other layouts (extension) | varies | VR / narrow-angle, W, radial, modular unusual historical layouts | own bank/cylinder mapping, geometry and firing rules |

Presets must not assume that odd numbered cylinders belong to one bank, that every V8 is cross-plane, or that bank angle uniquely determines firing order. Include example V8 cross-plane/flat-plane variants, even/odd-fire twins, 60°/90° V6 where parameterized, and representative inline and flat engines. Some configurations may be physically invalid: verify crankpins, firing offsets, bank placement and exhaust routing.

## User-editable dimensions and guided selection

For every piston engine preset, expose **bore and stroke**, rod length and compression/clearance as validated physical inputs in the guided configurator. Compute displacement per cylinder and total in cc/L from geometry; don't let a separate displacement field silently disagree. Firing order and bank layouts must reflect the geometry before the user can proceed; an inline bank differs from V/flat banks. In optional expert mode, per-cylinder geometry is offered only if the selected model supports unequal cylinders, and total displacement is the sum of each actual volume. See [22](22-guided-vehicle-configurator.md).

A conventional cylinder's physical dimensions are independent from the **number of gas/thermal zones** chosen for advanced reference simulation. Multi-zone gas combustion and axial/radial wall heat transfer map to these dimensions without resizing them. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).

## Per-cylinder and per-bank model

- Cylinder id, physical bank id, bank position, bore/stroke/rod length, displacement, compression ratio, piston/rod inertias, crank phase and four-stroke phase, cam/valve timing, intake/exhaust port properties, combustion and ignition type.
- Bank angle/orientation, firing order, shared/split crankpins, crank counterweights/balance approximation, intake and exhaust manifold association, runner length, pulse merging and firing cadence.
- `theta` unwrapped crank phase; four-stroke cylinder cycle of 720°, so a crank revolution does not necessarily contain one firing from each cylinder. Model nonuniform firing and phase accurately.
- Cylinder torque/combustion contribution feeds crankshaft inertia and vibration. Sounds derive from **per-cylinder pulses, mechanical vibration, firing regularity, exhaust collector grouping and intake pulses**, not solely mean RPM.
- Visual 2D displays **one side-on row per real bank** with all cylinders and valves; 3D uses the same bank/cylinder registry, per [13](13-2d-engine-cutaway.md).

## Engine technologies as separate model families

**Piston combustion, first tier:** four-stroke spark-ignition, naturally aspirated, with configurable carburetor/mechanical ignition or ECU injection/ignition. Baseline for physics and sound.

**Piston combustion, later:** compression-ignition diesel (mechanical injection, common rail), two-stroke gasoline/diesel (port-scavenging and different firing phase), alternative fuels such as LPG/CNG/ethanol, variable valve timing/lift, cylinder deactivation, variable displacement and multi-spark. Distinct fuel and acoustic models required.

**Nonconventional combustion, later:** Wankel rotary engines, gas turbines and historical/novel powertrains when justified; treat combustion chamber geometry and event timing separately instead of pretending they have pistons/valves.

**Electrified, later:** battery-electric motors, fuel-cell electric, serial/parallel/power-split hybrids, mild hybrids, integrated starter generators, regenerative braking and blending between multiple torque producers. Hybrid/EV motor whine and gear sounds use an electrical machine model, not synthetic combustion pulses. Steam/historical external-combustion could be an independent future provider, not forced into the piston schema.

## Preset design

- A versioned, inspectable `EnginePreset` references an `engineFamily`, `cycle`, `geometry`, `cylinderBanks[]`, `crankshaft`, `combustion`, `fuelDelivery`, `controls`, `induction`, `exhaust`, `auxiliaries`, `drivetrain` and `audioProfile`.
- Catalog starts with runnable **I1, I2, I3, I4, I5, I6, V6, V8 cross-plane, V8 flat-plane, V10, V12, flat-2, flat-4, flat-6** profiles plus placeholders for other validated models; provide meaningful preset metadata and estimated fidelity level.
- All presets include operating envelopes, idle/redline constraints, firing order, geometry, example torque/loss maps, sound source routing, controller technology and validation scenario IDs. Representative starter/battery profiles and temperatures are separately selected, not hard-coded into every engine.
- User edits may change cylinder dimensions/count, bank mapping/angle, timing, firing order and manifolds within valid physical bounds; regenerate relevant state arrays and visuals only on safe configuration reset.

## Physical and sonic test criteria

- [ ] One cylinder vs twelve cylinders produce correct *actual* pulse cadence and dynamic crank ripple at comparable RPM/load.
- [ ] Inline/V/flat geometry drives piston timing, bank identification and 2D row layout; 3D uses the same source.
- [ ] Cross-plane and flat-plane V8 presets have the appropriate independently specified crank/firing order and bank collector impulses.
- [ ] Two physically distinct layouts do not collapse to identical samples merely because RPM and cylinder count match.
- [ ] Cylinder deactivation/misfire and different exhaust bank merging produce causally distinct sound and torque.
- [ ] All shipped presets pass start, idle, sweep, limiter/shutdown, stall (where relevant) and schema import/export scenarios.
- [ ] Unsupported engine families show `planned` rather than generating fake combustion/valvetrain output.

## Phasing

M0/M1: generic bank/cylinder/crank schemas plus a few verified 4-stroke examples. M2/M3: physically driven sounds and bank-aware renderers. M4/M5: expand verified 1..12-cylinder catalog and layout-specific drivability. M6/M7: calibrate and test profiles across layout families. Future extensions add other thermodynamic cycles/motor types through new providers without breaking old presets.

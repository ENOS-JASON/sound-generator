# 21 — Adjustable-fidelity reference simulation and spatially resolved components

**Status: required design.** Advanced training is not one fixed "high quality" solver. It must let the user choose computational detail, per physical component, and generate a measurable, reproducible reference corpus for fitting the **separate real-time model**. This extends [05 — Training and calibration](05-training-and-calibration.md), [20 — Torque/power/energy](20-torque-power-load-and-energy.md) and [14 — Component architecture](14-modular-typescript-platform.md).

## Extreme-fidelity workload policy

**No restrictive wall-time target:** at Research level a single engine/piston cycle can take **multiple real hours or longer**. That is acceptable, provided the run has numerical/energy validation, progress measured in crank angle/simulated time, explicit resource budgets and checkpoint/resume. Use an offline worker-threads CLI on a dedicated machine with configurable use of **all available logical CPU cores**, writing zone-level results to disk and using multiple workers for independent reference runs. A single fine-grid cycle may remain partially serial; do not imply all threads always speed up one model. The browser's real-time engine and GitHub Pages deployment stay independent.

Research study settings also support **replicates for validation**, **one changed part/parameter**, and **part-preset/multiple component changes** with matched seeds and scenario steps. Capture every installed part, its precise geometry/parameters/materials, connected flow/torque ports, solver versions/fidelity/mesh, controls, environmental state, physical and acoustic output, and a precise baseline/variant diff. This is required for extracting comparable responses into reusable simplified maps; see [27](27-high-fidelity-experiment-orchestration.md).

## Goals and boundaries

1. Start with selectable **Quick / Balanced / Detailed / Research** reference presets and an **Advanced** editor for overrides. Each preset sets numerical resolution, enabled physical mechanisms, output frequency and cost limits. A preset is a versioned configuration, not a subjective quality guarantee.
2. Support **per-component fidelity** independently: combustion, cylinder gas, cylinder metal/walls, intake runners, valves/ports, manifolds, compressor/turbine, charge cooler, exhaust runners/collectors/muffler and thermal/drivetrain/electrical submodels where applicable.
3. Simulate enough spatial structure to represent local pressure, temperature, mass flow, flame propagation and wall heat transfer **where the selected model supports it**. Higher fidelity must not silently imply full 3D CFD or chemical kinetics accuracy.
4. Keep advanced reference simulation and mesh/zone structures out of the AudioWorklet. Browser Web Workers may run constrained jobs; large sweeps can use an offline TypeScript/Node CLI or an explicitly opted-in local tool. GitHub Pages remains a static site with no runtime server.
5. Convert reference results to versioned tables, fitted parameters, acoustic impulse/resonance descriptors or small surrogates for a physically constrained, fast real-time model. Do not ship the raw reference mesh as a real-time workload.

## Selectable detail levels

| Detail profile | Cylinder gas / combustion | Cylinder and wall heat transfer | Intake/exhaust and other gas paths | Typical use |
|---|---|---|---|---|
| **Quick** | Uniform 0D thermodynamic zone, fitted heat-release profile | Lumped metal temperature/heat loss | Lumped plenums, simple delay/resonator | Many parameter sweep cases; browser-friendly |
| **Balanced** | Two-zone **unburned/burned** gas with crank-angle heat release, bounded mass exchange | Split head/piston/liner temperatures and near-wall loss | Several 0D volumes / quasi-1D acoustic sections | Regular training and transient analysis |
| **Detailed** | Multi-zone gas with configurable burned/unburned/near-wall zones and heat-release propagation | **Multiple metal wall sections** plus conductive layers and local gas-to-wall flux | 1D finite-volume or wave-propagation **axial cells** for runners, exhaust pipes, collectors; wall temperature layers | Crank-resolved pressure, flow and pulse calibration |
| **Research** | Finer, optionally nonuniform gas zoning with localized reaction/heat-transfer models where implemented | Refined liner axial zones, metal depth layers, piston crown/head/contact partitions | Finer 1D network cells, junction/reflection models and multi-layer component walls | Convergence/sensitivity/held-out validation, usually CLI |

These rows describe planned model tiers and features; each numerical/physical implementation must identify **supported / approximate / planned** status. "Research" is not automatically more accurate; convergence and external measurement agreement are required.

## Multi-zone cylinder model

### Cylinder gas / combustion

A realistic spark-ignition event is primarily **rapid flame propagation and pressure rise**, not generally an ideal detonation. Plan models of increasing fidelity:

- 0D cylinder with crank-angle-dependent volume, fresh charge/air-fuel/spark input, pressure and temperature, bounded heat release and pressure-based torque contribution.
- Two-zone burned/unburned thermodynamics: separate gas temperature, mass, composition/energy and heat transfer with a shared or modeled pressure, flame-front mass transfer and combustion completeness.
- Multi-zone expansion: configurable number of gas zones and distribution (e.g. core, flame-front, near-wall/unburned pockets, end gas). Track gas **mass, species/mixture proxy, energy, pressure, temperature, density and inter-zone transfer** consistent with the selected equations. Support stratification and incomplete burn where justified by the chosen model.
- Cycle timing: induction (intake-valve mass flux), compression, ignition, combustion/expansion, exhaust blowdown and exhaust stroke; valve opening and overlap, trapped charge, residual gas, misfire, partial combustion and knock/abnormal combustion as **separate condition-driven models**.
- Crank piston geometry uses bore, stroke, rod length, clearance volume/compression ratio, actual bank/valve configuration. Cylinder volume changes with crank angle; geometric deformation and any moving zone boundary must be accounted for in mass and energy updates.
- Higher resolution may be a **multi-zone thermodynamic approximation** or an explicitly implemented spatial finite-volume model. Do **not** describe the former as full 3D spatial CFD; expose the chosen method in reports.

### Cylinder-wall and metal thermal regions

The user must be able to set distinct counts/resolutions for:
- Cylinder liner **axial bands** (top/middle/bottom or many sections), optionally circumferential sectors if modeled.
- Cylinder liner **radial depth layers** (gas-facing metal to outer wall/coolant jacket).
- Piston crown and head/combustion chamber surface thermal regions and through-thickness layers.
- Valve head/stem/seat, spark plug or injector surfaces and local heat transfer (only when implemented).

Compute gas-to-wall convection/radiation approximations by local zone/surface, wall conduction between metal layers, heat exchange with coolant/ambient and temperature-dependent material properties at the chosen tier. Resolve moving piston exposure and local heat flux without counting the same energy twice. Keep material thickness/thermal conductivity/heat capacity in validated SI units. User-set **number of zones** and **physical dimensions/materials** must be separate parameters: increasing the count refines the discretization, not the actual engine geometry.

### Valve / port boundaries

Allow intake/exhaust valve lift and flow area vs crank angle, discharge coefficient/flow restriction and pressure-driven mass exchange between cylinder and runner zones. Model reverse flow and scavenging/overlap when allowed. A valve cannot transfer mass when physically closed except via separately configured leakage; "animated valve" alone cannot supply gas to the solver. Per-valve/port heat transfer may use independent thermal zones at detailed levels.

## Intake, forced induction and exhaust discretization

- At low detail use connected pressure/temperature/mass reservoirs and flow restrictions; at higher detail discretize intake runners, plenums and exhaust runners/headers/collectors into **1D gas cells** with local pressure, temperature, density, velocity, transported species/fuel proxy and acoustic wave behavior where equations support it.
- Track **gas-path wall zones** (axial segments and radial metal layers) for heat loss, heat soak, catalyst/turbine/intercooler wall temperature and backpressure effects, matching the cylinder wall design concept.
- Include branching, merging, reflections, propagation delay and impedance changes at valves, cylinders, collectors, mufflers, turbo turbine, bypass/wastegate and tailpipe. Junctions must conserve mass and energy within model tolerance.
- Turbo/compressor and intercooler resolution controls may choose performance-map interpolation, rotor inertia/thermal lumped state or detailed segmented heat/flow states; **mechanical/electrical/exhaust power** still feeds the authoritative energy ledger at every level.
- Afterfire/pop-and-bang reference calculations use local exhaust gas temperature, unburned fuel/oxygen mixture and residence time at actual path cells; propagate resulting pressure/heat event through the chosen exhaust model, not randomly trigger generic output.
- Optional future 2D/3D gas-flow/CFD/chemical kinetics backends can be registered behind interfaces. They require separate validation, numerical resources and licenses.

## Resolution configuration and numerical safety

The training fidelity profile should contain, as supported:
- Solver family and version for each component; global and per-component tier; spatial discretization axis (0D zone count, radial/axial bands, materials, pipe cell lengths), refinement strategy and max zone count.
- Max/adaptive **simulation time step** and **crank-angle step** (time/angle are coupled at changing RPM), convergence tolerances, integrator/flux scheme, event-boundary alignment, numerical precision and output trace sample interval.
- Spatial refinement near flame/wall/interface/valve/collector when implemented; optional fixed grids for reproducibility.
- CFL stability constraints for compressible 1D transport, e.g. `dt <= CFL * dx / (|u| + a)` for local velocity `u` and sound speed `a`; plus separate stiff heat-release/heat-transfer stability constraints. A configured coarse dt must be reduced automatically or rejected if numerically invalid.
- Energy/mass/species residual tolerances, pressure/temperature nonnegativity where applicable, volume conservation, no NaNs, bounded machine precision and solver-failure events (fail the run, never fabricate training traces).
- Resource estimator **before run**: zones/cells, state count, memory footprint, projected steps and relative cost, scenario count, estimated output data size. Absolute duration estimates must be measured/calibrated, not invented. Offer lower-detail configuration or CLI export when browser memory/budget is insufficient.
- Cancel, progress, pause/resume from deterministic checkpoints where implemented, reproducible seeds/hashes, bounded trace storage and failure/timeout reports. Don't run computation on the UI main thread or audio process.

## Example *illustrative*, non-executable profile

```json
{
  "schemaVersion": 1,
  "profileId": "detailed-example",
  "preset": "detailed",
  "global": {
    "maxStepSeconds": 0.00001,
    "maxCrankAngleDegrees": 0.25,
    "adaptiveStep": true,
    "outputIntervalSeconds": 0.001,
    "cflTarget": 0.6,
    "maxMemoryMiB": 1024
  },
  "components": {
    "cylinderGas": { "model": "multi-zone-thermo", "gasZones": 16, "nearWallGasZones": 4 },
    "cylinderWall": { "linerAxialBands": 8, "linerRadialLayers": 3, "headLayers": 3, "pistonCrownLayers": 3 },
    "intakeRunner": { "model": "one-dimensional-gas", "axialCellsPerRunner": 32, "wallRadialLayers": 2 },
    "exhaustRunner": { "model": "one-dimensional-gas", "axialCellsPerRunner": 64, "wallAxialBands": 16, "wallRadialLayers": 3 }
  }
}
```

**Values are illustrative, not validated for any particular engine, pipe length or device.** Production validation needs geometry/step coupling, solver capabilities and memory checks. Profiles may override specific `componentId` instances (e.g. exhaust bank B or cylinder 4) after a consistent global preset.

## Compatibility with the generic real-time solver

The fast model exists **first**, with versioned SI port interfaces and trainable equation/map slots. High-detail cylinder/pipe/thermal results project onto those same physical boundaries: crank/cylinder work and heat, per-component mass flow and exhaust impulse, starter/shaft loads and sound excitation, preserving component IDs and event/clock semantics. Fit bounded coefficients or shared physically valid approximation families rather than requiring a mesh to run in the audio callback. Track extrapolation and fallback, reference numerical uncertainty and held-out torque/audio errors. See [28](28-shared-realtime-surrogates-and-calibration.md).

## Training-to-real-time pipeline

```text
Validated vehicle + scenario catalog + fidelity profile
    -> preflight topology / unit / resource / solver checks
    -> reference runs across time/event-gated states and configurations
    -> inspect optional spatial zone traces and conservation residuals
    -> convergence check (coarse -> medium -> refined, when available)
    -> extract causal state/torque/flow/pressure/acoustic features
    -> constrained fit: compact state update + lookup/splines/DSP response
    -> independent held-out scenarios and component energy/transition tests
    -> size/CPU/memory budget validation for AudioWorklet
    -> versioned trained artifact + validity domain + reference hashes
```

Training must **not** teach the fast solver a physically inconsistent shortcut. A detailed solver can provide crank-angle-resolved pressure/pulse, cylinder charge/heat-loss and exhaust impulse-response descriptors while the real-time model uses compact coefficients. The real-time model must still integrate torque and respond dynamically to driver/load/network changes.

Outputs store fidelity profile hash, zone topology/grid, numerical scheme, solver version, resolved dt, mesh convergence results, model uncertainty, scenario coverage, source licenses and held-out score. A training candidate can fail if reference resolution is insufficient or reference runs disagree beyond declared tolerance; avoid a misleading "better" label solely because the mesh is denser.

## Required acceptance

- [ ] Selecting Quick/Balanced/Detailed/Research changes actual equations/discretization and computational work, not merely a UI label; unsupported tiers are clearly disabled.
- [ ] User can independently change cylinder gas zones, cylinder liner axial/radial thermal sections, intake/exhaust gas cells and exhaust wall thermal layers **within valid model/resource bounds**.
- [ ] A temperature/pressure/heat-release comparison shows distinct spatial/zone histories when detailed models are active; all states are in physical units.
- [ ] Cylinder and gas-path port mass and energy balances remain within documented tolerances across intake, compression, firing, expansion, exhaust, afterfire and restart scenarios.
- [ ] Mesh/time-step refinement has a convergence report; changed resolution cannot silently change engine dimensions or artifact schema meaning.
- [ ] A 1D flow solver enforces CFL/other stability conditions and flags numerical failure; negative pressure/NaNs cannot become training labels.
- [ ] Per-component model tier changes do not alter unrelated topology, control support or vehicle configuration.
- [ ] Reference traces align with the authoritative event bus and scenario timeline; comparisons cover cold start, worn starter, limiter, overrun, pop-and-bang and exhaust heat soak.
- [ ] High-fidelity work never blocks the real-time audio callback or 2D/3D rendering; a heavy browser job can be canceled with informative resource diagnostics.
- [ ] Produced compact trained profile improves held-out objectives without introducing audio/physics regressions and is playable independently of the offline simulator.

## Phased implementation

- **M0:** fidelity schema, per-component capabilities, numerical solver interfaces, zone topology/units and resource limits.
- **M1/M4:** expose enough consistent crank, valve, air/exhaust port, geometry and thermal boundary conditions for reference solvers.
- **M5:** scenario-driven dataset/trace contract with event-aligned outputs and reproducible run reports.
- **M6-A:** Quick 0D baseline and Balanced two-zone combustion, lumped/layered metal temperatures, verified crank coupling.
- **M6-B:** Detailed multi-zone cylinder plus segmented liner/head/piston thermal transfer, with mesh-refinement and conservation tests.
- **M6-C:** Intake/exhaust 1D finite-volume/wave networks and segmented wall/exhaust heat transfer; validated flow/thermal coupling and afterfire propagation.
- **M6-D:** Fidelity editor, resource estimator, browser Worker/CLI execution, progress/cancel/checkpoint and zone-result viewer.
- **M7:** extraction/fitting/held-out verification of compact surrogate profiles across differing fidelity levels, with uncertainty and runtime acceptance.
- **Later:** optional validated advanced chemistry/CFD or expanded specialty components, without replacing the browser reference tiers.

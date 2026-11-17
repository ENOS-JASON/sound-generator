# 28 — Fast generic simulator first; shared surrogate math calibrated from high-fidelity runs

## O3 reference measurement research and CPU/CUDA parity

Agents must **research candidate measurement datasets with legally redistributable licensing terms**, provide source, attribution/usage restrictions and owner approval evidence **before bundling**; no reference recording audio may play (even in diagnostics) or replace procedural sound. Only proven data contribute measured confidence status. Reference and trained-profile component IDs/units must remain consistent between Windows/Linux **multicore CPU** and NVIDIA CUDA backends. **GTX1080 Pascal `sm_61`/CUDA12.x** must have a compatible GPU kernel path with honest CPU fallback and provenance; modern CUDA13-only backend may coexist but cannot make the owner's GPU unsupported. Source model precision and convergence must not be sacrificed to make GPU acceleration appear functional.

Research interchange prioritizes **ZIP first**; choose optional Parquet/HDF5 only after validated study sizes/query/streaming requirements and owner review. [O3 approved decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md).


## Round 3 licensed reference-measurement catalog

The calibration pipeline must accept **user-imported owned/licensed** physical/audio measurements **and bundled measurement datasets only when redistribution/attribution rights have been independently proven** for distribution through the repo/site. Record provenance, model and test conditions, time units, uncertainty/confidence, reference IDs and measured vs simulation status. If no verified bundle exists, ship no real recorded audio assets and accurately report that reference coverage is unavailable. **Real-world recordings are strictly analysis/calibration/held-out validation data and never generated or diagnostic playback sources**.

Two editable I4 baseline vehicles (mechanical carb factory-default and EFI alternative) and expert audio calibration revisions must be represented distinctly in fitted/surrogate manifests. Neither calibration trim nor cabin/engine-bay/roadside/exhaust listener sound transfer can create power, change cylinder state or quietly substitute a recorded sample for procedural DSP. See [Round 3](decisions/USER-APPROVED-ROUND-03.md) and `AG-M7-12`.


## Round 2 — Training acceptance and reference provenance

Fast generic physics and procedural audio remain fully usable before training. Training data from both carbureted/mechanical/no-ECU and EFI/ECU I4 setups must be compared on the same physical-port units, retaining **distinct controller identity and the correct availability of sensors, fuel and ignition behaviors**. A trained map for one controller must not silently override or create a nonexistent controller on another.

Higher-fidelity numerical reference data are checked for conservation, convergence and stability; compare to actual physical/sound measurements **when available** and publish model provenance plus uncertainty/confidence. Real-world recordings provide calibration/validation features only; **no sampled car-sound layer, recorded intake/exhaust event, or runtime recording playback** may become a fast model sound source. Research imports may be optional Parquet/HDF5, while the browser's default compatible portable trace bundle is ZIP. See [Round 2](decisions/USER-APPROVED-ROUND-02.md).


**Hard sequencing rule:** build a **working generic simplified physics + procedural sound engine first**, with a calibration-ready mathematical structure. Only then add very expensive high-fidelity reference simulations, variation studies and model fitting. The two implementations must be compatible **from the start**, not coupled by ad hoc CSV transformations after completion.

## Two engines, shared physical semantics

```text
Physical VehicleDefinition (component graph, units, geometry, parameters)
                     + Scenario/Commands / Inputs / Clock
                                   |
               +-------------------+--------------------+
               |                                        |
               v                                        v
  FAST GENERIC ENGINE (M1/M2)                  HIGH-FIDELITY REFERENCE (M6)
  fixed-step causal dynamics                  selectable 0D/2-zone/multi-zone
  compact cylinder + air/exhaust              zone-resolved combustion, wall
  and driveline integration                   heat, gas paths / acoustics
  source-driven procedural audio              detailed trace + source impulses
  generic physical coefficients               multicore offline / long runs
               |                                        |
               +----------- compare/align --------------+
                                   |
                    component-aware fitting (M7)
                                   |
             bounded equations / maps / shared model families
                                   |
                    VERSIONED TRAINED PROFILE
                                   |
               fast base solver + constrained correction
                                   |
             live real-time audio + 2D/3D + debug replay
```

Both use the *same canonical* engine geometry, firing/bank map, controller/drivetrain/induction topology, SI unit conventions, event names/cause metadata, force/energy port sign conventions, validated initial conditions and scenario input schedule. The detailed solver may carry additional field/mesh state but must expose a **projection to common fast-model variables** at matching physical boundaries and sampling times.

## Generic fast physics engine requirements (M0/M1, before training)

- Every component implements a **conservation-aware physical baseline** (e.g. crank inertia/friction/torque, intake reservoir/flow, starter battery/torque, clutch/gear and road load). No generic direct RPM-to-sound shortcut and no free boost/axle power.
- Mathematical functions have clean configurable parameters and versioned `modelId`; separable maps for volumetric efficiency, combustion efficiency/heat release, friction, pumping, valve flow, compressor performance, exhaust pulse/resonance, thermal loss and drivetrain torque/efficiency.
- `FastComponentModel` declares required inputs, units, outputs, physical bounds, fallback equations, trainable coefficients/lookup tables, observed state, **domain of validity** and expected runtime cost.
- Solver step order and constraints remain authoritative; training may tune coefficients or select an approximation **inside** that solver, but cannot replace physical event causation or conservation checks with memorized trace audio.
- Base model is useful with no reference profile. `modelStatus = baseline | trained | fallback` is exposed to diagnostics, and an incompatible model always falls back with an explicit reason.
- Per-cylinder and per-component effects can share **model family implementations** with different parameter values; bank layout/firing order and geometry still determine actual physical behavior.

## External high-fidelity solver and real-time boundary compatibility

**Owner-approved direction:** Reference fidelity must eventually include actual 3D CFD, advanced chemical kinetics and multi-material computation, possibly on native CPU/GPU kernels; the fast engine **remains generic and runnable** without any reference backend. Each new spatial/chemical/solid solver maps to the canonical physical boundary measurements via a versioned projection adapter, with explicit model fidelity, units, uncertainty and source component identity. Neither 3D field arrays nor reaction networks enter the live AudioWorklet or compact fast step loop. A faster GPU result is not automatically more accurate than a numerically converged CPU result. See [21](21-adjustable-fidelity-multizone-reference-simulation.md), [27](27-high-fidelity-experiment-orchestration.md) and [Round 1](decisions/USER-APPROVED-ROUND-01.md).

## Compatibility/feature contracts

Define a typed `PhysicalBoundaryState` used by fast/reference adapters:

| Boundary / quantity | Meaning |
|---|---|
| Crank and cylinder | crank phase, speed, per-cylinder charge/combustion/pressure/heat-release/torque, valve events |
| Air / exhaust | port mass flow, pressure/temperature/composition proxy, pressure waves/impulses where supported |
| Electrical / thermal | battery voltage/current/energy, starter torque/heat, metal/coolant/charge temperatures |
| Driveline and road | shaft torque/angular speed, clutch/transfer/differential/wheel losses, slip and reaction loads |
| Audio excitation | cylinder combustion impulse, intake flow pulse, exhaust pressure impulse, mechanical noise, source IDs and sample/event timestamps |
| Events / scenario | typed domain event IDs, source component, sim tick/crank angle, applied command/condition gates |

Low- vs high-resolution results are compared on common SI outputs, **not identical internal mesh arrays**. Conversion/projection is explicit, tested and versioned. A change of cylinder bore/stroke or another part updates both models through the same validated component definition.

## Approximations and sharing across components

Support an extensible **`ApproximationRegistry`** and `ComponentModelBinding` with:
- A stable model-family ID and mathematical purpose (e.g. pressure drop, heat transfer coefficient, gas discharge, rotational friction, valve flow, compressor efficiency, resonator transfer, starter torque-speed curve).
- Strict **input/output dimensions/units**, physical parameter ranges, condition variables, topology assumptions, numeric bounds, uncertainty and consistency constraints.
- Implementation type and compact data: analytical formula, calibrated coefficient set, linear/polynomial/rational/piecewise function, 1D/2D/ND lookup map, spline, reduced-order state-space model or small ML surrogate if justified.
- Per-component binding: the **same exact function/kernel can be reused by multiple compatible components**, with separate component-calibrated coefficients/maps as needed. Identical map data can be shared/deduplicated only where units, domain, geometry and calibration conditions truly match.
- Separate **base math** from **calibration overlay**: `baselineFormula(parameters)` + bounded correction/selected trainable map = effective approximation, preserving physical invariants. Versioned profile hash and compatibility guard choose overlay; unsupported domain falls back to analytic model.
- Cache keys include family version + material/geometric parameters + other physical conditions + trained dataset hash; do not reuse one turbo map for all dissimilar turbines because both are "turbos."

### Example reuse

```text
FlowRestrictionModel (same validated equation code)
  -> AirFilterComponent(own area / Cd / geometry)
  -> ThrottleComponent(own opening vs time / Cd)
  -> IntakeValveComponent(own cam lift / pressure)
  -> ExhaustValveComponent(own cam lift / temperature)

HeatTransferModel (shared math kernel)
  -> CylinderWallZone(own material / gas temp / wall area)
  -> ExhaustPipeZone(own wall thickness / gas temp / flow)
  -> IntercoolerZone(own geometry and thermal connectivity)
```

Sharing is allowed only if the common equation's assumptions are valid in each binding. A valve near choked compressible flow may require a different family from a low-speed incompressible throttle; declared applicability prevents dangerous forced reuse.

## Data from high-fidelity reference runs

Require datasets **component-aware and provenance-complete**, as in [27](27-high-fidelity-experiment-orchestration.md):

- Every point/trace includes `runId`, component instance ID/type/version, entire physical configuration and graph hash, input/output quantities and SI units, solver and fidelity/mesh version, time/crank angle and conditions, scenario/seed and numerical accuracy indicators.
- Per-component response surfaces: e.g. cylinder pressure/pulse vs RPM/charge/spark/temp; VE vs runner configuration/pressure/cam; intake/exhaust impulse response vs engine and muffler geometry; starter torque vs voltage/temp/rotor speed/wear; clutch loss vs slip and pressure.
- Audio source excitation and transfer descriptors separate from the *user's mixer gain*: train the source behavior (timing and spectral characteristics) against high-fidelity/recorded data without accidentally absorbing a fader setting.
- **Variation studies** record *exactly what changed*: one part, one parameter, or part-set; preserve baseline pair ID, all other configuration hashes, outcomes and uncertainty to determine where fitted corrections are justified.
- Store actual reference numerical errors and convergence status; exclude invalid, unstable or insufficiently converged labels. Reference results without measured validation remain **reference-model estimates**, not absolute truth.

## Simplification/training workflow

1. **Build baseline generic model** plus unit/invariant and trace tests. Capture existing fast predictions using the same scenarios as the reference; do not wait for training to have a working product.
2. **Collect reference grid** across operating envelopes, component variations and transitions (start, idle, loaded/unloaded sweep, limiter, afterfire, shifts, stalls) at selected fidelity.
3. **Align runs and components** by physical conditions and event/crank timeline, with a reference-to-fast projection and explicit mapping of state variables.
4. **Measure errors and sensitivities** per component and scenario (torque/HP, air mass/pressure, heat/temperature, vibration/pulse timing, audio spectrum and transient shape), with train/validation/untouched holdout separation by configurations and scenarios.
5. **Select simplest adequate model family** (analytic corrected coefficient -> low-dimension lookup/spline -> reduced-order dynamic model -> optional compact ML) using error, generalization, stability, runtime cost and interpretability.
6. **Fit with constraints**: nonnegative/finite physical quantities where applicable, power/energy conservation and monotonicity where physically required, bounded extrapolation, correct time delays/hysteresis, no fake afterfire/firing events.
7. **Deduplicate/reuse** a family of approximations across compatible components only after verifying same dimensions, domain and physical mechanism; use component-specific coefficient bindings where needed.
8. **Validate held-out combinations and transitions**, numerical/calibration uncertainty, worst-case local error, event sequence, audio source timing and runtime CPU budgets. Fail the candidate if any mandatory state transition or energy invariant regresses.
9. **Export compact versioned trained artifact** with component bindings, map layouts/equation definitions, ranges, hashes, reference corpus/mesh metadata, error metrics and provenance; activate at a safe boundary and record profile activation.
10. **Compare baseline vs trained vs reference** in Diagnostic/Compare page, including reconstructed sound stems and per-component physics effects. Automatically roll back to baseline on compatibility or stability failure.

## Example artifact (illustrative)

```json
{
  "schemaVersion": 1,
  "modelProfileId": "i4-reference-calibration-0001",
  "baseSolverVersion": "fast-v1",
  "vehicleGraphHash": "sha256:...",
  "referenceDatasetManifestHash": "sha256:...",
  "modelFamilyVersions": {
    "cylinder-heat-release": "1",
    "port-pressure-loss": "1"
  },
  "bindings": [
    {
      "componentId": "intake-valve-1",
      "family": "port-pressure-loss",
      "coefficientsRef": "pressure-loss-map-01",
      "domain": { "pressureRatio": [0.3, 1.0] },
      "fallback": "analytical-v1"
    },
    {
      "componentId": "intake-valve-2",
      "family": "port-pressure-loss",
      "coefficientsRef": "pressure-loss-map-01",
      "domain": { "pressureRatio": [0.3, 1.0] },
      "fallback": "analytical-v1"
    }
  ],
  "validation": { "holdoutStatus": "required", "energyStatus": "required" }
}
```

The shared `coefficientsRef` in this example is only valid when the two components actually have the same model assumptions and calibrated response (not true for arbitrary valves). Real artifacts include data hashes, geometry/conditions, encoding, error metrics and validation signatures. This JSON is a shape proposal and cannot be loaded before schemas are implemented.

## Adaptive experiment selection and long-term evolution

- Store comparison/sensitivity reports and **coverage gaps**, then suggest the next high-fidelity runs where the current fast model has highest error or least confident extrapolation, rather than brute-forcing every vehicle combination.
- Include optional cost-benefit metrics: error reduction per simulated wall CPU hour, per additional lookup table value and per real-time DSP microsecond.
- Support a future symbolic-regression/sparse-equation method when constrained, validated and bounded; do not allow black-box generated source code to execute from an imported profile.
- A change in model family, equation, component topology or unit conventions requires version/migration validation and may invalidate fitted profiles; captures must identify that distinction.
- Keep a human-reviewable mapping for every learned coefficient back to physical components, reference scenarios and data ranges.

## Core acceptance / build order

- [ ] A working generic engine with **no training artifacts** starts/idles/revs/stalls and produces phase-coherent sound, 2D/3D displays and recorded diagnostic traces.
- [ ] Fast and reference runs use compatible engine, port, unit, event and scenario contracts; changes to bore/stroke, starter health, exhaust or transmission affect both at shared boundaries.
- [ ] Reference run exports all component details and explains physics **and sound** differences for one-part and part-set studies.
- [ ] The same shared flow/thermal or other mathematical kernel may be bound to multiple **compatible** components with validated domain, parameter and correctness checks.
- [ ] A trained table/equation can be swapped into a fast component without replacing the deterministic solver/event architecture or affecting unrelated components.
- [ ] Baseline fallback works at out-of-domain conditions, bad imports or post-topology changes and reports the reason.
- [ ] Holdout reference comparisons improve per-component physical/audio error without degrading engine transitions, energy conservation or realtime sample deadlines.

**Phasing:** `M0` shared contracts/approximation registry and trace interfaces -> `M1/M2` generic fast engine and sound -> `M5` experiment runner and comparison -> `M6` multicore high-fidelity studies -> `M7` simplification/fitting -> `M8` performance and regression tracking. No heavy reference solver is a prerequisite to an initial working fast model.

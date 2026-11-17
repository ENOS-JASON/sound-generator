# 05 — Reference simulation and calibration pipeline

## Two-model strategy
**High-fidelity reference (offline):** expensive, variable-step or much smaller fixed-step calculations, e.g. thermodynamic cylinder-pressure/heat-release approximation, detailed manifold transient flow, exhaust wave propagation / higher-order digital waveguides, starter/cylinder interactions, and measured reference profiles. Runs in Worker or external reproducible scripts, not in audio callback. Explicitly document any assumptions; expensive does not automatically mean physically correct.

**Fast model (real-time):** conservation-aware crank torque integrator, small low-order air/fuel/thermal states and compact DSP. Fit map coefficients, splines, compact surrogate or correction deltas to reference state/impulse/resonance descriptors. Guarantee stable fallback to baseline values outside trained domain.

## Calibrate complete powertrain variants, not just sound

Training must compare measured/high-fidelity physical trajectories **and** emitted spectra across engine/cylinder-bank/firing-order families, mechanical vs ECU controls, starter/battery aging, carb/plenum/ITB/turbo/supercharger/compound intake graphs, and drivetrain load paths (gearbox, transfer case, differential and road). Reference features include per-component pressure/mass-flow, shaft torque/power/efficiency, electrical current/voltage, thermal state, crank/axle/wheel speeds, afterfire event timing and independently calibrated audio stems. Fit compact surrogates to physically valid network-port behavior, not a single RPM-to-volume mapping. Respect support-status manifests and reject attempts to train unsupported powertrains as a different engine family. See [14–20](14-modular-typescript-platform.md).

## Data collection protocol
- Parameter sweeps: 1–12 cylinder inline/V/flat crank/bank layouts, firing order, inertias, ambient/coolant/exhaust temperatures, battery SoC/internal resistance, starter wear/engagement, mechanical/no ECU vs ECU controllers and pop-and-bang tune styles, carburetor/ITB/filtered intakes, staged/parallel/compound forced induction, transmission/transfer-case/diff/traction states, and exhaust/muffler/aftertreatment.
- Scenarios: cold/hot/failed cranks (weak battery vs worn starter); catch and unstable idle; sustained idle; no-ECU and ECU idle behavior; throttle ramps/steps; loaded/unloaded dyno sweeps and hp calculations; limiter soft/hard; tuned overrun afterfire/negative controls; shifts in manual/AT/DCT/CVT, 2WD/AWD/4WD/low-range operation; misfires/stalls; induction spool/compressor losses; wheel slip.
- Every run records schema and solver version, seed, step size, initial conditions, applied controls, event times and state traces. Reference solver must be verified against conservation/sanity cases and, where available, licensed measured data.
- Enforce coverage with a grid/pairwise covering arrays plus high-risk combination cases and boundary/adversarial seeds; train/validation/test split by **entire scenario, engine family/layout, intake and driveline configurations**, not adjacent samples from one trace. Preserve an untouched holdout set, include per-component and worst-case loss scores, and report unimplemented combinations separately.

## Parameter fitting
Define objective as weighted engine-state dynamics errors + timing errors (start/catch/limiter/stall) + spectral/temporal audio feature errors + stability penalty + computational budget. Start with calibration of physically meaningful low-dimensional parameters; bounded optimization (grid/Latin hypercube + CMA-ES/gradient methods) before considering neural approximators. Avoid fitting arbitrary audible noise to mask physical failures.

```text
baseline fast solver -> deterministic reference corpus
                     -> optimize fast coefficients / lookup tables
                     -> evaluate physically constrained invariants
                     -> held-out scenario gate, runtime profiling
                     -> signed/versioned profile manifest with metrics
                     -> load validated profile or fall back to baseline
```

## Training execution model
Browser UI may launch small Worker batches with cancel/progress/checkpoints in IndexedDB. Large reference sweeps are better run offline via deterministic CLI/CI jobs; GitHub Pages does not execute backend computation. Training cannot mutate the currently playing profile without an explicit atomic swap (safe boundary/crossfade and filter state management).

## Artifacts and provenance
Versioned JSON/compact binary: physics parameters, DSP coefficients/lookup tables, operating-domain bounds, training manifest hash, source licensing, train/holdout hashes, per-scenario metrics, simulator versions and units. No opaque trained coefficient without reproducible metadata. Version compatibility checks and graceful fallback.

## Reference quality guards

High-fidelity solvers must document validated vs estimated thermodynamic, drivetrain and transmission equations. They must not create or duplicate axle power, use arbitrary negative resistance, or hide cross-component energy imbalance in audio training. Validate starting behavior, torque/hp calculation points, forced-induction load, afterfire prerequisites and power/traction limits before accepting a fitted model. A trained profile is version- and component-topology-specific unless generalization is demonstrated.

## Acceptance
Training improves the weighted **held-out** objective versus baseline; preserves all mandatory behavior transitions; satisfies invariant checks and runtime CPU budgets; no regression in clipping, nondeterminism or scenario coverage. Report failures, not just an average score. No unsupported claim that models match real vehicles without measurement calibration.

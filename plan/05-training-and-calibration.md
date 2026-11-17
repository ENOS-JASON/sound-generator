# 05 — Reference simulation and calibration pipeline

## Round 2 — Measurement-based calibration and reference-only recordings

The owner requires **numerically validated physics plus comparison against actual measurements when available**, with confidence/uncertainty/provenance displayed separately. Mesh convergence alone does not prove absolute accuracy; absence of measured reference does not prevent clearly labeled `simulation-estimate` models from running. For each measurement dataset store its source/license/consent, test conditions (RPM/load, temperatures, measurement location/microphone and gain calibration), units, timestamps and confidence; align physical and acoustic features to matching crank events and environmental conditions. Report measured vs modeled error honestly.

**Real-world audio recordings may be imported solely as analyzed calibration/validation features and never used for engine, stem, loop or diagnostic playback.** Generated simulation sound is always procedural. Offline study/export tools target **Windows and Linux**, with optional native CPU/GPU backends, and use versioned **browser ZIP** trace bundles plus optional Parquet/HDF5 scientific data. See [approved Round 2](decisions/USER-APPROVED-ROUND-02.md), [27](27-high-fidelity-experiment-orchestration.md) and [30](30-agent-handoff-contracts-and-decisions.md).


## Mandatory fidelity controls and multi-zone physics

Advanced training must be **user-configurable in numerical detail** instead of one mandatory high-cost simulation. Define Quick (0D), Balanced (burned/unburned zones), Detailed (multi-zone gas with segmented liner/head/piston thermal zones plus 1D intake/exhaust cells and wall sections) and Research (further verified refinement) tiers, with **per-component overrides** and dynamic capability-limited parameters. The engine cylinder has crank-resolved intake, compression, flame/heat-release propagation, expansion, blowdown and exhaust; gas temperature, pressure, mass/species and heat transfer couple to multiple metal wall layers and piston/head regions. Intake/exhaust paths have independently chosen axial gas cells, thermal wall layers and pressure-wave/junction modeling. Detail choices must be reproducible and physically validated, not labeled as full CFD without implementing it. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).

The training UI must use the guided configurator's validated component registry: expose only available solver families/zone counts based on selected engine, valves, intake/exhaust topology and device/budget. Require stability/CFL checks, mesh/time-step convergence, mass/energy residuals and a Worker/CLI resource preflight before accepting reference data. Low-detail and high-detail runs share state/event/port units, enabling event-aligned comparisons and physically constrained real-time surrogate fitting.

## Required build sequence: fast baseline first, shared math contracts

**The simplified real-time engine is M1/M2 and works with no reference data.** Its generic per-component equations, port state, event timing, units, parameter/lookup slots and fallback behavior must be designed from M0 to accept fitted coefficients later; M6 reference solver and M7 calibration **may not introduce incompatible state semantics**. The same physically valid components and scenario input schedules can be run through baseline fast and higher-fidelity models and aligned by common boundary states. Allow shared approximation equation/map families across compatible physical components, with per-component parameters and exact domain/units checks. See [28](28-shared-realtime-surrogates-and-calibration.md).

**Research-level reference work may take hours per simulated piston cycle**, and multiple runs can be distributed over all configured CPU cores in an offline CLI. Component manifests, checkpoint/streaming, progress by crank angle/sim time and long-running liveness checks are mandatory, not optional performance niceties. The batch workflow covers repeated validation, one changed component/parameter, part presets, interaction studies and time/event-gated scenario sequences. See [27](27-high-fidelity-experiment-orchestration.md).

## Two-model strategy
**High-fidelity reference (offline):** expensive, variable-step or much smaller fixed-step calculations, e.g. thermodynamic cylinder-pressure/heat-release approximation, detailed manifold transient flow, exhaust wave propagation / higher-order digital waveguides, starter/cylinder interactions, and measured reference profiles. Runs in Worker or external reproducible scripts, not in audio callback. Explicitly document any assumptions; expensive does not automatically mean physically correct.

**Fast model (real-time):** conservation-aware crank torque integrator, small low-order air/fuel/thermal states and compact DSP. Fit map coefficients, splines, compact surrogate or correction deltas to reference state/impulse/resonance descriptors. Guarantee stable fallback to baseline values outside trained domain.

## Calibrate complete powertrain variants, not just sound

Training must compare measured/high-fidelity physical trajectories **and** emitted spectra across engine/cylinder-bank/firing-order families, mechanical vs ECU controls, starter/battery aging, carb/plenum/ITB/turbo/supercharger/compound intake graphs, and drivetrain load paths (gearbox, transfer case, differential and road). Reference features include per-component pressure/mass-flow, shaft torque/power/efficiency, electrical current/voltage, thermal state, crank/axle/wheel speeds, afterfire event timing and independently calibrated audio stems. Fit compact surrogates to physically valid network-port behavior, not a single RPM-to-volume mapping. Respect support-status manifests and reject attempts to train unsupported powertrains as a different engine family. See [14–20](14-modular-typescript-platform.md).

## Complete part provenance and component-variation references

Every reference run is self-identifying: it records **every component actually used** (unique IDs, type/version, dimensions/materials, all simulation-affecting parameters, graph connections/ports, engine/cylinder bank/firing/cam, controller/ECU tune, starter/battery health, all intake/induction/exhaust/transmission/drive hardware, environment, audio stems/mix), source code/solver/fidelity/multizone grid versions, seeds, thread/hardware parameters, scenario time/events and input commands. Model metrics are indexed by component and port; no opaque unlabeled reference audio. Store full manifests/hashes and changed-part diff for paired studies so a reference can be reproduced even after default presets change.

Multiple reference runs serve **(a)** same-configuration validation and numerical/seed repeatability, **(b)** mesh/time-step convergence, **(c)** one-part or one-parameter A/B sensitivity, **(d)** set-of-parts or preset swaps, and **(e)** interaction/coverage experiments. Compare the per-component **physics effect** separately from per-source **sound effect** (including cases where only one changes). Reuse scenario gates from [06](06-scenario-runner.md). See [27](27-high-fidelity-experiment-orchestration.md).

## Data collection protocol
- Parameter sweeps: 1–12 cylinder inline/V/flat crank/bank layouts, firing order, inertias, ambient/coolant/exhaust temperatures, battery SoC/internal resistance, starter wear/engagement, mechanical/no ECU vs ECU controllers and pop-and-bang tune styles, carburetor/ITB/filtered intakes, staged/parallel/compound forced induction, transmission/transfer-case/diff/traction states, and exhaust/muffler/aftertreatment.
- Scenarios: cold/hot/failed cranks (weak battery vs worn starter); catch and unstable idle; sustained idle; no-ECU and ECU idle behavior; throttle ramps/steps; loaded/unloaded dyno sweeps and hp calculations; limiter soft/hard; tuned overrun afterfire/negative controls; shifts in manual/AT/DCT/CVT, 2WD/AWD/4WD/low-range operation; misfires/stalls; induction spool/compressor losses; wheel slip.
- Every run records schema and solver version, seed, step size, initial conditions, applied controls, event times and state traces. Reference solver must be verified against conservation/sanity cases and, where available, licensed measured data.
- Enforce coverage with a grid/pairwise covering arrays plus high-risk combination cases and boundary/adversarial seeds; train/validation/test split by **entire scenario, engine family/layout, intake and driveline configurations**, not adjacent samples from one trace. Preserve an untouched holdout set, include per-component and worst-case loss scores, and report unimplemented combinations separately.

## Reusable reduced equations, maps and controlled updates

Train **existing** generic fast-model extension slots rather than replacing whole physics subsystems. Fit bounded coefficients, sparse/ND lookup maps, splines, reduced-order dynamic models and/or constrained symbolic equations from high-fidelity boundary response features (airflow, pressure/torque, heat transfer, exhaust impulse spectra, starter load, drivetrain). `ApproximationRegistry` gives common math families physically meaningful unit/domain contracts; multiple components can use the exact same evaluated kernel or identical map **only where genuinely applicable**, each retaining its own part ID/calibration. The fast model always retains a deterministic fallback for missing/out-of-domain reference profiles. Validated trained artifacts are compared with baseline and reference via [25](25-core-diagnostics-recording-and-comparison.md) and [28](28-shared-realtime-surrogates-and-calibration.md).

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

## Spatial zone outputs and reference reliability

A detailed run emits inspectable zone-level traces (where enabled): per-cylinder burned/unburned gas, wall liner axial/radial temperatures, piston/head heat flux and valve mass flow; runner/exhaust cell pressure/temperature/velocity and wall heat/afterfire locations. This dataset is **offline-only** and may be downsampled for inspection without modifying solver accuracy. Include grid topology, reference version, dt/integrator/CFL settings, convergence report and stability failures in the manifest. Mesh refinement must be shown to converge on relevant objectives (pressure pulses, torque/power, thermal/afterfire signatures) before judging model superiority.

## Multi-hour, multicore execution and limits

The offline TypeScript/Node CLI schedules independent runs using configurable `worker_threads` up to all available logical CPU threads if selected, and may delegate within-run kernels to proven parallel/native/WASM implementations. Warn about oversubscription, RAM/disk pressure and numeric nondeterminism. A single detailed cycle can legitimately take **multiple hours or longer**: its *simulation-time* gates stay unchanged, and no short wall-clock timeout marks it failed merely due to slow computation. Monitor checkpoint advancement, progress in crank degrees/steps, per-worker resources and user stop/cancel. Stream complete or selectively sampled component/zone data to disk and allow resume with versioned run hashes.

## Training execution model
Browser UI may launch small Worker batches with cancel/progress/checkpoints in IndexedDB. Large reference sweeps are better run offline via deterministic CLI/CI jobs; GitHub Pages does not execute backend computation. Training cannot mutate the currently playing profile without an explicit atomic swap (safe boundary/crossfade and filter state management).

## Artifacts and provenance
Versioned JSON/compact binary: physics parameters, DSP coefficients/lookup tables, operating-domain bounds, training manifest hash, source licensing, train/holdout hashes, per-scenario metrics, simulator versions and units. No opaque trained coefficient without reproducible metadata. Version compatibility checks and graceful fallback.

## Reference quality guards

High-fidelity solvers must document validated vs estimated thermodynamic, drivetrain and transmission equations. They must not create or duplicate axle power, use arbitrary negative resistance, or hide cross-component energy imbalance in audio training. Validate starting behavior, torque/hp calculation points, forced-induction load, afterfire prerequisites and power/traction limits before accepting a fitted model. A trained profile is version- and component-topology-specific unless generalization is demonstrated.

## Fidelity and computational acceptance

- [ ] Quick vs Balanced vs Detailed vs Research (where implemented) actually changes numerical/physical resolution, not merely an output-quality label.
- [ ] User can tune cylinder gas zones, liner/head/piston thermal regions, valve/port detail and 1D intake/exhaust gas and wall discretization independently within declared bounds.
- [ ] Preflight predicts zone/cell state count, memory/output size and whether the browser or offline CLI can execute the selected run; impossible settings are rejected with reasons.
- [ ] Adaptive time/crank-angle steps and CFL/stiff-reaction constraints prevent unstable numeric traces; mesh convergence, heat/mass/energy residuals and reproducibility are reported.
- [ ] Offline reference models fit physically valid compact real-time coefficients with improved held-out transition/torque/audio objectives; large zone arrays never enter the AudioWorklet.

## Acceptance
Training improves the weighted **held-out** objective versus baseline; preserves all mandatory behavior transitions; satisfies invariant checks and runtime CPU budgets; no regression in clipping, nondeterminism or scenario coverage. Report failures, not just an average score. No unsupported claim that models match real vehicles without measurement calibration.

# 05 — Reference simulation and calibration pipeline

## Two-model strategy
**High-fidelity reference (offline):** expensive, variable-step or much smaller fixed-step calculations, e.g. thermodynamic cylinder-pressure/heat-release approximation, detailed manifold transient flow, exhaust wave propagation / higher-order digital waveguides, starter/cylinder interactions, and measured reference profiles. Runs in Worker or external reproducible scripts, not in audio callback. Explicitly document any assumptions; expensive does not automatically mean physically correct.

**Fast model (real-time):** conservation-aware crank torque integrator, small low-order air/fuel/thermal states and compact DSP. Fit map coefficients, splines, compact surrogate or correction deltas to reference state/impulse/resonance descriptors. Guarantee stable fallback to baseline values outside trained domain.

## Data collection protocol
- Parameter sweeps: displacement/cylinder count/firing order, inertias, ambient and engine temperatures, starter/battery voltages, throttle, load and clutch/gear, ECU controls, muffler.
- Scenarios: cold/hot/failed cranks; catch and unstable idle; sustained idle; throttle ramps/steps; loaded and unloaded sweeps; limiter soft/hard; overrun/restart; shifts; misfires/stalls; afterfire; wheel slip.
- Every run records schema and solver version, seed, step size, initial conditions, applied controls, event times and state traces. Reference solver must be verified against conservation/sanity cases and, where available, licensed measured data.
- Enforce coverage with a grid or stratified sampling plus boundary/adversarial cases; train/validation/test split by **entire scenario and engine configurations**, not adjacent samples from the same trace. Preserve an untouched holdout set.

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

## Acceptance
Training improves the weighted **held-out** objective versus baseline; preserves all mandatory behavior transitions; satisfies invariant checks and runtime CPU budgets; no regression in clipping, nondeterminism or scenario coverage. Report failures, not just an average score. No unsupported claim that models match real vehicles without measurement calibration.

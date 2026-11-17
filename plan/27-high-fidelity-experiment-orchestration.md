# 27 — High-fidelity experiments, multirun studies and multicore orchestration

## O3 owner hardware, compute and local-dashboard commitments

The owner requires compatibility with a **10th-generation Intel Core i9 + NVIDIA GeForce GTX1080**. The GPU is Pascal compute capability **6.1 (`sm_61`)**; NVIDIA removed Pascal compilation support in CUDA 13, so **a versioned CUDA 12.x `sm_61` GPU backend build is mandatory alongside multicore CPU fallback**. Keep modern CUDA targets optional and separate. Detect driver/toolkit/compute capability, VRAM and required precision, emit truthful backend status/CPU fallback and test Windows/Linux. Never force an RTX/Tensor Core/CUDA13-only dependency for required operation. Numerical conservation and physical accuracy remain primary; CPU may handle high-precision models that Pascal cannot run.

**Owner-approved GUI** is a **local browser dashboard launched by the offline CLI**, bound only to loopback (e.g. `127.0.0.1`, optional `::1`), with origin/CSRF/local job-action safety and no externally reachable service/remote queue or server on GitHub Pages. Versioned job status, progression by crank/time, logs, pause/cancel/checkpoint/resume survive correct recovery.

**Research format sequence:** ZIP schema/streaming first; investigate study-derived Parquet/HDF5 needs and obtain owner review of a scientific format choice only after measured use cases. Primary **physics owner benchmark** uses the owner's i9/GTX1080 desktop, whereas 30FPS/60FPS browser rendering uses separately proposed mid-range hardware. All untested drivers/solvers/GUI controls are labeled **NOT VERIFIED**, not successful. [O3 owner decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md), [NVIDIA CUDA13 release notes](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/).


## Round 3 Windows/Linux local graphical monitoring

**Approved:** keep the headless CLI as a reproducible computation entry point, and add a **separate local graphical monitoring application** on Windows and Linux. Its only authority is through a versioned local job-control interface over study IDs, commands and events: start/inspect/pause/cancel/checkpoint/resume, simulation/crank-time progress, worker CPU/GPU/RAM/VRAM/disk, logs and numerical failures. It does **not** require a remote queue, public backend, localhost endpoint on GitHub Pages or any change to the AudioWorklet.

Selection of concrete GUI toolkit, local IPC/permissions, packaging and restart/recovery semantics remains **NON VALIDATED**, requires prototype and major ADR if architecture-changing. Windows/Linux smoke and interruption/recovery tests must be recorded; UI must not claim an offline solver completed merely from elapsed wall clock. Cross-platform checkpoint files retain full manifests and provenance. See [Round 3](decisions/USER-APPROVED-ROUND-03.md) and `AG-M6D-07`.


## Round 2 — Supported platforms and research data interchange

Offline research orchestration must run on **Windows and Linux** with versioned typed backend adapters that can use CPU, native compiled kernels, compatible GPUs or WASM **when available and validated**. Platform-specific GPU acceleration is **optional**, but neither OS may be silently unsupported; CI smoke and hardware-conditional tests must disclose coverage. Record OS, device, driver, precision, reproducibility tolerance and available-worker scheduling separately from physics settings, and never assume Node `worker_threads` alone parallelizes a GPU/CFD kernel.

The baseline interchange format remains the validated **browser ZIP** recording/manifest; high-volume offline studies may export **optional Parquet/HDF5** datasets with compatible component ID, numeric units, clock, fidelity/mesh/solver and measurement-provenance references. Numerical convergence is mandatory where applicable, while real-world measured comparisons are included **when available**, with confidence/uncertainty labels instead of claims of exact physical truth. Reference audio recordings are measurement inputs for feature-based calibration, **never generated-playback sources**. See [Round 2](decisions/USER-APPROVED-ROUND-02.md).


**Mandatory training/workflow capability.** Users must be able to run an expensive, configuration-aware reference simulation many times: for reproducibility, numerical confidence, baseline vs **one changed part**, or a defined **set of changed parts**. Run batches are not confined to browser real-time playback. See [23](23-quoted-project-direction-and-decisions.md), [21](21-adjustable-fidelity-multizone-reference-simulation.md) and [28](28-shared-realtime-surrogates-and-calibration.md).

## Performance philosophy and platforms

**Hours of wall-clock computation for a single four-stroke piston cycle (720° of crank rotation) are acceptable at the highest fidelity.** No short hardcoded wall-time limit or artificial quality clamp is permitted merely to make the simulator appear responsive. Results must still be trustworthy, monitorable, interruptible and resumable.

- **Browser/GitHub Pages:** lightweight reference sweeps in dedicated Workers, configurable CPU/size caps and persistent output. The main-thread UI, AudioWorklet and active live simulation cannot be obstructed. Browser execution is not assumed suitable for enormous multizone/CFD jobs.
- **Offline high-compute CLI:** TypeScript orchestrates **pluggable CPU, native compiled, GPU, WASM and other suitable numerical kernels** (approved UD-R1-06), locally or through an explicitly configured worker process. Use Node `worker_threads` for job-level CPU parallelism when appropriate; a GPU-backed solver may have a different worker/queue topology. Expose independent limits for CPU logical threads, GPU device(s), VRAM, per-run parallelism, concurrent jobs, CPU/GPU memory and disk. Don't oversubscribe or assume GPU acceleration is always more accurate/faster; backend specifics remain owner-reviewed major choices.
- Large jobs write chunked disk data (not giant in-memory arrays), use checkpoints, resume by job/run hash and can span hours/days. A progress heartbeat reports *simulated* crank degrees/cycles and integration steps, simulated seconds, solver stage, wall CPU time, per-worker memory and throughput. Wall-clock liveness watchdogs must distinguish **slow but advancing** from **deadlocked** runs; legitimate long time per cycle is not failure.
- Explicit resource budget: threads, RAM, disk/output, precision, checkpoint cadence, solver count, job priority and acceptable completion policy. Estimators report calibrated rough work, not an invented guaranteed finish time. If output or RAM cannot fit, fail preflight or allow an explicit streamed/downsampled capture policy.
- Parallel scheduling must preserve deterministic inputs and per-run results; do not promise bit-identical floating-point outcomes across different thread counts or CPU/solver implementations. Record environment, threading and numerical tolerances.

## Backend-neutral reproducible job requirements

The `ReferenceComputeBackend` contract must declare backend name/version, precision, supported solver/fidelity families, device/CPU/GPU capabilities, resource bounds, deterministic/reduction policy, checkpoint/resume support and data serialization. Record source code/build hash, CPU/GPU model, thread count, driver/runtime, precision and numerical tolerances in every run. Validate per-port physical projections/units against portable solver fixtures, and compare outputs across backends within declared error tolerances. Portable orchestration can fall back to CPU **with explicit notice**, not silently label GPU or CFD outputs. Native kernels or GPU programs are not permitted in browser audio callbacks.

## Study types

| Study type | Purpose | Execution structure |
|---|---|---|
| **Validation replicates** | Verify reference stability, randomness, energy balance, repeatability, scenario transitions | Same full configuration repeated with same or explicitly varied seeds |
| **Mesh/time refinement** | Verify detailed reference result convergence | Same physical vehicle, different dt/CFL/zone/cell settings, compare key outcomes |
| **One-factor-at-a-time (OFAT)** | Isolate effect of **one physical part or one setting** | Baseline and one changed `componentId.parameter`, preserving everything else |
| **Component swap** | Replace one physical component model or preset | Baseline vs changed component plus validated dependent ports; explicit change list |
| **Part set / preset variation** | Swap a named group of components together | Baseline vs curated set of part changes and physical dependencies |
| **Factorial / pairwise / sensitivity** | Measure interactions and cover configurations | Parameter grid, covering array, Latin hypercube or sequential adaptive runs |
| **Scenario sequences** | Exercise engine from starter through stop or stall and back | Shared [06](06-scenario-runner.md) time/event/condition gates and checkpoints |
| **Fast vs reference vs calibrated** | Verify simplification quality | Align same physical input schedule and component manifest across solver families |

Run designs may specify a **matrix of physical presets × parts × operating conditions × scenario sequences × fidelity tiers × seeds**. Prevent an explosive Cartesian product without warning; provide predicted run count, total resource budget and explicit subset selection.

## Component-aware experiment definition

An experiment declares:
- `baselineVehicleHash` and full immutable **component graph manifest**: IDs, exact types/versions, physical geometry, material properties, parameters, connection/port topology, controller tune, induction/exhaust arrangement, transmission, tires, environment, physical fluids and calibration state.
- `studyId`, authoring/schema version, `scenarioIds` and ordered steps, seed policy, initial thermal/electrical/vehicle state, fidelity selection, numerical scheme and resource settings.
- `variationSet`: each named variant contains exactly which **component IDs and parameter paths** change, before/after values and units, whether a physical part is replaced, associated graph rewiring and validated downstream changes.
- `replicationCount`, explicit seeds or deterministic seed derivation; experiment-wide environment/schedule and all physics-affecting inputs held constant except the declared variables.
- Desired metrics and capture policy, thresholds/gates, baseline/variant pairing, output grouping, resume/retry policy and original validated preset/runner versions.
- `studyManifestHash` and per-run `runId`, `contentHash`, reproducible job settings; full provenance must allow reconstructing *what parts were actually installed in that run*.

**One-part comparison must really change just that part** as the experimental variable; physically mandated dependent recalculation (e.g., bore changes displacement, manifold tuning affects mass flow) is part of the component's *effects*, not a second arbitrary input change. For a component replacement requiring new dependencies, show and record them explicitly instead of claiming perfect OFAT isolation.

## Runtime sequence and gates

```text
Validated baseline configuration + scenario suite
    -> choose one-part or part-set variations
    -> validate every resulting component/port graph
    -> estimate matrix/run count and CPU/RAM/disk cost
    -> schedule baseline + matched variants on configurable CPU workers
    -> execute scenario steps using canonical simulation-time/event gates
    -> stream component/zone/physics/audio-feature data with checkpoints
    -> assert mass/energy/numerical/event behavior and mark failure explicitly
    -> repeat replicates / convergence tiers where requested
    -> compare paired runs with uncertainty and interaction metrics
    -> export a complete reference dataset + change manifests
    -> optional surrogate training + held-out verification
```

A very slow high-fidelity run still observes the **same simulation-time** gate criteria (starter, first fire, compression, exhaust pulse, stall, limiter, 4WD engagement). A heartbeat/watchdog monitors progress independently; no global 30-second or short wall timeout. Scenario failure and solver failure are separate outcomes. Invalid variants cannot run without explicit correction.

## Output: sufficient provenance to understand physics and sound effects

Every run export includes:
- Complete component roster, instance IDs, exact subcomponents, topology, parameter values/units, physical materials/geometry, controller selection/tune hash, engine bank/firing map, source/mixer mapping, simulation code and reference solver versions, numerical grid/time profile, library revisions and hardware/workers info.
- Inputs, command schedule, event stream, component state snapshots, output torque/power/loss/energy/temperature/pressure/mass flow, per-cylinder and per-zone (if configured) spatial traces and exhaust/intake wave records with clocks and units.
- **Sound provenance**: source IDs, excitation/impulse location/strength/timing, DSP/resonator parameters, reference sound features (spectral envelope, harmonics, transient signatures, waveform/stems if generated) and final mix settings kept separately; what changed **physically**, what changed a **sound source**, and what changed only a **mix control**.
- Per-run outcome: pass/fail/timeout/numerical instability/resource failure, conservation and convergence metrics, file hashes, runtime stats, warnings and omitted channels. Incomplete records cannot be mistaken for reliable training.
- Comparison records: baseline/variant IDs, exact intended change set, realized component diffs, paired differences, per-component sensitivities, confidence intervals/replicate spread and interactions. A difference in audio alone is not proof of a physical load difference.

## Comparison / causal sensitivity logic

- Paired baseline and variants with **same initial conditions and input schedule** (and same random seed/common random numbers when appropriate) suppress uncontrolled noise and better isolate a component's modeled effects.
- Compare at matched simulated time, crank angle, engine load and meaningful scenario events; provide event-aligned comparisons when a changed part causes start/stall/gear timings to diverge.
- Physics sensitivity: `deltaTorque / deltaParameter`, pressure/temperature/mass-flow response, spool delay, efficiency, starter current and engine power, tire slip and vehicle acceleration.
- Sonic sensitivity: per-source level, event count/timing, spectrum, harmonic modulation, transient envelope and master difference. A component may affect the engine without being audible, affect sound without changing engine output (e.g. muffler acoustics), affect both, or affect neither within model resolution.
- Report **interactions**: one-factor effects alone cannot predict turbo + camshaft + ECU tune + exhaust combined behavior; include pairwise or selected multivariable experiments.
- Validate numerical sensitivity independently: if changes are smaller than solver discretization error, report "not resolved at this fidelity" rather than assert a tiny causal effect.

## UI / CLI design

A guided **Experiments** page:
1. Select baseline vehicle, working model/fidelity and scenario(s).
2. Select **Single Part**, **Part Preset**, **Parameter Sweep**, **Validation Replicates** or **Mesh Convergence**.
3. Choose one or several components and *only capability-valid fields* from [22](22-guided-vehicle-configurator.md).
4. Enter baseline and candidate values/presets, seeds, replication, worker count, job resource limits and recording output detail.
5. Review immutable diff and estimated workload, then export/run locally or on a separate high-compute machine.
6. Monitor queued/running/paused/failed/completed jobs, progress, checkpoints and hardware use; compare physics and sound in [25](25-core-diagnostics-recording-and-comparison.md), export training corpus to [28](28-shared-realtime-surrogates-and-calibration.md).

## Acceptance / milestones

- [ ] One-part test changing only intake runner length captures specific altered airflow/torque and intake/exhaust acoustic features, with full baseline/variant manifests.
- [ ] Part-set test can replace intake + compressor + exhaust and computes correct new topology/load while keeping unrelated settings stable.
- [ ] Repeated high-fidelity scenarios verify repeatability and expose stochastic variance/solver instability; failed runs cannot become good training labels.
- [ ] CPU worker limit can reach all available logical threads **when configured**, and optional native/GPU backend resource limits are enforced, without oversubscribing unexpectedly or requiring a web server on GitHub Pages.
- [ ] A numerical backend provider can be discovered and validated via capability and versioned SI boundary/trace contracts, and runs disclose device, precision, driver, memory and output portability; unsupported GPU falls back transparently to a compatible CPU backend.
- [ ] Legitimate multi-hour piston-cycle simulation can report progress and checkpoint without false scenario timeout.
- [ ] Import of a run recreates the **exact component and parameter configuration**, even if current UI defaults have changed.
- [ ] Comparison reports per-component physics effects, per-source sound effects and numerical uncertainty.
- [ ] New component types automatically become experiment choices through the same capability registry, not bespoke experiment UI code.

**Implementation order:** contracts + identity/provenance in M0; simple one-factor headless fast-model A/B in M1/M5; full multicore, high-fidelity streaming/checkpoint/replication in M6; surrogate fitting and coverage-guided experiment selection in M7.

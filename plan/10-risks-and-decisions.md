# 10 — Risks, assumptions and outstanding decisions

## O3 approved choices and remaining unverified risks

**Decided 15/15 O3 choices:** primary i9/GTX1080 desktop for first physics architecture benchmarks; AI conditionally allowed routine PR merges after authorized checks; autosave bounded diagnostics/history; generic I4 numerical presets proposed to owner; agent-proposed mid-range visual FPS reference desktop; expert gain-only trim + no-auth advanced toggle; camera-independent listener; license research/owner approval before bundling; CLI-launched loopback-only dashboard; CPU plus NVIDIA CUDA; browser ZIP first, scientific export selected later; latest two stable major supported desktop browser versions where available; owner escalation for shared TypeScript API/ownership changes. [Exact owner approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md).

**Specific GPU compatibility risk:** NVIDIA's GTX1080 Pascal (`sm_61`) is unsupported by CUDA Toolkit **13.x offline compilation**; maintain tested **CUDA12.x `sm_61`** build alongside CPU fallback and optional newer targets. See [NVIDIA CUDA 13 release notes](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/) and [legacy GPU list](https://developer.nvidia.com/cuda/gpus/legacy). Actual hardware/driver, precision and CUDA toolchain are **NOT YET VERIFIED**. The 10th-gen i9/GTX1080 is required *compatible*, not automatically the published 30/60 FPS reference machine.

**Other unverified risks:** bot GitHub identity/actual merged SHA/branch rules and security escalation; local GUI localhost and CSRF protections; owner approval of proposed engine numerical parameters and mid-range benchmark device; exact browser version matrix and unsupported Safari/macOS cases; bounded IndexedDB/history quota recovery; license evidence for bundled reference recordings; numerical and GPU/CPU parity and model error budgets; Worklet vs Worker winner still pending benchmark and owner's choice. Distinguish **approved design** from **tested implementation** and **owner-pending later choices** in status reports. See [remaining verification](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).


## Round 3 risk clarification

The owner approved: **carburetor/mechanical I4 factory selection** with **two complete editable carb/EFI examples**; **30 FPS 3D / 60 FPS 2D** targets on reference desktop hardware (not physics/audio clocks); **expert-versioned source calibration trims**; four independent **procedural listening perspectives**; **imported plus proven-licensed bundled measurement references** (real recordings never playback); **Windows/Linux CLI plus local graphical research monitor**; **IndexedDB browser autosave with optional ZIP workspace snapshots**; and **dedicated AI technical integrator with escalation**, not a human/hybrid reviewer.

**UNRESOLVED / NON VALIDATED risks:** actual reference hardware and reproducible FPS results; exact physical/gearbox/audio values of initial examples; trim bounds/profile migrations; spatial acoustic transfer source measurements; public redistribution permission and availability for bundled datasets; GUI toolkit and safe local job IPC; browser storage quota/migration/corrupt state; AI GitHub integration identity/token/branch policy and merge rights. A bot or license is **not verified merely because the owner chose that feature**. See [approved Round 3](decisions/USER-APPROVED-ROUND-03.md) and [open validation register](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).


## Round 2 — Newly resolved decisions and remaining risks

**Approved** ([Round 2](decisions/USER-APPROVED-ROUND-02.md)): two selectable *first I4* control variants (carb/mechanical/no-ECU versus EFI/ECU); Svelte+Vite with hash URLs; pitch-lowered physical slow motion is the default; real recordings analyzed for calibration/validation only and **never used for playback**; confidence claims require numerical plus available measured comparisons; browser ZIP and optional offline Parquet/HDF5; Windows+Linux offline and desktop Chromium/Firefox/Safari web support; CI plus technical-integrator review for routine PRs, project owner for major ADRs.

**Remaining risks needing explicit later decisions:** initial I4 default preset/geometry/gear ratios, router library/Svelte version/state store, solver placement pending measured Worklet vs Worker benchmark, browser/hardware performance envelopes, actual measurement sources and error thresholds, diagnostic data retention/caps, optional Parquet/HDF5 library/security, GPU vendor/backend portability, integrator identity and branch rules. Existing `Decisions to record before implementation` below is historic/proposed and **may not override approved owner choices**.


## Major risks / mitigations
| Risk | Mitigation |
|---|---|
| 'Physics-driven' reduced to pitch-shifted oscillator | Engine state, cylinder impulses and torque must cause sound events; verify against traces |
| Audio glitches caused by thread/message scheduling | Worklet-owned phase or bounded timestamped buffer; benchmark sample deadlines |
| Excess CPU from high-fidelity solver | Offline-only/reference worker, compact trained coefficients in real-time |
| Unrealistic fit to reference | Blind holdout configurations, transition assertions and constrained loss |
| Incorrect scenario progression or infinite wait | Event identities, finite timeouts, retry bounds, wall-clock watchdog |
| Browser audio limitations / autoplay | Explicit user gesture, sample-rate adaptation, visible fallback |
| GitHub Pages broken paths or isolation assumptions | Vite base path, local-bundled assets; avoid mandatory SharedArrayBuffer |
| Inaccurate thermodynamics despite expensive solver | Conservation and measured-reference validation, uncertainty report |
| 3D causes audible jitter | Renderer never drives solver, graceful GPU fallback |
| Parameter explosion and hard-to-tune presets | Progressive expert controls, validated ranges and staged physical model |
| Reference audio licensing/privacy | Local opt-in reference imports, ownership metadata, no uploads required |
| Acoustic realism mistaken for one-to-one physical accuracy | Separate measured fidelity, subjective realism and computational efficiency |

## Cross-generation / combinatorial risks

| Risk | Mitigation |
|---|---|
| Monolithic engine/model cannot represent pre-ECU, modern, hybrid and unusual engines | Separate registered engine/control/fuel families with versioned physical ports and explicit support tier; [14](14-modular-typescript-platform.md) |
| Marketing term AWD, 4WD or 4x4 used as complete dynamics model | Actual transfer-case/differential/coupling/axle topology and verified 2H/4H/4L behavior; [17](17-transmissions-drivetrains-and-wheels.md) |
| Boost and added axles create free/duplicated power | Signed port-level mechanical, gas and electrical energy/torque ledger and network constraints; [20](20-torque-power-load-and-energy.md) |
| Exhaust pop tunes become randomly timed sound samples | Physically conditioned residual fuel/oxygen/temperature/ignition afterfire; separate intake backfire; [16](16-intake-induction-and-exhaust.md) |
| Worn starter and weak battery indistinguishable | Explicit voltage/current resistance, starter wear/solenoid engagement and separate failure events; [18](18-electrical-control-generations-and-tunes.md) |
| Too many combinations for exhaustive testing | Capability-aware generated pairwise coverage, high-risk interactions, held-out variant groups and visible unimplemented states; [19](19-scenario-coverage-and-presets.md) |
| Claims of accurate power or all-era sound without measurements | Label simulated crank/wheel HP measurement points, uncertainty/fidelity and reference evidence; no pseudo-verified presets |

## New cross-cutting technical risks

| Risk | Mitigation |
|---|---|
| Engine, AudioWorklet and 2D/3D animations use different wall-time clocks during slow motion | One fixed-step `SimulationClock`, sample-frame map, phase-stable event delivery and deterministic time-scale replay; [24](24-simulation-clock-and-time-scaling.md) |
| Debug logging/FFT causes audio underruns or changes physics | Non-blocking typed telemetry, bounded recorders, throttled UI plots and synthetic M0 stress gates; [25](25-core-diagnostics-recording-and-comparison.md) |
| Single-page controls become unusable with many technologies | Multi-page app shell and optional hideable/movable diagnostics widgets, capability-filtered forms; [26](26-multipage-ui-and-floating-widgets.md) |
| High-fidelity hours-per-cycle work accidentally marked timeout | Simulation-time scenario gates, configurable progress watchdog, checkpoints and resource-aware offline workers; [27](27-high-fidelity-experiment-orchestration.md) |
| Reference data cannot be reproduced or tied to actual installed parts | Immutable full component manifests/graph hashes, run versions, accurate change sets, per-component physical/acoustic outputs and import validation |
| Overfitted maps break shared physical assumptions or generate free power | Generic physics first, bounded shared model families, domain checks, conservation constraints and baseline fallback; [28](28-shared-realtime-surrogates-and-calibration.md) |
| "All threads" assumed to linearly accelerate one tightly coupled simulation | Parallelize independent sweeps/runs and proven kernels, measure scaling and preserve resource/determinism policy |

## Decisions to record before implementation
1. Engine targets: default gasoline inline-four naturally aspirated, then V6/V8; support user-defined firing order as validated schema.
2. Sound target: procedural only first; measured recordings for calibration, not runtime sample mixing.
3. Reference fidelity: start with auditable deterministic thermodynamic/gas-flow approximations; upgrade based on measured error, not model complexity alone.
4. Audio solver ownership: prototype Worklet-owned fast physics versus timestamped Worker transport; benchmark both before finalizing.
5. Visual scope: procedural generic engine/vehicle vs imported GLTF model; default procedural to avoid asset/licensing blockers.
6. Persistence: local storage for small settings, IndexedDB for large datasets, files for reproducibility; cloud sync out of initial scope.
7. Quality evaluation: metrics and licensed recordings; define vehicle-specific audio reference measurements before claiming a 'realistic match'.
8. Training execution: offline CLI/Worker support; do not rely on a server on Pages.
9. Target browsers/hardware and acceptable CPU budget: benchmark early, document minimum supported devices.
10. License for code, 3D assets and sample reference material: select explicitly before third-party assets are added.

## Technology roadmap policy

Engine presets from one cylinder through V12 and major gearbox/driveline/induction types must be **represented by the architecture before initial implementation hardens**, but each physical family is delivered and verified incrementally. First release is not promised as a fully validated simulator of every historical or modern vehicle. The roadmap tracks historical, diesel, two-stroke, rotary and EV/hybrid extensions as named future technology tracks with their own solvers, source audio and acceptance suites. This distinction is important to prevent silent inaccuracies.

## Unknowns intentionally left open
Exact engine benchmark models, microphone measurements, vehicle geometry/scale, chosen synthesis resonators and high-fidelity solver equation families, performance thresholds for entry-level phones, and fitting optimization library. These are resolved with early prototypes and measurements rather than speculative promises.

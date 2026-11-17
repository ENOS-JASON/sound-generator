# 10 — Risks, assumptions and outstanding decisions

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

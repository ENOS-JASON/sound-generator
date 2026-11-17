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

## Unknowns intentionally left open
Exact engine benchmark models, microphone measurements, vehicle geometry/scale, chosen synthesis resonators and high-fidelity solver equation families, performance thresholds for entry-level phones, and fitting optimization library. These are resolved with early prototypes and measurements rather than speculative promises.

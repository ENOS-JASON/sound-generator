# Physics-Driven Vehicle Sound Generator — Project Plan

> Planning baseline. **Status: design only.** No engine, renderer, training implementation, or GitHub Pages deployment is included yet.

## Goal

Build a flexible, realistic, **real-time, physics-driven** internal-combustion vehicle sound synthesizer that runs fully in a browser on **GitHub Pages**, has a synchronized interactive **3D vehicle / engine view**, and improves its lightweight real-time model through **higher-fidelity offline simulation, calibration and automated scenario training**.

An engine is a dynamic system, not an RPM-controlled audio player: firing pulses, combustion loading, rotational inertia, exhaust/intake resonances, starter load, fuel/ignition control, drivetrain, tires and acoustics should be causally linked. The sound must remain plausible while parameters change continuously.

## Plan documents

| Document | Purpose |
|---|---|
| [00 — Product scope](00-product-scope.md) | Goals, feature inventory, priorities and non-goals |
| [01 — Architecture](01-architecture.md) | Browser/GitHub Pages constraints, modules and clock ownership |
| [02 — Physical model](02-physics-model.md) | Engine, combustion, drivetrain, starter, controls and stalls |
| [03 — Sound synthesis](03-audio-synthesis.md) | Sample-accurate real-time, procedural DSP, resonances and transients |
| [04 — 3D / interface](04-3d-and-ux.md) | Engine visualization, controls, telemetry and audio listener |
| [05 — Training / calibration](05-training-and-calibration.md) | Expensive reference simulation, lightweight model fitting and validation |
| [06 — Scenario automation](06-scenario-runner.md) | Time/event-gated steps, guards, timeouts and reproducibility |
| [07 — Verification](07-testing-and-acceptance.md) | Scenario matrix, objective audio metrics, browser and performance gates |
| [08 — Implementation roadmap](08-implementation-roadmap.md) | Dependency-ordered milestones and assignable tasks |
| [09 — Schemas and contracts](09-data-contracts.md) | Versioned engine presets, events, profiles and training outputs |
| [10 — Risks / decisions](10-risks-and-decisions.md) | Open decisions, limitations and design tradeoffs |
| [11 — Shared event bus](11-event-bus-and-messaging.md) | Authoritative events, command routing, ordering, cross-thread transports and replay |
| [12 — Audio gain staging and mixer](12-audio-gain-staging-and-mixer.md) | Calibrated source sound, stems, buses and master controls |
| [13 — 2D engine cutaway](13-2d-engine-cutaway.md) | Lightweight per-bank side views with complete cylinders, valves and airflow |
| [14 — Modular TypeScript platform](14-modular-typescript-platform.md) | Composable powertrain components, versioned interfaces and physics ports |
| [15 — Engine families and presets](15-engine-families-and-presets.md) | One to twelve cylinders, inline/V/flat layouts and future engine families |
| [16 — Intake, induction and exhaust](16-intake-induction-and-exhaust.md) | Intake configurations, single/multiple/compound boost and afterfire conditions |
| [17 — Transmissions and drivetrains](17-transmissions-drivetrains-and-wheels.md) | Gearbox families, FWD/RWD/AWD/4WD, transfer cases, differentials and tires |
| [18 — Electrical, controls and tunes](18-electrical-control-generations-and-tunes.md) | No-ECU/ECU generations, battery and starter wear, tuning and pop-and-bang behavior |
| [19 — Scenario matrix and presets](19-scenario-coverage-and-presets.md) | Coverage of start failures, powertrains, tunes, loads and combination tests |
| [20 — Torque, power and load](20-torque-power-load-and-energy.md) | SI-based crank/wheel power, mechanical hp, loss/energy balances and dyno modes |

## Guiding principles

1. **Physics determines events; DSP renders their sound.** The visuals observe the same engine state.
2. **One deterministic timeline.** Fixed-step simulation, phase-coherent sample-clock audio, interpolated 3D frames. Never derive firing from frame rate.
3. **An authoritative model and a fast surrogate.** High-fidelity reference calculations run outside the audio callback. Trained artifacts replace expensive calculations, not the governing mechanical behavior.
4. **Scenarios are executable specifications.** Transitions may use simulation time, state conditions or named events, with finite timeouts, assertion checks and explicit failure results.
5. **Static-hosting first.** No runtime backend, API keys or mandatory cloud services. Training may run locally/offline and commit compact versioned presets.
6. **Realistic transitions matter.** Key-on, starter engagement, cranking, first firing, catching, stable idle, acceleration, overrun, limiter behavior, gear shifts, misfires, stalls and stop must each be modeled and testable.
7. **No sample library requirement.** Procedural sound is the baseline; optional legally sourced reference recordings are for objective calibration/evaluation, not required playback.
8. **One shared event contract.** Physics/ECU/drivetrain own authoritative domain events, while audio, visuals, scenarios and training consume the same ordered stream across safe browser transports. See [11](11-event-bus-and-messaging.md).
9. **Composable technology, not monolithic special cases.** TypeScript component contracts and rotational/electrical/air/fuel/exhaust/thermal ports support historic mechanical systems, modern ECU engines and later hybrid/EV families. See [14](14-modular-typescript-platform.md).
10. **Real load and measured output.** Every coupled accessory, compressor, transmission, axle, tire and road resistance contributes energy/torque to the single physics solver; horsepower is calculated from documented torque and speed measurement points. See [20](20-torque-power-load-and-energy.md).
11. **Breadth through verified implementations.** Layout/preset schemas span single cylinder through V12, inline/V/flat and diverse induction/driveline/controller architectures. Each feature states its implemented, approximate or planned fidelity—no silent substitutions. See [15–19](15-engine-families-and-presets.md).

## Delivery path

| Milestone | Result | Gate |
|---|---|---|
| M0 | Foundation and static deploy | Browser launches under `/sound-generator/` |
| M1 | Deterministic engine dynamics | Crank, catch, idle, shutoff, failure to start, stall |
| M2 | Procedural audio MVP | Stable phase-coherent ignition/exhaust/intake/starter output |
| M3 | Interactive 3D / controls | Correct crank-piston-cam synchronization and live inspector |
| M4 | Connected powertrain technology slices | Gears, clutch, limiter, overrun, pops, induction, AWD/4WD and wheel loads |
| M5 | Scenario runner and regression suite | All transition/timeout branches run headlessly |
| M6 | Higher-fidelity reference solver | Validated offline reference data across operating envelope |
| M7 | Fitting and compact trained artifacts | Held-out objective improvement without audio glitches |
| M8 | Optimization and public release | Cross-browser performance, CI and published GitHub Pages demo |

See [the detailed roadmap](08-implementation-roadmap.md) for task order and acceptance criteria.

## Initial technical direction (subject to benchmarks)

- **Vite + TypeScript** for a portable static bundle.
- **Web Audio API + AudioWorklet** for custom audio DSP; optional WebAssembly when profiling justifies it.
- **Three.js** for the 3D car/engine view.
- **Web Worker(s)** for offline/batch analysis, training and other expensive operations.
- Shared, versioned schemas; deterministic seeded scenarios and downloadable test traces.
- `vite.config.ts` will use `base: '/sound-generator/'` on GitHub Pages unless a custom-domain/root deployment changes the base.
- First physics reference implementation targets a four-stroke spark-ignition engine; **the initial schema must already support 1–12 cylinder inline/V/flat banks and interchangeable transmissions, controllers and intake/boost networks**. Wider technology families ship as distinct validated iterations (not fake generic presets).

## Scope of this initial commit

This directory is **planning documentation only**, intentionally written before implementation to prevent coupling the engine model, rendering, audio DSP and calibration. Any reported precision or performance number in these files is a **target to measure**, not a demonstrated result.

## References

- [Vite: deploying a static site to GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [MDN: AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [MDN: background audio processing with AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet)

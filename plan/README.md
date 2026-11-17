# Physics-Driven Vehicle Sound Generator — Project Plan

> Planning baseline. **Status: design only.** No engine, renderer, training implementation, or GitHub Pages deployment is included yet.

**For implementation agents:** start with [Agent handoff instructions](agents/README.md), then select **one** assignment from the [112-roadmap-step / 172-agent-card index](agents/task-index.md). Use the [copy/paste assignment prompt](agents/AGENT_PROMPT.md) for handoffs. Read only the card, mandatory [contract/ADR rules](30-agent-handoff-contracts-and-decisions.md), [pending decision register](decisions/README.md) and references specifically listed there. The roadmap is an overview; individual cards determine scope and acceptance.

**Owner-approved requirements:** [Rounds 1](decisions/USER-APPROVED-ROUND-01.md), [2](decisions/USER-APPROVED-ROUND-02.md), [3](decisions/USER-APPROVED-ROUND-03.md) plus **[all 15 O3 implementation decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md)** (**40 decisions approved**). **Remaining technical evidence:** [verification register](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md). The owner's **10th-gen Intel Core i9 and GTX1080 Pascal** must be supported by Windows/Linux **multicore CPU plus CUDA12.x `sm_61`** path and safe CPU fallback. Benchmark Worker/Worklet physics on that primary desktop; the **30 FPS 3D / 60 FPS 2D** reference desktop is independently **agent-proposed for owner approval**. Initial carb-no-ECU/EFI I4 physical values require owner review. Audio has gain-only expert trims (Advanced toggle, no login) and four camera-independent listening profiles. IndexedDB saves config/mixer/calibration/widgets/scenarios/bounded recent debug and configurable bounded history; ZIP first, optional scientific export after validated requirements. Offline CLI launches **loopback-only web job dashboard**. Support latest two stable major desktop browser versions where available. **AI integrator may conditionally merge routine PRs after explicitly authorized checks**, escalating major ADRs and shared TS API/ownership edits to owner. This is planning only; no driver, bot, license, hardware FPS or GPU run is falsely claimed verified.

## Goal

Build a flexible, realistic, **real-time, physics-driven vehicle sound and powertrain simulator**, starting with internal-combustion engines and architected for historical, contemporary, hybrid and electric technologies. It runs fully in a browser on **GitHub Pages**, has switchable **3D, lightweight 2D per-bank engine cutaway and telemetry views**, and improves its fast model through **higher-fidelity offline simulation, calibration and automated scenario training**.

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
| [21 — Adjustable-fidelity multi-zone simulation](21-adjustable-fidelity-multizone-reference-simulation.md) | Quick-to-Research reference detail, multi-zone cylinder/wall, intake/exhaust meshes, convergence and surrogate training |
| [22 — Guided vehicle configurator](22-guided-vehicle-configurator.md) | Step-by-step vehicle creation, conditional valid fields, bore/stroke geometry, live derived values and preflight validation |
| [23 — Quoted architecture direction](23-quoted-project-direction-and-decisions.md) | Preserved technical-choices quote, complete requirements passage and intended build order |
| [24 — Simulation clock and time scaling](24-simulation-clock-and-time-scaling.md) | Slow-motion, pause/step, synchronized 2D/3D/audio, deterministic replay |
| [25 — Core diagnostics and capture](25-core-diagnostics-recording-and-comparison.md) | Mandatory pre-engine debug menus, telemetry/audio charts, export/import and comparisons |
| [26 — Multi-page UI and widgets](26-multipage-ui-and-floating-widgets.md) | Multiple routes and draggable/hideable overlay widgets without resetting simulation |
| [27 — High-fidelity experiment orchestration](27-high-fidelity-experiment-orchestration.md) | Multicore multi-hour runs, repeatability, one-part and part-set experiments, component provenance |
| [28 — Shared surrogate models](28-shared-realtime-surrogates-and-calibration.md) | Generic fast engine first, high-fidelity calibration and reusable reduced equations/maps |
| [29 — Plan audit / gap register](29-plan-audit-and-gap-register.md) | 25 concrete ambiguity/conflict findings and required resolutions |
| [30 — Agent handoff and decisions](30-agent-handoff-contracts-and-decisions.md) | Contract ownership, proposed ADRs, frozen-unit/event rules, task completion template |
| [31 — Integration gates and support status](31-integration-gates-and-support-matrix.md) | Evidence-based G0–G8 acceptance gates and implemented/approximate/planned claims |
| [Agent work orders](agents/README.md) | Each roadmap checklist item mapped to one or more self-contained tasks with prerequisites and tests |
| [AI integration reviewer instructions](agents/AI_INTEGRATOR_PROMPT.md) | Conditional AI routine merge after verified rules, owner escalation of public TS APIs/major ADRs; live GitHub permissions unverified |
| [Round 1–3 approved requirements](decisions/USER-APPROVED-ROUND-03.md) | Earlier owner choices and links |
| [O3 approved implementation/hardware decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) | All 15 approvals and the required i9/GTX1080 Pascal compatibility path |
| [Owner's actual development hardware](decisions/OWNER-DEVELOPMENT-HARDWARE.md) | Windows 11, Intel i9-10900KF, 32 GB RAM, NVIDIA GTX 1080; driver number and CUDA toolkit unverified |
| [Outstanding verification register](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md) | Unverified toolchains, licenses, performance, AI merge permissions and narrower future choices |
| [Remaining technical validation gaps](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md) | Specific unresolved/technically unverified decisions, accountable cards and proof needed |

## Guiding principles

1. **Physics determines events; DSP renders their sound.** The visuals observe the same engine state.
2. **One deterministic timeline.** Fixed-step simulation, phase-coherent sample-clock audio, interpolated 3D frames. Never derive firing from frame rate.
3. **An authoritative model and a fast surrogate.** High-fidelity reference calculations run outside the audio callback. Trained artifacts replace expensive calculations, not the governing mechanical behavior.
4. **Scenarios are executable specifications.** Transitions may use simulation time, state conditions or named events, with finite timeouts, assertion checks and explicit failure results.
5. **Static-hosting first.** No runtime backend, API keys or mandatory cloud services. Training may run locally/offline and commit compact versioned presets.
6. **Realistic transitions matter.** Key-on, starter engagement, cranking, first firing, catching, stable idle, acceleration, overrun, limiter behavior, gear shifts, misfires, stalls and stop must each be modeled and testable.
7. **Procedural audio exclusively in the live engine.** Real recordings may be imported **only for calibration, measurement and evaluation**, never live or diagnostic playback or embedded sample layers; source playback must be synthesized from physics. Generated output may be captured for diagnostics. See [Round 2](decisions/USER-APPROVED-ROUND-02.md).
8. **One shared event contract.** Physics/ECU/drivetrain own authoritative domain events, while audio, visuals, scenarios and training consume the same ordered stream across safe browser transports. See [11](11-event-bus-and-messaging.md).
9. **Composable technology, not monolithic special cases.** TypeScript component contracts and rotational/electrical/air/fuel/exhaust/thermal ports support historic mechanical systems, modern ECU engines and later hybrid/EV families. See [14](14-modular-typescript-platform.md).
10. **Real load and measured output.** Every coupled accessory, compressor, transmission, axle, tire and road resistance contributes energy/torque to the single physics solver; horsepower is calculated from documented torque and speed measurement points. See [20](20-torque-power-load-and-energy.md).
11. **Breadth through verified implementations.** Layout/preset schemas span single cylinder through V12, inline/V/flat and diverse induction/driveline/controller architectures. Each feature states its implemented, approximate or planned fidelity—no silent substitutions. See [15–19](15-engine-families-and-presets.md).
12. **Configurable reference fidelity, not one fixed expensive solver.** Let users select global and per-component detail: multi-zone cylinder gas and combustion, segmented cylinder liner/head/piston walls, and intake/exhaust gas cells/wall layers. Validate conservation, timestep stability, mesh convergence and resource budgets before creating compact real-time training artifacts. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).
13. **Guided, physically valid configuration.** A step-by-step wizard exposes only capabilities and values valid for the active engine, controller, induction, transmission and drivetrain. Bore and stroke are editable, derived displacement and dependencies update automatically, and the same validators protect UI and imported presets. See [22](22-guided-vehicle-configurator.md).
14. **Core observability before features.** The typed simulation clock/time scaling, debug menus, live audio/physics charts, record/export/import/replay/compare and a multi-page shell must work on synthetic signals **before M1 physics or M2 audio features**. See [24–26](24-simulation-clock-and-time-scaling.md).
15. **Generic fast model first.** M1/M2 delivers real physical and sonic behavior without trained artifacts; all equations use shared versioned component/port contracts and optional bounded correction maps for later training. See [28](28-shared-realtime-surrogates-and-calibration.md).
16. **High-fidelity can be extraordinarily slow.** Hours for one piston cycle are acceptable at Research fidelity. Multicore jobs, checkpoints, provenance-rich component manifests and repeated/one-part/part-set scenario sequences create high-quality reference data. See [27](27-high-fidelity-experiment-orchestration.md).
17. **Inspect and compare everything.** Physical, sonic, event, numerical and performance telemetry can be captured locally and imported to re-run/compare baseline, reference and trained models; diagnostics are nonintrusive. See [25](25-core-diagnostics-recording-and-comparison.md).
18. **Agent-by-agent delivery with frozen contracts.** Each implementation card has its own documented inputs, outputs, file ownership, tests, prerequisites and handoff evidence. Stop on unresolved protocol conflicts instead of inventing alternate interfaces. See [29](29-plan-audit-and-gap-register.md), [30](30-agent-handoff-contracts-and-decisions.md), [31](31-integration-gates-and-support-matrix.md) and [agent task index](agents/task-index.md).

## Delivery path

| Milestone | Result | Gate |
|---|---|---|
| M0 | Foundational observability and static shell | Time scale, typed event bus, synthetic worklet+physics graphs, capture/export/import/replay/compare, multi-page debug UI and Pages build validated **before M1** |
| M1 | Generic fast physics model | Crank, catch, idle, shutoff and stall, with trainable/fallback equation/map interfaces and complete diagnostics |
| M2 | Procedural audio MVP | Stable phase-coherent ignition/exhaust/intake/starter output |
| M3 | Guided configurator, 3D/2D / controls | Dynamic wizard with bore/stroke and validation, bank cutaway, source mixer, crank/wheel power inspector |
| M4 | Connected powertrain technology slices | Gears, clutch, limiter, overrun, pops, induction, AWD/4WD and wheel loads |
| M5 | Scenarios and experiment controls | Full event-gated tests, one-part/part-set variations, baseline/variant diffs and scenario capture |
| M6 | Adjustable-fidelity multicore reference | Quick/Balanced/Detailed/Research gas/thermal zones, multi-hour cycles, all-thread optional CLI scheduling, repeatable component-tagged studies |
| M7 | Shared equation/map fitting | Reduced-order per-component bindings, reusable math families, held-out physical/audio improvement without runtime regressions |
| M8 | Optimization and public release | Cross-browser performance, CI and published GitHub Pages demo |

See [the detailed roadmap](08-implementation-roadmap.md) for task order and acceptance criteria.

## Mandatory sequencing

**Do not defer debugging to the end.** Establish core clock/time-scale controls, event/telemetry registration, audio/physics graphs, record/export/import/replay/compare and multiple pages with floating widgets using deterministic synthetic data **in M0**. Implement the **generic simplified real-time engine in M1/M2**. Detailed multizone reference simulation and multicore variation studies come later in M6, and their results tune shared fast equations/maps in M7. [Original design quote and interpretation](23-quoted-project-direction-and-decisions.md).

## Initial technical direction (subject to benchmarks)

- **Vite + TypeScript** for a portable static bundle.
- **Web Audio API + AudioWorklet** for custom audio DSP; optional WebAssembly when profiling justifies it.
- **Three.js** for 3D and **Canvas 2D** for lower-cost per-bank cutaway; **owner-approved Svelte + Vite with hash routing** (`/#/drive`) for multi-page UI, with movable/hideable diagnostics widgets.
- **Web Worker(s)** for offline/batch analysis; an offline TypeScript/Node worker-threads CLI with configurable use of all logical CPU threads for multi-hour/multi-run high-fidelity work.
- Shared, versioned schemas; deterministic seeded scenarios and downloadable test traces.
- `vite.config.ts` will use `base: '/sound-generator/'` on GitHub Pages unless a custom-domain/root deployment changes the base.
- First physics reference implementation targets a four-stroke spark-ignition engine; **the initial schema must already support 1–12 cylinder inline/V/flat banks and interchangeable transmissions, controllers and intake/boost networks**. Wider technology families ship as distinct validated iterations (not fake generic presets).

## Scope of this initial commit

This directory is **planning documentation only**, intentionally written before implementation to prevent coupling the engine model, rendering, audio DSP and calibration. Any reported precision or performance number in these files is a **target to measure**, not a demonstrated result.

## References

- [Vite: deploying a static site to GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [MDN: AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [MDN: background audio processing with AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet)

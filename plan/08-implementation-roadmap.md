# 08 — Dependency-ordered implementation roadmap

**Status:** proposed, not started. Implement vertical end-to-end slices; avoid spending weeks on high-fidelity training before a measurable simple engine exists. Each checklist item is separately reviewable and should ship with tests.

## M0 — Repository foundation and GitHub Pages
- [ ] Initialize Vite + TypeScript app, strict types, lint/format/typecheck and test runner.
- [ ] Add GitHub Actions CI + Pages deployment, Vite base path, SPA fallback strategy (prefer hash routing if needed) and HTTPS smoke test.
- [ ] Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset.
- [ ] Define strict TypeScript component/port graph contracts, factories/capability registry, typed power/energy sign conventions, bank/cylinder geometry for 1–12 cylinders and technology fidelity status (see [14–20](14-modular-typescript-platform.md)).
- [ ] Define independent controller, intake/induction, engine-family, transmission/differential, electrical and audio/renderer model interfaces before concrete implementations.
- [ ] Specify shared typed EventMap/CommandMap, event ownership, causation IDs, simulation tick/sample-frame clocks, subscriber API and bounded cross-thread transport contracts (see [11](11-event-bus-and-messaging.md)).
- [ ] Implement capability detection, error overlay, user gesture AudioContext start and static fallback UI.
**Exit:** demo loads at repository GitHub Pages subpath; tests run in CI; no runtime server required.

## M1 — Physics core and starting
- [ ] Implement fixed-step deterministic solver, authoritative local event collector/bus, command scheduler, immutable ordered event log, clock/reset and trace recording.
- [ ] Test event ordering, exactly-once command application, subscription cleanup, re-entrancy prevention and deterministic replay.
- [ ] Implement rotating inertia, drag/friction, per-cylinder crank/720° firing order and generic inline/V/flat bank geometry, compression load.
- [ ] Add coupled crank, auxiliary and driveline rotational ports, free-rev/dyno/road-load adapters, SI torque/power measurements and energy-balance diagnostics.
- [ ] Implement minimal mechanically controlled carburetor/distributor path **without ECU** plus separately selectable ECU reference controller; reject controls not supported by the active strategy.
- [ ] Add ignition switch, battery SoC/voltage/internal resistance, starter motor/solenoid/engagement and torque-speed curve with defined interfaces for wear and heat.
- [ ] Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions.
- [ ] Implement selectable mechanical idle adjustment or ECU idle regulation, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall.
- [ ] Build headless first-start/stall scenarios and physical invariant tests.
**Exit:** meaningful RPM trace for start/catch/idle/stall without fabricated state transitions.

## M2 — Procedural sound MVP
- [ ] Implement AudioWorklet loader + sample-accurate control/phase transport and bounded bus bridge with critical-event gap detection.
- [ ] Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.
- [ ] Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.
- [ ] Add sound-physics synchronization tests, worklet callback profiler and output capture.
**Exit:** recognizable crank-to-idle-to-stop; no clicks/NaNs or callback overruns in test run.

## M3 — 3D and interactive lab
- [ ] Build procedural low-poly car and cutaway engine scene in Three.js and lightweight Canvas2D **side-view row per bank** (every cylinder/piston/rod/valve, cycle, combustion and actual mass-flow indication).
- [ ] Animate crank/pistons/valves/firing using actual engine angle and cylinder events.
- [ ] Add start/stop, throttle, ignition, load and preset editor UI with SI conversions.
- [ ] Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics.
**Exit:** live physically consistent tuning and visualization while sound plays.

## M4 — Connected technology integration tracks (incremental slices)

M4 is **not** one indivisible milestone. Deliver and validate each model family independently with its own integration and scenario tests. Do not mark unsupported engines, induction combinations or transmissions as fully simulated simply because their type appears in a preset schema.

### M4-A — Engine era, controls, electrical health
- [ ] ECU limiter: soft/hard control, cylinder cut strategy, hysteresis and exit; capability-aware mechanical/no-ECU alternatives.
- [ ] Add battery aging and cold cranking, worn/heat-soaked starter, solenoid failures, cable voltage drop, charging/alternator and accessory loads.
- [ ] Add configurable ECU fuel/spark/boost/overrun maps and mechanical carb/distributor/choke behavior with mutually valid controls.
- [ ] Intake/fueling transients, overrun fuel-cut, misfires, hot/cold differences and engine thermal states.

### M4-B — Intake, induction, exhaust and tunes
- [ ] Add filter/airbox, throttle/plenum, variable runners, ITB/carburetor configurations with actual volumetric-efficiency and sonic effects.
- [ ] Add validated single/parallel/sequential/compound turbo, supercharger types and twincharging/charge-cooling via a flow/energy graph; test mechanical/exhaust/electrical parasitic energy.
- [ ] Exhaust afterfire/intake backfire and stock/mild/aggressive pop-and-bang tune strategies plus 2-step/anti-lag as opt-in **physically conditioned** features, each with failure/negative-control scenarios.

### M4-C — Transmissions and complete driveline
- [ ] Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.
- [ ] Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.
- [ ] Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.
- [ ] Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.

### M4-D — Engine layouts and preset catalog
- [ ] Publish validated single-cylinder through V12 inline/V/flat examples with firing order, bank angle, crank geometry and collector acoustics, including cross-plane/flat-plane V8 and distinct 2D rows.
- [ ] Add forced-induction and exhaust configurations to verified preset combinations rather than treating every untested combination as supported.
- [ ] Test per-component physical torque/energy accounting, separate drivetrain/cylinder/induction audio stems and power figures for each shipped configuration.

**Exit:** Every **implemented** M4 component passes isolated physics/audio tests and registered end-to-end power/load/scenario gates. Preset metadata clearly differentiates supported, approximate and planned technology families; no claim that all historical vehicles are complete.

## M5 — Scenario orchestration
- [ ] Parse/validate schema with deterministic seeded initial state.
- [ ] Implement elapsed/time/event/condition/all/any gates, sustained conditions and finite timeouts using canonical event sequence watermarks and authoritative solver state.
- [ ] Implement branch/retry policies, negative assertions and event-history semantics.
- [ ] Build headless scenario matrix, traces, reporter and UI scenario editor/playback.
- [ ] Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](19-scenario-coverage-and-presets.md)).
- [ ] Add component graph conservation tests, pairwise configuration coverage, high-risk cross combinations and explicit unimplemented/unsupported reporting.
- [ ] Run randomized boundary cases and automated stress tests.
**Exit:** start, failure, stalls, rev limiter, shifts and afterfire all have passing and intentionally failing cases with diagnostic reports.

## M6 — Advanced reference simulation
- [ ] Define high-fidelity boundary conditions, state/torque/acoustic impulse outputs and units.
- [ ] Implement finer-step combustion/flow/resonator reference components; validate conservation and known baselines for varying engine geometry, controller technology, induction and driveline energy flow.
- [ ] Implement reproducible simulation sweep runner with dataset metadata and canonical event/command trace format.
- [ ] Create reference data from licensed recordings (optional) and calibrated engine measurements.
**Exit:** independently checked reference traces for full scenario envelope.

## M7 — Calibration / training
- [ ] Define weighted physical/audio loss, per-scenario scores and constraints.
- [ ] Implement bounded parameter search, spline/map fitting and regularization.
- [ ] Add scenario/configuration-disjoint holdout sets across engine family, intake/boost, controller and transmission/AWD combinations, boundary sampling and model comparison.
- [ ] Export versioned coefficient profiles with validity bounds, provenance and hashes; activate via validated scheduled command and PROFILE_ACTIVATED event.
- [ ] Load and atomically swap validated profiles; add stable baseline fallback.
- [ ] Reject candidates with worse transition behavior, instability or audio CPU overruns.
**Exit:** quantified holdout improvement and zero mandatory scenario regressions.

## M8 — Optimization, release and documentation
- [ ] Browser/device matrix, 44.1/48kHz handling, audio suspend/device-change tests.
- [ ] CPU/memory profiling, graphics LOD, DSP quality tiers and benchmark dashboard.
- [ ] Preset import/export, reproducible demo and clear licensing/privacy attribution.
- [ ] Test deployed Pages artifact, pin releases, publish architecture/scenario/training docs.
**Exit:** stable public static demo with reproducible quality/benchmark report.

## M9+ — Progressive automotive technology coverage after first public release

- [ ] **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.
- [ ] **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.
- [ ] **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined.
- [ ] **M12 — Broader calibration and technology verification:** expand validated measured sources, cross-generation regression and performance coverage. Clearly identify accuracy and unsupported features per preset.

**Coverage rule:** the architecture accepts arbitrary future families, but **type support, accurate physics implementation and calibrated reference fidelity are separate milestones**. Do not mark unimplemented combinations as working.

## Implementation dependencies
```text
M0 -> M1 -> M2 -> M3
        |      |
        +----> M5 <--- M4
                 |
                 v
                M6 -> M7 -> M8
```
M5 can start as a minimal harness during M1 (and should); its full editor/reporting milestone completes later. Release gates for M4 occur at the level of individual A/B/C/D slices and shipped presets, with no requirement to falsely complete every possible automobile technology before an initial demo. Parallel work: basic 3D asset creation after contracts in M0; reference-solver research can start during M2 but official training begins only after scenario coverage exists.

## Definition of done for every milestone
Code reviewed; deterministic tests added; physical model assumption documented; state/event schema updated; visual/audio regression traces captured; performance measured on target hardware; deployment remains functional. No completed label based only on visual plausibility.

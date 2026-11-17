# 08 — Dependency-ordered implementation roadmap

**Status:** proposed, not started. Implement vertical end-to-end slices; avoid spending weeks on high-fidelity training before a measurable simple engine exists. Each checklist item is separately reviewable and should ship with tests.

## Non-negotiable build-order gate

**M0 cannot finish until clock/time scaling, event bus, an instrumented synthetic physics source, synthetic AudioWorklet sound + live waveform/spectrum/meters, expandable/hideable physics/audio/event debug menus, recording/export/import/replay/comparison, and a multi-page shell with a draggable/hideable debug widget all work in CI.** M1/M2 physics and sound development starts only after this foundation proves that it can observe and compare its own results. Read [23 — quoted design direction](23-quoted-project-direction-and-decisions.md) and [24–28](24-simulation-clock-and-time-scaling.md).

## M0 — Repository foundation and GitHub Pages
- [ ] Initialize Vite + TypeScript app, strict types, lint/format/typecheck and test runner.
- [ ] Add GitHub Actions CI + Pages deployment, Vite base path, SPA fallback strategy (prefer hash routing if needed) and HTTPS smoke test.
- [ ] Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset.
- [ ] Define strict TypeScript component/port graph contracts, factories/capability registry, typed power/energy sign conventions, bank/cylinder geometry for 1–12 cylinders and technology fidelity status (see [14–20](14-modular-typescript-platform.md)).
- [ ] Define independent controller, intake/induction, engine-family, transmission/differential, electrical and audio/renderer model interfaces before concrete implementations.
- [ ] Define a **step-by-step schema-driven wizard**: capability/field descriptors, step prerequisites, per-field conditional option/range/visibility providers, draft-state/undo policy and shared preset/graph validation; see [22](22-guided-vehicle-configurator.md).
- [ ] Specify bore/stroke/rod/compression geometry input contracts and derived cylinder/total displacement with SI conversion, plus verified equation/constraint tests.
- [ ] Define configurable **reference-fidelity profile contracts** (Quick/Balanced/Detailed/Research), component solver capabilities, gas/metal/wall zone axes, step/CFL/stability tolerances and resource preflight; see [21](21-adjustable-fidelity-multizone-reference-simulation.md).
- [ ] Specify shared typed EventMap/CommandMap, event ownership, causation IDs, simulation tick/sample-frame clocks, subscriber API and bounded cross-thread transport contracts (see [11](11-event-bus-and-messaging.md)).
- [ ] Implement authoritative fixed-step **SimulationClock** with `timeScale` (including 0.05/0.1/0.25/0.5/1x), pause, tick/crank-angle/next-event stepping and exact physics-time <-> audio-sample mapping; mock simulation emits deterministic events and can be compared at different playback speeds.
- [ ] Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services.
- [ ] Implement synthetic AudioWorklet source and meters with waveform and frequency spectrum display, source/event/audio-frame correlation and bounded optional raw audio capture, without blocking the worklet.
- [ ] Implement export/import of a versioned portable recording (component/preset/solver/seed/time-scale/event/telemetry/audio metadata), validation/checksum checks, deterministic re-run and A/B difference curves; confirm a synthetic baseline can be recorded and compared before physical engine work.
- [ ] Implement **multi-page UI shell** (Dashboard, Drive, Diagnostics, Settings), expandable physics/audio/event menus, reusable draggable/hideable diagnostic widgets, route-independent simulation service, persistent widget layout and static Pages-compatible navigation.
- [ ] Define `FastComponentModel` / `ApproximationRegistry` contracts: generic analytic baseline, optional trained coefficient/lookup slot, version/unit/validity/fallback, component IDs and reference projection; training must be possible later without rewriting M1 solver.
- [ ] Define high-fidelity `ExperimentDefinition`/variation contracts: all-component manifest identity, one-part and preset-part changes, paired initial seeds/scenarios, fidelity config, reference-to-fast common output and study result formats.
- [ ] Implement capability detection, error overlay, user gesture AudioContext start and static fallback UI.
**Exit (blocking):** Pages app works; a reproducible mock run can time-scale, pause/step and drive audio/video graphs, record/export/import/replay/compare with physical/audio clock alignment, all via the Diagnostics route or movable widget; only then start M1 physical components.

## M1 — Physics core and starting
- [ ] Implement generic fixed-step deterministic **real-time physics** using M0 clock/event/recorder contracts, causal event collector, command scheduler and existing imported trace comparison.
- [ ] Implement each component's analytical baseline/parameter slots with versioned shared math kernels, SI input/output, physical bounds, trainable correction hooks and domain-dependent fallback; engine works correctly when no trained profile exists.
- [ ] Test event ordering, exactly-once command application, subscription cleanup, re-entrancy prevention and deterministic replay.
- [ ] Implement rotating inertia, drag/friction, per-cylinder crank/720° firing order and generic inline/V/flat bank geometry, compression load.
- [ ] Implement editable bore and stroke, rod length and clearance/compression geometry; recompute displacement and connected cylinder-volume/air-charge data consistently whenever a validated geometry change is applied.
- [ ] Add coupled crank, auxiliary and driveline rotational ports, free-rev/dyno/road-load adapters, SI torque/power measurements and energy-balance diagnostics.
- [ ] Implement minimal mechanically controlled carburetor/distributor path **without ECU** plus separately selectable ECU reference controller; reject controls not supported by the active strategy.
- [ ] Add ignition switch, battery SoC/voltage/internal resistance, starter motor/solenoid/engagement and torque-speed curve with defined interfaces for wear and heat.
- [ ] Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions.
- [ ] Implement selectable mechanical idle adjustment or ECU idle regulation, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall.
- [ ] Build headless first-start/stall scenarios and physical invariant tests.
**Exit:** generic baseline equations produce physically meaningful start/catch/idle/stall/torque traces without trained artifacts, with full component telemetry and replay comparison under 0.1x/1x time scaling.

## M2 — Procedural sound MVP
- [ ] Implement AudioWorklet loader + sample-accurate control/phase transport and bounded bus bridge with critical-event gap detection.
- [ ] Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.
- [ ] Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.
- [ ] Add sound-physics synchronization tests, worklet callback profiler and output capture with source-level FFT/waveform/routing diagnostics, A/B comparisons and correct timbre/event timing at slowed playback scale.
**Exit:** generic untrained engine + procedural sound runs at normal/slow-motion speeds; diagnostics can capture, reimport and compare engine/audio sound stems without glitches.

## M3 — Guided builder, 3D/2D views and multi-page audio lab
- [ ] Build procedural low-poly car and cutaway engine scene in Three.js and lightweight Canvas2D **side-view row per bank** (every cylinder/piston/rod/valve, cycle, combustion and actual mass-flow indication).
- [ ] Animate crank/pistons/valves/firing using authoritative engine angle and cylinder events, with synchronized slow-motion, pause/step, viewport switching and lost-render-frame recovery.
- [ ] Complete multi-page Builder/Drive/Audio Studio/Diagnostics/Presets navigation; source, cylinder and physics graphs are openable in removable/movable small widgets on any suitable page.
- [ ] Implement **M3-A guided wizard**: template/start-blank, contextual step navigation, Basic/Advanced mode, validated fields, allowed values, unit-aware inputs, derived bore/stroke/displacement and live bank/mixer preview.
- [ ] Implement **M3-B step providers** for engine/control/intake/exhaust/electrical/transmission/drivetrain/wheels; conditional fields/options from component registry, final graph preflight, invalid downstream change preview/undo and save/resume drafts.
- [ ] Implement **M3-C training setup step**: supported Quick/Balanced/Detailed/Research tiers, per-component zone and timestep controls, preflight cost/capability and Worker/CLI job selection (UI editor may precede actual M6 solvers).
- [ ] Add start/stop, throttle, ignition, load and preset editor UI with SI conversions; applying configuration to an active simulation requires a validated reset/safe boundary.
- [ ] Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics.
**Exit:** page navigation and 2D/3D/audio graphs remain synchronized during 0.05–1x playback; wizard/mixer and draggable/hideable debug widgets work without reconstructing the engine, and valid bore/stroke-only options remain enforced.

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

## M5 — Scenario orchestration and fast-model variation studies
- [ ] Parse/validate schema with deterministic seeded initial state.
- [ ] Implement elapsed/time/event/condition/all/any gates, sustained conditions and finite timeouts using canonical event sequence watermarks and authoritative solver state.
- [ ] Implement branch/retry policies, negative assertions and event-history semantics.
- [ ] Build experiment/study definitions: baseline vehicle + complete component and parameter manifests, run groups for a single changed part, a named set of parts, parameter sweep, repeated validation runs, matched seeds and event-gated scenario sequences.
- [ ] Add headless A/B fast-model runner and comparisons of component-by-component torque/energy/airflow, audio stem spectra/transients and external load; preserve identical conditions and record realized component differences.
- [ ] Build headless scenario matrix, traces, reporter and UI scenario editor/playback.
- [ ] Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](19-scenario-coverage-and-presets.md)).
- [ ] Add component graph conservation tests, pairwise configuration coverage, high-risk cross combinations and explicit unimplemented/unsupported reporting.
- [ ] Add wizard + JSON import parity tests (no ECU vs ECU, transmission type, turbo/NA, 4WD/2WD, V/flat cylinder-bank constraints), geometry/displacement property checks, and safe schema migration/undo tests.
- [ ] Define event-aligned advanced reference scenario traces and zone-level flow/temperature/pressure/thermal-loss test cases, with independent mesh/time-step convergence protocols.
- [ ] Run randomized boundary cases and automated stress tests.
**Exit:** start/failure/stall/limiter/afterfire scenarios plus one-part and part-set fast-model experiments run and report physically/audio meaningful differences, with component provenance and imported baseline revalidation.

## M6 — Adjustable-fidelity, potentially multi-hour, multicore reference simulation

### M6-A — Reference solver foundations and coarse levels
- [ ] Define a common numerical solver interface, reference state/port units, crank-angle/cycle boundary conditions, event alignment and deterministic run/trace manifests.
- [ ] Implement **Quick 0D cylinder** and **Balanced burned/unburned two-zone** thermodynamic/heat-release models with wall/coolant heat-loss accounting, valve intake/exhaust mass flow and torque coupling.
- [ ] Implement compatible lumped intake/exhaust gas-path models and segmented baseline metal temperatures; verify cross-port mass/enthalpy/energy consistency.

### M6-B — Detailed cylinder combustion and wall zones
- [ ] Implement **multi-zone cylinder gas** (burned/unburned/core/near-wall and optional refined regions) with configurable zone count, inter-zone mass/heat transfer, ignition/combustion progress and expansion/blowdown.
- [ ] Implement cylinder **liner axial bands and radial conduction layers**, head/piston crown metal layers and local gas-wall heat flux; keep actual dimensions separate from mesh resolution.
- [ ] Couple crank piston geometry (bore, stroke, rod, compression), valve/port lift, cylinder thermodynamics and pressure-driven torque; validate mesh refinement, pressure/temperature fields, mass/energy residuals and repeatable events.

### M6-C — Intake, exhaust and advanced flow/thermal zones
- [ ] Implement configurable intake/exhaust **1D axial gas cells** (pressure, temperature, flow, waves) at valves/runners/collectors/mufflers, including junctions and reflection/propagation behavior.
- [ ] Add independent exhaust/intake **wall axial segments and radial thermal layers**, turbine/intercooler heat paths where supported, and physically conditioned afterfire heat/pressure propagation.
- [ ] Enforce CFL/adaptive timestep, crank-angle/event boundaries, physical positivity and failure/diagnostic reporting across all reference modules.

### M6-D — Training detail UI and reproducible execution
- [ ] Wire Quick/Balanced/Detailed/Research profiles and per-component overrides into the guided wizard; disable unavailable solvers and invalid zone counts.
- [ ] Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling.
- [ ] Add **offline TypeScript/Node `worker_threads` study scheduler** with configurable simultaneous jobs/worker pool up to all logical CPU cores, high-fidelity run streaming to disk, progress measured by sim time/crank cycles, checkpoint/resume, and no arbitrary short wall-time failure for hours-per-cycle computations.
- [ ] Implement repeated validation/seed runs and paired **one-component/parameter and preset-of-components** variations under identical time/event-gated scenarios, capturing full actual component/part topology, state, versions and source audio provenance.
- [ ] Record fidelity/mesh/solver/threads/hardware/energy residuals, source excitation/spectra and per-component causal differences in a versioned reference dataset with provenance hashes; invalidate unstable or incomplete runs.
- [ ] Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons.

**Exit:** independent coarse/detailed cylinder/intake/exhaust models run for as many wall-clock hours as required, resume from checkpoints and export complete part-tagged reproducible baseline/variant/replicate datasets, without blocking AudioWorklet.

## M7 — Calibration / training
- [ ] Define weighted physical/audio loss, per-scenario scores and constraints.
- [ ] Fit configurable shared mathematical families (analytical coefficient, bounded lookup maps/splines, reduced-order state space and optionally compact ML) into existing M0/M1 approximation slots, with physical units, component-specific bindings, validity domains and fallback to generic baseline.
- [ ] Detect reusable/identical mathematically and physically compatible models across multiple components and deduplicate shared equations/lookup data while preserving exact component IDs, parameter sets and provenance.
- [ ] Consume one-part/part-set sensitivity comparisons to determine which changes impact physical torque/airflow/exhaust and which change sound source timing/timbre; calibrate appropriate fast variables rather than copying raw high-detail trajectories.
- [ ] Extract reference pressure/heat-release/port-flow/resonance features from multiple fidelity levels and fit compact physically constrained fast-model corrections; never require spatial gas/metal meshes at runtime.
- [ ] Implement bounded parameter search, spline/map fitting and regularization.
- [ ] Add scenario/configuration-disjoint holdout sets across engine family, intake/boost, controller and transmission/AWD combinations, boundary sampling and model comparison.
- [ ] Record source fidelity/mesh versions and convergence/uncertainty in every trained artifact; reject un-converged/unreliable reference configurations as training ground truth.
- [ ] Export versioned coefficient profiles with validity bounds, provenance and hashes; activate via validated scheduled command and PROFILE_ACTIVATED event.
- [ ] Load and atomically swap validated profiles; add stable baseline fallback.
- [ ] Reject candidates with worse transition behavior, instability or audio CPU overruns.
**Exit:** measured held-out improvements for both physics and source audio, no mandatory scenario/energy regressions, versioned reused equation/map families and fallback; tuned fast engine runs within real-time CPU budget and maps to the original high-detail components.

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

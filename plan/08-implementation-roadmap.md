# 08 — Dependency-ordered implementation roadmap

**Status:** proposed, not started. Implement vertical end-to-end slices; avoid spending weeks on high-fidelity training before a measurable simple engine exists. Each checklist item is separately reviewable and should ship with tests.

## M0 — Repository foundation and GitHub Pages
- [ ] Initialize Vite + TypeScript app, strict types, lint/format/typecheck and test runner.
- [ ] Add GitHub Actions CI + Pages deployment, Vite base path, SPA fallback strategy (prefer hash routing if needed) and HTTPS smoke test.
- [ ] Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset.
- [ ] Implement capability detection, error overlay, user gesture AudioContext start and static fallback UI.
**Exit:** demo loads at repository GitHub Pages subpath; tests run in CI; no runtime server required.

## M1 — Physics core and starting
- [ ] Add fixed-step deterministic solver, causal event bus, clock/reset and trace recording.
- [ ] Implement rotating inertia, drag/friction, per-cylinder crank/720° firing order, compression load.
- [ ] Add ignition switch, battery starter motor/engagement and starter torque curve.
- [ ] Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions.
- [ ] Implement idle ECU, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall.
- [ ] Build headless first-start/stall scenarios and physical invariant tests.
**Exit:** meaningful RPM trace for start/catch/idle/stall without fabricated state transitions.

## M2 — Procedural sound MVP
- [ ] Implement AudioWorklet loader + sample-accurate control/phase transport.
- [ ] Synthesize starter whine, compression and initial sporadic firing, then stable combustion pulse train.
- [ ] Build intake/exhaust/body resonances, filter smoothing, output meter and safe gain.
- [ ] Add sound-physics synchronization tests, worklet callback profiler and output capture.
**Exit:** recognizable crank-to-idle-to-stop; no clicks/NaNs or callback overruns in test run.

## M3 — 3D and interactive lab
- [ ] Build procedural low-poly car and cutaway engine scene in Three.js.
- [ ] Animate crank/pistons/valves/firing using actual engine angle and cylinder events.
- [ ] Add start/stop, throttle, ignition, load and preset editor UI with SI conversions.
- [ ] Add RPM/torque, event timeline, audio stem inspector and 3D performance fallback.
**Exit:** live physically consistent tuning and visualization while sound plays.

## M4 — Advanced engine, drivetrain and effects
- [ ] ECU limiter: soft/hard control, cylinder cut strategy, hysteresis and exit.
- [ ] Intake/fueling transients, overrun fuel-cut, misfires, hot/cold differences and engine thermal states.
- [ ] Exhaust afterfire and 2-step/anti-lag as opt-in physically conditioned features.
- [ ] Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.
- [ ] Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.
- [ ] Add forced induction and exhaust configuration after baseline validation.
**Exit:** P1 driving and limiter cases pass realistic state/audio assertions.

## M5 — Scenario orchestration
- [ ] Parse/validate schema with deterministic seeded initial state.
- [ ] Implement elapsed/time/event/condition/all/any gates, sustained conditions and finite timeouts.
- [ ] Implement branch/retry policies, negative assertions and event-history semantics.
- [ ] Build headless scenario matrix, traces, reporter and UI scenario editor/playback.
- [ ] Run randomized boundary cases and automated stress tests.
**Exit:** start, failure, stalls, rev limiter, shifts and afterfire all have passing and intentionally failing cases with diagnostic reports.

## M6 — Advanced reference simulation
- [ ] Define high-fidelity boundary conditions, state/torque/acoustic impulse outputs and units.
- [ ] Implement finer-step combustion/flow/resonator reference components; validate conservation and known baselines.
- [ ] Implement reproducible simulation sweep runner with dataset metadata.
- [ ] Create reference data from licensed recordings (optional) and calibrated engine measurements.
**Exit:** independently checked reference traces for full scenario envelope.

## M7 — Calibration / training
- [ ] Define weighted physical/audio loss, per-scenario scores and constraints.
- [ ] Implement bounded parameter search, spline/map fitting and regularization.
- [ ] Add scenario/configuration-disjoint holdout sets, boundary sampling and model comparison.
- [ ] Export versioned coefficient profiles with validity bounds, provenance and hashes.
- [ ] Load and atomically swap validated profiles; add stable baseline fallback.
- [ ] Reject candidates with worse transition behavior, instability or audio CPU overruns.
**Exit:** quantified holdout improvement and zero mandatory scenario regressions.

## M8 — Optimization, release and documentation
- [ ] Browser/device matrix, 44.1/48kHz handling, audio suspend/device-change tests.
- [ ] CPU/memory profiling, graphics LOD, DSP quality tiers and benchmark dashboard.
- [ ] Preset import/export, reproducible demo and clear licensing/privacy attribution.
- [ ] Test deployed Pages artifact, pin releases, publish architecture/scenario/training docs.
**Exit:** stable public static demo with reproducible quality/benchmark report.

## Implementation dependencies
```text
M0 -> M1 -> M2 -> M3
        |      |
        +----> M5 <--- M4
                 |
                 v
                M6 -> M7 -> M8
```
M5 can start as a minimal harness during M1 (and should); its full editor/reporting milestone completes later. Parallel work: basic 3D asset creation after contracts in M0; reference-solver research can start during M2 but official training begins only after scenario coverage exists.

## Definition of done for every milestone
Code reviewed; deterministic tests added; physical model assumption documented; state/event schema updated; visual/audio regression traces captured; performance measured on target hardware; deployment remains functional. No completed label based only on visual plausibility.

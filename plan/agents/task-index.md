# Agent task index — one handoff per roadmap checkbox

**Rule:** assign one agent exactly one AG task card, never an entire milestone. **All 172 linked AG cards now have one clickable `AG-... COMPLETE` checkbox immediately below the unchanged heading, plus separately checked acceptance tests/evidence.** A roadmap checkbox with one or more cards completes **only when ALL corresponding AG completion boxes are checked on `main` after all individual acceptance tests, verified CI, owner approvals (if needed), **owner-reviewed + owner-merged OR authorized AI-integrator-reviewed + merged**, and a genuinely merged PR.** The post-merge agent then updates the linked parent in [the central 112-checkbox roadmap](../08-implementation-roadmap.md) via a tracking-only commit; no duplicate status column or checkbox is added here. Blocked/mock-only/partial work remains unchecked. See [agent instructions](README.md), [shared contracts](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md).

**Status: planning work orders.** Owner choices: [Round 1](../decisions/USER-APPROVED-ROUND-01.md), [Round 2](../decisions/USER-APPROVED-ROUND-02.md), [Round 3](../decisions/USER-APPROVED-ROUND-03.md), [O3 implementation approvals](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md). Physical solver owner awaits owner approval after benchmark; CUDA GTX1080 support awaits actual CUDA12 `sm_61` hardware tests; AI routine merge is conditionally approved but not yet deployed/configured.

Mapped **112** roadmap items to **172** independently assignable agent cards.

## M0 — M0-foundation.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M0-01` | [AG-M0-01](M0-foundation.md#ag-m0-01) | Initialize **Svelte + Vite** with strict TypeScript, tests/lint/format; freeze hash-router/state conventions consistent with approved Round 2. |
| `M0-02` | [AG-M0-02](M0-foundation.md#ag-m0-02) | Add GitHub Actions CI + Pages deployment, Vite base path and **required hash URLs** under `/sound-generator/#/...`, with HTTPS/direct-link/refresh smoke tests; no clean-history fallback needed. |
| `M0-03` | [AG-M0-03](M0-foundation.md#ag-m0-03) | Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset. |
| `M0-04` | [AG-M0-04](M0-foundation.md#ag-m0-04) | Define strict TypeScript component/port graph contracts, factories/capability registry, typed power/energy sign conventions, bank/cylinder geometry for 1–12 cylinders and technology fidelity status (see [14–20](14-modular-typescript-platform.md)). |
| `M0-05` | [AG-M0-05](M0-foundation.md#ag-m0-05) | Define independent controller, intake/induction, engine-family, transmission/differential, electrical and audio/renderer model interfaces before concrete implementations. |
| `M0-06` | [AG-M0-06](M0-foundation.md#ag-m0-06) | Define a **step-by-step schema-driven wizard**: capability/field descriptors, step prerequisites, per-field conditional option/range/visibility providers, draft-state/undo policy and shared preset/graph validation; see [22](22-guided-vehicle-configurator.md). |
| `M0-07` | [AG-M0-07](M0-foundation.md#ag-m0-07) | Specify bore/stroke/rod/compression geometry input contracts and derived cylinder/total displacement with SI conversion, plus verified equation/constraint tests. |
| `M0-08` | [AG-M0-08](M0-foundation.md#ag-m0-08) | Define configurable **reference-fidelity profile contracts** (Quick/Balanced/Detailed/Research), component solver capabilities, gas/metal/wall zone axes, step/CFL/stability tolerances and resource preflight; see [21](21-adjustable-fidelity-multizone-reference-simulation.md). |
| `M0-09` | [AG-M0-09](M0-foundation.md#ag-m0-09) | Specify shared typed EventMap/CommandMap, event ownership, causation IDs, simulation tick/sample-frame clocks, subscriber API and bounded cross-thread transport contracts (see [11](11-event-bus-and-messaging.md)). |
| `M0-10` | [AG-M0-10](M0-foundation.md#ag-m0-10) | Implement authoritative fixed-step **SimulationClock** with `timeScale` (including 0.05/0.1/0.25/0.5/1x), pause, tick/crank-angle/next-event stepping and exact physics-time <-> audio-sample mapping; mock simulation emits deterministic events and can be compared at different playback speeds. |
| `M0-11` | [AG-M0-11a](M0-foundation.md#ag-m0-11a), [AG-M0-11b](M0-foundation.md#ag-m0-11b), [AG-M0-11c](M0-foundation.md#ag-m0-11c), [AG-M0-11d](M0-foundation.md#ag-m0-11d) | Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services. |
| `M0-12` | [AG-M0-12](M0-foundation.md#ag-m0-12) | Implement synthetic AudioWorklet source and meters with waveform and frequency spectrum display, source/event/audio-frame correlation and bounded optional raw audio capture, without blocking the worklet. |
| `M0-13` | [AG-M0-13](M0-foundation.md#ag-m0-13) | Implement versioned **browser ZIP** recording/export/import, JSON manifest, chunked typed traces, checksums and optional **synthesized** audio with size/version/security validation, deterministic replay and A/B diff; optional Parquet/HDF5 are later offline adapters. |
| `M0-14` | [AG-M0-14a](M0-foundation.md#ag-m0-14a), [AG-M0-14b](M0-foundation.md#ag-m0-14b) | Implement Svelte **hash-route multi-page UI** (Dashboard, Drive, Diagnostics, Settings), expandable debug menus and draggable/hideable widgets without recreating simulation/audio on navigation. |
| `M0-15` | [AG-M0-15](M0-foundation.md#ag-m0-15) | Define `FastComponentModel` / `ApproximationRegistry` contracts: generic analytic baseline, optional trained coefficient/lookup slot, version/unit/validity/fallback, component IDs and reference projection; training must be possible later without rewriting M1 solver. |
| `M0-16` | [AG-M0-16](M0-foundation.md#ag-m0-16) | Define reference experiments and `ReferenceComputeBackend` with **Windows/Linux support**, optional CPU/GPU, provenance/precision and research-export format contracts; maintain browser ZIP as exchange base. |
| `M0-17` | [AG-M0-17](M0-foundation.md#ag-m0-17) | Implement **desktop Chromium/Firefox/Safari** capability detection, audio gesture/unlock/error UI and lower-cost Canvas 2D fallback when 3D unsupported. |
| `M0-18` | [AG-M0-18](M0-foundation.md#ag-m0-18) | Define **versioned IndexedDB autosave** for config, mixer, expert trims, widgets, scenarios and **bounded recent debug data**, plus **configurable bounded history**, quota recovery, last-valid EFI preference and optional portable ZIP snapshots. |
| `M0-19` | [AG-M0-19](M0-foundation.md#ag-m0-19) | Implement AI PR review plus **conditional autonomous merging of routine cards only after actual authorized branch/CI/security checks**, with mandatory owner escalation of major ADRs and public/shared TS contract or ownership changes; bot credentials/permissions must first be tested. |

## M1 — M1-fast-engine.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M1-01` | [AG-M1-01](M1-fast-engine.md#ag-m1-01) | Implement generic fixed-step deterministic **real-time physics** using M0 clock/event/recorder contracts, causal event collector, command scheduler and existing imported trace comparison. |
| `M1-02` | [AG-M1-02](M1-fast-engine.md#ag-m1-02) | Implement each component's analytical baseline/parameter slots with versioned shared math kernels, SI input/output, physical bounds, trainable correction hooks and domain-dependent fallback; engine works correctly when no trained profile exists. |
| `M1-03` | [AG-M1-03](M1-fast-engine.md#ag-m1-03) | Test event ordering, exactly-once command application, subscription cleanup, re-entrancy prevention and deterministic replay. |
| `M1-04` | [AG-M1-04](M1-fast-engine.md#ag-m1-04) | Implement rotating inertia, drag/friction, per-cylinder crank/720° firing order and generic inline/V/flat bank geometry, compression load. |
| `M1-05` | [AG-M1-05](M1-fast-engine.md#ag-m1-05) | Implement editable bore and stroke, rod length and clearance/compression geometry; recompute displacement and connected cylinder-volume/air-charge data consistently whenever a validated geometry change is applied. |
| `M1-06` | [AG-M1-06](M1-fast-engine.md#ag-m1-06) | Add coupled crank, auxiliary and driveline rotational ports, free-rev/dyno/road-load adapters, SI torque/power measurements and energy-balance diagnostics. |
| `M1-07` | [AG-M1-07a](M1-fast-engine.md#ag-m1-07a), [AG-M1-07b](M1-fast-engine.md#ag-m1-07b) | Implement **both runnable and mutually exclusive** first-I4 options: carburetor + mechanical distributor **without ECU**, and **EFI/ECU** injection/spark/idle, with capability-dependent commands and realistic torque/sound inputs. |
| `M1-08` | [AG-M1-08a](M1-fast-engine.md#ag-m1-08a), [AG-M1-08b](M1-fast-engine.md#ag-m1-08b) | Add ignition switch, battery SoC/voltage/internal resistance, starter motor/solenoid/engagement and torque-speed curve with defined interfaces for wear and heat. |
| `M1-09` | [AG-M1-09a](M1-fast-engine.md#ag-m1-09a), [AG-M1-09b](M1-fast-engine.md#ag-m1-09b) | Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions. |
| `M1-10` | [AG-M1-10a](M1-fast-engine.md#ag-m1-10a), [AG-M1-10b](M1-fast-engine.md#ag-m1-10b) | Implement selectable mechanical idle adjustment or ECU idle regulation, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall. |
| `M1-11` | [AG-M1-11](M1-fast-engine.md#ag-m1-11) | Build start/idle/stall/manual-clutch/road-load headless fixtures **for both carbureted/no-ECU and EFI/ECU I4 variants**, including valid/invalid controller commands and energy tests. |
| `M1-12` | [AG-M1-12](M1-fast-engine.md#ag-m1-12) | **Propose physically justified SI parameters to owner for approval** for two editable carb/no-ECU and EFI/ECU I4 vehicle examples; after approval, ship both with starter/manual/road load and factory carb first-run default. |

## M2 — M2-audio.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M2-01` | [AG-M2-01](M2-audio.md#ag-m2-01) | Implement AudioWorklet loader + sample-accurate control/phase transport and bounded bus bridge with critical-event gap detection. |
| `M2-02` | [AG-M2-02a](M2-audio.md#ag-m2-02a), [AG-M2-02b](M2-audio.md#ag-m2-02b) | Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts. |
| `M2-03` | [AG-M2-03a](M2-audio.md#ag-m2-03a), [AG-M2-03b](M2-audio.md#ag-m2-03b) | Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom. |
| `M2-04` | [AG-M2-04](M2-audio.md#ag-m2-04) | Validate **both approved slow-motion audio modes** alongside sound-physics synchronization, worklet deadline/latency, waveform/FFT capture, mode-switch diagnostics and event alignment. |
| `M2-05` | [AG-M2-05](M2-audio.md#ag-m2-05) | Implement pitch-preserving slow-motion time-stretch DSP alongside physical pitch-lowered playback, with measured worklet CPU/latency, no silent fallback and deterministic mode switching (UI toggle in `AG-M3-07`). |
| `M2-06` | [AG-M2-06](M2-audio.md#ag-m2-06) | Add **expert-editable per-source gain trims only**, with calibrated operating conditions, revisions and undo; preserve separate everyday mixer/master, headroom and physics, without an unapproved expert EQ/spectral/DSP editor. |
| `M2-07` | [AG-M2-07](M2-audio.md#ag-m2-07) | Implement procedural **cabin, engine-bay, roadside and exhaust** listener transfer **independent of 2D/3D camera movement**, with source-aware filters/attenuation and unchanged physics. |

## M3 — M3-builder-and-views.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M3-01` | [AG-M3-01a](M3-builder-and-views.md#ag-m3-01a), [AG-M3-01b](M3-builder-and-views.md#ag-m3-01b) | Build procedural low-poly car and cutaway engine scene in Three.js and lightweight Canvas2D **side-view row per bank** (every cylinder/piston/rod/valve, cycle, combustion and actual mass-flow indication). |
| `M3-02` | [AG-M3-02](M3-builder-and-views.md#ag-m3-02) | Animate crank/pistons/valves/firing using authoritative engine angle and cylinder events, with synchronized slow-motion, pause/step, viewport switching and lost-render-frame recovery. |
| `M3-03` | [AG-M3-03](M3-builder-and-views.md#ag-m3-03) | Complete **Svelte hash-route** Builder/Drive/Audio Studio/Diagnostics/Presets pages and movable diagnostic widgets without resetting the runtime. |
| `M3-04` | [AG-M3-04](M3-builder-and-views.md#ag-m3-04) | Implement **M3-A guided wizard**: template/start-blank, contextual step navigation, Basic/Advanced mode, validated fields, allowed values, unit-aware inputs, derived bore/stroke/displacement and live bank/mixer preview. |
| `M3-05` | [AG-M3-05a](M3-builder-and-views.md#ag-m3-05a), [AG-M3-05b](M3-builder-and-views.md#ag-m3-05b), [AG-M3-05c](M3-builder-and-views.md#ag-m3-05c) | Implement wizard steps that **toggle carb/no-ECU vs EFI/ECU for the first I4**, hide unsupported fields, and validate all induced engine/intake/electrical/transmission changes and preset import via one registry. |
| `M3-06` | [AG-M3-06](M3-builder-and-views.md#ag-m3-06) | Implement **M3-C training setup step**: supported Quick/Balanced/Detailed/Research tiers, per-component zone and timestep controls, preflight cost/capability and Worker/CLI job selection (UI editor may precede actual M6 solvers). |
| `M3-07` | [AG-M3-07](M3-builder-and-views.md#ag-m3-07) | Add start/stop, throttle, ignition, load and preset editor UI with **independently chosen display units converted to SI** and the **physical/pitch-preserved slow-motion audio mode switch**; applying engine configuration requires a validated reset/safe boundary. |
| `M3-08` | [AG-M3-08a](M3-builder-and-views.md#ag-m3-08a), [AG-M3-08b](M3-builder-and-views.md#ag-m3-08b), [AG-M3-08c](M3-builder-and-views.md#ag-m3-08c) | Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics. |
| `M3-09` | [AG-M3-09](M3-builder-and-views.md#ag-m3-09) | Add Audio Studio **Advanced/Expert toggle without authentication**, editing source gain trims, reference conditions, revisions/undo, separately from ordinary mixer; no extra user-editable EQ/source DSP. |
| `M3-10` | [AG-M3-10](M3-builder-and-views.md#ag-m3-10) | Add **four-position listening selector**, **fully independent of the 2D/3D camera**, persistent across pages; no follow-camera option without a later owner decision. |
| `M3-11` | [AG-M3-11](M3-builder-and-views.md#ag-m3-11) | Integrate **IndexedDB autosave** for configs, mixer, calibration, scenarios, widgets and **bounded recent debug data**, **configurable bounded historical snapshots**, recovery and optional ZIP workspace import/export. |

## M4A — M4A-controls-and-electrical.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M4A-01` | [AG-M4A-01](M4A-controls-and-electrical.md#ag-m4a-01) | ECU limiter: soft/hard control, cylinder cut strategy, hysteresis and exit; capability-aware mechanical/no-ECU alternatives. |
| `M4A-02` | [AG-M4A-02a](M4A-controls-and-electrical.md#ag-m4a-02a), [AG-M4A-02b](M4A-controls-and-electrical.md#ag-m4a-02b), [AG-M4A-02c](M4A-controls-and-electrical.md#ag-m4a-02c) | Add battery aging and cold cranking, worn/heat-soaked starter, solenoid failures, cable voltage drop, charging/alternator and accessory loads. |
| `M4A-03` | [AG-M4A-03a](M4A-controls-and-electrical.md#ag-m4a-03a), [AG-M4A-03b](M4A-controls-and-electrical.md#ag-m4a-03b) | Add configurable ECU fuel/spark/boost/overrun maps and mechanical carb/distributor/choke behavior with mutually valid controls. |
| `M4A-04` | [AG-M4A-04a](M4A-controls-and-electrical.md#ag-m4a-04a), [AG-M4A-04b](M4A-controls-and-electrical.md#ag-m4a-04b) | Intake/fueling transients, overrun fuel-cut, misfires, hot/cold differences and engine thermal states. |

## M4B — M4B-intake-and-exhaust.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M4B-01` | [AG-M4B-01a](M4B-intake-and-exhaust.md#ag-m4b-01a), [AG-M4B-01b](M4B-intake-and-exhaust.md#ag-m4b-01b) | Add filter/airbox, throttle/plenum, variable runners, ITB/carburetor configurations with actual volumetric-efficiency and sonic effects. |
| `M4B-02` | [AG-M4B-02a](M4B-intake-and-exhaust.md#ag-m4b-02a), [AG-M4B-02b](M4B-intake-and-exhaust.md#ag-m4b-02b), [AG-M4B-02c](M4B-intake-and-exhaust.md#ag-m4b-02c) | Add validated single/parallel/sequential/compound turbo, supercharger types and twincharging/charge-cooling via a flow/energy graph; test mechanical/exhaust/electrical parasitic energy. |
| `M4B-03` | [AG-M4B-03a](M4B-intake-and-exhaust.md#ag-m4b-03a), [AG-M4B-03b](M4B-intake-and-exhaust.md#ag-m4b-03b) | Exhaust afterfire/intake backfire and stock/mild/aggressive pop-and-bang tune strategies plus 2-step/anti-lag as opt-in **physically conditioned** features, each with failure/negative-control scenarios. |

## M4C — M4C-transmissions-and-drivetrains.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M4C-01` | [AG-M4C-01a](M4C-transmissions-and-drivetrains.md#ag-m4c-01a), [AG-M4C-01b](M4C-transmissions-and-drivetrains.md#ag-m4c-01b) | Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model. |
| `M4C-02` | [AG-M4C-02a](M4C-transmissions-and-drivetrains.md#ag-m4c-02a), [AG-M4C-02b](M4C-transmissions-and-drivetrains.md#ag-m4c-02b), [AG-M4C-02c](M4C-transmissions-and-drivetrains.md#ag-m4c-02c), [AG-M4C-02d](M4C-transmissions-and-drivetrains.md#ag-m4c-02d) | Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics. |
| `M4C-03` | [AG-M4C-03a](M4C-transmissions-and-drivetrains.md#ag-m4c-03a), [AG-M4C-03b](M4C-transmissions-and-drivetrains.md#ag-m4c-03b), [AG-M4C-03c](M4C-transmissions-and-drivetrains.md#ag-m4c-03c) | Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft. |
| `M4C-04` | [AG-M4C-04a](M4C-transmissions-and-drivetrains.md#ag-m4c-04a), [AG-M4C-04b](M4C-transmissions-and-drivetrains.md#ag-m4c-04b) | Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout. |

## M4D — M4D-engine-presets.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M4D-01` | [AG-M4D-01a](M4D-engine-presets.md#ag-m4d-01a), [AG-M4D-01b](M4D-engine-presets.md#ag-m4d-01b), [AG-M4D-01c](M4D-engine-presets.md#ag-m4d-01c) | Publish validated single-cylinder through V12 inline/V/flat examples with firing order, bank angle, crank geometry and collector acoustics, including cross-plane/flat-plane V8 and distinct 2D rows. |
| `M4D-02` | [AG-M4D-02](M4D-engine-presets.md#ag-m4d-02) | Add forced-induction and exhaust configurations to verified preset combinations rather than treating every untested combination as supported. |
| `M4D-03` | [AG-M4D-03](M4D-engine-presets.md#ag-m4d-03) | Test per-component physical torque/energy accounting, separate drivetrain/cylinder/induction audio stems and power figures for each shipped configuration. |

## M5 — M5-scenarios-and-experiments.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M5-01` | [AG-M5-01](M5-scenarios-and-experiments.md#ag-m5-01) | Parse/validate schema with deterministic seeded initial state. |
| `M5-02` | [AG-M5-02](M5-scenarios-and-experiments.md#ag-m5-02) | Implement elapsed/time/event/condition/all/any gates, sustained conditions and finite timeouts using canonical event sequence watermarks and authoritative solver state. |
| `M5-03` | [AG-M5-03](M5-scenarios-and-experiments.md#ag-m5-03) | Implement branch/retry policies, negative assertions and event-history semantics. |
| `M5-04` | [AG-M5-04](M5-scenarios-and-experiments.md#ag-m5-04) | Build experiment/study definitions: baseline vehicle + complete component and parameter manifests, run groups for a single changed part, a named set of parts, parameter sweep, repeated validation runs, matched seeds and event-gated scenario sequences. |
| `M5-05` | [AG-M5-05](M5-scenarios-and-experiments.md#ag-m5-05) | Add headless A/B fast-model runner and comparisons of component-by-component torque/energy/airflow, audio stem spectra/transients and external load; preserve identical conditions and record realized component differences. |
| `M5-06` | [AG-M5-06a](M5-scenarios-and-experiments.md#ag-m5-06a), [AG-M5-06b](M5-scenarios-and-experiments.md#ag-m5-06b) | Build headless scenario matrix, traces, reporter and UI scenario editor/playback. |
| `M5-07` | [AG-M5-07a](M5-scenarios-and-experiments.md#ag-m5-07a), [AG-M5-07b](M5-scenarios-and-experiments.md#ag-m5-07b), [AG-M5-07c](M5-scenarios-and-experiments.md#ag-m5-07c), [AG-M5-07d](M5-scenarios-and-experiments.md#ag-m5-07d) | Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](19-scenario-coverage-and-presets.md)). |
| `M5-08` | [AG-M5-08](M5-scenarios-and-experiments.md#ag-m5-08) | Add component graph conservation tests, pairwise configuration coverage, high-risk cross combinations and explicit unimplemented/unsupported reporting. |
| `M5-09` | [AG-M5-09](M5-scenarios-and-experiments.md#ag-m5-09) | Add wizard + JSON import parity tests (no ECU vs ECU, transmission type, turbo/NA, 4WD/2WD, V/flat cylinder-bank constraints), geometry/displacement property checks, and safe schema migration/undo tests. |
| `M5-10` | [AG-M5-10](M5-scenarios-and-experiments.md#ag-m5-10) | Define event-aligned advanced reference scenario traces and zone-level flow/temperature/pressure/thermal-loss test cases, with independent mesh/time-step convergence protocols. |
| `M5-11` | [AG-M5-11](M5-scenarios-and-experiments.md#ag-m5-11) | Run randomized boundary cases and automated stress tests. |

## M6A — M6A-reference-foundations.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M6A-01` | [AG-M6A-01](M6A-reference-foundations.md#ag-m6a-01) | Define a common numerical solver interface, reference state/port units, crank-angle/cycle boundary conditions, event alignment and deterministic run/trace manifests. |
| `M6A-02` | [AG-M6A-02a](M6A-reference-foundations.md#ag-m6a-02a), [AG-M6A-02b](M6A-reference-foundations.md#ag-m6a-02b) | Implement **Quick 0D cylinder** and **Balanced burned/unburned two-zone** thermodynamic/heat-release models with wall/coolant heat-loss accounting, valve intake/exhaust mass flow and torque coupling. |
| `M6A-03` | [AG-M6A-03a](M6A-reference-foundations.md#ag-m6a-03a), [AG-M6A-03b](M6A-reference-foundations.md#ag-m6a-03b) | Implement compatible lumped intake/exhaust gas-path models and segmented baseline metal temperatures; verify cross-port mass/enthalpy/energy consistency. |

## M6B — M6B-cylinder-zones.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M6B-01` | [AG-M6B-01a](M6B-cylinder-zones.md#ag-m6b-01a), [AG-M6B-01b](M6B-cylinder-zones.md#ag-m6b-01b) | Implement **multi-zone cylinder gas** (burned/unburned/core/near-wall and optional refined regions) with configurable zone count, inter-zone mass/heat transfer, ignition/combustion progress and expansion/blowdown. |
| `M6B-02` | [AG-M6B-02a](M6B-cylinder-zones.md#ag-m6b-02a), [AG-M6B-02b](M6B-cylinder-zones.md#ag-m6b-02b) | Implement cylinder **liner axial bands and radial conduction layers**, head/piston crown metal layers and local gas-wall heat flux; keep actual dimensions separate from mesh resolution. |
| `M6B-03` | [AG-M6B-03a](M6B-cylinder-zones.md#ag-m6b-03a), [AG-M6B-03b](M6B-cylinder-zones.md#ag-m6b-03b) | Couple crank piston geometry (bore, stroke, rod, compression), valve/port lift, cylinder thermodynamics and pressure-driven torque; validate mesh refinement, pressure/temperature fields, mass/energy residuals and repeatable events. |

## M6C — M6C-one-dimensional-flow.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M6C-01` | [AG-M6C-01a](M6C-one-dimensional-flow.md#ag-m6c-01a), [AG-M6C-01b](M6C-one-dimensional-flow.md#ag-m6c-01b) | Implement configurable intake/exhaust **1D axial gas cells** (pressure, temperature, flow, waves) at valves/runners/collectors/mufflers, including junctions and reflection/propagation behavior. |
| `M6C-02` | [AG-M6C-02a](M6C-one-dimensional-flow.md#ag-m6c-02a), [AG-M6C-02b](M6C-one-dimensional-flow.md#ag-m6c-02b) | Add independent exhaust/intake **wall axial segments and radial thermal layers**, turbine/intercooler heat paths where supported, and physically conditioned afterfire heat/pressure propagation. |
| `M6C-03` | [AG-M6C-03](M6C-one-dimensional-flow.md#ag-m6c-03) | Enforce CFL/adaptive timestep, crank-angle/event boundaries, physical positivity and failure/diagnostic reporting across all reference modules. |

## M6D — M6D-reference-execution-and-views.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M6D-01` | [AG-M6D-01](M6D-reference-execution-and-views.md#ag-m6d-01) | Wire Quick/Balanced/Detailed/Research profiles and per-component overrides into the guided wizard; disable unavailable solvers and invalid zone counts. |
| `M6D-02` | [AG-M6D-02a](M6D-reference-execution-and-views.md#ag-m6d-02a), [AG-M6D-02b](M6D-reference-execution-and-views.md#ag-m6d-02b) | Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling. |
| `M6D-03` | [AG-M6D-03a](M6D-reference-execution-and-views.md#ag-m6d-03a), [AG-M6D-03b](M6D-reference-execution-and-views.md#ag-m6d-03b) | Build **Windows/Linux** offline TypeScript study scheduler with CPU worker_threads and optional native/GPU backends, streaming/checkpoints/resume, real sim-time progress and bounded RAM/CPU/GPU/disk resource controls. |
| `M6D-04` | [AG-M6D-04](M6D-reference-execution-and-views.md#ag-m6d-04) | Implement repeated validation/seed runs and paired **one-component/parameter and preset-of-components** variations under identical time/event-gated scenarios, capturing full actual component/part topology, state, versions and source audio provenance. |
| `M6D-05` | [AG-M6D-05](M6D-reference-execution-and-views.md#ag-m6d-05) | Export full component/multizone/fidelity/solver/OS/backend provenance and measured-reference comparison/confidence, reimportable into browser **ZIP** and optional offline **Parquet/HDF5** research output without discarding units/hashes. |
| `M6D-06` | [AG-M6D-06a](M6D-reference-execution-and-views.md#ag-m6d-06a), [AG-M6D-06b](M6D-reference-execution-and-views.md#ag-m6d-06b) | Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons. |
| `M6D-07` | [AG-M6D-07](M6D-reference-execution-and-views.md#ag-m6d-07) | Implement Windows/Linux CLI-launched **loopback-only local web dashboard**, with local job-control API, progress/log/resource/stop/checkpoint, safe localhost origin/security checks; no public remote service. |
| `M6D-08` | [AG-M6D-08](M6D-reference-execution-and-views.md#ag-m6d-08) | Build a Windows/Linux offline **CPU + NVIDIA CUDA** backend with a separately supported **GTX1080 Pascal `sm_61` / CUDA 12.x** compile/runtime path, cross-platform numerical parity, explicit CPU fallback, device/driver/resource diagnostics and no CUDA13-only dependency for the legacy-compatible route. |

## M7 — M7-surrogate-fitting.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M7-01` | [AG-M7-01](M7-surrogate-fitting.md#ag-m7-01) | Define weighted physical/audio loss, per-scenario scores and constraints. |
| `M7-02` | [AG-M7-02a](M7-surrogate-fitting.md#ag-m7-02a), [AG-M7-02b](M7-surrogate-fitting.md#ag-m7-02b) | Fit configurable shared mathematical families (analytical coefficient, bounded lookup maps/splines, reduced-order state space and optionally compact ML) into existing M0/M1 approximation slots, with physical units, component-specific bindings, validity domains and fallback to generic baseline. |
| `M7-03` | [AG-M7-03](M7-surrogate-fitting.md#ag-m7-03) | Detect reusable/identical mathematically and physically compatible models across multiple components and deduplicate shared equations/lookup data while preserving exact component IDs, parameter sets and provenance. |
| `M7-04` | [AG-M7-04](M7-surrogate-fitting.md#ag-m7-04) | Consume one-part/part-set sensitivity comparisons to determine which changes impact physical torque/airflow/exhaust and which change sound source timing/timbre; calibrate appropriate fast variables rather than copying raw high-detail trajectories. |
| `M7-05` | [AG-M7-05](M7-surrogate-fitting.md#ag-m7-05) | Extract reference pressure/heat-release/port-flow/resonance features from multiple fidelity levels and fit compact physically constrained fast-model corrections; never require spatial gas/metal meshes at runtime. |
| `M7-06` | [AG-M7-06](M7-surrogate-fitting.md#ag-m7-06) | Implement bounded parameter search, spline/map fitting and regularization. |
| `M7-07` | [AG-M7-07](M7-surrogate-fitting.md#ag-m7-07) | Add scenario/configuration-disjoint holdout sets across engine family, intake/boost, controller and transmission/AWD combinations, boundary sampling and model comparison. |
| `M7-08` | [AG-M7-08](M7-surrogate-fitting.md#ag-m7-08) | Record source fidelity/mesh versions and convergence/uncertainty in every trained artifact; reject un-converged/unreliable reference configurations as training ground truth. |
| `M7-09` | [AG-M7-09](M7-surrogate-fitting.md#ag-m7-09) | Export versioned coefficient profiles with validity bounds, provenance and hashes; activate via validated scheduled command and PROFILE_ACTIVATED event. |
| `M7-10` | [AG-M7-10](M7-surrogate-fitting.md#ag-m7-10) | Load and atomically swap validated profiles; add stable baseline fallback. |
| `M7-11` | [AG-M7-11](M7-surrogate-fitting.md#ag-m7-11) | Reject candidates with worse transition behavior, instability or audio CPU overruns. |
| `M7-12` | [AG-M7-12](M7-surrogate-fitting.md#ag-m7-12) | **Research legally distributable measurement candidates and submit license evidence for owner approval before bundling**; support user imports/analysis-only audio and exclude unverifiable sources. |

## M8 — M8-release-and-performance.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M8-01` | [AG-M8-01](M8-release-and-performance.md#ag-m8-01) | Test **latest two stable major desktop versions where available** of Chromium/Chrome, Firefox and Safari, 44.1/48kHz audio, suspend/devices, hash navigation and 2D fallback, plus Windows/Linux CLI. |
| `M8-02` | [AG-M8-02](M8-release-and-performance.md#ag-m8-02) | **Propose a representative mid-range FPS benchmark desktop to the owner**, then measure 30 FPS 3D/60 FPS 2D on approved machine; compare separately with the owner's i9/GTX1080 compatibility target and profile CPU/memory. |
| `M8-03` | [AG-M8-03](M8-release-and-performance.md#ag-m8-03) | Preset import/export, reproducible demo and clear licensing/privacy attribution. |
| `M8-04` | [AG-M8-04](M8-release-and-performance.md#ag-m8-04) | Release-test hash Pages on last two stable Chrome/Firefox/Safari majors where available, ZIP/IndexedDB/browser compatibility, Windows/Linux and i9/GTX1080 baseline, enforce **AI routine merge after authorized checks** with mandatory owner escalation for shared API changes and major ADRs. |
| `M8-05` | [AG-M8-05](M8-release-and-performance.md#ag-m8-05) | Verify compatibility on the owner's **10th-gen Intel Core i9 + NVIDIA GTX1080** desktop (browser audio/2D/3D plus CPU/CUDA12 `sm_61` where available), separately from **agent-proposed owner-approved mid-range desktop** 30 FPS 3D / 60 FPS 2D reference benchmark. |

## M9P — M9-plus-future-providers.md

| Roadmap step | Assigned agent card(s) | Current roadmap requirement |
|---|---|---|
| `M9P-01` | [AG-M9P-01a](M9-plus-future-providers.md#ag-m9p-01a), [AG-M9P-01b](M9-plus-future-providers.md#ag-m9p-01b), [AG-M9P-01c](M9-plus-future-providers.md#ag-m9p-01c), [AG-M9P-01d](M9-plus-future-providers.md#ag-m9p-01d), [AG-M9P-01e](M9-plus-future-providers.md#ag-m9p-01e) | **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources. |
| `M9P-02` | [AG-M9P-02a](M9-plus-future-providers.md#ag-m9p-02a), [AG-M9P-02b](M9-plus-future-providers.md#ag-m9p-02b), [AG-M9P-02c](M9-plus-future-providers.md#ag-m9p-02c), [AG-M9P-02d](M9-plus-future-providers.md#ag-m9p-02d), [AG-M9P-02e](M9-plus-future-providers.md#ag-m9p-02e) | **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer. |
| `M9P-03` | [AG-M9P-03a](M9-plus-future-providers.md#ag-m9p-03a), [AG-M9P-03b](M9-plus-future-providers.md#ag-m9p-03b), [AG-M9P-03c](M9-plus-future-providers.md#ag-m9p-03c), [AG-M9P-03d](M9-plus-future-providers.md#ag-m9p-03d) | **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined. |
| `M9P-04` | [AG-M9P-04a](M9-plus-future-providers.md#ag-m9p-04a), [AG-M9P-04b](M9-plus-future-providers.md#ag-m9p-04b), [AG-M9P-04c](M9-plus-future-providers.md#ag-m9p-04c) | **M12 — Broader calibration and technology verification:** expand validated measured sources, cross-generation regression and performance coverage. Clearly identify accuracy and unsupported features per preset. |

## Cross-card references

- [Agent start and handoff](README.md)
- [Dedicated AI integrator reviewer prompt](AI_INTEGRATOR_PROMPT.md)
- [Audit register](../29-plan-audit-and-gap-register.md)
- [Core contracts/owner-ADR process](../30-agent-handoff-contracts-and-decisions.md)
- [Evidence gates/support matrix](../31-integration-gates-and-support-matrix.md)
- [Remaining O3 verification tasks](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md)

**A missing card heading or a missing acceptance fixture is a blocker, not authorization to infer behavior from a roadmap summary.**
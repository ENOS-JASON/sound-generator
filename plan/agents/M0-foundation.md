# M0 — foundation agent work orders

**Scope:** synthetic observability plus frozen public contracts, not production engine features. These work orders are independently assignable; where a legacy roadmap bullet bundled multiple responsibilities it is explicitly split into letter-suffixed cards. Each card must follow [handoff rules](../30-agent-handoff-contracts-and-decisions.md), [audit](../29-plan-audit-and-gap-register.md) and [G0 gates](../31-integration-gates-and-support-matrix.md).

**Shared fixture input:** `tests/fixtures/golden/mock-run/` represents a seeded synthetic oscillator physics run with ordered events, known sample frame mappings and controlled audio tone. If absent, prerequisite is blocked; do not invent competing schema.

### AG-M0-01

**Approved Round 2 requirement:** Start with **owner-approved Svelte + Vite and hash routing** on GitHub Pages; pin a compatible Svelte/router version and present major state-library choices for owner review. Add `/#/drive` navigation fixture; a history-route-only app cannot pass. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Initialize Vite + TypeScript app, strict types, lint/format/typecheck and test runner.

**This agent delivers:** Root package scripts, **owner-approved Svelte + Vite** with strict TypeScript, test/lint/formatter config. Propose router/state conventions for owner approval before freezing the rest of ADR-002.

**Prerequisites:** No earlier code; the owner approved Svelte + Vite in [Round 1](../decisions/USER-APPROVED-ROUND-01.md), while router/store subchoices still need approval before dependent agents. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `package.json, lockfile, vite.config.ts, tsconfig, src/app shell skeleton`. Avoid editing other task owners' contracts.
**Required references:** [01](../01-architecture.md), [26](../26-multipage-ui-and-floating-widgets.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Clean install; typecheck, unit test and static build pass; base path is not hard-coded in components. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-02

**Approved Round 2 requirement:** GitHub Pages must host `/sound-generator/#/...` hash links, including direct-link and refresh smoke tests without `history` rewrites. CI includes browser static-build and hash asset/AudioWorklet path checks. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Add GitHub Actions CI + Pages deployment, Vite base path, SPA fallback strategy (prefer hash routing if needed) and HTTPS smoke test.

**This agent delivers:** GitHub Actions test/build/Pages workflow and static route/asset strategy.

**Prerequisites:** `AG-M0-01`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `.github/workflows/, Vite deploy config`. Avoid editing other task owners' contracts.
**Required references:** [01](../01-architecture.md), [26](../26-multipage-ui-and-floating-widgets.md), [31](../31-integration-gates-and-support-matrix.md).
**Acceptance / evidence:** CI builds deployable artifact; verify nested /sound-generator/ path and hash route on HTTPS preview; no credential required by browser. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-03

**Approved Round 3 acceptance:** First runnable I4 presets are **two editable vehicle graphs**, carb/mechanical/no-ECU factory selection and EFI/ECU alternative (final published examples delivered by `AG-M1-12`). Do not turn factory default into a hardcoded override of the user-selected IndexedDB workspace. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Schema fixtures must instantiate **two distinct I4 controller paths**, carburetor+mechanical distributor with **no ECU** and EFI+ECU. Reject mixed controllers, ECU-only maps under mechanical mode and missing starter/manual/load relationships. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset.

**This agent delivers:** Canonical v2 VehicleDefinition/manifest+SI units/seeded RNG and JSON parsing fixtures; record ADR-003.

**Prerequisites:** `AG-M0-01`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/, tests/fixtures/contracts/`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [14](../14-modular-typescript-platform.md), [22](../22-guided-vehicle-configurator.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Valid v2 and invalid/unknown version imports; exact unit conversions; deterministic seeded sequence; v1 migration disposition documented. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-04

**Roadmap source:** Define strict TypeScript component/port graph contracts, factories/capability registry, typed power/energy sign conventions, bank/cylinder geometry for 1–12 cylinders and technology fidelity status (see [14–20](../14-modular-typescript-platform.md)).

**This agent delivers:** Physical port and capability registry types, typed compatibility graph, signs and support tier.

**Prerequisites:** `AG-M0-03`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/ports, src/core/physics-ports, tests/fixtures/contracts`. Avoid editing other task owners' contracts.
**Required references:** [14](../14-modular-typescript-platform.md), [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Reject mismatched units/directions, orphan port, impossible topology; torque sign/energy cancellation unit tests. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-05

**Roadmap source:** Define independent controller, intake/induction, engine-family, transmission/differential, electrical and audio/renderer model interfaces before concrete implementations.

**This agent delivers:** Stable interfaces for engine/control/induction/transmission/electrical/renderer/audio plugins; no full engine code.

**Prerequisites:** `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/component interfaces and tests/fixtures`. Avoid editing other task owners' contracts.
**Required references:** [14](../14-modular-typescript-platform.md), [15](../15-engine-families-and-presets.md), [16](../16-intake-induction-and-exhaust.md), [17](../17-transmissions-drivetrains-and-wheels.md), [18](../18-electrical-control-generations-and-tunes.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Instantiate mock providers by registration; reject missing declared capabilities; no hidden global singleton. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-06

**Approved Round 2 requirement:** The same field registry/validator must expose **both first-I4 controller alternatives** while hiding the other strategy's invalid fields. Test UI-derived and import-derived validity equality; no simultaneous carb+EFI controller without explicit supported component model. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Define a **step-by-step schema-driven wizard**: capability/field descriptors, step prerequisites, per-field conditional option/range/visibility providers, draft-state/undo policy and shared preset/graph validation; see [22](../22-guided-vehicle-configurator.md).

**This agent delivers:** Wizard step/field descriptors and single validator interface used by UI and import (no full wizard screen).

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/configurator, src/configurator/validation`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [22](../22-guided-vehicle-configurator.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Given mechanical vs ECU mock, valid fields/choices differ; bad imported hidden field fails; draft status is distinct. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-07

**Roadmap source:** Specify bore/stroke/rod/compression geometry input contracts and derived cylinder/total displacement with SI conversion, plus verified equation/constraint tests.

**This agent delivers:** Bore/stroke/rod/compression SI type and a shared pure displacement/geometry calculation library.

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/core/geometry, src/contracts/geometry`. Avoid editing other task owners' contracts.
**Required references:** [02](../02-physics-model.md), [15](../15-engine-families-and-presets.md), [20](../20-torque-power-load-and-energy.md), [22](../22-guided-vehicle-configurator.md).
**Acceptance / evidence:** 86 mm bore/stroke I4 displacement computed by pi/4 formula; mm/in roundtrip; negative/rod conflicts rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-08

**Roadmap source:** Define configurable **reference-fidelity profile contracts** (Quick/Balanced/Detailed/Research), component solver capabilities, gas/metal/wall zone axes, step/CFL/stability tolerances and resource preflight; see [21](../21-adjustable-fidelity-multizone-reference-simulation.md).

**This agent delivers:** Versioned fidelity profile and component solver capability predicates; do not implement CFD.

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/reference, src/reference/contracts`. Avoid editing other task owners' contracts.
**Required references:** [05](../05-training-and-calibration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Validate quick/balanced/detailed model availability and cell budgets; unsupported solver rejected before job launch. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-09

**Roadmap source:** Specify shared typed EventMap/CommandMap, event ownership, causation IDs, simulation tick/sample-frame clocks, subscriber API and bounded cross-thread transport contracts (see [11](../11-event-bus-and-messaging.md)).

**This agent delivers:** Canonical typed CommandMap/EventMap and serialized event envelope with total order; record ADR-004.

**Prerequisites:** `AG-M0-03`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/core/events, src/contracts/events, tests/fixtures/contracts`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Two same-tick events retain stable sequence; aliases mapped explicitly; stale run discarded; domain vs diagnostic events separated. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-10

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-01 A — primary benchmark:** run equivalent physics in Worklet vs Worker on the user's **10th-gen Core i9 + GTX1080** desktop first (exact SKU/OS/driver still unknown). Record CPU/AudioWorklet clock/jitter/underruns under representative I4/starter/manual/road load, provide owner-visible comparison and **do not choose final solver placement without approval**. Mid-range render FPS reference hardware is a separate proposal owned by AG-M8-02. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 2 requirement:** Owner approved **initial physical pitch-lowered slow-motion audio mode** (`slowMotionAudioMode='physical'`). Both modes and state/event invariants remain. Worklet-vs-Worker solver placement is still UNDECIDED until fair benchmark and explicit owner approval. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Implement authoritative fixed-step **SimulationClock** with `timeScale` (including 0.05/0.1/0.25/0.5/1x), pause, tick/crank-angle/next-event stepping and exact physics-time <-> audio-sample mapping; mock simulation emits deterministic events and can be compared at different playback speeds.

**This agent delivers:** Deterministic sim tick and scaled audio-frame mapping, pause/resume/step and both audio-mode contracts; **benchmark equivalent AudioWorklet-owned and Worker-owned physics**, present evidence and obtain owner approval before freezing ADR-001. The default mode in ADR-005 is still open.

**Prerequisites:** `AG-M0-09`, `AG-M0-03`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/core/clock, src/testing/mock-solver`. Avoid editing other task owners' contracts.
**Required references:** [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** 0.1x/1x produce identical mock physics event trace keyed by sim tick; step bounded; no duplicate firing on scale change. Publish comparable jitter/CPU/latency/transport/browser measurements for both solver locations and obtain owner approval before claiming ADR-001 accepted. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-11a

**Roadmap source:** Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services.

**This agent delivers:** Typed diagnostic channel schema and immutable projection registry; no direct UI callbacks from solver.

**Prerequisites:** `AG-M0-09`, `AG-M0-10`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/diagnostics/TelemetryRegistry.ts, DiagnosticsHub.ts`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [09](../09-data-contracts.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Mock channel reports unit, source, tick and bounded sample rate; invalid unit/unknown channel rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-11b

**Roadmap source:** Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services.

**This agent delivers:** Nonblocking bounded capture recorder of commands, events, time-scale and telemetry chunks.

**Prerequisites:** `AG-M0-11a`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/recording/TraceRecorder.ts`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [09](../09-data-contracts.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Mock run record starts/stops; overflow flags incomplete capture; no unbounded growth or source mutation. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-11c

**Roadmap source:** Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services.

**This agent delivers:** Replay and A/B numeric/event comparison engines over imported traces; no UI chart rendering.

**Prerequisites:** `AG-M0-11b`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/comparison/ReplayController.ts, ComparisonEngine.ts`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [09](../09-data-contracts.md), [24](../24-simulation-clock-and-time-scaling.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Replay same seed/commands matches mock state within fixture tolerance; mismatched schema rejected and event delta surfaced. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-11d

**Roadmap source:** Define per-component typed diagnostic/telemetry contracts (units/owner/clock/sampling), and implement `DiagnosticsHub`, `TelemetryRegistry`, bounded `TraceRecorder`, `ReplayController`, `ComparisonEngine` and reusable live graph services.

**This agent delivers:** Read-only time-series graph data adapter (channels, units, cursor and downsample), no framework-specific view.

**Prerequisites:** `AG-M0-11a`, `AG-M0-11c`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/diagnostics/GraphInspector.ts`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Mock RPM and synthetic level channel overlays; hidden/unsubscribed graph stops work and does not mutate physics. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-12

**Approved Round 2 requirement:** Synthetic audio-mode contract initializes `physical` for new sessions, emits traceable mode changes and keeps both modes type-safe; this card does not implement pitch-preservation DSP (`AG-M2-05`). See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Implement synthetic AudioWorklet source and meters with waveform and frequency spectrum display, source/event/audio-frame correlation and bounded optional raw audio capture, without blocking the worklet.

**This agent delivers:** Synthetic AudioWorklet stimulus, bounded feature frames and source/master meters; register and trace the two `slowMotionAudioMode` choices before full DSP implementation. Do not presume the Worklet is physics owner before benchmark/approval.

**Prerequisites:** `AG-M0-09`, `AG-M0-10`, `AG-M0-11a`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/audio/synthetic-worklet, src/audio/feature-bridge`. Avoid editing other task owners' contracts.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance / evidence:** Browser audio unlock and 0.1x/1x continuity; seeded sine/impulse FFT peak where expected; no NaN/clip and deadline report. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-13

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-11 C — ZIP first:** implement safe versioned ZIP recording/workspace snapshots now; **do not select Parquet or HDF5** until documented M6 study volume/query/streaming needs and owner-facing format decision. Preserve future adapter contracts. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** Preserve **ZIP trace recording** as default portable data container and support **optional ZIP workspace snapshots** with separate manifest/type, including IndexedDB selected I4/controller/mix/calibration/listener metadata; do not imply IndexedDB itself can store unlimited research data. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** The default portable recording must be a **validated ZIP archive** with versioned JSON manifest, typed binary chunks, checksums, commands, events and optional **generated** output audio. Add corrupt/oversize ZIP tests; optional Parquet/HDF5 offline research is outside this card. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Implement export/import of a versioned portable recording (component/preset/solver/seed/time-scale/event/telemetry/audio metadata), validation/checksum checks, deterministic re-run and A/B difference curves; confirm a synthetic baseline can be recorded and compared before physical engine work.

**This agent delivers:** Portable trace bundle export/import codec with checksum, schema/version and import security; record ADR-006.

**Prerequisites:** `AG-M0-11b`, `AG-M0-11c`, `AG-M0-12`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/recording/io, tests/fixtures/imports`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [25](../25-core-diagnostics-recording-and-comparison.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Export a synthetic session, import and compare it; tampered checksum, oversize and unknown version must be rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-14a

**Approved Round 3 acceptance:** Svelte hash-route runtime must restore a **versioned IndexedDB workspace** via `AG-M0-18`. The factory carb I4 is initial only with no valid saved choice. Do not initialize twice or reset a selected EFI when navigating. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Implement Svelte hash pages `/#/drive`/`/#/diagnostics`/`/#/settings`; navigation or refresh must not create a second engine. No clean-history route dependency. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Implement **multi-page UI shell** (Dashboard, Drive, Diagnostics, Settings), expandable physics/audio/event menus, reusable draggable/hideable diagnostic widgets, route-independent simulation service, persistent widget layout and static Pages-compatible navigation.

**This agent delivers:** Persistent UI app shell with Dashboard/Drive/Diagnostics/Settings routes; one runtime across routes.

**Prerequisites:** `AG-M0-01`, `AG-M0-10`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/ui-shell/router, src/ui-shell/app-shell`. Avoid editing other task owners' contracts.
**Required references:** [26](../26-multipage-ui-and-floating-widgets.md), [01](../01-architecture.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Navigate routes with mock running; simulationTick continues with no reset; GitHub Pages refresh/hash route works. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-14b

**Roadmap source:** Implement **multi-page UI shell** (Dashboard, Drive, Diagnostics, Settings), expandable physics/audio/event menus, reusable draggable/hideable diagnostic widgets, route-independent simulation service, persistent widget layout and static Pages-compatible navigation.

**This agent delivers:** Expandable physics/audio/event debug panels and draggable/hideable widget registry; no actual vehicle editors.

**Prerequisites:** `AG-M0-14a`, `AG-M0-11a`, `AG-M0-11d`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/ui-shell/widgets, src/ui-shell/debug-panels`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** One waveform and one mock RPM widget movable, hidden and restored; hidden chart sampling throttled; keyboard close works. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-15

**Roadmap source:** Define `FastComponentModel` / `ApproximationRegistry` contracts: generic analytic baseline, optional trained coefficient/lookup slot, version/unit/validity/fallback, component IDs and reference projection; training must be possible later without rewriting M1 solver.

**This agent delivers:** FastComponentModel and ApproximationRegistry public API with versioned coefficients/lookup and safe analytic fallback.

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/approximations, src/contracts/approximation`. Avoid editing other task owners' contracts.
**Required references:** [14](../14-modular-typescript-platform.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Two compatible mock components share one math kernel; out-of-domain returns safe baseline diagnostic; incompatible unit bindings rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-16

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-10 B + hardware:** versioned reference backend contract must support multicore CPU and **prioritized NVIDIA CUDA** in Windows/Linux, with an independently compiled **CUDA 12.x / `sm_61` Pascal** path for **GTX1080** (owner required). CUDA13 cannot be the sole toolchain. `AG-M6D-08` owns tested Pascal kernels. No modern GPU-only tensor assumptions; honest CPU fallback and numerical precision/VRAM policy. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 2 requirement:** The `ReferenceComputeBackend`/experiment contract explicitly supports offline **Windows and Linux** capabilities and optional native CPU/GPU providers with hardware/precision/provenance, not a compulsory particular accelerator. Research output interfaces may support optional Parquet/HDF5 while browser ZIP remains canonical. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Define high-fidelity `ExperimentDefinition`/variation contracts: all-component manifest identity, one-part and preset-part changes, paired initial seeds/scenarios, fidelity config, reference-to-fast common output and study result formats.

**This agent delivers:** ExperimentDefinition/variation and complete reference manifest plus backend-neutral `ReferenceComputeBackend` capabilities, resource/device/precision metadata and native CPU/GPU/WASM/other adapter contracts; no specific native/GPU stack is approved yet. Record ADR-007.

**Prerequisites:** `AG-M0-03`, `AG-M0-08`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/experiments, tests/fixtures/contracts`. Avoid editing other task owners' contracts.
**Required references:** [19](../19-scenario-coverage-and-presets.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance / evidence:** Valid one-part and part-set manifest roundtrip; invalid component ID or undeclared extra change rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-17

**Approved Round 3 acceptance:** G0-B reviewer checks `AG-M0-18` IndexedDB valid/corrupt/denied recovery and `AG-M0-19` AI PR integrator policy/permission feasibility. This is **not** proof that a privileged AI reviewer was deployed. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Browser capability tests explicitly target **desktop Chrome/Chromium, Firefox, Safari** (on supported macOS), audio gesture/device fallback and WebGL-unavailable **Canvas 2D** mode; do not claim mobile support as required. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Roadmap source:** Implement capability detection, error overlay, user gesture AudioContext start and static fallback UI.

**This agent delivers:** Capability detection, user-gesture AudioContext unlock and error/fallback UI.

**Prerequisites:** `AG-M0-01`, `AG-M0-10`, `AG-M0-14a`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/app/capabilities, src/ui-shell/notifications`. Avoid editing other task owners' contracts.
**Required references:** [01](../01-architecture.md), [24](../24-simulation-clock-and-time-scaling.md), [26](../26-multipage-ui-and-floating-widgets.md).
**Acceptance / evidence:** Audio suspend and unsupported WebGL mocked in E2E; user gesture resumes audio; 2D/telemetry remains accessible. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-18

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-03 B / O3-13 B:** autosave config/controller, user mixer, source calibration, widgets, scenarios and **bounded recent debug data**; keep **current workspace + bounded configurable historical snapshots** by count/age/size, recover last-good transaction and enforce quota. No full high-fidelity data/history without cap. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Define versioned IndexedDB persistence and resilient local autosave for browser state, preserving ZIP snapshots as optional portable exports.

**Precise deliverable:** Build browser-only `PersistentWorkspaceStore` with versioned IndexedDB schema, stable key/owner namespaces for selected vehicle/controller, wizard draft, audio mix/expert calibration reference, widget layout and small scenario/debug metadata. Autosave is asynchronous/debounced and never called inside AudioWorklet/solver; keep at least one last-known-good state on failed migration/quota. Expose save/recover/error/clear controls for M3 via a typed interface. Generated ZIP snapshots still come from AG-M0-13. Default factory carb loads only when **no valid saved user selection** exists.

**Inputs / prerequisites:** AG-M0-03 schema and AG-M0-13 export format, fixed user preference/control IDs; browser storage capability stub allowed. Coordinate with AG-M0-14a app shell.

**Owned files/modules:** `src/persistence/indexeddb/, src/contracts/persistence/, tests/browser/persistence`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [09](../09-data-contracts.md), [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** Test first-run carb selection, change/save EFI, reload and recover EFI (not reset to carb), corrupted/unknown-version records, migration rollback, quota/denied IndexedDB fallback and portable ZIP export unaffected. No raw multi-day research dataset autosave. Persisted expert trim remains separate from user mix. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

### AG-M0-19

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-02 B / O3-15 B — conditional routine merging is owner-approved.** AI integrator may **merge normal one-card PRs** after explicitly configured/verified CI, branch protections, code ownership, schema/tests, security and license gates. **Mandatory owner escalation** for major ADRs, shared/public TypeScript APIs/ports/event contracts, cross-module ownership, security and licensing. Prove least-privilege GitHub bot identity/actual review/merge API before executing any merge, audit merge SHA/rules, reject self-review and CI-only auto-merge. Host/permissions still not installed or validated. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Specify and prototype the dedicated AI technical integration agent for routine GitHub PR reviews with CI validation and escalation to owner on major ADRs or unresolved conflicts.

**Precise deliverable:** Produce and, **only if the installed GitHub connection/permissions are technically verified**, configure an AI PR integrator that reads a single AG card, contract version and allowed file surface, checks CI/types/tests/fixtures/licenses and review security, emits review evidence, requests changes or escalates to the owner on major architecture, unsafe permissions or broken gates. Do **not** assume AI integration/merging is already configured. Keep least-privilege GitHub tokens and audit trails; never automatically merge solely on CI success; no unapproved branch-protection changes or owner-ADR acceptance. **Owner policy already conditionally authorizes routine merging after required checks** (O3-02 B); the **exact GitHub permissions, branch rules and verified safety enforcement** remain open and must be tested before activation.

**Inputs / prerequisites:** AG-M0-01 CI framework, AG-M0-02 GitHub CI, agent handoff contract [30](../30-agent-handoff-contracts-and-decisions.md), approved Round 3. Validate actual bot hosting/API review permissions with a disposable test PR before advertising autonomous review.

**Owned files/modules:** `.github/agent-review/, plan/agents/integration-policy/, tests/integration/agent-review`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md), [10](../10-risks-and-decisions.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** Given synthetic PRs (normal+green, failing tests, modified shared TypeScript contract, licensed reference missing redistribution, own-PR conflict, unknown owner ADR), return correct conditional-merge-eligible/request-changes/escalate action and recorded rationale. Demonstrate a *real authorized routine merge only after owner-approved branch/CI rules and bot permissions are established*, otherwise `APPROVE-READY-NOT-MERGED` and BLOCKED. Validate credential scopes and whether actual GitHub PR review action is possible; mark NON VALIDATED if integration unavailable. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

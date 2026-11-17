# M0 — foundation agent work orders

**Scope:** synthetic observability plus frozen public contracts, not production engine features. These work orders are independently assignable; where a legacy roadmap bullet bundled multiple responsibilities it is explicitly split into letter-suffixed cards. Each card must follow [handoff rules](../30-agent-handoff-contracts-and-decisions.md), [audit](../29-plan-audit-and-gap-register.md) and [G0 gates](../31-integration-gates-and-support-matrix.md).

**Shared fixture input:** `tests/fixtures/golden/mock-run/` represents a seeded synthetic oscillator physics run with ordered events, known sample frame mappings and controlled audio tone. If absent, prerequisite is blocked; do not invent competing schema.

### AG-M0-01

**Roadmap source:** Initialize Vite + TypeScript app, strict types, lint/format/typecheck and test runner.

**This agent delivers:** Root package scripts, Vite, TS strict, test/lint/formatter configuration and an accepted ADR-002 selecting one UI framework/router.

**Prerequisites:** No earlier code; freeze ADR-002 before UI-dependent agents.. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `package.json, lockfile, vite.config.ts, tsconfig, src/app shell skeleton`. Avoid editing other task owners' contracts.
**Required references:** [01](../01-architecture.md), [26](../26-multipage-ui-and-floating-widgets.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Clean install; typecheck, unit test and static build pass; base path is not hard-coded in components. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-02

**Roadmap source:** Add GitHub Actions CI + Pages deployment, Vite base path, SPA fallback strategy (prefer hash routing if needed) and HTTPS smoke test.

**This agent delivers:** GitHub Actions test/build/Pages workflow and static route/asset strategy.

**Prerequisites:** `AG-M0-01`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `.github/workflows/, Vite deploy config`. Avoid editing other task owners' contracts.
**Required references:** [01](../01-architecture.md), [26](../26-multipage-ui-and-floating-widgets.md), [31](../undefined).
**Acceptance / evidence:** CI builds deployable artifact; verify nested /sound-generator/ path and hash route on HTTPS preview; no credential required by browser. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-03

**Roadmap source:** Define SI units, deterministic PRNG, versioned engine/event schema, import validation and demo preset.

**This agent delivers:** Canonical v2 VehicleDefinition/manifest+SI units/seeded RNG and JSON parsing fixtures; record ADR-003.

**Prerequisites:** `AG-M0-01`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/, tests/fixtures/contracts/`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [14](../14-modular-typescript-platform.md), [22](../22-guided-vehicle-configurator.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Valid v2 and invalid/unknown version imports; exact unit conversions; deterministic seeded sequence; v1 migration disposition documented. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-04

**Roadmap source:** Define strict TypeScript component/port graph contracts, factories/capability registry, typed power/energy sign conventions, bank/cylinder geometry for 1–12 cylinders and technology fidelity status (see [14–20](14-modular-typescript-platform.md)).

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
**Required references:** [14](../14-modular-typescript-platform.md), [15](../15-engine-families-and-presets.md), [16](../undefined), [17](../17-transmissions-drivetrains-and-wheels.md), [18](../18-electrical-control-generations-and-tunes.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Instantiate mock providers by registration; reject missing declared capabilities; no hidden global singleton. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-06

**Roadmap source:** Define a **step-by-step schema-driven wizard**: capability/field descriptors, step prerequisites, per-field conditional option/range/visibility providers, draft-state/undo policy and shared preset/graph validation; see [22](22-guided-vehicle-configurator.md).

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

**Roadmap source:** Define configurable **reference-fidelity profile contracts** (Quick/Balanced/Detailed/Research), component solver capabilities, gas/metal/wall zone axes, step/CFL/stability tolerances and resource preflight; see [21](21-adjustable-fidelity-multizone-reference-simulation.md).

**This agent delivers:** Versioned fidelity profile and component solver capability predicates; do not implement CFD.

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/contracts/reference, src/reference/contracts`. Avoid editing other task owners' contracts.
**Required references:** [05](../05-training-and-calibration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Validate quick/balanced/detailed model availability and cell budgets; unsupported solver rejected before job launch. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-09

**Roadmap source:** Specify shared typed EventMap/CommandMap, event ownership, causation IDs, simulation tick/sample-frame clocks, subscriber API and bounded cross-thread transport contracts (see [11](11-event-bus-and-messaging.md)).

**This agent delivers:** Canonical typed CommandMap/EventMap and serialized event envelope with total order; record ADR-004.

**Prerequisites:** `AG-M0-03`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/core/events, src/contracts/events, tests/fixtures/contracts`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Two same-tick events retain stable sequence; aliases mapped explicitly; stale run discarded; domain vs diagnostic events separated. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-10

**Roadmap source:** Implement authoritative fixed-step **SimulationClock** with `timeScale` (including 0.05/0.1/0.25/0.5/1x), pause, tick/crank-angle/next-event stepping and exact physics-time <-> audio-sample mapping; mock simulation emits deterministic events and can be compared at different playback speeds.

**This agent delivers:** Deterministic fixed sim tick + scaled audio-frame mapping, pause/resume/step; ADR-001/005 owner resolution.

**Prerequisites:** `AG-M0-09`, `AG-M0-03`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/core/clock, src/testing/mock-solver`. Avoid editing other task owners' contracts.
**Required references:** [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** 0.1x/1x produce identical mock physics event trace keyed by sim tick; step bounded; no duplicate firing on scale change. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

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

**Roadmap source:** Implement synthetic AudioWorklet source and meters with waveform and frequency spectrum display, source/event/audio-frame correlation and bounded optional raw audio capture, without blocking the worklet.

**This agent delivers:** Typed diagnostic channel schema and immutable projection registry; no direct UI callbacks from solver.

**Prerequisites:** `AG-M0-09`, `AG-M0-10`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/diagnostics/TelemetryRegistry.ts, DiagnosticsHub.ts`. Avoid editing other task owners' contracts.
**Required references:** [25](../25-core-diagnostics-recording-and-comparison.md), [09](../09-data-contracts.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Mock channel reports unit, source, tick and bounded sample rate; invalid unit/unknown channel rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-13

**Roadmap source:** Implement export/import of a versioned portable recording (component/preset/solver/seed/time-scale/event/telemetry/audio metadata), validation/checksum checks, deterministic re-run and A/B difference curves; confirm a synthetic baseline can be recorded and compared before physical engine work.

**This agent delivers:** Synthetic AudioWorklet stimulus, bounded feature frames and source/master meters; keep UI spectrum separate.

**Prerequisites:** `AG-M0-09`, `AG-M0-10`, `AG-M0-11a`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/audio/synthetic-worklet, src/audio/feature-bridge`. Avoid editing other task owners' contracts.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance / evidence:** Browser audio unlock + 0.1x/1x continuity; seeded sine/impulse FFT peak where expected; zero NaN/clip and deadline report. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-14a

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

**This agent delivers:** Portable trace bundle export/import codec + checksum/version/security, accepted ADR-006.

**Prerequisites:** `AG-M0-11b`, `AG-M0-11c`, `AG-M0-12`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/recording/io, tests/fixtures/imports`. Avoid editing other task owners' contracts.
**Required references:** [09](../09-data-contracts.md), [25](../25-core-diagnostics-recording-and-comparison.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Export a synthetic session, import cleanly and compare; tampered checksum, oversize and unknown version rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-16

**Roadmap source:** Define high-fidelity `ExperimentDefinition`/variation contracts: all-component manifest identity, one-part and preset-part changes, paired initial seeds/scenarios, fidelity config, reference-to-fast common output and study result formats.

**This agent delivers:** Persistent UI app shell with Dashboard/Drive/Diagnostics/Settings routes; one runtime across routes.

**Prerequisites:** `AG-M0-01`, `AG-M0-10`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/ui-shell/router, src/ui-shell/app-shell`. Avoid editing other task owners' contracts.
**Required references:** [26](../26-multipage-ui-and-floating-widgets.md), [01](../01-architecture.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Navigate routes with mock running; simulationTick continues with no reset; GitHub Pages refresh/hash route works. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M0-17

**Roadmap source:** Implement capability detection, error overlay, user gesture AudioContext start and static fallback UI.

**This agent delivers:** FastComponentModel and ApproximationRegistry public API with versioned coefficients/map/fallback and unit domain.

**Prerequisites:** `AG-M0-03`, `AG-M0-04`. If a predecessor is incomplete, use an accepted contract fixture and mark live integration pending.

**Owned area:** `src/approximations, src/contracts/approximation`. Avoid editing other task owners' contracts.
**Required references:** [14](../14-modular-typescript-platform.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance / evidence:** Two compatible mock components share one math kernel; out-of-range returns safe baseline and diagnostic; incompatible units rejected. Commit tests/fixtures and an [agent handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

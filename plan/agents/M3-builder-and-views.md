# M3 — independently assignable agent tasks

UI agents consume the frozen framework/router choice and immutable state projections. Builder, 3D and 2D may be implemented in parallel after their contracts exist; none may create a second physics engine.

**Common contract:** [30 — handoff](../30-agent-handoff-contracts-and-decisions.md), [31 — gates](../31-integration-gates-and-support-matrix.md); use accepted versioned mocks when real predecessor is absent and mark live integration pending.

### AG-M3-01a

**Original roadmap task:** Build procedural low-poly car and cutaway engine scene in Three.js and lightweight Canvas2D **side-view row per bank** (every cylinder/piston/rod/valve, cycle, combustion and actual mass-flow indication).

**Bounded deliverable:** Procedural Three.js vehicle/engine cutaway rendering read-only state with no solver imports.

**Required upstream evidence:** G1, AG-M0-01, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/visualization/3d`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [04](../04-3d-and-ux.md), [13](../13-2d-engine-cutaway.md), [15](../15-engine-families-and-presets.md), [26](../26-multipage-ui-and-floating-widgets.md).
**Done when:** Mock I4 draws 4 cylinders and rods; engine still produces events with 3D hidden or WebGL unsupported. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-01b

**Original roadmap task:** Build procedural low-poly car and cutaway engine scene in Three.js and lightweight Canvas2D **side-view row per bank** (every cylinder/piston/rod/valve, cycle, combustion and actual mass-flow indication).

**Bounded deliverable:** Canvas2D side-view per-bank row with each configured cylinder piston/rod, valve/flow/combustion projections.

**Required upstream evidence:** G1, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/visualization/2d`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [04](../04-3d-and-ux.md), [13](../13-2d-engine-cutaway.md), [15](../15-engine-families-and-presets.md).
**Done when:** I4 one row, V8 two rows, boxer two rows; no fake firing on fuel cut; functions without WebGL. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-02

**Original roadmap task:** Animate crank/pistons/valves/firing using authoritative engine angle and cylinder events, with synchronized slow-motion, pause/step, viewport switching and lost-render-frame recovery.

**Bounded deliverable:** Clock-aware projection/interpolation, pause/step/slow motion/view switching for both renderers.

**Required upstream evidence:** AG-M3-01a, AG-M3-01b, G1. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/visualization/shared, tests/browser/clock-sync`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [13](../13-2d-engine-cutaway.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** At 0.05x and 1x screenshots/phase markers match state/event ticks; canvas FPS drop never changes engine event trace. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-03

**Approved Round 2 requirement:** Use **Svelte+Vite hash routes** for Builder/Drive/Audio/Diagnostics; verify browser refresh and navigation under GitHub Pages subpath, preserving all runtime/recorders/widgets. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Complete multi-page Builder/Drive/Audio Studio/Diagnostics/Presets navigation; source, cylinder and physics graphs are openable in removable/movable small widgets on any suitable page.

**Bounded deliverable:** Complete Builder/Drive/Audio Studio/Diagnostics/Presets routes and movable diagnostic widgets.

**Required upstream evidence:** AG-M0-14a, AG-M0-14b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/ui-shell/navigation, src/ui-pages`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [26](../26-multipage-ui-and-floating-widgets.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Changing routes leaves engine/audio alive and debug widgets retain position/visibility; Pages link reload works. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-04

**Approved Round 2 requirement:** The first I4 wizard must allow selection between **mechanical carb/distributor/no-ECU** and **EFI/ECU** as working variants, with bore/stroke/rod, starter, clutch/manual gear and road-load geometry kept valid. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement **M3-A guided wizard**: template/start-blank, contextual step navigation, Basic/Advanced mode, validated fields, allowed values, unit-aware inputs, derived bore/stroke/displacement and live bank/mixer preview.

**Bounded deliverable:** Wizard template or blank, Back/Next, validity summaries, unit-aware numeric input and derived bore/stroke preview.

**Required upstream evidence:** AG-M0-06, AG-M0-07, AG-M3-03. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/configurator/wizard-shell`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [22](../22-guided-vehicle-configurator.md), [09](../09-data-contracts.md), [15](../15-engine-families-and-presets.md).
**Done when:** I4 86-mm geometry created in GUI, invalid rod and unsupported ECU option blocked; draft save/resume. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-05a

**Approved Round 2 requirement:** Expose two **mutually exclusive runnable** I4 control strategies: mechanical carb+distributor with no ECU versus EFI+ECU. Conditional wizard options and imported JSON use the same validator; no inactive strategy controls shown as editable. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement **M3-B step providers** for engine/control/intake/exhaust/electrical/transmission/drivetrain/wheels; conditional fields/options from component registry, final graph preflight, invalid downstream change preview/undo and save/resume drafts.

**Bounded deliverable:** Engine family/banks/bore/stroke/fuel/ECU/mechanical component step providers.

**Required upstream evidence:** AG-M3-04, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/configurator/engine-and-control-steps`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [15](../15-engine-families-and-presets.md), [18](../18-electrical-control-generations-and-tunes.md), [22](../22-guided-vehicle-configurator.md).
**Done when:** No ECU hides/disallows ECU map; V and flat rows use bank mapping; invalid firing order rejected. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-05b

**Original roadmap task:** Implement **M3-B step providers** for engine/control/intake/exhaust/electrical/transmission/drivetrain/wheels; conditional fields/options from component registry, final graph preflight, invalid downstream change preview/undo and save/resume drafts.

**Bounded deliverable:** Intake/exhaust/electrical/transmission/axle/wheel step providers using manifests.

**Required upstream evidence:** AG-M3-04, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/configurator/induction-and-driveline-steps`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [17](../17-transmissions-drivetrains-and-wheels.md), [18](../18-electrical-control-generations-and-tunes.md), [22](../22-guided-vehicle-configurator.md).
**Done when:** NA hides wastegate; manual has clutch not converter; FWD lacks 4L unless compatible transfer; reset diff surfaced. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-05c

**Approved Round 2 requirement:** Test a mode switch carb/no-ECU → EFI/ECU → carb with complete *realized component diff*, safe reset, preserved independent physical geometry, rejected hidden ECU maps and correct ZIP versioned preset validation when applicable. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement **M3-B step providers** for engine/control/intake/exhaust/electrical/transmission/drivetrain/wheels; conditional fields/options from component registry, final graph preflight, invalid downstream change preview/undo and save/resume drafts.

**Bounded deliverable:** Whole-graph preflight, downstream invalidation diff, undo, drafts and versioned preset export.

**Required upstream evidence:** AG-M3-05a, AG-M3-05b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/configurator/review-and-draft`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [09](../09-data-contracts.md), [22](../22-guided-vehicle-configurator.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Done when:** Changing cylinders/gear retains valid overrides, clears incompatible settings explicitly, import validator matches UI result. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-06

**Original roadmap task:** Implement **M3-C training setup step**: supported Quick/Balanced/Detailed/Research tiers, per-component zone and timestep controls, preflight cost/capability and Worker/CLI job selection (UI editor may precede actual M6 solvers).

**Bounded deliverable:** Wizard research settings generated by solver capabilities; initially show supported baseline/tier statuses.

**Required upstream evidence:** AG-M0-08, AG-M3-04. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/configurator/research-step`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [22](../22-guided-vehicle-configurator.md), [27](../27-high-fidelity-experiment-orchestration.md).
**Done when:** Quick exposes no fake mesh detail; unsupported Research disabled; resource budget input validates and exports profile. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-07

**Approved Round 2 requirement:** On new session, `slowMotionAudioMode='physical'` is visible as the default; pitch-preserved option works via `AG-M2-05` and mode changes record metadata without affecting engine. Navigation under `/#/drive` must keep runtime alive. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Add start/stop, throttle, ignition, load and preset editor UI with SI conversions; applying configuration to an active simulation requires a validated reset/safe boundary.

**Bounded deliverable:** Drive/ignition/throttle/load/preset controls with validated tick-stamped command dispatch and an accessible `physical` / `pitch-preserved` slow-motion audio switch.

**Required upstream evidence:** AG-M3-03, G1 and AG-M2-05 for the working audio mode selector. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/ui-pages/drive-controls`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [22](../22-guided-vehicle-configurator.md), [24](../24-simulation-clock-and-time-scaling.md), [26](../26-multipage-ui-and-floating-widgets.md).
**Done when:** Controls never write engine state directly; applying geometry requires safe reset; 0.1x controls and audio mode changes recorded with sim tick; switching audio mode does not change torque or physics events. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-08a

**Original roadmap task:** Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics.

**Bounded deliverable:** RPM/torque/hp/energy/events and diagnostics graphs wired to core projection.

**Required upstream evidence:** AG-M3-03, AG-M0-11a, G1. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/ui-pages/telemetry`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [20](../20-torque-power-load-and-energy.md), [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md).
**Done when:** Crank vs wheel power labels correct and imported telemetry overlays; unsubscribed charts don't alter physics. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-08b

**Original roadmap task:** Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics.

**Bounded deliverable:** Source/stem/bus/master mixing editor with level meters, per-source solo/mute and waveform/FFT.

**Required upstream evidence:** AG-M3-03, G2, AG-M2-03b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/ui-pages/audio-studio`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md).
**Done when:** One cylinder solo isolates that source; mixing doesn't change torque; saved mix roundtrip. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-08c

**Approved Round 2 requirement:** The 2D/3D/telemetry selector must function on **desktop Chromium, Firefox, Safari**; when WebGL is missing, Canvas 2D fallback remains useful and does not disable engine/audio. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Add RPM/crank and wheel torque/hp/kW plus component loss meter, read-only event timeline, mixer channel/bus/master editor and 2D/3D/telemetry switch; no renderer may drive physics.

**Bounded deliverable:** 2D/3D/telemetry mode switch and shared camera/visual preferences; never construct second solver.

**Required upstream evidence:** AG-M3-02, AG-M3-03. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/ui-pages/view-switch`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [04](../04-3d-and-ux.md), [13](../13-2d-engine-cutaway.md), [24](../24-simulation-clock-and-time-scaling.md).
**Done when:** Switch mid-crank/limiter does not reset runId/event sequence or AudioContext; inactive view stops render work. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M3-09

**Roadmap source:** Build expert-only calibrated-source trim editor with independently versioned profiles, separate from everyday Audio Studio faders.

**Precise deliverable:** Add an `Expert calibration` panel in Svelte Audio Studio for source reference level, bounded trim, source version/physical test condition and revision/reset/undo, clearly independent from user mix bus/source/master settings. Show read-only source stem meters, overload warnings, provenance and preview. Use AG-M2-06 service and AG-M0-18 IndexedDB autosave. No login/roles are presumed; expert means an explicitly activated advanced UI. Diagnostic compare tools may be reused, but standalone new A/B calibration profile manager is not approved.

**Inputs / prerequisites:** AG-M2-06 calibration API, AG-M3-08b mixer UI, AG-M0-18 persistence and AG-M0-13 optional ZIP snapshots.

**Owned files/modules:** `src/ui-pages/audio-studio/expert-calibration/, tests/browser/audio-calibration`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [12](../12-audio-gain-staging-and-mixer.md), [26](../26-multipage-ui-and-floating-widgets.md), [25](../25-core-diagnostics-recording-and-comparison.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** Normal mixer visible independently; entering expert mode edits versioned source trim without touching physics, returning user fader unaffected; invalid trim rejected, undo/reset and persistence/restoration work, ZIP snapshot includes separate calibration metadata. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

### AG-M3-10

**Roadmap source:** Add UI controls to select cabin, engine-bay, roadside and exhaust listening perspective without changing the 2D/3D camera or engine solver.

**Precise deliverable:** Build globally accessible and Audio Studio/Drive-controllable Svelte listening-position selector using AG-M2-07 typed mode. Show which viewpoint is active and what source transfer is approximate; optionally link visual camera only if a later approved decision does so. Store selected perspective under IndexedDB service and ZIP trace/profile. Do not implement new acoustic DSP in UI.

**Inputs / prerequisites:** AG-M2-07 listener DSP and approved spatial command, AG-M0-18 persistence, AG-M3-03 page shell.

**Owned files/modules:** `src/ui-pages/listening-perspective-control/, tests/browser/listener`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [04](../04-3d-and-ux.md), [12](../12-audio-gain-staging-and-mixer.md), [26](../26-multipage-ui-and-floating-widgets.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** All four modes work at normal/slow time on desktop supported browsers, mode persists on route changes/reload, audio stem changes as expected, torque/events unchanged, WebGL failure leaves selector functional. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

### AG-M3-11

**Roadmap source:** Wire versioned IndexedDB autosave and recovery into the Svelte configurator, sessions, audio settings and movable widgets, with optional ZIP snapshots.

**Precise deliverable:** Use the AG-M0-18 store to autosave editable vehicle/preset/control selection, scenario draft, user mix, expert-calibration profile references, perspective selection, widget layout and bounded debug metadata; show saved/unsaved/recovery/quota failure states. Expose explicit export/import of ZIP snapshot via AG-M0-13; never autosave enormous offline research. On first empty storage load **mechanical carb I4**; restoring previously saved EFI must win over factory default. Do not write a second persistence service.

**Inputs / prerequisites:** AG-M0-18 store, AG-M0-13 archive codec, AG-M1-12 two editable I4 presets; UI card AG-M3-04/05a/05c/08b; calibration/listener choices available or mock state bound to frozen contracts.

**Owned files/modules:** `src/ui-shell/workspace-persistence/, src/ui-pages/presets/autosave/, tests/browser/workspace-recovery`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [22](../22-guided-vehicle-configurator.md), [25](../25-core-diagnostics-recording-and-comparison.md), [26](../26-multipage-ui-and-floating-widgets.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** New first launch chooses carb, user switches EFI and edits bore/mix, reload restores EFI and edits; corrupted record produces error and safe recovery, private mode/storage unavailable prompts ZIP export, quota error preserves previous good state. ZIP snapshot roundtrip yields same typed settings; no audio callback blocking. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

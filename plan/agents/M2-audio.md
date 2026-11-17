# M2 — independently assignable agent tasks

AudioWorklet owns the audio sample-output clock. **Physics ownership remains undecided** until equivalent Worklet/Worker benchmarks and explicit owner approval. Read the same typed physics interface regardless of its eventual runtime placement. First sound sources can be implemented against M1 golden traces; they are not allowed to own physics state.

**Common contract:** [30 — handoff](../30-agent-handoff-contracts-and-decisions.md), [31 — gates](../31-integration-gates-and-support-matrix.md); use accepted versioned mocks when real predecessor is absent and mark live integration pending.

### AG-M2-01

- [ ] **AG-M2-01 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap task:** Implement AudioWorklet loader + sample-accurate control/phase transport and bounded bus bridge with critical-event gap detection.

**Bounded deliverable:** Worklet loader and bounded transport for samples/commands/events with phase-accurate crank-angle mapping.

**Required upstream evidence:** G0-B; G1 or committed M1 physics event fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/audio/worklet-bridge, src/audio/clock-map`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [01](../01-architecture.md), [03](../03-audio-synthesis.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md).
**Acceptance checklist — AG-M2-01** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Throttle/RPM ramp maintains pulse count and phase on 0.1x/1x
- [ ] invalid gap invalidates trace
- [ ] no main-thread callback dependency.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-02a

- [ ] **AG-M2-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 2 requirement:** Procedural starter sound must be generated from actual motor/electrical/crank state in **both I4 controller configurations**; recorded car sound samples are forbidden as source layers. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.

**Bounded deliverable:** Calibrated procedural solenoid and starter motor whine/engagement tied to mechanical/electrical state.

**Required upstream evidence:** AG-M2-01, AG-M1-08b or starter fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/starter, src/audio/sources/starter`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [18](../18-electrical-control-generations-and-tunes.md).
**Acceptance checklist — AG-M2-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Audible only while starter state demands it
- [ ] low-voltage/worn starter fixture changes timbre/cadence, with click-free disengagement.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-02b

- [ ] **AG-M2-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 2 requirement:** Combustion pulses are entirely **procedural** and carry causal source/tick/cylinder IDs; distinct carb/distributor versus EFI/ECU ignition/fueling affects sound only through real model state. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.

**Bounded deliverable:** Phase-coherent per-cylinder combustion/compression signal preserving order/misfire/limiter cut.

**Required upstream evidence:** AG-M2-01, AG-M1-09b or combustion fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/combustion, src/audio/sources/cylinders`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [11](../11-event-bus-and-messaging.md), [12](../12-audio-gain-staging-and-mixer.md), [15](../15-engine-families-and-presets.md).
**Acceptance checklist — AG-M2-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] I1/I4/V8 firing cadence and 720-degree phase match input pulses
- [ ] misfire does not synthesize ignition sound.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-03a

- [ ] **AG-M2-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap task:** Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.

**Bounded deliverable:** Basic pressure/flow-driven intake, exhaust and resonator DSP, including bounded filters.

**Required upstream evidence:** AG-M2-01, AG-M1-09a or airflow fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/intake-exhaust, src/audio/sources/intake-exhaust`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [16](../16-intake-induction-and-exhaust.md).
**Acceptance checklist — AG-M2-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] More airflow changes intake source
- [ ] exhaust bank timing follows cylinder event, filters never become nonfinite.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-03b

- [ ] **AG-M2-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 3 acceptance:** Mixers must keep ordinary user source/bus/master controls **distinct** from separately versioned expert calibration (`AG-M2-06`) and four listening-transfer profiles (`AG-M2-07`). Do not combine them into a single global volume knob. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** The stem/mixer must accept **only registered procedural generated physical sources**. Imported real-world audio may supply reference features for comparison/calibration but may not appear in a bus, sample layer, live source or reference playback player. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.

**Bounded deliverable:** Calibrated per-source faders and category buses with mute/solo/meter, master headroom/limiter.

**Required upstream evidence:** AG-M2-02a or 02b, AG-M2-03a. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/audio/mixer, src/dsp/output`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M2-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Mute/solo changes sound not torque
- [ ] full-reference stems don't peak-normalize each block
- [ ] no master clipping at fixture peak.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-04

- [ ] **AG-M2-04 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 3 acceptance:** G2 verifies **versioned expert source trims** and all four generated listening perspectives, no change to torque/physics, and sample deadline and safe output across both clock modes. Rendering 30/60 FPS is not an audio callback rate. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Initial browser/audio test matrix includes **desktop Chromium, Firefox and Safari** where platforms available; check physical slow motion **default**, optional pitch-preserved mode, 44.1/48kHz timing/latency and emitted source provenance. Missing platform evidence is not a pass. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Add sound-physics synchronization tests, worklet callback profiler and output capture with source-level FFT/waveform/routing diagnostics, A/B comparisons and correct timbre/event timing at slowed playback scale.

**Bounded deliverable:** AudioWorklet phase, CPU/deadline, FFT/capture and mode-switch tests for **physical pitch-lowered and pitch-preserving slow-motion audio** at 44.1/48 kHz.

**Required upstream evidence:** AG-M2-01, AG-M2-02b, AG-M2-03b, AG-M2-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `tests/audio/, tests/fixtures/golden/audio`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [07](../07-testing-and-acceptance.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M2-04** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] No NaNs/underruns in defined environment
- [ ] A/B source FFT capture/import and 0.1x events align with physics in **both modes**, with measured pitch/latency/CPU/artifact limits and no silent fallback.
- [ ] Include a negative case and runnable test/fixture
- [ ] submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-05

- [ ] **AG-M2-05 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 2 requirement:** **Physical pitch-lowered slowdown is the initial default**; pitch-preserved processing remains a user-selectable second mode. Switching cannot alter physics events. Real recordings are comparison data only, not this DSP's sampled content. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement the owner-approved **pitch-preserving slow-motion** audio treatment alongside physical pitch-lowered slow motion. A user-visible audio-mode switch is supplied by `AG-M3-07`; neither changes physical simulation tick/event/RPM/torque values.

**Bounded deliverable:** Implement a versioned, stateful, CPU-bounded pitch-preserving time-stretch audio processor (or physically appropriate source-wise treatment) consuming the authoritative slowed event/audio timeline. It must integrate into existing source/mixer outputs and expose `physical | pitch-preserved` mode, algorithm, delay, resource and degradation telemetry. Compare plausible algorithms and obtain owner approval for a major DSP architecture choice; do not require a specific unapproved library.

**Required upstream evidence:** `AG-M2-01` (clock transport), `AG-M2-02b` (phase-coherent audio) and `AG-M2-03b` (mixer); `AG-M0-10` approved time/ownership contracts. If the real source is not ready, build/test only against a committed synthetic pitched-tone/impulse fixture and report incomplete integration.

**Owned modules/files:** `src/dsp/time-stretch/`, `src/audio/slow-motion-mode/`, local test fixtures. Changes to global clock, physical state, UI/router or generic source registry require their owning agent/ADR.

**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md), [owner approvals](../decisions/USER-APPROVED-ROUND-01.md) and [30](../30-agent-handoff-contracts-and-decisions.md).

**Acceptance checklist — AG-M2-05** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] (a) at 0.1x/0.5x/1x pitch-preserving mode uses a distinct working audio treatment and its sound is slower while fundamental/spectral pitch is approximately maintained within an explicitly measured tolerance, (b) physical mode changes pitch as intended, (c) audio frames/event markers and engine tick/event hashes remain aligned in both modes, (d) mode switches have bounded clicks, CPU and added latency and report quality/deadline errors rather than falsely claiming preservation, (e) capture metadata stores selected mode/algorithm
- [ ] run positive and negative sample-rate/browser tests and submit the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-06

- [ ] **AG-M2-06 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-06 A:** expert UI can edit **per-source gain trims only**, with calibration reference conditions, individually versioned trim profiles, undo/reset and safe headroom. Do **not** introduce user-editable source EQ, spectral-response shaping or arbitrary DSP calibration in this task. Normal source/bus/master mix separate. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Implement separately versioned, expert-editable physical audio calibration trims, not conflated with ordinary source/bus/master mixer levels.

**Precise deliverable:** Introduce `SourceCalibrationProfile` with sourceId, profileId/schemaVersion, reference operating condition and units, calibrated gain/trim in dB with safety ranges, provenance and revision/undo/reset. Allow expert-safe edit and activation at an audio block boundary, preserving causal sound and click-free transitions; expose a typed calibration service to M3 Audio Studio, keep user faders and master separate and unmodified. Expert mode is a UI affordance, not an inferred login/security system.

**Inputs / prerequisites:** AG-M2-03b procedural source mixer, AG-M0-11a telemetry and AG-M0-13 ZIP/profile contract; physics/energy ports are read-only to calibration.

**Owned files/modules:** `src/audio/calibration-profiles/, src/contracts/audio-calibration/, tests/audio/calibration`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [12](../12-audio-gain-staging-and-mixer.md), [03](../03-audio-synthesis.md), [25](../25-core-diagnostics-recording-and-comparison.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Acceptance checklist — AG-M2-06** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Calibrated reference source plus expert trim changes recorded/sonic stem gain without modifying engine torque, source event order or user fader values
- [ ] invalid/clipping trim rejected or bounded, profile version roundtrip/undo/restore, 44.1/48k mode switch no glitch.
- [ ] No real-world recorded sound source.
- [ ] Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M2-07

- [ ] **AG-M2-07 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-07 A:** all four procedural listening perspectives **independent of 2D/3D visual camera**. Do not add follow-camera linkage or allow visual camera motion to recalculate audio perspective without another owner decision. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Provide four procedural-audio listening perspectives—cabin, engine bay, roadside, exhaust—with independent source-aware transfer models.

**Precise deliverable:** Implement versioned `ListeningPerspective` mapping `cabin|engine-bay|roadside|exhaust` to procedural stem attenuation, spatial/panning, spectral transfer and optional simplified distance/reflection responses. Viewpoint is audio post-source transfer only; it does not edit ECU, source calibration trim, user bus gain, geometry or physics state. Provide a neutral baseline and clearly labeled approximate calibration instead of falsely claiming measured cabin impulse response. No real-world sound file convolution/playback; internally calculated or physically generated transfer/filter response only unless later expressly approved.

**Inputs / prerequisites:** AG-M2-03b source/bus mixer, AG-M2-02b/03a source identity fixtures, approved typed command/trace contract; AG-M3-10 will implement UI.

**Owned files/modules:** `src/audio/listening-perspectives/, src/contracts/listener/, tests/audio/listener`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [03](../03-audio-synthesis.md), [04](../04-3d-and-ux.md), [12](../12-audio-gain-staging-and-mixer.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Acceptance checklist — AG-M2-07** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Four profiles selectable, characteristic spatial/spectral differences with source-level meters, no nonfinite/clipping, no engine/crank/event changes
- [ ] switching perspectives is click-free and recorded with time/algorithm ID, absent source handled gracefully.
- [ ] No explicit requirement for full 3D acoustic wave solver.
- [ ] Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

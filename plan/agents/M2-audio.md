# M2 — independently assignable agent tasks

Use AudioWorklet with one sound clock and read-only physical events. First sound sources can be implemented against M1 golden traces; they are not allowed to own physics state.

**Common contract:** [30 — handoff](../30-agent-handoff-contracts-and-decisions.md), [31 — gates](../31-integration-gates-and-support-matrix.md); use accepted versioned mocks when real predecessor is absent and mark live integration pending.

### AG-M2-01

**Original roadmap task:** Implement AudioWorklet loader + sample-accurate control/phase transport and bounded bus bridge with critical-event gap detection.

**Bounded deliverable:** Worklet loader and bounded transport for samples/commands/events with phase-accurate crank-angle mapping.

**Required upstream evidence:** G0-B; G1 or committed M1 physics event fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/audio/worklet-bridge, src/audio/clock-map`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [01](../01-architecture.md), [03](../03-audio-synthesis.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md).
**Done when:** Throttle/RPM ramp maintains pulse count and phase on 0.1x/1x; invalid gap invalidates trace; no main-thread callback dependency. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M2-02a

**Original roadmap task:** Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.

**Bounded deliverable:** Calibrated procedural solenoid and starter motor whine/engagement tied to mechanical/electrical state.

**Required upstream evidence:** AG-M2-01, AG-M1-08b or starter fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/starter, src/audio/sources/starter`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [18](../18-electrical-control-generations-and-tunes.md).
**Done when:** Audible only while starter state demands it; low-voltage/worn starter fixture changes timbre/cadence, with click-free disengagement. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M2-02b

**Original roadmap task:** Synthesize starter whine/solenoid/engagement, compression and initial sporadic firing, then stable combustion pulse train; per-cylinder/bank routing must handle arbitrary validated firing layouts.

**Bounded deliverable:** Phase-coherent per-cylinder combustion/compression signal preserving order/misfire/limiter cut.

**Required upstream evidence:** AG-M2-01, AG-M1-09b or combustion fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/combustion, src/audio/sources/cylinders`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [11](../11-event-bus-and-messaging.md), [12](../12-audio-gain-staging-and-mixer.md), [15](../15-engine-families-and-presets.md).
**Done when:** I1/I4/V8 firing cadence and 720-degree phase match input pulses; misfire does not synthesize ignition sound. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M2-03a

**Original roadmap task:** Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.

**Bounded deliverable:** Basic pressure/flow-driven intake, exhaust and resonator DSP, including bounded filters.

**Required upstream evidence:** AG-M2-01, AG-M1-09a or airflow fixture. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/dsp/intake-exhaust, src/audio/sources/intake-exhaust`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [16](../16-intake-induction-and-exhaust.md).
**Done when:** More airflow changes intake source; exhaust bank timing follows cylinder event, filters never become nonfinite. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M2-03b

**Original roadmap task:** Build plenum/airbox/intake, exhaust/body resonances, filter smoothing, calibrated full-reference source generation, independent stem/bus/master gains, meters, mute/solo and safe output headroom.

**Bounded deliverable:** Calibrated per-source faders and category buses with mute/solo/meter, master headroom/limiter.

**Required upstream evidence:** AG-M2-02a or 02b, AG-M2-03a. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/audio/mixer, src/dsp/output`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [12](../12-audio-gain-staging-and-mixer.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Mute/solo changes sound not torque; full-reference stems don't peak-normalize each block; no master clipping at fixture peak. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M2-04

**Original roadmap task:** Add sound-physics synchronization tests, worklet callback profiler and output capture with source-level FFT/waveform/routing diagnostics, A/B comparisons and correct timbre/event timing at slowed playback scale.

**Bounded deliverable:** AudioWorklet phase, CPU/deadline and capture/export tests incl. slow-time and 44.1/48 kHz.

**Required upstream evidence:** AG-M2-01, AG-M2-02b, AG-M2-03b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `tests/audio/, tests/fixtures/golden/audio`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [03](../03-audio-synthesis.md), [07](../07-testing-and-acceptance.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** No NaNs/underruns in defined environment; A/B source FFT capture/import and 0.1x events align with physics. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

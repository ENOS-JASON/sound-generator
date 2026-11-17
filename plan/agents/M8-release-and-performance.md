# M8 — independent agent cards

Release only verified supported subset, not every future automotive technology.

For each card follow [30 — agent contracts](../30-agent-handoff-contracts-and-decisions.md) and [31 — integration gates](../31-integration-gates-and-support-matrix.md). Claims require measured fixtures.

### AG-M8-01

**Approved Round 3 acceptance:** Desktop Chromium/Firefox/Safari tests distinguish **rendered FPS** from engine tick and AudioWorklet sample deadlines; IndexedDB denied/clear/reload behavior must be documented. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Browser acceptance must cover **desktop Chrome/Chromium, Firefox and Safari** (supported macOS), hash-route navigation, 2D fallback, 44.1/48 kHz and sound mode switches. Add **Windows and Linux offline CLI** smoke tests. Unsupported platform or unavailable test machine must be disclosed. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Browser/device matrix, 44.1/48kHz handling, audio suspend/device-change tests.

**Exact scoped deliverable:** Browser/audio device suite at 44.1/48kHz, suspend/resume, gesture and sample-clock mapping.
**Prerequisites:** G1/G2/G3 fixtures. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/browser-compat` and local tests only.
**Required source reading:** [01](../01-architecture.md), [07](../07-testing-and-acceptance.md).
**Done when:** Document Chromium/Firefox/Safari where testable; degraded browser doesn't kill physics. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-02

**Approved Round 3 acceptance:** Owner-approved targets: **≥30 FPS 3D** and **≥60 FPS Canvas 2D** on an explicitly documented reference desktop hardware/OS/browser, viewport/DPR and scene. Publish measured frame-time percentile/FPS and source evidence. Until hardware and benchmarking exist these are **unverified targets**, not guarantees. Audio/physics still independent. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Original roadmap item:** CPU/memory profiling, graphics LOD, DSP quality tiers and benchmark dashboard.

**Exact scoped deliverable:** CPU/memory benchmark, 3D/2D quality tiers and optional DSP fallback.
**Prerequisites:** G2/G3 and M4 provider fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/benchmarks, src/performance` and local tests only.
**Required source reading:** [07](../07-testing-and-acceptance.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Benchmark capture includes hardware, zero deadline misses in tested stress case, 2D lower load. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-03

**Approved Round 3 acceptance:** Must verify redistribution rights for any **bundled reference recordings/measurements** from `AG-M7-12`; if unverified, exclude them. User-import reference analysis still works. No real-world sample/diagnostic playback. Confirm first-run carb and editable EFI examples. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Verify no real-world recording is packaged in audio stems/playback assets. Imported measured recordings have provenance/consent/license and are calibration-only. Demo presets include both mechanical/no-ECU and EFI/ECU I4 as separately runnable configurations. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Preset import/export, reproducible demo and clear licensing/privacy attribution.

**Exact scoped deliverable:** Demo preset import/export, attribution/asset licenses and fidelity status UI.
**Prerequisites:** G3 validated wizard. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/profiles, docs/licensing` and local tests only.
**Required source reading:** [09](../09-data-contracts.md), [31](../31-integration-gates-and-support-matrix.md).
**Done when:** Malformed imports rejected, support/accuracy table honest, sound samples licensed. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-04

**Approved Round 3 acceptance:** Release only after IndexedDB autosave/ZIP recovery, calibration/listener UI, both presets, **local Windows/Linux research monitor** and reference-device measured 30/60 FPS acceptance; routine PR review is by a **dedicated AI integrator** with documented CI evidence and owner escalation. Actual autonomous GitHub merge rights must be separately verified/approved (no CI-only merge). See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Released Pages app must serve `/sound-generator/#/...` without rewrite, preserve runtime across pages and pass desktop Chromium/Firefox/Safari tests (with documented platform gaps). Offline CLI must be smoke-tested on Windows/Linux, browser ZIP security tested, and **technical integrator + CI** must review ordinary PRs while owner signs major ADRs. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Test deployed Pages artifact, pin releases, publish architecture/scenario/training docs.

**Exact scoped deliverable:** Pages HTTPS static route/asset smoke test, versioned release and reproducible documentation.
**Prerequisites:** G0–G7 applicable for released subset. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `.github/workflows/, docs/release` and local tests only.
**Required source reading:** [01](../01-architecture.md), [31](../31-integration-gates-and-support-matrix.md).
**Done when:** Reload works under /sound-generator/, AudioWorklet loads and release traces available. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

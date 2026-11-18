# M8 — independent agent cards

Release only verified supported subset, not every future automotive technology.

For each card follow [30 — agent contracts](../30-agent-handoff-contracts-and-decisions.md) and [31 — integration gates](../31-integration-gates-and-support-matrix.md). Claims require measured fixtures.

### AG-M8-01

- [ ] **AG-M8-01 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-12 B:** browser compatibility target is **latest two released stable major versions, where available**, of desktop Chrome/Chromium, Firefox and Safari; record concrete build IDs at test/release time. Safari requires compatible macOS testing, otherwise report unverified, not passed. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** Desktop Chromium/Firefox/Safari tests distinguish **rendered FPS** from engine tick and AudioWorklet sample deadlines; IndexedDB denied/clear/reload behavior must be documented. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Browser acceptance must cover **desktop Chrome/Chromium, Firefox and Safari** (supported macOS), hash-route navigation, 2D fallback, 44.1/48 kHz and sound mode switches. Add **Windows and Linux offline CLI** smoke tests. Unsupported platform or unavailable test machine must be disclosed. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Browser/device matrix, 44.1/48kHz handling, audio suspend/device-change tests.

**Exact scoped deliverable:** Browser/audio device suite at 44.1/48kHz, suspend/resume, gesture and sample-clock mapping.
**Prerequisites:** G1/G2/G3 fixtures. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/browser-compat` and local tests only.
**Required source reading:** [01](../01-architecture.md), [07](../07-testing-and-acceptance.md).
**Acceptance checklist — AG-M8-01** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Document Chromium/Firefox/Safari where testable
- [ ] degraded browser doesn't kill physics.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M8-02

- [ ] **AG-M8-02 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-05 B:** **propose representative mid-range reference desktop** (CPU/GPU/RAM/OS/browser/scene/resolution) for project-owner approval *before* declaring benchmark target; measure 30 FPS 3D / 60 FPS 2D there, independent from user's **i9 10th-gen/GTX1080** mandatory compatibility machine (AG-M8-05). See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** Owner-approved targets: **≥30 FPS 3D** and **≥60 FPS Canvas 2D** on an explicitly documented reference desktop hardware/OS/browser, viewport/DPR and scene. Publish measured frame-time percentile/FPS and source evidence. Until hardware and benchmarking exist these are **unverified targets**, not guarantees. Audio/physics still independent. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Original roadmap item:** CPU/memory profiling, graphics LOD, DSP quality tiers and benchmark dashboard.

**Exact scoped deliverable:** CPU/memory benchmark, 3D/2D quality tiers and optional DSP fallback.
**Prerequisites:** G2/G3 and M4 provider fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/benchmarks, src/performance` and local tests only.
**Required source reading:** [07](../07-testing-and-acceptance.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M8-02** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Benchmark capture includes hardware, zero deadline misses in tested stress case, 2D lower load.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M8-03

- [ ] **AG-M8-03 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 3 acceptance:** Must verify redistribution rights for any **bundled reference recordings/measurements** from `AG-M7-12`; if unverified, exclude them. User-import reference analysis still works. No real-world sample/diagnostic playback. Confirm first-run carb and editable EFI examples. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Verify no real-world recording is packaged in audio stems/playback assets. Imported measured recordings have provenance/consent/license and are calibration-only. Demo presets include both mechanical/no-ECU and EFI/ECU I4 as separately runnable configurations. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Preset import/export, reproducible demo and clear licensing/privacy attribution.

**Exact scoped deliverable:** Demo preset import/export, attribution/asset licenses and fidelity status UI.
**Prerequisites:** G3 validated wizard. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/profiles, docs/licensing` and local tests only.
**Required source reading:** [09](../09-data-contracts.md), [31](../31-integration-gates-and-support-matrix.md).
**Acceptance checklist — AG-M8-03** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Malformed imports rejected, support/accuracy table honest, sound samples licensed.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M8-04

- [ ] **AG-M8-04 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-02 B / O3-15 B:** enforce tested **conditional AI routine-PR merging** after explicit authorized checks; owner escalation for major ADRs and shared TS API/contracts/module ownership changes. Live bot identity/merge permissions must be verified before any actual merge. Release gate includes i9 10th-gen GTX1080 compatibility evidence and latest-two-stable browser matrix; no CI-only merge. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** Release only after IndexedDB autosave/ZIP recovery, calibration/listener UI, both presets, **local Windows/Linux research monitor** and reference-device measured 30/60 FPS acceptance; routine PR review is by a **dedicated AI integrator** with documented CI evidence and owner escalation. **Owner conditionally approved AI routine-PR merge**; actual GitHub App identity/permissions, CI/branch protection and merge command must be verified and configured before execution (never CI-only merge). See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Released Pages app must serve `/sound-generator/#/...` without rewrite, preserve runtime across pages and pass desktop Chromium/Firefox/Safari tests (with documented platform gaps). Offline CLI must be smoke-tested on Windows/Linux, browser ZIP security tested, and **technical integrator + CI** must review ordinary PRs while owner signs major ADRs. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Test deployed Pages artifact, pin releases, publish architecture/scenario/training docs.

**Exact scoped deliverable:** Pages HTTPS static route/asset smoke test, versioned release and reproducible documentation.
**Prerequisites:** G0–G7 applicable for released subset. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `.github/workflows/, docs/release` and local tests only.
**Required source reading:** [01](../01-architecture.md), [31](../31-integration-gates-and-support-matrix.md).
**Acceptance checklist — AG-M8-04** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Reload works under /sound-generator/, AudioWorklet loads and release traces available.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M8-05

- [ ] **AG-M8-05 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Verified on-device inventory (not GPU execution):** i9-10900KF / Windows 11 / 32 GB; GTX1080 WDDM **driver 582.78, 8,192 MiB VRAM**, `nvidia-smi` CUDA API **13.0**; PowerShell `nvcc` missing from PATH. Owner will install CUDA Toolkit **if needed** for testing, after an agent identifies the compatible CUDA12.x `sm_61` toolchain. Current state is **GPU and driver detected, CUDA compiler/actual Pascal kernel UNVERIFIED**, not a hardware incompatibility. See [hardware inventory](../decisions/OWNER-DEVELOPMENT-HARDWARE.md).

**Owner-reported machine inventory (2026-11-17):** **Windows 11 / Intel Core i9-10900KF / 32 GB RAM / NVIDIA GTX 1080**. NVIDIA driver described as "latest supported"; exact installed driver and CUDA Toolkit **not verified**. Use the [owner hardware profile](../decisions/OWNER-DEVELOPMENT-HARDWARE.md) to collect actual driver/browser/build and measure on this machine. Do not merge its compatibility evidence with the separate proposed mid-range FPS reference machine.

**Approved O3 implementation requirement (supersedes older provisional card language):** **Additional user hardware requirement:** i9 10th generation and **GTX1080 `sm_61`** are mandatory compatibility targets. CUDA12.x legacy path and CPU fallback must be tested; this device is **not automatically the agent-proposed mid-range 30/60 FPS reference**. Don't require NVIDIA RTX/Tensor Cores or CUDA13 for the necessary route. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Run a dedicated support/compatibility matrix on the owner's 10th-generation Core i9 and GeForce GTX1080 desktop, distinct from the owner-approved future mid-range FPS benchmark configuration.

**Precise deliverable:** Create a reproducible primary-hardware compatibility test suite with a published machine manifest (actual i9 SKU, GPU, RAM, OS, drivers, CUDA version, available browsers), covering browser WebGL/Canvas2D/I4 rendering, 44.1/48kHz AudioWorklet phase/replay and solver Worklet/Worker benchmark input compatibility as well as offline CPU/CUDA backend detection/precision/parity. Coordinate with AG-M6D-08 legacy CUDA `sm_61` and AG-M8-02 30FPS/60FPS reference benchmark. **Support on GTX1080 means functional compatible paths**, not guaranteed 30/60 FPS on the user machine; independent owner-approved mid-range reference hardware supplies the published FPS target. Do not demand GPU replacement or silently upgrade beyond Pascal-supported CUDA tooling.

**Prerequisites:** G1/G2/G3 prototype, AG-M6D-08 compatibility test and AG-M8-01 cross-browser harness, AG-M8-02 proposed mid-range reference setup; user provides access to the actual i9/GTX1080 machine only when available. Approved [O3-01 A, O3-05 B and additional hardware constraint](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md).

**Owned files and modules:** `tests/hardware/intel-i9-10th-gtx1080/, docs/compatibility/gtx1080/, tests/benchmarks/primary-machine/`. Do not change other AG cards' contracts without an owner-approved ADR.

**Required references:** [07](../07-testing-and-acceptance.md), [01](../01-architecture.md), [27](../27-high-fidelity-experiment-orchestration.md), [shared contracts](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md), [pending verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Acceptance checklist — AG-M8-05** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Positive: I4 mechanical and EFI drive/run on browser supported 2D and 3D with no solver corruption, generated audio operates with both slow-motion modes, CPU offline solver works
- [ ] GTX1080 CUDA 12.x `sm_61` numerical smoke plus CPU parity is observed where GPU enabled.
- [ ] Negative: GPU unavailable/old driver/CUDA 13-only runtime produces explicit compatibility warning and CPU fallback, never fake acceleration
- [ ] missing physical test machine leaves `not-verified-on-hardware`.
- [ ] Publish browser/driver/CPU/GPU report with distinct 30/60 FPS **reference-device** outcome.
- [ ] Include positive/negative fixtures, actual toolchain/driver/browser command logs, reproducibility and a one-card handoff report.
- [ ] Any unavailable hardware/driver/licensed input is `blocked`/`not verified`, not a simulated pass.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

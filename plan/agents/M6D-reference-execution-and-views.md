# M6D — independent agent tasks

Large studies may use all available CPU workers, take hours/cycle and produce streamed datasets. Do not block browser UI/audio.

For every card, read [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md). One agent owns one card. Numerical errors and incomplete traces are failures, not training labels.

### AG-M6D-01

- [ ] **AG-M6D-01 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Wire Quick/Balanced/Detailed/Research profiles and per-component overrides into the guided wizard; disable unavailable solvers and invalid zone counts.

**Precisely implement:** Research/Quick/Balanced/Detailed wizard controls with per-component zones and actual availability.
**Inputs / prerequisites:** M0 fidelity capability/field contracts and AG-M3-06. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/ui-pages/research-fidelity` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [22](../22-guided-vehicle-configurator.md), [09](../09-data-contracts.md).
**Acceptance checklist — AG-M6D-01** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Unsupported solver has disabled control
- [ ] valid profile roundtrips with exact zone budget.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-02a

- [ ] **AG-M6D-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling.

**Precisely implement:** Estimate zone count, memory, disk and steps with configured threads and stability hints.
**Inputs / prerequisites:** AG-M0-08, AG-M6A-01. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/resource-preflight` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md).
**Acceptance checklist — AG-M6D-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Oversize job rejected before launch
- [ ] estimates include every zone/trace channel.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-02b

- [ ] **AG-M6D-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling.

**Precisely implement:** Bounded browser Worker reference runner with progress/cancel and UI isolation.
**Inputs / prerequisites:** AG-M6D-02a and reference worker API. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/browser-worker` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M6D-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Cancel deterministic small job
- [ ] audio worklet unaffected
- [ ] progress tied to simulated crank angle.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-03a

- [ ] **AG-M6D-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-10 B:** prioritize NVIDIA CUDA alongside mandatory multicore CPU; include **GTX1080 Pascal `sm_61` and CUDA12.x** backend adapter from AG-M6D-08. CUDA13-only toolchain is incompatible with this mandatory path. Detect/report GPU precision/driver/VRAM; CPU fallback must be functional and not mislabeled. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** The Windows/Linux CLI exposes a **versioned local job-control protocol** for the separately assigned `AG-M6D-07` GUI; avoid embedding the solver in GUI. GPU optional; no remote queue. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Windows **and** Linux offline scheduling are mandatory smoke-tested platforms; CPU backend always works without GPU. GPU/native backends are optional and discoverable, with device/driver/precision reported. A Windows-only or Linux-only CLI cannot be considered complete. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Add **offline TypeScript/Node `worker_threads` study scheduler** with configurable simultaneous jobs/worker pool up to all logical CPU cores, high-fidelity run streaming to disk, progress measured by sim time/crank cycles, checkpoint/resume, and no arbitrary short wall-time failure for hours-per-cycle computations.

**Precisely implement:** Backend-neutral offline study queue with a CPU `worker_threads` adapter plus discovery of compatible versioned native CPU, GPU, WASM or other numerical kernels; no GPU-specific choice without owner approval.
**Inputs / prerequisites:** AG-M6D-02a and AG-M6A-01. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/offline-cli/study-scheduler` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md).
**Acceptance checklist — AG-M6D-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Two seeds run on configured CPU workers
- [ ] no oversubscription without explicit option.
- [ ] An alternate mock numerical backend exports identical physical-boundary units/manifest with declared device, precision and resource limits.
- [ ] Real GPU execution may be added as a separately approved provider.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-03b

- [ ] **AG-M6D-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-09 B:** the CLI exposes versioned local job status/checkpoint/pause/cancel for a **CLI-launched loopback-only graphical web dashboard**, not standalone desktop wrapper or remote queue. Existing Windows/Linux checkpoint compatibility continues. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** Expose checkpoint/stop/resume/status semantics sufficient for an offline GUI to reconnect after a monitor restart; no simulated-time corruption or new source of solver state. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Checkpoint/streaming paths, atomic write and restore semantics must work on Windows and Linux (don't hardcode Unix paths). Capture artifacts use an immutable component/clock reference and are convertible to **browser ZIP**, with optional Parquet/HDF5 only for offline research. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Add **offline TypeScript/Node `worker_threads` study scheduler** with configurable simultaneous jobs/worker pool up to all logical CPU cores, high-fidelity run streaming to disk, progress measured by sim time/crank cycles, checkpoint/resume, and no arbitrary short wall-time failure for hours-per-cycle computations.

**Precisely implement:** Streaming chunk files, progress heartbeat, checkpoint/resume on long calculations.
**Inputs / prerequisites:** AG-M6D-03a, reference serialization. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/offline-cli/checkpoints-streaming` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M6D-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Kill/resume small golden job with same manifest and output tolerance, incomplete chunk marked.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-04

- [ ] **AG-M6D-04 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement repeated validation/seed runs and paired **one-component/parameter and preset-of-components** variations under identical time/event-gated scenarios, capturing full actual component/part topology, state, versions and source audio provenance.

**Precisely implement:** Matched baseline, repeat validation, one-part and part-preset studies with event/time gates.
**Inputs / prerequisites:** AG-M6D-03b, AG-M5-04 variation manifest. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/experiments/reference-batch` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [06](../06-scenario-runner.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance checklist — AG-M6D-04** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Baseline unchanged seeds compare
- [ ] exact intended/realized diff retained across reruns.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-05

- [ ] **AG-M6D-05 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-11 C:** export validated ZIP first, preserve optional scientific-export adapter interfaces but **do not implement or choose Parquet vs HDF5 merely because they are named**; propose from actual datasets and owner-reviewed compatibility/format evidence. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Approved Round 3 acceptance:** G6 reviewer must include `AG-M6D-07` **local graphical monitoring** of Windows/Linux CLI or identify missing platform evidence and mark relevant gate blocked, not falsely say GUI delivered. See [owner-approved Round 3](../decisions/USER-APPROVED-ROUND-03.md).

**Approved Round 2 requirement:** Reference dataset format must preserve a **browser ZIP** manifest/interchange and optionally export Parquet/HDF5 offline. Include full part, numerical convergence, environmental/measurement-source/provenance and **confidence/uncertainty** fields; real-world recordings are analysis-only, not audio stems. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Record fidelity/mesh/solver/threads/hardware/energy residuals, source excitation/spectra and per-component causal differences in a versioned reference dataset with provenance hashes; invalidate unstable or incomplete runs.

**Precisely implement:** Provenance-complete reference dataset manifests with component graph, source audio and mesh/worker hashes.
**Inputs / prerequisites:** AG-M6D-03b and AG-M6D-04. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/run-manifest` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [09](../09-data-contracts.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M6D-05** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Reimport reconstructs exact model/material/parts
- [ ] missing/corrupt data cannot be trained.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-06a

- [ ] **AG-M6D-06a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons.

**Precisely implement:** Per-zone pressure/temperature/wall/flow timeline and read-only spatial inspector.
**Inputs / prerequisites:** AG-M6D-05 and G0 graph inspector. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/ui-pages/research-zone-viewer` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance checklist — AG-M6D-06a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Imported trace shows all available cylinder and pipe zones
- [ ] hidden zones don't consume render CPU.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-06b

- [ ] **AG-M6D-06b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved Round 2 requirement:** When actual measured cylinder/torque/flow/thermal/sound reference data exist, compare against them with explicit confidence/uncertainty and licensing provenance. Without measurements, label results only as converged simulation estimates; failed numerical schemes may not become training truth. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons.

**Precisely implement:** Automated mesh/time-step comparison, uncertainty and optional measured-reference matching.
**Inputs / prerequisites:** AG-M6D-05 and convergence fixtures AG-M6B-03b. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/convergence-report` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [05](../05-training-and-calibration.md), [07](../07-testing-and-acceptance.md).
**Acceptance checklist — AG-M6D-06b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Runs with invalid CFL not labeled converged
- [ ] coarse/fine errors and metrics exported.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-07

- [ ] **AG-M6D-07 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Approved O3 implementation requirement (supersedes older provisional card language):** **O3-09 B:** implement a **local web dashboard launched by CLI and bound only to loopback (`127.0.0.1`/`::1`)**. Apply origin validation, CSRF protection, local process/command permission boundaries, no remote binding and no server on Pages. GUI framework remains a technical choice requiring owner approval if major. Accessible only on same machine; no separate desktop app package required. See [binding O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [remaining verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Roadmap source:** Provide a Windows/Linux local graphical high-fidelity job monitor in addition to the headless CLI, without requiring remote/cloud services.

**Precise deliverable:** Develop a **CLI-launched, localhost/loopback-only web dashboard** (not a separate desktop application) showing versioned study/job IDs, resource estimate, solver/backend/seed, queued/running/stopped/failed/completed, simulated crank/time progress, log/event messages, CPU/GPU/RAM/disk usage, pause/cancel/checkpoint/restart and export status. Integrate through a typed `LocalStudyControl` API/IPC adapter to existing AG-M6D-03a scheduler/03b checkpoint services rather than reimplementing solver. Verify Windows/Linux local web dashboard startup, loopback binding, origin/CSRF protection and job-control semantics first; propose any major web stack choice for owner approval. No remote job queue, publicly accessible server or GitHub Pages backend is implied.

**Inputs / prerequisites:** AG-M6D-03a/03b CLI scheduler and persistence/checkpoints, AG-M6D-05 run manifest, accepted job-control protocol; if unavailable, use committed mock CLI fixture and report incomplete integration.

**Owned files/modules:** `src/local-study-monitor/, src/contracts/local-study-control/, tests/gui/local-monitor`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [27](../27-high-fidelity-experiment-orchestration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [30](../30-agent-handoff-contracts-and-decisions.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Acceptance checklist — AG-M6D-07** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] On Windows and Linux or documented accessible CI/manual environments, launch loopback-only web UI from CLI, reject nonloopback/origin/CSRF requests, monitor mock/real local job, reconnect after dashboard restart, pause/cancel/safely resume checkpoint, handle process died and wrong protocol version without corrupting job.
- [ ] No online network token requirement.
- [ ] Report platform test gaps and technical feasibility as NON VALIDATED until proven.
- [ ] Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M6D-08

- [ ] **AG-M6D-08 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Latest on-device evidence / optional toolchain installation:** GTX1080 WDDM **8,192 MiB VRAM**, NVIDIA **582.78** driver and `nvidia-smi CUDA Version 13.0` (driver API). `nvcc` **not found on PowerShell PATH**, actual CUDA Toolkit location unknown. Owner **can install the compatible CUDA 12.x toolkit when a reproducible `sm_61` build fixture and supported MSVC compiler requirements are ready**; do not require CUDA13 or a driver downgrade/update merely because `nvidia-smi` displays 13.0. Existing CPU fallback always required. See [hardware profile](../decisions/OWNER-DEVELOPMENT-HARDWARE.md).

**Owner-reported compatibility target (2026-11-17):** Windows 11, **i9-10900KF**, **32 GB system RAM**, GTX 1080 Pascal `sm_61`; NVIDIA driver said to be latest supported but **exact driver/build/toolkit installation not verified**. Maintain pinned CUDA 12.x compilation and multicore CPU fallback, and test with actual device/driver reports rather than presuming `nvcc` is installed.

**Roadmap source:** Build and validate a GTX 1080/Pascal-compatible NVIDIA CUDA numerical backend alongside multicore CPU for the Windows/Linux offline simulation, using an explicit legacy CUDA 12.x target.

**Precise deliverable:** Create a versioned CUDA backend adapter with a build path **compatible with NVIDIA GeForce GTX 1080 Pascal, compute capability `sm_61`**, such as CUDA Toolkit 12.9 (subject to driver/OS validation), and an independent multicore CPU reference/fallback adapter. A modern-GPU CUDA 13.x target may be provided separately but **must not replace or break** the Pascal path. Runtime detects GPU/driver/toolkit, evaluates solver precision/memory requirements, records capability/driver/OS/backend version and selects CUDA only when validated; otherwise reports explicit CPU fallback, not false GPU success. No Tensor Core, `sm_75+` or newest-CUDA-only requirement for the compatible path. Heavy high-fidelity models whose precision or memory cannot be met on Pascal may validly run CPU, provided they are exposed and documented as CPU fallback rather than unsupported overall.

**Prerequisites:** AG-M0-16 backend contract and ADR-007, AG-M6D-03a scheduler, versioned CPU boundary/energy fixture from M6A; approval [O3-10 B](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md). Actual user OS, driver, exact i9 SKU and CUDA installation are unknown; use a build/feature probe and report unavailable real GPU testing honestly.

**Owned files and modules:** `src/offline-cli/backends/cuda-pascal/, src/offline-cli/backends/cpu-adapter/, tests/offline/cuda-legacy/, docs/compatibility/`. Do not change other AG cards' contracts without an owner-approved ADR.

**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [shared contracts](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved O3 decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md), [pending verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).

**Acceptance checklist — AG-M6D-08** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Compile a small numerical `sm_61` kernel with CUDA 12.x (do not use CUDA 13-only compiler), run actual GPU deviceQuery/solver smoke on GTX1080 when available on Windows/Linux and compare energy, torque, boundary variables and determinism tolerance against CPU reference.
- [ ] Negative cases: no GPU/driver, incompatible CUDA13-only toolchain, insufficient GPU memory, unsupported precision and modern-only library correctly route to CPU with explicit diagnostic.
- [ ] Publish build commands, toolkit/driver, device, CPU/GPU timing and platform limitations
- [ ] **do not claim confirmed GTX1080 hardware success without measured evidence**.
- [ ] Include positive/negative fixtures, actual toolchain/driver/browser command logs, reproducibility and a one-card handoff report.
- [ ] Any unavailable hardware/driver/licensed input is `blocked`/`not verified`, not a simulated pass.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

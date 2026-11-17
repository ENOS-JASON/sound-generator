# M6D — independent agent tasks

Large studies may use all available CPU workers, take hours/cycle and produce streamed datasets. Do not block browser UI/audio.

For every card, read [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md). One agent owns one card. Numerical errors and incomplete traces are failures, not training labels.

### AG-M6D-01

**Original roadmap requirement:** Wire Quick/Balanced/Detailed/Research profiles and per-component overrides into the guided wizard; disable unavailable solvers and invalid zone counts.

**Precisely implement:** Research/Quick/Balanced/Detailed wizard controls with per-component zones and actual availability.
**Inputs / prerequisites:** M0 fidelity capability/field contracts and AG-M3-06. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/ui-pages/research-fidelity` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [22](../22-guided-vehicle-configurator.md), [09](../09-data-contracts.md).
**Acceptance evidence:** Unsupported solver has disabled control; valid profile roundtrips with exact zone budget. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-02a

**Original roadmap requirement:** Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling.

**Precisely implement:** Estimate zone count, memory, disk and steps with configured threads and stability hints.
**Inputs / prerequisites:** AG-M0-08, AG-M6A-01. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/resource-preflight` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md).
**Acceptance evidence:** Oversize job rejected before launch; estimates include every zone/trace channel. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-02b

**Original roadmap requirement:** Implement preflight zone/cell count, memory/trace-size/cost estimate, browser Worker or offline CLI execution, progress/cancel/checkpoints and bounded output sampling.

**Precisely implement:** Bounded browser Worker reference runner with progress/cancel and UI isolation.
**Inputs / prerequisites:** AG-M6D-02a and reference worker API. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/browser-worker` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance evidence:** Cancel deterministic small job; audio worklet unaffected; progress tied to simulated crank angle. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-03a

**Approved Round 2 requirement:** Windows **and** Linux offline scheduling are mandatory smoke-tested platforms; CPU backend always works without GPU. GPU/native backends are optional and discoverable, with device/driver/precision reported. A Windows-only or Linux-only CLI cannot be considered complete. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Add **offline TypeScript/Node `worker_threads` study scheduler** with configurable simultaneous jobs/worker pool up to all logical CPU cores, high-fidelity run streaming to disk, progress measured by sim time/crank cycles, checkpoint/resume, and no arbitrary short wall-time failure for hours-per-cycle computations.

**Precisely implement:** Backend-neutral offline study queue with a CPU `worker_threads` adapter plus discovery of compatible versioned native CPU, GPU, WASM or other numerical kernels; no GPU-specific choice without owner approval.
**Inputs / prerequisites:** AG-M6D-02a and AG-M6A-01. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/offline-cli/study-scheduler` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md).
**Acceptance evidence:** Two seeds run on configured CPU workers; no oversubscription without explicit option. An alternate mock numerical backend exports identical physical-boundary units/manifest with declared device, precision and resource limits. Real GPU execution may be added as a separately approved provider. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-03b

**Approved Round 2 requirement:** Checkpoint/streaming paths, atomic write and restore semantics must work on Windows and Linux (don't hardcode Unix paths). Capture artifacts use an immutable component/clock reference and are convertible to **browser ZIP**, with optional Parquet/HDF5 only for offline research. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Add **offline TypeScript/Node `worker_threads` study scheduler** with configurable simultaneous jobs/worker pool up to all logical CPU cores, high-fidelity run streaming to disk, progress measured by sim time/crank cycles, checkpoint/resume, and no arbitrary short wall-time failure for hours-per-cycle computations.

**Precisely implement:** Streaming chunk files, progress heartbeat, checkpoint/resume on long calculations.
**Inputs / prerequisites:** AG-M6D-03a, reference serialization. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/offline-cli/checkpoints-streaming` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance evidence:** Kill/resume small golden job with same manifest and output tolerance, incomplete chunk marked. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-04

**Original roadmap requirement:** Implement repeated validation/seed runs and paired **one-component/parameter and preset-of-components** variations under identical time/event-gated scenarios, capturing full actual component/part topology, state, versions and source audio provenance.

**Precisely implement:** Matched baseline, repeat validation, one-part and part-preset studies with event/time gates.
**Inputs / prerequisites:** AG-M6D-03b, AG-M5-04 variation manifest. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/experiments/reference-batch` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [06](../06-scenario-runner.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance evidence:** Baseline unchanged seeds compare; exact intended/realized diff retained across reruns. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-05

**Approved Round 2 requirement:** Reference dataset format must preserve a **browser ZIP** manifest/interchange and optionally export Parquet/HDF5 offline. Include full part, numerical convergence, environmental/measurement-source/provenance and **confidence/uncertainty** fields; real-world recordings are analysis-only, not audio stems. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Record fidelity/mesh/solver/threads/hardware/energy residuals, source excitation/spectra and per-component causal differences in a versioned reference dataset with provenance hashes; invalidate unstable or incomplete runs.

**Precisely implement:** Provenance-complete reference dataset manifests with component graph, source audio and mesh/worker hashes.
**Inputs / prerequisites:** AG-M6D-03b and AG-M6D-04. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/run-manifest` plus local tests/fixtures only.
**Required references:** [27](../27-high-fidelity-experiment-orchestration.md), [09](../09-data-contracts.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance evidence:** Reimport reconstructs exact model/material/parts; missing/corrupt data cannot be trained. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-06a

**Original roadmap requirement:** Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons.

**Precisely implement:** Per-zone pressure/temperature/wall/flow timeline and read-only spatial inspector.
**Inputs / prerequisites:** AG-M6D-05 and G0 graph inspector. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/ui-pages/research-zone-viewer` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance evidence:** Imported trace shows all available cylinder and pipe zones; hidden zones don't consume render CPU. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-06b

**Approved Round 2 requirement:** When actual measured cylinder/torque/flow/thermal/sound reference data exist, compare against them with explicit confidence/uncertainty and licensing provenance. Without measurements, label results only as converged simulation estimates; failed numerical schemes may not become training truth. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap requirement:** Create per-zone diagnostic trace viewer, coarse/fine **mesh/time-step convergence reports**, reproducible dataset manifests and optional licensed measured-reference comparisons.

**Precisely implement:** Automated mesh/time-step comparison, uncertainty and optional measured-reference matching.
**Inputs / prerequisites:** AG-M6D-05 and convergence fixtures AG-M6B-03b. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/convergence-report` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [05](../05-training-and-calibration.md), [07](../07-testing-and-acceptance.md).
**Acceptance evidence:** Runs with invalid CFL not labeled converged; coarse/fine errors and metrics exported. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6D-07

**Roadmap source:** Provide a Windows/Linux local graphical high-fidelity job monitor in addition to the headless CLI, without requiring remote/cloud services.

**Precise deliverable:** Develop a separately launchable local graphical study manager showing versioned study/job IDs, resource estimate, solver/backend/seed, queued/running/stopped/failed/completed, simulated crank/time progress, log/event messages, CPU/GPU/RAM/disk usage, pause/cancel/checkpoint/restart and export status. Integrate through a typed `LocalStudyControl` API/IPC adapter to existing AG-M6D-03a scheduler/03b checkpoint services rather than reimplementing solver. Verify Windows/Linux GUI runtime/packaging first and propose any major stack choice for owner approval; no remote job queue or GitHub Pages server is implied.

**Inputs / prerequisites:** AG-M6D-03a/03b CLI scheduler and persistence/checkpoints, AG-M6D-05 run manifest, accepted job-control protocol; if unavailable, use committed mock CLI fixture and report incomplete integration.

**Owned files/modules:** `src/local-study-monitor/, src/contracts/local-study-control/, tests/gui/local-monitor`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [27](../27-high-fidelity-experiment-orchestration.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [30](../30-agent-handoff-contracts-and-decisions.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** On Windows and Linux or documented accessible CI/manual environments, monitor mock/real local job, reconnect after GUI restart, pause/cancel/safely resume checkpoint, handle process died and wrong protocol version without corrupting job. No online network token requirement. Report platform test gaps and technical feasibility as NON VALIDATED until proven. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

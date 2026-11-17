# M7 — independent agent cards

Only G6-valid high-fidelity data can calibrate the G1 generic simulator. All physics events, port units, and fallback math remain authoritative.

For each card follow [30 — agent contracts](../30-agent-handoff-contracts-and-decisions.md) and [31 — integration gates](../31-integration-gates-and-support-matrix.md). Claims require measured fixtures.

### AG-M7-01

**Approved Round 2 requirement:** Training objective must distinguish **simulation-only / converged model / measurement-compared** quality and scenario uncertainty. Audio metrics use recorded real-world samples **as analyzed features only**, never as a runtime audio layer. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Define weighted physical/audio loss, per-scenario scores and constraints.

**Exact scoped deliverable:** Define per-scenario/per-component physics, event-timing and audio objective units and weights.
**Prerequisites:** G1 + G6 validated dataset. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/metrics` and local tests only.
**Required source reading:** [05](../05-training-and-calibration.md), [07](../07-testing-and-acceptance.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Metric returns expected score for a known feature fixture; missing feature rejected. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-02a

**Original roadmap item:** Fit configurable shared mathematical families (analytical coefficient, bounded lookup maps/splines, reduced-order state space and optionally compact ML) into existing M0/M1 approximation slots, with physical units, component-specific bindings, validity domains and fallback to generic baseline.

**Exact scoped deliverable:** Fit bounded analytic coefficients, lookup tables and splines into existing FastComponentModel bindings.
**Prerequisites:** AG-M7-01 and M0 approximation registry. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/analytic-and-lookup-fit` and local tests only.
**Required source reading:** [28](../28-shared-realtime-surrogates-and-calibration.md), [05](../05-training-and-calibration.md).
**Done when:** Constrained holdout error improves vs baseline and out-of-domain fallback remains finite. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-02b

**Original roadmap item:** Fit configurable shared mathematical families (analytical coefficient, bounded lookup maps/splines, reduced-order state space and optionally compact ML) into existing M0/M1 approximation slots, with physical units, component-specific bindings, validity domains and fallback to generic baseline.

**Exact scoped deliverable:** Fit reduced-order dynamic state, optionally a compact ML model only after simple candidates tested.
**Prerequisites:** AG-M7-02a and transient fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/reduced-order-fit` and local tests only.
**Required source reading:** [28](../28-shared-realtime-surrogates-and-calibration.md), [20](../20-torque-power-load-and-energy.md).
**Done when:** Dynamic lag and stability tests on unseen input schedule with measured CPU. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-03

**Original roadmap item:** Detect reusable/identical mathematically and physically compatible models across multiple components and deduplicate shared equations/lookup data while preserving exact component IDs, parameter sets and provenance.

**Exact scoped deliverable:** Identify compatible equations vs identical map data and deduplicate without losing component identity.
**Prerequisites:** AG-M7-02a and typed domain contract. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/approximations/reuse-validator` and local tests only.
**Required source reading:** [28](../28-shared-realtime-surrogates-and-calibration.md), [09](../09-data-contracts.md).
**Done when:** Identical units/domain reuse is accepted, incompatible component parameters rejected. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-04

**Approved Round 2 requirement:** One-part/component comparison reports causal physical vs synthesized-acoustic changes; calibration to real recorded sound uses analysis features, not playback source substitution. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Consume one-part/part-set sensitivity comparisons to determine which changes impact physical torque/airflow/exhaust and which change sound source timing/timbre; calibrate appropriate fast variables rather than copying raw high-detail trajectories.

**Exact scoped deliverable:** Calculate paired one-part/part-set physical and sound sensitivities separately.
**Prerequisites:** G5 experiment diff and G6 source traces. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/sensitivity` and local tests only.
**Required source reading:** [27](../27-high-fidelity-experiment-orchestration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Muffler acoustics-only change does not report fake crank torque improvement. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-05

**Approved Round 2 requirement:** Feature extractor can consume the same schema from browser ZIP or optional Parquet/HDF5 offline; preserve component IDs, units, conditions and measurement/source provenance, never replace synthesized sound with real recordings. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Extract reference pressure/heat-release/port-flow/resonance features from multiple fidelity levels and fit compact physically constrained fast-model corrections; never require spatial gas/metal meshes at runtime.

**Exact scoped deliverable:** Project gas/thermal/flow/pressure impulses into versioned fast-model feature vectors.
**Prerequisites:** G6 converged per-zone dataset. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/reference-feature-extractor` and local tests only.
**Required source reading:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Mass/torque/flow units and crank-angle timestamps match common boundary contract. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-06

**Original roadmap item:** Implement bounded parameter search, spline/map fitting and regularization.

**Exact scoped deliverable:** Deterministic bounded optimizer and regularization across defined training set.
**Prerequisites:** AG-M7-01 and candidate model families. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/optimizer` and local tests only.
**Required source reading:** [05](../05-training-and-calibration.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Invalid or unstable coefficient discarded; identical seed has equivalent optimum. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-07

**Approved Round 2 requirement:** Holdout separates configurations and measures against real data when available; disclose lack of measurement rather than claim measured accuracy. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Add scenario/configuration-disjoint holdout sets across engine family, intake/boost, controller and transmission/AWD combinations, boundary sampling and model comparison.

**Exact scoped deliverable:** Configuration-disjoint train/validation/holdout evaluator with worst-case metrics.
**Prerequisites:** AG-M7-06 and scenario matrix. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/holdout` and local tests only.
**Required source reading:** [05](../05-training-and-calibration.md), [07](../07-testing-and-acceptance.md), [19](../19-scenario-coverage-and-presets.md).
**Done when:** Whole vehicle/part/scenario holdout cannot leak adjacent samples from training. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-08

**Approved Round 2 requirement:** Reject incomplete/convergence-invalid references; report whether real measurement validation exists, its confidence and limits, not merely solver fidelity label. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Record source fidelity/mesh versions and convergence/uncertainty in every trained artifact; reject un-converged/unreliable reference configurations as training ground truth.

**Exact scoped deliverable:** Check provenance, mesh convergence and fidelity version before using reference labels.
**Prerequisites:** G6 reference manifest. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/provenance-validation` and local tests only.
**Required source reading:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md).
**Done when:** Corrupt/unconverged input dataset rejected, never silently trained. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-09

**Approved Round 2 requirement:** Trained artifact must include stable references/hashes to ZIP or optional offline scientific source datasets and source licenses; **do not embed real-world recorded sound as an audio-rendering asset**. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap item:** Export versioned coefficient profiles with validity bounds, provenance and hashes; activate via validated scheduled command and PROFILE_ACTIVATED event.

**Exact scoped deliverable:** Export versioned compact component-bound equation/maps and metric manifest.
**Prerequisites:** AG-M7-07 and AG-M7-08. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/training/profile-export` and local tests only.
**Required source reading:** [09](../09-data-contracts.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Valid profile roundtrips; incompatible units, checksum or model version rejected. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-10

**Original roadmap item:** Load and atomically swap validated profiles; add stable baseline fallback.

**Exact scoped deliverable:** Load/atomically activate validated trained profiles with per-component analytic fallback.
**Prerequisites:** AG-M7-09 and G1 engine. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/approximations/profile-loader` and local tests only.
**Required source reading:** [28](../28-shared-realtime-surrogates-and-calibration.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Mid-run switch obeys safe boundary; wrong graph hash falls back with diagnostics. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-11

**Original roadmap item:** Reject candidates with worse transition behavior, instability or audio CPU overruns.

**Exact scoped deliverable:** Regression/release tests of trained physical events, energy and worklet CPU load.
**Prerequisites:** AG-M7-07/10 and G2 worklet. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/training/regression-and-runtime` and local tests only.
**Required source reading:** [07](../07-testing-and-acceptance.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Candidate with better audio but broken crank energy fails; baseline remains runnable. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M7-12

**Roadmap source:** Implement reference measurement ingestion and catalog supporting both user-imported and explicitly licensed bundled assets for calibration/validation only.

**Precise deliverable:** Create a versioned `MeasurementReferenceCatalog` with **user-imported owned/licensed datasets** and **optional bundled measurements only after redistribution rights documented**. Store source provenance/license/attribution/conditions, units, timestamps, uncertainty and usable derived features for torque, combustion, pressure, intake/exhaust and spectral/transient comparisons. Import may analyze original audio; do not register recorded-car audio as an AudioSource/stem or offer in-app reference audio playback. Catalog can ship empty/unavailable with capability and tests if no verified redistributable assets exist. Provide exact feature/export contract to AG-M7-05/07/08 and AG-M8-03 licensing reviewer.

**Inputs / prerequisites:** AG-M0-13 browser ZIP/schema, AG-M7-05 feature-extraction conventions, license/provenance ADR-010, offline Windows/Linux research format if relevant; actual bundled source files must be licensed separately.

**Owned files/modules:** `src/reference-data/catalog/, src/reference-data/import/, tests/reference-data/catalog`; other agent contract directories are outside this card without an accepted owner-approved ADR.

**Required reading:** [05](../05-training-and-calibration.md), [25](../25-core-diagnostics-recording-and-comparison.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [agent handoff contract](../30-agent-handoff-contracts-and-decisions.md), [integration gates](../31-integration-gates-and-support-matrix.md), [approved Round 3](../decisions/USER-APPROVED-ROUND-03.md), [open technical validation](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

**Acceptance / evidence:** User-owned sample with complete license metadata imports feature descriptors; invalid license/format/corrupted reference rejected, bundled asset lacking redistribution proof is excluded; reference audio never routable to live mixer/audio player. Model report explicitly states missing measured coverage; do not claim verified car acoustics based only on numerics. Supply at least one positive and one negative fixture, actual test results, a versioned output/trace or UI evidence, and the [completion report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent). Status is **blocked / fixture-only** rather than complete if required runtime, rights or credentials are unverified.

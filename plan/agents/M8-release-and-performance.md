# M8 — independent agent cards

Release only verified supported subset, not every future automotive technology.

For each card follow [30 — agent contracts](../30-agent-handoff-contracts-and-decisions.md) and [31 — integration gates](../31-integration-gates-and-support-matrix.md). Claims require measured fixtures.

### AG-M8-01

**Original roadmap item:** Browser/device matrix, 44.1/48kHz handling, audio suspend/device-change tests.

**Exact scoped deliverable:** Browser/audio device suite at 44.1/48kHz, suspend/resume, gesture and sample-clock mapping.
**Prerequisites:** G1/G2/G3 fixtures. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/browser-compat` and local tests only.
**Required source reading:** [01](../01-architecture.md), [07](../07-testing-and-acceptance.md).
**Done when:** Document Chromium/Firefox/Safari where testable; degraded browser doesn't kill physics. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-02

**Original roadmap item:** CPU/memory profiling, graphics LOD, DSP quality tiers and benchmark dashboard.

**Exact scoped deliverable:** CPU/memory benchmark, 3D/2D quality tiers and optional DSP fallback.
**Prerequisites:** G2/G3 and M4 provider fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/benchmarks, src/performance` and local tests only.
**Required source reading:** [07](../07-testing-and-acceptance.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Benchmark capture includes hardware, zero deadline misses in tested stress case, 2D lower load. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-03

**Original roadmap item:** Preset import/export, reproducible demo and clear licensing/privacy attribution.

**Exact scoped deliverable:** Demo preset import/export, attribution/asset licenses and fidelity status UI.
**Prerequisites:** G3 validated wizard. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/profiles, docs/licensing` and local tests only.
**Required source reading:** [09](../09-data-contracts.md), [31](../31-integration-gates-and-support-matrix.md).
**Done when:** Malformed imports rejected, support/accuracy table honest, sound samples licensed. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M8-04

**Original roadmap item:** Test deployed Pages artifact, pin releases, publish architecture/scenario/training docs.

**Exact scoped deliverable:** Pages HTTPS static route/asset smoke test, versioned release and reproducible documentation.
**Prerequisites:** G0–G7 applicable for released subset. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `.github/workflows/, docs/release` and local tests only.
**Required source reading:** [01](../01-architecture.md), [31](../31-integration-gates-and-support-matrix.md).
**Done when:** Reload works under /sound-generator/, AudioWorklet loads and release traces available. Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

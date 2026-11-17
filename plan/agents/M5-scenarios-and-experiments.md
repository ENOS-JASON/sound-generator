# M5 — scenario and experiment agent cards

These are separate deliverables with one agent per card. Rich M5 runner reuses the minimal M1 headless/clock/event/trace APIs; no second scenario clock. Follow [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md).

### AG-M5-01

**Original step:** Parse/validate schema with deterministic seeded initial state.

**Bounded deliverable:** Versioned scenario parser and seed/initial-condition validation.
**Inputs/dependencies:** G0-B and M1 headless fixture. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/scenarios/schema`; other public schemas require accepted ADR.
**Read:** [06](../06-scenario-runner.md), [09](../09-data-contracts.md), [11](../11-event-bus-and-messaging.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Schema import roundtrip; invalid version/field/timeouts rejected. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-02

**Original step:** Implement elapsed/time/event/condition/all/any gates, sustained conditions and finite timeouts using canonical event sequence watermarks and authoritative solver state.

**Bounded deliverable:** Elapsed/time/event/condition/all/any gate evaluator with event watermarks and sustained holds.
**Inputs/dependencies:** AG-M5-01. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/scenarios/gates`; other public schemas require accepted ADR.
**Read:** [06](../06-scenario-runner.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Old event cannot satisfy new step; a paused sim cannot expire simulation timeout. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-03

**Original step:** Implement branch/retry policies, negative assertions and event-history semantics.

**Bounded deliverable:** Branch/retry/negative assertion/timeout engine bounded by max steps.
**Inputs/dependencies:** AG-M5-02. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/scenarios/control-flow`; other public schemas require accepted ADR.
**Read:** [06](../06-scenario-runner.md), [19](../19-scenario-coverage-and-presets.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Intentional no-event produces explicit timeout; infinite retry never hangs. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-04

**Original step:** Build experiment/study definitions: baseline vehicle + complete component and parameter manifests, run groups for a single changed part, a named set of parts, parameter sweep, repeated validation runs, matched seeds and event-gated scenario sequences.

**Bounded deliverable:** Baseline, one-part and preset-of-parts variation manifests with versions, seeds and initial conditions.
**Inputs/dependencies:** AG-M0-16 and AG-M5-01. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/experiments/study-manifest`; other public schemas require accepted ADR.
**Read:** [09](../09-data-contracts.md), [27](../27-high-fidelity-experiment-orchestration.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Exact component diff and dependent recalculation recorded; undeclared change rejected. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-05

**Original step:** Add headless A/B fast-model runner and comparisons of component-by-component torque/energy/airflow, audio stem spectra/transients and external load; preserve identical conditions and record realized component differences.

**Bounded deliverable:** Headless paired baseline/variant fast-model simulation, torque/power/audio-source feature diff.
**Inputs/dependencies:** AG-M5-04, G1 fast model fixture. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/experiments/fast-compare`; other public schemas require accepted ADR.
**Read:** [25](../25-core-diagnostics-recording-and-comparison.md), [27](../27-high-fidelity-experiment-orchestration.md), [28](../28-shared-realtime-surrogates-and-calibration.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Same baseline repeat within tolerance; changing runner shows physical/sonic diff or explicitly unresolved signal. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-06a

**Original step:** Build headless scenario matrix, traces, reporter and UI scenario editor/playback.

**Bounded deliverable:** Headless runner and JSON report of gate transitions, timeouts, all run statuses and event trace.
**Inputs/dependencies:** AG-M5-02 and AG-M5-03. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/scenarios/runner-and-reporter`; other public schemas require accepted ADR.
**Read:** [06](../06-scenario-runner.md), [19](../19-scenario-coverage-and-presets.md), [25](../25-core-diagnostics-recording-and-comparison.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Pass/fail/timeout/unsupported have distinct codes; report includes causation and sim time. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-06b

**Original step:** Build headless scenario matrix, traces, reporter and UI scenario editor/playback.

**Bounded deliverable:** Scenario step editor, playback and gate/timeline inspector on dedicated page.
**Inputs/dependencies:** AG-M5-06a and G0 UI shell. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/ui-pages/scenarios`; other public schemas require accepted ADR.
**Read:** [06](../06-scenario-runner.md), [26](../26-multipage-ui-and-floating-widgets.md), [25](../25-core-diagnostics-recording-and-comparison.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Open, edit, run and replay; route navigation doesn't reset the engine or lose gate state. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-07a

**Original step:** Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](../19-scenario-coverage-and-presets.md)).

**Bounded deliverable:** Warm/cold start, weak battery vs worn starter, no-ECU/ECU, limiter, stall and afterfire scenarios.
**Inputs/dependencies:** AG-M5-06a, released M1/M4A providers. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/scenarios/starts-and-controls`; other public schemas require accepted ADR.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [19](../19-scenario-coverage-and-presets.md), [06](../06-scenario-runner.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Positive and negative expected events, no phantom afterfire; failures include exact reason. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-07b

**Original step:** Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](../19-scenario-coverage-and-presets.md)).

**Bounded deliverable:** Airbox, carb/ITB, turbo/supercharger/compound and overrun tune conditions.
**Inputs/dependencies:** AG-M5-06a and released M4B providers. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/scenarios/induction`; other public schemas require accepted ADR.
**Read:** [16](../16-intake-induction-and-exhaust.md), [19](../19-scenario-coverage-and-presets.md), [06](../06-scenario-runner.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Airflow pressure and torque respond to actual induction and sound source; missing provider not silently passed. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-07c

**Original step:** Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](../19-scenario-coverage-and-presets.md)).

**Bounded deliverable:** Manual/AT/DCT/CVT, FWD/RWD/AWD/4WD 2H/4H/4L, clutch/traction/slope.
**Inputs/dependencies:** AG-M5-06a and released M4C providers. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/scenarios/drivetrain`; other public schemas require accepted ADR.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [19](../19-scenario-coverage-and-presets.md), [20](../20-torque-power-load-and-energy.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Power conservation and proper driven-wheel split; invalid transfer case command rejected. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-07d

**Original step:** Add weak-battery vs worn-starter, pop-and-bang positive/negative, ECU/no-ECU, all released engine-bank layouts, intake/compound boost, manual/auto/DCT/CVT, AWD/4WD 2H/4H/4L, stall and dyno torque/hp cases (see [19](../19-scenario-coverage-and-presets.md)).

**Bounded deliverable:** All implemented I/V/flat 1–12 cylinder bank and firing order cases.
**Inputs/dependencies:** AG-M5-06a and released M4D providers. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/scenarios/layouts`; other public schemas require accepted ADR.
**Read:** [15](../15-engine-families-and-presets.md), [19](../19-scenario-coverage-and-presets.md), [13](../13-2d-engine-cutaway.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Pulse cadence and crank phase accurate with bank-mapped 2D projections; unsupported layout reported. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-08

**Original step:** Add component graph conservation tests, pairwise configuration coverage, high-risk cross combinations and explicit unimplemented/unsupported reporting.

**Bounded deliverable:** Pairwise configuration generator, conservation assertions and visible unimplemented/unsupported counts.
**Inputs/dependencies:** AG-M5-06a, component manifest and load ledger. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `src/testing/covering-arrays`; other public schemas require accepted ADR.
**Read:** [07](../07-testing-and-acceptance.md), [19](../19-scenario-coverage-and-presets.md), [20](../20-torque-power-load-and-energy.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** A forbidden component combo fails preflight; bad energy balance fails while planned matrix cases remain reported. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-09

**Original step:** Add wizard + JSON import parity tests (no ECU vs ECU, transmission type, turbo/NA, 4WD/2WD, V/flat cylinder-bank constraints), geometry/displacement property checks, and safe schema migration/undo tests.

**Bounded deliverable:** Wizard vs JSON import constraint parity, unit conversion, migrations and invalid state handling.
**Inputs/dependencies:** AG-M0-06, AG-M3-05c or accepted wizard fixtures. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/configurator/import-parity`; other public schemas require accepted ADR.
**Read:** [09](../09-data-contracts.md), [22](../22-guided-vehicle-configurator.md), [15](../15-engine-families-and-presets.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** Mechanical+ECU-only tune, turbo without turbine, 2WD+4L and bad bore/rod fail the same way. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-10

**Original step:** Define event-aligned advanced reference scenario traces and zone-level flow/temperature/pressure/thermal-loss test cases, with independent mesh/time-step convergence protocols.

**Bounded deliverable:** Event-aligned reference scenario definitions and small zone/mass/energy expected outputs.
**Inputs/dependencies:** AG-M0-08 and AG-M5-06a. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/fixtures/reference/scenarios`; other public schemas require accepted ADR.
**Read:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [27](../27-high-fidelity-experiment-orchestration.md), [06](../06-scenario-runner.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** No valve flow when closed absent leakage; wrong energy sign fails fixture; unsupported tier flagged. Commit runnable positive + negative case, report data hashes, and a completion handoff.

### AG-M5-11

**Original step:** Run randomized boundary cases and automated stress tests.

**Bounded deliverable:** Seeded property and boundary tests for RPM, controls, time scale, event gaps and resource bounds.
**Inputs/dependencies:** AG-M5-06a, G1 fast runtime. No invented state/event parser; use accepted contract fixtures when a producer isn't ready.
**Owned files:** `tests/stress/scenarios`; other public schemas require accepted ADR.
**Read:** [07](../07-testing-and-acceptance.md), [19](../19-scenario-coverage-and-presets.md), [24](../24-simulation-clock-and-time-scaling.md), [handoff contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** No runaway memory/NaN/event duplication in declared domain; failing seed is reproducible. Commit runnable positive + negative case, report data hashes, and a completion handoff.

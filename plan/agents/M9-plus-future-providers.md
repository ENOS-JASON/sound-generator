# M9P — independent agent cards

M9+ roadmap lines are broad future epics. Cards below break them into provider-sized assignments. Each is BLOCKED until its distinct provider contract/fixture is accepted; future does not mean automatically implemented.

For each card follow [30 — agent contracts](../30-agent-handoff-contracts-and-decisions.md) and [31 — integration gates](../31-integration-gates-and-support-matrix.md). Claims require measured fixtures.

### AG-M9P-01a

- [ ] **AG-M9P-01a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.

**Exact scoped deliverable:** Early mechanical/analog fuel injection and ignition family.
**Prerequisites:** G8 + provider ADR. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/controls/legacy-injection` and local tests only.
**Required source reading:** [14](../14-modular-typescript-platform.md), [15](../15-engine-families-and-presets.md).
**Acceptance checklist — AG-M9P-01a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Legacy fuel/ignition controls behave without modern ECU tune options.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-01b

- [ ] **AG-M9P-01b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.

**Exact scoped deliverable:** Compression-ignition diesel engine family.
**Prerequisites:** G8 + diesel combustion/pressure fixtures. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/engines/diesel` and local tests only.
**Required source reading:** [15](../15-engine-families-and-presets.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-01b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Diesel firing sound/pressure without fake spark ignition
- [ ] fuel-off stops heat release.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-01c

- [ ] **AG-M9P-01c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.

**Exact scoped deliverable:** Two-stroke gasoline/diesel and scavenging model family.
**Prerequisites:** G8 + dedicated 360-degree cycle model. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/engines/two-stroke` and local tests only.
**Required source reading:** [15](../15-engine-families-and-presets.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md).
**Acceptance checklist — AG-M9P-01c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Correct cylinder pulse phase and gas exchange, not four-stroke surrogate.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-01d

- [ ] **AG-M9P-01d COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.

**Exact scoped deliverable:** Rotary chamber/shaft/port geometry model and non-piston visual provider.
**Prerequisites:** G8 + rotary family contract. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/engines/rotary` and local tests only.
**Required source reading:** [15](../15-engine-families-and-presets.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance checklist — AG-M9P-01d** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] No phantom valves/pistons, rotary-specific chamber and event timing.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-01e

- [ ] **AG-M9P-01e COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M9 — Historic and nonstandard combustion:** expand mechanical carburetors, distributors, early fuel injection, mechanical diesel and varied engine cycles; add independently validated two-stroke, diesel/rotary models, historic gearboxes and their own sound sources.

**Exact scoped deliverable:** Historical/preselector/unsynchronized gearbox mechanism.
**Prerequisites:** G8 + rotational port solver. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/driveline/historical-gearboxes` and local tests only.
**Required source reading:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-01e** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Distinct engagement/slip and invalid shift behavior, not fake DCT.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-02a

- [ ] **AG-M9P-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.

**Exact scoped deliverable:** Battery, inverter and traction e-motor energy ports.
**Prerequisites:** G8 + electrical motor ADR. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/electrified/battery-inverter` and local tests only.
**Required source reading:** [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Wheel output draws bounded electrical power, no combustion output.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-02b

- [ ] **AG-M9P-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.

**Exact scoped deliverable:** Regenerative friction-brake blending.
**Prerequisites:** AG-M9P-02a. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/electrified/regen` and local tests only.
**Required source reading:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Regen updates battery store with losses
- [ ] not negative free road power.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-02c

- [ ] **AG-M9P-02c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.

**Exact scoped deliverable:** Series, parallel and mild-hybrid torque supervisor.
**Prerequisites:** AG-M9P-02a and G1 engine. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/electrified/hybrid-control` and local tests only.
**Required source reading:** [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-02c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] No energy duplication between engine, battery, motor and wheels.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-02d

- [ ] **AG-M9P-02d COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.

**Exact scoped deliverable:** Power-split planetary hybrid eCVT model.
**Prerequisites:** AG-M9P-02c and planetary solver. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/electrified/ecvt` and local tests only.
**Required source reading:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-02d** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Speed/torque constraints valid through coupled branches.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-02e

- [ ] **AG-M9P-02e COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M10 — Electrified/hybrid vehicles:** battery/charger/inverter, motor and generator controllers, regenerative braking, serial/parallel/power-split hybrids and eCVT, front/rear e-AWD. Retain the same bidirectional energy/torque accounting and audio mixer.

**Exact scoped deliverable:** Independent axle electric AWD motor control.
**Prerequisites:** AG-M9P-02a and diff port fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/electrified/eadw` and local tests only.
**Required source reading:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-02e** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Driven axle power limited by two motor supplies and traction.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-03a

- [ ] **AG-M9P-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined.

**Exact scoped deliverable:** Unusual W/VR/radial engine bank/shaft geometry.
**Prerequisites:** G8 + engine-family ADR. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/engines/unusual-layouts` and local tests only.
**Required source reading:** [15](../15-engine-families-and-presets.md), [14](../14-modular-typescript-platform.md).
**Acceptance checklist — AG-M9P-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] No hard-coded 2-bank assumption and bank/firing test passes.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-03b

- [ ] **AG-M9P-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined.

**Exact scoped deliverable:** Alternative fuels and variable-combustion controllers.
**Prerequisites:** G8 + fuel property/test data. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/engines/alternative-fuel` and local tests only.
**Required source reading:** [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Real fuel energy and appropriate controller changes, invalid combo rejected.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-03c

- [ ] **AG-M9P-03c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined.

**Exact scoped deliverable:** Advanced staged induction and novel compressor graph.
**Prerequisites:** G8 + accepted compressor tests. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/intake/advanced-induction` and local tests only.
**Required source reading:** [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-03c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Each stage/motor/turbine energy path balanced
- [ ] no free boost.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-03d

- [ ] **AG-M9P-03d COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M11 — Unusual and advanced configurations:** specialized W/VR/radial layouts, multi-stage/compound boost, unusual transfer cases, variable-combustion systems, alternative fuels and special driveline tech. Each enters the registry only after physics contracts and reference/testing are defined.

**Exact scoped deliverable:** Novel/multi-axle transfer and drive layouts.
**Prerequisites:** G8 + axle constraint fixture. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/driveline/unusual-drives` and local tests only.
**Required source reading:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M9P-03d** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Axle torque/power conservation and correct unsupported status.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-04a

- [ ] **AG-M9P-04a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M12 — Broader calibration and technology verification:** expand validated measured sources, cross-generation regression and performance coverage. Clearly identify accuracy and unsupported features per preset.

**Exact scoped deliverable:** External measurement alignment, licensing and uncertainty.
**Prerequisites:** G8 + licensed measurement data. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/reference/measurement-comparison` and local tests only.
**Required source reading:** [05](../05-training-and-calibration.md), [27](../27-high-fidelity-experiment-orchestration.md).
**Acceptance checklist — AG-M9P-04a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Provenance/time/unit/correction methodology complete.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-04b

- [ ] **AG-M9P-04b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M12 — Broader calibration and technology verification:** expand validated measured sources, cross-generation regression and performance coverage. Clearly identify accuracy and unsupported features per preset.

**Exact scoped deliverable:** Cross-generation regression fixtures and performance coverage.
**Prerequisites:** G8 + implemented provider set. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `tests/cross-generation` and local tests only.
**Required source reading:** [07](../07-testing-and-acceptance.md), [19](../19-scenario-coverage-and-presets.md).
**Acceptance checklist — AG-M9P-04b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] No hidden planned-provider passes
- [ ] all releases disclose omitted coverage.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M9P-04c

- [ ] **AG-M9P-04c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap item:** **M12 — Broader calibration and technology verification:** expand validated measured sources, cross-generation regression and performance coverage. Clearly identify accuracy and unsupported features per preset.

**Exact scoped deliverable:** Provider fidelity/support UI explanation by technology.
**Prerequisites:** G8 + support registry. Missing contract means blocked or fixture-only, never independently invented new protocol.
**Owned area:** `src/ui-pages/provider-status` and local tests only.
**Required source reading:** [31](../31-integration-gates-and-support-matrix.md), [09](../09-data-contracts.md).
**Acceptance checklist — AG-M9P-04c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Planned model visible as info but not runnable
- [ ] implemented capabilities verified.
- [ ] Supply positive and negative fixture, executed test command and [handoff report](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

# M4B — independent agent task cards

**Scope:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration. One agent per card, do not claim a whole family complete from one component. Shared implementation policy: [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md).

### AG-M4B-01a

- [ ] **AG-M4B-01a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add filter/airbox, throttle/plenum, variable runners, ITB/carburetor configurations with actual volumetric-efficiency and sonic effects.

**Implement in this card only:** Airbox/filter/throttle/plenum flow and acoustic model.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-01a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-01b

- [ ] **AG-M4B-01b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add filter/airbox, throttle/plenum, variable runners, ITB/carburetor configurations with actual volumetric-efficiency and sonic effects.

**Implement in this card only:** ITB, carburetor and variable-length runner model.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-01b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-02a

- [ ] **AG-M4B-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add validated single/parallel/sequential/compound turbo, supercharger types and twincharging/charge-cooling via a flow/energy graph; test mechanical/exhaust/electrical parasitic energy.

**Implement in this card only:** Single turbo plus compressor/turbine shaft and wastegate model.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-02b

- [ ] **AG-M4B-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add validated single/parallel/sequential/compound turbo, supercharger types and twincharging/charge-cooling via a flow/energy graph; test mechanical/exhaust/electrical parasitic energy.

**Implement in this card only:** Mechanically/electrically driven supercharger families.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] voltage-current-power and starter failure cases differ from healthy case
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-02c

- [ ] **AG-M4B-02c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add validated single/parallel/sequential/compound turbo, supercharger types and twincharging/charge-cooling via a flow/energy graph; test mechanical/exhaust/electrical parasitic energy.

**Implement in this card only:** Parallel/sequential/compound and twincharging topology integration.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration; prior single-turbo/supercharger cards AG-M4B-02a and AG-M4B-02b. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-02c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-03a

- [ ] **AG-M4B-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Exhaust afterfire/intake backfire and stock/mild/aggressive pop-and-bang tune strategies plus 2-step/anti-lag as opt-in **physically conditioned** features, each with failure/negative-control scenarios.

**Implement in this card only:** Physics-conditioned exhaust afterfire and intake backfire model.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration; corresponding physical combustion/exhaust/control provider fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] airflow/pressure/shaft-energy changes propagate to crank torque and source-specific sound
- [ ] fuel/ignition/temperature prerequisites control physical events
- [ ] negative case produces no unauthorized pop/cut
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4B-03b

- [ ] **AG-M4B-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Exhaust afterfire/intake backfire and stock/mild/aggressive pop-and-bang tune strategies plus 2-step/anti-lag as opt-in **physically conditioned** features, each with failure/negative-control scenarios.

**Implement in this card only:** ECU pop-and-bang/2-step/anti-lag strategy integration.
**Required inputs:** G1 engine and typed air/exhaust/shaft ports; G2 source registry for audible integration; corresponding physical combustion/exhaust/control provider fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/intake/, src/exhaust/, src/controls/overrun, or source-specific src/audio/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [03](../03-audio-synthesis.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4B-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] fuel/ignition/temperature prerequisites control physical events
- [ ] negative case produces no unauthorized pop/cut
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

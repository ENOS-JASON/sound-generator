# M4A — independent agent task cards

**Scope:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. One agent per card, do not claim a whole family complete from one component. Shared implementation policy: [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md).

### AG-M4A-01

- [ ] **AG-M4A-01 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** ECU limiter: soft/hard control, cylinder cut strategy, hysteresis and exit; capability-aware mechanical/no-ECU alternatives.

**Implement in this card only:** ECU limiter: soft/hard control, cylinder cut strategy, hysteresis and exit; capability-aware mechanical/no-ECU alternatives..
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily; corresponding physical combustion/exhaust/control provider fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-01** (all unchecked until verified):

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

### AG-M4A-02a

- [ ] **AG-M4A-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add battery aging and cold cranking, worn/heat-soaked starter, solenoid failures, cable voltage drop, charging/alternator and accessory loads.

**Implement in this card only:** Battery aging/SoC and cold-cranking voltage-current model.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] voltage-current-power and starter failure cases differ from healthy case
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4A-02b

- [ ] **AG-M4A-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add battery aging and cold cranking, worn/heat-soaked starter, solenoid failures, cable voltage drop, charging/alternator and accessory loads.

**Implement in this card only:** Starter wear, solenoid and heat-soak failure model.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] voltage-current-power and starter failure cases differ from healthy case
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4A-02c

- [ ] **AG-M4A-02c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add battery aging and cold cranking, worn/heat-soaked starter, solenoid failures, cable voltage drop, charging/alternator and accessory loads.

**Implement in this card only:** Alternator, cable resistance and electrical accessory loads.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-02c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] voltage-current-power and starter failure cases differ from healthy case
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4A-03a

- [ ] **AG-M4A-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add configurable ECU fuel/spark/boost/overrun maps and mechanical carb/distributor/choke behavior with mutually valid controls.

**Implement in this card only:** Typed ECU fuel/spark/boost/overrun tune-map control.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily; corresponding physical combustion/exhaust/control provider fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-03a** (all unchecked until verified):

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

### AG-M4A-03b

- [ ] **AG-M4A-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add configurable ECU fuel/spark/boost/overrun maps and mechanical carb/distributor/choke behavior with mutually valid controls.

**Implement in this card only:** Mechanical carburetor/choke/distributor control refinements.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] state, units and domain-specific physical effects are reproducible and tested
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4A-04a

- [ ] **AG-M4A-04a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Intake/fueling transients, overrun fuel-cut, misfires, hot/cold differences and engine thermal states.

**Implement in this card only:** Intake and fueling transients, overrun fuel-cut model.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-04a** (all unchecked until verified):

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

### AG-M4A-04b

- [ ] **AG-M4A-04b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Intake/fueling transients, overrun fuel-cut, misfires, hot/cold differences and engine thermal states.

**Implement in this card only:** Cylinder misfire, hot/cold and thermal state model.
**Required inputs:** G1 baseline plus accepted physical/ECU contracts; source-model fixtures can substitute temporarily. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/controls/, src/electrical/, or src/engines/thermal/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [18](../18-electrical-control-generations-and-tunes.md), [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4A-04b** (all unchecked until verified):

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

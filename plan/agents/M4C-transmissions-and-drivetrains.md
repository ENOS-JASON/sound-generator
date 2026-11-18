# M4C — independent agent task cards

**Scope:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. One agent per card, do not claim a whole family complete from one component. Shared implementation policy: [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md).

### AG-M4C-01a

- [ ] **AG-M4C-01a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.

**Implement in this card only:** Clutch and manual gearbox with torque/heat coupling.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-01a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-01b

- [ ] **AG-M4C-01b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.

**Implement in this card only:** Road load, brakes, wheels, tire traction and slip.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-01b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] road traction and brake forces affect actual wheel acceleration and audio only when physically enabled
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-02a

- [ ] **AG-M4C-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Hydraulic torque converter and planetary automatic.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-02b

- [ ] **AG-M4C-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Automated-manual/sequential gearbox.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; prior single-turbo/supercharger cards AG-M4C-02a and AG-M4C-02b. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-02c

- [ ] **AG-M4C-02c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Dual-clutch transmission.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-02c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-02d

- [ ] **AG-M4C-02d COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Continuous variable ratio CVT.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-02d** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-03a

- [ ] **AG-M4C-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** FWD/RWD drive paths and open differential.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-03b

- [ ] **AG-M4C-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** Full-time/on-demand AWD differential/coupler.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-03c

- [ ] **AG-M4C-03c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** Selectable part-time 4WD/4x4 2H/4H/4L transfer and locks.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-03c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-04a

- [ ] **AG-M4C-04a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.

**Implement in this card only:** Clutch, gear, transmission and differential audio sources.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; G2 source mixer and a physical-event fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-04a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] locked/slipping gear and wheel load return preserve torque/power with losses
- [ ] invalid topology rejected
- [ ] source mute changes sound only, not physical component states
- [ ] audio event IDs/phase remain correlated
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

### AG-M4C-04b

- [ ] **AG-M4C-04b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.

**Implement in this card only:** Slip-correlated tire chirp/road/burnout source.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; G2 source mixer and a physical-event fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4C-04b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] road traction and brake forces affect actual wheel acceleration and audio only when physically enabled
- [ ] source mute changes sound only, not physical component states
- [ ] audio event IDs/phase remain correlated
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Approval and verified merge:** project owner personally reviewed and merged **OR** verified authorized AI integrator reviewed and merged; required CI/branch checks, owner-only ADR/API/security decisions and a real merge are verified. Record PR, merge actor/SHA and evidence; owner needs no separate GitHub review or Markdown edit.

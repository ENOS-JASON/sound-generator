# M4D — independent agent task cards

**Scope:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable. One agent per card, do not claim a whole family complete from one component. Shared implementation policy: [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md).

### AG-M4D-01a

- [ ] **AG-M4D-01a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Publish validated single-cylinder through V12 inline/V/flat examples with firing order, bank angle, crank geometry and collector acoustics, including cross-plane/flat-plane V8 and distinct 2D rows.

**Implement in this card only:** Single-cylinder and inline engine presets I1 through I6.
**Required inputs:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `presets/engines/, presets/induction/ or tests/integration/provider-matrix/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [15](../15-engine-families-and-presets.md), [13](../13-2d-engine-cutaway.md), [19](../19-scenario-coverage-and-presets.md), [31](../31-integration-gates-and-support-matrix.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4D-01a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] validated bank/firing IDs and geometry appear correctly in 2D and cylinder audio
- [ ] invalid preset rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M4D-01b

- [ ] **AG-M4D-01b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Publish validated single-cylinder through V12 inline/V/flat examples with firing order, bank angle, crank geometry and collector acoustics, including cross-plane/flat-plane V8 and distinct 2D rows.

**Implement in this card only:** V6, V8, V10, V12 cross/flat crank presets.
**Required inputs:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `presets/engines/, presets/induction/ or tests/integration/provider-matrix/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [15](../15-engine-families-and-presets.md), [13](../13-2d-engine-cutaway.md), [19](../19-scenario-coverage-and-presets.md), [31](../31-integration-gates-and-support-matrix.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4D-01b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] validated bank/firing IDs and geometry appear correctly in 2D and cylinder audio
- [ ] invalid preset rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M4D-01c

- [ ] **AG-M4D-01c COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Publish validated single-cylinder through V12 inline/V/flat examples with firing order, bank angle, crank geometry and collector acoustics, including cross-plane/flat-plane V8 and distinct 2D rows.

**Implement in this card only:** Flat/opposed engine presets and bank mapping.
**Required inputs:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `presets/engines/, presets/induction/ or tests/integration/provider-matrix/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [15](../15-engine-families-and-presets.md), [13](../13-2d-engine-cutaway.md), [19](../19-scenario-coverage-and-presets.md), [31](../31-integration-gates-and-support-matrix.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4D-01c** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] validated bank/firing IDs and geometry appear correctly in 2D and cylinder audio
- [ ] invalid preset rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M4D-02

- [ ] **AG-M4D-02 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Add forced-induction and exhaust configurations to verified preset combinations rather than treating every untested combination as supported.

**Implement in this card only:** Add forced-induction and exhaust configurations to verified preset combinations rather than treating every untested combination as supported..
**Required inputs:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `presets/engines/, presets/induction/ or tests/integration/provider-matrix/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [15](../15-engine-families-and-presets.md), [13](../13-2d-engine-cutaway.md), [19](../19-scenario-coverage-and-presets.md), [31](../31-integration-gates-and-support-matrix.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4D-02** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] validated bank/firing IDs and geometry appear correctly in 2D and cylinder audio
- [ ] invalid preset rejected
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M4D-03

- [ ] **AG-M4D-03 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Roadmap requirement:** Test per-component physical torque/energy accounting, separate drivetrain/cylinder/induction audio stems and power figures for each shipped configuration.

**Implement in this card only:** Test per-component physical torque/energy accounting, separate drivetrain/cylinder/induction audio stems and power figures for each shipped configuration..
**Required inputs:** G1 + implemented engine family, bank-geometry and audio source registry; don't label nonimplemented presets runnable; G2 source mixer and a physical-event fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `presets/engines/, presets/induction/ or tests/integration/provider-matrix/` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [15](../15-engine-families-and-presets.md), [13](../13-2d-engine-cutaway.md), [19](../19-scenario-coverage-and-presets.md), [31](../31-integration-gates-and-support-matrix.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance checklist — AG-M4D-03** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] source mute changes sound only, not physical component states
- [ ] audio event IDs/phase remain correlated
- [ ] add one valid and one invalid/unsupported case, with a trace and full per-component telemetry.
- [ ] Register support tier, scenario IDs and audio/visual capabilities explicitly.
- [ ] Provide runnable tests, fixture and one-card completion report.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

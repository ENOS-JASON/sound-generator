# M6A — independent agent tasks

Numerical work is offline/headless. Share validated port units and simulation time with M1, but no high-detail zone array enters AudioWorklet.

For every card, read [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md). One agent owns one card. Numerical errors and incomplete traces are failures, not training labels.

### AG-M6A-01

- [ ] **AG-M6A-01 COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Define a common numerical solver interface, reference state/port units, crank-angle/cycle boundary conditions, event alignment and deterministic run/trace manifests.

**Precisely implement:** Numerical solver adapter with input boundary snapshots, component IDs, event time and versioned output.
**Inputs / prerequisites:** G1/G5 fixture and M0 fidelity schema. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/solver-contracts` plus local tests/fixtures only.
**Required references:** [09](../09-data-contracts.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance checklist — AG-M6A-01** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Two solvers can project to same SI port state and report numerical failure without fake physical events.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M6A-02a

- [ ] **AG-M6A-02a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement **Quick 0D cylinder** and **Balanced burned/unburned two-zone** thermodynamic/heat-release models with wall/coolant heat-loss accounting, valve intake/exhaust mass flow and torque coupling.

**Precisely implement:** Zero-dimensional quick thermodynamic pressure/volume/heat-release with crank torque.
**Inputs / prerequisites:** AG-M6A-01 and piston geometry fixture. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/cylinder-0d` plus local tests/fixtures only.
**Required references:** [02](../02-physics-model.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M6A-02a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Crank compression without combustion and firing pressure path obey mass/energy bounds.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M6A-02b

- [ ] **AG-M6A-02b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement **Quick 0D cylinder** and **Balanced burned/unburned two-zone** thermodynamic/heat-release models with wall/coolant heat-loss accounting, valve intake/exhaust mass flow and torque coupling.

**Precisely implement:** Burned/unburned thermodynamic gas with heat-release, mass/energy exchange and pressure continuity.
**Inputs / prerequisites:** AG-M6A-02a. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/cylinder-twozone` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [05](../05-training-and-calibration.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M6A-02b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Ignition increases burn fraction under permitted conditions, misfire remains unburned
- [ ] negative/nonfinite states fail.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M6A-03a

- [ ] **AG-M6A-03a COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement compatible lumped intake/exhaust gas-path models and segmented baseline metal temperatures; verify cross-port mass/enthalpy/energy consistency.

**Precisely implement:** Intake/exhaust connected reservoir/valve flow model with temperature and pressure.
**Inputs / prerequisites:** AG-M6A-01 and air/exhaust port graph. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/lumped-gas-paths` plus local tests/fixtures only.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M6A-03a** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Valve closed stops mass flux absent leakage
- [ ] intake/exhaust mass conserved across a pulse.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

### AG-M6A-03b

- [ ] **AG-M6A-03b COMPLETE** — check LAST, only after every criterion below passes, CI/integration review is accepted, and a real merged PR/commit is linked.

**Original roadmap requirement:** Implement compatible lumped intake/exhaust gas-path models and segmented baseline metal temperatures; verify cross-port mass/enthalpy/energy consistency.

**Precisely implement:** Lumped metal head/liner/piston and coolant heat-transfer state coupled to gas.
**Inputs / prerequisites:** AG-M6A-02a and AG-M6A-03a. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/lumped-walls` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance checklist — AG-M6A-03b** (all unchecked until verified):

- [ ] **Scoped deliverable and dependencies:** implemented within owned files, using accepted versioned contracts and actual prerequisite evidence.
- [ ] Changing material heat capacity changes thermal response, heat flows conserve energy.
- [ ] Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable
- [ ] record code/fixture versions.
- [ ] **Positive-path test/fixture:** passes with recorded command and actual result.
- [ ] **Negative/invalid-path test/fixture:** passes with recorded command and actual result.
- [ ] **CI + artifacts:** applicable tests/checks actually executed and passed; trace/screenshots/fixtures and completion report recorded (or status remains BLOCKED).
- [ ] **Independent review and merge:** authorized AI integrator reviewed the exact PR/commit; any major ADR/shared API/ownership change has owner approval; required CI and branch checks passed; merged commit SHA recorded.

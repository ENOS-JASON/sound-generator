# M6C — independent agent tasks

Treat 1D intake/exhaust gas cells, walls and afterfire as separate solvers connected to existing air/exhaust/thermal ports.

For every card, read [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md). One agent owns one card. Numerical errors and incomplete traces are failures, not training labels.

### AG-M6C-01a

**Original roadmap requirement:** Implement configurable intake/exhaust **1D axial gas cells** (pressure, temperature, flow, waves) at valves/runners/collectors/mufflers, including junctions and reflection/propagation behavior.

**Precisely implement:** Compressible 1D axial finite-volume/wave flow in intake and exhaust pipe cells.
**Inputs / prerequisites:** AG-M6A-03a, runner geometry and boundary conditions. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/flow-1d` plus local tests/fixtures only.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Pressure pulse travels with finite delay; mass/energy bounds and stable tube flow case. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6C-01b

**Original roadmap requirement:** Implement configurable intake/exhaust **1D axial gas cells** (pressure, temperature, flow, waves) at valves/runners/collectors/mufflers, including junctions and reflection/propagation behavior.

**Precisely implement:** Branch/merge collector reflections and valve/runner boundaries.
**Inputs / prerequisites:** AG-M6C-01a and graph junction contract. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/flow-junctions` plus local tests/fixtures only.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Branch fluxes conserve mass and appropriate energy; reflections follow connected geometry. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6C-02a

**Original roadmap requirement:** Add independent exhaust/intake **wall axial segments and radial thermal layers**, turbine/intercooler heat paths where supported, and physically conditioned afterfire heat/pressure propagation.

**Precisely implement:** Pipe wall axial segments and radial layers, heat exchange through runners/catalyst/intercooler as supported.
**Inputs / prerequisites:** AG-M6C-01a and wall material/thermal grid. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/pipe-wall-thermal` plus local tests/fixtures only.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Wall temperatures/heat flux respond to exhaust pulses; no duplicate heating energy. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6C-02b

**Original roadmap requirement:** Add independent exhaust/intake **wall axial segments and radial thermal layers**, turbine/intercooler heat paths where supported, and physically conditioned afterfire heat/pressure propagation.

**Precisely implement:** Local ignition pressure/thermal impulse propagation via exhaust gas cells.
**Inputs / prerequisites:** AG-M6C-01b and afterfire conditioned event fixture. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/afterfire-propagation` plus local tests/fixtures only.
**Required references:** [16](../16-intake-induction-and-exhaust.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [11](../11-event-bus-and-messaging.md).
**Acceptance evidence:** Fuel/oxygen/temp absent -> no afterfire; pressure pulse timing matches source location. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6C-03

**Original roadmap requirement:** Enforce CFL/adaptive timestep, crank-angle/event boundaries, physical positivity and failure/diagnostic reporting across all reference modules.

**Precisely implement:** Adaptive time/crank-angle step, CFL positivity and invalid numerical state diagnostics.
**Inputs / prerequisites:** AG-M6C-01a/01b and AG-M6C-02a. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/numerical-stability, tests/reference/cfl` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [07](../07-testing-and-acceptance.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Acceptance evidence:** Deliberately too-large dt auto-refined or rejected; zero/negative absolute temp never exported. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

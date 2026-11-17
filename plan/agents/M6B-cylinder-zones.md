# M6B — independent agent tasks

Advanced cylinder gas/metal zoning is a discretization of unchanged geometry. It is not automatically full 3D CFD.

For every card, read [30](../30-agent-handoff-contracts-and-decisions.md) and [31](../31-integration-gates-and-support-matrix.md). One agent owns one card. Numerical errors and incomplete traces are failures, not training labels.

### AG-M6B-01a

**Original roadmap requirement:** Implement **multi-zone cylinder gas** (burned/unburned/core/near-wall and optional refined regions) with configurable zone count, inter-zone mass/heat transfer, ignition/combustion progress and expansion/blowdown.

**Precisely implement:** Configurable burned/unburned/near-wall gas zones with pressure/temperature/mass/species exchange.
**Inputs / prerequisites:** AG-M6A-02b and zone-state schema. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/cylinder-multizone` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Zone count refinement changes numerical resolution, not bore/stroke or total gas mass; conservative exchange. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6B-01b

**Original roadmap requirement:** Implement **multi-zone cylinder gas** (burned/unburned/core/near-wall and optional refined regions) with configurable zone count, inter-zone mass/heat transfer, ignition/combustion progress and expansion/blowdown.

**Precisely implement:** Flame/heat-release transfer and incomplete-burn dynamics by crank phase and zone boundary.
**Inputs / prerequisites:** AG-M6B-01a and combustion interface. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/flame-progression` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [05](../05-training-and-calibration.md), [02](../02-physics-model.md).
**Acceptance evidence:** Ignition timing and charge change pressure/torque; no fuel gives no ignition heat pulse. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6B-02a

**Original roadmap requirement:** Implement cylinder **liner axial bands and radial conduction layers**, head/piston crown metal layers and local gas-wall heat flux; keep actual dimensions separate from mesh resolution.

**Precisely implement:** Cylinder liner axial sections and radial layers with gas-to-wall flux and coolant conduction.
**Inputs / prerequisites:** AG-M6B-01a, material/geometry schema. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/liner-thermal-grid` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Eight-by-three and coarse grid conserve heat; changing resolution cannot change liner dimensions. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6B-02b

**Original roadmap requirement:** Implement cylinder **liner axial bands and radial conduction layers**, head/piston crown metal layers and local gas-wall heat flux; keep actual dimensions separate from mesh resolution.

**Precisely implement:** Head and piston crown layer heat-capacity and local gas-wall coupling.
**Inputs / prerequisites:** AG-M6B-01a, AG-M6B-02a. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/head-piston-thermal` plus local tests/fixtures only.
**Required references:** [21](../21-adjustable-fidelity-multizone-reference-simulation.md), [20](../20-torque-power-load-and-energy.md).
**Acceptance evidence:** Different materials/thermal mass yield bounded thermal gradients and energy-residual reports. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6B-03a

**Original roadmap requirement:** Couple crank piston geometry (bore, stroke, rod, compression), valve/port lift, cylinder thermodynamics and pressure-driven torque; validate mesh refinement, pressure/temperature fields, mass/energy residuals and repeatable events.

**Precisely implement:** Map cylinder zone pressure/valve state to crank work/torque and shared port boundary projection.
**Inputs / prerequisites:** AG-M6B-01b, AG-M6B-02a/02b, G1 crank physics. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `src/reference/crank-port-coupling` plus local tests/fixtures only.
**Required references:** [02](../02-physics-model.md), [20](../20-torque-power-load-and-energy.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Acceptance evidence:** Pressure-volume work and crank output align in SI, compression and expansion sign correct. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

### AG-M6B-03b

**Original roadmap requirement:** Couple crank piston geometry (bore, stroke, rod, compression), valve/port lift, cylinder thermodynamics and pressure-driven torque; validate mesh refinement, pressure/temperature fields, mass/energy residuals and repeatable events.

**Precisely implement:** Mesh/time refinement fixtures for gas/wall/pressure/torque and deterministic events.
**Inputs / prerequisites:** AG-M6B-03a and solver trace contract. Do not invent physical ports or source IDs; use versioned mock fixture only when explicitly reporting incomplete live integration.
**Owned files:** `tests/reference/cylinder-convergence` plus local tests/fixtures only.
**Required references:** [05](../05-training-and-calibration.md), [07](../07-testing-and-acceptance.md), [21](../21-adjustable-fidelity-multizone-reference-simulation.md).
**Acceptance evidence:** Refined runs report convergence/residual + uncertainty, failed diverged run invalid not trained. Provide solver manifest, units, seed, simulated-time progress, explicit status and runnable positive/negative tests where applicable; record code/fixture versions.

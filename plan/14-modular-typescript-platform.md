# 14 — Extensible TypeScript powertrain platform

**Required foundation architecture.** Keep an extensible simulation of vehicles spanning different eras without a monolithic `Engine`, hard-coded V8, universal ECU, or switch statement for every possible combination. Scope is modular **coverage by independently verified models**, not a claim that every historical technology is accurate on day one.

## Foundation-level interfaces for timing, diagnostics and approximations

This design adopts the **quoted architectural direction** in [23](23-quoted-project-direction-and-decisions.md): strict TypeScript, Vite, composition/interfaces, pure numerical kernels inside stateful classes, AudioWorklet, Three.js, Canvas 2D, Vitest/Playwright and Worker/offline CLI. Svelte vs Vue 3 remains a documented M0 UI framework selection.

The first modules **before engine modeling** include `SimulationClock`/`TimeControl`, `CommandRouter`, `EventBus`, `TelemetryRegistry`, `DiagnosticsHub`, `TraceRecorder`, `AudioCaptureService`, `ComparisonEngine`, `GraphInspector`, a multi-page `PageRegistry` and `DebugWidgetRegistry`. All of these can be exercised with an instrumented synthetic physics oscillator and AudioWorklet tone generator. New physics components register typed diagnostics channels/events and are replayable from the beginning. Core time scaling and diagnostic UI must not be bolted on later.

`FastComponentModel` and `ApproximationRegistry` form reusable unit/validity-bounded generic calculations with optional trainable coefficients/maps. Corresponding high-detail `ReferenceModelProvider` can project multi-zone outputs into these **same** physical boundary quantities later, without replacing component IDs or event contracts. `ExperimentRunner` drives multiple repetitions and one-part/part-preset changes through the scenario and recorder interfaces. See [24–28](24-simulation-clock-and-time-scaling.md).

## Recommended design (proposal; final framework choice remains open)

- **Strict TypeScript** with small cohesive stateful classes for owned subsystems, interfaces for boundaries, pure functions and fixed-size typed arrays for numerical kernels. Prefer composition over inheritance and explicit constructor dependencies instead of global singletons.
- Versioned interfaces/schemas and a **capability registry / factory** for engine families, controller generations, fuel delivery, induction elements, transmissions, differential/transfer-case types, energy storage and sound emitters.
- Model a vehicle as a **graph of typed connected components and ports**; configuration/preset selects which components are active. The graph supports parameterized bank and wheel counts rather than fixed 4/6/8 defaults. Validate physical compatibility and impossible combinations when loading a preset.
- Runtime holds one authoritative state and dispatches typed commands/domain events per [11](11-event-bus-and-messaging.md). Rendering and audio are replaceable observers; trainable coefficients cannot bypass physical state invariants.
- **Simulation components are not audio channels:** physics component produces state/flows/events; optional `AudioSource` reads them and emits an independently mixed stem per [12](12-audio-gain-staging-and-mixer.md). Rendering consumes the same states per [13](13-2d-engine-cutaway.md).

## Contract candidates (illustrative, not finalized code)

```ts
interface SimulationComponent {
  readonly id: string;
  readonly kind: string;
  initialize(config: unknown): void;
  reset(): void;
  // Implementations may instead participate in a centralized coupled solver.
  contribute(step: PhysicsStepContext, state: VehicleState): void;
  snapshot(): Readonly<ComponentSnapshot>;
}

interface ComponentPort {
  readonly kind: "rotational" | "electrical" | "air" | "fuel" |
    "exhaustGas" | "thermal" | "control";
  readonly id: string;
  readonly direction: "in" | "out" | "bidirectional";
  readonly units: string;
}
interface EngineFamilyModel { readonly kind: string; create(config: EngineConfig): EngineAssembly; }
interface ControlStrategy { update(input: ControlSensors, state: VehicleState): ControlActions; }
interface TransmissionModel { solve(context: DrivelineStepContext): DrivelineSolution; }
interface AudioSourceModel { render(context: AudioFrameContext, output: Float32Array): void; }
interface EngineVisualProjection { project(state: VehicleState): Readonly<CylinderVisualState[]>; }
```

These interfaces express responsibility, **not** an instruction to call independent solvers in arbitrary order. Rotational inertias and gear/clutch connections can be stiff and require an **assembled coupled torque/constraint solve**. Feed independent component force/flow contributions into one time step; resolve coupled constraints, update the authoritative state, and only then publish events. Avoid order-dependent component updates and energy creation.

## Physical interconnection and ownership

| Port kind | Examples | Conserved / tracked quantity |
|---|---|---|
| Rotational | crank, belt, clutch, torque converter, gearbox, shaft, axle, tire | torque (N·m), angular speed (rad/s), inertia (kg·m²), power (W), energy (J) |
| Electrical | battery, cables, starter, alternator, motor, controller | voltage (V), current (A), energy/power with losses |
| Air / fuel | filter, inlet, throttle, compressor, manifold, injector | pressure (Pa), temperature (K), mass flow (kg/s), species/fuel |
| Exhaust gas | cylinders, manifold, turbine, catalyst, muffler | mass, enthalpy/temperature, pressure and pulse transit |
| Thermal | engine, aftertreatment, intercooler, transmission, ambient | heat power (W), thermal state |
| Control | pedals, mechanical linkages, governors, ECU maps, actuators | typed commands, bounds, measured signals |

A signal/control connection is not a power connection. Loads flow **backwards** through the mechanical/electrical network to affect crankshaft torque and speed. Energy flows **forwards** to wheels, exhaust heat, electricity and losses. Solve shared networks without duplicating contributions.

## Numerical and configurable UI extension contracts

New physical engine, intake, exhaust and transmission providers must publish **wizard step/field capability descriptors**, conditional valid values and shared validators used by both the UI and JSON import. Cylinder geometry providers expose bore/stroke/rod/compression relationships and derived SI volume; changing engine family disables unrelated fields before an invalid configuration is applied. See [22](22-guided-vehicle-configurator.md).

Where applicable, each component also registers **reference fidelity options** and numerical solver providers with separate Quick/Balanced/Detailed/Research capability statuses, per-component discretization parameters, stability/units/geometry requirements and resource estimates. A cylinder module may offer 0D/two-zone/multi-zone gas + segmented wall thermal models; runner/exhaust providers may offer 0D/1D flow and wall thermal layers. These are offline training-only interfaces; the real-time AudioWorklet uses compact source/state coefficients and cannot allocate per-zone research arrays. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).

## Configuration and compatibility

- A `VehicleDefinition` declares engine assembly, cylinder banks, induction graph, fuel system, control strategy, auxiliaries, driveline graph, wheel/tire definitions, sound model map and visual projection.
- A capability manifest declares supported engine cycle/combustion system, transmission/driveline compatibility, model accuracy tier (`implemented`, `approximate`, `planned`), required state fields and available audio sources.
- Compose options (e.g. carbureted V8, twin turbo with intercooler and AWD manual) via configurable graphs, not `if (engineType === ...)` chains. Reject physically incompatible topologies and dependencies with specific errors.
- Use explicit versioned migrations, units and physically bounded parameters, with import/export that preserves unknown optional extensions where safe without executing user code.
- Different engine generations may use different equation fidelity and controllers; do not force diesel, rotary, two-stroke, EV, hybrid and pre-ECU carburetor into an inappropriate spark-ignition four-stroke model.

## Suggested file ownership

```text
src/contracts/    # versioned schemas/types for events, ports, components, presets, mix
src/core/         # clock/time scaling, solvers, conservation, typed event bus
src/diagnostics/  # per-component instrumentation, record/import/replay/comparison/plots
src/approximations/# shared fast equations/maps, validity domains and fallbacks
src/ui-shell/     # multi-route navigation and hideable/movable debug widgets
src/experiments/  # batch scenarios, one-part/preset studies, full manifests
src/engines/      # engine families, bank/crank geometry, combustion-specific models
src/controls/     # mechanical governors, carb/ignition, ECU and hybrid controllers
src/intake/       # filters, throttles, manifolds, compressors/intercoolers
src/exhaust/      # manifolds, turbines, aftertreatment, thermal/afterfire
src/electrical/   # battery, starter, alternator, accessories
src/driveline/    # clutch, converters, gearboxes, transfer case, axles, tires
src/audio/        # source registry, mixer, worklet adapters, DSP kernels
src/visualization/# 2D/3D with a shared read-only cylinder/port projection
src/scenarios/    # command/event test programs and scenario catalogs
src/training/     # reference solver, optimization and compatibility/quality gates
src/reference/    # multi-fidelity solvers for zones, wall conduction, 1D gas flow and convergence
src/configurator/ # wizard steps, conditional fields, derived geometry and validation
```

Do not create classes just to wrap one formula; pure functions for piston geometry, thermodynamic approximations, unit conversion, filters and component losses are appropriate.

## Generic solver first, high-fidelity compatibility built in

- Implement a fast, conservation-aware physically meaningful generic model before high-fidelity training. Baseline formulas work without learned coefficients.
- Every numerical function has explicit SI inputs/outputs, state/step dependencies, model version, compatible physical use cases, operating bounds, editable calibration parameters and safe fallback conditions.
- Multiple components may bind to an identical `ApproximationFamily` equation/map when *the equation's physical validity contract* matches both; it must not merge distinct component identity, geometry or other source data.
- A high-fidelity reference implementation of the same component can add pressure/temperature spatial zones and wall meshes without violating shared ports, control semantics, event/cylinder ordering and solver authority.
- The simulation clock/time-scale mapping, diagnostics collection and portability of recorded traces are **core unit/integration test requirements** before starting M1.

## Implementation gates

- [ ] A new engine layout, controller strategy, induction element or gearbox can be registered without changes to unrelated simulation/audio/visual modules.
- [ ] All connected ports pass dimension/unit and topology validation; incompatible configurations fail explicitly.
- [ ] Wheel/auxiliary loads affect engine speed through the coupled solver; every energy source and loss is accounted for.
- [ ] A simulated engine without an ECU operates with an explicitly selected mechanical/manual controller.
- [ ] 2D/3D views and mixer introspection derive bank and audio stems from registries rather than hard-coded cylinder IDs.
- [ ] A deterministic headless test can run a newly registered component using the same event and state schemas.
- [ ] Each technology declares honest support status, coverage and model accuracy; a preset cannot silently substitute a gasoline four-stroke when the selected engine is diesel/EV/rotary.

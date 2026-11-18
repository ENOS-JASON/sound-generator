# 09 — Versioned data contracts

## O3-approved contract constraints (interfaces to freeze in M0, not implemented code)

- `HardwareCapabilities` / `ReferenceBackendManifest` describe CPU model/threads, GPU name/compute capability, driver/toolkit, Windows/Linux, numerical precision, CUDA kernel target and **CPU fallback reason**. **Required GTX1080 Pascal `sm_61` / CUDA12.x build path** is independently versioned from any modern CUDA13 build; do not require compute capability `>=7.5` for mandatory provider compatibility.
- `BenchmarkManifest` distinguishes **primary owner i9-10th-gen/GTX1080 development/compatibility machine** versus the **proposed mid-range FPS reference desktop awaiting owner approval**. Include actual browser/OS versions, scene, resolution/DPR, test window, frame-time percentiles, audio clock misses and sim determinism.
- `WorkspaceState` autosaves configurations, mixer, expert gain-calibration source revision, widgets, scenario drafts and **bounded recent diagnostic summaries** with **configurable bounded snapshot history** (count/age/bytes), transaction/previous-good references and secure ZIP import/export. Never claim unbounded audio/research autosave.
- `SourceCalibrationProfile` expert editable values are **gain trims (dB) only**, calibrated conditions, version/undo; no freeform EQ/spectral/DSP editing or credential-backed expert role. `ListeningPerspective` remains independent of `VisualCamera` and of solver state.
- `LocalStudyControl` is CLI-launched **loopback-only HTTP** with typed job IDs/commands, progress/logs, origin/CSRF and process-safe permission checks, not remote/public. `ResearchExportAdapter` exposes ZIP now and Parquet/HDF5 capability fields only after an evidence-based format decision.
- `AiIntegratorPolicy` stores verified reviewer identity/least privileges, owner-approved rule version, actual check/job/PR SHA, **conditional routine merge** eligibility, merge action/report commit and owner escalation for shared public TypeScript contracts/APIs/ownership changes. No audit field should claim merge succeeded without host action.
- `ReferenceMeasurementProvenance` distinguishes user-owned imports from **candidate bundled references** with actual redistribution/attribution license evidence and owner approval *before bundling*. Real recordings cannot become audio sources.

**Status:** proposed TypeScript/JSON contracts only until implemented/frozen/tested by owning agents. [O3 owner decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md); [verification IDs](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).


## Round 3 versioned interfaces (design targets, not implemented API)

- `InitialVehicleExamples` declares two **valid editable I4** vehicle/controller graphs; `factoryDefaultVehicleId` points to the mechanical carburetor/no-ECU preset **only when no valid saved user choice exists**. Explicitly distinguish `factoryDefault` from `currentWorkspaceSelectedVehicleId`.
- `WorkspaceSnapshot` / `WorkspaceStore` uses versioned **IndexedDB** local persistence and migration transactions for vehicle/controller, scenario drafts, user mix, calibration trim *references*, selected listener and widgets. Snapshot export/import is optional **ZIP**, distinct from trace bundles; include record/version hashes and safe recovery. Avoid unlimited deep trace autosave.
- `SourceCalibrationProfile`: `sourceId`, `schemaVersion`, `revisionId`, nominal reference physical condition, units, trim `gainDb`, range/headroom, provenance and safe activation; strictly separate from `UserMixProfile` and `VehicleDefinition`.
- `ListeningPerspective`: `cabin | engine-bay | roadside | exhaust` plus versioned source-transfer/filter metadata, active mode trace, independent of renderer camera and physical solver.
- `MeasurementReferenceCatalog`: origins `user-import` / `bundled-redistribution-verified`, source/license/consent/attribution/conditions/confidence; **reference recordings analyzed as features only, with no audio playback**. Bundled content excluded unless redistribution permission is proven.
- `LocalStudyControl`: CLI job IDs, state enum, sim-time progress, backend/resource telemetry, errors, versioned checkpoint/pause/cancel/resume, local GUI client; no remote queue required.
- `AgentReviewReport`: work-order/PR ID, CI test evidence, contract/gate/licensing checks, findings, requested changes, escalation category and owner decision reference; no implied autonomous merge rights.
See [Round 3 approvals](decisions/USER-APPROVED-ROUND-03.md). Interfaces are **proposed**, require accepted ADRs/fixtures and tests before asserting feasibility.


## Round 2 — Approved schema constraints (not final generated code)

- **First I4 engine:** `VehicleDefinition` must represent *either* `ControlStrategy.kind='mechanical'` with carburetor/distributor and **no ECU** *or* an `ecu` + EFI injection/spark strategy as **two separately valid and runnable alternatives**. Shared engine geometry, starter, manual clutch/transmission and vehicle load contracts must not change ownership when switching. Reject an engine with both exclusive strategies active or with ECU maps attached to mechanical-only mode.
- **Capture:** `CaptureBundle` browser interchange must be a **ZIP** containing a **versioned JSON manifest**, commands, domain/diagnostic events, typed chunked telemetry, checksums, source/units/time-scale/controller hashes and optional **synthesized-output audio**. Define exact filenames/codec/size in ADR-006; never interpret illustrative JSON here as a finalized ZIP codec.
- **Research:** Parquet/HDF5 are optional **offline** export adapters using the same time and component/units/provenance definitions; neither is mandatory for the browser to import a base ZIP.
- **Reference measurements:** store ownership/license, measurement context, environmental/load/RPM/microphone conditions, quality and uncertainty separately from numerical solver data. Real-world audio recordings are **analysis/validation inputs only**, not a playback source or stem.
- **Platform metadata:** include Windows/Linux CPU/GPU/precision/driver/reproducibility information in reference jobs where applicable; client capability metadata records desktop Chromium/Firefox/Safari and 2D/WebGL fallback. Hash-route URL is a UI concern, not part of physical `VehicleDefinition`.
See [Round 2 owner approvals](decisions/USER-APPROVED-ROUND-02.md), [30](30-agent-handoff-contracts-and-decisions.md) and [25](25-core-diagnostics-recording-and-comparison.md).


Use explicit JSON schema validation at every import and an internal strongly-typed TypeScript representation. SI units internally, labelled UX conversions at boundary. The following are design examples, not yet implemented.

## EnginePreset (v1)
```json
{
  "schemaVersion": 1,
  "id": "i4-2l-demo",
  "engine": {
    "cycle": "four-stroke",
    "layout": "inline",
    "cylinders": 4,
    "displacementM3": 0.002,
    "firingOrder": [1,3,4,2],
    "inertiaKgM2": 0.18,
    "idleTargetRpm": 850,
    "revLimitRpm": 6700,
    "limiterHysteresisRpm": 250
  },
  "starter": {"batteryNominalVolts": 12, "maxTorqueNm": 120},
  "audio": {"masterGain": 0.5, "modelId": "procedural-v1"},
  "trainingProfile": null
}
```
The numbers are illustrative tuning values, not validated engineering measurements. The minimal v1 sketch above is **not sufficient for the expanded technology scope**; use the composable v2-style vehicle definition below as the architecture target. Add per-cylinder crank-angle offsets, cam/valve configuration, detailed ECU, drivetrain, thermal, environment and acoustic parameters behind compatible subobjects. Define schema migration policy.

## Composable VehicleDefinition / ComponentManifest (proposed v2)

A `VehicleDefinition` references **registered component instances and connected typed physical ports**, preserving configuration and fidelity per subsystem. An illustrative shape (not yet a finalized executable schema):

```json
{
  "schemaVersion": 2,
  "id": "example-manual-v8-4x4",
  "engine": {
    "family": "spark-four-stroke",
    "banks": [
      {"id": "bank-a", "angleDegrees": -45, "cylinders": [1,3,5,7]},
      {"id": "bank-b", "angleDegrees": 45, "cylinders": [2,4,6,8]}
    ],
    "crankshaft": {"model": "cross-plane", "firingOrder": [1,8,4,3,6,5,7,2]}
  },
  "control": {"kind": "ecu", "tuneProfileId": "stock-demo"},
  "electrical": {"batteryProfileId": "healthy-12v", "starterProfileId": "standard"},
  "induction": {
    "components": [{"id":"filter","kind":"filter"},{"id":"throttle","kind":"throttle"},{"id":"plenum","kind":"plenum"}],
    "connections": [{"from":"filter.out","to":"throttle.in"},{"from":"throttle.out","to":"plenum.in"}]
  },
  "transmission": {"kind": "manual", "gearboxProfileId": "six-speed"},
  "driveline": {"layout": "part-time-4wd", "transferCaseProfileId": "2h-4h-4l", "differentialIds": ["front-open","rear-open"]},
  "audioMixProfileId": "factory-calibrated",
  "modelSupport": {"status": "approximate"}
}
```

**This example omits many required ports, ratios and physical parameters**; it is a structural guide, not a ready-to-run preset. Firing order and geometry must be validated against the exact crank/pin/bank topology rather than accepted from arbitrary array values. A real schema includes explicit `components[]` with unique IDs, capability manifests, `portConnections[]` with unit and direction checks, fuel/exhaust/thermal graphs, wheel/road settings, controller maps and per-component validation status. In a no-ECU preset, `control.kind = 'mechanical'` and incompatible ECU maps are absent or rejected. Do not encode 4x4 behavior from the label alone: transfer/diff/coupling topology determines actual torque flow.

## Quantities, capability and performance records

- `CylinderBank`: ID, bank geometry/orientation, ordered cylinder IDs, crank throw/phase, rods/pistons, valve/cam profiles, intake runner and collector connections. Support 1–12 piston cylinders and validated inline/V/flat arrangements.
- `IntakeGraph`/`InductionComponent`: air, fuel, electrical/shaft and exhaust connections for airbox/ITB/turbo/supercharger/intercooler/wastegate/bypass with pressure/temperature/mass-flow and map version.
- `ControlStrategy`: `mechanical`, `early-electronic`, `ecu`, `aftermarket`, `hybrid-supervisor` (when implemented); axes, map units, sensor, actuator and tune applicability.
- `ElectricalHealth`: SoC, resistance, voltage/current, temperature/aging, starter brush/solenoid/gear condition and alternator/auxiliary load.
- `TransmissionModel`/`DriveLayout`: clutch/converter/DCT/CVT/eCVT family, gear ratios/shift logic, transfer case 2H/4H/4L, per-diff properties, driven axles, wheel inertia and slip.
- `ComponentManifest`: stable ID/type/schema version, implemented/approximate/planned status, supported configuration range, physical port kinds, model accuracy constraints and expected scenario tests.
- `TorquePowerSnapshot`: time, engine RPM/angle, cylinder indicated torque, net brake crank torque, shaft/wheel/traction torque and power, accessory and compressor loads, transmission and tire losses, uncertainty and measurement mode; display mechanical hp/metric PS as explicit conversion options.
- Separate `AudioSourceRegistry`/`MixProfile` and `EngineVisualProjection` reference these component IDs but cannot mutate their physical states.

See [14](14-modular-typescript-platform.md), [15](15-engine-families-and-presets.md), [16](16-intake-induction-and-exhaust.md), [17](17-transmissions-drivetrains-and-wheels.md), [18](18-electrical-control-generations-and-tunes.md) and [20](20-torque-power-load-and-energy.md).

## Independently selectable display units for each statistic (owner-approved requirement)

The owner requires **simultaneously mixed metric and imperial display units** (see [2026-11-18 decision](decisions/USER-APPROVED-PER-STAT-DISPLAY-UNITS-2026-11-18.md)). Internally, every physical state, solver input, validation limit, port, trace and vehicle preset remains SI. A UI unit change must **never** mutate authoritative physics, trained-model inputs, vehicle hashes or the event sequence.

- Define a separately versioned `DisplayUnitPreferences` user/workspace setting with **default unit IDs per physical quantity** and **optional unit overrides per stable statistic/field/telemetry channel ID**. Precedence: per-metric override > quantity default > documented fallback. Two pressures (e.g., boost and oil) must be able to display different units simultaneously. "Metric"/"US" quick presets may populate defaults but cannot lock all quantities to one system.
- Registry metadata declares each quantity dimension, canonical SI unit, allowed display units, exact conversion functions, significant-figure/rounding guidance, and pressure basis (gauge vs absolute) where relevant. Fields and telemetry channels reference the same registry. Unknown IDs, incompatible dimensions and nonfinite conversions fail validation; display precision is not used to change stored values.
- Minimum unit families to support as capabilities mature: **power** W/kW/mechanical hp/PS; **torque** N·m/lb-ft/lb-in; **pressure** Pa/kPa/bar/psi with inHg for applicable vacuum channels; **temperature** K/°C/°F; **speed** m/s/km/h/mph; **distance** m/km/mi; **length** mm/cm/m/in/ft; **displacement** cc/L/cu in; **mass** kg/lb; **force** N/lbf; **airflow** kg/s/g/s/lb/min; **energy** J/kJ/kWh; **fuel volume** L/US gal/Imperial gal; **fuel economy** L/100 km/US mpg/Imperial mpg with correct inverse conversion. Unit-less fractions remain unit-less. Distinguish mechanical hp vs PS, US vs Imperial gallons, and gauge vs absolute pressure (requires a declared ambient reference to change basis).
- Numeric inputs may be displayed/edited in the selected unit but are normalized and validated as SI at the input boundary. Display unit preferences are **not** properties of `VehicleDefinition`; store/restore them with versioned IndexedDB workspace state and optional ZIP workspace snapshot. Trace/measurement exports remain SI with unambiguous unit metadata; optional human-readable exports may include separate display-unit annotations.
- Required tests: independent switching of power/torque/pressure, two pressure channel overrides, SI roundtrip without drifting, correct gauge/absolute semantics, persistence/migration/invalid-unit fallback and unchanged physics/events/hashes.

## Geometry, wizard and fidelity contracts (new requirements)

**Engine geometry:** the active cylinder family exposes SI `boreMeters`, `strokeMeters`, optional per-cylinder geometry, connecting-rod length, crank radius/stroke consistency, clearance and compression data. For equal cylinders, `displacementTotalM3 = (pi / 4) * boreMeters^2 * strokeMeters * cylinderCount`; this is a **derived** quantity rather than an independently editable and inconsistent value. Per-cylinder uneven geometry uses a sum. Validate all values, chamber geometry and layout from the same registry; see [22](22-guided-vehicle-configurator.md).

**Wizard:** versioned `ConfiguratorStepDefinition` and `FieldDefinition` map physical/component capabilities to step applicability, `visibleWhen`, `enabledWhen`, `requiredWhen`, allowed options and constraints, defaults, display units and derived values. The predicates/derivation functions are trusted **TypeScript code**, not imported executable JSON. Preset JSON and wizard use the **same** validators. A draft may be incomplete but is not runnable until global graph validation succeeds. Changing upstream components yields a preview of invalidated downstream fields and reversible updates.

**ReferenceFidelityProfile:** versioned profile with `preset: quick|balanced|detailed|research`, global max simulation timestep, max crank-angle step, adaptive scheme, CFL/tolerances/output interval/memory and run budget, plus per-`componentId` solver selections and discretization. Depending on installed component capabilities, fields include cylinder burned/unburned or gas zone counts; liner axial bands/radial layers; piston crown/head thermal layers; intake/exhaust axial gas cells and wall metal layers; optional valve/port flow resolution. Each declares material/geometry independently of zone counts. Never put mesh arrays in a real-time mix preset.

**ReferenceRunManifest:** input vehicle graph hash, fidelity profile hash, active solver versions, numerical scheme/time grid, zone topology, scenario/seed hashes, physical-unit map, conservation/CFL reports, mesh/time-step convergence, resource use, failed-run reasons and license metadata. Training artifact embeds source manifest hashes and compatibility domain, not raw reference state.

See [21 — Adjustable reference fidelity](21-adjustable-fidelity-multizone-reference-simulation.md).

## Clock/time scaling, diagnostics, recorder and experiment contracts

**SimulationClock / TimeControl:** `simulationTick`, `simulationTimeSeconds`, `crankAngleRadians`, `audioSampleFrame`, `playbackScale` and paused state. `setTimeScale`, `pause`, `resume` and bounded `stepTicks/stepToCrankAngle/stepUntilEvent` go through a versioned control command envelope. Record both simulation ticks and audio frame mapping; time scale never changes physics equations. See [24](24-simulation-clock-and-time-scaling.md).

**TelemetryChannelDefinition:** stable `componentId.channelId`, physical meaning, SI unit and display unit, numeric type, availability/capability, source clock, sample interval, bounds, privacy/performance class, aggregation/downsampling policy, instrument version. `DiagnosticEvent` is separate from authoritative domain events; unexpected channel gaps must be recorded.

**CaptureManifest / CaptureBundle:** versioned run/vehicle/component graph and full parameter hashes, fast/reference solver and DSP version, trained profile, scenario inputs, seeds, time-scale map, channel catalog, events/causation, physics traces, optional master/per-source audio chunks, output sample rate, numerical tolerances, capture drop counts, integrity hashes and explicit `complete/incomplete` status. Accept bounded local files and validate before import; replay mode is `telemetryPlayback | deterministicResimulation | recordedAudioPlayback`. See [25](25-core-diagnostics-recording-and-comparison.md).

**ExperimentDefinition / VariationSet:** immutable baseline component graph/parameter manifest; controlled `componentId.parameterPath` variants (one-part or named part-set), scenarios, input schedule, initial conditions, replication counts and seed policy, reference fidelity and zone mesh settings, worker CPU/memory/disk limits, capture detail, output comparison metrics and exact changed-part audit trail. A study produces run manifests with `baselineRunId`, `variantId`, realized graph diff and per-component physics/audio effects. See [27](27-high-fidelity-experiment-orchestration.md).

**FastModelFamily / ComponentModelBinding:** stable versioned `familyId`, equation/kernel implementation ID, physical input/output names/units/validity domain/bounds, analytic baseline, trainable coefficient/lookup/spline/reduced-order data reference, component ID and calibration hash, fallback on unsupported/uncertain inputs. A reference high-fidelity solver **projects** its internal zone fields onto these common boundary units; a trained profile maps to existing bindings without executing imported code. Multiple components can share the **same** validated kernel/lookup data when physically compatible. See [28](28-shared-realtime-surrogates-and-calibration.md).

## EngineState and event
`EngineState`: `simulationTimeSeconds`, `crankAngleRadians` (unwrapped), `angularVelocityRadPerSecond`, `state`, `batteryVolts`, `manifoldPressurePa`, `coolantTemperatureK`, `throttle`, `cylinderCombustion[]`, `wheelAngularSpeed[]`, `vehicleSpeedMps`, diagnostics. `EngineEvent`: `id` monotonic, `simulationTimeSeconds`, optional `sampleIndex`, `type`, `cause`, `cylinderIndex`, `payload`. Event types include KEY_ON, STARTER_ENGAGED, COMBUSTION, FIRST_FIRE, ENGINE_RUNNING, FAILED_START, LIMITER_ENTER, LIMITER_EXIT, FUEL_CUT_ENTER, FUEL_CUT_EXIT, AFTERFIRE, GEAR_CHANGED, SLIP_ENTER, SLIP_EXIT, ENGINE_STALLED and ENGINE_OFF.

## Command / event envelope and ownership

**Required design:** [11 — Shared Event Bus and Messaging](11-event-bus-and-messaging.md). One `EventMap` and `CommandMap` provides discriminated payload types and boundary validators. A domain event envelope includes `schemaVersion`, `runId`, monotonically increasing `sequence`, integer `simulationTick`, `simulationTimeSeconds`, optional `sampleFrame` and `crankAngleRadians`, `type`, `source`, `causationId`, `correlationId` and typed immutable `payload`. A command envelope includes a unique `commandId`, target tick/frame and origin; command applied/rejected acknowledgements are distinct from physical events. State snapshots and diagnostics have separate types. AudioWorklet, UI, Workers, headless scenarios and training all use these same logical contracts while transporting data through appropriate local/port adapters. Critical sequence gaps must be detected, not silently ignored.

## Scenario
`Scenario`: `schemaVersion`, `id`, `seed`, `initial` (preset id/hash and startup state), ordered `steps`, `assertions`. Each `step` has `id`, `actions` (timestamped control patch or curve), `until` gate, `timeoutSimSeconds`, `onTimeout` and optional `maxRetries`/`branchTarget`. Gates: `elapsed`, `atTime`, `event`, `condition`, `all`, `any` and `sequence`. Conditions must allow field comparisons, bounds and `holdSeconds`. Require positive timeout, bounded branch graph and max global step count. Gate event observations default to events after entry. Keep simulation-time and wall-clock watchdog separate.

## Trace
Immutable run metadata: solver version, DSP version, schema version, seed, preset hash, trained profile hash, timestep, audio sample rate, environment, actions and state/event snapshots. Timestamps are simulation seconds; sample indices for audio anchor. Trace includes failures and diagnostics.

## Unified validation at boundaries

Every entry point (wizard, JSON import, scenario runner, worker/CLI reference solver, real-time profile activation) must call the same capability/topology/range validation before marking a vehicle/preset or fidelity profile usable. Rendering may hide inapplicable settings, but cannot relax physics constraints. `implemented/approximate/planned` capability status is explicit. Persist resolved default values, active component IDs and dependency revisions for reproducible training; changing engine geometry or system topology invalidates incompatible trained coefficient hashes.

## TrainedProfile
`schemaVersion`, `id`, `compatibleSolverRange`, `trainingManifestHash`, `fitParameters`, `lookupTables`, `domainBounds`, `referenceSolverVersion`, `trainSetHash`, `holdoutSetHash`, `metricSummary`, `limitations`. Prefer inspectable coefficients. Validate bounds, finite numbers, table sizes and provenance before load. Fall back to deterministic baseline on incompatibility.

## Physical connection and migration rules

A component may be registered only if its schema, relevant typed ports, state ownership, bounded physical behavior, event mapping, source/stem availability and verification scenarios are known. Reject missing power/mass connections, impossible controller/engine combinations, nonsensical cylinder/valve order or contradictory coupled gear constraints. Preset imports must distinguish **configuration exists** from **model is implemented**; unknown component families cannot silently resolve to a generic gasoline engine. Existing v1 presets require a versioned, tested conversion into a simpler v2 topology with explicit defaults, not ad hoc field inference. All trained models include the graph manifest hash and are validated against component compatibility.

## Numeric, validation and portability rules
- SI unit names in identifiers, dimensionless fractions in [0,1], cylinder order validated as a permutation; omit ambiguous `rpm` fields from internal state except telemetry views.
- Separate semantic engine events from DSP impulses; both carry the mechanical causal event id if linked.
- Version every exported object; reject unknown major versions, migrate supported older schemas.
- JSON files cannot contain functions, expressions or arbitrary code. Normalize float tolerances for cross-browser deterministic comparisons.
- Never allow training profile to modify invariant enforcement or mutate the scenario truth/reference tests.

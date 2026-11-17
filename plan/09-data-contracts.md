# 09 — Versioned data contracts

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
The numbers are illustrative tuning values, not validated engineering measurements. Add per-cylinder crank-angle offsets, cam/valve configuration, detailed ECU, drivetrain, thermal, environment and acoustic parameters behind compatible subobjects. Define schema migration policy.

## EngineState and event
`EngineState`: `simulationTimeSeconds`, `crankAngleRadians` (unwrapped), `angularVelocityRadPerSecond`, `state`, `batteryVolts`, `manifoldPressurePa`, `coolantTemperatureK`, `throttle`, `cylinderCombustion[]`, `wheelAngularSpeed[]`, `vehicleSpeedMps`, diagnostics. `EngineEvent`: `id` monotonic, `simulationTimeSeconds`, optional `sampleIndex`, `type`, `cause`, `cylinderIndex`, `payload`. Event types include KEY_ON, STARTER_ENGAGED, COMBUSTION, FIRST_FIRE, ENGINE_RUNNING, FAILED_START, LIMITER_ENTER, LIMITER_EXIT, FUEL_CUT_ENTER, FUEL_CUT_EXIT, AFTERFIRE, GEAR_CHANGED, SLIP_ENTER, SLIP_EXIT, ENGINE_STALLED and ENGINE_OFF.

## Command / event envelope and ownership

**Required design:** [11 — Shared Event Bus and Messaging](11-event-bus-and-messaging.md). One `EventMap` and `CommandMap` provides discriminated payload types and boundary validators. A domain event envelope includes `schemaVersion`, `runId`, monotonically increasing `sequence`, integer `simulationTick`, `simulationTimeSeconds`, optional `sampleFrame` and `crankAngleRadians`, `type`, `source`, `causationId`, `correlationId` and typed immutable `payload`. A command envelope includes a unique `commandId`, target tick/frame and origin; command applied/rejected acknowledgements are distinct from physical events. State snapshots and diagnostics have separate types. AudioWorklet, UI, Workers, headless scenarios and training all use these same logical contracts while transporting data through appropriate local/port adapters. Critical sequence gaps must be detected, not silently ignored.

## Scenario
`Scenario`: `schemaVersion`, `id`, `seed`, `initial` (preset id/hash and startup state), ordered `steps`, `assertions`. Each `step` has `id`, `actions` (timestamped control patch or curve), `until` gate, `timeoutSimSeconds`, `onTimeout` and optional `maxRetries`/`branchTarget`. Gates: `elapsed`, `atTime`, `event`, `condition`, `all`, `any` and `sequence`. Conditions must allow field comparisons, bounds and `holdSeconds`. Require positive timeout, bounded branch graph and max global step count. Gate event observations default to events after entry. Keep simulation-time and wall-clock watchdog separate.

## Trace
Immutable run metadata: solver version, DSP version, schema version, seed, preset hash, trained profile hash, timestep, audio sample rate, environment, actions and state/event snapshots. Timestamps are simulation seconds; sample indices for audio anchor. Trace includes failures and diagnostics.

## TrainedProfile
`schemaVersion`, `id`, `compatibleSolverRange`, `trainingManifestHash`, `fitParameters`, `lookupTables`, `domainBounds`, `referenceSolverVersion`, `trainSetHash`, `holdoutSetHash`, `metricSummary`, `limitations`. Prefer inspectable coefficients. Validate bounds, finite numbers, table sizes and provenance before load. Fall back to deterministic baseline on incompatibility.

## Numeric, validation and portability rules
- SI unit names in identifiers, dimensionless fractions in [0,1], cylinder order validated as a permutation; omit ambiguous `rpm` fields from internal state except telemetry views.
- Separate semantic engine events from DSP impulses; both carry the mechanical causal event id if linked.
- Version every exported object; reject unknown major versions, migrate supported older schemas.
- JSON files cannot contain functions, expressions or arbitrary code. Normalize float tolerances for cross-browser deterministic comparisons.
- Never allow training profile to modify invariant enforcement or mutate the scenario truth/reference tests.

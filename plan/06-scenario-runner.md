# 06 — Deterministic scenario execution and gates

## Principle
A scenario is a finite-state test program executed against **simulation time**, not UI animation timing. Actions can be continuous (throttle curves) or discrete (key/start/gear/clutch). Advance to the next step only when its declared gate succeeds; every gate has a finite timeout and failure action. A timestamp does not replace verification of state transitions.

## Shared event bus integration

The runner consumes the **authoritative ordered event stream** defined in [11 — Shared Event Bus](11-event-bus-and-messaging.md), not visual notifications or audio approximations. Each step captures the current event sequence as an entry watermark; an `event` gate normally matches only events with a greater sequence from the same `runId`. Condition gates query authoritative state snapshots at deterministic solver ticks, not throttled 3D telemetry. A sequence gap or critical event queue overflow invalidates the scenario rather than producing a false pass. UI and headless runners use the same gate evaluator and event contracts; commands are scheduled into the same input queue used for live play.

## Gate types
- `elapsed`: simulation duration since step entered.
- `atTime`: absolute scenario-time threshold.
- `event`: typed named event emitted **after** step entry (or explicit event-history lookback), matching payload fields and minimum count.
- `condition`: predicate over engine state, e.g. RPM between bounds for a sustained duration, battery below threshold, cylinder firing count.
- `all` / `any`: composable gates. `sequence` for ordered observations when necessary.
- Each step includes `timeoutSimSeconds`, `onTimeout: fail | branch | retry`, `maxRetries` with bounded limit, and optional expected absence of events during an interval.
- Assertions may run continuously, on step exit or at scenario end. Branch decisions and terminal cause are recorded.

## Example (illustrative)
```json
{
  "schemaVersion": 1,
  "id": "cold-start-to-limiter",
  "seed": 1207,
  "initial": { "preset": "inline-four-cold", "engineState": "OFF" },
  "steps": [
    { "id": "key-on", "actions": [{"set": "ignition", "value": true}], "until": {"event": "KEY_ON"}, "timeoutSimSeconds": 0.5 },
    { "id": "crank", "actions": [{"set": "starter", "value": true}], "until": {"all": [{"event": "ENGINE_RUNNING"}, {"condition": {"field": "rpm", "gte": 650, "holdSeconds": 0.3}}]}, "timeoutSimSeconds": 8, "onTimeout": "fail" },
    { "id": "release", "actions": [{"set": "starter", "value": false}, {"set": "throttle", "value": 0.65}], "until": {"event": "LIMITER_ENTER"}, "timeoutSimSeconds": 15 },
    { "id": "cut-throttle", "actions": [{"set": "throttle", "value": 0}], "until": {"event": "LIMITER_EXIT"}, "timeoutSimSeconds": 4 },
    { "id": "stop", "actions": [{"set": "ignition", "value": false}], "until": {"event": "ENGINE_OFF"}, "timeoutSimSeconds": 8 }
  ]
}
```
Actual schema must align with [09](09-data-contracts.md); event condition holding across steps must be defined unambiguously. The example's throttle/load preset must be capable of reaching limiter; otherwise expect a scenario failure, not forced success.

## Lifecycle and clock policy
Initialize seed/preset and reset solver; apply on-enter actions exactly once; evaluate gate against subsequent monotonically indexed event/state snapshots; take fixed simulation steps; fail if timeout reached, guard fails, simulation becomes non-finite or step budget exceeded. Timeout always uses simulation seconds, never wall-clock alone. A separate wall-clock watchdog catches deadlocked workers. A scenario can run accelerated offline or in real time with equivalent state transitions within tolerance.

## Technology and failure scenario coverage

Build a registered, capability-aware scenario catalog per [19](19-scenario-coverage-and-presets.md): healthy and low-battery starts; high internal battery resistance, worn/stuck starter and solenoid; mechanical-carb/distributor (no ECU) vs editable ECU; mild/aggressive pop-and-bang tune with physical prerequisite and negative-control checks; naturally aspirated vs ITB/parallel/compound turbo/supercharger configurations; 1–12 cylinder inline/V/flat; clutch/gear torque, automatic/DCT/CVT behavior, AWD/part-time 4WD 2H/4H/4L transfer and differential locks; hill, brakes, traction loss and engine stall; crank and wheel torque/hp/energy accounting. A newly registered component must declare relevant scenarios; supported combinations failing required tests block shipping. Not-yet-implemented families remain explicit unimplemented items rather than false passes.

## Additional required scenarios
Normal warm start, battery low, crank with fuel disabled, repeated short crank attempts, stall under excessive load, restart after stall, hot-start, partial fire then die, key-off coasting, limiter sustained release/re-entry, limiter spark vs fuel cut, 2-step launch, aggressive throttle transitions, decel/overrun afterfire, clutch-in free rev, loaded gear shift and downshift, traction and burnout, browser pause/resume. Assertions verify **absence** of impossible events as well as presence of expected ones.

## Physical invariants during every scenario

At each fixed simulation tick or bounded diagnostic sampling interval, assert finite unit-consistent torque/power, connected port conservation residuals and physically bounded temperature/mass flows, correct crank/gear ratio when locked, correct wheel traction and no unauthorized power from disconnected components. Capture per-source audio event correlation, mixer output and view switching side effects. Engine transitions (crank, run, stall, cutoff) and afterfire gates are confirmed by authoritative events and state, never presumed from passage of time alone.

## Reports
Per-step status, entered/exited sim times, observed gate and event ids, timeout/branch reason, assertions, RPM/torque/pulse trace, model hash, seed and comparison metrics; JSON plus human-readable report. Scenario authoring UI and headless CLI use the same schema and engine code.

# 11 — Shared Event Bus and Cross-Module Messaging

**Status: design requirement. This is a required foundation, not an optional post-MVP enhancement.**

## Requirement

Every subsystem must communicate through one **logical, strongly typed, deterministic event and command architecture**. Engine physics owns the authoritative state and domain event stream; sound, 3D, ECU, drivetrain, scenarios, telemetry and training consume consistent events or snapshots. No UI component, audio renderer or effect may invent a physics transition.

**Important browser distinction:** the main thread, Web Workers and AudioWorklet are separate JavaScript realms. A singleton JavaScript event emitter cannot literally be shared across them. The design provides **one canonical logical event stream** plus local in-realm dispatchers and explicit bounded transports (`MessagePort` / `AudioWorkletNode.port`; optional shared memory only after cross-origin-isolation validation). This preserves consistency without assuming shared memory on GitHub Pages.

## Message categories and authority

| Category | Producer | Consumer | Semantics |
|---|---|---|---|
| **Commands / intents** | UI, scenario runner, automation | Input command router / engine | Requests: key, starter, throttle, clutch, shift, brake, reset, tune |
| **Authoritative domain events** | Engine and drivetrain solver only | Audio DSP, event recorder, scenario gates, UI projections | Facts: STARTER_ENGAGED, COMBUSTION, ENGINE_RUNNING, LIMITER_ENTER, ENGINE_STALLED, etc. |
| **Continuous state snapshots** | Engine solver | Renderer, dashboards, recorder and diagnostics | RPM, phase, torque, pressures, per-cylinder/wheel states; not one event per property update |
| **Audio/sound cues** | Local mapping of domain events + crank phase | DSP only | Phase-aligned excitation and transients; never changes engine truth |
| **Diagnostics / lifecycle** | All system components | Inspector, logger, tests | Underrun, late command, queue overflow, unsupported feature, worker readiness |
| **Training/benchmark results** | Offline runner / trainer | Training UI, artifact validator | Separate namespace; cannot mutate live physics until explicit validated profile activation |

Do not conflate a `THROTTLE_SET` command with proof the throttle applied, nor `ENGINE_START_REQUESTED` with `ENGINE_RUNNING`. Commands receive accepted/rejected/applied acknowledgements with timestamps and reason.

## Logical topology

```text
UI / Scenario / Automation
    |
    v
Command Router --> validate + stamp target simulation tick/sample frame
    |
    v
Authoritative Engine Runtime (one owner per simulation instance)
  [deterministic command queue]
           |
     apply at tick boundary
           |
  [physics / ECU / cylinders / starter / drivetrain]
           |
  [typed event collector with total-order sequence IDs]
           |
      +----+-----------------------+
      |                            |
      v                            v
  local DSP event/phase feed     batched outbound mirror
  (no blocking/allocations)       via MessagePort
      |                            |
      v                    +-------+---------+
  AudioWorklet output      |       |         |
                        UI/3D   scenarios   trace/metrics
                          (state snapshots + selected event edges)

Offline/headless solver uses the SAME command, event and clock contracts,
with a synchronous local dispatcher; no browser port is necessary.
```

The actual fast engine may live inside AudioWorklet, or in a Worker if transport benchmarks justify it. Either way, **the authoritative domain event stream has exactly one owner per run**. An integration adapter distributes read-only copies. Subscribers must not modify the payload or physics state.

## Envelope and clock contract

Every authoritative event has a schema-validated envelope, proposed:

```ts
type DomainEvent<TType extends string, TPayload> = Readonly<{
  schemaVersion: 1;
  runId: string;
  sequence: number;                // strictly increasing within run
  simulationTick: number;          // integer fixed-step index
  simulationTimeSeconds: number;
  sampleFrame?: number;            // when mapped to audio's sample clock
  crankAngleRadians?: number;      // relevant for phase-dependent events
  type: TType;
  source: "starter" | "engine" | "cylinder" | "ecu" | "drivetrain" | "exhaust";
  causationId?: string;            // command/event leading to this event
  correlationId?: string;          // user action/scenario step trace
  payload: Readonly<TPayload>;
}>;
```

Maintain a typed `EventMap` keyed by event type and runtime validators at thread/import boundaries. Separate `CommandEnvelope`, `StateSnapshot` and `DiagnosticEvent` types. Domain events carry monotonically increasing IDs even when multiple events have the same simulation time.

- **Ordering:** at each fixed tick, apply due commands in deterministic submission/priority order; advance physics; collect domain events in deterministic subsystem/phase order; assign globally increasing sequence; then dispatch. Re-entrant mutation by subscribers is forbidden.
- **Causality:** commands that arise from subscriptions are queued for the *next* eligible tick, never recursively applied during event dispatch. Use causation/correlation IDs for diagnostics and loop detection.
- **Timestamps:** use integer simulation ticks and audio sample-frame indices when available; convert to seconds for display. Never use `Date.now()` or visual frames to time physics or sound.
- **Audio:** per-cylinder high-frequency excitation may be represented by phase/cylinder state in the worklet instead of cross-thread `postMessage` for each pulse. The resulting authoritative domain events and audio cues must preserve their causal linkage.
- **Exactly-once within an instance:** sequence IDs, command IDs and idempotent processing prevent repeated application; cross-thread messages use sequence checks and explicit gap detection, not an unjustified guarantee of perfect transport.
- **Subscription lifetime:** typed subscriptions, deterministic dispatch order where needed, explicit unsubscribe/dispose on simulation reset and page unmount. No hidden global mutable event bus.

## Transport/backpressure

- Use bounded queues; separate **critical state transitions** from lossy/coalescible high-rate telemetry.
- Critical transitions, command acknowledgements and scenario-observed events may not be silently lost. On queue overflow/gap, emit `EVENT_STREAM_GAP` / `QUEUE_OVERFLOW`, mark the affected trace/scenario invalid, and recover by resynchronizing from an authoritative snapshot; do not claim that a test passed.
- Telemetry snapshots can be rate-limited, sampled or coalesced for 3D/graphs. These projections must never drive engine integration or audible pulse timing.
- Audio callback must avoid unbounded allocations, synchronous callbacks to UI, blocking waits and heavy serialization. Batch outward-bound messages outside hot loops when feasible.
- A transport bridge must handle startup, teardown, version negotiation, run resets, stale messages, pause/resume, audio-context suspension and worker recovery.
- Baseline must function on standard GitHub Pages HTTPS without `SharedArrayBuffer`; consider SAB ring buffers only as optional performance optimization with appropriate isolation headers/capability support.

## Event taxonomy (initial)

- **Engine lifecycle:** KEY_ON, KEY_OFF, STARTER_ENGAGED, STARTER_DISENGAGED, CRANKING, FIRST_FIRE, ENGINE_RUNNING, FAILED_START, ENGINE_STALLING, ENGINE_STALLED, ENGINE_STOPPING, ENGINE_OFF.
- **Per-cylinder / combustion:** COMBUSTION, MISFIRE, IGNITION_CUT, FUEL_CUT, VALVE_EVENT (phase-domain where high frequency).
- **ECU:** IDLE_CONTROL_CHANGE (telemetry), LIMITER_ENTER, LIMITER_EXIT, FUEL_CUT_ENTER, FUEL_CUT_EXIT, LAUNCH_CONTROL_ENTER, LAUNCH_CONTROL_EXIT.
- **Drivetrain / traction:** CLUTCH_ENGAGED, CLUTCH_SLIPPING, GEAR_SHIFT_STARTED, GEAR_CHANGED, SHIFT_COMPLETED, SLIP_ENTER, SLIP_EXIT, TRACTION_LOST, TRACTION_REGAINED.
- **Exhaust / acoustics:** AFTERFIRE, TURBO_WASTEGATE_OPEN, BLOW_OFF; render these as physically conditioned events, not arbitrary UI sound commands.
- **Infrastructure:** ENGINE_RESET, RUN_PAUSED, RUN_RESUMED, COMMAND_APPLIED, COMMAND_REJECTED, QUEUE_OVERFLOW, EVENT_STREAM_GAP, AUDIO_UNDERRUN, PROFILE_ACTIVATED (control-plane/diagnostic rather than physical engine facts).

Event naming and category must stay consistent across schema, scenario runner and tests; only emit actual state transitions (not repeated each frame while a state remains true).

## Expanded technology event catalog

All new powertrain families use the **same authoritative domain event stream**, with event producers restricted to the component owning the physical transition, and `componentId`/port references where appropriate. Add and validate typed payloads for `BATTERY_VOLTAGE_LOW`, `STARTER_ENGAGEMENT_FAILED`, `STARTER_OVERHEATED`, `CHARGING_FAILED`, `INTAKE_BACKFIRE`, `AFTERFIRE`, `BOOST_LIMITED`, `WASTEGATE_CHANGED`, `GEAR_SHIFT_STARTED`, `CONVERTER_LOCKED`, `TRANSFER_CASE_MODE_CHANGED`, `DIFF_LOCK_CHANGED` and `TRACTION_LOST` while retaining the existing engine state and limiter event names. Electrical voltages, mass flow, per-component torque and power, boost pressure and wheel speeds are sampled **state projections**, not unbounded high-rate event spam. The API must support a new engine layout, induction component or driveline provider registering its events without bypassing central sequencing and schema validation; unrecognized events or unsupported controls fail safely.

## Scenario integration and training

- The scenario runner subscribes to the **authoritative event log**, not visual or audio approximations. Event gates have a sequence watermark at step entry so they cannot accidentally match stale events.
- Time gates use simulation ticks/time; state predicates consume authoritative state snapshots; compound gates can combine events and stable conditions. Conditions must be evaluated without dropping required ticks.
- Record every input command and applied/rejected result, event order, state checkpoints, seed and version for deterministic replay. Offline/training runs replay the exact contract and compare event timing/sequence against the reference.
- Live UI event history is a bounded projection; a recorded trace is a separate explicit artifact. A browser reload must not imply history is preserved.
- Profile changes are validated commands applied at safe boundaries, accompanied by PROFILE_ACTIVATED and a profile hash. A trained model must never bypass the event/state authority.

## Acceptance tests

- [ ] All modules import one shared `EventMap` / `CommandMap`, with compile-time type tests and runtime schema validation at boundaries.
- [ ] Start -> crank -> first fire -> run -> limiter -> stall -> restart produces one ordered stream with expected causes and monotonic IDs.
- [ ] A scenario event gate only matches events after its entry watermark; a timeout/failure path is reported deterministically.
- [ ] Controls applied in different animation frame rates produce the same simulation event trace within numerical tolerance for the same stamped input schedule.
- [ ] Audio pulse timing remains synchronized with crank phase even if UI or renderer stalls; no audio-rate round trip through the main thread.
- [ ] Simulated delayed, duplicated, out-of-order and missing cross-thread messages are detected/handled; critical gaps invalidate tests.
- [ ] Backpressure coalesces telemetry without losing critical event visibility; queue memory is bounded.
- [ ] Unsubscribe/reset/restart does not duplicate listeners or old run events; stale-run envelopes are rejected.
- [ ] Headless replay and real-time execution agree on authoritative state transitions and event sequence for the same seed/inputs within documented tolerance.
- [ ] GitHub Pages build works without optional shared-memory features.

## Implementation priority

- **M0:** decide event ownership and define typed envelopes, transport interfaces, clock/sequence semantics and validation.
- **M1:** implement local deterministic event collector/bus, command scheduler, recorder and headless subscriptions.
- **M2:** implement AudioWorklet bridge and loss/gap diagnostics without violating real-time constraints.
- **M3–M4:** feed visualization and all new components through the same contracts.
- **M5:** make scenario gates and regression runners subscribe to canonical events.
- **M6–M7:** reuse the same event/trace format for reference comparison, training and model activation.

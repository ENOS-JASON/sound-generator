# M1 — independently assignable agent tasks

G0-B must be proven; use versioned headless mock fixtures. Only the baseline engine and minimum starter/driveline path are in scope; all later powertrain options remain capability-gated.

**Common contract:** [30 — handoff](../30-agent-handoff-contracts-and-decisions.md), [31 — gates](../31-integration-gates-and-support-matrix.md); use accepted versioned mocks when real predecessor is absent and mark live integration pending.

### AG-M1-01

**Original roadmap task:** Implement generic fixed-step deterministic **real-time physics** using M0 clock/event/recorder contracts, causal event collector, command scheduler and existing imported trace comparison.

**Bounded deliverable:** Fixed-step headless/live engine driver that owns state, command ordering and output snapshots; consumes frozen tick/event API.

**Required upstream evidence:** G0-B, AG-M0-09 and AG-M0-10. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/core/solver-runtime, src/testing/headless`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** Two equal seeded command sequences produce matching event hashes and snapshots; no second state owner is created. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-02

**Original roadmap task:** Implement each component's analytical baseline/parameter slots with versioned shared math kernels, SI input/output, physical bounds, trainable correction hooks and domain-dependent fallback; engine works correctly when no trained profile exists.

**Bounded deliverable:** Baseline formula adapters and bounded trainable coefficient slots; must run with zero trained profiles.

**Required upstream evidence:** AG-M0-15 and AG-M1-01. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/approximations/baseline, tests/fixtures/training`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md), [28](../28-shared-realtime-surrogates-and-calibration.md).
**Done when:** One component operates analytic fallback with finite power; invalid model binding rejected and logged. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-03

**Original roadmap task:** Test event ordering, exactly-once command application, subscription cleanup, re-entrancy prevention and deterministic replay.

**Bounded deliverable:** Integration tests for sequence, command acknowledgement, reentrancy, listener teardown and deterministic replay.

**Required upstream evidence:** AG-M1-01, AG-M0-09. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `tests/core/events, tests/fixtures/golden/mock-run`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [11](../11-event-bus-and-messaging.md), [24](../24-simulation-clock-and-time-scaling.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** Simulated duplicate/delayed/out-of-order/old-run commands cannot cause a second state mutation or missed critical-event test pass. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-04

**Original roadmap task:** Implement rotating inertia, drag/friction, per-cylinder crank/720° firing order and generic inline/V/flat bank geometry, compression load.

**Bounded deliverable:** Generic 720-degree crank phase, four-stroke order, compression resistance and inertia; bank mapping from data.

**Required upstream evidence:** AG-M1-01, AG-M0-07. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/engines/geometry, src/engines/crank`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [15](../15-engine-families-and-presets.md), [20](../20-torque-power-load-and-energy.md).
**Done when:** I1 vs I4 vs V-bank fixture has valid cylinder phase; no combustion when fuel disabled; crank coasts with friction. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-05

**Original roadmap task:** Implement editable bore and stroke, rod length and clearance/compression geometry; recompute displacement and connected cylinder-volume/air-charge data consistently whenever a validated geometry change is applied.

**Bounded deliverable:** Bore/stroke/rod/clearance state and derived displacement with exact SI unit adapters.

**Required upstream evidence:** AG-M0-07, AG-M1-04. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/engines/cylinder-geometry, src/core/geometry tests`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [15](../15-engine-families-and-presets.md), [22](../22-guided-vehicle-configurator.md).
**Done when:** 86 mm bore and stroke I4 yields expected total volume; invalid clearance/rod bounds are rejected; visuals don't own formula. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-06

**Original roadmap task:** Add coupled crank, auxiliary and driveline rotational ports, free-rev/dyno/road-load adapters, SI torque/power measurements and energy-balance diagnostics.

**Bounded deliverable:** Crank and accessory integration **plus a minimal physically coupled manual clutch/neutral/gear ratio and vehicle/road-load path for the owner-approved I4 first complete model**. Include positive/negative torque, shaft-to-wheel power, loss and acceleration instrumentation. Advanced gearbox family models remain AG-M4C.

**Required upstream evidence:** AG-M1-01, AG-M1-04, AG-M0-04. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/core/physics-ports/load, src/core/energy-ledger`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [30](../30-agent-handoff-contracts-and-decisions.md).
**Done when:** A validated I4 in neutral revs independently; engaging a basic manual gear/clutch under brake or hill reflects wheel load back to crank, can stall the engine, and tracks shaft/road energy without duplicating power. Do not mark a free-rev-only demo complete. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-07a

**Approved Round 2 requirement:** G1 **cannot pass without this working mechanical/no-ECU I4 option**: carburetor/throttle/choke, distributor advance and correct fuel/ignition/idle behavior; reject ECU maps and electronic-only commands. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement minimal mechanically controlled carburetor/distributor path **without ECU** plus separately selectable ECU reference controller; reject controls not supported by the active strategy.

**Bounded deliverable:** Minimal mechanical/no-ECU throttle/choke/distributor/idle inputs behind ControlStrategy.

**Required upstream evidence:** AG-M1-04, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/controls/mechanical, src/engines/carburetor-basic`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [15](../15-engine-families-and-presets.md), [18](../18-electrical-control-generations-and-tunes.md), [22](../22-guided-vehicle-configurator.md).
**Done when:** No electronic ECU map controls available; mechanical choke/advance affects charge and torque in a fixture. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-07b

**Approved Round 2 requirement:** G1 **also requires a separately selectable EFI/ECU I4 option**. Implement injection/spark/sensors/idle through physical ports; do not merely expose map UI or secretly reuse carburetor behavior under an ECU label. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement minimal mechanically controlled carburetor/distributor path **without ECU** plus separately selectable ECU reference controller; reject controls not supported by the active strategy.

**Bounded deliverable:** Minimal ECU-controlled throttle, injection, ignition and idle strategy using same sensor/actuator boundaries.

**Required upstream evidence:** AG-M1-04, AG-M0-05. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/controls/ecu-basic`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [18](../18-electrical-control-generations-and-tunes.md), [14](../14-modular-typescript-platform.md), [20](../20-torque-power-load-and-energy.md).
**Done when:** ECU commands affect torque only through fuel/air/spark; no direct RPM assignment; mechanical mode remains unaffected. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-08a

**Original roadmap task:** Add ignition switch, battery SoC/voltage/internal resistance, starter motor/solenoid/engagement and torque-speed curve with defined interfaces for wear and heat.

**Bounded deliverable:** Battery SoC/temp/internal resistance and voltage-current load behavior with telemetry.

**Required upstream evidence:** AG-M0-05, AG-M1-01. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/electrical/battery`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md), [25](../25-core-diagnostics-recording-and-comparison.md).
**Done when:** High resistance sags terminal voltage under same starter current; no free battery energy. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-08b

**Original roadmap task:** Add ignition switch, battery SoC/voltage/internal resistance, starter motor/solenoid/engagement and torque-speed curve with defined interfaces for wear and heat.

**Bounded deliverable:** Starter torque-speed, solenoid coupling, electric load, disengagement and wear-ready interfaces.

**Required upstream evidence:** AG-M1-08a, AG-M1-04. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/electrical/starter`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md).
**Done when:** Cranking can fail when voltage low; starter cannot accelerate indefinitely above normal running RPM; current and starter torque match load. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-09a

**Approved Round 2 requirement:** Provide distinct charge/fuel/ignition source behavior for **carburetor/no-ECU vs EFI/ECU** in the initial I4, including tests showing real physical differences and no mixed controller path. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions.

**Bounded deliverable:** Simple cylinder air mass, fuel delivery and spark state from pressure/temperature/throttle.

**Required upstream evidence:** AG-M1-05, AG-M1-07a or AG-M1-07b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/engines/charge-and-fuel`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [16](../16-intake-induction-and-exhaust.md), [18](../18-electrical-control-generations-and-tunes.md).
**Done when:** Closed intake prevents invented charge; fuel off prevents sustained firing even with spinning starter. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-09b

**Approved Round 2 requirement:** First-fire, catch, idle and stalls must work in **both approved I4 controller modes**, with actual combustion and starter/manual-load responses; neither can be a visual-only preset. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Add air/fuel/spark and combustion torque, catch criteria, OFF/CRANKING/FIRING/RUNNING/FAILED_START transitions.

**Bounded deliverable:** Conditioned per-cylinder heat-release/torque with first-fire and running/catch state transitions.

**Required upstream evidence:** AG-M1-09a, AG-M1-04, AG-M1-08b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/engines/combustion, src/engines/lifecycle`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [11](../11-event-bus-and-messaging.md), [15](../15-engine-families-and-presets.md).
**Done when:** First-fire event only on actual combustion; starter may crank without running; torque pulses follow 720-degree order. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-10a

**Approved Round 2 requirement:** Both initial I4 configurations need **their applicable idle method** (mechanical adjustment versus ECU strategy); no electronic regulation should appear in carb/no-ECU mode. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Implement selectable mechanical idle adjustment or ECU idle regulation, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall.

**Bounded deliverable:** Mechanical or ECU idle regulation with stable throttle/torque coupling.

**Required upstream evidence:** AG-M1-09b, AG-M1-07a or AG-M1-07b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/controls/idle`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [18](../18-electrical-control-generations-and-tunes.md), [20](../20-torque-power-load-and-energy.md).
**Done when:** Low/high load idle trends correct, no direct RPM teleport, controller unavailable when not equipped. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-10b

**Original roadmap task:** Implement selectable mechanical idle adjustment or ECU idle regulation, kill-switch shutdown, no-fuel failure, low-battery failure and load-induced stall.

**Bounded deliverable:** Key-off coastdown, no-fuel failures, load-induced stall, restart state transitions.

**Required upstream evidence:** AG-M1-10a, AG-M1-06, AG-M1-09b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/engines/shutdown-and-stall`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [02](../02-physics-model.md), [11](../11-event-bus-and-messaging.md), [19](../19-scenario-coverage-and-presets.md).
**Done when:** Friction slows stopped engine, fuel-off cannot fire; stalling emits one causal event before off. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

### AG-M1-11

**Approved Round 2 requirement:** G1 golden scenarios **must cover both carbureted/mechanical/no-ECU and EFI/ECU I4** start, stable idle, failed start, basic manual clutch/road load, hill/braking stall, invalid controller commands, torque and energy conservation. Do not certify only one controller. See [Round 2 decision record](../decisions/USER-APPROVED-ROUND-02.md).

**Original roadmap task:** Build headless first-start/stall scenarios and physical invariant tests.

**Bounded deliverable:** Minimal **I4 gasoline/start/clutch/manual gear/road-load** headless scenario fixtures and invariant assertions (not M5 full editor), with explicit first-complete-model acceptance.

**Required upstream evidence:** AG-M1-09b, AG-M1-10b. Missing prerequisites block live integration, not isolated fixture tests.

**Owned modules/files:** `src/testing/scenarios-minimal, tests/fixtures/golden/i4-start`. No changes to adjacent owners' public schemas without an accepted ADR.
**Required references:** [06](../06-scenario-runner.md), [07](../07-testing-and-acceptance.md), [19](../19-scenario-coverage-and-presets.md).
**Done when:** I4 warm start, no-fuel crank, low battery, neutral rev, clutch engagement under load, acceleration, brake/hill load and clutch-load stall run as deterministic positive/negative fixtures; include event time and energy bounds. Advanced manual/other gearboxes are separate M4 provider cards. Include a negative case and runnable test/fixture; submit the completion report from [30 §6](../30-agent-handoff-contracts-and-decisions.md#6-required-completion-report-from-each-agent).

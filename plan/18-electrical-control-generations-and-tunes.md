# 18 — Electrical health, pre-ECU/ECU controls and tuneable afterfire

## Goal

Historical mechanical-only vehicles and newer ECU-controlled vehicles must be simulated through **interchangeable controllers**, not an assumption that every engine has an ECU. The engine responds to real air/fuel/spark mechanisms, battery/electrical condition, sensor/actuator limits and downstream thermal/drive loads. Software tuning changes control laws and thereby combustion and exhaust conditions; it must not directly play a sound.

## Engine and vehicle control eras

| Generation / control strategy | Key elements | What changes physically |
|---|---|---|
| Manual / mechanical ignition & fueling | throttle cable, carburetor, mechanical fuel pump, breaker points/distributor/coil, centrifugal/vacuum advance, manual choke | drift, timing, enrichment, starter/cold starts, no ECU-limit strategies unless hardware provides |
| Mechanical fuel injection / early electronic | mechanical injection pumps/distributors, simple analog/digital ignition, early feedback where present | fuel metering and transient corrections, discrete control limitations |
| Electronic fuel injection with ECU | MAP/MAF, TPS, coolant/air sensors, injection, crank/cam position, spark maps, lambda feedback | fuel trim, target lambda, spark angle, idle control, speed limits |
| OBD-era / drive-by-wire | electronic throttle, knock, VVT, traction/torque arbitration, diagnostic restrictions | torque request arbitration, throttle delay, interventions and safety limits |
| Modern electronic systems | direct injection, variable cam/lift, cylinder disable, turbo boost, stop-start, multiple ECUs/TCUs | multiple feedback loops and actuator/thermal states |
| Hybrid/EV control (extension) | inverter, BMS, motor controllers, regenerative and power-split supervisors | electrical torque, SOC/voltage/temp limits and machine acoustics |

**No ECU** is a first-class selection: `MechanicalGovernor`, `CarburetorFuelSystem`, `DistributorIgnition`, manual throttle linkage or other era-specific components. A vehicle without an ECU cannot be assigned artificial ECU tune maps or ECU-driven ignition cuts; mechanical rev limits and other failure modes remain possible.

## ECU/TCU calibration and controls

- Separate `ControlStrategy` (mechanical/ECU/aftermarket/standalone) from the engine and actuators. Use typed sensor/command channels, actuator lag/saturation and versioned tune maps with validated axes/interpolation.
- ECU editable parameters **as supported by that controller**: target lambda/AFR, fuel map and transient enrichment, injector dead-time, ignition advance/retard map, idle setpoint and PID, rev limit threshold/hysteresis, hard/soft cut strategy per cylinder, throttle/boost request, boost limit, wastegate control, knock/thermal protection, variable cam timing and lift, deceleration fuel cut/re-enable, launch control/2-step, anti-lag and torque cut on shifts.
- Control strategy owns authority and resolves competing requests (driver, idle, traction, gearbox, knock/overheat, rev limit) through explicit priority rules. Sensors can fail or be delayed/noisy; diagnostics identify actual faults. Unsupported controls should be disabled, not shown as fully simulated.
- Tune changes are validated commands applied atomically at safe boundaries with version/profile hash and recorded causation; mix settings and visuals must not rewrite ECU state.
- Historical settings include points gap/dwell, distributor vacuum advance, choke adjustment, carburetor jet/venturi parameters where modeled. They are distinct from ECU lookup tables.

## Battery, charging and starter condition

Model **battery health as physical state**: state-of-charge, cold-cranking capability, open-circuit voltage vs SoC/temperature, internal resistance, temperature/aging, starter load sag, cable/terminal resistance and alternator output/regulator/accessory consumption.

Starter and relay/solenoid wear: motor winding/brush/contact resistance, reduced torque-speed curve, freewheel bearing/gear engagement problems, sticky/slow solenoid, heat soak, intermittent contact, starter spin after disengagement, starter current and heat. A failing battery and worn starter must be distinguishable in current/voltage/RPM/whine/event traces.

Couple alternator mechanical load to the crankshaft and electrical loads to battery. Electrical consumers (lights, HVAC/AC clutch, pumps, fans, ECU/injectors/ignition, audio accessories where physically relevant) cause realistic voltage/current draw and sometimes extra crank load. For mechanical fuel ignition/fueling, model whether engine can run after battery falls or alternator fails based on actual subsystem dependency; do not universally stall every no-ECU car at key-off with identical behavior.

### Required failure variants
- Healthy cold and warm start.
- Low SoC battery, aged high internal resistance, very cold battery.
- Weak/intermittent/overheated starter, solenoid clicking but no effective crank, worn Bendix gear not meshing.
- Poor ground/voltage drop vs mechanically jammed engine.
- Ignition on with starter engaging then failing, repeated crank attempts with heating/voltage sag, successful jump-start/charged-battery recovery.
- Failing alternator and accessories causing battery depletion and ignition weakness over time.
- False start: first firing but fail to sustain idle; mechanical/ECU idle differences.

## Afterfire, pop-and-bang and exhaust tuning

Expose a **simulation-only** editable `OverrunAfterfireStrategy` that can represent stock deceleration, legacy carbureted overrun behavior, mild burble and aggressive "pop and bang" ECU tune styles when the selected controller and exhaust hardware support them.

- Model driver lift, exhaust pressure/temperature, residual/extra fuel/oxygen, ignition timing/combustion completeness and engine load. An afterfire event is conditioned on physically plausible gas/temperature/ignition state, with source and impulse through the exhaust flow path described in [16](16-intake-induction-and-exhaust.md).
- Configurable qualitative strategies may target frequency/energy tendencies and timing, but do not allow arbitrary event emission unrelated to physically modeled conditions. Distinguish normal crackles, delayed pops, loud bangs, shifts, rev limiter cuts and launch-control effects.
- Models include thermal implications for catalyst, turbine and exhaust; do not claim a destructive real-world configuration is safe or provide vehicle-specific real ECU flash instructions.
- ECU controls generate **tune effects through the physical state**; the DSP converts authoritative afterfire events to separate, calibrated and mixable stems. No direct "play pop" command bypassing engine conditions.

## Typed events and audio

Electrical `BATTERY_VOLTAGE_LOW`, `STARTER_SOLENOID_ENGAGED`, `STARTER_SPINNING`, `STARTER_ENGAGEMENT_FAILED`, `STARTER_OVERHEATED`, `CHARGING_FAILED`; control `REV_LIMIT_ENTER/EXIT` (canonical event naming to be standardized with `LIMITER_ENTER/EXIT`), `FUEL_CUT_ENTER/EXIT`, `BOOST_LIMITED`, `KNOCK_DETECTED`; `AFTERFIRE`, `INTAKE_BACKFIRE`. Continuous voltage/current/temperature and maps are **state telemetry**, not one bus event per sample. All events use [11](11-event-bus-and-messaging.md).

## Acceptance scenarios

- [ ] No-ECU carbureted engine starts/runs with distributor and mechanical control; ECU map edits cannot affect it.
- [ ] ECU engine permits supported fuel/spark/boost/idle/limiter tuning, with verifiable resulting torque/emissions-proxy/exhaust changes.
- [ ] Same engine and thermal conditions with healthy, weak battery and worn starter show causally different starter current/voltage/crank speed/sound and start outcome.
- [ ] Electrical/alternator and accessory loads feed physical crank torque budget.
- [ ] Low-battery and worn-starter cases fail with distinct typed reasons; retries and charge/jump-start recovery are validated.
- [ ] Mild/aggressive pop-and-bang tune presets demonstrate plausible changes in overrun afterfire **only** when the required conditions are present; negative scenarios have no spurious pops.
- [ ] Rev limiter / 2-step / shift cut differ in logic, torque response and audio; lack of ECU does not silently grant electronic rev limiting.
- [ ] Safety/thermal limitations and unavailable simulation fidelity are explicit in UI and versioned presets.

## Implementation

M0/M1: component interfaces, mechanical ignition/fueling strategy, ECU strategy and electrical/starter health contract. M2: starter/solenoid/combustion/afterfire audio source routing. M4: ECU editor, failure modes, thermal afterfire, battery charging and alternator. M5: gated start/afterfire/control scenarios. M6/M7: reference calibration for starter torque, voltage, fuel/ignition and exhaust model. Future models: era-specific ignition/diagnostic and electrified controllers.

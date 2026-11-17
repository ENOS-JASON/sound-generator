# 02 — Engine and vehicle physics

## State and core relationships
Track crank angle `theta` (radians, unwrapped), angular speed `omega`, idle target, torque terms, manifold pressure/temperature proxies, fuel film, cylinder combustion state, battery voltage, starter coupling, coolant/exhaust temperature proxies, clutch/driveline/wheel speed and longitudinal vehicle speed.

```text
d(theta)/dt = omega
I_effective * d(omega)/dt = T_combustion + T_starter - T_friction - T_pumping - T_accessories - T_drivetrain
RPM = omega * 60 / (2*pi)
vehicle acceleration = (tire force - aerodynamic drag - rolling resistance - braking force) / mass
```

Constrain integration and nonphysical values; handle near-zero/negative omega explicitly. Use cylinder-resolved crank-angle pulse integration and firing order for 720-degree four-stroke cycle; cylinder thermodynamic states can be approximate initially. Crankshaft inertia, compression torque pulsation, friction and pumping must be active even without combustion.

## Event ownership

Engine, starter, ECU and drivetrain emit physically caused domain events into the shared authoritative event collector specified in [11](11-event-bus-and-messaging.md), stamped with simulation tick, ordering sequence, run ID, optional crank angle and command causation. Subsystems may react synchronously to engine state within a solver step, but no subscriber may recursively mutate authoritative state while events are being dispatched. The UI, audio, 3D and training do not create physical transitions.

## Technology-neutral coupled load and output accounting

Replace any fixed engine-load scalar with typed connected port forces: crank/accessory/alternator, starter/electrical, supercharger mechanical drive, turbo exhaust extraction, clutch/torque converter, gearbox, transfer case, differentials, wheel contact and road load all contribute to the **same coupled rotational and energy solver**. Model free-rev, dyno and loaded driving as different explicit environments. Brake and wheel torque are different measurement points, and `P_W = T_Nm * omega_radPerSecond` defines shaft power; convert to kW/HP with explicit units and losses. Track produced torque, accelerating inertia, transferred shaft torque, slip/heat and electrical/thermal energy independently. No torque duplication across AWD/4WD axles. See [20](20-torque-power-load-and-energy.md) and [17](17-transmissions-drivetrains-and-wheels.md).

Engine composition is parameterized by bank/cylinder mapping and firing phase (single-cylinder through V12, inline/V/flat) and separated from control generation: carburetor/mechanical distributor without an ECU must run via mechanical controls, whereas ECU/drive-by-wire/tune maps implement their own actuator dynamics. Intake types, ITBs, turbos, superchargers and combinations alter mass flow, charge temperature, pressures, engine output and sound, with physically connected compressor loads. Model battery health and worn starter through voltage/current/torque dynamics rather than a direct RPM clamp. See [14–18](14-modular-typescript-platform.md).

## State machine
`OFF -> KEY_ON -> CRANKING -> FIRING -> RUNNING -> STOPPING -> OFF`; also `CRANKING -> FAILED_START`, `FIRING -> FAILED_START`, `RUNNING -> STALLING -> OFF`, restart from eligible stopped states. Transition conditions include ignition switch, starter engagement, minimum rotational speed, successful combustion count/torque, battery capacity and ECU readiness. Every transition emits an identifiable event and reason. Do not use arbitrary timer alone for catching/starting.

## Exhaust/afterfire physical coupling

Exhaust afterfire, mild burbles and pop-and-bang ECU tune scenarios are **gas/thermal/fuel/ignition-driven events**, distinct from intake backfire, ordinary firing and limiter cuts. Condition event energy/timing on modeled exhaust oxygen, residual fuel and temperature and preserve the link to sound stems and source location. See [16](16-intake-induction-and-exhaust.md) and [18](18-electrical-control-generations-and-tunes.md).

## Subsystems
1. Battery and starter: open-circuit voltage, load-dependent droop, starter torque-speed curve, bendix engagement/disengagement, starter spin-down, failed crank/low voltage; acoustic motor whine and gear impacts derived from motor and coupling.
2. Air/fuel/spark: throttle/idle bypass, intake pressure relaxation, trapped charge proxy, fuel injection + transient fuel-film behavior, spark timing/advance, ignition success, combustion torque pulse and heat release; environmental conditions and aging.
3. Engine mechanics: cylinder firing cadence, order and phase, compression drag, crank imbalance, valve events, accessory load, irregular idle and stalls due to sustained torque deficit.
4. ECU: PID idle air/spark assist with integrator anti-windup, start enrichment, rev speed limit hysteresis, soft retard and hard ignition/fuel cut per cylinder; fuel cut on decel and restoration.
5. Drivetrain: clutch slip and inertia coupling, selected gear and final drive, shift torque interruption, rolling/drag forces, tire traction saturation and slip-dependent chirp/burnout.
6. Exhaust: oxygen/fuel/thermal reservoirs governing afterfire/burble/backfire probability and event intensity; correlate acoustic impulse with combustion/exhaust events, never unconditional randomness.
7. Forced induction (later): compressor/turbine lag, wastegate/BOV dynamics, manifold pressure, spool and audible components.

## Order of implementation
A. rotating mass + compression and friction without fuel -> B. starter and failed crank -> C. firing and catch -> D. idle control -> E. throttle/speed transients -> F. limiter/stall and fuel cut -> G. clutch/gears/wheels -> H. afterfire/forced induction.

## Extended engine/drivetrain test families

Baseline models and presets must cover healthy/low-battery/worn-starter outcomes; carburetor vs ECU control; inline/V/flat firing cadence; multiple induction configurations; gear, converter, transfer case, differential and wheel traction reactions. Each new family has independent physics tests and end-to-end scenarios, see [19](19-scenario-coverage-and-presets.md).

## Physical validation
Maintain units (SI internally), limits, positivity where applicable, stable energy/torque budgets, and monotonic relationships in simple reference cases. Engine never sustains positive idle with no combustion and no external torque. Starter alone cannot accelerate to normal idle indefinitely. With ignition disabled, combustion and torque cease; engine coasts down. RPM cannot teleport on input changes.

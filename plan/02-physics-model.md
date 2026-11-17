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

## State machine
`OFF -> KEY_ON -> CRANKING -> FIRING -> RUNNING -> STOPPING -> OFF`; also `CRANKING -> FAILED_START`, `FIRING -> FAILED_START`, `RUNNING -> STALLING -> OFF`, restart from eligible stopped states. Transition conditions include ignition switch, starter engagement, minimum rotational speed, successful combustion count/torque, battery capacity and ECU readiness. Every transition emits an identifiable event and reason. Do not use arbitrary timer alone for catching/starting.

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

## Physical validation
Maintain units (SI internally), limits, positivity where applicable, stable energy/torque budgets, and monotonic relationships in simple reference cases. Engine never sustains positive idle with no combustion and no external torque. Starter alone cannot accelerate to normal idle indefinitely. With ignition disabled, combustion and torque cease; engine coasts down. RPM cannot teleport on input changes.

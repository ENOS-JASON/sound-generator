# 20 — Authoritative torque, horsepower and complete component load accounting

## Requirement

The simulator must calculate meaningful **instantaneous and steady-state torque/power** with labeled measurement points and units, not draw arbitrary horsepower curves or infer wheel output from throttle percentage. Dynamic loads and back-reaction must propagate through **every connected component**: air/exhaust, combustion, crank, auxiliaries, coupling, transmission, transfer case, axles, tires and vehicle/environment. Future electric/hybrid machinery adds explicit energy sources, never hidden free torque.

## Required quantities and equations

Use SI internally and document all conversions:

```text
omega [rad/s] = RPM * 2*pi / 60
P [W] = T [N*m] * omega [rad/s]
kW = W / 1000
mechanical hp (US) = W / 745.699872  (if selected)
metric PS = W / 735.49875           (if selected)
I_total * d(omega)/dt = sum(applied torque) - sum(opposing torque)
```

Define and display distinctly:

- **Indicated torque/power:** work transferred to pistons by modeled cylinder pressure (before pumping/friction/accessory subtraction); approximate if pressure is not explicitly calculated.
- **Brake/crankshaft torque/power:** net useful engine-shaft output before gearbox, after engine friction and pumping; distinguish **gross vs net** accounting conventions if needed. In an accelerating engine, separate generated net torque, the torque accelerating the crank/flywheel inertia and the torque actually transferred downstream.
- **Accessory and induction parasitic power:** alternator, AC, coolant/oil pump, friction, supercharger belt drive, other connected shafts.
- **Wheel/axle torque/power:** sum of torques at driven contact points after transmission, transfer, differential, shaft and tire interface losses; separate shaft mechanical wheel output from actual **road traction power** when wheel slip exists.
- **Effective tractive effort and road-load power:** forces at contact patches, rolling resistance, slope/gravity, aero drag, vehicle mass and inertial acceleration.
- **Electrical power:** battery, generator, motor and inverter with storage/energy and charging losses for electrified cases.

A turbocharger consumes **exhaust gas enthalpy** and increases exhaust backpressure, rather than receiving free shaft power. Positive boost alone does not directly establish crank torque: charging, air/fuel/spark, combustion, knock/temperature, efficiency and pumping all matter.

**Crankshaft brake power at idle or unloaded acceleration is not necessarily the same as a steady-state dyno torque curve.** Require explicit measurement mode, environment, RPM/load, sampling window and filter criteria. At zero RPM, shaft mechanical power is zero even if stalled torque is nonzero; no (P/T) division by zero. Display negative torque/power when motoring/engine braking and distinguish regenerated electrical power from ICE output.

## Component load interface

A component contributes `torqueNm`, `angularVelocityRadPerSecond`, inertia, dissipated/converted power and optional thermal/electrical flows at its **ports**. Resistive torque must be signed in a common convention and sampled at a consistent tick. Transforms through gear ratios/couplers obey conservation and efficiency, with separate behavior for forward/reverse power transfer; do not multiply every load by efficiencies in the wrong direction.

**No arbitrary global `engineLoad` scalar** that fails to respect clutch disengagement, hydraulic converter slip, CVT ratio, AWD torque split, belt drive or braking load. Engine load can be a derived telemetry quantity (e.g. normalized indicated torque or load factor), never a substitute for port-resolved forces.

## Road, wheel and braking forces

```text
F_aero = 0.5 * airDensity * Cd * frontalArea * relativeAirSpeed^2 (opposes motion)
F_roll = Crr * normalLoad (direction opposes rolling)
F_grade = vehicleMass * gravity * sin(roadGrade)
abs(F_tire_longitudinal) <= traction envelope(normalLoad, surface, slip, temperature)
vehicleMass * acceleration = sum(tire forces) - aero - rolling - grade
```

Model wheel radius/inertia, rotational-to-translational conversion, brake/regen torque and tire slip separately. Vehicle reaction forces, axle torque and shaft load feed upstream. A high-slip burnout must not imply useful vehicle acceleration equal to unconstrained shaft torque. Brake pads convert energy to heat; regen routes permitted power back into an electrical store.

## Coupled solver and conservation ledgers

At every solver step, track crank/shaft/wheel mechanical kinetic energy, vehicle linear kinetic energy, chemical fuel input, battery state, gas/exhaust/thermal proxy energies, mechanical/electrical losses and useful work. Model fidelity will initially be simplified, but energy budgets must have explicit **residual** metrics rather than silent creation/deletion of energy. Stiff clutch/converter/tire contacts require stable constraints or substeps; disable numerical shortcuts that produce RPM jumps or artificial power at transitions.

Subsystem connections must be bidirectional for load reactions where physically coupled; torque from tires through gearbox to engine also matters in downhill engine braking or drivetrain stall.

## Power displays and dyno configurations

- **Live crank power and torque**, normalized/corrected dyno curves, wheel torque/hp, engine acceleration/road load, parasitic loss breakdown and per-cylinder indicated torque when available.
- Engine dyno: configurable dynamometer resisting torque/speed; steady-state torque curve with stabilization interval and gear detached.
- Chassis dyno: modeled rollers, tires, drivetrain losses and tire slip; reported wheel measurement, not mislabeled crank hp.
- Inertial sweep: accounted inertia and sampling protocol, clearly labeled estimated power and limitation; no misleading peak figure from uncorrected angular acceleration.
- Historical correction standards and ambient conditions supported as optional explicit correction mode, not silently applied.

## Test examples

- [ ] 200 N·m at 3000 RPM corresponds to ~62.83 kW / ~84.25 mechanical hp, with documented conversion.
- [ ] Engine output is finite and zero shaft power at zero angular speed; negative engine braking power is representable.
- [ ] At steady state, produced brake torque approximately balances delivered drivetrain plus accessory losses; stored energy derivative near zero.
- [ ] Changing grade, aerodynamic drag, brake demand, cargo/trailer, traction, gear or clutch alters actual engine acceleration through load path where coupled.
- [ ] FWD/RWD/AWD/4WD transfer outputs respect gear ratios, shared supply and differentiated losses; no duplicated engine torque across axles.
- [ ] A worn starter and weak battery reduce available cranking torque through electrical equations, not an arbitrary RPM clamp.
- [ ] Forced induction can change mass flow and torque but accounts for compressor drive/electrical use or exhaust energy transfer.
- [ ] Audio/source gain edits, camera/2D switching and visualization smoothing do not change physical torque, hp or loads.
- [ ] Optional electric motors and regen have a separate battery/energy ledger.
- [ ] Under controlled operating points, calculated torque/power agree with audited model/measurement data within documented error bounds; no unsupported precision claim.

## Phasing

M0: SI unit contracts, port sign convention and ledgers. M1: crank energy balance, brake torque, starter/electrical and simple connected load. M3: RPM/torque/hp display and dyno mode. M4: coupled transmissions/4WD/induction and ancillary loads. M5: invariant test suite and run reports. M6/M7: higher fidelity reference torque calibration and dynamometer/recording comparison. M8: performance dashboards and model-uncertainty disclosure.

# 16 — Intake architectures, forced induction combinations and exhaust afterfire

## Goal

Intake, fuel/air paths, compressors and exhaust must alter **cylinder filling, temperature, pressure, torque, response time, parasitic loads, exhaust energy and sound**. They are connected components, not decorative audio toggles. Support configurations and combinations via a **validated flow graph**, not a single `isTurbo` boolean.

## Intake and aspiration types

| Configuration | Mechanical / airflow effect | Distinct sonic contribution |
|---|---|---|
| Naturally aspirated, shared intake plenum | pressure drop, plenum volume/response, runner length and resonance, volumetric efficiency | inlet pulses, throttle noise, airbox/runner tone |
| Carburetor(s), mechanical throttle | venturi restriction, fuel atomization/lag, throttle plates and transient wetting | carb intake roar, throttle/induction turbulence |
| Throttle body / electronic throttle | actuator response, pressure/vacuum and ECU/driver demand | changing intake rush and throttle transient |
| Individual throttle bodies (ITBs) | fast runner response, cylinder isolation and balancing | distinct intake pulse/tone per runner |
| Variable-length/dual-runner manifold | RPM-dependent resonance/volumetric efficiency and actuator state | shifts of intake harmonics |
| Open intake, filtered airbox, snorkel, cold-air intake | different restriction, temperature/duct resonance | filter/duct-dependent tonal and broadband change |
| Naturally aspirated ram effect | speed-related inlet pressure (bounded, model validated) | variable airflow and resonance |

Add single/multiple carburetors, port/direct injection as separate **fuel delivery** components, not misclassified as compressor types. Airflow supports charge temperature, density, throttle closure, manifold vacuum, fuel wetting and intake valve timing.

## Forced induction components and combinations

- **Turbocharger:** turbine drives compressor through exhaust gas enthalpy, rotor inertia, compressor map/efficiency, spool, wastegate, boost controller, optional variable-geometry turbine, surge/choke limits, pressure/temperature rise and exhaust restriction.
- **Multiple turbos:** single, parallel twin, sequential/staged and compound (series) configurations. Independent shafts/rotors, inlet/outlet connections, wastegate/bypass and bank-specific exhaust routing. Do not blindly sum boost pressures.
- **Superchargers:** Roots/positive-displacement, twin-screw, centrifugal and electrically driven compressors; distinct torque-speed maps, compressor efficiency, drive ratios, belts and bypass valves. Mechanical drive **subtracts crankshaft power**; electrical drive loads electrical network; exhaust turbine load appears as exhaust backpressure/energy transfer.
- **Compound systems:** turbo + supercharger (twincharging), series/parallel superchargers where physically configured, turbo + electric compressor, electric-assisted turbo or multi-stage intercooled systems. Validate flows, ratios and feedback loops.
- **Charge management:** air-to-air/water-to-air intercoolers, charge coolers, throttle, intercooler pressure drops, blow-off/diverter valves, anti-surge bypass, manifold volume, boost leak and heat soak.
- **Optional future technologies:** variable intake runner geometry, variable turbine stages, water/methanol injection and exhaust energy recovery, each with own physics/energy consequences.

## Graph contracts and solving

```text
ambient/filter -> compressor(s)/bypass(es) -> intercooler(s) -> throttle
 -> plenum or ITBs -> intake runners/valves -> cylinders
 -> headers/collector -> catalyst/muffler/turbine(s) -> tailpipe/ambient
```

This diagram is a common path, **not** a fixed topology. A turbo turbine may sit before the catalyst and has its own exhaust-to-shaft-energy port; bypass and wastegate create controlled parallel branches. Use pressure/temperature/mass-flow at ports, thermal energy, turbo shaft speed and crank/electric load to solve coupled components. Enforce flow conservation and physical bounds (no arbitrary free boost, impossible temperature or instantaneous turbo acceleration). Turbo spool and supercharger parasitic load must affect measured torque and engine transients.

## Afterfire, backfire, pop-and-bang tunes

Distinguish:
- **Exhaust afterfire:** combustible mixture/excess unburned fuel and oxygen ignites in exhaust under suitable temperature, residence time and ignition conditions; may produce burble/crackle/pop/bang.
- **Intake backfire:** combustion propagates toward intake under a relevant mechanism; acoustics originate from intake, not tailpipe.
- **Normal combustion pulse:** not an afterfire.
- **ECU pop-and-bang strategy:** controlled (or mechanically induced) overrun fueling, spark timing, fuel cut/re-enable, lambda and temperatures that affect the probability/timing/strength of afterfire **in the simulator**. Do not synthesize random pops unconditionally every throttle lift.

Model an exhaust-state reservoir for unburned species, oxygen, pressure/temperature, acoustic propagation and catalyst/muffler attenuation. Use deterministic seeded event sampling with physical prerequisites; an event has source cylinder, exhaust location, time, energy and event id. Very different exhaust layouts and temperatures should change the results. Components can experience modeled thermal stress; presets must not normalize potentially destructive real-world tunes as harmless engineering instructions.

## Audio and visualization

- **Intake sound** depends on plenum pressure, runner lengths/volumes, ITB pulse sources, mass flow, throttle opening, compressor speed, surge, BOV and airbox geometry.
- **Exhaust sound** depends on cylinder/bank firing pulses, headers/collector timing, turbine extraction, catalyst, muffler and tailpipe impedance; afterfire events render through affected paths.
- Independent audio stems for intake/airbox, per-runner pulses (when supported), turbos, superchargers, wastegate/BOV, exhaust headers, tailpipes and afterfire per [12](12-audio-gain-staging-and-mixer.md).
- 2D cutaway shows mass-flow direction and valve state for every bank/cylinder from actual solver projection; visualize compressor/plenum/turbine paths where present, per [13](13-2d-engine-cutaway.md).

## Acceptance matrix

- [ ] Changing airbox restriction or intake runner geometry changes volumetric efficiency/load response **and** intake timbre, not only audio EQ.
- [ ] ITB vs shared plenum produces appropriately different airflow transient and per-cylinder pulse mapping.
- [ ] Twin vs single turbo and sequential vs parallel routing produce different spool and torque behavior under controlled inputs.
- [ ] Belt-driven supercharger consumes crank power as boost changes; electric compressor consumes electrical power; turbo extracts exhaust energy/backpressure.
- [ ] Series compressor pressure/temperature ratios respect actual port connections and conservation laws; intercooler reduces charge temperature with appropriate pressure drop.
- [ ] Pop-and-bang scenario requires permitted tune/state conditions; engine cold, no combustible residue, no spark/fuel and other negative cases do not generate unsupported pops.
- [ ] Afterfire audio timing and location correspond to actual event ids and exhaust path; master source mixer can mute the pop without changing exhaust physics.
- [ ] Adding a new compressor or intake module requires no edits to generic engine-layout or renderer APIs.

## Phasing

M0/M1: port graph + naturally aspirated plenum/throttle/runner reference. M2: procedural intake/exhaust source mapping. M4: ITB, variable intake, basic turbo/supercharger, valve and afterfire physics. M5: combination scenario matrix. M6/M7: high-fidelity calibration of flow, thermal behavior, acoustics and component maps. Later: advanced sequential/compound layouts based on measured validation.

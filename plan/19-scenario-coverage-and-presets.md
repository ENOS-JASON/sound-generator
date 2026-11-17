# 19 — Scenario library and combinatorial validation

## Requirement

A system with many engine families, induction combinations, transmission types and controllers needs **scenario-driven verification of cross-component behavior**, not just unit tests for each class. All canonical scenarios run with deterministic simulation time, event sequence watermarks, compound conditions, negative expectations and explicit timeouts per [06](06-scenario-runner.md). Source events come from [11](11-event-bus-and-messaging.md). Scenario results include RPM/torque/power, air/fuel/temperature, electrical current/voltage, component loads, drivetrain/wheel/road states and audio-stem activity.

## Canonical scenario groups

| Group | Required scenario examples | Required gates/assertions |
|---|---|---|
| Start/health | good warm/cold start; weak battery; cold aged battery; worn/sticking starter; no fuel; failed ignition; high starter load; repeated crank and recovery | STARTER_ENGAGED, FIRST_FIRE, ENGINE_RUNNING or FAILED_START; timeout, voltage/rpm/sound/failure reason |
| Engine operations | stable/rough idle; cylinder misfire; throttle step/sweep; engine braking; stall under load; hot restart; key-off coast | torque/energy balance, RPM changes, accurate event sequence, no phantom combustion |
| ECU/no ECU | carburetor choke/distributor advance; standalone ECU mapped fueling/spark; rev limiter; hard/soft cut; launch control; ECU fault/sensor lag | control availability by era, controlled interventions, limiter entry/exit |
| Afterfire/tunes | stock decel, mild burble, loud pop/bang, shift bang, 2-step and no-afterfire negative controls | AFTERFIRE conditioned by exhaust/fuel/temperature; bounded event counts/timing; distinct audio stems |
| Aspiration | shared plenum vs ITB; restricted filter; runner length; single turbo, parallel twins, sequential twins, centrifugal/Roots supercharger, twincharged, electric assist | manifold mass/temperature/pressure, spool, mechanical/electrical loads, distinct audio |
| Geometry | I1/I2/I3/I4/I5/I6, V6/V8 cross/flat/V10/V12, flat-2/4/6 | correct bank/firing cadence, crank ripple, collector timing, row-per-bank 2D |
| Transmissions | manual slip/shift/stall, AMT, sequential, DCT handoff, converter lockup, CVT ratio sweep, eCVT power split when implemented | speed/torque ratio and losses, event order, no impossible instant changes |
| Driveline | FWD, RWD, full-time AWD, on-demand AWD, 2H/4H/4L, diff lock, traction split, burnout, hill climb and descent | driven-wheel mapping, traction limits, transfer-case constraints, reflected load |
| Other | brake/AC/electrical loads, turbo heat soak, clutch/gear failure where modeled, multi-vehicle optional | explicit energy sources/sinks and bounded state |
| Renderer/audio | 3D/2D switch while cranking and limiter; mixer solo/mute; sample-rate variation; paused browser | engine trace unaffected, no dropouts, per-cylinder phases/stems remain correct |

## Reference-fidelity and wizard scenario extensions

- For representative I1/I4/V8/flat/V12 presets, define a **geometry sweep** that changes bore and stroke, confirms changed displacement/chamber/crank dynamics, and rejects invalid rod/clearance/bank combinations before physics starts.
- For the same time/event-gated cold-start, firing, throttle-ramp, limiter, overrun, afterfire, engine-brake and stall scenarios, run **Quick, Balanced and Detailed** reference tiers where implemented. Inspect cylinder pressure/temperature/heat-release, liner axial/radial metal temperatures, head/piston heat flux and exhaust/intake pressure-wave/timing traces with documented units and conservation errors.
- Define **mesh/time-step refinement** scenarios over cylinder gas zone count, wall thermal layers, pipe axial gas cells and exhaust wall layers; require convergence evidence for selected metrics, not identical traces at all levels.
- Exercise an invalid config path (no ECU with ECU-only tune, EV with bore/stroke, 2WD with 4L transfer, turbo settings without turbo) and verify wizard/JSON/run preflight agree on rejection and support status.
- All reference training jobs respect deterministic scenario time/event gates, finite timeout and failure reporting; a numerically unstable advanced solver is a **failed scenario**, never a success or a fitted label.

## Playback scaling and structured variation studies

A scenario is authored in **simulation-time**, irrespective of a viewer's 0.05/0.1/0.5/1x slow motion or a high-fidelity run taking hours for one cycle. The same authoritative step/event gates should pass at identical simulation states/seed; wall-clock watchdogs monitor progress without imposing arbitrary short end times. Include slowed engine crank, cylinder stroke, combustion, afterfire, stalling and gearbox events, and verify 2D/3D/audio alignment using imported captures.

For each validated scenario sequence, the **Experiments** runner can execute:
- a baseline replay with identical settings/seed to check determinism;
- repeated baseline with multiple seeds to estimate variance and numerical confidence;
- one changed physical component or parameter while holding other inputs fixed;
- a named preset of components changing together (and controlled interactions);
- grid/pairwise/mesh/time-step sweeps within current component validity bounds.
Record a complete component instance/type/geometry/parameter/topology manifest, all relevant physical/audio source data, reference fidelity/zone settings and **exact changed-part diffs**. Compare engine torque, intake/exhaust flow, temperature/pressure, loss/energy, per-source audio spectra and event timings. Use [27](27-high-fidelity-experiment-orchestration.md) and [28](28-shared-realtime-surrogates-and-calibration.md).

## Must-have multi-step examples

1. **Battery weak vs worn starter A/B:** same engine preset, separate health condition. Key-on -> crank until state/event or timeout -> attempt restart -> optional recharge/repair -> successful start; compare voltage under current, starter load/rotor speed and compression-pulse cadence. A failed starter must not masquerade as a weak battery.
2. **Pop-and-bang exhaust test:** run -> stabilize RPM/load -> enable supported ECU overrun tune -> throttle lift and/or commanded shift cut -> wait for decel state and conditional AFTERFIRE events -> check exhaust thermal constraints, event correlation and matching audio stems -> disable tune -> repeat negative-control run. Explicitly distinguish AFR/ignition/thermal/oxygen status.
3. **Transmission load/stall:** stable idle -> select gear with clutch disengaged -> gradually engage under brake/hill load -> measure reflected load and slip -> expect moving/stall or timed failure depending preset -> restart. A gearbox must not spin independently if the selected shaft coupling is locked.
4. **4x4 engagement:** 2H acceleration on defined grip -> select 4H under allowed condition -> verify transfer and front-axle torque -> optionally enter 4L at specified vehicle speed -> demonstrate different ratio/load on same throttle and grade -> unlock/disengage; invalid high-speed switch must reject without corrupting state.
5. **Intake/forced-induction compare:** equal throttle, mass and grade for natural aspiration, turbo, supercharger and twincharged variant -> compare manifold pressure/temp, spool, shaft/mechanical parasitic power, brake torque and intake/exhaust/induction stems.
6. **Topology-preserving engine-family matrix:** apply start -> idle -> sweep -> limiter/ignition-off -> restart to reference inline/V/flat layouts across cylinder count, bank map, firing order and sampling rates.
7. **No-ECU mechanical engine:** manual choke/throttle/distributor -> start/idle -> load -> mechanically feasible rev response -> ignition-off. Check that ECU-only commands are rejected.
8. **Real-time vs offline:** run the same scenario through the AudioWorklet fast model and headless/reference implementation with matching input schedule; verify transition/torque/pulse alignment within documented tolerance.

## Coverage strategy

Full Cartesian combinations of engine family × induction × fuel/control × gearbox × axle layout × wear × environment × tuning are too large. Use a layered, **coverage-based** approach:

- Mandatory **component contract and invariant** tests for every model.
- Mandatory **pairwise/covering-array** combinations for active supported configurations, plus selected **higher-order risk combinations**: twincharging + thermal, automatic/4WD/torque converter, ECU tune + turbo + catalyst, weak battery + cold cranking + high compression.
- Boundary and random property-based generation with deterministic seeds: 1..12 cylinders, bank mappings, max RPM, low idle, zero/partial clutch, extreme hill/traction, voltage sag, temperature and throttle steps.
- Negative tests for incompatible configurations, missing energy connections, unsupported ECU maps and invalid 4H/4L transitions.
- Explicit `supported` vs `not-yet-implemented` cases; a green suite must not be achieved by skipping scenarios without reporting omissions.
- Hold out entire engine, driveline and induction configurations during training evaluation; prevent overfitting of proxy model to one fixed four-cylinder scenario.

## Gates and reports

Every step has bounded `timeoutSimSeconds` and a separate wall-clock watchdog, event/condition/time gates, optional sustained-condition intervals and negative-event assertions. Reports identify the failing **component/port/physics invariant** and measured symptoms, not only a sound similarity score. Include scenario inventory, passed/failed/skipped/unimplemented counts, state/event trace hashes and qualitative audio feature comparisons.

## Example preset/scenario catalog

```text
presets/
  engines/                  # single; inline; V; flat; later diesel/rotary/EV...
  starting/                 # healthy, aged battery, worn starter, cold
  controls/                 # mechanical, ECU stock, ECU pop/bang, launch
  intake-induction/         # plenum, ITB, single/twin/compound turbo, blower
  transmissions/            # manual, AMT, AT, DCT, CVT, eCVT (when supported)
  driveline/                # FWD, RWD, AWD, 2H/4H/4L and differentials
scenarios/
  starting/
  engine/
  controls-and-tunes/
  air-and-induction/
  transmission-and-traction/
  geometry/
  end-to-end/
```

## Acceptance

- [ ] Every **shipped supported** technology registers expected success and failure scenarios.
- [ ] The catalog includes specific pop-and-bang, low-battery, worn-starter, transmissions and 4x4/induction cross-product cases.
- [ ] Event gates have no false pass on stale events and always terminate with pass/fail/timeout/unsupported.
- [ ] Failed energy/torque budgets and missing components fail visibly.
- [ ] New registered components declare compatibility tests and are included automatically in scenario discovery and coverage reports.

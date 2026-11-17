# 07 — Test strategy and acceptance criteria

## Test pyramid
- Unit: units, integrator, firing order / 720-degree phase, maps, starter torque, ECU hysteresis, bounded DSP filters, seed reproducibility, schema migrations.
- Property/invariant: finite samples, plausible RPM/torque bounds, no engine energy generation without an input, no phantom cylinder ignition, positive or bounded state variables, no zero-time cycling.
- Scenario integration: transitions and conditional gates; timeouts, retries, branches and headless clock behavior. For each engine configuration sample, run scenario matrix including negative tests.
- Shared event bus: typed event contracts, authoritative producer enforcement, monotonic sequence and causation, post-entry scenario watermarks, listener teardown, command idempotence, headless replay, cross-thread delays/duplicates/drops, bounded queue overflow and critical gap detection (see [11](11-event-bus-and-messaging.md)).
- Audio DSP: never NaN/Inf/clips beyond configured ceiling; coherent impulse phase during RPM ramps; no sudden gain spikes at state edges; sample rates and channel counts.
- Component/port integration: strict TypeScript contracts, registries and compatibility validation; mass/electrical/thermal/rotational network port units, coupled torque/energy accounting and no duplicated source power.
- Powertrain variants: per-cylinder/bank firing order across 1–12 and inline/V/flat, alternate mechanical/no-ECU vs ECU control; intake/induction impact on cylinder charge and exhaust, transmission/transfer/diff load return, battery/starter health distinct failure reasons.
- Mixer/visual separation: calibrated reference-level audio source stems/buses/master, 2D row-per-bank valve/airflow simulation, switching 3D/2D without changing engine state.
- Visual: cylinder animation phase locked to core angle; disabling GPU never halts audio; UI responsive and tunable parameters validated.
- Training regression: compare baseline/trained against reference on *held-out configurations and scenarios*, including worst-case metrics, not only mean.
- Browser E2E: Chromium, Firefox, Safari where available; HTTPS, explicit audio unlock, Pages subpath, cross-origin limitations, suspend/resume and mobile degraded mode.

## Expanded technology scenario suites

Require automatic registration of new technology combinations and report **passed/failed/unimplemented/unsupported** separately. Use pairwise active-configuration coverage plus high-order risks rather than an impossible full Cartesian product. Include examples from [19](19-scenario-coverage-and-presets.md): stock vs pop-and-bang tune, healthy/aged battery vs worn starter, no ECU vs ECU, filtered plenum vs ITB/turbo/supercharger combinations, manual/automatic/DCT/CVT gearbox, 2WD/AWD/selectable 4H/4L, diff locks and crank/wheel dyno power. All test suites must assert physically coupled consequences, not just that an event exists.

## Scenario/feature matrix
| Scenario | State/event gate | Physics assertion | Audio assertion |
|---|---|---|---|
| Ignition off | ENGINE_OFF | omega decays | no continued combustion |
| Successful cold crank | ENGINE_RUNNING | starter load + catch | crank pulses -> stable idle |
| Low battery/no fuel | FAILED_START | insufficient torque/firing | no fabricated running sound |
| Unstable/rough idle | idle hold window | fluctuating cylinder torque | variable firing |
| Throttle sweep | RPM target/elapsed | finite positive acceleration | phase cadence increases |
| Hard/soft limiter | LIMITER_ENTER/EXIT | hysteresis and torque cut | intermittent cylinder output |
| Shift/clutch | GEAR_CHANGED | speed/torque discontinuity physically bounded | gear/drivetrain transient |
| Deceleration | FUEL_CUT_ENTER/EXIT | negative engine torque | decel spectral transition |
| Afterfire | AFTERFIRE | thermal/unburnt-fuel conditions | delayed event-localized pop |
| Stall and restart | ENGINE_STALLED / RUNNING | load deficit and catch | stall decay then restart |
| Tire spin | SLIP_ENTER/EXIT | traction saturation | chirp tied to slip |
| Pause/resume | CLOCK_PAUSED/RESUMED | deterministic clock policy | no harsh discontinuity |

## Numeric torque and horsepower validation

Test `P_W = T_Nm * omega_radPerSecond`, signed motoring/braking power, crank vs shaft vs driven-wheel reporting, friction/auxiliary/induction losses, battery electrical loads and drivetrain efficiencies. Verify steady-state dyno points and controlled acceleration separately. A 200 N·m at 3000 RPM shaft should yield ~62.83 kW (~84.25 mechanical hp). See [20](20-torque-power-load-and-energy.md). If not measured/calibrated against an external reference, label simulated torque/HP as model estimates.

## Objective quality
Define per-preset target tolerances **after** acquiring trustworthy recordings/reference solver outputs. Capture event timing error, RPM trajectory error, torque error, spectral envelope distances, perceptual spectral features, transient signatures and listening evaluation. No arbitrary claim of a physically exact recorded car from objective DSP metrics alone.

## Performance and delivery gates
- Run 10-minute rapid-control stress test and multi-minute sustained audio test with zero observed callback failures in tested environment.
- No unbounded memory growth; no main-thread blocking by training.
- Audio and 3D must remain phase-aligned when render frames are skipped; bus telemetry may coalesce but a dropped critical transition or gap must invalidate the affected scenario and be visible in diagnostics.
- Automatic reduced render complexity and DSP quality fallback when profiling indicates overload.
- All P0 scenarios pass; every P1 subsystem adds both success and failure test cases. Training only passes if held-out scores improve without violating mandatory scenarios.
- GitHub Actions CI: typecheck, unit/scenario tests, build, artifact integrity and deploy smoke check (Pages subpath/asset paths).

# 07 — Test strategy and acceptance criteria

## O3-approved additional acceptance and hardware test matrix

- **Physics owner benchmark:** identical I4 fuel/starter/manual-road load physics under Worklet-owned and Worker-owned runtime **on primary 10th-gen Intel i9 + GTX1080 desktop**; record CPU, audio deadline, phase/events, control latency, GC and model step. Results are owner-reviewed **before solver choice**. Unavailable hardware => mark verification `blocked`, not passed.
- **Legacy CUDA and CPU:** compile and run **GTX1080 Pascal `sm_61` compatible CUDA12.x kernel(s)** on Windows/Linux where hardware is accessible; compare physical port/energy results with multicore CPU reference and test GPU missing/incompatible driver/CUDA13-only toolchain/low VRAM cases. Must provide real CPU fallback. The Pascal hardware test cannot be replaced with a mocked "success".
- **3D/2D reference benchmark:** `AG-M8-02` proposes a **separate representative mid-range desktop**, waits for owner approval of CPU/GPU/RAM/OS/scene/resolution, then measures **30 FPS 3D / 60 FPS 2D** with frame-time distribution. Run **compatibility** separately on owner's i9/GTX1080; performance target on mid-range reference need not equal on-device performance.
- **Browser support:** test the **latest two stable major versions where available** of desktop Chrome/Chromium, Firefox, Safari, record versions/dates and explicitly mark unavailable macOS/Safari configurations, rather than claiming success.
- **IndexedDB:** configs, mix, calibration trims, widgets, scenarios, **bounded recent diagnostic data** and **configurable bounded historical snapshots**. Exercise invalid/old schema, interrupted save, quota exceeded, eviction, last-good recovery, restoring EFI over factory carb, ZIP snapshot independent of browser storage.
- **Audio:** advanced toggle with **no authentication** exposes bounded per-source **gain trims only**, calibrated conditions/version/undo; no user-editable EQ/source DSP. Listening cabin/engine-bay/roadside/exhaust stays unchanged when 3D/2D camera moves; physics/ECU/timing unaffected.
- **Licensed reference inputs:** research candidates and submit license proof for owner approval **before public bundling**; unproven data remain excluded. User-provided data may be analyzed but never played as a car recording.
- **Offline GUI:** CLI launches dashboard on `127.0.0.1`/`::1` only; remote bind/forged Origin/CSRF must fail; authenticated-in-process commands and restart/checkpoint workflow tested. No server at GitHub Pages.
- **Integration governance:** AI agent **may merge only routine PRs** with current head SHA, verified least-privilege bot, required CI and explicit branch/rule protections. Shared public TypeScript contracts, cross-module APIs/ownership and major architecture/security/licenses escalate to owner; test blocked/self-review and false-green CI cases. No actual merge claim without host-confirmed commit.
- **Research formats:** browser ZIP tested first. Parquet or HDF5 should not be chosen without a measured study/query use case and appropriate owner review.

Source: [O3 approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md); [open verification details](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md).


## Round 3 additional acceptance tests

- **First launch vs autosave:** empty IndexedDB loads the **carb/mechanical I4**; select editable EFI, change bore/mix, reload, and confirm **EFI remains selected**. Corrupt/older/quota-denied IndexedDB produces safe recovery and ZIP export opportunity, not silent reset/data loss.
- **Two production-ready demo examples:** carb/no-ECU and EFI/ECU have separately valid topology/parameters with starter, gearbox/road load, starting/idle/stall/gear scenarios and plausible physical conservation. Each is editable/importable, and controller-only invalid settings reject. No unverified claimed real-production accuracy.
- **Presentation performance:** on declared reference desktop hardware and test scene, measure **≥30 FPS 3D** and **≥60 FPS Canvas 2D** with an explicit frame-time measurement methodology; report device/resolution/percentiles and unsupported browsers. Audio callback deadlines and fixed physics ticks must remain independent. No performance result is claimed until tested.
- **Expert source calibration:** version/trim edit/revert/ZIP roundtrip changes only source calibration and synthesized sound; everyday user fader and engine power state unchanged, clipping/headroom protected.
- **Spatial listening:** cabin, engine bay, roadside and exhaust produce distinguishable, bounded, procedurally synthesized source-transfer views with accurate mode trace; switching cannot alter torque/timing. No mandatory full 3D acoustic propagation.
- **Reference measurements:** user-import with provenance; bundled real reference only with **verified redistribution rights for public distribution**. Missing rights → exclude/unavailable; test that recorded sound cannot connect to a live/diagnostic playback player or audio stem.
- **Windows/Linux high-fidelity:** CLI plus local graphical monitor can observe/reconnect, pause/cancel safely, checkpoint/resume and report numerical failure. Explicitly document absent OS/GUI test infrastructure; do not claim verified capability from a design alone.
- **AI integration agent:** synthetic PR tests for normal/failed CI, touched frozen contracts, unlicensed bundle, missing approvals and owner-escalation; actual authenticated GitHub review/protection/merge permissions must be verified before declaring deployed. Owner must approve all major ADRs. See [approved Round 3](decisions/USER-APPROVED-ROUND-03.md) and [open implementation details](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).


## Round 2 — Mandatory release test coverage

- Initial I4 engine has two separate **runnable** control fixtures: carburetor/mechanical distributor/no ECU versus EFI/ECU. Both include starter, manual clutch/gear and road load with physically distinct fuel/ignition/idle responses; ECU-only fields and electronic limiter commands must fail appropriately in mechanical mode.
- GitHub Pages test uses **Svelte/Vite hash URLs** under `/sound-generator/#/drive`. Refresh, shareable deep link, navigation and audio/runtime persistence must work without history-route server rewrites.
- New-session slowed audio starts in **physical (pitch-lowered)** mode; mode switch to pitch-preserving DSP is tested for sound and event/physics invariance. Both modes remain functional.
- No captured real-world reference recording can become a live sound stem or sample layer; reference measurement import is validated for provenance and used only for numeric/audio *feature* comparison. Generated WAV capture remains allowed for diagnostics.
- Imported **browser ZIP** (manifest/version/units/chunks/hash/size) roundtrips and rejects malicious/invalid payloads; offline optional Parquet/HDF5 exports preserve SI quantities and run/source hashes.
- **Windows and Linux** offline CLI smoke tests and **desktop Chromium, Firefox and Safari** browser/audio/2D/3D-fallback E2E tests are required. If a test platform is inaccessible, disclose missing evidence and do not claim it passed.
- Every routine code PR needs actual CI and **technical-integrator** review; project owner approves major ADRs. Missing approval or failed gate is `blocked`, never auto-merge.

Source: [Round 2 decisions](decisions/USER-APPROVED-ROUND-02.md).


## M0 foundational observability gate — required before M1

These tests must run on a **deterministic synthetic physics model and synthetic AudioWorklet source** before real engine work begins:
- [ ] Time scaling at 0.05x/0.1x/0.5x/1x, pause/resume, tick/crank-angle/event stepping and mapping of sim tick <-> audio frames work without lost/duplicate causal events.
- [ ] Expandable/hideable physics/audio/clock/event debug menus, sampled live waveform/FFT/stem meters and physics/energy/value graphs show correct units/timestamps without driving the solver.
- [ ] A recording exports commands, component manifest, events, channels, seeds, versions, clock/scaling and optional audio; reimport validates, displays the same channel data, replays identical mock logic and calculates comparable differences.
- [ ] Multi-page Dashboard/Drive/Diagnostics/Settings works on GitHub Pages; a movable/hideable widget persists across routes without reconstructing engine/audio clock.
- [ ] Bounded memory, backpressure and no heavy work in AudioWorklet callback; closed widgets don't keep expensive FFT/readback running.
**M0 must block M1/M2 if any core observability gate fails.** See [24](24-simulation-clock-and-time-scaling.md), [25](25-core-diagnostics-recording-and-comparison.md), [26](26-multipage-ui-and-floating-widgets.md).

## Owner-approved Round 1 integration acceptance

- **Solver placement:** benchmark Worklet-owned vs Worker-owned equivalent solver with the same deterministic I4/start/manual/load input trace, measure audio deadline/jitter/transport/CPU/latency and browser/low-end behavior; final selection must be **owner approved** before enforcing one placement.
- **First full physical slice:** I4 gasoline four-stroke with starter, basic manual clutch/gearbox and road-load back reaction; successful start/idle/neutral/clutch engagement, brake/hill load, stall and restart must all pass with SI torque/energy ledger. Isolated free rev cannot pass first complete engine gate.
- **Dual audio time scaling:** physical lowered-pitch and pitch-preserved stretching modes selectable and recorded, with independent quality/latency/CPU budgets. The identical physical simulation events/states are preserved across mode changes.
- **Reference extensibility:** future 3D CFD/kinetics/material fields and native CPU/GPU solver modules can be registered behind versioned SI projection/manifest interfaces, with explicit `planned` status until implemented and numerically validated; no claim that 0D gas zones are CFD.

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

## Adjustable-fidelity and guided-configurator acceptance

- **Valid-field filtering:** for each supported engine/control/induction/transmission/drive choice, the wizard shows only relevant editable fields and constrained selections; omitted/inactive fields cannot bypass the same validators via raw JSON imports. Test an inline-four, V12/flat engine, no-ECU carburetor, ECU map tune, NA/turbo/twincharge, manual/automatic/CVT and FWD/AWD/4L transfer combinations.
- **Engine geometry:** check `displacement_m3 = pi/4 * bore_m^2 * stroke_m * cylinderCount` for uniform cylinders, sum individual volumes for unequal, mm/in conversions, rod length/crank constraints, compression volume and derived updates after upstream edits. Unsupported geometries must produce actionable error and prevent a runnable preset.
- **Wizard lifecycle:** step dependencies, conditional skips, Back/Next, warnings vs errors, draft save/resume, invalidation preview and undo, component switch preserving compatible fields, import/export roundtrips and version migrations. Changing view or mixer settings does not alter engine simulation until validated apply.
- **Reference fidelity:** Quick/Balanced/Detailed/Research must activate actual supported solver/discretization; user can independently vary cylinder gas zones, wall liner axial/radial layers, piston/head layers, and intake/exhaust gas/wall cells. Invalid mesh/budget settings fail preflight with clear reasons.
- **Zone physical checks:** pressure/temperature/mass/species/energy boundedness, intake/exhaust valve mass flow, local gas-wall heat transfer, liner/head/piston metal conduction, wave propagation and afterfire locality must satisfy tolerance and repeatability for their declared solver tier.
- **Numerical convergence:** compare 0D/two-zone/multi-zone models with refined zone counts and time steps; report convergence, CFL violations, failures and uncertainty rather than assuming a finer mesh is always correct. Never train on corrupted/unstable traces.
- **Runtime separation:** multi-zone training uses Worker or offline CLI with measured resource limits; 3D/2D and real-time audio do not slow or change when reference detail changes. Compact trained profiles contain no reference mesh loops in the AudioWorklet.

See [21](21-adjustable-fidelity-multizone-reference-simulation.md) and [22](22-guided-vehicle-configurator.md).

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

## High-fidelity experiments and shared-surrogate acceptance

- [ ] A Research run may spend **hours per simulated cylinder cycle** without false wall-clock scenario failure; display progress, checkpoint/resume and resource telemetry. User can configure multicore workers up to all usable logical cores, honoring an explicit memory/disk budget.
- [ ] Reference output records a complete unique component/configuration/graph manifest, zone/fidelity/solver versions, scenario/seed, physical ports and per-source audio data. Re-import reconstructs exact baseline and parts; no hidden defaults.
- [ ] Repeated baseline runs characterize noise/numerical convergence. One-part and part-preset changes produce an exact realized component diff and per-component physical/audio A/B metrics on equivalent inputs.
- [ ] Baseline fast equations are usable with no training. Fast/reference share geometry, common port units/signs, input/event and state projection contracts; fitting a trained artifact updates coefficients/maps but not state ownership or causal event logic.
- [ ] One fitting/lookup family can serve multiple compatible components with validated units/domains and separate coefficients; incompatible physically different components cannot accidentally reuse data.
- [ ] Holdout data from different scenarios/engine/induction/driveline configs improves physical and sonic metrics without violating energy/torque event invariants, degrading audio sample deadlines or producing out-of-domain nonsense.
- [ ] Diagnostics import/comparison aligns baseline fast, tuned fast and high-detail reference by sim time, crank angle, and causal events; a changed mix fader does not falsely count as changed physical power.
See [27](27-high-fidelity-experiment-orchestration.md) and [28](28-shared-realtime-surrogates-and-calibration.md).

## Objective quality
Define per-preset target tolerances **after** acquiring trustworthy recordings/reference solver outputs. Capture event timing error, RPM trajectory error, torque error, spectral envelope distances, perceptual spectral features, transient signatures and listening evaluation. No arbitrary claim of a physically exact recorded car from objective DSP metrics alone.

## Performance and delivery gates
- Run 10-minute rapid-control stress test and multi-minute sustained audio test with zero observed callback failures in tested environment.
- No unbounded memory growth; no main-thread blocking by training.
- Audio and 3D must remain phase-aligned when render frames are skipped; bus telemetry may coalesce but a dropped critical transition or gap must invalidate the affected scenario and be visible in diagnostics.
- Automatic reduced render complexity and DSP quality fallback when profiling indicates overload.
- All P0 scenarios pass; every P1 subsystem adds both success and failure test cases. Training only passes if held-out scores improve without violating mandatory scenarios.
- GitHub Actions CI: typecheck, unit/scenario tests, build, artifact integrity and deploy smoke check (Pages subpath/asset paths).

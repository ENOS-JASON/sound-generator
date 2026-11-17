# 00 — Scope and feature inventory

## Round 3 approved delivery boundaries

**Initial scope:** two separately runnable editable four-stroke I4 gasoline vehicle examples (carburetor/mechanical ignition/no ECU **selected by factory default**, and EFI/ECU), with starter/manual clutch/road load. UI 3D target **30 FPS** and Canvas 2D target **60 FPS**, **on defined reference hardware and workload**, not fixed physics/audio cadence or an unverified all-platform claim.

Audio Studio must support **expert-editable separately versioned source calibration trims** (distinct from user mix) and four **procedural listener positions**: cabin, engine bay, roadside and exhaust. Real measured recordings can be **user-imported or bundled only with verified redistribution rights**, for numerical/spectral calibration/validation **never playback**. Browser uses **IndexedDB autosave** with optional ZIP workspace snapshots; offline Windows/Linux high-fidelity work has CLI **and local graphical monitoring**, not a mandatory server. Routine code review belongs to a **dedicated AI integration agent with owner escalation**; actual GitHub review/merge rights need independent verification. See [Round 3](decisions/USER-APPROVED-ROUND-03.md), [remaining unknowns](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).


## Experience
Interactive playable vehicle sound laboratory with switchable 3D car/engine, lightweight 2D per-cylinder-bank cutaway and telemetry-only rendering, start/stop/ignition, throttle, brake, clutch, gear selection, steering and configurable engine/drivetrain. Real-time RPM, torque, firing markers, sound components and state diagnostics. Save/load/share versioned presets (URL encoding for small profiles; local file import/export for larger ones).

## P0: foundation and engine/audio MVP
- Static GitHub Pages app, responsive UI, error/recovery states and first-run demo.
- **Guided step-by-step engine/vehicle configurator**, from template to engine family/layout, bore and stroke, compression and valve geometry, controller, air/induction/exhaust, electrical starting, transmission, drivetrain, wheels, mixer and review. Context-sensitive fields/options must use shared capability/physical validation; derived total displacement (cc/L) updates on bore/stroke/count changes. See [22](22-guided-vehicle-configurator.md).
- Extensible engine editor: single through twelve cylinders, inline/V/flat bank mapping, four-stroke reference cycle, editable bore/stroke, compression proxy, inertia, friction, firing order and crank offsets, controller selection (mechanical/no ECU or ECU), idle control, ignition and fuel delivery; safe bounds/unit annotations.
- Strict TypeScript component contracts and connected physical ports for rotational load, electricity, intake/fuel, exhaust and thermal energy; validated technology compatibility and honest support/fidelity status.
- Calibrated full-reference audio sources with per-source gain/mute/solo, category buses, final master and clipping/headroom protection; no UI gain changes engine physics.
- Required bank-by-bank 2D cutaway with every piston, intake/exhaust valve, combustion and modeled mass-flow indication, switchable without stopping sound.
- Explicit states: OFF, KEY_ON, CRANKING, FIRING, RUNNING, STALLING, STOPPING, FAILED_START; starter torque, battery sag, starter disengagement, unsuccessful starts, cold/hot conditions.
- Real-time procedural sound: starter electric/mechanical whine, intermittent combustion during catch, phase-driven combustion pulses, exhaust/intake bands, valvetrain, mechanical noise, load-dependent timbre.
- Pause/restart/reset, deterministic seeds, instrumentation and basic 3D synchronization.
- Accessibility: keyboard controls, readable numeric display, reduce-motion option and graphics fallback.

- **Core M0 diagnostics before engine work:** simulation time scaling, pause/step/next-event, shared physics/audio clock mapping, typed telemetry registry, expandable debug menus, live waveform/FFT/spectrogram/RPM/torque/port graphs, bounded recording, local export/import, deterministic replay, A/B difference graphs and synthetic test harness.
- **Multi-page application:** Dashboard/Garage, step-by-step Builder, Drive/2D/3D, Audio Studio/Mixer, Diagnostics, Scenarios, Research, Experiments/Compare, Presets and Settings, with draggable/resizable/hideable floating debug widgets on compatible pages. Navigation never resets a running engine or audio.
- **Real-time generic model first:** physically valid baseline equations and a reusable, versioned approximation/model registry with optional data-driven correction coefficient/map slots before any expensive reference solver is developed. No trained profile is required to run a usable engine.

## P1: full dynamics and sonic detail
- Intake component graph: conventional plenums, variable runners, filters, carburetors, throttle bodies and ITBs; single/twin/sequential/compound turbo, multiple supercharger families, twincharging and charge cooling as individually verified models. Intake selection changes airflow, torque, transients and sound.
- Engine generations: mechanical/no ECU (carburetor, distributor, mechanical governor), injection/ECU/drive-by-wire and editable ECU map/strategy modules; later diesel, two-stroke, rotary, hybrid and EV models use distinct family modules.
- Battery SoC/temperature/internal resistance, starter electrical/mechanical wear, voltage sag, solenoid and alternator dynamics; failed crank/recovery scenarios.
- Connected transmission/drivetrain families: manual, automated manual/sequential, conventional auto with torque converter, DCT, CVT, later hybrid eCVT; FWD, RWD, AWD, selectable 4WD/4x4 with 2H/4H/4L, diffs, locks and traction, with bidirectional torque/load propagation.
- Calculated indicated/crank/wheel torque and kW/hp from physical state, losses and dynamometer/load models; no independent decorative HP curves.
- ECU speed control, soft/hard limiter fuel/spark cut and recovery with realistic hysteresis; no generic repeating machine-gun effect.
- Throttle tip-in/tip-out, overrun/fuel cut, engine braking, anti-lag/2-step where applicable, intake backfire and exhaust afterfire including stock/mild/aggressive pop-and-bang simulation tunes conditioned on fuel, oxygen, ignition and exhaust heat.
- Manual clutch/gearbox, auto-shift option, torque converter later, vehicle load, rolling resistance, aerodynamic drag and braking.
- Tire road-noise, grip/slip, chirp/squeal/burnout based on wheel rotational slip and forces; terrain/surface and speed.
- Gear change cut/torque interruption, rev-match and transition artifacts.
- Exhaust routing and resonators, muffler/catalyst attenuation, aspiration, proximity/occlusion and spatial listener viewpoints.
- Parameter automation curves, preset A/B, record/play scenario trace, in-browser export of WAV and session metrics (subject to budget).

## P2: calibration and advanced simulation
- User-selectable **Quick/Balanced/Detailed/Research** advanced reference fidelity, with independent validated overrides for cylinder gas/combustion zones, liner axial/radial wall layers, head and piston crown metal zones, inlet/exhaust runner cells and exhaust wall thermal sections.
- Adjustable time/crank-angle integration, numerical stability/conservation tolerances, mesh/time-step convergence, preflight estimate of memory/steps/trace size, browser Worker vs offline CLI choice, deterministic progress/cancel/checkpoints and visible solver-capability limits.
- Fit compact physically constrained real-time response/torque/acoustics models from high-fidelity event-aligned traces; the AudioWorklet never runs the expensive multi-zone solver. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).
- Offline high-fidelity combustion/thermodynamic and gas-flow approximations; richer resonator and wave models, parameter sensitivity sweeps.
- Real or synthetic reference dataset (licensed measurements only); measured RPM/load/temp/transient labels, device/microphone metadata, optional multiple mic positions.
- Automated calibration (coarse search then constrained optimization) of fast solver and synthesis parameters, uncertainty and regularization.
- Coverage-driven deterministic scenarios including pop-and-bang/afterfire, weak battery, worn starter, no-ECU and ECU behaviors, all supported cylinder-bank presets, induction combinations, 2WD/AWD/4WD/transmission modes, failed transitions and load conservation; objective spectral/temporal metrics and listener comparison.
- Model selection: simple lookup/splines, compact regression, small ML surrogate only if warranted. Preserve conservation laws and deterministic fallbacks.
- Browser import of validated trained profiles; reproducible training manifest and compatibility checks.

- **Very expensive reference computations are permitted:** highest fidelity can take hours/days of wall time per simulated piston cycle, using configurable all-core offline workers, checkpoints and streamed high-volume data with no artificial short wall-time scenario failures.
- **Experiment batches:** repeat same setup for numerical/seed validation; hold all else constant and alter one part/parameter; swap curated sets of parts; define sweeps, interactions, baseline/variant groups and event-gated scenario sequences; provenance includes every component, physical parameter and sound source.
- **Model simplification:** calibrate the already-working fast formulas from high-fidelity state/audio features into bounded equations, lookup surfaces and reusable model families for multiple physically compatible components. Store per-component bindings, validity regions, exact baseline/reference manifests and uncertainty, and compare them through the shared diagnostics system.

## P3: extensibility
- Diesel, rotary, two-stroke, motorcycle and EV powertrains require dedicated physics/sound modules; do not pretend four-stroke parameters model them faithfully.
- Configurable microphone/room/road/weather, doppler/spatialization and motion; multiple vehicles in a scene only after performance benchmarks.
- Editor plugins via documented extension interfaces, preset library, telemetry overlays and optional offline service worker.

## Technology coverage policy
The project aims to represent **all generations and major families of automotive technology over successive verified releases**, not claim that one initial build can physically simulate every historic or novel system. Registry contracts and versioned schemas permit new engine, fuel, control, induction, electrical, transmission and drive configurations. Each preset identifies implemented, approximate or planned components; unsupported combinations fail explicitly. See [14–20](14-modular-typescript-platform.md).

## Non-goals for first release
No authoritative engineering-grade engine certification, no claim of bit-identical audio between browsers, no server-side processing on GitHub Pages, no unrestricted neural audio inference in the real-time callback, no copyrighted sample redistribution.

## Success definition
For a validated preset, controlled input transitions produce physically coherent states, stable uninterrupted audio, repeatable automated traces and correctly synchronized 3D motion. A trained profile must improve explicitly measured held-out quality without regressions or exceed real-time CPU/memory budgets.

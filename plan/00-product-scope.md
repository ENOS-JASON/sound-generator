# 00 — Scope and feature inventory

## Experience
Interactive playable vehicle sound laboratory with 3D car/engine, start/stop/ignition, throttle, brake, clutch, gear selection, steering and configurable engine/drivetrain. Real-time RPM, torque, firing markers, sound components and state diagnostics. Save/load/share versioned presets (URL encoding for small profiles; local file import/export for larger ones).

## P0: foundation and engine/audio MVP
- Static GitHub Pages app, responsive UI, error/recovery states and first-run demo.
- Engine editor: cylinder count/layout, four-stroke cycle, displacement, compression proxy, inertia, friction, firing order and crank offsets, idle control, ignition and fueling maps; safe bounds/unit annotations.
- Explicit states: OFF, KEY_ON, CRANKING, FIRING, RUNNING, STALLING, STOPPING, FAILED_START; starter torque, battery sag, starter disengagement, unsuccessful starts, cold/hot conditions.
- Real-time procedural sound: starter electric/mechanical whine, intermittent combustion during catch, phase-driven combustion pulses, exhaust/intake bands, valvetrain, mechanical noise, load-dependent timbre.
- Pause/restart/reset, deterministic seeds, instrumentation and basic 3D synchronization.
- Accessibility: keyboard controls, readable numeric display, reduce-motion option and graphics fallback.

## P1: full dynamics and sonic detail
- Naturally aspirated baseline then turbo/supercharger; throttle body/manifold dynamics, lambda and spark proxies, misfire probability, cylinder imbalance, cold-start enrichment.
- ECU speed control, soft/hard limiter fuel/spark cut and recovery with realistic hysteresis; no generic repeating machine-gun effect.
- Throttle tip-in/tip-out, overrun/fuel cut, engine braking, anti-lag/2-step where applicable, backfire/afterfire with stored unburnt fuel/oxygen and temperature dependencies.
- Manual clutch/gearbox, auto-shift option, torque converter later, vehicle load, rolling resistance, aerodynamic drag and braking.
- Tire road-noise, grip/slip, chirp/squeal/burnout based on wheel rotational slip and forces; terrain/surface and speed.
- Gear change cut/torque interruption, rev-match and transition artifacts.
- Exhaust routing and resonators, muffler/catalyst attenuation, aspiration, proximity/occlusion and spatial listener viewpoints.
- Parameter automation curves, preset A/B, record/play scenario trace, in-browser export of WAV and session metrics (subject to budget).

## P2: calibration and advanced simulation
- Offline high-fidelity combustion/thermodynamic and gas-flow approximations; richer resonator and wave models, parameter sensitivity sweeps.
- Real or synthetic reference dataset (licensed measurements only); measured RPM/load/temp/transient labels, device/microphone metadata, optional multiple mic positions.
- Automated calibration (coarse search then constrained optimization) of fast solver and synthesis parameters, uncertainty and regularization.
- Coverage-driven deterministic scenarios including failed transitions; objective spectral/temporal metrics and listener comparison.
- Model selection: simple lookup/splines, compact regression, small ML surrogate only if warranted. Preserve conservation laws and deterministic fallbacks.
- Browser import of validated trained profiles; reproducible training manifest and compatibility checks.

## P3: extensibility
- Diesel, rotary, two-stroke, motorcycle and EV powertrains require dedicated physics/sound modules; do not pretend four-stroke parameters model them faithfully.
- Configurable microphone/room/road/weather, doppler/spatialization and motion; multiple vehicles in a scene only after performance benchmarks.
- Editor plugins via documented extension interfaces, preset library, telemetry overlays and optional offline service worker.

## Non-goals for first release
No authoritative engineering-grade engine certification, no claim of bit-identical audio between browsers, no server-side processing on GitHub Pages, no unrestricted neural audio inference in the real-time callback, no copyrighted sample redistribution.

## Success definition
For a validated preset, controlled input transitions produce physically coherent states, stable uninterrupted audio, repeatable automated traces and correctly synchronized 3D motion. A trained profile must improve explicitly measured held-out quality without regressions or exceed real-time CPU/memory budgets.

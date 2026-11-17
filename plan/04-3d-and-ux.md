# 04 — 3D visualization and tuning UI

## 3D modes
1. Whole vehicle: orbit/zoom, hood open/exploded mode, drivetrain/wheels and tailpipe positions; camera positions by cabin, engine bay, roadside and exhaust.
2. Engine cutaway: animate crankshaft, connecting rods, pistons, cams/valves, throttle and starter from shared crank angle; show cylinder combustion pulses in firing order.
3. Diagnostic overlay: highlighted active components, spark/fuel cut cylinders, mass-air/torque/load paths, wheel slip and instantaneous audio-source positions.
4. Performance fallback: low-polygon procedural mesh, static fallback/2D controls when WebGL is absent; don't block audio.

## Interaction
Transport: key-on, ignition/start hold/release, kill engine; throttle and brake pedals, clutch, gear controls, load/dyno selection, automatic/replay mode. Tuning groups: engine geometry, torque and friction, ECU, air/fuel, exhaust, audio, drivetrain, environment. Each knob has units, validated bounds, reset, tooltip/physical meaning and live values. Expose preset version, seed and model version. Advanced controls behind an expert toggle.

## Visualization consistency
- 3D observes interpolated authoritative angle, cylinder state and wheel speed; do not approximate combustion from visual clock.
- Slider values timestamped and sent to solver with smoothing; visual event highlights follow confirmed engine event stream.
- Render scales to viewport and quality preferences; avoid expensive shadows by default.
- Keyboard accessibility and non-3D diagnostics are required. Motion reduction disables camera effects, not physics.

## Editors/diagnostics
Graphs for RPM, torque, manifold pressure, engine temperature, wheel slip, audio spectrum, DSP load and event timeline; export logs for fitting/bug reproduction. Scenario editor displays waiting gate, timeouts and assertions. Training view compares reference-versus-fast model over held-out scenarios and exposes error/coverage. Autosave locally; file imports must be validated and size-limited.

## Deliverable gates
Running engine visuals follow timing and cylinder order; disabled graphics leaves engine/audio unaffected; responsive controls never inject audible discontinuities or drop worklet deadlines.

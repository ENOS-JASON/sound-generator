# 13 — Lightweight 2D engine cutaway by cylinder bank

**Status:** mandatory visualization mode, not a placeholder. Build it alongside 3D in **M3**, with the renderer contract defined in M0. Uses [04 — Visualization and UI](04-3d-and-ux.md), [02 — Engine physics](02-physics-model.md) and [11 — Event bus](11-event-bus-and-messaging.md).

## Core clock and slow-motion requirement

Both 2D Canvas and 3D views consume the **same authoritative simulation ticks, crank angle, valve states, airflow and combustion events** via read-only projections. Slow-motion control is provided by `SimulationClock` ([24](24-simulation-clock-and-time-scaling.md)), **not** a renderer-specific animation timer. At 0.05x, 0.1x, 0.25x or 0.5x, all cylinder-bank rows animate at the appropriately slowed presentation rate while retaining accurate physical phase and event causation; audio sound/event timing follows the same time map. Pause and crank-angle/next-event stepping must freeze/advance the exact same 2D/3D pose, not only the canvas. Changing view mode must preserve clock, engine, mixer, recording, event stream and diagnostics subscriptions.

## Switching and performance goals

Allow the user to switch at any time between:
1. **3D vehicle / engine** (full Three.js scene with orbit/cutaway).
2. **2D engine** (fully animated, side-on mechanical/flow diagram without WebGL).
3. **Minimal telemetry** (graphs/controls only; no continuously animated engine).

**Switching views must never reset, stop or perturb physics, scenario execution or audio**. A 2D mode should free/suspend avoidable Three.js render work, shadows and GPU resources; it must actually lower CPU/GPU workload rather than simply flattening a 3D canvas. For 2D favor Canvas 2D with cached static geometry and selective repaint/dirty regions, or SVG where validated by performance measurement; use adaptive refresh rates (e.g. 15/30/60 fps) independent of the solver and worklet. Respect reduced-motion preferences. Preserve controls and state on view changes.

## Non-negotiable layout: one side-view row per bank

Every engine bank must render as **one complete horizontal row of its cylinders**, seen from the **side/cutaway**. Display **all cylinders in every bank**, not one representative cylinder, and label each bank and cylinder.

```text
INLINE FOUR (one bank)
Bank 1  [Cyl 1] [Cyl 2] [Cyl 3] [Cyl 4]

V EIGHT (two banks, each viewed from its side)
Bank 1  [Cyl 1] [Cyl 3] [Cyl 5] [Cyl 7]
Bank 2  [Cyl 2] [Cyl 4] [Cyl 6] [Cyl 8]

FLAT SIX (two opposed banks)
Left   [Cyl L1] [Cyl L2] [Cyl L3]
Right  [Cyl R1] [Cyl R2] [Cyl R3]
```

The labels/assignments above are **illustrative**; actual cylinder IDs, firing order, bank membership and physical arrangement come from the preset's bank mapping. Each row is a side-on representation of that bank; for V/boxer, unfolded/aligned rows improve legibility but are labeled as schematic, and optional angles/mirrors indicate geometry. Do not infer bank membership just from odd/even cylinder IDs or hardcode layouts.

Layouts must support arbitrary cylinder counts, bank groups and spacing from the preset; virtualized/zoom/pan or horizontal scrolling at small widths without hiding a cylinder. Bank colors/labels must remain identifiable for accessibility without color alone.

## Detail required for **each** cylinder

Render and animate a complete mechanically meaningful cutaway, not just a piston icon:

- Cylinder wall/liner, combustion chamber, piston crown/skirt, piston rings (simplified acceptable), wrist pin, connecting rod, crank throw/crankshaft; animate piston stroke and rod angle from crank phase, rod length, crank radius and bank angle.
- Intake and exhaust runners/ports, **independent intake and exhaust valves** with visible valve head/stem, cam/rocker actuation and opening/closing lift. Render valve lift, valve timing and overlap from the modeled cam/valve events; avoid static decorative valve animations.
- Spark plug/spark event and fuel injector/mixture indicator for spark-ignition engines; reflect cut, misfire and failure-to-start (no fake firing flame). Adapt event visuals for other engine types when actually supported.
- Gas and mixture flow through **intake manifold -> intake valve -> chamber -> exhaust valve -> exhaust runner/manifold**. Direction, velocity/intensity and continuity derive from modeled mass-flow/pressure or approximations explicitly derived from engine state; use sparse arrows, trails or particles for airflow and exhaust, not a heavy fluid solver in 2D.
- Four-stroke phases: **intake, compression, power/expansion, exhaust** with 720° cycle and valve overlap. Show combustion energy/pressure with restrained chamber glow or pressure wave; compression does not equal combustion.
- Annotated live per-cylinder status: position/TDC/BDC, cycle stage, valve lift/open state, ignition/combustion/misfire, cylinder pressure/air-charge proxy and torque contribution where modeled.
- Shared crank, starter coupling/engagement, throttle/airbox path and exhaust collector optionally drawn as schematic connections across the bank rows.

### Visual honesty

- A cylinder with no fuel/ignition must show compression/motion and airflow as appropriate **without a combustion pulse**.
- In engine-off state, stationary valves/crank and absent airflow/firing; residual motion during coast-down follows actual state.
- Intake/exhaust valve timings respect four-stroke phase and camshaft half-speed operation. Where a physical subsystem has not yet been simulated, show a clearly labeled approximation rather than fabricate precise flows.
- Temperature/combustion and mass-flow visual intensities must map to solver quantities with defined units/normalization; visual animations must never drive the physics.

## Support for diverse engine families and configurations

Bank/cylinder maps are supplied by the engine family registry and must support single-cylinder through V12 inline/V/flat layouts with **one complete side-on horizontal row per configured bank**, correct cylinder order, crank phase and valve activity. The 2D renderer must not hard-code a V8 example or assume fixed cylinder index parity. Show mechanical choke, intake restriction, manifold pressure/ITB air flow, boost and exhaust energy only when relevant and actually modeled; reflect ignition, starter battery/wear, ECU cut/misfire and pop/afterfire event locations without phantom firing. Transmission/driveline torque information can appear in a separate schematic panel, never substituted for the cylinder cutaway. For later engine families **without physical piston/valves** (rotary, EV, turbine), register a corresponding specialized 2D projection rather than fabricate nonexistent cylinders/valves; declare its capabilities. See [14–18](14-modular-typescript-platform.md) and [20](20-torque-power-load-and-energy.md).

## Data and event integration

- 2D consumes the same **authoritative crank phase, cylinder states, per-cylinder valve lift/port mass flow/combustion markers and engine events** as the 3D view; neither renderer creates a second engine model.
- Define a `CylinderVisualState[]` read-only projection containing cylinder ID, bank ID, bank order/index, crank phase, piston displacement, rod angle, inlet/outlet valve lift, cycle stage, intake/exhaust flow sign and magnitude, charge/pressure/temperature proxies, ignition/firing/misfire and source event IDs.
- If physical solver lacks an explicit value, a projection utility may derive **kinematic visual geometry** deterministically from agreed crank/cam parameters. It must not invent physical combustion, pressure, mass flow or engine transitions.
- Project snapshots may be coalesced at rendering frequency, but discrete combustion/limiter/misfire markers retain event IDs and timestamps so they are not incorrectly repeated or dropped. A renderer can interpolate motion between snapshots.
- Renderer subscriptions are read-only and are created/teared down on mode switches; inactive renderers must not consume frame cycles.

## Optional offline research-zone inspector

The 2D real-time cutaway remains driven by compact, authoritative per-cylinder state; **do not attempt to render a high-resolution multi-zone CFD/thermal solver on the audio or UI frame thread**. An additional offline research inspector may display stored/streamed **cylinder burned/unburned/near-wall gas zones, liner axial/radial wall thermal grids, piston/head heat flux and valve mass flow**, plus intake/exhaust gas cells and metal wall bands from recorded reference traces. Label spatial zoning and solver fidelity honestly. Research overlay can be paused/downsampled independently and must not alter the live engine or its sound. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).

## On-page debug widgets and session comparison

A small drag/hide widget can show cylinder phase/valve lift, intake/exhaust flow, pressure, electrical starter data, one audio waveform/FFT or source level over the 2D/3D scene. Full Diagnostics and Compare pages offer larger graphs, imported recordings and baseline-vs-trained/reference overlays. These widgets are read-only and register through [25](25-core-diagnostics-recording-and-comparison.md) and [26](26-multipage-ui-and-floating-widgets.md), with throttled updates and no impact on rendering/physics when closed.

## User interaction

- Toggle 3D / 2D / Telemetry without restarting; keyboard-accessible mode selection.
- Show/hide layers: moving parts, valve mechanism, gas flow, combustion/pressure, crank/rods, annotations and cylinder highlights.
- Zoom/pan/select cylinder or bank; optional slow-motion **display** mode that does not alter physics/audio clock unless an explicit simulation playback speed control is separately invoked.
- Click a cylinder for detailed state and linked **audio-stem mixer channel** (e.g. cylinder combustion source); selection should not make it fire.
- Playback controls and throttle remain accessible in every view; optionally highlight starter, limiter and stalling events on the timeline.

## Performance and accessibility acceptance

- [ ] Four-cylinder inline engine displays exactly one horizontal side-view row with four individually animated chambers, pistons, intake valves and exhaust valves.
- [ ] V8 (or generic two-bank configuration) shows two distinct horizontal rows with all cylinders in correct bank order and firing timing.
- [ ] Boxer/flat engine has two properly labeled bank rows without incorrectly depicting one inline bank.
- [ ] Motion matches solver crank angle/720° firing phase; independent valves respect modeled lift/overlap; non-firing cylinder never appears to ignite.
- [ ] Visualize intake versus exhaust flow with correct direction; transitions at closed valves do not imply continuous flow.
- [ ] At least one load/speed scenario demonstrates visible changes in air charge/flow and combustion intensity; stalled engine shows no phantom firing.
- [ ] Switching 3D->2D->3D and to telemetry leaves engine RPM, physics event trace and audible output uninterrupted for an identical input schedule.
- [ ] 2D remains usable **without WebGL** and avoids running the 3D render loop while inactive.
- [ ] Measured CPU/GPU cost in 2D is lower than 3D on representative tested devices/configurations; document target hardware and profiling results instead of claiming universal speedups.
- [ ] Zoom/scroll preserves all cylinders and labels on smaller screens; animations honor reduced-motion and render throttling without corrupting physics.

## Implementation order

- **M0:** define bank/cylinder indexing, valve/flow projection schema, and visual renderer interface.
- **M1:** expose per-cylinder crank phase and four-stroke state plus physically meaningful valve/charge information as it becomes available.
- **M3:** implement complete 2D cutaway, bank rows, 2D/3D/telemetry switch and layer controls; validate with inline-four and V8.
- **M4:** extend detail for timing, cam profiles, forced induction, overrun and misfire as the corresponding physics exists.
- **M5–M8:** scenario screenshot/trace checks, accessible rendering and measured performance optimization.

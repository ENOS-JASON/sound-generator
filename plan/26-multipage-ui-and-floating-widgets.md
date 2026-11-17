# 26 — Multi-page UI and movable diagnostics widgets

**Required from M0.** This is a multi-page application, not one infinite page of controls. Browser navigation must work from the GitHub Pages subdirectory; use a router strategy that supports static hosting (e.g. hash routing or verified Pages fallback) and preserve the current simulation session across navigation.

## Page structure (proposed)

| Page | Primary use |
|---|---|
| **Dashboard / Garage** | Select/save vehicle/preset, recent sessions, quick start, current run status |
| **Vehicle Builder** | Guided step-by-step [configurator](22-guided-vehicle-configurator.md), bore/stroke, engines and component choices |
| **Drive / Simulation** | Live controls, time scale/pause/single-step, 3D/2D engine cutaway, compact RPM/torque readout |
| **Audio Studio / Mixer** | Source stems, buses, calibrated gain/effects, master and audio comparison |
| **Diagnostics / Telemetry** | Expandable debug menus and graph inspector for physical/audio/event values |
| **Scenarios** | Gated scenario editor, runner, results and timeline |
| **Training / Research** | Fidelity profile, expensive simulation jobs, multi-zone inspector, progress and resources |
| **Experiments / Compare** | Single-part variation sequences, repeated runs, sensitivity metrics, recordings/traces, baseline vs trained comparison |
| **Presets / Library** | Validated engine/vehicle/controller/mixer/experiment configurations and version history |
| **Settings / Help** | Audio device, rendering performance, model capabilities, storage, units and debug preferences |

Page names/routing are provisional; responsibilities and distinct navigation contexts are required. The **core simulation runtime is independent of the current route**: changing pages must not reconstruct the engine, AudioContext, event stream or current scenario. Use clear global run status and a compact always-available simulation/time-scale control in a navigation shell.

## Floating debug widgets

- Small **draggable, optionally resizable** widgets can overlay a page without obscuring essential engine controls. Examples: RPM/torque/power, crank phase/cylinder firing, sound waveform/FFT, per-stem level meters, fuel/pressure/airflow, battery/starter, wheel slip, active events, CPU/audio underruns, reference job progress.
- Each widget has pin/unpin, show/hide, collapse/minimize, layout reset, close, simple channel settings and optionally pop-out only if supported. Use a component registry rather than hard-code everything into a giant route component.
- Widgets can be enabled across several page contexts, with per-page placements or global-pinned choice; persist preferences **locally** by stable widget ID and screen/layout version. Reset on corruption rather than placing widgets off-screen.
- Drag and resize must be pointer/touch aware and keyboard accessible where possible. Constrain to viewport on mobile, prevent interactions from stealing throttle controls, and respect z-index/focus, dialog accessibility and reduced motion settings.
- Provide a **global toggle to hide all floating widgets**, and a visible way to restore them. Hidden widgets stop high-cost sampling/graph rendering.
- Pages own local presentation state; shared simulation runtime/trace/recorder remains single-owner and route-independent.

## Graph and UI architecture

- **Svelte + Vite is owner-approved** ([Round 1](decisions/USER-APPROVED-ROUND-01.md)); strict TypeScript throughout. `AG-M0-01` must propose the Svelte major version, router/state conventions and GitHub Pages navigation strategy for explicit approval where architectural. **Vue is not an option unless the owner changes the decision.**
- Keep a typed app-shell interface `PageRegistry`, `DebugWidgetRegistry`, `UiProjectionStore` and `GlobalRuntimeControls`; UI watches immutable throttled telemetry projections, not mutable solver buffers.
- Shared time-series graph widgets allow multiple channels, units, legend, zoom/scrub, live vs recorded vs reference/fast overlay and crosshair event anchors. Audio graphs include waveform, frequency spectrum and optional spectrogram.
- Diagram 3D/2D engine can be full-page or embedded panels; switching does not change physical state or audio timing.
- Inspector can create a floating widget from a selected graph/channel; small widget has lower refresh/data cost than full Diagnostics screen.
- Capability-aware availability: no ECU maps when none selected; absent transmission sources not shown as usable; zone research widgets only for imported/high-fidelity runs.
- Make simulation errors, missing required components and stale/incompatible training profiles visible without burying them behind advanced UI.

## Browser/static hosting constraints

- Static Vite bundle, no backend runtime; ensure Page reload on any navigable link under `/sound-generator/` works with selected router mode. Asset imports must respect base path.
- Configurator drafts, widget layout, short captures local-only; larger run data uses IndexedDB/chunked files and a transparent storage quota inspector.
- Browser tab/page visibility and audio suspension policies defined by the core clock; route changes are not engine pause events.
- Separate expensive training-job orchestration from UI; large offline CLI jobs can be run on a powerful machine and their artifacts imported for analysis.

## Delivery gates

- [ ] M0 app shell has at least **Dashboard, Drive, Diagnostics and Settings** routes and always-visible global runtime/time controls, before substantial engine physics.
- [ ] Mock signal and mock engine data can be inspected as waveform, spectrum, RPM and event graph on the Diagnostics route and in a floating widget.
- [ ] A movable waveform or RPM widget can be placed over the Drive/Builder screens, hidden and re-opened, with saved layout.
- [ ] Navigation among pages does not stop/reset a running mock or real simulation and does not disconnect its event or audio worklet.
- [ ] Floating widget refresh and capture costs are measurable and become minimal when hidden.
- [ ] M3 completes Builder, Audio Studio, 2D/3D Drive and session management; M5 adds Scenarios; M6/M7 adds Research/Experiments/Compare.
- [ ] Import of a recorded session shows its charts on Diagnostics/Compare, and the comparison can be launched without navigating back to the main engine page.

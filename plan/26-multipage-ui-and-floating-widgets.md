# 26 — Multi-page UI and movable diagnostics widgets

## O3 approved browser UI constraints

- **Advanced/Expert mode** is a **toggle without authentication**, not a security permission; editing stays limited to **calibrated gain trims with version/undo**, while ordinary source/bus/master faders remain separate. Do not create login, role, PIN or unlocked arbitrary EQ/DSP.
- **Listening mode** (cabin, engine bay, roadside, exhaust) is **independent of visual camera**. Rotating/moving 3D/2D view never changes source transfer. Display both camera and audio listener state separately.
- **Storage:** save configuration, mixer, calibration, widgets, scenarios and **bounded recent debug data** via IndexedDB; expose **configurable bounded historical snapshots** and manual ZIP backups. No unbounded research autosave.
- **Browser releases:** latest **two stable major desktop versions where available** of Chrome/Chromium, Firefox and Safari; list exact builds tested and honest missing macOS/Safari evidence.
- **Rendering:** 3D 30 FPS / Canvas 2D 60 FPS targets on an **agent-proposed mid-range desktop approved by the owner**; functional support on **owner i9 10th-gen + GTX1080** is mandatory and tested separately. Graphics FPS never controls the physics tick or audio deadlines.
- **Local research GUI** is a **CLI-launched web dashboard bound to loopback only** on Windows/Linux, not a Pages backend, public remote service or separately mandated native desktop app. See [O3 approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md).


## Round 3 browser workspace and controls

- **Factory/default:** first launch with no saved valid workspace selects **carburetor/mechanical/no-ECU I4**. The Builder/Presets page also provides a **complete editable EFI/ECU I4**. On reload a valid IndexedDB workspace selected EFI remains EFI; factory defaults never silently override it.
- **Persistence:** asynchronous versioned **IndexedDB autosave** for editable presets/drafts, scenario state, mix + expert calibration references, listener selection and widget layout; browser quota/corrupt-state recovery and explicit optional **ZIP snapshots**. No promise that browser autosave retains massive high-accuracy arrays.
- **Audio Studio:** an expert-only versioned **calibration trim editor** separate from normal per-source/bus/master faders, with safe validation/undo; plus a four-position **cabin, engine-bay, roadside, exhaust** listener selector that changes sound transfer only.
- **Presentation targets:** **3D 30 FPS, Canvas 2D 60 FPS on a declared reference desktop setup**. A physically correct engine/audio timeline continues regardless of GPU frames; support low-cost 2D and telemetry fallback.
- **Local research:** the Windows/Linux CLI has a separate **local graphical monitor** for lengthy studies; it is not a required web API endpoint or a permanent remote queue on GitHub Pages. See [Round 3](decisions/USER-APPROVED-ROUND-03.md).


## Round 2 — Binding UI behaviors

- The initial I4 Builder offers **two mutually exclusive, runnable control paths**: carburetor + mechanical distributor and *no ECU*, or EFI + ECU. Selecting a mode updates steps/fields/validation and sources, without exposing the absent controller's settings. Invalid imported presets are rejected by the same validator.
- New-session slow motion defaults to **physical pitch-lowered audio**; a clearly visible switch changes to pitch-preserved audio without changing simulation events, timing or RPM/torque. Do not misrepresent the other mode as unavailable when its DSP has passed tests.
- Desktop Chrome/Chromium, Firefox and Safari are the initial browser targets. When WebGL is unavailable or slow, offer **Canvas 2D/telemetry** rather than crashing. Browser audio still requires user gesture and must be error-reported.
- Navigation preserves the single runtime, audio, trace recording and draggable widgets; `/#/drive` is a route fragment, not a second absolute server path. See [approved Round 2](decisions/USER-APPROVED-ROUND-02.md).


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
| **Settings / Help** | Audio device, rendering performance, model capabilities, storage, **independent per-stat unit preferences** (and per-field/channel overrides), and debug preferences |

Page names/routing are provisional; responsibilities and distinct navigation contexts are required. The **core simulation runtime is independent of the current route**: changing pages must not reconstruct the engine, AudioContext, event stream or current scenario. Use clear global run status and a compact always-available simulation/time-scale control in a navigation shell.

## Floating debug widgets

- Small **draggable, optionally resizable** widgets can overlay a page without obscuring essential engine controls. Examples: RPM/torque/power, crank phase/cylinder firing, sound waveform/FFT, per-stem level meters, fuel/pressure/airflow, battery/starter, wheel slip, active events, CPU/audio underruns, reference job progress.
- Each widget has pin/unpin, show/hide, collapse/minimize, layout reset, close, simple channel settings and optionally pop-out only if supported. Use a component registry rather than hard-code everything into a giant route component.
- Widgets can be enabled across several page contexts, with per-page placements or global-pinned choice; persist preferences **locally** by stable widget ID and screen/layout version. Reset on corruption rather than placing widgets off-screen.
- Drag and resize must be pointer/touch aware and keyboard accessible where possible. Constrain to viewport on mobile, prevent interactions from stealing throttle controls, and respect z-index/focus, dialog accessibility and reduced motion settings.
- Provide a **global toggle to hide all floating widgets**, and a visible way to restore them. Hidden widgets stop high-cost sampling/graph rendering.
- Pages own local presentation state; shared simulation runtime/trace/recorder remains single-owner and route-independent.

## Graph and UI architecture

- **Svelte + Vite with hash-based navigation is owner-approved** ([Round 1](decisions/USER-APPROVED-ROUND-01.md), [Round 2](decisions/USER-APPROVED-ROUND-02.md)); strict TypeScript throughout. Published URLs are under `/sound-generator/#/...`; refresh and direct links work without server rewrites. `AG-M0-01` still owns the Svelte major version, specific hash-router library and store conventions; major new architectural selections require owner approval. **Vue and clean-history routes are not authorized alternatives.**
- Keep a typed app-shell interface `PageRegistry`, `DebugWidgetRegistry`, `UiProjectionStore` and `GlobalRuntimeControls`; UI watches immutable throttled telemetry projections, not mutable solver buffers.
- Shared time-series graph widgets allow multiple channels, **per-stat independently selected compatible units** with visible axis/tooltip/legend unit labels and preserved SI source data, zoom/scrub, live vs recorded vs reference/fast overlay and crosshair event anchors. Two channels of the same quantity may use different user-selected display units. Audio graphs include waveform, frequency spectrum and optional spectrogram.
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
- [ ] Settings supports simultaneous independent power/torque/pressure/etc. units and channel-specific overrides, restores them from the workspace and does not modify live solver outputs; all visible gauges/graphs/wizard fields use consistent labels.
- [ ] M3 completes Builder, Audio Studio, 2D/3D Drive and session management; M5 adds Scenarios; M6/M7 adds Research/Experiments/Compare.
- [ ] Import of a recorded session shows its charts on Diagnostics/Compare, and the comparison can be launched without navigating back to the main engine page.

# 01 — Runtime architecture and deployment

## Data flow
```text
User / Scenario Driver --> timestamped commands --> Engine Control + Deterministic Fixed-Step Solver
                                                        |             |
                                                   state/events       +--> telemetry snapshots --> 3D scene/UI
                                                        |
                                         event queue and phase/time basis
                                                        v
                                           AudioWorklet DSP renderer --> Web Audio output
                                                        ^
                                     validated trained model coefficients

Offline high-fidelity reference solver --> scenario dataset --> optimizer --> validated trained profile
```

## Authoritative shared event bus

**Mandatory from M0/M1:** the system has one logically shared, typed event protocol and a single authoritative producer of domain events per simulation run. A deterministic command scheduler applies validated UI/scenario actions at simulation-tick boundaries; the engine/ECU/drivetrain emits an ordered causal event stream. Audio, UI, 3D, scenario gates and training consume those events or read-only state snapshots; they do not fabricate or mutate engine state. Use local synchronous dispatch inside the solver and bounded `MessagePort` bridges between main thread, Worker and AudioWorklet. Cross-thread communication must be asynchronous and cannot be a shared singleton object. High-frequency audio excitation stays local to the worklet and is derived from phase/events, avoiding round trips through the main thread.

Enforce typed command/event envelopes, IDs, simulation ticks/sample frames, causation/correlation IDs, sequence gap detection, bounded queues, critical-event preservation and telemetry coalescing. The engine event log drives replay and scenario gates. See **[11 — Shared Event Bus and Messaging](11-event-bus-and-messaging.md)** for authoritative contract, topology and acceptance tests.

## Composable technology and load architecture

The project uses **strict TypeScript interfaces, composition and independently replaceable component classes**, with pure numerical calculation kernels; this is the proposed foundation, with concrete UI framework selection still open. Presets compose engine family/cylinder bank geometry, control strategy (mechanical/no ECU or ECU), intake and compressor graph, electrical/starter, auxiliaries, transmission/transfer/differential/wheels and audio models. Every component declares physical ports and units; coupled rotational/energy calculations account for loads all the way from contact patch and accessories back to crankshaft, without arbitrary global RPM or HP tables. New historical/modern families register through a capability registry and advertise fidelity. See [14](14-modular-typescript-platform.md), [15](15-engine-families-and-presets.md), [16](16-intake-induction-and-exhaust.md), [17](17-transmissions-drivetrains-and-wheels.md), [18](18-electrical-control-generations-and-tunes.md) and [20](20-torque-power-load-and-energy.md).

The UI selects between 3D, **2D canvas cutaway with one horizontal row per bank**, and telemetry-only mode. Only the active renderer updates. Audio has per-physical-source calibrated stems, category buses and independently adjustable master mix; neither mixers nor renderers change physics. See [12](12-audio-gain-staging-and-mixer.md) and [13](13-2d-engine-cutaway.md).

## Wizard validation and multi-fidelity reference subsystems

The configurator is a **step-by-step, capability-driven wizard** and the only supported guided editing path for engine, bore/stroke and derived displacement, induction topology, controller, transmission and wheel-drive configuration. Field visibility, permitted values and required steps derive from the same registry/validators as preset import and model instantiation; incompatible edits present the impact and preserve valid overrides. See [22](22-guided-vehicle-configurator.md).

The high-fidelity reference solver has **separate configurable multi-zone components** for cylinder burned/unburned gas, metal liner/head/piston wall bands and layers, intake/exhaust 1D gas cells and segmented wall heat transfer, coupled via validated mass/energy/thermal ports. Adjustable timestep/CFL and convergence checks, resource preflight and Worker/offline CLI execution belong outside the real-time AudioWorklet. Training outputs only compact validated coefficients and manifests. See [21](21-adjustable-fidelity-multizone-reference-simulation.md).

## Core clock, diagnostics and UI shell (build before physics)

**M0 is gated on working instrumentation.** Define a `SimulationClock` with authoritative fixed simulation tick and time scale (0 pause, below 1 slow-motion) mapped to AudioWorklet sample frames and interpolated 3D/Canvas2D rendering. Keep physical state/RPM in simulated seconds; stretching playback cannot change the equations, firing order or event trace. Add pause/resume and bounded tick/crank-angle/next-event stepping, recording the scale transition. See [24](24-simulation-clock-and-time-scaling.md).

Build a typed `TelemetryRegistry`, `DiagnosticsHub`, non-blocking `TraceRecorder`, `AudioCaptureService`, `ReplayController`, `ComparisonEngine` and `GraphInspector` with per-component debug registration. Verify real waveform/FFT/audio meter and synthetic physics charts, export/import/replay/comparison **before adding production physics**. Closed debug menus must not burden the worklet. See [25](25-core-diagnostics-recording-and-comparison.md).

A static multi-route app shell hosts Dashboard, Drive, Diagnostics and Settings from M0, then Builder, Audio Studio, Scenarios, Research and Compare. Small diagnostics widgets are draggable, hideable and locally persistent, while the engine/clock/audio runtime outlives page navigation. See [26](26-multipage-ui-and-floating-widgets.md).

## Fast-first, offline-reference compatible numerical architecture

`VehicleDefinition`, typed physical-port contracts and a reusable `ApproximationRegistry` own *baseline analytical* fast equations and optional per-component coefficient/map bindings from M0. M1/M2 delivers a working sound-generating engine independent of M6/M7 training. High-fidelity solver projections use the same boundary units/IDs/events and canonical scenario commands, then fit compact constrained formulas/lookup tables for the real-time engine; shared equation kernels can serve multiple compatible components. See [28](28-shared-realtime-surrogates-and-calibration.md).

Research jobs may take **hours per piston cycle**, execute on a dedicated multicore offline Node/compiled backend with configurable thread count and resumable chunked outputs, and batch repeated baseline/one-part/part-set variations with exact component manifests and sound-source provenance. They never execute inside AudioWorklet or UI frame loops. See [27](27-high-fidelity-experiment-orchestration.md).

## Ownership and timing
- **Simulation tick/clock is canonical for physics and scenario events; AudioWorklet sample frames are canonical for audible output.** Time-scale control maps one timeline continuously to the other; derive cylinder firing and exhaust pulses from cumulative crank angle, never requestAnimationFrame. Map commands/events to precise audio sample frames with ordering and correlation.
- Real-time engine dynamics advance at a fixed integrator timestep with bounded catch-up; audio synthesis uses phase-accurate interpolation between state snapshots. Decide whether the fast solver runs entirely inside AudioWorklet or uses a lock-free SharedArrayBuffer ring buffer (requires cross-origin isolation); default to Worklet-owned minimal solver to avoid isolation requirements on GitHub Pages.
- Renderer uses requestAnimationFrame and interpolation/extrapolation of recent snapshots; never writes physics state, never blocks audio.
- Main thread processes UI input and scenario editing; Worker handles expensive processing. AudioWorklet has no DOM access and must avoid allocation, network and unbounded work in process().
- Use bounded queues with sequence numbers, late-command handling, sample time stamps and overflow policies; distinguish simulated clock versus wall time.
- Simulation supports deterministic headless mode with a virtual fixed clock for reproducible evaluation. Trace format logs input events, state transitions, seeds, profile versions and numerical tolerances.

## Modules (proposed)
```text
src/
  app/                 # shell, state management and UI
  core/                # units, deterministic math, integrators, seeded PRNG
  clock/               # scale/step/pause, simulated-to-audio-time mapping
  diagnostics/         # telemetry registry, trace recorder, graph/analyzer, import/diff
  approximations/      # shared analytic kernels, bounded map/correction model registry
  events/              # typed command/event maps, deterministic bus, recorder, transport adapters
  engines/             # engine family providers, bank geometry, crank and cylinder models
  controls/            # mechanical, carb/distributor, ECU/TCU and control strategies
  intake/              # filters, throttles, runners, compressors, charge coolers
  exhaust/             # headers, turbines, afterfire, thermal, aftertreatment
  electrical/          # battery, starter, alternator and accessories
  driveline/            # clutches, converter, gearboxes, transfer, diffs, wheels
  physics-ports/        # coupled rotational/air/electrical/thermal graph and energy ledger
  dsp/                 # procedural source, filters, resonators, mixing
  audio/               # worklet/host, command/event transport
  visualization/       # Three.js, Canvas2D bank cutaway, telemetry projection
  ui-shell/            # multi-page navigation, dockable/drag/hide debug widgets
  scenarios/           # schema, scheduler, predicates, assertions
  profiles/            # versioned preset, validation, import/export
  configurator/        # wizard step descriptors, capabilities, conditions, geometry derivations and draft validation
  reference/           # offline multi-fidelity gas/combustion, wall/thermal, 1D flow and numerical solvers
  training/            # offline sweeps, surrogate fitting, convergence and holdout validation
  experiments/         # one-part/part-set study definitions, batch scheduler, paired diffs
  offline-cli/         # Node worker_threads high-fidelity runner and checkpoints
  testing/             # scenario fixtures, metrics, benchmarks
public/
  models/              # locally bundled lightweight optional 3D assets
plan/
```

## Static deployment
- Vite, TS, Three.js, Web Audio API; no required runtime server/database.
- Set Vite `base: '/sound-generator/'`; use relative import paths and `new URL(..., import.meta.url)` for AudioWorklet modules/assets; verify generated paths after build.
- GitHub Actions build/test and upload Pages artifact; request `pages: write`, `id-token: write` only where required for deployment.
- Serve under HTTPS (required for AudioWorklet secure context), initiate/resume AudioContext from explicit user gesture, show suspended/device unsupported states.
- Progressive capability flags for WebGL/WebGPU availability, workers, WASM SIMD and cross-origin isolation. Standard Workers do not need SharedArrayBuffer. No external CDN or runtime telemetry required.

## Performance budgets (targets, validate per device)
Audio: 48kHz preferred but honor actual AudioContext.sampleRate; callback must finish comfortably before its render deadline (~2.67ms for 128 frames at 48kHz). Avoid main-thread blocking and garbage collector pressure. Initial target: sustained audio underruns = 0 in acceptance runs; graceful quality levels on weaker devices. 3D target 60fps on desktop, 30fps fallback; benchmark rather than guarantee. Training never runs in the audio callback.

## Resource and fidelity invariants
- Only the fast browser model participates in real-time audio; user-selected multi-zone detail never increases AudioWorklet DSP load.
- Higher spatial/temporal fidelity is subject to numerical convergence and measured validation, not assumed to be truth. Profile hashes, mesh topology and model versions accompany all training outputs.
- In the UI, only enabled/valid technology combinations become runnable; schema validators enforce the same invariants for direct preset imports and headless scenarios.

## Design invariants
- Schema compatibility is explicit, never silent.
- All stochastic synthesis comes from seeded generators and sample time.
- Source event has a unique id, timestamp/angle and cause; no synthesizer may fabricate a state transition.
- Pause/reset/seek semantics distinguish engine state from audio mute.

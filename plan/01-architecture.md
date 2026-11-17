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

## Ownership and timing
- **Audio clock is canonical for audible events**; derive piston firing and exhaust pulses from cumulative crank angle, not requestAnimationFrame RPM snapshots. Establish timestamp synchronization of control commands to audio sample frames.
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
  scenarios/           # schema, scheduler, predicates, assertions
  profiles/            # versioned preset, validation, import/export
  training/            # offline reference, search, validation
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

## Design invariants
- Schema compatibility is explicit, never silent.
- All stochastic synthesis comes from seeded generators and sample time.
- Source event has a unique id, timestamp/angle and cause; no synthesizer may fabricate a state transition.
- Pause/reset/seek semantics distinguish engine state from audio mute.

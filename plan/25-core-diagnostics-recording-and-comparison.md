# 25 — Mandatory core diagnostics, record/replay, charts and comparison

## Round 2 — Portable capture, recorded measurement policy and support targets

All browser data exports/imports must be a **ZIP** archive with JSON manifest plus versioned typed chunked commands/events/telemetry, hashes/checksums and optional **generated** output/audio stems. The implementation must enforce archive size/decompression/version/schema limits, mark incomplete or missing channels and retain clock, selected controller, calibration/provenance, slow-motion mode and event identity. No single-gigantic-memory-buffer assumption. Offline research may optionally export **Parquet/HDF5**, but browser use never depends on such scientific codecs. `AG-M0-13` defines exact ZIP layout and test fixtures; `AG-M6D-05` preserves matching metadata.

**Real-world recorded sounds are reference analysis only**: their features may be imported and compared against synthesized source spectra/transients, but no recorded-car audio becomes a generated playback source, a stem or an in-app reference audio player. Generated-audio captures can still be exported/replayed to diagnose this tool's own output. Report what was `simulation-estimate` vs numerically validated vs measurement-compared, with uncertainty, measured conditions and data provenance. Browser diagnostics and fallback must work in desktop Chromium, Firefox and Safari. See [Round 2](decisions/USER-APPROVED-ROUND-02.md).


**Priority: M0 acceptance gate.** Build the debugging and instrumentation infrastructure **before implementing substantial engine/audio/vehicle physics**. A minimal mock/fixed-step simulator and synthetic AudioWorklet signal are sufficient to test the initial diagnostics stack. It must be usable while the actual modules arrive, without requiring retrofitting each subsystem later.

## Runtime core services

| Service | Responsibility |
|---|---|
| `DiagnosticsHub` | Unified subscription/filter/visibility for typed physics, audio, engine, electrical, intake/exhaust, drivetrain, scenarios and training diagnostics |
| `TelemetryRegistry` | Named channels with units, owners, timestamps, sampling policy, bounds, precision, feature availability and recorder routing |
| `TraceRecorder` | Capture commands, time-scale changes, state snapshots, typed domain events and diagnostics with bounded buffers |
| `AudioCaptureService` | Optional sample-accurate master or selected stems, per-stem peak/RMS and FFT/spectral features, controlled data export |
| `ReplayController` | Deterministic engine re-run, imported telemetry playback and imported audio playback as three **explicitly distinct modes** |
| `ComparisonEngine` | Align and compare traces, trained models, engine configurations, individual component variations, events and audio features |
| `GraphInspector` | Inspect/live-plot recorded time series, engine/system energy ledgers, waveform, FFT, spectrogram and moving metrics |
| `DebugPanelRegistry` | Component-registered debug menus/widgets with open/close, filter, persist layout, hide, drag and performance-aware updates |

**Registration is mandatory** for new components: declare physics telemetry, causal events, performance counters, optional audio sources, units/ranges and debug-panel capabilities in a typed manifest. No debug panels directly mutate authoritative physics; optional debug commands go through the central validated command router and are captured.

## Openable and closable debug menus

- Dedicated **Diagnostics** page with collapsible sections (Engine / Per-cylinder / Air & Combustion / ECU / Starter & Battery / Intake / Exhaust / Drivetrain / Tires / Audio Sources & Mixer / Event Bus / Scenario Gates / Clock / Reference Training / CPU-Memory).
- Quick floating debug widgets can be pinned to the **Drive**, **3D/2D**, **Mixer**, **Builder** and other pages. Each supports drag, optional resize, minimize, hide, reset layout and component-specific channel selection. See [26](26-multipage-ui-and-floating-widgets.md).
- Main inspector supports filter/search by component ID, channel, physical unit, event type, time range and run ID; display raw inputs, derived values and supporting calculation source/explanation.
- Debug settings are read-only by default. Feature overrides (disable one component, controlled fake fault, adjusted parameter) must be represented as **explicit scenario/debug commands** and clearly marked so exported traces remain reproducible.

## Physics diagnostics

- Crank angle, RPM, per-cylinder torque, compression, temperature, air mass/pressure/valve lift/flow, event phase, starter torque and current, battery voltage/SoC, friction, pumping, accessory and alternator load.
- Component-by-component sign-consistent **power/energy ledger**: indicated/brake torque/hp, crank inertia, compressor/auxiliary power, clutch/converter/gear ratios, shaft/axle/wheel torque, traction, aero, road/grade and brakes.
- Residual charts for mass, energy, power, numerical integrations, signal/port consistency and constraint violations; record exact component and tick causing a broken conservation invariant.
- Show configured model fidelity/approximations and missing sensor/solver values; never fabricate fields just to populate graph lines.

## Audio diagnostics

- **Per-stem and per-bus pre/post-fader peak/RMS**, headroom and clipping, master metering, source gain/solo/mute/routing, limiter activity and output-safety state.
- Live sampled **waveform** (time domain), **FFT spectrum**, **spectrogram**, harmonic orders/cylinder firing cadence, transients, afterfire event markers, envelope and source/bus mixing curves; never send every raw audio sample through a main-thread postMessage.
- AudioWorklet sample rate, frames processed, average/peak render duration where measurable, overrun/dropout/gap counters, GC/alloc warning proxy, command lateness and clock alignment drift.
- Optional bounded capture of master and selected source stems to WAV or efficient channel chunks for offline listening/comparison. Analyze at controlled UI refresh rates and prefer reusable typed arrays or worklet-side feature summarization.
- Correlate sound generation and gain with authoritative physical event IDs, source IDs and sim/audio sample clocks. Sound graphs cannot invent physical events.

## Recorder, storage and exports

A single **portable capture bundle** should contain:
- `manifest.json`: schema version; `runId`, engine/vehicle/topology and component IDs/types/parameters/configuration hashes; solver/DSP/renderer/ECU versions; trained model/profile/version/hash; seed, floating-point tolerances; environment, sample rate; clock mappings and time-scale changes; scenario/preset/command timeline; channel catalog and units.
- Ordered domain-event stream including sequence IDs and causation links; selected state/port telemetry chunks; diagnostic/performance counters and numerical failure reports.
- Optional audio master/stem captures (`wav`, float32, or lossless chunks), FFT summary data, graphs/spectrogram analysis and visual snapshots when enabled; explicitly flag absent or dropped channels.
- `integrity.json` with checksums, artifact structure sizes, data-shape and compression metadata. Prefer a single archive or manifest plus referenced binary chunks; no executable content. Keep source code out of exports by default but store model revision/hash.
- Recording profiles: **Minimal** (events/commands/state checkpoints), **Standard** (tunable telemetry), **Deep** (high-frequency per-cylinder/port/audio features), **Audio Stems** (selected channels) and **Research** (offline zone traces). Each previews memory, storage and data rate.

**Bound capture memory and output**: small rolling in-memory ring buffers for live graphs, chunked writes to IndexedDB/streaming file where supported, per-channel sampling/downsampling and explicit start/stop. Never block the audio callback; if critical history is lost report it and mark affected capture incomplete, rather than claiming determinism.

## Replay/import/comparison

1. **Import** validates versions, provenance, checksums, types, sizes, units and component compatibility; unsupported/malformed data is reported rather than executed. No JavaScript eval or unchecked JSON-to-class hydration.
2. **Raw telemetry playback:** load recorded values and graphs without running physics, with seek, simulated-time speed and event/cylinder-phase alignment; mark read-only.
3. **Deterministic physics replay:** recreate same initial state/seed/commands and versioned presets, re-run fast solver at chosen time scale and compare channels and ordered events by simulation tick; report version mismatches and numerical tolerance rather than guaranteeing bit-exact cross-browser floats.
4. **Audio playback:** replay recorded sound from file and compare waveform/spectrum/stems using aligned sample clocks; does not itself prove a physics model reproduced the sound.
5. **Comparison mode:** A/B and optional many-run overlays; difference curves, peak/absolute/relative error, RMS/quantile/worst-case errors, threshold exceedance, event timing discrepancies, energy/torque/mass residuals and audio FFT/temporal/harmonic features. Select alignment key: simulated time, normalized crank angle, event anchor or audio-frame where valid.
6. **Model comparison:** fast baseline vs tuned surrogate vs high-fidelity reference and before/after a component change, using exact component configs and scenario hashes. Distinguish *physics* changes, *audio DSP/mixer* changes and *only renderer UI* changes.

## Diagnostics cost and reliability

- Closed panels should not trigger full-resolution FFT, heavy snapshots, 3D drawing or unbounded trace production. A small always-on critical fault/event counter remains available, with optional rolling ring buffer.
- Instrumentation sampling rates are declared per channel; meter and graph refresh throttled independently of physics/audio; no heavy readback in AudioWorklet process().
- If a recorder fails, physics/audio should continue in live mode where safe, but any scenario or benchmark depending on critical missing data must **fail/invalidate**, never falsely pass.
- Capture the current page and visible debug widget layout as UI-only metadata, not authoritative physics.
- Give imports explicit file-size limits and cancellation, clear errors, and privacy-first local-only behavior (no required upload/telemetry service on GitHub Pages).

## M0/M1 early vertical slice and acceptance

**M0 first:**
- [ ] TypeScript telemetry/event/debug schemas, registration APIs and component IDs built and type-tested.
- [ ] Core time controls and timeline graph with a deterministic synthetic physics oscillator; `0.1x/1x/pause/step` tested.
- [ ] Synthetic AudioWorklet signal -> waveform, FFT, per-source/mix meter, A/V time correlation and non-blocking output.
- [ ] Open/close physics/audio/clock/event/debug menus; floating widget shell with drag/hide and throttled updates; multi-page Diagnostics and Drive shell.
- [ ] Record, export, reimport and display a **portable synthetic test capture**, then re-run and compare within tolerance; capture errors and deleted/malformed channels surfaced.
- [ ] Core diagnostics CI gates prove startup, memory bounds, no simulation mutation from observers and event ordering; this is **blocking before M1**.

**M1/M2 expansion:** subscribe actual cylinder/engine/ECU/air/gear physics and procedural audio sources into the existing registries. New components must include telemetry and replay hooks when introduced, not add a separate ad hoc logging system.

**Later:** component heat-map correlation, advanced 1D/multi-zone research traces, audio stem differences, scenario batch results and trained-model calibration plots. Core APIs stay the same.

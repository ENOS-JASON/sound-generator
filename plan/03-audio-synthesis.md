# 03 — Real-time procedural audio

## Objective
Sound is computed from simulated mechanical and thermodynamic events, not looping clips whose pitch is controlled by RPM. Prioritize convincing transients and phase coherence before adding many layers.

## Sources and signal chain
- Starter motor harmonics from starter speed/load, starter engagement impact, cranking compression/cylinder resistance.
- Combustion: per-cylinder, crank-phase-triggered pulse train with envelope, stochastic but seeded cycle variation, harmonics, spectral tilt and load/fuel/temperature dependence; model exhaust pulses separately from block excitation.
- Intake: pulsation, throttle/airflow broadband turbulence, manifold/filter resonances and throttle tip dynamics.
- Exhaust: cylinder pulse propagation, configurable header delay/merging, resonator/muffler filters, tailpipe radiation, overrun and thermal afterfire transients.
- Engine mechanics: valvetrain ticking, timing chain/gear, injector, accessory whine, bearing/gear noise, engine mounting vibration.
- Drivetrain, tire/road: gear whine linked to gear forces, tire noise by speed, slip/traction chirps and squeal, surface-dependent noise.
- Spatial: positions for engine bay/intake/exhaust/wheels, distance attenuation and optional first-order stereo/doppler/spatial effects; multiple microphones/camera views later.

## All-era source coverage and mixer requirements

Every physical mechanism that emits independently meaningful sound has a stable **calibrated full-reference source** with user gain/mute/solo and meters, routed through category buses and a master. Source generation runs at healthy reference levels (not arbitrarily weak then amplified), but proper headroom and attenuation preserve physically quieter operating states. Per-cylinder and per-bank voices reflect firing layout, vibration, intake runner and exhaust collector geometry. Add source families for carb/ITB/open airbox, turbo shaft/whistle/wastegate/BOV, supercharger types, afterfire/intake backfire, old distributor/starter solenoid and worn motor, gearboxes/converters/CVT/DCT, transfer/diffs, wheels and optionally hybrid/EV motors. The exact sounds are conditional on implemented physical states; unsupported features never emit fake cues. See [12](12-audio-gain-staging-and-mixer.md), [15](15-engine-families-and-presets.md), [16](16-intake-induction-and-exhaust.md), [17](17-transmissions-drivetrains-and-wheels.md) and [18](18-electrical-control-generations-and-tunes.md).

## Event bus consumption

The synthesizer uses physically authored engine events, phase information and state from the canonical bus contract in [11](11-event-bus-and-messaging.md). On-worklet per-cylinder excitation is local and sample accurate; the main thread never serves as an audio-rate relay. Every afterfire, misfire, limiter cut, shift transient or stall cue has a matching causal engine/ECU/drivetrain event or state, rather than being issued independently by the UI. Outbound telemetry is bounded and can be coalesced; the audible render cannot block waiting for other subscribers.

## Live playback time scaling and diagnostic instrumentation

The core [SimulationClock](24-simulation-clock-and-time-scaling.md) controls slow-motion/pause/step for the **entire** physical simulation and sound. An audible crank/combustion/afterfire event is mapped from authoritative simulated crank phase to AudioWorklet sample frames with continuous phase across changes (0.05x/0.1x/0.25x/0.5x/1x). **Two owner-approved modes** must exist: physical slow motion lowers pitch/cadence, and pitch-preserving inspection uses additional time-stretch DSP while retaining the same physical event timing. A switch controls audio rendering only; **physical slowdown/lowered pitch is the approved initial default**, while pitch preservation is selectable. See [Round 1](decisions/USER-APPROVED-ROUND-01.md) and [Round 2](decisions/USER-APPROVED-ROUND-02.md). An audio worklet may never depend on 2D/3D framerate and must be safe while step-paused and muted. Time scaling cannot change true RPM/torque values in simulated seconds.

The [DiagnosticsHub and AudioCaptureService](25-core-diagnostics-recording-and-comparison.md) need **per-source and per-bus waveform, FFT/spectrum/spectrogram, peak/RMS and headroom/clipping traces**, event/cylinder causation IDs, sample-frame drift, worklet CPU/dropouts and bounded raw stem capture. Recording and graphing are optional low-priority paths, not blocking worklet processing. From M0 implement a synthetic signal into the meters and record/reimport/compare chain; add actual procedural stems in M2, including fast vs tuned vs reference comparisons. Preserve amplitude/timbre physics independently from user mixer faders; see [12](12-audio-gain-staging-and-mixer.md).

A high-fidelity reference job may produce separate **source pressure-impulse and spectral descriptors** tagged by originating physical component. The generic DSP model is built first; M7 modifies its calibrated compact source transfer models and reusable equations/maps, never requires multi-zone data in the real-time worklet. See [28](28-shared-realtime-surrogates-and-calibration.md).

## DSP rules
- AudioWorklet renders into current sample rate; use cumulative unwrapped crank phase and schedule impulses when firing angles cross the sample interval, including low-speed, zero-speed and rapid acceleration.
- Preserve oscillator phase, envelopes and filter state through changing RPM; smoothing on physical controls, oversampling/anti-aliasing where justified.
- Stable filters with bounded coefficients, no NaNs/infinities, normalized gain/headroom and gentle limiter strictly for output safety (not rev limiter mechanics).
- DSP should not call the expensive reference solver, allocate on hot path, read mutable UI objects or wait for 3D.
- Support mute/solo of stems, audio component meters, synchronized offline bounce, output capture, deterministic seed and profile comparisons.
- Avoid unsafe playback volume; handle audio device changes, suspended context and sample-rate variations.

## Initial DSP prototypes
1. Audible starter and intermittent compression/firing as crank speed changes.
2. Phase-coherent cylinder impulse synthesizer including multiple firing orders and odd-fire options.
3. Engine-block mechanical resonator and pressure-dependent intake/exhaust resonators.
4. Stable overrun, limiter cut/recovery, shift cut, stall transients and afterfire events.
5. Mixing, mic model, spatialization, A/B and WAV export.

## Causal loudness and source coherence

Toggling a physical intake/boost configuration must change its pressure/flow/shaft and resulting audio events, not just switch EQ. A no-ECU carburetor should not generate electronic rev-cut sounds. Pop-and-bang tunes require eligible exhaust event flags, temperature/residual fuel and actual event IDs. Mixer changes must not alter crank torque, vehicle speed or scenario outcome. Compare spectral and temporal signatures by engine family, controller and drivetrain configuration rather than assuming identical sound at a common RPM.

## Test metrics
Compare temporal pulse spacing, firing-order sidebands, RPM/load timbral envelope, spectral centroid/rolloff, octave-band energy, modulation spectrum, transient timing, noise floor and clipping rate. Align recordings by crank/marker events before comparing; waveform MSE alone is inadequate. Listening panels complement metrics. Evaluate at 44.1/48/96 kHz where supported.

## Sample references
**Owner-approved: no real-world recordings may be used for generated playback**, including sampled/looped stems or recording-based transients. Licensed/authorized external recordings can be imported to analyze/calibrate/validate waveforms, spectral features and timing only. A generated-output WAV capture is a diagnostic artifact, not permission to mix real recorded samples into the live synthesizer; do not add a playback player for reference-recording imports. See [Round 2](decisions/USER-APPROVED-ROUND-02.md).

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

## Test metrics
Compare temporal pulse spacing, firing-order sidebands, RPM/load timbral envelope, spectral centroid/rolloff, octave-band energy, modulation spectrum, transient timing, noise floor and clipping rate. Align recordings by crank/marker events before comparing; waveform MSE alone is inadequate. Listening panels complement metrics. Evaluate at 44.1/48/96 kHz where supported.

## Sample references
External recordings are optional evaluation inputs only, must be licensed for the intended use, and are never embedded without permission.

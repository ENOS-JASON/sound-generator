# 12 — Audio gain staging, sources, and master mixing

**Status:** required design. **Priority:** source gain architecture at M2; full mixer editor in M3 and M4. This extends [03 — Audio synthesis](03-audio-synthesis.md) and uses the event contract in [11](11-event-bus-and-messaging.md).

## Mandatory source-level principle: generate robust sound, then attenuate

Every active sound generator must produce a **healthy, calibrated full-reference signal** before the physical-condition, source-fader, bus and master attenuation stages. A normally audible component must not be inaudible because its oscillator/noise synthesis starts at an arbitrarily tiny amplitude and is then boosted with a large mixer gain.

- Each source has a documented **nominal reference level** at a documented test condition (e.g. engine load/RPM for exhaust; starter speed and torque for starter). Build generators with meaningful internal full-scale excitation and a **calibration trim** to establish that reference.
- Nominal *full strength* does **not** mean every source should reach 0 dBFS, constantly peak-normalize, saturate or be equally loud at the output. Maintain explicit **digital headroom** per stem and mix bus to accommodate overlapping transients. A source at zero activity remains silent. The reference calibration establishes the maximum useful signal for the source; state-dependent attenuation then determines how audible it should be.
- After the reference generator/trim, apply **physically determined attenuation** (airflow, throttle, engine load, combustion energy, distance/occlusion, temperature, etc.). Then apply adjustable user faders and routing. Do not replace physics attenuation with generic loudness boosting.
- Prefer **attenuation from a known calibration** to constantly raising gain on weak procedural sounds. Use an engineering trim where unavoidable to calibrate a newly designed source, but distinguish it from ordinary user mix attenuation.
- Never normalize each audio block/event independently: that would erase cranking-vs-idle, idle-vs-load, misfire, limiter, tire-slip and stall dynamics. Preserve transients and phase.
- Establish safe default per-stem trim and **master headroom**, soft or true-peak protection at the final output, and output-volume guidance. A loud reference stem must not mean unsafe speaker/headphone output.

## Signal path and ownership

```text
Shared crank-angle/physics events, engine state and parameters
              |
              v
    Source generator (robust calibrated reference)
              |
    Calibration trim + optional source DSP
              |
    Physically derived gain envelope, smoothing
              |
    Per-source user gain / mute / solo / pan / spatial path
              |
         Stem meter (pre/post)
              |
    Category bus (intake, exhaust, mechanics, ...)
              |
      Bus EQ / filters / effects and gain
              |
    Final summing -> master processing -> master fader
              |
       Safety limiter / output metering
              |
          Browser audio destination
```

Stage order and pre/post-fader metering must be explicit; some audio effects (e.g. nonlinear saturation or convolution) are sensitive to placement relative to gain. Avoid multiple independent limiter stages hiding overload. The browser `AudioContext` remains the final output; internal source/rendering logic should be independent of the UI.

## Required source and group hierarchy

**Every independent physical audio source must have its own addressable channel ID, gain parameter and mute/solo control**, even if several share an optimized DSP kernel.

| Category bus | Initial individual stems |
|---|---|
| Starting / electrical | starter motor whine; Bendix/solenoid engagement; battery/load hum; cranking compression |
| Combustion / block | cylinder 1..N combustion impulses (or per-cylinder contributions); block structural vibrations; misfire transient |
| Intake | throttle/air turbulence; intake pulse; airbox/manifold resonance; intake-valve action |
| Exhaust | header pulses; manifold/collector resonance; muffler/tailpipe; afterfire/burble/pop |
| Valvetrain / mechanics | intake-valve train; exhaust-valve train; timing chain/belt/gear; injector tick; accessories |
| Induction | turbo spool; wastegate; blow-off valve; supercharger whine (only when modeled) |
| Transmission / drivetrain | clutch; gearbox/gear whine; differential; shift transient |
| Wheels / environment | tire rolling; tire slip/chirp/squeal; road surface; wind/aerodynamic noise |

This inventory is expandable and should not require hard-coded UI layout changes. **Per-cylinder isolation is essential** when debugging firing order, imbalance or failed ignition. Groups also need faders and meters.

## Extendable source registry for all technology families

Source declarations come from the **registered physical component and its capabilities** rather than a hard-coded fixed set of stems. Adding a second turbo, ITB runners on all cylinder banks, a supercharger, early carburetor/distributor/starter mechanism, torque converter, CVT, differentials or EV/hybrid motor should automatically add the corresponding independently controllable calibrated source(s) when physically modeled. Every tone/pulse/noise retains its physical event/port origin and bank/cylinder identity. Different engine layouts, intake systems and gearboxes must have causally different sound, not only RPM-scaled generic clips. The mixer must distinguish physically absent sound, disabled/unsupported source and muted source. See [14–18](14-modular-typescript-platform.md).

## Core capture and audio graph observability

**Before M2:** build a synthetic AudioWorklet signal with real per-source/bus/master level measurements and waveform/FFT graph output through the unified [DiagnosticsHub](25-core-diagnostics-recording-and-comparison.md). The same signal can be recorded, exported, imported and compared to verify sample-frame alignment and gain semantics. **During M2/M3:** every physical stem registers source/bus IDs, calibration, mixer parameters and read-only feature channels, with bounded capture and rate-limited graph views. Audio Studio is a dedicated app page; graphs and controls may be pinned as small movable/hideable widgets over Drive/2D/3D per [26](26-multipage-ui-and-floating-widgets.md).

Mix automation timestamps map from the core slowed simulation timeline to audio output sample frames, not animation frames; 0.1x and 1x must preserve causal engine event consistency. High-fidelity experiments provide component-tagged acoustic excitation and source descriptors, and [28](28-shared-realtime-surrogates-and-calibration.md) fits reusable compact source transfer maps without conflating physical changes with fader changes. Audio captures must disclose whether they reflect slow-motion playback and which mixer profile was active.

## Required selectable slow-motion audio treatments

The mixer and capture pipeline support **both** (1) slowed physical pitch/cadence and (2) pitch-preserving time-stretch on the slowed event timeline. Neither treatment changes component physics or source-specific calibration; process/meter/capture modes explicitly report latency, algorithm version, gain and event/sample alignment. `AG-M2-05` provides pitch-preserving DSP, `AG-M2-04` tests sound and CPU quality, `AG-M3-07` exposes the switch. A silent switch to physical mode under overload is prohibited; report unsupported/degraded mode. See [24](24-simulation-clock-and-time-scaling.md) and [approved Round 1](decisions/USER-APPROVED-ROUND-01.md).

## Mixer controls

### Individual source channel
- Stable source ID, display name, category/bus, physical event binding and signal-path description.
- Reference trim (expert/calibration), independent level fader in **dB** (including full mute), mute, solo, reset and optional link/group operation; default to attenuation from a calibrated reference.
- Source shaping where relevant: filters/EQ, resonance, drive/saturation, transient envelope, attack/release, distance/pan, send/return effects. Physical model parameters must be labeled separately from artistic audio overrides.
- Source signal diagnostic: pre-fader and post-fader peak/RMS/level, clipping/overload indicator and optional waveform/spectrum. Avoid posting per-sample buffers to the main thread.
- Smooth parameter changes at audio rate to avoid clicks, with defined ramp intervals; **mute/solo must not mute or freeze underlying physics**.

### Bus and master
- Bus faders, EQ/filters, mute/solo, bus sends/returns and bus-level metering; bus routing must be validated and acyclic.
- Master gain, optional gentle tone shaping and final limiter for output safety; metering for **peak, RMS and ideally integrated loudness (LUFS for exported audio)**, clip detection and headroom indication.
- **Pre/post-fader inspection**, listen-to-source/solo-in-place, A/B comparison and reset to calibrated factory/default mix.
- Preset import/export of separate **physics**, **source calibration**, **user mix**, **spatial/mic configuration** and **master chain**; do not silently rewrite physical model values when a user moves a fader.
- Audio capture/export: full master mix plus optional separate source/bus stems, common sample rate/start timestamp and aligned durations for meaningful external comparison.

### Precise control and automation
- Decibel-based faders and numeric entry; define `gainDb` to linear conversion `g = 10^(dB/20)` and `-Infinity` as zero. Use physically meaningful safety caps; calibration trim has a separate bounded adjustment range.
- Timestamped parameter automation from UI or scenario runner, ramp curves and resettable per-source effects. Serialize and replay mix automation independently from physics commands.
- Consistent interpolation of DSP parameters when engine state changes rapidly; never put arbitrary business logic in the audio callback.
- Grouping and relative adjustments should preserve user-set offsets when requested; disabled/unsupported stems must remain visible with clear status instead of playing fake sound.

## Real-time execution

- Generators and audio summing live in the real-time worklet or explicitly benchmarked low-latency graph. Use fixed arrays/buffers, no garbage-producing allocations, no blocking, no unbounded processing in `process()`.
- Main thread sends compact, timestamped **mixer commands** through the transport bridge, separate from physical engine events. Mixer changes cannot produce an ENGINE_RUNNING, COMBUSTION, LIMITER_ENTER or other authoritative physics event.
- DSP shares crank phase and physical events from the real-time engine; visual meters receive rate-limited read-only snapshots.
- Choose the minimum number of WebAudio nodes needed for routing; many tiny per-cylinder channel nodes can be represented by a custom internal mixer if profiling shows it is cheaper. Preserve independent logical channels even when optimized.

## Test and acceptance matrix

- [ ] Every source produces a stable, calibrated full-reference sound at its defined active test condition (no unexplained near-silence or signal clipping).
- [ ] With `gainDb=0`, a channel uses its calibrated reference; lowering the fader only attenuates it without changing pitch, event timing, envelope shape or physical simulation.
- [ ] With source or bus fully muted, that signal is inaudible while its physical engine behavior and events continue.
- [ ] Solo resolves nested buses correctly, and solo/mute transitions are click-free.
- [ ] Moving one channel's fader does not change unrelated sources; linked controls change only their declared members.
- [ ] Per-cylinder channels remain synchronized with firing events across variable RPM, limiter and misfires.
- [ ] Default blend has sensible headroom; multiple coincident transients do not unintentionally clip. Master limiter never acts as a substitute for correct upstream gain staging.
- [ ] Numeric faders, bus routing and mix presets round-trip through versioned JSON.
- [ ] Pre/post-fader meters and exported aligned stems match offline deterministic tests within tolerance.
- [ ] At 44.1/48/96 kHz and during rapid mixer automation, audio callback stays within measured budget and produces no NaN/Inf.
- [ ] A quiet state (e.g. engine stopped) stays genuinely quiet; output is never force-normalized into an audible running engine.

## Implementation

- **M0:** shared mixer routing schema, physical-source registry IDs and level convention.
- **M2:** robust reference-calibrated generation, physical envelope, faders, buses, master and meters.
- **M3:** detailed per-stem and group mixer UI, precise numeric sliders, A/B, solo/mute and meters.
- **M4:** add configurable DSP/effects to new drivetrain, induction and tire stems.
- **M5:** scripted mixer automation and assertions.
- **M6/M7:** fit source calibration and timbre separately from user mix; hold out states to verify realistic relative loudness.
- **M8:** stress-test many stems and optimize voice/bus routing on desktop and mobile.

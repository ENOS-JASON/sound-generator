# 24 — Core simulation clock, time scaling, stepping and synchronized views/audio

**Status: foundational requirement, implemented in M0 before engine/audio/renderer modules.** Time scaling belongs to the authoritative simulation clock, not just the 2D/3D animation loop. The fast physics, event bus, sound and renderers must share the same timeline and mapping. See [23 — quoted direction](23-quoted-project-direction-and-decisions.md).

## Clock domains and meaning

| Domain | Unit / authority | Why it exists |
|---|---|---|
| `simulationTick` and `simulationTimeSeconds` | deterministic fixed-step runtime | Integrating physical equations, causal events and scenario gates |
| `crankAngleRadians` | physics state, derived from simulated angular speed | Cylinder and valve phase and per-cylinder event positions |
| `audioFrame` / `AudioContext.currentTime` | AudioWorklet device sample frames | Sample-accurate audio output and scheduling |
| `wallTime` | UI/real-world monotonic clock | Progress reporting, input/UI responsiveness, recording and profiling |
| `renderTime` | requestAnimationFrame | UI interpolation only, never authoritative physics |

Define time scale `s = d(simulationTime)/d(realPlaybackTime)`, where `s=1` is normal speed; `0<s<1` is slow motion; `s=0` pauses the simulation and `s>1` is optional faster-than-real-time playback subject to CPU and DSP budgets. This **does not** mean the engine's physical rotational speed is numerically divided by `s`: state values remain expressed in simulation seconds. Presentation plays the same trace stretched into more wall time.

## Suggested controls and behavior

- Available from every live-simulation page: pause, resume, default 1x, selectable slow-motion `0.05x / 0.1x / 0.25x / 0.5x` plus continuous or numeric controls within validated limits; faster values when benchmarked.
- Engineering stepping when paused: `stepOneTick`, `stepOneMillisecondOfSimulation`, `stepCrankAngle(degrees)`, `stepToNextEvent(type?)`, `stepOneCylinderStroke`. Angle/event stepping must have bounded iteration and timeout guards for stalled/zero-RPM engines; report that no event could be reached rather than hanging.
- Physics input commands are timestamped in simulation units or explicitly wall-input-to-simulation mappings; scale changes are command-logged and applied at deterministic boundaries, never in the middle of a physics integration step.
- A single scenario defined in simulation time gives equal physics outcomes whether displayed at 0.1x, 1x, or headlessly accelerated, subject to documented numeric tolerance. Separate a scenario's **simulation-time condition timeout** from a worker liveness watchdog based on wall clock.
- Show current `simulationTimeSeconds`, actual `timeScale`, crank angle/cycle progress, engine `rpm` in simulated units and real-time playback position side by side to prevent confusion.
- On time scale change, smoothly map the output audio clock to simulation ticks and preserve fractional phase and event ordering. No skipped/duplicated firing, throttle transient or valve events.
- Pause freezes the engine's physical state and visual pose; fade out any actively sounding DSP output appropriately without treating pause as mechanical shutdown. Resume must not reset crank, cylinder state or per-component filters unexpectedly.

## Audio time-scaling policy

**Default "physical slow motion":** scale the **playback rate of simulated events and sound development** together; at 0.25x an otherwise identical crank/combustion cycle takes 4x more real time and audible cadence/pitch generally decreases. Physical state remains at its normal simulated speed and torque values. Adapt oscillator phase, continuous noise and resonator time constants coherently (see below) instead of only lowering event frequency while leaving every component sound unchanged.

**Optional future "pitch-preserved inspection":** time-stretch audio for slow-motion while approximately preserving timbre/pitch if needed; this is a DSP feature with different artifacts, **not the default**. Clearly label mode and export it in trace metadata.

- Worklet output sample rate stays the device's 44.1/48/96 kHz, independent of simulation time scale.
- Drive the same phase-accurate physical event schedule from the authoritative simulator, with a continuous mapping `simTime = integral(s(t_audio) dt_audio)`. Use exact sample indexes and deterministic fractional stepping to schedule impulses across speed changes.
- No audio callback may block waiting for UI or 3D; keep the fast physics/audio transport sample-accurate under scale adjustments and browser suspended/resumed states.
- If a DSP component has physical seconds-based decay/filter behavior, explicitly define whether it is rendered in simulated-time or real listening-time and document its slow-motion acoustics; avoid mechanically impossible source/event timing.
- For `s > 1`, maintain solver substeps, event counts and alias control; fail visibly or cap scale if deadlines cannot be met. Never silently skip physics events to make animation smooth.
- Avoid using `AudioBufferSourceNode.playbackRate` for the entire live engine as a substitute for proper simulation time scaling.

## 2D/3D/telemetry synchronization

- 2D cylinder side-view and Three.js engine view render read-only interpolated state from the same authoritative unwrapped crank phase. Valve lift, air/exhaust flows, flame/combustion, wheel rotation and afterfire markers all follow simulation time.
- `requestAnimationFrame` does **not** determine how far a piston moves in physics; render snapshots carry their simulation ticks and phase. Fast/slow displays are allowed to interpolate but must not fabricate actual combustion events.
- Switching 2D/3D/telemetry or changing render FPS/quality does not reset the engine, audio stream, event sequence or virtual clock.
- Support low refresh rates and hidden tabs without advancing the physical engine unexpectedly. Define whether loss of audio-device availability pauses, mutes or headlessly continues the simulation, and expose the selected policy in UI/trace.
- For 2D debugging, permit visual-only replay of recorded traces at arbitrary inspection rate, while clearly distinguishing **trace playback** from a new physics run.

## TypeScript contract sketch

```ts
type SimTick = number;
type AudioFrame = number;
interface ClockSnapshot {
  runId: string;
  simulationTick: SimTick;
  simulationTimeSeconds: number;
  crankAngleRadians: number;
  audioFrame: AudioFrame | null;
  playbackScale: number;
  paused: boolean;
}
interface TimeControl {
  setScale(scale: number, applyAtTick?: SimTick): void;
  pause(): void;
  resume(): void;
  stepTicks(count: number): void;
  stepUntil(guard: { maxTicks: number; eventType?: string; angleDeltaRadians?: number }): void;
}
```

The implementation may maintain an integer/fixed-point tick accumulator to avoid floating-point drift. `ClockSnapshot` is an immutable projection; command handlers modify the underlying authoritative clock only after validation. Audio/video input transport must include an epoch/runId to discard stale messages after reset.

## Determinism and capture

- Log every time-scale transition (`CLOCK_SCALE_CHANGED` diagnostic/control event), simulation tick/frame boundary and user command; physical events retain simulation tick/angle plus cross-reference to audio sample frame.
- Captures contain both `simulationTimeSeconds` and playback/wall/audio clock mapping. Comparisons can align by sim time, physical events or crank angle rather than wall-clock playback.
- Re-import with different scale to **replay** the same physical run and compare audio-render policy separately. Changing playback speed alone must not change a physics checksum.
- The same headless runner and live clock abstraction are used for scenario automation and offline comparison. High-fidelity reference jobs use simulation time regardless of how many real hours one cycle takes.

## Core tests / M0 gate

- [ ] `0.1x` and `1x` with identical deterministic commands produce equivalent simulation state and event traces indexed by sim tick (playback-wall durations may differ).
- [ ] 2D/3D piston, valve and firing positions agree with core crank phase at `0.05x`, `0.25x`, `1x`, on pause/resume and when frames are skipped.
- [ ] Worklet test source (synthetic initial signal, later actual firing) remains phase-continuous on scale changes and has no duplicated/omitted event markers, NaNs or unacceptable clicks.
- [ ] Single-tick, crank-angle and next-event stepping terminate or report bounded inability to progress.
- [ ] Audio sample rate, playback scale and numerical integration step remain distinct values in logs and captures.
- [ ] Scenario timeouts are simulated-time based; very slow playback or hours-per-cycle reference runs do not cause false timeout due to wall elapsed time.
- [ ] Time-control UI is a **core debug control** available before full engine and 3D features are implemented.

# 30 — Agent handoff contract, decision freeze and shared schemas

**Applies to every future coding agent, without needing the conversation history.** Read this page, your assigned [task card](agents/task-index.md) and the card's **Required references**. You do **not** need to read every plan file. **Do not implement based on the historical examples in [09](09-data-contracts.md) or [23](23-quoted-project-direction-and-decisions.md) when they conflict with the accepted contract registry.**

## 1. Standard for an independently assignable task

A valid work order contains:
- **Stable task ID** `AG-M0-xx`, `AG-M4B-xx`, etc., linked from [08](08-implementation-roadmap.md) and [agents/task-index](agents/task-index.md).
- **Goal/behavior** with a narrow scope, not a broad milestone or “implement whole system”.
- **Prerequisites** by *delivered* task IDs and a **contract freeze** identifier; dependencies on unfinished behavior use explicit mock fixtures or a blocking status.
- **Required references** (only the precise design documents needed).
- **Inputs and stable interfaces**: versioned TypeScript type paths, commands/events/ports/time units, examples and mocked fixtures. Never invent a new public protocol if one exists.
- **Files owned / permitted modules**, files not to modify, expected outputs including docs and tests.
- **Acceptance evidence**: specific runnable commands/tests, positive and negative cases, performance/invariant checks and the resulting example fixture/trace or screenshot.
- **Handoff**: changed files, new or changed public contracts, migrations, limitations, implemented/approximate/planned capability, dependency follow-ups and whether acceptance tests actually ran.
- **Failure/blocked policy**: if an upstream contract isn't available, the agent may create a *test fixture or adapter within its owned module* but must not claim live integration; propose a contract change in an issue/PR instead of rewriting another agent's types.

**One card = one accountable agent and one reviewable work unit.** An agent may use helpers internally, but may not silently mark another card complete. Cards should be subdivided further if the work cannot be reviewed as one independently testable outcome.

## 2. Contract authority and source precedence

1. **Accepted ADR/contract snapshot in this file** (and corresponding committed `src/contracts/` schemas once created) is normative for code interfaces.
2. Current [agent card](agents/task-index.md) determines the bounded deliverable and which earlier *accepted* contract versions it consumes.
3. [31 — integration gates](31-integration-gates-and-support-matrix.md) sets what can be labeled shipped or complete.
4. Topical documents [00–28](README.md) define behavioral/physical requirements and can be referenced for detail.
5. Illustrative JSON, pseudocode, filenames and old “possible” architectural statements are **not** authoritative if they disagree with the above.

**Change control:** an agent requesting a schema/event/unit modification authors an ADR change with reasons, migration, affected task IDs, fixture diffs and tests; the **contract owner** reviews it, bumps schema/version, and only then may dependent agents rely on it. No silent breaking changes in an unrelated PR.

## 3. Architecture decisions to freeze before parallel implementation

| Decision | Recommended starting resolution | Freeze owner / blocking point |
|---|---|---|
| **ADR-001 Physics/audio owner** | **One authoritative fast solver per run, recommended inside AudioWorklet** for phase-accurate live sound, with the identical numerical core callable synchronously by Node/headless adapter. Main/Worker receive immutable projections, not ownership; transport uses `MessagePort`, no mandatory SharedArrayBuffer. If profiling shows it unworkable, adopt a measured alternative via ADR with no dual owners. | **Accountable:** `AG-M0-10`; consult `AG-M0-09` for event transport; accepted before M1/M2 |
| **ADR-002 UI framework/router** | **Proposed:** Svelte (one major version pinned) + Vite + hash-based routing under `/sound-generator/`, stateful route-independent simulation service. Vue is a viable alternative but must be chosen **once**. | `AG-M0-01`, before M0 UI tasks |
| **ADR-003 Data model/schema** | New presets use **canonical `VehicleDefinition` v2**, not illustrative legacy v1; versioned JSON Schema and typed parsers. Old v1 examples are input-migration examples only. | **Accountable:** `AG-M0-03`; consult `AG-M0-04`; accepted before model and wizard implementations |
| **ADR-004 Event dictionary** | Typed `EventMap` + `CommandMap`; canonical `LIMITER_ENTER/EXIT`, `ENGINE_RUNNING`, `ENGINE_STALLED`, `ENGINE_OFF`, `AFTERFIRE`. Pause/resume/scale are **control/diagnostic** events (`RUN_PAUSED`, `RUN_RESUMED`, `CLOCK_SCALE_CHANGED`) and not combustion. Versioned import adapter maps legacy `REV_LIMIT_ENTER` and `CLOCK_PAUSED` only if needed. | `AG-M0-09`, before M1/M2/M5 |
| **ADR-005 Time-scale acoustic mode** | `scale = d(sim time)/d(audio playback time)`; default physical slow motion stretches events and pitch/cadence, not engine RPM state. Pitch-preserving stretch is a future optional mode; never assume the two are equivalent. | **Accountable:** `AG-M0-10`; consult `AG-M0-12`; accepted before live audio |
| **ADR-006 Trace bundle** | M0 exports a validated **portable bundle** with `manifest`, commands/events, typed sampled channels, checksums and optional audio; streaming extension adds binary research chunks without changing required manifest fields. Decide exact archive/container representation in `AG-M0-13` with a known-good fixture and migration tests. | `AG-M0-13` before all recorders/runners |
| **ADR-007 UI/backend training boundary** | GitHub Pages only hosts browser app; large M6 jobs run in local/offline CLI, optional Worker only for bounded tasks. Browser imports results; no mandatory backend/cloud. | `AG-M0-16`, before M6 |
| **ADR-008 Support/fidelity labels** | `implemented`, `approximate`, `planned`, `unsupported` declared per component/operating domain. A future technology may appear as disabled/info but may not run via a fake substitute. | `AG-M0-04`, before component registration |
| **ADR-009 Quality/error budgets** | Define separate measured/per-model limits for physical residuals, event timing, reference convergence, audio artifacts, runtime CPU and data integrity. No invented universal tolerance; baseline golden fixtures must state platform/test domain. | **Accountable:** `AG-M0-03` for schema; consulted provider/gate reviewer supplies model-specific thresholds |
| **ADR-010 Third-party assets/licensing** | Procedural audio default; recordings/3D/models are optional with explicit licenses, never embedded without permission. | Release/asset owner before import of nonoriginal assets |

**Single-owner rule:** each ADR has exactly one accountable work-order agent; other agents may be consulted but cannot unilaterally publish an incompatible choice. **Status:** recommendations above are **proposed decisions**, not claims of user approval or implemented code. `AG-M0-01/03/04/09/10/13/16` must record acceptance/alternative with committed ADR fixtures before downstream cards depending on them start. Accepted decisions should be stored in `plan/decisions/ADR-NNN.md` and referenced by SHA/version. Agents may not branch into competing framework/schema decisions.

## 4. Normative cross-component invariants to test

### State, time and events
- Exactly **one authoritative mutable `VehicleState` / solver** per simulation run. Every domain event has `runId`, version, unique increasing sequence, simulation tick/time, type, originating component ID and causation/correlation. Other realms use read-only snapshots; commands applied at tick boundaries.
- Fixed-step simulated time is independent of wall clock/render FPS/audio device sample rate; audio frames map to sim ticks with phase and rate control. `scale=0` freezes physics but does **not** physically kill the engine; resumption preserves state.
- At a given preset/seed/simulated input schedule, changing playback rate or 2D/3D display mode does not change physics event ordering/state beyond recorded numeric tolerance.
- A critical-event sequence gap invalidates any reliant scenario/capture. High-rate diagnostics may coalesce with explicit missing-data counters.
- Scenario event gates use **post-step-entry sequence watermarks**; simulation-time timeout and wall-clock liveness are separate. Retry/branch loops must be bounded.

### Units, energy and physical ports
- SI internally: `rad`, `rad/s`, `N*m`, `W`, `kg`, `m`, `Pa`, `K`, `kg/s`, `J`; UI conversions at boundaries.
- Define **rotational power into a component** as `P_in_W = T_on_component_Nm * omega_rad_s`; a generator/engine delivering outward shaft power has negative input at its output port. For ideal connected ports, powers balance; gear ratio and sign convention must be tested for forward/reverse flows, dissipation and storage. The net crank torque equation and positive generated brake torque are derived/clearly labeled values, not conflated with port signs.
- Generated `P = T*omega` must distinguish indicated, crank/brake, net shaft delivered, wheel shaft and road tractive output; neither a mixer fader nor renderer may change these.
- Physical graphs connect typed rotational, electrical, air, fuel, exhaust and thermal ports; model convergence and energy/mass residuals are checked per tier. User input cannot create free boost/extra AWD wheel torque.
- A cylinder in a four-stroke engine has an explicit **720-degree cycle phase**, bank and physical ID, geometry/valve timing. A reference gas/metal zone count refines physical resolution **without changing bore/stroke or component identity**.

### Audio and views
- Audio generators are causally driven by physical source state/events. Full-reference calibration includes headroom and physical attenuation; never auto-normalize every block or simply pitch-shift a sample as a substitute for engine physics.
- 2D engine side-view has **one horizontal row per bank**, all cylinders with valve/airflow/combustion; 3D/2D/telemetry are read-only projections of the same clock/state and can be deactivated independently.
- Mixer adjustments, debug graphs, route changes and imported telemetry playbacks never silently mutate the live engine.

### Data and fitting
- Every experiment/capture exports full component IDs/versions, connectivity, parameters, environment, scenario/seed, numerical fidelity/mesh, physical and audio output source IDs and time basis. Single-part A/B exports intended **and realized** diffs.
- High-fidelity reference output is a **model estimate until validated** against convergence and physical measurements; no “Research = ground truth” assumption.
- Compact trainable maps/equations are bounded, unit/domain checked, versioned and preserve conservation/causality. Reuse of an **equation** and reuse of identical **coefficients/data** are different decisions. Out-of-domain or incompatible profiles fall back to generic model.
- Import validation is not optional: version/hash/checksum, typed unit/range and size checks, no runtime code execution, no silent schema coercion.

## 5. Suggested repository/test ownership

| Area | Owning contract / primary source | Other agents may |
|---|---|---|
| `src/contracts/`, `src/core/clock/`, `src/core/events/` | M0 schema/event/clock owner | Import stable types and add tests; request changes via ADR |
| `src/core/physics-ports/`, `src/approximations/` | M0/M1 physical-port and math owner | Implement bound component models, not modify sign conventions |
| `src/diagnostics/`, `src/recording/`, `src/comparison/` | M0 diagnostics/capture owners | Register channels and use public import/replay APIs |
| `src/audio/`, `src/dsp/` | M0 synthetic / M2 sound owners | Add source plugins via registry; never own engine state |
| `src/ui/`, `src/visualization/`, `src/configurator/` | M0 UI / M3 renderer and wizard owners | Consume immutable projections/command APIs, not import private solver classes |
| `src/engines/`, `src/controls/`, `src/intake/`, `src/exhaust/`, `src/electrical/`, `src/driveline/` | M1/M4 component-family owners | Add components behind registry with tests/capability status |
| `src/scenarios/`, `src/experiments/`, `src/reference/`, `src/training/` | M1 harness / M5–M7 study owners | Consume versioned graph/trace/port contracts, export compatible artifacts |
| `.github/workflows/`, `vite.config.ts`, root dependency lockfile | M0 build/release owner | Submit requested changes through owner to avoid drift |

These are **logical ownership boundaries**, not a command to create every directory during M0. If a task must touch a different owner's public files, make that change a separate reviewed integration PR/task.

## 6. Required completion report from each agent

```text
Task: AG-Mx-yy
Status: complete | partial | blocked | needs-contract-change
Contract/ADR version consumed: ...
Prerequisite task IDs actually present: ...
Files changed (within ownership): ...
Public API/types/events affected (should be none without accepted ADR): ...
Tests executed, command and pass/fail: ...
Fixtures / screenshots / trace artifacts produced: ...
Physics/audio invariants verified: ...
Capability status: implemented | approximate | planned | unsupported
Known limitations, unimplemented cases, next dependent tasks: ...
```

PR gate: `typecheck + unit tests + schema fixtures + scenario invariants + build` (subset appropriate to deliverable); browser/WAV/visual tasks also include Playwright/recordings and measured performance. A claim of “done” without actual evidence is `partial`. Do **not** modify other cards to make tests pass, do not mark mocks as real features and do not bypass missing contracts with private interfaces.

## 7. Practical agent instructions

1. Read **this file**, your **single card**, and only the card's required referenced docs. Do not need previous chat.
2. Verify all required tasks/ADR artifacts have been committed; if not, mark blocked or deliver a clearly isolated mock.
3. Implement only the files/contracts named on the card; tests live alongside owned code. One agent one PR/work order.
4. Avoid changing source requirements unless an ADR explicitly authorizes it.
5. Run relevant tests, commit fixtures and provide the completion report.
6. Integration owner reviews public interfaces and merges. **Do not “solve” a dependency by duplicating the service elsewhere.**

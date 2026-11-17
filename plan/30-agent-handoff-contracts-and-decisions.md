# 30 — Agent handoff contract, decision freeze and shared schemas

**Owner-approved direction:** [Round 1](decisions/USER-APPROVED-ROUND-01.md), [Round 2](decisions/USER-APPROVED-ROUND-02.md), and [Round 3](decisions/USER-APPROVED-ROUND-03.md) decisions are binding even before implementation ADRs/fixtures exist. **Every major architecture decision must be presented to the project owner for approval**, not finalized solely by a contract agent. Routine code details inside approved contracts remain agent-owned. **Applies to every future coding agent, without needing the conversation history.** Read this page, your assigned [task card](agents/task-index.md) and the card's **Required references**. You do **not** need to read every plan file. **Do not implement based on the historical examples in [09](09-data-contracts.md) or [23](23-quoted-project-direction-and-decisions.md) when they conflict with the accepted contract registry.**

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

1. **User-approved architecture choices** in [Round 1](decisions/USER-APPROVED-ROUND-01.md), [Round 2](decisions/USER-APPROVED-ROUND-02.md), and [Round 3](decisions/USER-APPROVED-ROUND-03.md), then **accepted ADR/contract snapshot in this file** (and corresponding committed `src/contracts/` schemas once created) is normative for code interfaces.
2. Current [agent card](agents/task-index.md) determines the bounded deliverable and which earlier *accepted* contract versions it consumes.
3. [31 — integration gates](31-integration-gates-and-support-matrix.md) sets what can be labeled shipped or complete.
4. Topical documents [00–28](README.md) define behavioral/physical requirements and can be referenced for detail.
5. Illustrative JSON, pseudocode, filenames and old “possible” architectural statements are **not** authoritative if they disagree with the above.

**Change control:** an agent requesting a schema/event/unit modification authors an ADR change with reasons, migration, affected task IDs, fixture diffs and tests; the **contract owner** reviews it, bumps schema/version, and only then may dependent agents rely on it. No silent breaking changes in an unrelated PR.

## 3. Architecture decisions to freeze before parallel implementation

| Decision | Recommended starting resolution | Freeze owner / blocking point |
|---|---|---|
| **ADR-001 Physics/audio owner** | **Open by owner decision UD-R1-02:** benchmark *equivalent* real-time physics running in AudioWorklet versus Worker, with measured timing/jitter, CPU, sample-rate load, transport, UI and headless compatibility; present comparative evidence for **explicit owner approval**. One authoritative owner after selection. Neither architecture is pre-approved or preferred merely by prior recommendations. | **Accountable:** `AG-M0-10`; consult `AG-M0-09` for events and `AG-M0-12` for audio; freeze only after benchmark and owner approval |
| **ADR-002 UI framework/router** | **Owner-approved:** Svelte + Vite, strict TypeScript and **hash routing** (UD-R1-03, UD-R2-02). Routes live under the GitHub Pages base path, e.g. `/sound-generator/#/drive`. **Still unresolved:** Svelte major version, state-management library, detailed component framework. Vue and history-routing alternatives are not authorized without further owner approval. | `AG-M0-01` and Pages `AG-M0-02`, before dependent UI tasks |
| **ADR-003 Data model/schema** | New presets use **canonical `VehicleDefinition` v2**, not illustrative legacy v1; versioned JSON Schema and typed parsers. Old v1 examples are input-migration examples only. | **Accountable:** `AG-M0-03`; consult `AG-M0-04`; accepted before model and wizard implementations |
| **ADR-004 Event dictionary** | Typed `EventMap` + `CommandMap`; canonical `LIMITER_ENTER/EXIT`, `ENGINE_RUNNING`, `ENGINE_STALLED`, `ENGINE_OFF`, `AFTERFIRE`. Pause/resume/scale are **control/diagnostic** events (`RUN_PAUSED`, `RUN_RESUMED`, `CLOCK_SCALE_CHANGED`) and not combustion. Versioned import adapter maps legacy `REV_LIMIT_ENTER` and `CLOCK_PAUSED` only if needed. | `AG-M0-09`, before M1/M2/M5 |
| **ADR-005 Time-scale acoustic mode** | **Owner-approved:** both physical pitch-lowered slowdown and pitch-preserved time stretch, **user-switchable**, with the **new-session default `physical`** (UD-R1-07, UD-R2-03). Physics RPM/events unchanged. Mode identity belongs in trace/DSP contracts. **Open:** persistence of explicit user preference, quality/CPU/latency budgets and fallback thresholds. | **Accountable:** `AG-M0-10`; consult `AG-M0-12`; accepted before live audio |
| **ADR-006 Trace bundle** | **Owner-approved browser ZIP** containing JSON manifest, events, commands, typed chunked/binary traces and optional generated audio; streaming chunks/integrity/validation required (UD-R2-06). **Optional offline** Parquet/HDF5 scientific exports must preserve schema, units, provenance and clock semantics. Choose exact codec/chunk naming and storage budgets via reviewed ADR; never require Parquet/HDF5 in GitHub Pages. | `AG-M0-13`, before all recorders/runners |
| **ADR-007 UI/backend training boundary** | GitHub Pages remains static; offline TypeScript orchestration and **Windows + Linux** support with optional native CPU/GPU/WASM/other validated backend providers (UD-R1-06, UD-R2-07). Browser imports outputs; no mandatory cloud/server or GPU. Check backend/precision, Windows/Linux fixtures and checkpoint portability. Choosing a concrete major numerical stack still requires owner approval. | `AG-M0-16`, before M6 |
| **ADR-008 Support/fidelity labels** | `implemented`, `approximate`, `planned`, `unsupported` declared per component/operating domain. A future technology may appear as disabled/info but may not run via a fake substitute. | `AG-M0-04`, before component registration |
| **ADR-009 Quality/error budgets** | **Owner-approved:** numerical conservation/convergence plus comparison to real-world measurements **when available**, with measured vs simulated confidence/provenance explicitly reported (UD-R2-05). Never mislabel numerically converged data as externally measured truth. Define per-model physical/audio/event budgets; missing measurements do not block all simulations. | **Accountable:** `AG-M0-03` for schema; relevant provider/gate reviewer defines physical thresholds |
| **ADR-010 Third-party assets/licensing** | **Owner-approved:** real-world recordings remain analysis/calibration/validation-only; **both user-imported and verified-license distributable bundled measurement references** are desired (UD-R2-04, UD-R3-06). A bundled recording **must not be included absent actual redistribution rights**; no recorded-car playback/stems anywhere. | **Accountable:** `AG-M7-12` with release `AG-M8-03` review |

**Single-owner rule:** each ADR has exactly one accountable work-order agent. **Status:** 25 Round 1–3 user choices are already approved in [R1](decisions/USER-APPROVED-ROUND-01.md), [R2](decisions/USER-APPROVED-ROUND-02.md) and [R3](decisions/USER-APPROVED-ROUND-03.md); remaining ADR details are proposed until independently approved and implemented with tests. Accountable agents cannot unilaterally accept a *major* architectural choice, even when a benchmark suggests a winner. Missing approval means **blocked for dependent implementation**, not permission to guess. `AG-M0-01/03/04/09/10/13/16` must record acceptance/alternative with committed ADR fixtures before downstream cards depending on them start. Accepted decisions should be stored in `plan/decisions/ADR-NNN.md` and referenced by SHA/version. Agents may not branch into competing framework/schema decisions.

## 3A. Round 3 approved architecture constraints — technical implementations pending

| ADR / choice | Owner-approved constraint and *unvalidated details* | Accountable work order |
|---|---|---|
| **ADR-011 Workspace persistence** | **IndexedDB autosave** of versioned browser state, resilient migration/recovery, optional ZIP snapshots; first launch carb factory preset, saved selected EFI recovers over factory default. IndexedDB quota/reliability and exact store schema **NON VALIDATED until tests**. | `AG-M0-18`; `AG-M3-11` UI consumer |
| **ADR-012 Acoustic calibration and listening** | Expert editing of **separately versioned source calibration trims**, not user mix; **cabin/engine-bay/roadside/exhaust** procedural listening transfer profiles. Exact trims and acoustic curves/CPU cost need validation; no recorded-car playback and no sound-control effect on physics. | `AG-M2-06` calibration; `AG-M2-07` listener; `AG-M3-09/10` UI |
| **ADR-013 AI technical integrator** | A **dedicated AI integration agent** reviews routine CI-backed PRs, requests changes and escalates major ADRs/security/unknown contracts to the **project owner**. **GitHub bot availability, review permissions, branch-protection and merge authorization remain NON VALIDATED**; do not assume a bot is installed or authorize autonomous merging. | `AG-M0-19` (policy/prototype), `AG-M8-04` release gate |
| **ADR-014 Local reference job monitor** | Offline Windows/Linux research must have a CLI **plus local graphical monitor** via versioned job-control API, with resumable multi-hour jobs; no remote-worker cluster/public Pages backend. GUI toolkit, packaging and IPC/security **NON VALIDATED**. | `AG-M6D-07`, `AG-M6D-03a/03b` CLI owners |
| **Initial presets and renderer targets** | Two runnable/editable carb/EFI I4 examples with **factory carb selected**, real gearbox/load; **30 FPS 3D and 60 FPS 2D targets on specified reference desktop hardware**. No actual reference hardware or measured FPS has been defined/tested. | `AG-M1-12`, `AG-M3-02`, `AG-M8-02` |

For unanswered details consult [post-Round-3 validation register](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md). A user-approved requirement does **not** prove a GitHub bot or license exists. Do not mark an ADR implementation `Accepted` without owner-approved major technical selection, actual fixture/prototype evidence and versioned schemas. 

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

### Round 3 runtime invariants

- **Factory vs workspace:** empty IndexedDB selects factory carb preset; restored valid user's selected EFI remains EFI. Validate version/migrations/crash recovery; unavailable/quota-full IndexedDB must not corrupt prior good data or prevent explicit ZIP snapshots.
- **Distinct audio control domains:** engine/torque state, physical source synthesis, **expert versioned calibration trim**, user mixer, listener transfer and master safety each retain separate state/provenance. Changing trim or listener never changes physics; real-world recorded sound is analysis-only, never a source.
- **Render performance:** measure **≥30 FPS 3D** and **≥60 FPS 2D** on explicitly documented reference hardware/scene with independent audio-deadline and simulation-tick assertions. Target is unverified until benchmark and must not imply all browsers/devices guarantee these rates.
- **Reference rights:** user import and bundled measurement catalog require separate ownership/license checks. Unproven bundled redistribution = source unavailable, not a placeholder audio asset. Measurements and model confidence remain distinct.
- **Local training controls:** local monitoring consumes job IDs/events/progress and safe checkpoint/cancel APIs from the CLI without duplicating numerical simulation or requiring network authentication. Windows/Linux test availability must be reported.
- **AI reviewer:** separate review evidence from CI result and human/owner authorization. AI escalates major ADRs and missing/failed requirements; **actual PR merge ability needs explicit owner policy and verified GitHub rights**.

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
| `src/persistence/indexeddb/` and `src/ui-shell/workspace-persistence/` | `AG-M0-18` store and `AG-M3-11` UI | Use stable persistence service and ZIP export API; no duplicate autosave services |
| `src/audio/calibration-profiles/`, `src/audio/listening-perspectives/` | `AG-M2-06/07` (UI `AG-M3-09/10`) | Request versioned mapping changes via these owners; no bypass into physics |
| `src/local-study-monitor/`, `src/reference-data/catalog/` | `AG-M6D-07` GUI / `AG-M7-12` reference | Read CLI/measurement adapters; do not create remote server or audio-playback catalog |
| `.github/agent-review/` and `plan/agents/integration-policy/` | `AG-M0-19` | AI PR reviewing and escalation policy; no credentials/merge authorization assumed |

These are **logical ownership boundaries**, not a command to create every directory during M0. If a task must touch a different owner's public files, make that change a separate reviewed integration PR/task.

## 5A. PR approval and technical integrator policy — owner-approved

Every coding agent opens one narrowly scoped PR per AG card with tested fixtures and a completion report. The project owner has selected a **dedicated AI technical integration agent** as routine reviewer (UD-R3-09): it checks actual CI results, contract versions, ownership, risk/security/licensing and gate evidence, requests changes where needed and **escalates every major architectural ADR** or unresolved conflict to the owner. **The AI reviewer is not yet configured or proven to possess GitHub PR review/merge privileges**. Passing CI alone never authorizes merge. Whether it may actually merge or only record approval, branch protections, required checks and escalation acknowledgment protocol **remain open** and must be validated/owner-approved before enabling any privileged automation. No agent may self-approve a major ADR or its own PR. See [Round 2](decisions/USER-APPROVED-ROUND-02.md), [Round 3](decisions/USER-APPROVED-ROUND-03.md) and [O3-02/O3-15](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md).

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

## 6A. Required major-decision escalation

An agent proposing a major architectural choice (solver ownership, threading/transport, UI router/state platform, canonical data or recording format, reference compute backend, audio algorithm with significant browser/CPU impact) must submit the ADR and a short owner decision request. Present alternatives, reproducible benchmark/tests when applicable, risk, affected agent cards and a recommended choice. **Wait for explicit owner approval**, then publish versioned interface fixtures and record acceptance. Internal refactors that do not change frozen contract semantics may be made without owner review. See [Round 1 approval and procedure](decisions/USER-APPROVED-ROUND-01.md).

## 7. Practical agent instructions

1. Read **this file**, your **single card**, and only the card's required referenced docs. Do not need previous chat.
2. Verify all required tasks/ADR artifacts have been committed; if not, mark blocked or deliver a clearly isolated mock.
3. Implement only the files/contracts named on the card; tests live alongside owned code. One agent one PR/work order.
4. Avoid changing source requirements unless an ADR explicitly authorizes it.
5. Run relevant tests, commit fixtures and provide the completion report.
6. **Dedicated AI technical integrator** reviews routine PRs with CI and escalation; any merge requires separately authorized/validated GitHub permissions and review rules. **Project owner approves major ADRs**. See [Round 3](decisions/USER-APPROVED-ROUND-03.md). **Do not “solve” a dependency by duplicating the service elsewhere.**

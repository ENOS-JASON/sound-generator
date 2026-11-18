# 30 — Agent handoff contract, decision freeze and shared schemas

**Owner-approved direction:** [Round 1](decisions/USER-APPROVED-ROUND-01.md), [Round 2](decisions/USER-APPROVED-ROUND-02.md), and [Round 3](decisions/USER-APPROVED-ROUND-03.md) plus [the fifteen O3 implementation approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) are binding even before implementation ADRs/fixtures exist. **Every major architecture decision must be presented to the project owner for approval**, not finalized solely by a contract agent. Routine code details inside approved contracts remain agent-owned. **Applies to every future coding agent, without needing the conversation history.** Read this page, your assigned [task card](agents/task-index.md) and the card's **Required references**. You do **not** need to read every plan file. **Do not implement based on the historical examples in [09](09-data-contracts.md) or [23](23-quoted-project-direction-and-decisions.md) when they conflict with the accepted contract registry.**

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

1. **User-approved architecture choices** in [Round 1](decisions/USER-APPROVED-ROUND-01.md), [Round 2](decisions/USER-APPROVED-ROUND-02.md), and [Round 3](decisions/USER-APPROVED-ROUND-03.md), plus [O3 approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md), then **accepted ADR/contract snapshot in this file** (and corresponding committed `src/contracts/` schemas once created) is normative for code interfaces.
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
| **ADR-006 Trace bundle** | **Owner-approved browser ZIP** containing JSON manifest, events, commands, typed chunked/binary traces and optional generated audio; streaming chunks/integrity/validation required (UD-R2-06). **Optional offline** Parquet/HDF5 scientific exports must preserve schema, units, provenance and clock semantics. **ZIP ships first; postpone selecting Parquet vs HDF5 until validated dataset/query/streaming requirements and owner review** (O3-11 C). Choose exact codec/chunk naming and storage budgets via reviewed ADR; never require Parquet/HDF5 in GitHub Pages. | `AG-M0-13`, before all recorders/runners |
| **ADR-007 UI/backend training boundary** | GitHub Pages remains static; offline TypeScript orchestration and **Windows + Linux** support with mandatory **multicore CPU and prioritized NVIDIA CUDA** backend capability, including a **CUDA12.x `sm_61` Pascal GTX1080-compatible path**, with optional further native/GPU/WASM providers (UD-R1-06, UD-R2-07). Browser imports outputs; no mandatory cloud/server or GPU. Check backend/precision, Windows/Linux fixtures and checkpoint portability. Choosing a concrete major numerical stack still requires owner approval. | `AG-M0-16`, before M6 |
| **ADR-008 Support/fidelity labels** | `implemented`, `approximate`, `planned`, `unsupported` declared per component/operating domain. A future technology may appear as disabled/info but may not run via a fake substitute. | `AG-M0-04`, before component registration |
| **ADR-009 Quality/error budgets** | **Owner-approved:** numerical conservation/convergence plus comparison to real-world measurements **when available**, with measured vs simulated confidence/provenance explicitly reported (UD-R2-05). Never mislabel numerically converged data as externally measured truth. Define per-model physical/audio/event budgets; missing measurements do not block all simulations. | **Accountable:** `AG-M0-03` for schema; relevant provider/gate reviewer defines physical thresholds |
| **ADR-010 Third-party assets/licensing** | **Owner-approved:** real-world recordings remain analysis/calibration/validation-only; **both user-imported and verified-license distributable bundled measurement references** are desired (UD-R2-04, UD-R3-06). A bundled recording **must not be included absent actual redistribution rights**; no recorded-car playback/stems anywhere. | **Accountable:** `AG-M7-12` with release `AG-M8-03` review |

**Single-owner rule:** each ADR has exactly one accountable work-order agent. **Status:** 25 Round 1–3 user choices are already approved in [R1](decisions/USER-APPROVED-ROUND-01.md), [R2](decisions/USER-APPROVED-ROUND-02.md) and [R3](decisions/USER-APPROVED-ROUND-03.md); remaining ADR details are proposed until independently approved and implemented with tests. Accountable agents cannot unilaterally accept a *major* architectural choice, even when a benchmark suggests a winner. Missing approval means **blocked for dependent implementation**, not permission to guess. `AG-M0-01/03/04/09/10/13/16` must record acceptance/alternative with committed ADR fixtures before downstream cards depending on them start. Accepted decisions should be stored in `plan/decisions/ADR-NNN.md` and referenced by SHA/version. Agents may not branch into competing framework/schema decisions.

## 3A. Round 3 approved architecture constraints — technical implementations pending

| ADR / choice | Owner-approved constraint and *unvalidated details* | Accountable work order |
|---|---|---|
| **ADR-011 Workspace persistence** | **IndexedDB autosave** of config/mixer/calibration/widgets/scenarios **and bounded recent debug data**, with configurable bounded historical snapshots, resilient quota/migration/recovery and optional ZIP; factory carb only for new empty state. Exact schema/quotas remain NON VALIDATED. | `AG-M0-18`; `AG-M3-11` UI consumer |
| **ADR-012 Acoustic calibration and listening** | **Expert gain-trim only** with reference operating condition, revisions/undo, **Advanced UI toggle without authentication** (no EQ/spectral/DSP editor); four procedural listening profiles **independent of 2D/3D camera**. Exact dB bounds and curves require validation; no real recordings or physics mutation. | `AG-M2-06` calibration; `AG-M2-07` listener; `AG-M3-09/10` UI |
| **ADR-013 AI technical integrator** | **Owner conditionally permits AI routine-PR merging** after all explicitly authorized CI/branch/security checks; reviewer **must escalate major ADRs and shared TS contracts, public APIs, module ownership and security/license changes** (O3-02 B / O3-15 B). The actual GitHub bot identity/review+merge rights/branch rules remain **NON VALIDATED** and must be tested/configured before operation. CI-only auto-merge is forbidden. | `AG-M0-19` (policy/prototype), `AG-M8-04` release gate |
| **ADR-014 Local reference job monitor** | Offline Windows/Linux CLI launches a **loopback-only local web dashboard** with versioned job-control API, progress/checkpoint/resume and localhost origin/CSRF/process protections. No public/external/Pages server; exact web stack and security tests remain NON VALIDATED. | `AG-M6D-07`, `AG-M6D-03a/03b` CLI owners |
| **Initial presets and renderer targets** | Agents **propose physically justified I4 parameters** and a separate **representative mid-range FPS reference desktop** for owner approval. Two runnable carb/EFI I4 examples with factory carb, manual/load; 30 FPS 3D/60 FPS 2D must be measured on subsequently approved reference hardware. **Owner i9 10th-gen/GTX1080 compatibility is a separate mandatory test.** | `AG-M1-12`, `AG-M3-02`, `AG-M8-02` |

The prior [O3 questionnaire](decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md) is fully answered. For **unverified implementation evidence**, consult [post-O3 validation register](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md). A user-approved requirement does **not** prove a GitHub bot or license exists. Do not mark an ADR implementation `Accepted` without owner-approved major technical selection, actual fixture/prototype evidence and versioned schemas. 

## 3B. Additional owner-approved O3 choices and hardware guardrails

All **15 O3 choices are approved**, not pending. Consult [binding decisions](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and [verification register](decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md) before making narrower technical assumptions.

- **Benchmark split:** solver Worklet-vs-Worker performance comparison runs first on the owner's **10th-gen Intel i9 / GeForce GTX1080** primary development machine, while the **published visual 30/60 FPS** reference machine is a **separate representative mid-range desktop proposed by an agent for project-owner approval**. Neither measured result exists yet.
- **Legacy GPU contract (ADR-015):** GTX1080 **Pascal compute capability 6.1 (`sm_61`)** requires a **CUDA 12.x-compilable kernel build path** and parallel multicore CPU fallback; CUDA 13.x dropped Pascal compilation support. Do not allow CUDA13-only kernels/libraries, Tensor Core assumptions or `sm_75+` checks to disable a mandatory `sm_61` route. Correct platform/driver/CUDA precision/VRAM preflight and CPU fallback are compulsory; actual GPU tests are pending. Owner's exact i9 SKU/OS/RAM/driver is unknown.
- **Browser/persistence:** latest **two stable major** desktop Chrome/Chromium, Firefox and Safari builds where available, with actual version matrix and truthful unavailable status. IndexedDB stores configs, mixers, calibration, widgets, scenarios, bounded recent debug data and **bounded configurable history**, not unlimited traces.
- **Acoustic scope:** expert **gain trims + calibrated conditions + versioning/undo only**, toggled through **Advanced mode without authentication**; no user-editable expert EQ, arbitrary source DSP or security claims. Listening perspectives **never follow camera movement** and don't change solver or render view.
- **Research/local UI:** Windows/Linux offline CPU + prioritized NVIDIA CUDA (with legacy Pascal path); CLI launches **loopback-only graphical web dashboard** with CSRF/origin protections, no public remote server. **ZIP first**; choose optional Parquet/HDF5 only after research requirements validated and owner approves a meaningful major choice.
- **Owner-controlled evidence:** agents **propose initial realistic I4 numerical parameters** and the mid-range reference FPS machine for owner's approval. Agents **research redistributable datasets and submit actual legal terms for owner's review before bundling**, rather than claiming a catalog exists.
- **AI PR reviewer governance:** the **owner has approved conditional merge of routine PRs** after validated, explicitly authorized CI/branch/security checks. **Public/shared TS contracts, module ownership boundaries, security/license conflicts and major ADRs always escalate to the project owner.** The bot has no assumed installation, identity, permissions, or autonomous API access until separately set up and tested.

**Accountable cards:** `AG-M0-10/13/16/18/19`, `AG-M1-12`, `AG-M2-06/07`, `AG-M3-09/10/11`, `AG-M6D-07/08`, `AG-M7-12` and `AG-M8-01/02/05`.

## 4. Normative cross-component invariants to test

### State, time and events
- Exactly **one authoritative mutable `VehicleState` / solver** per simulation run. Every domain event has `runId`, version, unique increasing sequence, simulation tick/time, type, originating component ID and causation/correlation. Other realms use read-only snapshots; commands applied at tick boundaries.
- Fixed-step simulated time is independent of wall clock/render FPS/audio device sample rate; audio frames map to sim ticks with phase and rate control. `scale=0` freezes physics but does **not** physically kill the engine; resumption preserves state.
- At a given preset/seed/simulated input schedule, changing playback rate or 2D/3D display mode does not change physics event ordering/state beyond recorded numeric tolerance.
- A critical-event sequence gap invalidates any reliant scenario/capture. High-rate diagnostics may coalesce with explicit missing-data counters.
- Scenario event gates use **post-step-entry sequence watermarks**; simulation-time timeout and wall-clock liveness are separate. Retry/branch loops must be bounded.

### Units, energy and physical ports
- SI internally: `rad`, `rad/s`, `N*m`, `W`, `kg`, `m`, `Pa`, `K`, `kg/s`, `J`; UI conversions at boundaries.
- **Owner-approved independent display units:** quantity-level defaults plus per-stat/channel overrides may mix imperial and metric concurrently, including two pressures with different choices. Validate dimensions and pressure gauge/absolute reference separately. Preferences persist as versioned user workspace state and must not alter SI solver state, commands/events, hashes or trace truth. See [per-stat unit decision](decisions/USER-APPROVED-PER-STAT-DISPLAY-UNITS-2026-11-18.md).
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
- **Local training controls:** CLI launches a **loopback-only web dashboard** that consumes job IDs/events/progress with safe checkpoint/cancel APIs, strict origin/CSRF/process checks and no remote access. This does not require public network authentication or a web backend on GitHub Pages. Windows/Linux tests must be reported.
- **PR reviewer:** owner review and merge is valid; alternatively AI integrator performs independent code/CI/rule validation before **conditional routine merge approved by owner O3-02 B**. Escalate all major ADRs and **shared TS contracts/APIs/module boundaries**; actual privileged merge needs installed authenticated bot, approved enforcement rules/branch protections and tested GitHub rights. Never merge solely on CI status.

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
| `.github/agent-review/` and `plan/agents/integration-policy/` | `AG-M0-19` | AI review + **conditionally authorized routine merge** policy, owner escalation and audit; live credentials/permissions unverified |

These are **logical ownership boundaries**, not a command to create every directory during M0. If a task must touch a different owner's public files, make that change a separate reviewed integration PR/task.

## 5A. PR approval and technical integrator policy — owner-approved

**[Current review policy](decisions/OWNER-PR-REVIEW-POLICY-2026-11-18.md)** clarifies O3-02 B without revoking it. Every coding agent opens one focused PR with tests, fixtures, handoff and passing required checks. **Either the project owner personally reviews and merges on GitHub, OR a separately authorized AI integrator reviews and conditionally merges routine PRs under verified permissions/rules.** Owner review+merge is sufficient; no extra GitHub Approve, AI review, Markdown edits, issue comments or additional confirmation is required of the owner. Verify the real GitHub merge actor and SHA. Bot identity and privileges remain unverified. Never self-approve an AI PR or merge solely from CI. Major ADRs, shared TypeScript APIs/module ownership and security/license decisions remain owner-only approvals (O3-15 B).

## 5B. Authoritative Markdown task tracking — approved operational rule

The milestone overview [08 — roadmap](08-implementation-roadmap.md) has **112** parent checkbox items; [task-index](agents/task-index.md) maps those to **172** AG work-order cards. Each AG card's preserved `### AG-...` heading is followed by **one clickable `- [ ] **AG-... COMPLETE**` checkbox**, and the card's former acceptance sentence is now a **set of individually trackable requirements/tests**. The index remains link-only and must not introduce duplicated status.

**Responsibility and order:**

1. The implementing agent checks only acceptance items supported by actual tests, commands, fixtures and CI. AG completion and roadmap parent stay unchecked until **owner-reviewed+owner-merged OR authorized AI-integrator-reviewed+merged** evidence.
2. The owner or authorized AI reviewer verifies applicable tests, CI/branch checks and G0–G8 gates. **Owner review+merge is a valid full approval route** without a separate GitHub review submission or AI reviewer. Owner-only major decisions remain required. CI alone or an unmerged PR is not completion.
3. **After the actual merge**, the **next agent execution** reconciles Markdown from verified GitHub PR, merge actor/SHA and CI/artifacts; check approval/merge and then `AG-... COMPLETE` **last** after all criteria pass. Prefer an audited tracking-only update. A docs-only direct commit to `main` is permitted only where repository branch rules authorize it; never bypass protections. A stale checkbox does not require owner reapproval. Never claim an uncommitted change.
4. **The tracking agent promotes the parent roadmap checkbox only when every linked child AG card in the index is COMPLETE on `main`.** Check `- [x]` in [08](08-implementation-roadmap.md) and cite the completed AG IDs and gate evidence. One missing/blocked child keeps the parent `- [ ]`. The index and AG headings/anchors must not be changed just to mark progress.
5. Regressed/invalidated tests reopen affected acceptance boxes, AG completion and any dependent checked parent; record why and the follow-up PR/commit.
6. **Documentation-edit commits alone do not prove that any AG task is finished.** All 172 AG completion boxes and all 112 roadmap parents are initially unchecked.

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
6. **Owner review+merge OR separately authorized AI-integrator review+conditional routine merge** after validated checks/rules (O3-02 B); shared public contract/ownership changes and major ADRs escalate to project owner (O3-15 B). **Live GitHub identity/merge rights remain unverified** until configured. See [O3 approvals](decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md). **Do not “solve” a dependency by duplicating the service elsewhere.**

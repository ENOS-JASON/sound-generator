# 31 — Integration gates, release subsets, fixtures and support matrix

This document prevents **a feature interface or mock from being mistaken for a working implementation** and gives independent agents clear promotion rules. Consult [29 — audit](29-plan-audit-and-gap-register.md), [30 — contracts](30-agent-handoff-contracts-and-decisions.md), [08 — roadmap](08-implementation-roadmap.md) and [agents/task-index](agents/task-index.md).

## 1. Layered status model

Every component family, configuration and subsystem publishes:

| Field | Values | Meaning |
|---|---|---|
| `supportStatus` | `planned`, `unsupported`, `approximate`, `implemented` | Capability is future, incompatible, running with disclosed simplified approximations, or validated within declared domain |
| `testStatus` | `not-run`, `pass`, `fail`, `blocked` | Evidence from actual CI/benchmarks |
| `referenceStatus` | `none`, `synthetic-validated`, `numerical-converged`, `measurement-compared` | What **high fidelity** has been established; not a synonym for implemented |
| `deploymentStatus` | `not-deployed`, `pages-smoke-passed` | Proven static host deployment |

`implemented` requires executable physics and relevant invariant/scenario tests within stated input range. It does **not** imply audio measured against a real car unless independent external recordings/measurements are available. `approximate` is a meaningful running solver with known limitations, not an empty stub. Planned features may appear informationally but are disabled for runnable/persistable configurations. A **green build must list omitted planned/unsupported scenarios**, not suppress them.

## 2. Hard inter-agent gates

| Gate | Requires | Unlocks | Evidence artifact |
|---|---|---|---|
| **G0-A — Decision freeze** | Owner-approved Svelte/Vite hash routes, schema/events/physics port and ZIP contracts, **IndexedDB versioned autosave schema and AI reviewer/escalation protocol**; Worklet-vs-Worker choice still needs measured benchmark and owner ADR approval | Parallel M0 service implementations, M1/M2 component work | `plan/decisions/` records, type/schema fixtures and CI |
| **G0-B — Synthetic observability** | M0 mock clock/events, synthetic worklet, recording ZIP import/replay/compare, multi-page widgets **plus IndexedDB autosave, corrupted/quota recovery and optional ZIP snapshot**; AI integrator policy/feasibility evidence without claiming bot deployed | M1 engine and M2 audio development | reproducible mock `fixtures/golden/mock-run` plus Playwright/Vitest report and screenshot |
| **G1 — Generic engine** | **Two complete editable, independently runnable I4 vehicle presets**, mechanical-carb/distributor/no ECU **factory default** and separately selectable EFI/ECU, with valid starter, ignition/idle/stall, basic manual transmission and realistic road-load torque/energy fixtures | M2 full sound; M3 engine views; M4 tech families | example preset/physics trace + energy/event assertions |
| **G2 — Procedural audible engine** | Procedural phase-coherent I4/starter/intake/exhaust and wheel/driveline sources, **separately versioned expert calibration trims** and **cabin/engine-bay/roadside/exhaust listening transfer**, safe mixer headroom and both selectable slow-motion modes; recorded-car clips never playback | M3 audio mixer UI, full driving demo | encoded WAV or recorded stem features and load/performance report |
| **G3 — Usable guided lab** | Svelte/Vite hash pages and read-only 3D/2D, **30 FPS 3D and 60 FPS 2D measured targets on documented reference hardware**, wizard switches two runnable I4 controller presets, Audio Studio expert trims and listener selection, **IndexedDB autosave/recovery with ZIP snapshots**, widgets and route-independent physics | Demo, scenario editor and detailed component editors | browser E2E + screen captures and imported preset regression |
| **G4 — Verified technology slices** | Each shipped M4 model (turbo, DCT, 4WD, etc.) passes port-load/energy, state and audio tests, has valid configs and `supportStatus` | Promotion of that specific provider to available presets/scenarios | named provider report + golden scenario trace; no global all-tech gate |
| **G5 — Canonical scenarios and experiments** | Automated gates/timeouts, variants, baseline A/B, coverage and invalid-state reporting; uses G1 event/clock fixtures | M6 reference workloads and M7 fitting datasets | complete run report with exact intended/realized component diffs |
| **G6 — Valid reference solver** | per-component mass/energy/convergence, confidence/provenance where measurement exists, versioned Windows+Linux **CLI and local graphical job monitor** with progress/checkpoints/restart/failure, optional supported GPU and research export, complete scenario/part manifests | M7 fit using that **specific** validated dataset | component manifest, fidelity/mesh convergence, checkpoint/replay, dataset hash |
| **G7 — Trained compact model** | fast vs reference compatible ports/holdouts, numeric invariants and fallback; **imported and optionally bundled properly licensed reference measurements** used only for analysis/calibration, with provenance/confidence and no real-car audio playback | Mark individual trained profile compatible and publish it | profile artifact, metric comparison vs baseline, holdout manifest |
| **G8 — Release** | Pages hash-route and Chromium/Firefox/Safari, ZIP/IndexedDB recovery, **measured 30 FPS 3D / 60 FPS 2D on declared hardware**, two editable I4 presets, four audio listening perspectives and expert trims, licensed-only bundled measurements, Windows/Linux CLI plus local GUI and CI + **dedicated AI technical-integrator** review/escalation evidence with owner approval of major ADRs | Public stable demo | deployment URL, smoke result, version and limitations |

**No gate requires full M4 or M9+ support to release a valid subset.** A task may depend on a *particular fixture/provider* rather than waiting for every feature in the milestone. Progress through gates is by recorded artifacts, not a promise that another agent will finish a dependency.

## 2A. Gate reviewers — explicit single-agent accountability

A gate is not considered passed simply because a contributor marked one implementation checkbox. The following **accountable reviewer card** must verify that **all listed prerequisites** have passed and publish the gate evidence artifact. These reviewers may consult other agents, but only the named reviewer records the gate decision.

| Gate | Accountable reviewer | What the reviewer must gather |
|---|---|---|
| G0-A | `AG-M0-16` | Approved applicable ADR-001–014, schema/port/event/clock/storage/reviewer fixtures and dependency list; do not treat unavailable GitHub bot or unapproved solver location as certified |
| G0-B | `AG-M0-17` | Synthetic audio/physics/trace/export-import shell E2E **plus AG-M0-18 autosave and AG-M0-19 AI review feasibility/policy**; no false claim that privileged bot is operational |
| G1 | `AG-M1-11` | Both editable first I4 presets from AG-M1-12, factory carb startup, starter/catch/idle/stall/manual road-load scenarios, wrong-controller rejection and power/event tests |
| G2 | `AG-M2-04` | Procedural sound, expert versioned trim AG-M2-06, four listening perspectives AG-M2-07, both slow-motion modes and worklet deadline evidence |
| G3 | `AG-M3-08c` | UI wizard/2D/3D/route/mixer plus AG-M3-09 calibration editor, AG-M3-10 viewpoint selector and AG-M3-11 autosave/ZIP recovery; measured 30/60 reference FPS if declared G3 final |
| G4 | `AG-M4D-03` | Per-provider support and invariant test reports; only explicitly released providers, not all future technologies |
| G5 | `AG-M5-08` | Time/event gate checks, headless scenario run status coverage and single-part/part-set comparison provenance |
| G6 | `AG-M6D-05` | Reference solver/mesh, component manifest, Windows/Linux CLI checkpoint and AG-M6D-07 **local GUI monitor** evidence, per validated dataset |
| G7 | `AG-M7-11` | Held-out model results, fallback/energy/worklet CPU and AG-M7-12 **licensed-only measurement reference catalog** (may be empty if no redistributable assets verified) |
| G8 | `AG-M8-04` | Browser/Pages/ZIP/IndexedDB, measured 30/60 reference FPS, licensed data, CLI+local GUI and **verified AI technical integrator PR review/escalation policy**; no self-merge/CI-only-merge assumption |

Gate reviewer work is **integration review within the named card**, not permission to reimplement missing upstream modules. Any missing evidence yields **blocked** with exact prerequisite card IDs.

## 3. Fixture library owners and names (proposed)

```text
tests/fixtures/contracts/          # component/ports v2, events v1, command, clock, invalid inputs
tests/fixtures/golden/mock-run/    # M0 sim/audio clock with known event+telemetry trace
tests/fixtures/golden/i4-start/    # M1 controlled starter->first-fire->idle->off and failed-start
tests/fixtures/golden/engine-layouts/ # I1, I4, V8, flat and 1..12 geometry/firing fixtures
tests/fixtures/golden/load-path/   # clutch, gear, FWD/RWD, 4WD/traction, negative torque
tests/fixtures/golden/audio/       # deterministic input state, audio features / optional reference WAV
tests/fixtures/scenarios/          # versioned time/event gates, success and intentional failure
tests/fixtures/imports/            # valid, unknown-version, malformed, oversize and incomplete bundle
tests/fixtures/reference/          # 0D/two-zone/multi-zone small runs with manifest and residuals
tests/fixtures/training/           # fast vs reference fit/holdout and out-of-domain fallback
```

Fixtures may be stored as large downloadable CI artifacts instead of directly in Git when licensing/size requires. Every fixture has a **manifest** with producing task, schema versions, seed, expected outcomes, units and tolerance policy. Do not invent binary golden files before implementation or claim they exist.

## 4. Minimum acceptance values vs domain-specific budgets

- **Contract exactness:** zero invalid type/unit conversions, no unrecognized required event IDs, no unsupported config marked runnable, no unverified checksum accepted.
- **Numerical stability:** non-finite values and negative physical absolute temperatures/pressures fail; mass/energy residual thresholds must be documented per model and fixture, including discretization/timestep.
- **Event causality:** must preserve ordering and step-entry watermarks; no fake starter success, combustion during fuel cut without an explicitly modeled mechanism, or reconstructed events from 2D animation.
- **Audio real-time:** both approved slow-motion modes must meet separate measurable quality/latency/deadline budgets (otherwise display unavailable/failed rather than silently substitute). No observed callback deadline misses in defined CI/manual stress runs; state sample rates/platform/hardware and measured duration rather than universal guarantees. Gain clipping tests use stated headroom and source calibration conditions.
- **Time scaling:** physics traces/events equivalent by simulation tick/input schedule at 0.1x/1x **and both audio modes**. Physical slowdown changes pitch; the pitch-preserving mode is validated against explicit pitch/timbre/transient/CPU/latency criteria, with audio-mode differences permitted but engine-state differences forbidden.
- **Training accuracy:** held-out objective and worst-case residual must meet **per-provider declared thresholds**; compare against external measurements **when available**, record provenance, uncertainty/confidence and explicitly differentiate numerical convergence from measured agreement. Lack of measured data is disclosed but not an automatic ban on running the model; `Research` tier alone does not prove truth.
- **Performance:** G0 browser synthetic tests; G3/G8 must record **3D ≥30 FPS and Canvas 2D ≥60 FPS on specified reference desktop hardware** with scene/resolution/frame-time sampling, plus desktop Chromium, Firefox and Safari supported-browser tests, 44.1/48kHz audio and 2D fallback. Targets do not modify physics/audio clocks; until measurements exist report `target not validated`. Mobile is not an initial-release requirement. The Windows/Linux offline CLI has separate headless smoke tests; GPU tests are conditional on available hardware.

The engineer responsible for a model must publish numeric acceptance bounds **before tuning to pass its tests**; a later agent may change bounds only through a reviewed documented reason and updated fixtures.

## 5. Independent provider release checklist

Each new `EngineFamily`, `ControlStrategy`, `IntakeComponent`, `Transmission`, `DriveLayout`, `AudioSource`, `ReferenceModelProvider`, or `FastModelFamily` must provide:

1. Registered stable type/version, allowed component graph/ports, units and operating-domain bounds; one authoritative state owner.
2. Versioned config schema and **one valid + one invalid** example; conditional wizard field descriptors and unsupported-option reason.
3. Core physics/algorithm and explicit approximation limitations; no fake control/system behavior.
4. Typed events, telemetry channels, optional sound stems with unit/level calibration, 2D/3D projection when applicable.
5. Minimal headless scenario, negative/failure case, conservation and event/timing assertions, import/export and performance evidence.
6. Reference-fidelity capabilities or explicit `unavailable`; baseline fast model and safe trained overlay fallback.
7. Handoff report listing implementation scope, residual risk and impacted agent task IDs.

A model may be integrated as an isolated provider with a mocked view/UI at first; the support matrix must indicate which **subsystems** are verified. Do not block a valid M1 test on missing advanced 3D, or a valid M6 research kernel on a future hybrid UI.

## 6. Acceptance of each roadmap work order

The [task index](agents/task-index.md) assigns stable IDs to **every checkbox** in [08](08-implementation-roadmap.md). A task is complete when its specified code/fixture/tests and the required handoff report exist. **Milestone titles are not standalone agent assignments**; they are collections of separately owned tasks. One agent must never mark an adjacent card complete as a side effect of coding its own task.

## 7. Open decisions / escalation

Current known decisions needing explicit M0 freeze (Round 1–3 owner approvals binding; see [decision register](decisions/README.md)):
- Solver owner/thread placement **after equivalent Worklet vs Worker benchmark and explicit owner approval**.
- **Svelte + Vite approved**; router/store/version conventions remain to freeze.
- Canonical versioned VehicleDefinition/events/trace on-disk container.
- Default capture/telemetry budgets and tests per target browser.
- First **I4 gasoline/starter/manual/road-load** baseline with **both carburetor/no-ECU and EFI/ECU selectable** approved; default controller choice, gearbox values and engine dimensions remain open.
- Numerical model fidelity and acceptance tolerances/measurement reference of later solvers.

When unresolved, the agent's task is to record a **blocking ADR or fixture dependency**, not implement a second incompatible solution.

# Architecture decision register — M0 freeze required

**Owner-approved architecture directions are recorded in [Round 1](USER-APPROVED-ROUND-01.md), [Round 2](USER-APPROVED-ROUND-02.md), [Round 3](USER-APPROVED-ROUND-03.md), and [the 15 O3 implementation choices](USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md).** All **40** owner selections are binding; benchmark-dependent implementation, validation and unspecified subdecisions remain open. No further major architecture choice may be made without explicit owner approval. **No technical choice below is accepted merely because it appears in a proposal.** The decision owner publishes a reviewed `ADR-###-slug.md` here with explicit `Status: Accepted` before downstream agents are allowed to rely on it.

See [agent contracts and working proposals](../30-agent-handoff-contracts-and-decisions.md#3-architecture-decisions-to-freeze-before-parallel-implementation), [plan audit](../29-plan-audit-and-gap-register.md) and [G0-A integration gate](../31-integration-gates-and-support-matrix.md).

**Additional owner-approved product requirement (2026-11-18):** [independently selectable per-stat vehicle display units](USER-APPROVED-PER-STAT-DISPLAY-UNITS-2026-11-18.md). Users may mix hp/kW, N·m/lb-ft, psi/bar/kPa and other compatible physical units concurrently, including different units for separate pressure gauges. This is separate from the previously counted 40 Round 1–3/O3 selections and does not change internal SI physics or mark any work complete.

## O3 implementation choices approved; remaining verification

**O3: 15/15 approved.** [Binding O3 record](USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) confirms primary i9/GTX1080 solver benchmark, conditional AI **routine-PR merging after authorized checks**, bounded IndexedDB recent debug/history, owner-approved proposals for generic I4 and mid-range reference desktop, expert **gain-only** calibration, audio listener **independent of visual camera**, licensed-data research before inclusion, **CLI-launched loopback-only job dashboard**, **CUDA plus CPU with GTX1080 Pascal `sm_61`/CUDA12.x compatibility**, ZIP-first exports, last two stable browser majors, Expert toggle with no login and owner escalation of shared TS contracts/ownership changes. [Historical O3 questionnaire](OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md) is CLOSED as to owner choices. Current [post-approval verification blockers](OPEN-VERIFICATION-AFTER-O3-APPROVAL.md) remain open.

**Additional mandatory device:** [Owner-reported Windows 11 / Core i9-10900KF / 32 GB RAM / GTX1080 development desktop](OWNER-DEVELOPMENT-HARDWARE.md) must be supported. NVIDIA notes Pascal `sm_61` cannot be compiled with CUDA 13; retain a CUDA12.x GPU build path and a CPU fallback. Driver/toolkit compatibility and actual performance are **NOT YET VERIFIED**. See [NVIDIA official GPU list](https://developer.nvidia.com/cuda/gpus/legacy) and [CUDA 13 release notes](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/).

## Round 3 approved status and remaining open technical choices

**Round 3: 9/9 approved.** [Decision record](USER-APPROVED-ROUND-03.md): initial **carb/mechanical I4** selection; **two editable I4 presets** (carb and EFI); **30 FPS 3D / 60 FPS 2D targets on reference hardware**; expert-editable separately versioned calibration trims; **cabin/engine-bay/roadside/exhaust listening**; imported plus verified-license bundled measurement references; Windows/Linux CLI **plus local graphical job monitor**; browser **IndexedDB autosave** and optional ZIP snapshots; and a **dedicated AI technical integration agent with escalation**. [Original Round 3 questionnaire, archived](OPEN-QUESTIONS-ROUND-03.md).

**Round 2: 9/9 approved.** [Decision record](USER-APPROVED-ROUND-02.md), [historical questions](OPEN-QUESTIONS-ROUND-02.md). **Round 1: 7/7 approved.** [Decision record](USER-APPROVED-ROUND-01.md).

**Technical verification still open:** [Post-O3 verification register](OPEN-VERIFICATION-AFTER-O3-APPROVAL.md). Specific physical solver placement after benchmarking, proposed preset parameters and reference hardware for owner approval, trim bounds, actual measurements/licenses, localhost security, IndexedDB thresholds, and the **authorized AI bot identity/GitHub permissions** need implementation or evidence. **AI routine merging is conditionally approved** as a policy; actual merge rights are not yet configured or validated.

## Round 1 status summary

- **Approved:** major architecture decisions require project-owner approval; Svelte + Vite; first complete I4 gasoline starter/manual/load vertical slice; eventual actual 3D CFD, chemistry and material simulation support; native CPU/GPU/other offline numerical backends allowed; both slow-motion audio modes with a switch.
- **Not yet decided:** AudioWorklet vs Worker ownership must be **benchmarked first and then returned to the owner for selection**; neither is the default winner.
- **Round 2 resolved:** hash routing, physical slow-motion audio default, two I4 controller modes, Windows/Linux, desktop browser coverage, ZIP export, measured validation where available and CI+integrator reviews. **Round 3 additionally approved:** factory carb initial selection, two editable examples, 30/60 reference FPS targets, expert trims, four listening perspectives, license-verified bundled measurements, local compute GUI, IndexedDB autosave and **dedicated AI integrator**. Its specific hosting/identity/GitHub privileges remain **NON VALIDATED**, as do physical/preset numeric parameters and tooling.

## Pending decisions and suggested owners

| ADR | Decision to freeze | Assigned owner |
|---|---|---|
| ADR-001 | **Benchmark Worklet-owned and Worker-owned physics fairly; owner approves the final single owner** (UD-R1-02; open) | **`AG-M0-10` accountable**, `AG-M0-09` consulted |
| ADR-002 | **Svelte + Vite with hash routes approved** (UD-R1-03, UD-R2-02); store/versions/component library remain open | `AG-M0-01` |
| ADR-003 | **ACCEPTED** — canonical VehicleDefinition v2 schema and legacy-v1 migration disposition ([owner-merged PR #4](https://github.com/ENOS-JASON/sound-generator/pull/4), merge `7ac235c4f5acf77ecdb701b2cb6011da2b752f72`) | **`AG-M0-03` accountable**, `AG-M0-04` consulted |
| ADR-004 | Event/command IDs and control-plane aliasing | `AG-M0-09` |
| ADR-005 | **Both audio modes; default pitch-lowered physical slowdown** approved (UD-R1-07, UD-R2-03); DSP budget/persistence open | **`AG-M0-10` accountable**, `AG-M0-12` consulted |
| ADR-006 | **ZIP first** with JSON manifest/chunks; only select optional **Parquet/HDF5 after measured study needs** and owner review (O3-11 C); codec/container details open | `AG-M0-13` |
| ADR-007 | **Windows + Linux**, **multicore CPU plus prioritized NVIDIA CUDA**, compatible **GTX1080 Pascal `sm_61` CUDA12.x** path and fallback (O3-10 B); exact solver backend/capability thresholds open | `AG-M0-16` and `AG-M6D-08` |
| ADR-008 | Supported/approximate/planned/unsupported capability state | `AG-M0-04` |
| ADR-009 | **Numerical and available real-measurement validation, explicit confidence status** (UD-R2-05); model-specific tolerances open | **`AG-M0-03` accountable** for schema, provider owner consulted for its thresholds |
| ADR-010 | **Real recordings for calibration/validation only; imported and bundled catalog** (UD-R2-04, UD-R3-06). Bundled recordings permitted **only after redistribution/license evidence**, never playback. | `AG-M7-12` + `AG-M8-03` | 
| ADR-011 | **IndexedDB autosave** for config/mixer/calibration/widgets/scenarios/**bounded recent debug data** and separately versioned **per-stat display-unit preferences**, with **configurable bounded snapshots**, quota/migration/recovery and optional ZIP (O3-03/13 plus 2026-11-18 per-stat unit requirement); exact thresholds remain open | `AG-M0-18` + `AG-M3-11` |
| ADR-012 | **Expert gain trims only**, reference conditions/version/undo, **Advanced toggle without login**, four procedural listening positions **independent of render camera** (O3-06/07/14); exact calibration/transfer curves open | `AG-M2-06/07` + `AG-M3-09/10` |
| ADR-013 | **Dedicated AI reviewer conditionally authorized to merge routine PRs after all explicitly authorized CI/branch/rule checks** (O3-02 B); **must escalate** major ADRs and shared TS contracts, APIs or ownership changes (O3-15 B). Actual bot identity/merge GitHub scope remains unverified | `AG-M0-19` |
| ADR-014 | **Windows/Linux CLI launches loopback-only local web dashboard**, secure localhost job API, not a desktop bundle nor remote queue (O3-09 B); web toolkit/IPC security implementation open | `AG-M6D-07` |
| ADR-015 | **Owner-required Intel i9 10th gen + GTX1080 Pascal `sm_61` compatibility**, CUDA12.x `sm_61` build and multicore CPU fallback; official CUDA 13 removes Pascal support. Actual driver/OS/precision hardware testing remains open | `AG-M6D-08`, validated by `AG-M8-05` |

**Owner approval vs ADR acceptance:** the user approved 40 Round 1–3 + O3 choices are binding today. A formal ADR is only marked `Accepted` after its remaining technical details, fixtures/tests and owner approval where major. M0 must not assume a Worklet-owned solver, Vue, or an unapproved storage/compute stack. Svelte + Vite with hash routing and pitch-lowered slowdown default are selected; Svelte version/store, numerical thresholds and physics solver placement remain open.

## ADR file template

Copy the following into `ADR-###-short-name.md`:

```markdown
# ADR-### — Exact technical decision
Status: Proposed | Accepted | Superseded
Decision owner: AG-M0-xx
Date and commit SHA:
Affected work-order IDs:
Affected public types/event schema version:
## Question and conflicting source links
## Options and measured tradeoffs
## Accepted choice (or explicitly still unresolved)
## API/file/fixture contract
## Migration and backward compatibility
## Positive and negative acceptance tests
## Performance/portability consequences
## How other agents consume this decision
```

A decision is frozen only when **status is Accepted**, the referenced type/schema fixtures exist at the committed version, and its owner has supplied an actual test or minimal example. On change: create a new ADR revision or superseding record, list affected task IDs and migration tests. Avoid editing earlier historical requirement quotations to disguise a change.

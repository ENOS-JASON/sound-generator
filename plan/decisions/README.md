# Architecture decision register — M0 freeze required

**Owner-approved architecture directions are recorded in [Round 1](USER-APPROVED-ROUND-01.md), [Round 2](USER-APPROVED-ROUND-02.md), and [Round 3](USER-APPROVED-ROUND-03.md).** All **25** owner selections are binding; benchmark-dependent implementation, validation and unspecified subdecisions remain open. No further major architecture choice may be made without explicit owner approval. **No technical choice below is accepted merely because it appears in a proposal.** The decision owner publishes a reviewed `ADR-###-slug.md` here with explicit `Status: Accepted` before downstream agents are allowed to rely on it.

See [agent contracts and working proposals](../30-agent-handoff-contracts-and-decisions.md#3-architecture-decisions-to-freeze-before-parallel-implementation), [plan audit](../29-plan-audit-and-gap-register.md) and [G0-A integration gate](../31-integration-gates-and-support-matrix.md).

## Round 3 approved status and remaining open technical choices

**Round 3: 9/9 approved.** [Decision record](USER-APPROVED-ROUND-03.md): initial **carb/mechanical I4** selection; **two editable I4 presets** (carb and EFI); **30 FPS 3D / 60 FPS 2D targets on reference hardware**; expert-editable separately versioned calibration trims; **cabin/engine-bay/roadside/exhaust listening**; imported plus verified-license bundled measurement references; Windows/Linux CLI **plus local graphical job monitor**; browser **IndexedDB autosave** and optional ZIP snapshots; and a **dedicated AI technical integration agent with escalation**. [Original Round 3 questionnaire, archived](OPEN-QUESTIONS-ROUND-03.md).

**Round 2: 9/9 approved.** [Decision record](USER-APPROVED-ROUND-02.md), [historical questions](OPEN-QUESTIONS-ROUND-02.md). **Round 1: 7/7 approved.** [Decision record](USER-APPROVED-ROUND-01.md).

**Technical choices still open:** [Post-Round-3 gap/decision register](OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md). Specific hardware benchmarks, model/preset physical parameters, expert trim bounds, license proof for bundled files, desktop monitoring technology, IndexedDB quota/recovery policies, AI agent GitHub permissions/merge authority and the Worklet-vs-Worker solver benchmark require validation/owner approval at the appropriate boundary.

## Round 1 status summary

- **Approved:** major architecture decisions require project-owner approval; Svelte + Vite; first complete I4 gasoline starter/manual/load vertical slice; eventual actual 3D CFD, chemistry and material simulation support; native CPU/GPU/other offline numerical backends allowed; both slow-motion audio modes with a switch.
- **Not yet decided:** AudioWorklet vs Worker ownership must be **benchmarked first and then returned to the owner for selection**; neither is the default winner.
- **Round 2 resolved:** hash routing, physical slow-motion audio default, two I4 controller modes, Windows/Linux, desktop browser coverage, ZIP export, measured validation where available and CI+integrator reviews. **Round 3 additionally approved:** factory carb initial selection, two editable examples, 30/60 reference FPS targets, expert trims, four listening perspectives, license-verified bundled measurements, local compute GUI, IndexedDB autosave and **dedicated AI integrator**. Its specific hosting/identity/GitHub privileges remain **NON VALIDATED**, as do physical/preset numeric parameters and tooling.

## Pending decisions and suggested owners

| ADR | Decision to freeze | Assigned owner |
|---|---|---|
| ADR-001 | **Benchmark Worklet-owned and Worker-owned physics fairly; owner approves the final single owner** (UD-R1-02; open) | **`AG-M0-10` accountable**, `AG-M0-09` consulted |
| ADR-002 | **Svelte + Vite with hash routes approved** (UD-R1-03, UD-R2-02); store/versions/component library remain open | `AG-M0-01` |
| ADR-003 | Canonical VehicleDefinition v2 schema and legacy-v1 migration disposition | **`AG-M0-03` accountable**, `AG-M0-04` consulted |
| ADR-004 | Event/command IDs and control-plane aliasing | `AG-M0-09` |
| ADR-005 | **Both audio modes; default pitch-lowered physical slowdown** approved (UD-R1-07, UD-R2-03); DSP budget/persistence open | **`AG-M0-10` accountable**, `AG-M0-12` consulted |
| ADR-006 | **Browser ZIP with JSON manifest/chunks** approved; optional **Parquet/HDF5 offline research** (UD-R2-06); internal chunk/codec open | `AG-M0-13` |
| ADR-007 | **Offline Windows + Linux**, with optional native CPU/GPU/WASM/other backends (UD-R1-06, UD-R2-07); exact numerical stack open | `AG-M0-16` |
| ADR-008 | Supported/approximate/planned/unsupported capability state | `AG-M0-04` |
| ADR-009 | **Numerical and available real-measurement validation, explicit confidence status** (UD-R2-05); model-specific tolerances open | **`AG-M0-03` accountable** for schema, provider owner consulted for its thresholds |
| ADR-010 | **Real recordings for calibration/validation only; imported and bundled catalog** (UD-R2-04, UD-R3-06). Bundled recordings permitted **only after redistribution/license evidence**, never playback. | `AG-M7-12` + `AG-M8-03` | 
| ADR-011 | **IndexedDB workspace autosave** and safe recovery + optional ZIP snapshots (UD-R3-08); exact DB schema/quota/migrations open. | `AG-M0-18` + `AG-M3-11` |
| ADR-012 | **Expert versioned calibration trims + four procedural listening positions** (UD-R3-04/05); exact calibration values/acoustic DSP algorithm open. | `AG-M2-06/07` + `AG-M3-09/10` |
| ADR-013 | **Dedicated AI integration agent with owner escalation** (UD-R3-09), no verified bot/GitHub review/merge privileges yet. | `AG-M0-19` |
| ADR-014 | **Windows/Linux CLI and local graphical study monitor** (UD-R3-07), toolkit/IPC/packaging open. | `AG-M6D-07` |

**Owner approval vs ADR acceptance:** the user approved Round 1–3 decisions are binding today. A formal ADR is only marked `Accepted` after its remaining technical details, fixtures/tests and owner approval where major. M0 must not assume a Worklet-owned solver, Vue, or an unapproved storage/compute stack. Svelte + Vite with hash routing and pitch-lowered slowdown default are selected; Svelte version/store, numerical thresholds and physics solver placement remain open.

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

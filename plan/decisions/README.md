# Architecture decision register — M0 freeze required

**Owner-approved architecture directions are recorded in [Round 1](USER-APPROVED-ROUND-01.md) and [Round 2](USER-APPROVED-ROUND-02.md).** All sixteen choices are binding; benchmark-dependent implementation and unspecified subdecisions remain open. No further major architecture choice may be made without explicit owner approval. **No technical choice below is accepted merely because it appears in a proposal.** The decision owner publishes a reviewed `ADR-###-slug.md` here with explicit `Status: Accepted` before downstream agents are allowed to rely on it.

See [agent contracts and working proposals](../30-agent-handoff-contracts-and-decisions.md#3-architecture-decisions-to-freeze-before-parallel-implementation), [plan audit](../29-plan-audit-and-gap-register.md) and [G0-A integration gate](../31-integration-gates-and-support-matrix.md).

## Round 2 status and Round 3 open questions

**Round 2: 9/9 approved.** [Decision record](USER-APPROVED-ROUND-02.md) establishes both initial I4 controller modes, Svelte+Vite hash URLs, default pitch-lowered slow motion, reference recordings for analysis only, numerical + available measured validation with confidence reporting, ZIP/optional scientific exports, Windows+Linux training, desktop Chromium/Firefox/Safari and CI + technical integrator PR review. [Original Round 2 questionnaire (archived)](OPEN-QUESTIONS-ROUND-02.md).

**Round 3: open, not approved.** [Open questions (R3-Q1…)](OPEN-QUESTIONS-ROUND-03.md) will address remaining presets, performance budgets, gain/spatial calibration, recording provenance, offline job management, integrator identity and storage. No recommendation should be treated as approved.

## Round 1 status summary

- **Approved:** major architecture decisions require project-owner approval; Svelte + Vite; first complete I4 gasoline starter/manual/load vertical slice; eventual actual 3D CFD, chemistry and material simulation support; native CPU/GPU/other offline numerical backends allowed; both slow-motion audio modes with a switch.
- **Not yet decided:** AudioWorklet vs Worker ownership must be **benchmarked first and then returned to the owner for selection**; neither is the default winner.
- **Round 2 resolves:** hash routing on GitHub Pages, physical slow-motion audio default, selectable carburetor/no-ECU versus EFI/ECU in first I4, offline Windows/Linux, cross-browser desktop targets, ZIP export family, measured validation when available, and routine PR review with CI + integrator. UI store/Svelte version, audio DSP thresholds, exact ZIP implementation and integrator identity remain open.

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
| ADR-010 | **Real recordings for calibration/validation only; never live or diagnostic playback** (UD-R2-04); source licenses/provenance open | Release/asset owner before asset import |

**Owner approval vs ADR acceptance:** the user approved decisions are binding today. A formal ADR is only marked `Accepted` after its remaining technical details, fixtures/tests and owner approval where major. M0 must not assume a Worklet-owned solver, Vue, or an unapproved storage/compute stack. Svelte + Vite with hash routing and pitch-lowered slowdown default are selected; Svelte version/store, numerical thresholds and physics solver placement remain open.

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

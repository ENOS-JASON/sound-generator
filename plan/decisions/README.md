# Architecture decision register — M0 freeze required

**Owner-approved architecture directions are recorded in [USER-APPROVED-ROUND-01](USER-APPROVED-ROUND-01.md).** These seven choices are binding, but benchmark-dependent implementations and unselected details remain open. No further major architecture choice may be made without explicit owner approval. **No technical choice below is accepted merely because it appears in a proposal.** The decision owner publishes a reviewed `ADR-###-slug.md` here with explicit `Status: Accepted` before downstream agents are allowed to rely on it.

See [agent contracts and working proposals](../30-agent-handoff-contracts-and-decisions.md#3-architecture-decisions-to-freeze-before-parallel-implementation), [plan audit](../29-plan-audit-and-gap-register.md) and [G0-A integration gate](../31-integration-gates-and-support-matrix.md).

## Pending Round 2 owner questions

[Open Round 2 choices (R2-Q1–R2-Q9)](OPEN-QUESTIONS-ROUND-02.md) cover the first I4 controller, GitHub Pages routing, slow-motion default, audio reference data, validation standards, export formats, compute platforms, browser coverage and agent PR review. **None are approved yet.**

## Round 1 status summary

- **Approved:** major architecture decisions require project-owner approval; Svelte + Vite; first complete I4 gasoline starter/manual/load vertical slice; eventual actual 3D CFD, chemistry and material simulation support; native CPU/GPU/other offline numerical backends allowed; both slow-motion audio modes with a switch.
- **Not yet decided:** AudioWorklet vs Worker ownership must be **benchmarked first and then returned to the owner for selection**; neither is the default winner.
- **Partially resolved:** UI framework is Svelte + Vite, while router, state library and Svelte major version remain to select. Audio must support both modes, while default mode and DSP targets remain open.

## Pending decisions and suggested owners

| ADR | Decision to freeze | Assigned owner |
|---|---|---|
| ADR-001 | **Benchmark Worklet-owned and Worker-owned physics fairly; owner approves the final single owner** (UD-R1-02; open) | **`AG-M0-10` accountable**, `AG-M0-09` consulted |
| ADR-002 | **Svelte + Vite approved** (UD-R1-03); router/store/version remain open | `AG-M0-01` |
| ADR-003 | Canonical VehicleDefinition v2 schema and legacy-v1 migration disposition | **`AG-M0-03` accountable**, `AG-M0-04` consulted |
| ADR-004 | Event/command IDs and control-plane aliasing | `AG-M0-09` |
| ADR-005 | **Both physical pitch-lowered and pitch-preserved slow motion required, switchable**; default and DSP policy open (UD-R1-07) | **`AG-M0-10` accountable**, `AG-M0-12` consulted |
| ADR-006 | Portable capture container/manifest, integrity and binary chunk extension | `AG-M0-13` |
| ADR-007 | Browser remains static; **native CPU, GPU and other backends are permitted** for offline high fidelity (UD-R1-06); specific backend open | `AG-M0-16` |
| ADR-008 | Supported/approximate/planned/unsupported capability state | `AG-M0-04` |
| ADR-009 | Numeric/conservation/quality acceptance budgets per model and fixture | **`AG-M0-03` accountable** for schema, provider owner consulted for its thresholds |
| ADR-010 | Assets and reference recording licenses | Release owner before asset import |

**Owner approval vs ADR acceptance:** the user approved decisions are binding today. A formal ADR is only marked `Accepted` after its remaining technical details, fixtures/tests and owner approval where major. M0 must not assume a Worklet-owned solver, Vue, or a specific default audio mode. Svelte + Vite is selected; router and state ownership are still outstanding.

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

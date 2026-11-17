# Architecture decision register — M0 freeze required

**No technical choice below is accepted merely because it appears in a proposal.** The decision owner publishes a reviewed `ADR-###-slug.md` here with explicit `Status: Accepted` before downstream agents are allowed to rely on it.

See [agent contracts and working proposals](../30-agent-handoff-contracts-and-decisions.md#3-architecture-decisions-to-freeze-before-parallel-implementation), [plan audit](../29-plan-audit-and-gap-register.md) and [G0-A integration gate](../31-integration-gates-and-support-matrix.md).

## Pending decisions and suggested owners

| ADR | Decision to freeze | Assigned owner |
|---|---|---|
| ADR-001 | Authoritative fast solver placement and AudioWorklet/Worker/time mapping | `AG-M0-09` + `AG-M0-10` |
| ADR-002 | One UI framework, routing mode and state ownership | `AG-M0-01` |
| ADR-003 | Canonical VehicleDefinition v2 schema and legacy-v1 migration disposition | `AG-M0-03` + `AG-M0-04` |
| ADR-004 | Event/command IDs and control-plane aliasing | `AG-M0-09` |
| ADR-005 | Default slowed physical-audio behavior and clock mapping | `AG-M0-10` + `AG-M0-12` |
| ADR-006 | Portable capture container/manifest, integrity and binary chunk extension | `AG-M0-13` |
| ADR-007 | Browser vs offline reference/training orchestration and job interface | `AG-M0-16` |
| ADR-008 | Supported/approximate/planned/unsupported capability state | `AG-M0-04` |
| ADR-009 | Numeric/conservation/quality acceptance budgets per model and fixture | `AG-M0-03` and relevant provider owner |
| ADR-010 | Assets and reference recording licenses | Release owner before asset import |

**Proposed default does not equal an accepted contract.** In particular the [plan](../01-architecture.md) still gives alternative solver placement and UI framework options. M0 decisions must resolve these once, not let each downstream agent guess.

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

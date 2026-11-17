# Copy/paste assignment prompt for an independent coding agent

Replace the task ID below with exactly **one** `AG-...` from [task-index.md](task-index.md). Provide the repository URL or a checkout as usual; previous ChatGPT conversations are **not required**.

```text
Repository: https://github.com/ENOS-JASON/sound-generator
Branch: create a focused task branch from the current main.
Assigned work order: AG-M0-01

Implement ONLY this work order. Start by reading:
  plan/agents/README.md
  plan/agents/task-index.md (find the assigned AG ID and its phase file)
  plan/30-agent-handoff-contracts-and-decisions.md
  plan/31-integration-gates-and-support-matrix.md
  The "Required references" explicitly listed on your AG card.

Project owner approved major-decision oversight, Svelte + Vite, both slow-motion audio modes and the first I4/manual/load baseline. See plan/decisions/USER-APPROVED-ROUND-01.md. Benchmark Worklet versus Worker physics and ask the owner to approve the final architecture; never silently select a winner.

Do not interpret a milestone as an implementation task, and do not independently select an
architecture already owned by a contract/ADR agent. Verify that prerequisite task IDs,
type fixtures and accepted ADRs are committed. If any are missing, return BLOCKED and
identify the exact missing contract, or implement only against an approved mock fixture
and explicitly mark live integration as pending.

Use strict TypeScript, existing SI units, typed event/clock contracts, shared port signs,
and one authoritative solver state. Never duplicate core EventBus, Clock,
TelemetryRegistry, validator or ApproximationRegistry. Do not edit other owners'
public files except through an accepted contract change request.

Implement the card's bounded deliverable, a positive and negative automated test,
and any required fixture, sample trace, audio evidence or screenshot. Run actual tests.
Do not claim a feature is implemented solely because its interface exists. Do not
mark other cards or whole milestones complete.

Return:
  task ID and complete/partial/blocked status
  accepted contract/ADR versions used
  prerequisites present or missing
  files changed
  public interface and component capability changes
  commands/tests run with real outcomes
  fixtures/screenshots/traces produced
  physical/audio/event invariants checked
  limitations and follow-up AG IDs
  PR/commit reference

If a requirement conflicts with another document, cite both paths and propose a
versioned ADR change rather than guessing. Follow plan/29-plan-audit-and-gap-register.md
for known conflicts.
```

## Example

For the first assignment, use **`AG-M0-01`**, which freezes the app/TypeScript/UI framework choice. The next agent can be given `AG-M0-03` (schema/units) or `AG-M0-09` (event contract) when their prerequisites exist. Do not send the entire roadmap as a task to one agent.

## Where to find the scope

- [100 source steps → 160 cards](task-index.md)
- [M0 foundation task cards](M0-foundation.md)
- [M6 reference substeps](M6A-reference-foundations.md)
- [Architectural decision registry](../decisions/README.md)
- [Gap/ambiguity audit](../29-plan-audit-and-gap-register.md)

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
  plan/decisions/USER-APPROVED-ROUND-01.md
  plan/decisions/USER-APPROVED-ROUND-02.md
  plan/decisions/USER-APPROVED-ROUND-03.md
  The "Required references" explicitly listed on your AG card.

Project owner approved major-decision oversight, Svelte + Vite, both slow-motion audio modes and the first I4/manual/load baseline (Round 1), then approved **Svelte+Vite hash URLs, both carb/no-ECU and EFI/ECU first-I4 modes, physical slow-motion as initial default, reference recordings for calibration/validation ONLY (never playback), numerical+available measurement confidence, browser ZIP/optional research Parquet/HDF5, offline Windows+Linux, desktop Chromium/Firefox/Safari, and CI + technical-integrator review of routine PRs** (Round 2). Read plan/decisions/USER-APPROVED-ROUND-01.md, plan/decisions/USER-APPROVED-ROUND-02.md and plan/decisions/USER-APPROVED-ROUND-03.md. Approved Round 3: factory carb/no-ECU with two editable carb/EFI examples; **30 FPS 3D / 60 FPS Canvas2D reference-hardware targets (not yet verified)**; expert versioned source trim; cabin/engine-bay/roadside/exhaust listener positions; user-imported plus license-verified distributable reference measurements for analysis only; Windows/Linux CLI+local GUI; IndexedDB autosave+optional ZIP snapshots; and **dedicated AI integration agent with owner escalation**. Technical ambiguities remain in plan/decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md. Benchmark Worklet versus Worker physics and ask owner approval of final solver placement.

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
mark other cards or whole milestones complete. One work order = one focused branch/PR;
CI and a **dedicated AI technical integration agent** must review routine changes and escalate major architecture/security/contract issues to the project owner;
major architecture ADR changes go back to the project owner for approval.
Do not automatically merge just because CI passes. Do not presume the AI reviewer has authenticated GitHub access, branch protection, or permission to merge: these require verified setup and explicit authorization.

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
  PR/commit reference and CI + technical-integrator review disposition

If a requirement conflicts with another document, cite both paths and propose a
versioned ADR change rather than guessing. Follow plan/29-plan-audit-and-gap-register.md
for known conflicts.
```

## Example

For the first assignment, use **`AG-M0-01`**, which freezes the app/TypeScript/UI framework choice. The next agent can be given `AG-M0-03` (schema/units) or `AG-M0-09` (event contract) when their prerequisites exist. Do not send the entire roadmap as a task to one agent.

## Where to find the scope

- [110 source steps → 170 cards](task-index.md)
- [Dedicated AI integration reviewer prompt](AI_INTEGRATOR_PROMPT.md) — approved review role, not yet a verified bot or authenticated merge service
- [M0 foundation task cards](M0-foundation.md)
- [M6 reference substeps](M6A-reference-foundations.md)
- [Architectural decision registry](../decisions/README.md)
- [Gap/ambiguity audit](../29-plan-audit-and-gap-register.md)

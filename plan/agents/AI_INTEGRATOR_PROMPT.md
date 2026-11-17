# Dedicated AI integration agent — review and escalation work instructions

**Status: approved role and review workflow, not a deployed/connected GitHub bot.** The owner selected a **dedicated AI integration agent with escalation** in [Round 3](../decisions/USER-APPROVED-ROUND-03.md). The exact GitHub reviewer identity, required app permissions, branch protections and authorization to actually merge PRs remain **NON VALIDATED** in [O3-02/O3-15](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md). `AG-M0-19` implements and verifies any actual integration.

## Copy/paste reviewer task for each code-agent PR

```text
You are the sound-generator project's dedicated AI technical integration reviewer.
Repository: ENOS-JASON/sound-generator
Assigned review: a specific PR URL/number and its single AG work-order ID.

Read:
  plan/decisions/USER-APPROVED-ROUND-01.md
  plan/decisions/USER-APPROVED-ROUND-02.md
  plan/decisions/USER-APPROVED-ROUND-03.md
  plan/30-agent-handoff-contracts-and-decisions.md
  plan/31-integration-gates-and-support-matrix.md
  plan/agents/task-index.md
  The exact AG card and only its required topical references.
  plan/decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md for known blockers.

For the PR:
  1. Confirm changed files stay inside card ownership and the PR includes only one
     self-contained work order. Check prerequisite AG IDs and accepted ADR versions
     actually exist in the target branch; no duplicate clock/bus/schema/port owner.
  2. Read the actual diff, current source and test results. Verify concrete positive
     and negative fixtures; inspect CI execution rather than trust a green-looking badge.
  3. Validate physics units, causal event order, source-calibration vs mix boundaries,
     no recorded-car sound playback, and no model claiming accuracy without evidence.
  4. If the PR changes frozen public APIs, architecture, CI credentials/permissions,
     licensing policy, audio sample origin, or project scope: ESCALATE to project owner
     with precise options, evidence, affected cards, and a proposed ADR. Do not
     unilaterally mark that major ADR accepted.
  5. Check any bundled measurement license and redistribution proof. Unproven
     permission means exclude asset and request changes.
  6. Check browser/Windows/Linux/test-hardware claims against actual run evidence.
     A target (30 FPS 3D, 60 FPS 2D) is not an achieved benchmark.
  7. For valid routine changes, emit an explicit APPROVE recommendation with all
     test/contract evidence. For defects request changes with exact failing paths.
     If blocked or uncertain, mark ESCALATE with owner question and do not merge.
  8. DO NOT invoke merge, adjust GitHub branch protections, request or create
     privileged tokens or label yourself the official reviewer unless actual
     authenticated tool permissions and owner merge policy were separately approved.
     CI passing alone never authorizes merge.
  9. Record a reusable review result with PR/commit SHA, AG ID, tested outcomes,
     owner approvals consumed, detected risks, merge-authority status and next action.

Your output statuses are APPROVE-RECOMMENDATION, REQUEST-CHANGES,
ESCALATE-OWNER, or BLOCKED-MISSING-EVIDENCE. The transport/actual PR review
permission is an implementation detail for AG-M0-19, not assumed here.
```

## Required machine-readable review result (proposed JSON shape)

```json
{
  "schemaVersion": "1-proposed",
  "repository": "ENOS-JASON/sound-generator",
  "pullRequest": "number-or-url",
  "headCommit": "sha",
  "workOrderId": "AG-M0-01",
  "decision": "APPROVE-RECOMMENDATION | REQUEST-CHANGES | ESCALATE-OWNER | BLOCKED-MISSING-EVIDENCE",
  "contractVersionsChecked": [],
  "prerequisitesChecked": [],
  "testsObserved": [{"command": "actual command", "result": "pass | fail | unavailable"}],
  "filesOutsideOwnership": [],
  "findings": [],
  "ownerApprovalRequired": true,
  "ownerDecisionRef": null,
  "mergeAuthorizationVerified": false,
  "nextAction": "text"
}
```

This schema is illustrative until `AG-M0-19` publishes a versioned accepted contract and a tested GitHub app/connector workflow; **it does not create review or merge privileges**.

## Routing table

| Condition | Required reviewer outcome |
|---|---|
| Routine code within card boundaries; tests and ADRs present | `APPROVE-RECOMMENDATION`; do not presume automatic merge |
| Unit/energy/event/calibration bug, missing negative tests, unlicensed reference assets | `REQUEST-CHANGES` and relevant tests |
| Unapproved major technology/framework/solver placement/API/owner security policy | `ESCALATE-OWNER` with ADR options and exact affected task IDs |
| Upstream version/fixture unavailable, cannot access PR/diff/checks, reviewer has no permissions | `BLOCKED-MISSING-EVIDENCE`; do not claim reviewed |
| PR authored by same integration reviewer, or conflict of interest/unsafe privileges | `ESCALATE-OWNER` or an independent review path (yet to be approved) |

**Do not assume a human technical integrator is required**: the selected routine role is AI. Human project-owner approval of **major ADRs** is mandatory. Whether the AI may actually merge routine PRs after review is **still a distinct, unresolved permission and safety decision**.

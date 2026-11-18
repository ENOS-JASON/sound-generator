# Agent execution — start here

**For a developer agent receiving one task with no previous chat history:** this folder is the implementation handoff. Read [approved Round 1](../decisions/USER-APPROVED-ROUND-01.md), [Round 2](../decisions/USER-APPROVED-ROUND-02.md), [Round 3](../decisions/USER-APPROVED-ROUND-03.md) and **[approved O3 implementation decisions](../decisions/USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md)** before older proposals. The [O3 questionnaire](../decisions/OPEN-IMPLEMENTATION-QUESTIONS-AFTER-ROUND-03.md) is historical: **all 15 answered**. [Remaining implementation verification](../decisions/OPEN-VERIFICATION-AFTER-O3-APPROVAL.md) is open. Do not interpret the [roadmap](../08-implementation-roadmap.md) as enough detail by itself.

## Per-agent checkbox tracking (required)

Every one of the **172 AG cards** has a valid GitHub Markdown `- [ ] **AG-... COMPLETE**` task checkbox directly below its existing `### AG-...` anchor. Its original acceptance/evidence sentence(s) were preserved as **individually checkable criteria**, followed by separate positive-test, negative-test, CI/artifact and approval and verified merge evidence checkboxes.

**The coding agent** may check each individual acceptance/test box **only with an actual passing result**, cited executed command, output/trace and linked focused PR. A failed/skipped test, mock-only prototype, missing prerequisite, unverified GPU/browser or owner-pending architecture approval **stays unchecked**; mark the issue BLOCKED/PARTIAL in the PR report. Never pre-check items merely because they are planned.

**Two valid review routes:** The project owner may personally review and merge a PR with no separate GitHub Approve submission, AI review, or Markdown task edit. Alternatively a distinct authorized AI integrator may review and conditionally merge routine work after verified permissions and CI. **On the next agent execution after merge, the agent reconciles Markdown tracking without owner action.** See [current review policy](../decisions/OWNER-PR-REVIEW-POLICY-2026-11-18.md).

**The only project-level completion dashboard is [08 — roadmap](../08-implementation-roadmap.md).** The [index](task-index.md) is the map from each parent roadmap checkbox to one or more AG cards, **not another checkbox dashboard**. The post-merge tracking agent may check a roadmap parent only after **every listed child** has its own checked COMPLETE box, verified and committed on `main`, and gate evidence is available. For a parent referencing 2–5 child AGs, finishing one child **does not** complete the parent. Regressions reopen both affected AG items and roadmap parents. **All tasks start unchecked.**

## Do exactly this

**First on each subsequent agent run:** reconcile prior verified owner/AI merges and technical evidence with task tracking. Do not block a genuine next task merely because old Markdown status was not yet reconciled; do not claim a checkbox changed until a commit exists. No extra owner action is needed.

1. Locate your **`AG-...` ID** in [task-index.md](task-index.md), open the linked phase brief and find the card with that ID.
2. Read [30 — shared contracts and decisions](../30-agent-handoff-contracts-and-decisions.md), plus only the **Required references** on your card. Read [31 — integration gates](../31-integration-gates-and-support-matrix.md) if claiming a milestone/provider complete.
3. Check prerequisite **task artifacts and accepted ADRs**. If absent, mark `BLOCKED` or implement against the explicitly identified mock **without pretending full integration**.
4. Implement only the bounded deliverables in the card's **owned code area**; use existing `src/contracts` definitions. Do not duplicate the clock, event bus, ledger, recorder, validator or approximation registry.
5. Add the card's required **positive/negative test**, demo/trace fixture or screenshot, and documented limitations. Run relevant typecheck/unit/browser tests (or state why impossible), then check **only the corresponding individually verified acceptance/test boxes in that AG card**. Never check its `COMPLETE` box until the PR has actually merged.
6. Submit **one focused PR per card** with real tests/fixtures/report and passing required checks. **One approval route suffices:** the project owner reviews and merges on GitHub, **OR** a separately authorized AI integrator reviews and conditionally merges routine PRs. The owner need not file a GitHub review or edit Markdown. Major ADRs, shared public TS interfaces/ownership and security/licensing remain owner-only decisions. No CI-only merge, AI self-review or unverified bot privileges. See [owner PR review policy](../decisions/OWNER-PR-REVIEW-POLICY-2026-11-18.md).

## How the documents are organized

- [AGENT_PROMPT.md](AGENT_PROMPT.md): copy/paste prompt for assigning a single coding work order with no prior conversation.
- [AI_INTEGRATOR_PROMPT.md](AI_INTEGRATOR_PROMPT.md): dedicated AI reviewer **conditionally authorized for routine merge after required checks**, with owner escalation of shared APIs/major ADRs; this document does not install a bot or grant GitHub API permissions.
- [../decisions/README.md](../decisions/README.md): current approved 40 owner decisions (Rounds 1–3 + O3), still-unverified subchoices and ADR register. Svelte+Vite **hash routing**, browser **ZIP**, first I4 **carb/no-ECU and EFI/ECU** paths, offline Windows/Linux and desktop Chromium/Firefox/Safari are already approved; do not reopen them without project-owner authorization.
- [task-index.md](task-index.md): every roadmap checkbox has a stable **AG ID**, an exact copied scope and a link to its independently assignable card. Some broad source bullets are split into **letter-suffixed cards**, each intended for a separate agent. A split is not complete until **all** child cards pass.
- `M0-foundation.md` … `M9-plus.md`: phase-specific task briefs containing the **inputs, owned modules, exact deliverable, tests and blocking contract references**. Each card is designed to be handed alone with [30](../30-agent-handoff-contracts-and-decisions.md), without requiring awareness of other phase discussions.
- [29 — audit](../29-plan-audit-and-gap-register.md): source contradictions and why assignments were split.
- [31 — gates](../31-integration-gates-and-support-matrix.md): evidence needed before downstream agents can treat a component as complete.
- [23 — original direction](../23-quoted-project-direction-and-decisions.md): preserved requirements for background; not a replacement for task contracts.

## Dependency policy

- **Contracts first:** M0 schema/clock/bus/API decisions are accepted and versioned before agents implement against them. An unapproved alternative framework/event name is not a valid deliverable.
- **Fixture-first independent work:** a task for a future subsystem may run against **a committed contract fixture**, mock provider or recorded trace if its real predecessor is unfinished; it must clearly report integration as pending.
- **Only proven dependencies:** `G0-B` means mock clock/audio/diagnostic stack actually passes; `G1` means a usable physical engine actually exists; `G6` means reference data is numerically valid. Do not infer milestone status from checkboxes alone.
- **One owner per public contract:** requests to change `src/contracts`, event IDs, core clock, physical-port signs, trace schema, or router go through an accepted ADR and the contract owner.
- **Contract versioning:** downstream agents pin declared schema/version, and a breaking change has an explicit migrator/test.
- **Non-goal:** a task implementing one engine or compressor family must not claim to implement **all** historical configurations. Mark unsupported/approximate behavior honestly.

## Definition of independent

The agent card should let an agent answer without asking who built an adjacent task:
- *What do I produce?* A file/module/fixture and observable behavior.
- *What inputs may I consume?* Known type/service and fixture names with unit/time constraints.
- *Which docs are essential?* Explicit links.
- *What must I not change?* Public contracts and unrelated module ownership.
- *How do I prove done?* Named tests, a negative case and any visual/audio/run artifacts.
- *What if blocked?* Report missing task/contract identifier and exact failure; don't guess.

## New discoveries and gaps

If an agent detects a real contradiction not addressed in [29](../29-plan-audit-and-gap-register.md), append a new issue with the conflicting document links and recommended resolution **without silently changing established contracts**. Ask the contract owner to accept a decision and link any affected cards. Every implementation card can be amended for clarity, but changing a frozen interface requires versioned evidence.

## Canonical phase gate shortcut

| Group | Minimum prerequisite | Notes |
|---|---|---|
| **M0** | none, except individual contract/fixture order | synthetic mock acceptance G0-B |
| **M1** | G0-B + frozen state/event/port types | common solver, baseline equations, starter/engine |
| **M2** | G0-B synthetic worklet; G1 physics for final source integration | may prototype on synthetic event fixture |
| **M3** | frozen UI/preset/visual source contracts; G1/G2 for live integration | 2D and 3D independent renderers |
| **M4** | G1 connected physics and a provider-specific component graph fixture | each technology slice independently validated |
| **M5** | scenario schema/engine fixture; full G1 where using real physics | minimal M1 harness exists before rich M5 runner |
| **M6** | G5 scenario/experiment format and reference port contracts | M6A numerical kernels can use fixtures before full study runner |
| **M7** | G6 valid reference dataset + G1 fast baseline | no tuning on invalid research data |
| **M8** | shipped subset G0–G7 as applicable | excludes unimplemented planned tech |
| **M9+** | requires separate future decomposition | roadmap bullets are strategic epics; split into executable providers before assigning |

For independent implementation, link a **task ID**, not “implement M4”. **Required compatibility cards:** `AG-M6D-08` must provide GTX1080/Pascal `sm_61` CUDA12.x kernels and CPU fallback; `AG-M8-05` must verify user i9/GTX1080 system separately from the agent-proposed mid-range reference desktop. These must not be marked complete from a mock GPU test alone.

 The added Round 3 tasks `AG-M0-18/19`, `AG-M1-12`, `AG-M2-06/07`, `AG-M3-09/10/11`, `AG-M6D-07` and `AG-M7-12` are separate work orders with explicit prerequisite evidence. Do not assume an AI reviewer bot, redistributable reference recording, GUI runtime or 30/60 FPS measured performance already exists.

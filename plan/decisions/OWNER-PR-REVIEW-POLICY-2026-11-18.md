# PR review/merge — project-owner clarification (2026-11-18)

**Status: OWNER-APPROVED.** The owner specified that personal review and merging of a pull request on GitHub are sufficient approval; no action beyond review and merge should be required. This supplements O3-02 B and O3-15 B without removing the option of AI-integrator review.

## Valid approval routes (one is sufficient)

**A — OWNER_REVIEWED_AND_MERGED:** The project owner personally inspects the focused PR and clicks Merge on GitHub. GitHub must confirm `merged=true`, an actual `merge_commit_sha`, and `merged_by` equal to the authorized owner. The owner has attested to reviewing the PR. A separate GitHub Approve submission, AI review, Markdown task edit, issue comment, ChatGPT message or second confirmation is **not required**. Do not mislabel it as independently AI-reviewed.

**B — AI_INTEGRATOR_REVIEWED_AND_MERGED:** A distinct authorized AI technical integrator may review and conditionally merge routine PRs **only** after verified GitHub credentials, least-privilege permissions, CI/security/branch enforcement and separate reviewer approval. Major ADRs, shared/public TypeScript APIs, module ownership, security/licensing and credential matters still escalate to the owner. The AI reviewer is not assumed to be installed or authorized. Never self-review or CI-only auto-merge.

In either path, all applicable positive/negative tests, acceptance criteria, required CI/branch checks, artifact evidence and owner-only decisions must be satisfied. A merge proves approval/merge, not missing technical evidence.

## Tracking is the agent's responsibility

Before review, the implementing agent checks only proven acceptance items. **At the next agent execution after the merge**, the agent verifies the PR, merge actor/SHA and CI evidence and reconciles task tracking; it marks the approval/merge criterion, then `AG-... COMPLETE` **last** if all criteria passed, then the roadmap parent only when all linked children are complete on `main`.

**The owner never needs to edit Markdown, post another approval, ask for tracking cleanup or repeat a merge.** A tracking-only documentation commit to `main` may be used where branch protections and write permissions allow; otherwise use the next authorized tracking update and document the limitation. Never claim an uncommitted checkbox changed. A stale tracking checkbox must not be interpreted as an unmerged PR or as a demand for owner reapproval. An agent run (or separately configured automation) is required; this is not background work performed at merge time.

## Verified owner-reviewed historical PRs

The project owner confirmed personally reviewing and merging PRs #1 and #2. GitHub confirms `merged_by=ENOS-JASON` for both, without separate GitHub PR review submissions:

| Task | GitHub PR | Merge commit | CI evidence |
| --- | --- | --- | --- |
| AG-M0-01 | [#1](https://github.com/ENOS-JASON/sound-generator/pull/1) | `394b5228cbf9dc0c51a0c3a935458f88a9c97085` | [Passing CI 44309782838](https://github.com/ENOS-JASON/sound-generator/actions/runs/44309782838) |
| AG-M0-02 | [#2](https://github.com/ENOS-JASON/sound-generator/pull/2) | `2e72c27361c54866ff14cab260f06228cfb7aa03` | [Passing PR CI 44316133945](https://github.com/ENOS-JASON/sound-generator/actions/runs/44316133945) and [successful main Pages deployment/public HTTPS smoke 44317405493](https://github.com/ENOS-JASON/sound-generator/actions/runs/44317405493) |

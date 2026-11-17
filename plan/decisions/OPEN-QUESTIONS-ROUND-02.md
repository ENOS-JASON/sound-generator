# Pending owner questions — Round 2

**Status: OPEN — no answers approved.** These questions follow [owner-approved Round 1](USER-APPROVED-ROUND-01.md). Proposed recommendations below are **not decisions** and must not be implemented/frozen until the project owner selects an answer. The project owner must approve all major architecture choices. Use answer IDs `R2-Q1` through `R2-Q9`.

| ID | Unresolved decision | A | B | C | Suggested, not approved | Affected ADR/tasks |
|---|---|---|---|---|---|---|
| **R2-Q1** | First playable **I4 gasoline** fuel and control setup | Carburetor/distributor without ECU | Electronic fuel injection with ECU | Both selectable on same I4 in first complete demo | C | M1 control paths, G1/G2 and I4 preset |
| **R2-Q2** | GitHub Pages multipage routing | Hash route (`/#/drive`) | Clean history URLs with tested Pages fallback | Agent benchmarks and returns choice for owner approval | A | ADR-002; AG-M0-01/02, G0 |
| **R2-Q3** | **Default** audio mode in slow motion (both always available) | Start with physically pitch-lowered mode | Start with pitch-preserving mode | Remember last explicitly selected mode, defined first-run fallback later | A | ADR-005, AG-M2-05, AG-M3-07 |
| **R2-Q4** | Reference car audio for physically generated sound | No recordings used at all | Recordings/measurement only for validation/calibration, not playback | Permit optional sample playback layers in addition to procedural | B | ADR-010, M2, M6/M7 and asset provenance |
| **R2-Q5** | Accuracy/quality evidence | Numerical convergence/invariants only | Numerical tests plus real measurement comparison when available, label confidence | No model marked runnable until matched to real measurements | B | ADR-009, G6/G7 and model status |
| **R2-Q6** | Capture and high-detail data format | ZIP with JSON manifest + versioned binary chunks/WAV | Single database-style bundle such as SQLite | Browser ZIP plus optional Parquet/HDF5/other columnar/scientific research exports | C | ADR-006; M0 recorder, M6 study, M7 training |
| **R2-Q7** | High-compute platform support priority | Windows/WSL first | Linux dedicated machine first | Windows and Linux with configurable native CPU/GPU support | C | ADR-007, AG-M0-16, M6 CLI/backend |
| **R2-Q8** | Browser/device coverage target | Desktop Chromium first, other browsers best-effort | Desktop Chromium, Firefox, Safari; 2D fallback | Desktop and mobile all major browsers from first release | B | G0/G8, UI/Audio, Pages |
| **R2-Q9** | How implementation agents merge work | Owner reviews every task PR | CI + technical integrator reviews routine PRs, owner approves all major ADRs | Automatically merge each task into main after CI passes | B | [30 — handoff](../30-agent-handoff-contracts-and-decisions.md), gate reviewers, branch policies |

## Questions deliberately deferred until later rounds

- Performance budgets: exact devices, audio sample rate, FPS, real-time CPU allocation, pitch-preserving accuracy/latency tradeoff and numerical tolerance targets; measure before hardcoding.
- First I4 engine dimensions, manual gear count, environment and whether 2D or 3D default on slower clients.
- First GPU/native backend/libraries, kernel portability, vendor and precision tradeoffs, CFD/chemistry solver stack and accuracy targets.
- Import storage limits, handling of multi-terabyte research datasets, local vs remote remote-control of job orchestration.
- Physical microphone positions/listener spatialization, sound-pressure calibration, dynamic range, external lab measurements and accepted sources.

A response to Round 2 should be recorded in a separate `USER-APPROVED-ROUND-02.md`; do not overwrite this open questionnaire or modify the original quoted requirements. Where the user selects an option that still contains a subdecision (e.g. choose later after benchmark), that subdecision stays open with a new owner task/ADR.

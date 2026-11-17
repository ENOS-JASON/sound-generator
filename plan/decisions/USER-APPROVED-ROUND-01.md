# User-approved decisions — Round 1

**Status: Approved by project owner on 2026-11-17.** These are binding **product requirements and choice constraints**, not evidence that the corresponding TypeScript APIs, benchmarks, runtime fixtures, or formal implementation ADRs have already been completed. All seven answers below were explicitly supplied by the owner. A decision requiring a further benchmark or narrower technical choice remains **unresolved** at that narrower level.

**Precedence:** where these owner approvals conflict with previous *recommendations* in [30](../30-agent-handoff-contracts-and-decisions.md), provisional language in [01](../01-architecture.md), or the historical selected-options quote in [23](../23-quoted-project-direction-and-decisions.md), **this record supersedes the proposal** without altering the historical quotation. The implementation must still satisfy accepted contracts and gate tests.

## Approved decisions

| Owner decision | Approved selection | Implementation effect / accountable card | Still open (do not assume) |
|---|---|---|---|
| **UD-R1-01 — Major decisions** | **A — Project owner approves every major architectural decision** | All ADR owners prepare options, tradeoffs, affected AG IDs, evidence and explicit approval request; `AG-M0-16` G0-A checks approval before contract freeze. Routine implementation details inside frozen contracts need no new approval. | Exact threshold for minor vs major decisions; escalations should err on seeking approval |
| **UD-R1-02 — Runtime ownership** | **C — Benchmark both AudioWorklet-owned and Worker-owned physics, then choose one authoritative owner** | `AG-M0-10` owns a reproducible comparison with `AG-M0-09` event and `AG-M0-12` audio contracts. Present results to project owner; **do not automatically select the benchmark winner**. | Final solver placement, coupling, transport, supported browser fallback and performance targets, pending benchmark + owner approval |
| **UD-R1-03 — UI framework** | **A — Svelte + Vite** | `AG-M0-01` pins a compatible Svelte major version, strict TypeScript and Vite. No Vue work or competing UI framework proposals unless explicitly re-approved. | Router strategy (hash vs Pages fallback), state-management convention, version selection and detailed component library |
| **UD-R1-04 — First complete running engine** | **B — Inline-four gasoline engine with starter, manual transmission and vehicle load** | G1 fast engine includes real I4 geometry/firing, starter/crank/idle, clutch and **basic manual transmission and meaningful coupled road/load physics**. G2 adds physically driven sound, G3 adds 2D/3D and UI. A free-rev-only cylinder demo is not the first *complete* vertical slice. `AG-M1-06`, `AG-M1-11`, `AG-M2-04`, `AG-M3-08c` check interfaces and integration. | Which initial fuel/ignition/control technology (carb/no ECU vs EFI/ECU), specific engine dimensions, gear count and vehicle preset |
| **UD-R1-05 — Ultimate fidelity architecture** | **B — Design for eventual actual 3D CFD, advanced combustion chemistry and material simulation** | Reference solver interfaces in M0/M6 must accept future 3D space/time discretization, species/chemical kinetics, conjugate heat transfer and multi-material states via extensible, versioned adapters; no claim that a multi-zone thermodynamic solver is equivalent to 3D CFD. This future backend is **planned, not a prerequisite for M1/M6 initial validated tiers**. | Specific CFD solver/library, turbulence/chemistry fidelity, mesh technology, external measurement validation, timeframe |
| **UD-R1-06 — Reference compute backends** | **C — Permit native CPU, GPU and other appropriate computational backends** | TypeScript coordinates studies/data contracts, but high-fidelity numerical kernels **may** use native, GPU, WASM and other justified methods through versioned backends; not TypeScript-only. `AG-M0-16` defines backend abstraction; M6 implements benchmarked drivers as needed. | First native/GPU stack, portability, target OS/hardware, GPU vendor, floating-point precision and determinism policy |
| **UD-R1-07 — Slow-motion audio** | **C — Both physical pitch-lowered slow motion and pitch-preserving audio time stretch, selectable by switch** | `AG-M0-10` and `AG-M0-12` define explicit `slowMotionAudioMode`; `AG-M2` implements both audio paths, `AG-M3` provides an accessible switch. Both share the same authoritative physics/sim clock and preserve event identity; audio mode is separately captured in diagnostics. | Default mode, acceptable pitch-preservation artifacts and worklet CPU/fallback policy |

## Mandatory approval workflow for independent agents

1. **Agent explores** major architectural options without changing public contracts or silently committing the selection.
2. **Agent proposes** a numbered ADR with recommended option, reproducible evidence or benchmark, tradeoffs (accuracy, timing, browser support, complexity, maintenance), impacted files/schema and dependent AG IDs.
3. **Project owner approves** the particular architectural choice in chat/PR or an equivalent attributable decision message. The ADR records that decision and its date/source; absence of approval = `Proposed`.
4. **Contract owner implements and tests** the accepted choice, pins schema/interface versions and fixture hashes, and records final `Accepted / Implemented` status; a user-approved direction alone is **not** a passing G0 gate.
5. Major changes to the accepted approach **return for owner approval**; trivial internal refactors within a frozen contract may be decided by agents.

### ADR-001 experiment required before owner selection

Benchmark with equivalent deterministic I4/starter/clutch/manual/load mock or first fast baseline in both architectures using identical solver equations, event/clock/telemetry contracts. Record source timing/jitter, audio underruns at common sample rates, transport overhead/backpressure, physics CPU cost, latency of controls, memory/GC, clock drift at 0.1x/1x, page/navigation suspension and headless reproducibility. Compare representative desktop and constrained browser cases if possible. Do **not** benchmark Worklet as “light physics” versus Worker as “complete coupled physics” and infer a winner; work must be functionally equivalent. Publish code and results for approval, then freeze exactly one authoritative owner (with explicit fallback).

### Audio mode implementation boundaries

- **Physical slowdown:** simulated events unfold more slowly and audible cadence/pitch follows them; physics state/RPM/torque in simulated time unchanged.
- **Pitch-preserving inspection:** similar slow temporal cadence with approximate preservation of perceived pitch/timbre; use declared time-stretch DSP, bounded latency and artifact diagnostics. It is not equivalent to changing combustion physics or simply freezing oscillator phase.
- A dedicated toggle shows the active mode; exported traces/audio captures record it. If a mode cannot meet deadline under specified load, show degraded/unavailable state rather than silently replacing it.
- Compare **same physical tick/event hashes** in both modes. Audio signal output will legitimately differ; compare with mode-aware audio features.

## Follow-up issues for Round 2

Pending owner choices include: first I4 fuel/controller strategy, default slow-motion audio mode, audio reference/calibration priority, recording/export packaging and portability, performance/budget targets for offline native/GPU work, browser support, routing/storage strategy, and detailed agent/PR approval workflow. Collect decisions in a separate numbered owner record before freezing corresponding ADRs.

## Source answer (verbatim choices)

> 1. Who should make technical architecture decisions?: A — I approve each major architectural decision  
> 2. Where should the real-time physics run?: C — Benchmark both, then select one authoritative owner  
> 3. Which UI framework?: A — Svelte + Vite  
> 4. What should the first fully working engine include?: B — Inline-four gasoline engine, starter, manual transmission and vehicle load  
> 5. How far should the highest-fidelity physics go?: B — Design for eventual real 3D CFD, advanced combustion chemistry and material simulation  
> 6. What technologies can the offline training engine use?: C — Allow native CPU, GPU and other computational backends where appropriate  
> 7. How should slow-motion audio behave?: C — Support both modes with a switch

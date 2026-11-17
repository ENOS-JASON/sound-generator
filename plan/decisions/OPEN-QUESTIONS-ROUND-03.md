# Pending owner questions — Round 3

**Status: OPEN — none approved.** This questionnaire follows the nine [approved Round 2 decisions](USER-APPROVED-ROUND-02.md) and seven [Round 1 approvals](USER-APPROVED-ROUND-01.md). Do not implement the **recommended option** as a decision until the owner explicitly selects A/B/C. Use the exact IDs `R3-Q1` through `R3-Q9`. Partial responses are valid; unanswered items stay open.

| ID | Owner decision still missing | A | B | C | Recommended only | Affected contracts/agents |
|---|---|---|---|---|---|---|
| **R3-Q1** | **Initial I4 controller on first launch** (both approved and available) | Carburetor/mechanical/no-ECU selected by default | EFI/ECU selected by default | Choose which control system before starting; no preset preference implied | C | `AG-M1-07a/07b`, `AG-M3-05a/07`, G1/G3 |
| **R3-Q2** | **First physical I4/vehicle demo presets**: exact starting parameters still open | One generic configurable ~2.0 L I4 and basic five-speed/road-car baseline | One documented real production I4/gearbox as reference template, not a claim of exact emulation | Two separately documented, physically valid starter examples (mechanical-carb and EFI), both fully editable | C | `AG-M0-03`, `AG-M1-05/06/11`, preset registry |
| **R3-Q3** | **Runtime quality/performance policy** for supported desktop browsers | Fixed 60 FPS 3D on a defined mid-range desktop, fixed reduced mode otherwise | 30 FPS 3D / 60 FPS 2D minimum target on a defined reference device | User-selectable adaptive quality tiers with measured FPS, CPU/audio deadlines and automatic optional 2D fallback | C | G0/G2/G3/G8, `AG-M0-10` benchmark, `AG-M8-02` |
| **R3-Q4** | **Who can edit source calibration versus mixer levels?** (two separate layers are already mandatory) | Physical calibration is locked; users edit individual source/bus/master faders only | Expert mode can edit versioned calibration trims separately from everyday mix | Expert calibration editor **plus A/B calibration profiles and recorded provenance**, separate from everyday mix | C | `AG-M2-03b`, Audio Studio, [12](../12-audio-gain-staging-and-mixer.md) |
| **R3-Q5** | **Spatial listening / microphone viewpoints** | One fixed near-engine or tailpipe listening position | Switchable interior/cabin, engine-bay, roadside and exhaust viewpoints with configurable mic/spatial transfer | Full real-time 3D acoustic propagation (including complex reflections/diffraction) in the initial release | B | `AG-M2` sound routing, `AG-M3` 3D/Audio Studio, future acoustics solver |
| **R3-Q6** | **Source of real reference recordings**, solely for calibration/validation (never playback) | User-imported owned/licensed recordings only | Project-bundled licensed reference measurement catalog only | Both uploaded measurements and explicitly licensed bundled references with separate provenance | A | `AG-M7`, `AG-M8-03`, ADR-010 |
| **R3-Q7** | **Offline training job management** across Windows/Linux | CLI and local filesystem only | CLI plus a local desktop control/monitor app | CLI plus optional self-hosted local-network or remote worker queue and monitoring; no mandatory public server on Pages | C | ADR-007, `AG-M6D-03a/03b`, Research UI |
| **R3-Q8** | **Preset, debug and research-data persistence** | Explicit file save/import only, no browser autosave | Browser IndexedDB autosave, exported ZIPs as optional snapshots | Browser autosave/cache plus portable ZIP files and offline project/dataset folders for large research | C | ADR-006, `AG-M0-13/14`, `AG-M3`, `AG-M6D` |
| **R3-Q9** | **Who acts as the technical integrator** already approved for routine PR reviews | Named human technical integrator | Dedicated AI integration agent with CI and owner escalation | Hybrid AI review/CI with a human responsible for merge approval and conflict resolution | C | [30](../30-agent-handoff-contracts-and-decisions.md), G0–G8 reviewer policy, `AGENT_PROMPT` |

## Notes on interpretation

- `R3-Q1` concerns the *initial selection* only; it may **not** remove either approved I4 controller strategy.
- `R3-Q2` example displacement/ratios are illustrations, **not approved physical input values**. Whatever is selected, derived displacement/torque/power and appropriate controller behavior must be verified, not assumed from a real vehicle's marketing specs.
- `R3-Q3` is a choice of quality policy; measured hardware targets, audio CPU and numerical tolerances remain to be established after benchmarking. 2D fallback is already required under Round 2.
- `R3-Q4` cannot undo the **already required** healthy source calibration, distinct physics/source gain controls and final mixer/headroom. Every option preserves them; the only open choice is **who can edit calibration**, whether versions/A/B are needed and how those edits are audited separately from user mix.
- `R3-Q5` spatial audio is a visualization/listening DSP feature. It does not give permission to play recordings; every car source stays procedural.
- `R3-Q6` import of real recordings requires provenance/license and analysis-only handling under [UD-R2-04](USER-APPROVED-ROUND-02.md). No audio sample library or clip playback.
- `R3-Q7` optional remote compute must not require Github Pages hosting any backend. Network security/credentials and ownership need a separate ADR if approved.
- `R3-Q8` autosave must not silently erase the user's prior run state or replace a reproducible exported study manifest.
- `R3-Q9` project-owner approval of **major architecture decisions** is already mandatory regardless of integrator type.

## Later questions not silently decided

Audio pitch-preservation algorithm/latency quality budget; exact M0 CaptureBundle ZIP/Parquet/HDF5 libraries; minimum Safari version and native/GPU backend/driver requirements; numerical convergence thresholds per fidelity; choice of first CFD/chemistry platform; microphone transfer calibration and physical-acoustic measurements; high-accuracy runs' multi-day checkpoints/remote data security.

Once the project owner responds, create **`USER-APPROVED-ROUND-03.md`**, update affected task cards and ADRs, mark this questionnaire as historical rather than open, and leave any unanswered or narrower subchoices unresolved.

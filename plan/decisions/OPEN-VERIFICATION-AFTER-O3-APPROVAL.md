# Verification and implementation details remaining after all O3 decisions

**Status: 15/15 O3 owner choices CLOSED and approved; technical implementation/verification remains OPEN.** Refer to [binding approval](USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md). This is an **evidence/dependency register, not a request to revisit the approved options**. Future major architecture or hardware/permission policy proposals must be presented to the project owner. No user approval alone constitutes proof of an operational system.

| Verification ID | Binding choice | Required evidence or narrower unapproved detail | Accountable cards | Blocking acceptance |
|---|---|---|---|---|
| **V4-01** | O3-01 one primary dev desktop | Owner-reported **Windows 11 / i9-10900KF / 32 GB / GTX1080**, NVIDIA driver described as latest supported but exact version **unverified**; collect browser, driver and reproducible Worklet-vs-Worker same-I4 benchmark; present final solver owner to owner for approval | `AG-M0-10` | ADR-001 |
| **V4-02** | O3-02 AI may merge routine PR under rules | Actual GitHub API installation/identity, scoped review + merge permission, branch protection, required CI checks, audit trail, owner-approved enforcement rules, independent/self-review defense and escalation tests; no credential assumptions | `AG-M0-19` | AI-assisted merge activation / G8 |
| **V4-03** | O3-03 selected IndexedDB dataset classes | Schema/migration/quota/last-good recovery plus capped recent debug channels, storage disabled and ZIP snapshot tests | `AG-M0-18`, `AG-M3-11` | G0-B/G3 |
| **V4-04** | O3-04 agents propose generic I4 values | Two quantitative physical vehicle examples with justification and acceptance tests **submitted for owner approval before publishing as defaults** | `AG-M1-12` | G1 presets |
| **V4-05** | O3-05 agents propose mid-range FPS hardware | Propose and seek owner approval of machine/OS/browser/resolution/DPR/scene; measured 30 FPS 3D + 60 FPS Canvas 2D on approved reference, test report with frame-time percentile and audio/physics timing | `AG-M8-02`, `AG-M3-02` | G3/G8 |
| **V4-06** | O3-06 expert gain trim only | Source physical operating conditions, allowed gainDb min/max, clip/headroom, version/undo tests; no general EQ/spectral-source editor | `AG-M2-06`, `AG-M3-09` | G2/G3 |
| **V4-07** | O3-07 listener independent of camera | Four distinct validated procedural transfer profiles; 3D camera drag changes no listener; perspective change edits no engine state | `AG-M2-07`, `AG-M3-10` | G2/G3 |
| **V4-08** | O3-08 research licensed measurements before bundling | Candidate dataset list, actual copyright/license redistribution terms and attribution, source/measurement conditions, owner review; no bundled asset without rights | `AG-M7-12`, `AG-M8-03` | ADR-010/G7/G8 |
| **V4-09** | O3-09 CLI-launched loopback dashboard | Choose/evaluate UI stack with owner review if major, loopback-only bind, CSRF/origin handling, startup/stop/reconnect, run checkpoint command authentication and Windows/Linux smoke | `AG-M6D-07` | G6 |
| **V4-10** | O3-10 NVIDIA CUDA alongside CPU | CUDA 12.x **`sm_61`** build/launch smoke and parity on GTX1080/Pascal, 10th-gen i9 multicore CPU fallback, Windows/Linux driver toolkit capability and precision/VRAM tests; no CUDA13-only dependency | `AG-M0-16`, `AG-M6D-03a`, `AG-M6D-08` | ADR-007 / CUDA provider acceptance |
| **V4-11** | O3-11 ZIP first, scientific format later | Browser ZIP roundtrip/secure import; evaluate actual numerical dataset dimensions, analysis/query and portability evidence before owner-facing Parquet/HDF5 proposal | `AG-M0-13`, `AG-M6D-05` | ADR-006 / optional export |
| **V4-12** | O3-12 latest two stable major browser versions | Record current two stable major releases for Chrome/Chromium, Firefox and Safari at QA time, test actual versions on supported desktop OS including AudioWorklet, slow mode and 2D fallback; unavailable coverage disclosed | `AG-M8-01`, `AG-M8-05` | G8 |
| **V4-13** | O3-13 bounded configurable history | Set rationale for default history count/age/byte limits, configure/evict/recover, quota-safe transactional snapshots and ZIP independent of IndexedDB; no unbounded storage | `AG-M0-18`, `AG-M3-11` | G0-B/G3 |
| **V4-14** | O3-14 expert mode toggle no auth | GUI toggle disclosure, guarded dangerous gain edits and undo; explicit confirmation that no login/role/PIN is introduced or claimed as security | `AG-M3-09` | G3 |
| **V4-15** | O3-15 escalates public contract/ownership changes | AI reviewer policy detects frozen public TS APIs/ports/bus/event IDs, `src/contracts/`, module ownership and security/license major paths; owner escalation tests incl. malicious PR and reviewer-authored PR | `AG-M0-19` | AI reviewer tests / G8 |
| **V4-16** | Additional i9-10th-gen/GTX1080 **must be supported** | Owner-reported **Windows 11/i9-10900KF/32 GB/GTX1080**; exact NVIDIA driver build/CUDA12.x installed toolkit, actual CPU/GPU execution, resource constraints and browser WebGL compatibility on owner's machine **not yet verified**; no performance promise without on-device test; report any CPU-only fallback per solver | `AG-M6D-08`, `AG-M8-05` | compatibility acceptance before release |

## Required GTX 1080 legacy compatibility guardrail

- NVIDIA official GPU classification: GTX1080 **Pascal `sm_61`** — https://developer.nvidia.com/cuda/gpus/legacy
- NVIDIA official CUDA 13.0 release notes: **Pascal offline compile/library support removed** — https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/
- NVIDIA official CUDA 12.9 release notes: CUDA 12.x still supports Pascal build — https://docs.nvidia.com/cuda/archive/12.9.0/cuda-toolkit-release-notes/index.html
- **Mandatory `sm_61`-compatible CUDA 12.x build/profile, plus mandatory multicore CPU fallback.** Other GPUs can use a separate newer CUDA target without breaking legacy support. Library dependencies must be pinned per supported architecture and checked in CI/prototype; installing current CUDA 13 alone does not pass GTX1080 requirements.
- **OS = Windows 11, CPU = i9-10900KF, RAM = 32 GB (owner-reported).** GPU = GeForce GTX1080, driver described as **latest supported** (exact numeric version/branch unknown). See [hardware profile](OWNER-DEVELOPMENT-HARDWARE.md). Device driver branch and CUDA toolkit are not yet known; do **not** instruct user to replace GPU, install unsafe drivers or assume all versions work. CUDA/OpenCL/CPU backends must be labeled with **actual availability**, and any precision-constrained solver may use validated CPU instead of an unsupported CUDA path.

## Governance

**Conditional AI routine merging is now owner-approved** (O3-02 B), but active autonomous merging remains **blocked** until audited access/branch rules and exact approved merge policy exist. **Mandatory owner escalation** applies to major ADRs **and changed public/shared TS contracts/module ownership** (O3-15 B). Regular dependency changes that do not cross these boundaries need not escalate unless security/privilege/rights are affected.

The project owner also retains approval of the **final Worklet-vs-Worker solver placement**, actual first I4 presets and proposed mid-range reference machine. All other specific implementation choices may be made by assigned agents inside frozen contracts or surfaced as ADRs when material.

**Do not say these 15 selections are open.** They have been decided. Only concrete subchoices, verification and implementation are outstanding.

# ADR-007 — Reference experiment and compute boundary

**Status: proposed, owner review required.** AG-M0-16. The approved Windows/Linux, multicore CPU, prioritized NVIDIA CUDA and CUDA12.x sm_61 requirements remain binding (Round 2, O3-10); no specific numerical library, runtime, language or accelerator stack is selected.

## Proposal

Keep the versioned experiment and manifest as JSON data, with complete physical port graphs, per-component provider revision, geometry/material/parameter/subcomponent/mesh/acoustic-source metadata and shared scenario, initial state, seed and fidelity. Store both baseline and variant manifests and exact declared/realized component changes and rewiring. Compare JSON object keys canonically and treat arrays as ordered and atomic. A one-part variation must change exactly one installed component; unrelated rewiring is rejected. Physically derived outputs do not constitute independent input changes.

Use a backend-neutral adapter with a capability probe, preflight, run/cancel and checkpoint boundary, explicit precision/device/runtime/build/reduction/resource metadata and common SI reference projections from AG-M0-15. CPU fallback is explicit and never rebrands results as CUDA. Preserve ZIP as canonical browser interchange; Parquet/HDF5 are optional later research adapters, not selected dependencies.

## Alternatives and trade-offs

- Hard-code Node workers or a native CUDA-only stack: simpler initial implementation, but violates replaceability or CPU/Pascal compatibility and would couple the browser to research execution.
- Store only parameter patches: smaller files, but incomplete provenance and risk of unrecorded component or topology changes.
- Full immutable manifests plus explicit changes: more disk usage; deterministic comparisons and auditability. Recommended; versioned chunked storage and scheduling belong to M6.

The contract does not implement a solver, checkpoint persistence, local dashboard, streaming codec, driver probe, hardware benchmark or measured numerical parity. Actual device/provider evidence and precision/VRAM preflight remain required in AG-M6D-03a/08 and AG-M8-05. The owner must approve this additive public contract/ADR before merge; no independent AI approval is claimed.

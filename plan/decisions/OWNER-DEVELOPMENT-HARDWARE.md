# Owner development desktop — supplied hardware profile

**Status: owner-reported machine inventory; no on-device diagnostic commands or benchmarks have been run.** This document supplements [the O3 owner-approved hardware requirement](USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and should be used by [AG-M0-10](../agents/M0-foundation.md#ag-m0-10), [AG-M6D-08](../agents/M6D-reference-execution-and-views.md#ag-m6d-08), and [AG-M8-05](../agents/M8-release-and-performance.md#ag-m8-05). Project owner supplied these specific details on 2026-11-17.

## Confirmed by owner report

| Attribute | User-provided value | Verification state |
|---|---|---|
| Operating system | **Windows 11** | Owner-reported; exact Windows build/edition not collected |
| CPU | **Intel Core i9-10900KF** (10th generation) | Owner-reported; clock/thermal performance not measured |
| System RAM | **32 GB** | Owner-reported; speed/free available memory not collected |
| GPU | **NVIDIA GeForce GTX 1080** (Pascal / CUDA compute capability **6.1**, `sm_61`) | Owner-reported device; CUDA architecture from NVIDIA public specifications |
| NVIDIA graphics driver | **"Latest supported NVIDIA driver for the GTX 1080"** | **Owner description only**; actual installed driver version/build and package branch **not verified** |
| CUDA toolkit installation | **Unknown** | `nvidia-smi`'s displayed CUDA Version is **driver API compatibility**, **not proof `nvcc`/toolkit is installed** |
| Windows graphics/browser environment | **Windows 11 desktop** | Browser versions, WebGL mode, default graphics device, AudioWorklet/driver behavior not measured |
| WSL or native Linux on this machine | **Not established by this hardware report** | Linux remains a separately required offline-CLI target; do not assume WSL or Linux tests passed |

## Binding consequences

1. **O3-01 A physics architecture benchmark:** run the equivalent AudioWorklet-owned vs Worker-owned physics experiments on **this primary Windows 11 i9-10900KF/32 GB/GTX1080 desktop** when access is available, recording browser versions, threading, audio callback deadlines, physics tick/event parity, CPU load, thermal and memory state. This primary machine is **not automatically** the separately selected mid-range reference for the published 30 FPS 3D / 60 FPS 2D targets.
2. **O3 extra compatibility requirement:** offline solver and browser application must function on this hardware, with multicore CPU fallback; GPU kernels must support **Pascal `sm_61` under a compatible CUDA 12.x toolkit**. NVIDIA removed Pascal offline compilation support in CUDA 13. Modern NVIDIA libraries may have stricter GPU requirements; choose compatible pinned versions and run a real on-device smoke test before claiming success.
3. **Do not interpret "latest supported driver" as a number or assume any specific driver branch/toolkit.** In particular, do not conclude CUDA 12.x compiler is installed from a driver string. Compatibility validation needs exact driver version, installed toolkit (if any), `nvcc --version` and a compiled/run test kernel.
4. **Use the real CPU model and RAM budget in future test/config manifests.** Multi-thread research scheduling cannot assume all 32 GB are free, and do not allocate GPU work based on an invented free VRAM amount.
5. **Windows 11 primary benchmark does not waive the approved Windows+Linux offline-CLI support requirement or desktop Firefox/Safari coverage.** Safari will require a separate macOS test environment; no claim that this Windows computer can run native Safari.
6. When device access is unavailable, describe code, fixtures and SDK target as prepared and compatibility as **`not yet verified on owner hardware`**, never as passed.

## Optional read-only diagnostic collection on Windows

These commands only inspect local hardware and toolchain; **they install or change nothing**. If PowerShell reports `nvcc` unavailable, that is a possible normal state and does not mean the NVIDIA display driver is missing.

```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber
Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
nvidia-smi
Get-Command nvcc -ErrorAction SilentlyContinue | Select-Object Source
if (Get-Command nvcc -ErrorAction SilentlyContinue) { nvcc --version }
```

**External architecture references:** NVIDIA [legacy GPU compute capabilities](https://developer.nvidia.com/cuda/gpus/legacy), [CUDA Toolkit 13.0 release notes](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/). Version/build output of the user's actual machine is the relevant verification source, not a vendor marketing page.

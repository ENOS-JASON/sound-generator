# Owner development desktop — supplied hardware profile

**Status: owner-reported base inventory plus actual pasted `nvidia-smi` and PowerShell `nvcc` command results dated 2026-11-17 16:00:52. The NVIDIA driver/GPU/VRAM were observed on-device; CUDA compiler availability in PATH was checked. No CUDA kernel, solver benchmark or browser-compatibility test has run.** This document supplements [the O3 owner-approved hardware requirement](USER-APPROVED-O3-IMPLEMENTATION-DECISIONS.md) and should be used by [AG-M0-10](../agents/M0-foundation.md#ag-m0-10), [AG-M6D-08](../agents/M6D-reference-execution-and-views.md#ag-m6d-08), and [AG-M8-05](../agents/M8-release-and-performance.md#ag-m8-05). Project owner supplied these specific details on 2026-11-17.

## Confirmed by owner report

| Attribute | User-provided value | Verification state |
|---|---|---|
| Operating system | **Windows 11** | Owner-reported; exact Windows build/edition not collected |
| CPU | **Intel Core i9-10900KF** (10th generation) | Owner-reported; clock/thermal performance not measured |
| System RAM | **32 GB** | Owner-reported; speed/free available memory not collected |
| GPU | **NVIDIA GeForce GTX 1080** (Pascal / CUDA compute capability **6.1**, `sm_61`) | Owner-reported device; CUDA architecture from NVIDIA public specifications |
| NVIDIA graphics driver | **582.78** (`NVIDIA-SMI 582.78`) | Observed in user-supplied `nvidia-smi` output, dated 2026-11-17 |
| Driver-advertised CUDA API compatibility | **13.0** in `nvidia-smi` | Not proof of installed CUDA Toolkit 13.0, and **not the compiler target** for Pascal |
| CUDA compiler on PowerShell PATH | **`nvcc` not found** | User's `Get-Command nvcc` check returned `CUDA Toolkit not found in PATH`. A toolkit located outside PATH remains possible; actual installation status unverified |
| Toolkit installation willingness | **User can install CUDA Toolkit if necessary** | Approved as a **possible future prerequisite**, not a request to install now. Choose/pin a compatible toolkit and supported MSVC before asking |
| GPU device mode | **WDDM**, display active | Observed on-device; system graphics processes use shared GPU resources |
| Total GPU VRAM | **8,192 MiB (8 GiB)** | `nvidia-smi` observed **1,460 MiB used**, approximately **6,732 MiB free at capture time only** |
| GPU telemetry snapshot | **40 °C, 1% GPU utilization** | Momentary status at 2026-11-17 16:00:52; not a load benchmark |
| Windows graphics/browser environment | **Windows 11 desktop** | Browser versions, WebGL mode, default graphics device, AudioWorklet/driver behavior not measured |
| WSL or native Linux on this machine | **Not established by this hardware report** | Linux remains a separately required offline-CLI target; do not assume WSL or Linux tests passed |

## Binding consequences

1. **O3-01 A physics architecture benchmark:** run the equivalent AudioWorklet-owned vs Worker-owned physics experiments on **this primary Windows 11 i9-10900KF/32 GB/GTX1080 desktop** when access is available, recording browser versions, threading, audio callback deadlines, physics tick/event parity, CPU load, thermal and memory state. This primary machine is **not automatically** the separately selected mid-range reference for the published 30 FPS 3D / 60 FPS 2D targets.
2. **O3 extra compatibility requirement:** offline solver and browser application must function on this hardware, with multicore CPU fallback; GPU kernels must support **Pascal `sm_61` under a compatible CUDA 12.x toolkit**. NVIDIA removed Pascal offline compilation support in CUDA 13. Modern NVIDIA libraries may have stricter GPU requirements; choose compatible pinned versions and run a real on-device smoke test before claiming success.
3. **NVIDIA driver 582.78 is confirmed by on-device output.** Its `nvidia-smi CUDA Version: 13.0` is driver API compatibility, **not an installed CUDA 13 compiler/toolkit**. `nvcc` is **not on the current PowerShell PATH**; do not claim the toolkit is installed or absent without inspecting actual locations. CUDA 12.x compilation for `sm_61` remains mandatory. NVIDIA's CUDA 12.9 Windows driver table specifies 576.02 or newer for the corresponding toolkit driver, so 582.78 meets the published numerical minimum; actual build/driver compatibility still needs a smoke test.
4. **Use actual i9-10900KF and 32 GB RAM budgets** in test manifests. GTX 1080 has **8,192 MiB total VRAM**; 1,460 MiB used (~6,732 MiB free) was a momentary snapshot, not reserved memory. Recheck free VRAM at job start, account for WDDM display use and provide safe CPU fallback.
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

## Conditional CUDA Toolkit setup policy

The owner **is willing to install a CUDA Toolkit if genuinely required** for the CUDA prototype. **No installation or driver change is needed now** merely to prepare the project plan. `AG-M6D-08` must first produce a reproducible CUDA 12.x `sm_61` build/test fixture, verify supported Visual Studio C++/MSVC and Windows build, and then request an **explicit, compatible toolkit version** (CUDA 12.9.x is a candidate) with **the existing 582.78 driver preserved unless an identified incompatibility demands otherwise**. Do not install CUDA 13.x as the only development toolkit for Pascal.

The owner-provided 582.78 driver exceeds NVIDIA's CUDA 12.9 GA 576.02 Windows driver number in the published toolkit table. This is a **compatibility expectation, not proof** of an actually compiled CUDA 12.9 Pascal kernel. [CUDA 12.9 release notes](https://docs.nvidia.com/cuda/archive/12.9.0/cuda-toolkit-release-notes/index.html), [CUDA 12.9 Windows compiler prerequisites](https://docs.nvidia.com/cuda/archive/12.9.0/cuda-installation-guide-microsoft-windows/index.html).

**External architecture references:** NVIDIA [legacy GPU compute capabilities](https://developer.nvidia.com/cuda/gpus/legacy), [CUDA Toolkit 13.0 release notes](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-toolkit-release-notes/). Version/build output of the user's actual machine is the relevant verification source, not a vendor marketing page.

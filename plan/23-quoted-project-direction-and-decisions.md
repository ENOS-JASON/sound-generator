# 23 — Original architecture choices and quoted expansion brief

**Purpose:** preserve the selected technical-direction passage and the subsequent requirements in the planning repository **as quoted source material**. The quoted text is a requirement/decision input; the actionable engineering contracts are in [24](24-simulation-clock-and-time-scaling.md), [25](25-core-diagnostics-recording-and-comparison.md), [26](26-multipage-ui-and-floating-widgets.md), [27](27-high-fidelity-experiment-orchestration.md), [28](28-shared-realtime-surrogates-and-calibration.md) and the [roadmap](08-implementation-roadmap.md). Quotation does not imply that previously proposed alternatives such as Svelte vs Vue 3 have been definitively chosen.

## Selected technical choices — quotation preserved

> **4. Specific technical choices**
>
> | Concern | Preferred option | Reason |
> |---|---|---|
> | Language | TypeScript strict mode | Compile-time checks across subsystems |
> | Application | Vite | Straightforward GitHub Pages deployment |
> | Architecture | Composition + interfaces | Replace individual subsystems |
> | Engine state | Owned by simulation runtime | Prevent multiple conflicting sources of truth |
> | Event handling | Typed event bus + commands | Deterministic cross-module communication |
> | Physics algorithms | Pure functions + stateful system classes | Testability and performance |
> | Audio | AudioWorklet + internal mixer | Precise control and sample timing |
> | 3D | Three.js | Mature engine visualization |
> | 2D | Native Canvas 2D | Low overhead, independent of WebGL |
> | UI | Svelte or Vue 3 | Component-based tuning and mixer controls |
> | Testing | Vitest + Playwright | Unit, integration and browser tests |
> | Training | Worker + offline TypeScript CLI | Share calculations without blocking audio |

## Subsequent project-direction request — verbatim quotation preserved

> Time scaling should be possible so we can see in slow motion for the real time engine. the 3d/2d view move properly. So that must be in core too to make sure everything works properly. In the core we must have debug menus that could be opened and closed to help determine what might cause issues, this must be for physics, audio, etc and allow recording all those values and export and allow back import to revalidate and compare. It should include a view with graphs for the sounds, live telementry and other details, that must be implemented in the core before proceeding further to make sure it works. As for the UI, there must be multiple pages, not all info all on a single page. Some elements could have small widgets draggable on page and possible to hide to help debug and stuff while on other interfaces. Also note it is normal if at the most fidelity settings it takes multiple hours for a single cycle of the piston, if not even more, i dont mind, its to put on a machine that will crunch it on all threads to then be fed to a simplification engine that would make all those values into equations that would allow real time rendering and simulation. The objective is to have a basic initial generic calculation engine for real time that would allow for finetuning and that taken into account, but finetune equations and simulation based on a model that got simulated to a higher level of accuracy. Both initial generic calculation engine and high detail simulation should be compatible together. Make sure that the generated data from high accuracy simulation includes the detail of what components were in the simulation and allow high accuracy simulation to make multiple runs to validate its behavior but also multiple runs to help determine how changing a single part affects the simulation and sound. That should allow validation and tweaking and simplification of math by making calculations have a map of values or similar when possible and make multiple components potentially share the exact same simplified calculation. That would also allow to determine if a component affects physics and sounds. It should have a simulation setting that would allow testing in sequences all setups with a single part changing or preset of parts changing. we need to build the simplified calculation engine first, while taking into account how calculations and variables may be later tweaked via a complete simulation. make sure to include quoted message into the plan for how it should be built

## Architectural interpretation / precedence

The **implementation sequence is explicit**:
1. **M0 foundation:** strict TypeScript contracts, fixed-step simulation clock with time scale, event bus, diagnostics registry, graphing/meters, capture/export/import/replay/comparison and multi-page debug shell are implemented and testable *before physics expansion*. Use mock physics and synthetic audio test signal initially to verify them.
2. **M1 + M2:** build a **generic, physically constrained, real-time engine and procedural sound** with extension points and coefficient/map interfaces from the outset. It is fully useful without training.
3. **M3–M5:** connect 2D/3D views, guided vehicle wizard, audio mixing, scenario and experiment editing to those same contracts and instrumentation.
4. **M6:** add optional extremely expensive high-fidelity reference models and multicore offline study runner. **Hours per simulated piston cycle are acceptable at Research fidelity**, when resource/progress controls and checkpoints are appropriate.
5. **M7:** fit, validate, version and deploy lightweight equations/lookup maps/correction models against high-fidelity **component-tagged** scenario datasets. The fast solver **does not become a mesh solver**.
6. **M8+:** broaden verified configurations, share reusable surrogate families across compatible components, benchmark and publish.

**Clarifications:** Slow-motion changes the rate at which simulated time is presented relative to wall/audio time, not the underlying equations or component geometry. Extensive diagnostics can be toggled and must not block audio. "Higher fidelity" is a reference-model choice, not proof of ground truth without convergence and measurement checks. Massive offline compute may use all configurable logical CPU threads but does not belong in the GitHub Pages runtime. Shared approximations require compatible physical meaning, units and validity domains, not just similar numeric curves.

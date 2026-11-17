# 22 — Step-by-step, capability-aware vehicle configurator

**Status: mandatory product requirement, start the schema/UI foundations in M0 and ship the wizard in M3.** Users should build a vehicle with a guided **step-by-step configurator**, not a flat form exposing irrelevant or contradictory parameters. Every field and permitted value depends on the selections already made, the installed component capabilities, physical constraints and implementation support tier. Related: [09 — Data contracts](09-data-contracts.md), [14 — Modular TypeScript platform](14-modular-typescript-platform.md), [15 — Engine families and presets](15-engine-families-and-presets.md) and [21 — Fidelity controls](21-adjustable-fidelity-multizone-reference-simulation.md).

## Experience and navigation

- Start from **a validated vehicle/engine preset** (recommended) or **from scratch**. Display a concise summary, current step, progress, remaining requirements and optional Expert mode.
- A wizard is **data-driven**: each step has an ID, title, predicates for applicability, required capabilities, fields, validator(s), option providers, derived read-only values and review summaries. Different drivetrain/engine families can insert/omit steps without rewriting unrelated pages.
- Back/Next, breadcrumbs to completed steps, editable summary, reset section, undo of incompatible changes, save draft, import/export and resume. The user can revisit and change earlier choices; show a **clear impact preview** of downstream values/components that will be removed/recomputed.
- Validation at each step **and** for the complete graph. Prevent proceeding with broken required inputs, but allow saving an explicitly **incomplete draft** that is not runnable. Never silently substitute unsupported technology.

## Suggested wizard flow

| Step | Choices and examples | Context-dependent behavior |
|---|---|---|
| **0. Start / template** | Vehicle preset, purpose (free-rev, dyno, driving), rough era | Load compatible defaults; display supported/approximate/planned fidelity |
| **1. Powertrain family** | Four-stroke spark ICE, other implemented ICE, future diesel/rotary/two-stroke/EV/hybrid | EV skips bore/piston/valves/carb/ignition pages; future families require implemented provider |
| **2. Engine layout** | Number of cylinders **1–12**, inline/V/flat, bank count/angle, physical placement, firing order | V/flat bank geometry, firing offsets and order validated; I1 one bank, bank lengths derive from mapping |
| **3. Engine geometry** | **Bore and stroke**, rod length, piston/crank geometry, compression ratio, bore/stroke units, chamber/valve properties | Total displacement calculated from bore/stroke/cylinder count; dynamic physical ranges, clearance and piston constraints |
| **4. Fuel, ignition and control** | Carburetor or injection, mechanical/no-ECU vs ECU, choke, distributor, ignition method, tune maps | ECU-only spark/fuel/boost/launch/overrun map fields appear only if suitable ECU/controller is selected |
| **5. Air and induction** | Airbox/filter, carb/ITB/throttle, manifold/run length, naturally aspirated, turbo(s), supercharger(s), twincharging, intercooling | Choice produces valid connected air/exhaust/shaft/electric graph; expose wastegate/drive ratios only where applicable |
| **6. Exhaust / cooling** | Headers, bank grouping, manifolds, catalyst/muffler, thermal/cooling configuration | Show turbine/exhaust afterfire parameters only when corresponding components and physical model exist |
| **7. Electrical / starting** | Battery chemistry/capacity, SoC/health, starter type/wear, alternator and accessories | No cranking starter fields for unrelated powertrains; voltage/current bounds depend on electrical architecture |
| **8. Transmission** | Manual, automatic/torque converter, AMT, sequential, DCT, CVT, later eCVT | Clutch pedal/gear pairs vs converter lockup vs CVT ratio vs hybrid motor paths are mutually relevant |
| **9. Driveline** | FWD, RWD, full-time AWD, on-demand AWD, selectable 4WD/4x4, transfer/differentials/locks | 2H/4H/4L only for compatible transfer case, 4L only if low-range gear exists; actual wheel drive path validated |
| **10. Wheels / vehicle / test load** | Vehicle mass, axle/wheel properties, tires, brake, road/surface, drag, slope, dyno mode | Applicable load model determines available fields and physical dimensions |
| **11. Audio / visualization** | Calibrated source stems, buses, master, 3D vs 2D, bank labels | Sources/renderer content created from active hardware components and cylinder-bank registry |
| **12. Optional advanced training** | Quick/Balanced/Detailed/Research, per-component cells/zones, step/tolerance, scenarios | Show only resolvable fidelity controls for selected supported physics components; preflight budgets |
| **13. Review / validate / save** | Preview graph, derived displacement, expected supported outputs, warnings, completeness, serialized preset | Show absent/unsupported features and consequences; runnable only after full validation |

A wizard may reorder/merge steps for a simple preset while preserving **logical prerequisites**. Future EVs and hybrids get different providers and conditional steps; do not show fake piston fields for EV.

## Bore, stroke and geometry calculations

For equal-size cylinders:

```text
bore_m = bore_mm / 1000
stroke_m = stroke_mm / 1000
displacementPerCylinder_m3 = (pi / 4) * bore_m^2 * stroke_m
totalDisplacement_m3 = displacementPerCylinder_m3 * cylinderCount
totalDisplacement_L = totalDisplacement_m3 * 1000
meanPistonSpeed_mPerSecond = 2 * stroke_m * RPM / 60
```

- **Bore and stroke are independently editable** with unit toggles (mm/in); displacement (cc/L/cu-in) updates instantly and is read-only by default to avoid inconsistent input. Optionally support a **displacement-target mode** that solves for one free geometric variable while keeping another locked; never allow three independent conflicting geometry inputs.
- Support per-bank/per-cylinder geometry only if the registered family genuinely permits it. Compute total displacement as **sum of each cylinder's volume** if unequal; no implicit multiplication by a uniform bore/stroke in that mode.
- Validate positive finite dimensions, cylinder count, consistent crank stroke/radius, rod length > crank radius and piston/deck/clearance geometry, valve head and bore clearance, compression volume/ratio and supported crankcase/bank topology.
- Mean piston speed, bore/stroke ratio and mechanical/stress heuristic guidance may be warnings rather than universal hard limits: historic, racing and specialty engines may exceed normal production ranges. Hard bounds must reflect the chosen **physical model's valid operating domain**, not arbitrary vehicle stereotypes.
- Cylinder count/layout does not automatically imply a single firing order; validate user selections against active crankshaft geometry and intended cycle. Bank arrangement feeds the 2D side-view rows and acoustic source registry.
- When an input changes, recompute dependent quantity/constraints in a deterministic dependency graph: **bore -> cylinder volume -> compression/charge volume consistency -> air demand -> torque/loss/power estimates -> acoustic/visual projections**. Existing user overrides in unrelated fields must survive if still compatible.

## Schema-driven fields and capability filtering

`ConfiguratorStepDefinition` and `FieldDefinition` should declare:
- Stable `fieldId` and dotted configuration `path`, user-facing name/description, type, display units/SI storage units, default and whether it is editable/derived.
- `visibleWhen(context)`, `enabledWhen(context)`, `requiredWhen(context)`, `options(context)`, `constraints(context)` and `derive(context)`, with deterministic functions defined in source code (not arbitrary functions embedded in user JSON).
- Dependencies by field/port/component capability ID, support status and controller generation; context updates trigger targeted field and option recomputation.
- Validation severity: error (impossible/incompatible, blocks next step/run), warning (physically unusual or estimated), info (approximate/planned provider).
- Preset migration and stale-field cleanup policy; optional stable custom extension fields for third-party component providers.

**One source of truth:** UI options, TypeScript types, import validation, scenario schema, component instantiation and training job preflight all use the **same capability registry and validators**. Hiding an impossible option is helpful UX but **not** a substitute for rejecting malformed preset JSON at the engine boundary.

## Concrete conditional examples

- Select **mechanical/no ECU**: show choke, carb and distributor controls; do not expose editable electronic spark maps, fuel-cut rev limiter or pop-and-bang ECU tune. If a physical mechanical afterfire mechanism exists, give it its own configuration.
- Select **ECU**: show only controls its specific capability manifest supports (fuel/spark tables, electronic throttle, boost/wastegate control, overrun map, 2-step, etc.). Disable unsupported strategies rather than silently accepting them.
- Select **naturally aspirated**: hide boost pressure controls, intercooler, BOV and wastegate unless actually connected by the chosen graph. Select single turbo, twin turbo, supercharger or compound: dynamically add the corresponding physical flow/shaft/heat settings.
- Select **manual gearbox**: show clutch friction, engagement, individual gear ratios and shift controls; select conventional automatic: show torque-converter coupling/lockup and shift strategy; select CVT: show bounded ratio curve, not manual discrete gears.
- Select **FWD or RWD**: only a matching driven axle path; AWD/4WD: offer center coupling, transfer and differential options consistent with actual configuration. Show 4L when the selected transfer case includes a low-range ratio.
- Select **inline-four**: one cylinder bank in 2D. Select **V12**: two valid banks with all twelve cylinders (e.g. six per bank), correct geometry and firing order. Don't infer bank membership from odd/even IDs.
- Select **training: Quick**: lumped cylinder/gas-path options only. Select **Detailed** with implemented multi-zone models: show cylinder gas-zone count, liner axial/radial thermal sections, exhaust/intake axial cells, adaptive dt and mesh diagnostics. Show unsupported "Research" capabilities as unavailable with a reason, not active controls.
- Select **electric-only** (future): no engine bore/stroke, carb, combustion valves, starter crank or exhaust pop tune; show motor/inverter/battery/regen providers when implemented.

## User-friendly controls

- Prefer progressive disclosure: **Basic** (essential choices), **Advanced** (detailed physics parameters and per-cylinder overrides), **Research** (numerical mesh/time-step controls) within the appropriate wizard step. These UI detail views do not change physical fidelity unless the user explicitly selects a supported solver setting.
- Suggested defaults always identify engine/preset origin; numeric entry plus slider/spinner with unit-aware formatting and meaningful stepping; keyboard and accessibility support; labels with physical meaning, valid range and impacts.
- Show live **derived** displacement/cc, bank count, compression info, estimated torque/HP only when supported by the selected physics/load model, powertrain graph, supported audio stems, and scenario completeness. Avoid presenting a guessed engine torque as an exact measurement.
- Support a "Review changes" dialog when switching engine layout/controller/transmission invalidates earlier values; prefer preserving values that remain valid, offer explicit reset for incompatible subtrees and maintain undo.
- Provide **saved partial drafts** (local data only by default); loaded presets and drafts pass the same schema/compatibility migration. A partially configured vehicle cannot start or train without completing required fields.
- Training step includes memory/time **cost indicators and feasible platform** (browser Worker vs external CLI) and a per-component resolution matrix with actual enabled/unsupported entries.

## Acceptance tests

- [ ] Users can build a physically valid I4 with bore/stroke, ECU, induction, manual and RWD by following wizard steps; final preset validates and runs.
- [ ] Users can build a mechanical/no-ECU single-cylinder or V8 and never see invalid ECU-only controls; ECU-only operations are rejected by schema import as well as UI.
- [ ] Bore/stroke modification immediately recalculates displacement in cc/L and appropriate geometry/airflow dependencies; invalid rod/piston/clearance combinations block progression with precise feedback.
- [ ] A V12 and flat engine show valid layout/bank/firing options and map correctly into 2D and audio; changing count/layout reconciles downstream state without ghost cylinders.
- [ ] Selecting turbo/supercharger/compound induction reveals only connected supported compressor/turbine/cooling controls; an incompatible graph cannot be saved as runnable.
- [ ] Manual/automatic/DCT/CVT selections expose model-specific inputs and don't leak stale gearbox fields into the saved config.
- [ ] FWD/RWD/AWD/4WD selections expose only applicable differential/transfer modes; 4L requires a physically modeled low-range gear.
- [ ] Switching earlier selections presents explicit downstream change effects, keeps valid overrides and allows undo.
- [ ] Unsupported or planned technologies never appear as active runnable choices; users can see explanation/planned status.
- [ ] Training detail controls appear only for supported component solvers and cannot request out-of-bounds zones or memory/time budgets.
- [ ] Wizard and raw JSON import use the same validation results; invalid hidden fields and capability mismatches cannot bypass the checks.
- [ ] Draft save/resume, tab navigation, keyboard operation, units, import/export and schema migrations have automated browser tests.
- [ ] Entering/exiting configurator or changing 2D/3D view never mutates a running simulation until an explicitly validated apply/reset boundary.

## Implementation phases

- **M0:** define wizard schema, component capability/field registry, geometry derivations, constraint/units validators, graph dependency engine and draft/preset migration.
- **M1:** implement bore/stroke/geometry and engine-bank physics contract, with unit and constraint tests; support safe validated initial preset creation.
- **M3-A:** wizard shell, templates, dynamic steps, Back/Next, state, unit-aware numeric input, derived values, error/warning badges and draft persistence.
- **M3-B:** wire full engine, control, intake/induction, exhaust/electrical, transmission/driveline and audio/visual step providers to actual supported modules.
- **M3-C:** conditional training step integrated with [21](21-adjustable-fidelity-multizone-reference-simulation.md), review graph, validation/export and recovery after incompatible edits.
- **M4+:** every new component family registers its wizard descriptors and validation/tests with the same interface; no duplicated forms.
- **M5/M6:** scenario-runner input and reference training preflight use the same schema/validators; simulation fidelity editor adds per-zone advanced controls only when available.

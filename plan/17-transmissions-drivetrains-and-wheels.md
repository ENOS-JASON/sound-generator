# 17 — Transmission, driveline layouts, torque distribution and wheel load

## Goal

Model driver controls, transmission operation and **load from the contact patch all the way back to the engine** across historic and modern vehicles. Drivetrain is not a fixed "gear ratio" attached to RPM. The schema represents a connected, typed torque path whose components may couple/decouple, slip, transmit engine braking, store inertia and dissipate heat.

## Transmission families and coupling

| Transmission / launch device | Behavior to model | Sound and controls |
|---|---|---|
| Manual gearbox + friction clutch | pedal, partial clutch engagement/slip, clutch inertia/heat, dog/synchronizer engagement, gear ratios, neutral | clutch chatter, gear whine, rev-matched shifts, grind if modeled |
| Automated manual / sequential dog box | actuated clutch, torque cut, shift duration, dog engagement, gear state | shift-cut interruption, engagement/transient |
| Dual-clutch (DCT) | two alternating clutch paths, preselected gears, clutch overlap, thermal load | quick shifts, clutch sounds, torque handover |
| Hydraulic planetary automatic | fluid torque converter, slip/stall ratio, lockup clutch, planetary ratios, hydraulic/TCU shift strategies | fluid coupling, shifts, torque converter response |
| CVT | variable effective ratio, belt/chain traction and bounds, clutch/converter launch mechanism | continuous ratio/load-dependent whine |
| Hybrid eCVT / power-split | coupled planetary and electric motor/generator torque paths, battery and controller | distinct motor, generator and ICE blend |
| Single-speed/reduction | fixed ratio, neutral/disengagement if applicable, electric/ICE special cases | gear whine and rotational dynamics |
| Historic/manual variants (extension) | unsynchronized gears, overdrive, fluid coupling, preselector, early semi-auto | dedicated mechanisms rather than fake modern shift logic |

Each family exposes common rotational-port and controller contracts, **but has its own constitutive equations**. "Automatic" is a control preference, not one specific mechanical topology. Transmission ratios, converter efficiency/slip, inertia, clutch energy/temperature and shift losses affect crank load, vehicle acceleration and sound.

## Driveline layouts and selectable transfer cases

| Configuration | Torque paths | Controls / defining behavior |
|---|---|---|
| FWD 2WD | front differential -> front wheels | front-wheel traction, steer influence |
| RWD 2WD | rear differential -> rear wheels | rear-axle torque |
| AWD full-time | center differential/coupler splits front/rear | continuously coupled, possible center LSD/torque-vectoring |
| AWD on-demand | electronically/mechanically actuated clutch couples secondary axle | engagement lag, limits and thermal capacity |
| Part-time 4WD/4x4 | transfer case selectable 2H, 4H and optionally 4L | 4H may lock front/rear outputs; model wind-up/traction constraints |
| Full-time 4WD | both axles powered through center differential/lock | center lock, possible low-range transfer case |
| Multi-axle / e-AWD (extension) | multiple motors/axles with independent paths | front/rear motors, controller-coordinated torque |

"4x4" often describes four wheels with four potentially driven and may refer to different AWD/4WD hardware; never assume it implies a particular center differential, lock or low range. Preserve marketing labels as metadata while **physical configuration** is determined by actual transfer-case, differential and coupling graphs.

### Differential and axle variations

- Open differential; clutch/viscous/helical limited-slip; electronically controlled limited-slip; selectable locks, spool/live axle; center/rear/front torque-vectoring units, single-sided brakes and differential brake-based traction controls.
- Transfer-case modes: 2H/4H/4L/neutral where applicable, high and low range ratios, part-time front axle disconnect, engagement conditions and conflict handling.
- Include front/rear axle ratio, prop-shaft inertia, U-joints/gears, axle/wheel inertia, axle losses and traction interface. Per-wheel speed, slip ratio, normal load and friction affect transmitted torque.
- Locking a center coupling imposes wheel/shaft speed constraints and can cause driveline windup on high-grip turning; do not silently behave as an open diff.
- Tires have longitudinal force/slip curves, rolling radius, friction coefficient, road surface, vertical load and heat/wear approximations. Model lateral handling only at a declared fidelity level; do not imply full vehicle dynamics from a longitudinal-only solver.

## Load path and conservation

```text
Driver/ECU torque demand + air/fuel/combustion
      ↓ engine produced torque and rotating inertia
Crankshaft -> clutch / torque converter / coupling -> gearbox / CVT
      ↓ shaft losses + inertia + possibly differential, transfer case
Axles / differentials -> wheel hubs -> tire-road contact
      ↓ traction limit and wheel slip
Vehicle mass + road slope + rolling resistance + aero drag + brakes
      ↑ reaction torques flow backwards through the SAME connections
Engine speed, stall risk, torque request, intake airflow, sounds
```

Use a **coupled rotational solver or physically consistent constraints** (slipping vs locked paths), including gear ratios, delivered power, efficiencies, rotational energy and losses. In a 4WD configuration, total power at driven wheels cannot exceed the supplied power minus losses, barring another explicit power source (electric motors, battery). Braking and regenerative torque may flow backwards where components permit.

## Behavior and controls

- Manual throttle, clutch, gear stick; automatic shift modes with programmable schedules, kickdown, engine braking, converter lockup and sport/eco strategies.
- AWD torque split by hardware/coupler control, driven-axle traction and wheel speeds, transfer case selection, differential locks, stability/traction intervention where equipped.
- Mechanical controls for older vehicles; electronic TCU, AWD controller and drive modes for modern ones, each through [18](18-controls-electrical-and-tuning.md).
- Optional dyno modes: **free rev/no road load**, inertial chassis-dyno roller, controlled load engine-dyno and actual road simulation. Each has a documented load and torque measurement location, not guessed acceleration output.
- Events `SHIFT_REQUESTED`, `GEAR_ENGAGING`, `GEAR_CHANGED`, `CONVERTER_LOCKED`, `CLUTCH_SLIPPING`, `TRANSFER_CASE_MODE_CHANGED`, `DIFF_LOCK_CHANGED`, `TRACTION_LOST` and `SLIP_EXIT`, with physically verified state transitions and causation IDs.

## Audio and graphics

Transmission/transfer/differential voices (whine, gear rattle, clutch slip/grind, shaft resonance, engagement clicks, tire slip), independent calibrated source channels routed into buses per [12](12-audio-gain-staging-and-mixer.md). Wheel rotation is linked to tire angular speed, not engine RPM times a fixed ratio when clutch slip/CVT/converter exists. Show 2WD/AWD/4WD torque paths and clutch/coupler states in 3D/telemetry and optionally simplified 2D panels.

## Acceptance scenarios

- [ ] In neutral or with an open clutch, engine can rev separately from vehicle load; under engagement, road load can reduce RPM or stall engine.
- [ ] A locked gear with zero slip obeys its speed ratio; slipping clutch/converter dissipates power and changes RPM/torque.
- [ ] Each transmission family obeys its mechanical constraints (e.g. CVT ratio continuous and bounded, DCT handover, converter slip/lockup, eCVT power paths).
- [ ] FWD/RWD 2WD drives the expected wheels; AWD split depends on coupler/center differential; 4WD 2H/4H/4L and locks use their configured hardware.
- [ ] On low traction, wheelspin, torque limit, traction recovery and tire sound correlate with modeled slip, not arbitrary throttle.
- [ ] More total wheel resistance (hill, brake, trailer, rolling resistance) causes greater reflected engine load when coupled; no detached "vehicle load" animation.
- [ ] Mixed engine and e-motor torque obeys battery power/efficiency where supported.
- [ ] Power/energy balance holds across differential/transfer cases/transmissions, including multiple driven axles and negative torque.
- [ ] Unsupported multi-axle and novel drivetrains are visible as planned extensions, not silently converted to RWD.

## Phasing

M0/M1: graph contracts and simple locked ratio plus clutch/road load. M4: manual, automatic/torque converter, DCT, CVT, transfer case and diffs in **separate validated slices**; first ship minimal FWD/RWD then AWD/4WD. M5: scenario coverage for each supported family/mode. M6/M7: calibrate shift response, losses, vibration and road noise. Later: eCVT/hybrid, multi-motor, specialty historic transmissions.

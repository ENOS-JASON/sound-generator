# M4C — independent agent task cards

**Scope:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. One agent per card, do not claim a whole family complete from one component. Shared implementation policy: [30](../30-agent-handoff-contracts-and-decisions.md), [31](../31-integration-gates-and-support-matrix.md).

### AG-M4C-01a

**Roadmap requirement:** Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.

**Implement in this card only:** Clutch and manual gearbox with torque/heat coupling.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-01b

**Roadmap requirement:** Add clutch, manual gearbox, vehicle mass/drag, brakes, wheels and slip/traction model.

**Implement in this card only:** Road load, brakes, wheels, tire traction and slip.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** road traction and brake forces affect actual wheel acceleration and audio only when physically enabled; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-02a

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Hydraulic torque converter and planetary automatic.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-02b

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Automated-manual/sequential gearbox.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; prior single-turbo/supercharger cards AG-M4C-02a and AG-M4C-02b. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-02c

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Dual-clutch transmission.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-02d

**Roadmap requirement:** Add separately validated automatic/torque converter, automated-manual/sequential, DCT and CVT models with distinct shift/coupling dynamics.

**Implement in this card only:** Continuous variable ratio CVT.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-03a

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** FWD/RWD drive paths and open differential.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-03b

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** Full-time/on-demand AWD differential/coupler.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-03c

**Roadmap requirement:** Add FWD/RWD, full-time/on-demand AWD, selectable 4WD/4x4 (2H, 4H, 4L), transfer cases, center/front/rear differentials, locks and dynamic load propagation to the crankshaft.

**Implement in this card only:** Selectable part-time 4WD/4x4 2H/4H/4L transfer and locks.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-04a

**Roadmap requirement:** Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.

**Implement in this card only:** Clutch, gear, transmission and differential audio sources.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; G2 source mixer and a physical-event fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** locked/slipping gear and wheel load return preserve torque/power with losses; invalid topology rejected; source mute changes sound only, not physical component states; audio event IDs/phase remain correlated; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

### AG-M4C-04b

**Roadmap requirement:** Synthesize gear shift, drivetrain whine, road noise, slip chirp and burnout.

**Implement in this card only:** Slip-correlated tire chirp/road/burnout source.
**Required inputs:** G1 crank/rotational port and road-load fixture; G2 mixer if delivering a sound source; G2 source mixer and a physical-event fixture. Use accepted versioned contracts; missing producer is BLOCKED for live integration, fixture-only test allowed.
**Owned area:** `src/driveline/, src/audio/sources/driveline or src/audio/sources/tires` (only the submodule needed for this card). Other component families and `src/contracts/` are outside scope.
**Read:** [17](../17-transmissions-drivetrains-and-wheels.md), [20](../20-torque-power-load-and-energy.md), [19](../19-scenario-coverage-and-presets.md), [12](../12-audio-gain-staging-and-mixer.md); [agent contract](../30-agent-handoff-contracts-and-decisions.md).
**Acceptance evidence:** road traction and brake forces affect actual wheel acceleration and audio only when physically enabled; source mute changes sound only, not physical component states; audio event IDs/phase remain correlated; add one valid and one invalid/unsupported case, with a trace and full per-component telemetry. Register support tier, scenario IDs and audio/visual capabilities explicitly. Provide runnable tests, fixture and one-card completion report.

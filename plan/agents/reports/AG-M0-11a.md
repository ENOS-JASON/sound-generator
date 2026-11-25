# AG-M0-11a — Telemetry registry and diagnostics handoff

**Status: PARTIAL — fixture-based implementation; live integration pending.**

## Scope and contracts

- Prerequisites: AG-M0-09 / accepted ADR-004 (event v3, ClockReference); AG-M0-06 quantity registry and per-stat unit metadata; merged partial AG-M0-10 ([PR #12](https://github.com/ENOS-JASON/sound-generator/pull/12), f6e2bcfd00334bba0a3812d02530ef8fe2d4b611) supplies the deterministic clock/mock-I4 fixture. Its desktop benchmark and ADR-001 are not complete.
- Owned implementation: `src/diagnostics/TelemetryRegistry.ts`, `src/diagnostics/DiagnosticsHub.ts`. No changes to existing shared TS contracts, domain event IDs, clock ownership, conversion tables or solver code. The new module-owned API is proposed for owner review; it is not a wire protocol, trace codec or architecture approval.
- Version 1 channel definitions use the existing QuantityField interface and `quantityField` factory. Stable `fieldId = componentId.channelId` is the metric preference key. Definitions expose SI units, available display units, pressure basis, numeric type, source/owner, availability, clock and interval, optional bounds/display precision, instrument version, local-only privacy, performance and recorder-routing metadata.
- Registry capacity defaults to 256 (maximum 4096). Definitions, nested metadata, projected samples and arrays are frozen copies. Invalid IDs, duplicates, capacity, units, pressure basis and invalid sample metadata fail. No fabricated values for missing/unavailable channels.
- Hub is per run. It validates source component, clock, version, finite SI values and bounds. It stores one latest accepted sample and the last seen clock per channel, with explicit rate-limited and missed-interval counters. Sampling uses minimum simulation-tick or audio-frame spacing relative to the last accepted sample. It does not invent a second clock. Pull-only filter subscriptions retain no callback in the hub and do not invoke UI code during publish.
- Read-only display conversion uses the existing unit resolver with per-stat keys. No write-back, ambient-basis inference or mutable state exposure.

## Evidence

`tests/fixtures/diagnostics/pressure-channels.v1.json` contains two synthetic pressure definitions/values. Values are fabricated only as explicit test inputs, not claimed to be measured or calculated by the mock I4. The tests use the merged mock I4 clock, independent psi(g)/bar(a) display preferences and unchanged SI/clock/solver state. Also exercises audio-frame sampling with a fixed simulated tick, missing intervals, throttling, immutability, unknown channels, incompatible dimensions, missing gauge/absolute basis, unavailable sources and malformed/regressing data.

Required commands: `npm test` (including `tests/diagnostics.test.mjs`), `npm run check`, existing Chromium HTTPS smoke. Actual pass/fail evidence must be recorded after execution.

## Limitations and follow-up

Live production solver/audio wiring and ADR-001 remain pending. The fixture is not G0-B evidence. The current approved quantity catalog is used as-is; new physical dimensions require contract-owner review. This is a latest-value projection, not a real-time worklet transport, recorder, event dispatcher, FFT, trace buffer, UI or persisted display preferences. Source identity is a trusted local producer assertion, not network authentication. No arbitrary historical buffering or subscriber dispatch. AG-M0-11b owns bounded capture; AG-M0-11c/d own replay/comparison/graph services; AG-M3-08a owns display integration. Final AG completion and parent tracking must wait for required predecessor/integration, evidence and owner-approved merge.

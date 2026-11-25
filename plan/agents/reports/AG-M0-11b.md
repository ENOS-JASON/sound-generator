# AG-M0-11b — Bounded trace recorder handoff

**Status: PARTIAL — fixture-based implementation; live producer integration pending.**

## Scope

- Consumes the accepted ADR-004 event/command envelopes, merged AG-M0-10 clock/mock fixture and AG-M0-11a telemetry v1 catalog and accepted SI samples ([PR #13](https://github.com/ENOS-JASON/sound-generator/pull/13), merge `87b77c71fc4b390ba129b6cb58296be11fc2512a`). The latter two cards remain partial.
- `src/recording/TraceRecorder.ts`: explicit start/stop, bounded append-only capture, immutable record chunks and catalog, per-run sequence watermarks and counters for overflow, malformed/foreign inputs and observed sequence/telemetry gaps. The initial clock, seed, fixture preset identity and solver version are retained. Commands and domain/diagnostic events retain existing typed payloads and causal IDs; scale and audio-mode changes are recorded as their canonical diagnostics, not invented events. Telemetry remains SI.
- Proposed local limits: 4,096 records and 128 records per chunk by default; configurable maximum 65,536 records / 1,024 records per chunk. Drops new entries at capacity and marks the trace incomplete, retaining the original prefix. No unbounded history, I/O, callbacks into producers or blocking waits. The caller must consume the delivered runtime data outside the audio callback; this is not a real-time worklet transport.
- No changes to accepted shared contracts, clock ownership, UI, physics or ZIP format. The local in-memory API is a proposal for review, not the canonical CaptureManifest or an accepted ADR-006 codec.

## Tests and evidence

`tests/recording.test.mjs` exercises a seeded mock run and accepted pressure fixture, command/event/clock alignment, source mutation resistance, frozen chunks, stop/restart, 1,000 over-capacity samples, continuing solver state, explicit sequence and sampling gaps, invalid/foreign inputs and capacity checks.

CI evidence pending at initial submission. Acceptance boxes remain unchecked until results are verified.

## Limitations

A complete local capture means no **observed** losses in the supplied stream, not proof that the producer delivered every final event or selected channel; live transport watermarks, integration, checkpoints, complete component/provenance manifest, audio capture, ZIP/streaming storage, and replay are later cards. No imported arbitrary payloads or raw audio, no deadline benchmark, no G0-B or physical-engine claim. AG-M0-10 still requires the owner desktop benchmark and ADR-001 approval; AG-M0-11a remains fixture-only until live integration. AG-M0-11c can consume this proposed fixture API after review/merge, but must keep live integration pending.

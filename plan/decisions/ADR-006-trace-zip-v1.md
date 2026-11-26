# ADR-006 — Bounded browser ZIP capture profile v1

**Status: PROPOSED — owner approval required for exact codec and limits.** ZIP-first and optional generated audio are already approved (UD-R2-06, O3-11 C). The following narrows the previously approved container choice; it does not select a scientific export format.

## Recommendation and alternatives

Use a deterministic, uncompressed ZIP32 STORE profile, with an exact file allowlist, byte limits, CRC32 and SHA-256 inventory. No runtime dependency, extraction, ZIP64, DEFLATE, encryption, external attributes, comments, extra fields, data descriptors or arbitrary paths. This avoids decompression bombs and makes bounded memory/validation straightforward. Alternative: a vetted streaming DEFLATE library after measured size/latency needs and dependency/security review. Generic third-party ZIP archives are not supported by this v1 reader; the output is a standards-compatible STORE archive.

## Wire format

- `manifest.json`: UTF-8 JSON, kind `capture-trace`, version 1, recorder schema/start (run ID, seed, preset hash, solver revision, initial clock/mode and sequence watermarks), immutable channel catalog, loss stats and complete/incomplete status. Declares chunk count, optional observed end tick/frame (null if absent), optional mono synthesized-output audio metadata (null if absent).
- `chunks/000000.bin` onward: ordered chunks of 1–128 records. Each record has uint8 tag (1 command, 2 domain event, 3 diagnostic event, 4 telemetry), uint32 little-endian payload length, payload. Tags 1–3 contain UTF-8 JSON of existing canonical event contracts. Tag 4 has 48 bytes: uint32 channel index, uint32 flags (bit 0 sample frame, bit 1 crank angle), then five float64 fields as specified below.
- `audio/master.f32le` optional: generated mono samples, IEEE-754 little-endian float32, finite within [-1, 1]. Declared rate must match the recorded clock. Source provenance is a caller declaration, not cryptographic proof of origin; never route imported PCM into the physics or synthesis source graph.
- `integrity.json`: version 1, ordered list of every other entry's name, byte count and lowercase SHA-256. Archive CRC32 checked independently. Integrity detects corruption, not forgery or authenticity.

Telemetry offsets: 0 channel uint32; 4 flags uint32; 8 simulation tick float64; 16 simulation seconds float64; 24 audio sample frame float64; 32 crank angle radians float64; 40 value SI float64. Absent optional fields are encoded as zero. Run and component identity are supplied by the manifest/catalog. ReplayController validates schema, units, clock/order, loss counts and record types before returning an immutable trace.

## Proposed resource limits

16 MiB entire ZIP, 2 MiB per entry, at most 520 entries, 65,536 trace records, 128 per chunk, 8,192 bytes per record, 4,096 channels and 262,144 mono audio frames. Blob input is read entry-by-entry; bounded decoded entries remain in memory for verification. Export assembles bounded Blob parts. No unbounded or research streaming claim. Reject any malformed ZIP, mismatched directory/header, unsupported version, unexpected entry, invalid count, missing/incorrect checksum or invalid typed value.

## Integration and decision

Recommend approving this exact fixture profile after CI evidence and owner review. AG-M0-18 owns workspace schema/persistence; a separate workspace kind and validated snapshot codec are deferred until that schema exists (not interpreted as a trace). AG-M6D-05 can propose richer metadata/chunking and optional Parquet/HDF5 after measured needs. Production topology/component/DSP/calibration/scenario provenance and terminal checkpoint must come from their respective canonical contracts; v1 stores only currently available recorder metadata and an optional caller-observed endpoint, without inventing absent facts.

Affected: AG-M0-13, AG-M0-18, AG-M5 scenarios, AG-M6D-05, AG-M3-11. Existing event, clock, telemetry and recorder public contracts unchanged. Owner decision: accept this profile and its limits for v1, or request revisions. ADR-001 and live integration remain pending.

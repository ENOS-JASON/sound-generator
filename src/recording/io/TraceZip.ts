import { ReplayController } from '../../comparison/ReplayController.ts';
import type { ReplayBoundary } from '../../comparison/ReplayController.ts';
import type { CaptureRecord, RecordedTrace } from '../TraceRecorder.ts';
import { MAX_ARCHIVE_BYTES, packStore, unpackStore } from './storedZip.ts';

const VERSION = 1;
const MAX_RECORDS = 65536;
const MAX_CHUNK_RECORDS = 128;
const MAX_AUDIO_FRAMES = 262144;
const MAX_RECORD_BYTES = 8192;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

type Bytes = Uint8Array<ArrayBuffer>;

export interface GeneratedMasterCapture {
  readonly provenance: 'synthesized-output';
  readonly sampleRate: number;
  readonly samples: Float32Array;
}

interface AudioMetadata {
  readonly provenance: 'synthesized-output';
  readonly sampleRate: number;
  readonly frames: number;
}

interface Manifest {
  readonly kind: 'capture-trace';
  readonly version: 1;
  readonly trace: Omit<RecordedTrace, 'chunks'>;
  readonly chunks: number;
  readonly end: ReplayBoundary | null;
  readonly audio: AudioMetadata | null;
}

function json(value: unknown): Bytes {
  return encoder.encode(JSON.stringify(value));
}

function parse(bytes: Bytes): unknown {
  return JSON.parse(decoder.decode(bytes)) as unknown;
}

function index(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function chunkName(index: number): string {
  return 'chunks/' + String(index).padStart(6, '0') + '.bin';
}

async function sha256(bytes: Bytes): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function requireEntry(entries: Map<string, Bytes>, name: string): Bytes {
  const data = entries.get(name);
  if (!data) throw new Error('missing ZIP entry: ' + name);
  return data;
}

function encodeChunk(
  records: readonly CaptureRecord[],
  catalog: ReadonlyMap<string, number>,
): Bytes {
  const parts: Bytes[] = [];
  let size = 0;
  for (const record of records) {
    let payload: Bytes;
    let tag: number;
    if (record.kind === 'telemetry') {
      tag = 4;
      const sample = record.value;
      const channel = catalog.get(sample.fieldId);
      if (channel === undefined) throw new Error('unknown telemetry channel');
      payload = new Uint8Array(48);
      const d = new DataView(payload.buffer);
      d.setUint32(0, channel, true);
      const flags =
        (sample.sampleFrame === undefined ? 0 : 1) |
        (sample.crankAngleRadians === undefined ? 0 : 2);
      d.setUint32(4, flags, true);
      d.setFloat64(8, sample.simulationTick, true);
      d.setFloat64(16, sample.simulationTimeSeconds, true);
      d.setFloat64(24, sample.sampleFrame ?? 0, true);
      d.setFloat64(32, sample.crankAngleRadians ?? 0, true);
      d.setFloat64(40, sample.valueSI, true);
    } else {
      tag = record.kind === 'command' ? 1 : record.kind === 'domain' ? 2 : 3;
      payload = json(record.value);
    }
    if (payload.length > MAX_RECORD_BYTES) {
      throw new RangeError('trace record exceeds byte budget');
    }
    const prefix = new Uint8Array(5);
    prefix[0] = tag;
    new DataView(prefix.buffer).setUint32(1, payload.length, true);
    parts.push(prefix, payload);
    size += prefix.length + payload.length;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

function decodeChunk(bytes: Bytes, manifest: Manifest): CaptureRecord[] {
  const records: CaptureRecord[] = [];
  let offset = 0;
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  while (offset < bytes.length) {
    if (offset + 5 > bytes.length || records.length >= MAX_CHUNK_RECORDS) {
      throw new Error('invalid binary trace chunk');
    }
    const tag = bytes[offset];
    const length = d.getUint32(offset + 1, true);
    offset += 5;
    if (length > MAX_RECORD_BYTES || offset + length > bytes.length) {
      throw new Error('invalid binary record length');
    }
    if (tag === 4) {
      if (length !== 48) throw new Error('invalid binary telemetry size');
      const channel = manifest.trace.channels[d.getUint32(offset, true)];
      const flags = d.getUint32(offset + 4, true);
      if (!channel || flags > 3) throw new Error('invalid telemetry index');
      if (
        (!(flags & 1) && d.getFloat64(offset + 24, true) !== 0) ||
        (!(flags & 2) && d.getFloat64(offset + 32, true) !== 0)
      ) {
        throw new Error('noncanonical optional telemetry fields');
      }
      records.push({
        kind: 'telemetry',
        value: {
          schemaVersion: channel.schemaVersion,
          runId: manifest.trace.start.initialClock.runId,
          fieldId: channel.fieldId,
          sourceComponentId: channel.componentId,
          simulationTick: d.getFloat64(offset + 8, true),
          simulationTimeSeconds: d.getFloat64(offset + 16, true),
          ...(flags & 1
            ? { sampleFrame: d.getFloat64(offset + 24, true) }
            : {}),
          ...(flags & 2
            ? { crankAngleRadians: d.getFloat64(offset + 32, true) }
            : {}),
          valueSI: d.getFloat64(offset + 40, true),
        },
      });
    } else {
      const kind =
        tag === 1
          ? 'command'
          : tag === 2
            ? 'domain'
            : tag === 3
              ? 'diagnostic'
              : null;
      if (!kind) throw new Error('unknown binary record tag');
      // The existing ReplayController validates the full event/command schema.
      records.push({
        kind,
        value: parse(bytes.subarray(offset, offset + length)),
      } as CaptureRecord);
    }
    offset += length;
  }
  if (!records.length) throw new Error('empty binary trace chunk');
  return records;
}

/** v1 replay bounds; a sparse capture never invents its terminal clock. */
function validateEnd(
  end: ReplayBoundary | null,
  trace: RecordedTrace,
): ReplayBoundary | null {
  if (end === null) return null;
  if (
    !end ||
    !index(end.sampleFrame) ||
    !index(end.simulationTick) ||
    end.sampleFrame < trace.start.initialClock.sampleFrame ||
    end.simulationTick < trace.start.initialClock.simulationTick
  ) {
    throw new Error('invalid trace endpoint');
  }
  for (const chunk of trace.chunks) {
    for (const entry of chunk) {
      const tick =
        entry.kind === 'command'
          ? entry.value.targetSimulationTick
          : entry.value.simulationTick;
      const frame =
        entry.kind === 'command'
          ? entry.value.targetSampleFrame
          : entry.value.sampleFrame;
      if (
        tick > end.simulationTick ||
        (frame !== undefined && frame > end.sampleFrame)
      ) {
        throw new Error('trace endpoint precedes recorded observation');
      }
    }
  }
  return Object.freeze({
    sampleFrame: end.sampleFrame,
    simulationTick: end.simulationTick,
  });
}

function validAudio(meta: AudioMetadata): boolean {
  return (
    meta.provenance === 'synthesized-output' &&
    index(meta.sampleRate) &&
    meta.sampleRate >= 8000 &&
    meta.sampleRate <= 192000 &&
    index(meta.frames) &&
    meta.frames > 0 &&
    meta.frames <= MAX_AUDIO_FRAMES
  );
}

function checkSample(sample: number): number {
  if (!Number.isFinite(sample) || Math.abs(sample) > 1) {
    throw new Error('invalid generated audio sample');
  }
  return sample;
}

async function integrity(entries: ReadonlyMap<string, Bytes>) {
  const files = [];
  for (const [name, data] of entries) {
    files.push({ name, bytes: data.length, sha256: await sha256(data) });
  }
  return { version: VERSION, files };
}

/** Encode bounded recorder data in a browser Blob, never on the worklet. */
export async function exportTraceZip(
  input: RecordedTrace,
  audio?: GeneratedMasterCapture,
  end: ReplayBoundary | null = null,
): Promise<Blob> {
  const validated = new ReplayController(input).trace;
  const { chunks, ...trace } = validated;
  const entries = new Map<string, Bytes>();
  const catalog = new Map(trace.channels.map((c, i) => [c.fieldId, i]));
  if (audio && !(audio.samples instanceof Float32Array)) {
    throw new Error('generated audio must be Float32Array');
  }
  const meta = audio
    ? {
        provenance: audio.provenance,
        sampleRate: audio.sampleRate,
        frames: audio.samples.length,
      }
    : null;
  const manifest: Manifest = {
    kind: 'capture-trace',
    version: VERSION,
    trace,
    chunks: chunks.length,
    end: validateEnd(end, validated),
    audio: meta,
  };
  entries.set('manifest.json', json(manifest));
  let total = entries.get('manifest.json')!.length;
  chunks.forEach((chunk, i) => {
    const data = encodeChunk(chunk, catalog);
    total += data.length;
    if (total > MAX_ARCHIVE_BYTES) {
      throw new RangeError('trace exceeds byte budget');
    }
    entries.set(chunkName(i), data);
  });
  if (audio && meta) {
    if (
      !validAudio(meta) ||
      meta.sampleRate !== trace.start.initialClock.sampleRate
    ) {
      throw new Error('invalid synthesized audio metadata');
    }
    const data = new Uint8Array(meta.frames * 4);
    const d = new DataView(data.buffer);
    audio.samples.forEach((value, i) =>
      d.setFloat32(i * 4, checkSample(value), true),
    );
    entries.set('audio/master.f32le', data);
  }
  entries.set('integrity.json', json(await integrity(entries)));
  return packStore(entries);
}

export interface ImportedTrace {
  readonly replay: ReplayController;
  readonly end: ReplayBoundary | null;
  readonly audio: GeneratedMasterCapture | null;
}

/** No extraction or execution; reject unknown schemas before replay. */
export async function importTraceZip(blob: Blob): Promise<ImportedTrace> {
  const entries = await unpackStore(blob);
  const expectedIntegrity = parse(requireEntry(entries, 'integrity.json'));
  entries.delete('integrity.json');
  if (
    JSON.stringify(expectedIntegrity) !==
    JSON.stringify(await integrity(entries))
  ) {
    throw new Error('ZIP SHA-256 checksum or inventory mismatch');
  }
  const manifest = parse(requireEntry(entries, 'manifest.json')) as Manifest;
  if (
    !manifest ||
    manifest.kind !== 'capture-trace' ||
    manifest.version !== VERSION
  ) {
    throw new Error('unsupported trace ZIP version or kind');
  }
  if (
    !index(manifest.chunks) ||
    manifest.chunks > MAX_RECORDS / MAX_CHUNK_RECORDS ||
    !manifest.trace ||
    !Array.isArray(manifest.trace.channels) ||
    manifest.trace.channels.length > 4096 ||
    !manifest.trace.start?.initialClock ||
    entries.size !== 1 + manifest.chunks + (manifest.audio ? 1 : 0)
  ) {
    throw new Error('invalid trace ZIP manifest');
  }
  const chunks = Array.from({ length: manifest.chunks }, (_, i) =>
    decodeChunk(requireEntry(entries, chunkName(i)), manifest),
  );
  const replay = new ReplayController({ ...manifest.trace, chunks });
  let audio: GeneratedMasterCapture | null = null;
  if (manifest.audio !== null) {
    const meta = manifest.audio;
    if (
      !meta ||
      !validAudio(meta) ||
      meta.sampleRate !== replay.trace.start.initialClock.sampleRate
    ) {
      throw new Error('invalid synthesized audio metadata');
    }
    const data = requireEntry(entries, 'audio/master.f32le');
    if (data.length !== meta.frames * 4) throw new Error('invalid audio size');
    const d = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const samples = Float32Array.from({ length: meta.frames }, (_, i) =>
      checkSample(d.getFloat32(i * 4, true)),
    );
    audio = {
      provenance: meta.provenance,
      sampleRate: meta.sampleRate,
      samples,
    };
  }
  return { replay, end: validateEnd(manifest.end, replay.trace), audio };
}

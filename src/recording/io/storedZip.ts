// Narrow ZIP32 STORE profile: no extraction, compression or external files.
export const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
const MAX_ENTRY_BYTES = 2 * 1024 * 1024;
const MAX_ENTRIES = 520;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

type Bytes = Uint8Array<ArrayBuffer>;

const table = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let i = 0; i < 8; i++) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return crc >>> 0;
});

function crc32(bytes: Bytes): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 255]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function view(bytes: Bytes): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function nameAllowed(name: string): boolean {
  return /^(manifest\.json|integrity\.json|chunks\/\d{6}\.bin|audio\/master\.f32le)$/.test(
    name,
  );
}

function equal(a: Bytes, b: Bytes): boolean {
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

function header(
  name: Bytes,
  size: number,
  crc: number,
  offset?: number,
): Bytes {
  const central = offset !== undefined;
  const length = central ? 46 : 30;
  const bytes = new Uint8Array(length + name.length);
  const d = view(bytes);
  d.setUint32(0, central ? 0x02014b50 : 0x04034b50, true);
  if (central) d.setUint16(4, 20, true);
  const start = central ? 6 : 4;
  d.setUint16(start, 20, true);
  d.setUint16(start + 8, 0x21, true); // 1980-01-01
  d.setUint32(start + 10, crc, true);
  d.setUint32(start + 14, size, true);
  d.setUint32(start + 18, size, true);
  d.setUint16(start + 22, name.length, true);
  if (central) d.setUint32(42, offset, true);
  bytes.set(name, length);
  return bytes;
}

function footer(count: number, size: number, offset: number): Bytes {
  const bytes = new Uint8Array(22);
  const d = view(bytes);
  d.setUint32(0, 0x06054b50, true);
  d.setUint16(8, count, true);
  d.setUint16(10, count, true);
  d.setUint32(12, size, true);
  d.setUint32(16, offset, true);
  return bytes;
}

export function packStore(entries: ReadonlyMap<string, Bytes>): Blob {
  if (entries.size < 1 || entries.size > MAX_ENTRIES) {
    throw new RangeError('ZIP entry count exceeds budget');
  }
  const parts: BlobPart[] = [];
  const directory: Bytes[] = [];
  let offset = 0;
  let centralSize = 0;
  for (const [name, data] of entries) {
    if (!nameAllowed(name) || data.length > MAX_ENTRY_BYTES) {
      throw new RangeError('invalid ZIP name or entry size');
    }
    const encoded = encoder.encode(name);
    const crc = crc32(data);
    const local = header(encoded, data.length, crc);
    const central = header(encoded, data.length, crc, offset);
    directory.push(central);
    centralSize += central.length;
    offset += local.length + data.length;
    if (offset + centralSize + 22 > MAX_ARCHIVE_BYTES) {
      throw new RangeError('ZIP archive exceeds byte budget');
    }
    parts.push(local, data);
  }
  return new Blob(
    [...parts, ...directory, footer(entries.size, centralSize, offset)],
    { type: 'application/zip' },
  );
}

/** Validate directory and every local header before returning data to callers. */
export async function unpackStore(blob: Blob): Promise<Map<string, Bytes>> {
  if (blob.size < 22 || blob.size > MAX_ARCHIVE_BYTES) {
    throw new RangeError('ZIP archive exceeds size budget or is truncated');
  }
  async function read(offset: number, length: number): Promise<Bytes> {
    if (offset < 0 || length < 0 || offset + length > blob.size) {
      throw new Error('truncated ZIP structure');
    }
    return new Uint8Array(
      await blob.slice(offset, offset + length).arrayBuffer(),
    );
  }
  const end = await read(blob.size - 22, 22);
  const d = view(end);
  const count = d.getUint16(10, true);
  const centralSize = d.getUint32(12, true);
  const start = d.getUint32(16, true);
  if (
    count < 1 ||
    count > MAX_ENTRIES ||
    centralSize > count * 128 ||
    start + centralSize !== blob.size - 22 ||
    !equal(end, footer(count, centralSize, start))
  ) {
    throw new Error('invalid ZIP footer or unsupported ZIP profile');
  }
  const central = await read(start, centralSize);
  const cd = view(central);
  const entries = new Map<string, Bytes>();
  let cursor = 0;
  let localOffset = 0;
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > central.length) throw new Error('truncated directory');
    const size = cd.getUint32(cursor + 24, true);
    const crc = cd.getUint32(cursor + 16, true);
    const nameLength = cd.getUint16(cursor + 28, true);
    const next = cursor + 46 + nameLength;
    if (next > central.length || nameLength > 64 || size > MAX_ENTRY_BYTES) {
      throw new RangeError('ZIP entry exceeds budget');
    }
    const encoded = central.slice(cursor + 46, next);
    const name = decoder.decode(encoded);
    const local = header(encoded, size, crc);
    const dataOffset = localOffset + local.length;
    if (
      !nameAllowed(name) ||
      entries.has(name) ||
      dataOffset + size > start ||
      !equal(
        central.slice(cursor, next),
        header(encoded, size, crc, localOffset),
      ) ||
      !equal(await read(localOffset, local.length), local)
    ) {
      throw new Error('invalid or unsupported ZIP entry');
    }
    const data = await read(dataOffset, size);
    if (crc32(data) !== crc) throw new Error('ZIP CRC checksum mismatch');
    entries.set(name, data);
    cursor = next;
    localOffset = dataOffset + size;
  }
  if (cursor !== central.length || localOffset !== start) {
    throw new Error('unexpected ZIP bytes');
  }
  return entries;
}

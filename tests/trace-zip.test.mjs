import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SyntheticStimulus } from '../src/audio/synthetic-worklet/stimulus.ts';
import {
  compareEvents,
  ComparisonEngine,
} from '../src/comparison/ComparisonEngine.ts';
import { ReplayController } from '../src/comparison/ReplayController.ts';
import { TelemetryRegistry } from '../src/diagnostics/TelemetryRegistry.ts';
import { TraceRecorder } from '../src/recording/TraceRecorder.ts';
import {
  exportTraceZip,
  importTraceZip,
} from '../src/recording/io/TraceZip.ts';
import {
  MAX_ARCHIVE_BYTES,
  MAX_ENTRY_BYTES,
  packStore,
  unpackStore,
} from '../src/recording/io/storedZip.ts';
import { createMockRun } from '../src/testing/mock-solver/i4.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/imports/trace-zip-v1.json', import.meta.url),
    'utf8',
  ),
);
const channels = JSON.parse(
  readFileSync(
    new URL('./fixtures/diagnostics/pressure-channels.v1.json', import.meta.url),
    'utf8',
  ),
).channels;

function capture(scale = 1, capacity = 256) {
  const registry = new TelemetryRegistry();
  const channel = registry.register(channels[0]);
  const { clock, state } = createMockRun(fixture.sampleRate, fixture.seed);
  const recorder = new TraceRecorder(registry, capacity, 8);
  recorder.start({
    initialClock: clock.snapshot(),
    seed: fixture.seed,
    presetHash: 'mock-i4-fixture',
    solverVersion: 'mock-i4-v1',
    domainSequenceWatermark: 0,
    diagnosticSequenceWatermark: 0,
  });
  const s = clock.snapshot();
  const control = clock.applyControl({
    schemaVersion: 1,
    category: 'command',
    runId: s.runId,
    commandId: 'zip-scale',
    origin: 'automation',
    targetSimulationTick: s.simulationTick,
    targetSampleFrame: s.sampleFrame,
    causationId: null,
    correlationId: null,
    type: 'SET_TIME_SCALE',
    payload: { playbackScale: scale },
  });
  recorder.recordCommand(control.command);
  for (const event of [...control.events, ...control.diagnostics]) {
    recorder.recordEvent(event);
  }
  for (let i = 0; i < fixture.observations; i++) {
    let frames = 480 / scale;
    while (frames > 0) {
      const n = Math.min(frames, 4096);
      for (const event of clock.advanceFrames(n).events) {
        recorder.recordEvent(event);
      }
      frames -= n;
    }
    const now = clock.snapshot();
    recorder.recordTelemetry({
      schemaVersion: 1,
      runId: now.runId,
      sourceComponentId: channel.componentId,
      fieldId: channel.fieldId,
      simulationTick: now.simulationTick,
      simulationTimeSeconds: now.simulationTimeSeconds,
      sampleFrame: now.sampleFrame,
      crankAngleRadians: now.crankAngleRadians,
      valueSI: 10000 + now.simulationTick * 2,
    });
  }
  const end = clock.snapshot();
  return {
    trace: recorder.stop(),
    end: { sampleFrame: end.sampleFrame, simulationTick: end.simulationTick },
    state: state(),
  };
}

function generated() {
  const stimulus = new SyntheticStimulus({
    runId: 'mock-i4',
    sampleRate: fixture.sampleRate,
    seed: fixture.seed,
    toneHz: 440,
    frameCount: 4096,
    captureFrames: 4096,
    timeline: [],
  });
  while (!stimulus.complete) stimulus.render(new Float32Array(128));
  return {
    provenance: 'synthesized-output',
    sampleRate: fixture.sampleRate,
    samples: stimulus.report().rawMaster,
  };
}

function json(data) {
  return encoder.encode(JSON.stringify(data));
}

async function rehash(entries) {
  entries.delete('integrity.json');
  const files = [];
  for (const [name, bytes] of entries) {
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const sha256 = Array.from(new Uint8Array(hash), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    files.push({ name, bytes: bytes.length, sha256 });
  }
  entries.set('integrity.json', json({ version: 1, files }));
  return packStore(entries);
}

test('ZIP preserves seeded replay, SI channels and generated audio', async () => {
  const source = capture();
  const audio = generated();
  const zip = await exportTraceZip(source.trace, audio, source.end);
  const imported = await importTraceZip(zip);
  assert.equal(zip.type, 'application/zip');
  assert.deepEqual(imported.end, source.end);
  assert.equal(imported.end.simulationTick, fixture.expectedTick);
  assert.deepEqual(imported.audio.samples, audio.samples);
  assert.equal(imported.audio.provenance, 'synthesized-output');
  const original = new ReplayController(source.trace);
  assert.deepEqual(imported.replay.trace, original.trace);
  const result = imported.replay.resimulate(
    (start) => createMockRun(start.initialClock.sampleRate, start.seed),
    imported.end,
  );
  assert.deepEqual(result.state, source.state);
  const events = original.trace.chunks
    .flat()
    .filter((entry) => entry.kind === 'domain')
    .map((entry) => entry.value);
  assert.ok(events.length > 0);
  assert.deepEqual(compareEvents(events, result.domain, true), []);
  const comparison = new ComparisonEngine().compare(
    original,
    imported.replay,
  );
  assert.equal(comparison.status, 'comparable');
  assert.equal(comparison.channels[0].unitId, 'Pa');
  assert.equal(comparison.channels[0].matched, fixture.observations);
  assert.equal(comparison.channels[0].maxAbsSI, 0);
  assert.deepEqual(comparison.domainDeltas, []);
  assert.deepEqual(
    new Uint8Array(await zip.arrayBuffer()),
    new Uint8Array(
      await (await exportTraceZip(source.trace, audio, source.end)).arrayBuffer(),
    ),
  );
});

test('ZIP preserves scale changes and marks incomplete capture', async () => {
  const normal = await importTraceZip(await exportTraceZip(capture(1).trace));
  const slow = await importTraceZip(await exportTraceZip(capture(0.1).trace));
  assert.equal(normal.audio, null);
  assert.equal(normal.end, null);
  const diff = new ComparisonEngine().compare(normal.replay, slow.replay);
  assert.equal(diff.status, 'comparable');
  assert.equal(diff.channels[0].maxAbsSI, 0);
  assert.deepEqual(diff.domainDeltas, []);
  const partial = capture(1, 8);
  const restored = await importTraceZip(await exportTraceZip(partial.trace));
  assert.equal(restored.replay.trace.status, 'incomplete');
  assert.ok(restored.replay.trace.stats.dropped > 0);
  assert.throws(
    () => restored.replay.resimulate(() => createMockRun(48000), partial.end),
    /incomplete/,
  );
});

test('reject raw CRC corruption and SHA mismatch after valid repack', async () => {
  const zip = await exportTraceZip(capture().trace);
  const bytes = new Uint8Array(await zip.arrayBuffer());
  const d = new DataView(bytes.buffer);
  assert.equal(d.getUint32(0, true), 0x04034b50);
  const dataOffset = 30 + d.getUint16(26, true);
  bytes[dataOffset] ^= 1;
  await assert.rejects(importTraceZip(new Blob([bytes])), /CRC/);

  const entries = await unpackStore(zip);
  entries.get('chunks/000000.bin')[5] ^= 1;
  await assert.rejects(importTraceZip(packStore(entries)), /SHA-256/);
});

test('reject unknown archive/recorder version and invalid binary record', async () => {
  const zip = await exportTraceZip(capture().trace);
  for (const kind of ['version', 'schema', 'chunk']) {
    const entries = await unpackStore(zip);
    if (kind === 'chunk') {
      entries.get('chunks/000000.bin')[0] = 255;
    } else {
      const manifest = JSON.parse(decoder.decode(entries.get('manifest.json')));
      if (kind === 'version') manifest.version = 999;
      else manifest.trace.schemaVersion = 999;
      entries.set('manifest.json', json(manifest));
    }
    await assert.rejects(
      importTraceZip(await rehash(entries)),
      /version|schema|tag/,
    );
  }
});

test('reject oversize, path traversal, unsupported compression and trailing data', async () => {
  const zip = await exportTraceZip(capture().trace);
  const bytes = new Uint8Array(await zip.arrayBuffer());
  await assert.rejects(
    importTraceZip(new Blob([new Uint8Array(MAX_ARCHIVE_BYTES + 1)])),
    /size budget/,
  );
  assert.throws(
    () => packStore(new Map([['manifest.json', new Uint8Array(MAX_ENTRY_BYTES + 1)]])),
    /entry size/,
  );
  assert.throws(
    () => packStore(new Map([['../manifest.json', json({})]])),
    /invalid ZIP name/,
  );
  bytes[8] = 8; // unsupported DEFLATE in a local header
  await assert.rejects(importTraceZip(new Blob([bytes])), /unsupported ZIP/);
  await assert.rejects(
    importTraceZip(new Blob([zip, new Uint8Array([0])])),
    /ZIP footer/,
  );
});

test('reject malformed generated audio and inconsistent endpoint', async () => {
  const { trace, end } = capture();
  const audio = generated();
  await assert.rejects(
    exportTraceZip(trace, { ...audio, provenance: 'reference-recording' }),
    /synthesized audio/,
  );
  audio.samples[0] = NaN;
  await assert.rejects(exportTraceZip(trace, audio), /audio sample/);
  await assert.rejects(
    exportTraceZip(trace, undefined, { ...end, simulationTick: 1 }),
    /endpoint/,
  );
});

test('ZIP32 STORE CRC agrees with standard known-answer vector', async () => {
  const data = encoder.encode('123456789');
  const zip = packStore(new Map([['manifest.json', data]]));
  const d = new DataView(await zip.arrayBuffer());
  assert.equal(d.getUint32(14, true), 0xcbf43926);
  assert.equal(d.getUint16(8, true), 0);
  assert.deepEqual((await unpackStore(zip)).get('manifest.json'), data);
});

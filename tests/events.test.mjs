import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  adaptLegacyEventV2,
  assertDomainAuthority,
  validateCommand,
  validateDiagnosticEvent,
  validateDomainEvent,
} from '../src/contracts/events/index.ts';
import {
  inspectDomainBatch,
  newDomainCursor,
} from '../src/core/events/transport.ts';

const fixture = (name) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/contracts/${name}`, import.meta.url)),
  );
const batch = () => fixture('domain-batch.v1.json');
const authority = {
  runId: 'fixture-run',
  owners: new Map([
    ['starter', 'starter'],
    ['cylinder-1', 'cylinder'],
    ['engine', 'engine'],
    ['ecu', 'ecu'],
  ]),
};
const cursor = () => newDomainCursor(authority.runId);
const inspect = (value, position = cursor(), capacity = 16) =>
  inspectDomainBatch(value, position, authority, capacity);

test('same-tick serialized events retain total order and causality', () => {
  const value = batch();
  const result = inspect(JSON.parse(JSON.stringify(value)));
  assert.equal(result.status, 'accepted');
  assert.deepEqual(result.events, value.events);
  assert.deepEqual(
    result.events.map((event) => event.sequence),
    [1, 2],
  );
  assert.equal(result.cursor.sequence, 2);
  assert.equal(result.events[1].sampleFrame, 480);
  assert.equal(result.events[1].causationId, 'cmd-key-on');
  assert.equal(result.events[1].correlationId, 'start-1');
  assert.throws(() => {
    result.events[0].payload.starterTorqueNm = 0;
  }, TypeError);
  assert.equal(inspect(value, result.cursor).status, 'duplicate');
});

test('legacy v2 events and explicit aliases adapt only on import', () => {
  const legacy = fixture('engine-event.v2.json');
  assert.equal(adaptLegacyEventV2(legacy).type, 'STARTER_ENGAGED');
  const limiter = {
    ...legacy,
    type: 'REV_LIMIT_ENTER',
    sourceComponentId: 'ecu',
    payload: {},
  };
  assert.equal(adaptLegacyEventV2(limiter).type, 'LIMITER_ENTER');
  const paused = adaptLegacyEventV2({
    ...legacy,
    type: 'CLOCK_PAUSED',
    payload: {},
  });
  assert.equal(paused.category, 'diagnostic');
  assert.equal(paused.type, 'RUN_PAUSED');
  assert.throws(() => validateDomainEvent(paused), /category/);
  assert.throws(
    () =>
      validateDomainEvent({
        ...limiter,
        schemaVersion: 3,
        category: 'domain',
      }),
    /unknown domain event/,
  );
  assert.throws(
    () => adaptLegacyEventV2({ ...legacy, type: 'UNKNOWN_EVENT' }),
    /unknown domain event/,
  );
});

test('stale runs are discarded; current run authority is enforced', () => {
  const value = batch();
  value.runId = 'previous-run';
  assert.equal(inspect(value).status, 'stale-run');
  value.runId = 'fixture-run';
  value.events[0].runId = 'previous-run';
  assert.equal(inspect(value).status, 'invalid');
  const wrong = batch();
  wrong.events[0].sourceComponentId = 'engine';
  assert.throws(
    () => assertDomainAuthority(validateDomainEvent(wrong.events[0]), authority),
    /unauthorized/,
  );
  assert.equal(inspect(wrong).status, 'invalid');
});

test('domain and diagnostic namespaces cannot be interchanged', () => {
  const domain = batch().events[0];
  const ack = {
    ...domain,
    category: 'diagnostic',
    type: 'COMMAND_APPLIED',
    payload: { commandId: 'cmd-key-on' },
  };
  assert.deepEqual(validateDiagnosticEvent(ack), ack);
  assert.throws(() => validateDomainEvent(ack), /category/);
  assert.throws(
    () => validateDomainEvent({ ...ack, category: 'domain' }),
    /unknown domain event/,
  );
  assert.throws(
    () => validateDiagnosticEvent({ ...domain, category: 'diagnostic' }),
    /unknown diagnostic/,
  );
  const value = batch();
  value.events[0] = ack;
  assert.equal(inspect(value).status, 'invalid');
});

test('gaps, overlaps, clock regression and overflow invalidate atomically', () => {
  const gap = batch();
  gap.events[1].sequence = 3;
  const result = inspect(gap);
  assert.equal(result.status, 'invalid');
  assert.equal(result.diagnostic, 'EVENT_STREAM_GAP');
  assert.equal(result.cursor.sequence, 0);
  assert.equal(result.cursor.valid, false);
  assert.equal(inspect(batch(), result.cursor).status, 'resync-required');
  const reversed = batch();
  reversed.events.reverse();
  assert.equal(inspect(reversed).status, 'invalid');
  const clock = batch();
  clock.events[1].simulationTimeSeconds = 0.009;
  assert.equal(inspect(clock).status, 'invalid');
  const overflow = inspect(batch(), cursor(), 1);
  assert.equal(overflow.diagnostic, 'QUEUE_OVERFLOW');
  assert.equal(overflow.cursor.sequence, 0);
  const accepted = inspect(batch());
  const overlap = batch();
  overlap.events[0].sequence = 2;
  overlap.events[1].sequence = 3;
  assert.equal(inspect(overlap, accepted.cursor).status, 'invalid');
  assert.throws(() => inspect(batch(), cursor(), 1025), /maxEvents/);
});

test('runtime validation rejects malformed payloads, clocks and versions', () => {
  const valid = batch().events[1];
  for (const invalid of [
    { ...valid, schemaVersion: 99 },
    { ...valid, sequence: 0 },
    { ...valid, sampleFrame: 0.5 },
    { ...valid, crankAngleRadians: Infinity },
    { ...valid, payload: { cylinderId: 13 } },
    { ...valid, payload: { cylinderId: '1' } },
    { ...valid, payload: { cylinderId: 1, unknown: true } },
    { ...valid, payload: {} },
    { ...valid, unexpected: true },
  ]) {
    assert.throws(() => validateDomainEvent(invalid));
  }
});

test('commands are typed intents with target clocks and bounded step guards', () => {
  const command = {
    schemaVersion: 1,
    category: 'command',
    runId: 'fixture-run',
    commandId: 'cmd-throttle',
    origin: 'ui',
    targetSimulationTick: 10,
    targetSampleFrame: 480,
    causationId: null,
    correlationId: 'start-1',
    type: 'SET_THROTTLE',
    payload: { fraction: 0.5 },
  };
  assert.deepEqual(validateCommand(command), command);
  for (const invalid of [
    { ...command, targetSimulationTick: -1 },
    { ...command, targetSampleFrame: 0.5 },
    { ...command, origin: 'renderer' },
    { ...command, payload: { fraction: 1.1 } },
    { ...command, payload: { fraction: '0.5' } },
    { ...command, type: 'COMBUSTION' },
    { ...command, type: 'STEP_TICKS', payload: { count: 0 } },
    {
      ...command,
      type: 'STEP_UNTIL_EVENT',
      payload: { eventType: 'RUN_PAUSED', maxTicks: 10 },
    },
  ]) {
    assert.throws(() => validateCommand(invalid));
  }
  assert.deepEqual(
    validateCommand({
      ...command,
      type: 'STEP_UNTIL_EVENT',
      payload: { eventType: 'ENGINE_RUNNING', maxTicks: 10 },
    }).payload,
    { eventType: 'ENGINE_RUNNING', maxTicks: 10 },
  );
});

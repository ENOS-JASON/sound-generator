import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveHashRoute } from '../src/app/routing.ts';
import { createShellRuntime } from '../src/ui-shell/app-shell/mockRuntime.ts';

test('one mock runtime continues across hash route selections', () => {
  const runtime = createShellRuntime();
  assert.equal(runtime.snapshot().paused, true);
  assert.equal(runtime.pulse().simulationTick, 0);
  runtime.resume();
  let previous = runtime.snapshot();
  for (const hash of ['#/', '#/drive', '#/diagnostics', '#/settings']) {
    assert.notEqual(resolveHashRoute(hash), 'not-found');
    const next = runtime.pulse();
    assert.equal(next.simulationTick, previous.simulationTick + 25);
    assert.equal(next.sampleFrame, previous.sampleFrame + 1200);
    assert.equal(next.runId, previous.runId);
    assert.ok(next.eventCount >= previous.eventCount);
    assert.ok(Object.isFrozen(next));
    previous = next;
  }
  assert.ok(previous.eventCount > 0);
});

test('pause, step, scale and invalid actions preserve one fixture', () => {
  const runtime = createShellRuntime();
  const stepped = runtime.step();
  assert.equal(stepped.simulationTick, 1);
  assert.equal(stepped.lastEvent, 'STARTER_ENGAGED');
  runtime.setScale(0.1);
  assert.equal(runtime.pulse().simulationTick, 3);
  const before = runtime.snapshot();
  assert.throws(() => runtime.step(), /pause/);
  assert.throws(() => runtime.setScale(2), /scale/);
  assert.equal(resolveHashRoute('#/missing'), 'not-found');
  assert.deepEqual(runtime.snapshot(), before);
  runtime.pause();
  assert.equal(runtime.pulse().simulationTick, before.simulationTick);
  runtime.resume();
  assert.equal(runtime.snapshot().playbackScale, 0.1);
  assert.ok(runtime.pulse().simulationTick > before.simulationTick);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createShellRuntime } from '../src/ui-shell/app-shell/mockRuntime.ts';
import { WidgetRegistry } from '../src/ui-shell/widgets/WidgetRegistry.ts';
import { createWidgetSampler } from '../src/ui-shell/widgets/widgetSampler.ts';

test('widget moves, global hide and restore preserve bounded placement', () => {
  const registry = new WidgetRegistry();
  registry.resize(800, 600);
  registry.show('rpm', true);
  registry.show('waveform', true);
  registry.move('rpm', 999, -10);
  assert.deepEqual(registry.snapshot().placements.rpm, {
    x: 540,
    y: 0,
    shown: true,
  });
  registry.hideAll(true);
  assert.equal(registry.visible('rpm'), false);
  registry.hideAll(false);
  assert.equal(registry.visible('rpm'), true);
  assert.equal(registry.snapshot().placements.rpm.x, 540);
  registry.resize(240, 150);
  assert.equal(registry.snapshot().placements.rpm.x, 0);
  assert.equal(registry.snapshot().placements.waveform.y, 0);
  assert.throws(() => registry.move('rpm', NaN, 2), /position/);
  assert.throws(() => registry.resize(0, 200), /viewport/);
});

test('hidden charts skip source reads and resume bounded projections', () => {
  const runtime = createShellRuntime();
  const registry = new WidgetRegistry();
  const sampler = createWidgetSampler(runtime.snapshot);
  assert.deepEqual(sampler.refresh(registry), sampler.snapshot());
  assert.equal(sampler.snapshot().rpmSamples, 0);
  assert.equal(sampler.snapshot().waveformSamples, 0);
  registry.show('rpm', true);
  registry.show('waveform', true);
  runtime.resume();
  for (let i = 0; i < 80; i++) {
    runtime.pulse();
    sampler.refresh(registry);
  }
  const active = sampler.snapshot();
  assert.equal(active.rpmSamples, 80);
  assert.equal(active.waveformSamples, 80);
  assert.ok(active.rpm.length <= 32);
  assert.equal(active.waveform.length, 128);
  assert.ok(active.waveform.every(Number.isFinite));
  registry.hideAll(true);
  runtime.pulse();
  assert.deepEqual(sampler.refresh(registry), active);
  registry.hideAll(false);
  registry.show('waveform', false);
  const restored = sampler.refresh(registry);
  assert.equal(restored.rpmSamples, 81);
  assert.equal(restored.waveformSamples, 80);
  sampler.close();
});

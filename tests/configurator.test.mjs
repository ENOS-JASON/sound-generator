import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CONFIGURATOR_STEPS,
  canVisitStep,
  fieldById,
  impactedFields,
  resolvedFieldUnit,
  visibleFields,
} from '../src/contracts/configurator/index.ts';
import {
  quantityField,
  fromDisplayValue,
  toDisplayValue,
  displayUnitLabel,
  resolveDisplayUnit,
} from '../src/contracts/configurator/units.ts';
import {
  validateConfigurator,
  validateConfiguratorImport,
  startDraft,
  updateDraft,
  undoDraft,
} from '../src/configurator/validation/index.ts';

const load = (name) => JSON.parse(
  readFileSync(new URL(`./fixtures/contracts/${name}`, import.meta.url), 'utf8'),
);
const mechanical = load('i4-mechanical.v2.json');
const efi = load('i4-efi.v2.json');
const ctx = (vehicle) => ({ vehicle, capabilities: new Set() });
const controlStep = CONFIGURATOR_STEPS.find((step) => step.stepId === 'control');

test('controller fields and options are capability-sensitive without leaking hidden fields', () => {
  const mechanicalFields = visibleFields(controlStep, ctx(mechanical)).map((f) => f.fieldId);
  const ecuFields = visibleFields(controlStep, ctx(efi)).map((f) => f.fieldId);
  assert.ok(mechanicalFields.includes('control.carburetorId'));
  assert.ok(!mechanicalFields.includes('control.fuelMapId'));
  assert.ok(ecuFields.includes('control.fuelMapId'));
  assert.ok(!ecuFields.includes('control.distributorId'));
  assert.deepEqual(fieldById('control.kind').options(ctx(efi)), ['mechanical', 'ecu']);
  assert.ok(impactedFields(ctx(mechanical), ctx(efi)).includes('control.fuelMapId'));
  assert.equal(canVisitStep(controlStep, new Set(), ctx(efi)), false);
  assert.equal(canVisitStep(controlStep, new Set(['engine']), ctx(efi)), true);
});

test('wizard and imported JSON share structural validation, while drafts stay non-runnable', () => {
  for (const vehicle of [mechanical, efi]) {
    const ui = validateConfigurator(vehicle);
    const imported = validateConfiguratorImport(JSON.stringify(vehicle));
    assert.deepEqual(imported, ui);
    assert.equal(ui.status, 'structurally-valid');
    assert.ok(ui.issues.every((issue) => issue.severity === 'info'));
  }
  const invalid = structuredClone(mechanical);
  invalid.control.fuelMapId = 'forbidden';
  const ui = validateConfigurator(invalid);
  assert.deepEqual(validateConfiguratorImport(JSON.stringify(invalid)), ui);
  assert.equal(ui.status, 'draft');
  assert.match(ui.issues.map((item) => item.message).join(' '), /fuelMapId|unknown property/);
  const missing = structuredClone(mechanical);
  delete missing.engine.boreMeters;
  assert.equal(validateConfigurator(missing).status, 'draft');
  assert.match(validateConfigurator(missing).issues.map((item) => item.message).join(' '), /required field/);
  assert.equal(validateConfiguratorImport('{').status, 'draft');
});

test('draft updates and undo restore the exact original vehicle without auto-cleanup', () => {
  const draft = startDraft(mechanical);
  const changed = structuredClone(mechanical);
  changed.engine.strokeMeters = 0.09;
  const updated = updateDraft(draft, changed);
  assert.equal(updated.vehicle.engine.strokeMeters, 0.09);
  assert.equal(draft.vehicle.engine.strokeMeters, 0.088);
  assert.deepEqual(undoDraft(updated).vehicle, mechanical);
  assert.equal(updated.history.length, 1);
});

test('independent mixed hp / Nm / psi and per-channel pressure overrides preserve SI', () => {
  const power = quantityField('power.engine', 'power');
  const torque = quantityField('torque.engine', 'torque');
  const boost = quantityField('pressure.boost', 'pressure', 'gauge');
  const oil = quantityField('pressure.oil', 'pressure', 'gauge');
  const prefs = {
    quantityDefaults: { power: 'hp', torque: 'Nm', pressure: 'bar' },
    perStatUnitIds: { 'pressure.boost': 'psi' },
  };
  assert.equal(resolveDisplayUnit(power, prefs), 'hp');
  assert.equal(resolveDisplayUnit(torque, prefs), 'Nm');
  assert.equal(resolveDisplayUnit(boost, prefs), 'psi');
  assert.equal(resolveDisplayUnit(oil, prefs), 'bar');
  assert.equal(displayUnitLabel(boost, 'psi'), 'psi (g)');
  for (const [field, selected, si] of [[power, 'hp', 74569.98715822702], [torque, 'Nm', 221], [boost, 'psi', 101325]]) {
    const displayed = toDisplayValue(si, field, selected);
    assert.ok(Math.abs(fromDisplayValue(displayed, field, selected) - si) < 1e-7);
  }
  assert.equal(resolvedFieldUnit('engine.boreMeters', {
    quantityDefaults: { length: 'in' },
  }), 'in');
  assert.throws(() => resolveDisplayUnit(boost, { quantityDefaults: { pressure: 'hp' } }), /incompatible unit/);
  assert.throws(() => toDisplayValue(100, boost, 'kW'), /incompatible unit/);
  assert.throws(() => fromDisplayValue(Number.NaN, boost, 'psi'), /finite/);
});

test('gauge/absolute pressure basis requires explicit ambient reference', () => {
  const boost = quantityField('pressure.boost', 'pressure', 'gauge');
  assert.throws(
    () => toDisplayValue(0, boost, 'psi', { displayBasis: 'absolute' }),
    /ambient reference required/,
  );
  const absolute = toDisplayValue(0, boost, 'psi', {
    displayBasis: 'absolute',
    ambientPressurePa: 101325,
  });
  assert.ok(absolute > 14 && absolute < 15);
  assert.ok(Math.abs(fromDisplayValue(absolute, boost, 'psi', {
    displayBasis: 'absolute',
    ambientPressurePa: 101325,
  })) < 1e-7);
  assert.throws(
    () => toDisplayValue(0, boost, 'psi', { displayBasis: 'absolute', ambientPressurePa: -1 }),
    /ambient pressure/,
  );
});

test('SI conversion families distinguish US/Imperial fuel and reciprocal fuel economy', () => {
  const fuel = quantityField('fuel.amount', 'fuel-volume');
  const economy = quantityField('fuel.economy', 'fuel-economy');
  assert.notEqual(fromDisplayValue(1, fuel, 'us-gal'), fromDisplayValue(1, fuel, 'imp-gal'));
  for (const selected of ['L/100km', 'us-mpg', 'imp-mpg']) {
    const si = fromDisplayValue(25, economy, selected);
    assert.ok(si > 0);
    assert.ok(Math.abs(toDisplayValue(si, economy, selected) - 25) < 1e-10);
  }
  assert.throws(() => fromDisplayValue(0, economy, 'us-mpg'), /finite/);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { navigation, resolveHashRoute, routeHref } from '../src/app/routing.ts';

const fixtures = JSON.parse(
  readFileSync(new URL('./fixtures/hash-route-cases.json', import.meta.url), 'utf8'),
);

test('valid GitHub Pages and alternate-base hash links resolve', () => {
  for (const fixture of fixtures.valid) {
    const url = new URL(fixture.url);
    assert.equal(resolveHashRoute(url.hash), fixture.expected, fixture.url);
  }
});

test('navigation links are base-independent and reload-safe', () => {
  for (const route of navigation) {
    const href = routeHref(route.id);
    assert.equal(href, '#' + route.path);
    for (const base of ['https://example.test/sound-generator/', 'https://example.test/custom/']) {
      assert.equal(resolveHashRoute(new URL(href, base).hash), route.id);
    }
  }
});

test('unrecognized, malformed and non-hash paths fail closed', () => {
  for (const invalid of fixtures.invalid) {
    assert.equal(resolveHashRoute(invalid), 'not-found', invalid);
  }
});

import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

export async function verifyShellBrowser(call, evaluate, waitFor, origin) {
  await call('Page.navigate', { url: origin + '/sound-generator/#/drive' });
  const read = () =>
    evaluate(`(() => {
      const tick = document.querySelector('#simulation-tick');
      return tick ? {
        tick: Number(tick.textContent),
        status: document.querySelector('#runtime-status').textContent.trim(),
        heading: document.querySelector('h1').textContent.trim(),
      } : null;
    })()`);
  const initial = await waitFor(read);
  assert.deepEqual(initial, { tick: 0, status: 'Paused', heading: 'Drive' });
  await evaluate("document.querySelector('#resume-mock').click(); true");
  let previous = await waitFor(async () => {
    const state = await read();
    return state?.tick >= 50 ? state : null;
  });
  const evidence = [];
  for (const [hash, heading] of [
    ['#/', 'Dashboard'],
    ['#/diagnostics', 'Diagnostics'],
    ['#/settings', 'Settings'],
    ['#/drive', 'Drive'],
    ['#/missing', 'Unknown route'],
  ]) {
    await evaluate(`location.hash = '${hash}'; true`);
    const current = await waitFor(async () => {
      const state = await read();
      return state?.heading === heading && state.tick > previous.tick
        ? state
        : null;
    });
    assert.equal(current.status, 'Running');
    evidence.push({ route: hash, before: previous.tick, after: current.tick });
    previous = current;
  }
  await evaluate("document.querySelector('#pause-mock').click(); true");
  const paused = await waitFor(async () => {
    const state = await read();
    return state?.status === 'Paused' ? state : null;
  });
  await evaluate("document.querySelector('nav a:nth-child(3)').click()");
  await waitFor(async () => (await read())?.heading === 'Diagnostics');
  await sleep(125);
  assert.equal((await read()).tick, paused.tick);
  const count = await evaluate(
    "Number(document.querySelector('#domain-event-count').textContent)",
  );
  assert.ok(count > 0);
  await evaluate("document.querySelector('#step-mock').click(); true");
  assert.equal((await read()).tick, paused.tick + 1);

  await call('Page.reload', {});
  const reloaded = await waitFor(async () => {
    const state = await read();
    return state?.tick === 0 && state.heading === 'Diagnostics' ? state : null;
  });
  assert.equal(reloaded.status, 'Paused');
  console.log(
    'PASS: route-independent mock runtime, paused step, invalid hash and actual reload ' +
      JSON.stringify({ evidence, pausedTick: paused.tick, reloaded }),
  );
}

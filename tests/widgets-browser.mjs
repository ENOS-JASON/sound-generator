import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

export async function verifyWidgetsBrowser(call, evaluate, waitFor) {
  await evaluate("document.querySelector('#widget-toggle-rpm').click()");
  await evaluate("document.querySelector('#widget-toggle-waveform').click()");
  const read = () => evaluate(`({
    rpm: Number(document.querySelector('#rpm-reads').textContent),
    waveform: Number(document.querySelector('#waveform-reads').textContent),
  })`);
  await waitFor(async () => {
    const reads = await read();
    return reads.rpm > 0 && reads.waveform > 0;
  });
  const placement = () =>
    evaluate(`(() => {
      const r = document.querySelector('[data-widget=rpm]').getBoundingClientRect();
      return { x: r.x, y: r.y };
    })()`);
  const before = await placement();
  const handle = await evaluate(`(() => {
    const r = document.querySelector('[data-widget=rpm] .drag-handle')
      .getBoundingClientRect();
    return { x: r.x + 10, y: r.y + 10 };
  })()`);
  await call('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'left',
    clickCount: 1,
    ...handle,
  });
  const target = { x: handle.x + 40, y: handle.y + 30 };
  await call('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    buttons: 1,
    ...target,
  });
  await call('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'left',
    clickCount: 1,
    ...target,
  });
  const moved = await placement();
  assert.ok(moved.x > before.x);
  assert.ok(moved.y > before.y);
  await evaluate("document.querySelector('#widget-hide-all').click()");
  await waitFor(() => evaluate("!document.querySelector('[data-widget]')"));
  const hidden = await read();
  await sleep(350);
  assert.deepEqual(await read(), hidden);
  await evaluate("document.querySelector('#widget-hide-all').click()");
  await waitFor(() => evaluate("!!document.querySelector('[data-widget=rpm]')"));
  assert.deepEqual(await placement(), moved);
  await evaluate("location.hash = '#/drive'");
  await waitFor(() => evaluate("document.querySelector('h1').textContent === 'Drive'"));
  assert.deepEqual(await placement(), moved);
  await evaluate("document.querySelector('[data-widget=rpm] .drag-handle').focus()");
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await waitFor(() => evaluate("!document.querySelector('[data-widget=rpm]')"));
  assert.equal(
    await evaluate("document.activeElement.id"),
    'widget-toggle-rpm',
  );
  await evaluate("document.querySelector('#widget-toggle-rpm').click()");
  await waitFor(() => evaluate("!!document.querySelector('[data-widget=rpm]')"));
  assert.deepEqual(await placement(), moved);
  console.log('PASS: widget drag, hide/restore, hidden sampling, route and keyboard close');
}

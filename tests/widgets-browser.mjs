import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

export async function verifyWidgetsBrowser(call, evaluate, waitFor) {
  await call('Emulation.setDeviceMetricsOverride', {
    width: 1000,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate("document.querySelector('#widget-toggle-rpm').click()");
  await evaluate("document.querySelector('#widget-toggle-waveform').click()");

  function read() {
    return evaluate(`({
      rpm: Number(document.querySelector('#rpm-reads').textContent),
      waveform: Number(document.querySelector('#waveform-reads').textContent),
    })`);
  }

  function placement(id) {
    return evaluate(`(() => {
      const r = document.querySelector('[data-widget=${id}]')
        .getBoundingClientRect();
      return { x: r.x, y: r.y };
    })()`);
  }

  async function dragWidget(id, dx, dy) {
    const before = await placement(id);
    const handle = await evaluate(`(() => {
      const r = document.querySelector('[data-widget=${id}] .drag-handle')
        .getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`);
    const hit = await evaluate(`(() => {
      const node = document.elementFromPoint(${handle.x}, ${handle.y});
      return node?.closest('[data-widget]')?.dataset.widget;
    })()`);
    assert.equal(hit, id);
    await call('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      ...handle,
    });
    await call('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button: 'left',
      buttons: 1,
      clickCount: 1,
      ...handle,
    });
    const target = { x: handle.x + dx, y: handle.y + dy };
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
    const moved = await waitFor(async () => {
      const current = await placement(id);
      return current.x > before.x && current.y > before.y ? current : null;
    });
    return moved;
  }

  function rpmVisible() {
    return evaluate("!!document.querySelector('[data-widget=rpm]')");
  }

  await waitFor(async () => {
    const reads = await read();
    return reads.rpm > 0 && reads.waveform > 0;
  });
  const moved = await dragWidget('rpm', 40, 30);
  const waveformMoved = await dragWidget('waveform', 30, 20);
  await evaluate("document.querySelector('#widget-hide-all').click()");
  await waitFor(() => evaluate("!document.querySelector('[data-widget]')"));
  const hidden = await read();
  await sleep(350);
  assert.deepEqual(await read(), hidden);
  await evaluate("document.querySelector('#widget-hide-all').click()");
  await waitFor(rpmVisible);
  assert.deepEqual(await placement('rpm'), moved);
  assert.deepEqual(await placement('waveform'), waveformMoved);
  await evaluate("location.hash = '#/drive'");
  await waitFor(async () => {
    const heading = await evaluate("document.querySelector('h1').textContent");
    return heading === 'Drive';
  });
  assert.deepEqual(await placement('rpm'), moved);
  await evaluate(
    "document.querySelector('[data-widget=rpm] .drag-handle').focus()",
  );
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await waitFor(async () => !(await rpmVisible()));
  const focused = await evaluate('document.activeElement.id');
  assert.equal(focused, 'widget-toggle-rpm');
  await evaluate("document.querySelector('#widget-toggle-rpm').click()");
  await waitFor(rpmVisible);
  assert.deepEqual(await placement('rpm'), moved);
  console.log(
    'PASS: widget drag, hide/restore, hidden sampling, route and keyboard close',
  );
}

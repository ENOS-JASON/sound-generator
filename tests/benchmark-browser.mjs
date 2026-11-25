import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

async function waitFor(read, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const result = await read();
    if (result) return result;
    await sleep(100);
  }
  throw new Error('Benchmark browser verification timed out');
}

export async function verifyBenchmarkBrowser(chrome, origin, temporary) {
  const profile = join(temporary, 'solver-benchmark-profile');
  const browser = spawn(
    chrome,
    [
      '--headless=new',
      '--no-sandbox',
      '--ignore-certificate-errors',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--autoplay-policy=no-user-gesture-required',
      '--remote-debugging-port=0',
      '--no-first-run',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const exited = once(browser, 'exit');
  let socket;
  try {
    const portFile = join(profile, 'DevToolsActivePort');
    const port = await waitFor(() =>
      existsSync(portFile)
        ? Number(readFileSync(portFile, 'utf8').split('\n')[0])
        : null,
    );
    const targets = await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json();
    const page = targets.find((target) => target.type === 'page');
    assert.ok(page?.webSocketDebuggerUrl);
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await once(socket, 'open');
    let nextId = 0;
    const pending = new Map();
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      if (message.error) handler.reject(new Error(message.error.message));
      else handler.resolve(message.result);
    });
    function call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
    async function evaluate(expression) {
      const response = await call('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
        userGesture: true,
      });
      if (response.exceptionDetails) {
        throw new Error(JSON.stringify(response.exceptionDetails));
      }
      return response.result.value;
    }
    const path = '/sound-generator/src/testing/mock-solver/benchmark.html';
    await call('Page.navigate', { url: origin + path + '?smoke' });
    await waitFor(() => evaluate("!!document.querySelector('#run')?.onclick"));
    for (const [rate, scale] of [
      [48000, 1],
      [44100, 0.1],
    ]) {
      await evaluate(`document.querySelector('#rate').value = '${rate}';
        document.querySelector('#scale').value = '${scale}';
        document.querySelector('#run').click(); true`);
      const state = await waitFor(() =>
        evaluate(`(() => {
          const status = document.querySelector('#status');
          return ['complete', 'error'].includes(status.dataset.state) &&
            !document.querySelector('#run').disabled
            ? {state: status.dataset.state, text: status.textContent,
               report: document.querySelector('#report').textContent} : null;
        })()`),
      );
      assert.equal(state.state, 'complete', state.text);
      const report = JSON.parse(state.report);
      assert.equal(report.smoke, true);
      assert.equal(report.equivalent, true);
      assert.equal(report.sampleRate, rate);
      assert.equal(report.playbackScale, scale);
      assert.equal(report.results.length, 2);
      assert.deepEqual(
        report.results.map((result) => result.owner),
        ['worklet', 'worker'],
      );
      for (const result of report.results) {
        assert.equal(result.summary.clock.simulationTick, 400);
        assert.equal(result.summary.clock.sampleFrame, report.totalFrames);
        assert.equal(result.blocks, Math.ceil(report.totalFrames / 128));
        assert.ok(result.summary.eventCount >= 3);
        assert.equal(
          result.renderedFrames,
          result.blocks * 128 + result.underrunFrames,
        );
      }
      console.log(
        `PASS: browser benchmark ${rate} Hz ${scale}x ${JSON.stringify(report)}`,
      );
    }
    await call('Page.navigate', {
      url: origin + '/sound-generator/src/audio/synthetic-worklet/diagnostic.html',
    });
    await waitFor(() => evaluate("!!document.querySelector('#run')?.onclick"));
    for (const [rate, scale, bin] of [
      [48000, 1, 20],
      [44100, 0.1, 2],
    ]) {
      await evaluate(`document.querySelector('#rate').value = '${rate}';
        document.querySelector('#scale').value = '${scale}';
        document.querySelector('#run').click(); true`);
      const state = await waitFor(() =>
        evaluate(`(() => {
          const status = document.querySelector('#status');
          return ['complete', 'error'].includes(status.dataset.state) &&
            !document.querySelector('#run').disabled
            ? {state: status.dataset.state, text: status.textContent,
               report: document.querySelector('#report').textContent} : null;
        })()`),
      );
      assert.equal(state.state, 'complete', state.text);
      const result = JSON.parse(state.report);
      assert.equal(result.audioUnlocked, true);
      assert.equal(result.sampleRate, rate);
      assert.equal(result.playbackScale, scale);
      assert.equal(result.renderedFrames, Math.round((rate * 0.4) / scale));
      assert.equal(result.mode, 'physical');
      assert.equal(result.nonfiniteSamples, 0);
      assert.equal(result.clippedSamples, 0);
      assert.equal(result.frameGaps, 0);
      assert.ok(result.maxOutput < 1);
      assert.ok(result.impulseCount > 0);
      assert.equal(result.rawCapturedFrames, 4096);
      assert.equal(result.captureFinite, true);
      assert.equal(result.features[0].peakBin, bin);
      assert.equal(result.meters.length, 4);
      assert.ok(result.deadline.budgetMs > 0);
      console.log(
        `PASS: synthetic audio ${rate} Hz ${scale}x ${JSON.stringify({
          frames: result.renderedFrames,
          firstPeakBin: result.features[0].peakBin,
          impulseCount: result.impulseCount,
          frameGaps: result.frameGaps,
          droppedFeatures: result.droppedFeatures,
          deadline: result.deadline,
          meters: result.meters,
        })}`,
      );
    }
  } finally {
    socket?.close();
    browser.kill();
    await exited;
  }
}

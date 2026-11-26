# AG-M0-14a — Route-independent application shell

**Status: partial, implementation submitted for CI.** ADR-002 is accepted; AG-M0-01 is complete. AG-M0-10 provides the committed deterministic I4/SimulationClock fixture, but ADR-001 and production clock/audio ownership are unresolved.

- Root Svelte shell retains one mock runtime on Dashboard, Drive, Diagnostics, Settings and invalid hash routes. The global controls resume, pause, single-step or select approved playback scales. The runtime uses the existing validated command and clock contracts and publishes immutable mock projections.
- The root lifecycle owns one synthetic 25 ms timer (48 kHz, 1,200 frames per block); routes are presentation only. This is not a real-time audio scheduler, calibrated engine, or production event/recorder integration. The timer is disposed on root unmount. A fresh document starts paused; IndexedDB restoration is owned by AG-M0-18.
- No shared contract or dependency change; existing accepted lightweight hash resolver is preserved. The browser smoke harness exercises actual hash changes while running, pause and step, an invalid hash, and an actual reload at the nested HTTPS Pages path.
- Tests added: `tests/shell-runtime.test.mjs` and `tests/shell-browser.mjs`; invoked via existing `npm run check` and `node tests/pages-smoke.mjs https` in GitHub Actions. Results pending; no unexecuted criterion is checked.
- No audio, persistent workspace, draggable widgets or production physics claim. AG-M0-14b owns widgets. AG-M0-18 owns workspace schema and restore. The public Pages deployment can only be verified after merge.

<script lang="ts">
  import { onMount } from 'svelte';
  import { navigation, resolveHashRoute, routeHref } from './app/routing';
  import {
    createShellRuntime,
    mockScales,
  } from './ui-shell/app-shell/mockRuntime';

  // Root-owned fixture; no route creates or destroys the runtime.
  const runtime = createShellRuntime();
  let currentRoute = $state(resolveHashRoute(window.location.hash));
  let snapshot = $state(runtime.snapshot());
  let error = $state('');

  function syncRoute(): void {
    currentRoute = resolveHashRoute(window.location.hash);
  }

  function update(action: () => ReturnType<typeof runtime.snapshot>): void {
    try {
      snapshot = action();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
  }

  onMount(() => {
    const timer = window.setInterval(() => {
      if (!error) update(runtime.pulse);
    }, 25);
    return () => window.clearInterval(timer);
  });

  function heading(): string {
    return (
      navigation.find((route) => route.id === currentRoute)?.title ??
      'Unknown route'
    );
  }
</script>

<svelte:window onhashchange={syncRoute} />

<div class="app-shell">
  <header>
    <a class="wordmark" href="#/">Sound Generator</a>
    <nav aria-label="Main navigation">
      {#each navigation as route (route.id)}
        <a
          href={routeHref(route.id)}
          aria-current={currentRoute === route.id ? 'page' : undefined}
        >
          {route.title}
        </a>
      {/each}
    </nav>
  </header>

  <section class="runtime-panel" aria-label="Global mock runtime controls">
    <div class="runtime-summary">
      <strong id="runtime-status">
        {error ? 'Error' : snapshot.paused ? 'Paused' : 'Running'}
      </strong>
      <span>Mock I4 · synthetic fixture</span>
      <span>Tick <output id="simulation-tick">{snapshot.simulationTick}</output></span>
      <span>
        Simulated time {snapshot.simulationTimeSeconds.toFixed(3)} s
      </span>
    </div>
    <div class="runtime-controls">
      <button
        id="resume-mock"
        disabled={!snapshot.paused || !!error}
        onclick={() => update(runtime.resume)}>Resume</button
      >
      <button
        id="pause-mock"
        disabled={snapshot.paused || !!error}
        onclick={() => update(runtime.pause)}>Pause</button
      >
      <button
        id="step-mock"
        disabled={!snapshot.paused || !!error}
        onclick={() => update(runtime.step)}>Step 1 tick</button
      >
      <div class="scale-controls" role="group" aria-label="Playback scale">
        {#each mockScales as scale (scale)}
          <button
            aria-pressed={snapshot.playbackScale === scale}
            disabled={!!error}
            onclick={() => update(() => runtime.setScale(scale))}
            >{scale}x</button
          >
        {/each}
      </div>
    </div>
    {#if error}
      <p role="alert">{error}</p>
    {/if}
  </section>

  <main id="main-content">
    <h1>{heading()}</h1>
    {#if currentRoute === 'dashboard'}
      <p>
        Explore the synthetic I4 fixture using the global runtime controls.
        Navigation keeps the same simulation session.
      </p>
      <a href="#/drive">Open Drive</a>
    {:else if currentRoute === 'drive'}
      <p>Synthetic engine state, not a calibrated physical vehicle.</p>
      <dl>
        <dt>Mock engine speed</dt>
        <dd>{snapshot.rpm.toFixed(1)} rpm</dd>
        <dt>Crank angle</dt>
        <dd>{snapshot.crankAngleRadians.toFixed(3)} rad</dd>
      </dl>
    {:else if currentRoute === 'diagnostics'}
      <p>Read-only projection of the shared mock runtime.</p>
      <dl>
        <dt>Domain events</dt>
        <dd id="domain-event-count">{snapshot.eventCount}</dd>
        <dt>Latest domain event</dt>
        <dd>{snapshot.lastEvent ?? 'None'}</dd>
        <dt>Synthetic sample frame</dt>
        <dd>{snapshot.sampleFrame}</dd>
      </dl>
    {:else if currentRoute === 'settings'}
      <p>
        The fixture uses a fixed 48 kHz synthetic frame rate. Production
        audio, browser workspace restoration and user preferences are not
        connected to this shell yet.
      </p>
    {:else}
      <p>This route is not available.</p>
      <a href="#/">Return to Dashboard</a>
    {/if}
  </main>

  <footer>
    AG-M0-14a · route-independent mock runtime · no production audio or physics
  </footer>
</div>

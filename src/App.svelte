<script lang="ts">
  import { navigation, resolveHashRoute, routeHref } from './app/routing';

  let currentRoute = $state(resolveHashRoute(window.location.hash));

  function syncRoute(): void {
    currentRoute = resolveHashRoute(window.location.hash);
  }

  function heading(): string {
    return navigation.find((route) => route.id === currentRoute)?.title ?? 'Unknown route';
  }
</script>

<svelte:window onhashchange={syncRoute} />

<div class="app-shell">
  <header>
    <a class="wordmark" href="#/">Sound Generator</a>
    <nav aria-label="Main navigation">
      {#each navigation as route (route.id)}
        <a href={routeHref(route.id)} aria-current={currentRoute === route.id ? 'page' : undefined}>
          {route.title}
        </a>
      {/each}
    </nav>
  </header>

  <main id="main-content">
    <h1>{heading()}</h1>
    {#if currentRoute === 'not-found'}
      <p>This route is not available.</p>
      <a href="#/">Return to Dashboard</a>
    {:else}
      <p>Foundation placeholder. Physics, audio, and diagnostics are not yet implemented.</p>
    {/if}
  </main>

  <footer>AG-M0-01 foundation shell · no simulation running</footer>
</div>

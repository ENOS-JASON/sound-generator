<script lang="ts">
  import { onMount } from 'svelte';
  import DebugPanels from '../debug-panels/DebugPanels.svelte';
  import { WidgetRegistry, widgetIds } from './WidgetRegistry';
  import type { WidgetId } from './WidgetRegistry';
  import { createWidgetSampler } from './widgetSampler';
  import type { ShellSnapshot } from './widgetSampler';

  interface Props {
    snapshot: ShellSnapshot;
    diagnostics: boolean;
  }

  interface DragState {
    id: WidgetId;
    x: number;
    y: number;
    dx: number;
    dy: number;
  }

  let { snapshot, diagnostics }: Props = $props();

  const registry = new WidgetRegistry();
  const sampler = createWidgetSampler(() => snapshot);
  let layout = $state(registry.snapshot());
  let samples = $state(sampler.snapshot());
  let drag: DragState | null = null;

  const labels = { rpm: 'Mock RPM', waveform: 'Fixture waveform' };

  function sync(): void {
    layout = registry.snapshot();
  }

  function resize(): void {
    registry.resize(window.innerWidth, window.innerHeight);
    sync();
  }

  function toggle(id: WidgetId): void {
    registry.show(id, !layout.placements[id].shown);
    sync();
  }

  function hideAll(): void {
    registry.hideAll(!layout.hidden);
    sync();
  }

  function reset(): void {
    registry.reset();
    sync();
  }

  function startDrag(event: PointerEvent, id: WidgetId): void {
    if (event.button !== 0) return;
    const { x, y } = layout.placements[id];
    drag = { id, x, y, dx: event.clientX, dy: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent): void {
    if (!drag) return;
    registry.move(
      drag.id,
      drag.x + event.clientX - drag.dx,
      drag.y + event.clientY - drag.dy,
    );
    sync();
  }

  function endDrag(): void {
    drag = null;
  }

  function keyboard(event: KeyboardEvent, id: WidgetId): void {
    if (event.key === 'Escape') {
      registry.show(id, false);
      sync();
      document.getElementById('widget-toggle-' + id)?.focus();
      return;
    }
    const { x, y } = layout.placements[id];
    const steps: Record<string, readonly [number, number]> = {
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
      ArrowDown: [0, 16],
    };
    const offset = steps[event.key];
    if (!offset) return;
    event.preventDefault();
    registry.move(id, x + offset[0], y + offset[1]);
    sync();
  }

  function points(values: readonly number[], max: number): string {
    return values
      .map((value, i) => {
        const x = (i * 220) / Math.max(1, values.length - 1);
        const y = 32 - (value / max) * 30;
        return x.toFixed(2) + ',' + y.toFixed(2);
      })
      .join(' ');
  }

  onMount(() => {
    resize();
    const timer = window.setInterval(() => {
      if (widgetIds.some((id) => registry.visible(id))) {
        samples = sampler.refresh(registry);
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      sampler.close();
    };
  });
</script>

<svelte:window onresize={resize} />

<section class="widget-toolbar" aria-label="Diagnostic widgets">
  {#each widgetIds as id (id)}
    <button
      id={'widget-toggle-' + id}
      aria-pressed={layout.placements[id].shown}
      onclick={() => toggle(id)}
    >
      {layout.placements[id].shown ? 'Hide' : 'Show'}
      {labels[id]}
    </button>
  {/each}
  <button id="widget-hide-all" onclick={hideAll}>
    {layout.hidden ? 'Restore widgets' : 'Hide all widgets'}
  </button>
  <button onclick={reset}>Reset widget layout</button>
  <p>
    Sampling reads: RPM <output id="rpm-reads">{samples.rpmSamples}</output>,
    waveform <output id="waveform-reads">{samples.waveformSamples}</output>
  </p>
</section>

{#if diagnostics}
  <DebugPanels {snapshot} />
{/if}

{#each widgetIds as id (id)}
  {#if !layout.hidden && layout.placements[id].shown}
    <section
      class="floating-widget"
      data-widget={id}
      aria-label={labels[id]}
      style:left={layout.placements[id].x + 'px'}
      style:top={layout.placements[id].y + 'px'}
    >
      <div class="widget-title">
        <button
          class="drag-handle"
          aria-label={'Move ' + labels[id]}
          onpointerdown={(event) => startDrag(event, id)}
          onpointermove={moveDrag}
          onpointerup={endDrag}
          onpointercancel={endDrag}
          onlostpointercapture={endDrag}
          onkeydown={(event) => keyboard(event, id)}
        >
          {labels[id]}
        </button>
        <button aria-label={'Close ' + labels[id]} onclick={() => toggle(id)}>
          Close
        </button>
      </div>
      {#if id === 'rpm'}
        <p>{snapshot.rpm.toFixed(1)} rpm</p>
        <svg viewBox="0 0 220 64" aria-label="Mock RPM history" role="img">
          <polyline points={points(samples.rpm, Math.max(1, ...samples.rpm))} />
        </svg>
      {:else}
        <p>Synthetic test tone, not live audio</p>
        <svg viewBox="0 0 220 64" aria-label="Fixture waveform" role="img">
          <polyline points={points(samples.waveform, 0.1)} />
        </svg>
      {/if}
    </section>
  {/if}
{/each}

<style>
  .widget-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .widget-toolbar p {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.85rem;
  }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .floating-widget {
    position: fixed;
    z-index: 10;
    box-sizing: border-box;
    width: 260px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: auto;
    padding: 0.6rem;
    background: white;
    border: 1px solid #a3aab4;
    border-radius: 0.5rem;
    box-shadow: 0 3px 12px #0002;
  }

  .widget-title {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .drag-handle {
    touch-action: none;
    cursor: grab;
  }

  .floating-widget p {
    margin: 0.5rem 0;
    font-size: 0.85rem;
  }

  svg {
    display: block;
    width: 100%;
    background: #f7f8fa;
  }

  polyline {
    fill: none;
    stroke: #385d9c;
    stroke-width: 1.5;
  }
</style>

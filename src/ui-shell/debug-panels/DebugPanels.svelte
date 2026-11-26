<script lang="ts">
  import type { ShellSnapshot } from '../widgets/widgetSampler';

  let { snapshot }: { snapshot: ShellSnapshot } = $props();
</script>

<section aria-label="Debug panels">
  <details>
    <summary>Physics debug</summary>
    <p>Mock crank speed: {snapshot.rpm.toFixed(1)} rpm</p>
    <p>Crank angle: {snapshot.crankAngleRadians.toFixed(3)} rad</p>
  </details>
  <details>
    <summary>Audio debug</summary>
    <p>Waveform widget displays the deterministic synthetic audio fixture.</p>
    <p>Production AudioWorklet streaming is not connected to this shell.</p>
  </details>
  <details>
    <summary>Event debug</summary>
    <p>Domain events: {snapshot.eventCount}</p>
    <p>Latest: {snapshot.lastEvent ?? 'None'}</p>
  </details>
</section>

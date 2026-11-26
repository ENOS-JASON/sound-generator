import { SyntheticStimulus } from '../../audio/synthetic-worklet/stimulus.ts';
import { DiagnosticsHub } from '../../diagnostics/DiagnosticsHub.ts';
import { GraphInspector } from '../../diagnostics/GraphInspector.ts';
import { TelemetryRegistry } from '../../diagnostics/TelemetryRegistry.ts';
import type { createShellRuntime } from '../app-shell/mockRuntime.ts';
import type { WidgetRegistry } from './WidgetRegistry.ts';

export type ShellSnapshot = ReturnType<
  ReturnType<typeof createShellRuntime>['snapshot']
>;

function fixtureWaveform(): readonly number[] {
  const stimulus = new SyntheticStimulus({
    runId: 'widget-audio-fixture',
    sampleRate: 48000,
    seed: 42,
    toneHz: 937.5,
    frameCount: 4096,
    captureFrames: 0,
    timeline: [],
  });
  stimulus.render(new Float32Array(4096));
  const frame = stimulus.takeFeature()!;
  return Object.freeze(
    Array.from({ length: 128 }, (_, i) => frame.window[i * 8]!),
  );
}

/** Bounded read-only consumers; hidden charts perform no source sampling. */
export function createWidgetSampler(read: () => ShellSnapshot) {
  const hub = new DiagnosticsHub(new TelemetryRegistry(), read().runId);
  const graph = new GraphInspector(
    {
      kind: 'live',
      hub,
      readCrank: () => {
        const s = read();
        return {
          schemaVersion: 1,
          category: 'snapshot',
          runId: s.runId,
          simulationTick: s.simulationTick,
          simulationTimeSeconds: s.simulationTimeSeconds,
          sampleFrame: s.sampleFrame,
          domainSequenceWatermark: s.eventCount,
          state: { angularVelocityRadPerSecond: (s.rpm * 2 * Math.PI) / 60 },
        };
      },
    },
    { fieldIds: [], includeCrankRpm: true, historyCapacity: 64, maxPoints: 32 },
  );
  let rpm: readonly number[] = [];
  let waveform: readonly number[] = [];
  let rpmSamples = 0;
  let waveformSamples = 0;

  function snapshot() {
    return Object.freeze({ rpm, waveform, rpmSamples, waveformSamples });
  }

  return {
    snapshot,
    refresh(registry: WidgetRegistry) {
      const showRpm = registry.visible('rpm');
      graph.setVisible(showRpm);
      if (showRpm) {
        const result = graph.refresh();
        rpm = Object.freeze(
          result?.series[0]?.points.map((point) => point.displayValue) ?? [],
        );
        rpmSamples++;
      }
      if (registry.visible('waveform')) {
        waveform = fixtureWaveform();
        waveformSamples++;
      }
      return snapshot();
    },
    close() {
      graph.close();
    },
  };
}

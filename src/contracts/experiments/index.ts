/** AG-M0-16 / proposed ADR-007. Data only; no numerical backend is shipped. */
import type { ReferenceBoundarySample } from '../approximation/index.ts';
import type {
  ComponentNodeV1,
  PortGraphV1,
  PortLinkV1,
  RequiredPathV1,
} from '../ports/index.ts';
import type {
  ReferencePrecision,
  ReferenceProfileV1,
  ReferenceTier,
} from '../reference/index.ts';
import { validatePortGraph } from '../../core/physics-ports/graph.ts';
import type { CapabilityRegistry } from '../../core/physics-ports/registry.ts';

export const EXPERIMENT_VERSION = 1 as const;
export const MAX_EXPERIMENT_JSON_BYTES = 8 * 1024 * 1024;

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | JsonObject;
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

/** Provider-specific data uses explicit SI quantities and versioned schemas. */
export interface ReferencePartV1 {
  readonly providerVersion: string;
  readonly geometry: JsonObject;
  readonly materials: JsonObject;
  readonly parameters: JsonObject;
  readonly subcomponents: JsonObject;
  readonly mesh: JsonObject;
  readonly acousticSources: JsonObject;
}

export interface ReferenceManifestV1 {
  readonly schemaVersion: typeof EXPERIMENT_VERSION;
  readonly graph: PortGraphV1;
  /** Exactly one entry for every installed graph component ID. */
  readonly parts: Readonly<Record<string, ReferencePartV1>>;
}

interface PartSnapshot {
  readonly node: ComponentNodeV1;
  readonly part: ReferencePartV1;
}
export interface PartChangeV1 {
  readonly componentId: string;
  /** Sorted JSON pointers; arrays are atomic; empty pointer means add/remove. */
  readonly paths: readonly string[];
  readonly before: PartSnapshot | null;
  readonly after: PartSnapshot | null;
}
interface TopologySnapshot {
  readonly componentOrder: readonly string[];
  readonly links: readonly PortLinkV1[];
  readonly requiredPaths: readonly RequiredPathV1[];
}
export interface ManifestDiffV1 {
  readonly parts: readonly PartChangeV1[];
  readonly topology: {
    readonly before: TopologySnapshot;
    readonly after: TopologySnapshot;
  } | null;
}
export interface ExperimentVariationV1 {
  readonly id: string;
  readonly kind: 'one-part' | 'part-set';
  readonly manifest: ReferenceManifestV1;
  readonly declared: ManifestDiffV1;
}

export interface ExperimentDefinitionV1 {
  readonly schemaVersion: typeof EXPERIMENT_VERSION;
  readonly studyId: string;
  readonly baseline: ReferenceManifestV1;
  readonly variations: readonly ExperimentVariationV1[];
  /** Shared by every baseline/variant pair, not independently editable per run. */
  readonly paired: {
    readonly presetId: string;
    readonly presetVersion: string;
    readonly scenarioId: string;
    readonly scenarioVersion: string;
    readonly orderedSteps: readonly JsonObject[];
    readonly environment: JsonObject;
    readonly initialState: JsonObject;
    readonly seeds: readonly number[];
    readonly fidelity: ReferenceProfileV1;
    readonly capture: JsonObject;
    readonly gates: JsonObject;
  };
  readonly resources: ResourceLimitsV1;
  readonly retryLimit: number;
  readonly checkpointIntervalSteps: number;
}

export interface ResourceLimitsV1 {
  readonly threads: number;
  readonly ramBytes: number;
  readonly vramBytes: number;
  readonly diskBytes: number;
  readonly concurrentJobs: number;
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function record(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
function exactKeys(value: unknown, expected: readonly string[]): void {
  ensure(record(value), 'expected object');
  ensure(
    Object.keys(value).sort().join('|') === [...expected].sort().join('|'),
    'unknown or missing field',
  );
}
function identifier(value: unknown): void {
  ensure(
    typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value),
    'invalid identifier',
  );
}
function integer(value: unknown, minimum: number): void {
  ensure(
    typeof value === 'number' &&
      Number.isSafeInteger(value) &&
      value >= minimum,
    'invalid integer',
  );
}
function nonempty(value: unknown): void {
  ensure(typeof value === 'string' && value.length > 0, 'missing identity');
}

/** Stable JSON identity, independent of object key insertion order. */
export function canonicalExperimentJson(value: unknown, depth = 0): string {
  ensure(depth <= 64, 'JSON nesting limit');
  if (value === null || typeof value === 'boolean' || typeof value === 'string')
    return JSON.stringify(value);
  if (typeof value === 'number') {
    ensure(Number.isFinite(value), 'non-finite JSON number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return (
      '[' +
      Array.from(value, (item: unknown) =>
        canonicalExperimentJson(item, depth + 1),
      ).join(',') +
      ']'
    );
  }
  ensure(record(value), 'expected plain JSON data');
  return (
    '{' +
    Object.keys(value)
      .sort()
      .map(
        (key) =>
          JSON.stringify(key) +
          ':' +
          canonicalExperimentJson(value[key], depth + 1),
      )
      .join(',') +
    '}'
  );
}
function equal(a: unknown, b: unknown): boolean {
  return canonicalExperimentJson(a) === canonicalExperimentJson(b);
}
function paths(a: unknown, b: unknown, prefix = ''): string[] {
  if (equal(a, b)) return [];
  if (!record(a) || !record(b)) return [prefix];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  return keys.flatMap((key) => {
    const path = prefix + '/' + key.replaceAll('~', '~0').replaceAll('/', '~1');
    return Object.hasOwn(a, key) && Object.hasOwn(b, key)
      ? paths(a[key], b[key], path)
      : [path];
  });
}

export function validateReferenceManifest(
  manifest: ReferenceManifestV1,
  registry: CapabilityRegistry,
): void {
  exactKeys(manifest, ['schemaVersion', 'graph', 'parts']);
  ensure(manifest.schemaVersion === EXPERIMENT_VERSION, 'manifest version');
  ensure(record(manifest.graph), 'missing graph');
  const graphKeys = ['schemaVersion', 'components', 'links'];
  if (Object.hasOwn(manifest.graph, 'requiredPaths'))
    graphKeys.push('requiredPaths');
  exactKeys(manifest.graph, graphKeys);
  validatePortGraph(manifest.graph, registry);
  exactKeys(
    manifest.parts,
    manifest.graph.components.map((node) => node.id),
  );
  for (const part of Object.values(manifest.parts)) {
    exactKeys(part, [
      'providerVersion',
      'geometry',
      'materials',
      'parameters',
      'subcomponents',
      'mesh',
      'acousticSources',
    ]);
    nonempty(part.providerVersion);
    for (const data of [
      part.geometry,
      part.materials,
      part.parameters,
      part.subcomponents,
      part.mesh,
      part.acousticSources,
    ]) {
      ensure(record(data), 'expected part metadata object');
    }
  }
  canonicalExperimentJson(manifest);
}

function snapshot(manifest: ReferenceManifestV1, id: string): PartSnapshot | null {
  const node = manifest.graph.components.find((component) => component.id === id);
  if (!node) return null;
  const part = manifest.parts[id];
  ensure(part, 'missing part metadata');
  return { node, part };
}
function topology(manifest: ReferenceManifestV1): TopologySnapshot {
  return {
    componentOrder: manifest.graph.components.map((node) => node.id),
    links: manifest.graph.links,
    requiredPaths: manifest.graph.requiredPaths ?? [],
  };
}

/** Compare validated, complete manifests, including graph order and rewiring. */
export function diffReferenceManifests(
  baseline: ReferenceManifestV1,
  variant: ReferenceManifestV1,
  registry: CapabilityRegistry,
): ManifestDiffV1 {
  validateReferenceManifest(baseline, registry);
  validateReferenceManifest(variant, registry);
  const ids = [...new Set([...Object.keys(baseline.parts), ...Object.keys(variant.parts)])].sort();
  const parts: PartChangeV1[] = [];
  for (const componentId of ids) {
    const before = snapshot(baseline, componentId);
    const after = snapshot(variant, componentId);
    const changed = paths(before, after).sort();
    if (changed.length) parts.push({ componentId, paths: changed, before, after });
  }
  const before = topology(baseline);
  const after = topology(variant);
  return { parts, topology: equal(before, after) ? null : { before, after } };
}

export function validateExperiment(
  definition: ExperimentDefinitionV1,
  registry: CapabilityRegistry,
): void {
  canonicalExperimentJson(definition);
  exactKeys(definition, [
    'schemaVersion',
    'studyId',
    'baseline',
    'variations',
    'paired',
    'resources',
    'retryLimit',
    'checkpointIntervalSteps',
  ]);
  ensure(definition.schemaVersion === EXPERIMENT_VERSION, 'experiment version');
  identifier(definition.studyId);
  validateReferenceManifest(definition.baseline, registry);
  const paired = definition.paired;
  exactKeys(paired, [
    'presetId',
    'presetVersion',
    'scenarioId',
    'scenarioVersion',
    'orderedSteps',
    'environment',
    'initialState',
    'seeds',
    'fidelity',
    'capture',
    'gates',
  ]);
  identifier(paired.presetId);
  identifier(paired.scenarioId);
  nonempty(paired.presetVersion);
  nonempty(paired.scenarioVersion);
  ensure(
    Array.isArray(paired.orderedSteps) &&
      paired.orderedSteps.length > 0 &&
      paired.orderedSteps.every(record),
    'missing scenario steps',
  );
  for (const data of [paired.environment, paired.initialState, paired.capture, paired.gates])
    ensure(record(data), 'expected paired metadata object');
  ensure(
    Array.isArray(paired.seeds) && paired.seeds.length > 0,
    'missing paired seeds',
  );
  for (const seed of paired.seeds) {
    integer(seed, 0);
    ensure(seed <= 0xffffffff, 'seed exceeds uint32');
  }
  ensure(paired.fidelity?.schemaVersion === 1, 'fidelity version');
  exactKeys(definition.resources, [
    'threads',
    'ramBytes',
    'vramBytes',
    'diskBytes',
    'concurrentJobs',
  ]);
  for (const [key, value] of Object.entries(definition.resources))
    integer(value, key === 'vramBytes' ? 0 : 1);
  integer(definition.retryLimit, 0);
  integer(definition.checkpointIntervalSteps, 1);
  ensure(Array.isArray(definition.variations), 'missing variations');
  const seen = new Set<string>();
  for (const variation of definition.variations) {
    exactKeys(variation, ['id', 'kind', 'manifest', 'declared']);
    identifier(variation.id);
    ensure(!seen.has(variation.id), 'duplicate variation ID');
    seen.add(variation.id);
    const realized = diffReferenceManifests(
      definition.baseline,
      variation.manifest,
      registry,
    );
    ensure(
      (variation.kind === 'one-part' && realized.parts.length === 1) ||
        (variation.kind === 'part-set' && realized.parts.length >= 2),
      'invalid one-part or part-set scope',
    );
    ensure(equal(variation.declared, realized), 'undeclared or incorrect change');
    if (variation.kind === 'one-part') {
      // Rewiring is explicit; links between two untouched parts cannot change.
      const changed = realized.parts[0]?.componentId;
      const untouched = (link: PortLinkV1) =>
        link.from.componentId !== changed && link.to.componentId !== changed;
      const before = definition.baseline.graph.links.filter(untouched);
      const after = variation.manifest.graph.links.filter(untouched);
      ensure(equal(before, after), 'unrelated one-part rewiring');
      ensure(
        equal(
          definition.baseline.graph.requiredPaths ?? [],
          variation.manifest.graph.requiredPaths ?? [],
        ),
        'one-part required path changes need a part-set study',
      );
    }
  }
}

export function encodeExperiment(
  definition: ExperimentDefinitionV1,
  registry: CapabilityRegistry,
): string {
  validateExperiment(definition, registry);
  const json = canonicalExperimentJson(definition);
  ensure(new TextEncoder().encode(json).length <= MAX_EXPERIMENT_JSON_BYTES, 'experiment size limit');
  return json;
}

export function decodeExperiment(
  json: string,
  registry: CapabilityRegistry,
): ExperimentDefinitionV1 {
  ensure(new TextEncoder().encode(json).length <= MAX_EXPERIMENT_JSON_BYTES, 'experiment size limit');
  const definition = JSON.parse(json) as ExperimentDefinitionV1;
  validateExperiment(definition, registry);
  return definition;
}

/** SHA-256 over canonical data; caller records the digest with the run. */
export async function experimentContentHash(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalExperimentJson(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export type ReferencePlatform = 'windows' | 'linux' | 'browser';
export type ReferenceBackendKind = 'cpu' | 'cuda' | 'wasm' | 'other';
export interface ReferenceBackendCapabilityV1 {
  readonly schemaVersion: typeof EXPERIMENT_VERSION;
  readonly id: string;
  readonly version: string;
  readonly buildHash: string;
  readonly kind: ReferenceBackendKind;
  readonly platform: ReferencePlatform;
  readonly device: string;
  readonly runtimeVersion: string;
  readonly driverVersion?: string;
  readonly cuda?: {
    readonly toolkitMajor: number;
    readonly computeCapability: string;
    readonly compiledTargets: readonly string[];
  };
  /** Set by actual provider preflight, not by the planned provider registry. */
  readonly available: boolean;
  readonly unavailableReason?: string;
  readonly precisions: readonly ReferencePrecision[];
  readonly solverFamilies: readonly string[];
  readonly tiers: readonly ReferenceTier[];
  readonly resources: ResourceLimitsV1;
  readonly reductionPolicy: string;
  readonly checkpointVersion: number | null;
  readonly serializationVersion: number;
}

export interface ReferenceBackendRequestV1 {
  readonly platform: ReferencePlatform;
  readonly preferredKind: ReferenceBackendKind;
  readonly allowCpuFallback: boolean;
  readonly precision: ReferencePrecision;
  readonly solverFamily: string;
  readonly tier: ReferenceTier;
  readonly resources: ResourceLimitsV1;
}

export type BackendSelectionV1 =
  | { readonly status: 'selected'; readonly backend: ReferenceBackendCapabilityV1 }
  | {
      readonly status: 'cpu-fallback';
      readonly backend: ReferenceBackendCapabilityV1;
      readonly reason: string;
    }
  | { readonly status: 'unavailable'; readonly reason: string };

/** Pure selection over provider-reported capabilities, never a hardware probe. */
export function selectReferenceBackend(
  request: ReferenceBackendRequestV1,
  candidates: readonly ReferenceBackendCapabilityV1[],
): BackendSelectionV1 {
  const compatible = (candidate: ReferenceBackendCapabilityV1) => {
    if (
      candidate.schemaVersion !== EXPERIMENT_VERSION ||
      !candidate.available ||
      candidate.platform !== request.platform ||
      !candidate.precisions.includes(request.precision) ||
      !candidate.solverFamilies.includes(request.solverFamily) ||
      !candidate.tiers.includes(request.tier)
    )
      return false;
    if (
      candidate.kind === 'cuda' &&
      (!candidate.cuda ||
        !candidate.driverVersion ||
        !candidate.cuda.compiledTargets.includes(candidate.cuda.computeCapability) ||
        (candidate.cuda.computeCapability === 'sm_61' &&
          candidate.cuda.toolkitMajor !== 12))
    )
      return false;
    return (
      candidate.resources.threads >= request.resources.threads &&
      candidate.resources.ramBytes >= request.resources.ramBytes &&
      candidate.resources.diskBytes >= request.resources.diskBytes &&
      candidate.resources.concurrentJobs >= request.resources.concurrentJobs &&
      (candidate.kind !== 'cuda' ||
        candidate.resources.vramBytes >= request.resources.vramBytes)
    );
  };
  const preferred = candidates.find(
    (candidate) => candidate.kind === request.preferredKind && compatible(candidate),
  );
  if (preferred) return { status: 'selected', backend: preferred };
  const reason = 'requested backend cannot satisfy platform, precision, solver or resource requirements';
  if (request.allowCpuFallback && request.preferredKind !== 'cpu') {
    const cpu = candidates.find(
      (candidate) => candidate.kind === 'cpu' && compatible(candidate),
    );
    if (cpu) return { status: 'cpu-fallback', backend: cpu, reason };
  }
  return { status: 'unavailable', reason };
}

export interface ReferenceRunV1 {
  readonly schemaVersion: typeof EXPERIMENT_VERSION;
  readonly runId: string;
  readonly studyManifestHash: string;
  readonly manifestHash: string;
  readonly experiment: ExperimentDefinitionV1;
  readonly variantId: string | null;
  readonly seed: number;
  readonly precision: ReferencePrecision;
  readonly numericalTolerances: JsonObject;
  readonly resources: ResourceLimitsV1;
}
export interface ReferenceArtifactV1 {
  readonly format: 'zip' | 'parquet' | 'hdf5';
  readonly contentHash: string;
  readonly schemaVersion: number;
  readonly location: string;
  readonly clockAndUnitMetadata: JsonObject;
}
export interface ReferenceRunResultV1 {
  readonly runId: string;
  readonly contentHash: string;
  readonly backend: ReferenceBackendCapabilityV1;
  readonly status: 'completed' | 'failed' | 'cancelled' | 'resource-failure';
  readonly confidence:
    | 'simulation-estimate'
    | 'numerically-validated'
    | 'measurement-compared';
  readonly numericalEvidence: JsonObject;
  readonly warnings: readonly string[];
  readonly artifacts: readonly ReferenceArtifactV1[];
}
export interface ReferenceCheckpointV1 {
  readonly runId: string;
  readonly manifestHash: string;
  readonly backendId: string;
  readonly backendVersion: string;
  readonly checkpointVersion: number;
  readonly contentHash: string;
  readonly location: string;
}
/** Trusted adapter, outside the browser audio thread; implementations are later work. */
export interface ReferenceComputeBackend {
  probe(): Promise<ReferenceBackendCapabilityV1>;
  preflight(run: ReferenceRunV1): Promise<readonly string[]>;
  run(
    run: ReferenceRunV1,
    emitBoundary: (sample: ReferenceBoundarySample) => void,
    signal: AbortSignal,
    checkpoint?: ReferenceCheckpointV1,
  ): Promise<ReferenceRunResultV1>;
  checkpoint?(runId: string): Promise<ReferenceCheckpointV1>;
}

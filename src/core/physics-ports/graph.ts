import {
  PORT_GRAPH_VERSION,
  PORT_SI_UNITS,
  type ComponentNodeV1,
  type PhysicalPort,
  type PortEndpoint,
  type PortGraphV1,
  type PortKind,
} from '../../contracts/ports/index.ts';
import { CapabilityRegistry } from './registry.ts';

const identifier = /^[a-z][a-z0-9-]{0,63}$/;
const physicalKinds: readonly PortKind[] = [
  'rotational',
  'electrical',
  'air',
  'fuel',
  'exhaustGas',
  'thermal',
  'control',
];

export class PortGraphError extends Error {
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = 'PortGraphError';
  }
}
function fail(path: string, reason: string): never {
  throw new PortGraphError(path, reason);
}
function id(value: unknown, path: string): string {
  if (typeof value !== 'string' || !identifier.test(value)) {
    fail(path, 'invalid identifier');
  }
  return value as string;
}
function boundedArray(
  value: unknown,
  min: number,
  max: number,
  path: string,
): readonly unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    fail(path, `expected ${min}-${max} items`);
  }
  return value as readonly unknown[];
}
function validatePort(port: PhysicalPort, path: string): void {
  id(port.id, `${path}.id`);
  if (!physicalKinds.includes(port.kind)) fail(path, 'unknown port kind');
  const units = PORT_SI_UNITS[port.kind];
  if (port.effortUnit !== units.effort || port.flowUnit !== units.flow) {
    fail(path, 'incompatible SI units');
  }
  if (!['in', 'out', 'bidirectional'].includes(port.direction)) {
    fail(path, 'invalid port direction');
  }
  if (typeof port.required !== 'boolean')
    fail(path, 'required must be boolean');
  if (
    port.maxConnections !== undefined &&
    (!Number.isSafeInteger(port.maxConnections) ||
      port.maxConnections < 1 ||
      port.maxConnections > 64)
  )
    fail(path, 'invalid connection limit');
  if (
    port.kind === 'air' ||
    port.kind === 'fuel' ||
    port.kind === 'exhaustGas'
  ) {
    if (port.pressureBasis !== 'absolute' && port.pressureBasis !== 'gauge') {
      fail(path, 'pressure basis required');
    }
    if (Object.hasOwn(port, 'signalType')) fail(path, 'signalType on gas port');
  } else if (Object.hasOwn(port, 'pressureBasis')) {
    fail(path, 'pressure basis on non-gas port');
  }
  if (port.kind === 'control') {
    id(port.signalType, `${path}.signalType`);
  } else if (Object.hasOwn(port, 'signalType')) {
    fail(path, 'signalType on physical port');
  }
}
function endpointKey(endpoint: PortEndpoint): string {
  return `${endpoint.componentId}/${endpoint.portId}`;
}
/**
 * Strict versioned graph validation; no simulation, no implicit conversion,
 * no free energy and no accidental promotion of planned providers.
 */
export function validatePortGraph(
  graph: PortGraphV1,
  registry: CapabilityRegistry,
): PortGraphV1 {
  if (!graph || graph.schemaVersion !== PORT_GRAPH_VERSION) {
    fail('graph.schemaVersion', 'unsupported version');
  }
  const components = boundedArray(
    graph.components,
    1,
    64,
    'graph.components',
  ) as readonly ComponentNodeV1[];
  const links = boundedArray(
    graph.links,
    0,
    256,
    'graph.links',
  ) as PortGraphV1['links'];
  const nodes = new Map<string, ComponentNodeV1>();
  const ports = new Map<string, PhysicalPort>();
  const counts = new Map<string, number>();
  for (const [i, node] of components.entries()) {
    const path = `graph.components[${i}]`;
    id(node.id, `${path}.id`);
    if (nodes.has(node.id)) fail(path, 'duplicate component id');
    nodes.set(node.id, node);
    try {
      registry.assertCompatible(node);
    } catch (error) {
      fail(path, error instanceof Error ? error.message : 'invalid provider');
    }
    for (const [j, raw] of boundedArray(
      node.ports,
      0,
      64,
      `${path}.ports`,
    ).entries()) {
      const port = raw as PhysicalPort;
      validatePort(port, `${path}.ports[${j}]`);
      const key = endpointKey({ componentId: node.id, portId: port.id });
      if (ports.has(key)) fail(path, 'duplicate port id');
      ports.set(key, port);
      counts.set(key, 0);
    }
  }
  const linkIds = new Set<string>();
  const linkPairs = new Set<string>();
  const adjacency = new Map<PortKind, Map<string, Set<string>>>();
  for (const [i, link] of links.entries()) {
    const path = `graph.links[${i}]`;
    id(link.id, `${path}.id`);
    if (linkIds.has(link.id)) fail(path, 'duplicate link id');
    linkIds.add(link.id);
    const aId = id(link.from?.componentId, `${path}.from.componentId`);
    const bId = id(link.to?.componentId, `${path}.to.componentId`);
    const aKey = endpointKey({
      componentId: aId,
      portId: id(link.from?.portId, `${path}.from.portId`),
    });
    const bKey = endpointKey({
      componentId: bId,
      portId: id(link.to?.portId, `${path}.to.portId`),
    });
    const a = ports.get(aKey);
    const b = ports.get(bKey);
    if (!a || !b) fail(path, 'orphan endpoint');
    if (aId === bId || aKey === bKey) fail(path, 'self connection');
    const pair = [aKey, bKey].sort().join('|');
    if (linkPairs.has(pair)) fail(path, 'duplicate physical connection');
    linkPairs.add(pair);
    if (a.kind !== b.kind) fail(path, 'port kind mismatch');
    if (a.effortUnit !== b.effortUnit || a.flowUnit !== b.flowUnit) {
      fail(path, 'port unit mismatch');
    }
    if (a.direction === 'in' || b.direction === 'out') {
      fail(path, 'port direction mismatch');
    }
    if (
      (a.kind === 'air' || a.kind === 'fuel' || a.kind === 'exhaustGas') &&
      a.pressureBasis !== b.pressureBasis
    )
      fail(path, 'pressure basis mismatch');
    if (a.kind === 'control' && a.signalType !== b.signalType) {
      fail(path, 'control signal type mismatch');
    }
    for (const [key, port] of [
      [aKey, a],
      [bKey, b],
    ] as const) {
      const next = (counts.get(key) ?? 0) + 1;
      if (next > (port.maxConnections ?? 1)) {
        fail(path, 'connection limit exceeded');
      }
      counts.set(key, next);
    }
    let byComponent = adjacency.get(a.kind);
    if (!byComponent) {
      byComponent = new Map();
      adjacency.set(a.kind, byComponent);
    }
    for (const [from, to] of [
      [aId, bId],
      [bId, aId],
    ] as const) {
      const neighbours = byComponent.get(from) ?? new Set<string>();
      neighbours.add(to);
      byComponent.set(from, neighbours);
    }
  }
  for (const [key, port] of ports) {
    if (port.required && counts.get(key) === 0)
      fail(key, 'required port disconnected');
  }
  for (const [i, requiredPath] of (graph.requiredPaths ?? []).entries()) {
    const path = `graph.requiredPaths[${i}]`;
    const from = id(requiredPath.fromComponentId, `${path}.fromComponentId`);
    const to = id(requiredPath.toComponentId, `${path}.toComponentId`);
    if (!nodes.has(from) || !nodes.has(to))
      fail(path, 'unknown path component');
    if (!physicalKinds.includes(requiredPath.kind))
      fail(path, 'unknown path kind');
    const adjacencyForKind = adjacency.get(requiredPath.kind);
    const visited = new Set([from]);
    const queue = [from];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const next of adjacencyForKind?.get(current) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    if (from === to || !visited.has(to))
      fail(path, 'missing required physical path');
  }
  return graph;
}

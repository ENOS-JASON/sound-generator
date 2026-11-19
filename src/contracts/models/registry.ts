import { CapabilityRegistry } from '../../core/physics-ports/registry.ts';
import {
  MODEL_FAMILIES,
  MODEL_INTERFACE_VERSION,
  type ModelFamily,
  type ModelIdentity,
  type ModelInstanceMap,
} from './index.ts';
import type {
  CapabilityDescriptor,
  ComponentNodeV1,
  PhysicalPort,
} from '../ports/index.ts';

export interface ModelProviderRegistration<F extends ModelFamily> {
  readonly family: F;
  readonly descriptor: CapabilityDescriptor;
  /** Absent for planned/unsupported providers; never supply a fake fallback. */
  readonly create?: (componentId: string) => ModelInstanceMap[F];
}

function samePorts(
  actual: readonly PhysicalPort[],
  declared: readonly PhysicalPort[],
): boolean {
  return (
    actual.length === declared.length &&
    actual.every((port, i) => {
      const expected = declared[i];
      return (
        expected !== undefined &&
        port.id === expected.id &&
        port.kind === expected.kind &&
        port.direction === expected.direction &&
        port.required === expected.required &&
        port.maxConnections === expected.maxConnections &&
        port.effortUnit === expected.effortUnit &&
        port.flowUnit === expected.flowUnit &&
        ('pressureBasis' in port ? port.pressureBasis : undefined) ===
          ('pressureBasis' in expected ? expected.pressureBasis : undefined) &&
        ('signalType' in port ? port.signalType : undefined) ===
          ('signalType' in expected ? expected.signalType : undefined)
      );
    })
  );
}

/**
 * Type-safe, per-run adapter over the accepted AG-M0-04 CapabilityRegistry.
 * A family binding does not change graph IDs, statuses or support semantics.
 */
export class ModelProviderRegistry {
  readonly #capabilities = new CapabilityRegistry();
  readonly #families = new Map<string, ModelFamily>();

  register<F extends ModelFamily>(entry: ModelProviderRegistration<F>): void {
    if (!MODEL_FAMILIES.includes(entry.family)) {
      throw new TypeError(`unknown model family: ${entry.family}`);
    }
    this.#capabilities.register({
      descriptor: entry.descriptor,
      ...(entry.create === undefined ? {} : { create: entry.create }),
    });
    this.#families.set(entry.descriptor.providerId, entry.family);
  }

  describe(providerId: string): CapabilityDescriptor {
    return this.#capabilities.describe(providerId);
  }

  instantiate<F extends ModelFamily>(
    family: F,
    node: ComponentNodeV1,
  ): ModelInstanceMap[F] {
    if (this.#families.get(node.providerId) !== family) {
      throw new Error(`${node.providerId}: model family mismatch (${family})`);
    }
    this.#capabilities.assertCompatible(node);
    const instance = this.#capabilities.create(
      node.providerId,
      node.operatingDomain,
      node.id,
    );
    if (
      !instance ||
      typeof instance !== 'object' ||
      !('ports' in instance) ||
      !Array.isArray(instance.ports)
    ) {
      throw new TypeError(`${node.providerId}: invalid model instance`);
    }
    const identity = instance as ModelIdentity<F>;
    if (
      identity.interfaceVersion !== MODEL_INTERFACE_VERSION ||
      identity.family !== family ||
      identity.componentId !== node.id ||
      !samePorts(identity.ports, node.ports)
    ) {
      throw new Error(`${node.providerId}: model identity/ports mismatch`);
    }
    return instance as ModelInstanceMap[F];
  }
}

import type {
  CapabilityDescriptor,
  ComponentNodeV1,
  ProviderRegistration,
  SupportDomain,
} from '../../contracts/ports/index.ts';
import type { ModelSupport } from '../../contracts/vehicle-definition.ts';

const identifier = /^[a-z][a-z0-9-]{0,63}$/;
const supports: readonly ModelSupport[] = [
  'implemented',
  'approximate',
  'planned',
  'unsupported',
];

function validId(value: string, label: string): void {
  if (typeof value !== 'string' || !identifier.test(value)) {
    throw new TypeError(`${label}: invalid identifier`);
  }
}

function validVersion(version: number): void {
  if (!Number.isSafeInteger(version) || version < 1 || version > 65535) {
    throw new RangeError('componentSchemaVersion: invalid version');
  }
}

interface StoredProvider {
  readonly descriptor: CapabilityDescriptor;
  readonly create?: (componentId: string) => unknown;
}

/**
 * Per-simulation registry, never a global singleton. Registration is explicit;
 * a planned/unsupported technology can be inspected but never instantiated.
 */
export class CapabilityRegistry {
  readonly #providers = new Map<string, StoredProvider>();

  register<T>(registration: ProviderRegistration<T>): void {
    const { descriptor, create } = registration;
    validId(descriptor.providerId, 'providerId');
    validId(descriptor.kind, 'kind');
    validVersion(descriptor.componentSchemaVersion);
    if (this.#providers.has(descriptor.providerId)) {
      throw new Error(`providerId: duplicate ${descriptor.providerId}`);
    }
    if (!Array.isArray(descriptor.support) || descriptor.support.length === 0) {
      throw new Error('support: at least one operating domain is required');
    }
    if (!Array.isArray(descriptor.capabilities)) {
      throw new TypeError('capabilities: expected array');
    }
    const capabilities = new Set<string>();
    for (const capability of descriptor.capabilities) {
      validId(capability, 'capability');
      if (capabilities.has(capability)) {
        throw new Error(`capabilities: duplicate ${capability}`);
      }
      capabilities.add(capability);
    }
    const domains = new Set<string>();
    const support: SupportDomain[] = descriptor.support.map((entry) => {
      validId(entry.domain, 'support.domain');
      if (domains.has(entry.domain)) {
        throw new Error(`support: duplicate domain ${entry.domain}`);
      }
      domains.add(entry.domain);
      if (!supports.includes(entry.status)) {
        throw new Error('support.status: invalid support level');
      }
      if (entry.note !== undefined && typeof entry.note !== 'string') {
        throw new TypeError('support.note: expected string');
      }
      return Object.freeze({ ...entry });
    });
    if (
      support.some(
        (entry) =>
          entry.status === 'implemented' || entry.status === 'approximate',
      ) &&
      typeof create !== 'function'
    ) {
      throw new Error('runnable capability requires an explicit factory');
    }
    this.#providers.set(descriptor.providerId, {
      descriptor: Object.freeze({
        providerId: descriptor.providerId,
        kind: descriptor.kind,
        componentSchemaVersion: descriptor.componentSchemaVersion,
        capabilities: Object.freeze([...capabilities]),
        support: Object.freeze(support),
      }),
      ...(create === undefined ? {} : { create }),
    });
  }

  describe(providerId: string): CapabilityDescriptor {
    const entry = this.#providers.get(providerId);
    if (!entry) throw new Error(`unknown provider: ${providerId}`);
    return entry.descriptor;
  }

  assertCompatible(node: ComponentNodeV1): void {
    const descriptor = this.describe(node.providerId);
    if (
      node.kind !== descriptor.kind ||
      node.componentSchemaVersion !== descriptor.componentSchemaVersion
    ) {
      throw new Error(`${node.id}: provider kind or version mismatch`);
    }
    const status = descriptor.support.find(
      (entry) => entry.domain === node.operatingDomain,
    )?.status;
    if (!status || status !== node.modelSupport) {
      throw new Error(`${node.id}: provider operating domain/support mismatch`);
    }
    for (const capability of node.requiredCapabilities ?? []) {
      if (!descriptor.capabilities.includes(capability)) {
        throw new Error(`${node.id}: missing capability ${capability}`);
      }
    }
  }

  create(
    providerId: string,
    operatingDomain: string,
    componentId: string,
  ): unknown {
    validId(componentId, 'componentId');
    const entry = this.#providers.get(providerId);
    if (!entry) throw new Error(`unknown provider: ${providerId}`);
    const support = entry.descriptor.support.find(
      (item) => item.domain === operatingDomain,
    );
    if (
      !support ||
      (support.status !== 'implemented' && support.status !== 'approximate') ||
      !entry.create
    ) {
      throw new Error(
        `${providerId}: technology unavailable for ${operatingDomain}`,
      );
    }
    return entry.create(componentId);
  }
}

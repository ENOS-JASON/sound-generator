import type { ModelSupport } from '../vehicle-definition';

/** Graph contract is additive to VehicleDefinitionV2 (ADR-003), not a v2 migration. */
export const PORT_GRAPH_VERSION = 1 as const;

/** Effort x flow is power for physical ports; control ports convey no energy. */
export const PORT_SI_UNITS = {
  rotational: { effort: 'N*m', flow: 'rad/s' },
  electrical: { effort: 'V', flow: 'A' },
  air: { effort: 'Pa', flow: 'kg/s' },
  fuel: { effort: 'Pa', flow: 'kg/s' },
  exhaustGas: { effort: 'Pa', flow: 'kg/s' },
  thermal: { effort: 'K', flow: 'W' },
  control: { effort: '1', flow: '1' },
} as const;

export type PortKind = keyof typeof PORT_SI_UNITS;
export type PortDirection = 'in' | 'out' | 'bidirectional';
export type PressureBasis = 'absolute' | 'gauge';
type GasPortKind = 'air' | 'fuel' | 'exhaustGas';

interface PortBase {
  readonly id: string;
  readonly direction: PortDirection;
  /** Required ports must be connected for a topology to be valid. */
  readonly required: boolean;
  /** Defaults to one. Multi-branch junctions opt in explicitly. */
  readonly maxConnections?: number;
}

export type PhysicalPort = {
  [K in PortKind]: PortBase & {
    readonly kind: K;
    readonly effortUnit: (typeof PORT_SI_UNITS)[K]['effort'];
    readonly flowUnit: (typeof PORT_SI_UNITS)[K]['flow'];
  } & (K extends GasPortKind
      ? { readonly pressureBasis: PressureBasis; readonly signalType?: never }
      : K extends 'control'
        ? { readonly signalType: string; readonly pressureBasis?: never }
        : { readonly pressureBasis?: never; readonly signalType?: never });
}[PortKind];

export interface PortEndpoint {
  readonly componentId: string;
  readonly portId: string;
}

export interface PortLinkV1 {
  readonly id: string;
  /** Oriented for validation: 'out' or 'bidirectional'. */
  readonly from: PortEndpoint;
  /** Oriented for validation: 'in' or 'bidirectional'. */
  readonly to: PortEndpoint;
}

export interface ComponentNodeV1 {
  readonly id: string;
  readonly kind: string;
  readonly providerId: string;
  readonly componentSchemaVersion: number;
  readonly operatingDomain: string;
  readonly modelSupport: ModelSupport;
  readonly requiredCapabilities?: readonly string[];
  readonly ports: readonly PhysicalPort[];
}

export interface RequiredPathV1 {
  readonly fromComponentId: string;
  readonly toComponentId: string;
  readonly kind: PortKind;
}

export interface PortGraphV1 {
  readonly schemaVersion: typeof PORT_GRAPH_VERSION;
  readonly components: readonly ComponentNodeV1[];
  readonly links: readonly PortLinkV1[];
  /** A physical connection requirement; not a substitute for a coupled solver. */
  readonly requiredPaths?: readonly RequiredPathV1[];
}

export interface SupportDomain {
  readonly domain: string;
  readonly status: ModelSupport;
  readonly note?: string;
}

export interface CapabilityDescriptor {
  readonly providerId: string;
  readonly kind: string;
  readonly componentSchemaVersion: number;
  readonly capabilities: readonly string[];
  /** A provider may be implemented in one domain and planned in another. */
  readonly support: readonly SupportDomain[];
}

export interface ProviderRegistration<T = unknown> {
  readonly descriptor: CapabilityDescriptor;
  /** No factory is allowed as an implicit fallback for planned technologies. */
  readonly create?: (componentId: string) => T;
}

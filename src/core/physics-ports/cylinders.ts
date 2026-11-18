import type { VehicleDefinitionV2 } from '../../contracts/vehicle-definition.ts';

type EngineBanks = Pick<VehicleDefinitionV2['engine'], 'banks' | 'firingOrder'>;

export interface CylinderPosition {
  readonly cylinderId: number;
  readonly bankId: string;
  readonly positionInBank: number;
  /** Order-based firing event offset in a 720-degree four-stroke cycle. */
  readonly firingPhaseRadians: number;
}

export interface CylinderBankLayout {
  readonly bankId: string;
  readonly angleRadians: number;
  readonly cylinderIds: readonly number[];
}

export interface CylinderTopology {
  readonly cycleRadians: number;
  readonly banks: readonly CylinderBankLayout[];
  readonly cylinders: readonly CylinderPosition[];
}

/**
 * Physical bank identity is independent from firing order and solver mesh.
 * This maps 1-12 cylinders to a 720-degree event-cycle reference; real
 * crank geometry, firing intervals and derived displacement belong to M1/M0-07.
 */
export function defineCylinderTopology(engine: EngineBanks): CylinderTopology {
  if (
    !Array.isArray(engine.banks) ||
    engine.banks.length < 1 ||
    engine.banks.length > 12
  ) {
    throw new RangeError('banks: expected 1-12 physical banks');
  }
  const positions = new Map<number, { bankId: string; position: number }>();
  const bankIds = new Set<string>();
  let count = 0;
  for (const bank of engine.banks) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(bank.id) || bankIds.has(bank.id)) {
      throw new Error('bank: invalid or duplicate id');
    }
    bankIds.add(bank.id);
    if (
      !Number.isFinite(bank.angleRadians) ||
      Math.abs(bank.angleRadians) > Math.PI ||
      bank.cylinderIds.length === 0
    ) {
      throw new RangeError('bank: invalid angle or empty cylinders');
    }
    for (const [position, cylinderId] of bank.cylinderIds.entries()) {
      if (
        !Number.isSafeInteger(cylinderId) ||
        cylinderId < 1 ||
        cylinderId > 12 ||
        positions.has(cylinderId)
      ) {
        throw new RangeError('cylinder: invalid or duplicate cylinder id');
      }
      positions.set(cylinderId, { bankId: bank.id, position });
      count++;
    }
  }
  if (
    count > 12 ||
    !Array.isArray(engine.firingOrder) ||
    engine.firingOrder.length !== count ||
    new Set(engine.firingOrder).size !== count ||
    engine.firingOrder.some((id) => !positions.has(id))
  ) {
    throw new RangeError('firingOrder: expected permutation of 1-12 cylinders');
  }
  const phaseById = new Map(
    engine.firingOrder.map((id, position) => [
      id,
      (position * 4 * Math.PI) / count,
    ]),
  );
  return {
    cycleRadians: 4 * Math.PI,
    banks: engine.banks.map((bank) => ({
      bankId: bank.id,
      angleRadians: bank.angleRadians,
      cylinderIds: [...bank.cylinderIds],
    })),
    cylinders: [...positions.entries()].map(([cylinderId, position]) => ({
      cylinderId,
      bankId: position.bankId,
      positionInBank: position.position,
      firingPhaseRadians: phaseById.get(cylinderId)!,
    })),
  };
}

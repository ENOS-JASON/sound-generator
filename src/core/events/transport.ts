import {
  assertDomainAuthority,
  validateDomainEvent,
} from '../../contracts/events/index.ts';
import type {
  CommandEnvelope,
  DiagnosticEvent,
  DomainAuthority,
  DomainEvent,
  EventType,
  StateSnapshot,
} from '../../contracts/events/index.ts';

export interface DomainBatch {
  readonly schemaVersion: 1;
  readonly runId: string;
  readonly events: readonly DomainEvent[];
}

export interface DomainCursor {
  readonly runId: string;
  readonly sequence: number;
  readonly simulationTick: number;
  readonly simulationTimeSeconds: number;
  readonly valid: boolean;
}

export function newDomainCursor(runId: string): DomainCursor {
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(runId)) {
    throw new Error('invalid run ID');
  }
  return Object.freeze({
    runId,
    sequence: 0,
    simulationTick: 0,
    simulationTimeSeconds: 0,
    valid: true,
  });
}

export type BatchResult =
  | {
      readonly status: 'accepted';
      readonly cursor: DomainCursor;
      readonly events: readonly DomainEvent[];
    }
  | {
      readonly status: 'stale-run' | 'duplicate' | 'resync-required';
      readonly cursor: DomainCursor;
    }
  | {
      readonly status: 'invalid';
      readonly cursor: DomainCursor;
      readonly diagnostic: 'EVENT_STREAM_GAP' | 'QUEUE_OVERFLOW';
      readonly reason: string;
    };

/** Atomic bounded validation, not an event dispatcher or a MessagePort bridge. */
export function inspectDomainBatch(
  input: unknown,
  cursor: DomainCursor,
  authority: DomainAuthority,
  maxEvents: number,
): BatchResult {
  if (!Number.isSafeInteger(maxEvents) || maxEvents < 1 || maxEvents > 1024) {
    throw new Error('maxEvents must be in [1, 1024]');
  }
  if (authority.runId !== cursor.runId) {
    throw new Error('authority/cursor run mismatch');
  }
  const invalid = (
    reason: string,
    diagnostic: 'EVENT_STREAM_GAP' | 'QUEUE_OVERFLOW' = 'EVENT_STREAM_GAP',
  ): BatchResult => ({
    status: 'invalid',
    cursor: Object.freeze({ ...cursor, valid: false }),
    diagnostic,
    reason,
  });
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return invalid('invalid domain batch');
  }
  const batch = input as Record<string, unknown>;
  if (
    Object.keys(batch).length !== 3 ||
    !Object.hasOwn(batch, 'schemaVersion') ||
    !Object.hasOwn(batch, 'runId') ||
    !Object.hasOwn(batch, 'events') ||
    batch.schemaVersion !== 1 ||
    typeof batch.runId !== 'string' ||
    !/^[a-z][a-z0-9-]{0,63}$/.test(batch.runId)
  ) {
    return invalid('invalid domain batch header');
  }
  if (batch.runId !== cursor.runId) {
    return { status: 'stale-run', cursor };
  }
  if (!cursor.valid) return { status: 'resync-required', cursor };
  if (!Array.isArray(batch.events) || batch.events.length === 0) {
    return invalid('invalid domain batch events');
  }
  if (batch.events.length > maxEvents) {
    return invalid('critical batch exceeds capacity', 'QUEUE_OVERFLOW');
  }
  const events: DomainEvent[] = [];
  let previous: DomainEvent | undefined;
  try {
    for (const value of batch.events) {
      const event = validateDomainEvent(value);
      assertDomainAuthority(event, authority);
      if (
        previous &&
        (event.sequence !== previous.sequence + 1 ||
          event.simulationTick < previous.simulationTick ||
          event.simulationTimeSeconds < previous.simulationTimeSeconds ||
          (event.simulationTick === previous.simulationTick &&
            event.simulationTimeSeconds !== previous.simulationTimeSeconds))
      ) {
        return invalid('noncontiguous or regressing domain batch');
      }
      events.push(event);
      previous = event;
    }
  } catch (error) {
    return invalid(error instanceof Error ? error.message : 'invalid event');
  }
  const first = events[0];
  const last = events[events.length - 1];
  if (!first || !last) return invalid('empty validated batch');
  if (last.sequence <= cursor.sequence) {
    return { status: 'duplicate', cursor };
  }
  if (
    first.sequence !== cursor.sequence + 1 ||
    first.simulationTick < cursor.simulationTick ||
    first.simulationTimeSeconds < cursor.simulationTimeSeconds ||
    (cursor.sequence !== 0 &&
      first.simulationTick === cursor.simulationTick &&
      first.simulationTimeSeconds !== cursor.simulationTimeSeconds)
  ) {
    return invalid('domain sequence gap, overlap or clock regression');
  }
  return {
    status: 'accepted',
    cursor: Object.freeze({
      runId: cursor.runId,
      sequence: last.sequence,
      simulationTick: last.simulationTick,
      simulationTimeSeconds: last.simulationTimeSeconds,
      valid: true,
    }),
    events: Object.freeze(events),
  };
}

export type Unsubscribe = () => void;

export interface DomainSubscriptions {
  /** Dispatch in authoritative sequence order; dispose on reset/unmount. */
  subscribe<K extends EventType>(
    type: K,
    listener: (event: DomainEvent<K>) => void,
  ): Unsubscribe;
  dispose(): void;
}

export interface TransportLimits {
  readonly maxCriticalMessages: number;
  readonly maxBatchEvents: number;
  readonly maxPendingSnapshots: number;
}

export type CriticalMessage = DomainBatch | DiagnosticEvent | CommandEnvelope;
export type CriticalSendResult =
  | { readonly status: 'accepted' }
  | {
      readonly status: 'overflow' | 'closed';
      readonly traceInvalid: true;
    };

export interface EventTransport<TState extends object> {
  readonly limits: TransportLimits;
  /** Acknowledgements and domain edges may not be silently dropped. */
  sendCritical(message: CriticalMessage): CriticalSendResult;
  /** Replaceable telemetry reports the number of coalesced observations. */
  sendSnapshot(
    snapshot: StateSnapshot<TState>,
  ): { readonly coalesced: number } | { readonly status: 'closed' };
  close(): void;
}

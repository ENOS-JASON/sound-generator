import type {
  CommandEnvelope,
  DiagnosticEvent,
  DomainEvent,
  EventType,
} from './index.ts';

type Assert<T extends true> = T;

/** Compiled by the normal strict project typecheck. */
export type EventContractAssertions = [
  Assert<'RUN_PAUSED' extends EventType ? false : true>,
  Assert<'REV_LIMIT_ENTER' extends EventType ? false : true>,
  Assert<
    DomainEvent<'COMBUSTION'>['payload'] extends {
      readonly cylinderId: number;
    }
      ? true
      : false
  >,
  Assert<
    { fraction: string } extends CommandEnvelope<'SET_THROTTLE'>['payload']
      ? false
      : true
  >,
  Assert<DiagnosticEvent extends DomainEvent ? false : true>,
  Assert<CommandEnvelope extends DomainEvent ? false : true>,
];

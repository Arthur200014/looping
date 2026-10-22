import { SCHEMA_VERSION, type RoomState } from './RoomState.js';

export interface EventHeader {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly roomId: string;
  readonly sessionId: string;
  readonly eventId: string;
  readonly actorId: string;
  /** Compare-and-swap. Prevents out-of-order/stale clients overwriting newer state. */
  readonly expectedRevision: number;
}

export type RoomCommand =
  | { readonly type: 'participant.join' }
  | { readonly type: 'participant.leave' }
  | { readonly type: 'navigation.go'; readonly chapterIndex: number; readonly stationId: string }
  | { readonly type: 'activity.answer.set'; readonly fieldId: string; readonly value: string }
  | { readonly type: 'activity.choice.set'; readonly choiceId: string; readonly optionId: string }
  | { readonly type: 'session.reset' };

export type RoomEvent = EventHeader & RoomCommand;
export type RejectReason = 'duplicate' | 'stale' | 'invalid' | 'forbidden';
export type ApplyResult =
  | { readonly accepted: true; readonly state: RoomState }
  | { readonly accepted: false; readonly reason: RejectReason; readonly state: RoomState };

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 256;
}

/** Pure reducer: does not mutate inputs; deterministic for an ordered event log. */
export function reduceRoomEvent(state: RoomState, event: RoomEvent): ApplyResult {
  const rejected = (reason: RejectReason): ApplyResult => ({ accepted: false, reason, state });
  if (event.schemaVersion !== SCHEMA_VERSION || event.roomId !== state.roomId ||
      event.sessionId !== state.sessionId || !validId(event.eventId) || !validId(event.actorId) ||
      !Number.isSafeInteger(event.expectedRevision) || event.expectedRevision < 0) return rejected('invalid');
  const participant = state.participants[event.actorId];
  if (!Object.hasOwn(state.participants, event.actorId) || !participant) return rejected('forbidden');
  if (state.appliedEventIds.includes(event.eventId)) return rejected('duplicate');
  if (event.expectedRevision !== state.revision) return rejected('stale');

  const teacher = participant.role === 'teacher';
  let patch: Partial<RoomState>;
  switch (event.type) {
    case 'participant.join':
      if (participant.connected) return rejected('invalid');
      patch = { participants: { ...state.participants,
        [event.actorId]: { ...participant, connected: true } } };
      break;
    case 'participant.leave':
      if (!participant.connected) return rejected('invalid');
      patch = { participants: { ...state.participants,
        [event.actorId]: { ...participant, connected: false } } };
      break;
    case 'navigation.go':
      if (!teacher || !participant.connected) return rejected('forbidden');
      if (!Number.isSafeInteger(event.chapterIndex) || event.chapterIndex < 0 || !validId(event.stationId)) {
        return rejected('invalid');
      }
      patch = { navigation: { chapterIndex: event.chapterIndex, stationId: event.stationId } };
      break;
    case 'activity.answer.set':
      if (!participant.connected) return rejected('forbidden');
      if (!validId(event.fieldId) || typeof event.value !== 'string' || event.value.length > 10000) {
        return rejected('invalid');
      }
      patch = { answers: { ...state.answers,
        [event.actorId]: { ...state.answers[event.actorId], [event.fieldId]: event.value } } };
      break;
    case 'activity.choice.set':
      if (!participant.connected) return rejected('forbidden');
      if (!validId(event.choiceId) || !validId(event.optionId)) return rejected('invalid');
      patch = { choices: { ...state.choices,
        [event.actorId]: { ...state.choices[event.actorId], [event.choiceId]: event.optionId } } };
      break;
    case 'session.reset':
      if (!teacher || !participant.connected) return rejected('forbidden');
      patch = { navigation: { ...state.initialNavigation },
        answers: {}, choices: {}, attempt: state.attempt + 1 };
      break;
    default:
      return rejected('invalid');
  }
  return { accepted: true, state: {
    ...state, ...patch, revision: state.revision + 1,
    appliedEventIds: [...state.appliedEventIds, event.eventId],
  } };
}

/** Reconstructs a room by applying only accepted events in original commit order. */
export function replayRoomEvents(initial: RoomState, events: readonly RoomEvent[]): RoomState {
  let state = initial;
  for (const event of events) {
    const result = reduceRoomEvent(state, event);
    if (!result.accepted) throw new Error(`Invalid replay event ${event.eventId}: ${result.reason}`);
    state = result.state;
  }
  return state;
}

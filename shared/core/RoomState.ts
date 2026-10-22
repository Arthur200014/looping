/** B1 room state is serializable data: no DOM nodes, transport handles or functions. */
export const SCHEMA_VERSION = 1 as const;
export type Role = 'teacher' | 'student';

export interface Participant {
  readonly role: Role;
  readonly connected: boolean;
}

export interface Navigation {
  readonly chapterIndex: number; // zero is a real chapter, never a falsy sentinel
  readonly stationId: string;
}

export interface RoomState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly roomId: string;
  readonly sessionId: string;
  /** Increments exactly once per accepted event. */
  readonly revision: number;
  /** Increments once per teacher reset; old answers and choices are discarded. */
  readonly attempt: number;
  readonly navigation: Navigation;
  readonly initialNavigation: Navigation;
  /** Stable, trusted roster; join/leave updates connected, never assigns roles. */
  readonly participants: Readonly<Record<string, Participant>>;
  readonly answers: Readonly<Record<string, Readonly<Record<string, string>>>>;
  readonly choices: Readonly<Record<string, Readonly<Record<string, string>>>>;
  /** B1 deduplication ledger. Must be compacted atomically with snapshots by a future server. */
  readonly appliedEventIds: readonly string[];
}

export interface RoomConfig {
  roomId: string;
  sessionId: string;
  roles: Readonly<Record<string, Role>>;
  initialStationId?: string;
}

export function createRoomState(config: RoomConfig): RoomState {
  if (!config.roomId.trim() || !config.sessionId.trim()) throw new Error('Room and session IDs are required');
  const roster = Object.entries(config.roles);
  if (roster.length === 0 || roster.filter(([, role]) => role === 'teacher').length !== 1) {
    throw new Error('A room needs exactly one pre-authorized teacher');
  }
  if (roster.some(([id, role]) => !id.trim() || (role !== 'teacher' && role !== 'student'))) {
    throw new Error('Invalid participant roster');
  }
  const stationId = config.initialStationId ?? 'intro';
  if (!stationId.trim()) throw new Error('Initial station ID is required');
  return {
    schemaVersion: SCHEMA_VERSION,
    roomId: config.roomId,
    sessionId: config.sessionId,
    revision: 0,
    attempt: 1,
    navigation: { chapterIndex: 0, stationId },
    initialNavigation: { chapterIndex: 0, stationId },
    participants: Object.fromEntries(roster.map(([id, role]) => [id, { role, connected: false }])),
    answers: {},
    choices: {},
    appliedEventIds: [],
  };
}

/** Isolated snapshot, even when a caller mutates a received object. */
export function cloneRoomState(state: RoomState): RoomState {
  return structuredClone(state);
}

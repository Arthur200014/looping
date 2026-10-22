import { cloneRoomState, type RoomState } from '../core/RoomState.js';
import { reduceRoomEvent, type ApplyResult, type RoomCommand, type RoomEvent } from '../core/reducer.js';

/** Client-facing transport contract; no DOM/browser globals or backend implementation. */
export interface RoomTransport {
  connect(): RoomState;
  subscribe(listener: (state: RoomState) => void): () => void;
  getSnapshot(): RoomState;
  dispatch(command: RoomCommand, expectedRevision: number): ApplyResult;
  publish(event: RoomEvent): ApplyResult;
  disconnect(): void;
}

/** Deterministic in-process authority; NOT a network service and NOT production auth. */
export class InMemoryRoomHub {
  private state: RoomState;
  private readonly initial: RoomState;
  private readonly history: RoomEvent[] = [];
  private readonly connected = new Map<string, InMemoryTransport>();
  private readonly listeners = new Map<InMemoryTransport, Set<(state: RoomState) => void>>();
  private readonly eventCounters = new Map<string, number>();

  constructor(initial: RoomState) {
    this.initial = cloneRoomState(initial);
    this.state = cloneRoomState(initial);
  }

  createClient(actorId: string): InMemoryTransport {
    if (!Object.hasOwn(this.initial.participants, actorId)) throw new Error('Actor not registered in room');
    return new InMemoryTransport(this, actorId);
  }

  getSnapshot(): RoomState { return cloneRoomState(this.state); }
  getInitialState(): RoomState { return cloneRoomState(this.initial); }
  getHistory(): RoomEvent[] { return structuredClone(this.history); }
  getSubscriberCount(): number {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0);
  }
  getConnectedCount(): number { return this.connected.size; }

  /** Internal authority methods; not a security boundary if given to untrusted code. */
  acquire(client: InMemoryTransport): void {
    if (this.connected.has(client.actorId)) throw new Error('Actor already connected');
    this.connected.set(client.actorId, client);
    this.listeners.set(client, new Set());
  }
  release(client: InMemoryTransport): void {
    if (this.connected.get(client.actorId) === client) {
      this.connected.delete(client.actorId);
      this.listeners.delete(client);
    }
  }
  addListener(client: InMemoryTransport, listener: (state: RoomState) => void): () => void {
    const listeners = this.listeners.get(client);
    if (!listeners) throw new Error('Connect before subscribing');
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  stamp(actorId: string, command: RoomCommand, expectedRevision: number): RoomEvent {
    const counter = (this.eventCounters.get(actorId) ?? 0) + 1;
    this.eventCounters.set(actorId, counter);
    return { ...command, schemaVersion: 1, roomId: this.state.roomId, sessionId: this.state.sessionId,
      actorId, expectedRevision, eventId: `${actorId}:${counter}` };
  }
  apply(event: RoomEvent): ApplyResult {
    const result = reduceRoomEvent(this.state, event);
    if (result.accepted) {
      this.state = result.state;
      this.history.push(structuredClone(event));
      for (const listeners of this.listeners.values()) {
        for (const listener of listeners) {
          // Observers are not allowed to interrupt the authoritative event commit.
          try { listener(cloneRoomState(this.state)); } catch { /* presentation listener is isolated */ }
        }
      }
    }
    return { ...result, state: cloneRoomState(result.state) };
  }
}

/** One actor, one independently isolated subscription/connection. */
export class InMemoryTransport implements RoomTransport {
  private online = false;
  private readonly unsubscribers = new Set<() => void>();
  constructor(private readonly hub: InMemoryRoomHub, readonly actorId: string) {}

  connect(): RoomState {
    if (this.online) return this.getSnapshot();
    this.hub.acquire(this);
    this.online = true;
    const result = this.hub.apply(this.hub.stamp(this.actorId, { type: 'participant.join' }, this.hub.getSnapshot().revision));
    if (!result.accepted) {
      this.online = false;
      this.hub.release(this);
      throw new Error(`Cannot connect: ${result.reason}`);
    }
    return this.getSnapshot();
  }

  subscribe(listener: (state: RoomState) => void): () => void {
    if (!this.online) throw new Error('Connect before subscribing');
    const unsubscribe = this.hub.addListener(this, listener);
    let active = true;
    const cleanup = () => {
      if (!active) return;
      active = false;
      unsubscribe();
      this.unsubscribers.delete(cleanup);
    };
    this.unsubscribers.add(cleanup);
    return cleanup;
  }

  getSnapshot(): RoomState { return this.hub.getSnapshot(); }

  dispatch(command: RoomCommand, expectedRevision: number): ApplyResult {
    if (!this.online) throw new Error('Connect before dispatch');
    return this.publish(this.hub.stamp(this.actorId, command, expectedRevision));
  }

  publish(event: RoomEvent): ApplyResult {
    if (!this.online) throw new Error('Connect before publishing');
    if (event.actorId !== this.actorId) throw new Error('Cannot impersonate another actor');
    return this.hub.apply(event);
  }

  disconnect(): void {
    if (!this.online) return;
    for (const cleanup of [...this.unsubscribers]) cleanup();
    const result = this.hub.apply(this.hub.stamp(this.actorId, { type: 'participant.leave' }, this.hub.getSnapshot().revision));
    this.online = false;
    this.hub.release(this);
    if (!result.accepted) throw new Error(`Cannot disconnect: ${result.reason}`);
  }
}

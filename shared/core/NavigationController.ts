import { cloneRoomState, type RoomState } from './RoomState.js';
import { type ApplyResult, type RoomCommand } from './reducer.js';
import { type RoomTransport } from '../sync/InMemoryTransport.js';

/** Stable per-client room controller. A view may subscribe without creating new transport listeners. */
export class NavigationController {
  private state: RoomState | null = null;
  private unsubscribeTransport: (() => void) | null = null;
  private readonly subscribers = new Set<(state: RoomState) => void>();

  constructor(private readonly transport: RoomTransport) {}

  start(): RoomState {
    if (this.unsubscribeTransport) return this.getState();
    this.state = this.transport.connect();
    this.unsubscribeTransport = this.transport.subscribe(state => {
      // No side-effects when navigating: only refresh the independent client snapshot.
      if (this.state && state.revision <= this.state.revision) return;
      this.state = cloneRoomState(state);
      for (const subscriber of this.subscribers) subscriber(this.getState());
    });
    this.state = this.transport.getSnapshot();
    return this.getState();
  }

  getState(): RoomState {
    if (!this.state) throw new Error('Start the controller first');
    return cloneRoomState(this.state);
  }

  subscribe(listener: (state: RoomState) => void): () => void {
    if (!this.state) throw new Error('Start the controller first');
    this.subscribers.add(listener);
    return () => { this.subscribers.delete(listener); };
  }

  private send(command: RoomCommand): ApplyResult {
    const result = this.transport.dispatch(command, this.getState().revision);
    // Stale clients catch up from the authoritative snapshot without rewriting history.
    if (!result.accepted && result.reason === 'stale') this.state = this.transport.getSnapshot();
    return result;
  }

  goTo(chapterIndex: number, stationId: string): ApplyResult {
    return this.send({ type: 'navigation.go', chapterIndex, stationId });
  }
  setAnswer(fieldId: string, value: string): ApplyResult {
    return this.send({ type: 'activity.answer.set', fieldId, value });
  }
  selectOption(choiceId: string, optionId: string): ApplyResult {
    return this.send({ type: 'activity.choice.set', choiceId, optionId });
  }
  reset(): ApplyResult { return this.send({ type: 'session.reset' }); }

  stop(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = null;
    this.subscribers.clear();
    this.transport.disconnect();
    this.state = null;
  }
}

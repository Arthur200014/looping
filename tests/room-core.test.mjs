import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRoomState } from '../dist/shared/core/RoomState.js';
import { reduceRoomEvent, replayRoomEvents } from '../dist/shared/core/reducer.js';
import { InMemoryRoomHub } from '../dist/shared/sync/InMemoryTransport.js';
import { NavigationController } from '../dist/shared/core/NavigationController.js';

function fixture() {
  const initial = createRoomState({ roomId: 'r1', sessionId: 'session1', roles: {
    mentor: 'teacher', alice: 'student', bob: 'student' } });
  const hub = new InMemoryRoomHub(initial);
  const teacher = new NavigationController(hub.createClient('mentor'));
  const alice = new NavigationController(hub.createClient('alice'));
  const bob = new NavigationController(hub.createClient('bob'));
  return { initial, hub, teacher, alice, bob };
}

function event(state, command, actorId = 'mentor', eventId = 'event1', revision = state.revision) {
  return { schemaVersion: 1, roomId: state.roomId, sessionId: state.sessionId,
    eventId, actorId, expectedRevision: revision, ...command };
}
const accept = result => assert.equal(result.accepted, true, result.reason);
const reject = (result, reason) => {
  assert.equal(result.accepted, false);
  assert.equal(result.reason, reason);
};

test('initial room: chapter 0, intro, revision 0, attempt 1; exactly one teacher', () => {
  const { initial } = fixture();
  assert.deepEqual(initial.navigation, { chapterIndex: 0, stationId: 'intro' });
  assert.equal(initial.revision, 0);
  assert.equal(initial.attempt, 1);
  assert.equal(initial.participants.mentor.connected, false);
  assert.throws(() => createRoomState({ roomId: 'r', sessionId: 's', roles: { a: 'student' } }));
});

test('pure reducer leaves original immutable and rejects invalid IDs and unauthorized events', () => {
  const { initial } = fixture();
  const joined = reduceRoomEvent(initial, event(initial, { type: 'participant.join' }));
  accept(joined);
  assert.notEqual(joined.state, initial);
  assert.equal(initial.revision, 0);
  assert.equal(initial.participants.mentor.connected, false);
  reject(reduceRoomEvent(initial, event(initial, { type: 'navigation.go', chapterIndex: 2, stationId: 's' })), 'forbidden');
  reject(reduceRoomEvent(joined.state, event(joined.state, { type: 'navigation.go', chapterIndex: -1, stationId: 's' }, 'mentor', 'negative')), 'invalid');
  reject(reduceRoomEvent(joined.state, event(joined.state, { type: 'navigation.go', chapterIndex: 1.5, stationId: 's' }, 'mentor', 'fraction')), 'invalid');
  reject(reduceRoomEvent(joined.state, event(joined.state, { type: 'navigation.go', chapterIndex: 1, stationId: '' }, 'mentor', 'empty')), 'invalid');
});

test('teacher navigation 0→1→0 and stations synchronize two isolated client controllers', () => {
  const { hub, teacher, alice } = fixture();
  teacher.start();
  alice.start();
  const seen = [];
  alice.subscribe(s => seen.push(s.navigation));
  accept(teacher.goTo(1, 'worked-example'));
  assert.deepEqual(alice.getState().navigation, { chapterIndex: 1, stationId: 'worked-example' });
  accept(teacher.goTo(0, 'intro'));
  assert.deepEqual(teacher.getState(), alice.getState());
  assert.equal(alice.getState().navigation.chapterIndex, 0);
  assert.deepEqual(seen, [
    { chapterIndex: 1, stationId: 'worked-example' },
    { chapterIndex: 0, stationId: 'intro' },
  ]);
  assert.equal(hub.getSubscriberCount(), 2);
  teacher.stop(); alice.stop();
  assert.equal(hub.getSubscriberCount(), 0);
});

test('student cannot navigate/reset; fields and choices are per actor, not overwritten by navigation', () => {
  const { teacher, alice, bob } = fixture();
  teacher.start(); alice.start(); bob.start();
  reject(alice.goTo(3, 'hacked'), 'forbidden');
  reject(alice.reset(), 'forbidden');
  accept(alice.setAnswer('fraction', '2/3'));
  accept(bob.setAnswer('fraction', '-5/4'));
  accept(alice.selectOption('quiz-1', 'B'));
  accept(bob.selectOption('quiz-1', 'C'));
  accept(teacher.goTo(2, 'practice'));
  assert.deepEqual(teacher.getState(), bob.getState());
  assert.deepEqual(teacher.getState(), alice.getState());
  assert.equal(teacher.getState().answers.alice.fraction, '2/3');
  assert.equal(teacher.getState().answers.bob.fraction, '-5/4');
  assert.equal(alice.getState().choices.alice['quiz-1'], 'B');
  assert.equal(alice.getState().choices.bob['quiz-1'], 'C');
  teacher.stop(); alice.stop(); bob.stop();
});

test('participant connection/disconnection is visible; clients cannot impersonate another actor', () => {
  const { hub } = fixture();
  const t = hub.createClient('mentor');
  const s = hub.createClient('alice');
  t.connect();
  assert.equal(hub.getSnapshot().participants.mentor.connected, true);
  assert.equal(hub.getSnapshot().participants.alice.connected, false);
  s.connect();
  assert.equal(hub.getConnectedCount(), 2);
  assert.equal(hub.getSnapshot().participants.alice.connected, true);
  assert.throws(() => s.publish(event(s.getSnapshot(), { type: 'session.reset' }, 'mentor', 'forgery')),
    /Cannot impersonate/);
  assert.throws(() => hub.createClient('alice').connect(), /already connected/);
  s.disconnect();
  assert.equal(hub.getSnapshot().participants.alice.connected, false);
  assert.equal(hub.getConnectedCount(), 1);
  t.disconnect();
  assert.equal(hub.getConnectedCount(), 0);
});

test('reset increments attempt and clears inputs without affecting presence; replay produces identical state', () => {
  const { hub, teacher, alice } = fixture();
  teacher.start(); alice.start();
  accept(teacher.goTo(5, 'last'));
  accept(alice.setAnswer('x', '17'));
  accept(alice.selectOption('q', 'A'));
  accept(teacher.reset());
  assert.deepEqual(teacher.getState().navigation, { chapterIndex: 0, stationId: 'intro' });
  assert.deepEqual(alice.getState().answers, {});
  assert.deepEqual(alice.getState().choices, {});
  assert.equal(alice.getState().attempt, 2);
  assert.equal(alice.getState().participants.alice.connected, true);
  accept(teacher.goTo(1, 'new-try'));
  accept(alice.setAnswer('x', '19'));
  assert.deepEqual(replayRoomEvents(hub.getInitialState(), hub.getHistory()), hub.getSnapshot());
  const history = hub.getHistory();
  history[0].eventId = 'tampered';
  assert.deepEqual(replayRoomEvents(hub.getInitialState(), hub.getHistory()), hub.getSnapshot());
  teacher.stop(); alice.stop();
});

test('duplicate event and out-of-order revision cannot change authoritative state', () => {
  const { hub } = fixture();
  const t = hub.createClient('mentor');
  t.connect();
  const s = t.getSnapshot();
  const first = event(s, { type: 'navigation.go', chapterIndex: 2, stationId: 'next' }, 'mentor', 'unique-e');
  accept(t.publish(first));
  const after = t.getSnapshot();
  reject(t.publish(first), 'duplicate');
  reject(t.publish(event(s, { type: 'navigation.go', chapterIndex: 3, stationId: 'stale' }, 'mentor', 'late-e')), 'stale');
  assert.deepEqual(t.getSnapshot(), after);
  assert.deepEqual(replayRoomEvents(hub.getInitialState(), hub.getHistory()), after);
  t.disconnect();
});

test('snapshot isolation, unsubscribe, reconnect and fresh event IDs across reconnect', () => {
  const { hub } = fixture();
  const teacher = hub.createClient('mentor');
  teacher.connect();
  let received = 0;
  const unsubscribe = teacher.subscribe(s => { received++; s.navigation.chapterIndex = 888; });
  const s = teacher.getSnapshot();
  s.participants.alice.connected = true;
  accept(teacher.dispatch({ type: 'navigation.go', chapterIndex: 1, stationId: 'one' }, teacher.getSnapshot().revision));
  assert.equal(hub.getSnapshot().navigation.chapterIndex, 1);
  assert.equal(hub.getSnapshot().participants.alice.connected, false);
  assert.equal(received, 1);
  unsubscribe();
  assert.equal(hub.getSubscriberCount(), 0);
  teacher.disconnect();
  const again = hub.createClient('mentor');
  again.connect();
  const snapshot = again.getSnapshot();
  assert.equal(snapshot.navigation.chapterIndex, 1);
  accept(again.dispatch({ type: 'navigation.go', chapterIndex: 0, stationId: 'intro' }, snapshot.revision));
  assert.deepEqual(replayRoomEvents(hub.getInitialState(), hub.getHistory()), hub.getSnapshot());
  again.disconnect();
});

test('100 chapter switches keep subscription counts constant and cleanup removes everything', () => {
  const { hub, teacher, alice } = fixture();
  teacher.start(); alice.start();
  let renders = 0;
  const stopView = alice.subscribe(() => { renders++; });
  for (let i = 0; i < 100; i++) {
    accept(teacher.goTo(i % 2, `station-${i}`));
    assert.equal(hub.getSubscriberCount(), 2);
  }
  assert.equal(renders, 100);
  stopView();
  teacher.stop(); alice.stop();
  assert.equal(hub.getSubscriberCount(), 0);
  assert.equal(hub.getConnectedCount(), 0);
});

test('independent clients see the same commit sequence after deterministic events', () => {
  const { hub, teacher, alice, bob } = fixture();
  teacher.start(); alice.start(); bob.start();
  for (let n = 0; n < 20; n++) {
    accept(teacher.goTo(n % 4, `s${n}`));
    accept(alice.setAnswer(`f${n}`, `${n}`));
    accept(bob.selectOption(`c${n}`, `opt${n % 3}`));
    assert.deepEqual(teacher.getState(), alice.getState());
    assert.deepEqual(teacher.getState(), bob.getState());
  }
  assert.deepEqual(replayRoomEvents(hub.getInitialState(), hub.getHistory()), hub.getSnapshot());
  teacher.stop(); alice.stop(); bob.stop();
});

test('configured initial station is restored after reset, and both clients converge', () => {
  const initial = createRoomState({ roomId: 'r', sessionId: 's', roles: { t: 'teacher', s: 'student' }, initialStationId: 'opening-game' });
  const hub = new InMemoryRoomHub(initial);
  const t = new NavigationController(hub.createClient('t'));
  const s = new NavigationController(hub.createClient('s'));
  t.start(); s.start();
  accept(t.goTo(3, 'level3'));
  accept(t.reset());
  assert.deepEqual(s.getState().navigation, { chapterIndex: 0, stationId: 'opening-game' });
  assert.deepEqual(t.getState(), s.getState());
  t.stop(); s.stop();
});

test('prototype names cannot join the roster; listener failures do not block other clients', () => {
  const { hub } = fixture();
  assert.throws(() => hub.createClient('toString'), /not registered/);
  assert.throws(() => hub.createClient('__proto__'), /not registered/);
  const t = hub.createClient('mentor');
  const a = hub.createClient('alice');
  t.connect(); a.connect();
  let healthy = 0;
  t.subscribe(() => { throw new Error('render failed'); });
  a.subscribe(() => { healthy++; });
  accept(t.dispatch({ type: 'navigation.go', chapterIndex: 1, stationId: 'keep-going' }, t.getSnapshot().revision));
  assert.equal(healthy, 1);
  assert.equal(hub.getSnapshot().navigation.chapterIndex, 1);
  t.disconnect(); a.disconnect();
});

test('wrong session/version, unknown actor, replay corruption, stale reset all reject without commits', () => {
  const { initial } = fixture();
  const joined = reduceRoomEvent(initial, event(initial, { type: 'participant.join' }, 'mentor', 'join'));
  accept(joined);
  const state = joined.state;
  reject(reduceRoomEvent(state, { ...event(state, { type: 'session.reset' }, 'mentor', 'wrong-version'), schemaVersion: 99 }), 'invalid');
  reject(reduceRoomEvent(state, { ...event(state, { type: 'session.reset' }, 'mentor', 'wrong-session'), sessionId: 'evil' }), 'invalid');
  reject(reduceRoomEvent(state, event(state, { type: 'session.reset' }, 'outsider', 'outsider')), 'forbidden');
  reject(reduceRoomEvent(state, event(state, { type: 'session.reset' }, 'mentor', 'old-reset', 0)), 'stale');
  assert.throws(() => replayRoomEvents(initial, [event(initial, { type: 'navigation.go', chapterIndex: 5, stationId: 'no-join' })]), /Invalid replay event/);
  assert.equal(state.revision, 1);
});

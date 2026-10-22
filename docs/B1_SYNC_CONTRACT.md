# B1 — Sync Core Contract

Дата: 2026-10-22. Реализовано: общее ядро комнат и тестовый in-process транспорт. Без браузерных UI, реальной сети, учебного контента и production auth.

## Modules
- `shared/core/RoomState.ts` — сериализуемое состояние `roomId`, `sessionId`, `schemaVersion`, `revision`, `attempt`, `navigation`, `initialNavigation`, доверенный roster `participants`, раздельные `answers/choices`, `appliedEventIds`.
- `shared/core/reducer.ts` — pure `reduceRoomEvent`, `replayRoomEvents`, строгий discriminated union `RoomEvent`.
- `shared/sync/InMemoryTransport.ts` — `RoomTransport`, `InMemoryRoomHub`, `InMemoryTransport`, история, снимки, подписки, reconnect.
- `shared/core/NavigationController.ts` — start/stop, subscribe, goTo, setAnswer, selectOption, reset.

## Events and order
Каждый `RoomEvent`: `schemaVersion,roomId,sessionId,eventId,actorId,expectedRevision,type` + payload. Типы:
1. `participant.join` — переводит зарегистрированного участника в connected=true; роль никогда не задаётся из клиентского payload.
2. `participant.leave` — connected=false.
3. `navigation.go {chapterIndex,stationId}` — только подключённый teacher, chapterIndex целый и >=0.
4. `activity.answer.set {fieldId,value}` — пишет ответ только по actorId.
5. `activity.choice.set {choiceId,optionId}` — пишет выбор только по actorId.
6. `session.reset` — teacher only; возвращает `initialNavigation`, очищает answers/choices, повышает attempt, сохраняет presence.

Initial: `revision=0,attempt=1,chapterIndex=0,stationId=initialStationId ?? 'intro'`. Станция 0 — настоящее значение. Роли определяются доверенной room config до подключения.

Validation order: идентификаторы комнаты/сессии/schema/payload header; actor в заранее заданном roster; duplicate ID; strict CAS `expectedRevision === revision`; полномочия и payload. Неверная команда не меняет state/history. Успешная изменяет state один раз, повышает revision ровно на 1, записывает eventId и accepted event, рассылает независимые `structuredClone` snapshots. Причины отказа: `invalid,forbidden,duplicate,stale`. События применяются в последовательном порядке hub. Автоматического повторного применения stale событий нет.

Recovery: в **том же JS-процессе** reconnect получает snapshot из hub; журнал принятой истории применяется через `replayRoomEvents(initial,history)`, воспроизводя то же состояние. Event IDs пронумерованы отдельно по actor в hub; handler без побочных эффектов. `start()` подписывается один раз; `stop()` снимает listeners и отправляет leave. После teacher reset проводится новое прохождение той же комнаты.

## Tests
Воспроизвести (Node.js >=22, TypeScript 5.8.3):
```bash
npm install
npm test
```
`npm test` = `tsc --noEmit` → `tsc` → `node --test tests/*.test.mjs`. Локально B1: 13/13 PASS. Сборка помещается в `dist/` и игнорируется Git. В текущей offline среде `npm install --package-lock-only --offline` = ENOTCACHED; локальные тесты выполнялись с уже установленным tsc 5.8.3. Package lock отсутствует (не подделываем registry metadata).

## Known boundaries
- Это **один** процесс с несколькими независимыми состояниями клиентов, но не две вкладки/браузера, не два разных процесса, не SignalR и не Firebase. Browser/network two-client e2e = NOT_VERIFIED.
- `InMemoryRoomHub` и метод `apply` доступны вызывающему коду, поэтому не являются security boundary; backend обязан независимо проверить identity/role и разрешения. Защита client handle от подмены другого actor есть, но не заменяет server-side auth.
- События/IDs растут в RAM; нужен durable log и безопасная compaction ledger при серверной интеграции. После завершения процесса hub state пропадает; настоящего persistence нет.
- Exception listener изолируется и не блокирует других; централизованный error reporter ещё не создан.
- MathJax, drag, drawing, geometry, network retries, mobile UI, оценки и задачи ОГЭ в B1 не разрабатывались; NOT_VERIFIED.

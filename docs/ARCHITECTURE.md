# Architecture v0 — draft for Stage B

## Организация (target)
```text
looping/
  OGA/{1..25}/
    README.md
    gaid.html           # thin HTML entrypoint (создаётся при работе над номером)
    dz1.html, dz2.html  # также thin entrypoints
    checklist.html
    content/            # lesson, tasks, solutions, skill rubric, sources
    theme/              # tokens/own licensed assets
  shared/
    app/                # единый bootstrap + lifecycle
    core/               # RoomState, events, reducers, navigation, attempt model
    ui/                 # layout, lesson/chapter/station, accessible controls
    math/               # MathJax, answer parsing/normalizing, generators
    mechanics/          # match, drag-sort, error-hunt, true-false, guided-step, graphs
    board/              # stroke model, hit test, rendering, undo/eraser
    sync/               # ITransport + in-memory + future SignalR adapter
    themes/             # design tokens, common layout
    persistence/        # snapshots, result queue, adapter; no prod credentials
  docs/
  tests/
  .ai/
```
Каталоги ниже `shared/` и `OGA/{n}/content/` — целевые, создавать по мере готовности, а не пустыми копиями.

## Модули и границы
**Content** — чистые versioned JSON/TS definitions: `lessonId`, `chapterIndex` (0 разрешён), `stationId`, `mechanicId`, `promptTex`, `expectedAnswer`/rubric, `hints`, `solutionSteps`, `skillIds`, `source`, `visualModel`. Запрещено исполнять произвольный код из content.

**Theme** — CSS vars (background, surface, contrast, accents), анимация с reduced-motion, разрешённые SVG/assets. Не меняет проверку ответов и state transitions.

**Mechanic** — `render(root, content, state, dispatch)`; отдельный `dispose()`. Не содержит Firebase/SignalR/GAS URL. Даже сложные тренажёры получают state/dispatch через контракт.

**RoomState** — version, roomId, sessionId, revision, navigation, activities, participants, board. Ответы per-actor; старые события не перезаписывают новый state. Teacher navigation command с индексом 0 передаётся явно (никакого `if(index)`).

**Transport** — интерфейс `connect`, `subscribe` (возвращает unsubscribe), `publish`, `getSnapshot`, `disconnect`; transport не отвечает за DOM. Idempotency через eventId; серверная авторизация и порядок ревизий при реализации network adapter. InMemory не заменяет e2e двух реальных браузеров.

**Board** — нормализованные SVG/Canvas координаты, stroke points и spatial hit-test. Ластик удаляет пересечённые strokeId и синхронизирует delete; Undo отменяет собственный существующий stroke. Epoch предотвращает воскресание штрихов после reset.

**Backend** — перспективно ASP.NET Core SignalR с PostgreSQL для сохранения необходимых попыток; Redis позже по необходимости. Во время разработки B1 использовать безсетевой mock, без production secrets. При необходимости статического demo использовать только безопасно изолированную тестовую среду после решения об авторизации.

## Канонический поток
```text
teacher action
 → validate role & command
 → publish(eventId, revision)
 → shared state reducer
 → transport/snapshot
 → two client stores
 → mechanic.render + board.render
```
Новые страницы HTML лишь bootstrap + URL к контенту. Переключение главы изменяет state и rendering, не пересоздаёт транспортную сессию.

## Устойчивость
- Subscribe ровно один раз на room, явный teardown; use AbortController/cleanup для DOM listeners.
- Действия переставляются/повторяются → дедупликация; reconnect → server snapshot + очередь неподтверждённых действий.
- Самостоятельная практика не может быть перезаписана сменой главы другого участника.
- База: никакого доверия к клиентскому score, применяются серверные ограничения ролей и лимиты.
- Граница контента: математические генераторы тестируются property-based и фиксированными seed cases.

## Этап B — критерии выбора сборки
Подтвердить deploy target, Vite/TypeScript/Playwright как предложенный минимальный стек. Stable deep links `OGA/13/gaid.html` должны открываться на выбранном хостинге. Не вводить тяжёлый UI framework без измеримой потребности.


## Реализованный этап B1 (2026-10-22)
Контракт, события, порядок применения, ограничения и команды тестирования описаны в [B1_SYNC_CONTRACT.md](B1_SYNC_CONTRACT.md). Реализованы `shared/core/RoomState.ts`, `shared/core/reducer.ts`, `shared/core/NavigationController.ts`, `shared/sync/InMemoryTransport.ts`.

B1 применяется в интеграционных Node-тестах, но **не** подключён к HTML-гайдам и не является сетевым транспортом. Следующие слои (UI, математический renderer, общая доска, защищённый сервер) пока не реализованы; соответствующие проверки NOT_VERIFIED.

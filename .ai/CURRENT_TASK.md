# CURRENT TASK

**Stage**: B — проектирование и минимальная реализация общего ядра.  
**Status**: IN_PROGRESS (пока только назначена; реализация NOT_STARTED).  
**Scope**: shared contract + in-memory adapter + единое управление навигацией; не делать образовательное содержимое массово.

## Первоочередной срез B1
1. Прочитать `.ai/HANDOFF.md`, эту задачу, `docs/ARCHITECTURE.md`, `.ai/DECISIONS.md`.
2. Проверить текущий `main`, не перезаписывать чужие изменения.
3. Уточнить сборку/локальную разработку (минимум зависимостей), создать типизированную схему `RoomState` и общий event reducer.
4. Реализовать in-memory transport для двух изолированных runtime-клиентов: attach, subscribe, unsubscribe, publish, reconnect/snapshot.
5. Реализовать NavigationController: глава 0 → 1 → 0, станция и reset, только teacher-authorized события, защита от duplicate/out-of-order.
6. Создать детерминированные тесты reducer/transport/cleanup, а также двух независимых клиентов на in-memory.
7. Зафиксировать реальные команды/результаты в TEST_RESULTS. Обновить TASK_BOARD / HANDOFF.

## Acceptance B1
- Два отдельных store-клиента получают одинаковую навигацию без переинициализации страниц.
- Глава 0 разрешена; duplicate event/replay безопасны; устаревшая revision не откатывает интерфейс.
- Подписка снимается при unmount и не растёт после 100 переключений.
- Есть явная независимая проверка идемпотентности, snapshot/reconnect на уровне unit/integration.
- Реальный двухбраузерный e2e помечен NOT_VERIFIED, пока не выполнен.
- Ни одного изменения в `testing-hosting`; нет рабочих credentials и prod БД.

**Non-goals B1**: 25 HTML комплектов, реальный backend, миграция GAS/PostgreSQL, prod Firebase, готовое рисование, реальный сетевой end-to-end.

**Next single action**: реализовать общий `RoomState` + reducer + InMemoryTransport с тестами навигации (включая главу 0).

# CURRENT TASK

**Stage:** B2 — тонкая общая оболочка UI и математического рендеринга.  
**Status:** NOT_STARTED; B1 = DONE (typecheck + 13 in-process tests PASS).  
**Date:** 2026-10-22.

## Закрытый срез B1
Реализованы RoomState, типизированные события, pure reducer + replay, InMemoryRoomHub/Transport, NavigationController (0→1→0), per-user answers/choices, join/leave, teacher reset, deduplication и revision CAS. Проверки в `.ai/TEST_RESULTS.md`; ограничения и контракт — `docs/B1_SYNC_CONTRACT.md`.

## Следующая ограниченная задача B2.1
1. Сначала прочитать `.ai/HANDOFF.md`, этот файл и `docs/B1_SYNC_CONTRACT.md`.
2. Проверить HEAD `main` без повторного аудита testing-hosting.
3. Создать единую не зависящую от предметного контента оболочку станции, подключённую к текущему `NavigationController` и интерфейсу `RoomTransport`, с lifecycle cleanup.
4. Добавить доступный базовый input, MathJax adapter и минимальные статические тестовые примеры **в tests/fixtures**, не в OGA/13 и не в новые учебные HTML.
5. Тестировать события UI и снятие подписок; проверить браузерную доступность, если есть реальный browser runner. Не выдавать in-memory тест за двухбраузерный.
6. Обновить четыре обязательных файла .ai и сделать отдельный проверенный commit.

**Acceptance B2.1:** реальный reuse shared shell + MathJax, корректный controlled input и navigation 0, отсутствие дублированных listeners; документированные точные команды/результаты.

**NEXT_ACTION:** реализовать маленькую shared оболочку станции с подключением к NavigationController, без комплекта ОГЭ.

**Safety:** никаких изменений testing-hosting, production DB, old Firebase keys, секретов, массовой генерации комплектов. Этап C №13 разрешён лишь после завершения B.

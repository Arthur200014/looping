# HANDOFF — вход для нового чата или итерации агента

**Состояние на 2026-10-22**: первая порция Stage A. `looping` был пустым; начат проект и подготовлены документы/25 каталожных заглушек. Legacy `testing-hosting` не изменять.

## Что подтверждено
- GitHub connector: обе репы доступны, `looping` позволяет push; default branch `main`.
- Исходные каталоги `OGA/6,8,9,13,17,18` инвентаризированы через GitHub; в малых файлах найдены Firebase RTDB, логика комнат/presence, общие доски, GAS, MathJax/KaTeX. Подробно: `docs/SOURCE_AUDIT.md`.
- Большие `gaid.html` (3.7–13.3 MB) не прочитаны: GitHub connector вернул пустое содержимое. Это оставлено NOT_VERIFIED, а не «изучено полностью».
- Метаданные и подход зафиксированы в `.ai/PROJECT_SPEC.md`, `.ai/DECISIONS.md`.

## Текущий фокус
**B1**: RoomState, event reducer, in-memory transport + тесты навигации (глава 0, reset, duplicate/reconnect) и корректного cleanup. Конкретный пошаговый scope: `.ai/CURRENT_TASK.md`.

## Запреты
Никаких изменений `testing-hosting`, prod Firebase/БД, чужих credentials, заявлений о проверенной двухбраузерной синхронизации. Не генерировать 25 непроверенных наборов до эталона №13 и acceptance.

## Старт продолжения
1. Читать `.ai/HANDOFF.md` → `.ai/CURRENT_TASK.md`.
2. Проверить HEAD `main` и минимально нужные `shared/, docs/ARCHITECTURE.md, tests/`.
3. Сделать B1 с тестами, записать результаты, коммитить лишь завершённую проверенную порцию и обновить HANDOFF.

**Git**: текущий SHA всегда брать из `refs/heads/main`, а не из этого файла; последнюю запись подтвердить отдельным чтением ref.

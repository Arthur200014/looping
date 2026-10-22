# ОГЭ: интерактивная математика (№1–25)

Новый проект с общей библиотекой механик, тем, математического контента и синхронизации совместного урока.

Статус: этап B1 завершён на уровне локальных unit/in-process integration тестов: общее ядро событий, room state, in-memory transport и navigation controller. Сетевой backend, двухбраузерная проверка и учебные комплекты пока отсутствуют.

- Рабочие материалы и все изменения: этот репозиторий.
- Старый `Arthur200014/testing-hosting` используется **исключительно для чтения**.
- Возобновление разработки: сначала `.ai/HANDOFF.md`, затем `.ai/CURRENT_TASK.md`.
- Общая архитектура: `docs/ARCHITECTURE.md`.
- Тесты и верификация: `.ai/TEST_RESULTS.md`.

Ни один материал или модуль синхронизации не считается работоспособным без фактических проверок.

Реальный контракт B1 и точные команды тестов: [docs/B1_SYNC_CONTRACT.md](docs/B1_SYNC_CONTRACT.md). Запуск: `npm install && npm test` (Node.js ≥22).

B2.1: common DOM station shell + MathJax adapter implemented under `shared/ui/` and `shared/math/` without educational OGA content. Commands: `npm test` for deterministic tests; optional `python tests/browser_station_smoke.py` for Chromium DOM smoke. Details: [docs/B2_1_SHELL.md](docs/B2_1_SHELL.md).

B2.2: synthetic real-HTTP ESM/MathJax 3.2.2 fixture and fail-closed browser test at [docs/B2_2_HTTP_TESTING.md](docs/B2_2_HTTP_TESTING.md); static HTTP GET passes, but browser/CDN E2E is blocked by current environment and remains NOT_VERIFIED.

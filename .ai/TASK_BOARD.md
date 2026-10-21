# TASK BOARD

Дата: 2026-10-22. Все образовательные комплекты пока НЕ созданы.

Статусы: `NOT_STARTED` → `IN_PROGRESS` → `IMPLEMENTED_NOT_VERIFIED` → `VERIFIED`. `BLOCKED` — явное препятствие. `NOT_VERIFIED` — тест ещё не выполнен.

Столбцы G = gaid.html, D = dz1/dz2 (и другие), C = checklist.html, M = игра, S = двухклиентская синхронизация; статус набора VERIFIED только если все требуемые части прошли проверки.

| ОГЭ | G | D | C | M | S | Комплект |
|---:|---|---|---|---|---|---|
| 1 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 2 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 3 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 4 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 5 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 6 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 7 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 8 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 9 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 10 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 11 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 12 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 13 (первый эталон) | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 14 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 15 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 16 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 17 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 18 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 19 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 20 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 21 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 22 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 23 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 24 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |
| 25 | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_VERIFIED | NOT_STARTED |

## Глобальные задачи
| Этап | Состояние | Замечание |
|---|---|---|
| A — метаданные/доступ/структура | DONE | Созданы проектные каталоги и документы; полный аудит гигантских `gaid.html` в backlog |
| B1 — RoomState / reducer / in-memory navigation | NOT_STARTED | Следующий шаг |
| B2 — единый UI/MathJax/проверка вводов | NOT_STARTED | Только после B1 |
| B3 — общая векторная доска | NOT_STARTED | Компактная панель + Ctrl+Z + стирание штрихов |
| B4 — test-only realtime server + auth | NOT_STARTED | Реальные независимые браузеры |
| C — пилот №13 | NOT_STARTED | Не начинать массовую генерацию |
| D — независимая проверка №13 | NOT_STARTED | Без неё этап E запрещён |
| E — остальные 24 комплекта | BLOCKED | Зависит от D |
| F — полный regression / FIPI audit | NOT_STARTED | 25 × обязательные тесты |

Первичные опорные legacy номера: 6,8,9,13,18 (есть читаемые компактные интерактивы); №17 — только список и размер файла. Наличие legacy файла **не** означает готовность в looping.

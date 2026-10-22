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
| B1 — RoomState / reducer / in-memory navigation | DONE | 13/13 Node in-process tests PASS, 100 switches with stable subscriber count; network/browser NOT_VERIFIED |
| B2 — единый UI/MathJax/проверка вводов | IN_PROGRESS | B2.1 DOM shell PASS; MathJax CDN / actual ESM in browser NOT_VERIFIED |
| B3 — общая векторная доска | NOT_STARTED | Компактная панель + Ctrl+Z + стирание штрихов |
| B4 — test-only realtime server + auth | NOT_STARTED | Реальные независимые браузеры |
| C — пилот №13 | NOT_STARTED | Не начинать массовую генерацию |
| D — независимая проверка №13 | NOT_STARTED | Без неё этап E запрещён |
| E — остальные 24 комплекта | BLOCKED | Зависит от D |
| F — полный regression / FIPI audit | NOT_STARTED | 25 × обязательные тесты |

Первичные опорные legacy номера: 6,8,9,13,18 (есть читаемые компактные интерактивы); №17 — только список и размер файла. Наличие legacy файла **не** означает готовность в looping.

## B2 subdivisions
| Slice | Status | Actual evidence |
|---|---|---|
| B2.1 — common station shell, controlled fields, MathJax adapter, mount/cleanup | DONE | Local npm test 16/16; Chromium DOM smoke PASS; 8 new files byte-matched Git staged blobs |
| B2.2 — actual served ESM + MathJax rendering verification | NOT_STARTED | HTTP/file navigation blocked by browser test environment; NOT_VERIFIED |

Task kits OGA/1–25 remain NOT_STARTED, no bulk content generated.

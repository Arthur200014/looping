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
| B2 — единый UI/MathJax/проверка вводов | DONE | B2.1 tests PASS; B2.2 GitHub runner real HTTP ESM + CDN MathJax 3.2.2 PASS (run 39767483788), not remote two-client sync |
| B3 — общая векторная доска | NOT_STARTED | NEXT B3.1: typed stroke model, real intersection eraser, undo and epoch; UI toolbar later |
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
| B2.2 — actual served ESM + MathJax rendering verification | VERIFIED | GitHub Actions run 39767483788 SUCCESS; 16/16 Node PASS, 6 HTTP assets 200, real MathJax.version=3.2.2 + vertical mjx-mfrac, 0/focus/cleanup/console/375px PASS |

Task kits OGA/1–25 remain NOT_STARTED, no bulk content generated.


B2.2 repeated run: 2026-10-22 10:04 UTC; **no transition to DONE**. Next: repeat full HTTP-browser CDN test in a legitimately permitted environment. No OGA tasks promoted.

## B2.3 CI verification — verified 2026-10-22
| Slice | Status | Evidence |
|---|---|---|
| B2.3 — reproducible GitHub Actions browser workflow | VERIFIED | `.github/workflows/b22-browser.yml`, push run [39767483788](https://github.com/Arthur200014/looping/actions/runs/39767483788), conclusion success, artifacts ID 12420837640, PASS verdict; fallback 3.2.1 excluded |
| B3.1 — vector stroke model/reducer | NOT_STARTED | **One next action**; geometry and deterministic tests |

The historical local B2.2 run at 10:04 UTC was BLOCKED. The **later GitHub Actions successful result** verified actual browser ESM/CDN, not a retroactive local PASS. OGA/1–25 remain NOT_STARTED.

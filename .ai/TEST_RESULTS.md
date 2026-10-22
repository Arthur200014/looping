# TEST RESULTS / EVIDENCE

Дата: 2026-10-22. Счётчик проверок в этом документе не заменяет CI.

## Выполненные проверки
| ID | Проверка | Результат | Подтверждение / граница |
|---|---|---|---|
| A-01 | GitHub metadata `Arthur200014/looping` | PASS | Ветка по умолчанию main; pull/push=true; size=0 до начального коммита |
| A-02 | GitHub metadata `Arthur200014/testing-hosting` | PASS | pull/push metadata; изменения туда не направлялись |
| A-03 | Дерево `testing-hosting/OGA` | PASS | Найдены папки 6,8,9,13,17,18 и другие; точный перечень в SOURCE_AUDIT |
| A-04 | Доступ к текстам малых legacy HTML | PASS | Прочитаны: OGA/6/dz1,dz2,mix; OGA/8/dz1_new_system_v4,mix,formula; OGA/9/correct,mix; OGA/13/dz1,найди,пошагово,собрать; OGA/18/correct,dz1 |
| A-05 | Полное чтение больших legacy `gaid.html` | NOT_VERIFIED | GitHub file fetch для 6,8,9,13,17,18 вернул пустой текст; требуется иной канал чтения/частичный checkout |
| A-06 | Создание начального README в пустом `looping` | PASS | GitHub commit `22d2d8b900adaf47516b07679b550e143b91c8e3` |

## НЕ выполнялось
| Проверка | Статус |
|---|---|
| JS/TS unit tests | NOT_VERIFIED — нет реализованного ядра |
| Browser load, responsive, console errors | NOT_VERIFIED |
| MathJax rendering and mathematical correctness | NOT_VERIFIED |
| Геометрическая достоверность рисунков | NOT_VERIFIED |
| Два независимых клиента с сетевой синхронизацией | NOT_VERIFIED |
| Переподключение, лаги при переключении, утечки listeners | NOT_VERIFIED |
| Действительная сохранность session/DB results | NOT_VERIFIED |
| Актуальность критериев ФИПИ | NOT_VERIFIED |

## Правило записи
Для каждой следующей проверки: точная команда, commit SHA, среда, краткий результат, ошибка и что осталось NOT_VERIFIED. PASS означает фактическое выполнение, а не код-ревью или обещание.


## Проверка сохранённой структуры после коммита
| ID | Проверка | Результат | Подтверждение |
|---|---|---|---|
| A-07 | HEAD `main` после пакетной записи | PASS | GitHub ref = `f1d57368054f7ce99f1ffe2ce547756d774c1f19` |
| A-08 | GitHub recursive tree + требуемые пути | PASS | 39 ожидаемых файлов; 0 пропущенных, 0 посторонних; каталоги `OGA/1`…`OGA/25`; tree truncated=false |
| A-09 | 25 строк task board / handoff | PASS | `TASK_BOARD.md`: 25 строк, включая №1,13,25; `HANDOFF.md` непустой и содержит B1 |
| A-10 | Наличие готовых интерактивов в новом repo | NOT_VERIFIED | Пока не существует HTML-файлов; это намеренная подготовка структуры, а не реализация |

Примечание: это статическая проверка путей и GitHub-ответов; никакие браузерные/математические тесты не выполнялись.


## B1: детерминированное общее ядро (2026-10-22)

**Код:** `shared/core/RoomState.ts`, `shared/core/reducer.ts`, `shared/core/NavigationController.ts`, `shared/sync/InMemoryTransport.ts`.  
**Среда фактического запуска:** Node.js v22.16.0, npm 10.9.2, TypeScript compiler 5.8.3 (установлен в исполняющей среде).  
**Команда:** `cd /mnt/data/looping-b1 && npm test` — скрипт последовательно выполняет `npm run typecheck` (`tsc --noEmit`), `npm run build` (`tsc`) и `node --test tests/*.test.mjs`.  
**Итог финального прогона:** `1..13`, `tests 13`, `pass 13`, `fail 0`, `cancelled 0`, `skipped 0`; 89.786701 ms (Node test runner). В предыдущем цикле: typecheck выявил возможный undefined participant, исправлено до финального PASS.

| Check | Actual result |
|---|---|
| Strict TypeScript typecheck and build | PASS |
| Начальная глава 0, вводная станция, ровно один teacher | PASS |
| Pure reducer, валидация главы/станции и ролей | PASS |
| Teacher chapter 0→1→0, синхронизация двух isolated stores | PASS |
| Separate answers/choices by actor, student cannot navigate/reset | PASS |
| Join/leave, duplicate actor handle, forged event actor rejected at client boundary | PASS |
| Reset: attempt++, state clear, preserve presence; deterministic replay | PASS |
| Stale expectedRevision, duplicate eventId, immutable accepted history | PASS |
| Snapshot isolation, unsubscribe/reconnect, distinct IDs after reconnect | PASS |
| 100 chapter switches: 2 transport subscriptions throughout; 0 after stop | PASS |
| 3 in-process clients, 60 ordered actions, equal independent state after each trio | PASS |
| Initial non-default station restored after reset | PASS |
| Prototype-named actor rejected, failed UI subscriber isolated | PASS |
| Invalid schema/session/unknown actor/stale reset and invalid replay reject | PASS |
| Static scan for legacy URL/Firebase key/private key patterns in new files | PASS (no matches) |
| Git blob hash comparison staged tree vs locally tested source files | PASS (8/8 matching file SHAs) |

**Environment limitation:** `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` = FAIL `ENOTCACHED` (TypeScript absent from npm cache; network blocked). Lockfile не создан; локально `npm test` использовал присутствующий tsc 5.8.3. Для внешнего воспроизведения требуется доступный npm registry и `npm install`.

**NOT_VERIFIED:** запуск в браузере; два независимых браузера/процесса с реальным транспортом; адаптивность телефона; учебный контент и математика; задержки реальной сети и восстановление после перезапуска сервера. B1 in-memory тесты **не равны** сетевому E2E. Нет проверки прав на внешнем backend: hub предназначен только для доверенного test runtime.

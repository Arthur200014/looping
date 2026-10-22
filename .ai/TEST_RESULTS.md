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


## B2.1 — station shell and MathJax adapter (2026-10-22)

**Source:** `shared/ui/StationShell.ts`, `shared/ui/station-shell.css`, `shared/math/MathJaxRenderer.ts`. Synthetic fixture only in `tests/fixtures/`. B1 modules untouched.  
**Environment:** local `/mnt/data/looping-b21`; Node v22.16.0, npm 10.9.2, TypeScript 5.8.3; Python Playwright + /usr/bin/chromium. Local repo files mirrored from GitHub; 8 added source/test assets matched their staged Git blob SHA byte-for-byte.

### Executed commands / results
- `cd /mnt/data/looping-b21 && npm test` (runs `npm run typecheck && npm run build && node --test tests/*.test.mjs`): **PASS**; TAP `tests 16, pass 16, fail 0, skipped 0, cancelled 0`. This includes all 13 B1 regression test cases and 3 B2.1 contract cases.
- `cd /mnt/data/looping-b21 && python tests/browser_station_smoke.py`: **PASS** using headless Chromium. Asserted teacher 0→1→0 navigation reflected in student's DOM; student navigation disabled; per-person answers and choices; stable focus and cursor while typing; MathRenderer stub invoked; reset cleared input; 100 switches left 2 active hub subscriptions; after unmount 0; remount reconnected; no JS page errors; at 375px viewport no horizontal overflow.
- Local `python -m http.server 8765` + Chromium `page.goto(http://127.0.0.1:8765/...)`: **BLOCKED**, `net::ERR_BLOCKED_BY_ADMINISTRATOR`. `file://` navigation also BLOCKED. Instead, the smoke tool exercised the real compiled source JS (same file bytes), combining ESM code in one evaluation scope in a blank Chromium page. This does NOT prove normal network/ESM loading.
- Git staging verification: GitHub recursive tree files `shared/math/MathJaxRenderer.ts`, `shared/ui/StationShell.ts`, CSS, 3 fixture files, Node test and Python smoke test have matching local git blob SHA (8/8).

### NOT_VERIFIED and constraints
Actual MathJax CDN fetch/typeset of LaTeX (the DOM smoke uses injected mock engine); running an HTTP-served browser ESM page; two independent browser contexts or machines with network realtime; physical mobile touch and viewport; OGA mathematics and content; backend authentication/persistence. Browser UI smoke uses two DOM participants in one browser with one in-memory hub, not independent network sessions. MathJax 3.2.2 is configured/pinned, its production CDN availability is not asserted.


## B2.2 — standard HTTP fixture and real-MathJax verification attempt (2026-10-22)

**Base**: GitHub `looping/main` before changes = `f37eb2dd550e1ea6e3fe84e2ad5e305357f3c1d8`. Reproducible fixture lives in `tests/fixtures/station-http.{html,mjs}`. Repository untouched: `testing-hosting` and all `OGA/1–25`.

**Actual environment**: `cd /mnt/data/looping-b22`, Node v22.16.0, npm 10.9.2, TypeScript 5.8.3, Python Playwright, `/usr/bin/chromium`; port allocated dynamically on 127.0.0.1. Real HTML `<script type="module">` references actual compiled `dist/shared/*` files. Source imports are NOT flattened in this B2.2 fixture. External MathJax URL pinned `https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js`.

| Command (all from `/mnt/data/looping-b22`) | Exit / outcome | Scope |
|---|---|---|
| `npm test` | **0 / PASS 16/16** (fail 0) | TypeScript typecheck, build, B1+B2.1 Node tests |
| `python tests/browser_http_mathjax.py --assets-only` | **0 / PASS** | Six real localhost HTTP GET requests returned 200, correct HTML/JS/CSS MIME and nonempty bodies |
| `python tests/browser_http_mathjax.py` | **2 / BLOCKED** | Asset GET PASS; Chromium `Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR at http://127.0.0.1:36849/tests/fixtures/station-http.html`; navigation never completed |
| `python tests/browser_station_smoke.py` | **0 / PASS** | Prior B2.1 Chromium DOM test (compiled JS in blank page with mock MathJax), chapter 0↔1, focus, reset, cleanup, 375px; NOT HTTP ESM |
| `python tests/browser_mathjax_offline.py --bundle /opt/nvm/versions/node/v22.16.0/lib/node_modules/mathjax-full/es5/tex-mml-chtml.js --version 3.2.1` | **0 / PASS** | Real *local MathJax 3.2.1* `typesetPromise`, CHTML `mjx-mfrac`, numerator bounding y less than denominator bounding y, Chromium 375px; **not CDN or 3.2.2** |
| Python `requests.get('https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js', timeout=6)` | **ConnectionError / BLOCKED** | `NameResolutionError: Failed to resolve 'cdn.jsdelivr.net' ([Errno -3] Temporary failure in name resolution)` |
| `python -m py_compile tests/serve_fixture.py tests/browser_http_mathjax.py tests/browser_mathjax_offline.py` | **0 / PASS** | Python syntax only |

**Important interpretation**: The HTTP fixture/server is implemented and served successfully to a Python HTTP client. **Chromium HTTP ESM imports and MathJax CDN 3.2.2 remain NOT_VERIFIED**, because `page.goto` was blocked before any script ran and the DNS environment cannot fetch the CDN. `pageerror: []`, `console errors: []` in the failing test signify **no page executed**, not confirmation of a clean running page. Browser fixture focus/cleanup and 375px layout also NOT_VERIFIED in real HTTP flow; only prior B2.1 test covers them using different loading conditions. No true two-independent-browser network sync is claimed.

**Next**: re-run full `python tests/browser_http_mathjax.py` where browser localhost navigation and CDN DNS are permitted. Keep B2.2 blocked until an actual success.


## B2.2 repeat / user-requested command — 2026-10-22 10:04–10:05 UTC

**Target:** `Arthur200014/looping` main at `861ec4a2f6b6549a0742989160b39b8478792895` before this documentation-only commit; local checkout reconstruction at `/mnt/data/looping-b22`. Local source assets checked against current GitHub blob SHAs: `tests/browser_http_mathjax.py`, `tests/fixtures/station-http.mjs`, `tests/fixtures/station-http.html`, `tests/serve_fixture.py`, `tests/station-contract.test.mjs`, `shared/math/MathJaxRenderer.ts` **6/6 exact SHA matches**.

**Environment:** Node v22.16.0, npm 10.9.2, TypeScript v5.8.3, Python Playwright + `/usr/bin/chromium`.

### Exact command and output
```bash
cd /mnt/data/looping-b22
npm test && python tests/browser_http_mathjax.py
# tsc --noEmit: PASS
# tsc: PASS
# TAP: tests 16, pass 16, fail 0, skipped 0, cancelled 0
# TAP duration_ms 96.608955
# Fixture http://127.0.0.1:37297/tests/fixtures/station-http.html
# PASS HTTP GET: 6 static assets, 200, correct MIME, nonempty
# NOT_VERIFIED: Browser HTTP / MathJax check BLOCKED/FAIL:
# Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR
# at http://127.0.0.1:37297/tests/fixtures/station-http.html
# combined exit code: 2
```

**Separate checks:**
- `python tests/browser_http_mathjax.py --assets-only`: **exit 0**, HTTP GET 6/6 all 200 with correct MIME at dynamic port 36139.
- `python -m py_compile tests/serve_fixture.py tests/browser_http_mathjax.py tests/browser_mathjax_offline.py`: **exit 0**.
- `socket.getaddrinfo('cdn.jsdelivr.net',443)`: **gaierror [Errno -3] Temporary failure in name resolution**. `github.com` similarly cannot be resolved from this container. No CDN fetch was successful.
- Browser pageerror `[]`, console errors `[]` were printed by test teardown **after blocked navigation**; browser scripts had not run. Do **not** infer a clean console from these empty lists.
- No alternate permitted browser service was available for a full browser test. Restrictions were not bypassed.

**B2.2 STATUS: BLOCKED (NOT_VERIFIED)** for real browser HTTP ES module evaluation, MathJax **3.2.2** `typesetPromise` and vertical `mjx-mfrac`, navigation 0, focus, cleanup, runtime console and 375px layout within the HTTP-loaded fixture. Prior local MathJax **3.2.1** smoke was not used as evidence for 3.2.2 and was not re-run in this turn. All `OGA/1–25`, `testing-hosting`, and production sources unchanged.

**One next action:** rerun the full command on a permitted Chromium+localhost HTTP+CDN network environment and capture real on-page assertions, keeping B2.2 blocked until then.


## B2.3 GitHub Actions actual run; B2.2 E2E verified — 2026-10-22 11:02 UTC

**Repo:** `Arthur200014/looping`, `main`. **Workflow:** `.github/workflows/b22-browser.yml`; triggered by push of `da98f222f35e152d932d66fa332ed0453ec2593f`. **Run ID 39767483788**, attempt 1, job ID `119786424088`; GitHub API returned `status=completed`, `conclusion=success`. [Run details and job log](https://github.com/Arthur200014/looping/actions/runs/39767483788).

**Runner:** `ubuntu-24.04`, configured Node 22, Python 3.11, `playwright==1.56.0`, Chromium installed with `python -m playwright install --with-deps chromium`. Browser test sets `B2_USE_PLAYWRIGHT_CHROMIUM=1` and `B2_ARTIFACT_DIR=artifacts/browser` to use the installed Playwright browser and preserve artifacts.

| Actual GitHub Actions step / command | Step conclusion | Exact observed evidence in job log |
|---|---|---|
| `npm install --no-audit --no-fund` | success | TypeScript installed, no package-lock precondition |
| `python -m pip install 'playwright==1.56.0'` and `python -m playwright install --with-deps chromium` | success | Chromium installed on runner |
| `npm test` | **success** | `tsc --noEmit` PASS; `tsc` PASS; TAP `1..16`, `# tests 16`, `# pass 16`, `# fail 0` |
| `python tests/browser_http_mathjax.py --assets-only` | **success** | `PASS HTTP GET: 6 static assets, 200, correct MIME, nonempty` |
| `python tests/browser_http_mathjax.py` | **success** | True Chromium `page.goto` of `http://127.0.0.1:36929/tests/fixtures/station-http.html` and actual module HTTP GETs; `PASS MathJax: real CDN request, typesetPromise, vertically stacked fraction`; test source enforces `MathJax.version === '3.2.2'`, CDN HTTP 200 and numerator y < denominator y in `mjx-mfrac` |
| Teacher navigation, input focus, reset, dispose | **success** | `PASS navigation/focus/reset/cleanup via HTTP ESM` |
| Emulated 375px responsive layout and browser errors | **success** | `PASS viewport 375px (emulated), browser pageerror and console error lists empty`, `Browser pageerrors: []; console errors: []; request failures: []` |
| Outcome classifier | **success** | `VERDICT=PASS`; any blocked/assertion failure would leave browser step failing |
| `actions/upload-artifact@v4` | **success** | Artifact `b22-evidence-39767483788-1`, ID `12420837640`, `420036` bytes, retained 14 days; logs, screenshot, browser trace and request diagnostics |

**Important scope:** the GitHub runner *really* accessed localhost HTTP and jsDelivr and verified **exact MathJax 3.2.2**, not the local MathJax 3.2.1 fallback. Historical runs in this conversation's restricted local environment returned `ERR_BLOCKED_BY_ADMINISTRATOR`/DNS errors; those remain recorded above, but **B2.2 is now VERIFIED** in the GitHub runner. This is not an actual independent two-device network sync: fixture mounts two participant shells on a **single in-process hub**. 375px is emulated Chromium, not physical mobile; educational OGA content remains NOT_VERIFIED.

**Commit of this .ai update:** the resulting SHA is verifiable in the repository's `main` ref (never infer a not-yet-created commit hash). **Next one action:** B3.1 typed shared vector stroke model/reducer with eraser intersection, own-stroke undo, epoch and deterministic tests.

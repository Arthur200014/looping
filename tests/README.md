# Tests

B1 deterministic suite: `tests/room-core.test.mjs` — 13 tests. Run `npm install` then `npm test` from repository root. `npm test` runs strict TypeScript typecheck, compile and Node built-in test runner.

Verified: independent in-memory client handles/stores in one Node process, chapter 0, teacher-only navigation/reset, fields/choices per student, join/leave, snapshot/reconnect, duplicate/stale rejection, reset and event replay, cleanup after 100 switches. Browser, mobile, networked two-client e2e and math tasks: NOT_VERIFIED. Full evidence: `../.ai/TEST_RESULTS.md`.

B2.1: `tests/station-contract.test.mjs` (3 Node cases), fixture `tests/fixtures/stations.mjs`, and `tests/browser_station_smoke.py` for a headless Chromium DOM smoke using compiled code and mock MathJax. Commands `npm test` and `python tests/browser_station_smoke.py`. Python requires `playwright` and `/usr/bin/chromium`; that smoke bypasses navigation restrictions by evaluating compiled code, not HTTP ESM. Production ESM and actual CDN MathJax are NOT_VERIFIED.

B2.2: `python tests/serve_fixture.py --port 8765` serves `/tests/fixtures/station-http.html` with real ES module imports. `python tests/browser_http_mathjax.py --assets-only` checks actual HTTP resources/MIME without browser; `python tests/browser_http_mathjax.py` is the strict Chromium + actual MathJax 3.2.2 CDN E2E (nonzero exit on blocked HTTP/CDN; never substitutes a mock). Optional `python tests/browser_mathjax_offline.py --bundle PATH_TO_MATHJAX_BUNDLE --version VERSION` tests a local real MathJax version **only as a separate partial check**. Current environment blocks localhost navigation (ERR_BLOCKED_BY_ADMINISTRATOR) and CDN DNS; see `.ai/TEST_RESULTS.md`.

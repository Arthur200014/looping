# Tests

B1 deterministic suite: `tests/room-core.test.mjs` — 13 tests. Run `npm install` then `npm test` from repository root. `npm test` runs strict TypeScript typecheck, compile and Node built-in test runner.

Verified: independent in-memory client handles/stores in one Node process, chapter 0, teacher-only navigation/reset, fields/choices per student, join/leave, snapshot/reconnect, duplicate/stale rejection, reset and event replay, cleanup after 100 switches. Browser, mobile, networked two-client e2e and math tasks: NOT_VERIFIED. Full evidence: `../.ai/TEST_RESULTS.md`.

B2.1: `tests/station-contract.test.mjs` (3 Node cases), fixture `tests/fixtures/stations.mjs`, and `tests/browser_station_smoke.py` for a headless Chromium DOM smoke using compiled code and mock MathJax. Commands `npm test` and `python tests/browser_station_smoke.py`. Python requires `playwright` and `/usr/bin/chromium`; that smoke bypasses navigation restrictions by evaluating compiled code, not HTTP ESM. Production ESM and actual CDN MathJax are NOT_VERIFIED.

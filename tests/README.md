# Tests

B1 deterministic suite: `tests/room-core.test.mjs` — 13 tests. Run `npm install` then `npm test` from repository root. `npm test` runs strict TypeScript typecheck, compile and Node built-in test runner.

Verified: independent in-memory client handles/stores in one Node process, chapter 0, teacher-only navigation/reset, fields/choices per student, join/leave, snapshot/reconnect, duplicate/stale rejection, reset and event replay, cleanup after 100 switches. Browser, mobile, networked two-client e2e and math tasks: NOT_VERIFIED. Full evidence: `../.ai/TEST_RESULTS.md`.

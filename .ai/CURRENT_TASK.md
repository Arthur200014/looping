# CURRENT TASK — B3.1 common vector board core

**Stage:** B3.1 — reusable vector stroke model and reducer.
**Status:** NOT_STARTED (B2.2 and B2.3 verified).
**Updated:** 2026-10-22.

## Verified prerequisite
GitHub Actions **39767483788** on commit `da98f222f35e152d932d66fa332ed0453ec2593f`: **COMPLETED / SUCCESS**, full B2.2 browser real-HTTP ESM and CDN MathJax 3.2.2 verification. `npm test` **16/16 PASS**, six HTTP assets 200; real `typesetPromise` and vertically stacked `mjx-mfrac`; navigation chapter 0, focus, cleanup, clean browser logs, width 375px emulated viewport. Artifact `b22-evidence-39767483788-1` (ID `12420837640`). Link https://github.com/Arthur200014/looping/actions/runs/39767483788. Historical local browser/DNS blocks are retained in `.ai/TEST_RESULTS.md` and do not negate verified GitHub runner results.

## B3.1 narrow implementation scope
1. Read `.ai/HANDOFF.md`, this document, `docs/ARCHITECTURE.md`, and minimal shared B1 code. Confirm current GitHub HEAD.
2. Implement **typed data-only vector board state + deterministic pure reducer** under `shared/board/`, using normalized points and stable `strokeId`. Avoid painting-on-top erasers.
3. Hit-test eraser trajectories against actual stroke segments and remove intersecting strokes; support `undo` for the actor's own most recent existing stroke.
4. Define board reset/epoch semantics so stale operations cannot resurrect removed strokes, and make ordering/integration boundaries explicit.
5. Add real deterministic geometry tests: eraser intersects/non-intersects, delete only matching stroke, undo own vs others, duplicate event, stale epoch, reset/replay. Preserve all existing 16 B1/B2 tests.
6. Run `npm test` with exact log and update all four .ai status files. Do not claim network/browser board sync until implemented/tested. Commit only `looping/main` without force.

**Single NEXT_ACTION:** build + test the reusable B3.1 vector stroke model/reducer.

**Non-goals:** OGA/1–25 education pages, Firebase/GAS/DB and production systems, independent browser network transport, UI toolbar/Canvas rendering in the same B3.1 slice.

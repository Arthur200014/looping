# CURRENT TASK

Stage: **B2.2 — Browser integration verification for common station shell**  
Status: **NOT_STARTED** (B2.1 = DONE; B1 = DONE).  
Updated: 2026-10-22.

## Completed B2.1
- Reusable StationShell mounted to existing NavigationController, with one transport subscription per client; no new transport, no changes to B1 reducer.
- Data-defined stations, controlled answer and choice per actor, teacher chapter 0/1 navigation, reset, status, accessible/native inputs, local lifecycle cleanup.
- Isolated MathJax 3.2.2 adapter/loader with injectable MathRenderer; math formula inserted as textContent rather than unsafe HTML.
- Typecheck+build+Node tests 16/16 PASS; Chromium DOM smoke PASS including 375px overflow check, under stated limitations.
- Documentation: docs/B2_1_SHELL.md; commands/results .ai/TEST_RESULTS.md.

## One next bounded action
**B2.2:** make and verify a truly served static ES module test page using fixture data (NOT educational OGA content) with actual MathJax 3.2.2 loaded, inspect browser console and formula rendering. If external CDN unavailable, explicitly record failure and provide a supported development fallback, not an invented PASS.

### Acceptance
- Real Chromium/web browser opens fixture through standard HTTP module import; actual MathJax `typesetPromise` renders `\\frac` vertically and cleanup works.
- Retest navigation 0 and input focus without rewriting shared state.
- Evidence includes exact commands, page/viewport, console errors, and an honest environmental result.
- No changes to testing-hosting, production environment, or OGA/1–25.

Full shell contract: docs/B2_1_SHELL.md. Next steps after B2.2: B3 common vector board; B4 isolated authenticated realtime backend and independent-browser tests.

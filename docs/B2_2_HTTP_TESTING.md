# B2.2: real HTTP ESM + MathJax 3.2.2 fixture

## Purpose / constraints
This is an isolated **synthetic fixture**, not a numbered OGA lesson. The HTML uses `<script type="module" src="./station-http.mjs">` and genuine ESM imports from the compiled `dist/shared/` code. The fixture calls `loadMathJax(document)` to load the **real MathJax 3.2.2** browser bundle over HTTPS (no mock renderer). It mounts one teacher and one student `StationShell` on an in-memory hub in the **same JS process**, so this does not validate remote realtime/production security.

## Commands
Run from repository root after Node.js >=22, TypeScript 5.8.3, Python Playwright and Chromium are available.

```bash
npm test
python tests/serve_fixture.py --port 8765
# Open http://127.0.0.1:8765/tests/fixtures/station-http.html
# In a separate terminal:
python tests/browser_http_mathjax.py --assets-only
python tests/browser_http_mathjax.py
```

The browser E2E starts and stops its own loopback HTTP server on an ephemeral free port. `--assets-only` verifies **six HTTP GET 200 responses with MIME**. Full mode requires actual `page.goto`, real MathJax CDN HTTP 200, `MathJax.typesetPromise`, vertical `mjx-mfrac/mjx-num/mjx-den` layout, teacher 0→1→0 navigation, controlled answer focus, reset, subscription cleanup, console errors and a 375px emulated viewport. It returns exit code **2** on browser/network failure, with an explicit NOT_VERIFIED diagnostic.

There is also an optional **different** test that uses an explicitly provided *local* real MathJax bundle, without bundling fonts or source:

```bash
python tests/browser_mathjax_offline.py --bundle /path/to/mathjax-full/es5/tex-mml-chtml.js --version 3.2.1
```

This can verify the MathJax rendering engine's fraction layout but never establishes that MathJax **3.2.2** was fetched from CDN or that an ESM HTTP page loaded in Chromium.

## Actual 2026-10-22 environment results
- `npm test`: PASS 16/16; strict TypeScript check/build succeeded.
- `python tests/browser_http_mathjax.py --assets-only`: PASS 6/6 HTTP GET 200 with correct MIME.
- `python tests/browser_http_mathjax.py`: **BLOCKED / exit 2**: `Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR` for `http://127.0.0.1:36849/tests/fixtures/station-http.html`. Python HTTP clients reached the same server, Chromium navigation was blocked.
- Attempted external `cdn.jsdelivr.net` MathJax URL: `NameResolutionError`, `[Errno -3] Temporary failure in name resolution`.
- Chromium with installed MathJax **3.2.1** (local bundle) PASS: `typesetPromise` and true vertically stacked fraction. This was NOT MathJax 3.2.2.
- Previous B2.1 smoke: PASS for navigation 0, focus and cleanup in a DOM execution mode **without** normal browser HTTP ESM loading.

**NOT_VERIFIED**: actual network-loaded MathJax **3.2.2**, browser HTTP ESM import and console after page load, focus/reset/cleanup under HTTP, real phone testing, independent browsers, real network synchronization. Do not turn HTTP asset PASS or local MathJax 3.2.1 PASS into a false full browser PASS.

## Next gate
Run strict full browser test in a network-permitted environment, inspect errors and fix any problems found, then update the .ai task state. B2.2 is PARTIAL/BLOCKED until that happens.

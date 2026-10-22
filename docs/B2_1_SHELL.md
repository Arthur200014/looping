# B2.1 — Common interactive station shell (2026-10-22)

## Purpose / boundary
One reusable `StationShell` component consumes typed `StationDefinition[]` content and the existing B1 `NavigationController`. It does not fork mechanics per task number and does not own Firebase/SignalR/GAS details. It renders no OGA lesson: `tests/fixtures` is synthetic test input only.

## Public API / usage
```ts
import { StationShell } from './shared/ui/StationShell.js';
import { NavigationController } from './shared/core/NavigationController.js';
import { loadMathJax } from './shared/math/MathJaxRenderer.js';

// RoomTransport created by the surrounding trusted room/session boundary.
const controller = new NavigationController(transport);
const math = await loadMathJax(document); // MathJax 3.2.2 over permitted network
const shell = new StationShell({
  root: document.getElementById('station-root')!,
  controller, actorId, math,
  stations: [
    {chapterIndex:0, stationId:'intro', title:'Введение',
      promptTex:'\\frac{1}{2}', answer:{fieldId:'a', label:'Введите ответ'}}
  ]
});
shell.mount();
// On navigation away from the page/component:
shell.unmount();
```
For a static build, include `<link rel="stylesheet" href=".../shared/ui/station-shell.css">` and serve compiled JS with correct relative paths. `mount` owns controller lifetime: calling it twice is idempotent, `unmount` removes controller subscription, 3 delegated DOM listeners via AbortController, the UI and the room connection. Mount/unmount of different shells must use distinct controllers/transports. One `MathRenderer` can be reused across shells.

## Content & UX contract
Each station has `chapterIndex >= 0`, unique `stationId` within the chapter, `title`, `promptTex`, and optional answer field / radio choice list. Navigation includes **chapter 0**. Teacher can navigate and reset; student sees disabled navigation. All dispatches go through B1 authorization. Answers and choices are saved under actor ID. Controlled text inputs stay mounted during state updates, preserving focus/caret; navigation or reset intentionally replaces station input. A user-visible status announces connected count and attempt, and shows rejected commands. Unicode, LaTeX and choice labels are inserted as text nodes, never HTML. CSS has a narrow-viewport breakpoint, visible focus style, native labels/fieldset and reduced motion behavior.

## MathJax
`createMathJaxRenderer(engine)` accepts a `MathJaxEngine` for tests or a preloaded instance. `loadMathJax(document)` inserts one pinned MathJax 3.2.2 `tex-mml-chtml.js` script and configures inline/display delimiters; its Promise rejects on network failure. The outer application should show a connection/load error if loader fails before shell construction. During a formula typeset failure, the shell retains escaped raw TeX and exposes an error in status; stale async completions are ignored. The actual browser CDN load and real TeX rendering remain **NOT_VERIFIED** in this environment.

## Test commands / evidence
```bash
npm test
python tests/browser_station_smoke.py
```
First command: Node 22.16.0 + tsc 5.8.3, **16/16 PASS** (13 original B1 regressions + 3 B2.1 adapter/content cases). Second: Chromium with Python Playwright: **PASS** for two mounted DOM clients within one browser process, 0→1→0, focus, choices, reset, 100 switches, unmount/reconnect, 375px viewport and no JS pageerrors.

**Important:** Chromium in the current environment rejects both localhost HTTP and file:// navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The browser smoke therefore constructs a blank page and executes **real compiled JS bodies** in one scope (by removing import/export wrappers); it does not validate ESM module loading from an HTTP server. MathJax smoke is injected/mock, not a successful CDN fetch. No independent-browser network synchronisation, real phone testing, OGA mathematical validation or production auth is claimed.

## Next quality gate
B2.2: in a browser allowed to open a static HTTP server, verify ordinary compiled ESM imports and the actual MathJax 3.2.2 renderer, with console and formula screenshots/observations. Only then consider B2 browser integration verified.

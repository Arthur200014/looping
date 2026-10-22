# Shared kernel

B1 implemented and tested (in-process; no UI or network):
- `core/RoomState.ts` — versioned room state and explicit trusted roster.
- `core/reducer.ts` — deterministic, permission-checked state transitions and replay.
- `core/NavigationController.ts` — navigation (including chapter 0), answer/choice and reset API, lifecycle with unsubscribe.
- `sync/InMemoryTransport.ts` — authoritative one-process hub and isolated transport/client instances.

Source of truth: [../docs/B1_SYNC_CONTRACT.md](../docs/B1_SYNC_CONTRACT.md). Future browser/SignalR transport is NOT_VERIFIED; `InMemoryRoomHub` is not authentication.

Tests: `npm test` from repository root. Do not copy shared code into individual OGA HTML pages.

B2.1: `ui/StationShell.ts` + `ui/station-shell.css` and `math/MathJaxRenderer.ts` add a reusable DOM shell and external MathJax adapter without changing B1 transport. See [docs/B2_1_SHELL.md](../docs/B2_1_SHELL.md). Unit tests and Chromium smoke documented in .ai/TEST_RESULTS.md.

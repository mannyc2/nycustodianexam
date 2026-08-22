# Native browser durability probe

This fixture is intentionally dependency-free and targets a **real browser**.

`probe.js` defines:
- database open + v1 -> v2 migration;
- authoritative three-store attempt commit;
- injected abort after an attempt write;
- idempotent same-payload retry and conflicting duplicate ID;
- staged pack + short atomic activation pointer transaction;
- active-session content-version pinning;
- error-name translation scaffolding and StorageManager observation.

`cdp.mjs` opens two pages and additionally exercises:
- a same-attempt two-tab race;
- BroadcastChannel delivery;
- Web Locks exclusivity.

The fixture was not able to execute in the research executor because managed
Chromium blocks localhost and file origins before script execution. See
`../../raw-results/browser-policy-block.md`.

Rerun this fixture in normal Chromium first, then port the same assertions to
Playwright Chromium/Firefox/WebKit. A passing result is required before the
provider recommendation graduates from `SOURCE-CONFIRMED` to
`RUNTIME-VALIDATED`.

# Full browser sweep and fixture corrections

The complete local suite against the build from `378a1d2` finished with **378 passes, 26 skips, and 10 failures** (414 cases, 10.9 minutes). It ran on Chromium, Firefox, and WebKit with two workers and the retained actual version-4 distribution configured for upgrade tests. All three actual installed version-4-to-version-5 upgrade cases passed. Cloudflare-tagged cases are separate; see `STATIC-ASSETS-SIMULATION.md`.

The failures were investigated rather than ignored:

- Six question-player cases and three preference-recovery cases read the obsolete `launch-v1:v4:launch-v1:question:1` attempt ID. The generated page declares the version-5 ID and receipt; the shared fixture now expects those exact coordinates. Original q001 feedback bytes and hash remain unchanged.
- The Chromium offline partial-start case looked for a static length-list link after the interactive builder replaced that list. It now follows the persistent 45-question hero link on both online and offline visits. The test still removes verified feedback, forces known-offline state, and asserts that commitment is blocked without requesting feedback.

The three affected files were rerun in full across all browser projects: **45 passes, 12 declared skips, zero failures** (27.3 seconds). Browser TypeScript checks passed. Skips cover browser-specific service-worker and back-forward-cache capabilities; they are not additional passing evidence. This is a completed broad run plus targeted corrections, not a claim that one unchanged all-green full sweep was observed.

Commands (from `apps/site`):

```sh
NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 NYCUSTODIAN_PREVIOUS_RELEASE_DIST=/tmp/nycustodian-upgrade-v4-8375c3e-dist NYCUSTODIAN_PREVIOUS_RELEASE_VERSION=4 node node_modules/@playwright/test/cli.js test --workers=2
NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 node node_modules/@playwright/test/cli.js test browser-tests/question-player.pw.ts browser-tests/utility-design-recovery.pw.ts browser-tests/offline-and-update.pw.ts --workers=2
```

Print table estimates were edited after the full sweep started. This browser run used the preceding build and does not validate those new estimates. Fresh build/PDF evidence remains required.

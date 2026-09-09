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

## Current lifecycle-era sweep — 346ea81

The complete configured suite ran against source `346ea8172707905ac4d6454303a8c164b6bd26bd` and the verified production build: 432 cases, 400 passed, 29 skipped, 3 failed, 10.6 minutes. The only failing test was custom-set export/import, once in each browser engine. Chromium trace inspection proved export, import, and restored question feedback succeeded before the test waited for the old Hazard history href without `review=1`. The original-page failure screenshot showed Export ready because the failing interaction belonged to a second page; it did not establish export failure.

The fixture now constructs the expected review URL while retaining exact custom-set coordinates, expects the saved-review position label, verifies the saved-response context, and verifies absence of Save marks/Save response controls. The initial focused rerun reached Review but failed on the stale practice position label in all three engines. After correcting that expectation, all three export/import cases passed (15.4 seconds), covering visual and written Hazard responses plus the custom question response in a fresh browser. Browser TypeScript and diff whitespace checks passed. Application source did not change.

Logs: `/tmp/nyc-current-full-browser.log`, `/tmp/nyc-custom-transfer-review-browser.log`, `/tmp/nyc-custom-transfer-final-browser.log`. This is a full sweep with three failures followed by a passing affected-test rerun, not a new all-green full-suite invocation. The 29 configured skips, broader lifecycle requirements, visual acceptance and production certification remain separate.


## Current citation-era sweep — cc400cb

The complete configured local suite passed against `cc400cb782947fc3ce71542b694971caeb9a6db1`: **442 passed, 26 explicitly skipped, zero failures** (468 cases, 12.0 minutes, exit 0). Application source and the built distribution stayed unchanged throughout the run. Only review documentation was edited while it ran.

Command from `apps/site`:

```sh
NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 NYCUSTODIAN_PREVIOUS_RELEASE_DIST=/tmp/nycustodian-upgrade-v4-8375c3e-dist NYCUSTODIAN_PREVIOUS_RELEASE_VERSION=4 node node_modules/@playwright/test/cli.js test --workers=2
```

Log: `/tmp/nyc-citations-full-browser.log`. The 26 skips are 13 named Chromium-only checks in each of Firefox and WebKit: two actual BFCache checks, five service-worker/offline navigation checks, and six Cache API/pack inspection checks. Their explicit guards were inspected in the test sources. They are not passing evidence for those engines. Other offline and actual retained-version upgrade workflows ran normally. Cloudflare-tagged cases are excluded by this local preview configuration and retain their separate evidence.

This closes the pending full local browser run at this exact implementation revision. It does not certify manual accessibility, physical printing, production deployment, or remaining matching-reference visual comparisons.

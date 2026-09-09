# Cross-browser workflow verification

Current production build, Playwright projects Chromium/Firefox/WebKit, two workers, local preview at 127.0.0.1:4187. This evidence does not certify Safari or all offline behavior.

The first expanded run covered study-hub, review-queue, hazard-player, hazard-builder and utility-design-recovery: 59 passed, 2 deliberately skipped (Chromium-specific BFCache proof), 5 failed. Practice-builder separately had 11 passed and 1 failed.

Findings and corrections:

- Review's broad Next question selector matched both the new primary action and footer navigation. It now selects the primary link exactly. The workflow subsequently passed in all three browsers.
- The custom offline tests previously only visited a document. Firefox correctly refused to accept a new Hazard response without locally verified feedback. Both custom-set offline tests now explicitly download, verify and activate the real study pack before going offline. No product availability guard was weakened.
- Re-running hazard-builder, practice-builder and review-queue after these changes produced 25 passes and 2 failures. Chromium and Firefox pass both installed-pack offline cases. All three browsers pass the other tests in this rerun. Browser-test typechecking passes.

## Initial WebKit finding (resolved by the investigation below)

Both installed-pack custom-document offline navigations fail at `page.goto` with “WebKit encountered an internal error” after `context.setOffline(true)`. Pack download/check/activation succeeds first. The failures reproduce serially as well as with two workers; this is not classified as a transient load problem. It is not yet determined whether this is a product service-worker issue or the automation engine's offline emulation. No test is skipped or weakened to make this green.

Next investigation: isolate a minimal WebKit cached-document navigation and compare real network failure with context offline emulation, while checking service-worker control and exact cached document keys. The broader goal remains active; this finding is not a reason to stop independent implementation work.

Reproduction from apps/site:

```sh
NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 node node_modules/@playwright/test/cli.js test browser-tests/hazard-builder.pw.ts browser-tests/practice-builder.pw.ts browser-tests/review-queue.pw.ts --workers=2
```

## Minimal reproduction and real network-loss verification

`reproduce-webkit-offline.cjs` uses a minimal local HTTP server, one HTML document and a service worker that always returns that cached document. It contains no application code. The pinned WebKit run reported:

```text
ready { controlled: true, cached: true }
emulated-offline-error page.goto: WebKit encountered an internal error
server-stopped Cached document
```

This isolates the internal error to the pinned runtime’s offline-emulation path rather than the application’s custom-set routing. It does not establish behavior for every Safari/WebKit version.

`offline-origin-fixture.ts` now gives each offline test its own origin serving the production `dist` bytes. For WebKit, the test stops that server and closes its connections after real pack activation; Chromium and Firefox use context offline emulation. No route is fulfilled with synthetic study content. The fixture is lazy, so other browser tests continue using the configured preview. Teardown closes each server.

Both custom offline tests now also save a response and assert its feedback is visible with the origin unavailable. This extends the previous document-navigation check to the actual offline study action.

Final rerun: all 27 tests in hazard-builder, practice-builder and review-queue pass across Chromium, Firefox and WebKit. Browser-test typechecking passes. The prior two WebKit errors are no longer an unresolved application compatibility finding under this tested network-loss setup. Final visual audits and other page-family work remain open.

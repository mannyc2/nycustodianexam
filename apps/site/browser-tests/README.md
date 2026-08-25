# M1–M3 browser evidence plus targeted M5 boundary

This directory contains the configured real-browser evidence suite for the
controlled M1–M3 implementation proof plus targeted M5 local-data evidence. It
does not certify a release. The generator currently emits 65 documents from
validated packs, including two question routes, 18 visual and 18 nonvisual
hazard routes, and four public tool pages. Planned destination families without
reviewed machine-readable content are intentionally omitted rather than
represented by placeholders.

It is intentionally separate from `apps/site/test`, whose Vitest suites remain
deterministic unit and worker-harness checks.

## Current execution status

Browser CI is configured as the complete cross-browser gate. On this revision,
browser TypeScript and Playwright discovery include 105 configured executions:
102 standard Vite-preview configurations across Chromium, Firefox, and WebKit,
plus three Cloudflare-preview Chromium configurations. All 34 standard Chromium
cases pass locally on this revision, including 27 M1–M3 cases and seven targeted
M5 cases. All three Cloudflare-preview cases passed locally on the earlier exact
pinned delivery revision. The Firefox and WebKit browser binaries are not
installed locally, so the complete cross-browser matrix remains a separate
CI/release gate.

## Configured automated coverage

- Chromium, Firefox, and WebKit: IndexedDB commit, reload reconciliation,
  shared-database upgrade, bounded failure and reload recovery when an older tab
  blocks that upgrade, validated resumable legacy import, migration quarantine,
  page-lifecycle reconnect, injected write failure, keyboard
  selection/submission, focus transfer, live region mutations, axe WCAG A/AA
  checks, 320 CSS-pixel reflow, minimum target sizing, forced colors, reduced
  motion, and print-media visibility.
- Chromium: service-worker-controlled offline reload after a committed answer,
  update waiting while a session client is active, deterministic cache namespace
  rollover, owned-cache eviction, preservation of unrelated caches, verified
  hazard Blob survival across BFCache with true-unload revocation, and
  fail-closed quarantine of a review attempt whose receipt differs from the
  released bootstrap.
- M5 local-data contracts: correction drafts write only after explicit save,
  restore on reload, and never POST while intake is dormant; a remotely accepted
  report whose local receipt write fails disables network resubmission and can
  retry only the local write; IndexedDB preferences remain authoritative when
  the fast mirror fails and otherwise apply on reload/across tabs; reset reports
  the committing transaction count; portable import rejects semantically invalid
  durable records, previews without writing, quarantines unknown references,
  rechecks parent/dependent records at apply time, commits atomically without
  overwrite, and exports a checked envelope; staged-pack corruption quarantines
  and deletes that generation without displacing the prior active pack; an
  explicit restage activates under a new cache namespace, exposes retained-pack
  actions, preserves historical attempts/latest projections during confirmed
  pack removal, and serves atlas navigation and imagery offline. Completion and
  failure focus targets are asserted for these asynchronous operations.
- Local Cloudflare Workers Static Assets preview: nested-route
  identity/canonical behavior, truthful unknown-route status, static-atlas
  runtime isolation, and precommit answer-leak checks. These delivery-only
  assertions are excluded from the ordinary Vite-preview matrix.

The service-worker update fixture is generated from the finalized built worker,
changes only its deterministic cache namespace, and is deleted after the test.
This exercises the browser's actual install/wait/activate lifecycle without
adding a production-only update endpoint.

## Exact gates still open

- The complete configured matrix above must run against this exact revision
  before any browser-certification claim is made.
- Playwright cannot portably set real browser UI zoom. The 320 CSS-pixel layout
  pressure equivalent is automated; a true 400% zoom pass in supported desktop
  browsers remains manual until a trustworthy browser-grid capability exists.
- DOM focus and live-region mutations are asserted, but emitted speech and
  navigation behavior still need NVDA/JAWS/VoiceOver/TalkBack passes.
- Playwright exposes service workers only in Chromium. Firefox and WebKit cover
  IndexedDB question behavior here, but their service-worker/offline/update
  lifecycle remains a separate real-browser gate.
- The injected failure proves commit-before-reveal for a thrown read-write
  transaction. The blocked-upgrade contract covers one uncooperative prior-v2
  tab; real quota exhaustion, eviction, other multi-tab aborts, and disposal
  races remain uncertified.
- Explicit pack lifecycle has targeted Chromium proof; Firefox/WebKit service-
  worker lifecycle and full release-wide update/removal/eviction certification
  remain open.
- Print media hides screen chrome and retains revealed feedback, but the current
  route has no generated question packet, separate answer key, print manifest,
  deterministic pagination, large-print mode, or automated PDF inspection.
- Axe is an automated ruleset, not a complete WCAG or assistive-technology
  certification. Grayscale print review is also still visual/manual.
- Wrangler preview proves local workerd/static-asset routing only. Remote preview,
  deployment credentials, response-header policy, custom domain, canonical host,
  and any future Worker endpoint remain unconfigured.
- Sitemap generation also remains open.
- M4 simulation/complete print output and the v4→v5 simulation/print portable-
  data integration proof remain open. The complete M5 cross-browser/manual
  certification matrix remains open beyond the targeted cases above.
- No lab/field performance run is introduced here; configured deterministic
  bundle budgets pass locally and remain the only automated performance evidence
  until this revision completes real-browser and release certification.

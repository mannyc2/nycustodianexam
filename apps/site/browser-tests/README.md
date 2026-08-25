# M1–M4 browser evidence boundary

This directory contains the configured real-browser evidence suite for the
controlled M1–M4 implementation proof. It does not certify a release. The
generator currently emits 63 documents from validated packs, including two
question routes, 18 visual and 18 nonvisual hazard routes, four public tool
pages, and the simulation/print setup and opaque local shell routes. Planned
destination families without reviewed machine-readable content
are intentionally omitted rather than represented by placeholders.

It is intentionally separate from `apps/site/test`, whose Vitest suites remain
deterministic unit and worker-harness checks.

## Current execution status

Browser CI is configured as the complete cross-browser gate. The targeted M4
simulation/print slice passes 42 cases across Chromium, Firefox, and WebKit on
this revision. Its local Cloudflare/workerd case separately proves constrained
opaque-shell GET/HEAD routing and rejection of mutation methods. Earlier
application-database, offline/service-worker, accessibility, and true-BFCache
evidence remains part of the wider configured suite; that complete repository
matrix is still a separate release gate.

## Configured automated coverage

- Chromium, Firefox, and WebKit: IndexedDB commit, reload reconciliation,
  shared-database upgrade, bounded failure and reload recovery when an older tab
  blocks that upgrade, validated resumable legacy import, migration quarantine,
  page-lifecycle reconnect, injected write failure, keyboard
  selection/submission, focus transfer, live region mutations, axe WCAG A/AA
  checks, 320 CSS-pixel reflow, minimum target sizing, forced colors, reduced
  motion, and print-media visibility.
- Chromium, Firefox, and WebKit: deterministic question/visual/nonvisual
  simulation creation, autosave/restoration, durable-submit-before-answer-read,
  self-contained evaluated-result restoration after verified-pack removal, and
  deterministic exact-ID print generation/regeneration/product separation.
- Chromium: service-worker-controlled offline reload after a committed answer,
  update waiting while a session client is active, deterministic cache namespace
  rollover, owned-cache eviction, preservation of unrelated caches, verified
  hazard Blob survival across BFCache with true-unload revocation, and
  fail-closed quarantine of a review attempt whose receipt differs from the
  released bootstrap.
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
- The M1–M4 proof is not the product's complete explicit
  download/verify/activate/rollback content-pack lifecycle.
- Deterministic print packets, separate keys, manifests, page-break rules, and
  large-print mode are automated. Browser “Save as PDF,” physical Letter/A4,
  grayscale, clipping, and pagination inspection remain manual certification.
- Axe is an automated ruleset, not a complete WCAG or assistive-technology
  certification. Grayscale print review is also still visual/manual.
- Wrangler preview proves local workerd/static-asset routing only. Remote preview,
  deployment credentials, response-header policy, custom domain, canonical host,
  and any future Worker endpoint remain unconfigured.
- Sitemap generation also remains open.
- M5 content-pack lifecycle, site settings, and corrections flows remain open.
- No lab/field performance run is introduced here; configured deterministic
  bundle budgets pass locally and remain the only automated performance evidence
  until this revision completes real-browser and release certification.

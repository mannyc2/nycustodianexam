# M1–M3 browser evidence boundary

This directory contains the configured real-browser evidence suite for the
controlled M1–M3 implementation proof. It does not certify a release. The
generator currently emits 58 documents from validated packs, including two
question routes, 18 visual and 18 nonvisual hazard routes, and four public tool
pages. Planned destination families without reviewed machine-readable content
are intentionally omitted rather than represented by placeholders.

It is intentionally separate from `apps/site/test`, whose Vitest suites remain
deterministic unit and worker-harness checks.

## Current execution status

Browser CI is configured, but this revision has not been run locally because
the required loopback escalation is unavailable. It has not run remotely
because the branch has not been pushed. The cases below describe configured
coverage, not passing runtime evidence for the current revision. Browser
TypeScript and Playwright discovery pass locally for 87 cases across seven test
files.

## Configured automated coverage

- Chromium, Firefox, and WebKit: IndexedDB commit, reload reconciliation,
  injected write failure, keyboard selection/submission, focus transfer, live
  region mutations, axe WCAG A/AA checks, 320 CSS-pixel reflow, minimum target
  sizing, forced colors, reduced motion, and print-media visibility.
- Chromium: service-worker-controlled offline reload after a committed answer,
  update waiting while a session client is active, deterministic cache namespace
  rollover, owned-cache eviction, preservation of unrelated caches, verified
  hazard Blob survival across BFCache with true-unload revocation, and
  fail-closed quarantine of a review attempt whose receipt differs from the
  released bootstrap.
- Vite preview and local Cloudflare Workers Static Assets preview: nested-route
  identity/canonical behavior, static-atlas runtime isolation, and precommit
  answer-leak checks.

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
  transaction. Real quota exhaustion, eviction, blocked upgrades, multi-tab
  aborts, and disposal races are not certified by that injection.
- The M1–M3 proof is not the product's complete explicit
  download/verify/activate/rollback content-pack lifecycle.
- Print media hides screen chrome and retains revealed feedback, but the current
  route has no generated question packet, separate answer key, print manifest,
  deterministic pagination, large-print mode, or automated PDF inspection.
- Axe is an automated ruleset, not a complete WCAG or assistive-technology
  certification. Grayscale print review is also still visual/manual.
- Wrangler preview proves local workerd/static-asset routing only. Remote preview,
  deployment credentials, response-header policy, custom domain, canonical host,
  and any future Worker endpoint remain unconfigured.
- Sitemap generation also remains open.
- M4/M5 simulation, complete print output, settings, and corrections flows are
  outside this suite and remain open.
- No lab/field performance run is introduced here; configured deterministic
  bundle budgets pass locally and remain the only automated performance evidence
  until this revision completes real-browser and release certification.

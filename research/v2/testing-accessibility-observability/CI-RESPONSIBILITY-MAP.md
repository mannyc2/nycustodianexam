# CI responsibility map

## Pull request gates

Run on every application/content PR once the implementation workspace exists:

- frozen Bun install / dependency cohort checks;
- TypeScript checks;
- pure deterministic transition/property tests;
- Effect service/use-case tests with `@effect/vitest`;
- Schema/compiler fixture validation;
- static answer-leak scans across generated HTML, metadata, filenames, manifests, source maps, SVG/GLB metadata, and public assets;
- production build plus emitted-file/route-closure accounting;
- static semantic HTML/SEO checks;
- representative browser smoke flows where CI supports real browsers.

## Nightly / broader browser gates

Run the full real-browser contract suite across current Chromium, Firefox, and WebKit:

- IndexedDB migrations/transactions/failure injection;
- multi-tab races and stale-tab reconciliation;
- service-worker lifecycle/offline reload;
- pack update/rollback/version pinning;
- renderer focus/live-region behavior;
- automated axe/ACT-aligned accessibility checks;
- reduced-motion, forced-colors, zoom/reflow regression probes where automation is meaningful.

## Release candidate gates

Require:

- all release-blocking browser contracts;
- manual keyboard-only completion;
- representative screen-reader/browser matrix;
- 200%/400% zoom and reflow;
- focus not obscured;
- touch target and non-precision alternatives;
- print and large-print review;
- no color-only states;
- timer controls/untimed alternative;
- production artifact leak scan;
- reviewed bundle/performance regression report;
- offline pack install/update/remove/reload scenarios.

## Cloudflare Worker gates

Only if a Worker application exists:

- current workerd-backed Cloudflare Vitest harness;
- request Schema validation;
- typed error/status mapping;
- binding configuration;
- idempotent correction receipt behavior;
- rate-limit behavior;
- generic security-sensitive responses;
- no free-form submission leakage into ordinary logs/analytics.

## Field monitoring

After launch, consent-compatible first-party field metrics may monitor p75 LCP/INP/CLS and coarse reliability outcomes. Field monitoring informs regression triage; it does not replace deterministic CI or release tests.

## Ownership rule

A test belongs in the lowest-cost environment that truthfully models the behavior. Promote a scenario upward only when the semantics require the higher-fidelity runtime. Never downgrade browser/workerd proof to jsdom, fake IndexedDB, screenshots, or Bun test for convenience.

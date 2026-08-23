# Test, accessibility, performance, and observability decision

## Runner responsibilities

| Layer | Runner/environment | Owns |
|---|---|---|
| pure content/study policy | Bun test or ordinary Vitest by workspace | reducers, scoring, seed/order vectors, migrations, canonicalization, gates |
| Effect services/use cases | Vitest + `@effect/vitest` | Layers, tagged failures, scopes/finalizers, TestClock, interruption, property tests |
| Bun compiler host | Bun test/process integration | file discovery, path confinement, staging/promotion, exit behavior |
| browser contracts | Playwright real Chromium/Firefox/WebKit | IndexedDB, DOM/focus, multi-tab, Service Worker, Cache Storage, offline/reload |
| accessibility automation | Playwright + axe/ACT-aligned checks + custom leak scans | semantics, obvious ARIA/contrast, keyboard mechanics, precommit tree |
| manual release QA | representative browser/AT/device/print matrix | screen reader, zoom/reflow, forced colors, reduced motion, touch, timing |
| optional Worker | Cloudflare workerd-backed Vitest | bindings, isolate/request semantics, streaming/abort/cold-warm behavior |
| production artifact gates | build inspection scripts | route closure, gzip/Brotli, source-map/leak, HTML/SEO/print/offline assets |

No jsdom, fake IndexedDB, in-memory store, API-shaped shim, screenshot, or Node
Worker shape substitutes for the real runtime whose semantics are being asserted.

## Durable-commit suite

Inject and assert:

- storage unavailable/open failure;
- strict transaction abort before/after each write;
- quota failure;
- versionchange blocked;
- duplicate same-ID same-payload retry;
- same-ID conflicting payload;
- uncertain post-commit outcome and reconciliation;
- crash/reload immediately before and after completion;
- two-tab race and stale invalidation;
- selected answer remains editable and no reveal on every non-committed path.

## Pack/offline suite

- network timeout/missing object;
- digest/schema/compatibility failure and quarantine;
- interrupted stage and resumable checkpoint;
- activation abort and prior generation retained;
- active-session version pin after new activation;
- service-worker termination/update and missing/evicted response;
- offline reload with downloaded pack;
- storage pressure/removal behavior;
- export/import checksum/version/unknown-reference quarantine.

## Accessibility/security gates

Before commit, assert absence from DOM, accessibility-facing data, scripts,
source maps, filenames, SVG/GLB metadata, preloads, and manifests of:

- correct option/key;
- correctness styling/state;
- rationales/explanations/source graph;
- full naming image description;
- hazard target count/regions/labels;
- answer-bearing asset names or metadata.

After successful commit, assert semantic focus to the feedback outcome, polite
status announcement without double-speaking, complete rationales/descriptions,
keyboard continuation, and stable hazard zone order.

Manual release coverage includes keyboard-only completion; representative NVDA
or JAWS/Chrome or Firefox and VoiceOver/Safari flows; 200%/400% zoom and reflow;
forced colors/high contrast; reduced motion; no color-only meaning; small-phone
touch targets; timer hide/untimed alternative; grayscale and large print.

This is a WCAG 2.2 AA behavior target, not automated certification.

## Performance

Measure production files/closures, static HTML behavior, and representative
phone/network conditions. Establish the first numeric baseline in the vertical
slice because R2.5 has none. After launch, use consent-compatible first-party p75
LCP/INP/CLS only when enough data exists; synthetic scores remain regression
signals rather than field truth.

## Observability/privacy

Local diagnostics work with telemetry disabled. Optional network events must be
first-party, consented, schema-allowlisted, redacted before send, and retained for
a bounded purpose. Allow only technical outcome classes such as storage failure,
pack lifecycle, restoration, asset-load failure, compiler validation summary,
correction status, and coarse Web Vitals.

Never transmit question/stem/choice/rationale text, source excerpts, free-form
correction text, exact search terms, raw user-bearing URLs, advertising IDs, or
unnecessary identity/location. Security-sensitive leak diagnostics remain local
or restricted, not general analytics.

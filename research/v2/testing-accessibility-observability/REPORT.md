# R2.8 report

## Executive result

Verification should be split by semantic responsibility and runtime truth. No single runner can establish the whole product contract.

Use pure TypeScript tests for deterministic transitions, `@effect/vitest` for Effect-native service/use-case behavior, Bun test for Bun-runtime integration, real browsers for IndexedDB/service-worker/accessibility/rendering behavior, Cloudflare's workerd-backed Vitest tooling for Worker semantics, and production artifacts for bundle/performance/SEO/print gates.

## Effect v4 testing

The current Effect source coordinate evaluated is `Effect-TS/effect@1144032cedda7b5eacc1ebf980d06957c7a59ddf`, which reports `effect@4.0.0-rc.111` and `@effect/vitest@4.0.0-rc.111`.

Current `@effect/vitest` exposes Effect-aware tests, shared Layer tests, property tests over Schema or FastCheck arbitraries, live tests, and scoped effects. Effect's testing package exposes deterministic `TestClock`; `Random.withSeed` supplies deterministic pseudo-random sequences.

Do not infer official Bun-test compatibility from API similarity. Bun test can execute ordinary Effect code, but official Effect test integration is Vitest-based. Bun test therefore owns Bun-runtime mechanics, not the entire Effect verification stack.

## Durable commit before reveal

The invariant remains:

`selection -> COMMITTING -> authoritative IndexedDB transaction completes -> reveal`

Tests must assert failure before or during persistence leaves the answer unrevealed, preserves editable selection, and supports idempotent retry. Browser storage tests must use real IndexedDB. fake-indexeddb or memory adapters are useful secondary tests only.

## Browser/offline layers

Real-browser coverage owns:

- IndexedDB transaction completion/abort and upgrade behavior;
- crash/reload restoration;
- multi-tab duplicate commit and stale-tab behavior;
- BroadcastChannel invalidation;
- Web Locks coordination where used;
- service-worker install/activate/fetch/message lifetime;
- offline reload and missing/evicted assets;
- pack staging, validation, activation, rollback, and active-session version pinning.

Managed Chromium in prior available lanes blocked real-origin IndexedDB execution. Those results stay BLOCKED rather than being replaced by simulated proof.

## Accessibility

Automation is necessary but insufficient. Automated gates should catch semantic-name/role/value defects, obvious contrast/ARIA issues, keyboard reachability regressions where mechanically testable, pre-reveal answer leakage in DOM/accessibility-facing content, target sizing, and selected focus-state rules.

Manual release gates remain required for keyboard-only completion, visible/non-obscured focus, screen-reader flows, live-region timing, 200%/400% zoom and reflow, forced colors, reduced motion, touch operation, timer behavior, no-color-only states, print/large print, and representative browser/AT combinations.

The pre-reveal accessibility gate is a security invariant: no correct option, rationale, answer-bearing full description, target count, correctness styling, or answer-bearing metadata may be reachable through rendered/accessibility-facing state before durable commit.

## Failure injection

Inject deterministic failures at every durable boundary:

- IndexedDB unavailable, quota, versionchange blocked, abort, and unknown post-commit outcome;
- retry after uncertain commit;
- pack network timeout, missing object, checksum/schema failure, activation abort, and recovery;
- crash/reload before and after durable points;
- stale tab and concurrent commit;
- service-worker termination;
- missing cached asset;
- corrupt persisted/imported content;
- correction endpoint timeout/failure;
- export/import interruption or partial-invalid input.

Expected result must specify authoritative state after failure, not merely whether an exception was thrown.

## Performance

Measure production-emitted files and route closures. Gzip and Brotli each emitted transfer file separately. Source maps are excluded from transfer budgets but checked for answer leakage and deployment policy.

Required surfaces include static acquisition/reference routes, initial and incremental question-player closures, hazard player, offline manager, service worker, optional GLB viewer, and optional Worker.

R2.5's final numeric Effect-bearing measurements were unavailable, so this lane deliberately defines no invented byte ceilings. CI should establish measured baselines first, then fail on reviewed regression thresholds.

Field performance gates should use LCP, INP, and CLS at p75 when enough consent-compatible first-party field data exists. Synthetic tests remain regression tools, not substitutes for field distributions.

## Observability and privacy

Local diagnostics should exist without network telemetry. Optional first-party events require consent and strict minimization.

Allowed event families include content-validation outcomes, typed storage failures, pack lifecycle state, restoration outcome, asset-load failure class, correction submission status, coarse Web Vitals, and experiment assignment when an experiment is explicitly running.

Never emit question/stem/choice/rationale text, free-form correction text, exact search input, advertising identifiers, unnecessary identity, IP-derived location, or raw URLs containing user data. IDs should be stable technical identifiers only when needed and should be pseudonymous/minimized.

Retention should be purpose-specific and bounded. Security-sensitive diagnostics remain local or restricted and should not be placed in general analytics.

## CI responsibility

Pull requests should run deterministic source/schema/unit/Effect tests, static leak scans, static-output checks, and production bundle measurement where tooling is available. Browser contract suites should run on representative Chromium/Firefox/WebKit at least before release; expensive AT/manual matrices are release gates. Cloudflare workerd tests run only once a Worker capability exists.

No passing jsdom, fake storage, or screenshot test can substitute for the real browser/runtime layer whose semantics are under review.

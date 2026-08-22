# Effect + standards-first web architecture research

**Research date:** 2026-08-19  
**Status:** current primary-source architecture recommendation  
**Scope:** whether Effect best practices pair well with the recovered HTML/CSS/TypeScript direction, and what should change before implementation.

## Executive conclusion

**Keep the standards-first direction, but make Effect a first-class application architecture dependency and use Vite as the build/dev boundary. Do not introduce Next.js or a UI framework merely to use Effect.**

The recommended starting architecture is:

- semantic static HTML for acquisition/reference routes;
- CSS with native platform semantics and progressive enhancement;
- TypeScript compiled/bundled with Vite;
- stable Effect v3 for domain workflows, typed failures, validation, dependencies, concurrency, retries, resource scopes, and testable service boundaries;
- direct DOM/native-control rendering at the presentation edge initially;
- Workers Static Assets as the Cloudflare deployment target;
- no Worker script until a concrete server-side capability is required;
- a later Worker may host the correction endpoint or other narrowly justified APIs;
- keep a clean view boundary so an interactive UI library can be introduced for application islands if imperative DOM code becomes the dominant complexity.

This is not a compromise against Effect. It follows Effect's own progressive-adoption model: Effect can wrap ordinary platform APIs and expose ordinary Promise/run boundaries at the host edge.

## 1. Does Effect require React, Next, or another UI framework?

No.

Effect describes itself as a TypeScript library/runtime for typed effects, errors, dependency requirements, concurrency, scheduling, schemas, resources, and related application concerns. The core package is not a UI framework. The official project also ships a dedicated browser-platform package, demonstrating browser operation as a first-class target.

Primary sources:

- Effect homepage: https://www.effect.website/
- Effect repository: https://github.com/Effect-TS/effect
- Effect core package README: https://github.com/Effect-TS/effect/blob/main/packages/effect/README.md
- browser platform source: https://github.com/Effect-TS/effect/blob/main/packages/platform-browser/src/BrowserHttpClient.ts

Effect's own adoption guidance explicitly supports entering from ordinary APIs with `Effect.tryPromise` and leaving through `Effect.runPromise`. That is exactly the boundary a standards-first browser application needs.

**Decision:** no framework change is justified solely by adopting Effect.

## 2. Where Effect should own the application

Effect should own logic where the product contract has meaningful failure, state, dependency, cancellation, retry, lifecycle, validation, or concurrency semantics.

### Strong Effect boundaries

Use Effect for:

- content-pack loading and compatibility validation;
- announcement/profile validation and version transitions;
- source-registry and content-object decoding;
- IndexedDB operations and migration workflows;
- atomic attempt/session persistence orchestration;
- offline-pack download/update/checksum/activation workflows;
- retry/backoff and interruption for network operations;
- correction submission and typed server/network errors;
- print-job assembly and deterministic content selection;
- session assembly;
- review scheduling;
- hazard-match computation when integrated into effectful persistence workflows;
- logging/diagnostics at application boundaries;
- dependency injection for storage, clock, random/seed source, network, profile registry, and content registry;
- tests using provided/mocked services rather than browser globals scattered through business logic.

Effect's documented primitives directly support this design: `Effect`, `Context`, `Layer`, `Fiber`, `Stream`, `Schedule`, `Scope`, and `Schema` are the core modules identified by the official package documentation.

### Weak / unnecessary Effect boundaries

Do **not** wrap every trivial browser operation in a service or Effect merely for stylistic purity.

Keep simple presentation operations ordinary when they have no meaningful typed failure/resource/dependency semantics, for example:

- setting text content;
- toggling a class after already-computed state;
- assigning native ARIA/state attributes;
- simple synchronous event delegation;
- focus movement after a successful committed transition;
- static template generation at build time when pure functions suffice.

The rule should be: **Effect owns behavior and side-effect orchestration; the view adapter renders already-decided state.**

## 3. Recommended layering

```text
static/generated semantic HTML
        |
        v
view adapters / DOM controllers
        |
        v
application use-cases (Effect)
        |
        +--> profile/content services (Context + Layer)
        +--> progress/session services
        +--> offline/update services
        +--> correction/network services
        |
        v
platform adapters
        +--> IndexedDB
        +--> fetch / BrowserHttpClient where useful
        +--> Cache API / service worker boundary
        +--> browser clock / crypto / storage estimates
```

Keep domain types and schemas independent of the DOM. A question/session use-case should be testable without creating an HTMLElement.

## 4. Effect coding conventions to adopt

The current Effect repository's generated guidance recommends `Effect.gen` and named `Effect.fn(...)` for readable application code, with combinators layered on where appropriate.

Adopt these rules:

1. Prefer named Effect use-cases over anonymous pipelines for application workflows.
2. Model expected failures as typed domain errors rather than thrown exceptions.
3. Use `Schema` at all untrusted-data boundaries: content JSON, profile data, imported progress, correction responses, and persisted-version migrations.
4. Define services for capabilities, not arbitrary classes. Example: `ProgressStore`, `ContentRegistry`, `ProfileRegistry`, `PackStore`, `CorrectionClient`, `Clock`.
5. Build production and test implementations with Layers.
6. Keep browser globals inside platform adapters rather than importing `window`, `indexedDB`, or `caches` throughout domain modules.
7. Use `Scope` / acquire-release behavior for resources that actually have lifecycle concerns.
8. Use structured concurrency for multi-asset downloads and validation rather than ad-hoc `Promise.all` chains.
9. Use explicit schedules for retry/backoff where retry is appropriate; never retry validation failures or content-integrity failures as though they were transient network failures.
10. Run Effects only at application edges. Avoid scattered `Effect.runPromise` calls deep inside modules.

Primary source: https://github.com/Effect-TS/effect/blob/main/LLMS.md

## 5. Browser and bundling fit

The current Effect core package declares `"sideEffects": []`, exposes modular subpaths, and its build annotates pure calls. These are favorable signals for modern tree-shaking/bundling. The Effect monorepo also contains browser and web-worker testing infrastructure.

This does **not** mean bundle size should be assumed negligible. The product should enforce a bundle budget and measure actual production chunks after the first vertical slice.

Recommended bundle policy:

- import from specific Effect modules/subpaths where practical and consistent with the selected stable version;
- avoid pulling server/provider integrations into browser bundles;
- split heavy optional features by route/mode if measurements justify it;
- measure gzip/brotli production output in CI;
- treat bundle-size regressions as measured engineering facts, not folklore about functional runtimes.

Primary sources:

- https://github.com/Effect-TS/effect/blob/main/packages/effect/package.json
- https://github.com/Effect-TS/effect/blob/main/tsconfig.tests.json

## 6. V3 versus V4

As of this research date, the official Effect repository states that **v4 is beta** and `effect@latest` remains the v3 line. The v4 migration guide says the programming model remains centered on Effect, Layer, Schema, Stream, and related concepts, while package organization/versioning/imports have changed materially. It also explicitly marks a number of v4 modules unstable.

### Recommendation

For an implementation beginning now:

- use stable Effect v3 unless v4 reaches GA before the application scaffold is committed;
- use durable concepts that carry cleanly to v4;
- do not depend on beta-only `effect/unstable/*` APIs for core product behavior;
- pin exact compatible Effect ecosystem versions in the lockfile;
- record the selected Effect major and compatibility policy in architecture docs at scaffold time.

Before the first production dependency lock, re-check whether v4 has reached GA. This is a temporal gate, not a permanent commitment to v3.

Primary sources:

- https://github.com/Effect-TS/effect/blob/main/README.md
- https://github.com/Effect-TS/effect/blob/main/MIGRATION.md

## 7. Effect reactivity and the vanilla DOM

The current v4 repository contains Effect reactivity/Atom infrastructure and framework-specific bindings for React, Vue, and Solid. Those v4 reactivity modules are currently under the unstable module system.

That evidence cuts both ways:

- Effect is compatible with declarative UI frameworks if the product later benefits from one;
- the official project does not establish that a framework is required for browser applications;
- using unstable v4 reactivity merely to avoid writing a small DOM adapter would create unnecessary version risk today.

**Recommendation:** do not adopt Effect's beta reactivity APIs as the site's initial view architecture. Keep application state/use-cases framework-neutral. If view synchronization becomes difficult, evaluate a declarative UI layer for interactive application islands without rewriting domain/use-case code.

Primary sources:

- https://github.com/Effect-TS/effect/blob/main/MIGRATION.md
- https://github.com/Effect-TS/effect/blob/main/packages/atom/vue/src/index.ts

## 8. Does the product's UI complexity force a framework now?

Not yet, but this is the main risk to monitor.

The product has unusually rich interactive screens: committed/revealed question states, simulations with navigation, hazard marking/zoom/pan, review queues, offline version status, settings, and recovery/error states. Imperative DOM code can become difficult if state transitions and rendering are interleaved.

The architecture must therefore enforce a **state-first rendering discipline** from day one:

- Effect use-case computes/returns an explicit view model or state transition;
- one presentation module owns rendering for that screen;
- event handlers call use-cases and render their returned/current state;
- no business rule is encoded in selectors, CSS classes, or ad-hoc DOM inspection;
- no module infers application state by reading rendered DOM;
- route-level controllers are disposable and have explicit teardown.

### Reconsideration trigger

Re-evaluate a declarative UI framework if, during the first vertical slice, any of these occur:

- one player needs multiple competing manual render paths for the same state;
- stale-event/listener teardown bugs appear;
- DOM-diff/update bookkeeping becomes substantial application code;
- accessibility state repeatedly drifts from application state;
- view tests require excessive browser setup to validate otherwise-pure transitions.

If those triggers occur, choose the smallest framework that improves rendering while preserving Effect services/use-cases and static HTML acquisition routes. Do not jump to a server framework as the remedy.

## 9. Cloudflare recommendation

Cloudflare's current best-practices documentation recommends **Workers Static Assets for new projects instead of Pages**. A purely static site needs no Worker script. A Worker can be added later for an API.

Cloudflare's Vite plugin is GA and explicitly supports static sites and standalone Workers. It runs Worker code in `workerd` during development and can build front-end assets for deployment.

### Recommended deployment model

**Phase 1**

```text
Vite build
   -> dist/ semantic HTML + CSS + JS + content/assets
   -> Workers Static Assets
   -> no Worker script
```

**Phase 2, only when needed**

```text
static assets + Worker
                   -> POST /api/corrections
                   -> optional narrow first-party endpoints
```

Do not route every static request through a Worker unless a real requirement appears.

Primary sources:

- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- https://developers.cloudflare.com/workers/vite-plugin/
- https://developers.cloudflare.com/workers/vite-plugin/get-started/

## 10. Vite recommendation

Use Vite as **tooling**, not as the application architecture.

Reasons:

- TypeScript/ESM dev server and production bundling;
- official Cloudflare Vite integration;
- static-site support without React/Vue/etc.;
- clean path to a Worker environment later;
- measurable bundle output;
- no requirement to make reference pages into client-rendered SPA routes.

The site can have many generated HTML entry points. Vite's role is compiling assets and orchestrating the build, not owning navigation or rendering.

## 11. Testing recommendation

Use two layers:

1. **fast Effect/domain tests** for schemas, services, session assembly, errors, review scheduling, content compatibility, and state transitions;
2. **real browser tests** for DOM/accessibility/reveal behavior, IndexedDB, service workers, print behavior, pointer interactions, focus, and offline flows.

If a Worker is introduced, Cloudflare currently provides a Vitest integration that runs against Workers semantics. Use it for Worker-side code rather than mocking Cloudflare bindings in Node.

Primary source: https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/

Do not assume one test runner must cover all environments.

## 12. What changes from the recovered architecture decision

The prior decision "HTML/CSS/TypeScript; exact build tool unresolved" should be refined to:

### Resolved now

- standards-first HTML/CSS remains;
- Effect is the preferred application/domain runtime and standard library for nontrivial TypeScript behavior;
- Vite is the preferred build/dev tool;
- Cloudflare Workers Static Assets is the preferred deployment target;
- no Worker script is required initially;
- no Next.js;
- no UI framework is required initially;
- stable Effect line is preferred over v4 beta for the first scaffold unless v4 is GA when dependencies are locked.

### Still intentionally open

- package manager;
- exact static HTML generation implementation;
- service-worker implementation/tooling;
- whether the first vertical slice proves a declarative UI library is warranted for interactive islands;
- final Effect major at dependency-lock time if v4 reaches GA first;
- first-party analytics implementation;
- exact correction-endpoint design and storage.

## 13. First vertical slice required before freezing UI architecture

Build one representative end-to-end slice before declaring vanilla DOM permanently sufficient:

1. static indexable question/practice landing HTML;
2. one visual question player;
3. explicit select -> commit -> reveal state machine;
4. typed Effect service for attempt persistence;
5. IndexedDB adapter;
6. Schema-validated content fixture;
7. neutral pre-answer accessibility description and post-answer full description;
8. reload restoration;
9. offline cached execution;
10. browser test of no-answer leakage before commit;
11. Effect unit tests with a fake persistence layer;
12. production bundle report.

Only after this slice should the project decide whether direct DOM controllers remain the best presentation layer.

## Decision

**Effect pairs well with the standards-first stack. Do not reconsider the stack merely because Effect is central. Refine it to standards-first HTML/CSS + Vite + TypeScript/Effect, with Cloudflare Workers Static Assets. Preserve a replaceable presentation boundary and use the first vertical slice as the evidence gate for whether a small declarative UI framework is warranted.**

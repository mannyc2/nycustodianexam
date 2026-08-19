# Architecture constraints and decisions

**Status:** current implementation constraints, updated 2026-08-19 after primary-source Effect/Cloudflare research. This file records decisions made after the recovered v1 feature-design pass. It does not replace the product behavior contract or the exam-fact corpus.

See `research/architecture/EFFECT_VANILLA_CLOUDFLARE_2026-08-19.md` for the evidence and reasoning behind the Effect/Vite/Cloudflare decisions below.

## Resolved

### Standards-first HTML and CSS remain the presentation foundation

Do **not** use Next.js. Do not introduce React, Vue, Solid, Svelte, or another UI framework merely because the product has interactive study modes or because Effect is being adopted.

The site is designed as a standards-first web application:

- acquisition/reference pages expose useful semantic HTML without requiring client-side rendering;
- native HTML controls and semantics are preferred over custom-widget abstractions;
- the browser does not need a SPA router to reach indexable content;
- application state is never inferred by scraping the rendered DOM;
- business/domain rules remain independent of presentation code.

A declarative UI library remains an evidence-gated option for **interactive application islands only** if the first vertical slice demonstrates that manual DOM synchronization is becoming a material source of complexity or accessibility drift. A view-layer reconsideration does not imply reconsidering static/indexable HTML or adopting a server framework.

### Effect is the preferred application/runtime architecture for nontrivial TypeScript behavior

Use Effect best practices for behavior with meaningful failure, dependency, lifecycle, concurrency, retry, cancellation, validation, or persistence semantics.

Effect should own, among other things:

- profile/content-pack validation and compatibility;
- Schema decoding at untrusted-data boundaries;
- IndexedDB persistence workflows and migrations;
- session/attempt orchestration;
- offline pack download, validation, update, and activation;
- typed correction/network failures;
- review scheduling and deterministic session assembly;
- dependency services and Layers for storage, network, clock, content/profile registries, and related capabilities;
- structured concurrency, schedules, and scopes where those semantics are real.

Do not make trivial rendering operations Effectful merely for stylistic purity. **Effect owns application behavior and side-effect orchestration; presentation adapters render explicit state.**

Run Effects at application edges rather than scattering `Effect.runPromise` through domain modules. Prefer typed expected errors over thrown exceptions, and keep browser globals inside adapters/services rather than throughout business logic.

### Stable Effect release line at scaffold time

As of 2026-08-19, Effect v4 remains beta and the official project identifies `effect@latest` as the stable v3 line.

For the first implementation scaffold:

- prefer stable Effect v3 if implementation starts while v4 is still beta;
- if v4 reaches GA before dependencies are locked, re-evaluate using the GA release rather than mechanically choosing v3;
- avoid beta-only/unstable Effect modules for core product behavior;
- build around durable Effect concepts (`Effect`, `Layer`, `Context`, `Schema`, `Stream`, `Schedule`, `Scope`) that carry across the major-version transition;
- pin compatible Effect ecosystem versions and record the selected major at dependency-lock time.

### Vite is the preferred build and development tool

Use **Vite as tooling, not as the application framework**.

Vite should provide:

- TypeScript/ESM development and production bundling;
- asset processing and production chunk output;
- integration with Cloudflare's official Vite plugin when a Worker environment exists;
- build orchestration for generated static HTML and client scripts;
- measurable bundle artifacts for size budgets.

Vite does not own routing, application state, or the requirement that reference/acquisition pages remain crawlable HTML.

### Cloudflare Workers Static Assets is the preferred deployment target

Cloudflare's current best-practices guidance recommends Workers Static Assets for new static/full-stack projects rather than Pages.

Initial deployment should therefore be:

```text
Vite/static generation
      -> dist/ HTML + CSS + JS + content/assets
      -> Cloudflare Workers Static Assets
      -> no Worker script required
```

Do **not** add a Worker merely to serve static files. Add Worker code only when a real server-side capability exists, such as the correction endpoint or another narrowly justified API.

If Worker code is introduced, use Cloudflare's official Vite integration and test Worker behavior against the Workers runtime rather than assuming Node semantics.

### Research prose is not runtime content

Keep three distinct layers:

- `docs/` — human-readable factual research and scope authority;
- future machine-readable publication data — reviewed exam profiles, sources, tools, questions, scenes, translations, and content-pack manifests;
- site implementation — rendering, interaction, print, offline, and validation code.

Mutable announcement facts and scored content must not exist only as handwritten page prose.

## Required Effect/view boundary

The first implementation must preserve this logical separation:

```text
static/generated semantic HTML
        |
        v
view adapters / DOM controllers
        |
        v
application use-cases (Effect)
        |
        +--> profile/content services
        +--> progress/session services
        +--> offline/update services
        +--> correction/network services
        |
        v
platform adapters
        +--> IndexedDB
        +--> fetch / browser HTTP
        +--> Cache API / service-worker boundary
        +--> browser clock / crypto / storage
```

A player/session use-case must be testable without constructing an `HTMLElement`.

## UI-framework reconsideration gate

Do not freeze "vanilla DOM forever" before one representative vertical slice exists.

Reconsider a small declarative UI layer only if the slice demonstrates one or more of these:

- multiple competing manual render paths for the same player state;
- stale listener or teardown bugs;
- substantial DOM diff/update bookkeeping;
- accessibility state repeatedly drifting from application state;
- otherwise-pure application transitions becoming difficult to test because view code and behavior are interleaved.

If none of those appear, direct DOM/native-control adapters remain the preferred lower-complexity presentation layer.

## First vertical slice required before presentation architecture is frozen

The first slice should include:

1. static indexable practice landing HTML;
2. one visual question player;
3. select -> explicit commit -> reveal state machine;
4. typed Effect use-case for attempt persistence;
5. IndexedDB adapter supplied through a service/Layer boundary;
6. Schema-validated content fixture;
7. neutral pre-answer accessibility description and post-answer full description;
8. reload restoration;
9. offline cached execution;
10. browser assertion that answer-bearing content is absent before commit;
11. Effect tests with fake platform services; and
12. a production bundle-size report.

Use this slice as evidence for whether a UI framework earns its cost.

## Testing direction

Use separate test layers rather than forcing one environment to simulate everything:

- Effect/domain tests for schemas, service behavior, typed errors, scheduling, compatibility, state transitions, and deterministic assembly;
- real browser tests for DOM semantics, accessibility tree behavior, IndexedDB, service workers, pointer/touch, focus, print, and offline workflows;
- if a Cloudflare Worker is added, use Cloudflare's Workers test integration/runtime for Worker-side behavior.

## Bundle discipline

Effect's current package metadata is designed to be tree-shakable, but bundle cost must be measured rather than assumed.

- keep server/provider-specific integrations out of browser chunks;
- favor appropriate modular imports for the selected stable Effect major;
- split optional heavy modes only when measurements justify it;
- record production compressed sizes in CI once application code exists;
- treat bundle regressions as measured engineering failures, not folklore about Effect or functional programming.

## Non-negotiable properties inherited from the product contract

- Crawlable, indexable HTML for acquisition/reference pages.
- Versioned announcement facts; unknown values remain visibly unknown.
- Local-first progress with no required account.
- Installable/offline behavior with explicit content-pack handling rather than accidental cache-only UX.
- Deterministic print output from the same validated content.
- WCAG 2.2 behavior and nonvisual equivalents as first-class requirements.
- No answer/reveal leakage through rendered DOM, accessible names, user-facing metadata, or asset naming before commitment.
- Original or independently rights-cleared images only.
- No third-party behavioral advertising/tracking requirement.
- A minimal or absent backend until a concrete feature requires one.

## Still open

- package manager;
- exact static HTML generation implementation;
- machine-readable content format and concrete Schema definitions;
- service-worker implementation/tooling and cache/version protocol;
- exact CSS organization/design-token strategy;
- whether the vertical slice warrants a declarative UI library for application islands;
- final Effect major if v4 reaches GA before dependency lock;
- first-party analytics choice, if any;
- correction endpoint implementation/storage;
- custom-domain/canonical-host configuration.

These remaining choices should be resolved from primary sources and implementation evidence rather than framework convention.

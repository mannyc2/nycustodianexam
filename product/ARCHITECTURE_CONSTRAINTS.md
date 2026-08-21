# Architecture constraints and decisions

**Status:** current maintainer constraints, updated 2026-08-21 after normalizing the initial parallel research pass. This file records accepted direction and explicit research gates. It does not replace the product behavior contract or the exam-fact corpus.

The first-pass reports are preserved under `research/initial-pass/`. They remain evidence, not current authority. Several were written against Effect v3 or early Effect v4 release candidates and therefore require a current v4/Bun redo before implementation details are frozen.

## Resolved constraints

### Latest Effect v4 is the project target

The application and all new architecture research MUST target the **latest available Effect v4 line** at the time dependencies are locked.

- Do not choose Effect v3 as a production fallback.
- Do not copy v3 APIs, package boundaries, or service patterns forward merely because an older report used them.
- Pin the exact selected Effect v4 version and compatible ecosystem cohort once the dependency-lock decision is made.
- Re-check current official Effect documentation, source, migration guidance, package metadata, and examples at the start of every version-sensitive research or implementation task.
- Prefer current v4-native service, Layer, Schema, runtime, platform, testing, and reactivity patterns.
- Treat `effect/unstable/*` or equivalent unstable surfaces according to their actual current status; the requirement to use v4 does not convert unstable APIs into silently accepted production dependencies.

The initial v3-era reports remain useful for problem framing, measurements, browser semantics, and failure modes. Their exact package/version/API recommendations are historical only.

### Effect should shape the architecture, not decorate it

Effect owns behavior with meaningful failure, dependency, lifecycle, resource, concurrency, retry, validation, persistence, or observability semantics.

The implementation should follow current Effect patterns closely:

- cohesive capability services rather than one service per function;
- Layers that assemble real runtime capabilities rather than a giant invisible application container;
- typed expected failures rather than thrown exceptions or defect conversion;
- Schema at every untrusted or persisted data boundary;
- scoped resource ownership and structured concurrency where provider semantics support them;
- runtime execution at application boundaries rather than scattered `runPromise` calls;
- deterministic Clock/Random dependencies where behavior must be reproducible;
- explicit platform implementations for browser, build, Cloudflare, service-worker, and test runtimes;
- renderer-neutral application state and use cases that can be tested without DOM construction.

Avoid carrying forward a generic Clean Architecture folder tree such as `domain/application/ports/adapters/ui` as the organizing principle. Package and module boundaries should follow cohesive product capabilities and current Effect composition patterns.

Effect does not need to wrap:

- pure deterministic functions;
- static HTML generation that has no runtime capability needs;
- trivial DOM property updates;
- native browser values merely to hide a global.

### Bun is the workspace and tooling direction

Use **Bun** for the monorepo's package-management and workspace baseline.

- Use Bun workspaces.
- Use Bun's lockfile and workspace dependency protocol/conventions.
- Prefer Bun scripts, task execution, testing, and runtime capabilities where they fit the selected tools and are supported by the relevant packages.
- Do not introduce pnpm/npm/yarn workspace assumptions into new architecture work.
- Do not install both Node- and Bun-specific Effect platform implementations without a demonstrated runtime requirement.
- Vite and Cloudflare tooling may still run within the Bun-managed workspace; Bun ownership of the workspace does not mean replacing every specialist build/deployment tool.

### Top-level monorepo shape

The implementation repository will use:

```text
apps/
packages/
```

The exact workspace packages are intentionally not frozen yet. New research must determine a small, Effect-native package graph rather than producing many ceremonial packages.

Likely responsibilities to evaluate include:

```text
apps/
  site/                  # generated/static HTML plus interactive study application
  content-compiler/      # build-time publication/compiler executable, if an app is justified
  worker/                # optional Cloudflare Worker only when a real server capability exists

packages/
  domain-or-content capabilities
  schemas and compiler model
  browser persistence/platform implementation
  Cloudflare implementation
  renderer/view integration
  shared testing support
```

Those names are illustrative, not accepted package names. A package is justified only by a real dependency, runtime, publication, or ownership boundary.

Do not create:

- a package for every service;
- a universal `core` dumping ground;
- mirrored `ports` and `adapters` packages without a concrete runtime substitution need;
- a framework-specific package before the rendering decision is made;
- an empty `apps/worker` merely because Cloudflare is planned.

### Standards-first HTML and CSS remain the presentation foundation

Do **not** use Next.js.

- Acquisition/reference pages expose useful semantic HTML without requiring client-side rendering.
- Native HTML controls and semantics are preferred.
- Indexable pages do not depend on a SPA router.
- Business/application state is not inferred by scraping the DOM.
- Static pages should not import the Effect runtime unless they contain a real interactive capability that requires it.
- CSS and page generation remain independent of the choice of interactive renderer.

No renderer is selected yet. Direct DOM controllers, Effect v4 reactivity, Effect ecosystem integrations, Web Components, and small declarative renderers must be re-evaluated against current v4 APIs and one representative player spike.

A UI library may be adopted for interactive islands if it materially improves correctness, accessibility, lifecycle ownership, or state synchronization. That would not authorize converting the site into a client-rendered acquisition SPA.

### Vite and Cloudflare remain the preferred web delivery direction

Use Vite as browser build/development tooling unless the v4/Bun research produces stronger evidence for another small tool.

Use Cloudflare Workers Static Assets as the preferred deployment direction. Do not add Worker code merely to serve static files.

The intended shape remains:

```text
Bun workspace
  -> content compiler / static generation
  -> semantic HTML + CSS
  -> Vite-built interactive chunks
  -> Cloudflare Workers Static Assets
  -> optional narrow Worker only for justified server capabilities
```

Exact Vite, Cloudflare plugin, Wrangler, routing, caching, headers, service-worker, and preview-deployment configuration remains open until the new research pass.

### Research prose is not runtime content

Keep distinct:

- `docs/` — human-readable factual research and scope authority;
- machine-readable publication data — reviewed profiles, claims, tools, questions, scenes, translations, sources, geometry records, and pack manifests;
- application/build code — compiler, validation, rendering, interaction, persistence, print, and offline behavior;
- `research/` — raw evidence and proposals.

Mutable announcement facts and scored content must not exist only as handwritten page prose.

## Maintained product invariants

The architecture must preserve:

- crawlable, indexable acquisition/reference HTML;
- versioned announcement facts with visible unknown/conflicting states;
- local-first progress with no required account;
- explicit offline content packs rather than accidental cache-only behavior;
- deterministic simulation and print outputs;
- WCAG 2.2 behavior and first-class nonvisual equivalents;
- no answer/reveal leakage through DOM, accessibility data, filenames, manifests, SVG/GLB metadata, or static assets before commitment;
- original or independently rights-cleared assets;
- no third-party behavioral advertising/tracking requirement;
- a minimal or absent backend until a concrete feature requires one.

### Durable commit-before-reveal rule

In normal persistent study mode:

```text
select
  -> explicit commit request
  -> one durable IndexedDB transaction completes
  -> reveal correctness and explanations
```

Do not reveal after only an in-memory commit while durable persistence has failed. A separately labeled nonpersistent mode may exist only after explicit learner acknowledgment and must define its own truthful commit semantics.

## Required future research discipline

Every new parallel research prompt must:

1. target latest Effect v4 explicitly;
2. require Bun and Bun-workspace analysis;
3. assume top-level `apps/` and `packages/`;
4. require current official Effect primary sources for version-sensitive conclusions;
5. ask for Effect-native patterns rather than generic ports/adapters architecture;
6. require use of `@GitHub` or the connected GitHub tool;
7. create a dedicated branch from an immutable base;
8. commit and push exact raw reports and machine-readable outputs;
9. open a draft PR;
10. return branch, head SHA, commit, and PR receipts;
11. stop instead of silently producing sandbox-only output when GitHub write access is unavailable.

The user also requested alignment with ideas in a `SKILL.md`. No project-relevant `SKILL.md` was present in the repository or supplied research archive during this normalization pass. Future prompts must identify and attach/read the exact intended file before claiming conformance.

## Still open

- exact latest Effect v4 version/cohort to pin;
- exact Bun version and lockfile policy;
- exact Bun workspace/package graph under `apps/` and `packages/`;
- current v4 service/Layer/runtime conventions for each runtime;
- current v4 Platform/browser/Cloudflare package choices;
- content compiler workspace and concrete Effect Schema definitions;
- IndexedDB provider and transaction API under v4;
- service-worker ownership/tooling and cache/version protocol;
- UI state/reactivity and renderer choice;
- exact Vite/Bun integration and chunk boundaries;
- Cloudflare configuration and optional Worker API architecture;
- test runner, browser tests, Effect test integration, and accessibility tooling;
- measured v4/Bun bundle budgets;
- CSS organization/design tokens;
- first-party observability/analytics choice, if any;
- correction endpoint implementation/storage;
- custom-domain/canonical-host configuration;
- the exact `SKILL.md` whose ideas should govern the next prompts.

Resolve these through the improved v4/Bun research program and implementation evidence, not by carrying first-pass defaults forward.

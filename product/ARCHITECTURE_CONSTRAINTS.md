# Architecture constraints and decisions

**Status:** maintained constraints, updated 2026-08-21 after normalizing the initial research pass and curating the second-pass Effect v4/Bun research foundation. This file records accepted direction and explicit research gates. It does not replace the product behavior contract or the exam-fact corpus.

Supporting material:

- first-pass raw and normalized research: `../research/initial-pass/`;
- prompt-curation report and source ledger: `../research/prompt-curation/`;
- second-pass research program: `../prompts/research-v2/`.

## Resolved constraints

### Latest Effect v4 is the project target

The application and all new architecture research MUST target the **latest available Effect v4 line** at the time each research coordinate is established and at dependency lock.

- Do not choose Effect v3 as a production fallback.
- Use v3 only as explicitly labeled historical, migration, or regression evidence.
- Do not copy v3 APIs, package boundaries, or service patterns forward merely because an older report used them.
- Pin the exact selected Effect v4 version and every compatible ecosystem package as one coordinated cohort.
- Re-check current official Effect documentation, source, migration guidance, package metadata, releases, and installed package guidance at the start of every version-sensitive task.
- The requirement to use v4 does not silently approve every `effect/unstable/*` API. Record its status, need, isolation boundary, replacement cost, and migration risk.

At curation time, Effect upstream commit `436f10d1efccec308426532ff3f88df9a96434f3` reported `effect@4.0.0-rc.111` and matching browser, Bun, atom, and testing ecosystem versions. That is a dated evidence coordinate, not a permanent dependency lock. Every research lane must establish the actual latest v4 coordinate when it begins.

### Official Effect skill and installed-package guidance govern code-level work

The intended skill is the official Effect setup skill:

```text
Effect-TS/skills
skills/effect-ts/SKILL.md
```

Its package-manager-neutral intent is maintained here and adapted to Bun.

When the real Bun workspace is created:

- install the exact selected `effect` v4 package as a root development dependency so agents can access package-local guidance and source;
- require every workspace that imports Effect at runtime to declare its own explicit runtime dependency, normally through the Bun catalog;
- do not rely on root hoisting or phantom dependencies.

Before writing or reviewing Effect code:

1. read `node_modules/effect/AGENTS.md` completely;
2. follow the relevant linked package-local documentation;
3. inspect `node_modules/effect/src` and installed platform-package source when the guide does not settle the question;
4. use the exact installed package as the implementation source of truth;
5. do not mechanically translate v3 examples.

Research fixtures created before the root workspace exists must be private Bun packages under the lane’s authorized research directory, with exact versions and committed `package.json` and `bun.lock`.

### Effect should shape the architecture, not decorate it

Effect owns behavior with meaningful failure, dependency, lifecycle, resource, concurrency, retry, validation, persistence, time, randomness, or observability semantics.

Current package guidance establishes defaults the second pass must verify at its exact selected coordinate, including where applicable:

- `Effect.gen` for effectful workflows;
- named `Effect.fn` for effect-returning functions;
- Schema classes/models and `Schema.TaggedError` for modeled expected failures;
- `Context.Service` for cohesive capability services;
- package/path-qualified service identifiers;
- focused implementation Layers composed at runtime roots;
- `Context.Reference` for defaulted values/configuration semantics;
- Scope/acquire-release for owned resources;
- `Layer.effectDiscard` for owned background work that exposes no service;
- BunRuntime/Layer launch patterns for Bun entrypoints;
- ManagedRuntime only at an imperative external boundary;
- Clock/DateTime/Random for deterministic behavior;
- official Effect testing integrations where they fit.

These defaults are not permission for cargo-cult abstractions. A lane may recommend a different local pattern when it cites current official evidence and explains why the default does not fit.

Use:

- cohesive capability services rather than one service per function;
- Layers that assemble real runtime capabilities rather than a giant invisible application container;
- typed expected failures rather than thrown exceptions or defect conversion;
- Schema at every untrusted or persisted data boundary;
- scoped resource ownership and structured concurrency where provider semantics support them;
- runtime execution at application boundaries rather than scattered `runPromise`/`runFork` calls;
- renderer-neutral application state and use cases testable without DOM construction.

Avoid carrying forward a generic Clean Architecture tree such as:

```text
domain/
application/
ports/
adapters/
ui/
```

as the organizing principle. Package and module boundaries must follow cohesive capabilities, runtime roots, ownership, publication/build needs, and current Effect composition patterns.

Do not create:

- a service per function;
- a package per service;
- a universal `core` dumping ground;
- one giant application service;
- one giant Layer that hides the dependency graph;
- runtime or Layer construction in every event handler;
- browser services that merely rename deterministic native values;
- a home-grown renderer in Effect.

Effect does not need to wrap:

- pure deterministic functions;
- static HTML generation with no runtime capability need;
- trivial DOM property updates;
- immutable values merely to hide a global.

### Bun is the package-management and workspace baseline

Use **Bun** for package management, workspace orchestration, scripts, and the primary TypeScript tooling/runtime direction where Bun semantics fit.

The expected baseline is:

- private root package;
- Bun workspaces;
- top-level `apps/*` and `packages/*`;
- root Bun catalog containing the exact coordinated Effect v4 cohort and deliberately shared tooling versions;
- explicit `workspace:*` dependencies;
- isolated linker unless a measured tool incompatibility requires an exception;
- committed text `bun.lock`;
- `bun ci` or the current frozen-lockfile equivalent in CI;
- minimal reviewed `trustedDependencies`/lifecycle-script permissions;
- explicit dependencies in every consuming workspace;
- filtered and dependency-aware scripts where current Bun behavior fits;
- runtime-specific TypeScript configuration and type libraries;
- duplicate/mismatched Effect cohort detection.

Do not introduce pnpm/npm/yarn workspace assumptions into new architecture work. Do not rely on root hoisting or undeclared imports.

Bun manages the workspace but does not make every runtime a Bun runtime:

- browser packages must not gain Bun globals/types by accident;
- a service worker follows browser worker lifecycle semantics;
- a Cloudflare Worker follows workerd/Web semantics;
- the Bun content compiler/tooling may use Bun APIs when justified;
- Vite, Wrangler, Playwright, and specialist non-TypeScript tools remain when they earn their role.

The exact Bun version remains a dependency-lock decision and a lane-start evidence coordinate. At curation time the official Bun site identified `1.3.14` as current.

### Top-level monorepo shape

The implementation repository will use:

```text
apps/
packages/
```

The exact children are intentionally not frozen. A workspace is justified by at least one real boundary:

- executable/deployable runtime;
- separately buildable or publishable artifact;
- clear ownership and dependency direction;
- reusable capability with multiple consumers;
- runtime-specific implementation;
- independent testing or release requirement.

Likely responsibilities to evaluate include:

```text
apps/
  site/                  # generated/static HTML plus interactive study application
  content-compiler/      # Bun build-time publication/compiler executable, if an app is justified
  worker/                # optional Cloudflare Worker only after a server capability exists

packages/
  reviewed content/schema/compiler capabilities
  shared application capabilities
  browser persistence/platform implementation
  optional Cloudflare implementation
  renderer/view integration after renderer selection
  shared test support only when genuinely reused
```

Those are illustrative responsibilities, not accepted names.

Do not create:

- a package for every service;
- mirrored `ports` and `adapters` packages without a concrete runtime substitution need;
- framework-specific packages before renderer selection;
- an empty Worker app merely because Cloudflare is planned.

### Standards-first HTML and CSS remain the presentation foundation

Do **not** use Next.js.

- Acquisition/reference pages expose useful semantic HTML without requiring client-side rendering.
- Native HTML controls and semantics are preferred.
- Indexable pages do not depend on a SPA router.
- Business/application state is not inferred by scraping the DOM.
- Static pages should not import the Effect study runtime unless a real interactive capability requires it.
- CSS and static page generation remain independent of the interactive renderer choice.

No renderer is selected yet. The current-v4 UI lane must evaluate direct DOM, current v4 reactivity/Atom APIs and bindings, Web Components, small declarative renderers, and candidate view libraries against one representative player spike.

A UI library may be adopted for interactive islands if it materially improves correctness, accessibility, lifecycle ownership, keyed-list/state synchronization, or maintainability. That does not authorize converting acquisition pages into a client-rendered SPA.

Effect does not become the renderer.

### Vite and Cloudflare remain the preferred web-delivery direction

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

Exact Vite, Cloudflare plugin, Wrangler, routing, caching, headers, service-worker, preview-deployment, and optional Worker HTTP configuration remains open until the second pass.

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
- no answer/reveal leakage through DOM, accessibility data, filenames, source maps, manifests, SVG/GLB metadata, or static assets before commitment;
- original or independently rights-cleared assets;
- no third-party behavioral advertising/tracking requirement;
- a minimal or absent backend until a concrete feature requires one.

### Durable commit-before-reveal rule

In normal persistent study mode:

```text
select
  -> explicit commit request
  -> one authoritative IndexedDB transaction completes
  -> reveal correctness and explanations
```

Do not reveal after only an in-memory commit while durable persistence has failed. A failure leaves the answer selected but uncommitted, exposes a typed recoverable failure, and permits an idempotent retry without duplicate attempt/review records.

A separately labeled nonpersistent mode may exist only after explicit learner acknowledgment and must define its own truthful commit semantics.

## Required second-pass research discipline

Every lane under `prompts/research-v2/` must:

1. use the exact immutable source SHA stamped after this curation PR is merged;
2. target latest Effect v4 explicitly;
3. establish exact current Effect and Bun coordinates at lane start;
4. read the installed `node_modules/effect/AGENTS.md` completely before code-level Effect work;
5. inspect installed source when package guidance is insufficient;
6. require Bun and Bun-workspace analysis;
7. assume top-level `apps/` and `packages/` without preselecting the child package graph;
8. ask for Effect-native patterns rather than generic ports/adapters architecture;
9. use the connected `@GitHub` capability;
10. create a branch, initial receipt commit/push, and draft PR before extended research;
11. commit exact reports, source ledgers, fixtures, lockfiles, raw results, and checksums;
12. push incrementally and return final branch/head/PR receipts;
13. stop when GitHub writes are unavailable.

## Curated research program

### P0 architecture-critical lanes

- latest-v4 core architecture and Effect-native Bun workspace topology;
- latest-v4 UI state/reactivity/lifecycle/renderer integration;
- latest-v4 Platform/runtime capability matrix for browser, Bun, service worker, and Cloudflare;
- latest-v4 IndexedDB/offline-pack architecture;
- latest-v4 browser bundling under Bun workspaces.

### P1 supporting architecture lanes

- latest-v4 Schema content compiler and relational publication gates;
- Bun monorepo/build/CI discipline;
- testing, accessibility, performance, and observability.

### P2 specialist lanes

- hazard-scene production architecture;
- deterministic geometry evidence/POC audit.

A final synthesis lane proposes maintained decisions and the first implementation vertical slice. It does not implement the application.

## Still open

- exact Effect v4 cohort to lock after lane-start verification;
- exact Bun version and root workspace configuration;
- exact workspace/package graph below `apps/` and `packages/`;
- service and Layer topology per runtime;
- current v4 Platform/browser/Cloudflare choices;
- content compiler workspace and concrete Schema model;
- IndexedDB provider and transaction API under v4;
- service-worker ownership/cache/version protocol;
- UI state/reactivity and renderer choice;
- exact Vite/Bun chunk boundaries and measured budgets;
- Cloudflare configuration and optional Worker API architecture;
- test runner responsibilities and browser/accessibility tooling;
- CSS organization/design tokens;
- first-party observability/analytics choice, if any;
- correction endpoint implementation/storage;
- custom-domain/canonical-host configuration;
- hazard-scene production method;
- production approval of any geometry asset.

Resolve these through the curated second-pass program and implementation evidence, not by carrying first-pass defaults forward.
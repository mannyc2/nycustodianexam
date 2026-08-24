# Architecture constraints and decisions

**Status:** maintained constraints, updated 2026-08-23 after the reconciled R2.90
architecture synthesis, visual-authoring resolution, canonical route/state
planning, and the maintainer's React 19 composition decision. This file records
accepted direction and explicit implementation gates. It does not replace the
product behavior contract or the exam-fact corpus.

Supporting material:

- first-pass raw and normalized research: `../research/initial-pass/`;
- prompt-curation report and source ledger: `../research/prompt-curation/`;
- completed second-pass synthesis: `../research/v2/architecture-synthesis/`;
- canonical routes and screen states: `ROUTES.md` and `SCREEN_STATES.md`;
- preserved second-pass research program/provenance: `../prompts/research-v2/`.

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

In the Bun workspace:

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

The completed second pass established these defaults. Implementation must still
verify them against the exact installed cohort, including where applicable:

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

R2.90 selected Bun `1.4.0` for the first scaffold. Its target-toolchain gate
passed on 2026-08-23 using the checksum-verified official Linux x64 release: a
clean isolated-linker `--frozen-lockfile` install preserved the committed lock
byte-for-byte, the direct workspace imports were backed by explicit dependency
edges, and the full verifier passed without a version override. Vitest remains
Node-hosted on exact Node `22.22.0` under the specialist-tool exception; Bun owns installation,
workspace orchestration, content compilation, and Bun-authored scripts.

### Top-level monorepo shape

The implementation repository will use:

```text
apps/
packages/
```

R2.90 selected the smallest earned initial graph:

```text
apps/
  site/                  # generated static documents plus React 19 islands
  content-compiler/      # finite Bun publication/compiler executable

packages/
  content/               # Schema, registries, publication gates, safe outputs
```

Study policy and React integration begin inside `apps/site`; a separate shared
package is earned only by a second real consumer. A future workspace is
justified by at least one real boundary:

- executable/deployable runtime;
- separately buildable or publishable artifact;
- clear ownership and dependency direction;
- reusable capability with multiple consumers;
- runtime-specific implementation;
- independent testing or release requirement.

Do not create:

- a package for every service;
- mirrored `ports` and `adapters` packages without a concrete runtime substitution need;
- a React/component package before reuse, ownership, build, or publication needs
  earn that boundary;
- an empty Worker app merely because Cloudflare is planned.

### Standards-first documents with React 19 interactive islands

Do **not** use Next.js.

- Acquisition/reference pages expose useful semantic HTML without requiring client-side rendering.
- Native HTML controls and semantics are preferred.
- Indexable pages do not depend on a SPA router.
- Business/application state is not inferred by scraping the DOM.
- Static pages should not import the Effect study runtime unless a real interactive capability requires it.
- CSS and static page generation remain independent of React.

**React 19 is the selected renderer for interactive islands.** This is a
maintainer requirement for a composable component architecture, not permission
to create a client-rendered shell, adopt a SPA router, or move static/reference
documents into React.

The application boundary remains renderer-neutral:

- immutable `ScreenSnapshot` values contain only presentation-safe state;
- semantic commands express learner intent;
- snapshot `meta` requests focus, live-region, history, and viewport effects;
- providers adapt the application/controller to React without owning durable
  truth; and
- one long-lived browser `ManagedRuntime` is constructed at the site application
  root and disposed there, never per component, render, or event.

React component APIs follow composition-first rules: compound components,
generic state/actions/meta provider interfaces, lifted shared state, children
over `renderX` props, and explicit named variants instead of accumulating
behavioral boolean props. React 19 code accepts `ref` as a prop and uses `use()`
for context; do not introduce `forwardRef` or legacy `useContext` patterns in new
code without a documented interop reason.

R2.90's direct-DOM-first player is preserved as evidence, a bundle/behavior
baseline, and a fallback evaluation if React cannot pass the same acceptance
gates. It is superseded as the first-slice renderer. Do not build a compatibility
layer or dual renderer. A fallback decision requires a measured matched spike
and a maintained-constraint change.

Effect does not become the renderer.

### Vite and Cloudflare remain the preferred web-delivery direction

Use Vite as browser build/development tooling. Recheck and lock its exact
coordinate at scaffold time.

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

Exact Vite/Cloudflare/Wrangler versions, caching/headers, service-worker details,
preview configuration, and any future Worker HTTP surface remain implementation
locks and measurements. `ROUTES.md` now controls public path and indexability
semantics; no SPA router is introduced.

### Research prose is not runtime content

Keep distinct:

- `docs/` — human-readable factual research and scope authority;
- machine-readable publication data — reviewed profiles, claims, tools, questions, scenes, translations, sources, geometry records, and pack manifests;
- application/build code — compiler, validation, rendering, interaction, persistence, print, and offline behavior;
- `research/` — raw evidence and proposals.

Mutable announcement facts and scored content must not exist only as handwritten page prose.

### Codex-native image generation is the visual-authoring route

`../illustration/VISUAL_AUTHORING_POLICY.md` controls production artwork for
isolated tools, confusable comparisons, and hazard scenes.

- Codex image generation authors the production images.
- The exact accepted reviewed raster bytes are the visual source of truth.
- Publicly released official sample artwork may guide high-level visual style,
  but may not provide secure/recalled item content or a composition to copy.
- The four recovered R2.10 CAD/SVG POCs are retired research evidence, not a
  production backlog.
- R2.9's deterministic-first SVG/3D recommendation is superseded as an
  authoring-route decision. Its semantic scene, target/decoy, region,
  accessibility, QA, and immutable-version contracts remain applicable.
- Image generation is outside the application/runtime build. The content
  compiler consumes pinned image bytes and deterministically emits reviewed web,
  print, and offline derivatives.
- All Tier A/B taxonomy concepts remain launch scope. The completed pilot
  established native dimensions, prompt/reference packaging, and
  one-image-per-canvas generation as the default; it did not redefine scope.

## Maintained product invariants

The architecture must preserve:

- crawlable, indexable acquisition/reference HTML;
- versioned announcement facts with visible unknown/conflicting states;
- local-first progress with no required account;
- explicit offline content packs rather than accidental cache-only behavior;
- deterministic simulation and print outputs;
- WCAG 2.2 behavior and first-class nonvisual equivalents;
- no answer/reveal leakage through the precommit DOM, accessibility tree,
  initial executable closure, service-worker precache, or answer-bearing public
  filenames/metadata before commitment;
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

This is a presentation and application-order boundary, not DRM or a claim that
original practice answers are confidential. As `FEATURE_SPEC.md` states, an
offline pack necessarily contains keys. Static delivery may therefore publish
opaque, item-scoped postcommit objects, but the initial document/chunks and safe
precache must contain no answer-bearing bytes, public names/metadata must not
encode the answer, and application code must not request or read an item's
postcommit object until its durable attempt succeeds. A user who deliberately
fetches a public postcommit object outside the application is outside this
boundary; secure exam content is prohibited from the repository altogether.

## Research provenance and future reruns

R2.1–R2.10 and the reconciled R2.90 synthesis are complete. Their reports remain
evidence; this maintained file controls accepted implementation direction. Any
future rerun or new lane under `prompts/research-v2/` must:

1. use the exact immutable source SHA stamped after this curation PR is merged;
2. target latest Effect v4 explicitly;
3. establish exact current Effect and Bun coordinates at lane start;
4. read the installed `node_modules/effect/AGENTS.md` completely before code-level Effect work;
5. inspect installed source when package guidance is insufficient;
6. require Bun and Bun-workspace analysis;
7. start from the accepted three-workspace graph and identify evidence for any
   proposed boundary change;
8. ask for Effect-native patterns rather than generic ports/adapters architecture;
9. use the connected `@GitHub` capability;
10. create a branch, initial receipt commit/push, and draft PR before extended research;
11. commit exact reports, source ledgers, fixtures, lockfiles, raw results, and checksums;
12. push incrementally and return final branch/head/PR receipts;
13. stop when GitHub writes are unavailable.

## Completed curated research program

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

A reconciled R2.90 synthesis proposed the accepted initial graph, runtime roots,
content compiler, storage/offline boundary, delivery/test direction, and first
vertical slice. The maintainer's later React 19 selection supersedes only its
direct-DOM-first renderer choice; the renderer-neutral contracts and acceptance
baseline remain controlling evidence.

## Implementation locks and evidence

Implemented by the first scaffold:

- one exact coordinated React 19 / Effect v4 RC / TypeScript / Vite / Vitest
  catalog and text `bun.lock`;
- isolated root workspaces and exact root configuration;
- concrete Schema content models and deterministic split compiler diagnostics;
- scoped IndexedDB service/Layer modules, one browser `ManagedRuntime`, and a
  renderer-neutral question controller with semantic commands;
- generated static/island route closures, canonical/robots output,
  service-worker asset closure, and maintained design tokens; and
- automated typecheck, unit, commit-before-fetch, static-isolation,
  answer-leak, and raw/gzip/Brotli budget gates plus a headless-Chrome
  commit/reveal, reload-reconciliation, and service-worker-controlled offline
  reload smoke; and
- the measured one-image-per-canvas visual profile plus production approval of
  65 tool/PPE masters, 14 deterministic comparisons, and 18 hazard scenes,
  each bound to maintained review records and checksums.

Evidence still open:

- evidence for any graph beyond `apps/site`, `apps/content-compiler`, and
  `packages/content`;
- exact current v4 Platform/browser provider behavior at the locked cohort;
- remaining-browser IndexedDB commit/reload plus cross-browser
  failure/quota/disposal proof;
- service-worker version/eviction/update, remaining-browser offline, and
  explicit-pack proof;
- Cloudflare configuration and any separately authorized Worker endpoint;
- executed Playwright, accessibility, zoom/reflow, keyboard, performance, and
  complete offline gates;
- first-party observability/analytics choice, if any;
- correction endpoint implementation/storage;
- custom-domain/canonical-host configuration.

Resolve these through implementation evidence and, only where evidence exposes a
new research gap, a provenance-complete follow-up lane. Do not carry superseded
first-pass or direct-DOM defaults forward silently.

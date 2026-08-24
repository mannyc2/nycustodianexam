# Architecture constraints and decisions

**Status:** maintained constraints, updated 2026-08-24 after reconciling the
completed R2.1–R2.10 program and the accepted visual releases. This file records
accepted direction and explicit implementation gates. It does not replace the
product behavior contract or the exam-fact corpus.

Supporting evidence is historical and does not override this file. The complete
pre-normalization research corpus is recoverable at immutable commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435/research);
the completed lane prompts remain under `../prompts/research-v2/`.

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

R2.90 provisionally selects a lazy direct-DOM interactive island for the first
question-player slice. Its input is an immutable renderer-neutral screen
snapshot and its output is a semantic command. High-frequency hazard pointer
scratch remains renderer-local. Adopt another small renderer only when measured
focus, keyed-list, lifecycle, or maintainability complexity triggers a matched
spike; static acquisition pages must remain renderer-independent.

A UI library may be adopted for interactive islands if it materially improves correctness, accessibility, lifecycle ownership, keyed-list/state synchronization, or maintainability. That does not authorize converting acquisition pages into a client-rendered SPA.

Effect does not become the renderer.

### Vite and Cloudflare remain the preferred web-delivery direction

Use Vite as browser build/development tooling. Measure the actual first-slice
route closures before setting numeric budgets; static routes have an immediate
budget of zero Effect closure.

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

Exact Vite/Cloudflare coordinates, routing, caching, headers, service-worker
behavior, and preview deployment must be proven in the implementation slice.
An optional Worker remains deferred until a concrete endpoint is authorized.

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
- All Tier A/B taxonomy concepts remain launch scope. A pilot determines native
  dimensions, prompt/reference packaging, and safe batch size, not scope.

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

## Reconciled second-pass decisions

The R2.1–R2.10 program and R2.90 synthesis are complete. Their accepted
conclusions are maintained here; deleted reports remain historical evidence at
the immutable pre-normalization coordinate above.

### First workspace and runtime roots

- Recheck and then lock one synchronized Effect `4.0.0-rc.111` cohort and Bun
  `1.4.0` for the first scaffold. Upgrade the Effect cohort atomically if a newer
  controlling v4 coordinate is selected at lock time.
- Begin with `apps/site`, `apps/content-compiler`, and `packages/content`.
  Defer `packages/study` until a second consumer or real ownership boundary
  earns it; do not create `apps/worker` without an authorized endpoint.
- Run the finite compiler through `BunRuntime.runMain`, create one browser
  `ManagedRuntime` per application/island owner, keep service-worker listeners
  native and event-owned, and give a future Cloudflare Worker its own narrow
  workerd root.
- Services represent cohesive host I/O, failure, lifecycle, concurrency, or
  substitution capabilities. Schemas, reducers, scoring, scheduling,
  registries, canonicalization, and publication gates remain pure functions.

### Content compiler and publication

Use this boundary:

```text
location-aware JSONC input
  -> structural decode and one-hop migration
  -> duplicate-preserving registry
  -> relational, provenance, review, accessibility, and security gates
  -> opaque validated corpus
  -> canonical immutable outputs and recomputed closure
  -> stage and verify bytes
  -> promote the release manifest last
```

`Schema-valid` is not `publication-valid`. `packages/content` owns portable
schemas, migrations, diagnostics, registries, pure gates, canonical types, and
generated decoders. `apps/content-compiler` owns location-aware parsing,
filesystem/history access, hashing, staging, and publication. Diagnostics are
stable sorted data; operational publication failures remain typed Effect
failures. JSON Schema is an authoring aid, not publication authority.

### Browser durability and offline ownership

- Project-owned persistence contracts hide the IndexedDB provider. Test the
  first-party Effect provider against the complete real-browser contract and
  retain `idb@8.0.3` as the ready fallback.
- One strict native transaction writes the attempt event, derived projections,
  and session checkpoint. Reveal follows successful commit or same-ID
  reconciliation only.
- Pack bytes stage and verify outside transactions; activation is a short
  generation flip. BroadcastChannel and online events are advisory, never
  durable truth.
- Native service-worker code owns HTTP shell and immutable response caching.
  IndexedDB owns logical content-pack state and learner truth. In-memory worker
  state or finalizers cannot be correctness authority.

### Delivery, verification, and privacy

- Static/reference routes contain useful semantic HTML and no Effect closure.
  Interactive study islands load independently through Vite.
- Cloudflare Workers Static Assets is the initial host. Do not add a Worker just
  to serve files; a future correction endpoint requires explicit product,
  privacy, idempotency, rate, abuse, and workerd verification.
- Use Bun test for pure/Bun-host work, `@effect/vitest` for Effect behavior, and
  real Chromium, Firefox, and WebKit for browser semantics. Artifact/leak scans,
  automated accessibility checks, manual assistive-technology review, print
  review, failure injection, and two clean builds have separate responsibilities.
- Diagnostics remain local by default. Any telemetry must be first-party,
  consented, allowlisted, redacted, bounded, and must never contain question or
  rationale text, source excerpts, free-form corrections, exact searches, or
  security-sensitive leak values.

## Implementation gates still open

- execute the clean isolated Bun/Effect workspace, frozen-lock, filter/script,
  and phantom-dependency gates;
- select a location-preserving JSONC adapter and prove malformed,
  duplicate-key, multibyte, comment, and range behavior;
- adopt RFC 8785 or freeze a complete canonical JSON profile with cross-runtime
  number, Unicode, and escaping vectors;
- run the IndexedDB provider, migration, abort, quota, race, uncertain-result,
  cross-tab, eviction, and offline/update contract in real browsers;
- establish production raw/gzip/Brotli route closures before adopting numeric
  budgets;
- execute the exact browser, assistive-technology, keyboard, zoom, forced-color,
  phone, and print release matrix;
- choose the generated-release artifact retention policy before content scale;
- prove current Vite/Cloudflare coordinates and a Static Assets preview;
- authorize and specify any correction endpoint before adding a backend;
- keep the custom domain/canonical host decision open; and
- derive full Tier A/B content completeness from validated registries and review
  states rather than prose estimates.

These are implementation and release gates, not reasons to recreate the deleted
research lanes.

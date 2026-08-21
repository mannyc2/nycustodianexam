# Effect v4 and Bun prompt-foundation curation

**Curation date:** 2026-08-21  
**Repository:** `mannyc2/nycustodianexam`  
**Immutable input base:** `agent/chat-corpus-reconciliation` at `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`  
**Curation branch:** `research/curate-effect-v4-bun-prompts`

## 1. Purpose

The initial parallel architecture pass produced useful research, but it was weakened by three shared premises:

1. several lanes selected Effect v3 as the production baseline;
2. the proposed source/package layout started from a generic clean-architecture / ports-and-adapters template and added Effect at its edges;
3. most completed outputs were initially delivered only in ChatGPT rather than being published through GitHub as raw, reviewable research.

The first-pass reports and geometry evidence are now preserved under `research/initial-pass/`. This curation pass does not discard them and does not pretend to have rerun all architecture lanes. It creates the maintained doctrine and prompt contract for a second pass that must:

- target the latest available Effect v4 line;
- use current v4 package organization and current package-local guidance;
- use Bun, Bun workspaces, `bun.lock`, and top-level `apps/` / `packages/`;
- derive package boundaries from Effect capabilities, runtime roots, ownership, and dependency direction rather than from a generic template;
- publish every lane to GitHub from the beginning;
- separate API/source evidence, exact runtime observations, project recommendations, implementation, and certification.

## 2. Current upstream coordinates observed during curation

These are evidence coordinates, not permanent dependency locks.

### Effect

At Effect upstream commit:

```text
Effect-TS/effect
436f10d1efccec308426532ff3f88df9a96434f3
2026-08-21
```

the checked-in package cohort reports:

```text
effect                     4.0.0-rc.111
@effect/platform-browser   4.0.0-rc.111
@effect/platform-bun       4.0.0-rc.111
@effect/atom-react         4.0.0-rc.111
@effect/atom-solid         4.0.0-rc.111
```

The v4 ecosystem uses a single coordinated version. The core package contains the stable core modules and multiple `effect/unstable/*` namespaces, including HTTP, HttpApi, persistence, reactivity, sockets, workers, process, observability, SQL, and others. Platform-specific implementations remain in packages such as `@effect/platform-browser` and `@effect/platform-bun`.

This curation records `rc.111` only as the current observed coordinate. Every future version-sensitive lane must identify the actual latest v4 cohort at its own start and pin the exact coordinate it researches. “Use latest Effect v4” does not authorize silently floating dependencies during a reproducible probe.

### Bun

The official Bun site identified Bun `1.3.14` as current during this curation. Bun documentation currently supports:

- root `workspaces`;
- `workspace:*` dependency references;
- root dependency catalogs referenced through `catalog:`;
- text `bun.lock`, which should be committed;
- `bun ci` / `bun install --frozen-lockfile`;
- isolated workspace installs, which prevent phantom dependencies and are the default for new workspace projects using lockfile configuration version 1;
- workspace filters and dependency-aware script execution;
- explicit `trustedDependencies` / lifecycle-script policy;
- a Bun-native test runner, while documenting that Jest compatibility is not complete.

Again, `1.3.14` is an observed coordinate, not a permanent lock.

## 3. The identified Effect `SKILL.md`

The intended skill is the official:

```text
Effect-TS/skills
skills/effect-ts/SKILL.md
commit 28822c9e19998876a6b0e0d97877442012ed4391
```

Its durable guidance is small but important:

1. use the user’s preferred package manager;
2. in a monorepo, make the selected Effect package available at the root as a development dependency so agents can inspect its source;
3. add repository instructions requiring agents to read `node_modules/effect/AGENTS.md` completely before writing Effect code;
4. follow links from that file when needed;
5. search `node_modules/effect/src` when the package documentation does not answer a question.

The skill’s command examples use pnpm and `effect@beta`. For this repository they are adapted, not copied literally:

- use Bun;
- resolve and pin the exact latest Effect v4 cohort;
- make that exact `effect` version available at the workspace root as a dev dependency when the implementation workspace is created;
- require each runtime package that imports Effect at runtime to declare its own explicit `effect` dependency, normally through a Bun catalog; do not rely on root hoisting or phantom access;
- use the installed package’s `AGENTS.md` and source as the primary implementation guide.

The skill does **not** prescribe a directory architecture, a renderer, a database library, or service granularity. Those decisions remain project research questions.

## 4. Current v4 coding doctrine derived from package guidance

The installed Effect package’s `AGENTS.md` is generated from upstream `LLMS.md`. At the observed upstream coordinate it says, among other things:

- prefer `Effect.gen` and named `Effect.fn("name")`;
- define effect-returning functions with `Effect.fn`, rather than functions that merely return an `Effect.gen`;
- use Schema for domain models and validation of untrusted data;
- use `Schema.Class` and `Schema.TaggedError` for modeled values and expected failures where appropriate;
- prefer `Context.Service` as the default service definition;
- give service identifiers package/path-qualified names;
- place focused implementation Layers with the capability when that is a coherent ownership boundary;
- define service methods with `Effect.fn`;
- use `Context.Reference` for values with defaults/configuration semantics;
- compose focused Layers at runtime roots;
- manage resources with Scope and acquisition/finalization APIs;
- use `Layer.effectDiscard` for owned background tasks that expose no service;
- use `BunRuntime.runMain` or `Layer.launch` for Bun process entrypoints;
- use `ManagedRuntime` only where Effect must bridge an imperative external boundary;
- use `DateTime`/Clock-powered time rather than uncontrolled `Date.now` inside Effect programs;
- use current Effect Predicate helpers instead of creating redundant runtime type-guard utilities;
- use official Effect testing integration and test Layers where they fit.

The prompt foundation converts these into research requirements, not cargo-cult rules. A lane may recommend a different local pattern only when it cites current upstream evidence and explains why the default guidance does not fit the project.

## 5. Effect-native architecture means capability and runtime ownership

“Effect-native” does not mean that every value or DOM operation becomes an Effect. It means that the architecture is shaped by:

- cohesive services representing meaningful capabilities;
- explicit typed failure channels;
- Schema-modeled data at trust and persistence boundaries;
- focused Layers assembling implementations;
- Scope and structured concurrency for owned lifecycles;
- explicit runtime roots for browser, Bun compiler/tooling, Cloudflare workerd, service worker, and tests;
- deterministic Clock/Random dependencies where required;
- runtime-specific implementations without false portability;
- package dependencies that follow those capabilities and runtimes.

It explicitly rejects:

- one service per function;
- one package per service;
- a universal `core` dumping ground;
- giant application services or giant invisible Layers;
- `domain/application/ports/adapters/ui` as the preselected folder/package ontology;
- browser globals copied behind meaningless one-method wrappers;
- Effect runtimes constructed per event;
- scattered `runPromise` / `runFork`;
- unstable modules used without a recorded reason and migration boundary;
- Effect used as a homemade renderer.

Pure deterministic calculations and immutable state transitions can remain plain TypeScript. Effect owns meaningful dependency, failure, persistence, concurrency, lifecycle, time, retry, resource, and observability semantics.

## 6. Bun workspace doctrine

The fixed top-level shape is:

```text
apps/
packages/
```

The exact children are not fixed by this curation.

A workspace is justified by at least one real boundary:

- executable/deployable runtime;
- separately buildable or publishable artifact;
- clear ownership and dependency direction;
- reusable capability with more than one consumer;
- runtime-specific implementation;
- independent testing or release requirement.

A future workspace baseline should evaluate:

- root private `package.json`;
- `workspaces` covering `apps/*` and `packages/*`;
- a root catalog pinning the exact Effect v4 cohort and other shared tools;
- explicit `workspace:*` dependencies;
- isolated linker mode;
- committed text `bun.lock`;
- `bun ci` in CI;
- reviewed `trustedDependencies`;
- package-specific runtime types/tsconfigs;
- root dev dependency on exact `effect` for package source/AGENTS access;
- explicit runtime dependencies in every workspace that imports Effect;
- filtered/dependency-aware scripts;
- duplicate Effect cohort detection.

The browser package must not accidentally gain Bun globals merely because Bun owns the workspace. The content compiler may use Bun runtime APIs when justified. A Cloudflare Worker must remain compatible with workerd/Web APIs. The service worker is a browser worker lifecycle, not a Bun process. Specialist tooling such as Vite, Wrangler, Playwright, or CadQuery may remain when it earns its role.

## 7. Static site and Effect boundary

A retained first-pass finding is that static acquisition/reference HTML should not receive the interactive study runtime by default. The prior bundling report selected Effect v3 for production and kept v4 as comparison-only; that version decision is rejected, but its route-closure measurement methodology remains useful.

The second pass must measure latest v4 under the actual Bun/Vite workspace. It must not treat old v3 numbers or old v4 RC numbers as current budgets. It should preserve the architectural question:

- which routes require no JavaScript;
- which routes need small page-local enhancement;
- which interactive islands require an Effect runtime;
- which optional feature families remain lazy;
- whether v4 reactivity or a declarative renderer earns its transfer and complexity cost.

## 8. GitHub publication is part of research correctness

Every second-pass lane must make its work durable and reviewable through GitHub.

Before lengthy research it must:

1. verify the immutable source SHA;
2. stop if the output branch exists;
3. create the branch with the connected GitHub capability;
4. commit and push `START-RECEIPT.md`;
5. open a draft PR.

During research it must commit:

- the exact report;
- source/evidence ledger;
- machine-readable matrices;
- fixture source;
- exact package manifests and lockfile used for probes;
- raw measurement outputs;
- checksums;
- limitations.

It must push incrementally. It must stop when GitHub write access is unavailable. A sandbox-only report is not a completed lane.

## 9. Resulting research program

The curated program is divided into parallel lanes with disjoint research paths:

### P0 — architecture-critical

1. latest-v4 core architecture and Effect-native Bun workspace topology;
2. latest-v4 UI state, reactivity, lifecycle, and renderer evaluation;
3. latest-v4 Platform/runtime capability matrix for browser, Bun, service worker, and Cloudflare;
4. latest-v4 IndexedDB/offline-pack architecture;
5. latest-v4 browser bundling and route-closure measurements in a Bun/Vite workspace.

### P1 — informed by P0 but independently researchable

6. latest-v4 Schema content compiler and relational publication gates;
7. Bun monorepo/build/CI discipline;
8. testing, accessibility, performance, and observability.

### P2 — production-specialist

9. hazard-scene production;
10. deterministic geometry evidence/POC audit.

A final synthesis lane consumes the completed GitHub PRs and produces proposed decisions without implementing the application.

## 10. What this curation does not decide

It does not select:

- the final exact Effect/Bun versions;
- the exact package list below `apps/` and `packages/`;
- a UI renderer;
- an IndexedDB provider;
- a service-worker implementation;
- the final Vite/Cloudflare configuration;
- the test runner combination;
- production bundle budgets;
- a hazard-scene production method;
- production approval for any geometry POC.

Those remain evidence-bearing research questions.

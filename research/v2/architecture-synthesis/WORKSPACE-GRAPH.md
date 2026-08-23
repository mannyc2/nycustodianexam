# Workspace graph

## Initial graph

```text
repository root (private Bun workspace)
├── apps/
│   ├── content-compiler/
│   │   ├── src/main.ts              finite Bun root
│   │   ├── src/adapters/            author files, history, release publisher
│   │   └── test/                    Bun host integration
│   └── site/
│       ├── src/static/              semantic route/page generation integration
│       ├── src/study/               portable study models/policies/use cases
│       ├── src/browser/             runtime, persistence, renderer, focus adapter
│       ├── src/service-worker/      native event-owned worker
│       └── test/                    unit/Effect/browser support
├── packages/
│   └── content/
│       ├── schemas/                 current + historical encoded models
│       ├── migrations/              pure one-hop migrations
│       ├── registry/                duplicate-preserving indexes
│       ├── gates/                   pure publication validation
│       ├── generated/               output Schemas and portable decoders
│       └── test/                    fixture/property/determinism tests
├── content/
│   ├── authoring/                   location-aware non-executable inputs
│   ├── assets/                      accepted immutable source/final bytes
│   └── releases/                    publication manifests/objects per policy
└── tooling/config                   root scripts and runtime-specific tsconfigs
```

`content/` is data, not a workspace. Exact generated-release tracking/storage is
an implementation decision; the first slice should keep its small release in Git
so deterministic rebuild differences are reviewable.

## Dependency edges

```text
apps/content-compiler ──workspace:*──> packages/content
apps/site             ──workspace:*──> packages/content

packages/content      ──X──> apps/*
apps/site             ──X──> apps/content-compiler
browser/service-worker──X──> @effect/platform-bun or node-shared
content authoring     ──X──> executable TypeScript modules
```

Every consumer declares its own external dependencies. Root catalogs coordinate
versions; they do not grant imports. Isolated linking and a phantom-dependency
negative test enforce the graph.

## Why `packages/content` is earned

The compiler authors/validates current encoded content while the site decodes
generated page/pack/import boundaries. That is a real second consumer and a
portable model/gate ownership boundary. Bun I/O remains in the app so the package
cannot leak host globals into the browser.

## Why `packages/study` is deferred

The initial study policy and persistence contracts have one application consumer.
Tests do not alone earn a package. Keep the internal modules portable and enforce
browser-adapter dependency direction. Extract only when one of these occurs:

- a second runtime/app imports the study domain;
- independent package publication/versioning is required;
- ownership/release cadence materially differs;
- compiler or worker legitimately consumes the same study models;
- measured build/test boundaries become simpler after extraction.

## Root mechanics

- exact `packageManager: "bun@1.4.0"`;
- workspaces object with `apps/*`, `packages/*`, and one exact Effect catalog;
- isolated linker;
- explicit `workspace:*` internal dependencies;
- real committed text `bun.lock`;
- frozen `bun ci` in CI;
- minimal reviewed `trustedDependencies` only;
- one shared language config plus browser, service-worker, Bun, portable, test,
  and future workerd tsconfigs;
- no external task runner initially;
- explicit prerequisite scripts: compile content before site build; filters are
  selection tools, not an implicit dependency DAG.

## Growth rules

- Add `apps/worker` only with an approved endpoint.
- Add an asset-production workspace only when repository-owned scripts/toolchains
  have a real host/dependency boundary. Codex-native generation itself does not
  require an app workspace.
- Add a renderer package only if more than one application consumes a stable
  renderer API.
- Do not introduce generic `core`, `domain`, `ports`, or `adapters` packages.

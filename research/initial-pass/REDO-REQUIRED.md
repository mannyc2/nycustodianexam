# Research areas that must be redone

The initial outputs are useful evidence, but the following lanes require new research because their governing premise or tooling is now wrong.

## P0 — redo before package architecture or implementation

### 1. Effect v4 core architecture and repository/package topology

Must cover:

- latest Effect v4 services, Layers, runtime, Scope, Fiber, errors, Config, Schema, Stream, Queue/PubSub, Ref/reactivity, testing, and platform organization;
- current maintainer-recommended patterns and the intended `SKILL.md` guidance;
- Bun workspace layout with top-level `apps/` and `packages/`;
- package boundaries that are Effect-native rather than a mechanical clean-architecture/ports-adapters tree;
- runtime roots for web, compiler/build tooling, service worker, optional Cloudflare Worker, and tests;
- dependency direction and allowed cross-workspace imports;
- no v3 compatibility architecture unless explicitly needed for migration evidence.

### 2. Effect v4 UI state and renderer integration

Redo:

- current v4 reactivity/Atom APIs and stability;
- current renderer integrations;
- direct DOM versus declarative renderer under v4;
- scope/lifecycle ownership;
- renderer-neutral state without building a custom UI framework;
- question-player spike with durable commit-before-reveal;
- hazard scene and offline manager complexity;
- package placement inside `apps/` and `packages/`.

Do not carry forward E01/E03's folder structure or reveal-before-save behavior.

### 3. Effect v4 Platform/browser/Cloudflare capability matrix

Redo current package/API reality for:

- browser;
- Bun build/runtime;
- service worker;
- Cloudflare workerd;
- HTTP/HttpApi;
- IndexedDB/persistence;
- workers/sockets;
- crypto;
- runtime-specific Layers.

E09 is only a correction notice; it is not the missing complete v4 Cloudflare report.

### 4. Effect v4 IndexedDB and offline packs

Re-evaluate:

- first-party v4 IndexedDB support versus `idb`, Dexie, or a thin native adapter;
- transaction APIs under Effect scheduling;
- interruption truthfulness;
- cross-tab coordination;
- service-worker boundary;
- pack staging/activation and rollback;
- Bun test tooling and browser integration tests.

The state machines from E07 remain input; its `idb` selection is not accepted.

### 5. Effect v4 browser bundling under Bun workspaces

Measure, do not extrapolate:

- latest v4 core;
- Schema;
- services/Layers;
- reactivity/Atom if considered;
- IndexedDB/platform-browser;
- HTTP/HttpApi;
- Stream;
- representative question player;
- direct DOM and renderer alternatives;
- service worker;
- Cloudflare Worker API.

Use Bun installation/workspaces/lockfile diagnostics and the actual Vite/Cloudflare build. Retain E02's measurement discipline, not its v3 package decision.

## P1 — refresh after P0 architecture evidence

### 6. Content compiler and Effect v4 Schema

E05 is the best first-pass result, but refresh:

- exact latest v4 Schema APIs;
- package/workspace placement;
- Bun file discovery and build scripts;
- diagnostics and tests;
- generated artifacts consumed by apps/packages;
- current JSON Schema support;
- source maps from authoring file locations;
- publication determinism.

### 7. Bun monorepo and build discipline

Dedicated research must cover:

- root private package;
- Bun workspaces;
- `apps/` and `packages/` conventions;
- dependency ownership;
- workspace catalogs/overrides if currently supported and appropriate;
- `bun install --frozen-lockfile` or current equivalent;
- scripts/tasks/filtering;
- TypeScript configs;
- Vite integration;
- Cloudflare Vite plugin;
- testing;
- CI cache and lockfile rules;
- preventing duplicate Effect versions;
- when Bun-native APIs should replace Node compatibility and when they should not.

### 8. Testing, accessibility, performance, and observability

Refresh the tool choices and commands under Bun and latest v4 while retaining the first pass's behavioral test matrix.

## P2 — separate content-production lanes

### 9. Hazard-scene production

Still needs a dedicated production-method decision. The deterministic isolated-tool B-rep architecture does not automatically apply to scenes.

### 10. Deterministic geometry bundle audit

The raw bundle is now present. A later audit can verify source/rights records, exact POC parameters, geometry, renders, and human-review gaps. It must not promote assets automatically.

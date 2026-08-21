# Effect v4 platform/runtime architecture — current second-pass report

**Lane:** Effect v4 platform/runtime matrix  
**Project:** `mannyc2/nycustodianexam`  
**Immutable project base:** `645e885748c830f7a9cbbbe90ac0f31149bfc81c`  
**Effect source coordinate inspected:** `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`  
**Effect source version:** `4.0.0-rc.111`  
**Current Bun official coordinate observed:** `1.3.14`  
**Status:** repository-backed architecture research; not implementation or production certification.

## Executive conclusion

The current Effect v4 platform story is **not** “pick one universal Platform layer and run the same code everywhere.” The project should use a common Effect application model where capabilities genuinely have the same semantics, then keep four different runtime edges truthful:

1. **browser page** — `BrowserRuntime.runMain` at the interactive-island root; stable Effect services where they buy lifecycle/testability; current typed `@effect/platform-browser` IndexedDB is a serious candidate for authoritative progress; Web/DOM primitives stay browser-native where wrapping adds no value;
2. **Bun build/CLI** — `BunRuntime.runMain` plus focused `BunFileSystem`, `BunPath`, and `BunCrypto` layers; Bun-specific build/tool primitives such as `Bun.build` remain Bun capabilities rather than being disguised as generic filesystem/process operations;
3. **browser service worker** — native `install`/`activate`/`fetch`/`message` event ownership, with Effect programs rooted into `waitUntil()`/`respondWith()` promises; no `BrowserRuntime.runMain`, no assumption that fibers or memory survive between events, and no generic worker protocol replacing Service Worker semantics;
4. **Cloudflare workerd** — native ES-module `fetch(request, env, ctx)` and native bindings/fetch/cache/context semantics; Effect core runs inside the invocation. `effect/unstable/http` / `httpapi` can be isolated at this boundary if the optional server surface grows enough to justify them, but there is no current official Cloudflare platform adapter to install.

Tests are a fifth topology rather than another production runtime: `@effect/vitest` supplies Effect-aware test execution/Layers/property testing, while real-browser tests remain mandatory for IndexedDB and Service Worker semantics.

The central project rule is therefore:

> **Abstract product capabilities, not runtime identities.**

A `ProgressStore` may be portable because its domain contract is meaningful. `Window`, `FetchEvent`, Cloudflare `ExecutionContext`, `Bun.build`, and a Bun process are not interchangeable capabilities and should not be hidden behind one fake platform interface.

## 1. Current package reality

### 1.1 Effect v4 remains a release candidate

Official source at `436f10d1efccec308426532ff3f88df9a96434f3` declares `effect` version `4.0.0-rc.111`. npm also exposes `4.0.0-rc.111` on the `rc` tag while the normal `latest` tag remains the v3 line (`3.22.1` at access time).

The v4 package manifest explicitly exports unstable families under `effect/unstable/*`, including:

- `http`;
- `httpapi`;
- `persistence`;
- `process`;
- `reactivity`;
- `socket`;
- `workers`;
- plus AI, cluster, devtools, encoding, eventlog, observability, rpc, schema, sql, workflow, and others.

**CONFIRMED:** being in Effect v4 does not make these surfaces stable. They need isolation and an exit plan.

### 1.2 Source coherence is currently ahead of registry coherence

The same upstream source commit declares all of these as `4.0.0-rc.111`:

- `effect`;
- `@effect/platform-browser`;
- `@effect/platform-bun`;
- `@effect/platform-node-shared`;
- `@effect/vitest`.

At access time npm exposed:

- `effect@4.0.0-rc.111`;
- `@effect/vitest@4.0.0-rc.111`;
- `@effect/platform-bun` only through `4.0.0-rc.110` on its rc tag.

The available npm result for `@effect/platform-browser` did not expose a v4 version table, so this lane does **not** claim registry `rc.111` availability for that adapter without a real package-resolution probe.

**Decision:** do not freeze the production dependency cohort from source manifests alone. The exact installable cohort remains a lock-time gate. If implementation begins before a matching `platform-bun` rc.111 is available, verify a complete same-version cohort (likely rc.110) in a real Bun fixture before selecting it; do not mix rc.111 core with rc.110 adapters by assumption.

### 1.3 `@effect/platform` is not the v4 default package boundary

The current npm `@effect/platform` package remains on the v3-era `0.97.1` line. Current v4 source puts many platform-neutral services directly in `effect` and runtime implementations in packages such as `@effect/platform-browser` and `@effect/platform-bun`.

**Decision:** do not add `@effect/platform` merely because older v3 reports used it. Select current v4 core modules and only the runtime adapters actually required.

## 2. Browser page

### 2.1 Runtime root

`@effect/platform-browser/BrowserRuntime.runMain` is appropriate for the interactive page application root. Current source installs page teardown handling through `pagehide` and interrupts the main fiber when the page is not being persisted.

Important limitation: browser teardown is best-effort. Asynchronous finalizers cannot be assumed to finish during page destruction. Therefore durable learner state must be written before UI reveal/transition boundaries, not deferred to page-unload cleanup.

**Recommendation:** one long-lived page runtime per interactive application/island root; construct Layers once at that root. No `runPromise`/`runFork` scattered through click handlers.

### 2.2 Crypto

`effect/Crypto` is a stable v4 core service. `BrowserCrypto.layer` implements it using `globalThis.crypto`, `getRandomValues`, and `crypto.subtle.digest`.

**Recommendation:** use official `Crypto` in Effect workflows that need checksums, secure randomness, UUIDs, or deterministic test substitution. Do not create a project crypto service merely to rename `Crypto`. Direct Web Crypto remains fine in tiny browser-only code that does not otherwise belong in an Effect workflow.

### 2.3 HTTP client

`BrowserHttpClient` re-exports `effect/unstable/http/FetchHttpClient`; the Bun adapter does the same. This is a real cross-runtime Fetch client abstraction, but it is explicitly unstable.

For the current product, most acquisition/content traffic is static asset loading and does not need an application HTTP service. The optional corrections endpoint is the main justified dynamic client.

**Recommendation:**

- static page/assets: native browser loading/fetch behavior;
- narrow corrections/pack transport workflow: either native `fetch` behind a cohesive project transport service, or the unstable Effect HttpClient isolated behind that service if retries/typed errors/tracing justify it;
- do not expose `HttpClient` throughout UI/domain code.

### 2.4 Authoritative IndexedDB

This is the largest change from the first-pass v3 research.

Current `@effect/platform-browser` contains first-party typed IndexedDB modules:

- `IndexedDb` — service over `IDBFactory` / `IDBKeyRange`;
- `IndexedDbTable` — Schema-backed table definitions, keys and indexes;
- `IndexedDbVersion` — explicit version/migration modeling;
- `IndexedDbDatabase` — scoped database open/close and migration execution;
- `IndexedDbQueryBuilder` — typed selects/inserts/upserts/deletes/streams and transaction support.

`IndexedDbQueryBuilder.withTransaction` creates one browser `IDBTransaction` over named tables, supplies it to nested queries, waits for `transaction.oncomplete` before the Effect succeeds, and aborts the transaction on Effect failure/interruption. The implementation also sets `PreventSchedulerYield` while the transaction effect executes to avoid an IndexedDB async gap.

That shape is directly relevant to the maintained invariant:

```text
selection
  -> explicit commit request
  -> authoritative IndexedDB transaction succeeds
  -> reveal correctness/explanation
```

**Recommendation:** promote the v4 typed IndexedDB stack from “unknown” to **preferred spike candidate** for the project-specific `ProgressStore` implementation, rather than defaulting to a hand-written raw-IDB wrapper.

However adoption is not yet final because:

1. `IndexedDbDatabase` currently imports `effect/unstable/reactivity/Reactivity`, so the dependency chain is not entirely stable even though the public IndexedDB modules are not under an `unstable` package path;
2. the transaction implementation relies on scheduler-yield suppression to respect IndexedDB lifetime rules and needs a real-browser failure/interruption probe;
3. `IndexedDbTable` defaults transaction durability to `"relaxed"`; the project must explicitly evaluate `strict`/browser support and decide which writes require which durability mode;
4. this lane could not run a browser probe.

The project service should remain domain-shaped (`ProgressStore`, content-pack metadata/activation capabilities) so replacing the provider does not leak IndexedDB query APIs into application logic.

### 2.5 Generic persistence and key-value store

`BrowserKeyValueStore` and `BrowserPersistence` are built on `effect/unstable/persistence`. They include useful localStorage/sessionStorage/IndexedDB implementations and wait for IndexedDB transaction completion.

They are **not** the recommended authority for learner progress because their generic key/value/cache semantics do not express the atomic multi-record product transaction, session checkpoint, review state, and pack activation invariants.

Use them only for genuinely generic cached/preference data if a concrete need beats a native API.

### 2.6 Browser workers and sockets

`BrowserWorker` / `BrowserWorkerRunner` depend on `effect/unstable/workers`; `BrowserSocket` depends on `effect/unstable/socket`.

These are candidates only if the product later needs a dedicated computation worker or persistent socket protocol. They are **not** Service Worker abstractions.

No current feature requires a socket. Do not add one.

## 3. Bun build and CLI runtime

### 3.1 Runtime

`BunRuntime.runMain` is the correct process root for an Effect-based compiler/CLI. Current source delegates to the shared Node runtime runner for signal handling, exit codes, logging, and teardown.

This is appropriate because Bun explicitly targets Node compatibility, but the reuse is also evidence that “Bun platform” does not mean every adapter is implemented through Bun-only APIs.

### 3.2 Focused stable services

Current source provides:

- `BunFileSystem.layer` -> stable `effect/FileSystem`, implemented through node-shared filesystem;
- `BunPath.layer` -> stable `effect/Path`, implemented through node-shared path;
- `BunCrypto.layer` -> stable `effect/Crypto`, implemented through node-compatible crypto;
- `BunRuntime.runMain` -> process runtime root.

These are good fits for the content compiler because filesystem/path/crypto are meaningful testable capabilities.

Do **not** automatically use `BunServices.layer`: its union also includes `effect/unstable/process/ChildProcessSpawner`. A compiler that only reads/writes/validates/hashes content should not receive process-spawning authority by convenience.

### 3.3 Bun-native build APIs

Bun 1.3.14 provides runtime/tool-specific APIs such as `Bun.build`, `Bun.spawn`, and Bun shell. These have semantics beyond `FileSystem` or `Path`.

If the project uses `Bun.build` or Bun-specific process orchestration directly, represent the meaningful operation as a narrow build/tool service when test substitution, typed failure, cancellation, or observability matter. Do not force those operations through an allegedly portable “platform” interface.

### 3.4 HTTP/workers/sockets

`BunHttpClient` is an unstable FetchHttpClient re-export. Bun worker/socket adapters depend on unstable worker/socket families. Child-process spawning is unstable.

The content compiler currently does not need those capabilities. Keep them out of its Layer unless a concrete task justifies them.

## 4. Browser Service Worker

Current `@effect/platform-browser` has no Service Worker-specific runtime adapter. This absence is appropriate: a browser Service Worker is governed by browser event lifetime semantics, not by page or generic Worker semantics.

### Required boundary

- `install`: synchronously call `event.waitUntil(promiseFromEffect)`;
- `activate`: synchronously call `event.waitUntil(promiseFromEffect)`;
- `fetch`: synchronously call `event.respondWith(promiseFromEffectReturningResponse)` for handled requests;
- `message`: use `event.waitUntil(...)` for durable asynchronous work where supported/required.

`respondWith()` must be registered synchronously in the fetch event handler. `waitUntil()` extends the event lifetime and can make install/activate fail if its promise rejects.

**Recommendation:** keep those native callbacks visible. Build Effect programs for pack verification, manifest decisions, cache mutation, and typed errors, but let the browser event own their lifetime. Never rely on a detached fiber after the event promise settles.

### Cache and storage ownership

Use browser Cache Storage natively, normally behind a cohesive `OfflineAssetStore` / `PackCache` service because the project has real versioning/activation semantics. Do not wrap `caches` just to hide the global.

Learner progress remains page-side IndexedDB authority. A Service Worker may use IndexedDB for its own metadata if justified, but the default `IndexedDb.layerWindow` is page-specific; a worker would need `IndexedDb.make({ indexedDB: globalThis.indexedDB, IDBKeyRange: globalThis.IDBKeyRange })` in a worker-specific layer.

The Service Worker must tolerate being terminated and restarted between events. In-memory pack state can be an optimization only; durable manifests/cache/IDB must determine truth.

## 5. Cloudflare workerd

### 5.1 No official current Effect Cloudflare adapter

The current `Effect-TS/effect` repository has browser, Bun, Deno, Node and node-shared platform packages but no Cloudflare/workerd package, and a source search produced no Cloudflare-specific adapter.

Do not install `@effect/platform-bun` or a Node platform solely to run inside Workers. Cloudflare Node compatibility does not turn workerd into Bun or Node.

### 5.2 Native module worker is the runtime root

Use Cloudflare’s native ES-module handler:

```ts
export default {
  async fetch(request, env, ctx) {
    // adapt request-scoped Cloudflare capabilities into an Effect program
    return response
  }
}
```

Bindings (`env`), request context, `ctx.waitUntil`, Cloudflare cache semantics, and Cloudflare-specific request properties stay explicit or enter narrowly-scoped services.

Cloudflare states that `fetch()` I/O must run inside a Request Context. `ctx.waitUntil()` is the explicit lifetime mechanism for post-response background work and can extend an HTTP invocation for up to 30 seconds. Therefore module-scope Effect state may be reused as an optimization, but correctness must not require a long-lived isolate or detached fiber.

### 5.3 Effect HTTP / HttpApi option

`effect/unstable/http/HttpEffect.toWebHandler*` converts an Effect HTTP program to `(Request) => Promise<Response>` and can build a handler from Layers. This is structurally compatible with workerd’s Fetch handler and is the strongest current Effect-native server option.

It remains **unstable**, and there is an important Cloudflare cancellation caveat: current `HttpEffect.toWebHandler` listens to `request.signal` to interrupt the request fiber. Cloudflare requires the `enable_request_signal` compatibility flag for incoming-request signal listeners; passthrough to subrequests is separately governed by `request_signal_passthrough`.

Therefore an Effect HTTP adoption must pin/test the Cloudflare compatibility date/flags and cancellation behavior.

For the current product, an optional corrections endpoint is small enough that a native Fetch handler plus Schema decoding and a narrow correction service is the default recommendation. Adopt `HttpRouter`/`HttpApi` only when endpoint count, shared typed contracts, middleware, OpenAPI/client generation, or error modeling make the unstable dependency worthwhile.

### 5.4 Cloudflare cache is not browser Cache Storage portability

Cloudflare’s Cache API resembles browser Cache Storage but differs materially: it is data-center-local, honors Cloudflare cache headers/rules, and has Cloudflare-specific option behavior. It is not a durable global database.

Do not share a `CacheStorageProvider` implementation between browser Service Worker and workerd merely because both spell the global `caches`.

## 6. Tests

Current `@effect/vitest@4.0.0-rc.111` exposes Effect tests, live tests, shared/nested Layer fixtures, scopes, property testing through Schema/FastCheck, and Vitest exports. Source requires Vitest `>=4.1.0 <5`.

**Recommendation:**

- pure deterministic domain/content functions: Bun test or Vitest is acceptable according to workspace test strategy;
- Effect service/use-case tests: prefer `@effect/vitest` so test services, scoped resources, Layers, Clock/Random substitutes, and typed failures are first-class;
- IndexedDB transaction/migration/interruption: real browser integration tests are mandatory; fake-indexeddb may accelerate unit tests but cannot certify browser transaction timing;
- Service Worker lifecycle/cache tests: real browser/PWA tests are mandatory for key lifecycle behavior;
- workerd handler: add a Wrangler/workerd/Miniflare-style runtime probe before adopting unstable Effect HTTP.

`bun test` is not a substitute for browser execution or the Effect Vitest integration.

## 7. Runtime/Layer topology recommendation

### Browser page

```text
native DOM/events
  -> one BrowserRuntime root
     -> PageLive
        -> ProgressStoreLive
           -> project transaction mapping
           -> @effect/platform-browser typed IndexedDB candidate
        -> BrowserCrypto.layer
        -> optional CorrectionsTransportLive
           -> native fetch OR isolated unstable FetchHttpClient
        -> Clock / Random via Effect services where deterministic behavior matters
```

Static acquisition/reference pages outside interactive islands do not load this runtime.

### Bun compiler/CLI

```text
Bun process
  -> BunRuntime.runMain
     -> CompilerLive
        -> BunFileSystem.layer
        -> BunPath.layer
        -> BunCrypto.layer
        -> project content/source/publication services
        -> optional BunBuildService wrapping Bun.build
        -> optional unstable process layer only when a concrete tool invocation needs it
```

### Service Worker

```text
native ServiceWorkerGlobalScope events
  install/activate/message -> event.waitUntil(effectPromise)
  fetch                    -> event.respondWith(effectPromise<Response>)

per-event Effect program
  -> PackCache / OfflineAssetStore (native Cache Storage behind product service)
  -> PackVerifier (Effect Crypto or native Web Crypto at boundary)
  -> optional worker-specific IndexedDb layer only for SW-owned metadata
```

No detached correctness-critical fibers.

### Cloudflare

```text
native module fetch(request, env, ctx)
  -> request-scoped Cloudflare services/bindings
  -> CorrectionUseCase / narrow server capability
  -> Effect.runPromise or cached Effect Web handler
  -> native Response

optional complexity upgrade:
  effect/unstable/http + httpapi
  -> HttpEffect.toWebHandler*
  -> explicit compatibility-date/request.signal tests
```

### Tests

```text
@effect/vitest test root
  -> Test Layers overriding Clock/Random/stores/transports
  -> fake providers for unit tests
  -> real browser runtime for IDB/SW conformance
  -> workerd runtime probe for Cloudflare adapter decisions
```

## 8. Capability classification summary

### Prefer official Effect abstraction

- core Effect runtime/fibers/scopes/errors/Layer/Schema;
- `Clock` and `Random` where determinism matters;
- `Crypto` in workflows requiring secure randomness/digests/test substitution;
- Bun `FileSystem` / `Path` / focused runtime layers;
- `@effect/vitest` for Effect tests;
- typed browser IndexedDB as the preferred provider spike, behind project persistence services.

### Prefer native API behind a cohesive project Effect service

- browser progress/packs domain interfaces, even if provider uses official typed IndexedDB;
- Cache Storage pack/version operations;
- corrections/pack transport when native fetch is sufficient;
- `Bun.build` or other Bun-specific compiler actions;
- Cloudflare bindings/storage/context when meaningful application services consume them.

### Prefer direct native API at runtime edge

- DOM and accessibility/focus updates;
- Service Worker lifecycle events and `respondWith`/`waitUntil`;
- Cloudflare module handler, `env`, and `ctx`;
- Request/Response objects at Web boundaries;
- trivial static asset loading;
- runtime-specific values whose only abstraction would be hiding a global.

## 9. Explicit rejected portability

Reject these designs:

- one `WebPlatform` service shared by browser page, Service Worker, and workerd;
- one `CacheStore` provider treating browser Cache Storage and Cloudflare Cache API as semantically identical;
- `@effect/platform-bun` or Node compatibility layers inside Cloudflare merely to make APIs line up;
- `BrowserWorkerRunner` as the Service Worker lifecycle model;
- `BunServices.layer` everywhere;
- generic `Persistence`/`KeyValueStore` as the learner-progress authority;
- exposing unstable Effect HTTP/socket/worker APIs across product modules;
- relying on pagehide/process/SW/workerd teardown to complete learner-critical writes.

## 10. Migration risk

| Risk | Severity | Containment |
|---|---|---|
| v4 is still RC | high | exact-version catalog; lock cohort; upgrade through dedicated compatibility PRs |
| unstable HTTP/HttpApi | medium-high | isolate in transport/server package/service; native Fetch fallback |
| unstable persistence | medium | do not use generic persistence as authoritative progress contract |
| typed IndexedDB depends on unstable reactivity | medium-high | hide provider behind ProgressStore; browser probe; keep raw-IDB replacement path |
| unstable worker/socket/process families | medium | do not adopt until feature exists; isolate at runtime-specific edge |
| source/registry version skew | high at lock time | resolve packages with Bun and commit exact lock; never infer publication from source |
| Cloudflare Request.signal compatibility flag | medium | pin compatibility date/flags; cancellation probe |
| browser teardown / SW eviction / workerd isolate eviction | high if mis-modeled | make durable/event/request boundaries authoritative; no detached correctness-critical work |

## 11. Adoption decisions

**Adopt now as architecture direction:**

- separate runtime roots for page, Bun, Service Worker, workerd, tests;
- stable Effect core services and focused Layers;
- project capability services around meaningful persistence/cache/transport/build semantics;
- typed v4 IndexedDB as first provider to spike;
- native Service Worker and Cloudflare lifecycle boundaries;
- `@effect/vitest` for Effect-aware tests.

**Evidence-gated, not adopted yet:**

- exact v4 dependency cohort;
- typed IndexedDB production provider;
- unstable Effect HttpClient/HttpApi in browser or Cloudflare;
- Effect workers/sockets/process APIs;
- any Cloudflare compatibility flags/configuration;
- any service-worker runtime helper beyond native event adapters.

## 12. Required probes before implementation freeze

1. Resolve/install one exact published Effect v4 cohort with Bun; commit genuine `package.json`/`bun.lock`; read installed `node_modules/effect/AGENTS.md`.
2. Real-browser test: authoritative progress transaction across all required stores; success only after `oncomplete`; failure/interruption abort; retry idempotence; no reveal before success.
3. Real-browser test: typed IndexedDB migration failure, blocked/version-change behavior, strict-vs-relaxed durability support.
4. Service Worker test: install/activate rejection behavior, cache version activation, eviction/restart, offline fetch and update races.
5. Workerd test: native handler and, if considered, `HttpEffect.toWebHandler` under pinned compatibility date with request abort/cancellation and `ctx.waitUntil` behavior.
6. Measure browser bundle impact of typed IndexedDB and any unstable HTTP/reactivity dependencies before adoption.

Until those pass, this report is architecture evidence, not a dependency lock.

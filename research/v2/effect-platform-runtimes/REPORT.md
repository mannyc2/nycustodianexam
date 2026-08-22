# R2.3 Report: Effect v4 Platform and runtime capability matrix

## Executive conclusion

The smallest truthful architecture is not one portable Platform layer. It is four explicit runtime compositions that share pure models, Schema, use cases, and only those project services whose contracts carry real semantics.

1. **Browser page**: use one `BrowserRuntime.runMain` root per interactive application or island. Use `BrowserHttpClient` when typed status/body failures, Schema decode, retry policy, tracing, or client substitution justify the unstable HTTP protocol. Keep trivial Web values and one-off static reads native. Spike first-party Effect IndexedDB behind product stores, but do not approve it for production until exact real-browser package tests prove transaction, migration, interruption, reload, and bundle behavior.
2. **Browser Service Worker**: keep `install`, `activate`, `fetch`, and `message` listeners native. The platform owns event lifetime through `waitUntil` and response ownership through `respondWith`. A bounded Effect may run inside the event-owned promise, but an Effect runtime cannot replace those semantics.
3. **Bun tooling**: put `BunRuntime.runMain` at the CLI root and provide focused Bun layers such as `BunFileSystem` and `BunPath`. Do not provide the aggregate `BunServices.layer` unless every capability it grants is intentionally authorized, because it includes unstable child-process capability and other broad services.
4. **Cloudflare workerd**: for the current small correction endpoint, use a native module Worker `fetch(request, env, ctx)` boundary and call a narrow Effect Schema/use-case program. `effect/unstable/http` becomes reasonable only when route count, middleware, streaming, or resource scope makes the unstable bridge worth its bundle and migration surface. `effect/unstable/httpapi` is not justified for one POST endpoint.

The central correctness rule across all four runtimes is that Effect interruption is not provider rollback. Abort and interruption should be propagated, but durable correctness comes from IndexedDB transactions, idempotency keys, atomic activation, explicit versioning, and reconciliation.

## Immutable inputs and current coordinates

The lane is tied to project source `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb` on `agent/chat-corpus-reconciliation`.

Current Effect source was re-checked at:

```text
Effect-TS/effect
commit: 993f4be99949d4682f79c22b9cb8dc2fda37ec7c
version: 4.0.0-rc.111
```

The preliminary PR #7 coordinate `436f10d1efccec308426532ff3f88df9a96434f3` is the direct parent of that commit. The only intervening file is `packages/effect/benchmark/Pool.ts`; no platform implementation changed. This preserves the substantive source analysis while updating the exact source head.

The Bun release coordinate was corrected to:

```text
Bun 1.4.0
bun-v1.4.0
34cbb9a40b4bd1bd767d134a7065e66c2432a676
```

The executable Effect candidate remains a coherent `4.0.0-rc.110` cohort because the observed Bun adapter registry line lagged source `rc.111`. That cohort could not be installed in this execution environment, so it remains a candidate rather than an observed resolution.

## Evidence classification

This report deliberately separates four questions that are often collapsed:

- Does source exist?
- Is a package coordinate published?
- Did the exact code execute in the target runtime?
- Should this project adopt it?

For example, the Effect v4 IndexedDB modules are source-confirmed, public-path APIs. Native IndexedDB commit and abort behavior was observed in Chromium. The Effect IndexedDB package itself was not executed. The recommendation is therefore a provider spike, not production adoption.

Likewise, a module Worker-shaped TypeScript handler was built and executed with Node Web APIs. That proves the handler shape and code path, not workerd compatibility or Cloudflare production behavior.

## Browser page architecture

### Runtime root

`BrowserRuntime.runMain` is the correct application entry boundary for an Effect-backed interactive island. Its source builds a single forked root and installs/removes the browser shutdown interrupt handler. This should be created once for the application or interactive island, not once per event.

DOM events remain native. Each event handler should translate UI input into a call to an Effect use case through the established runtime. This preserves semantic HTML and accessibility ownership while avoiding scattered `runPromise` / `runFork` boundaries.

### HTTP

`BrowserHttpClient` is a fetch-backed provider for the v4 HTTP client protocol. The provider maps Effect interruption to `AbortController.abort`. The protocol can add:

- typed transport failures;
- status filtering;
- Schema-based JSON decode;
- request middleware;
- retry policy;
- spans and metrics;
- test client substitution.

Those capabilities are valuable for content-pack downloads and correction submissions. They are not free: the HTTP namespace is explicitly unstable and adds bundle surface. The project should therefore use it behind cohesive clients such as `ContentPackDownloader` or `CorrectionClient`, not replace every `fetch` call mechanically.

A recorded real-browser native fetch probe observed a client abort and the local server observed `BrokenPipeError`. This confirms provider-level cancellation at that coordinate. It does not prove the Effect adapter or guarantee that a remote server/storage operation stops.

### IndexedDB

The current first-party browser package contains a substantially complete typed IndexedDB stack:

- `IndexedDb` browser primitives;
- `IndexedDbTable` typed tables and indexes;
- `IndexedDbVersion` version definitions;
- `IndexedDbDatabase` migration chains and database layers;
- `IndexedDbQueryBuilder` operations and shared transactions;
- tagged database/query errors;
- interruption paths that attempt `IDBTransaction.abort()`.

Upstream tests demonstrate typed insert/read, transaction, migration, rebuild, and migration-failure rollback patterns. The public modules are not under an `unstable` export path, but `IndexedDbDatabase` internally depends on unstable Reactivity. That creates migration risk that should be contained behind project stores.

The preferred next step is a provider spike behind contracts such as `ProgressStore`, `ContentPackStore`, and `SessionStore`. The contract must preserve the product transaction:

```text
selection
  -> explicit commit request
  -> authoritative IndexedDB transaction completes
  -> reveal correctness and explanation
```

Effect interruption requests an abort while a transaction is active. It cannot undo a transaction that has already committed. Therefore attempt IDs, idempotent writes, event append semantics, and reload reconciliation remain mandatory.

The Chromium probe observed:

- a strict readwrite transaction commit;
- the committed value after the transaction complete event;
- an explicit abort event;
- absence of the aborted value.

This is strong provider evidence but not Effect package execution.

### Browser storage boundaries

Do not flatten all browser storage into one key-value interface.

- IndexedDB owns durable structured application state and atomic state transitions.
- Cache Storage owns immutable HTTP `Request` / `Response` bytes for offline delivery.
- a simple key-value provider may own small settings only.
- StorageManager provides quota/persistence hints, not guarantees.
- BroadcastChannel provides invalidation/coordination hints, not durable truth.
- Web Locks may guard activation/migration coordination, but the authoritative transaction remains in IndexedDB.

### Browser package audit result

The browser package is useful but selective. It provides current adapters for HTTP, crypto, runtime, workers, sockets, streams, key-value storage, and typed IndexedDB. It does not turn service-worker events, Cache Storage, Web Locks, StorageManager, BroadcastChannel, online/offline hints, or DOM events into portable Effect semantics. Those should remain native or sit inside narrowly named project capabilities only when testing/lifecycle policy justifies the service.

## Bun tooling architecture

The Bun package adds runtime-owned implementations for capabilities that the content compiler genuinely needs:

- process entry and exit behavior through `BunRuntime`;
- typed filesystem access through `BunFileSystem` and `effect/FileSystem`;
- path semantics through `BunPath` and `effect/Path`;
- terminal and optional crypto/process/worker providers.

It deliberately depends on `@effect/platform-node-shared` for shared implementations. That is appropriate in the Bun tooling graph and disqualifies the package from browser or workerd graphs.

Use focused Layers. `BunServices.layer` is broad: in addition to filesystem/path/terminal/crypto it grants unstable child-process and process-runner capabilities. A compiler that only reads, validates, hashes, and writes content should not receive child-process authority by default.

The intended composition is:

```text
BunRuntime.runMain(
  CompilerProgram.pipe(
    Effect.provide(BunFileSystem.layer),
    Effect.provide(BunPath.layer),
    Effect.provide(BunCrypto.layer only if needed)
  )
)
```

The exact executable gate is blocked. No Bun executable, package resolution, `bun.lock`, installed `AGENTS.md`, runtime entry, filesystem operation, or Bun-produced browser bundle was available. The fixture records the exact probe rather than reporting source inspection as runtime success.

## Cloudflare HTTP options

### Option A: native fetch boundary plus Effect use case

This is the recommendation for the current product.

The handler should:

1. validate method/path/content type/body size at the Web boundary;
2. decode the correction envelope with Effect Schema or an equivalent authoritative boundary schema;
3. call one narrow Effect use case with request-scoped bindings/capabilities;
4. map typed domain failures to a small non-disclosing response algebra;
5. rely on an idempotency key for retry correctness;
6. use `ctx.waitUntil` only for explicitly non-critical post-response work.

This has the smallest bundle and cold-start surface, keeps Cloudflare `env` and `ExecutionContext` truthful, and avoids adopting unstable routing/API machinery before there is an API program.

### Option B: `effect/unstable/http` Web handler

Current source confirms `HttpRouter.toWebHandler` and the underlying Web handler bridge. The implementation lazily builds and caches the handler Layer, maps `Request.signal` abort to fiber interruption, and transfers scope ownership to a streaming response body.

That is real architectural value when the backend needs multiple routes, middleware, streaming resources, tracing, or a richer Layer graph. It is still explicitly unstable. For one correction POST, the extra abstraction and bundle risk are not earned.

### Option C: `effect/unstable/httpapi`

HttpApi becomes reasonable when a typed endpoint algebra, generated client/OpenAPI artifacts, shared middleware, and a multi-endpoint contract are product requirements. None of those conditions currently exists. It should not be selected merely because the project uses Effect.

### Layer and runtime topology

Cache environment-independent runtime/Layer construction at module/isolate scope. Inject `env`, request metadata, and request-scoped capabilities for each request. Do not construct the full runtime graph per request.

A local TypeScript/Node probe observed one module initialization across two handler requests. The Effect source independently confirms lazy cached handler construction. Neither is actual workerd proof; workerd cold/warm execution remains an explicit gate.

### Abort and streaming truth

Cloudflare request-abort notification depends on runtime compatibility behavior. When available, map `request.signal` once to Effect request-fiber interruption. Do not claim that this cancels a D1/KV/queue or external HTTP operation after the provider accepted it.

Native Web Streams are the correct edge values. Use Effect's HTTP bridge only if scoped Effect resources must remain alive through response-body consumption.

## Service Worker boundary

The Service Worker is not a smaller browser page and not a Cloudflare Worker.

The browser owns termination and event lifetime. The application must attach the actual promise to `event.waitUntil` and the response promise to `event.respondWith`. A detached fiber can be terminated even if the program assumes it is long-lived.

Recommended pattern:

```text
self.addEventListener("fetch", event => {
  event.respondWith(runBoundedFetchEffect(event.request))
})

self.addEventListener("activate", event => {
  event.waitUntil(runBoundedActivationEffect())
})
```

The runtime, if any, must be prepared at module scope and each event must retain ownership of its promise. Long-lived background assumptions, unbounded fibers, and page-specific `BrowserRuntime` shutdown hooks do not belong here.

The recorded Chromium probe observed install/activate cache markers, a `respondWith` response, and a delayed message response protected by `waitUntil`.

## Where native Web APIs are the better Effect implementation.

Native Web APIs are the better implementation when the value or lifecycle is already the truthful runtime contract and an Effect service would merely rename it.

Use native APIs directly for:

- `Request`, `Response`, `Headers`, and `URL` values;
- `Blob` and `File` construction;
- DOM event ownership and semantic UI behavior;
- Service Worker events, `waitUntil`, and `respondWith`;
- Cache Storage operations at the offline asset boundary;
- BroadcastChannel as an invalidation hint;
- Web Locks as a browser coordination primitive;
- StorageManager quota/persistence hints;
- `navigator.onLine` and online/offline events as hints only;
- `CompressionStream` / `DecompressionStream` when supported;
- native Web Streams at browser/workerd boundaries;
- Cloudflare `env` and `ExecutionContext` at the module Worker boundary.

Place a native API inside a project Effect service only when the service adds a meaningful contract, such as:

- content-pack checksum policy and typed integrity failures;
- durable progress transaction semantics;
- pack activation coordination;
- correction submission idempotency and response mapping;
- test substitution for a cohesive external dependency;
- scoped ownership of a long-lived resource.

Do not create a service per function, a package per service, or a universal `WebPlatform` object.

## False portability findings

The following capabilities may share TypeScript shapes but must retain distinct semantics:

- browser Cache Storage versus Cloudflare Cache API;
- browser IndexedDB versus Cloudflare D1/KV/R2;
- browser Service Worker fetch events versus Cloudflare module fetch handlers;
- browser dedicated Workers versus Bun workers versus Cloudflare isolates;
- Bun/node-shared filesystem versus browser File System Access;
- browser WebSocket client lifecycle versus Cloudflare upgrade/server lifecycle;
- browser online hints versus actual origin reachability;
- AbortSignal notification versus provider cancellation/rollback.

A project service may normalize domain outcomes while preserving provider-specific evidence and error detail internally. It must not promise stronger atomicity, ordering, lifetime, or cancellation than the provider supplies.

## Probe results

### Observed

- Chromium 144 real-browser Web API matrix.
- strict IndexedDB commit and explicit abort rollback.
- native fetch abort with server disconnect observation.
- Service Worker install/activate/fetch/message lifetime.
- Cache Storage, BroadcastChannel, Web Locks, StorageManager, compression, streams, crypto, Blob/File, Worker, and DOM events.
- TypeScript Cloudflare-compatible handler build.
- Node Web `Request` / `Response` execution for two requests with one module initialization.

### Blocked

- Bun install and `bun.lock`.
- installed `node_modules/effect/AGENTS.md` review.
- BrowserHttpClient typed status/Schema/abort execution.
- first-party Effect IndexedDB execution.
- BunRuntime/filesystem execution.
- Effect Web handler and Effect Layer reuse execution.
- Effect browser/workerd bundle measurement.
- workerd/Wrangler/Miniflare execution.
- Cloudflare client-abort and cold-start observations.

The blocked gates remain in `OPEN-QUESTIONS.csv`, and exact sources are under `fixtures/runtime-matrix/probes/`.

## Final recommendation set

- Adopt four explicit runtime roots.
- Adopt native Web values and host lifecycle at runtime edges.
- Provisionally adopt BrowserRuntime and cohesive typed browser clients.
- Run a first-party Effect IndexedDB provider spike, but keep production approval blocked.
- Adopt native Service Worker event ownership.
- Provisionally adopt focused Bun platform Layers after the executable cohort gate passes.
- Recommend native Cloudflare fetch plus a narrow Effect use case for corrections.
- Defer HttpRouter until backend complexity grows.
- Do not adopt HttpApi for the current endpoint.
- Defer analytics and all server storage products until a concrete requirement exists.
- Treat interruption as control flow, not transactional correctness.

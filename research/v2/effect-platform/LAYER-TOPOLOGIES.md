# Runtime and Layer topologies

These are **architecture topologies, not compile-verified implementation snippets**. Exact imports and package versions remain gated by a real Bun install because the observed `@effect/platform-bun` registry rc tag lagged current source.

## 1. Browser page

```text
semantic HTML / native controls / DOM events
        |
        v
one interactive application root
        |
        +-- BrowserRuntime.runMain
              |
              +-- PageLive
                    |
                    +-- ProgressStoreLive
                    |     +-- project domain transaction mapping
                    |     +-- preferred provider spike:
                    |           @effect/platform-browser IndexedDbDatabase
                    |           + IndexedDbTable / IndexedDbVersion
                    |           + IndexedDbQueryBuilder.withTransaction
                    |
                    +-- BrowserCrypto.layer
                    |
                    +-- CorrectionsTransportLive?      [only if endpoint exists]
                    |     +-- native fetch OR
                    |     +-- isolated effect/unstable/http FetchHttpClient
                    |
                    +-- Effect Clock / Random where deterministic behavior matters
```

### Ownership rules

- Build `PageLive` once per interactive application root, not per DOM event.
- Static acquisition/reference pages do not import the Effect runtime unless they host an interactive capability.
- DOM mutation, focus management, pointer events, keyboard events, and ARIA reflection remain native renderer/controller responsibilities.
- `ProgressStore.commitAnswer` (exact name TBD) returns success only after the authoritative IndexedDB transaction completes. UI reveal consumes that success; it does not optimistically reveal and then persist.
- `BrowserRuntime` page teardown is cleanup, never a durable-save strategy.

## 2. Bun content compiler / CLI

```text
Bun process
    |
    +-- BunRuntime.runMain
          |
          +-- CompilerLive
                |
                +-- BunFileSystem.layer  -> effect/FileSystem
                +-- BunPath.layer        -> effect/Path
                +-- BunCrypto.layer      -> effect/Crypto
                |
                +-- ContentRegistry / validation / publication services
                +-- SourceReader / ArtifactWriter project services as justified
                |
                +-- BunBuildService?     -> wraps Bun.build only if used
                +-- ExternalTool?        -> isolated unstable ChildProcessSpawner only if needed
```

### Ownership rules

- Do not provide `BunServices.layer` by default: it carries child-process authority that the ordinary compiler may not need.
- Pure parsing, normalization, deterministic IDs, sorting, and publication calculations remain ordinary TypeScript.
- Filesystem, output mutation, hashing, clocks, external processes, and other meaningful capabilities are Effect services.
- `Bun.build` is a Bun-specific build operation; if it needs abstraction, define a build capability around the operation rather than pretending it is generic filesystem work.

## 3. Browser Service Worker

```text
ServiceWorkerGlobalScope
    |
    +-- install event
    |     `event.waitUntil(runInstallEffect())`
    |
    +-- activate event
    |     `event.waitUntil(runActivateEffect())`
    |
    +-- fetch event
    |     if handled:
    |       `event.respondWith(runFetchEffect(event.request))`
    |
    +-- message event
          `event.waitUntil(runMessageEffect(...))` when async work must complete

Each event Effect
    |
    +-- PackCache / OfflineAssetStore
    |     -> browser Cache Storage provider
    |
    +-- PackVerifier
    |     -> Effect Crypto or native Web Crypto at thin edge
    |
    +-- PackManifest / activation state
    |     -> durable state, never process-memory authority
    |
    +-- optional worker-owned IndexedDB metadata
          -> worker-specific IndexedDb.make layer if justified
```

### Ownership rules

- Do not use `BrowserRuntime.runMain`; page lifecycle is the wrong lifecycle.
- Do not use `BrowserWorkerRunner` as the Service Worker model; Effect worker protocols are not `FetchEvent`/`ExtendableEvent` semantics.
- `respondWith()` and initial `waitUntil()` registration stay synchronous in the native event callback.
- No correctness-critical detached fiber survives beyond the event Promise.
- The worker may disappear between any two events. Cache/manifest/IDB state is authority; memory is acceleration only.
- Learner progress remains page-side IndexedDB authority. Service Worker storage is for offline delivery/pack concerns unless a future design explicitly proves otherwise.

## 4. Cloudflare workerd

### Default narrow endpoint

```text
Cloudflare ES-module Worker
    |
    +-- export default.fetch(request, env, ctx)
          |
          +-- construct request-scoped Context / narrow services
          |     +-- CorrectionStore? from explicit env binding
          |     +-- request metadata only when business logic needs it
          |     +-- ctx.waitUntil adapter only for real background capability
          |
          +-- run Effect correction/use-case program
          |
          +-- return native Response
```

Use this default while the backend is only a tiny corrections endpoint or similarly narrow capability.

### Optional Effect HTTP upgrade

```text
module fetch(request, env, ctx)
    |
    +-- request-scoped Cloudflare Context
    |
    +-- cached HttpEffect.toWebHandlerLayer(...)       [effect/unstable/http]
          |
          +-- HttpRouter / HttpApi                     [unstable]
          +-- project endpoint services
          +-- Schema models/errors
```

Adopt only if endpoint count/shared API contracts/middleware/OpenAPI/client-generation benefits outweigh unstable-API migration cost.

### Ownership rules

- Never install `@effect/platform-bun` or Node server adapters just to make workerd resemble a server process.
- Cloudflare `env` and `ctx` are runtime semantics, not generic environment variables.
- Global/module-scope Layer memoization can be a startup optimization only. Correctness cannot depend on isolate persistence.
- `fetch()` I/O runs inside the Cloudflare Request Context.
- Any work that must finish after returning a response goes through `ctx.waitUntil()` and its finite lifetime.
- If `HttpEffect.toWebHandler` is adopted, pin/test `enable_request_signal` and relevant cancellation compatibility flags because the current Effect bridge interrupts its fiber from `request.signal`.

## 5. Tests

```text
Vitest execution
    |
    +-- @effect/vitest
          |
          +-- it.effect / shared layer fixtures
          +-- TestLive
                +-- TestClock / deterministic Clock as appropriate
                +-- deterministic Random / seeded services
                +-- InMemoryProgressStore
                +-- FakeTransport
                +-- FakeBuildTool

separate integration roots
    +-- real browser IndexedDB tests
    +-- real browser Service Worker/PWA tests
    +-- Bun compiler smoke/probe tests
    +-- workerd/Wrangler runtime tests
```

### Ownership rules

- A fake provider proves application behavior, not provider correctness.
- `fake-indexeddb` can be useful for fast tests but cannot certify browser transaction auto-commit/yield timing.
- Bun's test runner can own pure/tooling tests where selected, but it does not replace `@effect/vitest` service semantics or browser/workerd integration.

## 6. Shared capability boundary

The safe shared center is deliberately smaller than the runtime adapters:

```text
pure content/domain state transitions
Schema models / TaggedError models
Effect use cases
ProgressStore interface
PackStore / PackTransport interfaces
Checksum/crypto use
Clock / Random dependencies where deterministic
corrections use case

          ^ providers attach here ^

Browser page    Bun compiler    Service Worker    Cloudflare    Tests
```

Do not create a universal `Platform` service. Add a project service only when the capability itself is meaningful to application behavior, testing, failure, lifecycle, resource ownership, or runtime substitution.

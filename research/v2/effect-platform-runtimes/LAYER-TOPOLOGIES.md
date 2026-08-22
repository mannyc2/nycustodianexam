# Layer Topologies

## Principle

A runtime root is an ownership boundary. A Layer graph should be built at the coarsest truthful lifetime and should expose only the capabilities that runtime needs.

Do not build one cross-runtime `PlatformLive`. Do not build the full graph per DOM event, Service Worker event, or Cloudflare request.

## Browser page

```text
HTML document / interactive island
  -> native DOM event boundary
  -> one BrowserRuntime.runMain root
       -> AppConfig
       -> Clock / DateTime
       -> ContentPackDownloader
            -> BrowserHttpClient.layer (provisional)
       -> ContentIntegrity
            -> BrowserCrypto.layer (provisional)
       -> ProgressStore / SessionStore / ContentPackStore
            -> Effect IndexedDb provider spike
       -> screen state / use cases
```

Lifetime:

- runtime: interactive application/island;
- database connection: runtime scope;
- transaction: one use-case operation;
- request: one calling fiber;
- DOM listener: controller/node scope.

Do not:

- create a runtime per click;
- let the query builder escape the store implementation;
- let storage failure reveal the answer;
- import Bun Layers into browser packages.

## Browser Service Worker

```text
Service Worker module evaluation
  -> optional small/lazy runtime (only if justified)
  -> native event listener
       -> event.waitUntil(runBoundedEffect(...))
       -> event.respondWith(runBoundedResponseEffect(...))
       -> native Cache Storage provider
       -> shared Schema/pure logic
       -> authoritative IndexedDB coordination where required
```

Lifetime:

- module globals: disposable/restartable hints only;
- event work: owned by `waitUntil` / `respondWith` promise;
- cache/database state: origin durable storage;
- no detached critical fiber.

## Bun CLI/compiler

```text
Bun process
  -> BunRuntime.runMain
       -> CompilerCommand
            -> CompilerConfig
            -> SourceReader
                 -> effect/FileSystem <- BunFileSystem.layer
                 -> effect/Path       <- BunPath.layer
            -> Schema validation
            -> ContentIntegrity
                 -> effect/Crypto     <- BunCrypto.layer (if used)
            -> Publisher
                 -> staged files / atomic activation
       -> logging / terminal only if needed
```

Lifetime:

- runtime: one command/process;
- temporary directory/files: Scope;
- filesystem/path providers: process root;
- publication transaction: command/use-case scope.

Avoid `BunServices.layer` unless child process, terminal, crypto, worker and process capabilities are all intentionally granted.

## Cloudflare recommended native boundary

```text
workerd isolate/module
  -> module-scoped environment-independent runtime/use-case construction
  -> export default fetch(request, env, ctx)
       -> native method/path/size checks
       -> request-scoped binding adapters from env
       -> decode with Schema
       -> run CorrectionUseCase in one request fiber
       -> map typed errors to native Response
       -> ctx.waitUntil only for explicitly best-effort work
```

Lifetime:

- runtime and environment-independent Layers: isolate/module cache;
- env-backed service instances: request/environment scope unless provider identity is proven safe to cache;
- request fiber: request scope;
- streaming resource: response-body scope;
- test teardown: explicit runtime dispose.

## Cloudflare future HttpRouter topology

```text
workerd isolate/module
  -> HttpRouter.toWebHandler(AppLayer)
       -> lazy cached Layer build
       -> one handler/runtime cache
       -> per-request Request -> fiber -> Response
       -> Request.signal -> fiber interruption
       -> response stream retains Scope
  -> fetch delegates to cached handler
```

Adopt only after a workerd bundle/runtime/cold-start gate and a real complexity trigger.

## Binding injection

Do not hide the Cloudflare environment in a global generic platform service.

Preferred:

```text
Env.CORRECTIONS_DB
  -> D1CorrectionRepository layer for this request/environment
  -> CorrectionRepository project contract
  -> CorrectionUseCase
```

The project contract may be shared. D1 transaction/cancellation/error semantics remain provider-specific.

## Test topologies

### Pure/domain

```text
Schema + pure functions + deterministic simulations
  -> Bun/Node test process
  -> no runtime provider required where pure
```

### Effect services

```text
@effect/vitest
  -> TestClock / test Layers / property tests
  -> no claim about browser/workerd provider behavior
```

### Browser

```text
real Chromium/target browsers
  -> built browser entry
  -> real IndexedDB
  -> real Service Worker
  -> native network abort server harness
```

### Cloudflare

```text
Workers Vitest / workerd
  -> module Worker
  -> test bindings
  -> compatibility date/flags
  -> cold/warm, abort, stream and error tests
```

## Cancellation topology

```text
host AbortSignal / shutdown signal
  -> Effect fiber interruption request
  -> finalizers and provider abort request
  -> provider may stop, finish, or have already committed
  -> caller reconciles durable outcome
```

Never replace the last step with an assumption.

## Anti-patterns rejected

- one `Platform` service containing every Web/Bun/Cloudflare API;
- one giant Layer hiding the dependency graph;
- runtime/Layer construction per event or request;
- Promise/Effect bouncing at every helper;
- broad Bun capability grant by convenience;
- Service Worker critical fibers detached from event promises;
- Cloudflare `env` captured as universal global state;
- query builder exposed as domain storage contract;
- native deterministic values wrapped only to look "Effect-native";
- Node/Bun runtime test relabeled as browser/workerd proof.

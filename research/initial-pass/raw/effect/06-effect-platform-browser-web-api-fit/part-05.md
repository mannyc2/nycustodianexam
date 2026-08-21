## What stable KeyValueStore is good at

The stable browser package supplies:

* `layerLocalStorage`
* `layerSessionStorage`

through `BrowserKeyValueStore`. ([Effect TS][14])

Those are reasonable for small preferences such as:

```text
preferred language
reduced motion preference
default study mode
last selected profile ID
```

Put them behind a typed `Preferences` service and Schema-decode each value.

Do not expose this throughout the application:

```ts
kvs.set("anything", "arbitrary-json")
```

## Generic persistence KVS

Effect v4 includes a broad persistence subsystem and browser IndexedDB implementation.

Even that does not make generic persistence KVS a correct representation for:

* Append-only attempt events
* Content-object indexing
* Multi-store atomic updates
* Materialized views
* Review-queue due indexes
* Session version pinning
* Content-pack migrations and activation

The issue is semantic, not merely performance.

A `ProgressRepository` operation may need to atomically:

```text
append attempt event
update per-question progress
update confusion-pair progress
update review queue
checkpoint session position
```

A sequence of independent KVS writes would not express that transaction.

## What KeyValueStore must not represent

Do not use a generic KeyValueStore as the main domain store for:

```text
content packs
questions
source records
attempt history
progress projections
review queue
sessions
print packet manifests
```

That would lose:

* Indexes
* Range scans
* Multi-record transactions
* Uniqueness constraints
* Version-change migrations
* Clear data invariants
* Purpose-specific failure types

## Recommended storage service split

```text
Preferences
  backed by BrowserKeyValueStore
  or a tiny direct localStorage adapter

ContentRepository
  backed by IndexedDB

ProgressRepository
  backed by IndexedDB

PackCachePolicy
  optionally backed by Cache Storage for HTTP responses

AppShellCache
  owned by the Service Worker
```

The IndexedDB implementation should be project-owned on v3 and supplied through a Layer:

```text
BrowserLive
  provides
    PreferencesLocalStorage
    ContentRepositoryIndexedDb
    ProgressRepositoryIndexedDb
```

V4's browser IndexedDB modules may later become the low-level implementation of those same repositories.

---

# 7. Browser package assessment

## Stable v3 public surface

The stable browser package index exports:

```text
BrowserHttpClient
BrowserKeyValueStore
BrowserRuntime
BrowserSocket
BrowserStream
BrowserWorker
BrowserWorkerRunner
Clipboard
Geolocation
Permissions
```

It is a useful implementation package, not a comprehensive browser platform. ([Effect TS][27])

Important absences include:

```text
IndexedDB
Cache Storage
Service Worker lifecycle
BroadcastChannel
Web Locks
StorageManager
online/offline service
compression
File/Blob abstraction
Web Crypto
cookie store
```

Therefore, installing it does not eliminate project-owned browser adapters.

## Production maturity

The stable package is production-usable, but the individual modules vary in need and architectural fit.

### Strong fits

* BrowserSocket, when WebSocket exists
* BrowserWorker, when a typed worker protocol exists
* BrowserKeyValueStore for small preferences
* BrowserRuntime at the application entrypoint, if its runtime pattern fits the app

### Narrow or optional fits

* BrowserStream, for window/document event streams only
* Clipboard, Geolocation, and Permissions only if features require them
* BrowserHttpClient when XHR-specific behavior is deliberately needed

### Not present

* Most offline-first persistence and Service Worker APIs

## V4 direction

The v4 browser package adds:

```text
BrowserCrypto
BrowserPersistence
IndexedDb
IndexedDbCodec
IndexedDbKeyValueStore
IndexedDbMigrator
IndexedDbQuery
```

That is strategically relevant to this application. It is also still prerelease and has more migration exposure than the stable browser modules.

The correct posture is:

1. Keep domain repositories independent from platform types.
2. Implement a stable v3 IndexedDB adapter now if development starts before v4 GA.
3. Build contract tests around repository behavior.
4. Evaluate the v4 IndexedDB implementation against those tests after stabilization.
5. Replace the provider, not the domain architecture, if it wins.

---

# 8. Platform portability

The project has three execution environments with real semantic differences.

## Genuinely shareable code

These should be pure or depend only on core Effect services such as Clock or Random:

```text
Domain entities and transitions
Content schemas and validation
Pack manifest model
Checksum policy and digest representation
Review scheduling
Deterministic session generation
Question scoring
Progress materialization rules
Correction-request schema
```

These can share project services:

```text
ContentPackSource
ContentRepository
ProgressRepository
Preferences
ContentDigest
Connectivity
CorrectionGateway
```

The implementations remain runtime-specific.

## Browser-specific capabilities

```text
IndexedDB
localStorage
Cache Storage
Service Worker registration
File/Blob import and export
BroadcastChannel
Web Locks
StorageManager
DOM and UI events
Web Workers
online/offline hints
```

## Build-specific capabilities

```text
FileSystem
Path
process execution
watching directories
build configuration
large source asset processing
```

## Cloudflare-specific capabilities

```text
env.ASSETS
KV
R2
D1
Durable Objects
ExecutionContext
Cache API behavior at the edge
request-local bindings
```

Browser Cache Storage and Cloudflare Cache API should not share an implementation merely because both contain the word "cache." Cloudflare's cache semantics are data-center local and differ from the browser's persistent origin-controlled Cache Storage. ([Cloudflare Docs][28])

Browser Web Workers and Cloudflare Workers are also different execution models. Cloudflare does not support creating Web Workers inside a Worker. ([Cloudflare Docs][29])

## Portable interface versus false abstraction

A portable interface is useful when the domain operation is stable:

```text
ContentDigest.digest(bytes)
ContentPackSource.fetchManifest(channel)
CorrectionGateway.submit(correction)
```

It is a false abstraction when it hides materially different operations:

```text
UniversalFileSystem
UniversalCache
UniversalWorker
UniversalBrowserStorage
```

Design for **portable domain capabilities**, not identical runtime APIs.

---

# 9. Proposed Layer topology

The diagram below uses project-level services. Low-level Effect Platform modules are implementation details.

## BrowserLive

```text
BrowserLive
  StudyUseCasesLive

  ContentPackSourceLive
    -> Effect HttpClient
    -> FetchHttpClient.layer
    -> Manifest / Pack Schema

  ContentRepositoryIndexedDb
    -> native IndexedDB

  ProgressRepositoryIndexedDb
    -> native IndexedDB

  PreferencesLive
    -> BrowserKeyValueStore.layerLocalStorage
       or direct localStorage adapter

  ContentDigestWebCrypto
    -> crypto.subtle

  ConnectivityLive
    -> online/offline hints
    -> actual request outcomes

  optional TabBusLive
    -> BroadcastChannel

  optional CrossTabLockLive
    -> navigator.locks

  Effect Clock
  Effect Random
```

Do **not** create:

```text
BrowserUrlService
BrowserHeadersService
BrowserFileService
BrowserAbortControllerService
BrowserDomEventService
```

Those are values or UI-boundary mechanics, not application capabilities.

## ServiceWorkerLive

A separate bundle and Layer graph:

```text
ServiceWorkerLive
  AppShellCacheLive
    -> native Cache Storage

  optional StaticAssetIndexLive
  optional WorkerMessageCodecLive
  optional PackResponseCacheLive

  no DOM
  no localStorage
  no browser window
  no assumption of long-lived memory
```

A Service Worker entrypoint must keep the native event model:

```ts
self.addEventListener("fetch", (event) => {
  event.respondWith(
    runtime.runPromise(handleFetch(event.request))
  )
})

self.addEventListener("install", (event) => {
  event.waitUntil(
    runtime.runPromise(handleInstall)
  )
})
```

The exact runtime API may differ by Effect version, but the native lifecycle rule does not.

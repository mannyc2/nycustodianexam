## BuildLive

If the build is substantial:

```text
BuildLive
  FileSystem
  Path
  CommandExecutor
  ContentSourceLoader
  ContentValidator
  ManifestWriter
  PacketBuilder
  ContentDigestNode
  Effect Clock
```

Provide with:

```text
@effect/platform-node
or
@effect/platform-bun
```

based on the selected build runtime.

Do not bundle build implementation packages into browser code.

A small build helper can remain ordinary Node or Bun TypeScript. Effect Platform is not mandatory for every script.

## WorkerLive

When the Cloudflare Worker is introduced:

```text
WorkerLive
  CorrectionGatewayWorker
    -> native Request / Response
    -> project request Schema

  StaticAssetGateway
    -> env.ASSETS

  ContentDigestWorker
    -> crypto.subtle

  optional WorkerKvLive
    -> project service over Cloudflare KV

  optional WorkerD1Live
    -> project service or official D1 integration

  optional WorkerR2Live
    -> project service over R2 binding

  native ExecutionContext adapter
```

No general official Cloudflare Layer currently supplies all of these. Build the smallest project-owned environment adapter around the actual `env` and request context.

If an HTTP framework is later justified, evaluate Effect `HttpApi` and a Web-handler bridge after the Worker endpoints are known. For a single correction endpoint, native request dispatch plus Effect use cases may remain simpler.

## Test

```text
Test
  ContentPackSourceTest
  ContentRepositoryTest
  ProgressRepositoryTest
  PreferencesTest
  ContentDigestKnownVectors
  ConnectivityTest
  CorrectionGatewayTest
  TestClock
  TestRandom
```

Test at the appropriate boundary:

* Domain/use-case tests replace project services.
* HTTP-adapter tests replace or transform `HttpClient`.
* Repository contract tests exercise a real browser IndexedDB database where behavior matters.
* Service Worker behavior uses a real service-worker-capable browser or dedicated worker test environment.
* Cloudflare bindings use Miniflare or the official Workers test integration.

Do not fake every native browser object in ordinary unit tests. A fake that reproduces no platform semantics can be less useful than a small real-browser integration test.

---

# 10. Error modeling at platform boundaries

Stable domain errors should not expose platform-specific failure classes unnecessarily.

Recommended categories:

```text
ContentSourceUnavailable
ContentResponseRejected
ContentDecodeFailed
ContentIntegrityFailed
ContentInstallFailed
ContentStorageUnavailable
ProgressAppendFailed
PreferenceUnavailable
CorrectionSubmissionFailed
```

The adapter may retain the original Cause for logging or debugging, but domain code should not branch on:

```text
DOMException
HttpClientError
IDBRequest.error
QuotaExceededError
Cloudflare binding error
```

unless the application has a genuine recovery policy tied to that platform condition.

Do preserve meaningful distinctions such as:

```text
network unavailable
request timed out
HTTP status rejected
response invalid
checksum mismatch
storage quota exhausted
migration failed
```

These distinctions drive different user messages and retry policies.

---

# 11. Cancellation and resource truthfulness

A recurring architecture risk is promising cancellation that the underlying browser operation does not provide.

## Fetch

Fetch accepts an `AbortSignal`. Effect `HttpClient` bridges interruption to an abort signal. Cancellation is meaningful.

## Streams

Cancellation depends on the stream and underlying source. Effect interruption can cancel the Effect consumer, but adapters should not claim that every upstream browser source has stopped unless the native cancellation path was invoked.

## IndexedDB

Native IndexedDB transactions can be aborted before completion, but once the browser commits a transaction, interruption of the waiting Effect does not retroactively undo committed data.

Therefore:

* Keep transactions short.
* Use transaction completion as the commit boundary.
* Do not describe an interrupted caller as proof that the transaction did not commit.
* Return or persist idempotency keys for operations that may need safe retry.

## Cache Storage

A page Effect may stop waiting for `cache.put()`, but the browser operation may already have progressed. Use immutable keys and idempotent cache writes.

## Service Worker

The browser can terminate the worker between events. `waitUntil()` extends event lifetime only for the current event. Do not build correctness around a permanently resident runtime or in-memory queue.

## Web Locks

Lock acquisition accepts an AbortSignal. Work performed inside the lock must still be written through the durable transaction boundary.

## Workers

Browser Web Worker termination can stop the worker process, but an Effect fiber interruption inside the worker is distinct from terminating the worker itself.

The rule should be:

> Document cancellation guarantees per adapter. Effect interruption is always an internal control signal; provider cancellation is only guaranteed where the native API supports and the adapter invokes it.

---

# 12. Where not using Effect Platform is the better Effect architecture

This deserves an explicit list.

## Direct native use is better for:

* `URL` and `URLSearchParams`
* `Headers` outside Effect HTTP workflows
* `File`, `Blob`, and `FormData`
* `addEventListener` and DOM interaction
* `navigator.storage`
* BroadcastChannel before a cross-tab protocol exists
* Web Locks before a lock use case exists
* Cache Storage when implementing a Service Worker cache policy
* Service Worker lifecycle and event dispatch
* `crypto.subtle` underneath a small digest service
* Native Worker for one simple fire-and-return computational task
* Cloudflare `env` bindings at the Worker adapter boundary

## A project-owned Effect service is better than a generic Platform abstraction for:

* `ContentRepository`
* `ProgressRepository`
* `ContentPackSource`
* `ContentDigest`
* `Preferences`
* `Connectivity`
* `CorrectionGateway`
* `CrossTabLock`
* `TabBus`
* `AppShellCache`

## Effect Platform is better for:

* `HttpClient`, when typed HTTP policy and testability matter
* `Stream`, when backpressure, interruption, and composition matter
* Worker/RPC-style protocols, when there is a real typed worker service
* BrowserSocket, when WebSocket exists
* Build-time FileSystem and Path, when build tooling is substantial

## Effect Platform should not be introduced merely to:

* Avoid seeing a browser global
* Claim architectural purity
* Make browser and Cloudflare storage appear identical
* Hide transaction boundaries
* Provide a service for a pure value
* Replace one line of native code with one line of wrapper code

---

# 13. Initial dependency recommendation

For a production baseline started immediately:

```text
effect@3.22.1
@effect/platform@0.97.1
```

Add:

```text
@effect/platform-browser@0.77.1
```

only if the initial implementation uses at least one of:

```text
BrowserKeyValueStore
BrowserWorker
BrowserSocket
BrowserRuntime
```

The first browser implementation can use:

```text
effect
@effect/platform
native IndexedDB
native Web Crypto
native DOM events
native Service Worker APIs
```

without installing the browser package immediately.

For build tooling, choose exactly one implementation package:

```text
@effect/platform-node
or
@effect/platform-bun
```

Do not install both without an actual cross-runtime build requirement.

Do not add:

```text
@effect/platform-node
```

to the browser workspace package.

Do not add experimental Cloudflare packages until D1 or Durable Object SQLite is actually selected.

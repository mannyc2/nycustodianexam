# Browser Service Worker boundary

## Decision

The Service Worker is a **native browser event runtime**, not a page runtime and not an Effect Worker protocol runtime.

Effect should structure the asynchronous work performed by Service Worker events, while the native event APIs retain ownership of event lifetime and response commitment.

## Runtime roots

### Install

```ts
self.addEventListener("install", (event) => {
  event.waitUntil(runInstallEffect())
})
```

The Effect may verify manifests, populate a staging cache and fail with typed installation errors. Rejection of the `waitUntil` promise is allowed to fail installation.

### Activate

```ts
self.addEventListener("activate", (event) => {
  event.waitUntil(runActivateEffect())
})
```

Activation may remove superseded caches, atomically advance worker-owned pack metadata and claim clients according to the final update policy.

### Fetch

```ts
self.addEventListener("fetch", (event) => {
  if (!shouldHandle(event.request)) return
  event.respondWith(runFetchEffect(event.request))
})
```

`respondWith` must be called synchronously by the native event handler. The returned promise owns the handled response path.

### Message

Messages that initiate asynchronous durable work should attach that work to the event lifetime (`waitUntil` where the event type/support requires it) rather than forking detached fibers.

## Why not `BrowserRuntime.runMain`

`BrowserRuntime.runMain` is designed around a page's `pagehide` lifecycle. A Service Worker can be suspended/terminated between events and has no page lifecycle to own one permanent main fiber.

Using a page runtime would encourage exactly the wrong assumption: that in-memory fibers/state remain alive while offline/update work continues.

## Why not `BrowserWorkerRunner`

Current `BrowserWorkerRunner` implements Effect's unstable Worker protocol over `MessagePort`, `Worker`, `SharedWorker` or `Window`-style messaging.

A Service Worker has different responsibilities:

- install/activate upgrade state machine;
- interception of network requests;
- `FetchEvent.respondWith`;
- `ExtendableEvent.waitUntil`;
- browser-controlled termination/restart;
- navigation/subresource cache behavior.

Therefore `effect/unstable/workers` is not the Service Worker runtime abstraction.

## Effect boundary helper

A small project helper can adapt an Effect to the promise expected by an event, but it should not hide the event itself:

```text
waitUntilEffect(event, effect)
respondWithEffect(fetchEvent, effectReturningResponse)
```

The helper may centralize logging/error conversion/runtime Context. It must not make a detached fiber the owner of work.

## Offline-pack ownership

The Service Worker owns delivery/cache concerns, for example:

```text
PackCache
  stage(version, assets)
  verify(version)
  activate(version)
  remove(version)
  match(request)
```

The provider can use native browser Cache Storage. The project service is justified because pack staging/activation/versioning are meaningful product semantics; a generic wrapper around `caches.open()` alone is not.

### Suggested pack state machine

```text
download/stage assets outside activation switch
  -> verify expected files/checksums
  -> write durable staged metadata
  -> atomic logical activation of manifest/version
  -> later cleanup superseded cache
```

Exact storage ownership belongs to the IndexedDB/offline lane, but this runtime lane requires restart-safe durable truth.

## Learner progress

The Service Worker is not the default authority for learner progress.

Normal answer commitment occurs in the interactive page against authoritative IndexedDB before reveal. Routing that transaction through a Service Worker would add lifecycle/message failure modes without a product need.

If the Service Worker needs IndexedDB for **worker-owned** metadata, current v4 browser source permits a worker-specific layer through:

```text
IndexedDb.make({
  indexedDB: globalThis.indexedDB,
  IDBKeyRange: globalThis.IDBKeyRange
})
```

The provided `IndexedDb.layerWindow` is not appropriate because it literally reads `window`.

## Crypto

Pack verification can use Web Crypto directly at the worker boundary or a worker-specific layer providing stable `effect/Crypto`. Choose Effect Crypto if the verification workflow already uses Effects and test substitution/typed composition benefits.

Do not invent a generic Crypto port simply to hide `crypto.subtle`.

## Network fetch

Native `fetch` is appropriate inside Service Worker logic. If pack transport becomes a meaningful retryable/observable capability, put fetch behind `PackTransport`; do not globally adopt unstable Effect HttpClient solely to make page/SW/workerd network calls look identical.

## Cache Storage versus Cloudflare Cache

Even though both expose Cache-like APIs:

- browser Cache Storage is part of offline application delivery and tied to Service Worker/browser storage lifetime;
- Cloudflare Cache is edge/data-center-local infrastructure with different rules.

No shared low-level cache provider should assume semantic equivalence.

## Cancellation and interruption

Native event lifetime is the outer authority. Within that promise, Effect Scope/fibers can provide structured concurrency and cancellation.

Rules:

- if the Effect fails, let the event promise reflect the intended failure policy;
- ensure cleanup/finalizers needed for correctness finish before the event promise settles;
- do not depend on finalizers after the browser terminates the worker;
- no detached correctness-critical fork after `respondWith`/`waitUntil` promise resolution.

## Update and restart tests required

Real-browser tests must cover:

1. install success and rejection;
2. activate migration/cleanup failure;
3. worker termination/restart between events;
4. cached offline navigation/subresource behavior;
5. old/new worker race with active clients;
6. staged pack verification before activation;
7. cache miss/corruption fallback;
8. message-triggered update lifetime;
9. no answer/reveal data leakage through cache/manifests/assets;
10. rollback/recovery from incomplete pack update.

A synthetic unit harness alone cannot certify these lifecycle semantics.

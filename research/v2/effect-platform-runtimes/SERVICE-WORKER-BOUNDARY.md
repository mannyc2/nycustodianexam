# Service Worker Boundary

## Decision

Keep browser Service Worker lifecycle and event ownership native.

Effect may structure bounded work invoked by an event, but it does not replace:

- `install`;
- `activate`;
- `fetch`;
- `message`;
- `event.waitUntil(...)`;
- `event.respondWith(...)`;
- browser-controlled termination and restart.

`BrowserRuntime` and Effect dedicated-worker adapters are not Service Worker lifecycle abstractions.

## Why lifetime ownership matters

A browser may terminate a Service Worker when it considers the worker idle. The event promise is the durable lifetime signal available to application code.

If an Effect fiber is started and detached without its completion promise being attached to `waitUntil` or `respondWith`, the browser may terminate it. A long-lived runtime object in module scope does not override this rule.

Therefore every event must visibly own the promise that represents its critical work.

## Recommended patterns

### Install

```ts
self.addEventListener("install", (event) => {
  event.waitUntil(prepareVersionedStaticAssets())
})
```

`prepareVersionedStaticAssets()` may internally run a bounded Effect. It must resolve only after the install-critical cache writes are complete.

### Activate

```ts
self.addEventListener("activate", (event) => {
  event.waitUntil(activateVerifiedPackAndCleanup())
})
```

Activation must not declare a pack active merely because bytes exist in Cache Storage. It must coordinate with authoritative IndexedDB manifest/activation state.

### Fetch

```ts
self.addEventListener("fetch", (event) => {
  event.respondWith(routeOfflineRequest(event.request))
})
```

`routeOfflineRequest` returns the actual `Response` promise. It may call shared pure logic or an Effect use case, but `respondWith` remains the response owner.

### Message

```ts
self.addEventListener("message", (event) => {
  event.waitUntil(handleMessage(event.data, event.source))
})
```

Use for bounded commands such as update checks or cache cleanup. Do not treat message delivery as durable state; persist authoritative state before acknowledging success.

## Runtime options

### No Effect runtime in the Service Worker

Best when the worker only performs simple cache routing and versioned asset operations. Use native promises plus shared Schema/pure modules.

Advantages:

- smallest worker bundle;
- fewest lifecycle assumptions;
- easiest browser debugging;
- no unstable worker protocol.

### Small module-scope Effect runtime

Reasonable only when Service Worker operations share enough typed services, structured concurrency, logging, or Schema logic to justify it.

Rules:

- initialize once at module scope or lazily;
- do not assume the worker remains alive;
- every event call returns a promise to `waitUntil` / `respondWith`;
- no unbounded background fibers;
- finalizers must tolerate termination/restart;
- persist checkpoints before acknowledging critical progress.

### Effect dedicated-worker adapters

Not a substitute. `BrowserWorker` / `BrowserWorkerRunner` model dedicated Worker protocols, not Service Worker install/activate/fetch semantics.

## Shared code boundary

Safe to share with the browser page and Bun compiler:

- Schema models;
- content object/checksum formats;
- manifest validation;
- deterministic version selection;
- pure cache-key construction;
- typed product errors;
- bounded use-case functions parameterized by services.

Keep Service Worker-specific:

- event listener registration;
- `waitUntil` and `respondWith` calls;
- Cache Storage provider;
- client messaging;
- navigation/request routing;
- update/skipWaiting/client-claim policy.

## Offline content-pack flow

The Service Worker may participate in bytes and network routing, but authoritative pack activation belongs in a durable state machine.

Recommended sequence:

1. discover candidate manifest;
2. download changed immutable objects into a quarantine namespace;
3. verify Schema and checksum;
4. record complete verified candidate in IndexedDB;
5. acquire optional coordination lock;
6. atomically switch active manifest/version in IndexedDB;
7. preserve active sessions pinned to prior version;
8. notify pages through BroadcastChannel/client messages as a hint;
9. remove unreferenced cache bytes only after durable reference analysis;
10. recover to previous valid version on failure.

The Service Worker must not expose correctness/explanations before the page's authoritative commit-before-reveal transaction succeeds.

## Cache Storage versus IndexedDB

Cache Storage:

- immutable asset/body bytes;
- HTTP request/response semantics;
- fetch routing.

IndexedDB:

- manifests;
- verified/quarantined/active state;
- object references and checksums;
- sessions and progress;
- activation and recovery transactions.

A cache hit is not a verified active object by itself.

## Cancellation and termination

- `waitUntil` extends event lifetime but does not guarantee infinite execution.
- fetch/request cancellation may cancel streams or native requests, but provider writes may finish.
- browser termination can occur between durable steps.
- every update step must be restartable/idempotent.
- critical state changes should be atomic and checkpointed.

## Observed browser evidence

Chromium `144.0.7559.96` observed:

- install handler `waitUntil` persisted an install marker;
- activate handler `waitUntil` persisted an activation marker;
- fetch handler `respondWith` returned a synthetic JSON response;
- message handler `waitUntil` kept a delayed response alive;
- the page became controlled by the worker.

The fixture unregisters and removes its cache after the probe. This is a lifecycle proof for the exact browser coordinate, not the full product update algorithm.

## Test requirements

- install and upgrade from each supported prior worker/cache version;
- activation with multiple open tabs;
- blocked IndexedDB upgrade;
- browser termination between download, verification, and activation;
- missing/corrupt/quota-exceeded cache writes;
- old active session continuity;
- navigation offline fallback;
- content object checksum mismatch;
- message/client disappearance;
- accessibility and no-answer-leakage checks for offline assets;
- multi-browser support.

## Final boundary

Use native Service Worker lifecycle. Add Effect only inside bounded event-owned work when it provides concrete typed/lifecycle/testing value. Do not make the Service Worker a hidden long-lived application server.

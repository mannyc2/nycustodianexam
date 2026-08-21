# False portability audit

This project runs TypeScript/Effect logic in several environments that expose superficially similar APIs. Similar syntax is not sufficient reason to unify their runtime abstractions.

The safe rule is:

> **Port product capabilities only when the product contract is actually the same. Keep runtime lifecycle, authority and storage/network semantics specific.**

## 1. Browser page vs Service Worker

### Superficial overlap

Both expose:

- `fetch`;
- Web Crypto;
- IndexedDB;
- events;
- Web `Request`/`Response` values.

### Semantic difference

Browser page:

- lifetime is document/page lifecycle;
- DOM/focus/accessibility are first-class;
- one long-lived interactive Effect runtime is useful;
- progress IndexedDB is authoritative before reveal.

Service Worker:

- lifetime is browser-controlled per event;
- no DOM/window;
- `respondWith()` and `waitUntil()` are correctness-critical lifetime APIs;
- worker may terminate/restart between any events;
- Cache Storage/offline delivery are primary concerns.

### Reject

- one `BrowserPlatform` Layer for both;
- `BrowserRuntime.runMain` in the Service Worker;
- `BrowserWorkerRunner` as Service Worker lifecycle;
- using Service Worker memory as pack/version authority.

### Share instead

- Schema models;
- checksum/pack validation logic;
- product-shaped pack transport/cache interfaces where semantics really match;
- Effect core primitives inside each runtime lifetime.

## 2. Browser Cache Storage vs Cloudflare Cache API

### Superficial overlap

Both expose Cache-like `match`/`put` operations and Web Request/Response values.

### Semantic difference

Browser Cache Storage:

- user-agent local offline application storage;
- commonly managed by Service Worker lifecycle;
- offline availability/version activation concern.

Cloudflare Cache API:

- edge/data-center-local cache;
- Cloudflare cache rule/header semantics;
- not globally replicated durable storage;
- tied to Worker edge execution and Cloudflare infrastructure.

### Reject

```text
interface CacheStore {
  match(request)
  put(request, response)
}
```

as a supposedly portable low-level platform abstraction.

It erases the most important semantics.

### Share instead

Higher-level contracts only if genuine, for example:

- browser: `OfflinePackStore`;
- server: `EdgeResponseCache`.

These are different capabilities unless a future product requirement proves a shared contract.

## 3. Browser fetch vs Cloudflare fetch

### Superficial overlap

Both call `fetch(Request|string)` and return `Response`.

### Semantic difference

Cloudflare subrequest I/O must execute inside a Worker Request Context. Incoming request abort/cancellation behavior is compatibility-flag-sensitive. Bindings/service-to-service calls also have Cloudflare-specific semantics.

Browser fetch runs in page/SW browser lifetime and has different credential/CORS/offline/interception behavior.

### Reject

A global singleton “portable fetch runtime” whose lifetime is longer than the runtime request/event that makes I/O legal.

### Share instead

Product transport services:

```text
CorrectionsTransport.submit(...)
PackTransport.fetchManifest(...)
```

Provider implementation can choose native fetch or isolated unstable Effect HttpClient per runtime.

## 4. Bun vs Cloudflare Node compatibility

### Superficial overlap

- both may support selected Node-compatible APIs;
- both run JavaScript/TypeScript bundles;
- Effect has node-shared implementation pieces used by Bun.

### Semantic difference

Bun:

- process/CLI runtime;
- filesystem/path/process/stdio;
- package manager/build/test toolkit;
- long-lived process semantics.

workerd:

- event/request isolate runtime;
- no general local process/filesystem model;
- bindings, request context and finite background lifetime;
- deployment/serverless edge semantics.

### Reject

- `@effect/platform-bun` inside a Worker simply because an API compiles;
- a Node/Bun server adapter around Cloudflare's native Fetch handler;
- process shutdown/finalizer assumptions in workerd.

### Share instead

Effect core application services plus runtime-specific providers.

## 5. Generic persistence vs learner progress

### Superficial overlap

Generic K/V or persistence stores can save arbitrary values.

### Semantic difference

Learner progress has project invariants:

- multiple records may need one transaction;
- commit-before-reveal;
- session/review/checkpoint relationships;
- retry after failed commit;
- Schema-validated persisted boundaries;
- version/migration behavior.

### Reject

`KeyValueStore` / generic persistence as the public ProgressStore authority merely because it can store JSON.

### Share instead

```text
ProgressStore.commitAnswer(...)
ProgressStore.checkpointSession(...)
```

with an IndexedDB provider that maps the domain operation to one native transaction.

## 6. Dedicated Worker protocol vs Service Worker

### Superficial overlap

Both use the word “Worker” and messages.

### Semantic difference

Effect's unstable worker modules model a request/response/message worker protocol over Worker/MessagePort-like primitives. Browser Service Worker owns install/activate/fetch interception and browser-controlled event lifetime.

### Reject

Effect Worker protocol as an architectural prerequisite for offline/PWA behavior.

## 7. `BunServices.layer` vs focused compiler capabilities

### Superficial convenience

One Layer can provide a broad set of Bun services.

### Semantic problem

It includes unstable child-process authority along with stable filesystem/path/crypto/terminal services. That makes the dependency graph broader and more migration-sensitive than an ordinary content compiler requires.

### Reject

Providing the aggregate layer to every Bun program.

### Use instead

Compose only the concrete services the compiler needs.

## 8. Stable public module vs stable transitive architecture

Current browser typed IndexedDB modules live at normal `@effect/platform-browser/IndexedDb*` paths, but `IndexedDbDatabase` imports `effect/unstable/reactivity/Reactivity`.

### Reject

“Not under `/unstable/`” as sufficient evidence that adoption has low migration risk.

### Use instead

Trace the relevant dependency chain and isolate a provider when unstable internals/services appear in the public runtime path.

## 9. Source existence vs package availability

Current Effect source declares platform-browser/platform-bun/core/vitest as rc.111, but npm's observed platform-bun rc tag is rc.110.

### Reject

- assuming a source workspace package is installable at that version;
- mixing RC numbers because peer ranges might accept it;
- declaring a cohort before the package manager resolves it.

### Use instead

One exact Bun install/lock probe and one coordinated catalog.

## 10. Runtime cleanup vs durable business commitment

Browser pagehide, Service Worker termination, Bun process signals and workerd isolate eviction all have different cleanup semantics.

### Reject

“Effect finalizers will save the state at shutdown” as an application correctness strategy.

### Use instead

Business workflows commit durable state before moving to the next externally visible state. Finalizers release resources; they do not substitute for commits.

## Accepted shared center

Cross-runtime code should preferentially contain:

- immutable/domain models;
- Schema models and tagged expected errors;
- pure deterministic calculations;
- Effect use cases whose dependencies are meaningful product capabilities;
- `Clock`, `Random`, `Crypto` where those services reflect real behavior;
- provider-neutral `ProgressStore`, `PackTransport`, correction/storage interfaces where contracts are genuinely shared.

Runtime packages attach around that center rather than being flattened into a single “platform” package.

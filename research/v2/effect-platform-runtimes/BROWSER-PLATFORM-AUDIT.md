# Browser Platform Audit

## Scope and source coordinate

This audit uses current Effect v4 source at:

```text
Effect-TS/effect@993f4be99949d4682f79c22b9cb8dc2fda37ec7c
@effect/platform-browser source version 4.0.0-rc.111
```

The preliminary coordinate `436f10d1efccec308426532ff3f88df9a96434f3` is its direct parent. The only later change is an unrelated benchmark, so the browser source is unchanged between the two coordinates.

The package was not installed or executed in this lane. Source-confirmed package behavior is separated from native browser observations.

## Package reality

`@effect/platform-browser` is a browser-specific v4 package. Its current manifest peers on `effect` and does not import the Bun or node-shared implementations into the browser package graph.

Important stability distinctions:

- the package is on the Effect v4 release-candidate line;
- modules such as `BrowserRuntime`, `BrowserCrypto`, and `IndexedDb*` are public package exports;
- typed HTTP protocol types live under `effect/unstable/http`;
- socket and worker protocols depend on explicit unstable Effect namespaces;
- `IndexedDbDatabase` is public-path API but internally uses unstable Reactivity.

The phrase "public export" does not mean "approved for this product." Adoption remains a project decision with bundle/runtime gates.

## Complete public-source audit relevant to the product

| Module | What it adds | Stability / dependency surface | Project fit | Recommendation |
|---|---|---|---|---|
| `BrowserCrypto` | Web Crypto provider for `effect/Crypto` | Public browser module; Effect v4 RC | Pack checksums, UUIDs, injectable crypto tests | Use through a meaningful integrity capability; native Web Crypto remains valid for direct boundary operations |
| `BrowserHttpClient` | Fetch-backed `HttpClient`, request conversion, response wrapping, AbortController | Public provider over `effect/unstable/http` | Content-pack download and correction client | Use behind cohesive typed clients after bundle/browser gate |
| `BrowserKeyValueStore` | Browser storage providers for simple key/value use | Public adapter over persistence concepts | Small settings | Do not use for attempt/progress/session/pack transactions |
| `BrowserPersistence` | Browser persistence implementation surface | Persistence protocol is unstable | Generic persistence only where product semantics fit | Avoid as a universal storage layer |
| `BrowserRuntime` | Browser `runMain` boundary and shutdown interruption | Public browser module | One interactive application/island root | Recommended |
| `BrowserSocket` | Browser WebSocket provider | Depends on unstable socket protocol | No current product need | Do not adopt now |
| `BrowserStream` | Web Stream / Effect Stream conversion support | Public adapter; conversion ownership must be explicit | Large content pipelines only | Use only inside a real effectful streaming pipeline |
| `BrowserWorker` | Browser dedicated Worker provider | Depends on unstable workers protocol | Possible future heavy deterministic work | Start native; adopt only if structured worker protocol pays for itself |
| `BrowserWorkerRunner` | Worker-side runtime/runner | Depends on unstable workers protocol | Dedicated worker only, not Service Worker lifecycle | Do not use as a Service Worker adapter |
| `Clipboard` | Typed clipboard service | Browser permission/user-gesture semantics remain host-owned | Low product need | Native direct use is sufficient if later needed |
| `Geolocation` | Typed geolocation capability | Permission and user-agent semantics | No product need | Do not adopt |
| `Permissions` | Browser Permissions API service | Permission status remains browser-specific | No product need | Do not adopt |
| `IndexedDb` | Browser IDB factory/key-range service and key schemas | Public stable-path module | Required provider primitives | Use as part of provider spike |
| `IndexedDbTable` | Typed table schema, key path, indexes | Public stable-path module | Strong fit for structured durable records | Use in provider spike |
| `IndexedDbVersion` | Versioned database model | Public stable-path module | Strong fit for explicit migrations | Use in provider spike |
| `IndexedDbDatabase` | Open/migrate/rebuild Layer and database errors | Public path, internal unstable Reactivity | Strong fit but migration-risk surface | Isolate behind project store contracts |
| `IndexedDbQueryBuilder` | Typed reads/writes/indexes/shared transactions | Public stable-path module | Strong fit for commit-before-reveal | Require real-browser transaction/interruption tests |
| `IndexedDbKeyValueStore` | Key/value view over IndexedDB | Public adapter plus persistence surface | Settings or cache metadata only | Not for core transactional product state |

## Browser HTTP analysis

### What the provider actually does

Current `BrowserHttpClient` source:

- builds native `Request` values;
- uses global fetch or a supplied fetch function;
- creates an `AbortController` per request;
- aborts that controller when the Effect request is interrupted;
- maps fetch rejection and response conversion into typed client failures;
- returns Effect HTTP response wrappers for status/body processing.

The higher-level HTTP protocol provides `HttpClient.filterStatusOk`, request mapping, retry policy, and `HttpClientResponse.schemaBodyJson`.

### Where it is justified

Use it when a project client needs a policy that should be tested as one capability:

- manifest and object download with typed transport/status failures;
- Schema decode at the response boundary;
- retry classification;
- tracing/metrics;
- authentication or request headers if a correction backend later needs them;
- test substitution without monkey-patching global fetch.

### Where it is not justified

Do not add an Effect HTTP client merely to construct a `Request`, append a URL, or fetch one immutable same-origin asset whose only behavior is "return bytes or fail." Native fetch inside the owning use case may be clearer and smaller.

### Cancellation truth

The adapter requests cancellation by aborting fetch. It does not guarantee:

- that the server stopped processing;
- that a CDN stopped filling a cache;
- that a response body provider stopped all work;
- that a correction submission was not accepted;
- that an already completed side effect rolled back.

Use idempotency and durable state reconciliation for correctness.

## IndexedDB analysis

### Current API strengths

The first-party v4 stack supports:

- Schema-defined table records;
- key paths and indexes;
- version chains;
- upgrade migrations;
- tagged open, blocked, aborted, transaction, missing-table, and missing-index errors;
- shared transactions across typed operations;
- transaction completion/error/abort observation;
- an interruption finalizer that calls `transaction.abort()` while active;
- database rebuild for testing/recovery workflows.

This is no longer a thin factory wrapper. It is a credible provider candidate.

### Why project services still matter

A typed query builder is not the product contract. The project needs cohesive stores that express invariants such as:

- append one attempt event and update materialized progress atomically;
- commit the selected answer before revealing correctness;
- activate one fully verified content-pack version atomically;
- keep the active session pinned to its content/profile version;
- preserve idempotency across retries and reloads;
- quarantine incomplete downloads.

Those operations should be project services implemented with one explicit IndexedDB transaction. The query builder stays behind them.

### Interruption and commit races

An active transaction can be aborted. Once the browser emits successful completion, cancellation cannot undo the commit. The application must distinguish:

1. operation definitely failed before commit;
2. operation definitely committed;
3. caller lost observation and must reconcile by idempotency key or record lookup.

The UI may reveal only after the authoritative store reports the committed state. If observation is ambiguous, reload/reconcile before reveal rather than guessing.

### Provider spike acceptance gates

Before production adoption:

- install one coherent Effect cohort and commit `bun.lock`;
- run the committed first-party Effect probe in real Chromium;
- test migrations from every supported stored version;
- test transaction failure and explicit interruption at multiple timing points;
- test blocked upgrades across multiple tabs;
- test process/page reload after write request but before caller observation;
- test quota/abort/corrupt data paths;
- compare browser bundle size against native IndexedDB and `idb`;
- confirm no Bun/node-shared import reaches the browser graph;
- track the unstable Reactivity dependency.

## Browser storage capability boundaries

### IndexedDB

Authoritative structured state and transactions:

- content manifests and object metadata;
- attempt events;
- materialized progress;
- review queues;
- sessions;
- settings if convenient;
- correction drafts;
- activation/recovery state.

### Cache Storage

Immutable HTTP bytes and Service Worker response reuse. It must not become the authoritative content-pack activation database. A cached object is not active until the IndexedDB manifest transaction says it is active and verified.

### localStorage / simple key-value

Only small non-transactional preferences where synchronous access is acceptable. Do not store progress or content activation authority there.

### BroadcastChannel

Use for hints such as "pack version changed" or "progress was updated in another tab." Receivers must re-read authoritative IndexedDB state.

### Web Locks

Use as an optional coordination guard for pack activation or migration. The lock does not replace the IndexedDB transaction and must not be required for correctness on unsupported browsers.

### StorageManager

Use `estimate()` before very large downloads and `persisted()` / `persist()` for UX. Values are advisory. Never claim that persistence has been guaranteed.

## Native browser probe

Chromium `144.0.7559.96` observed:

- strict readwrite IndexedDB commit;
- explicit transaction abort and rollback;
- Cache Storage put/match/delete;
- BroadcastChannel delivery;
- Web Lock acquisition/release;
- StorageManager quota and persistence query;
- gzip compression/decompression round trip;
- ReadableStream to WritableStream backpressure path;
- secure random bytes and SHA-256 digest;
- Blob and File values;
- dedicated Worker message path;
- DOM event dispatch;
- fetch abort reaching the server as a disconnect;
- Service Worker lifecycle and fetch ownership.

This proves current Chromium behavior only. It does not replace multi-browser support testing or Effect package execution.

## Browser bundle hypothesis

The following must be measured separately because import shape matters:

1. native Web-only interactive baseline;
2. Effect core plus application use case;
3. BrowserRuntime addition;
4. BrowserHttpClient plus unstable HTTP protocol;
5. IndexedDb table/version/database/query stack;
6. optional worker/socket/persistence modules.

No bundle number is reported because no Effect cohort or Bun/Vite install was available. Source file size is not a valid bundle estimate.

## Browser recommendation

- Recommended now: native DOM/Web values, one browser runtime root, native Service Worker lifecycle, native Cache Storage, Effect Clock/DateTime for domain time.
- Provisional: BrowserHttpClient behind cohesive clients, BrowserCrypto behind integrity policy, first-party Effect IndexedDB behind project stores.
- Deferred: Browser Worker protocol, socket, generic persistence.
- Rejected: a universal browser platform service, Effect as renderer, generic KV for core state, or page runtime assumptions inside a Service Worker.

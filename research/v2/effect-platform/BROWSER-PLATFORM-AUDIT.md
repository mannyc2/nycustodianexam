# Browser platform audit — Effect v4 RC.111 source

Upstream inspected: `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`, package source version `@effect/platform-browser@4.0.0-rc.111`.

## Public module inventory relevant to this project

The current browser adapter source includes:

- `BrowserCrypto`;
- `BrowserHttpClient`;
- `BrowserKeyValueStore`;
- `BrowserPersistence`;
- `BrowserRuntime`;
- `BrowserSocket`;
- `BrowserStream`;
- `BrowserWorker` / `BrowserWorkerRunner`;
- `IndexedDb`;
- `IndexedDbDatabase`;
- `IndexedDbQueryBuilder`;
- `IndexedDbTable`;
- `IndexedDbVersion`;
- plus Clipboard, Geolocation and Permissions modules outside this lane's product-critical scope.

This is materially broader than the first-pass v3 evidence.

## Audit results

| Surface | Current source status | Product fit | Decision |
|---|---|---|---|
| `BrowserRuntime.runMain` | page runtime adapter; pagehide cleanup | interactive page root | **use** once per app/island root |
| `BrowserCrypto.layer` | stable `effect/Crypto` implementation over Web Crypto | checksums/secure IDs in Effect workflows | **use when workflow needs crypto service** |
| `BrowserHttpClient` | re-export of `effect/unstable/http/FetchHttpClient` | corrections/pack network only | **isolate or keep native fetch** |
| `BrowserKeyValueStore` | uses `effect/unstable/persistence` | preferences/cache | **not progress authority** |
| `BrowserPersistence` | uses `effect/unstable/persistence` | cache-like persistence | **not progress authority** |
| typed `IndexedDb*` | first-party Schema/tables/migrations/query builder | authoritative progress + pack metadata candidate | **preferred provider spike** |
| `BrowserSocket` | uses `effect/unstable/socket` | no current feature | **do not adopt** |
| `BrowserWorker*` | uses `effect/unstable/workers` | possible future dedicated computation worker | **do not adopt now; not SW** |

## Typed IndexedDB details

### Low-level service

`IndexedDb` holds `IDBFactory` and `IDBKeyRange`. `layerWindow` wires them specifically from `window`; `IndexedDb.make` allows another global/runtime to supply those primitives.

Implication: the core typed IndexedDB machinery is not inherently limited to a Window, but the default layer is page-specific.

### Database / migration ownership

`IndexedDbDatabase` opens a database in a Scope, runs explicit version migrations in the upgrade transaction, aborts a failed migration, and closes the database in a finalizer.

Risk: it imports `effect/unstable/reactivity/Reactivity`. The project must treat the provider as migration-sensitive even though the browser package's IndexedDB modules themselves are public non-`unstable` paths.

### Tables

`IndexedDbTable` defines Schema-backed rows, key paths, indexes and auto-increment. The table model carries a transaction durability setting whose default is `"relaxed"`.

Project implication: do not inherit the default silently for authoritative learner commits. Measure/support-test the chosen durability setting and define it explicitly in the production schema.

### Query transactions

`IndexedDbQueryBuilder.withTransaction`:

1. opens one native IDB transaction over the requested table set;
2. supplies it as `IndexedDbTransaction` to nested query Effects;
3. waits for `transaction.oncomplete` before the enclosing Effect succeeds;
4. aborts on Effect failure/interruption;
5. sets `References.PreventSchedulerYield = true` while the transaction Effect runs.

That design is strongly aligned with durable commit-before-reveal. It is not yet certified for this application because the no-yield strategy and abort/error behavior were not executed in a real browser during this lane.

## Recommended `ProgressStore` boundary

Keep application code provider-neutral:

```text
ProgressStore
  commitAnswer(...)
  checkpointSession(...)
  recordReview(...)
  loadProgress(...)
```

The exact service shape belongs to the core/content architecture lane, but the provider must ensure any operation defined as atomic maps to one real transaction.

Provider candidate:

```text
ProgressStoreLive
  -> project mapping/queries
  -> IndexedDbDatabase
  -> IndexedDbQueryBuilder.withTransaction
```

Do not expose `IndexedDbQueryBuilder` to the question player or review logic.

## Reveal failure path

Required behavior remains:

```text
selection
  -> explicit commit
  -> ProgressStore transaction
       success after IDB oncomplete -> reveal
       failure/abort                -> selected/uncommitted + typed error + retry
```

No UI state change should infer correctness from an in-memory write while IndexedDB is pending or failed.

## Runtime teardown

`BrowserRuntime` interrupts the app on non-persisted `pagehide`, but browser teardown does not guarantee asynchronous finalizers finish. Therefore:

- flush learner-critical durable writes at the actual workflow boundary;
- do not batch correctness-critical writes for unload;
- treat pagehide cleanup as resource cleanup only.

## Network boundary

Static content acquisition does not need `BrowserHttpClient`. For the optional corrections endpoint or explicit pack transport:

- native `fetch` behind a project transport service is lowest migration risk;
- unstable Effect HttpClient becomes worthwhile when standardized retry, typed HTTP failures, instrumentation, streaming, or shared server/client contracts materially help.

The choice is intentionally local to the transport provider.

## Service Worker exclusion

Do not reuse:

- `BrowserRuntime.runMain`;
- `BrowserWorkerRunner`;
- page/window layers

as the Service Worker lifecycle model. The SW must remain event-rooted by native browser semantics.

## Browser adoption gate

Before selecting the typed IndexedDB provider:

- real Chrome + Firefox + WebKit transaction completion/abort tests;
- interruption during multi-store write;
- migration failure and version-change behavior;
- idempotent retry after storage failure;
- chosen transaction `durability` support/behavior;
- bundle-size impact of browser DB + unstable reactivity dependency;
- accessibility/player test proving no reveal before durable success.

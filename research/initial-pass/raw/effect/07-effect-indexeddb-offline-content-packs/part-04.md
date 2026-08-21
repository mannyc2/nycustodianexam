---

# 13. Import/export model

## Export

Export an immutable archive containing:

```text
exportFormatVersion
createdAt
applicationVersion
profile manifests
attempt events
settings
optional sessions
object hashes
archive checksum
```

Do not export:

```text
materialized progress as authority
Cache Storage contents
browser-specific database metadata
telemetry without explicit consent
```

Materialized progress can be included as an optimization but must be rebuildable and marked with its materializer version.

## Import

1. Read archive bytes outside IndexedDB transaction.
2. Verify archive checksum.
3. Schema-decode manifest and records.
4. Validate object graph and version compatibility.
5. Compute a deterministic import plan.
6. Write immutable events/content in bounded transactions.
7. Rebuild materialized views.
8. Atomically activate imported settings/session state only after validation.

Unknown content references must be quarantined, not silently discarded.

Duplicate attempt IDs:

```text
same bytes -> idempotent
same ID + different bytes -> conflict
```

---

# 14. Storage pressure and eviction

Browser storage is not guaranteed permanent.

`navigator.storage.persist()` requests persistent storage, but the browser may deny it. Storage estimates are approximate. ([MDN Web Docs][8])

## Required UX

Before a large pack download:

```text
pack size
current estimated usage
current estimated quota
whether persistent storage is granted
```

After install:

```text
installed size
last verification time
remove pack action
```

If storage is low:

1. Remove unreferenced staged objects.
2. Remove retired packs with no pinned sessions.
3. Remove optional high-resolution assets.
4. Preserve attempt events and settings.
5. Offer export before destructive cleanup.

Do not automatically delete learner progress to make room for optional assets.

## Detecting eviction

At startup:

1. Read installation ID and active manifest pointer.
2. Verify active manifest exists.
3. Verify a small sample or all required immutable object references according to policy.
4. If metadata is missing or closure is broken, classify as `StorageEvicted` or corruption.
5. Keep any surviving attempt events.
6. Offer pack reinstall.

Do not claim "no progress" merely because an offline pack is missing.

---

# 15. Testing strategy

Use four levels.

## Pure tests

Test without IndexedDB:

```text
pack state transitions
compatibility rules
manifest closure
hash verification
materialization logic
session pinning
rollback policy
cross-tab message codecs
```

## Fast adapter tests with fake-indexeddb

Test:

```text
store/index creation
record reads/writes
multi-store transactions
duplicate IDs
abort behavior
migration fixtures
materialization rebuild
pack pointer flip
```

`fake-indexeddb` does not include structured cloning automatically in every environment, and its own documentation states that it is not a substitute for real browser testing. ([GitHub][5])

## Real-browser tests

Use Playwright or equivalent against Chromium, Firefox, and WebKit.

Test:

```text
actual IndexedDB transactions
page reload persistence
blocked upgrades
multiple tabs
BroadcastChannel
Web Locks
Service Worker lifecycle
Cache Storage
offline reload
quota and persistence UX where browser permits
```

## Manual/destructive tests

Test:

```text
DevTools clear site data
browser storage eviction simulation
kill tab during download
kill tab during validation
kill tab during activation
close browser during migration
open old and new app versions concurrently
```

## Minimum test matrix

| Scenario                                   | Expected result                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Cold install, download, go offline         | Cached shell, selected pack, active profile, progress, and source excerpts work.                   |
| Failure halfway through download           | Installation remains resumable; old active pack remains.                                           |
| Hash mismatch                              | Object quarantined; pack never becomes ready.                                                      |
| Failure during validation                  | Pack staged or failed; active pointer unchanged.                                                    |
| Failure before pointer flip                | Old pack active.                                                                                    |
| Failure after pointer flip commit          | New pack active; cleanup resumes later.                                                             |
| Active session during update               | Session remains on old version; activation deferred or affects only new sessions.                  |
| Duplicate answer retry                     | Same attempt ID + same payload is idempotent.                                                       |
| Duplicate attempt with changed payload     | Integrity conflict.                                                                                 |
| Multi-tab install                          | One installer when Web Locks available; durable records prevent inconsistent double activation.   |
| IndexedDB upgrade blocked                  | Existing tabs notified; user prompted; no destructive reset.                                       |
| Materialized view corrupted                | Rebuild from append-only attempts.                                                                  |
| Quota exhausted                            | Typed failure; old state retained; cleanup/export options offered.                                 |
| Cache asset missing but DB content present | Pack marked incomplete or asset restored; progress is not deleted.                                  |
| Service Worker terminated                  | Next event reconstructs state; no correctness depends on worker memory.                            |
| Browser clears offline assets              | App detects missing closure and requests reinstall.                                                 |
| Import with unknown content IDs            | Records quarantined and reported; known valid history preserved.                                  |

---

# 16. Effect Layer topology

## Browser application

```text
BrowserPersistenceLive
  AppDatabaseIdb
    -> idb
    -> IndexedDB

  ContentStoreLive
    -> AppDatabase

  ProgressStoreLive
    -> AppDatabase

  SessionStoreLive
    -> AppDatabase

  SettingsStoreLive
    -> AppDatabase

  PackStoreLive
    -> AppDatabase

  ContentPackSourceLive
    -> Effect HttpClient or native Fetch adapter

  ContentDigestLive
    -> Web Crypto

  optional TabBusLive
    -> BroadcastChannel

  optional CrossTabLockLive
    -> Web Locks

  Effect Clock
  Effect Random
```

## Service Worker

```text
ServiceWorkerNative
  AppShellCache
  ImmutableAssetCache
  OfflineFallback
  MessageProtocol
```

No direct dependency on ProgressStore or SessionStore.

## Tests

```text
PersistenceTestFast
  AppDatabaseIdb
    -> fake-indexeddb

PersistenceTestBrowser
  AppDatabaseIdb
    -> real browser IndexedDB

UseCaseTest
  in-memory project services
  TestClock
  TestRandom
```

## V4 migration option

If v4's official IndexedDB implementation is stable and suitable:

```text
AppDatabaseEffectIndexedDb
  -> official IndexedDb modules
```

must pass the same repository contract tests as:

```text
AppDatabaseIdb
```

Do not let the provider switch alter:

```text
ContentStore
ProgressStore
SessionStore
PackStore
```

contracts.

---

# 17. Why not Dexie by default

Dexie is not rejected.

Choose Dexie instead of idb if one or more of these become real requirements:

* Extensive indexed querying beyond a small repository layer
* Reactive live queries in the UI
* Dexie Cloud synchronization
* A larger team that benefits from Dexie's schema/table conventions
* Measured implementation complexity substantially lower than idb
* Add-ons that solve a concrete problem

Do not choose Dexie merely because its API is nicer in a small demo.

The current application has strong custom semantics:

```text
immutable content hashes
append-only attempt events
version-pinned sessions
staged pack activation
relational validation
cross-tab upgrade coordination
```

Those semantics still need project-owned services and tests regardless of database wrapper.

`idb` keeps that architecture visible.

---

# 18. Final architecture

Use:

```text
one IndexedDB database
one low-level AppDatabase capability
multiple domain-oriented repositories
explicit multi-store use-case transactions
append-only attempt events
rebuildable materialized progress
content-addressed immutable objects
staged pack installation
small atomic manifest pointer flip
version-pinned sessions
Web Locks for duplicate work
BroadcastChannel for advisory coordination
native Service Worker for shell/static assets
Cache Storage only for HTTP responses/assets
Effect Schema at every stored-data boundary
Effect use cases above the adapter
```

The most important invariants are:

```text
1. A revealed answer corresponds to one durably committed attempt.
2. An active session never changes content version underneath the learner.
3. A partially downloaded or invalid pack never becomes active.
4. Activation is a short atomic pointer transaction.
5. Attempt events remain the authority for progress.
6. Materialized views are disposable and rebuildable.
7. Service Worker memory is never an authority.
8. Cross-tab messages are hints; IndexedDB is durable truth.
9. Effect interruption is not falsely equated with native operation cancellation.
10. Storage failure never silently deletes or fabricates learner state.
```

This architecture keeps the browser's real transaction and lifecycle semantics intact while using Effect where it adds the most value: typed failures, use-case orchestration, retries, concurrency limits, deterministic testing, and runtime-specific dependency Layers.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[2]: https://github.com/jakearchibald/idb
[3]: https://www.npmjs.com/package/idb
[4]: https://dexie.org/docs/Tutorial/Design
[5]: https://github.com/dumbmatter/fakeIndexedDB
[6]: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
[7]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
[8]: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

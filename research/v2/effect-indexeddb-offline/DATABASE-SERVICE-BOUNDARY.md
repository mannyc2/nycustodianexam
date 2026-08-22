# Database service boundary

## Goal

Keep one physical IndexedDB consistency domain while preventing browser/provider
details from becoming application architecture.

## Private capability

`AppDatabase` is private to the browser persistence adapter. It owns:
- opening/closing the database;
- exact physical schema version;
- object-store/index definitions;
- migration construction;
- native transaction scope;
- provider error normalization;
- blocked/versionchange handling.

No route, component, controller, domain entity, content compiler, or Service
Worker imports `IndexedDbQueryBuilder`, `IDBTransaction`, `idb`, or Dexie.

Conceptual private shape:

```ts
interface AppDatabase {
  readonly read: <A>(stores, use) => Effect<A, StorageError>
  readonly write: <A>(stores, options, use) => Effect<A, StorageError>
}
```

This is explanatory pseudocode, not an implementation commitment. The selected
first adapter can implement it with
`@effect/platform-browser/IndexedDbDatabase` and `IndexedDbQueryBuilder`.

## Public cohesive services

Prefer business operations over CRUD repositories:

```text
StudyPersistence
  commitAttempt
  recoverCommit
  createSession
  checkpointSession
  completeSession

ProgressQueries
  getQuestionProgress
  listDueReviews
  getSessionSummary

ContentRepository
  resolvePinnedObject
  resolveActiveManifest

PackManager
  discover
  stage
  validate
  activate
  rollback
  removeRetired

ProgressArchive
  export
  validateImport
  import

SettingsRepository
  get
  update
```

`commitAttempt` is the transaction boundary. The caller must not coordinate an
`AttemptRepository`, `ProgressRepository`, and `SessionRepository` by opening
three separate writes.

## Transaction ownership

A transaction body may:
- read/write only the declared stores;
- run Effect Schema encode/decode already available in memory;
- perform deterministic in-process projection calculation that cannot suspend
  outside provider/Effect scheduling constraints.

A transaction body may not:
- fetch;
- await arbitrary timers;
- hash/decompress large objects;
- read Cache Storage;
- call the Service Worker;
- ask for a Web Lock;
- wait for BroadcastChannel;
- perform UI work.

For authoritative commits request strict durability explicitly. Table defaults
must not silently decide the durability policy.

## Provider seam

Provider-specific tests instantiate the same contract against:
1. selected Effect v4 browser provider;
2. `idb` fallback only if promotion tests expose a gap;
3. optionally direct native IndexedDB as the minimum-control reference.

Domain tests use an in-memory `StudyPersistence` fake, not fake IndexedDB.
Adapter tests use real browsers. `fake-indexeddb` is allowed only as a fast
secondary suite and may never be the sole evidence for transaction timing,
version blocking, Web Locks, BroadcastChannel, quota, or Service Worker behavior.

## One database, not one database per service

Attempt + projection + session checkpoint must be able to commit atomically.
Likewise pack activation spans manifest/install/meta state. Multiple physical
databases would make those consistency boundaries distributed transactions the
browser does not provide.

The public service split is therefore an organizational boundary, not a physical
database boundary.

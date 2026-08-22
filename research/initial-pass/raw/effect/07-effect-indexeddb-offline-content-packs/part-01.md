# Effect + IndexedDB + Offline Content Packs

**Research date:** August 20, 2026

## Executive decision

Use **one physical IndexedDB database** with several domain-oriented Effect services over a small lower-level transaction capability.

Recommended production shape:

```text
Native IndexedDB
  -> idb
  -> AppDatabase transaction capability
  -> ContentStore / ProgressStore / SessionStore / SettingsStore / PackStore
  -> Effect use cases
```

The key rule is:

> Domain services may be separate, but one use-case-level transaction must be able to coordinate every object store that belongs to one consistency boundary.

Therefore:

* Do not create one IndexedDB database per domain service.
* Do not expose raw `IDBPDatabase` outside the adapter package.
* Do not represent transactional content, progress, or sessions as a generic KeyValueStore.
* Do not rely on Effect interruption as if it could stop native IndexedDB work after that work has been submitted.
* Do not let the Service Worker own the canonical content database or the update state machine.
* Do not activate a content pack by copying thousands of objects in one transaction. Stage data first, then atomically flip a small active-version pointer.

`idb` is the best default low-level library for this project. It preserves IndexedDB's transaction, store, index, cursor, and version-upgrade semantics while removing request/event boilerplate. Dexie is strong and production-proven, but it adds a larger database framework and a different query/reactivity surface that this project does not currently need. `fake-indexeddb` is useful for fast adapter tests, but it is not a substitute for real-browser IndexedDB tests.

At the time of this research, the stable Effect line remains v3, while Effect v4 has reached the release-candidate line. The official v4 browser package now contains `IndexedDb`, `IndexedDbMigrator`, and `IndexedDbKeyValueStore`, but those modules remain prerelease. Because this application needs bespoke multi-store transactions and indexed queries, even a future v4 adoption should expose the same project-owned repository contracts rather than leaking the Effect IndexedDB APIs throughout the domain.

---

# 1. Required data model

Use one origin database, for example:

```text
nycustodianexam
```

The physical object stores should be organized by lifecycle and consistency needs.

| Object store            | Key                                  | Important indexes                                  | Purpose                                                                                                              |
| ----------------------- | ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `meta`                  | string                               | none                                               | Schema version, installation ID, active manifest pointers, migration markers, materialization versions              |
| `profiles`              | `[profileId, profileVersion]`        | `byProfileId`, `byStatus`                          | Versioned announcement profiles and immutable historical snapshots                                                   |
| `packManifests`         | `[packId, packVersion]`              | `byPackId`, `byStatus`, `byInstalledAt`            | Pack state, checksums, compatibility, object list, and installation status                                            |
| `contentObjects`        | `objectHash`                         | `byKind`, `byPackVersion`, `byProfileVersion`      | Immutable normalized content objects                                                                                  |
| `assetCacheIndex`       | `assetHash`                          | `byPackVersion`, `byCacheName`                     | Links immutable content references to Cache Storage entries or browser asset URLs                                    |
| `attemptEvents`         | `attemptId`                          | `bySession`, `byQuestion`, `byCreatedAt`, `byType` | Append-only question and hazard attempts                                                                              |
| `progressViews`         | `progressKey`                        | `byDueAt`, `byQuestion`, `byConcept`, `byProfile`  | Rebuildable materialized progress and review projections                                                              |
| `sessions`              | `sessionId`                          | `byStatus`, `byUpdatedAt`, `byProfileVersion`      | Draft, active, completed, and abandoned sessions with pinned content versions                                         |
| `settings`              | string                               | none                                               | Small typed preferences and feature selections                                                                        |
| `correctionDrafts`      | `draftId`                            | `byUpdatedAt`, `byStatus`                          | Locally saved correction submissions                                                                                  |
| `telemetryOutbox`       | `eventId`                            | `byStatus`, `byCreatedAt`                          | Consent-gated delivery queue only if optional research participation is implemented                                  |
| `packInstallations`     | `installationId`                    | `byPackVersion`, `byState`, `byUpdatedAt`          | Durable update job state, progress, diagnostics, and restart recovery                                                 |

The exact store names are not domain APIs. Domain code should see services such as:

```text
ContentStore
ProgressStore
SessionStore
SettingsStore
PackStore
```

## Immutable content object rule

Every published content object is addressed by a cryptographic hash:

```text
objectHash = SHA-256(canonical encoded object)
```

The database may additionally index objects by pack and profile version, but the object hash remains the immutable identity.

Do not overwrite an existing object under the same hash.

If a write attempts:

```text
same hash + different bytes
```

fail with:

```text
ContentHashCollision
```

or an equivalent integrity defect.

## Active manifest pointers

Keep active versions as small metadata values:

```text
activeProfileManifest
activeContentPackManifest
```

A user session pins the exact versions it started with:

```text
session.profileVersion
session.packVersion
```

Activation changes what new sessions use. It does not mutate the content graph of an active session.

---

# 2. Storage library comparison

## Decision table

| Option                          | Transaction fidelity                                                                                                                                           | Migrations                                                                                                                                    | Effect integration                                                                                               | Testing                                                                                               | Bundle / complexity                                                            | Recommendation                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Native IndexedDB                | Full platform semantics. Requests, transactions, stores, indexes, cursors, and version upgrades are all available. ([MDN Web Docs][1])                          | Full `versionchange` control, but event-driven and verbose.                                                                                   | Requires project adapters for every request and transaction.                                                     | Best browser fidelity; awkward unit tests without helpers.                                             | No library bytes; highest application boilerplate and easiest transaction-lifetime mistakes. | Viable, but not preferred for the first implementation.                                                                                         |
| `idb`                           | Thin promise wrapper that preserves `IDBDatabase`, transaction, store, index, and cursor semantics. Its README explicitly describes itself as a small improvement rather than a replacement database model. ([GitHub][2]) | Uses the native upgrade callback, exposes old/new versions and the upgrade transaction, and keeps schema ownership in project code.          | Wrap promise-returning adapter operations with `Effect.tryPromise`; keep transaction ownership in one adapter helper. | Works with `fake-indexeddb` for fast tests and real browsers for semantic verification.                | Small. Current release is 8.0.3. ([npm][3])                                    | **Recommended default.** It removes boilerplate without hiding the transaction model.                                                          |
| Dexie                           | Full database abstraction with table APIs, indexed queries, transactions, hooks, add-ons, observability, and reactive querying. Its transaction rules remain IndexedDB-backed but are framework-specific. ([Dexie.js][4]) | Strong versioned schema API and migration helpers.                                                                                            | Requires an adapter around Dexie; Effect interruption cannot cancel Dexie work already submitted.               | Strong ecosystem; supports fake-indexeddb and real-browser tests.                                      | Larger dependency and conceptual surface. Adds functionality this project may not use.        | Good alternative if query/reactivity requirements grow. Do not choose it only to avoid writing a small adapter.                                |
| Effect v4 `IndexedDb` modules   | Full IndexedDB-specific modules appear to include databases, codecs, queries, migration helpers, and KVS.                                                      | `IndexedDbMigrator` exists in the RC package.                                                                                                 | Native Effect model and typed APIs.                                                                              | Potentially strong, but APIs are prerelease and require current-version investigation.                 | Unknown final production footprint; potential migration churn.                            | **Evaluate after v4 stabilization.** Do not make initial persistence depend on RC APIs.                                                        |
| Effect v4 IndexedDB KVS         | Key/value abstraction over IndexedDB.                                                                                                                          | May manage simple key/value schema, but does not express this project's multi-store indexed data model.                                      | Native Effect KVS.                                                                                               | Easy for small settings tests.                                                                         | Simpler but semantically lossy.                                                   | Suitable only for small key/value preferences, not content, attempts, sessions, progress, or pack activation.                                  |
| `fake-indexeddb`                | In-memory emulation of IndexedDB API semantics, but cannot prove browser persistence, quotas, eviction, timing, or all transaction behavior. ([GitHub][5])      | Supports schema upgrade tests in-process.                                                                                                     | Useful under the same adapter.                                                                                   | Fast and deterministic.                                                                                | Development/test-only dependency.                                                 | Use for fast adapter/unit tests. Always pair with real-browser IndexedDB tests.                                                                 |

## Why `idb` fits this project

This application needs:

* Multi-store read-write transactions
* Explicit schema upgrades
* Object-store indexes
* Cursor/range iteration for materialization
* No reactive query framework yet
* No cloud synchronization framework
* A small browser bundle
* A clear boundary between storage and Effect domain logic

`idb` preserves those primitives and removes most of the event/request conversion code.

The adapter can still expose Effect-native semantics:

```ts
Effect.Effect<Result, StorageError, AppDatabase>
```

without requiring the low-level library itself to be Effect-native.

---

# 3. Service topology

## Recommended layering

```text
Domain / Use Cases
  |
  +-- ContentStore
  +-- ProgressStore
  +-- SessionStore
  +-- SettingsStore
  +-- PackStore
  |
  v
AppDatabase
  |
  v
idb
  |
  v
IndexedDB
```

## AppDatabase capability

`AppDatabase` is the only service that may expose transaction-scoped handles.

Conceptually:

```ts
interface AppDatabase {
  readonly read: <A>(
    stores: ReadonlyArray<StoreName>,
    body: (tx: ReadTransaction) => Promise<A>
  ) => Effect.Effect<A, StorageError>

  readonly write: <A>(
    stores: ReadonlyArray<StoreName>,
    body: (tx: WriteTransaction) => Promise<A>
  ) => Effect.Effect<A, StorageError>
}
```

The exact implementation may return Effect values from the transaction body, but the important invariant is:

> One physical IndexedDB transaction is created once, passed through all cooperating repository operations, and awaited to completion before the Effect succeeds.

## Domain-oriented services

### ContentStore

```text
getProfile(profileId, version)
getContentObject(hash)
putStagedContentObject(...)
listObjectsForPack(...)
removeUnreferencedObjects(...)
```

### ProgressStore

```text
appendAttemptAndMaterialize(...)
listDueReviews(...)
rebuildMaterializedViews(...)
getQuestionProgress(...)
```

### SessionStore

```text
createSession(...)
checkpointSelection(...)
commitAttemptAndAdvance(...)
completeSession(...)
recoverActiveSessions(...)
```

### SettingsStore

```text
getSettings()
updateSettings(...)
```

Settings may use the same IndexedDB database or a small localStorage-backed preferences service. If settings affect offline compatibility or transaction behavior, keeping them in IndexedDB simplifies consistency.

### PackStore

```text
beginInstallation(...)
recordDownloadedObject(...)
recordValidationResult(...)
activatePack(...)
markFailed(...)
rollbackToPrevious(...)
listInstalledPacks(...)
```

## Why not only separate repositories

Separate repositories are useful for domain boundaries, but this operation:

```text
commit answer
append attempt
update progress
update review queue
advance session
```

must be one atomic action.

If each service opens its own IndexedDB transaction, the application can persist:

```text
attempt saved
progress updated
session not advanced
```

or another partial state.

Therefore the use case should invoke a composite operation implemented through the shared transaction capability.

Recommended shape:

```text
StudyPersistence.commitAnswer(command)
```

or:

```text
AppDatabase.write(
  [attemptEvents, progressViews, sessions],
  tx => {
    ProgressStoreTx.appendAttempt(tx, ...)
    ProgressStoreTx.updateMaterialization(tx, ...)
    SessionStoreTx.advance(tx, ...)
  }
)
```

Avoid making domain code assemble raw object-store operations. The transaction-aware composition may live in an application persistence service.

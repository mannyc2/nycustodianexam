---

# 8. Cross-tab coordination

## BroadcastChannel

Use one application channel, for example:

```text
nycustodianexam:coordination:v1
```

All messages are Schema-decoded.

Message types:

```text
packInstallStarted
packInstallProgress
packReady
packActivated
packInstallFailed
profileActivated
progressInvalidated
sessionOpened
sessionClosed
closeDatabaseForUpgrade
upgradeComplete
```

BroadcastChannel is advisory coordination, not durable authority. ([MDN Web Docs][6])

If a message is lost, a tab must recover by reading IndexedDB.

## Web Locks

Use Web Locks for long-running cross-tab work that should have one owner:

```text
pack-install:{packId}:{version}
materialization-rebuild:{version}
database-maintenance
```

Web Locks are broadly available in current browsers and support abortable lock requests. ([MDN Web Docs][7])

Do not use Web Locks for record-level correctness.

The lock prevents duplicate work. IndexedDB transactions guarantee data integrity.

If Web Locks are unavailable or fail:

* The durable installation ID and unique database records still prevent inconsistent activation.
* Another tab may duplicate download work, but hashes and idempotent writes prevent corruption.

## Duplicate sessions

Record an advisory lease for an active session:

```text
sessionId
tabId
lastHeartbeat
```

If another tab opens the same session:

* It reads the durable session checkpoint.
* It sees an active recent lease.
* It warns the user.
* It may open read-only, take over after confirmation, or fork a new session.

Do not rely on the heartbeat for correctness. Session commits use immutable attempt IDs and IndexedDB transactions.

## Pack-update race

Recommended coordination:

```text
Web Lock
  -> one active installer
  -> durable installation record
  -> BroadcastChannel progress
  -> IndexedDB pointer transaction
```

If the installer tab closes:

* The Web Lock is released.
* Another tab reads the durable installation record.
* It resumes downloads or validation.

---

# 9. Cache Storage and asset strategy

## Database versus Cache Storage

Use IndexedDB for:

```text
validated content records
manifests
sessions
attempts
progress
installation state
settings
```

Use Cache Storage for:

```text
app shell HTTP responses
static SVG / raster / print assets
optionally immutable response objects addressed by URL
```

Do not store progress in Cache Storage.

Do not require the Service Worker to query complex IndexedDB state on every static-asset request.

## Asset cache versioning

Use immutable asset URLs:

```text
/assets/sha256/{hash}.svg
/assets/sha256/{hash}.webp
```

Cache name:

```text
assets-v{cacheFormatVersion}
```

The database's `assetCacheIndex` maps pack versions to immutable asset hashes and expected cache URLs.

A pack becomes ready only when required assets are confirmed present or the pack explicitly declares online-only optional assets.

## Cache writes are idempotent

Because URLs are immutable and content-addressed:

```text
cache.put(same immutable URL, same bytes)
```

is safe to repeat.

Do not overwrite a content-addressed URL with different bytes.

---

# 10. Service Worker boundary

## Recommendation

Keep the Service Worker **small, native, static-first, and event-scoped**.

Do not make it the primary application runtime.

Do not make it the owner of:

```text
progress
review scheduling
content-pack validation
session assembly
pack activation
correction drafts
```

Those belong in page-side Effect use cases backed by IndexedDB.

## What the Service Worker should do

```text
install
  cache minimum shell

activate
  clean obsolete shell caches
  claim only according to explicit update policy

fetch
  serve app shell / immutable static assets
  fall back to network according to route policy
  return offline fallback where appropriate

message
  optional skip-waiting / cache inspection / asset prefetch commands
```

## What the page should do

```text
manifest discovery
pack download orchestration
checksum verification
Schema decoding
relational validation
staged database writes
pack activation
progress persistence
```

## Should the Service Worker use Effect?

### Initial recommendation: no

Use native Service Worker APIs for the first version.

Reasons:

* The worker has a narrow event model.
* It should remain a small bundle.
* Service Workers are terminated between events.
* Long-lived in-memory Effect state is not durable.
* App correctness should not depend on a resident Effect runtime.
* Native `event.waitUntil()` and `event.respondWith()` remain authoritative.

### When Effect may be justified

Effect can be useful inside the Service Worker when:

* The worker implements nontrivial typed routing.
* Cache policy has complex recoverable failures.
* Message protocols are Schema-driven.
* Shared pure domain logic already exists.
* Resource management and typed composition justify the bundle cost.

Even then, event handlers remain native:

```ts
self.addEventListener("fetch", event => {
  event.respondWith(
    runtime.runPromise(handleFetch(event.request))
  )
})

self.addEventListener("install", event => {
  event.waitUntil(
    runtime.runPromise(handleInstall)
  )
})
```

Do not start a forever-running Effect fiber in module scope and assume it remains alive.

## Shared code

Safe to share:

```text
Schema definitions
hash utilities
immutable URL construction
pure cache-decision functions
message codecs
pack compatibility predicates
```

Do not share browser-window services with the Service Worker.

---

# 11. Failure taxonomy

## Database lifecycle

```text
DatabaseOpenFailed
DatabaseUpgradeBlocked
DatabaseUpgradeFailed
DatabaseTerminated
DatabaseVersionTooNew
DatabaseSchemaIncompatible
```

## Transaction

```text
StorageTransactionAborted
StorageTransactionInactive
StorageConstraintViolation
StorageQuotaExceeded
StorageCommitOutcomeUnknown
StorageRecordDecodeFailed
```

## Integrity

```text
ContentHashMismatch
ContentHashCollision
ContentObjectMissing
PackGraphIncomplete
PackManifestInvalid
PackIncompatible
ProfileIncompatible
AssetMissing
```

## Installation

```text
PackDiscoveryFailed
PackDownloadFailed
PackValidationFailed
PackActivationDeferred
PackActivationFailed
PackRollbackFailed
PackInstallationAlreadyRunning
```

## Progress and session

```text
AttemptIdConflict
AttemptAppendFailed
ProgressMaterializationFailed
SessionNotFound
SessionVersionUnavailable
SessionOwnedByAnotherTab
SessionCommitFailed
```

## Browser storage state

```text
StorageEstimateUnavailable
StoragePersistenceDenied
StorageEvicted
CacheWriteFailed
CacheReadFailed
```

## Error classification policy

Map native failures only when the distinction is meaningful:

| Native condition                  | Domain error                     | Recovery                                                                                                            |
| --------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `QuotaExceededError`              | `StorageQuotaExceeded`           | Offer inactive-pack removal, export progress, and retry.                                                            |
| `ConstraintError` on duplicate ID | Existing identical payload       | Treat as idempotent success.                                                                                        |
| `ConstraintError` with mismatch   | `AttemptIdConflict` or collision | Stop and surface integrity failure.                                                                                 |
| `TransactionInactiveError`        | `StorageTransactionInactive`     | Defect/adapter bug; do not blind retry without correcting transaction structure.                                    |
| Upgrade blocked                   | `DatabaseUpgradeBlocked`         | Notify other tabs and user; wait or request refresh.                                                                |
| Schema decode failure             | `StorageRecordDecodeFailed`      | Quarantine affected record/pack or rebuild materialization.                                                         |
| Browser eviction detected         | `StorageEvicted`                 | Reinstall packs; retain progress only if still present or imported.                                                 |

Do not automatically retry every storage error.

Retry may be appropriate for:

```text
one transient database-open failure
interrupted pack download
idempotent immutable object write
```

Retry is not appropriate for:

```text
schema incompatibility
checksum mismatch
quota exhausted
migration logic failure
transaction inactive bug
conflicting immutable IDs
```

---

# 12. Migration model

Use two migration layers.

## Physical IndexedDB migration

Owned by the `upgrade` callback:

```text
create object stores
create indexes
change key paths
introduce migration metadata
```

## Logical record migration

Owned by Effect Schema and explicit migration code:

```text
decode old record
transform to next version
decode next version
persist new version
```

Do not bury source, review, rights, or security invention inside migration code.

If a new record version requires information that cannot be derived, fail with:

```text
MigrationAuthorInputRequired
```

## Large migration strategy

For large content/progress migrations:

1. Open the new physical schema.
2. Create a durable migration job record.
3. Process records in bounded cursor chunks.
4. Checkpoint the last processed key.
5. Resume after crash.
6. Validate counts and hashes.
7. Atomically switch the active logical-schema pointer.
8. Retain the prior materialization until success.

Do not keep one huge transaction open across the full corpus if it risks browser termination.

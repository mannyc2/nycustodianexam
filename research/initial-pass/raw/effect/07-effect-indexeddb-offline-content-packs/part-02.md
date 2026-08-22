## Transaction lifetime rule

IndexedDB transactions are automatically committed or become inactive based on the browser event loop. Long unrelated awaits inside a transaction can cause `TransactionInactiveError` or premature commit behavior. The `idb` documentation explicitly warns not to await unrelated work between transaction operations. ([GitHub][2])

Therefore:

* Do network access before opening a transaction.
* Do checksum computation before opening the activation transaction.
* Do expensive Schema decoding before opening the activation transaction.
* Prepare all data first.
* Keep the transaction body limited to database reads and writes.
* Await `tx.done` before reporting success.

Bad:

```text
open transaction
  -> fetch object
  -> decompress
  -> hash
  -> decode
  -> write
```

Good:

```text
fetch
  -> decompress
  -> hash
  -> decode
  -> open short transaction
  -> write / flip pointer
  -> await commit
```

---

# 4. Append-only events and materialized progress

## Durable authority

The durable authority for learner history is the append-only `attemptEvents` log.

Each event should include:

```text
attemptId
sessionId
question or scene ID
exact content version
exact profile version
answer or marks
presentation order / seed
commit timestamp
mode
scoring result
relevant concept/confusion tags
schema version
```

Do not silently mutate an existing attempt event.

Corrections to event ingestion should be represented as:

```text
new corrective event
or
new materialization logic version
```

not as rewriting history.

## Materialized views

`progressViews` are rebuildable projections for fast UI queries.

Examples:

```text
question progress
concept progress
confusion-pair direction counts
next review due time
review queue priority
session summary
```

Store a projection version:

```text
materializerVersion
```

When materialization logic changes:

1. Mark the current view version stale.
2. Rebuild from `attemptEvents` in bounded chunks.
3. Write new projections under the new version.
4. Atomically switch the active materialization-version pointer.
5. Remove older projections later.

## Answer commit transaction

One answer commit should atomically:

```text
add immutable attempt event
update current materialized views
checkpoint session position
record idempotency key
```

If the transaction aborts, the UI remains at the pre-commit state and may retry with the same attempt ID.

If the transaction completes but the page crashes before receiving completion, a retry with the same attempt ID must be idempotent.

Recommended rule:

```text
attemptId is generated before transaction
attemptEvents.add(attemptId)
```

If a retry sees the same immutable event payload, treat it as already committed.

If it sees the same attempt ID with different payload, fail with:

```text
AttemptIdConflict
```

---

# 5. Schema decoding and migrations

## Stored records

Every stored record has:

```text
recordType
schemaVersion
```

Use Effect Schema at the adapter boundary:

```text
IndexedDB unknown value
  -> Schema decode
  -> admitted domain record
```

Do not cast IndexedDB results into application types.

Storage is untrusted because:

* Old application versions wrote it.
* Browser extensions or DevTools may alter it.
* Partial migrations may exist after crashes.
* Import archives may contain invalid records.
* Future code can contain bugs.

## Database schema migrations

Use IndexedDB's versioned `upgrade` transaction for physical schema changes:

```text
create / delete object stores
create / delete indexes
change key paths
rewrite bounded records where unavoidable
```

Keep schema upgrades small and resumable.

A large data transformation should generally use a durable post-open migration job rather than blocking the versionchange transaction for a long time.

Recommended migration metadata:

```text
migrationId
fromVersion
toVersion
state
lastProcessedKey
startedAt
updatedAt
failure
```

The post-open migration can resume after a crash.

## Upgrade coordination

When a new tab needs a higher DB version:

* Existing tabs may block the upgrade.
* `idb` exposes `blocked`, `blocking`, and `terminated` callbacks. ([GitHub][2])
* Use BroadcastChannel to request older tabs close their database handles.
* Show a user-visible "Update requires refreshing other tabs" state if blocked.
* Never delete the database automatically merely because an upgrade is blocked.

---

# 6. Cancellation truthfulness

## Native IndexedDB does not support per-request AbortSignal

IndexedDB request operations are not natively cancellable through an `AbortSignal`.

A transaction can be aborted while it remains active:

```text
tx.abort()
```

But that is not equivalent to cancellation of an individual request.

## Required Effect semantics

An adapter should distinguish:

```text
caller stopped waiting
transaction abort requested
transaction definitely aborted
transaction committed
commit outcome unknown
```

Do not report:

```text
Effect fiber interrupted -> IndexedDB operation cancelled
```

without qualification.

## Practical rule

For a short read transaction:

* The Effect may become interruptible at the waiting boundary.
* Interruption means the caller no longer consumes the result.
* The browser may still finish the read.

For a write transaction:

* Register an interruption finalizer that calls `tx.abort()` if the transaction is still active.
* Await transaction completion or abort when possible.
* Once `tx.done` resolves, the commit is complete.
* If the environment terminates before the adapter observes `complete` or `abort`, classify the result as `StorageCommitOutcomeUnknown` only where the application truly cannot reconcile from durable state.

Idempotency and recovery should make outcome-unknown cases safe:

```text
reopen database
lookup attemptId / installationId
continue from durable state
```

## Effect interruption adapter

Conceptually:

```text
Effect.asyncInterrupt
  register IDB callbacks / promise
  return canceler:
    if tx active -> tx.abort()
```

Do not call `tx.abort()` after completion; browsers may throw `InvalidStateError`.

The adapter must classify transaction exceptions rather than assuming every interruption caused an abort.

## Dexie and idb have the same underlying limitation

Promise wrappers do not add provider cancellation.

Effect interruption can stop the waiting fiber. It does not prove that native work stopped.

---

# 7. Offline content-pack update state machine

## Pack states

```text
unknown
  |
  v
discovered
  |
  v
downloading
  |
  v
downloaded
  |
  v
validating
  |
  v
staged
  |
  v
readyToActivate
  |
  +-----------------------+
  |                       |
  v                       v
activationDeferred      activating
  |                       |
  |                       v
  |                     active
  |                       |
  +------------+----------+
               |
               v
             retired
```

Failure states:

```text
downloadFailed
validationFailed
incompatible
activationFailed
rollbackRequired
quarantined
```

## Phase 1: discovery

1. Fetch a small version manifest.
2. Schema-decode it.
3. Verify application-schema compatibility.
4. Compare against installed manifests.
5. Create a durable `packInstallations` record.

No database write transaction remains open during network access.

## Phase 2: download

For each content object:

1. Download immutable object bytes.
2. Compute checksum.
3. Verify expected hash.
4. Decode with the appropriate Schema.
5. Store under its immutable hash and staged pack version.
6. Record durable progress.

Use bounded concurrency.

A failed object does not activate a partial pack.

Downloads are idempotent because the object key is immutable.

## Phase 3: validate closure

After every object is present:

1. Load the staged pack manifest.
2. Verify every referenced object exists.
3. Verify content graph closure.
4. Verify profile compatibility.
5. Verify required assets are available or scheduled in the matching cache.
6. Verify database schema and application version compatibility.
7. Run corpus-level relational gates.
8. Mark the pack `readyToActivate`.

Do not rely solely on per-object Schema validity.

## Phase 4: activation gate

If no active session uses the current version:

```text
readyToActivate -> activating
```

If a session is active:

```text
readyToActivate -> activationDeferred
```

The current session remains pinned to its original pack and profile versions.

New sessions may continue using the old active version until activation occurs.

## Phase 5: atomic activation

Open one short read-write transaction over:

```text
meta
packManifests
profiles
packInstallations
```

Inside:

1. Recheck staged manifest is still `readyToActivate`.
2. Recheck every required staged object exists.
3. Store previous active pointers for rollback.
4. Flip active manifest pointers.
5. Mark new pack `active`.
6. Mark previous pack `retired` or `fallback`.
7. Mark installation `completed`.
8. Commit.

Do not copy bulk content in this transaction.

The transaction changes only pointers and small state records.

## Phase 6: post-activation

1. Broadcast `packActivated` to other tabs.
2. Refresh new-session selectors.
3. Keep old objects while any pinned session or fallback manifest references them.
4. Schedule garbage collection later.
5. If post-activation cleanup fails, the new pack remains active; cleanup is retryable.

## Rollback

Rollback is another small pointer transaction:

```text
active pointer -> previous validated manifest
failed manifest -> quarantined
```

Never mutate historical pack contents during rollback.

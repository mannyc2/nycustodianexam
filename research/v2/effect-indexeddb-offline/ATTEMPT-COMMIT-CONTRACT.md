# Authoritative attempt commit contract

## Product invariant

An answer reveal is evidence of a durable commit.

```text
selection
  -> COMMITTING
  -> authoritative persistence transaction
  -> native transaction complete
  -> ANSWERED_REVEALED
```

If persistence fails, the player returns to a retryable selected state and does
not expose correctness.

## Command

A commit command is fully prepared before the transaction and contains:
- immutable `attemptId`;
- session ID;
- question/scene ID and exact content identity/version;
- pinned profile and pack versions;
- selected answer or hazard marks;
- deterministic presentation seed/order evidence;
- scoring result derived from the pinned content;
- mode;
- relevant concept/confusion tags;
- authorized timing/help metadata;
- expected session position/revision;
- commit timestamp.

The command is Schema-validated before write.

## Single transaction

Declared stores normally include:

```text
attemptEvents
progressViews
sessions
```

Within that one read-write transaction:

1. Read existing `attemptId` if the provider flow needs preflight.
2. If absent, `add` the immutable attempt event.
3. Apply the deterministic current projection delta.
4. Advance/checkpoint the exact session revision.
5. Complete the transaction.
6. Only then return `Committed`.

The current Effect provider's `withTransaction` is the selected mechanism for
sharing one native `IDBTransaction` across the three operations.

## Idempotency

`attemptId` is the idempotency key.

| Durable state | Retry payload | Result |
|---|---|---|
| no row | valid | attempt transaction may run |
| identical row | identical canonical payload | `AlreadyCommitted` |
| existing row | different canonical payload | `AttemptIdConflict` |

A crash after the browser committed but before the caller received completion is
resolved by re-reading the immutable event.

## Concurrent two-tab race

Do not rely on a pre-read to prevent duplicates; two tabs can both observe
absence. Correctness comes from the unique primary key and transaction.

The loser of a duplicate-key race:
1. allows its transaction to abort;
2. reads the durable event in a new transaction;
3. compares canonical immutable payload;
4. returns `AlreadyCommitted` if identical;
5. otherwise returns `AttemptIdConflict`.

BroadcastChannel may invalidate the other tab's view afterward, but it is not
part of correctness.

## Failure injection expectations

- failure before transaction: no stores changed;
- abort after attempt `add` but before projection/session writes: all stores roll
  back;
- projection encode/write failure: all stores roll back;
- session revision conflict: all stores roll back;
- caller interruption while transaction active: request abort, then reconcile;
- caller disappears after durable completion: retry reads identical event and
  succeeds idempotently.

## No asynchronous gaps

Never perform network access, cache access, long digest work, arbitrary timers,
or user callbacks inside the live transaction. IndexedDB's active/inactive
transaction model can otherwise close the transaction before later writes.

The current Effect query builder additionally disables scheduler yielding inside
`withTransaction`; this is useful provider behavior, not permission to do
unrelated asynchronous work.

## Reveal API

The application use case should return a narrow result such as:

```text
Committed { attemptId, sessionRevision, projectionGeneration }
AlreadyCommitted { attemptId, sessionRevision }
```

Only these success results authorize answer reveal. Storage errors, conflicts,
or unknown/recovering states do not.

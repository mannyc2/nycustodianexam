# Cross-tab protocol

## Principle

Cross-tab coordination improves UX and suppresses duplicate work. It does not
replace durable IndexedDB constraints.

## Broadcast channel

Channel: `nycustodianexam:coordination:v1`.

Every message includes a protocol version and a sender tab ID and is
Schema-decoded before use.

Recommended messages:

| Type | Meaning |
|---|---|
| `attemptCommitted` | another tab may invalidate progress/session UI |
| `progressInvalidated` | reread affected projection generation |
| `packInstallStarted` | advisory installer ownership/progress |
| `packInstallProgress` | advisory progress only |
| `packReady` | validated candidate exists in IndexedDB |
| `packActivated` | active generation changed; reread meta |
| `packInstallFailed` | diagnostics available |
| `closeDatabaseForUpgrade` | older connections should close/refresh |
| `upgradeComplete` | reopening can proceed |
| `sessionOpened` | advisory duplicate-session lease |
| `sessionClosed` | advisory lease release |

Message loss is harmless: the receiver always reconstructs state from IndexedDB.

## Web Locks

Suggested locks:
- `nycustodianexam:pack-install:{packId}:{version}`;
- `nycustodianexam:projection-rebuild:{version}`;
- `nycustodianexam:database-maintenance`.

A lock callback may terminate when its browsing context dies. Durable job state
therefore contains installation/migration ID, phase, checkpoint, and expected
generation. A successor reopens the record and resumes idempotently.

Do not use Web Locks:
- as the unique-attempt constraint;
- as proof an attempt committed;
- for record-level serializability;
- as a prerequisite for ordinary answer commits.

## Duplicate answer race

Two tabs can both submit the same prepared `attemptId`.

Correct sequence:
1. each enters its own authoritative transaction;
2. unique key lets at most one add the immutable event;
3. losing transaction aborts;
4. loser re-reads the event;
5. identical payload => idempotent success;
6. different payload => `AttemptIdConflict`.

## Concurrent pack installation

Preferred path:
1. acquire pack-install Web Lock if available;
2. read durable installation record;
3. resume/download/validate;
4. broadcast advisory progress;
5. perform atomic DB activation;
6. broadcast activation.

If Web Locks are unavailable, duplicate immutable downloads may occur, but
unique installation/generation preconditions and the activation transaction
must still prevent inconsistent activation.

## Stale generation

Every activation command carries the expected active generation. The activation
transaction re-reads it. If another tab already activated a different
generation, fail with `PackActivationGenerationConflict`, reread, and recompute
the plan; never blind overwrite the pointer.

## Upgrade blocking

A higher physical database version can be blocked by old open connections.

Policy:
- classify `DatabaseUpgradeBlocked`;
- broadcast `closeDatabaseForUpgrade`;
- cooperative tabs close handles and show refresh state;
- show the initiating user a non-destructive blocked state if peers remain;
- never delete the DB to break the block.

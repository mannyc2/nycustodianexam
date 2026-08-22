# Offline pack state machine

## Durable states

```text
discovered
  |
  v
downloading
  |
  v
staged
  |
  v
validating
  |\
  | +--> quarantined
  v
ready
  |
  v
activation pending
  |
  v
active
  |
  +--> rollback retained
  |
  +--> retired-cleaned
```

`activation pending` may be short-lived if there is no policy/session gate.
`rollback retained` means an older validated generation remains addressable; it
is not the active pointer for new sessions.

## Discovery

Fetch and Schema-decode a small manifest. Verify:
- pack identity/version;
- compatible app/content schema range;
- immutable object list and digests;
- declared byte size;
- profile/locale relationships;
- asset closure declaration.

Create a durable installation ID before bulk work.

## Download

For each immutable object:
1. fetch outside any database transaction;
2. verify expected digest;
3. Schema-decode;
4. run local invariants;
5. write object in a short idempotent transaction;
6. checkpoint installation progress.

Bound concurrency. Repeated object/hash writes are safe only when bytes/content
are identical.

## Staged

`staged` means all expected transfer work is present enough to begin closure
validation. It does not authorize use by new sessions.

## Validation

Verify:
- every referenced object exists;
- object hashes match manifest;
- relational graph closes;
- profile/content versions are compatible;
- required assets exist in the correct immutable cache namespace;
- corpus gates pass;
- no quarantined object is referenced.

Failure moves installation/pack to `quarantined`, preserving diagnostics and the
old active generation.

## Ready and activation pending

`ready` is a validated candidate. If an active session or update policy says the
generation change should wait, use `activation pending`. Existing sessions are
always pinned regardless of whether activation proceeds immediately for new
sessions.

## Atomic activation

Open one short, strict read-write transaction over only small state stores such
as:

```text
meta
packManifests
packInstallations
profiles  # if profile generation changes with pack
```

Then:
1. re-read candidate state and expected current generation;
2. recheck required metadata preconditions;
3. store previous generation for rollback;
4. flip active generation pointer(s);
5. mark candidate active;
6. mark previous validated generation rollback-retained;
7. mark installation completed;
8. await native transaction completion.

No bulk copy, fetch, digest, decode, decompression, Cache Storage operation, or
service-worker round trip occurs in this transaction.

## Session pinning

At session creation store:

```text
session.packVersion
session.profileVersion
session.contentGeneration
```

Every item resolution for that session uses the pinned graph. A later activation
changes only the default generation for new sessions.

## Rollback

Rollback is another short pointer transaction:
- require a previously validated retained generation;
- flip the active pointer;
- quarantine/retire the failed current candidate as policy dictates;
- preserve immutable content for diagnosis.

## Cleanup

Garbage collection runs later and removes only objects/cache entries with no
reference from:
- active generation;
- rollback-retained generation;
- pinned active/resumable session;
- migration/import recovery state.

Cleanup failure must not undo a successful activation.

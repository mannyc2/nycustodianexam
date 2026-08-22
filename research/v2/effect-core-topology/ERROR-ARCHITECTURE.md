# Error architecture

## Rules

1. Use `Schema.TaggedError` for expected serializable boundary failures whose
   variants affect recovery, UI, retry, quarantine, or rollback policy.
2. Keep error families local. Do not create one universal `AppError`.
3. Translate host exceptions once at the implementation boundary.
4. Use `Option` for expected absence when the caller can proceed normally.
5. Preserve interruption. It is not a normal retryable error.
6. Treat impossible internal invariants as defects after Schema/pure constructors
   have excluded invalid input.
7. Persist stable fields and safe summaries, not arbitrary exceptions or full
   Causes.
8. Retain identities needed for diagnosis and idempotent recovery.

## Proposed families

### Content and profile

- `ContentDecodeError`: object/profile id, schema/version, safe parse summary.
- `ContentInvariantError`: invariant id and affected object ids.
- `ProfileContentIncompatible`: profile version, pack version, missing capability.

### Storage

- `StorageUnavailable`
- `StorageQuotaExceeded`
- `StorageTransactionError`
- `StorageVersionChangeBlocked`
- `DuplicateCommitConflict`

The `AttemptStore` implementation maps DOM/IDB exceptions into these variants. A
persistence failure leaves the answer selected but uncommitted and does not
authorize reveal.

### Pack staging and activation

- `PackChecksumError`
- `PackClosureError`
- `PackSchemaError`
- `PackActivationError`
- `PackRollbackError`
- `ActiveSessionVersionConflict`

Errors retain pack/object/checksum/version identities. Incomplete data remains
quarantined. Activation is one atomic pointer/state transition after validation.

### Session

- `SessionVersionUnavailable`
- `SessionContentMissing`
- `SessionCheckpointConflict`
- `SessionSeedVersionUnsupported`

An active session remains pinned to content/profile/algorithm versions. Absence of
an optional next question can be `Option`; inability to continue a committed
session is an expected error.

### Network and correction

- `Offline`
- `NetworkError`
- `Timeout`
- `UnexpectedStatus`
- `ResponseDecodeError`
- `CorrectionValidationError`
- `CorrectionSubmissionRejected`
- `CorrectionSubmissionUnavailable`
- `CorrectionSubmissionConflict`

Retry policy is local and bounded. Interruption from host cancellation is preserved.
A local correction draft is not lost when submission fails.

## Boundary translation

A browser implementation can map a quota DOMException to
`StorageQuotaExceeded` and other transaction failures to
`StorageTransactionError`. Portable code sees the product operation and typed
errors, not `DOMException`, `IDBRequest`, or `IDBTransaction`.

## Union discipline

A use case exposes only the few failures it can actually produce. The browser
boundary translates that local union into screen state. Reason errors are useful
only when one abstraction intentionally groups a closed set of reasons and the
parent tag adds policy. Do not replace useful tags with `reason: unknown`.

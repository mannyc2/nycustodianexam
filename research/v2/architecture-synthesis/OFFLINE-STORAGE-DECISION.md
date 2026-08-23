# Offline and storage decision

## Provider boundary

Define a private `AppDatabase` and public business operations. Try the current
`@effect/platform-browser` IndexedDB stack at the selected cohort; accept it only
after the contract suite passes. `idb@8.0.3` is the fallback behind the same
contracts. Provider types and raw transactions never reach controllers/domain
modules.

## One physical database

Initial stores:

| Store | Authority |
|---|---|
| `meta` | active pack/profile/materializer generations and installation ID |
| `contentObjects` | immutable decoded content objects by digest |
| `packManifests` | immutable pack/version manifests and lifecycle |
| `profiles` | immutable announcement/profile snapshots |
| `attemptEvents` | append-only learner truth by attempt ID |
| `progressViews` | rebuildable projections with materializer version |
| `sessions` | exact pinned versions, seed/order, and checkpoint |
| `packInstallations` | durable stage/validation/activation jobs |
| `settings` | small typed preferences |
| `correctionDrafts` | local drafts, never falsely submitted offline |
| `migrationJobs` | resumable logical rewrite checkpoints |

Cache Storage owns immutable HTTP responses/app assets. IndexedDB owns logical
pack activation and learner state. Do not duplicate authority.

## Commit-before-reveal transaction

```text
selection + stable attempt ID
  -> pure admission/scoring outside transaction
  -> strict readwrite transaction
       add attempt event
       update progress/review projection
       update session checkpoint
  -> native transaction complete
  -> reveal
```

- The same attempt ID and canonical payload is idempotent success.
- The same ID with different payload is an integrity conflict.
- Abort/failure preserves editable selection and reveals nothing.
- Unknown post-commit outcome is reconciled by reading the attempt ID.
- Fetch/hash/timer/UI waits never occur inside the live transaction.
- Effect interruption requests abort but cannot rewrite a completed commit.

## Pack lifecycle

```text
discovered -> downloading -> staged -> validating
  -> quarantined | ready -> activation-pending | active
  -> rollback-retained -> retired-cleaned
```

Network, decompression, digest, Schema decode, and per-object idempotent writes
occur outside any long transaction. Activation is a short strict generation
flip after rechecking `ready`. Active sessions remain pinned to their original
profile/content/pack versions.

## Cross-tab

- IndexedDB unique constraints/transactions decide truth.
- BroadcastChannel sends versioned invalidation/job hints; receivers re-read DB.
- Web Locks suppress duplicate pack install/projection rebuild/migration jobs;
  never lock every answer and never use locks as commit proof.
- Blocked version upgrades produce visible close/refresh guidance, not automatic
  database deletion.

## Service worker and pressure

The native worker caches app shell/immutable responses and provides offline
fallback. It owns no learner truth. Pack install/activation runs page-side.

Before optional downloads, show declared bytes and best-effort storage estimate,
persisted-storage state, and removal options. Quota failure is explicit. Cleanup
abandoned staging and unreferenced retired packs first; never delete attempts to
make room for optional assets.

## Provider acceptance/stop condition

The first-party Effect provider is rejected for the initial release if any
required browser lacks the needed transaction/migration lifecycle, if bundle
closure is materially worse than `idb` without compensating value, if its
internal unstable dependency creates unacceptable upgrade churn, or if provider
errors cannot be translated safely. Switch providers; do not weaken the contract.

# R2.4 report — Effect v4 IndexedDB, local progress, and offline packs

## Executive recommendation

Adopt the current **Effect v4 browser IndexedDB database/query stack** as the
leading persistence implementation, but do not expose it as the domain model.
The application should own one private `AppDatabase` capability backed initially
by `@effect/platform-browser@4.0.0-rc.111` and expose cohesive public services
such as `StudyPersistence`, `ContentRepository`, `PackManager`,
`ProgressQueries`, `SessionRepository`, and `SettingsRepository`.

The project should **not add `idb` by default** at this point. The first-pass
`idb` recommendation was reasonable against the older Effect surface, but the
current v4 browser package now supplies the missing capabilities: typed table
descriptors, schema-backed reads/writes, indexed queries, explicit versioned
migrations, and `withTransaction` that provides one shared native
`IDBTransaction` to multiple Effect operations. `idb@8.0.3` remains the preferred
external fallback if the first-party RC fails the browser contract suite. Dexie
is not selected because the current product does not need a second reactive
database/query framework.

This is a **source-confirmed recommendation, not yet runtime certification**.
The selected Effect version is a release candidate and the executor's managed
Chromium blocked the required browser fixture before its script could execute.
Production adoption therefore has a hard promotion gate: the committed browser
contract suite must pass in normal Chromium, Firefox, and WebKit, and a pinned
Bun workspace must compile/typecheck the actual provider fixture.

## Coordinates and maturity

| Item | Coordinate | Status |
|---|---|---|
| Effect source | `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3` | confirmed |
| `effect` | `4.0.0-rc.111` | current v4 RC evaluated |
| `@effect/platform-browser` | `4.0.0-rc.111` | current browser RC evaluated |
| Bun | `bun-v1.4.0` / `34cbb9a40b4bd1bd767d134a7065e66c2432a676` | current release coordinate; binary unavailable in executor |
| `idb` | `8.0.3` | external fallback baseline |
| Dexie | `4.4.5` | external framework baseline |
| Chromium executor | `144.0.7559.96` | launched; managed URL policy blocked fixture |

Two maturity facts must not be collapsed:

1. `IndexedDb`, `IndexedDbTable`, `IndexedDbVersion`,
   `IndexedDbDatabase`, and `IndexedDbQueryBuilder` are normal
   `@effect/platform-browser` exports in the RC package.
2. `IndexedDbDatabase`/`IndexedDbQueryBuilder` internally use
   `effect/unstable/reactivity/Reactivity`, while `BrowserPersistence` and
   `BrowserKeyValueStore` depend on explicit `effect/unstable/persistence/*`
   APIs.

That is sufficient reason to keep the provider behind project-owned contracts
even if the first-party implementation is selected.

## What the current Effect v4 provider actually supplies

### Typed schema and indexes

`IndexedDbTable.make` binds:
- object-store name;
- Effect `Schema` for rows;
- key path;
- index paths;
- auto-increment behavior;
- durability.

The query builder encodes inputs before writes and decodes rows on reads. This
is stronger for this project than a TypeScript-only database shape because
stored browser data is a trust boundary: old app versions, partial migrations,
imports, or manual modification can leave structurally invalid records.

The table default is `durability: "relaxed"`. For authoritative attempt commits
and the short pack activation pointer transaction, the project should request
`"strict"` explicitly rather than relying on the table default.

### One shared transaction

`IndexedDbQueryBuilder.withTransaction` creates one native transaction over an
explicit non-empty table set and provides it through
`IndexedDbTransaction`. On success it awaits the native transaction; on failure
or interruption it requests abort. It also disables scheduler yielding inside
the scoped operation to prevent transaction-killing asynchronous gaps.

This is the core capability the first-pass analysis could not assume existed.
It means the application can express:

```text
attemptEvents.add
progressViews.upsert
sessions.upsert
```

inside one browser transaction without exposing transaction handles to screen
controllers.

### Migrations

`IndexedDbVersion` describes the target set of tables. An
`IndexedDbDatabase.make(...).add(...)` chain defines ordered browser database
versions; each migration receives transaction-bound APIs for the old and new
versions and explicit helpers to create/delete stores and indexes. Upgrade
failure aborts the browser versionchange transaction.

This is appropriate for **small physical schema upgrades**. Large logical data
rewrites still should not be forced into one upgrade transaction: create the new
physical shape, then run a durable resumable post-open migration job.

### Error and cancellation surface

The first-party browser modules expose coarse provider failures:
- database: `TransactionError`, `MissingTable`, `OpenError`, `UpgradeError`,
  `Aborted`, `Blocked`, `MissingIndex`;
- query: `UnknownError`, `DecodeError`, `EncodeError`, `TransactionError`.

The domain must map these plus original native causes into more actionable
application errors (`StorageQuotaExceeded`, `AttemptIdConflict`,
`StorageRecordDecodeFailed`, etc.).

Effect interruption is **not** equivalent to native per-request cancellation.
There is no standard AbortSignal attached to an individual IDB request. The
provider can abort a still-active transaction when its Effect scope fails or is
interrupted. If the transaction has already completed, durable state wins and
retry reconciliation by immutable ID is required.

## Database and service architecture

Use one physical origin database, not a database per domain service. A practical
initial store set is:

| Store | Key | Purpose |
|---|---|---|
| `meta` | string | active pack/profile generation, schema/materializer pointers, installation id |
| `contentObjects` | object hash | immutable decoded content objects |
| `packManifests` | `[packId, version]` | immutable manifest plus lifecycle state |
| `profiles` | `[profileId, version]` | immutable announcement/profile snapshots |
| `attemptEvents` | attempt ID | append-only authoritative learner events |
| `progressViews` | projection key | rebuildable question/concept/review projections |
| `sessions` | session ID | active/completed session checkpoints and pinned versions |
| `packInstallations` | installation ID | durable download/validation/activation job state |
| `settings` | key | small typed preferences |
| `correctionDrafts` | draft ID | local correction drafts |
| `migrationJobs` | migration ID | resumable post-open logical migrations |

Asset response bodies belong in Cache Storage; database records should contain
immutable asset hashes/URLs and pack closure metadata rather than duplicate
binary response authority.

The physical capability remains private. Public application APIs should be
operations that express business consistency boundaries:
- `commitAttempt(command)`;
- `createSession(pinnedVersions, seed)`;
- `loadActiveSession(id)`;
- `listDueReviews(query)`;
- `stagePack(...)`;
- `activateReadyPack(...)`;
- `rollbackPack(...)`;
- `exportProgress(...)`;
- `importProgress(...)`.

## Authoritative attempt commit

The commit-before-reveal path is:

```text
READY
  -> SELECTED
  -> COMMITTING
  -> [one readwrite transaction]
       add immutable attemptEvents[attemptId]
       write current projection(s)
       write session checkpoint / next position
       write any deterministic commit metadata
     [native transaction complete]
  -> ANSWERED_REVEALED
```

Rules:

1. Generate `attemptId` before opening the transaction.
2. Perform scoring inputs, schema admission, and other expensive pure work
   before the transaction.
3. Do no fetch, digest, unrelated timer, or UI await inside the live transaction.
4. Use `add`, not blind upsert, for an immutable new event.
5. A retry with the same ID and exactly the same canonical payload is success.
6. The same ID with a different canonical payload is `AttemptIdConflict`.
7. On transaction abort, selection stays editable and no correctness is shown.
8. If the caller disappears after commit but before observing completion, reopen
   and reconcile by `attemptId`; do not invent an “unsaved” duplicate.

The event log is durable authority. Projections are acceleration structures and
can be rebuilt.

## Event and projection model

Attempts are append-only and include at least:
- attempt ID;
- session ID;
- item/scene ID;
- exact item/content version;
- exact profile and pack versions;
- mode;
- deterministic order/seed inputs required to reproduce presentation;
- committed answer/marks;
- scoring result;
- hints/help state when relevant;
- timing fields that are product-authorized;
- concept/confusion tags needed by progress logic;
- schema version;
- commit timestamp.

A projection record declares its `materializerVersion`. When review/progress
logic changes:
1. retain attempt events unchanged;
2. create a new projection generation;
3. rebuild in bounded cursor chunks;
4. checkpoint the migration job;
5. validate counts/invariants;
6. atomically flip the active materializer-generation pointer;
7. remove the old generation later.

Imports merge append-only events idempotently. Corrections to derived progress
change the materializer; corrections to historical facts are additive corrective
events or content/version changes, not silent mutation of attempts.

## Offline pack lifecycle

Required states are implemented as durable records:

```text
discovered
  -> downloading
  -> staged
  -> validating
       -> quarantined            (integrity/schema/compatibility failure)
       -> ready
  -> activation pending          (active session or other policy gate)
  -> active
       -> rollback retained
       -> retired-cleaned
```

Important distinction: `staged` means bytes/objects have been written; `ready`
means the complete manifest closure has passed validation.

### Download/stage phase

No IndexedDB transaction spans network access. For each immutable object:

```text
fetch bytes
-> verify digest
-> decode with Schema
-> validate local object invariants
-> short idempotent write
-> checkpoint installation progress
```

Use bounded concurrency. A failed or missing object cannot make a pack ready.

### Validation

Before `ready`, verify:
- manifest schema;
- expected object hashes;
- complete graph closure;
- source/profile compatibility;
- application/content schema compatibility;
- required asset response presence or an explicit optional-online declaration;
- corpus relational gates supplied by the content pipeline.

### Activation

Activation is a **short strict transaction** over small metadata/state stores:
- re-read candidate state `ready`;
- verify generation/precondition;
- record previous active generation;
- flip active pack/profile generation;
- mark new pack active;
- mark old pack rollback-retained;
- complete installation state.

Do not copy the pack during activation. Old content remains addressable while a
session or rollback record references it.

Sessions pin exact profile/content/pack versions when created. Activation only
changes what **new** sessions receive.

## Cross-tab protocol

Three mechanisms have different jobs:

### IndexedDB constraints/transactions — correctness

Unique immutable IDs and short multi-store transactions decide whether a commit
exists. They remain authoritative even if all advisory messages are lost.

### BroadcastChannel — invalidation/advisory messaging

Use a schema-versioned channel such as `nycustodianexam:coordination:v1` for:
- `attemptCommitted`;
- `progressInvalidated`;
- `packInstallStarted`;
- `packInstallProgress`;
- `packReady`;
- `packActivated`;
- `closeDatabaseForUpgrade`;
- `upgradeComplete`;
- `sessionOpened` / `sessionClosed`.

Every receiver re-reads IndexedDB. A BroadcastChannel message is never proof of a
durable write.

### Web Locks — duplicate work suppression

Use locks for expensive single-owner jobs:
- `pack-install:{packId}:{version}`;
- `projection-rebuild:{materializerVersion}`;
- `database-maintenance`.

Do not acquire a Web Lock for every answer commit and do not make correctness
depend on lock availability. A lock loss after context termination is safe
because the job has a durable installation/migration record and idempotent
objects.

Two tabs racing the same attempt ID are resolved by the unique key:
- one transaction wins;
- the loser reads the committed row;
- identical payload => idempotent success;
- different payload => integrity conflict.

## Service Worker and Cache Storage boundary

The Service Worker is not a durable application actor. It may be terminated
outside event execution; therefore no correctness depends on resident memory.

**Service Worker / Cache Storage own:**
- app-shell HTTP responses;
- immutable static assets;
- offline route fallback;
- optional immutable pack asset prefetch by explicit message;
- cache-format cleanup.

**Page-side Effect + IndexedDB own:**
- manifest discovery orchestration;
- checksums and Schema admission;
- pack installation state;
- content records;
- active generation;
- attempts/progress/sessions;
- imports/exports;
- corrections.

Avoid a dual-authority design where both a Service Worker cache and IndexedDB
independently decide which logical pack is active. IndexedDB stores the active
generation and expected immutable URLs/hashes; Cache Storage only answers
whether those HTTP resources are present.

A native Service Worker remains the default. Bringing Effect into the worker is
justified only if worker routing/message policy becomes complex enough to
outweigh bundle/lifecycle cost; even then `waitUntil`/`respondWith` are the event
lifetime authority.

## Storage pressure

Before large pack downloads, surface:
- manifest-declared byte size;
- `navigator.storage.estimate()` usage/quota where available;
- persisted-storage state;
- removability of inactive packs.

`persist()` is a request, not a guarantee. On quota pressure:
1. remove abandoned staging data;
2. clean retired packs with no pinned references;
3. remove optional heavyweight assets;
4. offer progress export;
5. never silently delete attempt history to make room for an optional pack.

Actual quota exhaustion was not safely reproducible in this executor and remains
a required browser test.

## Migrations and upgrade coordination

Use two layers:

**Physical versionchange migration**
- create/delete stores;
- create/delete indexes;
- bounded structural copy only when unavoidable.

**Logical post-open migration**
- durable `migrationJobs` record;
- decode old schema;
- deterministic transform;
- encode/decode new schema;
- bounded batches;
- last processed key checkpoint;
- resumable crash recovery;
- validation;
- atomic active-generation flip.

When a new DB version is blocked by another tab, broadcast
`closeDatabaseForUpgrade` and present a user-visible refresh/close-other-tabs
state. Never respond to a blocked upgrade by automatically deleting the user's
database.

## Provider decision

### Selected: first-party Effect IndexedDB under private boundary

Reasons:
- matches the application's existing Effect direction;
- uses Effect Schema at the stored-data boundary;
- has explicit multi-store transaction scope;
- has indexed query support;
- has typed migration descriptors;
- avoids adding another browser persistence package for capabilities now present
  in the Effect ecosystem;
- preserves native IDB transaction semantics rather than pretending persistence
  is generic key/value state.

Conditions:
- exact RC cohort pinning;
- no provider types outside the persistence adapter;
- real-browser contract suite;
- explicit strict durability for authoritative writes;
- bundle measurement in the bundling lane/application build;
- re-evaluation at Effect v4 GA.

### Reserve: `idb@8.0.3`

`idb` remains an excellent small wrapper and exposes particularly useful
`blocked`, `blocking`, `terminated`, and `tx.done` ergonomics. If the Effect
provider fails a needed lifecycle hook, browser, bundle, or migration contract,
the project can implement the same private `AppDatabase` with `idb` without
changing domain APIs.

### Not now: Dexie 4.4.5

Dexie is mature and capable, but its extra table/query/reactivity abstraction is
not required by the current product contract. Choosing it would add a second
state/query framework while the application already needs project-owned domain
transactions regardless.

### Not domain storage: Effect BrowserPersistence / BrowserKeyValueStore

These are useful utilities for persisted request results or simple K/V values,
but their semantics are too weak for versioned content, indexed attempts,
session checkpoints, and pack activation. Their explicit dependence on
`effect/unstable/persistence` is another reason not to make them domain
authority.

## Browser probe status

A dependency-free real-browser fixture was created for all required behavioral
scenarios. Chromium DevTools Protocol worked, but managed policy replaced both
localhost and file pages with `chrome-error://chromewebdata/` before fixture
JavaScript loaded. The error page explicitly reported that the organization did
not allow the site and that `file` links were blocked. An unpacked-extension
fallback did not load in the managed headless build.

Therefore:
- no browser transaction behavior is mislabeled as observed;
- no fake-indexeddb result substitutes for a real browser;
- provider selection remains `SOURCE-CONFIRMED`;
- runtime promotion is blocked until the same committed fixture passes in a
  normal browser environment.

The executor also lacked Bun and could not install packages. Because the shared
contract requires reading installed `node_modules/effect/AGENTS.md` before
Effect code-level fixture work, no Effect fixture or lockfile was fabricated.

## Promotion gates before implementation freezes the provider

1. Run the committed attempt/pack/cross-tab fixture in Chromium.
2. Repeat equivalent tests in Firefox and WebKit.
3. Add a pinned Bun `1.4.0` private fixture using
   `effect@4.0.0-rc.111` + `@effect/platform-browser@4.0.0-rc.111`.
4. Commit `package.json` + text `bun.lock`, read installed Effect guidance, then
   compile/typecheck and execute the provider contract.
5. Measure the provider's lazy browser chunk in the bundling lane.
6. Recheck Effect v4 GA status before production dependency freeze.
7. Confirm application UX for blocked upgrades, quota pressure, persisted
   storage denial, pack removal, and export.

## Final architecture invariants

1. No correctness is revealed before native attempt transaction completion.
2. Attempt events are append-only durable authority.
3. Progress views are versioned and rebuildable.
4. One physical database can span all consistency stores.
5. Raw provider transaction handles remain private.
6. Network/checksum/decompression does not run inside live IDB transactions.
7. Pack activation is a short atomic generation flip.
8. Active sessions remain pinned to their starting content/profile versions.
9. BroadcastChannel is advisory; IndexedDB is truth.
10. Web Locks suppress duplicate work; database constraints preserve correctness.
11. Service Worker memory and Cache Storage are never learner-state authority.
12. Effect interruption requests abort but does not rewrite browser commit truth.
13. Storage failure never silently fabricates a save or deletes progress.
14. First-party Effect v4 is selected conditionally; the project boundary keeps
    `idb` or native IndexedDB viable without domain churn.

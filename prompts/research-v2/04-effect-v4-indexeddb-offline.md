# R2.4 — Effect v4 IndexedDB, local progress, and offline packs

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Design and probe the durable browser persistence and explicit offline-pack architecture using latest Effect v4 and current browser platform support.

No previous conversation is an input. GitHub and the repository corpus are the durable source of project context.

## Immutable source

```text
Repository:
  mannyc2/nycustodianexam

Source branch:
  agent/chat-corpus-reconciliation

Required source SHA:
  {{POST_CURATION_SOURCE_SHA}}

Output branch:
  research/v2-effect-indexeddb-offline

Allowed paths:
  research/v2/effect-indexeddb-offline/**

Draft PR base:
  agent/chat-corpus-reconciliation
```

This prompt is not runnable until the SHA placeholder is replaced.

## Mandatory shared contract

Read and obey completely:

- `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`;
- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`.

Use the connected **`@GitHub`** capability directly. Before extended research, create the branch, commit/push `START-RECEIPT.md`, and open the draft PR. Stop if GitHub writes are unavailable.

You may change only the allowed path. Do not implement the application or edit maintained authority.

## Required additional reading

Read:

- full persistence/offline/session/data-model sections of `product/FEATURE_SPEC.md`;
- raw E07 report;
- current `@effect/platform-browser` IndexedDb, IndexedDbDatabase, QueryBuilder, Table, Version, BrowserPersistence, and KeyValueStore source;
- current v4 persistence modules;
- IndexedDB, Service Worker, Cache, Web Locks, BroadcastChannel, and StorageManager primary specs/docs.

## Non-negotiable transaction

Normal answer flow:

```text
selection
  -> one authoritative attempt commit transaction
       - immutable attempt event
       - required projection/checkpoint/review updates or durable rebuild marker
  -> transaction complete
  -> reveal
```

No reveal after only in-memory commitment.

## Compare provider choices

Evaluate:

- current official Effect browser IndexedDB modules;
- thin native IndexedDB service;
- `idb`;
- Dexie;
- any other maintained option only with a clear reason.

Compare:

- transactional expressiveness;
- schema/migration support;
- indexed queries;
- typed failures;
- Effect interruption semantics;
- cross-tab behavior;
- bundle cost;
- maintenance;
- testability;
- lockfile/runtime compatibility.

The first pass’s `idb` preference is not accepted without a latest-v4 comparison.

## Architecture questions

### Database ownership

Decide whether to use:

- one private physical database capability;
- multiple cohesive public domain services;
- a transaction callback capability;
- a domain-operation service that hides raw transactions.

Preserve atomic operations without exposing a universal database service everywhere.

### Attempt events and projections

Design:

- append-only event identity;
- idempotent retry;
- projection/checkpoint update;
- rebuild;
- migration;
- import/export merge;
- corrected/retired content;
- quota and corruption response.

### Pack state machine

Specify exact durable states and transitions for:

- discovered;
- downloading;
- staged;
- validating;
- quarantined;
- ready;
- activation pending;
- active;
- rollback retained;
- retired/cleaned.

Network/download work must not happen inside a live IndexedDB transaction. Activation must be a short atomic pointer/generation change. Active sessions remain pinned.

### Cross-tab

Define authority and notification for:

- duplicate answer commits;
- concurrent pack installs;
- stale active generation;
- BroadcastChannel;
- Web Locks;
- transaction constraints;
- tab closure/crash.

### Service worker and Cache Storage

Determine ownership of app-shell/static assets versus versioned content objects. Avoid two inconsistent authorities. Account for service-worker termination.

### Interruption truth

For each underlying API distinguish:

- operation actually aborted;
- requester stopped awaiting;
- transaction automatically aborted;
- browser operation may continue;
- cleanup/finalizer behavior.

## Required probes

Build committed browser fixtures and run them in a real browser where possible:

1. open/migrate database;
2. multi-store authoritative attempt transaction;
3. injected abort/failure before and after writes;
4. idempotent retry;
5. two-tab duplicate commit;
6. staged pack then atomic activation;
7. active-session version pin;
8. quota/error translation;
9. current official Effect browser IDB provider versus the leading alternative.

Use fake-indexeddb only for fast secondary tests; do not use it as the sole semantics proof.

## Required outputs

```text
PROVIDER-COMPARISON.csv
DATABASE-SERVICE-BOUNDARY.md
ATTEMPT-COMMIT-CONTRACT.md
EVENT-AND-PROJECTION-MODEL.md
PACK-STATE-MACHINE.md
CROSS-TAB-PROTOCOL.md
SERVICE-WORKER-CACHE-BOUNDARY.md
FAILURE-TAXONOMY.csv
MIGRATION-PLAN.md
TEST-MATRIX.csv
fixtures/
raw-results/
```

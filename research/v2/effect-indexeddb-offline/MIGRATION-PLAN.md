# Migration plan

## Two-layer migration model

### 1. Physical IndexedDB versionchange

Use the selected provider's `IndexedDbDatabase.make(...).add(...)` migration
chain for:
- object store creation/deletion;
- index creation/deletion;
- key-path/store replacement when unavoidable;
- small bounded data moves needed to make the new schema openable.

Treat versionchange as short critical infrastructure. A migration failure aborts
the upgrade transaction.

### 2. Logical post-open migration

Use durable `migrationJobs` for:
- large projection rebuilds;
- record-schema transitions across many rows;
- reindex/materialization changes;
- content metadata transformations.

Job fields:

```text
migrationId
kind
fromSchemaVersion
toSchemaVersion
state
lastProcessedKey
processedCount
expectedCount
startedAt
updatedAt
failure
targetGeneration
```

Algorithm:
1. open physical target schema;
2. create/resume migration job;
3. read a bounded chunk;
4. Schema-decode old records;
5. deterministic transform;
6. Schema-encode/decode target records;
7. write target generation in a short transaction;
8. checkpoint last key;
9. repeat;
10. validate aggregate invariants;
11. atomically flip active logical/materializer generation;
12. retire old generation later.

## Blocking/versionchange coordination

When open is blocked:
- return `DatabaseUpgradeBlocked`;
- broadcast `closeDatabaseForUpgrade`;
- older tabs close database handles at a safe boundary;
- show an explicit refresh/other-tab message;
- retry only after user/tab coordination.

Never auto-delete the DB.

## Downgrade / newer DB

An older application encountering a newer schema must fail closed with a clear
update/reload state. It must not reinterpret newer records under old schemas.

## Record decode failure

A decode failure is data evidence, not permission to cast:
- projection row => rebuild projection generation if event authority is valid;
- staged pack row => quarantine candidate;
- attempt event => preserve raw diagnostic/export path and surface integrity
  failure; do not silently drop history.

## Import migrations

Import bytes are migrated before activation:
1. checksum;
2. archive Schema;
3. deterministic format migration;
4. per-record Schema;
5. reference graph validation;
6. bounded writes;
7. projection rebuild;
8. activation.

If required author/source/right information cannot be derived, fail with an
author-input-required state rather than inventing it.

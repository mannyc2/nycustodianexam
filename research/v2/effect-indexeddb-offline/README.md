# R2.4 — Effect v4 IndexedDB, local progress, and offline packs

Research lane for `mannyc2/nycustodianexam`, pinned to source commit
`00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`.

## Decision

Use the current Effect v4 browser IndexedDB database/query stack as the **leading
persistence provider**, but keep it behind a project-owned private `AppDatabase`
capability and cohesive public persistence services.

Selected upstream coordinate for source-level evaluation:

- `effect` / `@effect/platform-browser`: `4.0.0-rc.111`
- Effect source commit: `436f10d1efccec308426532ff3f88df9a96434f3`
- Bun release coordinate for this research date: `bun-v1.4.0`
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- comparison baselines: `idb@8.0.3`, `dexie@4.4.5`

The old first-pass recommendation to add `idb` by default is superseded. Current
`@effect/platform-browser` already provides typed tables, schema-aware
encode/decode, indexed queries, versioned migration construction, and
`withTransaction` over one shared native `IDBTransaction`. `idb` remains the
best lightweight external fallback if the first-party RC fails runtime contract
tests; Dexie remains a justified alternative only if future query/live-query
requirements outweigh the extra abstraction.

## Non-negotiable product invariant

`selection -> authoritative attempt transaction -> transaction complete -> reveal`

An answer is not revealed, scored, or announced as saved until the browser
transaction has completed. An attempt commit owns the append-only attempt event,
the current progress projection(s), and the session checkpoint in one
read-write transaction.

## Evidence status

Source and specification research is complete. A real Chromium fixture was
prepared and a Chromium 144 renderer was launched successfully, but the managed
execution environment blocks both localhost and `file:` pages with an enterprise
URL policy before application JavaScript can run. A local-extension-origin
fallback was also attempted; this headless managed build did not load the
unpacked extension. Therefore the required browser behavioral probes are
committed as reproducible fixtures and marked **BLOCKED**, not reported as
observed successes. No fake IndexedDB result is substituted for the missing real
browser evidence.

The executor also did not provide Bun on `PATH` and outbound package installation
was unavailable, so no Effect runtime fixture, installed `effect/AGENTS.md`, or
Bun lockfile was fabricated.

## Files

- `REPORT.md` — integrated findings and recommendation.
- `SOURCE-LEDGER.csv` — authority/version/source coordinates.
- `DECISION-MATRIX.csv` — architecture choices and adoption status.
- `PROVIDER-COMPARISON.csv` — provider-level comparison.
- `DATABASE-SERVICE-BOUNDARY.md` — private DB / public service boundary.
- `ATTEMPT-COMMIT-CONTRACT.md` — exact commit-before-reveal contract.
- `EVENT-AND-PROJECTION-MODEL.md` — append-only events and rebuildable views.
- `PACK-STATE-MACHINE.md` — staged install/validation/activation/rollback.
- `CROSS-TAB-PROTOCOL.md` — transaction, BroadcastChannel, and Web Locks roles.
- `SERVICE-WORKER-CACHE-BOUNDARY.md` — ownership boundary.
- `FAILURE-TAXONOMY.csv` — typed failures and recovery policy.
- `MIGRATION-PLAN.md` — physical and logical migration approach.
- `TEST-MATRIX.csv` — required browser and recovery coverage.
- `fixtures/browser-native/` — native browser probe source.
- `raw-results/` — executor/environment observations and blocker receipts.
- `FINAL-RECEIPT.md` — publication receipt.
- `MANIFEST.sha256` — integrity manifest for lane files.

This directory is research evidence only. It changes no application code,
dependency graph, maintained product authority, workflow, release, or repository
setting.

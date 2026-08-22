# R2.4 final receipt

## Publication identity

- Repository: `mannyc2/nycustodianexam`
- Lane: **R2.4 — Effect v4 IndexedDB, local progress, and offline packs**
- Source branch: `agent/chat-corpus-reconciliation`
- Required/verified source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-indexeddb-offline`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/14`
- Allowed path: `research/v2/effect-indexeddb-offline/**`
- Launch receipt commit: `72dc2229cbc4718ca297d3a2eadc03584188dd46`
- Source/fixture baseline commit: `01466c9e8758c6ce4377851afc43140f4cc88853`
- Architecture report commit: `16fddd89a4cf8b8d81a6d8f73b9e2c9b97d60738`
- Final evidence/fixture parent: `552c80613d67e5adc37b32b01b14c3f8328d0364`
- Final publication commit: **SELF** — the commit containing this receipt and `MANIFEST.sha256`; resolve it from the PR/head receipt returned with publication.
- Final pre-publication source-drift check: `2026-08-21T22:32Z` — source PR #1 still reported the exact required SHA.

## Exact upstream coordinates evaluated

- Effect repository commit: `436f10d1efccec308426532ff3f88df9a96434f3`
- `effect`: `4.0.0-rc.111`
- `@effect/platform-browser`: `4.0.0-rc.111`
- Bun tag: `bun-v1.4.0`
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- `idb`: `8.0.3`
- Dexie: `4.4.5`
- Browser executor observed: Chromium `144.0.7559.96`

R2.3 was inspected only because its branch/PR already existed; no sibling lane was awaited or polled. Its version hints were independently reverified before use.

## Final recommendation

Use `@effect/platform-browser@4.0.0-rc.111` `IndexedDbDatabase` / `IndexedDbQueryBuilder` as the **leading IndexedDB provider**, behind a project-owned private `AppDatabase` boundary. The v4 browser package now supplies the capabilities this lane needed to verify at source level: Effect-Schema-backed records, indexes and queries, versioned migrations, and a shared native transaction scope via `withTransaction`.

This is **conditional adoption**, not runtime certification. The package is still an Effect v4 release candidate and the database/query implementation internally uses unstable reactivity. Provider types therefore must not leak into domain/UI APIs, exact cohort pinning is required, and the committed browser contract suite must pass before implementation freezes the provider.

`idb@8.0.3` is the reserve external fallback. Dexie `4.4.5` is not justified for the current product unless future live-query/query complexity materially changes. `BrowserPersistence` and `BrowserKeyValueStore` are utility persistence/KV facilities, not authoritative storage for attempts, sessions, progress projections, or pack activation.

## Durable contracts established

1. `selection -> COMMITTING -> one authoritative attempt transaction -> native transaction complete -> reveal`.
2. Attempt events are append-only durable authority; progress projections are versioned/rebuildable.
3. Attempt event + affected progress projection + session checkpoint commit in one strict read-write transaction.
4. Retry uses immutable `attemptId`: same ID/same canonical payload is success; same ID/different payload is `AttemptIdConflict`.
5. Network/checksum/decompression/cache work never runs inside a live IndexedDB transaction.
6. Offline packs use durable staged/downloaded/validated/ready states and a short strict atomic active-generation flip.
7. Existing sessions remain pinned to their starting content/profile/pack versions while activation changes defaults for new sessions.
8. IndexedDB constraints/transactions decide correctness; BroadcastChannel is advisory invalidation; Web Locks suppress duplicate long-running work only.
9. Service Worker/Cache Storage own HTTP response availability, not learner-state or logical pack activation authority.
10. Large logical migrations are resumable post-open jobs; physical versionchange transactions stay small.

## Probe and execution receipt

A dependency-free native-browser fixture was committed for:
- v1 -> v2 open/migration;
- multi-store authoritative attempt commit;
- failure before transaction and abort after partial writes;
- idempotent retry and conflicting duplicate IDs;
- two-tab duplicate commit race;
- staged pack and atomic activation;
- active-session version pinning;
- BroadcastChannel invalidation;
- Web Locks exclusivity;
- native error translation scaffolding and storage-estimate observation.

Actual behavioral execution is **BLOCKED**, not passed. Managed Chromium replaced both localhost and `file:` probe pages with `chrome-error://chromewebdata/` before fixture JavaScript ran and reported organization policy blocking. An unpacked-extension-origin fallback also did not load in the managed headless build. No fake IndexedDB result was substituted for real-browser evidence.

Actual quota exhaustion was not run and no synthetic quota mapping is presented as quota-exhaustion evidence.

The executor had no Bun binary on `PATH` and package installation/download was unavailable. Therefore the required installed `node_modules/effect/AGENTS.md` could not be read and no Effect code-level fixture or `bun.lock` was fabricated. The exact source-level Effect evaluation remains valid; runtime/typecheck promotion remains open.

## Required promotion gates

- Run the committed contract fixture in unrestricted Chromium, Firefox, and WebKit.
- Add blocked-versionchange/multi-tab upgrade coverage and actual storage-pressure/quota coverage.
- Run a pinned Bun `1.4.0` private fixture with `effect@4.0.0-rc.111` and `@effect/platform-browser@4.0.0-rc.111`, reading installed Effect guidance before writing Effect fixture code.
- Measure the selected IndexedDB provider's production lazy-chunk cost versus the `idb` fallback in the bundling lane.
- Recheck the exact Effect v4 GA surface before dependency freeze.

## Published outputs

- `README.md`
- `START-RECEIPT.md`
- `REPORT.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `PROVIDER-COMPARISON.csv`
- `DATABASE-SERVICE-BOUNDARY.md`
- `ATTEMPT-COMMIT-CONTRACT.md`
- `EVENT-AND-PROJECTION-MODEL.md`
- `PACK-STATE-MACHINE.md`
- `CROSS-TAB-PROTOCOL.md`
- `SERVICE-WORKER-CACHE-BOUNDARY.md`
- `FAILURE-TAXONOMY.csv`
- `MIGRATION-PLAN.md`
- `TEST-MATRIX.csv`
- `fixtures/browser-native/**`
- `raw-results/**`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

No application source, dependency graph, maintained product authority, shared prompt/contract, workflow, repository setting, release, tag, or sibling lane was modified.

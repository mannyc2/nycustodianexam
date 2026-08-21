# Normalization of the initial Effect and geometry research pass

## 1. Input and verification

The uploaded consolidated archive contains:

- nine Effect-related Markdown outputs plus a separately supplied formatting variant of the browser-bundling report;
- the complete unpacked 90-file deterministic tool-geometry research bundle.

Verification performed during normalization:

- archive path traversal check: passed;
- archive symlink escape check: passed;
- text/config credential-pattern scan: no detected credentials;
- `poc-build-a/SHA256SUMS`: all 79 listed files matched;
- deterministic comparison record: `exactMatch: true`, 79 files in each compared build;
- no production geometry asset was promoted or approved.

The exact original `research-bundle.zip` byte stream was not present. The supplied archive contains its stated unpacked contents, so the previously reported ZIP checksum cannot be independently recomputed from the extracted tree. The consolidated uploaded ZIP was verified and hashed, but is not duplicated in GitHub; review-relevant extracted files are committed and omitted binary derivatives are hash-ledgered.

## 2. Effect report inventory

| ID | Raw report | Primary subject | Normalized disposition |
|---|---|---|---|
| E01 | `01-effect-state-ui-rendering-v3-baseline.md` | UI state/rendering, renderer comparison, spike | Overlaps E03; retain lifecycle, state ownership, accessibility, and migration-gate ideas; supersede v3 and persistence semantics. |
| E02 | `02-effect-browser-bundling-findings.md` | Browser bundles, Vite 8, chunking, budgets | Unique methodology; retain static/interactive boundary and measurement discipline; redo all version/package/Bun measurements. |
| E03 | `03-effect-state-ui-rendering-direct-dom.md` | Direct DOM, renderer-neutral store, lit-html migration | Overlaps E01; retain renderer experiment and high-frequency interaction boundaries; reject reveal-before-durable-save behavior and proposed source tree. |
| E04 | `04-architecture-memo-effect-browser-first-study-app.md` | Core Effect architecture | Overlaps E08; retain version-neutral errors/concurrency/services/testing findings; supersede v3 and folder structure. |
| E05 | `05-effect-v4-schema-content-registry.md` | Effect v4 Schema compiler | Most directly aligned with the new version constraint; retain structural-vs-relational validation architecture; refresh exact v4 APIs/version and Bun integration. |
| E06 | `06-effect-platform-browser-web-api-fit.md` | Effect Platform and Web APIs | Retain selective-platform and truthful-native-boundary principles; redo against current v4 package/API reality and Bun/Cloudflare. |
| E07 | `07-effect-indexeddb-offline-content-packs.md` | IndexedDB, packs, cross-tab, service worker | Retain transaction/update/cross-tab state machines; redo provider/library decision under latest v4. |
| E08 | `08-architecture-memo-effect-browser-first-study-app.md` | Core Effect architecture and domain model | Overlaps E04; retain commit-before-reveal, persistence, errors, testing; supersede v3 API/package choices and folder layout. |
| E09 | `09-effect-v4-cloudflare-research-correction.md` | Correction to v3-first Cloudflare work | Treat as an explicit supersession notice, not a complete lane. It requires the Cloudflare analysis to be redone from v4 source. |

## 3. Deduplication result

### UI rendering pair: E01 and E03

These are not byte duplicates, but they investigate the same lane and converge on:

- renderer-neutral state;
- direct DOM only as a measured initial experiment;
- Effect owning workflows/resources rather than DOM reconciliation;
- a declarative renderer as a migration option;
- scoped listener/fiber ownership;
- accessibility/focus tests as architectural gates.

They diverge materially on answer durability. Both allow feedback after an in-memory commitment when persistence fails. That conflicts with the maintained product contract and the stronger E04/E08 architecture findings, which require the normal persistent-mode IndexedDB transaction to complete before reveal. The UI reports' persistence behavior is therefore rejected.

E01 preselects standalone Lit and E03 preselects `lit-html`. That is useful candidate evidence, not an accepted renderer choice. It must be re-evaluated with current Effect v4 reactivity and the actual vertical slice.

### Core architecture pair: E04 and E08

These are independent, strongly overlapping reports rather than one exact duplicate.

Shared reusable conclusions include:

- deterministic domain transitions should remain pure when they need no capability;
- Effect coordinates I/O, typed failures, dependencies, resources, time, randomness, concurrency, retries, and cancellation;
- services should be cohesive capabilities rather than one service per function;
- Layers should be composed at runtime roots, not rebuilt in event handlers;
- runtime execution belongs at application edges;
- answer commitment, progress projection, and session checkpoint need a real atomic storage boundary;
- pack download/staging occurs outside the short activation transaction;
- bounded concurrency and failure injection are required;
- expected failures, absence, defects, and interruption remain distinct;
- browser tests are required for IndexedDB and lifecycle behavior.

Both reports select v3 and both propose conventional `src/domain/application/ports/adapters/ui` folder trees. Neither is accepted as the future Bun-workspace/Effect-v4 package architecture.

E04 is broader on primitive/service policy and migration analysis. E08 is broader on domain modeling and commit/persistence tests. Both are retained raw; the normalization uses only their shared, version-neutral findings.

## 4. Strongest reusable first-pass lane

E05, the v4 Schema/content-registry report, is the most aligned with the current version constraint.

Its central retained distinction is:

```text
Schema-valid != publication-valid
```

Individual encoded/decoded records should use Effect Schema. Corpus publication requires a constructed registry plus explicit relational gates for identity, references, provenance, conflicts, audience scope, review state, immutable versions, and generated-artifact closure.

Exact RC versions, exact API spellings, and the proposed internal `schema/` tree remain subject to current-v4 refresh and Bun-workspace design.

## 5. Geometry research

The deterministic tool-geometry bundle is not duplicated by the Effect reports and remains relevant.

The raw report, source ledger, taxonomy inventory, visual invariants, schema, build scripts, POC metadata, QA files, and SVG views are committed in extracted form. The consolidated source archive is checksum-recorded but not duplicated in GitHub; omitted binary derivatives are listed in `EXCLUDED-BINARY-LEDGER.csv`.

The first-pass geometry conclusion remains:

- deterministic project-owned geometry or deterministic 2D construction controls mechanically meaningful tool assets;
- STEP/GLB/SVG/raster are derived or interchange formats, not evidence that geometry is correct;
- scored questions use fixed static views;
- optional GLB belongs to explicit atlas learning use;
- automated validation and repeatable hashes do not replace human mechanical review;
- no POC is production-approved.

## 6. What this normalization does not do

It does not:

- claim the first pass is a current Effect v4 architecture;
- replace the raw reports with a newly researched v4 answer;
- choose final workspace package boundaries;
- scaffold Bun workspaces;
- choose a renderer;
- choose an IndexedDB provider;
- freeze package versions;
- approve CAD assets;
- treat repeated recommendations as independent confirmation when the reports used the same outdated premise.

# Initial research normalization — final receipt

**Repository:** `mannyc2/nycustodianexam`  
**Base branch:** `agent/chat-corpus-reconciliation`  
**Immutable base SHA:** `22bfe0badbf3badf0e13517d48c5707c63b6d38e`  
**Normalization branch:** `research/normalize-initial-effect-outputs`  
**Draft PR:** https://github.com/mannyc2/nycustodianexam/pull/3  
**Normalization date:** 2026-08-21

## Purpose completed

The first parallel research pass was normalized before issuing replacement prompts.

This pass:

- recovered the supplied off-GitHub archive;
- safety-checked and inventoried its contents;
- preserved the strongest exact raw Effect reports in GitHub;
- preserved the exact deterministic tool-geometry report and proposed schema;
- recorded checksums for the remaining compact and binary evidence;
- deduplicated overlapping UI and core-architecture reports;
- separated reusable findings from version-specific recommendations;
- rejected contradictory behavior that violated the maintained product contract;
- updated maintained architecture/governance files with the new constraints;
- did not scaffold application code or dependencies.

## Source intake

Outer archive:

```text
8f7353c8-08fd-4677-bfeb-69a595dd0638.zip
SHA-256: 40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5
archive entries: 134
extracted files: 100
uncompressed bytes: 6,714,382
```

The archive contained nine Effect research outputs and the complete deterministic geometry research/POC tree.

The separately supplied browser-bundling Markdown was also recovered and its checksum is recorded in `SOURCE-HASHES.sha256`.

## Exact raw research published

### Effect

Under `research/initial-pass/raw/effect/`:

- browser bundling report;
- Effect v4 Schema/content-registry report;
- Effect Platform/browser Web-API report;
- Effect + IndexedDB/offline-content-packs report;
- Effect v4/Cloudflare correction.

Large Markdown reports are stored directly or in ordered line-boundary parts. Each part set has a README with the original filename, byte size, and SHA-256. Concatenating the ordered parts reproduces the original source report.

The two UI reports and two core-architecture reports are treated as overlapping report families. Their findings are represented in the normalization/duplication ledgers instead of being counted twice as independent support.

### Deterministic tool geometry

Under `research/initial-pass/raw/tool-geometry/`:

- exact research report in five ordered parts;
- proposed asset-manifest JSON Schema;
- source checksums and archive receipt;
- report-level normalization/authority guidance.

The report's original identity is:

```text
research-report.md
91,620 bytes
SHA-256: d12a9f91383c8ce0339d078f9404e1095b53c9537012b334c26e08143e9ce327
```

Nested research bundle:

```text
SHA-256: a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06
```

POC evidence archive:

```text
SHA-256: 725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d
```

STEP/STL/GLB/PNG/WebP/ZIP outputs were not committed as production assets through the connected text-write interface. Their identities remain covered by the source manifests. No POC is approved.

## Normalized outputs

Primary review files:

- `README.md`;
- `CURRENT-CONSTRAINTS.md`;
- `NORMALIZATION.md`;
- `REUSABLE-FINDINGS.md`;
- `DUPLICATION-AND-SUPERSESSION.md`;
- `REDO-REQUIRED.md`;
- `TOOL-GEOMETRY-RECONCILIATION.md`;
- `RAW-EFFECT-REPORTS.md`;
- `RAW-ARCHIVES.md`;
- `DECISION-MATRIX.csv`;
- `FILE-LEDGER.csv`;
- `SOURCE-HASHES.sha256`.

## Current constraints recorded

The maintained repository now records:

1. target the latest available Effect v4;
2. do not use Effect v3 as a production fallback;
3. follow current v4-native Effect patterns rather than mechanically translating v3 APIs;
4. use Bun for package management/tooling;
5. use Bun workspaces;
6. use top-level `apps/` and `packages/`;
7. avoid generic ports/adapters folder ceremony and service-per-function/package-per-service design;
8. preserve semantic HTML/CSS, Vite direction, Cloudflare Workers Static Assets direction, and no Next.js;
9. leave the UI renderer open for a current-v4 research pass and representative spike;
10. require future research agents to use connected `@GitHub`, commit/push exact outputs, and open draft PRs.

## Deduplication result

- UI research A/B: one overlapping family, not two independent architecture decisions.
- Core architecture A/B: one overlapping family, not two independent confirmations.
- Schema/content-registry: strongest v4-aligned first-pass lane.
- Platform/browser: reusable semantic boundaries, stale v3 package matrix.
- IndexedDB/offline: strong browser/transaction findings, provider decision needs v4 redo.
- Bundling: strong measurement method/static boundary, stale v3/pnpm dependency advice.
- Cloudflare correction: supersedes the original v3-first premise.

## Conflict resolved

First-pass UI reports proposed revealing correctness after only an in-memory commit when durable persistence failed.

Rejected maintained behavior:

```text
memory commit -> reveal -> persistence may fail
```

Maintained normal persistent behavior:

```text
selection
  -> explicit commit
  -> durable IndexedDB transaction succeeds
  -> reveal
```

## Work intentionally not performed

- no application scaffold;
- no `apps/` or `packages/` directories created yet;
- no Bun workspace configuration or lockfile;
- no Effect dependency selected/pinned;
- no renderer selected;
- no IndexedDB library selected for v4;
- no service worker or Cloudflare config;
- no geometry POC approved or published as production;
- no replacement research prompts written yet.

## Missing input

The maintainer requested future prompt alignment with a particular `SKILL.md`.

No project-relevant `SKILL.md` was found in:

- the repository;
- the supplied normalization archive;
- the raw research set.

The exact intended file must be supplied or identified before future prompts claim to follow it.

## Review sequence

Recommended maintainer review order:

1. `CURRENT-CONSTRAINTS.md`;
2. `NORMALIZATION.md`;
3. `DUPLICATION-AND-SUPERSESSION.md`;
4. `REUSABLE-FINDINGS.md`;
5. `REDO-REQUIRED.md`;
6. `DECISION-MATRIX.csv`;
7. exact raw reports where a conclusion needs inspection;
8. maintained deltas in `product/ARCHITECTURE_CONSTRAINTS.md`, `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/OPEN.md`, and `recovery/CORPUS_RECOVERY.md`.

After review, the next task is to write improved parallel prompts with immutable GitHub bases, mandatory GitHub publication, latest Effect v4, Bun workspaces, `apps/`/`packages/`, and more Effect-native research questions.

# Effect v4 and Bun prompt-foundation curation — final receipt

**Completed:** 2026-08-21  
**Repository:** `mannyc2/nycustodianexam`  
**Immutable base branch:** `agent/chat-corpus-reconciliation`  
**Immutable base SHA:** `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`  
**Output branch:** `research/curate-effect-v4-bun-prompts`  
**Draft PR:** `#4` — Curate Effect v4 and Bun research prompt foundation

A Git commit cannot truthfully embed its own final SHA in a tracked file that contributes to that SHA. The final pushed branch head is therefore recorded by the remote branch ref, PR metadata, and the completion response rather than self-embedded here.

## Work completed

### Primary-source curation

The pass identified and read the intended official Effect setup skill:

```text
Effect-TS/skills
commit: 28822c9e19998876a6b0e0d97877442012ed4391
path: skills/effect-ts/SKILL.md
```

The skill was adapted to Bun without copying its pnpm command literally. Its maintained operational rule is:

- make the exact selected Effect v4 package available at the monorepo root for package-local guidance/source access;
- keep explicit runtime dependencies in every workspace that imports Effect;
- read `node_modules/effect/AGENTS.md` completely before coding;
- follow relevant linked package-local documentation;
- inspect installed Effect/platform source when necessary.

The pass inspected Effect upstream at:

```text
Effect-TS/effect
commit: 436f10d1efccec308426532ff3f88df9a96434f3
observed effect version: 4.0.0-rc.111
```

That coordinate is dated evidence, not the future dependency lock. The prompt suite requires every lane to establish the actual latest Effect v4 and Bun coordinates at lane start.

Relevant current source/package surfaces inspected include:

- `packages/effect/package.json`;
- `LLMS.md` and package-local agent-document generation;
- `MIGRATION.md`;
- `@effect/platform-browser` and browser IndexedDB/persistence exports;
- `@effect/platform-bun` and `BunRuntime`;
- atom bindings for renderer comparison;
- current package/version cohort organization.

Official Bun documentation was reviewed for:

- workspaces and `workspace:*`;
- catalogs;
- isolated installs;
- text `bun.lock`;
- frozen/CI installation;
- filtering/scripts;
- lifecycle-script trust;
- Bun test and runtime boundaries.

## Maintained decisions corrected

The following maintained files were updated:

- `AGENTS.md`;
- `CONTRIBUTING.md`;
- `README.md`;
- `product/ARCHITECTURE_CONSTRAINTS.md`;
- `docs/OPEN.md`.

The maintained foundation now says:

- latest available Effect v4 is mandatory;
- Effect v3 is historical/migration/regression evidence only;
- unstable v4 surfaces remain individually evidence-gated;
- Bun/Bun workspaces and top-level `apps/`/`packages/` are fixed constraints;
- use a root Bun catalog for one exact coordinated Effect cohort;
- use explicit runtime dependencies, isolated installs, committed `bun.lock`, frozen CI installs, and minimal lifecycle-script trust;
- follow current Effect service/Layer/Schema/error/Scope/runtime/testing patterns rather than generic ports/adapters ceremony;
- keep pure deterministic logic plain and do not make Effect a renderer;
- require durable IndexedDB commit before answer reveal in normal persistent mode;
- require all future research to publish through GitHub from the beginning.

## Curation outputs

Created under `research/prompt-curation/`:

- `START-RECEIPT.md`;
- `REPORT.md`;
- `EFFECT-SKILL-ADAPTATION.md`;
- `EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `SOURCE-LEDGER.md`;
- `DECISION-MATRIX.csv`;
- `FINAL-RECEIPT.md`.

## Second-pass prompt suite

Created under `prompts/research-v2/`:

- `README.md`;
- `00-SHARED-RESEARCH-CONTRACT.md`;
- `01-effect-v4-core-monorepo.md`;
- `02-effect-v4-ui-reactivity.md`;
- `03-effect-v4-platform-runtime-matrix.md`;
- `04-effect-v4-indexeddb-offline.md`;
- `05-effect-v4-browser-bundling.md`;
- `06-effect-v4-schema-content-compiler.md`;
- `07-bun-monorepo-build-discipline.md`;
- `08-testing-accessibility-performance-observability.md`;
- `09-hazard-scene-production.md`;
- `10-tool-geometry-audit.md`;
- `90-architecture-synthesis.md`.

Each independent lane has:

- a disjoint branch and authorized research path;
- the shared Effect v4/Bun/GitHub contract;
- an immutable-source placeholder;
- mandatory early branch, receipt, push, and draft PR;
- exact raw reports and source/evidence ledgers;
- Bun fixture source, `package.json`, `bun.lock`, raw results, and checksums where probes are required;
- explicit limitations and unknowns;
- final branch/head/PR receipts;
- a stop rule when GitHub write access is unavailable.

## Important launch gate

The prompt suite currently contains:

```text
{{POST_CURATION_SOURCE_SHA}}
```

Do not run the parallel lanes with that placeholder or against a moving branch.

After this PR is reviewed and merged into `agent/chat-corpus-reconciliation`:

1. record the resulting reconciliation-branch SHA;
2. replace the placeholder in every v2 prompt with that exact immutable SHA;
3. commit the stamped suite;
4. review/merge the encompassing corpus PR to `main` if desired;
5. launch P0 lanes from the chosen immutable source.

## Deliberately not performed

This curation pass did not:

- scaffold `apps/` or `packages/`;
- create package manifests, dependency installations, or a Bun lockfile for production;
- choose the exact final workspace graph;
- choose a UI renderer;
- choose an IndexedDB provider;
- freeze Effect, Bun, Vite, or Cloudflare production versions;
- create application code, tests, workflows, or deployment configuration;
- approve any geometry or hazard-scene asset;
- alter exam facts beyond correcting the architecture-decision entry in `docs/OPEN.md`.

## Integrity and publication

The branch was created from the immutable base above. Work was committed and pushed incrementally through the connected GitHub capability, and draft PR #4 was opened before extended research. No force push was used.

Git history and the final PR diff are the canonical integrity record for this documentation-only curation branch.
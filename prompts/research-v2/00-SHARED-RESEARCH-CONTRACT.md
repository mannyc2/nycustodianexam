# Shared contract for the second Effect v4 / Bun research program

> **Do not run a lane until `{{POST_CURATION_SOURCE_SHA}}` has been replaced with the exact source SHA produced after the prompt-curation PR is merged.**
>
> Every lane is repository-backed and must use the connected **`@GitHub`** capability directly. A sandbox-only answer is a failed lane.

## Repository and immutable source

```text
Repository:
  mannyc2/nycustodianexam

Source branch:
  agent/chat-corpus-reconciliation

Required source SHA:
  {{POST_CURATION_SOURCE_SHA}}
```

The source branch contains the maintained product contract, normalized first-pass research, current Effect v4/Bun constraints, and this prompt suite.

Before research:

1. use `@GitHub` to fetch the source branch;
2. verify it equals the required SHA;
3. verify the lane branch does not exist;
4. stop on drift or an existing branch;
5. do not silently use `main`, another PR, or a moving upstream state.

## Mandatory early GitHub checkpoint

Before extended reading, web research, package installation, or probes:

1. create the exact lane branch from the immutable source SHA using `@GitHub`;
2. create the lane’s authorized directory;
3. commit `START-RECEIPT.md`, containing:
   - repository;
   - source branch and SHA;
   - output branch;
   - UTC start time;
   - intended scope and allowed paths;
   - GitHub access result;
   - initial upstream coordinates discovered without lengthy research, if any;
4. push without force;
5. open a draft PR against `agent/chat-corpus-reconciliation`;
6. put the branch, initial commit, and PR URL in the visible chat response before proceeding.

If branch creation, push, or draft-PR creation is unavailable, **stop**. Do not continue and leave the only output in ChatGPT.

## Authorized activity

Unless the lane says otherwise, the researcher may:

- read all repository files and relevant branches/PRs;
- create the authorized lane branch;
- add files only under the lane’s allowed directory;
- create private research fixtures inside that directory;
- install exact dependencies inside those fixtures using Bun;
- run source/build/runtime probes;
- commit exact reports, ledgers, fixtures, raw results, and checksums;
- push incrementally without force;
- update the draft PR body;
- leave PR review comments on its own draft PR when useful.

The researcher may not:

- edit maintained `docs/`, `product/`, `illustration/`, root governance, existing research, prompts, packages, workflows, deployment configuration, or application code;
- merge any PR;
- modify `main` or the source branch;
- force-push;
- create releases, tags, production packages, or production assets;
- claim implementation or certification authority;
- ingest secure/recalled/reconstructed exam content.

## Required repository reading

Every lane must read completely:

- `AGENTS.md`;
- `README.md`;
- `CONTRIBUTING.md`;
- `product/ARCHITECTURE_CONSTRAINTS.md`;
- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`;
- `research/initial-pass/README.md`;
- `research/initial-pass/NORMALIZATION.md`;
- `research/initial-pass/DUPLICATION-AND-SUPERSESSION.md`;
- `research/initial-pass/REUSABLE-FINDINGS.md`;
- `research/initial-pass/REDO-REQUIRED.md`.

Read the lane-specific files named by the individual prompt. Do not treat the old reports as current v4 authority.

## Current Effect v4 gate

The project targets the **latest available Effect v4 line**.

At the start of each version-sensitive lane:

1. identify the latest available v4 package version and release status;
2. identify the coordinated versions of every matching Effect ecosystem package needed by the lane;
3. pin the upstream tag/commit and package metadata;
4. record whether each used namespace is stable or `unstable`;
5. distinguish:
   - package/repository source existence;
   - published registry availability;
   - documented contract;
   - exact runtime observation;
   - project recommendation.

Do not choose Effect v3 as fallback. V3 may appear only as explicitly labeled historical, migration, or regression evidence.

The project requirement to use v4 does not mean that every `effect/unstable/*` API is automatically accepted. Record instability, expected change surface, how project code can isolate it, and the cost of replacement.

## Official Effect skill and package guidance

The official Effect skill is pinned in the curation source ledger. Follow its intent.

For any code-level Effect work, create a private Bun fixture inside the authorized research directory. It must have:

- `"private": true`;
- the exact selected Effect v4 version;
- exact matching Effect ecosystem versions;
- committed `package.json`;
- committed `bun.lock`;
- no undeclared dependencies.

Before writing Effect code:

1. read `node_modules/effect/AGENTS.md` **completely**;
2. follow the linked package-local guidance relevant to the lane;
3. inspect `node_modules/effect/src` and matching platform-package source when the guide does not settle the question;
4. record the package/source coordinates in the evidence ledger.

At the future real workspace, the exact selected `effect` package will also be a root dev dependency for agent/source visibility, while every consuming runtime workspace must explicitly declare its own runtime dependency through the Bun catalog.

## Effect-native research standard

Research and examples should begin from current Effect v4 patterns, including where applicable:

- `Effect.gen`;
- named `Effect.fn`;
- Schema models and `Schema.TaggedError`;
- `Context.Service`;
- cohesive capability services;
- focused Layers;
- `Context.Reference`;
- Scope and finalizers;
- structured concurrency;
- runtime roots;
- current platform packages;
- current testing guidance;
- Clock, DateTime, Random, Predicate, logging, tracing, and metrics.

Do not begin from a generic:

```text
src/domain/
src/application/
src/ports/
src/adapters/
src/ui/
```

and then add Effect wrappers.

A service exists for meaningful dependency, failure, lifecycle, resource, testing, or runtime substitution semantics. A package exists for a real runtime, build, ownership, publication, or reuse boundary.

Reject:

- service per function;
- package per service;
- generic `core` dumping ground;
- giant application service;
- giant Layer that hides the dependency graph;
- Layer or runtime construction per event;
- scattered `runPromise` / `runFork`;
- Promise/Effect bouncing without a boundary reason;
- throwing expected failures;
- using defects as normal domain errors;
- manual parsing where Schema is the project boundary model;
- Effect used as a DOM renderer.

Pure deterministic calculations may remain ordinary TypeScript.

## Bun and workspace gate

The implementation direction is:

```text
apps/
packages/
```

with Bun workspaces.

At lane start, establish the exact current Bun version used for probes. Use current official Bun docs/source for workspaces, catalogs, isolated installs, lockfiles, filters, lifecycle scripts, TypeScript, and testing.

Research should assume or evaluate:

- private root package;
- workspaces `apps/*` and `packages/*`;
- Bun catalog for one exact coordinated Effect cohort;
- explicit `workspace:*` dependencies;
- isolated linker;
- text `bun.lock` committed;
- `bun ci` / frozen lockfile in CI;
- minimal reviewed `trustedDependencies`;
- filtered and dependency-aware scripts;
- runtime-specific tsconfig files;
- explicit runtime dependencies;
- no phantom dependency access.

Do not add pnpm/npm/yarn recommendations as project defaults. Do not assume `bun test` replaces Effect’s official testing integration; evaluate distinct responsibilities.

Bun manages the TypeScript workspace but does not make browser, workerd, and service worker code Bun-runtime code. Preserve runtime-specific APIs and types.

## Maintained product invariants

Every recommendation must preserve:

- crawlable semantic acquisition/reference HTML;
- no Next.js;
- no client SPA requirement for indexable pages;
- no required account;
- local-first progress;
- explicit versioned offline packs;
- deterministic sessions and print;
- WCAG 2.2 behavior and nonvisual equivalents;
- no answer leakage before commitment through visible DOM, accessibility data, filenames, source maps, manifests, SVG/GLB metadata, or static assets;
- minimal or absent backend until justified;
- no secure/recalled/reconstructed exam content.

### Durable commit before reveal

Normal persistent study mode is:

```text
selection
  -> explicit commit request
  -> authoritative IndexedDB transaction succeeds
  -> reveal correctness and explanation
```

A persistence failure keeps the answer selected/uncommitted, exposes a typed recoverable error, and permits an idempotent retry. It does not reveal correctness.

## Source policy

For version-sensitive technical claims, use primary sources:

- installed Effect package guidance/source;
- pinned official Effect repository source, package metadata, releases, migration guides, and maintainer-authored docs;
- official Effect skill repository;
- official Bun docs/source/releases;
- official Vite and Cloudflare docs/source;
- Web standards and MDN where browser semantics/support need explanation;
- official source/docs for compared libraries.

High-quality adopter repositories may corroborate, but cannot override upstream contracts.

## Evidence and language

Use these statuses consistently:

- **CONFIRMED** — official docs/declarations/source establish the claim;
- **OBSERVED** — a committed reproducible probe establishes the exact coordinate;
- **CORROBORATED** — strong secondary/production evidence;
- **INFERRED** — project recommendation;
- **UNKNOWN** — not established;
- **BLOCKED** — required evidence/capability unavailable.

Do not present:

- API presence as project adoption;
- source inspection as runtime proof;
- one runtime observation as a supported version range;
- reproducibility as correctness;
- research as implementation or certification.

Every unknown should include the evidence or probe that would resolve it.

## Fixture and measurement discipline

When running probes:

- keep them under the lane’s `fixtures/` or `probes/`;
- pin all versions;
- commit package manifests and Bun lockfile;
- record OS, architecture, Bun version, browser version, Vite/Cloudflare versions, flags, environment, and timestamps;
- preserve raw output before writing the interpretation;
- distinguish expected failure from defects and harness failure;
- avoid network-dependent tests when an offline fixture can prove the point;
- never commit credentials;
- do not dispatch external workflows unless the lane explicitly authorizes them.

## Required lane outputs

Unless the lane adds more, create:

```text
README.md
START-RECEIPT.md
REPORT.md
SOURCE-LEDGER.csv
DECISION-MATRIX.csv
OPEN-QUESTIONS.csv
FINAL-RECEIPT.md
MANIFEST.sha256
```

Commit fixture source and raw probe results in clearly named subdirectories.

`SOURCE-LEDGER.csv` must include:

```text
source_id
authority
title
version_or_ref
commit_sha
path_or_coordinate
url
accessed_at
supports
limitations
```

`DECISION-MATRIX.csv` must include:

```text
decision_id
decision
evidence_status
recommendation
alternatives
adoption_status
stability
runtime_measurement_required
blocking_items
handoff
```

`FINAL-RECEIPT.md` must record:

- immutable source SHA;
- branch;
- initial and final commits;
- PR URL;
- all substantive files;
- exact upstream/dependency coordinates;
- probes run;
- raw results;
- checksums;
- limitations;
- source-branch drift recheck.

## Incremental publication

Push after the initial receipt, after the source/fixture baseline, and after the substantive report. Do not make one giant final commit when the work naturally has auditable phases.

## Final response contract

The visible final response must contain:

- lane name;
- immutable source branch/SHA;
- output branch;
- final head SHA;
- draft PR URL;
- commits;
- files produced;
- exact Effect/Bun coordinates;
- key conclusions;
- key caveats;
- probes not run;
- whether source drifted.

Do not end with sandbox links as the only durable output.

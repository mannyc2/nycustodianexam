# Contributing

This repository contains the provenance corpus, product contract, architecture constraints, research evidence, and illustration-production rules for a free independent study site for New York's Entry-Level Custodians and Janitors civil-service test series.

## Know which layer you are changing

- `docs/` — exam facts, scope, taxonomy, evidence, and unresolved truth claims.
- `product/` — user-visible behavior and current architecture constraints.
- `illustration/` — maintained production mechanics and reviewed asset evidence.
- `research/initial-pass/` — raw and normalized first-pass research, including superseded recommendations.
- `research/prompt-curation/` — maintained latest-v4/Bun research doctrine and source ledger.
- other `research/` directories — supporting investigations/proposals.
- `recovery/` — conversation/artifact reconciliation.
- `prompts/research-v2/` — the maintained second-pass research program; prompts are not evidence.

Follow the authority and conflict rules in `AGENTS.md`. Do not resolve a disagreement by editing whichever file is easiest.

## Before changing an exam fact

Check the canonical documents in `docs/`. A new assertion should include:

- source;
- evidence tier;
- publication/observation date where relevant;
- exact jurisdiction, title, and administration;
- limitations on generalization.

Do not silently replace contradictory evidence. Resolve it only when a controlling source supports the resolution; otherwise retain the conflict in `docs/OPEN.md`.

## Before changing architecture or product behavior

Read:

- `product/FEATURE_SPEC.md`;
- `product/ARCHITECTURE_CONSTRAINTS.md`;
- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`;
- `research/initial-pass/README.md`;
- `research/initial-pass/DUPLICATION-AND-SUPERSESSION.md`;
- `research/initial-pass/REDO-REQUIRED.md`;
- relevant canonical fact/scope documents.

Current hard direction:

- latest available Effect v4;
- Bun and Bun workspaces;
- top-level `apps/` and `packages/`;
- standards-first semantic HTML/CSS;
- no Next.js;
- Vite/Cloudflare direction subject to the improved v4/Bun research;
- no UI renderer selected yet.

Do not implement Effect v3 as a fallback. Do not translate v3 APIs and directory structures mechanically into the new codebase.

## Learning Effect before coding

The maintainer-selected `SKILL.md` is the official Effect setup skill in `Effect-TS/skills`.

Once a Bun workspace or lane fixture has installed the exact selected Effect v4 package:

1. read `node_modules/effect/AGENTS.md` completely;
2. follow the relevant linked package-local documentation;
3. inspect `node_modules/effect/src` and installed platform-package source when needed;
4. use the exact installed package as the source of truth.

At the future monorepo root, the exact selected `effect` package should be available as a development dependency for source/guidance access. Every runtime workspace that imports Effect must still declare an explicit runtime dependency through the Bun catalog; root installation is not permission for phantom imports.

### Effect architecture expectations

- Follow current official Effect v4 patterns such as `Effect.gen`, named `Effect.fn`, Schema models/tagged errors, `Context.Service`, focused Layers, Scope, and runtime-root composition where applicable.
- Use cohesive capability services, not service per function.
- Keep pure deterministic functions plain when no capability is needed.
- Avoid giant application services, giant invisible Layers, and generic `ports/adapters` ceremony.
- Use typed expected errors and Schema at trust boundaries.
- Keep runtime execution at application boundaries.
- Preserve provider cancellation and transaction truth rather than overstating what fiber interruption guarantees.
- Keep application/use-case state independent from DOM construction.
- Record the status, isolation boundary, reason, and migration risk of every unstable v4 API.
- Do not use Effect as a home-grown renderer.

### Durable answer commit

Normal persistent mode must not reveal correctness until the authoritative attempt transaction is durably committed in IndexedDB. Persistence failure keeps the selection uncommitted, reveals no correctness, and permits an idempotent retry.

## Before changing Bun/workspace structure

The future monorepo uses:

```text
apps/
packages/
```

Expected baseline for research and later implementation:

- private root package;
- Bun workspaces;
- root Bun catalog for one exact coordinated Effect v4 cohort;
- explicit `workspace:*` and runtime dependencies;
- isolated linker unless a measured incompatibility requires an exception;
- committed text `bun.lock`;
- `bun ci` or current frozen install in CI;
- minimal reviewed lifecycle-script trust;
- runtime-specific TypeScript configuration.

Do not:

- add pnpm/npm/yarn workspace configuration;
- rely on root hoisting or undeclared dependencies;
- create one package per service;
- create empty packages for speculative future boundaries;
- create an empty Worker app before a Worker is justified;
- make `packages/core` a dumping ground;
- assume generic Clean Architecture folders are Effect best practice;
- expose Bun globals to browser, service-worker, or workerd packages merely because Bun owns the workspace.

Bun does not replace specialist tools by decree. Vite, Wrangler, Playwright, and justified non-TypeScript tooling may remain.

## Before changing illustration production

Read, in order:

1. `docs/TAXONOMY.md`;
2. `illustration/README.md`;
3. `illustration/TOOL_GEOMETRY_PIPELINE.md` for isolated tools;
4. `illustration/PIPELINE_SPEC.md` for historical/hazard/fallback guidance;
5. the exact raw evidence under `research/initial-pass/raw/` when auditing supplied geometry work.

For tool assets:

- deterministic project-owned geometry or deterministic 2D construction is the source of truth;
- keep sourced, measured, derived, and editorial parameters distinct;
- external CAD is not automatically reusable or mechanically suitable;
- static SVG/raster controls scored use;
- GLB is optional atlas-only content and never auto-downloads;
- pre-answer rotation is prohibited;
- generation cannot invent or restyle the controlling mechanical geometry;
- automated validation and matching hashes do not replace human mechanical, rights, accessibility, print, and leak review;
- no illustration is better than unsupported geometry.

Never use official DCS/exam artwork as an input, tracing source, or style reference.

## Exam security

Do **not** open an issue, pull request, discussion, or commit containing:

- remembered or reconstructed exam questions;
- secure test drawings or photographs;
- answer choices or keys from a live/secure administration;
- review-session notes that reproduce content;
- purchased or scraped “actual question” dumps.

Reports about possible secure content should identify the source at a high level without reproducing it.

## Useful contributions

Useful work includes:

- newer official announcements/guides;
- source-backed corrections;
- class specifications;
- source-backed tool/safety facts;
- accessibility and reviewed translation corrections;
- same-plan jurisdiction evidence;
- original practice-content QA;
- latest-v4/Bun primary-source research;
- content/compiler validation work;
- browser/offline/testing evidence;
- geometry evidence, parameter records, deterministic models, and independent reviews.

## Research publication through GitHub

Second-pass research must use the connected `@GitHub` capability and the shared contract in `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`.

Before extended research, a lane must:

1. verify the immutable source SHA;
2. verify the output branch is absent;
3. create the branch;
4. commit and push `START-RECEIPT.md`;
5. open a draft PR.

A completed research PR should contain:

- exact raw report;
- source/evidence ledger;
- machine-readable tables and decision matrices;
- runnable fixture source where probes were required;
- exact `package.json` and `bun.lock` for probe fixtures;
- raw measurements/results;
- checksums;
- limitations and unresolved items;
- final branch, head SHA, commit, and PR receipts.

Push incrementally without force. Do not leave the only copy in a ChatGPT sandbox. When GitHub write access is unavailable, stop and report the blocker instead of claiming completion.

## Research versus maintained state

A raw report is evidence, not automatically a decision. Preserve raw files, then normalize:

- reusable findings;
- duplicates;
- superseded assumptions;
- contradictions;
- redo requirements.

Before importing a recovered artifact, classify it in `recovery/CORPUS_RECOVERY.md`. Verify exact SHA-256 values; do not reconstruct unavailable files from summaries.

## Code

Application code and Bun workspace configuration have not yet been scaffolded. Add concrete format/test/build commands only when the reviewed toolchain actually exists.
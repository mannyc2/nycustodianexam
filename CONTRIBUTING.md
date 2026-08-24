# Contributing

This repository contains the provenance corpus, product contract, architecture constraints, research evidence, and illustration-production rules for a free independent study site for New York's Entry-Level Custodians and Janitors civil-service test series.

## Know which layer you are changing

- `docs/` — exam facts, scope, taxonomy, evidence, and unresolved truth claims.
- `product/` — user-visible behavior and current architecture constraints.
- `illustration/` — maintained production mechanics and reviewed asset evidence.
- `research/README.md` — complete reduced map of unique supporting evidence;
  research is never authority merely because it is committed.
- `recovery/` — conversation/artifact reconciliation.
- `prompts/research-v2/` — archived records for the closed/reconciled
  second-pass program; prompts are not evidence or current launch contracts.

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
- `docs/OPEN.md`;
- `research/README.md`;
- relevant canonical fact/scope documents.

Current hard direction:

- latest available Effect v4;
- Bun and Bun workspaces;
- top-level `apps/` and `packages/`;
- standards-first semantic HTML/CSS;
- no Next.js;
- Vite and Cloudflare Workers Static Assets;
- a provisional lazy direct-DOM first slice behind a renderer-neutral boundary.

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
2. `illustration/VISUAL_AUTHORING_POLICY.md`;
3. `illustration/README.md`;
4. `research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md` and
   `research/v2/tool-geometry-audit/REPORT.md` only when historical geometry
   evidence is relevant.

For production assets:

- Codex-native generated raster bytes are the authoring route and exact accepted
  bytes are the source of truth;
- keep supported visual facts, required/forbidden features, prompt/brief,
  candidate lineage, and accepted hashes distinct;
- external CAD or images are not automatically reusable, rights-cleared, or
  mechanically suitable;
- scored views are fixed and versioned; rotation is atlas-only;
- generation never substitutes for content/mechanical, taxonomy,
  rights/similarity, accessibility, phone/print, and answer-leak review; and
- reject unsupported or ambiguous geometry rather than publishing it.

Publicly released official samples may guide high-level visual style only under
the visual policy. Never trace or reproduce their item content or composition,
and never use secure, remembered, candidate-recalled, or rights-unreviewed FOIL
material.

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

The R2 program is closed/reconciled and its prompts are archived; outcome rows
retain blocked or incomplete probe status. A genuinely new research task must
define a fresh scope and use connected GitHub rather than relaunching an old
lane unchanged.

Before extended research, a lane must:

1. verify the immutable source SHA;
2. verify the output branch is absent;
3. create the branch;
4. commit and push a truthful initial result;
5. open a draft PR.

A completed research PR should contain a concise synthesis, exact source
coordinates/checksums, limitations, unresolved items and owner, and only the
minimal source/fixture/evidence bytes required by an active reproducibility or
consumer contract. Do not accumulate raw output, generated installs, duplicate
formats, or START/FINAL receipt trees.

Push incrementally without force. Do not leave the only copy in a ChatGPT sandbox. When GitHub write access is unavailable, stop and report the blocker instead of claiming completion.

## Research versus maintained state

A research report is evidence, not automatically a decision. Normalize it into:

- reusable findings;
- duplicates;
- superseded assumptions;
- contradictions;
- current unresolved requirements.

Promote accepted conclusions once to their maintained consumer, then delete
duplicate, superseded, raw-noise, generated, and archive-only working material.
Git history at an immutable coordinate is the recovery mechanism.

Before importing a recovered artifact, classify it in `recovery/CORPUS_RECOVERY.md`. Verify exact SHA-256 values; do not reconstruct unavailable files from summaries.

## Code

At this normalization base, application code and Bun workspace configuration
have not yet been scaffolded. Add concrete format/test/build commands only when
the reviewed toolchain actually exists.

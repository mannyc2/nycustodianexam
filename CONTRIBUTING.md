# Contributing

This repository contains the provenance corpus, product contract, architecture constraints, research evidence, and illustration-production rules for a free independent study site for New York's Entry-Level Custodians and Janitors civil-service test series.

## Know which layer you are changing

- `docs/` — exam facts, scope, taxonomy, evidence, and unresolved truth claims.
- `product/` — user-visible behavior, canonical routes/states/components, and
  current architecture constraints.
- `illustration/` — maintained production mechanics and reviewed asset evidence.
- `research/initial-pass/` — raw and normalized first-pass research, including superseded recommendations.
- `research/prompt-curation/` — maintained latest-v4/Bun research doctrine and source ledger.
- other `research/` directories — supporting investigations/proposals.
- `recovery/` — conversation/artifact reconciliation.
- `prompts/research-v2/` — the preserved completed second-pass launch program;
  prompts are not evidence or current implementation authority.

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
- `product/ROUTES.md`;
- `product/SCREEN_STATES.md`;
- `product/COMPONENT_ARCHITECTURE.md` for view/component work;
- `product/DESIGN_SYSTEM.md` for tokens, responsive behavior, focus, controls,
  state presentation, and print;
- `research/v2/architecture-synthesis/` for the reconciled evidence baseline;
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
- Vite and Cloudflare Static Assets delivery direction;
- React 19 only for lazy interactive islands over generated semantic documents;
- no SPA router; and
- one long-lived browser `ManagedRuntime` at the site application root.

Do not implement Effect v3 as a fallback. Do not translate v3 APIs and directory structures mechanically into the new codebase.

## Learning Effect before coding

The maintainer-selected `SKILL.md` is the official Effect setup skill in `Effect-TS/skills`.

Once a Bun workspace or lane fixture has installed the exact selected Effect v4 package:

1. read `node_modules/effect/AGENTS.md` completely;
2. follow the relevant linked package-local documentation;
3. inspect `node_modules/effect/src` and installed platform-package source when needed;
4. use the exact installed package as the source of truth.

At the monorepo root, the exact selected `effect` package is available as a
development dependency for source/guidance access. Every runtime workspace that
imports Effect must still declare an explicit runtime dependency through the Bun
catalog; root installation is not permission for phantom imports.

### Effect architecture expectations

- Follow current official Effect v4 patterns such as `Effect.gen`, named `Effect.fn`, Schema models/tagged errors, `Context.Service`, focused Layers, Scope, and runtime-root composition where applicable.
- Use cohesive capability services, not service per function.
- Keep pure deterministic functions plain when no capability is needed.
- Avoid giant application services, giant invisible Layers, and generic `ports/adapters` ceremony.
- Use typed expected errors and Schema at trust boundaries.
- Keep runtime execution at application boundaries.
- Preserve provider cancellation and transaction truth rather than overstating what fiber interruption guarantees.
- Keep application/use-case state independent from DOM construction.
- Keep immutable `ScreenSnapshot`, semantic actions, and state/action/meta
  provider interfaces renderer-neutral. React providers adapt them; they do not
  own durable truth or construct runtimes/Layers during render.
- Prefer compound components, lifted shared state, children composition, and
  explicit named variants. Do not grow mode behavior through boolean props or
  `renderX` prop families.
- Record the status, isolation boundary, reason, and migration risk of every unstable v4 API.
- Do not use Effect as a home-grown renderer.

### Durable answer commit

Normal persistent mode must not reveal correctness until the authoritative attempt transaction is durably committed in IndexedDB. Persistence failure keeps the selection uncommitted, reveals no correctness, and permits an idempotent retry.

## Before changing Bun/workspace structure

The monorepo uses:

```text
apps/
packages/
```

Current implementation baseline:

- exact Bun `1.4.0` and Node `22.22.0` toolchains;
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

The accepted initial graph is exactly `apps/site`, `apps/content-compiler`, and
`packages/content`. Do not add a shared React/study package until a real second
consumer or separate runtime/build/ownership boundary earns it.

### Maintained code layout and naming

The automated layout contract covers workspace-root configuration, maintained
code under `apps/*/{src,scripts,test,browser-tests}/` and
`packages/*/{src,test}/`, root `scripts/`, `.github/workflows/`, and active
`.mjs` authoring commands under `content/authoring/visuals/`. Generated site
trees and non-executable evidence/content corpora are deliberately outside this
mechanical naming check.

- Use lowercase kebab-case for maintained directory names and file stems.
- Preserve tool-standard names such as `package.json`, `tsconfig.json`, and
  `vite.config.ts`.
- Name commands with a verb and object, such as `check-toolchain.ts`.
- Name unit tests after their subject with `.test.ts` or `.test.tsx`; use
  `.pw.ts` or `.pw.tsx` for Playwright specifications and `-fixtures.ts` for
  browser-test support owned by a specific capability.
- Inside a tightly scoped feature, role names such as `state.ts`,
  `controller.ts`, `persistence.ts`, and `bootstrap.tsx` are acceptable. Do not
  introduce broad `types`, `utils`, `helpers`, `common`, `contract`,
  `components`, or `family` stems; name the owned concept instead.
- Keep renderer-neutral feature code at the feature root and place React-only
  adapters under a `react/` directory.
- Root `scripts/` owns cross-workspace orchestration. App-specific generation
  and release commands belong to that app.

Run `bun run check:layout` before submitting a structural change. The check
includes committed and non-ignored untracked files so a new violation cannot
hide outside the current Git index.

Public package entrypoints are explicit compatibility facades. Extracted
modules point to narrower internal owners and must not import those facades
backward. Run `bun run check:boundaries` when splitting a package; the root
verification gate runs both structural checks. Renderer-neutral `.ts` modules
also may not import a React `.tsx` adapter.

The site has one physical private IndexedDB, owned by
`apps/site/src/study-storage/app-database.ts` and its private sibling directory.
Feature persistence capabilities may transact through the injected connection,
but must not open or version their own databases. Private database modules do
not import backward through the public facade, outside modules cannot import
those internals, and the boundary check reserves direct access to the global
IndexedDB factory for this owner.

The temporary hazard/review databases are read-only migration sources. The app
rescans them on startup because a one-shot completion marker cannot prove that
an older open tab has stopped writing. Schema-valid missing records are added,
matching records are idempotent, and malformed or conflicting records are kept
in `migration-quarantine` without overwriting canonical data. Do not introduce
a terminal migration receipt until old writers have an enforced retirement
boundary. The shared connection closes on `pagehide` and reopens on persisted
`pageshow` or the next operation so IndexedDB does not defeat back/forward cache.

Bun does not replace specialist tools by decree. Node `22.22.0` hosts the
locked Vitest/workspace boundary; Vite, Wrangler, Playwright, and justified
non-TypeScript tooling may remain.

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

The completed second-pass research used the connected `@GitHub` capability and
the shared contract in `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`. Any
future rerun or new architecture lane must follow the same publication contract.

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

The initial Bun workspace and vertical-slice code are scaffolded under
`apps/site`, `apps/content-compiler`, and `packages/content`. Typecheck, unit,
compiler, static-closure, answer-leak, bundle-budget, and headless-Chrome
commit/reload/offline checks are implemented; treat the scaffold as an
implementation proof until the remaining multi-browser failure/update,
accessibility, and preview gates pass. Add or change commands only when they
execute against the reviewed locked toolchain.

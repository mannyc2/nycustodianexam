# Agent instructions

This repository is a provenance-tracked research and product corpus for a free NY civil-service Custodian exam study site.

## Read by task domain

### Exam facts and content scope — `docs/`

- `docs/FACTBASE.md` — established exam/logistics/legal facts.
- `docs/SCOPE.md` — testable content facts and source basis.
- `docs/TAXONOMY.md` — current tool/hazard taxonomy and evidence tiers.
- `docs/LANDSCAPE.md` — competitive, pedagogical, accessibility, design, and SEO evidence.
- `docs/OPEN.md` — unresolved facts, conflicts, recovery targets, and pending decisions.

These files control exam truth and scope.

### Product behavior and implementation constraints — `product/`

- `product/FEATURE_SPEC.md` — maintained product/UX behavior contract.
- `product/ARCHITECTURE_CONSTRAINTS.md` — current implementation constraints and research gates.
- `product/ROUTES.md` — canonical route IDs, paths, indexability, ownership,
  navigation, offline behavior, and milestones.
- `product/SCREEN_STATES.md` — legal route states, transitions, recovery,
  focus, history, and offline semantics.
- `product/COMPONENT_ARCHITECTURE.md` — React 19 compound-component families,
  provider contracts, variants, and composition rules.
- `product/DESIGN_SYSTEM.md` — shared visual tokens, responsive/print layout,
  focus, controls, state presentation, and accessibility adaptations.

Current direction:

- latest available Effect v4;
- Bun package management, scripts, and workspaces;
- top-level `apps/` and `packages/` monorepo shape;
- standards-first semantic HTML/CSS;
- Vite for browser tooling;
- Cloudflare Workers Static Assets initially;
- no Next.js;
- React 19 for lazy interactive islands, with generated semantic HTML for
  acquisition/reference documents and no SPA router.

Do not use Effect v3 as a production fallback. Older v3 research is historical, migration, or regression evidence only.

### Architecture and future research

The R2.1–R2.10/R2.90 program is closed and reconciled; some requested runtime
proof remains open as implementation evidence. Before architecture or
implementation work, read `product/ARCHITECTURE_CONSTRAINTS.md`, `docs/OPEN.md`, and
`research/README.md`. The files under `prompts/research-v2/` are archived lane
instructions, not runnable current launch contracts or authority.

Any new research task must define a fresh scope, exact immutable source SHA,
canonical consumer, and output branch. Verify those coordinates with connected
GitHub before extended work and stop on source drift.

The archived R2 direct-DOM-first choice remains historical evidence and a
measurement baseline, but the maintained React 19 island decision supersedes it
as the implementation renderer.

### Illustration production — `illustration/`

`docs/TAXONOMY.md` controls which concepts and decisive distinctions are allowed.

`illustration/VISUAL_AUTHORING_POLICY.md` is the current production authority for
isolated tools, confusable comparisons, and hazard scenes. Use Codex-native image
generation; preserve the accepted reviewed raster bytes as the visual source of
truth. Do not require SVG/CAD/3D production assets or model-output regeneration.

Publicly released official sample artwork may be used as a high-level visual-
style reference under that policy. It may never provide secure/recalled content,
item composition, or artwork to trace/reconstruct.

`illustration/TOOL_GEOMETRY_PIPELINE.md`, `illustration/PIPELINE_SPEC.md`, and the
R2.9 deterministic-first recommendation are supporting or historical material
only. The four recovered R2.10 CAD/SVG POCs are retired production-art
candidates, not work awaiting repair or approval.

### Supporting evidence and recovery

- `research/README.md` — complete map of unique retained supporting evidence;
  committing a report does not make it authoritative.
- immutable commit `6701e83290c56d9c5f04275a30fc6ada6bd40435` — historical
  pre-normalization research archive.
- `recovery/CORPUS_RECOVERY.md` — reconciliation ledger.
- `prompts/` — instructions, never evidence.

## Conflict and precedence

Resolve conflicts by domain:

1. `docs/` controls exam facts and allowed scope.
2. `product/ARCHITECTURE_CONSTRAINTS.md` controls current implementation constraints.
3. `product/FEATURE_SPEC.md` controls user-visible behavior where it does not contradict exam truth.
4. current illustration decisions control production mechanics.
5. raw/normalized research supports decisions but does not silently override them.

Later accepted constraints may supersede an older research recommendation while preserving the raw report for audit.

## Evidence rules

- Preserve provenance, evidence tier, source locator, observation date, exact version/ref, and artifact checksum.
- Distinguish official evidence, exact runtime observation, reputable corroboration, inference, and unknowns.
- API/source existence is not runtime proof.
- One exact runtime observation is not a supported version interval.
- Do not silently resolve contradictions.
- Do not turn an editorial recommendation into an exam fact.
- Unknown facts stay unknown.
- Before re-researching, inspect the maintained corpus, `docs/OPEN.md`, and
  `research/README.md`.
- Do not claim an exact raw artifact was recovered when only a summary exists.

## Exam-security boundary

Never request, reproduce, reconstruct, summarize, paraphrase, store, or publish secure or remembered examination questions, drawings, answer choices, or keys.

Officially published sample material may be discussed only in its lawful/public context. Historical/FOIL material requires an explicit security and rights determination before item text is ingested. Candidate recollections never define item content.

## Site-content rules

- The site is independent and unofficial.
- Practice questions and illustrations must be original or independently rights-cleared.
- Never advertise “actual questions,” leaked answers, guaranteed passing, fabricated reviews, or unsupported official-length/weight/score claims.
- Entry-level and high-level series remain separate unless evidence explicitly establishes compatibility.
- Every scored explanation exposes source support and a rationale for every distractor.
- Pre-answer UI, accessibility data, filenames, manifests, source maps, SVG metadata, and GLB metadata must not leak the correct answer.
- Reviewed translations preserve canonical English terminology and must not imply a bilingual official exam.

The split static release enforces a presentation/order boundary, not answer
confidentiality or DRM. Opaque item-scoped postcommit objects and explicit
offline packs necessarily contain original-practice keys. They must not be in
the initial document, executable closure, or safe precache, and application
code must not request/read one before durable commitment. Public paths,
manifests, and asset metadata may identify an opaque postcommit object but may
not encode its answer. Secure exam content remains prohibited entirely.

## Learning and verifying Effect

The intended `SKILL.md` is the official Effect setup skill at:

```text
Effect-TS/skills
skills/effect-ts/SKILL.md
```

Apply its intent using Bun.

In the Bun workspace, the exact selected Effect v4 package must be available as a
root development dependency so its package guidance and source are inspectable.
Runtime workspaces that import Effect must still declare their own explicit
runtime dependency, normally through the root Bun catalog; do not rely on
hoisting or phantom dependencies.

Before writing or reviewing Effect code:

1. read `node_modules/effect/AGENTS.md` **completely**;
2. follow the linked package-local documentation relevant to the task;
3. inspect `node_modules/effect/src` and the installed platform-package source when the guide does not settle the question;
4. use the exact installed package as the implementation source of truth;
5. do not translate Effect v3 examples mechanically.

For research fixtures created before the root workspace exists, put a private Bun package under the lane’s authorized research directory, pin the exact latest-v4 cohort, commit `package.json` and `bun.lock`, and read that fixture’s installed package guidance.

## Effect v4 implementation rules

When code is introduced:

- use the latest selected Effect v4 cohort and pin it exactly;
- keep coordinated Effect ecosystem packages on the same exact version;
- check current official v4 APIs and installed package guidance before implementation;
- prefer current guidance such as `Effect.gen`, named `Effect.fn`, Schema models and tagged errors, `Context.Service`, focused Layers, Scope, and runtime-root composition where applicable;
- use cohesive capability services, not one service per function;
- use packages only for real runtime, build, ownership, publication, or reuse boundaries;
- keep pure deterministic calculations plain when they need no capability;
- use Effect for meaningful failure, dependency, lifecycle, resource, concurrency, retry, validation, persistence, time, randomness, and observability semantics;
- prefer typed expected errors over thrown exceptions;
- use Schema at untrusted, encoded, imported, network, and persisted boundaries;
- keep browser, Bun, Cloudflare, and service-worker globals behind the smallest truthful runtime implementation boundaries;
- use scoped resources and structured concurrency only where provider semantics support the claimed behavior;
- compose Layers at runtime roots rather than constructing them per event;
- run runtimes at application entrypoints rather than scattering `runPromise` or `runFork` calls;
- keep player/session use cases testable without DOM construction;
- do not use unstable v4 modules without recording their status, reason, isolation boundary, and migration risk;
- do not use Effect as a home-grown renderer.

Avoid:

- `domain/application/ports/adapters/ui` as the preselected package ontology;
- service-per-function and package-per-service designs;
- a universal `core` dumping ground;
- one giant application service or invisible Layer;
- browser code importing Bun or Node platform implementations;
- runtime or Layer construction in every event handler;
- Promise/Effect bouncing without a real boundary reason;
- hand-written runtime type guards already provided by Effect Predicate utilities.

For browser islands, construct one long-lived `ManagedRuntime` at the site
application root and dispose it there. React providers adapt renderer-neutral
`ScreenSnapshot` state, semantic actions, and effect metadata; they do not own
durable state or construct runtimes/Layers during render.

### Durable commit-before-reveal

Normal persistent study behavior is:

```text
selection
  -> explicit commit
  -> authoritative IndexedDB transaction succeeds
  -> reveal
```

Do not reveal after an in-memory-only commit when persistence failed. Retry must be idempotent and must not create duplicate attempts or review entries.

## Bun and workspace rules

The implementation uses Bun workspaces with top-level:

```text
apps/
packages/
```

Current workspace doctrine:

- exact Bun `1.4.0` plus Node `22.22.0` for the locked specialist-tool boundary;
- private root package;
- Bun workspaces and explicit `workspace:*` dependencies;
- root Bun catalog for the exact coordinated Effect v4 cohort and other deliberately shared versions;
- isolated linker unless a measured tool incompatibility requires an exception;
- committed text `bun.lock`;
- `bun ci` or the current frozen-lockfile equivalent in CI;
- minimal reviewed `trustedDependencies`;
- explicit runtime dependencies in every consuming workspace;
- runtime-specific TypeScript configurations and types;
- filtered/dependency-aware scripts where current Bun semantics fit.

Do not introduce pnpm/npm/yarn workspace assumptions. Bun manages dependencies
and scripts; Node `22.22.0` hosts the locked Vitest/workspace boundary. Neither
runtime makes browser, service-worker, or Cloudflare workerd code server-runtime
code. Keep Vite, Wrangler, Playwright, and specialist non-TypeScript tools when
they have a justified role.

The implemented initial graph is `apps/site`, `apps/content-compiler`, and
`packages/content`; later packages must earn a real runtime, consumer,
ownership, build, reuse, or publication boundary. Do not create one package per
service, a universal `packages/core`, speculative renderer packages, or an
empty Worker app.

## GitHub publication rule for research

Future research work must use the connected `@GitHub` capability directly.

A new research task is incomplete unless it:

1. verifies an immutable GitHub base;
2. verifies the output branch does not already exist;
3. creates the branch before extended research;
4. commits and pushes a truthful initial result;
5. opens a draft PR early;
6. commits a concise result, source ledger, reproducibility inputs, and only
   uniquely necessary evidence under its authorized path;
7. pushes incrementally without force;
8. returns branch, final head SHA, commits, and PR URL;
9. stops and reports the blocker if GitHub write access is unavailable.

Do not leave the only durable copy in a chat sandbox.

## Research workflow

Before a new research pass:

1. Read the relevant authority files.
2. Read `research/README.md` and `docs/OPEN.md`; archived R2 prompts are
   historical inputs only.
3. Establish the exact immutable repository and upstream coordinates relevant
   to the new question.
4. Read installed `node_modules/effect/AGENTS.md` completely before code-level
   Effect work.
5. Identify what is reusable versus superseded.
6. Search primary/official sources first for version-sensitive technical claims.
7. Record genuine gaps rather than filling them with assumptions.
8. Keep transient raw output out of Git unless an active reproducibility or
   evidence contract needs the exact bytes.
9. Publish concise results incrementally to GitHub.

When reconciling research:

1. Diff against maintained authority.
2. Merge one evidence input at a time.
3. Preserve exact coordinates and checksums; retain source files only when an
   active consumer or reproducibility contract needs them at HEAD.
4. Delete duplicate, superseded, generated, raw-noise, and archive-only material
   after accepted conclusions are promoted.
5. Update open decisions without silently promoting unreviewed recommendations.
6. Keep research, implementation, runtime proof, and certification separate.

## Implementation status

The implementation now lives at the repository root with `apps/site`,
`apps/content-compiler`, `packages/content`, `packages/correction-intake`, and
the dormant `apps/correction-worker`. It is a verified integrated M1–M5
implementation, not evidence that the release gates have passed. The
R2.1–R2.10/R2.90 program is closed and reconciled; accepted conclusions live in
maintained product/illustration documents, blocked or incomplete gates live in
`docs/OPEN.md`, and the original corpus is archived at immutable commit
`6701e83290c56d9c5f04275a30fc6ada6bd40435`. Do not relaunch archived prompts
or implement from superseded v3 or direct-DOM-first recommendations where they
conflict with maintained constraints.

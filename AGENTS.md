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

Current direction:

- latest available Effect v4;
- Bun package management, scripts, and workspaces;
- top-level `apps/` and `packages/` monorepo shape;
- standards-first semantic HTML/CSS;
- Vite for browser tooling unless later evidence changes it;
- Cloudflare Workers Static Assets initially;
- no Next.js;
- no UI renderer selected yet.

Do not use Effect v3 as a production fallback. Older v3 research is historical, migration, or regression evidence only.

### Prompt foundation and second-pass research

Before conducting architecture research, read:

- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`;
- `prompts/research-v2/LAUNCH-CONTRACT.md`;
- `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`;
- `prompts/research-v2/LANE-INDEX.csv`;
- the applicable lane prompt under `prompts/research-v2/`;
- `research/initial-pass/` for raw evidence, supersession records, and redo requirements.

Every launch message supplies one exact immutable source SHA. Treat `{{POST_CURATION_SOURCE_SHA}}` in a lane template as that launch-time value; do not infer a moving branch head or edit the repository merely to substitute it. Stop if the launch message omits the SHA or `@GitHub` shows source drift.

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

- `research/initial-pass/` — normalized first-pass research, raw inputs, supersession records, and redo requirements.
- `research/prompt-curation/` — maintained Effect v4/Bun research doctrine and launch-readiness records.
- other `research/` directories — investigations/provenance; committing a report does not make it authoritative.
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
- Before re-researching, inspect the maintained corpus and `research/initial-pass/REDO-REQUIRED.md`.
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

## Learning and verifying Effect

The intended `SKILL.md` is the official Effect setup skill at:

```text
Effect-TS/skills
skills/effect-ts/SKILL.md
```

Apply its intent using Bun.

When the Bun workspace is scaffolded, the exact selected Effect v4 package must be available as a root development dependency so its package guidance and source are inspectable. Runtime workspaces that import Effect must still declare their own explicit runtime dependency, normally through the root Bun catalog; do not rely on hoisting or phantom dependencies.

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

The future implementation uses Bun workspaces with top-level:

```text
apps/
packages/
```

Current workspace doctrine:

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

Do not introduce pnpm/npm/yarn workspace assumptions. Bun manages dependencies and scripts; it does not make browser, service-worker, or Cloudflare workerd code Bun-runtime code. Keep Vite, Wrangler, Playwright, and specialist non-TypeScript tools when they have a justified role.

Do not freeze exact package names before the v4/Bun architecture research is reviewed. Do not create one package per service, a universal `packages/core`, framework-specific packages before renderer selection, or an empty Worker app.

## GitHub publication rule for research

Future research work must use the connected `@GitHub` capability directly.

A research task is incomplete unless it:

1. verifies an immutable GitHub base;
2. verifies the output branch does not already exist;
3. creates the branch before extended research;
4. commits and pushes an initial receipt;
5. opens a draft PR early;
6. commits exact raw reports, source ledgers, matrices, fixtures, manifests, lockfiles, and raw measurements under its authorized path;
7. pushes incrementally without force;
8. returns branch, final head SHA, commits, and PR URL;
9. stops and reports the blocker if GitHub write access is unavailable.

Do not leave the only durable copy in a chat sandbox.

## Research workflow

Before a research pass:

1. Read the relevant authority files.
2. Read `prompts/research-v2/LAUNCH-CONTRACT.md`, the prompt doctrine, shared contract, and applicable lane prompt.
3. Read the initial-pass normalization and redo ledger.
4. Establish the actual current Effect v4, Bun, Vite, and Cloudflare versions/statuses where relevant.
5. Read installed `node_modules/effect/AGENTS.md` completely before code-level Effect work.
6. Identify what is reusable versus superseded.
7. Search primary/official sources first for version-sensitive technical claims.
8. Record genuine gaps rather than filling them with assumptions.
9. Preserve raw output separately from synthesis.
10. Publish incrementally to GitHub.

When reconciling research:

1. Diff against maintained authority.
2. Merge one evidence input at a time.
3. Preserve exact source files, coordinates, and checksums.
4. Mark duplicate and superseded reports explicitly.
5. Update open decisions without silently promoting unreviewed recommendations.
6. Keep research, implementation, runtime proof, and certification separate.

## Implementation status

Application code and the Bun workspace have not yet been scaffolded. The second-pass Effect v4/Bun research foundation is finalized. R2.1 through R2.10 are independently launchable with an exact source SHA supplied by the launch message; R2.90 runs after the intended lanes are complete or explicitly missing. Do not implement from superseded v3 recommendations.

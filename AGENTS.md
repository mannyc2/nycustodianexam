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

Do not use Effect v3 as a production fallback. Older v3 research is historical evidence only.

### Illustration production — `illustration/`

`docs/TAXONOMY.md` controls which concepts and decisive distinctions are allowed.

For isolated tools:

- `illustration/TOOL_GEOMETRY_PIPELINE.md` is the current production architecture.
- `illustration/PIPELINE_SPEC.md` is recovered historical/fallback guidance.
- raw deterministic geometry evidence is preserved under `research/initial-pass/raw/tool-geometry/`.
- prototypes and POCs are not production-approved.

For hazard scenes and broader contextual illustrations, the recovered pipeline remains supporting guidance until a dedicated maintained decision supersedes it.

### Supporting evidence and recovery

- `research/initial-pass/` — normalized first-pass research, raw inputs, supersession records, and redo requirements.
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

- Preserve provenance, evidence tier, source locator, observation date, and exact file checksums.
- Distinguish official evidence, reputable research/secondary evidence, commercial description, anecdote, and inference.
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
- Pre-answer UI, accessibility data, filenames, manifests, SVG metadata, and GLB metadata must not leak the correct answer.
- Reviewed translations preserve canonical English terminology and must not imply a bilingual official exam.

## Effect v4 implementation rules

When code is introduced:

- use the latest selected Effect v4 cohort and pin it exactly;
- check current official v4 APIs before implementation rather than translating v3 examples mechanically;
- follow current v4 service, Layer, Schema, runtime, platform, testing, and reactivity patterns;
- organize code around cohesive capabilities and runtime ownership, not generic `ports/adapters` ceremony;
- keep pure deterministic domain logic plain when it needs no capability;
- use Effect for meaningful failure, dependency, lifecycle, resource, concurrency, retry, validation, persistence, and observability semantics;
- prefer typed expected errors over thrown exceptions;
- use Schema at untrusted, encoded, imported, network, and persisted boundaries;
- keep browser/build/Cloudflare/service-worker globals behind the smallest truthful runtime implementation boundaries;
- use scoped resources and structured concurrency only where provider semantics support the claimed behavior;
- run runtimes at application entrypoints rather than scattering execution calls;
- keep player/session use cases testable without DOM construction;
- do not use unstable v4 modules without explicitly recording their status, migration risk, and reason.

### Durable commit-before-reveal

Normal persistent study behavior is:

```text
selection
  -> explicit commit
  -> durable IndexedDB transaction succeeds
  -> reveal
```

Do not reveal after an in-memory-only commit when persistence failed.

## Bun and workspace rules

The future implementation uses Bun workspaces with top-level:

```text
apps/
packages/
```

- Use Bun's lockfile and workspace conventions.
- Do not introduce pnpm/npm/yarn workspace assumptions.
- Prefer Bun scripts/test/runtime capabilities where they fit, while retaining specialist tools such as Vite and Wrangler when justified.
- Do not create many ceremonial packages.
- Do not create a package per service.
- Do not create a universal `core` dumping ground.
- Do not freeze exact package names before the v4/Bun architecture research is reviewed.
- Do not add an empty Worker app before a server-side requirement exists.

## GitHub publication rule for research

Future research work must use the connected `@GitHub` capability directly.

A research task is not complete unless it:

1. verifies an immutable GitHub base;
2. creates a dedicated branch;
3. writes exact raw reports and supporting machine-readable outputs under its authorized path;
4. commits and pushes without force;
5. opens a draft PR;
6. returns branch, head SHA, commits, and PR URL;
7. stops and reports the blocker if GitHub write access is unavailable.

Do not leave the only durable copy in a chat sandbox.

## Research workflow

Before a research pass:

1. Read the relevant authority files.
2. Read the initial-pass normalization and redo ledger.
3. Establish the actual current Effect v4, Bun, Vite, and Cloudflare versions/statuses where relevant.
4. Identify what is reusable versus superseded.
5. Search primary/official sources first for technical claims.
6. Record genuine gaps rather than filling them with assumptions.
7. Preserve raw output separately from synthesis.
8. Publish incrementally to GitHub.

When reconciling research:

1. Diff against maintained authority.
2. Merge one evidence input at a time.
3. Preserve exact source files and checksums.
4. Mark duplicate and superseded reports explicitly.
5. Update open decisions without silently promoting unreviewed recommendations.
6. Keep implementation/certification separate from research evidence.

## SKILL.md constraint

The maintainer wants future prompts to follow ideas in a particular `SKILL.md`. No project-relevant `SKILL.md` was present in the repository or supplied normalization archive. Do not claim conformance until the exact intended file is supplied or identified and read.

## Implementation status

Application code and the Bun workspace have not yet been scaffolded. The first-pass research is being normalized before the improved latest-v4/Bun research program is run. Do not implement from superseded v3 recommendations.

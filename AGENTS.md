# Agent instructions

This repository is a provenance-tracked research and product corpus for a free NY civil-service Custodian exam study site.

## Read by task domain

### Exam facts and content scope — `docs/`

- `docs/FACTBASE.md` — established exam/logistics/legal facts.
- `docs/SCOPE.md` — testable content facts and source basis.
- `docs/TAXONOMY.md` — current tool/hazard taxonomy and evidence tiers.
- `docs/LANDSCAPE.md` — competitive, pedagogical, accessibility, design, and SEO evidence.
- `docs/OPEN.md` — unresolved facts, conflicts, recovery targets, and pending product/SEO decisions.

These files control exam truth and scope.

### Product behavior — `product/`

- `product/FEATURE_SPEC.md` — maintained product/UX behavior contract recovered from prior design work.
- `product/ARCHITECTURE_CONSTRAINTS.md` — later/current implementation decisions that may supersede engineering assumptions in the recovered feature spec.

Current architecture: **standards-first semantic HTML/CSS; TypeScript + Effect for nontrivial application behavior; Vite for build/development; Cloudflare Workers Static Assets for initial deployment; no Next.js; no UI framework required initially.** The first representative player vertical slice is the evidence gate for whether a small declarative UI layer is warranted for interactive application islands.

As of 2026-08-19 Effect v4 is beta. Prefer the stable release line if scaffolding begins before v4 GA; re-check the current official Effect status at dependency-lock time.

Read `research/architecture/EFFECT_VANILLA_CLOUDFLARE_2026-08-19.md` before changing these decisions.

### Illustration production — `illustration/`

`docs/TAXONOMY.md` controls which concepts and decisive distinctions are allowed.

For isolated tools:

- `illustration/TOOL_GEOMETRY_PIPELINE.md` is the current production architecture.
- `illustration/PIPELINE_SPEC.md` is recovered historical/fallback guidance. Its AI-first raster-source assumption is superseded for mechanically modeled tool assets.
- `research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md` records the immutable-base research that justified the change.
- historical QA matrices and SVGs in `illustration/examples/` are inputs/prototypes, not accepted production assets.

For hazard scenes and broader contextual illustrations, the recovered pipeline remains supporting guidance until a dedicated maintained decision supersedes it. Do not apply the tool B-rep pipeline to scenes automatically.

### Supporting evidence and recovery

- `research/` — investigations/provenance; committing a report does not make it canonical.
- `recovery/CORPUS_RECOVERY.md` — reconciliation ledger; bookkeeping, not exam truth.
- `prompts/` — instructions, never evidence.

## Conflict/precedence rule

Resolve conflicts by domain:

1. `docs/` controls exam facts and allowed scope.
2. current architecture constraints control implementation/tooling decisions.
3. product spec controls user-visible behavior when it does not contradict exam truth.
4. current illustration decisions control production mechanics for taxonomy-approved concepts.
5. supporting research/recovery artifacts are lower-precedence provenance/proposals.

Do not let an older recovered artifact roll back a later canonical reconciliation.

## Evidence rules

- Preserve provenance, evidence tier, locator, and dates.
- Distinguish official evidence, reputable secondary/research evidence, commercial description, anecdote, and inference.
- Prefer newer controlling official material over older official material; official over commercial/anecdotal material.
- Do not silently resolve contradictions. Record genuine unresolved truth claims in `docs/OPEN.md`.
- Do not turn an editorial recommendation into an exam fact.
- Unknown facts stay unknown.
- Before re-researching, search the canonical corpus and recovery ledger to avoid duplicate passes.

## Exam-security boundary

Never request, reproduce, reconstruct, summarize, paraphrase, store, or publish secure or remembered examination questions, drawings, answer choices, or keys.

Officially published sample material may be discussed only in its lawful/public context. Historical/FOIL material requires an explicit security/rights determination before any item text is ingested. Candidate recollections never define item content.

## Site-content rules

- Site is independent and unofficial.
- Practice questions and illustrations must be original or independently rights-cleared.
- Never advertise “actual questions,” leaked answers, guaranteed passing, fabricated review counts, or unsupported official-length/weight/score claims.
- Entry-level and high-level series remain separate unless evidence explicitly establishes compatibility.
- Every scored explanation ultimately exposes source lines and a rationale for every distractor.
- Pre-answer UI/accessibility data must not leak the correct answer.
- Reviewed translations preserve canonical English terminology and must not imply a bilingual official exam.

## Effect implementation rules

When application code is introduced:

- Effect owns nontrivial behavior and side-effect orchestration; view adapters render explicit state.
- Prefer typed expected errors over thrown exceptions.
- Use Schema at untrusted-data boundaries.
- Keep browser/runtime globals behind platform adapters/services.
- Use services/Layers for capabilities such as persistence, content/profile registries, networking, clocks, and offline-pack storage.
- Use structured concurrency, schedules, scopes, and retries only where their semantics are real.
- Do not wrap trivial DOM rendering in Effect merely for stylistic purity.
- Run Effects at application edges rather than scattering runtime calls through domain modules.
- A player/session use-case must be testable without constructing DOM elements.

## Tool-asset production rules

For tool visuals:

- deterministic project-owned geometry or deterministic 2D construction is the source of truth;
- standards/classification systems constrain or describe geometry but do not fill missing geometry automatically;
- supplier/community CAD is reference material unless both mechanical suitability and modification/redistribution rights pass review;
- preserve sourced, measured, and editorial parameters as distinct provenance classes;
- validate B-rep/component/units/intersections and taxonomy-specific invariants before rendering;
- use STEP AP242 as neutral CAD interchange/master derivative and static hidden-line SVG as the controlling scored/print view;
- GLB is optional, derived, user-invoked atlas content and must not auto-download;
- scored questions pin a fixed static view and do not permit pre-answer rotation;
- image generation cannot invent, repair, or style the controlling mechanically meaningful geometry;
- every asset requires independent mechanical, rights, accessibility, print, metadata-leak, and deterministic-rebuild review;
- a reproducible build does not prove mechanical correctness;
- when geometry or rights cannot be established, publish no illustration.

No POC or prototype becomes production-approved merely because it passes automated validation.

## Research workflow

Before a research pass:

1. Read the relevant authority files and `recovery/CORPUS_RECOVERY.md`.
2. Identify what is already established/integrated.
3. State cutoff date for time-sensitive findings.
4. Search primary/official sources first where the claim calls for them.
5. Record genuine gaps rather than filling them with assumptions.
6. Do not create another derivative report when an existing maintained document can be updated cleanly.

When merging research:

1. Diff against the canonical files.
2. Merge one evidence input at a time.
3. Preserve source URLs/citations and observation dates.
4. Update `docs/OPEN.md` for new factual conflicts/unresolved questions.
5. Retain useful superseded evidence with status rather than silently deleting provenance.
6. Update recovery status when a formerly missing artifact surfaces.

## Implementation status

Application code is not yet scaffolded. The Effect/Vite/Workers architecture pass has been completed. The next implementation task should begin with the representative vertical slice required by `product/ARCHITECTURE_CONSTRAINTS.md`; do not add frameworks, databases, analytics vendors, or backend services just because they are common defaults.

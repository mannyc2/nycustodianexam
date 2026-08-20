# Contributing

This project contains the provenance corpus, product contract, and illustration-production rules for a free, independent study site for New York's Entry-Level Custodians and Janitors civil-service test series.

## Know which layer you are changing

- `docs/` — exam facts, scope, taxonomy, evidence, and unresolved truth claims.
- `product/` — user-visible behavior and current architecture constraints.
- `illustration/` — production mechanics and reviewed visual prototypes for concepts admitted by the current taxonomy.
- `research/` — supporting investigations/proposals; not automatically canonical.
- `recovery/` — prior-chat/artifact reconciliation and provenance bookkeeping.
- `prompts/` — reusable instructions, not evidence.

Do not resolve a disagreement merely by editing whichever file is easiest. Follow the domain authority documented in `AGENTS.md` and the repository README.

## Before changing an exam fact

Check the canonical documents in `docs/` and preserve their evidence model. A new assertion should include:

- the source;
- source type/evidence tier;
- publication or observation date where relevant;
- the exact jurisdiction/title/administration it applies to; and
- any limitation that prevents generalizing it statewide.

Do not silently replace contradictory evidence. Resolve it only when a controlling source supports the resolution; otherwise add the conflict to `docs/OPEN.md`.

## Before changing product behavior

Read `product/FEATURE_SPEC.md`, `product/ARCHITECTURE_CONSTRAINTS.md`, and the relevant canonical fact/scope documents. Product code/specification must tolerate unresolved facts rather than inventing values.

Current implementation direction: **standards-first semantic HTML/CSS + Vite + TypeScript/Effect, initially deployed through Cloudflare Workers Static Assets.** Do not introduce Next.js or another UI framework as a default. Preserve the Effect/domain-to-view boundary so the representative vertical slice can determine whether a small declarative renderer is warranted for interactive application islands.

## Before changing Effect architecture

Read `research/architecture/EFFECT_VANILLA_CLOUDFLARE_2026-08-19.md` and re-check current official Effect/Cloudflare documentation if the change depends on version or platform status.

Expected implementation discipline:

- typed expected errors;
- Schema validation at untrusted-data boundaries;
- services/Layers for capabilities rather than scattered browser globals;
- Effect-owned orchestration for persistence/network/offline/concurrency workflows;
- plain view adapters for rendering explicit state;
- Effect runtime execution at application edges;
- no dependency on beta-only Effect APIs for core behavior unless a later reviewed architecture decision explicitly permits it.

## Before changing illustration production

Read, in order:

1. `docs/TAXONOMY.md`;
2. `illustration/README.md`;
3. `illustration/TOOL_GEOMETRY_PIPELINE.md` for isolated tools;
4. `illustration/PIPELINE_SPEC.md` for recovered/hazard/fallback guidance;
5. the relevant research file when changing a decision.

For tool assets:

- deterministic project-owned geometry or deterministic 2D construction is the source of truth;
- keep sourced, measured, and editorial parameters distinct;
- downloadable supplier/community CAD is not automatically reusable or mechanically suitable;
- a fixed static SVG/raster revision controls scored use;
- interactive GLB is optional atlas-only content and must not auto-download;
- pre-answer rotation is prohibited in scored questions;
- image generation cannot invent or restyle the controlling mechanically meaningful geometry;
- automated geometry/hash checks do not replace independent human mechanical review;
- no illustration is better than an unsupported or rights-unclear illustration.

Recovered illustration QA matrices represent older inventory snapshots and cannot override current taxonomy scope. Examples in `illustration/examples/` are prototypes unless a later production review explicitly accepts an exact asset revision.

Never use official exam/DCS sample artwork as a generation input, tracing source, or style reference.

## Exam security

Do **not** open an issue, pull request, discussion, or commit containing:

- remembered or reconstructed exam questions;
- secure test drawings or photographs;
- answer choices or answer keys from a live/secure administration;
- candidate review-session notes that reproduce test content;
- purchased or scraped "actual question" dumps.

Reports about possible secure content should identify the URL/source at a high level without reproducing the protected material.

## Useful contributions

Good contributions include:

- newer official announcements or test guides;
- corrections backed by official/public evidence;
- missing public class specifications;
- source-backed tool or safety facts;
- accessibility or reviewed translation corrections;
- evidence about a jurisdiction using the same test plan;
- original practice-content QA that does not derive from secure questions;
- implementation work that satisfies the maintained product/accessibility contracts;
- current-taxonomy geometry evidence, parameter records, deterministic models, invariant checks, rights reviews, and independent mechanical reviews.

## Editorial boundaries

The project must not imply affiliation with NYS DCS, Nassau County, a school district, or another civil-service commission. Do not add claims of official item counts, weights, score conversions, pass probability, predictable exam cadence, or form identity without controlling evidence.

## Research and recovery artifacts versus canonical state

Put substantial exploratory work in `research/` first when appropriate. A research report is evidence/proposal, not automatically project truth. Merge accepted factual findings into the relevant canonical `docs/` file after review.

Before importing a recovered prior-chat artifact, classify it in `recovery/CORPUS_RECOVERY.md`: already integrated, genuinely missing, superseded/derivative, prototype, or not located. Do not dump transcripts or create duplicate maintained truths.

For a research bundle, verify the exact recorded SHA-256 before importing files. Do not reconstruct missing evidence files from a completion summary.

## Code

Application code has not yet been scaffolded. The first implementation should follow the vertical-slice gate in `product/ARCHITECTURE_CONSTRAINTS.md`. Add concrete test/format/build commands to this file once the toolchain actually exists rather than inventing commands before the repository contains them.

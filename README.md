# NY Custodian Exam

Provenance-tracked research, product, and content-production repository for a free study site covering the New York **Entry-Level Custodians and Janitors** civil-service written-test series, with a Nassau County logistics layer and evidence-gated expansion to other same-plan jurisdictions.

The site is independent and unofficial. It does not solicit, reconstruct, buy, publish, or represent secure examination content as practice material.

## Repository map

### `docs/` — exam truth and scope authority

| File | Role |
|---|---|
| `FACTBASE.md` | Established exam, format, scoring, logistics, legal, title, and jurisdiction facts |
| `SCOPE.md` | Source-backed testable facts that constrain original study content |
| `TAXONOMY.md` | Tool, equipment, hazard, confusion-set, and evidence-tier taxonomy |
| `LANDSCAPE.md` | Competitive, learning, accessibility, design, and product evidence |
| `OPEN.md` | Unresolved truth claims, conflicts, recovery targets, and product/SEO decisions |

### `product/` — behavior and implementation constraints

- `FEATURE_SPEC.md` — normalized recovery of the full buildable product specification: page states, atlas/practice/hazards/review/simulation/print, data model, offline, accessibility, privacy, corrections, QA, and release gates.
- `ARCHITECTURE_CONSTRAINTS.md` — current implementation architecture: standards-first semantic HTML/CSS, Vite, TypeScript + Effect for nontrivial behavior, and Cloudflare Workers Static Assets. No Next.js; no UI framework required initially.

### `illustration/` — visual production

- `TOOL_GEOMETRY_PIPELINE.md` — current source-of-truth production architecture for isolated tool assets: evidence/measurements → deterministic project geometry → validation → STEP AP242 → static hidden-line SVG derivatives, with optional atlas-only GLB.
- `PIPELINE_SPEC.md` — recovered 2026-08-17 AI-assisted/visual-QA pipeline. Its AI-first source assumption is superseded for mechanically modeled tools; its hazard-scene, accessibility, rights, and QA guidance remains supporting material.
- `RECOVERED_ASSET_MANIFEST.md` — integrity record for recovered historical matrices/schema/prompts/templates.
- `examples/` — recovered historical SVG prototypes. Examples are not automatically approved production assets.

`docs/TAXONOMY.md` always controls which concepts are currently in scope and which decisive features are required. Old illustration matrices, external CAD, datasets, and prototypes cannot override it.

For scored tool questions, one exact static asset revision controls the authored view. Interactive rotation is atlas-only because another angle may expose an answer-bearing feature and alter difficulty.

No production tool illustration is currently approved.

### `research/`

Supporting investigations and provenance. Research reports do not become canonical merely because they are committed. Accepted findings are reconciled into the appropriate authority layer.

Notable current architecture/production research:

- `research/architecture/EFFECT_VANILLA_CLOUDFLARE_2026-08-19.md`;
- `research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md`.

### `recovery/`

`CORPUS_RECOVERY.md` records prior-chat/Library artifacts that were recovered, already integrated, superseded, deliberately not duplicated, not independently located, or received as research summaries with exact artifacts still pending.

### `prompts/`

Reusable research instructions. A prompt is not evidence.

## Authority rule

When documents disagree, resolve the disagreement by domain rather than filename age:

1. current `docs/` controls exam facts/scope;
2. current architecture constraints control implementation decisions;
3. product spec controls UX/product behavior;
4. current illustration decisions control production mechanics for concepts admitted by the taxonomy;
5. research/recovery artifacts supply provenance and proposals, not higher-precedence truth.

Never silently replace an unknown fact with an inference.

## Provenance and security rules

- Preserve source tier, locator, and date.
- Prefer newer controlling official evidence to older official evidence; official evidence to commercial/anecdotal material.
- Contradictions stay visible until a controlling source resolves them.
- Nothing enters scored content without source support and review.
- No secure, remembered, reconstructed, photographed, review-session, or purported “actual” exam item content.
- Practice questions and illustrations are original or independently rights-cleared.
- Downloadable supplier/community CAD is reference material unless both mechanical suitability and public modification/redistribution rights pass review.
- Deterministic rebuild hashes prove reproducibility, not mechanical correctness.
- Entry-level and high-level series remain separate unless explicit evidence says otherwise.

## Current status

The repository is still **docs/product-spec first**. Production application code has not been scaffolded.

The web architecture research is complete enough to start with a representative semantic HTML/CSS + Vite + TypeScript/Effect vertical slice deployed through Cloudflare Workers Static Assets.

The tool-production architecture is also established, but the reported CadQuery/OCCT POC bundle has not yet been imported or mechanically approved. Before publishing tool assets, import the exact bundle by recorded SHA-256, reconcile its 65-asset inventory against the then-current taxonomy, and complete independent mechanical/rights/accessibility review.

See [`AGENTS.md`](AGENTS.md) for agent rules and [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution boundaries.

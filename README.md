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
| `OPEN.md` | Unresolved truth claims, conflicts, recovery targets, and architecture/product decisions |

### `product/` — behavior and current architecture constraints

- `FEATURE_SPEC.md` — maintained buildable product specification: page states, atlas, practice, hazards, review, simulation, print, data model, offline, accessibility, privacy, corrections, QA, and release gates.
- `ARCHITECTURE_CONSTRAINTS.md` — current implementation direction and the research gates that remain before scaffolding.

### `research/initial-pass/` — normalized first parallel research batch

The first parallel Effect research pass was completed mostly outside GitHub and used mixed assumptions. It has now been recovered and normalized here.

This directory contains:

- exact raw reports and receipts where practical through the connected GitHub text-write path;
- reusable findings;
- duplicate/supersession analysis;
- v3-era recommendations quarantined from current authority;
- conflicts such as the rejected in-memory-commit-before-reveal behavior;
- the improved latest-v4/Bun redo requirements;
- raw deterministic tool-geometry research and compact evidence.

Start with:

1. `research/initial-pass/README.md`
2. `CURRENT-CONSTRAINTS.md`
3. `NORMALIZATION.md`
4. `DUPLICATION-AND-SUPERSESSION.md`
5. `REDO-REQUIRED.md`
6. `DECISION-MATRIX.csv`

### `illustration/` — visual production

- `TOOL_GEOMETRY_PIPELINE.md` — maintained source-of-truth pipeline for isolated tool assets: evidence/measurements → deterministic project geometry → validation → STEP AP242 → static hidden-line SVG, with optional atlas-only GLB.
- `PIPELINE_SPEC.md` — recovered earlier AI-assisted/visual-QA pipeline; its AI-first tool-source assumption is superseded, while hazard, accessibility, rights, and QA material remains useful.
- `RECOVERED_ASSET_MANIFEST.md` — integrity record for historical matrices/schema/prompts/templates.
- `examples/` — historical SVG prototypes, not approved assets.

`docs/TAXONOMY.md` controls which concepts are in scope and which decisive features are required. External CAD, old matrices, and prototypes cannot override it.

For scored questions, one exact static asset revision controls the authored view. Interactive rotation is atlas-only because another angle may reveal an answer-bearing feature.

No production tool illustration is approved.

### Other `research/`

Supporting investigations and provenance. A report does not become maintained authority merely because it is committed.

### `recovery/`

`CORPUS_RECOVERY.md` records prior-chat/Library artifacts that were recovered, integrated, superseded, unavailable, or pending human review.

### `prompts/`

Reusable research instructions. Prompts are not evidence.

## Current implementation direction

The improved architecture program will target:

- **latest available Effect v4**;
- **Bun** package management/tooling;
- **Bun workspaces**;
- top-level **`apps/` and `packages/`**;
- Effect-native service, Layer, Schema, runtime, platform, reactivity, and testing patterns;
- standards-first semantic HTML/CSS;
- no Next.js;
- Vite browser tooling unless stronger evidence changes it;
- Cloudflare Workers Static Assets initially;
- no UI renderer selected until current-v4 research and a representative player spike.

Effect v3 recommendations in the initial raw reports are historical only and must not be implemented as fallback architecture.

The exact workspace/package graph remains open. It should be small and capability-oriented, not a generic `domain/application/ports/adapters/ui` tree or one package per service.

### Durable answer commitment

Normal persistent study mode follows:

```text
select
  -> explicit commit
  -> durable IndexedDB transaction succeeds
  -> reveal correctness and explanation
```

An in-memory-only commit does not authorize reveal after persistence failure.

## Authority rule

When documents disagree:

1. current `docs/` controls exam facts/scope;
2. `product/ARCHITECTURE_CONSTRAINTS.md` controls current implementation constraints;
3. `product/FEATURE_SPEC.md` controls UX/product behavior;
4. current illustration decisions control production mechanics;
5. research/recovery artifacts provide evidence/history and may be marked superseded.

Never replace an unknown fact with an inference.

## Provenance and security rules

- Preserve source tier, locator, date, and exact artifact checksum.
- Prefer newer controlling official evidence to older official evidence; official evidence to commercial/anecdotal material.
- Keep contradictions visible until resolved.
- Nothing enters scored content without source support and review.
- No secure, remembered, reconstructed, photographed, review-session, or purported “actual” exam item content.
- Practice content and illustrations are original or independently rights-cleared.
- Downloadable supplier/community CAD is reference material unless mechanical suitability and redistribution/modification rights both pass review.
- Matching build hashes establish reproducibility, not mechanical correctness.
- Entry-level and high-level series remain separate unless explicit evidence says otherwise.

## Research publication rule

Future parallel research must use the connected `@GitHub` capability to create a dedicated branch, commit/push exact outputs, and open a draft PR. Sandbox-only completion is not sufficient.

## Current status

The repository remains docs/product-spec first. No Bun workspace or application code has been scaffolded.

The first-pass outputs are now being normalized for maintainer review. The next step after review is a better parallel research program constrained to latest Effect v4, Bun workspaces, `apps/`/`packages/`, Effect-native patterns, and mandatory GitHub publication.

The maintainer also requested alignment with a specific `SKILL.md`; that exact file is not currently present and must be supplied or identified before the next prompts claim to follow it.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

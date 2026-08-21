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
- `ARCHITECTURE_CONSTRAINTS.md` — maintained latest-v4/Bun implementation direction and the research gates remaining before scaffolding.

### `research/initial-pass/` — normalized first parallel research batch

The first parallel Effect research pass was completed mostly outside GitHub and used mixed assumptions. It is preserved and normalized here.

This directory contains:

- exact raw reports and recovered evidence;
- reusable findings;
- duplicate/supersession analysis;
- v3-era recommendations quarantined from current authority;
- conflicts such as the rejected in-memory-commit-before-reveal behavior;
- latest-v4/Bun redo requirements;
- raw deterministic tool-geometry research and POC evidence.

Start with:

1. `research/initial-pass/README.md`
2. `CURRENT-CONSTRAINTS.md`
3. `NORMALIZATION.md`
4. `DUPLICATION-AND-SUPERSESSION.md`
5. `REDO-REQUIRED.md`
6. `DECISION-MATRIX.csv`

### `research/prompt-curation/` — Effect v4 and Bun research doctrine

This directory identifies and adapts the official Effect `SKILL.md`, pins the upstream coordinates inspected during curation, and defines the maintained doctrine for the second architecture pass.

Key files:

- `REPORT.md` — curation findings and resulting research program;
- `EFFECT-SKILL-ADAPTATION.md` — Bun adaptation of the official Effect setup skill;
- `EFFECT-V4-BUN-RESEARCH-DOCTRINE.md` — shared Effect-native and Bun-workspace rules;
- `SOURCE-LEDGER.md` — official Effect/Bun/project evidence coordinates;
- `DECISION-MATRIX.csv` — fixed constraints versus still-open decisions;
- `LAUNCH-READINESS.md` — finalized launch model, parallelism, and remaining research scope.

The official Effect skill’s operational rule is now explicit: after the exact v4 package is installed, agents must read `node_modules/effect/AGENTS.md` completely, follow relevant package-local docs, and inspect installed source when needed.

### `prompts/research-v2/` — second-pass parallel research program

The curated program contains:

- `LAUNCH-CONTRACT.md` — launch-time immutable-SHA semantics and minimal launch-message form;
- `00-SHARED-RESEARCH-CONTRACT.md` — common GitHub/Effect/Bun/evidence contract;
- `LANE-INDEX.csv` — lane branches, allowed paths, prior-research pointers, dependencies, and overlap ownership;
- ten independent research lanes;
- one final synthesis lane.

Every lane requires:

1. immutable source-SHA verification;
2. immediate `@GitHub` branch creation;
3. an initial receipt commit and push;
4. an early draft PR;
5. exact raw reports, source ledgers, fixtures, `package.json`, `bun.lock`, raw measurements, and checksums where applicable;
6. incremental pushes;
7. final branch/head/PR receipts;
8. stopping when GitHub writes are unavailable.

The `{{POST_CURATION_SOURCE_SHA}}` token appearing in lane templates is a **launch-time variable**, not a repository-edit requirement. Each launch message supplies the exact immutable source SHA explicitly. Researchers must verify it with `@GitHub` and stop on drift.

R2.1 through R2.10 have disjoint output paths and may run in parallel. A lane may inspect sibling PRs that already exist, but it must not wait or poll for them. R2.90 runs only after the intended architecture lanes are complete or explicitly missing and reads their PR branches directly.

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

### Other `prompts/`

Earlier reusable research instructions. Prompts are not evidence.

## Current implementation direction

The architecture program targets:

- **latest available Effect v4**;
- **Bun** package management/tooling;
- **Bun workspaces**;
- top-level **`apps/` and `packages/`**;
- Effect-native service, Layer, Schema, typed-error, Scope, concurrency, runtime, platform, reactivity, and testing patterns;
- standards-first semantic HTML/CSS;
- no Next.js;
- Vite browser tooling unless stronger evidence changes it;
- Cloudflare Workers Static Assets initially;
- no UI renderer selected until current-v4 research and a representative player spike.

Effect v3 recommendations in the initial raw reports are historical only and must not be implemented as fallback architecture.

The exact workspace/package graph remains open. It should be small and capability/runtime-oriented, not a generic `domain/application/ports/adapters/ui` tree, one package per service, or a universal `packages/core`.

### Effect learning workflow

The selected skill is the official `Effect-TS/skills` Effect setup skill. In the eventual Bun workspace:

- the exact selected v4 package is available as a root development dependency for installed guidance/source access;
- each runtime workspace still declares its own explicit runtime dependency, normally through a Bun catalog;
- before Effect code is written, `node_modules/effect/AGENTS.md` is read completely;
- linked package-local docs and installed source are used instead of stale copied examples.

### Bun workspace baseline

The second pass evaluates and later implementation is expected to use:

- private root package;
- `apps/*` and `packages/*` workspaces;
- Bun catalog for one exact coordinated Effect cohort;
- explicit `workspace:*` dependencies;
- isolated installs unless a measured incompatibility requires an exception;
- committed text `bun.lock`;
- `bun ci`/frozen installs;
- minimal reviewed lifecycle-script trust;
- runtime-specific TypeScript configuration.

Bun owns package management and scripts; it does not turn browser, service-worker, or Cloudflare workerd code into Bun-runtime code or automatically replace Vite, Wrangler, Playwright, and specialist tooling.

### Durable answer commitment

Normal persistent study mode follows:

```text
select
  -> explicit commit
  -> authoritative IndexedDB transaction succeeds
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

- Preserve source tier, locator, date, exact version/ref, and artifact checksum.
- Prefer newer controlling official evidence to older official evidence; official evidence to commercial/anecdotal material.
- Keep contradictions visible until resolved.
- Nothing enters scored content without source support and review.
- No secure, remembered, reconstructed, photographed, review-session, or purported “actual” exam item content.
- Practice content and illustrations are original or independently rights-cleared.
- Downloadable supplier/community CAD is reference material unless mechanical suitability and redistribution/modification rights both pass review.
- Matching build hashes establish reproducibility, not mechanical correctness.
- Entry-level and high-level series remain separate unless explicit evidence says otherwise.

## Current status

The repository remains docs/product-spec first. No Bun workspace or application code has been scaffolded.

The initial mixed-version research is normalized, the maintained Effect v4/Bun prompt foundation is curated, the official Effect skill is identified/adapted, and the v2 launch contract is finalized. The next action is to launch the individual R2.1–R2.10 research lanes from one explicitly supplied immutable reconciliation SHA, with every result published through GitHub from the beginning.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
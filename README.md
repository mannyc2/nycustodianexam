# NY Custodian Exam

Provenance-tracked product, content, and supporting-research repository for a
free study site covering New York's **Entry-Level Custodians and Janitors**
civil-service written-test series, with a Nassau County logistics layer and
evidence-gated expansion to other same-plan jurisdictions.

The site is independent and unofficial. It does not solicit, reconstruct, buy,
publish, or represent secure examination content as practice material.

## Repository map

| Path | Role |
|---|---|
| [`docs/`](docs/README.md) | Exam truth, scope, taxonomy, landscape evidence, and unresolved factual/implementation questions. |
| [`product/`](product/README.md) | Maintained product behavior and reconciled implementation constraints. |
| [`illustration/`](illustration/README.md) | Visual-authoring authority, supporting historical methods, and non-production prototypes. |
| [`content/`](content/README.md) | Reviewed visual inventories, briefs, exact assets, lineage, reviews, and release records. |
| [`research/`](research/README.md) | Four-file map of unique supporting evidence. Committing research does not make it authority. |
| [`prompts/research-v2/`](prompts/research-v2/README.md) | Archived records for the closed/reconciled R2.1–R2.10/R2.90 program, including blocked evidence; prompts are not authority. |
| [`recovery/`](recovery/CORPUS_RECOVERY.md) | Recovery/disposition ledger for prior durable artifacts and unavailable work. |
| [`plans/`](plans/README.md) | Dated execution plans and their recorded status. |

Deleted research reports, raw results, fixtures, receipts, and recovered
archives remain auditable at immutable pre-normalization commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435/research).

## Authority order

When documents disagree:

1. current `docs/` controls exam facts and allowed scope;
2. `product/ARCHITECTURE_CONSTRAINTS.md` controls implementation constraints;
3. `product/FEATURE_SPEC.md` controls user-visible behavior where it does not
   contradict exam truth;
4. current illustration policy and accepted release records control visual
   production; and
5. research and recovery material supplies evidence/history but does not
   silently override maintained authority.

Unknown facts remain unknown until controlling evidence resolves them.

## Current architecture direction

The closed/reconciled second-pass program established this implementation
direction; requested runtime proof that did not complete remains an explicit
implementation gate:

- one exact synchronized Effect v4 cohort and Bun workspace;
- initial `apps/site`, `apps/content-compiler`, and `packages/content` graph;
- standards-first semantic HTML/CSS and no Next.js;
- Schema plus explicit whole-corpus publication gates and manifest-last output;
- cohesive runtime-specific Effect services and one root per host;
- strict IndexedDB commit-before-reveal and staged offline-pack activation;
- native service-worker ownership of HTTP bytes, with IndexedDB owning logical
  pack and learner truth;
- a provisional lazy direct-DOM first interactive slice behind a
  renderer-neutral snapshot/command boundary;
- Vite and Cloudflare Workers Static Assets, with no Worker until an endpoint is
  authorized; and
- separate Bun, Effect, real-browser, accessibility, print, artifact, leak, and
  clean-build verification responsibilities.

Exact implementation and release gates are maintained in
[`product/ARCHITECTURE_CONSTRAINTS.md`](product/ARCHITECTURE_CONSTRAINTS.md) and
[`docs/OPEN.md`](docs/OPEN.md). Effect v3, pnpm, generic
`domain/application/ports/adapters/ui`, optimistic reveal, and a universal
runtime Layer are historical/superseded directions.

## Visual production status

[`illustration/VISUAL_AUTHORING_POLICY.md`](illustration/VISUAL_AUTHORING_POLICY.md)
selects Codex-native image generation. The exact accepted reviewed raster bytes,
not a prompt, seed, SVG, CAD model, or claimed regeneration, are the visual
source of truth.

The accepted release contains:

- 65 tool/PPE masters;
- 14 comparison layouts; and
- 18 hazard scenes.

Their inventories, exact hashes, lineage, accessibility, rights/similarity,
security, phone/print, and independent review records live under
`content/authoring/visuals/` and `content/assets/`. The four recovered
CadQuery/OCCT prototypes are closed historical evidence and retired
production-art candidates.

## Provenance and security

- Preserve evidence tier, source locator, observation date, exact version/ref,
  artifact checksum, limitations, and conflicts.
- Nothing enters scored content without source support and review.
- Practice questions, scenes, and illustrations are original or independently
  rights-cleared.
- Never ingest secure, remembered, reconstructed, photographed, review-session,
  or purported “actual” exam questions, drawings, choices, or keys.
- Public official samples may guide high-level visual style only under the
  maintained policy; they may not supply item content or a composition to copy.
- Entry-level and high-level series remain separate unless explicit evidence
  establishes compatibility.

## Current repository status

The exam/product corpus, completed architecture research synthesis, and accepted
visual releases are present. At this immutable normalization base the Bun
application workspace has not yet been scaffolded; implementation must satisfy
the maintained gates rather than resurrect deleted research instructions.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) before
making changes.

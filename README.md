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
- `ARCHITECTURE_CONSTRAINTS.md` — current implementation decisions. **No Next.js; standards-first HTML/CSS/TypeScript.** Cloudflare is preferred but exact architecture is pending a current-source research pass.

### `illustration/` — visual production

- `PIPELINE_SPEC.md` — normalized production contract for original line art and hazard scenes.
- `RECOVERED_ASSET_MANIFEST.md` — integrity record for recovered historical matrices/schema/prompts/templates.
- `examples/` — recovered SVG prototypes. Examples are not automatically approved production assets.

`docs/TAXONOMY.md` always controls which concepts are currently in scope; old illustration matrices cannot override it.

### `research/`

Supporting investigations and provenance. Research reports do not become canonical merely because they are committed. Accepted findings are reconciled into `docs/`.

### `recovery/`

`CORPUS_RECOVERY.md` records prior-chat/Library artifacts that were recovered, already integrated, superseded, deliberately not duplicated, or not independently located.

### `prompts/`

Reusable research instructions. A prompt is not evidence.

## Authority rule

When documents disagree, resolve the disagreement by domain rather than filename age:

1. current `docs/` controls exam facts/scope;
2. current architecture constraints control implementation decisions;
3. product spec controls UX/product behavior;
4. illustration spec controls production mechanics for concepts admitted by the taxonomy;
5. research/recovery artifacts supply provenance and proposals, not higher-precedence truth.

Never silently replace an unknown fact with an inference.

## Provenance and security rules

- Preserve source tier, locator, and date.
- Prefer newer controlling official evidence to older official evidence; official evidence to commercial/anecdotal material.
- Contradictions stay visible until a controlling source resolves them.
- Nothing enters scored content without source support and review.
- No secure, remembered, reconstructed, photographed, review-session, or purported “actual” exam item content.
- Practice questions and illustrations are original or independently rights-cleared.
- Entry-level and high-level series remain separate unless explicit evidence says otherwise.

## Current status

The repository is still **docs/product-spec first**. Production application code has not been scaffolded. The next architecture task is a current-primary-source research pass for a frameworkless HTML/CSS/TypeScript implementation and Cloudflare deployment, followed by machine-readable content-schema design and one end-to-end vertical slice.

See [`AGENTS.md`](AGENTS.md) for agent rules and [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution boundaries.

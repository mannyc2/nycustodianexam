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

### Maintained product contracts

- [`product/FEATURE_SPEC.md`](product/FEATURE_SPEC.md) — maintained buildable product specification: page states, atlas, practice, hazards, review, simulation, print, data model, offline, accessibility, privacy, corrections, QA, and release gates.
- [`product/ARCHITECTURE_CONSTRAINTS.md`](product/ARCHITECTURE_CONSTRAINTS.md) — maintained latest-v4/Bun/React 19
  implementation decisions and remaining implementation evidence gates.
- [`product/ROUTES.md`](product/ROUTES.md) — canonical route IDs, paths, indexability, static/island
  ownership, navigation, offline behavior, and milestones for all 21 destination
  families.
- [`product/SCREEN_STATES.md`](product/SCREEN_STATES.md) — legal route states/transitions plus recovery, focus,
  history, persistence, and offline semantics.
- [`product/COMPONENT_ARCHITECTURE.md`](product/COMPONENT_ARCHITECTURE.md) — composition-first React 19 families, providers,
  explicit variants, primitives, and page recipes.
- [`product/DESIGN_SYSTEM.md`](product/DESIGN_SYSTEM.md) — maintained tokens, responsive layout, shell, focus,
  forced-color, reduced-motion, state-presentation, and print rules.

### `illustration/` — visual production

- `VISUAL_AUTHORING_POLICY.md` — current Codex-native raster production authority.
- `TOOL_GEOMETRY_PIPELINE.md` — retired deterministic CAD/SVG route retained as
  supporting research and reference material.
- `PIPELINE_SPEC.md` — recovered earlier AI-assisted/visual-QA pipeline; its AI-first tool-source assumption is superseded, while hazard, accessibility, rights, and QA material remains useful.
- `RECOVERED_ASSET_MANIFEST.md` — integrity record for historical matrices/schema/prompts/templates.
- `examples/` — historical SVG prototypes, not approved assets.

`docs/TAXONOMY.md` controls which concepts are in scope and which decisive features are required. External CAD, old matrices, and prototypes cannot override it.

For scored questions, one exact static asset revision controls the authored view. Interactive rotation is atlas-only because another angle may reveal an answer-bearing feature.

The first visual release is approved: 65 tool/PPE masters, 14 deterministic
comparisons, and 18 hazard scenes are bound to exact review records and
checksums under `content/authoring/visuals/releases/` and `content/assets/`.

### Other `research/`

Supporting investigations and provenance. A report does not become maintained authority merely because it is committed.

### `recovery/`

`CORPUS_RECOVERY.md` records prior-chat/Library artifacts that were recovered, integrated, superseded, unavailable, or pending human review.

### Other `prompts/`

Earlier reusable research instructions. Prompts are not evidence.

## Current implementation direction

The implementation uses:

- **latest available Effect v4**;
- **Bun** package management/tooling;
- **Bun workspaces**;
- top-level **`apps/` and `packages/`**;
- Effect-native service, Layer, Schema, typed-error, Scope, concurrency, runtime, platform, reactivity, and testing patterns;
- standards-first semantic HTML/CSS;
- no Next.js;
- Vite browser tooling;
- Cloudflare Workers Static Assets initially;
- React 19 lazy interactive islands over immutable renderer-neutral snapshots
  and semantic commands;
- no SPA router, with acquisition/reference pages generated as useful semantic
  documents; and
- one long-lived browser `ManagedRuntime` at the site application root.

Effect v3 recommendations in the initial raw reports are historical only and must not be implemented as fallback architecture.

The accepted initial graph is `apps/site`, `apps/content-compiler`, and
`packages/content`. It stays capability/runtime-oriented, not a generic
`domain/application/ports/adapters/ui` tree, one package per service, or a
universal `packages/core`. A later package must earn a real second consumer,
runtime, build, ownership, or publication boundary.

### Effect learning workflow

The selected skill is the official `Effect-TS/skills` Effect setup skill. In the
Bun workspace:

- the exact selected v4 package is available as a root development dependency for installed guidance/source access;
- each runtime workspace still declares its own explicit runtime dependency, normally through a Bun catalog;
- before Effect code is written, `node_modules/effect/AGENTS.md` is read completely;
- linked package-local docs and installed source are used instead of stale copied examples.

### Bun workspace baseline

The scaffold is required to use and verify:

- exact Bun `1.4.0` and specialist-tool Node `22.22.0` runtimes;
- private root package;
- `apps/*` and `packages/*` workspaces;
- Bun catalog for one exact coordinated Effect cohort;
- explicit `workspace:*` dependencies;
- isolated installs unless a measured incompatibility requires an exception;
- committed text `bun.lock`;
- `bun ci`/frozen installs;
- minimal reviewed lifecycle-script trust;
- runtime-specific TypeScript configuration.

Bun owns package management and scripts; Node `22.22.0` hosts the locked Vitest
and workspace-orchestration boundary. Neither runtime turns browser,
service-worker, or Cloudflare workerd code into server-runtime code or replaces
Vite, Wrangler, and Playwright.

### Durable answer commitment

Normal persistent study mode follows:

```text
select
  -> explicit commit
  -> authoritative IndexedDB transaction succeeds
  -> reveal correctness and explanation
```

An in-memory-only commit does not authorize reveal after persistence failure.
Question, hazard, and review state share one private application database and
one scoped connection owner; feature persistence capabilities do not open or
version independent databases.

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
- React 19 lazy interactive islands behind a renderer-neutral
  snapshot/command boundary, with the archived direct-DOM slice retained only
  as a measurement baseline;
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

Product planning now includes a canonical route registry, legal page-state
machines, a composition-first React component architecture, and a maintained
design system. The Bun workspace, shared correction contract, dormant
correction Worker, and reviewed English launch corpus now form a controlled
integrated M1–M5 release candidate—not a production release or certification.

The Effect v4/Bun R2.1–R2.10 program plus reconciled R2.90 synthesis are closed,
their accepted conclusions are promoted, and the pre-normalization corpus is
recoverable at the immutable archive coordinate above. The compiled v2 pack
contains 65 accepted tool/PPE atlas records, 14 accepted comparison releases,
90 unique original source-backed questions, all 18 accepted hazard scenes, and
two profile layers. The Nassau route is backed by a versioned machine-readable
fact sheet covering all six maintained fact states and effective-dated history.

Advertised 45/60/90 whole-bank sets contain no hidden repeats. Every filtered
inventory is currently below 45 and therefore truthfully disables all
advertised lengths. Twelve gated/watchlist concepts remain atlas-only and
cannot appear as scored options. M4 supplies deterministic question,
visual-hazard, and nonvisual-hazard simulations plus immutable local print jobs;
M5 supplies exact pack claims and retirement, settings and portable-data flows,
review rebuild, local correction drafts, and a separately owned correction
Worker that remains dormant and unbound.

The integrated candidate passes the exact Bun `1.4.0` / Node `22.22.0`
deterministic gate: 352 unit tests, 396 visual hashes, five workspace
typechecks plus the browser harness typecheck, a 526-document/46-safe-shell-URL
production build, and exact artifact, bundle-budget, answer-leak, and retained-
asset closure. The complete two-worker browser matrix passes 172 cases across
Chromium, Firefox, and WebKit with 26 intentional project-specific skips. Local
workerd smokes pass for both Static Assets terminal routing and the dormant
correction boundary. The canonical host, Cloudflare credentials, remote
preview, production deployment, and manual certification remain open;
automated evidence does not replace the manual production matrix.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) before
making changes.

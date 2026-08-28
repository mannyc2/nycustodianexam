# Research corpus

`research/` contains concise, unique supporting evidence or unresolved
investigations that do not belong in a maintained authority. Committing a note
here does **not** make it product, exam, architecture, content, or production
authority. Accepted conclusions must live once in the applicable maintained
document, policy, content record, source, or test.

The complete pre-normalization research corpus—439 files and 3,867,870 bytes—is
the historical archive at immutable commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435/research).
Use that coordinate when auditing deleted evidence; do not recreate an
`archive/`, `legacy/`, or receipts directory at HEAD.

## What belongs here

- unique evidence that a current consumer still needs and that Git history alone
  cannot serve conveniently;
- a concise synthesis of a still-useful historical conclusion whose production
  recommendation has been superseded; or
- a genuinely unresolved investigation with provenance, scope, status, and a
  named decision owner.

Raw command output, environment dumps, temporary links, lane receipts, generated
build/install output, recovered ZIPs, abandoned fixtures, duplicate matrices,
and conclusions already maintained elsewhere do not belong here.

## Complete retained map

| Path | Status | Why retained / current authority |
|---|---|---|
| [`illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md`](illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md) | Accepted historical synthesis | Preserves the recovered bundle/inventory identity and the useful review conclusions behind the retired deterministic route. Production is controlled by [`illustration/VISUAL_AUTHORING_POLICY.md`](../illustration/VISUAL_AUTHORING_POLICY.md) and maintained visual inventory/release records. |
| [`v2/hazard-scene-production/README.md`](v2/hazard-scene-production/README.md) | Accepted historical synthesis | Preserves target/decoy closure, region, accessibility/nonvisual, version, and QA boundaries. Production is controlled by the visual policy and the accepted 18-scene release records. |
| [`v2/tool-geometry-audit/REPORT.md`](v2/tool-geometry-audit/REPORT.md) | Accepted historical evidence; byte-identical | Preserves exact POC dispositions, artifact-identity conflict, rights declaration, and stable line evidence consumed by the maintained tool pilot brief. The four POCs are retired production-art candidates. |

No unresolved research program has merged into this reduced research tree.
Plans 004 and 005 are partial work in open draft PRs
[#37](https://github.com/mannyc2/nycustodianexam/pull/37) and
[#38](https://github.com/mannyc2/nycustodianexam/pull/38), respectively; neither
draft is accepted research or product authority. The eight safe Plan 004
editable prototypes recovered from temporary storage live in the
[`recovery/` ledger](../recovery/plan-004-consumer-language-prototypes/), not
in this retained research map, because they are unpiloted working artifacts.
Current exam unknowns and implementation/release gates are recorded in
[`docs/OPEN.md`](../docs/OPEN.md).

## Deleted-family map

Every path in these families is recoverable at the immutable archive coordinate
above.

| Deleted family | Current canonical home or disposition |
|---|---|
| Root SEO strategy | [`docs/LANDSCAPE.md`](../docs/LANDSCAPE.md); accepted discovery, accessibility, and product conclusions were already integrated. |
| `initial-pass/` | [`AGENTS.md`](../AGENTS.md), [`CONTRIBUTING.md`](../CONTRIBUTING.md), current product constraints, and protected exam authorities; mixed Effect v3/pnpm/generic-layer prescriptions are superseded. |
| `prompt-curation/` | [`AGENTS.md`](../AGENTS.md), [`CONTRIBUTING.md`](../CONTRIBUTING.md), and the archived lane prompts; launch receipts and readiness state are complete history. |
| Standalone architecture report and R2.90 `architecture-synthesis/` | [`product/ARCHITECTURE_CONSTRAINTS.md`](../product/ARCHITECTURE_CONSTRAINTS.md) for accepted architecture and [`docs/OPEN.md`](../docs/OPEN.md) for remaining implementation evidence. |
| `effect-core-topology/` | Maintained Effect service/Layer/runtime-root constraints in the product architecture document. |
| `effect-ui-reactivity/` | Maintained renderer-neutral snapshot/command boundary and provisional first-slice renderer decision in the product architecture document. |
| `effect-platform-runtimes/` | Maintained separate browser, service-worker, Bun, workerd, and test runtime-root constraints; unresolved executions are in `docs/OPEN.md`. |
| `effect-indexeddb-offline/` | Maintained strict transaction, pack activation, service-worker/cache, and provider-boundary decisions; browser proof remains open in `docs/OPEN.md`. |
| `effect-browser-bundling/` | Maintained zero-Effect static-route rule; numeric production budgets await measured implementation evidence. |
| `effect-schema-compiler/` | Maintained Schema/registry/publication-gate and manifest-last compiler boundary; the current implementation gates are in `docs/OPEN.md`. |
| `bun-monorepo-discipline/` | Maintained Bun workspace, dependency, lockfile, script, and runtime-specific TypeScript constraints. |
| `testing-accessibility-observability/` | Maintained verification/privacy responsibilities; real-browser and manual release matrices remain open in `docs/OPEN.md`. |
| Deleted `hazard-scene-production/` siblings | The retained hazard synthesis plus [`product/FEATURE_SPEC.md`](../product/FEATURE_SPEC.md), visual policy, authored scene records, and release receipt. |
| Deleted `tool-geometry-audit/` siblings and recovered archives | The retained exact report, geometry synthesis, maintained taxonomy provenance, visual policy, and tool release records. |
| `question-bank/` | Protected [`docs/FACTBASE.md`](../docs/FACTBASE.md), [`docs/SCOPE.md`](../docs/SCOPE.md), [`docs/TAXONOMY.md`](../docs/TAXONOMY.md), and [`docs/OPEN.md`](../docs/OPEN.md); no secure or remembered exam content is retained. |

## Recovered inventory provenance

The deleted
`research/v2/tool-geometry-audit/recovered-input/research-bundle.zip` was
2,309,138 bytes with SHA-256
`a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`.
Its `taxonomy-inventory.csv` member was 7,058 bytes with SHA-256
`8a0eb561003f8b7fd6fd164680fdcda2d891118a2ad591ccf0aa1a6fa22560e2`.

The maintained
[`content/authoring/visuals/inventory/taxonomy-inventory.provenance.json`](../content/authoring/visuals/inventory/taxonomy-inventory.provenance.json)
records those coordinates, the internal member path, the 2026-08-20 observation
date, CRLF-to-LF normalization, and the resulting 65-row inventory hash
`d61197c0b7ed118fb0248cdd94d2be75a6e71120408577a532e85aa0659231cd`.
Current inventory records point to that maintained provenance artifact rather
than depending on the historical ZIP at HEAD.

## Future research rule

Start from current maintained authority, state the exact immutable source
coordinate, distinguish evidence from recommendation, and name the consumer and
decision owner. When a conclusion is accepted, promote it concisely to one
canonical home and remove superseded working material rather than accumulating
another receipt or raw-results tree.

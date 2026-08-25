# Chat corpus recovery and reconciliation ledger

**Initial recovery date:** 2026-08-19
**Updated:** 2026-08-24
**Purpose:** distinguish maintained authority, durable recovered artifacts,
historical evidence, superseded recommendations, and work that was never
located.

The complete research tree before normalization is recoverable at immutable
commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435/research).
The reduced current evidence map is [`research/README.md`](../research/README.md).

## Status vocabulary

- **CANONICAL-INTEGRATED** — accepted conclusion lives in maintained authority;
  do not merge it again from history.
- **RECOVERED-DURABLE** — substantive prior work is represented in its proper
  maintained domain.
- **HISTORICAL-AT-SHA** — exact evidence is intentionally absent at HEAD and
  recoverable from the immutable archive coordinate.
- **RETAINED-HISTORICAL** — a concise unique synthesis or exact report remains
  under `research/` but is not current authority.
- **SUPERSEDED** — a later maintained decision controls.
- **NOT LOCATED** — known prior work has no durable recovered artifact; do not
  reconstruct it from a summary.

## Product and website corpus

| Prior work | Status | Current disposition |
|---|---|---|
| Buildable study-site feature specification, 2026-08-17 | **RECOVERED-DURABLE** | [`product/FEATURE_SPEC.md`](../product/FEATURE_SPEC.md) is the maintained normalized behavior contract. |
| Page/state/information architecture | **CANONICAL-INTEGRATED** | Product feature specification. |
| Question-player commit/reveal behavior | **CANONICAL-INTEGRATED** | Product specification and architecture constraints require durable IndexedDB commit before reveal. |
| Hazard-scene behavior | **CANONICAL-INTEGRATED** | Product specification plus maintained scene content/release records. |
| Offline/PWA/local-first behavior | **CANONICAL-INTEGRATED** | Product specification and architecture constraints. |
| Accessibility and print behavior | **CANONICAL-INTEGRATED** | Product specification; implementation/release evidence remains tracked in [`docs/OPEN.md`](../docs/OPEN.md). |
| Standalone print-system deliverable | **NOT LOCATED** | No fabricated replacement. The feature specification is the only durable print contract recovered. |

## Effect/Bun research reconciliation

The supplied first-pass archive was:

```text
8f7353c8-08fd-4677-bfeb-69a595dd0638.zip
SHA-256: 40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5
```

It contained nine mixed-version Effect reports and deterministic geometry
evidence. Duplicate UI/core reports, Effect v3 and pnpm prescriptions, generic
ports/adapters structure, and in-memory reveal were superseded. Generally useful
typed-failure, runtime-boundary, renderer-neutral state, explicit validation,
transaction, and offline-lifecycle findings were retested by the R2 program.

The R2.1–R2.10/R2.90 program is closed and reconciled. Accepted conclusions now
live once in
[`product/ARCHITECTURE_CONSTRAINTS.md`](../product/ARCHITECTURE_CONSTRAINTS.md);
blocked or incomplete execution evidence remains in `docs/OPEN.md`. Their reports,
matrices, fixtures, raw results, receipts, and generated outputs are
**HISTORICAL-AT-SHA**, not live launch dependencies. The prompt suite under
`prompts/research-v2/` is an archived instruction record and must not be
relaunched unchanged.

Current controlling architecture includes latest Effect v4, Bun workspaces,
the initial `apps/site` + `apps/content-compiler` + `packages/content` graph,
host-specific runtime roots, Schema plus explicit publication gates, strict
commit-before-reveal, staged pack activation, native service-worker response
caching, a provisional direct-DOM first slice, Vite, and Cloudflare Static
Assets.

## Deterministic tool geometry

| Artifact/work | Status | Current disposition |
|---|---|---|
| Initial deterministic report and recovered evidence tree | **HISTORICAL-AT-SHA** | Exact pre-cleanup bytes remain at the immutable archive coordinate. |
| Taxonomy inventory member | **CANONICAL-INTEGRATED** | Maintained provenance is [`content/authoring/visuals/inventory/taxonomy-inventory.provenance.json`](../content/authoring/visuals/inventory/taxonomy-inventory.provenance.json). |
| Four CadQuery/OCCT POCs | **RETAINED-HISTORICAL / SUPERSEDED FOR PRODUCTION** | Exact final audit is [`research/v2/tool-geometry-audit/REPORT.md`](../research/v2/tool-geometry-audit/REPORT.md); adjustable/pipe wrench reproduce and are reviewable, cup/flange plunger require model/view rework, and all four are retired production-art candidates. |
| Deterministic-first production recommendation | **SUPERSEDED** | [`illustration/VISUAL_AUTHORING_POLICY.md`](../illustration/VISUAL_AUTHORING_POLICY.md) selects Codex-native raster generation. |

Recovered nested bundle:

```text
research-bundle.zip
bytes: 2,309,138
SHA-256: a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06
```

Its `taxonomy-inventory.csv` member was 7,058 bytes with SHA-256
`8a0eb561003f8b7fd6fd164680fdcda2d891118a2ad591ccf0aa1a6fa22560e2`.
The maintained 65-row LF-normalized inventory is 6,992 bytes with SHA-256
`d61197c0b7ed118fb0248cdd94d2be75a6e71120408577a532e85aa0659231cd`.
The provenance record preserves the archive/member paths, hashes,
normalization, row count, and 2026-08-20 observation date, so the ZIP is no
longer a live dependency.

POC evidence archive SHA-256:

```text
725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d
```

Reproducibility is not mechanical certification. Matching builds did not make
editorial geometry authoritative or grant production approval.

## Illustration and hazard production

| Prior work | Status | Current disposition |
|---|---|---|
| 2026-08-17 illustration pipeline | **RECOVERED-DURABLE / PARTLY SUPERSEDED** | [`illustration/PIPELINE_SPEC.md`](../illustration/PIPELINE_SPEC.md) retains applicable QA/accessibility/rights guidance; current policy controls conflicts. |
| Historical tool/hazard matrices and SVG examples | **RECOVERED-DURABLE / HISTORICAL** | Integrity remains in `illustration/`; examples are not production assets or current inventory. |
| R2.9 hazard production research | **RETAINED-HISTORICAL / PARTLY SUPERSEDED** | [`research/v2/hazard-scene-production/README.md`](../research/v2/hazard-scene-production/README.md) retains semantic/region/accessibility/version conclusions; its old authoring route is retired. |
| Accepted visual corpus | **CANONICAL-INTEGRATED** | 65 tool/PPE masters, 14 comparisons, and 18 scenes are controlled by maintained inventories, exact assets, review records, manifests, and release receipts. |

## Other research

| Prior work | Status | Current disposition |
|---|---|---|
| Nassau question-bank research | **CANONICAL-INTEGRATED** | Accepted facts are in `docs/FACTBASE.md`, `docs/SCOPE.md`, `docs/TAXONOMY.md`, and `docs/OPEN.md`; no secure item content is retained. |
| Records/FOIL passes | **CANONICAL-INTEGRATED** | Maintained fact/scope/open documents; historical reports are not duplicated. |
| SEO v2 | **CANONICAL-INTEGRATED** | [`docs/LANDSCAPE.md`](../docs/LANDSCAPE.md). |
| SEO v1 / LANDSCAPE derivative | **SUPERSEDED** | Historical only. |

## Exact materialized/recovered checksums

- `CUSTODIAN_STUDY_SITE_FEATURE_SPEC_V1.md` — `1d94e4e5155ae3adf768493bf31755042709ac46f3cde356bf799ca1e39a3368`
- `ILLUSTRATION_PIPELINE_SPEC.md` — `30a81fafc77b58fab34c7c0290b06573a524e8a0d4dfbad782858cc929815502`
- historical tool QA matrix — `d4c9fcb0e740cb4f7f860c36184cf23be422a969838d9b945aa65d68b278fe5d`
- historical hazard QA matrix — `6bc68e1eef6316f9a803642d79eaf14fc25e57017dd71a72e8b0d0b596b6204a`
- historical illustration schema — `dc271b7e334499229a84f5568fae1476ff5b2576155d2acce4db9b0e6953b594`
- historical prompt templates — `95545fc892ffdbd5169a0fc74c22f611b311c8bf15e387ae486484824b07ff31`
- historical review log — `70760c20af9caf2a31516d08f5c5c7a5e0c2f6202aef5c9f9392816618008233`
- historical cost assumptions — `e7a192cce464b6758c62b58ea5e7d41f403d121de8f92a5fe583cafd20633df6`
- Nassau question-bank report — `a2fc4f9704e1530c0e2f93a4e616e01b2fb9a148bffdf21152d37daa734758f4`
- supplied first-pass archive — `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5`

## Reconciliation rules

1. Maintained authority outranks recovery and research history.
2. Exact historical evidence is recoverable at an immutable Git coordinate; it
   need not remain duplicated at HEAD.
3. Preserve coordinates, checksums, material limitations, and conflicts.
4. Reproducibility is not certification, and a license is not mechanical truth.
5. Unknown exam facts remain unknown.
6. No secure, recalled, or reconstructed item content is imported.
7. Promote accepted conclusions once, then remove duplicate, superseded,
   generated, raw-noise, and archive-only working material.

The only known recovery artifact still not located is the standalone print
system deliverable. Do not reconstruct it from chat recollection; the maintained
feature specification remains the durable print contract.

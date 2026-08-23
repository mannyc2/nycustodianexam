# Chat corpus recovery and reconciliation ledger

**Initial recovery date:** 2026-08-19  
**Updated:** 2026-08-21  
**Current source branch:** `agent/chat-corpus-reconciliation`  
**Purpose:** distinguish maintained authority, exact recovered artifacts, normalized research, superseded recommendations, prototypes, and unavailable work.

## Status vocabulary

- **CANONICAL-INTEGRATED** — accepted findings already live in maintained authority; do not merge again.
- **RECOVERED-DURABLE** — substantive prior work was absent and is now represented in its proper domain.
- **RECOVERED-RAW** — exact user-visible research/file bytes are preserved or byte-reconstructible from committed parts with checksums.
- **RECOVERED-PROTOTYPE** — concrete prototype restored, but not production-approved.
- **NORMALIZED-FIRST-PASS** — raw first-pass research has been deduplicated and classified into reusable, superseded, contradictory, and redo-required findings.
- **DERIVATIVE / SUPERSEDED** — artifact remains useful history but is not current authority.
- **NOT LOCATED** — known prior work without a durable recovered artifact.
- **CURRENT CONSTRAINT** — later maintainer decision superseding an older recommendation.
- **HUMAN-REVIEW-REQUIRED** — reproducibility or automated validation exists, but release approval does not.

## Product and website corpus

| Prior work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Buildable study-site feature specification, 2026-08-17 | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Original 3,427-line specification normalized into one maintained behavior contract. |
| Page/state/information architecture | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Exam selector/profile, atlas, procedures, repair, practice, hazards, review, simulation, print, FAQ, sources, settings, offline, and errors. |
| Question-player contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Explicit commit boundary, no pre-reveal leakage, atomic persistence, rationales, sources, directional confusion tracking, keyboard/touch behavior. |
| Hazard-scene contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Mark-before-reveal, hit/miss/false-positive/decoy categories, zoned reveal, nonvisual equivalent, review scheduling. |
| Offline/PWA/local-first design | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Explicit versioned packs, local progress, update activation, pinned sessions, storage failure rules. |
| Accessibility contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | WCAG 2.2 target, neutral/full descriptions, nonvisual equivalents, focus/zoom/touch/timer/print QA. |
| Print behavior in feature spec | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Deterministic low-ink sets, answer sheets, separate keys, tool/hazard/text-equivalent products. |
| Standalone print-system deliverable | **NOT LOCATED** | no fabricated replacement | Dedicated chat is known, but no standalone exact file has been recovered. |

## Initial Effect research pass

The first parallel Effect pass was supplied on 2026-08-21 as archive:

```text
8f7353c8-08fd-4677-bfeb-69a595dd0638.zip
SHA-256: 40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5
```

The archive contained nine Effect research outputs plus the deterministic geometry evidence tree.

| Research area | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Effect UI/state report A | **NORMALIZED-FIRST-PASS / DUPLICATE FAMILY** | `research/initial-pass/` ledgers | Overlaps UI report B. Renderer-neutral state and spike criteria reusable; v3 API/file-structure recommendations require redo. |
| Effect UI/state report B | **NORMALIZED-FIRST-PASS / DUPLICATE FAMILY** | `research/initial-pass/` ledgers | Same family; neither generic ports/adapters layout nor v3 recommendation is current authority. |
| Effect core architecture report A | **NORMALIZED-FIRST-PASS / DUPLICATE FAMILY** | `research/initial-pass/` ledgers | Cohesive services, typed failures, runtime-at-edges, bounded concurrency reusable. Exact v3 architecture superseded. |
| Effect core architecture report B | **NORMALIZED-FIRST-PASS / DUPLICATE FAMILY** | `research/initial-pass/` ledgers | Same family; used to cross-check rather than count duplicated conclusions twice. |
| Effect browser bundling | **RECOVERED-RAW / PARTLY SUPERSEDED** | `research/initial-pass/raw/effect/02-effect-browser-bundling-findings.md` | Exact report committed. Measurement method and static-page boundary reusable; Effect v3/pnpm package recommendations superseded and must be rerun with latest v4+Bun. |
| Effect v4 Schema/content registry | **RECOVERED-RAW / REUSABLE WITH REFRESH** | `research/initial-pass/raw/effect/05-effect-v4-schema-content-registry/` | Exact report preserved in concatenable parts. Structural decode + explicit relational validation is strongest reusable model; exact RC APIs/package layout need current-v4 refresh. |
| Effect Platform/browser API fit | **RECOVERED-RAW / PARTLY SUPERSEDED** | `research/initial-pass/raw/effect/06-effect-platform-browser-web-api-fit/` | Exact report preserved in parts. Selective Platform/native boundary reusable; v3 package matrix must be redone for latest v4 and Cloudflare. |
| Effect + IndexedDB/offline packs | **RECOVERED-RAW / REUSABLE WITH REFRESH** | `research/initial-pass/raw/effect/07-effect-indexeddb-offline-content-packs/` | Exact report preserved in parts. Transaction, staged activation, session pinning, cross-tab, and worker-lifecycle findings reusable; provider choice needs latest-v4 redo. |
| Effect v4/Cloudflare correction | **RECOVERED-RAW / SUPERSEDING FIRST-PASS VERSION PREMISE** | `research/initial-pass/raw/effect/09-effect-v4-cloudflare-research-correction.md` | Corrects the earlier v3-first premise. Current maintainer direction goes further: latest v4 is mandatory. |

Normalization outputs:

- `research/initial-pass/NORMALIZATION.md`;
- `REUSABLE-FINDINGS.md`;
- `DUPLICATION-AND-SUPERSESSION.md`;
- `REDO-REQUIRED.md`;
- `DECISION-MATRIX.csv`;
- `FILE-LEDGER.csv`.

### Rejected first-pass behavior

Two UI reports allowed correctness reveal after an in-memory commit when durable persistence failed.

That is rejected. Normal persistent mode requires the IndexedDB attempt transaction to complete before reveal.

### Current constraints superseding first-pass recommendations

- latest Effect v4, not v3;
- Bun and Bun workspaces;
- top-level `apps/` and `packages/`;
- Effect-native capability/service/Layer organization rather than generic ports/adapters ceremony;
- mandatory `@GitHub` branch, commit, push, and draft PR for every future research lane.

## Effect v4/Bun prompt curation

The prompt foundation has been curated and is no longer an unresolved recovery input.

| Work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Official Effect setup `SKILL.md` | **RECOVERED / CURRENT INPUT** | `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md` + source ledger | Identified as `Effect-TS/skills/skills/effect-ts/SKILL.md`; adapted to Bun while preserving its installed `effect/AGENTS.md` and source-inspection workflow. |
| Effect v4/Bun research doctrine | **CURRENT CONSTRAINT / CURATED** | `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md` | Latest-v4, Bun-workspace, Effect-native research discipline. |
| V2 lane suite | **CURATED / READY TO LAUNCH** | `prompts/research-v2/` | R2.1–R2.10 use disjoint paths and may run in parallel; R2.90 is synthesis. Launch messages supply one exact immutable source SHA. |
| Launch-time SHA contract | **CURATED / READY** | `prompts/research-v2/LAUNCH-CONTRACT.md`; `LANE-INDEX.csv` | Avoids self-referential prompt-file stamping; researchers verify the supplied SHA with `@GitHub` and stop on drift. |

## Deterministic tool geometry

| Artifact/work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Deterministic tool-geometry report | **RECOVERED-RAW** | `research/initial-pass/raw/tool-geometry/report/` | Exact 91,620-byte report preserved in five concatenable parts; SHA-256 recorded in its README. |
| Asset manifest schema | **RECOVERED-RAW** | `research/initial-pass/raw/tool-geometry/asset-manifest.schema.json` | Proposal, not maintained compiler authority. |
| Taxonomy inventory / confusion pairs / visual invariants / source ledger / summaries | **RECOVERED SOURCE ARCHIVE / GITHUB-REPRESENTED** | raw source archive + normalization ledgers | Compact evidence and checksums are represented in the recovered research corpus; no production approval follows from preservation. |
| Four CadQuery/OCCT POCs | **RECOVERED / VERIFIED / RETIRED FROM PRODUCTION** | `research/v2/tool-geometry-audit/`; maintained decision in `illustration/VISUAL_AUTHORING_POLICY.md` | Adjustable wrench and pipe wrench are reproducible/reviewable; cup and flange plungers require model/view rework. All four are closed research evidence and retired production-art candidates, so no production mechanical/accessibility approval remains pending. |
| STEP/STL/GLB/SVG/raster/WebP trees | **RECOVERED AND COMMITTED AS RESEARCH EVIDENCE** | `research/v2/tool-geometry-audit/recovered-input/research-bundle.zip` plus manifests/receipts | Exact nested bundle is committed at its recorded SHA-256. The derivatives are not production assets; Codex-native raster generation supplies replacements. |

Nested research-bundle SHA-256:

```text
a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06
```

POC evidence archive SHA-256:

```text
725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d
```

Current tool decision:

- deterministic project-owned geometry or deterministic 2D construction controls mechanically meaningful tools;
- STEP AP242 is neutral CAD interchange/master derivative;
- static hidden-line SVG controls scored/print use;
- GLB is optional atlas-only and user-invoked;
- image generation does not create or restyle controlling mechanical geometry;
- matching hashes prove reproducibility, not correctness;
- no current POC is production-approved.

## Earlier illustration work

| Prior work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| 2026-08-17 illustration pipeline | **RECOVERED-DURABLE / PARTLY SUPERSEDED** | `illustration/PIPELINE_SPEC.md` | Visual QA, accessibility, rights, failure, and hazard guidance retained; AI-first source assumption superseded for modeled tools. |
| Historical 120-row tool matrix | **RECOVERED-DURABLE / STALE INVENTORY** | integrity in `illustration/RECOVERED_ASSET_MANIFEST.md` | Cannot override current taxonomy or later 65-asset audit. |
| Historical 33-row hazard matrix | **RECOVERED-DURABLE / STALE INVENTORY** | manifest | Hazard pipeline still needs dedicated research. |
| SVG examples | **RECOVERED-PROTOTYPE** | `illustration/examples/` | Historical prototypes, not source-of-truth geometry or approved assets. |

## Other research

| Prior work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Nassau question-bank research | **CANONICAL-INTEGRATED** | `research/question-bank/RECOVERY.md` plus current docs | Accepted findings already reconciled into TAXONOMY/SCOPE/OPEN. |
| Records/FOIL passes | **CANONICAL-INTEGRATED** | FACTBASE/OPEN/SCOPE | Preserve canonical synthesis rather than duplicating reconstructed reports. |
| SEO v2 | **CANONICAL-INTEGRATED / already present** | current SEO report | Repository-aware corrected pass. |
| SEO v1 | **SUPERSEDED** | not maintained | Predates baseline-aware correction. |
| LANDSCAPE_WITH_SEO derivative | **DERIVATIVE** | not canonical | Maintained sources remain LANDSCAPE + SEO v2. |

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

## Normalization rules

1. Preserve exact raw evidence separately from maintained decisions.
2. Do not count duplicate reports as independent corroboration.
3. Later accepted constraints may supersede version/package recommendations while raw reports remain auditable.
4. Effect v3 is not a fallback.
5. Historical directory/package proposals do not become the Bun workspace architecture automatically.
6. Reproducibility is not certification.
7. Missing binary upload capability does not justify pretending binaries were committed.
8. Unknown exam facts remain unknown.
9. No secure/recalled/reconstructed item content is imported.
10. Future research must publish through GitHub as it is completed.

## Outstanding recovery/input gaps

- standalone print-system artifact;
- second-pass latest-v4/Bun research lanes R2.1–R2.10;
- human mechanical review and later production approval for tool POCs;
- dedicated hazard-scene production decision (R2.9).

The Effect `SKILL.md`, first-pass raw research, geometry evidence, and v2 prompt foundation are no longer recovery gaps.

Any future artifact should be classified here before altering maintained project state.

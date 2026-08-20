# Chat corpus recovery and reconciliation ledger

**Recovery date:** 2026-08-19; updated 2026-08-20  
**Branch:** `agent/chat-corpus-reconciliation`  
**Purpose:** recover durable Custodian-project work from prior chats and Library artifacts, normalize it into the repository, and distinguish canonical truth from product specifications, production artifacts, supporting research, derivatives, and unrecovered chat-only work.

## Status vocabulary

- **CANONICAL-INTEGRATED** — accepted findings already live in `docs/`; preserve provenance, do not merge them again.
- **RECOVERED-DURABLE** — substantive prior work was absent from GitHub and is now represented in its proper domain.
- **RECOVERED-PROTOTYPE** — useful concrete prototype restored, but not production-approved.
- **RESEARCH-INTEGRATED / ARTIFACTS-PENDING** — a supplied research result changed a maintained decision, but the exact report/evidence files have not yet been materialized and checksum-verified in this repository.
- **DERIVATIVE / SUPERSEDED** — historical artifact should not become a second maintained truth source.
- **NOT LOCATED** — prior chat work is known/recalled but no durable artifact was found in the searchable Library in this pass.
- **CURRENT CONSTRAINT** — a later maintainer decision that supersedes an older implementation assumption.

## Inventory

| Prior work | Status | Repository disposition | Reconciliation note |
|---|---|---|---|
| Buildable study-site feature specification, 2026-08-17 | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Original artifact was 3,427 lines / ~145 KB. Normalized into one maintained behavior contract; exam facts remain governed by `docs/`. |
| Page/state/information-architecture design | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Exam selector/profile, atlas, procedures, repair, practice, hazards, review, simulations, print, FAQ/sources/corrections/settings/offline/errors recovered. |
| Question-player contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Explicit commitment boundary, no pre-reveal leakage, atomic attempt save, per-distractor rationale, source lines, directional confusion tracking, keyboard/touch/image behavior. |
| Hazard-scene contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Mark-before-reveal, zero-mark support, one-to-one target matching, hit/miss/false-positive/decoy categories, zoned reveal, nonvisual equivalent, review scheduling. |
| Local spaced review/session assembly | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Append-only attempts, deterministic sessions, review reasons, directional confusion events; exact intervals remain editorial hypotheses. |
| Offline/PWA/local-first design | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Versioned explicit packs, IndexedDB-oriented progress, service-worker behavior, atomic activation, active-session version pinning, storage failure rules. |
| Accessibility contract | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | WCAG 2.2 AA target, neutral scored descriptions vs full learning descriptions, nonvisual equivalents, keyboard/focus/zoom/touch/timer/print QA. |
| Privacy/optional analytics/correction API | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | No account/third-party behavioral tracking requirement; optional first-party research only; text-only correction/security submission and tiny optional server surface. |
| Print behavior in feature spec | **RECOVERED-DURABLE** | `product/FEATURE_SPEC.md` | Deterministic low-ink sets, blank answer sheet, separate key/explanations, tool cards, hazard worksheet/key, text equivalents, fact sheets, browser print/PDF. |
| Standalone print-system deliverable discussed in chat | **NOT LOCATED** | No fabricated artifact | A prior dedicated print chat is visible in conversation history, but no standalone durable Library file was recovered. Extra chat-only details must be reconciled if/when the artifact surfaces. |
| Illustration production pipeline, 2026-08-17 | **RECOVERED-DURABLE / PARTLY SUPERSEDED** | `illustration/PIPELINE_SPEC.md` | Visual QA, accessibility, rights, failure, and hazard-scene guidance preserved. Its AI-first raster source assumption is superseded for mechanically modeled tools. |
| Deterministic tool-geometry pipeline research, supplied 2026-08-20 | **RESEARCH-INTEGRATED / ARTIFACTS-PENDING** | `research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md`; `illustration/TOOL_GEOMETRY_PIPELINE.md` | Immutable-base audit at main SHA `92efee4…`; adopts evidence/parameters → project CadQuery/OCCT B-rep → validation → STEP AP242 → static hidden-line SVG, with optional atlas GLB. Full report/POC bundle must still be imported by exact checksum. No POC is production-approved. |
| Historical tool QA matrix | **RECOVERED-DURABLE / STALE-INVENTORY** | Integrity recorded in `illustration/RECOVERED_ASSET_MANIFEST.md` | 120-row snapshot. Current immutable-base geometry audit derives 65 proposed assets; regenerate/reconcile rather than carrying the 120-row inventory forward. |
| Historical hazard cue/decoy QA matrix | **RECOVERED-DURABLE / STALE-INVENTORY** | Integrity recorded in manifest | 33-row snapshot. Reconcile before use. The tool-geometry audit does not settle the hazard-scene pipeline. |
| Illustration metadata schema/prompts/review log/cost assumptions | **RECOVERED-DURABLE / INPUTS** | Hash-recorded in manifest; rules normalized into pipeline contract | Do not freeze historical schema/tool choices without current implementation review. |
| SVG tool examples and matched confusion panels | **RECOVERED-PROTOTYPE** | `illustration/examples/` | Source SVGs are useful historical prototypes; not automatically production-approved and not the new geometry source of truth. |
| Reported 4-model CadQuery/OCCT POC (adjustable wrench, pipe wrench, cup plunger, flange plunger) | **ARTIFACTS-PENDING / NOT APPROVED** | Referenced only in tool-pipeline research | Reported 79-file deterministic rebuild with matching hashes. Full bytes, source ledger, parameter records, and human mechanical review are not yet present; do not recreate or approve from summary. |
| Nassau question-bank content research, 2026-08-17 | **CANONICAL-INTEGRATED** | `research/question-bank/RECOVERY.md` | Accepted deltas already appear in current TAXONOMY/SCOPE/OPEN: O*NET additions, pipe/tubing reamer naming, Series 14109, welding boundary, winter-operation facts, etc. Do not merge again by keyword. |
| Records-recovery / FOIL passes | **CANONICAL-INTEGRATED** | Existing FACTBASE/OPEN/SCOPE | Library searches did not surface a separate durable report with new truth beyond the canonical compilation. Preserve canonical synthesis rather than reconstructing a duplicate from snippets. |
| SEO research v2, 2026-08-18 | **CANONICAL-INTEGRATED / already present** | existing `research/SEO_STRATEGY_2026-08-18.md` | Baseline-aware redo; includes January 2026 Practice Problem structured-data removal correction. |
| SEO v1 | **SUPERSEDED** | not added | Predates repository-baseline reconciliation and contains at least one stale schema recommendation fixed by v2. |
| `LANDSCAPE_WITH_SEO_2026-08-18.md` | **DERIVATIVE** | not added as canonical | Generated merged view; `docs/LANDSCAPE.md` plus SEO v2 remain the maintained sources. |
| No Next.js; HTML/CSS/TypeScript | **CURRENT CONSTRAINT** | `product/ARCHITECTURE_CONSTRAINTS.md` | Framework question is partially resolved. |
| Effect + Vite + Workers Static Assets architecture research | **RESEARCH-INTEGRATED** | `research/architecture/EFFECT_VANILLA_CLOUDFLARE_2026-08-19.md`; `product/ARCHITECTURE_CONSTRAINTS.md` | Effect owns nontrivial application behavior; standards-first static/progressive UI remains initial rendering choice. |

## Exact recovered/reported artifact integrity

### Materialized recovered files

- `CUSTODIAN_STUDY_SITE_FEATURE_SPEC_V1.md` — SHA-256 `1d94e4e5155ae3adf768493bf31755042709ac46f3cde356bf799ca1e39a3368`
- `ILLUSTRATION_PIPELINE_SPEC.md` — `30a81fafc77b58fab34c7c0290b06573a524e8a0d4dfbad782858cc929815502`
- `tool-qa-matrix.csv` — `d4c9fcb0e740cb4f7f860c36184cf23be422a969838d9b945aa65d68b278fe5d`
- `hazard-cue-qa-matrix.csv` — `6bc68e1eef6316f9a803642d79eaf14fc25e57017dd71a72e8b0d0b596b6204a`
- `illustration-asset-metadata.schema.json` — `dc271b7e334499229a84f5568fae1476ff5b2576155d2acce4db9b0e6953b594`
- `prompt-templates.md` — `95545fc892ffdbd5169a0fc74c22f611b311c8bf15e387ae486484824b07ff31`
- `asset-review-log-template.csv` — `70760c20af9caf2a31516d08f5c5c7a5e0c2f6202aef5c9f9392816618008233`
- `cost-model-assumptions.csv` — `e7a192cce464b6758c62b58ea5e7d41f403d121de8f92a5fe583cafd20633df6`
- `nassau_custodian_question_bank_research_2026-08-17.md` — `a2fc4f9704e1530c0e2f93a4e616e01b2fb9a148bffdf21152d37daa734758f4`

### Reported but not yet materialized

- deterministic tool-pipeline `research-bundle.zip` — SHA-256 `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`

Do not claim the reported bundle has been verified until the exact bytes are available and independently hashed.

## Normalization rules applied

1. **No transcript dumps.** Only durable contracts, prototypes, research provenance, current decisions, and a recovery ledger belong in the repository.
2. **Domain authority is explicit.** Exam facts stay in `docs/`; product behavior in `product/`; illustration production in `illustration/`; investigations in `research/`; recovery bookkeeping here.
3. **Later canonical reconciliation wins.** A recovered report cannot roll back a later FACTBASE/SCOPE/TAXONOMY/OPEN decision.
4. **Later same-domain production research may supersede an older production assumption.** The deterministic tool pipeline supersedes AI-first source generation for mechanically modeled tools while retaining useful historical QA and hazard-scene guidance.
5. **Historical inventory is not current scope.** Old QA matrices cannot delete or downgrade newer taxonomy entries.
6. **Unknowns remain unknown.** Recovery does not resolve official item counts, weights, conversion, form identity, review logistics, or other open facts.
7. **Security boundary survives recovery.** No secure/recalled/reconstructed exam item content is imported.
8. **Reproducibility is not certification.** Matching hashes do not prove mechanical correctness or production approval.
9. **Missing artifact bytes are never reconstructed from summaries.** Reported bundles/POCs remain pending until checksum-verified import.

## Search limitation

This pass searched the available ChatGPT Library and live GitHub corpus with multiple product, print, illustration, offline, accessibility, records, question-bank, SEO, taxonomy, and FOIL query families. Library search exposes durable files/artifacts, not a guaranteed verbatim export of every historical chat message. Therefore **NOT LOCATED means no durable artifact was recovered in the searchable Library**, not proof that no such conversation occurred.

The 2026-08-20 tool-geometry result arrived as a completion summary with conversation-local sandbox links. Those files were not available on the current conversation surface or searchable Library at integration time. The architecture decision was reconciled from the supplied result, but exact source/POC files remain pending.

Any future recovered artifact should be entered here and classified **before** it is allowed to alter canonical project state.

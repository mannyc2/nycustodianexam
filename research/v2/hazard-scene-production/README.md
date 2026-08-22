# R2.9 — Hazard-scene production architecture

Status: **research lane complete; no production scene is approved by this lane**.

This directory is the durable output of `prompts/research-v2/09-hazard-scene-production.md`, launched from immutable source `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb` on branch `research/v2-hazard-scene-production`.

## Executive result

R2.9 recommends a **mixed deterministic-first scene pipeline**, not CAD-everywhere and not generative-everywhere:

1. project-owned modular SVG/2D composition for simple, mostly planar scene classes;
2. project-owned Blender blocking and deterministic line/static rendering where perspective, occlusion, pose, contact, or changed-scene transfer materially benefit from 3D;
3. human 2D cleanup/illustration where soft/organic forms or people would be inefficient to model, constrained by an authored semantic scene manifest;
4. text-to-image excluded from the controlling production path;
5. controlled image-to-image, if tested at all, restricted to a nonauthoritative derivative with the deterministic pre-generation render retained as fallback and strict structural rejection gates.

The production architecture is unified by one semantic scene contract, QA ontology, zone/hotspot contract, accessibility authoring model, immutable versioning scheme, and build manifest regardless of authoring route.

Bulk production remains blocked on the evidence-bearing pilot in `PILOT-PLAN.md`. The cost/throughput numbers in this directory are explicitly planning priors, not measurements or vendor quotes.

## Governing release invariants

- a controlling static, unannotated scored view;
- no target-count or answer leakage before commitment;
- human-authored target/decoy semantics and normalized regions;
- zero unresolved accidental hazards and zero unsafe decoys;
- stable zone order shared by visual feedback, nonvisual equivalents, and print keys;
- original or independently rights-cleared assets only;
- immutable scene/version identity for historic attempts;
- phone, print, offline, and WCAG 2.2 AA behavior;
- no production approval without a later evidence-bearing pilot and normal content/source/rights/accessibility review.

## Current upstream coordinates checked for this lane

- Effect v4: `effect@4.0.0-rc.111` (`rc` dist-tag; prerelease), upstream Git tag `effect@4.0.0-rc.111`.
- Bun: `1.4.0`, current stable release observed from the official Bun site at lane research time; no Bun runtime probe was required.
- Blender: `5.2.0 LTS`, released 2026-07-14; selected only as the dated current production/LTS coordinate for the proposed future 3D pilot, not installed or probed here.

No `@effect/platform-bun` package or other Effect ecosystem dependency is selected by R2.9. No package graph is changed.

## Deliverables

Shared lane artifacts:

- `START-RECEIPT.md` — launch identity and early publication receipt;
- `SOURCE-LEDGER.csv` — repository and external source coordinates;
- `REPORT.md` — substantive research synthesis;
- `DECISION-MATRIX.csv` — recommendation/adoption ledger;
- `OPEN-QUESTIONS.csv` — unresolved evidence and implementation questions;
- `FINAL-RECEIPT.md` — final GitHub publication receipt;
- `MANIFEST.sha256` — SHA-256 inventory of the finalized research artifacts, excluding the self-referential manifest and final receipt as documented there.

R2.9 specialist artifacts:

- `PIPELINE-COMPARISON.csv` — method comparison across the prompt's complete criteria set;
- `SCENE-ASSET-ARCHITECTURE.md` — modular asset, route-selection, semantic-manifest, negative-inventory, and deterministic-build architecture;
- `GENERATIVE-BOUNDARY.md` — text-to-image exclusion and optional controlled image-to-image rejection contract;
- `QA-FAILURE-CATALOG.csv` — stable `HSP-*` release-failure ontology;
- `ZONE-HOTSPOT-CONTRACT.md` — normalized zones/regions, tolerance, one-to-one matching, overlay, print, and history behavior;
- `ACCESSIBILITY-AUTHORING.md` — neutral/full descriptions, stable zone order, nonvisual equivalent, keyboard/zoom/pan, phone/print authoring;
- `VERSIONING-CONTRACT.md` — scene/view/region/accessibility/derivative change classes and historic-attempt rules;
- `PILOT-PLAN.md` — 24-candidate evidence-bearing pilot across all eight required hazard classes;
- `COST-THROUGHPUT-MODEL.csv` — explicitly inferred scenario model awaiting pilot measurements;
- `WORKSPACE-INTEGRATION.md` — Bun/Effect/content-compiler/Blender/offline/static-delivery handoff.

## Important evidence boundary

The isolated-tool CAD/B-rep lane is evidence about reproducibility and versioning, not authority for scene architecture. The recovered AI-first illustration pipeline contributes QA/accessibility history but is likewise not a default production method.

R2.9 ran no Effect, Bun, Blender, or image-model runtime probe because this specialist decision could be resolved to an evidence-bearing architecture and future pilot without code-level Effect claims or pretending that documentation research is rendering/runtime proof. Exact runtime measurements remain explicit pilot blockers.

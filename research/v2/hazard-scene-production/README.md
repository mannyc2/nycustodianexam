# R2.9 — Hazard-scene production research

**Research status:** complete.

**Maintained decision:** the original mixed deterministic-first authoring-route
recommendation is superseded by
`../../../illustration/VISUAL_AUTHORING_POLICY.md`. Codex-native image generation
is the production-art route for hazard scenes and isolated tools.

This is the maintainer-reviewed reconciliation that the earlier R2.90 draft said
was required. No further reconciliation PR is needed before the Codex visual
pilot.

## What remains authoritative/useful

R2.9 correctly separated scene meaning, visible pixels, and marker geometry.
Production retains:

- a source-backed semantic scene brief authored before generation;
- explicit target, decoy, safe-background, and negative-hazard inventories;
- one exact unannotated accepted static image per scored view;
- zero unresolved accidental hazards or unsafe decoys;
- human-authored normalized target/decoy regions after image acceptance;
- stable zone order shared by visual feedback, nonvisual equivalents, and print;
- neutral pre-answer and full post-answer descriptions;
- immutable versioning for scenes, pixels, regions, descriptions, and item refs;
- opaque delivery metadata with no pre-answer leakage; and
- phone, print, offline, rights/similarity, and accessibility review.

## What is superseded

Do not carry forward these R2.9 authoring-route conclusions:

- modular SVG as the preferred simple-scene route;
- Blender/3D blocking as the preferred geometry-critical route;
- human cleanup as the normal complex-scene route;
- exclusion of text-to-image from controlling production;
- a deterministic render as the mandatory controlling/fallback image; or
- the 24-candidate multi-route comparison as a prerequisite to generation.

Those findings remain historical research in `REPORT.md`, the original receipt,
and comparison/cost tables. They do not override maintained illustration policy.

## Current production handoff

- `GENERATIVE-BOUNDARY.md` — current Codex generation and security boundary.
- `SCENE-ASSET-ARCHITECTURE.md` — current semantic/final-pixel/region contract.
- `PILOT-PLAN.md` — current Codex-native tool-and-scene pilot.
- `DECISION-MATRIX.csv` — reconciled decisions.
- `OPEN-QUESTIONS.csv` — only unresolved implementation measurements.
- `QA-FAILURE-CATALOG.csv` — reusable release-blocking failure codes.
- `ZONE-HOTSPOT-CONTRACT.md` — reusable region/interaction rules.
- `ACCESSIBILITY-AUTHORING.md` — reusable description/equivalent rules.
- `VERSIONING-CONTRACT.md` — reusable immutable identity/change semantics.

All Tier A/B concepts remain launch scope. The pilot selects production settings
and batching; it does not cut the content inventory.

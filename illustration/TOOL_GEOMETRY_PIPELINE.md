# Retired deterministic tool-geometry route

**Status:** supporting historical/research method. It is not the production-art
pipeline.

[`VISUAL_AUTHORING_POLICY.md`](VISUAL_AUTHORING_POLICY.md) supersedes this route.
Production tool images are authored with Codex-native image generation and the
accepted reviewed raster bytes are the source of truth. No tool must be rebuilt
as CadQuery/OCCT geometry, STEP, GLB, or SVG before publication.

## What remains useful

The deterministic research established useful review discipline:

- separate sourced facts from editorial shape choices;
- describe decisive and forbidden confusable features before authoring;
- use generic rather than SKU/trade-dress-specific forms;
- inspect component count, connections, axes, contacts, clearances, and negative
  space where they determine identity;
- keep scored views fixed and versioned;
- review phone/print readability and answer leakage; and
- preserve exact accepted artifact hashes and change lineage.

These are acceptance principles, not a requirement to construct geometry.

## Optional reference use

A maintainer may create or consult project-owned deterministic 2D/3D material as
an internal structural reference for an obscure tool. It may be supplied to
Codex only when its provenance and mechanical limitations are understood. The
generated final pixels must still be independently reviewed; the reference does
not become automatic truth and is not shipped merely because it rebuilds.

Supplier/community geometry remains reference-only unless its exact reuse and
redistribution rights are established. Standards and classification systems can
support terminology and dimensions but do not automatically provide a complete
generic model or redistribution rights.

## Four recovered POCs

R2.10 recovered and reproduced the adjustable-wrench, pipe-wrench, cup-plunger,
and flange-plunger POCs. The two wrench models are reproducible and reviewable;
the two plunger models require model/view rework. All four are accepted as
historical pipeline evidence and **retired as production-art candidates**.

They are not an SVG/CAD backlog. Do not repair, mechanically approve, vectorize,
or publish them for launch. Generate original replacement artwork with Codex
under the maintained policy.

## Historical artifact roles

The following formats may remain in research archives:

- parameter/source records and project-authored CadQuery code;
- STEP for neutral B-rep interchange;
- STL or other meshes for structural inspection;
- GLB for optional internal review;
- SVG/PNG/WebP fixed-view derivatives; and
- manifests comparing repeat builds.

Their presence proves neither production correctness nor current architectural
authority. Exact rebuild evidence and final POC dispositions are preserved in
[`../research/v2/tool-geometry-audit/REPORT.md`](../research/v2/tool-geometry-audit/REPORT.md).

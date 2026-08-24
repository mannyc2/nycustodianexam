# Hazard-scene semantics and QA synthesis

**Status:** accepted historical conclusions from R2.9, consolidated 2026-08-24.
This note is supporting evidence, not product or production authority.

The original R2.9 reports, matrices, fixtures, and receipts are recoverable at
immutable pre-cleanup commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435/research/v2/hazard-scene-production).

## Current authority and released bank

[`illustration/VISUAL_AUTHORING_POLICY.md`](../../../illustration/VISUAL_AUTHORING_POLICY.md)
controls production and supersedes R2.9's mixed deterministic-first SVG/3D
authoring recommendation. The accepted 18-scene bank, exact-pixel identity,
lineage, regions, accessibility records, and review closure live in maintained
[scene briefs](../../../content/authoring/visuals/briefs/scenes/),
[release records](../../../content/authoring/visuals/releases/scenes.json), and
the [scene release receipt](../../../content/authoring/visuals/releases/SCENE-RELEASE-RECEIPT.md).

## Retained semantic contract

A scene begins with a source-backed semantic brief written before image
generation. The brief defines:

- supported hazard claim and task;
- target hazards, plausible decoys, safe-background elements, and explicit
  negative-hazard inventory;
- stable target/decoy zone order and composition constraints; and
- prohibited ambiguity, accidental hazards, unsafe decoys, answer emphasis,
  invented text/signage, and impossible meaning-bearing geometry.

The accepted final pixels control what is actually visible. Review must close
every declared target and decoy against those pixels and find zero unresolved
accidental hazards. Human-authored normalized regions bind to the accepted
image; neutral space is not silently treated as a target or decoy. A pixel
change requires affected region, description, and review closure to run again.

## Accessibility and nonvisual equivalence

Pre-answer descriptions remain neutral and do not disclose correctness.
Post-answer descriptions may explain the complete target/decoy result. The
nonvisual task uses the same scene revision, target/decoy inventory, order,
scoring intent, feedback, and review lifecycle as the visual task; it is not an
easier answer list or a separate content truth.

## Identity and QA boundaries

Scene pixels, semantic records, regions, descriptions, item references, and
review decisions are immutable, versioned coordinates. Release review covers
content meaning, accidental hazards and decoys, rights/similarity, security and
answer leakage, accessibility/nonvisual equivalence, phone readability, print,
offline delivery, and exact hashes. A batching or generation technique never
substitutes for final-pixel review.

No unresolved R2.9 research question controls the released scene bank. Future
scene revisions still require the maintained per-scene production and release
gates.

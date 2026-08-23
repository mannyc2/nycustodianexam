# Plan 002: Generate and approve the launch hazard-scene bank

## Intent

Produce a finite, site-owned launch hazard bank after Plan 001 proves the visual
production profile. Plan 002 may run alongside the remainder of Plan 001 after
its checkpoint is approved.

The repository defines eight hazard families and twelve environments but no
final scene count. The recommended launch baseline is 18 scenes: two positive
scenes per family plus two zero-hazard controls. A maintainer may replace this
only by supplying another exact count and coverage matrix.

## Status

- Priority: P1
- Effort: L
- Risk: HIGH
- Depends on: approved checkpoint in Plan 001
- Planned against: 004f405, 2026-08-23

## Controlling inputs

- docs/SCOPE.md
- docs/TAXONOMY.md
- product/FEATURE_SPEC.md
- illustration/VISUAL_AUTHORING_POLICY.md
- research/v2/hazard-scene-production
- the approved production profile from Plan 001

## Scope

In scope:

- hazard-bank inventory and source-backed semantic manifests;
- scene briefs, candidates, lineage, reviews, regions, and accessibility;
- exact native masters and deterministic web/phone/print derivatives;
- release records, receipt, and checksums;
- independent accidental-hazard review.

Out of scope:

- application player and runtime hotspot tolerance;
- taxonomy, product, or visual-policy changes;
- model-inferred safety claims;
- official sample reconstruction or secure/nonpublic exam material;
- research-corpus cleanup.

## Phase A: Define the exact bank

Create 18 stable scene records:

| Hazard family | Positive scene 1 | Positive scene 2 |
|---|---|---|
| slip/trip/fall | hallway/common area | entrance/lobby |
| egress/fire | stairwell | gym |
| chemical | custodial closet | kitchen |
| electrical | mechanical/utility area | classroom |
| sharps/broken material | restroom | exterior/grounds |
| material handling/storage | loading/service area | cafeteria |
| biological/sanitation | restroom | cafeteria |
| machine/tool safety | gym | mechanical/utility area |

Add two zero-hazard controls in distinct environments. They must contain
documented safe-but-suspicious details and zero unauthored hazards. The matrix
is an editorial launch baseline, never an official frequency or weighting.

## Phase B: Admit meaning before pixels

Before generating a scene, complete a source-backed semantic manifest with:

- exact claim and source coordinates with scope caveats;
- target, decoy, safe-background, and structural-background inventories;
- why each decoy is safe as depicted;
- negative inventory across all eight hazard families;
- stable zone order;
- required and forbidden visual cues;
- composition, visibility, phone, and print constraints;
- neutral/full descriptions and a nonvisual-equivalent plan;
- rights/provenance and separate reviewer identities.

Do not generate a scene whose chemical, electrical, food-service, PPE, or
correction meaning is merely plausible rather than admitted.

## Phase C: Generate and review

Generate one original full-canvas scene at a time using the approved Plan 001
profile. Preserve native bytes. Reject missing or ambiguous targets, unsafe
decoys, accidental hazards, invented relationships, pseudotext/signage, answer
emphasis, or content outside the manifest.

For every selected candidate, close semantic/content, accidental-hazard/decoy,
style/similarity, rights, security/leak, phone/zoom, grayscale print, and
accessibility review against the exact hash. The generator operator cannot be
the sole accidental-hazard reviewer.

If review discovers an unauthored condition, reject or revise the pixels. Never
silently expand the answer key.

## Phase D: Regions, accessibility, and release

Only after final pixel acceptance:

1. freeze the master hash and logical plane;
2. author stable ordered zones;
3. author normalized target/decoy regions;
4. validate non-overlap and one-to-one eligibility;
5. write neutral pre-answer descriptions without target counts;
6. write full post-answer target/decoy/correction/source descriptions;
7. author the nonvisual zoned equivalent;
8. create review overlays that are never shipped pre-answer.

Produce opaque deterministic derivatives without changing composition or
coordinates. Strip nonessential metadata and hash all outputs. Keep prompts,
rejects, references, and answer-bearing manifests out of learner packs.

## Verification

    jq -e 'length == 18' content/authoring/visuals/releases/scenes.json

    jq -e '[.[] | select(.kind == "positive") | .hazardFamily] | group_by(.) | all(.[]; length == 2)' content/authoring/visuals/releases/scenes.json

    jq -e '[.[] | select(.kind == "zero-hazard")] | length == 2' content/authoring/visuals/releases/scenes.json

    jq -e 'all(.[]; .generatorOperator != .accidentalHazardReviewer)' content/authoring/visuals/releases/scenes.json

    sha256sum -c content/assets/SCENE-MANIFEST.sha256

    git diff --check

## Done criteria

- The approved exact total and coverage matrix are recorded.
- Every family has two distinct positive accepted scenes.
- Two accepted zero-hazard controls exist.
- All twelve maintained environments are represented.
- Every scene has source, semantic, exact-pixel, independent, region,
  accessibility, rights, leak, phone, print, and checksum closure.
- No unsupported claim, accidental hazard, unsafe decoy, or answer cue remains.

## STOP conditions

Stop and report if:

- the maintainer rejects 18 without supplying another exact total and matrix;
- a family lacks two visually fair, source-backed claims;
- an independent accidental-hazard reviewer is unavailable;
- candidates repeatedly add hazards, unsafe decoys, ambiguous meaning, or
  pseudotext;
- region authoring exposes unresolved target ambiguity;
- accepted bytes cannot be preserved exactly;
- storage requires an unresolved repository/LFS decision;
- a verification gate fails twice after reasonable correction.

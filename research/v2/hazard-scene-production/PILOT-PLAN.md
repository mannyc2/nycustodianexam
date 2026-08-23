# Codex-native visual production pilot

**Status:** next production action. This plan replaces the unexecuted R2.9
multi-route SVG/Blender comparison.

## Objective

Determine the production settings for Codex-native artwork while deliberately
testing the concepts most likely to expose tool-shape, style, scene-inventory,
batching, phone, print, accessibility, and answer-leak failures.

The pilot chooses prompt/reference packaging, native-size handling, and safe
batch size. It does not reduce launch scope: every Tier A/B concept remains
planned for launch.

## Phase 0 — style and native-output calibration

Use the publicly released test sample artwork as the approved style reference.
Record its public provenance. Ask Codex to copy its high-level monochrome visual
language while generating original subjects and compositions.

Generate three simple, independently supported tool concepts one image at a
time. For each result record:

- native file format, width, height, color space, and bytes;
- usable object footprint and safe crop margin;
- prompt/reference/brief coordinates;
- style review findings at full, phone, and grayscale-print sizes; and
- metadata/derivative behavior.

Do not assume 1024, 1536, 2048, or any other native dimension in advance.

## Phase 1 — difficult isolated tools

Generate at least these challenge groups one image at a time:

- adjustable wrench and pipe wrench;
- cup plunger and flange plunger;
- claw hammer and ball-peen hammer;
- stepladder and extension ladder;
- low-speed rotary floor machine and high-speed burnisher;
- one subtle plier confusion pair;
- one mop or squeegee confusion pair; and
- at least two obscure Tier A/B concepts selected from the current taxonomy.

The four recovered POCs may inform what historically went wrong, but they are
not generation inputs unless a maintainer explicitly approves a project-owned
reference use. Codex generates new raster artwork.

Each pair member must pass independently before a comparison panel is composed.
Review decisive `must_show` and confusable `must_not_show` features at the
smallest intended use.

## Phase 2 — hazard-family scenes

Generate at least one original scene for every maintained hazard family:

1. slip/trip/fall;
2. egress/fire;
3. chemical;
4. electrical;
5. sharps/broken material;
6. material handling/storage;
7. biological/sanitation; and
8. machine/tool safety.

Distribute the pilots across different maintained school/custodial environments.
Each brief has one source-backed controlling claim, explicit targets/decoys,
negative-hazard inventory, zone order, and composition constraints before
generation.

Scenes fail on any missing/ambiguous target, accidental hazard, unsafe decoy,
impossible meaning-bearing relation, added signage/pseudotext, answer emphasis,
or phone/print ambiguity.

## Phase 3 — multi-image trial and tile calculation

Only after Phase 0 records the actual native Codex dimensions, calculate a trial
grid:

1. define the accepted minimum per-tool pixel rectangle from phone/print tests;
2. reserve measured outer and inter-tile crop margins;
3. compute the maximum rows/columns that fit without downscaling below that
   rectangle; and
4. test a small sheet containing simple tools plus at least one difficult pair.

Compare one-image and batched production on feature accuracy, style variance,
tile bleed, crop labor, rejection rate, and accepted asset pixels. Adopt the
largest grid only if it is no worse on technical accuracy and review labor.
Otherwise keep one-image production. Hazard scenes remain one scene per native
canvas unless a later measured test proves a real benefit.

## Review workflow

For every candidate:

1. freeze/hash before review;
2. content/mechanical-plausibility review against independent sources;
3. style and public-sample similarity review;
4. confusable-feature or target/decoy/negative-inventory review;
5. independent accidental-hazard review for scenes;
6. neutral/full accessibility authoring and leakage review;
7. phone, zoom, grayscale print/PDF review;
8. metadata and opaque-delivery scan; and
9. rights/provider/input provenance decision.

Wrong silhouettes, mechanisms, part counts, decisive features, people/poses, or
scene relationships trigger regeneration. Local raster correction is allowed
only for bounded unambiguous changes and creates a new reviewed hash.

## Metrics

Capture per asset:

- generation attempts and rejected reasons;
- time to accepted candidate;
- first-review pass;
- failure counts by stable QA code;
- native and delivery dimensions/bytes;
- phone/print recognition outcome;
- technical/style review time;
- accessibility/region authoring time;
- local edit time;
- batch crop time and usable pixels, when applicable; and
- complete lineage/review closure.

## Exit criteria

The pilot completes when:

- at least one accepted candidate covers every challenge group and hazard family;
- no accepted image has an unresolved critical QA, rights, accessibility, leak,
  phone, or print failure;
- the native-size and derivative contract is recorded;
- the safe batch decision is supported by measured results; and
- the resulting versioned prompt/reference/brief templates are ready to apply to
  the complete Tier A/B launch inventory.

Partial failure does not reopen SVG/CAD as the default. Improve the brief,
reference package, candidate selection, or review/correction workflow and rerun
the failed class.

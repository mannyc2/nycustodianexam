# Plan 001: Generate and approve the complete tool/PPE visual library

## Intent

Produce the complete isolated tool/PPE library in one plan. The known
65-concept inventory and 14 comparison records are inputs. Do not launch a new
inventory-research phase.

The first production tranche is a mandatory checkpoint, not a separate plan.
At that stopping point, report measured output and review results. Once it is
approved, continue this same plan through the remaining library.

## Status

- Priority: P1
- Effort: L
- Risk: MED
- Depends on: none
- Planned against: 004f405, 2026-08-23

## Controlling inputs

- illustration/VISUAL_AUTHORING_POLICY.md
- docs/TAXONOMY.md
- product/FEATURE_SPEC.md
- research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md
- taxonomy-inventory.csv inside
  research/v2/tool-geometry-audit/recovered-input/research-bundle.zip

The last two inputs establish 65 stable concepts after known duplicate
collapses. The maintained material also establishes 14 confusable/comparison
records. Reconcile only actual taxonomy drift; do not reopen those counts
because a production manifest does not yet exist.

## Scope

In scope:

- production inventories, briefs, candidate lineage, reviews, accessibility,
  release records, and checksums under content/authoring/visuals;
- candidate, accepted master, and deterministic derivative raster files under
  content/assets;
- all required isolated masters/variants for the 65 stable concepts;
- all 14 comparison layouts composed from accepted masters;
- the pilot checkpoint and its decision record.

Out of scope:

- hazard-scene production;
- application/compiler/workspace scaffolding;
- taxonomy or policy changes;
- CAD, SVG, Blender, or repaired R2.10 POCs as production masters;
- official-sample reconstruction;
- research-corpus cleanup.

## Phase A: Materialize the known production packet

Convert the established 65 rows into a maintained JSON inventory with stable
IDs, aliases, evidence tier, required master variants, decisive visual features,
confusable features, must-show/must-not-show rules, brief status, and production
status. Normalize the 14 comparison records to reference those stable IDs.

Author the common prompt, candidate, review, accessibility, lineage, release,
and derivative schemas. Briefs must be source-backed and must not invent
mechanical facts merely to unblock generation.

This phase records known work; it does not re-research whether the inventory is
65 or whether comparison records exist.

Verify:

    jq -e 'length == 65 and ([.[].id] | unique | length == 65)' content/authoring/visuals/inventory/tools.json

    jq -e 'length == 14' content/authoring/visuals/inventory/comparisons.json

## Phase B: Generate the checkpoint tranche

Use the image-generation skill/tool for all new rasters. Preserve native output
before resizing or editing. Generate these three simple calibration concepts:

1. Dustpan
2. Rubber mallet
3. Safety glasses

Then generate the full difficult/confusable challenge set:

- Adjustable wrench and Pipe wrench
- Cup plunger and Flange plunger
- Claw hammer and Ball-peen hammer
- Stepladder and Extension ladder
- Low-speed rotary floor machine and High-speed burnisher
- Slip-joint pliers and Tongue-and-groove pliers
- Floor squeegee and Window squeegee
- Pipe reamer
- Steam-cleaning equipment

That produces 19 independently reviewed pilot masters. Review each image for
class, silhouette, mechanism, decisive feature, feature bleed, invented parts,
brand/logo/watermark, suspicious similarity, phone legibility, grayscale print,
accessibility descriptions, answer leakage, provenance, and exact hash.

Measure native dimensions, usable object footprint, crop margins, rejection
rate, correction labor, review labor, and derivative behavior. Run a bounded
single-image-versus-grid trial only after the minimum usable pixel rectangle is
known. Single-image remains the default unless a grid is no worse on every
technical and review criterion.

## Mandatory stopping point

STOP after the checkpoint tranche. Publish a concise checkpoint receipt with:

- 19 required IDs and their accepted/rejected status;
- native dimensions and usable footprints;
- first-pass and final acceptance rates;
- rejection reasons and reviewer disagreements;
- single-image/grid recommendation;
- derivative settings;
- unresolved mechanical, style, storage, or review issues;
- exact hashes of candidates proposed as production masters.

Do not continue bulk generation until the maintainer approves the checkpoint or
explicitly delegates approval. If accepted, the 19 masters count toward the
final library; do not regenerate them for consistency alone.

Plan 002 may begin after this checkpoint is approved while the rest of this
plan continues.

## Phase C: Generate the remaining library

Compute remaining required masters by joining the maintained inventory with the
accepted checkpoint ledger. Work in reviewable tranches:

- cleaning implements;
- powered cleaning equipment;
- rigid hand tools;
- articulated hand tools;
- soft/deformable tools;
- carts and material handling;
- ladders and access equipment;
- PPE and other.

For each required master:

1. use the exact current brief and approved checkpoint profile;
2. generate a full-canvas candidate when the item is obscure, mechanical, or
   confusable;
3. record prompt/reference coordinates, exposed generator identifier, native
   properties, candidate ID, and hash;
4. review every must-show and must-not-show rule;
5. regenerate wrong class, mechanism, part count, silhouette, or decisive
   feature;
6. treat every visible correction as a new candidate and rerun affected review;
7. preserve rejected lineage without exposing rejected bytes as production.

An accepted visual can remain atlas-only when its evidence tier does not support
a scored claim. Image acceptance does not silently grant question-bank
admission.

## Phase D: Derivatives, comparisons, and release

Preserve accepted native masters unchanged. Produce opaque web/phone/print
derivatives using the approved checkpoint profile, strip nonessential metadata,
and hash every output.

Compose all 14 comparison layouts from independently accepted master hashes.
Do not ask the model to regenerate a fused comparison panel as authority. A
flattened comparison panel is a deterministic derivative with its own hash and
review.

Close the release ledger with exact concept/master totals, checkpoint masters
reused, candidate/rejection totals, variant outcomes, review closure, comparison
closure, bytes, and checksums.

## Verification

    jq -e 'length == 65 and all(.[]; .productionStatus == "accepted")' content/authoring/visuals/releases/tools.json

    jq -e 'length == 14 and all(.[]; .status == "accepted")' content/authoring/visuals/releases/comparisons.json

    sha256sum -c content/assets/TOOL-MANIFEST.sha256

    git diff --check

## Done criteria

- All 65 concepts have accepted production status.
- Every required master variant has an exact accepted raster.
- All 14 comparisons resolve only to accepted masters.
- Every accepted master has closed technical, style, similarity, accessibility,
  leak, rights, phone, print, lineage, and checksum review.
- No rejected candidate appears in a delivery manifest.
- No application, policy, taxonomy, or research path changed.

## STOP conditions

Stop and report if:

- the current taxonomy no longer reconciles to the established 65 stable
  concepts;
- a required brief depends on unsupported mechanical facts or prohibited exam
  material;
- a concept repeatedly fails its decisive-feature gate;
- accepted bytes cannot be preserved exactly;
- storage requires an unresolved repository/LFS decision;
- a comparison would require modifying an accepted member's pixels;
- a verification gate fails twice after reasonable correction.

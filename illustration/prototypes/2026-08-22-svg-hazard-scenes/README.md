# Deterministic SVG hazard-scene prototypes

Status: **draft, unreviewed, and not approved for production or scored use**.

This directory contains the first implementation attempt at project-owned Route S hazard scenes under the R2.9 architecture. It deliberately starts with four scene classes that can be represented through modular SVG composition without people or complex 3D pose work.

## What was produced

Eight 1200 x 800, 3:2 monochrome SVG candidates:

| Public asset | Pilot class | Environment | Role |
|---|---|---|---|
| `s-01` | P1 wet floor | hallway/common area | base |
| `s-02` | P1 wet floor | entrance/lobby | transfer variant |
| `s-03` | P3 damaged cord | mechanical/utility area | base |
| `s-04` | P3 damaged cord | classroom | transfer variant |
| `s-05` | P5 inaccessible fire extinguisher | hallway/common area | base |
| `s-06` | P5 inaccessible fire extinguisher | gym/common area | transfer variant |
| `s-07` | P7 exposed broken glass | classroom | base |
| `s-08` | P7 exposed broken glass | cafeteria | transfer variant |

Each candidate has:

- an opaque learner-facing SVG under `renders/learner/`;
- an answer-bearing source-review overlay under `review/annotated/`;
- a source-side semantic/accessibility/region manifest under `authoring/scenes/`;
- one target and one documented safe-but-suspicious decoy;
- three neutral ordered zones;
- an explicit negative-hazard inventory;
- source-claim coordinates pointing to the existing R2.9 source ledger;
- explicit `productionApproved: false` and `scoredUseApproved: false` states.

## Construction boundary

The images are generated only from project-authored Python geometry and text manifests. The generator consumes no official exam image, third-party illustration, photograph, school image, logo, brand asset, external URL, font, or model output.

Learner SVG filenames are opaque (`s-01.svg` through `s-08.svg`). Learner SVG bytes contain no text elements, review classes, target/decoy labels, source identifiers, or semantic answer terms. Answer-bearing overlays and semantic names remain in source-review paths.

## Reproduce

From this directory:

```bash
python3 source/generate_scenes.py
python3 -m pip install -r source/requirements-validation.txt
python3 source/validate_scenes.py
```

The generator uses the Python standard library. The validation environment used for this receipt is pinned in `source/requirements-validation.txt` and recorded in `raw-results/environment.txt`.

## Automated results

The checked corpus passes 149 of 149 automated checks recorded in `raw-results/VALIDATION.csv`, including:

- byte-identical generated SVG/JSON output after a same-environment rerun;
- well-formed and sanitized learner SVGs;
- no scripts, events, external references, embedded images, metadata, title/description/text, or review-only CSS in learner assets;
- no semantic answer terms in learner SVG bytes;
- manifest/asset identity consistency;
- normalized valid target/decoy polygons and anchors;
- target/decoy separation after the R2.9 pilot 1.5% buffer hypothesis;
- deterministic canonical, phone, and print-profile CairoSVG renders;
- grayscale-only rendered pixels.

These checks establish only mechanical consistency in the observed environment. They do not establish semantic correctness or accessibility.

## Review still required

All eight candidates still require an independent reviewer for:

- source/content admission and exact correction wording;
- accidental-hazard and decoy safety review;
- target ambiguity and visual fairness;
- phone recognizability, especially the exposed-conductor detail in `s-03` and `s-04`;
- grayscale print review using the intended PDF/print path;
- neutral/full description and nonvisual-equivalent review;
- hotspot human-marker testing and final tolerance selection;
- rights/provenance signoff;
- production and scored-use approval.

The review overlays are answer-bearing source artifacts. They must never be served in the pre-commit learner UI.

## Useful entry points

- `review/GALLERY.md` - side-by-side learner and review images;
- `REVIEW-STATUS.csv` - per-asset unresolved review state;
- `raw-results/VALIDATION.csv` - complete automated check log;
- `raw-results/RENDER-METRICS.csv` - deterministic render hashes and pixel metrics;
- `MANIFEST.sha256` - committed prototype file hashes.

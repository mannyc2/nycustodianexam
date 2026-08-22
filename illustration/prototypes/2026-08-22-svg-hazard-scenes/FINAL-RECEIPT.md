# Final receipt: deterministic SVG hazard-scene attempt

- Repository: `mannyc2/nycustodianexam`
- Base branch: `agent/chat-corpus-reconciliation`
- Immutable base SHA: `723bddb232f3c070d6c1ac6c9d10576464a222d9`
- Prototype branch: `prototype/svg-hazard-scenes-p1-p3-p5-p7`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/20`
- Start commit: `9a6b607e346945944b2ced4348fad5f5df4d006b`
- Prototype content commit: `c57236cfa3b5117cf23fb3f2b25bae277a9bfcdd`
- Observation/build date: `2026-08-22`

## Published output

- 8 original learner-facing SVG scene candidates;
- 8 answer-bearing source-review overlays;
- 8 semantic/accessibility/region manifests;
- 1 scene index and 1 review gallery;
- deterministic project-owned Python source;
- complete automated validation and render-metric ledgers.

The set covers four R2.9 pilot classes, each with a base composition and a changed-environment transfer composition:

- P1 wet floor;
- P3 damaged cord;
- P5 inaccessible fire extinguisher;
- P7 exposed broken glass.

## Validation receipt

`python3 source/validate_scenes.py` completed in the recorded environment with:

```text
checks=149 pass=149 fail=0
```

The passing checks establish same-environment deterministic regeneration, learner-SVG sanitization, answer-leak boundaries, manifest consistency, draft region validity/separation, and deterministic grayscale rendering at canonical, phone-probe, and print-probe sizes.

## Rights and input boundary

All visual geometry is project-authored. No official exam image, school image, photograph, third-party illustration, logo, brand asset, external URL, font file, or model-generated visual was used as an input.

## Non-approval boundary

This receipt does not approve any asset for production or scored use. The following remain pending for every candidate:

- independent semantic/source review;
- independent accidental-hazard and decoy review;
- accessibility and nonvisual-equivalent review;
- human phone recognizability review;
- human print/PDF review;
- rights/provenance signoff;
- human marker-placement and final hotspot-tolerance testing;
- explicit production and scored-use approval.

The damaged-cord pair, `s-03` and `s-04`, has the highest known phone-recognition risk because the exposed-conductor detail is comparatively small.

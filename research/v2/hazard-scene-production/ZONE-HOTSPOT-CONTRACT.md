# Zone and Hotspot Contract

Evidence status: **INFERRED implementation-neutral contract derived from the maintained hazard-player/product constraints. Numeric tolerance tuning requires pilot measurement.**

## Purpose

A hazard scene needs two distinct spatial systems:

1. **zones** — stable ordered regions used to describe and navigate the scene; and
2. **target/decoy regions** — precise semantic polygons used after commitment for marker classification.

Do not conflate them. A zone can contain zero, one, or multiple targets/decoys. A hotspot is not an accessibility label and must not be exposed as answer-bearing pre-submit UI.

## Logical coordinate plane

Every scene defines one immutable logical canvas with width `W` and height `H` (or an SVG `viewBox`). Persist spatial data normalized to that plane:

- `x = pixelX / W`
- `y = pixelY / H`

Coordinates are in `[0,1]`, origin top-left, x rightward, y downward. Store enough precision to round-trip authored polygons without visible drift; implementation may use fixed-point integers in the serialized form if preferred.

All web, print, and review derivatives must map back to this same logical plane. Cropping after region authoring is forbidden; a crop/composition change creates a new scored-view version and requires new regions.

## Zone model

Each scene has an ordered zone list:

```text
zoneId
order
labelNeutral
polygon | rect | logical grouping
observableFacts[]
```

Rules:

- zone IDs are stable within an immutable scene version;
- `order` defines visual-key numbering and nonvisual reading order;
- order should follow a predictable scan path appropriate to the composition, normally top-to-bottom and left-to-right within bands, unless room topology makes another path materially clearer;
- zone labels before commitment are neutral (for example, “left shelving area” rather than “chemical hazard shelf”);
- zone boundaries are broad navigation/description aids, not scoring regions;
- empty/safe zones are allowed and important so the nonvisual task does not reveal a positive target count;
- print answer annotations use the same ordered zone IDs.

## Semantic region model

Each target or authored decoy has one stable `regionId` registered to the exact final learner-facing asset.

Minimum fields:

```text
regionId
kind: target | decoy
zoneId
semanticObjectId
conditionId
polygon[]
anchorPoint
reviewState
toleranceClass
```

A polygon should trace the meaningful observable condition, not simply a large bounding box around a whole object. Examples:

- damaged cord: the damaged section plus enough local cord context to make the mark humane, not the whole room;
- blocked extinguisher: the obstruction/access relationship area, not an unrelated wall-sized box;
- ladder top-step misuse: the worker-foot/top-step relation, not every ladder pixel;
- wet floor: the relevant spill/wet-surface area, not the warning sign or entire floor;
- blocked exit: the material obstruction and affected passage area, not only the EXIT sign.

`anchorPoint` is an authored representative point used for annotation labels and diagnostics; it does not replace the polygon.

## Pre-commit behavior

The product contract controls:

- final unannotated static scene only;
- no target count;
- learner may add/remove/move neutral markers;
- zero marks is valid;
- explicit submit before correctness/reveal.

Region data may exist in an offline content pack because offline scoring requires keys, but it must not be exposed in the active accessibility tree, debug overlays, public filenames, visible SVG IDs, CSS classes, or pre-commit DOM attributes that disclose target meaning/count.

Opaque content-addressed identifiers are preferred over semantic names in served asset paths.

## Marker model

A learner marker is a point in logical coordinates plus optional user-facing marker ID/order. The UI may render a sufficiently large visible marker/control even though the stored point is singular.

The spatial scene can qualify as an intrinsically two-dimensional interaction. WCAG 2.2 still requires that the surrounding controls meet target-size rules and the product contract additionally requires an alternate, non-precision path. Therefore:

- marker-add/remove/move controls must be keyboard operable;
- pan/zoom controls must not require multi-touch;
- provide a marker list or equivalent controls for selecting/removing/repositioning markers;
- the nonvisual zoned equivalent is a separate format, not a claim that free-point visual targeting itself is identical for all users.

## Tolerance

Do **not** bake display-pixel tolerance into the semantic polygon. Preserve the authored polygon as truth and apply a player-level tolerance during matching.

R2.9 does not freeze a production tolerance number. The pilot should evaluate a starting configuration equivalent to:

- base display-space expansion: **12 CSS px at 1x scene zoom**;
- maximum normalized expansion: **1.5% of the logical short edge**;
- no expansion may create overlap between distinct target/decoy eligibility regions.

These are **pilot hypotheses**, not accessibility standards or final product values.

Tolerance must scale so zooming the scene does not make scoring arbitrarily easier/harder. Implement by converting the configured display tolerance back to logical coordinates for the current render transform, then applying the normalized cap.

If a fair target requires a very large tolerance because the visible condition is tiny, the scene fails `HSP-PHONE-FAIL`/`HSP-TGT-AMBIG`; do not fix an unreadable scene by making an invisible giant hotspot.

## Matching algorithm contract

After successful commitment only:

1. transform submitted marker points into logical scene coordinates;
2. construct each region's eligibility polygon using the configured tolerance;
3. determine candidate region(s) for each marker;
4. reject the scene at authoring/validation time if one point can be eligible for multiple semantic regions in a way that makes assignment ambiguous;
5. assign at most one marker to one authored region and at most one region to one marker;
6. unmatched target regions become `miss`;
7. unmatched markers inside an authored decoy region become `decoy_false_positive`;
8. unmatched markers elsewhere become `general_false_positive`;
9. additional markers near an already matched target may be reported as `duplicate_mark` when diagnostically useful, but must not earn additional hits.

The scorer must never infer a new hazard from an unauthored object.

### Assignment tie-breaking

A production implementation should avoid scenes where matching order matters. If numerical tolerance still creates multiple eligible marker-region pairings, use a deterministic maximum-quality one-to-one assignment (for example, minimum normalized marker-to-anchor distance among valid point-in-polygon candidates) and log the ambiguity metric. Publication should nevertheless fail if routine plausible user marks produce competing semantic assignments.

## Region separation validation

Before publication, generate expanded eligibility polygons using the maximum supported tolerance and test:

- target ↔ target intersections;
- target ↔ decoy intersections;
- decoy ↔ decoy intersections where separate decoy diagnosis matters;
- region distance in logical units;
- target visible area at canonical phone sizes.

Any overlap that lets one ordinary mark satisfy two meanings is `HSP-HOTSPOT-OVERLAP`.

The pilot should record the minimum edge-to-edge distance between semantic regions and actual reviewer marker distributions so the production tolerance can be based on observed behavior rather than guesswork.

## Post-commit overlay

After commitment, render annotations from the same region/zone data:

- target hit: marker + target annotation;
- target miss: target annotation without pretending the learner marked it;
- decoy false positive: marker linked to decoy explanation;
- general false positive: marker identified as not matching any authored unsafe condition;
- every category has text/icon/pattern support; color alone is insufficient.

Annotations should use stable zone/region numbering that maps directly to the ordered textual feedback.

The post-answer key may show a slightly simplified/expanded annotation shape for readability, but it must link back to the same semantic region ID and cannot change scoring meaning.

## Print contract

The unannotated worksheet uses the exact controlling scene view or a validated grayscale derivative with identical composition. The separate answer packet overlays numbered target regions using the same zone order as the web feedback.

Print QA must test:

- target recognizability in grayscale;
- annotation legibility without color;
- no question/key bleed-through;
- no crop or scaling that invalidates zone meaning;
- text-equivalent packet ordering matches visual numbering.

Print answer regions are explanatory; paper marks are not automatically scored from handwritten coordinates in v1.

## Authoring workflow

Regions are authored **after** the final visual is accepted for semantic inventory, not before. Sequence:

1. freeze candidate final visual hash;
2. independent target/decoy/negative-hazard acceptance;
3. author zones and stable order;
4. author target/decoy polygons against the frozen visual;
5. author neutral/full descriptions in the same zone order;
6. run overlap/tolerance validation;
7. test blind marker placement at phone size;
8. test print overlays;
9. hash and publish the region file with the scene version.

If later cleanup moves an object, changes camera/crop, alters a target silhouette, or changes a decoy, regions are invalid until re-authored/reviewed.

## Changed-scene variants

Do not mechanically reuse hotspot coordinates across transfer variants, even when the same object asset is moved. Each final static variant receives its own registered polygons. The variant manifest may record transformation lineage to speed authoring, but publication validates final coordinates independently.

This prevents a subtle failure where deterministic object placement changes but stale regions remain at the original location.

## Historic attempts

Every submitted attempt pins:

- scene version;
- region-set version/hash;
- matching-policy version;
- tolerance configuration/version;
- submitted marker logical coordinates;
- resulting assignments.

If a hotspot bug is corrected later, historical results remain attached to the old interaction version. Do not silently rewrite past correctness. A correction notice/review opportunity can direct the learner to the corrected scene version.

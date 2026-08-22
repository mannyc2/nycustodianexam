# Hazard Scene Versioning Contract

Evidence status: **INFERRED contract implementing confirmed immutable-content/progress requirements.**

## Principle

A published scored scene is immutable. Any accepted change creates a new immutable scene/asset revision. The change class determines what else must be invalidated, re-reviewed, or version-bumped; it never rewrites historical attempts in place.

Historic attempt events pin the exact scene version, region-set hash, matching-policy version, profile/content-pack version, and learner marks. Later fixes can create correction notices or new review opportunities, but old correctness results are not silently recomputed.

## Identity layers

Keep these concepts distinct even if a future schema encodes them differently:

- **scene family ID** — durable concept family across variants;
- **scene semantic version** — exact hazard/decoy/safe-background meaning;
- **scored-view revision** — exact final static composition/pixels presented to a learner;
- **region-set revision** — target/decoy polygons registered to the scored view;
- **accessibility revision** — neutral/full description set and nonvisual-equivalent mapping;
- **derivative revision** — compression/format/print derivative of a scored view;
- **question/item version** — item that references a particular scene view and scoring contract.

A content pack always points to immutable concrete IDs/hashes, never “latest scene.”

## Change classes

### V1 — hazard inventory or meaning

Examples:

- add/remove an intended target;
- change damaged cord → missing grounding pin;
- change a safe container into an incompatible/mixed chemical condition;
- change the correction/source-backed rule;
- change whether an object is target vs safe background.

Consequences:

- new scene semantic version;
- new scored-view revision;
- new region set;
- full negative-hazard/decoy/source/accessibility/rights/security review;
- referencing question version must bump;
- existing attempts stay on old item/scene version;
- review scheduling may offer the new item but cannot merge results as if identical without an explicit concept mapping.

### V2 — object geometry or pose affecting meaning

Examples:

- ladder leg/spreader/top-step geometry;
- cord damage boundary;
- obstruction size/placement;
- stack support/contact;
- person hand/foot/body pose;
- container closure/placement that influences interpretation.

Consequences are the same as V1 if the geometry can affect target/decoy/safety interpretation. “Same intended meaning” is not enough to call a scored visual cosmetic if the learner sees different evidence.

### V3 — decoy change

Examples:

- add/remove a safe-but-suspicious object;
- change why a decoy is safe;
- reposition a decoy so it becomes ambiguous or hazardous.

Consequences:

- new semantic/scored-view revision;
- regenerate regions/descriptions;
- re-run negative-hazard and discrimination review;
- referencing item version bumps because false-positive opportunities changed;
- historical attempts remain pinned.

### V4 — hotspot/region correction only

Use only when the final scene pixels and semantic inventory are unchanged but the interactive region was wrong or unfair.

Consequences:

- new region-set revision and item interaction version;
- do not overwrite old region file;
- run overlap/tolerance/phone tests;
- historical marks/results retain old region-set ID and outcome;
- if old scoring materially disadvantaged learners, publish a correction/change notice and offer corrected review rather than silently rewriting event history.

### V5 — camera/composition/crop change

Any camera position, field of view, crop, perspective, object screen position, or substantial composition change is a new scored-view revision even if the underlying 3D scene/semantic inventory is unchanged.

Consequences:

- new region set;
- new neutral/full descriptions if observable layout changes;
- new phone/print/target-separation review;
- new item version;
- treat as a changed-scene transfer variant for analytics unless editorially declared replacement.

Reason: camera/composition affects visibility and difficulty and can invalidate hotspots.

### V6 — accessibility description change

Two cases:

**Text-only clarification with unchanged meaning/pixels:**
- new accessibility revision;
- re-run answer-leak/zone-order/source consistency checks;
- item version may reference updated accessibility revision while semantic scene remains unchanged, but immutable published packs are replaced by a new pack version.

**Interpretation/observable-fact change:**
- if text reveals that final pixels mean something different than previously reviewed, promote to V1/V2/V3 and re-review scene semantics.

Never use description edits to “fix” unsafe or ambiguous art.

### V7 — render-only cleanup

Examples might include antialiasing cleanup, stray nonsemantic line removal, line-weight normalization, or dust/noise cleanup.

A change qualifies only if independent review confirms:

- no object silhouette/contact relevant to meaning changed;
- no target/decoy visibility changed;
- no new cue/text/mark appeared;
- region registration remains exact;
- phone/print legibility is unchanged or improved.

Consequences:

- new scored-view derivative/revision and output hash;
- repeat region overlay and accessibility pixel-consistency review;
- if any semantic or visibility effect appears, reclassify to V2/V5.

For already published items, prefer preserving the old scored view unless there is a material quality reason to migrate; immutable versioning makes unnecessary churn costly.

### V8 — compression/format derivative

Examples: PNG → WebP derivative, SVG optimization, lossless metadata stripping, quality adjustment.

Consequences:

- new derivative hash/revision;
- canonical composition/coordinates must remain identical;
- run pixel/visual diff, phone, grayscale, print, metadata/answer-leak checks;
- semantic scene, regions, and item meaning need not change if the derivative passes;
- content-pack version still changes when delivered bytes change.

If compression erases a decisive feature or shifts raster dimensions/crop, it is not V8-only.

### V9 — source/citation correction

If a source URL/locator changes but the substantive supported rule is identical, create a new explanation/source revision and pack version. If the source correction changes whether the depicted condition is actually supported, reclassify to V1 and withdraw/review the old item under the correction process.

### V10 — rights/provenance correction

Rights records can be augmented without changing pixels, but unresolved rights failure blocks further distribution of that version. Replacing an asset because rights are not clear creates a new scored-view/scene version and repeats semantic QA; visual equivalence is not assumed.

## Object-library versioning

Reusable scene components are versioned separately from scenes. A component library edit must not silently mutate published scenes.

Authoring-time linking is allowed for convenience, but a publish candidate must resolve and record exact asset hashes. Options for a future pipeline include:

- pack/freeze the required Blender assets into a scene build artifact;
- render from a checkout/content-addressed library at exact component revisions;
- copy immutable SVG components into a build staging set.

If component `cart@3` becomes `cart@4`, existing `scene@7` still points to `cart@3` or to the frozen bytes derived from it.

## Variants vs replacements

### Variant

A changed-scene transfer variant intentionally preserves concept meaning while changing context/composition. It has a distinct scored-view ID and item version and can coexist with siblings.

### Replacement

A correction replaces future use of a flawed scene version. The flawed version remains resolvable for historical attempts/audit but is removed from active assembly. A correction record explains why.

Do not call a correction a variant just to preserve analytics continuity.

## Review-queue implications

When a learner previously missed concept `C` on scene version `S1`, a later review can prefer a different scene/variant testing `C`. If `S1` was corrected for hotspot/art semantics:

- keep the old event as history;
- schedule `S2`/another valid variant with reason `corrected_content_notice` where appropriate;
- do not mark the learner suddenly correct because the old hotspot moved;
- analytics can exclude/flag invalidated item versions from aggregate mastery-like summaries without deleting the raw event.

## Question implications

A question/item pins exact scene/scored-view/region revisions. Bump the item version when any learner-visible pre-answer pixel, scoring region, target/decoy inventory, or answer-bearing feedback materially changes.

Text-only source-link maintenance can be handled through immutable pack/item metadata revisions if keys and visible question meaning remain unchanged, but the old version stays reproducible.

## Build/version manifest

For every scene release record:

- parent scene/version if any;
- change class(es);
- human change rationale;
- semantic manifest hash;
- component hashes;
- authoring source hash;
- tool coordinates;
- final scored-view hash;
- derivative hashes;
- region-set hash;
- accessibility hash;
- source-claim hash;
- QA result hash;
- rights record hash;
- affected item IDs/versions;
- migration status: active / superseded / withdrawn / historical-only.

## Historic reproducibility

The project needs to reproduce **what was served**, not necessarily rerun every historical tool forever. Preserve final accepted static bytes and all published structured records. For deterministic source routes, also preserve enough source/tool coordinates to rebuild/compare when feasible.

For any future generative derivative, preservation of the accepted final output is mandatory because current ML stacks do not guarantee exact cross-platform/release regeneration from seed alone.

## Publication gate

A version change cannot publish until:

- change class is declared;
- dependent artifacts invalidated by that class were regenerated;
- relevant QA catalog checks pass;
- no old immutable object was overwritten;
- content-pack references point to new concrete hashes;
- correction/migration state is explicit where an older active scene is superseded.

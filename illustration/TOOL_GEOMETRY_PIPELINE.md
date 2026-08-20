# Tool geometry and static-render pipeline

**Status:** current production architecture for isolated tool assets  
**Adopted:** 2026-08-20  
**Evidence:** `../research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md`  
**Scope authority:** `../docs/TAXONOMY.md`

This document controls the source-of-truth pipeline for tool illustrations. It does not approve any individual asset.

## 1. Governing decision

Mechanically meaningful tool illustrations are generated from **project-owned deterministic geometry or project-owned deterministic 2D construction**, not from AI-generated raster art and not from an unreviewed supplier/community model.

The default pipeline is:

```text
source-backed facts + documented measurements
  -> versioned evidence/parameter record
  -> project-authored CadQuery / OCCT B-rep
  -> geometry + visual-invariant validation
  -> STEP AP242 neutral master
  -> OCCT hidden-line static SVG views
  -> deterministic PNG / WebP derivatives
  -> optional derived neutral GLB for atlas learning mode
  -> manifest, hashes, rights, mechanical, accessibility,
     print, and answer-leak review
```

`docs/TAXONOMY.md` determines whether a concept is in scope and which decisive features must be represented. A model, standard, supplier file, dataset, photograph, or prompt cannot expand the taxonomy by itself.

## 2. Source hierarchy

Use evidence in this order when available and legally usable:

1. controlling taxonomy/source claims;
2. cited standards dimensions, terminology, functional constraints, and test requirements;
3. official manufacturer documentation used as dimensional/reference evidence when redistribution rights are not implied;
4. original physical measurement and multi-view photography;
5. independently rights-cleared reference material;
6. editorial geometry only where unavoidable, explicitly labeled and mechanically reviewed.

A standards document may constrain geometry without supplying complete geometry. Classification systems, STEP, and glTF do not create missing contours or mechanisms.

Do not infer:

- hidden components from a single view;
- generic contours from one SKU;
- tooth pitch, thread form, wall thickness, radii, clearances, or articulation without evidence;
- a universal silhouette for a product family where the taxonomy expressly rejects one.

## 3. Asset sourcing classes

Each taxonomy asset receives one sourcing disposition:

- **Class A — authoritative complete parametric model.** Complete, mechanically suitable model with authoritative provenance and usable rights.
- **Class B — accepted reusable CAD or scan.** External model/scan whose geometry and redistribution/modification rights have both passed review.
- **Class C — project-authored deterministic model.** Parametric or otherwise reproducible project-owned geometry built from cited evidence and documented editorial decisions.
- **Class D — project-authored deterministic 2D asset.** Reproducible 2D construction/transformation used where hidden geometry and interactive views are not material.
- **Class E — priority reference.** Useful evidence/reference that does not itself qualify as a production asset.
- **Class F — unaudited, blocked, or no-publish.** Geometry, rights, evidence, or review is insufficient.

Class is not quality certification. A Class C/D asset still requires every production gate below.

At the audited base described in the research, no Class A, B, or accepted D production asset existed; four Class C proof models remained pending human mechanical review. Do not present those POCs as approved assets.

## 4. Parameter and evidence record

Every Class C model begins with a versioned machine-readable record containing at least:

- taxonomy concept ID;
- asset ID and revision;
- canonical name;
- geometry family;
- decisive visual/mechanical invariants;
- confusable concepts and forbidden trait leakage;
- units and coordinate convention;
- each parameter value;
- parameter source or measurement record;
- uncertainty/tolerance where known;
- editorial parameters clearly distinguished from sourced dimensions;
- articulation/display state;
- reference/rights records;
- expected components;
- expected contacts and prohibited intersections;
- required static views;
- reviewer status;
- build-tool/runtime versions.

Never collapse “sourced,” “measured,” and “editorial” into one undifferentiated parameter list.

## 5. Geometry authoring

### B-rep source

Use CadQuery/OCCT or an equivalent deterministic B-rep workflow selected by a later implementation decision. The accepted semantic geometry—not STL, GLB, SVG, PNG, or WebP—is the model source of truth.

### Coordinate and unit rules

- declare units explicitly;
- use one project coordinate convention;
- store articulation transformations rather than baking undocumented display poses into arbitrary meshes;
- keep independently meaningful components separable for validation;
- avoid nondeterministic meshing/render settings in the release path.

### Editorial geometry

Editorial geometry is allowed only when necessary to make a generic non-SKU-specific model. It must be:

- listed explicitly;
- mechanically plausible;
- outside unsupported claims;
- reviewed independently;
- prevented from masquerading as a standardized dimension.

## 6. Geometry validation

A release candidate must pass automated checks appropriate to its model:

- valid B-rep;
- expected solid/component count;
- watertight review meshes where meshes are produced;
- unit and coordinate checks;
- no unexpected component intersections;
- required contacts/clearances where modeled;
- range/constraint checks for sourced parameters;
- stable articulation/display state;
- pair-specific decisive-feature assertions;
- deterministic output manifest and hashes.

Examples of pair-specific assertions include:

- adjustable wrench has smooth parallel jaw faces and a visible worm mechanism;
- pipe wrench has distinct hook/heel jaw geometry with serrated gripping surfaces;
- flange plunger retains an extended lower flange absent from a cup plunger;
- stepladder remains self-supporting and visibly distinct from overlapping extension-ladder rails.

Automated validation supports review; it does not replace human mechanical judgment.

## 7. Neutral master and derived formats

### STEP AP242

The normalized STEP AP242 file is the neutral interchange/master derivative for accepted 3D geometry. It must be generated from the authoritative project model and checked for import/export integrity.

STEP is not accepted merely because a file opens. Re-import and compare required components, units, bounds, and model invariants.

### Review mesh

STL or component meshes may be generated for review/validation. They are not the source of truth and are not the preferred web asset.

### GLB

GLB is optional and derived. It may be published only for atlas learning mode after:

- accepted mechanical review;
- geometry/version linkage to the neutral master;
- neutral node/material/metadata naming;
- metadata and binary-string leak scanning;
- size/performance review;
- accessibility/static alternatives;
- explicit user invocation.

Do not auto-download GLB. Do not use GLB/rotation as the scored-question asset.

## 8. Static rendering

Use OCCT hidden-line removal or an equivalent deterministic geometry renderer to create the controlling technical views.

Required view set is asset-specific and may include:

- canonical three-quarter;
- profile/side;
- feature-revealing top, underside, open, or opposite view;
- separate detail view when a decisive feature cannot remain legible at target size.

Each view record contains:

- exact model hash/version;
- camera orientation/projection;
- articulation/display state;
- hidden-line settings;
- line hierarchy;
- crop/padding;
- output dimensions;
- renderer/tool version;
- output hashes.

### Scored-view immutability

A scored item references one exact static asset revision and view. Learners cannot rotate it before commitment.

Rotation may expose features not available in the authored question and therefore alter item difficulty. Interactive models belong only in clearly separated learning/atlas contexts.

## 9. SVG and raster derivatives

The controlling web/print line asset is static SVG when the render survives SVG and print QA.

SVG requirements:

- stable viewBox and padding;
- no script, event handlers, external resources, remote fonts, or `foreignObject`;
- no answer-bearing `<title>`, IDs, layer names, comments, or visible metadata in scored delivery;
- no embedded unreviewed raster;
- line weights survive phone scale and intended black-and-white print size;
- deterministic optimization with pinned configuration;
- pre/post optimization render equivalence.

Generate PNG/WebP from the accepted static render for known delivery/preview needs. Raster derivatives never redefine geometry.

## 10. Rights and external CAD

Do not treat download access as redistribution rights.

Before accepting Class B, record:

- exact source and file identity;
- license/terms version and retrieval date;
- modification right;
- public redistribution right;
- attribution/notice requirements;
- supplier-specific restrictions;
- embedded third-party material;
- mechanical review;
- conversion/edit lineage.

Commercial CAD portals are reference-discovery services by default. Supplier models may inform measurements or shape research without becoming redistributable production assets.

Dataset-level licenses do not automatically clear every object or make a SKU-specific model a truthful generic representation.

## 11. Original measurement fallback

When no adequate source geometry exists:

1. obtain a lawful representative physical object;
2. take original multi-view photographs on a controlled background;
3. record measuring instruments and calibration;
4. record measurements, repeated measurements, uncertainty, and inaccessible dimensions;
5. avoid representing one brand-specific decorative contour as a universal feature;
6. author a Class C model or Class D deterministic 2D asset;
7. preserve photography/measurement rights and provenance privately or publicly as appropriate;
8. run the full mechanical and visual review.

If this cannot establish both geometry and rights, retain Class F and publish no illustration.

## 12. Generative-image boundary

Do not use image generation to create or style the controlling production rendering of a mechanically modeled tool.

A future experimental generative derivative is permitted only when:

- the validated pre-generation render remains controlling;
- accepted model hash and render parameters are immutable;
- seed/sampler/model are pinned;
- source edge/depth/normal maps are retained;
- automated silhouette/keypoint/invariant comparisons reject drift;
- the derivative cannot enter scored or print use without independent approval.

A generative system must never invent or repair decisive geometry.

This decision is scoped to tool assets. Hazard-scene and broader contextual-illustration production require their own maintained decision; the recovered `PIPELINE_SPEC.md` remains supporting evidence there until superseded.

## 13. Human review gates

No asset is publishable without independent review covering:

- taxonomy compatibility;
- mechanical plausibility;
- sourced versus editorial geometry;
- decisive feature visibility;
- confusable-trait leakage;
- generic/non-SKU-specific representation;
- rights/provenance;
- scored-view answer leakage;
- neutral pre-answer description;
- full learning description;
- nonvisual equivalent or exception status;
- SVG/security metadata;
- phone/zoom/print legibility;
- deterministic rebuild/hash verification.

The reviewer signs the exact model and derivative hashes. A model can pass build automation and still fail mechanical review.

## 14. Versioning and change semantics

Use separate identities for:

- evidence/parameter revision;
- semantic model version;
- articulation/display version;
- render/view version;
- derivative/optimization revision.

A change to subtype, decisive geometry, component count, articulation meaning, or sourced parameters is semantic and must not overwrite the earlier accepted version.

A camera/crop-only change creates a new render revision. Compression/optimizer changes create derivative revisions when geometry and view remain unchanged.

Scored questions pin exact asset versions. Historical attempts are never rewritten to a new model or view.

## 15. Reproducibility gate

Before an asset family is considered production-ready:

- build twice from clean controlled environments;
- compare all expected output hashes;
- record tool/runtime/container identities;
- explain any intentionally nondeterministic output;
- reject undeclared drift;
- retain a complete output manifest.

Reproducibility proves the pipeline reproduced the same files; it does not prove the model is mechanically correct.

## 16. Current status

The immutable-base research reports:

- 65 proposed assets after normalization;
- 14 confusable pairs;
- four Class C POC models;
- exact matching hashes across 79 POC files in two controlled Linux builds;
- no production illustration approved.

The exact report, bundle, and POC files must be imported and checksum-verified before repository publication of the models or generated derivatives.

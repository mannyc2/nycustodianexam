# 8. Asset-record architecture

## 8.1 Required parameter/evidence record

Every Class C model should begin from a versioned machine-readable record containing:

```text
taxonomy concept ID
asset ID
asset revision
canonical name
geometry family
units
coordinate convention
parameters
parameter provenance
measurement uncertainty
editorial parameters
decisive invariants
forbidden confusable traits
expected components
expected contacts
prohibited intersections
articulation/display state
required static views
rights basis
review states
build-tool versions
```

## 8.2 Parameter provenance

Each parameter should use a shape conceptually like:

```json
{
  "name": "jawCapacity",
  "value": 28.0,
  "unit": "mm",
  "basis": "source",
  "sourceIds": ["source:iso-6787"],
  "uncertainty": null,
  "note": "..."
}
```

Allowed basis categories:

```text
source
measured
derived
editorial
```

Do not mix them.

## 8.3 Review freshness

Reviews should target exact hashes:

```text
model hash
parameter-record hash
render hash
rights-evidence hash
```

A changed model invalidates the old mechanical review.

A changed external source or license record may invalidate the old rights review.

---

# 9. Deterministic modeling architecture

## 9.1 CadQuery and OCCT

CadQuery provides a Pythonic parametric modeling layer over Open Cascade Technology.

OCCT supplies:

- B-rep solids;
- Boolean operations;
- STEP import/export;
- topology inspection;
- meshing;
- hidden-line removal;
- geometric validation.

Recommended source hierarchy:

```text
JSON evidence/parameters
  -> CadQuery model code
  -> OCCT B-rep
```

The accepted semantic source is the parameter record plus deterministic model code.

## 9.2 Why B-rep

A B-rep is preferable to a hand-authored triangle mesh for these assets because it supports:

- explicit solids/components;
- parametric dimensions;
- exact surfaces and edges;
- STEP export;
- intersection/validity checks;
- consistent orthographic rendering;
- controlled tessellation.

## 9.3 Coordinate convention

The pipeline should standardize:

```text
units: millimeters
+X: tool length / primary horizontal axis
+Y: tool width / lateral axis
+Z: height / vertical axis
```

Exceptions require explicit documentation.

## 9.4 Component separation

Mechanically meaningful components should remain distinct when useful:

- wrench body;
- movable jaw;
- worm;
- pipe-wrench hook jaw;
- pipe-wrench body/heel jaw;
- plunger handle;
- plunger cup;
- plunger flange.

Component separation supports:

- validation;
- articulation;
- review;
- metadata neutrality;
- debugging intersections.

## 9.5 Editorial geometry

A generic model inevitably contains editorial geometry when standards or measurements do not determine every contour.

Editorial geometry must be:

- explicitly listed;
- mechanically plausible;
- non-SKU-specific where possible;
- reviewed;
- excluded from claims of standardized dimension.

---

# 10. Automated validation architecture

## 10.1 Core geometry checks

Every model should pass:

- B-rep validity;
- expected component count;
- units and coordinate checks;
- bounding-box sanity;
- watertight review meshes;
- no unexpected component intersections;
- required contacts/clearances;
- deterministic output hashes.

## 10.2 Taxonomy-specific assertions

### Adjustable wrench

Required:

- two jaw components/surfaces;
- smooth parallel gripping faces;
- visible worm-adjustment component;
- adjustable opening range;
- no pipe-wrench hook-jaw silhouette;
- no serrated gripping faces.

### Pipe wrench

Required:

- distinct body/heel jaw;
- distinct hook jaw;
- visible adjustment mechanism;
- opposing serrated gripping surfaces;
- offset/open throat geometry;
- no smooth parallel adjustable-wrench jaw pair.

### Cup plunger

Required:

- handle;
- plain cup/bell;
- flat/open rim;
- no lower protruding flange.

### Flange plunger

Required:

- handle;
- cup/bell;
- lower protruding flange;
- flange remains visible in the feature view;
- clear distinction from plain cup plunger.

## 10.3 Intersection checks

The POC introduced pairwise component-intersection checks.

Expected examples:

- wrench body and movable jaw may contact/overlap according to the modeled guide;
- worm intersects/engages the wrench guide zone;
- plunger handle enters the cup neck;
- cup and flange may intersect because they form one rubber assembly.

Unexpected examples:

- disconnected floating worm;
- flange detached from cup;
- movable jaw intersecting the wrench handle/body impossibly;
- hook jaw fused across the pipe-wrench throat.

## 10.4 Mesh checks

Review STL/component meshes should be:

- watertight;
- finite;
- non-empty;
- within expected bounds;
- consistent with component count;
- free of NaN/Inf coordinates.

Mesh checks do not replace B-rep validation.

## 10.5 GLB metadata scanning

Derived GLB files must be scanned for answer-bearing metadata.

Reject strings containing:

- canonical tool name;
- synonyms;
- answer labels;
- taxonomy labels where they reveal the object;
- brand/manufacturer names;
- source filenames that identify the answer.

Use neutral node/material names such as:

```text
component_00
component_01
material_00
```

The POC includes neutral metadata scanning.

---

# 11. Static render architecture

## 11.1 Hidden-line rendering

OCCT hidden-line removal can produce the desired black-on-white technical style directly from the accepted B-rep.

Recommended line classes:

- visible silhouette/feature edges;
- optional hidden edges only for learning/debug views;
- no hidden edges in scored views unless explicitly required;
- no shading needed for primary technical views.

## 11.2 Required views

Every asset should define required views based on its invariants:

```text
three-quarter
profile
feature
```

The feature view may be:

- top;
- underside;
- open articulation;
- opposite side;
- close detail.

## 11.3 Camera records

Every render record should store:

```text
model hash
camera direction
up vector
projection type
articulation state
hidden-line settings
crop/padding
line-width policy
renderer version
output hash
```

## 11.4 Static SVG as controlling scored asset

For scored questions:

- use one exact static SVG/raster revision;
- no pre-answer rotation;
- no interactive reveal of hidden geometry;
- no answer-bearing metadata;
- neutral pre-answer accessibility text;
- full post-answer description.

## 11.5 Why rotation is prohibited in scored mode

Rotation can expose:

- a flange hidden by the cup;
- serrated teeth not visible in one view;
- the rear frame of a stepladder;
- overlapping rails of an extension ladder;
- a machine underside or pad arrangement;
- an adjustment mechanism;
- another feature not intended in the authored question.

That changes the information available to the learner and therefore the item's difficulty/construct.

## 11.6 Interactive atlas

An atlas page may optionally offer a user-invoked GLB after the static learning views.

Requirements:

- no automatic download;
- model passed mechanical review;
- GLB derived from accepted geometry;
- neutral metadata scan passed;
- static accessible alternative present;
- interactive mode clearly separated from scored mode;
- size/performance budget reviewed.

---

# 12. Raster derivatives

Generate raster derivatives from accepted static SVG/geometry renders:

```text
PNG
WebP
```

Use them for:

- previews;
- social cards;
- known browser/print fallback;
- low-complexity thumbnails where SVG is not suitable.

Do not use raster derivatives as geometry authority.

Store:

```text
source render hash
derivative settings
encoder version
derivative hash
```

---

# 13. Generative-image decision

## 13.1 Production decision

Do not use image generation to create or style the controlling mechanically meaningful tool render.

The deterministic hidden-line render already provides:

- stable silhouette;
- correct component count;
- reproducible articulation;
- consistent view;
- print suitability;
- answer-leak control;
- inspectable lineage.

A generative model adds risk to exactly those properties.

## 13.2 Permitted future experiment

A future experimental generative derivative may be considered only if:

- the deterministic render remains controlling;
- immutable source model hash is retained;
- seed, model, sampler, and settings are pinned;
- edge/depth/normal maps are retained;
- silhouette and keypoint checks compare output to source;
- drift causes rejection;
- output is not used in scored or print contexts without separate approval.

## 13.3 Forbidden use

Do not use generation to:

- invent missing geometry;
- fix a malformed jaw;
- add a flange;
- create serrations;
- repair articulation;
- infer hidden parts;
- convert a SKU into a generic tool automatically.

---

# 14. Fallback architecture

## 14.1 Original photography + measurement

When standards/public sources are insufficient:

1. acquire lawful access to a representative physical object;
2. photograph front, side, three-quarter, top/bottom, and decisive details;
3. include scale/measurement references;
4. record dimensions and uncertainty;
5. identify brand-specific decorative features;
6. build a deterministic Class C model or Class D 2D asset;
7. retain photos/measurement notes as evidence;
8. run full review.

## 14.2 Deterministic 2D asset

Use Class D when:

- hidden geometry is irrelevant;
- the scored view is fixed;
- the concept can be represented faithfully from one/two views;
- parametric 3D provides little benefit;
- the 2D construction is reproducible and rights-cleared.

## 14.3 No asset

Use Class F when:

- decisive geometry cannot be established;
- rights are unclear;
- the available model is too SKU-specific;
- the visual would imply unsupported universality;
- review fails.

---

# 15. Proof-of-concept implementation

## 15.1 POC objects

The local evidence bundle contains deterministic models for:

- adjustable wrench;
- pipe wrench;
- cup plunger;
- flange plunger.

## 15.2 POC outputs per object

Each object includes:

- parameter/provenance JSON;
- STEP neutral file;
- review STL;
- per-component STL meshes;
- neutral-metadata GLB;
- three static SVG views;
- PNG and WebP render derivatives;
- validation results;
- manual QA checklist;
- output hashes.

## 15.3 POC render views

Each object has:

```text
three-quarter
profile
feature
```

The feature view emphasizes:

- adjustable-wrench worm/movable jaw;
- pipe-wrench serrated hook/heel geometry;
- cup-plunger plain rim;
- flange-plunger lower flange.

## 15.4 POC validation result

The hardened build passed:

- B-rep validity;
- watertight component meshes;
- expected component counts;
- unexpected-intersection rejection;
- pair-specific feature assertions;
- neutral GLB metadata scanning;
- units/coordinate checks;
- output-hash validation.

## 15.5 Deterministic rebuild result

Two independent builds were executed in the controlled Linux environment.

Result:

```text
files compared: 79
matching hashes: 79
mismatches: 0
```

This establishes reproducibility for the tested environment/toolchain.

It does not establish:

- cross-platform reproducibility;
- final standards compliance;
- final geometry approval;
- final visual accessibility approval;
- final rights review.

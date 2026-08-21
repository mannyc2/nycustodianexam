# 16. POC limitations

The POC intentionally retains unresolved/editorial items.

## Adjustable wrench

Potential unresolved items:

- exact jaw proportions;
- worm tooth/profile fidelity;
- handle cross-section;
- guide clearances;
- generic contour choices.

## Pipe wrench

Potential unresolved items:

- tooth pitch/profile;
- hook-jaw articulation;
- adjustment mechanism detail;
- body taper;
- jaw offsets and clearances.

## Cup and flange plungers

Potential unresolved items:

- rubber wall thickness;
- cup curvature;
- flange flexibility/profile;
- handle insertion depth;
- material deformation.

These are why the models remain Class C POCs pending mechanical review.

---

# 17. Human mechanical-review protocol

## 17.1 Required reviewers

A release candidate should receive review from at least:

1. a mechanically knowledgeable reviewer for the tool family;
2. a content/taxonomy reviewer;
3. an accessibility/visual reviewer;
4. a rights/provenance reviewer.

One person may hold more than one role only when competence and independence are documented.

## 17.2 Review packet

The review packet should include:

- taxonomy row;
- decisive feature list;
- confusable comparison;
- parameter/evidence record;
- source references;
- three static views;
- optional interactive model;
- validation results;
- unresolved/editorial parameters;
- rights record;
- exact hashes.

## 17.3 Review outcomes

Allowed outcomes:

```text
passed
failed
needs rework
blocked by evidence
blocked by rights
```

Do not use:

```text
looks good
probably fine
AI says valid
```

## 17.4 Exact-hash signoff

A review applies only to exact model/render hashes.

Any semantic geometry change requires re-review.

---

# 18. Versioning and lifecycle

## 18.1 Separate version axes

Track separately:

```text
evidence/parameter revision
semantic model version
articulation/display version
render/view version
derivative/encoder revision
```

## 18.2 Semantic changes

These require a new semantic model version:

- subtype change;
- decisive feature change;
- component count change;
- articulation meaning change;
- sourced dimension change;
- correction of mechanical error.

## 18.3 Render-only changes

These may create a new render revision:

- camera change;
- crop/padding change;
- line-weight adjustment;
- SVG optimization;
- PNG/WebP encoder update.

## 18.4 Historical scored attempts

Questions and attempts pin exact asset versions.

A later improved asset does not rewrite the visual shown in a completed attempt.

---

# 19. Build and reproducibility protocol

## 19.1 Pinned environment

Record:

- operating system/container identity;
- Python version;
- CadQuery version;
- OCCT version;
- trimesh version;
- glTF exporter version;
- render/encoder versions;
- script hash;
- parameter-record hashes.

## 19.2 Clean builds

Before accepting an asset family:

1. run two clean builds;
2. compare all expected output hashes;
3. record differences;
4. reject undeclared drift;
5. preserve output manifest.

## 19.3 Cross-platform check

Before production scale, test at least:

- controlled Linux build;
- second independent environment/container;
- optionally macOS/Windows if contributors will build locally.

Exact cross-platform binary identity may not always be realistic for STEP/mesh/raster encoders. If not, define semantic/geometric equivalence checks rather than pretending hashes will match across all toolchains.

## 19.4 Publication gate

The build is publishable only when:

- all expected outputs exist;
- manifest verifies;
- model validation passes;
- render QA passes;
- rights review passes;
- mechanical review passes;
- accessibility review passes;
- scored-view leak review passes;
- taxonomy compatibility passes.

---

# 20. Proposed repository organization

This research does not create production directories, but recommends a future structure such as:

```text
illustration/
  tool-assets/
    TOOL-C-ADJUSTABLE-WRENCH/
      evidence/
        parameters.v1.json
        sources.json
      model/
        build.py
      generated/
        model.step
        review.stl
        atlas.glb
        views/
          three-quarter.svg
          profile.svg
          feature.svg
      validation/
        automated.json
        manual-review.md
        rights-review.md
        accessibility-review.md
      manifest.sha256
```

Generated binaries may live in object storage or release artifacts rather than ordinary Git, depending on repository-size policy.

The repository should store enough source/evidence to reproduce them.

---

# 21. Asset-manifest schema

The proposed schema in `asset-manifest.schema.json` includes:

- asset identity;
- taxonomy concept ID;
- sourcing class;
- geometry family;
- model source format;
- canonical unit;
- parameter/evidence records;
- source and rights references;
- decisive invariants;
- forbidden traits;
- components;
- required views;
- generated outputs;
- validation results;
- review states;
- current lifecycle state.

The schema is a proposal, not yet maintained production authority.

---

# 22. Priority-reference strategy

## 22.1 First 20 visual-invariant sheets

The research produced visual-invariant sheets for the first 20 priority assets.

Each sheet records:

- taxonomy ID;
- canonical name;
- geometry family;
- sourcing disposition;
- decisive visual invariants;
- confusable concepts;
- forbidden trait leakage;
- likely evidence path;
- recommended modeling method;
- unresolved questions.

These sheets are preserved in `first-20-visual-invariants.csv`.

## 22.2 Reference priority

The 16 Class E priority references should be audited first because they:

- cover high-confusion tools;
- constrain the first POC families;
- are likely to benefit from standards/public measurements;
- provide reusable geometry patterns.

## 22.3 Remaining 45 Class F concepts

Class F does not mean permanently impossible.

It means:

- no accepted source/model in this pass;
- evidence or rights incomplete;
- production blocked until audit.

Each should receive a future source/measurement plan rather than an invented visual.

---

# 23. Powered cleaning equipment

Powered cleaning equipment is the hardest isolated-tool family in the current inventory.

Examples include:

- floor machine;
- burnisher;
- extractor;
- wet/dry vacuum;
- backpack vacuum;
- walk-behind autoscrubber;
- riding autoscrubber;
- pressure washer.

## 23.1 Why these are difficult

- major manufacturer/SKU silhouette variation;
- internal mechanisms not visible;
- hoses/tanks/handles/controls vary;
- generic identity may depend on context/use;
- supplier CAD rights are often restrictive;
- the taxonomy explicitly rejects a universal floor-machine/burnisher silhouette.

## 23.2 Recommended treatment

Use one of:

1. a carefully defined generic class model from multiple public/measurement sources;
2. deterministic 2D/3D family comparison emphasizing only stable decisive features;
3. original measured representative equipment with an explicit non-universal note;
4. no asset until evidence is adequate.

Do not generalize one branded model into the universal exam answer.

---

# 24. Soft/deformable tools and PPE

Soft/deformable concepts include:

- gloves;
- microfiber cloths;
- dusters;
- wet mops;
- sponge mops;
- mop heads;
- PPE garments.

## 24.1 Why deterministic 3D may not be ideal

- shape changes with pose/load;
- one B-rep can imply false rigidity;
- texture/material cues may matter;
- hidden geometry provides little value;
- interactive rotation may add little learning value.

## 24.2 Recommended treatment

Prefer:

- deterministic 2D vector construction;
- simple procedural 3D only where shape family matters;
- original photography transformed into deterministic line art;
- no interactive GLB unless it adds real learning value.

The tool-geometry pipeline is a default, not a mandate to model every concept in 3D.

---

# 25. Ladders and articulation

Ladders benefit from deterministic geometry because the decisive distinction is structural:

- stepladder: self-supporting A-frame with spreaders;
- extension ladder: overlapping sections without rear support frame.

Recommended modeling requirements:

- componentized rails/rungs/spreaders/locks;
- explicit open/closed display states;
- stable scored view;
- no interactive rotation in scored mode;
- atlas GLB may allow learning inspection after review;
- articulation states versioned separately.

Ladder standards can constrain geometry, but complete generic models still require project authoring.

---

# 26. Confusable-pair production

## 26.1 Same-view comparison

For each pair, define a matched comparison camera and footprint.

Example:

```text
adjustable wrench:
  profile view showing smooth parallel jaws and worm

pipe wrench:
  matched profile showing offset serrated hook/heel jaws
```

## 26.2 Separate source assets

Each tool remains an independently accepted asset.

Pair panels are derived compositions.

Do not make the fused pair panel the source of truth.

## 26.3 Pair-specific tests

Automated tests should assert both:

- required traits are present;
- the other concept's decisive traits are absent.

That is especially important for:

- wrench pair;
- plunger pair;
- ladder pair;
- hammer pair;
- drill-bit pairs;
- floor-machine/burnisher family.

---

# 27. Accessibility architecture

## 27.1 Neutral scored description

Before commitment, the description may state observable geometry without naming the tool or use.

It must not expose:

- canonical name;
- synonym;
- answer;
- family if that solves the question;
- decisive comparison verdict.

## 27.2 Full learning description

After commitment, describe:

- tool name;
- view/orientation;
- decisive components;
- functional relationship;
- confusable distinction.

## 27.3 Nonvisual equivalent

Every visual scored concept needs a nonvisual equivalent or a blocking exception.

The equivalent is not claimed identical to visual recognition.

## 27.4 GLB accessibility

Interactive 3D requires:

- static alternatives;
- textual controls/instructions;
- keyboard operation where published;
- no dependence on rotation for core content;
- no scored use.

---

# 28. Security and answer-leak architecture

## 28.1 Static files

Reject answer-bearing:

- filenames;
- SVG titles;
- SVG IDs/classes;
- comments;
- metadata;
- accessible names before commitment.

## 28.2 GLB

Reject answer-bearing:

- node names;
- mesh names;
- material names;
- extras/extensions;
- embedded URIs;
- source paths;
- asset metadata.

## 28.3 Repository paths

Internal repository paths may identify the concept, but the browser-scored delivery path should use neutral content-addressed URLs or controlled manifest mappings.

## 28.4 Scored static authority

The scored item references an exact static asset revision and does not expose the broader model package until after commitment or in separate atlas mode.

# 29. Static, interactive, print, and offline policy

## 29.1 Scored questions

Use:

```text
fixed SVG/raster derivative
exact asset revision
exact camera/render record
```

No rotation.

## 29.2 Atlas

Use:

- controlling static views;
- optional user-invoked GLB;
- no automatic prefetch;
- static textual alternative;
- separate learning mode.

## 29.3 Print

Use static SVG/PNG derivatives.

Requirements:

- deterministic page rendering;
- monochrome/low-ink compatibility;
- stable view;
- no WebGL/interactive dependency;
- separate answer key where applicable.

## 29.4 Offline

Offline packs should prioritize:

1. static SVG/PNG/WebP;
2. metadata/descriptions;
3. questions/explanations;
4. optional GLB only when explicitly selected.

GLB must not become a hidden mandatory payload.

---

# 30. Performance architecture

## 30.1 Static-first

Most study and scored experiences should not require a 3D viewer.

The default page loads:

- HTML;
- CSS;
- static SVG/raster;
- small metadata.

## 30.2 Lazy GLB

GLB is loaded only after explicit interaction such as:

```text
Open 3D view
```

Respect:

- Save-Data;
- offline pack selection;
- user preference;
- device capability;
- size budget.

## 30.3 Viewer isolation

Keep 3D viewer code in a separate lazy chunk.

Static atlas/scored pages should not pay the WebGL/viewer cost.

## 30.4 Asset budgets

Set budgets after representative models exist.

Suggested starting targets:

- static SVG: compact enough for immediate/offline use;
- thumbnail raster: small responsive derivative;
- GLB: optional and individually budgeted;
- no automatic multi-angle 3D download.

---

# 31. Toolchain security

## 31.1 Deterministic dependencies

Pin:

- CadQuery;
- OCCT;
- trimesh;
- glTF exporter;
- raster encoders;
- SVG optimizer;
- container/runtime.

## 31.2 Untrusted external geometry

Treat external CAD/mesh files as untrusted inputs.

Use:

- isolated conversion environment;
- no embedded scripts/macros;
- metadata stripping/review;
- parser/version pinning;
- resource limits;
- output validation.

## 31.3 SVG sanitization

Reject:

- scripts;
- event handlers;
- external URLs;
- `foreignObject`;
- remote fonts;
- unreviewed embedded raster;
- answer-bearing metadata.

## 31.4 Build output publication

Publish generated outputs only after:

- manifest verification;
- review signoff;
- content/taxonomy compatibility;
- rights approval.

---

# 32. Cost and throughput

## 32.1 Deterministic-model cost structure

The major cost centers are:

- source/evidence research;
- parameter extraction;
- original measurement;
- parametric modeling;
- mechanical review;
- correction/review cycles;
- accessibility descriptions;
- rights documentation;
- build/validation maintenance.

Software/API generation cost is not the main budget driver.

## 32.2 Family reuse

Costs can be reduced by reusable geometry patterns:

- handle primitives;
- jaw/hinge mechanisms;
- fastener components;
- ladder rails/rungs;
- cart frames/wheels;
- vacuum hoses/wands;
- brush/broom blocks and bristle fields.

Reuse must not erase decisive differences.

## 32.3 Pilot before scale

Recommended pilot:

- the four current POCs;
- claw/ball-peen hammer pair;
- stepladder/extension ladder pair;
- push broom/floor brush pair;
- one powered cleaning family;
- one soft/deformable family.

Use the pilot to estimate:

- modeling time;
- review time;
- rework rate;
- render/GLB size;
- cross-platform reproducibility;
- authoring ergonomics.

---

# 33. Decision matrix

| Decision area | Recommendation |
|---|---|
| Complete authoritative geometry source | None identified |
| Canonical source format | Project parameters + deterministic model code/B-rep |
| Neutral interchange | STEP AP242 |
| Web interactive derivative | Optional GLB |
| Scored/print controlling derivative | Static hidden-line SVG, with raster derivatives as needed |
| AI generation for tool authority | Reject |
| External supplier CAD | Reference only unless exact rights + mechanical review pass |
| Open datasets | Object-level discovery/audit only |
| Generic classification systems | Metadata/parameter aid, not geometry source |
| Browser scored rotation | Prohibit |
| Atlas rotation | Optional, explicit, lazy, post-review |
| Offline GLB | Optional pack component |
| Service worker / browser need for CAD | None |
| No-evidence outcome | Class F, no published illustration |
| POC status | Reproducible Class C, pending mechanical review |

---

# 34. Implementation sequence

This is a proposed future sequence, not work performed by this research.

## Phase 1: evidence and governance

1. Review and merge the sourcing-class model.
2. Review the 65-asset inventory against the then-current taxonomy.
3. Review the 14 confusable pairs.
4. Establish standards/source access and retention policy.
5. Approve the asset-manifest schema.
6. Define reviewer roles.

## Phase 2: hardened pilot

1. Import the four POC source/parameter records.
2. Rebuild in a pinned environment.
3. Run independent mechanical review.
4. Correct/reversion models.
5. Add cross-platform build comparison.
6. Add static-view accessibility review.
7. Add rights review.

## Phase 3: family expansion

1. rigid hand tools;
2. articulated hand tools;
3. ladders;
4. cleaning implements;
5. carts;
6. soft/deformable tools;
7. powered cleaning equipment.

Each family needs reusable modeling primitives and family-specific validation.

## Phase 4: site integration

1. static atlas views;
2. scored static assets;
3. optional atlas GLB;
4. content-pack manifests;
5. offline/print integration;
6. versioned asset references;
7. correction/change log.

## Phase 5: scale and maintenance

1. automated build farm/CI;
2. deterministic manifest checks;
3. model review queue;
4. asset lifecycle/versioning;
5. correction propagation;
6. source/license revalidation.

---

# 35. Open issues

## 35.1 Mechanical review

Who is qualified and available to review:

- wrench mechanics;
- ladder structure;
- powered cleaning equipment;
- cleaning implements;
- soft goods/PPE?

## 35.2 Standards access

Which standards may be retained/quoted internally and what access method will be used?

## 35.3 Original measurement

Which representative physical tools/equipment are available for measurement?

## 35.4 Genericity

How will the project decide that a model is generic enough and not one SKU/trade dress?

## 35.5 Binary storage

Should generated STEP/STL/GLB/raster outputs live in:

- Git LFS;
- release artifacts;
- object storage;
- a separate asset repository?

## 35.6 Build runtime

Will production builds run only in a pinned Linux container, or must contributors reproduce them locally?

## 35.7 Schema authority

How will asset manifests integrate with future Effect Schema/content compiler work?

## 35.8 POC adoption

The current POC parameter records/schema are proposals. They need review before becoming repository authority.

---

# 36. Evidence files delivered

The research bundle contains:

```text
research-report.md
asset-manifest.schema.json
taxonomy-inventory.csv
confusable-pairs.csv
first-20-visual-invariants.csv
source-ledger.csv
poc-summary.json
DELIVERABLE-SHA256SUMS
research-bundle.zip
poc-evidence.zip
```

The POC evidence contains:

```text
README.md
build_poc.py
parameters/*.json
poc-build-a/**
poc-build-b/**
MANIFEST.sha256
```

## 36.1 POC build content

Each build contains:

```text
parameters/
models/
  STEP
  review STL
  component STL
  GLB
renders/
  SVG
  PNG
  WebP
validation/
  automated-validation.json
  manual-qa.md
manifest/
  asset-manifest.json
  OUTPUTS.sha256
poc-summary.json
```

---

# 37. Reproducibility receipt

The exact POC summary records:

```text
builds compared: 2
files compared: 79
hash matches: 79
mismatches: 0
```

The bundle SHA-256 values are recorded in `DELIVERABLE-SHA256SUMS`.

The complete research bundle SHA-256 is:

```text
a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06
```

The POC evidence archive SHA-256 is:

```text
725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d
```

---

# 38. Final recommendation

Adopt the deterministic tool-geometry architecture as the maintained direction for isolated mechanically meaningful tools, subject to review of the raw evidence and POC.

Do not treat the current POC models as production assets.

Do not keep the older AI-raster-to-SVG path as the default tool pipeline.

Retain the older pipeline's useful controls for:

- accessibility descriptions;
- rights review;
- failure/rework;
- hazard scenes;
- metadata;
- print QA;
- visual consistency.

For tools, however, the decisive geometry should come from reviewed deterministic project-controlled sources.

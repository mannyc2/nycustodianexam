# Deterministic tool-geometry pipeline research

**Integration date:** 2026-08-20  
**Repository base audited by the research:** `mannyc2/nycustodianexam` `main` at `92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c`  
**Evidence status:** user-supplied completion summary from an immutable-base research pass  
**Research bundle SHA-256:** `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`

> The full report/evidence bundle was not materialized into this conversation or searchable Library at integration time. This file records the supplied completion result accurately enough to reconcile architecture, but it does not claim that every source coordinate or POC file was independently re-read in this pass. Import the exact bundle and verify its checksum before promoting its POC files into the repository.

## Executive finding

No single standard, product-data system, CAD portal, or open 3D dataset provides complete, mechanically trustworthy, rights-cleared generic geometry for a useful majority of the current taxonomy.

The defensible tool-asset architecture is:

```text
cited facts, dimensions, and documented measurements
  -> versioned JSON evidence and parameter records
  -> project-authored CadQuery / OCCT B-rep
  -> automated geometry and visual-invariant validation
  -> normalized STEP AP242 neutral master
  -> derived neutral GLB for optional atlas use
  -> OCCT hidden-line orthographic SVG
  -> deterministic PNG and WebP derivatives
  -> manifest, hashes, rights QA, mechanical QA,
     accessibility QA, and answer-leak review
```

The geometry does not come from STEP, glTF, a classification system, or a standards document. Those systems can carry, classify, constrain, or deliver geometry after the project has established the geometry itself.

## Standards and external-source disposition

The research found that selected standards families can provide dimensions, terminology, tests, and functional constraints, but do not provide every contour, cross-section, tooth, thread, guide, clearance, fastener, or articulation needed for complete generic models.

Named useful standards/systems in the supplied result:

- ISO 6787;
- ASME B107 families;
- ANSI ladder standards;
- ETIM 10;
- ECLASS 16;
- ETIM MC;
- STEP AP242;
- glTF / GLB.

Interpretation:

- classification/product-data systems are evidence/parameter aids, not geometry authorities;
- STEP AP242 is the neutral CAD master format after geometry exists;
- GLB is a derived web-delivery format, not the production source of truth;
- supplier/commercial CAD portals are reference-discovery services unless exact redistribution/modification rights are separately established;
- large product/community datasets remain SKU-specific, mechanically variable, and license-specific;
- a clean license does not substitute for taxonomy-specific mechanical review.

The supplied research also reports an unresolved license-metadata conflict for Amazon Berkeley Objects between its official page and the AWS Registry entry. No ABO asset is admitted on the strength of that research alone.

## Taxonomy audit at the immutable base

The canonical taxonomy at the audited base contained **67 Tier A/B-containing heading records**. After consolidating:

- the duplicate Staple gun entry; and
- overlapping protective-glove concepts,

it yielded:

- **65 proposed illustration assets**;
- **14 registered confusable pairs**.

These are a derived production inventory at the audited commit, not official exam counts and not eternal constants. Regenerate the inventory after taxonomy changes.

### Proposed exclusive geometry families

| Editorial modeling family | Assets |
|---|---:|
| Rigid hand tools | 15 |
| Articulated hand tools | 12 |
| Cleaning implements | 10 |
| Powered cleaning equipment | 8 |
| Soft or deformable tools | 7 |
| Carts / material handling | 4 |
| Other | 4 |
| PPE | 3 |
| Ladders / access | 2 |
| **Total** | **65** |

The families are production/modeling categories, not an exam taxonomy.

The research specifically reaffirms current taxonomy invariants including:

- adjustable wrench: smooth parallel jaws and a worm adjustment mechanism;
- pipe wrench: serrated hook/heel gripping geometry;
- toilet/flange plunger: an extended lower flange;
- stepladder: self-supporting geometry;
- extension ladder: overlapping rail sections;
- floor-machine/burnisher family: no invented universal silhouette.

## Sourcing classes reported by the audit

Current disposition at the audited base:

| Class | Meaning in the supplied completion | Count |
|---|---|---:|
| A | Authoritative complete parametric model | 0 |
| B | Accepted reusable CAD or scan | 0 |
| C | Project-authored deterministic model / proof model | 4 |
| D | Accepted production-ready deterministic 2D asset | 0 |
| E | Priority reference | 16 |
| F | Unaudited or blocked concept | 45 |

No production illustration was approved by the research.

## Static, interactive, print, and scored-use rules

### Scored questions

The controlling scored asset must be a fixed static SVG or raster derivative. Do not provide scored-view rotation.

Rotation can expose a hidden flange, tooth form, rear ladder section, machine underside, articulation detail, or another feature not intended to be visible in the authored scored view. That changes the construct and potentially the difficulty.

### Atlas

An atlas page may provide a user-invoked GLB in addition to the controlling static views when:

- the model has passed mechanical review;
- the GLB is derived from the accepted neutral master;
- neutral metadata has passed leak scanning;
- the interactive view is clearly a learning mode rather than a scored mode.

GLBs must not be fetched automatically. Static views remain primary for low bandwidth, offline packs, print, accessibility, and stable page rendering.

### Print and offline

Printable packets and offline/PWA content remain static-first. The accepted model generates deterministic static derivatives; the browser does not need CAD or 3D-rendering capability to study or print.

## Generative-image decision

Image generation is **not** the production styling step for mechanically modeled tools.

OCCT hidden-line rendering from a validated B-rep already supplies the required black-on-white technical style without handing silhouette, topology, component count, articulation, or decisive geometry to a generative model.

A future local experiment is not prohibited, but only as a noncontrolling derivative with:

- immutable accepted model hash;
- fixed seed and sampler;
- deterministic source renders;
- retained edge/depth/normal maps;
- automatic silhouette and keypoint rejection;
- the verified pre-generation render remaining the controlling asset.

Do not use a generative output to repair or redefine mechanically meaningful geometry.

## Fallback hierarchy

When standards/public records do not establish enough geometry:

1. create original multi-view photography;
2. document physical measurements and measurement uncertainty;
3. create either:
   - a Class C project-authored deterministic model; or
   - a Class D deterministic 2D transformation when hidden geometry is irrelevant;
4. retain evidence, rights, parameters, and transformation provenance.

When neither geometry nor rights can be established, the correct disposition is **Class F: no published illustration**.

Supplier CAD or internet models do not become production assets merely because they are downloadable.

## Proof-of-concept result

The reported POC created Class C models for:

- adjustable wrench;
- pipe wrench;
- cup plunger;
- flange plunger.

Reported per-object outputs included:

- parameter and provenance records;
- STEP;
- review STL;
- component meshes;
- neutral-metadata GLB;
- three-quarter, profile, and feature SVG/PNG/WebP renders;
- automated validation;
- manual QA checklist;
- SHA-256 hashes.

Reported hardened checks:

- B-rep validity;
- watertight component meshes;
- expected component counts;
- unexpected-intersection rejection;
- pair-specific feature assertions;
- neutral GLB metadata scanning;
- units/coordinate checks;
- output-hash validation.

Two independent controlled Linux builds reportedly produced exact matching hashes across **79 files**.

This establishes reproducibility on that controlled runtime. It does **not** establish final mechanical approval. The completion summary retains explicit uncertainty around body contours, tooth pitch, rubber profiles, selected dimensions, and display articulation. Independent human mechanical review remains required.

## Reported deliverables pending exact import

The completion summary names:

- `research-report.md`;
- `research-bundle.zip`;
- `poc-evidence.zip`;
- `poc-build-a/poc-preview.png`;
- `asset-manifest.schema.json`;
- `taxonomy-inventory.csv`;
- `confusable-pairs.csv`;
- `first-20-visual-invariants.csv`;
- `source-ledger.csv`;
- `poc-summary.json`;
- `DELIVERABLE-SHA256SUMS`.

Do not reconstruct these files from this summary. Import the exact bytes only after they are attached/materialized and the bundle SHA-256 matches the value at the top of this file.

## Reconciliation impact

This research supersedes the recovered 2026-08-17 AI-first raster-generation assumption **for mechanically modeled tool assets**.

It does not automatically settle:

- hazard-scene production;
- procedure/in-use scenes;
- every soft/deformable concept;
- the exact human mechanical-review panel;
- the full evidence/parameter template;
- which Class E references can be promoted;
- whether any POC model passes final mechanical review.

Current authority after integration:

1. `docs/TAXONOMY.md` controls concept scope and decisive feature requirements.
2. `illustration/TOOL_GEOMETRY_PIPELINE.md` controls current tool-production architecture.
3. this research file records the evidence/result that justified the decision.
4. `illustration/PIPELINE_SPEC.md` remains historical/fallback guidance and hazard-scene QA material; it is no longer the default source pipeline for tool geometry.

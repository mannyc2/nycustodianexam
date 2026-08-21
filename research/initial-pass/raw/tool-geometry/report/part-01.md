# Deterministic Generic Tool Assets for NY Custodian Exam Practice

**Research date:** 2026-08-20  
**Repository analyzed:** `mannyc2/nycustodianexam`  
**Required and observed `main` SHA:** `92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c`  
**Mode:** Documentation and local proof-of-concept only. No repository branch, file, package, framework, production asset, PR, or lockfile was created or changed.

---

# 1. Executive verdict

## 1.1 Direct answer

**No reviewed source provides complete, mechanically trustworthy, rights-cleared generic geometry for a useful majority of the current Tier A/B tool taxonomy.**

The closest reviewed source classes solve only parts of the problem:

- **ISO/ASME/ANSI standards** provide dimensions, terminology, performance requirements, and selected geometry constraints for some tools, but usually **not a complete producible model**.
- **ETIM/ECLASS** provide classification and structured product-data vocabularies; they are not complete generic CAD libraries for this taxonomy.
- **STEP AP242** is a neutral representation standard that can faithfully carry complete geometry **after geometry exists**. It does not supply geometry evidence.
- **glTF/GLB** is an efficient downstream web-delivery format, not an evidence source or CAD master.
- **Manufacturer CAD portals** provide SKU-specific models under restrictive or unclear redistribution terms; they do not establish a generic reusable corpus.
- **Open 3D datasets** provide many models, but they are mostly SKU-specific, community-authored, mechanically variable, and governed by object/source-specific rights.
- **Public-domain catalogs and original photography/measurement** are useful reference inputs, but they require project-authored interpretation and modeling.

The recommended production architecture is therefore:

```text
cited facts, standards constraints, and documented measurements
  -> versioned JSON parameter/evidence record
  -> project-authored deterministic B-rep
  -> automated geometry and visual-invariant checks
  -> normalized STEP AP242 neutral master
  -> derived GLB for optional atlas use
  -> OCCT hidden-line static SVG views
  -> deterministic PNG/WebP derivatives
  -> manifests, hashes, rights review, mechanical review,
     accessibility review, print QA, and answer-leak review
```

## 1.2 Practical consequence

The project should **stop treating AI image generation as the default tool-illustration source** for isolated mechanically meaningful tools.

For tools, the source of truth should be:

1. deterministic project-authored geometry when feasible;
2. deterministic project-authored 2D construction when hidden geometry is irrelevant;
3. original measured photography as evidence/fallback;
4. no illustration when geometry or rights cannot be established.

AI may remain relevant for exploratory drafts or contextual/hazard-scene experiments, but not as the authority for the decisive geometry of an isolated tool.

## 1.3 Current production status

At the end of this research:

- **0** authoritative complete parametric models were accepted.
- **0** external reusable CAD/scan assets were accepted.
- **4** project-authored deterministic proof models were produced locally:
  - adjustable wrench;
  - pipe wrench;
  - cup plunger;
  - flange plunger.
- **0** production illustrations were approved.

The POC demonstrates reproducibility and pipeline feasibility. It does **not** prove final mechanical correctness or release readiness.

---

# 2. Scope and method

## 2.1 Repository gate

The immutable-base check passed before research:

```text
required SHA:
92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c

observed GitHub main SHA:
92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c
```

The canonical repository documents were read at that exact commit, including:

- `AGENTS.md`;
- `README.md`;
- `CONTRIBUTING.md`;
- `docs/FACTBASE.md`;
- `docs/SCOPE.md`;
- `docs/TAXONOMY.md`;
- `docs/LANDSCAPE.md`;
- `docs/OPEN.md`;
- current illustration-production and architecture documents.

## 2.2 Research goals

The research tested whether a more deterministic pipeline could replace the earlier AI-raster-to-SVG proposal for isolated tools.

The investigation covered:

1. standards and classification systems;
2. neutral CAD and web formats;
3. public/open/commercial geometry sources;
4. rights and redistribution posture;
5. taxonomy normalization;
6. confusable-pair invariants;
7. deterministic 3D and static-render pipeline design;
8. local proof models;
9. reproducibility;
10. static versus interactive use;
11. fallback and no-publish policy.

## 2.3 Evidence posture

This report distinguishes:

- **source-backed fact**;
- **bounded technical observation**;
- **project-authored proof**;
- **editorial recommendation**;
- **unresolved item**.

A standards document, open model, or deterministic build is not automatically a production approval.

---

# 3. Taxonomy normalization

## 3.1 Canonical heading count

The canonical taxonomy contains **67 Tier A/B-containing heading records** relevant to illustration production.

After consolidating:

- a duplicate Staple gun entry; and
- overlapping protective-glove concepts,

this yields **65 proposed normalized illustration assets**.

That number is an editorial production inventory derived from the audited taxonomy. It is not an exam count or weighting claim.

## 3.2 Exclusive geometry-family allocation

The 65 normalized assets were assigned to one primary modeling family each:

| Geometry family | Assets |
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

These families are production/modeling categories, not official exam classifications.

## 3.3 Registered confusable pairs

The audited taxonomy yields **14 registered confusable pairs or sets**.

Examples include:

- adjustable wrench vs pipe wrench;
- cup plunger vs flange plunger;
- claw hammer vs ball-peen hammer;
- stepladder vs extension ladder;
- floor machine vs burnisher;
- push broom vs floor brush;
- putty knife vs scraper;
- flat-head vs Phillips screwdriver;
- adjustable vs combination/open-end wrench;
- tubing/pipe cutter vs hacksaw;
- twist bit vs masonry bit;
- twist bit vs spade bit;
- staple gun vs caulking gun;
- drain snake vs plunger.

The exact inventory is preserved in `confusable-pairs.csv`.

## 3.4 Taxonomy invariants confirmed

The canonical taxonomy already requires several decisive distinctions:

- **Adjustable wrench:** smooth, parallel jaws and a worm-adjusted movable jaw.
- **Pipe wrench:** offset hook/heel jaws with serrated gripping surfaces.
- **Flange plunger:** a lower protruding flange distinct from a plain cup plunger.
- **Stepladder:** self-supporting A-frame geometry.
- **Extension ladder:** overlapping rail/rung sections and no rear support frame.
- **Floor machine/burnisher:** the corpus explicitly warns against inventing one universal silhouette.

These distinctions became visual/mechanical invariants in the proposed asset records and POC tests.

---

# 4. Geometry-source audit

## 4.1 Standards

### ISO 6787

ISO 6787 provides dimensional and functional terminology for adjustable wrenches. It can constrain jaw capacity, overall size relationships, and general tool identity.

It does **not** supply every contour, handle section, worm thread, jaw radii, chamfer, clearance, or product-independent surface needed for a complete generic model.

Disposition:

- **Useful reference evidence**;
- not a Class A complete model.

### ASME B107 families

ASME B107 standards cover families of hand tools including pliers, wrenches, striking tools, and related products.

They provide useful terminology, dimensional limits, strength/performance requirements, and selected geometry constraints.

They do not provide complete generic B-rep geometry for the audited taxonomy.

Disposition:

- **Useful reference evidence**;
- not a complete reusable model source.

### ANSI ladder standards

ANSI ladder standards constrain classifications, dimensions, duty ratings, and safety geometry for ladders.

They are useful for distinguishing self-supporting stepladders from overlapping-section extension ladders.

They do not provide a complete generic model for every rail, rung, spreader, lock, foot, joint, or articulation state.

Disposition:

- **Useful reference evidence**;
- not a complete reusable model source.

## 4.2 ETIM and ECLASS

### ETIM 10

ETIM is primarily a structured technical-product classification system.

It can provide:

- product classes;
- feature vocabularies;
- standardized property naming;
- units and classification metadata.

It is not a complete CAD geometry source for the current tool taxonomy.

### ETIM Modelling Classes

ETIM MC is potentially useful for geometric parameter conventions, especially in building-product contexts.

The exact coverage of this hand-tool/custodial taxonomy was not established.

Disposition:

- useful as a parameter/metadata convention source;
- no direct geometry coverage claim.

### ECLASS 16

ECLASS is also a classification and property system rather than a generic CAD library.

Disposition:

- useful terminology/property reference;
- not a complete geometry source.

## 4.3 STEP AP242

STEP AP242 is an appropriate neutral CAD representation for accepted B-rep geometry, assembly structure, product manufacturing information, and interchange.

It answers:

```text
How should accepted geometry be exchanged and preserved?
```

It does not answer:

```text
What is the correct generic geometry of this tool?
```

Recommended use:

- normalized neutral master derivative after project geometry exists;
- re-import and validation required;
- not an evidence source by itself.

## 4.4 glTF / GLB

GLB is useful for compact web delivery of triangulated geometry and metadata.

It is not appropriate as the canonical modeling source because:

- it is mesh-oriented;
- precise parametric/mechanical semantics are limited;
- it is easy to lose source/parameter provenance;
- it encourages treating a web derivative as the master.

Recommended use:

- optional atlas learning mode;
- derived from the accepted model/STEP lineage;
- neutral metadata scanning required;
- never the scored-question authority.

---

# 5. Dataset and CAD portal audit

## 5.1 Amazon Berkeley Objects

ABO contains thousands of product models and images.

Problems for this project:

- SKU-specific products rather than generic taxonomy concepts;
- mechanically variable quality;
- incomplete coverage of the audited tool set;
- source/metadata licensing complexity;
- unresolved license-metadata conflict between the official project page and AWS Registry description observed in this pass.

Disposition:

- reference discovery only;
- no asset admitted.

## 5.2 Objaverse and Objaverse-XL

These datasets provide very large numbers of community-authored 3D objects.

Problems:

- object-level license variation;
- uncertain geometry quality;
- unreliable taxonomy alignment;
- possible branding/text/metadata;
- SKU/stylized/scene-specific rather than generic.

Disposition:

- discovery/research only;
- no direct production ingestion without object-level audit.

## 5.3 Poly Haven

Poly Haven offers high-quality CC0 assets.

Its license posture is attractive, but coverage of the current taxonomy is limited and a correctly named model still requires taxonomy-specific mechanical review.

Disposition:

- strongest general open-license source class reviewed;
- no audited tool asset accepted during this pass.

## 5.4 Commercial CAD portals

Supplier and commercial CAD portals may offer STEP/IGES/SolidWorks or other product files.

Their general terms do not establish a safe right to:

- modify;
- normalize;
- strip branding;
- redistribute publicly;
- include in downloadable offline packs;
- publish derived SVG/GLB illustrations.

Even when redistribution is permitted, the geometry is often one SKU rather than a defensible generic representation.

Disposition:

- reference-discovery and measurement aid;
- not a default production-asset source.

## 5.5 Public-domain catalogs and manuals

Older catalogs and public-domain manuals can provide useful orthographic illustrations, proportions, part names, and historical geometry.

Limitations:

- not necessarily complete;
- may depict obsolete designs;
- rights/status must be checked item by item;
- still require project-authored modeling.

Disposition:

- Class E reference evidence;
- not direct geometry authority.

---

# 6. Rights architecture

## 6.1 Separate geometry correctness from rights

Every candidate requires independent judgments for:

1. mechanical/visual suitability;
2. modification rights;
3. public redistribution rights;
4. derivative-asset rights;
5. attribution/notice obligations;
6. embedded third-party material;
7. branding/trade-dress concerns.

A mechanically excellent supplier model can be unusable because of rights.

A CC0 model can still be mechanically wrong for the taxonomy.

## 6.2 Project-authored geometry

Project-authored parametric geometry based on:

- cited standards constraints;
- public factual dimensions;
- original measurement;
- general functional knowledge;
- documented editorial choices,

provides the cleanest provenance path.

The parameter record must distinguish:

- sourced values;
- measured values;
- derived values;
- editorial values.

## 6.3 Original photography

Original multi-view photography and measurement is the preferred fallback when no adequate standards/CAD source exists.

The process should record:

- object identity and ownership/access;
- camera setup;
- scale/reference object;
- measurement instrument;
- repeated measurements;
- uncertainty;
- inaccessible dimensions;
- brand-specific decorative features that should not become generic.

## 6.4 No-publish rule

When either geometry or rights remain unresolved, use:

```text
Class F: no published illustration
```

Do not fill a content gap with a misleading visual.

---

# 7. Sourcing-class system

The report proposes six sourcing classes:

| Class | Meaning |
|---|---|
| A | Authoritative complete parametric model with usable rights |
| B | Accepted reusable external CAD or scan |
| C | Project-authored deterministic model |
| D | Project-authored deterministic 2D asset |
| E | Priority reference/evidence only |
| F | Unaudited, blocked, or no-publish |

## 7.1 Current counts

| Class | Count |
|---|---:|
| A | 0 |
| B | 0 |
| C | 4 |
| D | 0 |
| E | 16 |
| F | 45 |

These counts describe the audit state, not production approval.

The four Class C records are proof models pending human review.

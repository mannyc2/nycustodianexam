# R2.9 Report — Hazard-Scene Production Architecture

> **Superseded authoring-route recommendation (2026-08-23):** This report is
> preserved as historical research. Its deterministic-first route and exclusion
> of text-to-image from controlling production no longer govern the project.
> `../../../illustration/VISUAL_AUTHORING_POLICY.md`, this directory's current
> `README.md`, `GENERATIVE-BOUNDARY.md`, and `DECISION-MATRIX.csv` authorize
> Codex-native image generation. The semantic, target/decoy, hotspot,
> accessibility, QA, and versioning analysis remains supporting guidance.

**Repository:** `mannyc2/nycustodianexam`  
**Immutable source:** `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`  
**Source branch:** `agent/chat-corpus-reconciliation`  
**Research branch:** `research/v2-hazard-scene-production`  
**Status:** completed research recommendation; **no production scene is approved**  
**Research date:** 2026-08-21/22 UTC

## Executive finding

The project should not use either the isolated-tool CAD pipeline or generative imagery as a universal hazard-scene architecture.

The strongest architecture candidate is a **mixed, deterministic-first scene pipeline** with one semantic, QA, accessibility, interaction, and versioning contract across several authoring routes:

1. **modular project-owned SVG/2D composition** for simple and mostly planar scenes;
2. **project-owned Blender/procedural 3D blocking + deterministic static line rendering** where perspective, depth, occlusion, pose, contact, or changed-scene transfer benefits from 3D;
3. **3D blocking + constrained human 2D cleanup** for people, soft/organic forms, irregular liquids/clutter, and scenes where raw 3D line work is too sterile or noisy;
4. **selective human illustration from a deterministic blocking package** when modeling a one-off organic form costs more than controlled drawing;
5. **no text-to-image output in the controlling scored-production path**;
6. **controlled project-owned image-to-image only as optional noncontrolling R&D**, with hard structural rejection gates and a deterministic pre-generation fallback.

The common contract matters more than a universal drawing tool. For every scored scene, three authorities must agree:

- the **semantic scene manifest** says what is intended to exist and why;
- the **final reviewed static pixels** determine what the learner actually perceives;
- the **human-authored normalized target/decoy regions** determine what local marker scoring is permitted to recognize.

A mismatch among those three is a release failure.

This recommendation is deliberately provisional on production economics. R2.9 did not create hazard scenes or run Blender/model inference. It publishes an evidence-bearing pilot that must replace planning priors with measured accepted-scene labor, QA failures, hotspot behavior, phone/print results, and changed-scene variant cost before bulk production is approved.

## 1. Research question and constraints

R2.9 asks how to produce original school/custodial hazard scenes for a low-bandwidth, offline-capable, phone-first study site whose scored behavior must be deterministic, accessible, rights-safe, and resistant to answer leakage.

The repository's maintained content/product constraints already establish the following non-negotiable behavior:

- scenes are original or independently rights-cleared;
- never reconstruct or imitate secure/official examination artwork;
- the scored learner sees an unannotated static scene before commitment;
- target count is not disclosed;
- intended hazards and safe-but-suspicious decoys are human-authored;
- missed hazards, decoy false positives, and general false positives are distinct;
- matching is one-to-one and cannot invent an unauthored hazard;
- pre-answer accessibility exposes neutral observable information, not the key;
- post-answer accessibility and visual annotations expose full explanations in a stable zone order;
- print uses a separate unannotated worksheet and annotated answer packet;
- historic attempts pin immutable content versions;
- final scored assets must work on small phones, in grayscale/print, offline, and without interactive 3D.

Those invariants turn scene production into a **controlled semantic-illustration problem**, not a generic image-generation problem.

## 2. Methodology

### 2.1 Launch and repository audit

The lane verified that `agent/chat-corpus-reconciliation` exactly matched the required source SHA before creating work. It then created `research/v2-hazard-scene-production`, committed `START-RECEIPT.md`, and opened draft PR #16 before extended research.

Required repository authorities were read from the immutable source, including:

- `AGENTS.md`, `README.md`, and `CONTRIBUTING.md`;
- maintained product and architecture contracts;
- Effect v4/Bun research doctrine;
- initial-pass normalization, reusable findings, supersession, and redo ledger;
- `docs/SCOPE.md`, `docs/TAXONOMY.md`, and `docs/LANDSCAPE.md`;
- the recovered illustration pipeline;
- the maintained isolated-tool geometry pipeline and normalized geometry evidence/limitations.

The important reconciliation result is that **neither prior visual pipeline controls this lane**:

- the deterministic B-rep/CAD decision is explicitly scoped to mechanically meaningful isolated tools;
- the recovered hazard guidance contains useful QA/accessibility ideas but its AI-first source assumption is supporting history, not a maintained scene decision.

### 2.2 External evidence

Primary/official sources were preferred for version/tool capability, accessibility, rights, reproducibility, and the eight pilot hazard classes. Exact locators and dates are in `SOURCE-LEDGER.csv`.

Current dated coordinates recorded by this lane are:

- `effect@4.0.0-rc.111` — current v4 RC coordinate observed at research time; no Effect code probe was needed;
- Bun `1.4.0` — current stable Bun coordinate observed at research time;
- Blender `5.2.0 LTS` — current stable/LTS Blender coordinate selected as the future 3D pilot reference.

Blender's current official documentation establishes the relevant capability surface: 3D-to-2D rendering, Freestyle non-photorealistic line rendering, background/headless command-line rendering, and reusable asset-library behavior. This is capability evidence, not proof that a specific line style or scene class will pass project QA.

For generative reproducibility, current PyTorch and Diffusers documentation supports pinning seeds/generators and deterministic controls but explicitly does not promise complete cross-release/platform reproducibility. Diffusers' ControlNet documentation establishes that project-generated edge/depth/pose structures can guide a model; it does not establish semantic-object preservation. Those limitations are material because a scored scene cannot tolerate a model silently changing a cord, plug, ladder, spill, obstruction, person pose, container, decoy, or background object.

W3C WAI complex-image guidance supports structured long descriptions; WCAG 2.2 supplies the current interaction baseline. R2.9 adapts those principles to the project's commit-before-reveal security boundary.

Rights research used U.S. Copyright Office primary material. It supports two conservative decisions: generative copyrightability depends on sufficient human-authored expression rather than prompting alone, and external commissioned art needs explicit rights planning rather than an assumption that payment transfers ownership.

### 2.3 Evidence labels

This lane uses the shared evidence vocabulary:

- **CONFIRMED** — current controlling repository or primary-source guidance establishes the claim;
- **OBSERVED** — a reproducible probe establishes exact runtime behavior;
- **CORROBORATED** — strong supporting evidence but not project/runtime proof;
- **INFERRED** — project architecture recommendation;
- **UNKNOWN** — evidence not yet established;
- **BLOCKED** — required evidence/review is unavailable or intentionally deferred.

R2.9 contains no `OBSERVED` runtime probes because it did not need to write Effect code, install Blender, or execute a generative model. Route scores and labor estimates are therefore explicitly `INFERRED` until the pilot measures them.

## 3. Comparison of production methods

The full criteria matrix is `PIPELINE-COMPARISON.csv`. Scores are ordinal planning judgments, not measured weighted totals.

### 3.1 Hand-authored 2D vector

Strengths:

- precise target/decoy control;
- compact SVG delivery;
- natural alignment with stable zones and hotspot polygons;
- direct human editability;
- strong rights provenance when created by the project or under a clear assignment/license.

Weaknesses:

- perspective-rich rooms, bodies, ladders, cords, and changed camera variants become labor intensive;
- deterministic rebuild depends on disciplined source/versioning rather than generated geometry;
- reusable component leverage varies by scene.

Disposition: useful/conditional, but not the sole architecture.

### 3.2 Modular project-owned SVG scene composition

This is the preferred simple-scene route because it adds reusable room shells, fixtures, objects, signs, spills, containers, cords, carts, and other components while keeping final learner assets compact and deterministic.

The main risk is **template learning**: learners must not discover that a repeated camera/room layout or one target quadrant is itself an answer cue. Scene families therefore need changed object placement, camera/composition where applicable, varied safe clutter, different decoys, and family-level distribution review.

Disposition: recommended for simple/mostly planar classes, subject to pilot evidence.

### 3.3 Blender/procedural 3D blocking + deterministic line/static render

3D is valuable where fairness depends on relative position, occlusion, contact, pose, perspective, or repeatable transfer variants. It also creates useful build-only depth/object-ID/segmentation passes that can support QA and optional generative R&D without entering learner packs.

The project does **not** need to ship Blender files or a 3D engine. The output remains a fixed static SVG/raster scored view.

Risks:

- people, soft materials, spills, and clutter may be expensive or visually awkward to model;
- Freestyle/default line output may not hit the desired instructional genre without cleanup;
- cross-machine byte-identical rendering has not been measured;
- asset-library setup is a real fixed cost.

Disposition: recommended for geometry/perspective/occlusion-critical scenes, pending pilot.

### 3.4 3D blocking + human 2D cleanup

This route retains layout/contact/camera authority from the deterministic scene while allowing a human to simplify line noise, draw soft forms, clarify people/poses, and make the final art more readable.

The important boundary is that cleanup is not a free redraw. Any edit that changes a target/decoy silhouette, contact, occlusion, object identity, or observable condition invalidates semantic review and hotspot geometry and creates a new revision.

Disposition: likely preferred complex-scene route, pending measured cleanup/review cost.

### 3.5 Human illustrator

A human specialist can solve complex poses and organic content well, but a pure illustrator-first pipeline gives up deterministic variant reuse and increases rights/procurement dependency. The recommended use is selective: provide a deterministic blocking/reference package plus semantic manifest, negative-hazard inventory, and acceptance rubric.

Disposition: fallback/specialist route, not universal default.

### 3.6 Controlled text-to-image

Text-to-image is rejected as the controlling scored-production architecture.

The issue is not that a model can never draw an attractive scene. The issue is that the project must prove zero unauthored hazards and safe decoys while maintaining exact target geometry, source-backed meaning, stable hotspots, accessibility, rights, and historical reproducibility. Free-form model output has no authoritative object/condition inventory and can change precisely the small details on which safety meaning depends.

A fast generation that requires repeated rejection, manual repair, semantic re-review, hotspot re-authoring, and rights analysis is not demonstrated to be cheaper than deterministic/human production. No production throughput claim is made for it.

Disposition: excluded from the controlling production path.

### 3.7 Controlled image-to-image from project-owned structure

Control/depth/edge/pose conditioning is more defensible than free-form text-to-image because it begins with project-owned deterministic structure. It still cannot become safety authority.

R2.9 permits it only as optional R&D after an accepted deterministic scene exists. `GENERATIVE-BOUNDARY.md` defines strict pilot rejection gates, including exact semantic inventory/contact preservation, rigid-object silhouette/keypoint thresholds, no added text/logos, zero accidental hazards, and independent review.

Disposition: pilot-only, noncontrolling derivative; no provider/model selected.

### 3.8 Mixed pipeline by scene class

The mixed route dominates because the project has heterogeneous scene problems:

- a wet hallway or blocked fire-equipment view may be cheap and clear in modular SVG;
- a ladder/person relation or cord route may benefit from 3D;
- a cafeteria person/food-handling scene may require human cleanup;
- all routes can still publish the same static asset/region/accessibility/version contract.

Disposition: preferred R2.9 architecture candidate.

## 4. Scene asset architecture

`SCENE-ASSET-ARCHITECTURE.md` defines the full design. Its central rule is that **scene semantics are authored before art**.

A machine-readable semantic manifest should identify:

- scene identity/version and environment;
- source-backed claim IDs;
- ordered zones;
- every target, decoy, safe-background, and structural-background instance;
- exact target condition and correction concept;
- why each decoy is safe as depicted;
- negative-inventory assertions for accidental-hazard classes;
- component asset/version hashes;
- route/tool coordinates;
- accessibility units;
- rights and review records;
- final output and region hashes.

This manifest is build/source authority, not pre-answer learner content.

### 4.1 Modular library

The reusable library should cover room shells and common school/custodial elements such as fixtures, doors/exits, ladders, cords/plugs, containers, carts, fire equipment, PPE, signs/controls, spills, broken glass, generic people/poses, and safe clutter.

Reuse must be immutable: a published scene cannot silently change because an asset-library file was edited later. Build manifests resolve exact component hashes or freeze the required source bytes.

### 4.2 Negative inventory

Every scene receives a deliberate sweep for accidental hazards across at least:

- slips/trips;
- egress/fire;
- chemical;
- electrical;
- sharps;
- material handling/storage;
- sanitation/biological;
- machine/tool safety;
- correction-already-depicted conditions;
- answer-bearing text/color/metadata cues.

A safe-background object is not “safe” merely because the author did not intend it as a target.

## 5. Generative boundary

`GENERATIVE-BOUNDARY.md` is deliberately stricter than generic image-generation reproducibility guidance.

If controlled image-to-image is ever tested, it may consume only project-owned deterministic inputs such as the accepted block render, depth, segmentation, edges, and pose data. The manifest must pin:

- model/control repositories and immutable weight hashes;
- inference framework/runtime environment;
- seed/generator and sampler/scheduler;
- step count, guidance, strength, control scales;
- exact prompts and control-input hashes;
- deterministic settings;
- final output hash.

Those records improve reproducibility but do not make the generated pixels authoritative.

### 5.1 Pilot rejection defaults

R2.9 provides deliberately strict starting thresholds, labeled as **pilot hypotheses, not standards**:

- semantic object/target/decoy inventory: 100% preserved;
- rigid critical target/decoy silhouette IoU vs registered control: at least 0.995;
- maximum authored keypoint displacement: no more than 0.5% of the short image dimension;
- critical centroid displacement: no more than 0.25% of the short dimension;
- authored contact/occlusion predicates: 100% preserved;
- critical depth order: 100% preserved;
- added/altered text, pseudo-text, logos, arrows, glow, answer emphasis: zero;
- accidental hazards, unsafe decoys, missing/ambiguous targets, already-depicted corrections, and answer cues: zero.

One semantic failure rejects the derivative regardless of aggregate perceptual similarity.

The generator operator cannot be the sole accidental-hazard reviewer, and the deterministic pre-generation render remains the fallback.

## 6. QA failure ontology

`QA-FAILURE-CATALOG.csv` supplies stable `HSP-*` codes covering all prompt-required categories and additional publication failures.

Critical examples include:

- `HSP-TGT-MISSING` / `HSP-TGT-AMBIG`;
- `HSP-ACCIDENTAL-HAZARD`;
- `HSP-DECOY-UNSAFE`;
- `HSP-GEOM-IMPOSSIBLE`;
- `HSP-CUE-COLOR-TEXT`;
- `HSP-HOTSPOT-MISMATCH` / `HSP-HOTSPOT-OVERLAP`;
- `HSP-CORRECTION-DEPICTED`;
- `HSP-ANSWER-LEAK`;
- `HSP-ZONE-ORDER` / description failures;
- `HSP-PHONE-FAIL` / `HSP-PRINT-FAIL`;
- `HSP-RIGHTS-PROVENANCE`;
- generative inventory/structure failures;
- source/scope failures.

A critical failure is release-blocking. Do not hide one critical defect behind a weighted average “quality score.”

## 7. Zone and hotspot contract

`ZONE-HOTSPOT-CONTRACT.md` separates broad **zones** from precise target/decoy **semantic regions**.

### 7.1 Logical coordinates

All spatial data is registered to one immutable logical image plane and normalized to `[0,1]`, top-left origin. Web, print, and review artifacts map back to this plane. A crop/camera/composition change invalidates old regions.

### 7.2 Regions

A target region traces the meaningful observable condition, not a giant object bounding box. A blocked-extinguisher target should represent the obstruction/access relationship; a top-step ladder target should cover the relevant foot/top-step relation; a damaged-cord target should identify the damaged section with fair context.

Regions are authored **after final semantic visual acceptance**. They are never inferred from computer vision at runtime.

### 7.3 Tolerance

R2.9 does not freeze a production tolerance. The pilot begins with an explicitly nonstandard hypothesis: about 12 CSS px at 1x display zoom, capped at 1.5% of the logical short edge. Any tolerance expansion that creates ambiguous target/decoy overlap is a publication failure.

If an intended target needs a giant forgiving hotspot because it is invisible on a phone, the image composition fails; tolerance must not conceal an unreadable scene.

### 7.4 Matching

After successful commitment only:

- assign markers to authored regions at most one-to-one;
- unmatched targets are misses;
- unmatched markers inside decoys are decoy false positives;
- unmatched markers elsewhere are general false positives;
- extra markers near an already matched target can be duplicate marks;
- never infer a new safety meaning from an unauthored object.

Historic attempts pin the exact region set, matching-policy version, tolerance version, and submitted normalized marker coordinates.

## 8. Accessibility authoring

`ACCESSIBILITY-AUTHORING.md` treats complex-image accessibility as authored content with the same version discipline as the pixels.

### 8.1 Stable zone order

One zone order drives:

- neutral pre-answer overview/detail;
- nonvisual equivalent;
- post-answer full descriptions;
- visual annotation numbering;
- print answer key.

Order follows logical visual/room scanning, not hazard importance.

### 8.2 Observable vs interpretive language

Before commitment, describe what is visible without labeling it safe/unsafe or revealing target count. For example, saying a person's foot is on the uppermost horizontal surface of a stepladder is an observable fact; saying the person is “standing unsafely on the top step” is answer-bearing interpretation.

Safe-but-suspicious decoys must also appear in neutral descriptions. Otherwise the nonvisual learner is denied the same discrimination opportunity.

### 8.3 Nonvisual equivalent

The recommended v1 form is a neutral zoned scene with observable statements and accessible selection controls asking which conditions need correction. It can share concept tags/review scheduling with the visual scene but is explicitly reported as an equivalent knowledge format rather than the identical visual-recognition construct.

### 8.4 Interaction

Provide keyboard-operable marker management and explicit zoom/pan/reset controls. Drag and multi-touch are supplementary, not required. A marker list or equivalent control surface lets a user select/remove/reposition markers without precision dragging.

The scene can remain an intrinsically two-dimensional panning surface while the surrounding page reflows.

## 9. Versioning

`VERSIONING-CONTRACT.md` defines separate identities for semantic scene meaning, scored view, region set, accessibility data, derivatives, and referencing question/item.

Major change classes include:

- hazard inventory/meaning;
- target/object geometry or pose;
- decoy changes;
- hotspot-only corrections;
- camera/composition/crop changes;
- accessibility-description changes;
- render-only cleanup;
- compression/format derivatives;
- source corrections;
- rights/provenance corrections.

The key policy is that learner-visible evidence and scoring are immutable. A later hotspot bug creates a corrected region/item version; it does not silently recompute old attempts. A learner may receive a corrected-content notice/new review opportunity while raw history remains intact.

Changed-scene transfer variants are independent scored views with their own regions and review. Reusing a transformation lineage can speed authoring, but final hotspots are validated against the final pixels rather than copied blindly.

## 10. Evidence-bearing pilot

`PILOT-PLAN.md` is required before production adoption.

### 10.1 Sample

Produce **16 paired base candidates plus 8 changed-scene transfer variants = 24 static candidates** across the eight mandatory classes:

1. wet floor;
2. chemical storage/incompatibility;
3. damaged cord/grounding;
4. ladder misuse;
5. blocked egress/fire equipment;
6. lifting/material handling;
7. broken glass/sharps;
8. food-service contamination.

Each class uses one semantic brief across two genuinely competing authoring routes, then the better deterministic route creates one transfer variant.

The source ledger records current official/primary evidence for each pilot class. The pilot still requires per-scene content admission; an OSHA/CDC/NIOSH/FDA source does not itself prove official exam weighting.

### 10.2 Measurements

Capture actual:

- setup and per-scene authoring hours;
- render/generation time;
- semantic review and repair hours;
- hotspot/accessibility/phone/print/rights hours;
- first-review pass rate;
- revision count and `HSP-*` failures;
- changed-variant marginal hours;
- component reuse;
- repeat-build result;
- master/web/print byte sizes;
- blind target/decoy classification;
- target marker dispersion/region separation;
- accessibility leakage failures;
- rights/provenance completeness.

### 10.3 Review independence

Separate source/content, scene-author, independent accidental-hazard/decoy, interaction, accessibility/print, and rights responsibilities. A single person may fill multiple roles where practical, but the scene author/generator operator cannot be the sole accidental-hazard reviewer.

### 10.4 Optional generative subpilot

Do not compare free-form text-to-image as a scored-scene route. If there is a specific visual deficiency worth testing after deterministic bases succeed, select two accepted deterministic scenes from different classes and run one controlled image-to-image derivative each, counting all rejected attempts and review time.

Failure/rejection is a valid outcome; do not tune invisibly until a passing image appears.

## 11. Cost and throughput

`COST-THROUGHPUT-MODEL.csv` exists to make uncertainty explicit, not to present fabricated production benchmarks.

Every hour in that model is marked `INFERRED`. It separates:

- fixed reusable-library/setup cost;
- base-scene authoring;
- QA/review;
- repair contingency;
- changed-variant marginal effort;
- internal labor rate variable `R`;
- contractor rate variable `Rc`;
- generator/provider cost variable `G`;
- available active production hours per week `Hweek`.

The model intentionally does **not** insert a market labor rate, contractor quote, GPU cost, or launch date without current evidence.

The core economic hypothesis is that modular SVG and reusable deterministic 3D should improve transfer-variant economics after setup, while generative approaches may have low inference cost but high rejection/review cost. Only the pilot can confirm or falsify that hypothesis.

## 12. Workspace and runtime integration

`WORKSPACE-INTEGRATION.md` keeps authoring out of the learner runtime.

The future Bun workspace/content compiler should validate semantic manifests, region geometry, source closure, QA states, rights/accessibility gates, version/change classes, hashes, and answer-leak rules. Exact child workspace names remain open to R2.90/final architecture synthesis.

Effect should be used in future implementation where typed failures, Schema validation, filesystem/process/resource boundaries, bounded parallel build work, or observability justify it. Pure polygon math, coordinate transforms, change classification, hashing logic, and deterministic validators remain plain code when they need no effectful capability.

R2.9 does not introduce an Effect package dependency, choose v4 APIs, or create a fixture. Before implementation, the repository's installed-package rule still applies: pin current v4, read `node_modules/effect/AGENTS.md`, and use installed package guidance/source.

Blender, layered art, structural passes, and optional model weights are build-source assets only. Learner content packs contain the accepted static scene plus compact interaction/accessibility/content data. No hazard scene by itself requires a Cloudflare Worker or runtime image-generation service.

## 13. Relationship to prior research

### Reused from recovered illustration work

R2.9 retains and strengthens:

- separate target/decoy inventory;
- negative accidental-hazard sweep;
- human-authored hotspots;
- neutral/full accessibility modes;
- immutable lineage;
- phone/print review;
- rights/security restrictions.

It does **not** retain text-to-image as the default scene source.

### Reused from isolated-tool deterministic research

R2.9 carries forward the useful discipline of:

- project-owned source assets;
- exact component/tool/version manifests;
- static scored views;
- deterministic derivatives where feasible;
- checksums and immutable historic references;
- clear distinction between reproducibility and correctness.

It does **not** apply B-rep/CAD to every contextual scene by analogy. Scene production is primarily semantic/compositional; only some scene classes benefit enough from 3D geometry to justify it.

## 14. Open questions and explicit non-decisions

`OPEN-QUESTIONS.csv` records unresolved work. The important blockers are:

- measured route labor/failure rates;
- production hotspot tolerance from real marker data;
- exact routing by scene class;
- Blender line-style/cleanup and repeat-build behavior;
- anti-location-learning thresholds;
- exact chemical/food-service claim admission;
- external illustrator rights/contract form if that route is used;
- large binary source storage policy;
- representative assistive-technology/device matrix;
- final SVG/raster derivative choices and sizes;
- offline region/key leak-hardening implementation.

R2.9 deliberately does not decide:

- a launch scene count or official distribution;
- a generative provider/model;
- a final monorepo child package graph;
- production labor cost or schedule;
- final hotspot tolerance;
- any individual scene's content correctness or publication approval.

## 15. Recommendation to R2.90 / implementation planning

Carry forward the mixed deterministic-first architecture as the leading candidate, with these rules treated as high-priority constraints:

1. **Static learner view, semantic manifest, and human-authored regions are separate authorities that must agree.**
2. **Use modular SVG for simple scenes and deterministic 3D blocking where geometry/perspective/variants justify it.**
3. **Use constrained human cleanup/illustration for soft/organic/human detail rather than forcing all content through CAD.**
4. **Exclude text-to-image from controlling scored production.**
5. **If image-to-image is ever tested, use project-owned structural inputs, exact immutable coordinates, zero-tolerance semantic review, and deterministic fallback.**
6. **Every scene has an explicit target/decoy/safe inventory and independent accidental-hazard sweep.**
7. **Stable zone order drives visual, nonvisual, post-answer, and print representations.**
8. **Hotspots are authored after final visual acceptance and versioned independently; changed views get new regions.**
9. **Historic attempts never silently migrate to new pixels/regions/scoring.**
10. **Do not approve bulk production until the pilot replaces inferred cost/throughput with raw measured evidence.**

The correct next production action is therefore not “generate 60 scenes.” It is to run the evidence-bearing pilot against the contracts published by R2.9, inspect the failure distribution and accepted-scene economics, and only then promote a maintained hazard-scene production decision.

## 16. Limitations

- No Blender executable/render was run; current Blender evidence is documentation/capability evidence.
- No Effect/Bun fixture was created; no code-level Effect recommendation was required by this specialist lane.
- No generative model was selected or run; thresholds are proposed acceptance defaults for a future controlled subpilot, not observed performance.
- No user-study marker dataset exists; hotspot tolerance is a pilot hypothesis.
- No current contractor quote/procurement package was gathered; human illustration cost remains unknown.
- Source-backed occupational/safety rules constrain original practice content but do not establish official exam frequency or weighting.
- No production asset is approved by this research.

These limitations are intentional and visible. The lane resolves the architecture enough to run a meaningful controlled pilot without pretending that documentation research is runtime proof or content certification.

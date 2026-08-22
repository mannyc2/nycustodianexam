# Scene Asset Architecture

Evidence status: **INFERRED architecture recommendation from confirmed repository constraints and upstream tool capabilities. Pilot measurement remains required.**

No production scene is approved by this document.

## Decision

Use a **mixed deterministic-first authoring architecture with one semantic scene contract across all production routes**.

The scene's safety meaning must never be delegated to a renderer, illustrator, or generative model. The authored semantic inventory is the authority for what is intended to exist; the final reviewed static image is the authority for what the learner actually sees; the normalized region set is the authority for marker matching. Publication requires those three views to agree.

Recommended production routes:

1. **Modular project-owned SVG composition** for simple/mostly planar rooms, fixtures, and object arrangements.
2. **Project-owned Blender 3D blocking + deterministic static line render** when perspective, depth, occlusion, contact, pose, or transfer variants materially benefit from 3D.
3. **3D blocking + constrained human 2D cleanup** for complex scenes that need people, soft/organic forms, irregular spills, or a less sterile instructional line-art finish.
4. **Human illustration from a deterministic blocking/reference package** where 3D modeling the relevant form would cost more than controlled drawing. Human work still consumes the same semantic manifest and must pass the same negative-hazard sweep.
5. Generative methods are not controlling scene-authoring routes. See `GENERATIVE-BOUNDARY.md`.

This is intentionally different from the isolated-tool pipeline. A B-rep is useful when one object's mechanics are the subject; contextual scenes are primarily a **semantic-layout, occlusion, discrimination, and negative-space control problem**.

## Three authorities that must agree

### 1. Semantic scene manifest — meaning authority

Before drawing or rendering, author a machine-readable manifest with at least:

- `sceneId` and immutable `sceneVersion`;
- series/profile compatibility and environment tags;
- source-backed `claimId` references;
- scene class and authoring-route ID;
- logical canvas/aspect ratio;
- camera/composition record where a camera exists;
- stable ordered zones;
- project-owned object instances and their asset versions/hashes;
- for each object/condition: `target`, `decoy`, `safe-background`, or `structural-background` role;
- intended hazard condition and correction concept for targets;
- why each decoy is safe **as depicted** and what change would make it unsafe;
- explicit negative-inventory assertions for high-risk accidental-hazard classes;
- target and decoy region IDs;
- neutral pre-answer description units;
- full post-answer description units;
- rights/provenance records;
- reviewer identities/roles and review-state IDs;
- build tool coordinates and output checksums.

The manifest is not itself shown before commitment if it contains answer-bearing information.

### 2. Final controlling static view — perception authority

The scored learner sees one unannotated, immutable static image. It may be SVG or raster depending on route. That exact artifact is what content reviewers must judge for ambiguity, unintended cues, accidental hazards, and print/phone readability.

A semantically perfect Blender scene that renders ambiguously fails. A manifest that says an object is safe while the final pixels make it unsafe fails. Human cleanup that introduces a new cord, spill, obstruction, broken object, missing guard, dangerous pose, misleading text, or inaccessible detail fails even if the source block was correct.

Interactive 3D is not required and is not recommended for v1 scored attempts. Static views preserve deterministic exposure, print parity, lower payload, easier accessibility authoring, and a stable hotspot coordinate plane.

### 3. Region/zone map — interaction authority

Marker matching uses authored regions registered to the exact final static view. Regions are normalized to the logical image plane and never inferred at scoring time from computer vision. The region contract is specified in `ZONE-HOTSPOT-CONTRACT.md`.

## Modular scene library

Maintain a project-owned reusable scene library. The library should be reusable enough to improve throughput but parameterized enough to avoid teaching learners that “the third shelf on the left” or one recurring camera angle signals an answer.

Initial families:

- room shells: hallway, classroom, restroom, cafeteria, kitchen, gym, stairwell, lobby, mechanical/utility, custodial closet, loading/service, exterior;
- walls, floors, door frames, windows, stairs, railings, counters, shelving;
- doors and exit-route geometry;
- fire-equipment mounts/cabinets and generic extinguishers where appropriate;
- custodial carts, hand trucks, dollies, bins, trash containers;
- cleaning containers and generic chemical-container forms without brands;
- ladders and access equipment admitted by the content taxonomy;
- cords, plugs, receptacles, extension cords, equipment bodies;
- wet-floor signs/cones and other controls;
- spills/puddles and controlled floor-state shapes;
- broken glass/sharp debris forms;
- generic food-service equipment and food-contact surfaces;
- PPE forms;
- people/poses where needed;
- boxes, cases, stacked materials, loose clutter, mats, and other safe-background props.

Every reusable component needs:

- stable asset ID/version;
- source file hash and rendered-derivative hashes;
- original/rights-cleared provenance;
- scale/coordinate conventions;
- semantic tags and forbidden uses;
- known confusion/accidental-hazard risks;
- review state.

### Blender library behavior

Current Blender 5.2 LTS supports reusable asset libraries and linked/appended/packed assets. For this project, a future pilot should prefer **project-local, version-pinned asset inputs**, not network-dependent online libraries. Linked assets can be useful during authoring, but the publication manifest must resolve to immutable hashes so a later library edit cannot silently change an already-scored scene.

Blender 5.2 LTS also supports headless/background rendering and Freestyle non-photorealistic line rendering. Those are sufficient capability signals for a pilot; R2.9 did not install Blender or claim that its default Freestyle output is visually adequate.

## Route selection by scene class

### Route S — modular SVG

Prefer when:

- the important relationships are planar or can be depicted in a controlled 2.5D perspective;
- target recognition does not depend on precise 3D body pose/contact;
- objects are already available as reviewed components;
- changed-scene transfer can be achieved by moving/swapping components without perspective breakage.

Likely candidates: simple wet-floor hallway, blocked fire-equipment zone, exposed broken-glass area, some chemical-shelf arrangements.

### Route B — deterministic 3D block + static line render

Prefer when:

- camera perspective or occlusion determines fairness;
- object contact and relative placement matter;
- the scene needs systematic camera/location variants;
- precise ladder, cord, stack, hand-truck, doorway, or equipment relationships are important;
- a segmentation/depth pass would materially help QA.

Likely candidates: ladder misuse, electrical cord/plug condition, material-handling/stacks, some egress scenes.

### Route C — 3D block + human 2D cleanup

Prefer when Route B gives correct geometry but poor final readability/style, especially for:

- people and hand/body poses;
- flexible clothing/PPE;
- soft bags, towels, cloths;
- irregular liquids/organic messes;
- food-service handling scenes;
- clutter where raw 3D edges create visual noise.

Cleanup is a controlled derivative, not permission to redraw the semantic scene freely. Any edited silhouette or relation relevant to a target, decoy, or safe-background assertion is a semantic change requiring new region generation and re-review.

### Route H — human illustration from blocking package

Use selectively when the cost of building a reusable 3D asset or rig exceeds the expected reuse. The illustrator receives:

- semantic manifest;
- project-owned reference/blocking render;
- target/decoy inventory;
- forbidden/negative-hazard checklist;
- composition constraints;
- rights/security instructions;
- acceptance checklist.

A contract must address ownership/license explicitly. The U.S. Copyright Office notes that specially commissioned work-made-for-hire treatment is category- and agreement-dependent; do not assume payment alone transfers copyright.

## Scene families and transfer variants

A scene family should encode a concept independently of one location. A family may share room shell/assets while varying:

- camera position/focal framing;
- target position within fair visibility bounds;
- safe-background clutter;
- decoy identity and placement;
- person pose/orientation;
- route through a room;
- object side/angle;
- nearby but nonanswer-bearing props.

Do not vary the controlling safety fact unless creating a new semantic variant. For example, moving a damaged cord is a transfer variant; changing it from damaged insulation to a missing grounding pin is a different hazard condition and must carry a different claim/semantic version.

### Anti-location-learning guard

For any concept family with more than one scene:

- avoid fixed target coordinates;
- avoid always placing decoys in the same quadrant;
- rotate/recompose room shells where feasible;
- vary safe clutter without creating accidental hazards;
- keep target size/visibility within a reviewed fairness band;
- prevent one camera/template from dominating a hazard category.

The pilot should measure target centroid and zone distribution across variants before a production quantity is selected.

## Negative scene inventory

Before production, each scene gets a negative inventory that identifies conditions that must **not** accidentally appear. Minimum sweep categories:

- slips/trips: unintended spill, loose mat edge, cord/hose crossing path, clutter;
- egress/fire: blocked exit path, obstructed extinguisher/door, misleading emergency-sign geometry;
- chemical: unlabeled-looking container, incompatible-looking mixing setup, chemical in food/drink-like container, spill/splash, missing clearly task-required PPE;
- electrical: damaged insulation, missing/deformed plug pin, wet energized equipment, unsafe cord routing;
- sharps: broken glass/protruding sharp object;
- material handling: unstable stack/cart/load, obstructed vision, falling-object condition;
- biological/sanitation: visible contamination/cross-contamination cue;
- machine/tool: missing guard/damage/unsafe setup when such equipment appears;
- correction leakage: the intended correction already visibly performed;
- accessibility/security: text/color-only cues or answer-bearing signage/metadata.

An object can be a safe background element only after this sweep. Silence is not proof of safety.

## Asset formats

### Canonical source

Keep editable source native to its route:

- SVG component/source files for Route S;
- `.blend` plus project-owned linked/packed asset inputs for Routes B/C;
- layered editable human-art source for Route H/C cleanup where available.

### Controlling web/print derivative

Prefer:

- SVG when the scene remains clear, compact, and free of answer-bearing internal IDs/metadata;
- lossless or visually lossless raster master for complex line scenes, with web derivatives generated from it;
- one logical aspect ratio and coordinate plane shared by web, print, zones, and descriptions.

Do not expose semantic target names through filenames, SVG IDs, element titles, hidden layers, comments, image URLs, or debug manifests in the pre-answer UI.

### Offline payload discipline

The runtime does not need Blender files, authoring layers, depth maps, segmentation passes, or generator weights. Offline content packs should contain only the reviewed final static learner asset, interaction regions needed by the player, accessibility text appropriate to the pack, source/explanation data, and immutable hashes/versions. Build-time provenance remains in the source corpus/release manifest.

## Deterministic manifest

Each publish candidate should produce a machine-readable build record containing:

- scene source hash;
- semantic manifest hash;
- all component asset IDs + hashes;
- camera/composition parameters;
- authoring route and tool versions;
- deterministic render command/settings where applicable;
- human cleanup source/output hashes where applicable;
- optional generator/model/input/settings hashes where a pilot derivative exists;
- final master image hash;
- web/print derivative hashes;
- zone/hotspot file hash;
- accessibility record hash;
- source-claim set hash;
- QA result set hash;
- rights record hash;
- publication timestamp and immutable content-pack ID.

A build that cannot identify all inputs is not publication-ready.

## Why not one universal pipeline?

A universal SVG pipeline overpays for complex pose/perspective work. A universal 3D pipeline overpays for simple flat scenes and soft/organic illustration. A universal human path weakens deterministic changed-scene reuse. A universal generative path fails the project's zero-accidental-hazard, decoy, provenance, and reproducibility requirements.

The common contract matters more than a common drawing tool. The proposed mixed architecture keeps semantics, QA, accessibility, versioning, and runtime behavior uniform while selecting the least risky authoring mechanism per scene class.

## Adoption status

**Recommendation: adopt as the R2.9 architecture candidate, not as production approval.**

Promotion to a maintained production decision requires the evidence-bearing pilot in `PILOT-PLAN.md`. The pilot must replace inferred throughput/cost values and demonstrate zero unresolved semantic/QA failures on representative accepted scenes before any bulk scene program begins.

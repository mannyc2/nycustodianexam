# Illustration production pipeline
## Normalized recovered contract — 2026-08-19

> **Current authority:** `VISUAL_AUTHORING_POLICY.md` supersedes this recovered
> contract wherever it requires SVG/vector output, forbids a public released
> sample as a style reference, or treats model regeneration as the controlling
> source. Production uses Codex-native image generation and preserves accepted
> reviewed raster bytes. The QA, accessibility, lineage, and failure material
> below remains supporting guidance.

**Source:** normalized from `ILLUSTRATION_PIPELINE_SPEC.md` authored 2026-08-17. Original recovered SHA-256: `30a81fafc77b58fab34c7c0290b06573a524e8a0d4dfbad782858cc929815502`.

**Scope warning:** the source pipeline used a 120-tool taxonomy snapshot available at that time. `../docs/TAXONOMY.md` now controls content scope. Reconcile IDs/rows against the current taxonomy before producing batches.

---

# 1. Production objective

Create original monochrome instructional illustrations for a free study website without copying, tracing, or reconstructing an official sample's particular subject or composition. Publicly released official sample artwork may be supplied as a high-level visual-style reference under `VISUAL_AUTHORING_POLICY.md`.

Recovered planning scope at the time of the source artifact:

- 120 canonical tool concepts in the then-current snapshot;
- approximately 150 accepted launch tool drawings = one canonical view per tool plus ~30 targeted alternate views;
- three candidate/angle briefs per tool when useful;
- a possible full three-angle library of 360 accepted tool drawings;
- approximately 60 original hazard scenes across 12 school environments.

These are editorial/production quantities, never official exam counts or weights.

---

# 2. Locked visual genre

Use a consistent text-prompted instructional genre:

> Original instructional line drawing for a free study website. Closely match the high-level visual language of the supplied publicly released sample: clean monochrome black ink on white, comparable contour weight, sparse interior detail, restrained functional hatching, generous whitespace, and plain test-booklet framing. No photorealism, color, gradients, decorative texture, dramatic lighting, cast shadow, background clutter, brand, logo, watermark, caption, answer label, or callout arrow. Geometry must be mechanically coherent and recognizable in black-and-white print. Create an original subject and composition; do not trace or reproduce a particular sample drawing.

## Canonical asset geometry

### Isolated tools

- raster working/master target: 2048×2048 grayscale on white when raster generation is used;
- object occupies roughly 68–82% of the canvas with safe clear margins;
- final tool delivery is a reviewed raster derivative from the preserved native Codex output; do not require SVG conversion;
- canonical presentation uses white background even when SVG background is transparent;
- the accepted native raster master is the visual source of truth.

### Tool detail

A separate close-detail asset may show one decisive component—jaw, tooth, flange, spreader, tip, plug, etc.—but answer-bearing callouts must not be baked into a scored image.

### Confusable-pair comparison

Compose two independently accepted assets in equal panels with matched footprint/camera conditions. Do not use a fused pair image as the source of truth and do not imply real-world scale.

### Hazard scenes

- 3:2 landscape master, historically specified around 3072×2048;
- generic school environment, never a recognizable real school;
- stable readable perspective;
- targets separated spatially;
- web/print derivatives generated after technical acceptance;
- raster is acceptable when scene vectorization harms target/decoy clarity.

## Line hierarchy

For final tool SVGs using a 1024-unit viewBox, normalize approximately:

- 6 units — outer silhouette / primary contour;
- 4 units — structural interior line;
- 2.5 units — fine mechanism / functional hatch;
- never retain accidental hairlines below about 2 units;
- preserve sufficient negative space so nearby lines do not fuse.

Use mechanically appropriate round/clean joins. Web ink should be near-black; print may use full black.

## Shading / ink

Isolated tools use no gradients or continuous gray modeling. Sparse single-direction hatching is allowed only when it explains depth/curvature/material/cavity. Decorative crosshatching is prohibited.

Hazard scenes may use restrained flat gray tones, but hazards must remain legible in grayscale and reduced print size. No cinematic effects or visual emphasis that leaks answers.

---

# 3. Angle and composition rules

Every tool brief may define:

1. canonical three-quarter view;
2. side/profile view exposing the mechanism;
3. feature-revealing alternate: opposite three-quarter, top, underside, open position, or other useful view.

Do not force an angle that hides the decisive feature. Avoid extreme foreshortening, fisheye perspective, arbitrary cutaways, exploded views, or dramatic camera angles.

Isolated-object rules:

- exactly one canonical tool or deliberately defined matched set;
- no hands, people, workbench, floor, pipe, wall, debris, fasteners, demonstration context, or accessories unless the derivative is specifically commissioned as in-use content;
- no text/pseudotext/numbers/brands/logos/certification marks/seals/watermarks;
- no duplicated, fused, floating, intersecting, melted, or impossible components;
- decisive feature remains readable at smallest target print size.

---

# 4. Hazard-scene authoring

Allowed initial environment taxonomy from the recovered pipeline:

- restroom;
- hallway;
- classroom;
- cafeteria;
- kitchen;
- gym;
- stairwell;
- entrance;
- mechanical room;
- custodial closet;
- loading/storage;
- exterior snow/ice.

Scene rules:

- generic architecture;
- simplified non-identifiable adults when people are needed;
- no gore;
- standard scene planning may use roughly 2–4 intended hazards plus documented safe-but-suspicious decoys, but this is a site choice;
- zero-hazard control scenes may be authored separately;
- no arrows, circles, glow, color coding, captions, target counts, or answer emphasis;
- target hotspots are human-authored after art acceptance, never inferred at runtime;
- a negative-scene inventory must explicitly prevent accidental hazards.

Every scene receives a separate accidental-hazard sweep. Electrical plugs/cords are always checked for coherent pins/blades/strain relief/conductors/routing even when they are background details.

---

# 5. Generation prompts

Every generation request is assembled from a versioned brief containing at least:

- taxonomy/scene ID;
- canonical concept name;
- family/category;
- source/evidence status;
- `must_show` technical features;
- forbidden traits from confusables;
- variant/angle or environment;
- prompt-template version;
- explicit declarations that official/third-party images were not provided.

The generator receives the taxonomy/technical brief and may receive publicly released official sample artwork as a high-level style reference. No secure, remembered, candidate-recalled, or rights-unreviewed FOIL image is allowed. Do not request reconstruction of a sample subject, item, choices, or composition.

For confusable sets, prefer independently generating/rendering each tool with the same camera spec and composing them later. A model-generated pair sheet is only a draft because defining traits can bleed across concepts.

Examples of decisive contrasts used in prior prototypes include:

- pipe wrench: offset opposing serrated jaws + adjustment nut vs adjustable wrench: smooth parallel jaws + worm screw;
- flange plunger: protruding lower flange vs cup plunger: plain cup/rim;
- claw hammer: split claw vs ball-peen hammer: hemispherical peen;
- stepladder: self-supporting A-frame/locked spreaders vs extension ladder: overlapping rung sections/no rear support legs.

---

# 6. Raster → vector pipeline

The recovered raster-to-vector sequence below is historical. Current isolated tools remain raster-native. If an exceptional downstream need motivates vectorization, treat it as a derivative and repeat visual/security QA; vector output never replaces the accepted raster master.

For historical isolated-tool vector experiments:

1. **Technical raster gate first.** Never vectorize a mechanically wrong candidate.
2. Normalize grayscale/levels and remove obvious noise.
3. Test appropriate tracing methods for line/contour/filled geometry.
4. Manually normalize the vector: restore line hierarchy, redraw malformed decisive parts, remove duplicate outlines/islands/redundant nodes, preserve openings/negative space, delete any text.
5. Optimize SVG with a pinned tool/config while preserving `viewBox`, required IDs, and visible geometry.
6. Sanitize: reject scripts, event handlers, external URLs, `<foreignObject>`, remote fonts, and embedded raster images.
7. Render at several web sizes plus intended print size and compare to the technically accepted source.
8. Release only after binary technical/vector/accessibility/rights review.

Hazard scenes and isolated tools may remain raster. Current policy does not require tracing or manual vector redraw.

---

# 7. Binary QA and failure workflow

Each candidate revision is either `PASS` or `FAIL` against all applicable gates. “Almost” and “needs edit” may be workflow statuses, never release results.

Tool global checks include:

- correct class/subtype and part count;
- plausible mechanical connections and axes;
- correct symmetry/asymmetry;
- coherent handles/shafts/jaws/blades/wheels/hoses/cords/pivots/fasteners;
- decisive openings/teeth/tips/flanges readable at target size;
- no trait leakage from confusable tools;
- no dependence on text/color for recognition;
- no accidental unsafe-use depiction;
- agreement between taxonomy/source and reviewed visual geometry;
- reviewer/date/revision/failure codes logged.

Scene acceptance requires:

- every intended target visibly and individually locatable;
- no target depending only on color/unreadable text/specialist inference;
- **no accidental hazard anywhere else in the scene**;
- every decoy documented and actually safe as depicted;
- target/decoy separation and coherent people/tools/architecture/fire/electrical/storage geometry;
- readable web + print output;
- valid hotspot geometry;
- neutral pre-answer accessible description that does not leak target count or interpretation;
- independent accidental-hazard sweep signoff.

## Failure correction

Use the smallest justified repair path:

- **Regenerate** for wrong silhouette/class/part count, missing decisive feature, blended pair traits, ambiguous composition, or distributed scene errors.
- **Manual raster edit** for tightly local, fully determined cleanup.
- **Manual vector edit** when the accepted raster is correct but tracing/path cleanup failed.
- **Illustrator escalation** after repeated generation failures, high cleanup cost, or inability to preserve a high-risk decisive feature.

Every manual edit creates a new revision with before/after lineage, edit description, re-review, and refreshed accessibility/vector checks where visible content changed.

---

# 8. Stable IDs, metadata, and lineage

Use semantic IDs, not mutable row numbers. Existing canonical taxonomy IDs win over any recovered proposed IDs.

Accepted asset identity should separate:

- canonical concept/scene ID;
- variant/angle;
- candidate revision lineage;
- semantic accepted version.

Major versions represent meaning/subtype/hazard-inventory/decisive-geometry changes; minor versions may add accepted angle/composition/decoy/meaningful alt/hotspot changes; patch versions are nonsemantic cleanup/optimization/metadata fixes.

The recovered sidecar model requires recording:

- concept/scene ID and asset type;
- variant/version/state;
- prompt version/hash;
- generator/service/version/seed where available;
- explicit `officialImageInputs: false`;
- all input assets;
- human raster/vector/layout/text/hotspot edits;
- tracing/optimizer settings;
- every QA gate + reviewer;
- neutral and full descriptions;
- similarity review;
- provider-terms/legal notes.

Large raster masters may live in LFS/object storage when needed; SVG/JSON/CSV metadata belongs in normal source control.

---

# 9. Two accessibility-description modes

Accessibility text is authored after technical PASS and before release; it is not copied blindly from the answer key.

## Tool — scored/neutral

Describe observable geometry without naming the tool, close synonym, intended use, family label, or correctness cue. Do not conceal features visible to a sighted learner.

## Tool — learning/full

After commitment, name the tool and explain the visible decisive features and confusable contrast.

## Hazard — scored/neutral

Describe room, people, objects, and actions in stable zone order without calling anything safe/unsafe/hazard/decoy and without stating target count.

## Hazard — learning/full

Name intended hazards in zone order, explain correction concepts, and explain authored decoys. If the description discovers an unauthored issue, the scene fails instead of adding it casually to the key.

Do not expose canonical answer names via scored SVG `<title>` elements, public filenames/accessibility labels, or other metadata used by the active quiz UI. The application supplies mode-appropriate accessibility text from reviewed metadata.

---

# 10. Rights and provenance

Recommended public provenance wording remains conservative: site-created / AI-assisted / human-reviewed where accurate, not copied from or based on official exam artwork.

Do not claim blanket copyright ownership over untouched AI-generated pixels. Track human-authored redrawing, composition, selection/arrangement, text, hotspot maps, and other creative contributions separately. Legal conclusions about copyright registration, substantial similarity, provider terms, contractor assignments, trademark/seal/trade-dress issues, or threatened claims require counsel.

Risk reduction rules:

- independently supported subject briefs; a publicly released sample may condition high-level style only;
- no named-artist imitation;
- compare accepted output against public samples for suspiciously close expression whether the sample was supplied inside or outside the generation system;
- reject suspiciously close composition/expression;
- do not rely on fair use as the production plan.

---

# 11. Pilot and cost discipline

Before scaling, run a small difficult pilot spanning high-confusion hand tools, ladders/plungers/hammers/mops/machines/electrical details plus multiple hazard environments. Blind-score technical accuracy, style consistency, vectorizability, editability/reproducibility, and cost/latency; technical accuracy dominates.

The recovered cost model concluded that generation API spend is **not** the main cost driver. Human technical review, vector/raster correction, accessibility descriptions, metadata, hotspot authoring, and rights documentation dominate.

Historical planning figures from the source artifact (not quotes and not current vendor pricing):

- ~150 tool drawings + 60 scenes: approximately 160–230 labor hours and ~$7,500–$17,000 fully costed;
- full 360-tool-angle library + 60 scenes: roughly 300–430 hours and ~$14,000–$29,000;
- hybrid AI draft + illustrator cleanup: roughly ~$10,000–$22,000.

These estimates must be recalibrated from the actual pilot and must not be treated as procurement quotes.

---

# 12. Release checklist

Before publishing any illustration batch:

- current taxonomy diff complete;
- stable IDs mapped;
- any public sample style reference is provenance-recorded and was not used to reproduce item content/composition;
- prompt/generator/input/candidate lineage recorded;
- every tool technical checklist PASS;
- every scene target/decoy + accidental-hazard sweep PASS;
- raster integrity/derivative QA PASS for isolated tools; vector QA only when a vector derivative actually exists;
- neutral + learning accessibility descriptions PASS;
- nonvisual-equivalent dependencies satisfied where required;
- rights/similarity review PASS;
- human edit log complete;
- provider terms reviewed for the production date/account;
- smallest intended phone/print render passes.

The next production task is the Codex-native pilot in `VISUAL_AUTHORING_POLICY.md`, followed by generation of the full Tier A/B launch inventory with the measured working dimensions and batch rules.

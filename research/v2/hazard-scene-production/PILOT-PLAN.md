# R2.9 Evidence-Bearing Pilot Plan

Status: **required before production adoption; not executed by this research lane**.

No pilot output is automatically a production scene. Every candidate still needs normal content/source/review admission.

## Objective

Replace R2.9's inferred method scores and planning-hour assumptions with measured evidence about:

- accepted-scene labor and iteration count;
- accidental-hazard/decoy failure rate;
- geometry and target-separation quality;
- changed-scene variant efficiency;
- hotspot stability and authoring effort;
- accessibility-authoring effort and leakage failures;
- phone/print readability;
- deterministic rebuild behavior;
- rights/provenance completeness;
- offline derivative size;
- optional controlled-generative derivative overhead/benefit.

## Tool coordinates for the pilot

At R2.9 research time the current coordinates are:

- Blender `5.2.0 LTS` — current LTS/stable release on 2026-08-21;
- Bun `1.4.0` — current stable Bun on 2026-08-21;
- Effect `4.0.0-rc.111` — current v4 RC package coordinate on 2026-08-21.

The pilot must refresh and then pin exact coordinates at its own launch. R2.9 does **not** require Blender to be orchestrated through Effect; use Effect only where future workspace code genuinely benefits from typed errors/resources/concurrency.

## Pilot sample

Build **16 primary method-comparison candidates + 8 changed-scene transfer variants = 24 static scene candidates**.

For each of eight mandatory hazard classes, produce the same semantic brief through two candidate routes selected to expose a real tradeoff. Then create one changed-scene transfer variant through the better-performing deterministic route for that class.

Do not compare methods using different hazard meanings.

### P1 — wet floor

Source basis: OSHA 29 CFR 1910.22 surface-condition/spill requirements.

Base brief: generic school hallway or entry tile with one authored wet-surface target and at least one safe-but-suspicious decoy. The correction itself must not already be depicted.

Compare:

- Route S: modular SVG/2D composition;
- Route B/C: simple 3D block + deterministic line render, cleanup only if needed.

Transfer variant: move wet area and safe props to a materially different zone/camera without changing the rule.

### P2 — chemical storage/incompatibility

Source basis: OSHA HazCom for labels/SDS handling-storage plus CDC bleach guidance for the pilot's specific no-mixing rule. Final content admission should prefer exact product/SDS evidence where a real incompatibility is depicted.

Base brief: generic custodial-closet work area showing an observable setup that represents a source-backed incompatible cleaning-chemical use/storage condition without depending on tiny label text or color coding.

Compare:

- Route S: modular shelf/container SVG scene;
- Route C/H: deterministic block + human cleanup/illustration to make container identity/relations readable without brands.

Transfer variant: change shelving/camera/container positions while preserving the same source-backed relation.

### P3 — damaged cord / grounding

Source basis: OSHA 29 CFR 1910.334 visual inspection, damaged cord/plug removal, grounding continuity.

Base brief: cord-and-plug-connected custodial equipment with one visually decisive damaged-insulation **or** missing/deformed grounding condition. Do not combine multiple electrical rules in one target for the comparison.

Compare:

- Route S: modular vector;
- Route B/C: 3D equipment/cord block + line render/cleanup.

Transfer variant: different equipment orientation and cord path with the same exact damage class.

### P4 — ladder misuse

Source basis: OSHA 29 CFR 1910.23, including stable/level use and stepladder cap/top-step rule.

Base brief: school maintenance/custodial context with one person/ladder relation. Use a rule visible by pose/geometry; avoid textual ladder labels.

Compare:

- Route B: 3D block + deterministic line render;
- Route C/H: same block + human 2D cleanup or human illustrator constrained by the block.

Transfer variant: different camera/room and person orientation, same ladder condition.

### P5 — blocked egress / fire equipment

Source basis: OSHA 29 CFR 1910.37 and 1910.157.

Base brief: choose **one** primary rule for a candidate (blocked exit route or inaccessible extinguisher) and use the other only as safe background if it can be guaranteed nonhazardous.

Compare:

- Route S: modular SVG hallway/door/fire-equipment scene;
- Route B: 3D block + line render.

Transfer variant: different obstruction object/placement while preserving the same rule.

### P6 — lifting / material handling

Source basis: NIOSH ergonomic manual-material-handling guidance; content editor must avoid presenting the NIOSH lifting equation as a universal simple weight limit.

Base brief: an observable handling/posture/visibility or unstable-load condition that can be explained without unsupported numeric weight claims.

Compare:

- Route B: 3D block with person/load geometry;
- Route C/H: block + human cleanup/illustration.

Transfer variant: different load form/orientation/room with the same admitted principle.

### P7 — broken glass / sharps

Source basis: OSHA 1910.22's requirement to keep walking-working surfaces free of sharp/protruding hazards; stronger claim/source may be added by content review if the scene depicts handling/disposal behavior.

Base brief: exposed broken-glass/sharp condition in a school/custodial environment. Do not imply contaminated medical sharps unless the source/content profile supports that separate claim.

Compare:

- Route S: modular SVG;
- Route C/H: block/illustrated irregular debris.

Transfer variant: different room/surface and shard distribution while preserving recognizability at phone/print size.

### P8 — food-service contamination

Source basis: FDA 2022 Food Code with December 2024 supplement, including separation of poisonous/toxic materials from food/equipment/utensils and working-container identification. Jurisdiction/content scope review remains required because the Food Code is model guidance.

Base brief: cafeteria/kitchen scene with one visually clear contamination-risk relationship that does not rely only on reading a label.

Compare:

- Route C: deterministic kitchen block + human cleanup;
- Route H: human illustration from the same blocking/semantic package.

Transfer variant: different counter/storage arrangement with the same admitted principle.

## Decoys

Each base brief must include at least one documented safe-but-suspicious decoy where doing so is fair and source-defensible. The goal is to measure decoy control, not maximize decoy count.

Examples of acceptable decoy design strategy:

- a cord placed near but not across the walking path, intact and undamaged;
- a properly positioned ladder component that looks visually salient but is being used correctly;
- a box near, but not obstructing, an exit/fire-equipment access zone;
- a closed/appropriately placed generic chemical container whose observable state is safe;
- a dry reflective floor patch distinct from an actual spill only if the distinction remains fair in grayscale/phone use.

Any decoy for which reviewers cannot give a source-backed “safe as depicted” rationale is rejected.

## Production procedure per candidate

### Stage 0 — source/semantic brief

Record:

- claim IDs and exact source locators;
- intended target condition;
- correction concept;
- environment;
- target/decoy inventory;
- negative-hazard inventory;
- allowed/forbidden cues;
- expected decisive visual features;
- accessibility risks.

The two compared methods receive the same brief.

### Stage 1 — source asset/block authoring

Track active labor separately for:

- component creation;
- scene composition/blocking;
- person/pose work;
- cleanup;
- variant modification.

Do not count reusable library setup entirely as one scene's marginal cost; record setup and per-scene hours separately.

### Stage 2 — candidate render/drawing

Freeze candidate hash before semantic review. For deterministic routes, record exact tool version/command/settings and run a repeat build on the same pinned environment.

### Stage 3 — blind semantic review

A reviewer who did not author the scene receives the final static candidate plus the semantic/source inventory (not the production history) and records stable QA codes.

Required zero-tolerance findings:

- missing/ambiguous targets: 0 unresolved;
- accidental hazards: 0 unresolved;
- unsafe decoys: 0 unresolved;
- impossible meaning-bearing geometry: 0 unresolved;
- text/color-only cues: 0 unresolved;
- correction already depicted: 0 unresolved;
- rights/provenance gaps: 0 unresolved.

A repaired candidate restarts review and increments revision count.

### Stage 4 — zone/hotspot authoring

Author regions only after semantic acceptance. Record:

- authoring minutes;
- minimum semantic-region separation;
- tolerance-expanded overlap count;
- each target visible area at canonical phone render sizes;
- blind reviewer marker coordinates.

### Stage 5 — accessibility authoring/review

Record:

- neutral overview/zone authoring minutes;
- full-description authoring minutes;
- leakage failures;
- zone-order mismatches;
- blind nonvisual-equivalent review outcome;
- keyboard/screen-reader issues.

### Stage 6 — phone/print review

Test a documented small-phone viewport and grayscale print/PDF profile. Measure:

- target/decoy recognition by reviewers;
- number of zoom/pan actions needed;
- any decisive feature lost;
- annotation/key readability after reveal.

### Stage 7 — transfer variant

Create one changed-scene variant using the same semantic rule. Record marginal hours, reused component count, and any semantic QA regression.

## Optional generative subpilot

Do **not** run free-form text-to-image as an alternative scored-scene method.

If desired, select **two already accepted deterministic base scenes** from different classes and apply one controlled image-to-image style derivative using only project-owned render/depth/segmentation/edge inputs. The derivative must satisfy every gate in `GENERATIVE-BOUNDARY.md`.

Record:

- generator/model/control coordinates/hashes;
- generation attempts;
- rejected attempt count/reasons;
- structural metrics;
- human review hours;
- whether visual/readability quality improved;
- total accepted-derivative labor vs ordinary human cleanup.

A derivative rejection is a valid pilot result. Do not tune until a passing image appears without counting all attempts/review time.

## Metrics

For every candidate capture:

- `setup_hours_allocated`;
- `scene_author_hours`;
- `render_generation_minutes`;
- `semantic_review_hours`;
- `repair_hours`;
- `hotspot_hours`;
- `accessibility_hours`;
- `phone_print_qa_hours`;
- `rights_admin_hours`;
- `total_active_hours_to_acceptance`;
- `revision_count`;
- QA failure count by stable code;
- `accepted_first_review` boolean;
- `changed_variant_hours`;
- component reuse count;
- deterministic same-environment rebuild: hash equal / visually equal / drift;
- canonical master bytes;
- web derivative bytes;
- print derivative bytes;
- target/decoy reviewer classification accuracy;
- target marker dispersion/region separation;
- accessibility leakage failures;
- rights/provenance completeness.

Do not use a single weighted “quality score” to hide release-blocking failures.

## Review roles

At minimum separate these responsibilities; one person may fill multiple roles except where independence is explicitly required:

1. **content/source reviewer** — claim is within scope and source-supported;
2. **scene author** — builds/draws the candidate;
3. **independent accidental-hazard/decoy reviewer** — cannot be the sole scene author;
4. **interaction reviewer** — zones/hotspots/matching;
5. **accessibility/print reviewer**;
6. **rights/provenance reviewer**.

For any generative subpilot, the generator operator cannot be the sole accidental-hazard reviewer.

## Promotion gates for the architecture

The mixed architecture is promoted from research recommendation to maintained production decision only if the pilot shows:

- at least one accepted scene in all eight classes;
- no unresolved critical QA failures in any accepted candidate;
- all accepted deterministic candidates have complete manifests and repeat-build records;
- all accepted scenes pass phone/print/accessibility checks;
- transfer variants do not systematically reintroduce ambiguity/location shortcuts;
- measured labor supports an affordable launch scene count;
- the modular library demonstrates real reuse without template-answer leakage;
- rights/provenance records are complete.

Method-specific promotion:

- Route S needs accepted examples showing that reusable SVG composition stays readable and nonrepetitive.
- Route B needs accepted examples showing line render quality without excessive cleanup.
- Route C needs evidence that cleanup preserves semantics/hotspots at manageable review cost.
- Route H needs explicit rights terms and measured cost/variant speed.
- Generative derivative remains noncontrolling unless it beats deterministic/human cleanup on total accepted-scene labor while passing every structural/rights/reproducibility gate.

## Decision output from the pilot

Publish raw timings, candidate/revision manifests, failure logs, screenshots/print artifacts, and method summary. The decision should route **scene classes**, not declare one universal winner unless the evidence unexpectedly supports one.

If the 24-candidate pilot is too expensive to complete, stop after the first four classes and report a partial pilot rather than shrinking review rigor. Missing evidence is preferable to bulk-producing unvalidated scenes.

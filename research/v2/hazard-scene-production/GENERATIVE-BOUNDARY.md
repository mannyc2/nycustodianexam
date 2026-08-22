# Generative Boundary

Evidence status: **INFERRED policy from confirmed product invariants plus current reproducibility/control/rights evidence.**

## Decision

**Do not use text-to-image output as the controlling production architecture for scored hazard scenes.**

A future pilot may test **controlled image-to-image stylization only as a nonauthoritative derivative** from project-owned deterministic inputs. The deterministic pre-generation render remains the fallback/control and all safety meaning, object inventory, target/decoy identity, hotspot geometry, and source facts remain human-authored.

No generative model or provider is selected by R2.9. No model inference was run.

## Why text-to-image is excluded from the controlling path

The lane's acceptance problem is not merely visual quality. A publishable scored scene must prove that:

- every intended target is present and unambiguous;
- every safe-but-suspicious decoy is safe exactly as depicted;
- no additional hazard was accidentally invented;
- target geometry and hotspot regions agree;
- no answer-bearing text/color cue appeared;
- mechanical/safety geometry is coherent;
- variants preserve only the intended changes;
- rights and provenance are auditable;
- the build can be reconstructed from immutable inputs.

Free-form text-to-image cannot make those statements authoritative. Prompt/seed pinning reduces one source of variation but is insufficient: current PyTorch documentation states that complete reproducibility is not guaranteed across releases, commits, platforms, or CPU/GPU even with identical seeds. Diffusers likewise documents reproducibility controls while warning that exact cross-platform results are not guaranteed.

ControlNet/depth/edge/pose conditioning demonstrates that modern diffusion pipelines can be guided by structural inputs, but guidance is not an object-preservation proof. A controlled model can still alter silhouettes, contacts, small features, labels, hands, plugs, cords, ladder geometry, or background objects. That means the output still requires the same independent semantic review as a human redraw.

The apparent speed advantage of unconstrained generation therefore does not translate into a safe production advantage for scored scenes unless the acceptance/rejection burden is demonstrated by pilot measurement.

## Permitted R&D experiment: controlled image-to-image derivative

If a later pilot tests generation, all of the following are mandatory.

### Project-owned inputs only

The generation job may consume only inputs whose rights/provenance are already controlled by the project, for example:

- project-authored Blender render;
- project-authored SVG rasterization;
- project-generated depth pass;
- project-generated object-instance segmentation pass;
- project-generated edge/canny pass;
- project-authored pose/keypoint specification;
- project-owned texture/brush inputs if used.

Do not use official exam/DCS art, third-party school photographs, scraped illustrations, product photography, or style references as generation inputs.

### Immutable generation coordinates

Record at minimum:

- base model repository + exact immutable revision/weights SHA-256;
- any ControlNet/adapter repository + exact revision/weights SHA-256;
- inference framework + exact version/commit;
- Python/PyTorch/CUDA/cuDNN versions if applicable;
- device class and relevant deterministic settings;
- scheduler/sampler name + configuration;
- seed and generator-device choice;
- inference-step count, guidance scale, strength/denoise value;
- control-conditioning scales;
- prompt and negative-prompt bytes/hashes;
- every control-input hash;
- output dimensions/color-space parameters;
- output hash;
- generation-script/container/lockfile hashes.

The seed is only one coordinate. A manifest that records a seed without the rest is insufficient.

### Determinism settings

Where the stack permits:

- use a CPU `torch.Generator` for noise when following Diffusers reproducibility guidance;
- enable deterministic algorithms with hard failure rather than warning-only mode;
- disable nondeterministic benchmarking;
- pin the complete software/hardware environment used for the accepted output;
- preserve the accepted output bytes even if regeneration is later close-but-not-bit-identical.

These controls improve repeatability; they do not convert model output into source-of-truth geometry.

## Structural rejection gates

The deterministic pre-generation asset is the reference. A generated derivative is automatically rejected if any gate fails.

The following numeric thresholds are **R2.9 pilot defaults, not established standards**. The pilot may tighten them; loosening them requires a written safety rationale and independent review.

### Inventory gate — exact

- Authored object-instance count: **100% preserved**.
- Target instance IDs: **100% preserved**.
- Decoy instance IDs: **100% preserved**.
- No unauthored foreground/background object that could reasonably be interpreted as a hazard or correction.
- No object deletion, merge, split, duplicate, or hallucinated prop affecting interpretation.

Automated detection can assist, but a human reviewer decides inventory preservation.

### Target/decoy silhouette gate — rigid critical objects

For each rigid target/decoy whose shape or placement carries meaning:

- output-vs-control silhouette intersection-over-union after registration: **>= 0.995**;
- maximum authored keypoint displacement: **<= 0.5% of the shorter image dimension**;
- target/decoy centroid displacement: **<= 0.25% of the shorter image dimension**.

Examples include ladder feet/top step, plug pins, exposed-damage boundary, extinguisher outline/access obstruction, door/egress boundaries, stack supports, and container placement.

### Contact/occlusion gate — exact semantic relations

Every authored contact/occlusion predicate must be preserved: **100% pass**. Examples:

- object blocks/not-blocks exit path;
- box obstructs/not-obstructs extinguisher access;
- foot is/is-not on top step;
- cord crosses/not-crosses travel path;
- plug has/has-not a grounding pin;
- chemical containers are/are-not in the authored incompatible arrangement;
- glass lies within/not-within the authored walking area.

A single material relation change is rejection regardless of aggregate image similarity.

### Depth-order gate

For every authored critical pair with an occlusion/depth relation, the relative order must match the deterministic depth/scene graph: **100% pass**.

### Text/symbol gate

Reject any added or altered readable text, pseudo-text, logo, watermark, brand mark, safety label, sign wording, pictogram, arrow, glow, circle, or color emphasis that was not explicitly authored.

### Hazard/decoy gate

Independent reviewer must find:

- **0 accidental hazards**;
- **0 unsafe decoys**;
- **0 missing/ambiguous intended targets**;
- **0 already-depicted corrections**;
- **0 answer-bearing visual cues**.

This gate is not averaged. One unresolved finding rejects the derivative.

### Hotspot gate

Regions are never transferred blindly from the deterministic control if the generated pixels moved. Either:

1. the derivative passes the strict geometry gates and the final regions are regenerated/registered to the derivative; or
2. the derivative is rejected.

Every target-region overlay must pass human edge/meaning inspection at phone and print sizes. Any overlap that makes one user mark eligible for multiple target/decoy meanings is release-blocking.

### Accessibility gate

Regenerate neutral/full descriptions against the final derivative and compare them to the semantic manifest. If the derivative requires describing any new object/condition not in the manifest, it is rejected rather than silently expanding the scene semantics.

## Human review independence

The person who tuned prompts/controls or selected the generated candidate cannot be the sole accidental-hazard reviewer. At least one independent reviewer receives:

- the final derivative without the prompt history;
- the target/decoy/safe inventory;
- the negative-hazard checklist;
- the deterministic control render;
- automated difference/segmentation reports.

The reviewer records stable QA failure codes from `QA-FAILURE-CATALOG.csv`.

## Rights boundary

Generation does not remove rights review.

The U.S. Copyright Office's 2025 AI Part 2 report states that generative output can be protected only where sufficient human-authored expressive elements are present; mere prompting does not by itself provide human authorship. Human creative modification/arrangement can matter. This is a copyrightability point, not a complete clearance of model-training, provider-contract, trademark, publicity, or source-input risks.

Therefore a future generative experiment must record:

- provider/model license applicable to the exact checkpoint;
- commercial-use/output terms;
- model/source provenance available to the project;
- project-owned input attestations;
- human contribution record;
- legal/rights review disposition.

R2.9 deliberately avoids selecting a generative provider/checkpoint because the recommended production architecture does not require one.

## Controlling fallback

Every generative derivative must retain the deterministic pre-generation render as a complete, publishable fallback candidate. If the model, provider, checkpoint, hardware, or license later becomes unavailable, the project can continue without reconstructing the scene from model output.

The semantic manifest, not the generated image, remains the authority for:

- safety fact;
- target/decoy classification;
- object identity;
- correction concept;
- source citation;
- zone order.

## Promotion criteria

Controlled image-to-image may be reconsidered for production only if the pilot demonstrates, on multiple scene classes:

- zero unresolved semantic/rights/accessibility failures;
- lower total accepted-scene labor than deterministic + human cleanup after counting rejected generations and review;
- stable repeatability within the pinned environment;
- no hotspot/description maintenance penalty;
- no dependency on external non-project inputs;
- a clear visual benefit that cannot be obtained more cheaply with deterministic line styling or human cleanup.

Until those conditions are measured, its adoption status is **pilot-only / noncontrolling**.

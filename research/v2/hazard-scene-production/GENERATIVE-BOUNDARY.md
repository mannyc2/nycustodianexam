# Codex-native generation boundary

**Status:** reconciled maintained handoff. The original R2.9 exclusion of
text-to-image from controlling production is superseded.

## Decision

Use Codex-native image generation for controlling hazard-scene artwork. The
accepted reviewed output bytes are authoritative for what the learner sees.
Prompt/seed repeatability and deterministic pre-generation SVG/3D renders are not
required.

Generation is editorial production, not application runtime behavior. Preserve
accepted image bytes; the app and compiler never invoke a model.

## Allowed inputs

A generation job may use:

- the maintained semantic scene brief and source-backed visual constraints;
- project-authored reference diagrams or blocking material where helpful;
- independently rights-cleared visual references; and
- publicly released official sample artwork as a high-level style reference.

For public sample references, ask Codex to copy the visual language—monochrome
line weight, sparse detail, restrained hatching, whitespace, framing, and plain
test-booklet economy—while creating a new subject and composition.

Never input secure, remembered, candidate-recalled, or rights-unreviewed FOIL
exam material. Never ask the model to reconstruct a released item's tool,
choices, scene, answer, labels, or arrangement.

## Required input record

Record the exact brief/prompt, concept or scene ID, taxonomy revision, source
coordinates, public reference provenance, input hashes when files are supplied,
requested dimensions/count, candidate ID, native output dimensions, and any
generator/model identifier the Codex surface exposes. Do not invent hidden model
coordinates that the surface does not provide.

## Semantic acceptance—not generative reproducibility

Each final scene must agree with an independently authored manifest containing:

- supported claim and correction concept;
- target and decoy instances;
- why every decoy is safe as depicted;
- safe/structural background inventory;
- negative inventory of hazards that must not appear;
- stable zone order; and
- intended composition and visibility constraints.

A human review of the final pixels is mandatory. Reject the scene for one
missing/ambiguous target, accidental hazard, unsafe decoy, impossible
meaning-bearing relationship, added text/logo, answer cue, or semantic-manifest
mismatch. Similarity scores and image-model confidence cannot waive a failure.

## Regions and accessibility

Author target/decoy regions against the accepted final pixels. Do not transfer
regions from a prompt, draft, or blocking render without inspection. Any visible
image change requires region and description impact review.

Author neutral pre-answer and full post-answer descriptions from the accepted
image and semantic manifest. If description work discovers an unauthored object
or condition, reject/revise the scene rather than silently expanding its key.

## Candidate selection and correction

The Codex operator may generate multiple candidates, but every rejected attempt
and reason should remain in lineage. Regenerate when composition, pose,
inventory, target visibility, or meaning-bearing geometry is wrong. Limit raster
editing to local, fully determined corrections and hash/re-review the result as a
new candidate.

The generator operator cannot be the sole accidental-hazard reviewer. At least
one independent review sees the final image and target/decoy/negative inventory.

## Rights and similarity

At production time record applicable provider/output terms, input provenance,
and human selection/editing/arrangement. Review public-sample-conditioned output
for suspiciously close expression. Reject tracing, replicated composition,
recognizable logos/trade dress, or anything suggesting official authorship.

## Delivery determinism

Preserve the accepted native master and SHA-256. Record web/print transformation
settings and derivative hashes. Rebuilding the site from pinned masters must be
deterministic; regenerating the master from Codex need not be.

Strip nonessential metadata and use opaque public asset names. Pre-answer files,
DOM, accessibility data, pack manifests, source maps, or alternate candidates
must not reveal target meaning or count.

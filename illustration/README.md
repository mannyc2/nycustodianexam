# Illustration production corpus

This directory contains the maintained production decisions, recovered historical pipeline material, and non-production prototypes for original study-site visuals.

## Authority boundary

`../docs/TAXONOMY.md` controls **which concepts are in scope** and the decisive distinctions an asset must preserve.

For isolated tool assets:

1. [`TOOL_GEOMETRY_PIPELINE.md`](TOOL_GEOMETRY_PIPELINE.md) is the current production architecture.
2. [`PIPELINE_SPEC.md`](PIPELINE_SPEC.md) is the recovered 2026-08-17 AI-assisted pipeline. Its visual QA, accessibility, rights, failure, and hazard-scene material remain useful, but its AI-first raster source assumption is **superseded for mechanically modeled tools**.
3. `examples/` contains historical hand-authored SVG prototypes. They are not accepted production assets.

For hazard scenes and broader contextual illustrations, the recovered `PIPELINE_SPEC.md` remains supporting guidance until a dedicated current decision supersedes it. Do not apply the tool B-rep pipeline to scenes merely by analogy.

## Current tool decision

The tool source of truth should normally be project-owned deterministic geometry or deterministic 2D construction:

```text
cited facts / standards constraints / original measurements
  -> versioned parameter and evidence record
  -> project-authored CadQuery / OCCT B-rep
  -> automated validation
  -> STEP AP242 neutral master
  -> OCCT hidden-line static SVG views
  -> deterministic PNG / WebP derivatives
  -> optional user-invoked atlas GLB
```

Scored questions use a fixed static asset revision. They do not expose rotation, because another angle can reveal a flange, tooth form, rear ladder section, machine underside, articulation detail, or another feature outside the authored scored view.

No GLB is downloaded automatically. Static views remain primary for print, offline/PWA operation, accessibility, and low-bandwidth delivery.

Image generation is not the controlling production styling step for mechanically modeled tools. A future generative derivative may be studied only under the restrictions in `TOOL_GEOMETRY_PIPELINE.md`; the verified deterministic render remains controlling.

## New research intake

[`../research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md`](../research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md) records the immutable-base audit and its integration limitations.

At the audited base it reported:

- 67 Tier A/B-containing heading records;
- 65 proposed normalized illustration assets;
- 14 confusable pairs;
- no accepted Class A/B external geometry;
- four Class C proof models pending human mechanical review;
- no approved production asset.

The full research/POC bundle is identified by SHA-256 in that report but has not yet been imported into this repository. Do not reconstruct the missing files from the completion summary.

## Recovered historical artifacts

- `PIPELINE_SPEC.md` — normalized 2026-08-17 production contract and QA guidance.
- `examples/` — recovered hand-authored SVG prototypes and matched comparison panels.
- `RECOVERED_ASSET_MANIFEST.md` — integrity/provenance record for the older QA/schema/prompt artifact set.

The recovered Library artifact set included:

- `tool-qa-matrix.csv` — 120-row historical snapshot;
- `hazard-cue-qa-matrix.csv` — 33-row historical snapshot;
- `illustration-asset-metadata.schema.json`;
- `prompt-templates.md`;
- `asset-review-log-template.csv`;
- `cost-model-assumptions.csv`.

Those files are hash-recorded rather than treated as current scope. Their inventory predates the immutable-base 65-asset audit and cannot override the current taxonomy or tool-geometry decision.

## Security and rights

Never use an official exam/DCS sample image as a generation input, tracing source, or style reference. Production art must be original or independently rights-cleared. FOIL access is not a reuse license.

Downloadable supplier/community CAD is reference material by default, not a redistributable production asset. Modification and public redistribution rights must be established separately from mechanical correctness.

When geometry or rights cannot be established, the correct result is **no published illustration**.

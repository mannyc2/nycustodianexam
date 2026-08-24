# Implementation Plans

Revised on 2026-08-23 after maintainer feedback and the first implementation
proof. These are three execution plans for the visual/research sequence. The
application now has its own milestone sequence in `product/ROUTES.md`.

The established 65-concept tool/PPE inventory and 14 comparison records are
inputs, not a separate planning phase. The visual pilot is a mandatory
checkpoint inside production, not a separate project.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---:|---:|---|---|
| 001 | Generate and approve the complete tool/PPE visual library | P1 | L | — | DONE — 65 accepted masters and 14 accepted deterministic comparisons verified |
| 002 | Generate and approve the launch hazard-scene bank | P1 | L | Plan 001 pilot checkpoint | DONE — 18 accepted scenes passed exact-pixel independent review, release verification, and checksum closure |
| 003 | Normalize and reduce the research corpus through connected @GitHub | P1 | L | Plans 001 and 002 merged; exact post-visual `main` SHA | TODO — preflight refreshed for content-inventory provenance |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) |
REJECTED (with one-line rationale)

## How the sequence works

- Plan 001 immediately materializes the known inventory into production records
  and starts generation. Its pilot tranche is a stopping point: review native
  output, hard/confusable tools, style consistency, derivative behavior, and
  review labor before continuing the same plan at scale.
- After the Plan 001 checkpoint is approved, Plan 001 can continue generating
  the remaining tool/PPE masters while Plan 002 generates hazard scenes.
- Plan 003 starts only after accepted image work is on main. It is not a light
  prose refresh. It audits every tracked research file, consolidates unique
  findings, removes duplicates and obsolete/raw/generated material, repairs
  references, and leaves a small navigable research surface. Git history at the
  pre-cleanup SHA is the archive.

## Established inputs

- 65 stable tool/PPE concepts are already established by
  research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md and the recovered
  taxonomy inventory.
- 14 confusable/comparison records are already established. They are composed
  from independently accepted masters, not treated as 14 new model-generation
  jobs.
- Eight hazard families, twelve target environments, and an exact 18-scene
  launch matrix are now materialized: two positives per family plus two
  zero-hazard controls.
- Codex-native reviewed raster bytes are production authority. Historical
  CAD/SVG work is research evidence, not a production route.

## Research cleanup baseline

The current Git tree contains 439 tracked files under research, including 385
under research/v2. The tracked corpus is about 3.9 MB; a recovered-input ZIP is
about 2.3 MB by itself. Exact duplicate groups already exist, and many other
files repeat conclusions semantically across initial-pass, prompt-curation,
individual R2 lanes, and R2.90 synthesis.

The local workspace also contains an ignored, reproducible node_modules
directory under the Effect compiler fixture: about 152 MB and 3,859 files. It
is not present on GitHub, so Plan 003 treats its removal as a separate exact-path
workspace cleanup rather than pretending a PR can delete it.

## Audit boundary

These plans cover visual production and research-corpus normalization. The
application is now scaffolded separately under `apps/` and `packages/`; its
runtime correctness, application security, production performance,
dependencies, browser matrix, and test-suite work follow the milestones and
evidence gates in `product/` rather than expanding Plan 003.

# R2.9 Final GitHub Receipt

Publication status: **COMPLETE**  
Research status: **COMPLETE AS AN ARCHITECTURE/PRODUCTION-METHOD LANE; evidence-bearing scene pilot remains required before production adoption**

## Repository identity

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-hazard-scene-production`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/16`
- Allowed path: `research/v2/hazard-scene-production/**`
- Final source-drift recheck: **PASS / identical** immediately before this receipt (`ahead_by=0`, `behind_by=0`)
- PR scope recheck before final bookkeeping: **PASS** — all changed files were under the allowed lane path.

## Lane commits

1. Start checkpoint: `3a6a1b836875719cb0c1d97815c39f2bce699215` — `research(r2.9): publish start receipt`
2. Source/evidence baseline checkpoint: `3a9a499a90d5a6e05cb860a402853aa189e7a51f` — source-ledger baseline published after mandatory repository reading/current-source setup.
3. Final substantive research head: `0dd9ad3c154a8e197cd3b97f28c18e7fb431c4b0` — all required research/specialist artifacts finalized before checksum bookkeeping.
4. Checksum-manifest commit: `c73f3f4f010f1f1e41e6dd4428f8623538a1c0a8` — `research(r2.9): publish checksum manifest`.
5. Final receipt commit: this file is the last lane artifact. A Git commit cannot embed its own SHA without changing that SHA; the immutable final head returned by GitHub after this write is reported in the PR/final chat handoff.

## Exact dated tool coordinates

Coordinates observed and recorded by the lane at research time:

- `effect@4.0.0-rc.111` — current v4 RC coordinate; no Effect code/runtime probe was required.
- Bun `1.4.0` — current stable coordinate; no local Bun runtime probe was required.
- Blender `5.2.0 LTS` — current stable/LTS coordinate selected for the future evidence-bearing 3D pilot; Blender was not installed or rendered in R2.9.

No `@effect/platform-bun`, image-model checkpoint/provider, browser 3D engine, or new production package dependency was selected by this lane.

## What was published

Shared lane artifacts:

- `README.md`
- `START-RECEIPT.md`
- `SOURCE-LEDGER.csv`
- `REPORT.md`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `MANIFEST.sha256`
- `FINAL-RECEIPT.md`

R2.9 specialist artifacts:

- `PIPELINE-COMPARISON.csv`
- `SCENE-ASSET-ARCHITECTURE.md`
- `GENERATIVE-BOUNDARY.md`
- `QA-FAILURE-CATALOG.csv`
- `ZONE-HOTSPOT-CONTRACT.md`
- `ACCESSIBILITY-AUTHORING.md`
- `VERSIONING-CONTRACT.md`
- `PILOT-PLAN.md`
- `COST-THROUGHPUT-MODEL.csv`
- `WORKSPACE-INTEGRATION.md`

`MANIFEST.sha256` contains SHA-256 values for the 16 finalized substantive/pre-receipt artifacts at substantive head `0dd9ad3c154a8e197cd3b97f28c18e7fb431c4b0`. It intentionally excludes itself and this final receipt to avoid self-reference. The manifest file itself has SHA-256:

`066862452e8b81001c9e7958ed6fe2d04453aa37071004fb14fd641ba8bc7c23`

## Evidence conclusion

R2.9 does **not** select either isolated-tool CAD/B-rep or generative imagery as a universal scene architecture.

The preferred architecture candidate is **mixed and deterministic-first**:

1. modular project-owned SVG/2D composition for simple/mostly planar scenes;
2. project-owned Blender/procedural 3D blocking plus deterministic static line rendering where perspective, occlusion, pose, contact, or transfer variants benefit from 3D;
3. constrained human 2D cleanup/illustration where people, soft/organic forms, or visual simplification justify it;
4. one common semantic-manifest, QA, accessibility, zone/hotspot, rights/provenance, immutable-versioning, and build-manifest contract across all routes.

Text-to-image is excluded from controlling scored production. Controlled image-to-image may be tested only as an optional noncontrolling derivative from project-owned deterministic structural inputs, with strict structural rejection gates and the deterministic pre-generation render retained as fallback/control.

For every scored scene, three authorities must agree: the authored semantic manifest, the final reviewed static pixels, and the human-authored normalized target/decoy regions. Any mismatch is release-blocking.

## Pilot and runtime measurement receipt

R2.9 intentionally produced no runtime scene probe and no production asset. It did not install/run Blender, execute an image model, create an Effect fixture, or benchmark scene throughput. Those actions were not needed to establish the architecture candidate without fabricating empirical evidence.

Instead, `PILOT-PLAN.md` defines the evidence-bearing next gate: **16 paired base candidates plus 8 changed-scene transfer variants = 24 static candidates** across wet floor, chemical storage/incompatibility, damaged cord/grounding, ladder misuse, blocked egress/fire equipment, lifting/material handling, broken glass/sharps, and food-service contamination.

The pilot must measure accepted-scene labor, failure/revision rates, deterministic rebuild behavior, target/decoy discrimination, hotspot/marker behavior, phone/print/accessibility results, rights/provenance completeness, variant cost, and actual asset sizes before the method mix or production economics are promoted.

The hotspot starting tolerance (`12 CSS px` at 1x with a `1.5%` short-edge cap) and generative structural thresholds are explicitly **pilot hypotheses**, not production standards or observations.

## Cost/throughput evidence boundary

`COST-THROUGHPUT-MODEL.csv` contains only `INFERRED` planning priors and formulas. It does not present those hours as benchmarks, quotes, commitments, or launch dates. No contractor rate, GPU price, provider API cost, or production schedule was invented.

## Scope and safety

- No production scene or content item was approved.
- No official/secure exam artwork was reconstructed or used as a generation input.
- No production code, package graph, lockfile, workflow, repository setting, tag, release, product contract, or maintained architecture file outside the authorized lane was modified.
- No force-push or merge was performed.
- No workflow was created, modified, or dispatched.
- The PR remains draft as required by the lane publication contract.

Generated at `2026-08-22T00:51:01Z`.

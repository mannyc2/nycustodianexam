# R2.9 — Hazard-scene production architecture

Status: **research lane in progress; no production scene is approved by this lane**.

This directory is the durable output of `prompts/research-v2/09-hazard-scene-production.md`, launched from immutable source `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb` on branch `research/v2-hazard-scene-production`.

## Scope

R2.9 independently evaluates scene-production methods for original scored school/custodial hazard scenes. The isolated-tool CAD/B-rep lane is evidence about reproducibility and versioning, not authority for scene architecture. The recovered AI-first illustration pipeline is likewise input, not a default.

The governing release invariants are:

- a controlling static, unannotated scored view;
- no target-count or answer leakage before commitment;
- human-authored target/decoy semantics and normalized regions;
- zero unresolved accidental hazards and zero unsafe decoys;
- stable zone order shared by visual feedback, nonvisual equivalents, and print keys;
- original or independently rights-cleared assets only;
- immutable scene/version identity for historic attempts;
- phone, print, offline, and WCAG 2.2 AA behavior;
- no production approval without a later evidence-bearing pilot and content review.

## Current upstream coordinates checked for this lane

- Effect v4: `effect@4.0.0-rc.111` (`rc` dist-tag; prerelease), upstream Git tag `effect@4.0.0-rc.111`.
- Bun: `1.4.0`, current stable release shown by the official Bun site; no Bun runtime probe was required for this research-only lane.
- Blender: `5.2.0 LTS`, released 2026-07-14; selected only as the current production/LTS coordinate for the proposed future 3D pilot, not installed or probed here.

No `@effect/platform-bun` package or other Effect ecosystem dependency is selected by R2.9. No package graph is changed.

## Early direction, pending the completed comparison

The evidence favors a **mixed, deterministic-first scene pipeline** rather than either CAD-everywhere or generative-everywhere:

1. project-owned modular SVG/2D composition for simple, mostly planar scene classes;
2. project-owned Blender blocking and deterministic line/static rendering where perspective, occlusion, pose, or changed-scene transfer materially benefit from 3D;
3. human 2D cleanup/illustration where soft/organic forms or people would be inefficient to model, constrained by an authored semantic scene manifest;
4. text-to-image excluded from the controlling production path;
5. controlled image-to-image, if tested at all, restricted to a nonauthoritative derivative with the deterministic pre-generation render retained as fallback and strict structural rejection gates.

The final report, matrices, contracts, pilot design, and receipts will make this recommendation auditable and identify what still requires measurement.

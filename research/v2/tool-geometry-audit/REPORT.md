# R2.10 report: deterministic tool-geometry evidence and POC audit

## Executive verdict

The immutable source branch was verified at `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`. The audit was performed only under the authorized lane path and the PR remains draft.

The recovered GitHub corpus is insufficient to rebuild, inspect, or approve any of the four proof models. All four are classified `evidence-blocked`:

- adjustable wrench;
- pipe wrench;
- cup plunger;
- flange plunger.

This is an audit failure of evidence availability and identity, not a finding that the underlying concept of deterministic project-authored geometry is unsound.

## Load-bearing findings

### 1. The present raw tree is not the tree described by its README

The immutable path contains seven files totaling 57,375 bytes: a README, a proposed schema, and five report parts. The README says compact inventories, ledgers, POC source/parameters, summaries, and manifests are also preserved. They are not present.

### 2. The recorded report identity is impossible for the present part set

The five blobs total 47,528 bytes. The README records a 91,620-byte original report. The 44,092-byte shortfall proves the present part set cannot reproduce the recorded report byte stream or SHA-256.

### 3. Archive and POC hashes are coordinates, not verified objects

The outer archive, nested research bundle, and POC evidence archive are absent. Their SHA-256 values remain useful recovery coordinates, but this lane cannot verify an object that is not available.

### 4. The actual POC definitions cannot be audited

No model script, parameter record, B-rep, STEP, STL, GLB, SVG, raster, per-asset manifest, validation JSON, or build log exists in the immutable Git tree. Therefore the requested part count, intersections, pose, tooth/jaw/flange geometry, bounds, STEP re-import, mesh watertightness, metadata, views, and visibility checks are all blocked.

### 5. Current taxonomy has drifted from the recovered narrative inventory

The current taxonomy still contains 14 registered pairs, but the set is different. Several raw-report pairs are absent or renamed; several current pairs do not appear in the raw narrative. The missing `confusable-pairs.csv` cannot control current work. A new machine-readable inventory must be generated from the current taxonomy SHA.

The four POC narrative invariants remain directionally aligned with current taxonomy, but geometry alignment cannot be observed without model bytes.

### 6. Rights remain independent from geometry and reproducibility

The source ledger required to connect parameters to exact standards, references, measurements, and rights is absent. Current official sources confirm:

- ISO 6787 is a dimensional/performance standard for adjustable wrenches, not a complete reusable generic model;
- ETIM/ECLASS are classification/property systems, not geometry sources;
- STEP and glTF are interchange/delivery formats, not geometry rights;
- Objaverse requires object-level license review;
- Poly Haven is CC0 but no suitable tool asset was selected;
- ABO remains blocked because official surfaces conflict between CC BY 4.0 and CC BY-NC 4.0.

The repository MIT license does not prove that missing parameter inputs, third-party reference material, or model derivatives are rights-cleared.
This is a source-and-license evidence audit, not legal advice or a legal clearance opinion.

### 7. Exact STEP byte identity needs a declared policy

A committed environment smoke probe used Python 3.13.5, CadQuery 2.8.0, and OCCT 7.9.3.1. Identical geometry produced:

- matching STL bytes;
- different STEP bytes in one process because the translator product counter changed;
- different STEP bytes across processes because the header timestamp changed;
- matching normalized STEP hashes after removing only those observed volatile fields;
- matching re-imported 10 x 20 x 30 mm bounds.

This does not invalidate the historical 79/79 claim, but it makes the absent manifest and commands essential. Future reproducibility must state whether it requires raw bytes, normalized headers, or semantic/geometric equivalence.

## Per-POC disposition

| POC | Classification | Why |
|---|---|---|
| Adjustable wrench | evidence-blocked | model, parameters, validation, and derivatives absent |
| Pipe wrench | evidence-blocked | model, parameters, validation, and derivatives absent |
| Cup plunger | evidence-blocked | model, parameters, validation, and derivatives absent |
| Flange plunger | evidence-blocked | model, parameters, validation, and derivatives absent |

None is production-approved.

## Required recovery and rerun sequence

1. Recover the exact outer or nested archive bytes and verify their recorded SHA-256 values.
2. Verify every compact file against `SOURCE-HASHES.sha256`.
3. Verify the internal deliverable and POC manifests before executing code.
4. Recreate the exact historical dependency/container environment.
5. Run two clean POC builds with raw logs and complete output inventories.
6. Compare raw hashes, normalized container/header hashes, and semantic geometry checks separately.
7. Inspect every model and derivative named in the lane prompt.
8. Regenerate taxonomy inventory and confusable pairs at the current source SHA.
9. Complete rights, answer-leak, accessibility, and qualified mechanical review against exact hashes.
10. Only then consider a separate production-approval decision.

## Effect and Bun coordinates

- Effect: not used; this lane contains no Effect code and no Effect package coordinate.
- Bun: not installed and not used; this is a Python/CadQuery evidence audit, not a TypeScript workspace probe.

The lane still followed the repository's publication and evidence-status contract.

## Conclusion

The maintained deterministic geometry direction remains plausible and preferable to generative geometry for mechanically decisive isolated tools. The four recovered POC success claims, however, cannot be promoted beyond historical narrative until the exact source tree and build evidence are recovered. Reproducibility, mechanical correctness, rights clearance, accessibility, answer-leak safety, and production approval remain distinct gates.

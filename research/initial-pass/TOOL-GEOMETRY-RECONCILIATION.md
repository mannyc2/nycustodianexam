# Deterministic tool-geometry raw bundle reconciliation

## Raw availability

The previously unavailable research is now supplied as the complete unpacked 90-file tree inside the consolidated archive.

Committed for direct review in extracted form:

- full `research-report.md`;
- source/rights ledger;
- taxonomy inventory;
- confusable pairs;
- first 20 visual-invariant sheets;
- proposed asset-manifest Schema;
- POC build and comparison scripts;
- POC summary, build environment, determinism record, manifest, and checksum list;
- preview and other binary derivative hashes in `EXCLUDED-BINARY-LEDGER.csv`;
- per-object parameter/source/QA JSON;
- per-object SVG views.

The consolidated uploaded ZIP was verified locally but is not duplicated in GitHub. STEP/STL/GLB and duplicate raster derivatives remain in that user-supplied archive and are recorded by exact hash in `EXCLUDED-BINARY-LEDGER.csv`; review-relevant textual records and SVG views are committed in extracted form.

## Verification

- consolidated archive SHA-256: `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5`;
- path/symlink checks: passed;
- secret-pattern scan of text/config/source files: no findings;
- `poc-build-a/SHA256SUMS`: 79/79 entries verified;
- `determinism-comparison.json`: exact match, 79 files versus 79 files;
- recorded controlled environment: Linux, Python 3.13.5, no network required.

The earlier reported SHA-256 for the original nested `research-bundle.zip` cannot be reverified because that exact ZIP byte stream is not in the supplied archive. Repacking the extracted tree would not reproduce the original ZIP identity.

## Comparison with existing normalized repository guidance

The current maintained `illustration/TOOL_GEOMETRY_PIPELINE.md` captures the raw report's major architecture correctly:

- evidence/measurement records;
- project-authored CadQuery/OCCT B-rep;
- validation;
- STEP AP242 neutral master;
- static hidden-line SVG control views;
- optional atlas GLB;
- fixed scored views;
- rights/mechanical/accessibility/leak review;
- no production approval from reproducibility alone.

The raw bundle adds the evidence that was previously missing:

- exact source ledger;
- the 65-asset inventory and 14 confusion pairs;
- detailed visual invariants;
- parameter/provenance records;
- build scripts;
- model/render outputs and validation receipts.

## Status

- research corpus: recovered;
- POC reproducibility evidence: verified against the supplied extracted files;
- rights/source conclusions: available for review, not re-adjudicated in this normalization pass;
- human mechanical approval: still pending;
- production approval: none.

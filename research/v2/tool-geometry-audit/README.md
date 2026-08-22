# R2.10 deterministic tool-geometry audit

This lane audits the recovered deterministic tool-geometry research and four proof-of-concept models without granting production approval.

## Immutable coordinates

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-tool-geometry-audit`
- Draft PR: https://github.com/mannyc2/nycustodianexam/pull/17
- Allowed path: `research/v2/tool-geometry-audit/**`

## Verdict

The GitHub-preserved corpus is not sufficient to reproduce or mechanically inspect any of the four POCs. The present raw tree contains seven files: one README, one proposed JSON Schema, and five report parts. It does not contain the named `build_poc.py`, parameter records, source/rights ledger, inventories, POC summaries, internal manifests, build trees, or generated derivatives.

The five present report parts total 47,528 bytes, while the raw README claims they reconstruct a 91,620-byte report. Therefore the present part set cannot match the recorded report identity. The original archive hashes remain provenance coordinates only because the corresponding archive bytes are absent.

Each POC is classified `evidence-blocked`. This status is narrower and more accurate than `non-reproducible`: the build cannot be attempted because the source package is unavailable, not because the model code was executed and failed.

## Files

- `REPORT.md`: full findings and recommendations.
- `RAW-BUNDLE-IDENTITY.md`: Git tree versus recorded archive identity.
- `REBUILD-RECEIPT.md`: environment and rebuild/probe results.
- `CHECKSUM-AUDIT.csv`: every available recorded checksum and verification state.
- `TAXONOMY-DIFF.csv`: old report claims versus current taxonomy.
- `SOURCE-RIGHTS-AUDIT.csv`: reference and redistribution audit.
- `POC-PARAMETER-AUDIT.csv`: parameter provenance gaps.
- `POC-GEOMETRY-AUDIT.csv`: per-POC geometry status.
- `DERIVATIVE-LINEAGE.csv`: claimed STEP/STL/GLB/SVG/PNG/WebP lineage.
- `ANSWER-LEAK-AUDIT.md`: metadata and scored-delivery controls.
- `HUMAN-MECHANICAL-REVIEW-PACKET.md`: exact questions for qualified reviewers.
- `SOURCE-LEDGER.csv`, `DECISION-MATRIX.csv`, `OPEN-QUESTIONS.csv`, `OPEN-ISSUES.csv`.
- `probes/` and `raw-results/`: committed scripts and raw observations.

No file in this lane is a production asset, certification, or mechanical approval.

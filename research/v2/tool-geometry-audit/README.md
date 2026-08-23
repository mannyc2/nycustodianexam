# R2.10 deterministic tool-geometry audit

This lane audits the deterministic tool-geometry research and four proof-of-
concept models without conflating reproducibility with production-art approval.

## Current status

The original R2.10 audit in PR #17 correctly found that the GitHub-preserved raw
tree was incomplete. A later exact archive recovery now supersedes its four
`evidence-blocked` classifications.

The exact recovered bundle is committed at
`recovered-input/research-bundle.zip`:

- bytes: `2,309,138`;
- SHA-256:
  `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`;
- archive members: `90`;
- uncompressed bytes: `6,289,966`;
- archive integrity: pass.

All 79 historical manifest entries verify. Two fresh builds reproduce all 79
files exactly, both against each other and against the recovered historical
build.

## Four POC dispositions

| POC | R2.10 classification | Durable disposition |
|---|---|---|
| adjustable wrench | reproducible and reviewable | accepted as POC/pipeline evidence; retired as production-art candidate |
| pipe wrench | reproducible and reviewable | accepted as POC/pipeline evidence; retired as production-art candidate |
| cup plunger | reproducible but requires model/view rework | accepted as POC/pipeline evidence; retired as production-art candidate |
| flange plunger | reproducible but requires model/view rework | accepted as POC/pipeline evidence; retired as production-art candidate |

“Retired” is a final disposition, not another blocker. These four models prove the
recovered deterministic pipeline can reproduce its artifacts. They are not the
site's shipping illustrations and need no production-asset approval after the
maintained visual-authoring policy selects another route.

## Navigation

- `REPORT.md` — current conclusions and POC dispositions.
- `RAW-BUNDLE-IDENTITY.md` — archive recovery and identity conflicts.
- `REBUILD-RECEIPT.md` — exact rerun environment, commands, and results.
- `POC-GEOMETRY-AUDIT.csv` and `POC-PARAMETER-AUDIT.csv` — per-POC evidence.
- `POC-VISUAL-REVIEW.md` — fixed-view inspection and retirement rationale.
- `ANSWER-LEAK-AUDIT.md` — derivative metadata findings.
- `CHECKSUM-AUDIT.csv`, `DECISION-MATRIX.csv`, `OPEN-ISSUES.csv`, and
  `OPEN-QUESTIONS.csv` — current evidence ledger.
- `raw-results/recovered-bundle-audit.json` — complete independent measurements.
- `probes/recovered_bundle_audit.py` — reproducible audit probe.

No file in this lane is an official exam asset, mechanical certification, or
shipping study-site illustration.

# R2.5 — Effect v4 browser bundling

Status: **BLOCKED — draft evidence packet published; runtime measurements outstanding**

This directory is the R2.5 lane for current Effect v4 browser bundling under Bun workspaces. It is scoped to research evidence only and does not alter maintained product architecture or production code.

## Read first

- `REPORT.md` — substantive result and blocker
- `DEPENDENCY-COHORT.md` — exact current package/tool coordinates
- `FIXTURE-MATRIX.csv` — P01–P13 status
- `REPRODUCIBILITY.md` — exact rerun procedure and environment
- `SOURCE-LEDGER.csv` — sources and limitations
- `DECISION-MATRIX.csv` — evidence-labeled decisions
- `OPEN-QUESTIONS.csv` — unresolved runtime questions
- `fixtures/bundle-lab/` — private Bun workspace/configuration skeleton
- `raw-results/` — raw environment/blocker captures
- `RAW-BUNDLE-FILES.csv`, `ROUTE-CLOSURES.csv`, `IMPORT-SENSITIVITY.csv`, `MINIFIER-COMPARISON.csv` — blocked measurement tables awaiting real output
- `BUDGET-RECOMMENDATION.csv` — deliberately contains no numeric R2.5 budget
- `CHUNK-GRAPH.md` — explains why no graph can yet be published
- `FINAL-RECEIPT.md` and `MANIFEST.sha256` — publication receipt/checksums

## Important non-result

There is no valid R2.5 `bun.lock` or byte corpus yet. The environment could not execute Bun or reach the npm registry. A handwritten lockfile or reuse of Effect v3 bytes would be false evidence, so the lane fails closed.

# Illustration production corpus

This directory recovers and normalizes the illustration-production work that previously existed only as ChatGPT artifacts and prototypes.

## Authority boundary

`../docs/TAXONOMY.md` controls **which concepts are in scope**. `PIPELINE_SPEC.md` controls **how an approved concept is illustrated, reviewed, versioned, and released**.

The recovered pipeline was authored against a 120-tool taxonomy snapshot. The current taxonomy has since been reconciled and expanded. Therefore the historical 120-row tool matrix and 33-row hazard matrix recovered from the Library are **production-baseline evidence, not current-scope authority**. They should be regenerated/reconciled from the current taxonomy before mass illustration production rather than copied forward blindly.

## Recovered artifacts

- `PIPELINE_SPEC.md` — normalized durable production contract.
- `examples/` — recovered hand-authored SVG prototypes and matched comparison panels.
- `RECOVERED_ASSET_MANIFEST.md` — integrity/provenance record for the larger historical QA/schema/prompt artifact set.

The full Library artifact set recovered in this pass also included:

- `tool-qa-matrix.csv` — 120 rows;
- `hazard-cue-qa-matrix.csv` — 33 rows;
- `illustration-asset-metadata.schema.json`;
- `prompt-templates.md`;
- `asset-review-log-template.csv`;
- `cost-model-assumptions.csv`.

Those files are hash-recorded in the manifest/recovery ledger. Because their inventory is tied to an older taxonomy snapshot, the normalized repository treats them as inputs to a future **current-taxonomy production reconciliation**, not as an immediately executable release checklist.

## Security / rights

Never use an official exam image or DCS sample image as a generation input or style reference. Production art must be original or independently rights-cleared. FOIL access is not a reuse license.

The SVGs under `examples/` are prototypes showing the intended technical genre and comparison presentation. They are not automatically approved production assets.

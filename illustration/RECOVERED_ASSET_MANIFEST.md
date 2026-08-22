# Recovered illustration artifact manifest

These hashes identify the exact durable artifacts recovered from the ChatGPT Library on 2026-08-19. The normalized production contract in this directory supersedes these files as an implementation-facing document, while `../docs/TAXONOMY.md` controls current content scope.

| Recovered artifact | SHA-256 | Recovery disposition |
|---|---|---|
| `ILLUSTRATION_PIPELINE_SPEC.md` | `30a81fafc77b58fab34c7c0290b06573a524e8a0d4dfbad782858cc929815502` | Normalized into `PIPELINE_SPEC.md` |
| `tool-qa-matrix.csv` | `d4c9fcb0e740cb4f7f860c36184cf23be422a969838d9b945aa65d68b278fe5d` | Historical 120-row baseline; reconcile/regenerate against current taxonomy before use |
| `hazard-cue-qa-matrix.csv` | `6bc68e1eef6316f9a803642d79eaf14fc25e57017dd71a72e8b0d0b596b6204a` | Historical 33-row baseline; reconcile before use |
| `illustration-asset-metadata.schema.json` | `dc271b7e334499229a84f5568fae1476ff5b2576155d2acce4db9b0e6953b594` | Input to current schema design; not automatically current runtime schema |
| `prompt-templates.md` | `95545fc892ffdbd5169a0fc74c22f611b311c8bf15e387ae486484824b07ff31` | Recovered prompt source; normalized rules live in pipeline spec |
| `asset-review-log-template.csv` | `70760c20af9caf2a31516d08f5c5c7a5e0c2f6202aef5c9f9392816618008233` | Historical production template |
| `cost-model-assumptions.csv` | `e7a192cce464b6758c62b58ea5e7d41f403d121de8f92a5fe583cafd20633df6` | Historical planning assumptions; not current quotes |

The recovered SVG example package also contained raster previews/contact sheets. Those are derivative renderings; this repository restores the SVG source prototypes rather than treating preview PNGs as additional source-of-truth art.

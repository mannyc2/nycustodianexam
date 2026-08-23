# R2.10 recovery final receipt

## Coordinates

- Repository: `mannyc2/nycustodianexam`
- Lane: `R2.10` recovery
- Base commit: `d94981c62e3834177f0db9bc387b2c601c40636b`
- Output branch: `research/v2-tool-geometry-audit-recovery`
- Pull request: https://github.com/mannyc2/nycustodianexam/pull/24
- Start receipt commit: `26107c780351730d1e94507711b179c6b874957a`
- Recovered-bundle commit: `0ab2f64`
- Allowed path: `research/v2/tool-geometry-audit/**`
- Force push: not used

The commit containing this receipt cannot record its own SHA. The pull request
and Git history provide that final coordinate.

## Recovered evidence

- Committed bundle: `recovered-input/research-bundle.zip`
- Bytes: `2,309,138`
- SHA-256:
  `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`
- ZIP entries: `90`
- Uncompressed bytes: `6,289,966`
- Integrity: pass

The exact archive contains the POC source, four parameter records, manifests,
historical build, derivatives, inventories, source/rights records, and report.
The earlier GitHub report fragments remain a distinct, conflicting package
state and are not silently equated with this archive.

## Rebuild receipt

A fresh Python 3.12.3 environment used CadQuery 2.8.0,
cadquery-ocp 7.9.3.1.1, OCP 7.9.3.1, trimesh 4.11.1, NumPy 2.3.5,
SciPy 1.17.0, Pillow 12.3.0, and CairoSVG 2.8.2.

- historical manifest: 79/79;
- fresh build A manifest: 79/79;
- fresh build B manifest: 79/79;
- historical versus A exact bytes: 79/79;
- A versus B exact bytes: 79/79.

The recovered historical receipt used Python 3.13.5. The exact cross-version
result is observed for these two environments only.

## Final POC dispositions

- adjustable wrench: `reproducible and reviewable`;
- pipe wrench: `reproducible and reviewable`;
- cup plunger: `reproducible but requires model/view rework`;
- flange plunger: `reproducible but requires model/view rework`.

All four are accepted as recovered research/pipeline evidence and retired as
production-art candidates. They will not be repaired into the shipping artwork.
Codex-native image generation is the production route established separately by
maintained illustration authority.

Retirement closes production mechanical, accessibility, and delivery review for
these POCs. It does not convert reproducibility into mechanical certification.

## Published verification material

- `probes/recovered_bundle_audit.py`
- `raw-results/recovered-bundle-audit.json`
- `raw-results/recovery-recheck.md`
- `CHECKSUM-AUDIT.csv`
- `RAW-BUNDLE-IDENTITY.md`
- `REBUILD-RECEIPT.md`
- `POC-GEOMETRY-AUDIT.csv`
- `POC-PARAMETER-AUDIT.csv`
- `POC-VISUAL-REVIEW.md`
- `ANSWER-LEAK-AUDIT.md`
- `SOURCE-RIGHTS-AUDIT.csv`
- `TAXONOMY-DIFF.csv`
- `OPEN-ISSUES.csv`
- `OPEN-QUESTIONS.csv`

R2.10 has no remaining evidence blocker. Future Codex-generated production
images have their own exact-byte content, rights, accessibility, leak, and
phone/print release gates.

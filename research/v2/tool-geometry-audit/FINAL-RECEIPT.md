# R2.10 final receipt

## GitHub coordinates

- Repository: `mannyc2/nycustodianexam`
- Lane: `R2.10`
- Source branch: `agent/chat-corpus-reconciliation`
- Required and observed source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Final source-drift comparison: identical; ahead 0, behind 0 at `2026-08-22T10:55:08Z`
- Output branch: `research/v2-tool-geometry-audit`
- Draft PR: https://github.com/mannyc2/nycustodianexam/pull/17
- Allowed path: `research/v2/tool-geometry-audit/**`
- Initial lane commit: `1e42f9b2c855fcff4a5ff2fc6a30c970118d61e6`
- Evidence baseline commit: `c9ce7a686dfbb918e6f9345e98204b31a14f0a9c`
- Substantive audit commit: `147bace26a9471fb17d1aa05504a78a5ed6ad7f7`
- Finalization commit: the commit containing this receipt and `MANIFEST.sha256`; its SHA is recorded in the draft PR body and returned in the external GitHub receipt because a commit cannot contain its own SHA.
- Force push: not used
- PR state: draft

## Audit disposition

The exact GitHub-preserved corpus is partial and internally inconsistent with its README. The five report parts total 47,528 bytes, not the recorded 91,620 bytes, and the source/model/parameter/manifests needed to execute or mechanically inspect the four POCs are absent.

Per-POC classification:

- adjustable wrench: `evidence-blocked`;
- pipe wrench: `evidence-blocked`;
- cup plunger: `evidence-blocked`;
- flange plunger: `evidence-blocked`.

No POC is production-approved, mechanically approved, rights-cleared, accessibility-approved, or answer-leak approved.

## Rebuild and probe receipt

- Exact historical POC rebuild: `BLOCKED_BEFORE_EXECUTION`.
- Reason: missing `build_poc.py`, parameter/provenance JSON, dependency/container pin, manifests, build trees, and derivatives.
- Effect coordinate: not applicable; no Effect code or package was used.
- Bun coordinate: not installed and not used.
- Audit runtime: Linux 6.18.35 x86_64, Python 3.13.5, CadQuery 2.8.0, cadquery-ocp 7.9.3.1.1, OCP 7.9.3.1, trimesh 4.11.1, NumPy 2.3.5, Pillow 12.3.0.
- Generic toolchain smoke: executed and committed; it is not POC evidence.
- Browser/GLB/SVG/raster/print/phone probes: not run because exact derivatives and delivery fixtures are absent.
- Mechanical review: not performed; a qualified-review packet is supplied for later exact-hash review.

## Key findings

1. The raw tree contains seven files totaling 57,375 bytes and omits the compact evidence its README says is preserved.
2. The present report parts are 44,092 bytes shorter than the recorded source report, so the recorded report SHA-256 cannot describe the present part set.
3. Archive and POC SHA-256 values are recovery coordinates only while the corresponding bytes are absent.
4. The current 14-pair taxonomy registry differs from the recovered 14-pair narrative set; the old missing inventory must not control current work.
5. Rights and parameter provenance remain blocked; ABO also has conflicting official license surfaces.
6. A generic current-environment probe found byte-stable STL output but volatile STEP headers/counters, requiring separate raw-byte, normalized-header, and semantic geometry reproducibility policies.
7. Reproducibility, mechanical correctness, rights clearance, accessibility, answer-leak safety, and production approval remain separate gates.

## Published outputs

Required lane outputs:

- `CHECKSUM-AUDIT.csv`
- `RAW-BUNDLE-IDENTITY.md`
- `REBUILD-RECEIPT.md`
- `TAXONOMY-DIFF.csv`
- `SOURCE-RIGHTS-AUDIT.csv`
- `POC-PARAMETER-AUDIT.csv`
- `POC-GEOMETRY-AUDIT.csv`
- `DERIVATIVE-LINEAGE.csv`
- `ANSWER-LEAK-AUDIT.md`
- `HUMAN-MECHANICAL-REVIEW-PACKET.md`
- `OPEN-ISSUES.csv`
- `raw-results/**`

Shared outputs:

- `README.md`
- `START-RECEIPT.md`
- `REPORT.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

Additional committed reproducibility material:

- `probes/toolchain_smoke.py`
- `probes/step_process_probe.py`
- `probes/requirements-audit.txt`

## Remaining blockers

The audit can be resumed only after recovering exact archive/source bytes and verifying their recorded hashes. A subsequent lane must then rebuild twice in the historical pinned environment, inspect exact model and derivative hashes, regenerate current-taxonomy inventories, and complete rights, leak, accessibility, and qualified mechanical review.

This receipt records an audit result, not production approval.

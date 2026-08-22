# Rebuild receipt

## POC rebuild status

`BLOCKED_BEFORE_EXECUTION`.

No POC was rebuilt. The exact `build_poc.py`, parameter JSON, dependency pin, build manifests, and expected outputs are absent from the immutable GitHub source. Reconstructing model code from report prose would create new evidence rather than audit the recovered evidence.

## Audit environment

- OS: Linux 6.18.35, x86_64, glibc 2.41
- Python: 3.13.5
- CadQuery: 2.8.0
- cadquery-ocp: 7.9.3.1.1
- OCP module: 7.9.3.1
- trimesh: 4.11.1
- Pillow: 12.3.0
- Bun: not installed; not needed for this Python/CAD audit
- Effect: not used; no Effect dependency or fixture applies to this lane

The historical POC environment is `UNKNOWN`. The report asks for pinned OS, Python, CadQuery, OCCT, trimesh, exporter, renderer, and encoder versions, but the GitHub-preserved raw evidence does not contain the environment lock or build script that would establish them.

## Commands run

```text
python probes/toolchain_smoke.py --out raw-results
python probes/step_process_probe.py raw-results/process-a/box.step
sleep 2
python probes/step_process_probe.py raw-results/process-b/box.step
```

## Toolchain smoke result

The committed smoke probe creates one 10 x 20 x 30 mm box, exports STEP and STL twice, re-imports STEP, and checks STL watertightness.

Observed:

- both STEP files re-imported to 10 x 20 x 30 mm;
- both STL files were watertight;
- two same-process STL hashes matched exactly;
- two same-process STEP hashes did not match;
- the same-process STEP difference was the OCCT translator product counter (`... 1` versus `... 2`);
- two separate-process STEP hashes also did not match;
- the separate-process STEP difference was the embedded `FILE_NAME` timestamp;
- normalizing only the observed timestamp/counter fields produced one common normalized STEP SHA-256: `911b522fda55449fd133849756f69920b1e9975bdfc5e8adc3fd51a3958c9b4c`.

This is an environment observation, not POC evidence. It demonstrates why a future rebuild must distinguish:

1. byte identity;
2. normalized container/header identity;
3. STEP re-import and topology/geometry equivalence;
4. mechanical correctness.

## Historical 79/79 claim

The report says two controlled Linux builds matched 79 of 79 compared file hashes. The claim cannot be rechecked because the comparison manifest, build trees, commands, and environment are absent. Given the observed OCCT header volatility, the recovered manifest must show exactly which files were compared and how STEP volatility was controlled.

## Required next rebuild

The POC rebuild becomes runnable only after exact recovery of:

- `build_poc.py` at recorded SHA-256 `9192da5817ca73f35b3fcec3b15b86ae2f3284825e8ad7520fbdf4c1b0561738`;
- all parameter/provenance JSON;
- dependency lock or container digest;
- `MANIFEST.sha256` at recorded SHA-256 `36c657fb36d7df50f1de79325b54c381b28e7f53e5ab79c84763f2c5dd4d08a8`;
- build A and build B outputs and raw logs;
- the exact checksum files that define the 79-file comparison.

Until then all four POCs remain `evidence-blocked`.

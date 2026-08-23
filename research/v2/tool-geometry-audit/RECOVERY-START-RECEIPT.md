# R2.10 recovered-evidence follow-up receipt

- Repository: `mannyc2/nycustodianexam`
- Follow-up base: `main` at `d94981c62e3834177f0db9bc387b2c601c40636b`
- Original R2.10 source: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Original R2.10 merge: `486e72c`
- Follow-up branch: `research/v2-tool-geometry-audit-recovery`
- UTC start: `2026-08-22T23:35:49Z`
- Authorized path: `research/v2/tool-geometry-audit/**`

## Recovery input

The exact original geometry archive was located in an earlier local Codex task and
transferred losslessly to the GPU workspace without adding it to the repository.

- Filename: `research-bundle.zip`
- Size: `2,309,138` bytes
- SHA-256: `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`
- Recorded repository coordinate: `research/initial-pass/SOURCE-HASHES.sha256`
- Archive integrity: `unzip -t` passed
- Archive inventory: 90 files, 6,289,966 uncompressed bytes

The archive contains the four model definitions, generated parameter/source records,
STEP/STL/GLB/SVG/PNG/WebP derivatives, validation JSON, a 79-entry build checksum
manifest, and the exact build/comparison scripts. It is research evidence, not a
production asset package.

## Follow-up scope

1. verify the archive and every internal checksum;
2. rerun two clean builds with the recorded Python/package cohort;
3. compare both reruns to each other and to the recovered historical build;
4. independently inspect model definitions, STEP re-import, meshes, GLB metadata,
   renders, invariants, source/rights records, and validation coverage;
5. replace the four `evidence-blocked` classifications with evidence-supported
   dispositions while withholding production approval.


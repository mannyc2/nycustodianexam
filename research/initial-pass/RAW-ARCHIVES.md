# Raw archive intake and publication limits

**Normalization date:** 2026-08-21

## Supplied outer archive

```text
filename: 8f7353c8-08fd-4677-bfeb-69a595dd0638.zip
SHA-256: 40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5
compressed size: approximately 2.4 MB
archive entries: 134
extracted files: 100
uncompressed bytes: 6,714,382
```

Safety checks performed before normalization:

- archive path-traversal check passed;
- escaping-symlink check passed;
- text/config credential-pattern scan found no credentials;
- unrelated `effect-build` material was not promoted into this project corpus.

The outer archive contained:

1. nine first-pass Effect architecture reports;
2. the complete deterministic tool-geometry research tree;
3. compact Markdown/CSV/JSON/schema/checksum evidence;
4. larger STEP/STL/GLB/PNG/WebP/ZIP proof outputs.

## GitHub publication model

The connected GitHub write interface accepts UTF-8 text content but not direct local-file or arbitrary-binary upload references.

Therefore this branch publishes:

- exact raw Markdown reports directly or as byte-reconstructible line-boundary parts;
- JSON and JSON Schema evidence;
- normalization ledgers, checksums, and receipts;
- exact source-archive and nested-archive hashes;
- descriptions and manifests for excluded binary research evidence.

It does **not** introduce Git LFS or treat the proof-model binaries as production assets.

## Effect reports

The most decision-relevant raw reports are committed under:

```text
research/initial-pass/raw/effect/
```

Committed raw lanes include:

- browser bundling;
- Effect v4 Schema/content registry;
- Effect Platform/browser API fit;
- IndexedDB/offline content packs;
- v4/Cloudflare correction.

The overlapping UI and core-architecture reports are cataloged in `RAW-EFFECT-REPORTS.md`, `FILE-LEDGER.csv`, and `DUPLICATION-AND-SUPERSESSION.md`. They are not treated as independent corroboration merely because two researchers repeated similar recommendations.

Version-specific Effect v3, pnpm, and generic folder-layout recommendations remain raw historical evidence and are explicitly superseded.

## Deterministic tool-geometry bundle

Nested research bundle:

```text
filename: research-bundle.zip
SHA-256: a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06
```

POC evidence archive:

```text
SHA-256: 725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d
```

Exact report:

```text
filename: research-report.md
size: 91,620 bytes
SHA-256: d12a9f91383c8ce0339d078f9404e1095b53c9537012b334c26e08143e9ce327
```

The report is committed as five ordered, line-boundary parts under:

```text
research/initial-pass/raw/tool-geometry/report/
```

Concatenating those files in lexical order reproduces the original report.

The proposed asset schema is also committed. The source archive additionally contains the exact taxonomy inventory, confusion-pair list, first-20 visual-invariant sheets, source ledger, POC summaries, parameter records, source code, validation output, and checksum manifests. Their identities are recorded in the normalization and recovery ledgers.

## Binary evidence deliberately not published as normal repository assets

The supplied geometry tree includes research binaries such as:

- STEP;
- STL;
- component meshes;
- GLB;
- PNG;
- WebP;
- complete ZIP archives.

They remain research/POC evidence, not production assets.

Reasons not to publish them in this normalization PR:

1. the connected GitHub text-write path cannot preserve arbitrary binary bytes directly;
2. no Git LFS policy has been approved;
3. the models remain pending independent mechanical, rights, accessibility, and production review;
4. committing them beside production paths could imply approval that the research explicitly withholds;
5. exact checksums and the source archive preserve their identity for a later dedicated audit/import path.

No claim is made that these binaries are present in GitHub.

## Reproducibility versus approval

The POC reports two controlled Linux builds with 79 of 79 compared files matching by hash.

That supports reproducibility for the tested environment. It does not establish:

- mechanical correctness;
- genericity;
- standards compliance;
- final rights clearance;
- accessibility acceptance;
- cross-platform reproducibility;
- production approval.

No POC asset is accepted for the site by this branch.

## Future exact-binary import

A later binary-audit/import task should:

1. start from the exact supplied archive checksum;
2. verify every internal checksum manifest;
3. inspect source, parameters, STEP re-import, meshes, GLB metadata, and renders;
4. run clean reproducibility checks;
5. obtain independent human review;
6. decide Git LFS, object storage, release artifacts, or a separate asset repository;
7. publish only exact reviewed asset revisions.

Do not reconstruct missing binary files from report prose.

# Raw bundle identity audit

## Result

`FAILED / BLOCKED`.

The GitHub-preserved tree does not match the scope described by its own README, and the present report parts cannot reconstruct the recorded report byte identity.

## Immutable source observed

- Source branch: `agent/chat-corpus-reconciliation`
- Source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Raw path: `research/initial-pass/raw/tool-geometry/`
- Present files: 7
- Present bytes under that path: 57,375
- Present report-part bytes: 47,528

The path contains only:

1. `README.md`;
2. `asset-manifest.schema.json`;
3. `report/part-01.md` through `report/part-05.md`.

## Report identity contradiction

The raw README states that concatenating the five parts reproduces:

- file: `research-report.md`
- size: 91,620 bytes
- SHA-256: `d12a9f91383c8ce0339d078f9404e1095b53c9537012b334c26e08143e9ce327`

GitHub reports the five blobs as:

| Part | Bytes |
|---|---:|
| part-01.md | 14,794 |
| part-02.md | 11,286 |
| part-03.md | 10,940 |
| part-04.md | 8,724 |
| part-05.md | 1,784 |
| Total | 47,528 |

The part set is 44,092 bytes shorter than the recorded report. No concatenation order or line-ending choice can add those absent bytes. The claimed report SHA-256 therefore cannot describe the present part set.

## Missing compact evidence

The report and normalization receipts name compact evidence that is absent from the immutable Git tree:

- `taxonomy-inventory.csv`;
- `confusable-pairs.csv`;
- `first-20-visual-invariants.csv`;
- `source-ledger.csv`;
- `poc-summary.json`;
- `DELIVERABLE-SHA256SUMS`;
- `poc/build_poc.py`;
- `poc/parameters/*.json`;
- `poc/poc-summary.json`;
- `poc/MANIFEST.sha256`;
- build A and build B manifests/validation trees.

The raw README says these compact files are preserved in the branch. The actual tree contradicts that statement.

## Missing archives and binaries

The following identities are recorded, but the bytes are absent:

- outer archive SHA-256 `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5`;
- nested bundle SHA-256 `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`;
- POC evidence archive SHA-256 `725f997229f7f708dfb00189b3790f8d7fa0f5e30ed3378fd0fd29f48ac5ee7d`.

These are useful provenance coordinates, not verified archive identities in this lane. A hash record cannot substitute for the hashed object.

## What remains trustworthy

- GitHub object identity and size for the seven present files: `CONFIRMED`.
- Narrative statements in the five parts: present as report fragments, but not proven complete.
- Proposed schema fields: inspectable, but no instance manifests exist.
- Historical archive SHA records: present as claims, not reverified.

## Required recovery

A later recovery must provide the exact outer archive or nested bundle bytes. It must then:

1. verify the outer and nested archive SHA-256 values;
2. safely extract the archive;
3. verify `DELIVERABLE-SHA256SUMS` and `poc/MANIFEST.sha256`;
4. compare every expected compact file against `SOURCE-HASHES.sha256`;
5. preserve the exact source, parameters, build environment, logs, and generated outputs;
6. repeat this audit without using report prose as a replacement for absent files.

No production or POC approval follows from the present partial tree.

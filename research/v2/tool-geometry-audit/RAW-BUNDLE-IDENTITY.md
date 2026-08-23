# Raw bundle identity audit

## Current result

`RECOVERED / VERIFIED`, with one retained cross-package identity conflict.

The original R2.10 GitHub-tree finding remains historically correct: its seven
raw files did not contain the promised model/source/build evidence. The exact
archives were later recovered from the earlier task workspace.

## Verified archive coordinates

| Artifact | Bytes | Files | Uncompressed bytes | SHA-256 | Status |
|---|---:|---:|---:|---|---|
| `all-research-2026-08-21.zip` | 2,471,268 | not used as build root | not used | `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5` | exact recorded outer archive observed |
| `recovered-input/research-bundle.zip` | 2,309,138 | 90 | 6,289,966 | `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06` | exact recorded nested bundle committed |

Both ZIP integrity checks pass. The nested bundle is the audit/rebuild authority.

## Contents recovered

- `build_poc.py` and `compare_builds.py`;
- parameters and source records for `t0004`–`t0007`;
- the historical `poc-build-a` tree and 79-entry `SHA256SUMS`;
- STEP, review/component STL, GLB, SVG, PNG, and WebP derivatives;
- fixed-view and pair-preview records;
- research report, taxonomy inventory, confusable pairs, invariant sheet, schema,
  source ledger, and POC summary.

## Retained conflict

The five partial report fragments in the original Git tree total 47,528 bytes and
claim another 91,620-byte report identity. The exact recovered bundle instead
contains a 101,586-byte `research-report.md` with SHA-256
`d1807d0fdf4f7fec7758873163a240ac04e9874dff13121123abbbee57456531`.

Likewise, several compact-file hashes extracted from the partial narrative do not
match the corresponding exact recovered-bundle files. This is recorded as a
normalization/package conflict, not used to reject the archive whose own recorded
ZIP hash matches exactly.

The recovered archive may support claims about its exact contents and builds. It
does not retroactively make the earlier fragment set complete.

# Plan 004 editable prototype recovery

This package preserves the exact eight surviving `CL-1` consumer-language
prototype files recovered from a temporary Plan 004 working directory on
2026-08-28. They are durable recovery artifacts, not accepted research,
production copy, a tested direction, or a product contract.

## Provenance and observed state

The files were observed at
`/tmp/nycustodian-content-004.VLmjKt/prototypes` and associated by the working
ledger with planning commit
`e6f911901f7f18f6716204309fee8b103419a5e0`, original execution base
`115b91a3cce5a6ec4cdbe7981847f8d494e326eb`, branch
`codex/uiux-consumer-language`, and open draft PR #37. PR #37 is provenance,
not an immutable byte coordinate: these prototype files were never tracked on
that branch.

At recovery:

- exactly eight editable HTML fragments existed, totaling 36,767 bytes;
- every file carried its locked prototype ID and `CL-1` marker;
- `prototype-snapshots/R1` and `prototype-snapshots/R2` existed but were empty;
- `prototype-manifest.tsv` did not exist;
- the 120-family desk copy audit contained 79 `REWRITE` dispositions;
- the benchmark work was partial; and
- no moderator-guide pilot, participant exposure or round, formal R1/R2
  snapshot, or selected direction had occurred.

[`recovery-manifest.json`](recovery-manifest.json) records the exact source
coordinates, observed state, raw-byte SHA-256 values, file sizes, source
anchors, modes, and safety disposition. It is deliberately not named
`prototype-manifest.tsv` and contains no `CLM-R1-*` or `CLM-R2-*` coordinate:
it cannot be mistaken for the private manifest of a frozen participant round.

## Safety classification

Every retained file was contextually inspected and pattern-scanned before
preservation. No participant PII, credentials, secrets, remote or executable
resources, or protected, secure, remembered, or recalled exam content was
found. The three explicitly research-only question rewrites in
`question-feedback.html` are variants of this project's original practice
comparisons, not official examination items. Synthetic dates, counts, and the
example reference `DR-2026-0842` are interface copy, not participant records.

The recovered HTML files are inert fragments: they contain no scripts, forms,
embedded media, storage calls, or external URLs. Their `href="#"` values are
placeholders.

## Handling and retention

Preserve these bytes unchanged while Plan 004 remains unresolved. A later
change must receive a new prototype version and hash; do not overwrite this
recovered set. Retire it only after an exact reviewed successor is durable at
an immutable Git coordinate or the owner records an explicit retirement
disposition in the recovery ledger.

The repository copy is evidence preservation, not authorization to serve an
interactive prototype or recruit participants against it. Future fieldwork
must re-review the copy, pilot the guide with a person, copy the resulting
bytes into an approved private working area, freeze the proper R1 snapshot,
generate the formal private manifest, and obtain same-round exposure approval.
Never show participants these editable files directly.

The three candidate question rewrites also require the normal editorial,
source, exam-security, and accessibility review before any production use.
Nothing in this package promotes a language direction or changes maintained
product behavior.

## Integrity verification

Run from the repository root:

```sh
recovery_artifact_root="recovery/plan-004-consumer-language-prototypes"
test "$(jq -r '.files | length' "$recovery_artifact_root/recovery-manifest.json")" -eq 8
test -z "$(comm -3 \
  <(find "$recovery_artifact_root/prototypes" -maxdepth 1 -type f -printf 'prototypes/%f\n' | sort) \
  <(jq -r '.files[].path' "$recovery_artifact_root/recovery-manifest.json" | sort))"
(
  cd "$recovery_artifact_root"
  jq -r '.files[] | "\(.sha256)  \(.path)"' recovery-manifest.json |
    sha256sum --check -
  jq -r '.files[] | [.path, (.bytes | tostring)] | @tsv' recovery-manifest.json |
    while IFS="$(printf '\t')" read -r path expected_bytes; do
      test "$(wc -c < "$path")" -eq "$expected_bytes" || exit 1
    done
)
```

The complete-set digest is independently reproducible with:

```sh
(
  cd recovery/plan-004-consumer-language-prototypes/prototypes
  sha256sum *.html | sha256sum
)
```

Expected SHA-256: `f1ef0a2dec44ae04c8c2b3e8f94fe9e59b3c38a54d3310ae50b4b7dde10ecf14`.

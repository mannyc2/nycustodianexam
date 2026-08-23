# R2.10 report: recovered tool-geometry evidence and POC audit

## Executive verdict

The four POCs are no longer evidence-blocked. The exact recovered archive matches
the repository's recorded SHA-256, its historical 79-entry manifest verifies, and
two independent fresh builds are byte-identical to the historical build and to
each other.

The final classifications are:

- adjustable wrench — `reproducible and reviewable`;
- pipe wrench — `reproducible and reviewable`;
- cup plunger — `reproducible but requires model/view rework`;
- flange plunger — `reproducible but requires model/view rework`.

All four are accepted as recovered POC/pipeline evidence and retired as
production-art candidates. No claim of production mechanical certification is
needed or made.

## What changed after the original audit

PR #17 examined the only bytes then present in GitHub: a README, a proposed
schema, and five incomplete report parts. Its blocked result was truthful for that
input. The later recovery supplied both recorded archive coordinates:

| Artifact | Bytes | SHA-256 | Result |
|---|---:|---|---|
| consolidated outer archive | 2,471,268 | `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5` | verified external recovery input |
| nested `research-bundle.zip` | 2,309,138 | `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06` | verified and committed in this lane |

The nested bundle contains the model source, parameters, source records, build
script, comparison script, historical build, STEP/STL/GLB/SVG/PNG/WebP outputs,
manifest, and report/inventory material for all four POCs.

## Reproducibility result

The fresh audit used Python 3.12.3 with the exact recorded specialist package
versions. The recovered historical receipt used Python 3.13.5. Despite that
difference:

- historical manifest: 79/79 pass;
- rerun A manifest: 79/79 pass;
- rerun B manifest: 79/79 pass;
- historical versus rerun A: exact 79/79 match;
- rerun A versus rerun B: exact 79/79 match.

This is an observed result for these environments, not a claim that every Python,
OS, or OCCT combination is supported.

## Structural and derivative results

All four recovered STEP files re-import as valid solids. Recorded/re-imported
bounds agree exactly for the two wrenches and within 0.121 mm for the two plunger
models. Every component STL is watertight. The cup-plunger combined review mesh is
not watertight; the other three combined review meshes are watertight.

GLB delivery metadata uses neutral node/mesh names and contains no canonical tool
names, taxonomy IDs, materials, cameras, or top-level extras. All inspected SVG
and GLB files are clear of the denylisted answer-bearing names. These are
asset-level observations; no application precommit page existed to audit.

## Per-POC result

### Adjustable wrench (`t0004`)

The source has three parts, smooth jaws, a moving-jaw form, and a worm component.
STEP, part meshes, combined review mesh, GLB, and three static views reproduce.
The source explicitly marks body contour, fillets, guide form, worm tooth form,
and display opening as editorial. Automated validation records the decisive
features but does not independently measure jaw parallelism or worm correctness.

Disposition: reproducible and reviewable; accepted as pipeline evidence; retired
as a production-art candidate.

### Pipe wrench (`t0005`)

The source has three parts, distinct hook/fixed-jaw forms, serrations, and an
adjusting component. STEP, meshes, GLB, and fixed views reproduce. Tooth count,
pitch, body contour, guide/nut form, and display opening remain editorial, and
the automated check does not independently establish those mechanisms.

Disposition: reproducible and reviewable; accepted as pipeline evidence; retired
as a production-art candidate.

### Cup plunger (`t0006`)

The source has separate cup and handle parts and records a zero-height extended
flange. STEP and both component meshes pass, but the combined review mesh is not
watertight. The feature view communicates the open cup; the full profile and
three-quarter line renders are too faint at phone scale. Cup contour, thickness,
attachment, and exact dimensions remain editorial.

Disposition: reproducible but requires model/view rework; accepted as pipeline
evidence; retired as a production-art candidate.

### Flange plunger (`t0007`)

The source has separate cup/flange and handle parts and a 45 mm editorial flange
height. STEP and meshes pass. The feature view communicates the extended flange,
but the profile and three-quarter renders are too faint at phone scale and the
rigid model cannot establish flexible resting behavior.

Disposition: reproducible but requires model/view rework; accepted as pipeline
evidence; retired as a production-art candidate.

## Identity conflict retained

The exact recovered archive's internal top-level file hashes do not match several
compact-file hashes extracted from the earlier partial narrative. Because the
archive itself matches its recorded SHA-256, its bytes are identified; the
different compact ledger represents another normalization/package state. R2.10
records both and does not pretend they are the same artifact.

## Rights and factual basis

The bundle declares the newly authored POC code and geometry CC0-1.0 and states
that no third-party model, image, texture, logo, or official exam drawing was
included. Manufacturer/standard material appears as factual reference URLs only.
That is sufficient to preserve and audit the POCs as research evidence.

It is not sufficient to turn every editorial dimension into an authoritative
generic tool specification. That limitation is one reason the four POCs are
retired rather than promoted as shipping illustrations.

## Architecture consequence

R2.10 now has one canonical conclusion: the recovered deterministic geometry
pipeline is reproducible, but its four outputs are closed research prototypes.
They neither block nor control the maintained Codex-native illustration route.
Future illustrations still require exact final-byte identity, taxonomy/content
review, rights review, accessibility records, leak checks, and phone/print QA.

## Effect and Bun

Effect and Bun are not used by this Python/CadQuery audit. No application code was
introduced.

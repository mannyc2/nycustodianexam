# Generated artifacts

| Artifact | Inputs | Identity/version fields | Consumer |
|---|---|---|---|
| current validated records | migrated decoded records | kind, ID, revision, schema version, payload digest | all generators |
| content-addressed objects | canonical encoded record bytes | SHA-256 digest and byte size | site/packs/history |
| `PreCommitPageInput` | eligible question/scene without answer graph | page schema version, item version | static HTML/player bootstrap |
| `PostCommitPageInput` | eligible answer/rationale/full description/source graph | item version, release root | reveal after durable commit |
| derived counts | `ValidatedCorpus` | generator version, release root | profiles, atlas, manifests |
| search index | published reference content only | locale, tokenizer/index version, input root | offline/site search |
| claim/source maps | corpus graph | release root | corrections, withdrawals, review |
| image/geometry manifest | reviewed asset graph and derivatives | original/basis/output digests, renderer/view version | site and pack assembly |
| hazard-scene manifest | reviewed scene/zone/target/decoy graph | scene/version/output digests | visual/nonvisual players |
| sitemap/stable URL map | publishable routes | route policy version, release root | acquisition/static site |
| JSON Schema documents | current Effect schemas | Effect coordinate, schema family version | editor/forms/interchange |
| diagnostics JSON/CSV | all phases | diagnostic schema/gate version | authors and CI |
| content pack manifest | closed object set | locale, compatibility, bytes, counts, object digests, root | offline activation |
| release manifest | all pack/page/index roots | compiler/gate/cohort versions, release root | active publication pointer |

## Split reveal contract

Pre-commit page inputs are generated from a schema that cannot encode the key,
rationales, full naming description, claim/source graph, or answer-bearing asset
metadata. Post-commit data is addressed separately and loaded/revealed only after
successful durable attempt commit. Static no-script study/reference pages may
contain published explanations where they are not scored player surfaces; route
purpose must be explicit.

## Manifest-last rule

Every object is written and verified in a private staging root. The compiler then
validates each output with its generated Schema, recomputes sizes/digests, and
proves manifest closure. Only then may the active release manifest/pointer be
promoted. A timestamp may exist as non-identity metadata supplied by the release
environment; it never affects object or release identity.

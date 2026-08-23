# Compiler phases

| Phase | Input | Output | Owner | Failure behavior |
|---|---|---|---|---|
| 00 coordinate lock | package/runtime policy | recorded Effect/Bun/compiler versions | Bun app root | abort if cohort mismatched |
| 01 discover | configured authoring roots | normalized relative paths | filesystem capability | sorted paths; reject symlink/root escape and duplicate discovery |
| 02 parse | UTF-8 JSONC bytes | `unknown` plus file/range map | location parser | safe syntax diagnostic; do not echo secure values |
| 03 envelope decode | unknown | kind/ID/schema-version envelope | Effect Schema | all-error strict decode |
| 04 migrate | decoded historical record | next historical/current record | pure per-family migration | no fabricated approvals; destination re-decodes |
| 05 structural decode | current unknown | typed current record | Effect Schema | all-error, excess-property error, input reporting off |
| 06 normalize/encode | typed record | current encoded JSON value | Effect Schema | representation only; preserve meaning and identity |
| 07 registry construction | encoded records + locations | duplicate-preserving buckets | pure function | never overwrite duplicate IDs |
| 08 relational validation | buckets + source/history registries | sorted diagnostics or `ValidatedCorpus` | pure named gates | run independent gates; stable deterministic order |
| 09 publication eligibility | validated graph + reviews/history | eligible closed graph | pure gates | semantic/human review gaps remain blocking diagnostics |
| 10 derive | `ValidatedCorpus` | counts/indexes/page inputs/manifests | pure generators | only derived values; no hand-entered counts |
| 11 output validate | generated unknowns | typed generated records | Effect Schema | generator bugs block publication |
| 12 canonical encode | generated typed values | canonical UTF-8 bytes | pure canonicalizer | reject unsupported values and locale/time dependence |
| 13 address | canonical bytes | SHA-256 object digests and release root | hash capability | typed operational hash failure |
| 14 stage | complete objects/manifests | private staging tree | filesystem capability | typed write failure; active release unchanged |
| 15 closure verify | staging tree | verified release candidate | pure + reads | every manifest object exists and digest/size matches |
| 16 promote | verified candidate | active release pointer/manifest | publication capability | manifest last; failure retains previous valid release |

## Effect boundary

Phases 01, 02, 13–16 perform I/O and belong in a finite Effect program with
typed operational errors. Migrations, registry construction, relational gates,
derivation, canonicalization, and closure calculations are deterministic pure
functions. One compiler service per phase would add indirection without reducing
state; prefer cohesive `AuthoringFiles`, `PublicationHistory`, and
`ReleasePublisher` capabilities.

## Diagnostics versus failure channel

Authored invalidity returns a complete sorted diagnostic report and a rejected
publication result. Operational inability to read, hash, stage, or promote uses
typed tagged errors. Defects are bugs and must not be reformatted as author
mistakes.

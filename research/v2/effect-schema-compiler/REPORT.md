# R2.6 report

## Executive result

The recovered architecture remains sound after refresh, but its version-specific
surface needed one correction: use rc.111, not rc.110. The fixture confirms at
that exact coordinate that current Effect v4 supports the required class/tagged
models, brands, local checks, all-error decoding, excess-property rejection,
encoding, structured issue formatting, Draft 2020-12 JSON Schema generation,
and synchronized `@effect/vitest` tests.

The initial implementation should use a thin `apps/content-compiler` Bun entry
with one reusable `packages/content` package. Do not create a package per entity,
gate, or generator. Pure registry and canonicalization functions stay pure;
Effect owns file discovery, reads, hashes, history access, staging writes, and
atomic promotion.

## Recovered versus newly observed

The byte-preserved E05 report proposed the structural/relational split, branded
IDs, digest-bound reviews, versioned migrations, stable diagnostics,
content-addressed outputs, and publish-manifest-last transaction. Those findings
are retained.

This recovery newly adds:

- current main provenance and a live draft PR;
- exact rc.111 installed dependencies and `bun.lock`;
- complete reading of installed `effect/AGENTS.md` and current Schema source;
- a typechecked and tested current-v4 fixture;
- observed all-error structural diagnostics and multi-error relational output;
- observed JSON Schema Draft 2020-12 generation;
- observed byte-identical outputs across two consecutive probe runs;
- explicit status fixtures for not-published, conflicting, superseded,
  translated, inaccessible, and scope-incompatible content;
- implementation-ready phase, gate, diagnostic, artifact, and placement tables.

The original lane prompt was not runnable because its source SHA placeholder was
never filled. This work therefore does not claim retroactive compliance with the
original immutable-source launch procedure. It is a documented current-main
recovery based at `d94981c62e3834177f0db9bc387b2c601c40636b`.

## Current Effect v4 conclusions

At `effect@4.0.0-rc.111`:

- `Schema.Class<Self>(identifier)(fields)` and
  `Schema.TaggedClass<Self>()(tag, fields)` are current record/variant forms.
- `Schema.Union` takes an array.
- brands compose through `Schema.brand`.
- ordinary local constraints use `.check(...)` with built-in filters or
  `Schema.makeFilter`; `refine` is reserved for actual type narrowing.
- untrusted synchronous compiler inputs can use
  `SchemaParser.decodeUnknownResult` with `errors: "all"`,
  `onExcessProperty: "error"`, and `reportInput: false`.
- `SchemaIssue.makeFormatterStandardSchemaV1` yields structured path/message
  issues; project codes and source ranges must wrap these issues.
- `Schema.encodeSync` establishes the encoded value before canonical JSON.
- `Schema.toJsonSchemaDocument` emits Draft 2020-12, subject to documented
  best-effort limits. Effect decoding plus relational gates remain authoritative.
- `Schema.TaggedError` is appropriate for expected operational failures; author
  validation failures are accumulated `Diagnostic` values, not thousands of
  error-channel failures.

The fixture uses no unstable Effect namespace.

## Publication model

The compiler is a finite transaction:

```text
discover deterministically
  -> parse unknown with locations
  -> decode historical envelope and record
  -> migrate one version hop at a time
  -> decode current record
  -> build duplicate-preserving registry
  -> run independent gates and sort diagnostics
  -> mint ValidatedCorpus
  -> derive artifacts
  -> encode and validate generated artifacts
  -> canonicalize and hash
  -> write complete staging tree
  -> verify closure from staging
  -> promote release manifest last
```

No generator accepts raw authoring records or an unvalidated registry. A failed
build writes diagnostics but no promotable release root.

## Authoring recommendation

Use JSONC as the primary human authoring representation, parsed by a location-
preserving parser, with canonical JSON as generated interchange. JSONC gives
deterministic, non-executable inputs and familiar tooling while allowing comments.
YAML's implicit typing/alias behavior adds state; TypeScript authoring executes
code and weakens deterministic discovery. Neither is justified for the first
content bank.

Authoring files should be one logical record or a small cohesive set per file,
named by stable non-answer-bearing IDs. Exact source excerpts live in retained
source-revision/line-table objects, not copied throughout question prose.

## Security and accessibility

Pre-commit and post-commit generated page inputs are separate schemas. Pre-
commit input cannot contain the key, full naming description, rationale, claim
map, answer-bearing filename, or answer-bearing geometry metadata. A security
review is bound to the exact encoded basis digest. Scored visual publication
also requires digest-current rights and accessibility reviews and a nonvisual
equivalent. Semantic leak checks still require human review; Schema cannot prove
that prose is neutral.

Diagnostic generation keeps `reportInput: false`. It reports project codes,
locations, IDs, and safe messages without echoing secure authored values.

## Determinism result

The fixture compiles the valid corpus to:

- object digest:
  `sha256:9a429bd1716ce9d95bc856a29015f2305db53a303aa107595fe7d4080e0aae3f`
- release root:
  `sha256:200597dfa7beb682608a882fc438d0165311c473770971e8fcf3d1f873e5d15f`

Two consecutive probes produced identical SHA-256 values for every generated
file. This proves the small fixture at the recorded coordinate, not every future
record kind, filesystem, locale, or build host.

## Limits and remaining measurements

- The fixture is deliberately representative, not the production entity corpus.
- The production parser must preserve JSONC source ranges; the fixture uses
  `JSON.parse` because parser selection is not an Effect question.
- Full source-line digest verification, immutable-history comparison, semantic
  answer-leak review, geometry manifest closure, hazard region semantics,
  import quarantine, and static-page generation remain implementation work.
- Current rc.111 is a prerelease. Re-run the current-v4 gate at workspace
  scaffold time and deliberately update the entire synchronized cohort.
- Validate canonical JSON behavior against a formal RFC 8785 implementation or
  freeze and test the project profile before production content is published.

## Recommendation

Adopt the compiler boundary and initial placement now. Adopt rc.111 only as the
first implementation lock, not a permanent version claim. Treat location-aware
JSONC parsing and canonicalization-profile selection as early implementation
spikes. The recovered R2.6 output is sufficient as an input to R2.90 because its
core decisions now have current-source and executable evidence.

# Code sketches

The executable sketches live in
`fixtures/current-v4-compiler/src/` and are typechecked/tested rather than copied
as non-running snippets.

## Model boundary

- `model.ts` uses branded entity IDs, `Schema.TaggedClass`, tagged prompt/fact
  unions, a local one-key question check, digest-bound reviews, and the corpus
  file Schema.
- `compiler.ts` decodes unknown with all errors and excess-property rejection,
  constructs duplicate-preserving buckets, runs explicit gates, sorts project
  diagnostics, encodes the corpus, canonicalizes bytes, emits SHA-256 identities,
  and derives Draft 2020-12 JSON Schema.
- `run-probe.ts` runs valid, status/translation, structurally invalid, and
  relationally invalid corpora twice and writes deterministic evidence.

## Production Effect orchestration shape

```ts
const compileRelease = Effect.fn("compileRelease")(function* (request) {
  const files = yield* AuthoringFiles
  const history = yield* PublicationHistory
  const publisher = yield* ReleasePublisher

  const inputs = yield* files.discoverAndRead(request.roots)
  const result = compilePure(inputs, yield* history.current())

  if (result.diagnostics.some((item) => item.severity === "error")) {
    return yield* new PublicationRejected({ diagnostics: result.diagnostics })
  }

  return yield* publisher.stageVerifyAndPromote(result.release)
})
```

`compilePure` accepts values and returns values. The three capabilities above
have dependency/failure/substitution semantics and merit services. Named gates,
canonicalization, migrations, and graph traversal do not.

## Opaque phase capability

Generators accept an opaque `ValidatedCorpus` produced only by the successful
gate runner. Do not export a public constructor. Generated output Schemas decode
the generator output before addressing, so a generator defect cannot create a
publishable manifest.

## Source-location adapter

The production JSONC parser returns `{ value: unknown, locations: PointerMap }`.
Effect Schema issue paths are resolved through `PointerMap` to the exact file
range. Related records attach their own ranges. Stable codes are project-owned;
Effect formatter text is never used as the machine contract.

# Current Effect v4 Schema API map

Coordinate: `effect@4.0.0-rc.111`, tag commit
`648f566dd259898e7697c7fcb796183ccbc474ab`, inspected from installed package and
official source.

| Concern | Current API/pattern | Status | Project use / limit |
|---|---|---|---|
| Domain records | `Schema.Class<Self>(identifier)(fields)` | CONFIRMED / OBSERVED | stable named record schema and class |
| Tagged variants | `Schema.TaggedClass<Self>()(tag, fields)` + `Schema.Union([A, B])` | CONFIRMED / OBSERVED | fact states, prompts, diagnostics, expected errors |
| Branded IDs | `schema.pipe(Schema.brand("Name"))` | CONFIRMED / OBSERVED | prevents ID-family mixing; does not prove registry existence |
| Local validation | `.check(filter)`; built-ins such as `isMinLength`; custom `makeFilter` | CONFIRMED / OBSERVED | same-type local invariants only |
| Type narrowing | `Schema.refine` | CONFIRMED | use only for genuine type-guard narrowing, not ordinary checks |
| Untrusted decode | `SchemaParser.decodeUnknownResult(schema)(input, options)` | CONFIRMED / OBSERVED | synchronous boundary with issues as data |
| Parse options | `errors: "all"`, `onExcessProperty: "error"`, `reportInput: false` | CONFIRMED / OBSERVED | collect structural issues; reject typos; avoid secure input echo |
| Structured formatting | `SchemaIssue.makeFormatterStandardSchemaV1()` | CONFIRMED / OBSERVED | path/message input to project diagnostic wrapper; wording is not project API |
| Decode/encode model | Schema `Encoded` ↔ `Type`; `Schema.encodeSync` | CONFIRMED / OBSERVED | encode before canonical serialization and hashing |
| Transformations | `Schema.decodeTo` plus transformation/getter APIs | CONFIRMED | representation transforms only; not corpus lookup or full migrations |
| Recursive values | `Schema.suspend` | CONFIRMED | truly nested page/explanation blocks; cross-record relations remain IDs |
| Defaults | property signatures / schema constructors as documented | CONFIRMED | only when absence has one truthful meaning; never invent mutable facts |
| Annotations | `.annotate(...)` and key annotations | CONFIRMED | identifiers, safe messages, docs, JSON Schema metadata |
| JSON Schema | `Schema.toJsonSchemaDocument(schema)` | CONFIRMED / OBSERVED | Draft 2020-12 best effort; derived authoring aid, not publication authority |
| Arbitraries | Schema-derived arbitrary support | CONFIRMED source | property tests for primitives/canonicalization; production coverage still needed |
| Schema error | parser returns structured Schema issues / wrapper errors | CONFIRMED | translate to stable project codes; no dependence on formatter prose |
| Expected operational error | `Schema.TaggedError` | CONFIRMED | file/history/hash/write/publish failures in Effect error channel |
| Validation diagnostics | project `Diagnostic` Schema/data | INFERRED / fixture observed | accumulate independently and sort; not one Effect failure per author error |
| Services | `Context.Service`; named `Effect.fn` in effectful implementation | CONFIRMED current installed guide | file/hash/history/publication capabilities only; pure gates stay functions |

## Migration shape

Decode a minimal envelope first, dispatch on record family and `schemaVersion`,
decode the historical schema, apply exactly one pure migration hop, decode the
destination, and repeat. A migration may normalize representation but may not
fabricate sources, reviews, translations, accessibility, conflict resolution, or
security approval. Missing human meaning produces
`MIGRATION.AUTHOR_INPUT_REQUIRED`.

## JSON Schema boundary

Generated JSON Schema describes the canonical JSON shape and is useful for
editor completion, forms, and interchange. It cannot establish registry
existence, claim/source closure, review freshness, audience paths, immutable
history, or pack closure. The authoritative decision remains Effect decode plus
named relational gates.

Yes. Re-doing the recommendation with **Effect 4 as a fixed architectural assumption** changes a few important details, but not the central conclusion: Effect Schema should own value-level modeling and encoding, while corpus-wide publication rules should be explicit Effect validation passes over a constructed registry.

I rechecked the repository baseline as part of this pass. `mannyc2/nycustodianexam` `main` is still at `92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c`.  The repository's canonical rules require provenance retention, explicit unresolved conflicts, separation of entry/high-level material, original or rights-cleared practice content, and a source basis for scored explanations.

As of August 20, 2026, Effect 4 is on the RC release line; the synchronized Effect ecosystem has `4.0.0-rc.110` artifacts published. Effect 4 also deliberately reorganizes Schema: v3 `filter` becomes v4 `check`/`makeFilter` or `refine`, transformations move to `decodeTo`, and ecosystem packages share one synchronized Effect version. ([GitHub][1])

## Revised recommendation

Build the compiler around this boundary:

```text
authoring files
    |
    v
parse as unknown
    |
    v
Effect 4 Schema decode
    |
    v
structurally valid records
    |
    v
registry construction
    |
    v
Effect relational validation passes
    |
    v
ValidatedCorpus
    |
    v
derived artifact generation
    |
    v
Effect 4 Schema encode + output validation
    |
    v
content addressing
    |
    v
publication manifest
```

The important distinction remains:

```text
Schema-valid != publication-valid
```

`Schema.Struct`, unions, checks, brands, transformations, annotations, and recursive schemas should validate a **record**. They should not be abused to perform graph lookup, source resolution, historic publication comparison, or security/rights approval resolution.

That separation becomes especially natural in Effect 4 because the Schema APIs make the distinction between structural checks, type refinements, transformations, decoding, and encoding clearer than v3 did. The official v4 Schema guide explicitly describes Schema as the shared definition used for types, runtime validation, transformation, serialization and derived tooling.

# 1. Effect 4 Schema architecture

I would organize the compiler into five Schema layers.

```text
schema/
  primitives/
  provenance/
  domain/
  publication/
  generated/
```

### Primitives

These should contain only reusable value schemas:

```text
SourceId
ClaimId
QuestionId
OptionId
ImageId
TranslationId
ReviewId
ContentDigest
Locale
Revision
SchemaVersion
NonEmptyText
```

### Provenance

```text
Source
SourceRevision
SourceSpan
Support
Claim
ClaimAlternative
ConflictResolution
```

### Domain

```text
Tool
Concept
ConfusionSet
AnnouncementProfile
Question
HazardScene
Translation
Image
```

### Publication

```text
RightsReview
SecurityReview
AccessibilityReview
TranslationReview
PublicationEligibility
```

### Generated

```text
PublishedQuestion
PageInput
SearchDocument
ClaimMap
SourceMap
ImageManifest
OfflinePackManifest
ReleaseManifest
```

Generated Schemas should be distinct from authoring Schemas. Authors edit domain records; generators create publication records.

# 2. `Schema.Struct`

For Effect 4, `Schema.Struct` should be the normal modeling primitive.

For example:

```ts
import { Schema } from "effect"

const Source = Schema.Struct({
  kind: Schema.Literal("source"),
  schemaVersion: Schema.Literal(1),
  id: SourceId,
  title: NonEmptyText,
  publisher: NonEmptyText,
  evidenceTier: Schema.Literals([
    "official",
    "institutional",
    "occupational",
    "manufacturer",
    "secondary"
  ])
})
```

Publication-important data should generally be **required**.

Avoid models such as:

```ts
const BadClaim = Schema.Struct({
  value: Schema.String,
  verified: Schema.optionalKey(Schema.Boolean),
  conflict: Schema.optionalKey(Schema.Boolean),
  sourceIds: Schema.optionalKey(Schema.Array(SourceId))
})
```

That permits meaningless combinations.

Prefer state-specific unions.

# 3. Unions

Effect 4 uses array-form unions:

```ts
Schema.Union([
  A,
  B,
  C
])
```

The v4 migration guide explicitly changed the constructor from the old variadic pattern. ([GitHub][2])

For this corpus, nearly every important union should be explicitly discriminated.

Example:

```ts
const VerifiedClaim = Schema.Struct({
  status: Schema.Literal("verified"),
  text: NonEmptyText,
  support: Schema.Array(SourceSpanRef).check(
    Schema.isMinLength(1)
  )
})

const ConflictingClaim = Schema.Struct({
  status: Schema.Literal("conflicting"),
  alternatives: Schema.Array(ClaimAlternative).check(
    Schema.isMinLength(2)
  )
})

const OpenClaim = Schema.Struct({
  status: Schema.Literal("open"),
  reason: NonEmptyText
})

const ClaimState = Schema.Union([
  VerifiedClaim,
  ConflictingClaim,
  OpenClaim
])
```

That directly models:

```text
verified -> evidence required
conflicting -> alternatives required
open -> reason required
```

rather than trying to make a large struct's optional fields correlate.

This is important because the existing corpus specifically prohibits silently resolving contradictions.

# 4. Branded identifiers

Use Effect 4 brands aggressively for IDs.

```ts
const SourceId = Schema.String
  .check(
    Schema.isPattern(
      /^source:[a-z0-9][a-z0-9._:-]*$/
    )
  )
  .pipe(Schema.brand("SourceId"))

const ClaimId = Schema.String
  .check(
    Schema.isPattern(
      /^claim:[a-z0-9][a-z0-9._:-]*$/
    )
  )
  .pipe(Schema.brand("ClaimId"))

const QuestionId = Schema.String
  .check(
    Schema.isPattern(
      /^question:[a-z0-9][a-z0-9._:-]*$/
    )
  )
  .pipe(Schema.brand("QuestionId"))
```

This gives useful compile-time protection:

```ts
declare const sourceId: typeof SourceId.Type

function loadQuestion(
  id: typeof QuestionId.Type
) {}

loadQuestion(sourceId)
// Type error
```

But the brand proves only:

```text
"This string has the shape of a QuestionId."
```

It does **not** prove:

```text
"A question with this ID exists."
```

That is a registry invariant.

# 5. Effect 4 `check` versus `refine`

This is one area where explicitly choosing v4 matters.

The normal v4 API for runtime constraints is:

```ts
schema.check(...)
```

A custom value-level check uses:

```ts
Schema.makeFilter(...)
```

For example:

```ts
const PositiveRevision = Schema.Int.check(
  Schema.makeFilter((n) =>
    n > 0 || "revision must be greater than zero"
  )
)
```

The v4 migration documentation distinguishes:

```text
check + makeFilter
```

for ordinary validation from:

```text
Schema.refine
```

for predicates that actually narrow the TypeScript type. ([GitHub][2])

For this compiler:

```text
local invariant preserving the same TS type
    -> check / makeFilter

actual type guard
    -> refine

corpus relationship
    -> separate validation pass
```

For example, this is a good Schema check:

```ts
const SourceSpan = Schema.Struct({
  sourceId: SourceId,
  startLine: PositiveInt,
  endLine: PositiveInt
}).check(
  Schema.makeFilter((span) =>
    span.startLine <= span.endLine
      ? undefined
      : {
          path: ["endLine"],
          issue:
            "endLine must not precede startLine"
        }
  )
)
```

This would be a bad Schema check:

```ts
// Don't do this.
.check(
  Schema.makeFilter((span) =>
    globalSourceRegistry.has(span.sourceId)
  )
)
```

A Schema should not secretly depend on a global registry.

# 6. Exactly one answer key

For the current single-choice question model, do not represent correctness as:

```ts
options: [
  { isCorrect: false },
  { isCorrect: true },
  { isCorrect: false }
]
```

That creates states containing zero or multiple correct answers.

Instead:

```ts
const Option = Schema.Struct({
  id: OptionId,
  text: NonEmptyText,
  rationale: Explanation
})

const SingleChoiceQuestion =
  Schema.Struct({
    kind: Schema.Literal("question"),
    questionType:
      Schema.Literal("singleChoice"),

    id: QuestionId,

    prompt: Prompt,

    options: Schema.Array(Option).check(
      Schema.isMinLength(2)
    ),

    correctOptionId: OptionId
  }).check(
    Schema.makeFilter((q) => {
      const ids = q.options.map((x) => x.id)
      const issues = []

      if (new Set(ids).size !== ids.length) {
        issues.push({
          path: ["options"],
          issue: "Option IDs must be unique"
        })
      }

      if (!ids.includes(q.correctOptionId)) {
        issues.push({
          path: ["correctOptionId"],
          issue:
            "Correct option must occur in options"
        })
      }

      return issues
    })
  )
```

Now "exactly one key" is structural:

```text
one `correctOptionId`
```

rather than a cardinality rule over booleans.

This belongs in Schema because the invariant can be decided from one question value.

# 7. Distractor rationales and claim support

The current corpus already requires original questions to have:

* one defensible correct answer;
* correct-answer explanation;
* a reason every distractor fails;
* source citations;
* domain and confusion metadata.

Represent the rationale directly on every option:

```ts
const SupportedStatement =
  Schema.Struct({
    kind: Schema.Literal("supported"),
    text: NonEmptyText,

    claims: Schema.Array(ClaimId).check(
      Schema.isMinLength(1)
    )
  })

const EditorialStatement =
  Schema.Struct({
    kind: Schema.Literal("editorial"),
    text: NonEmptyText
  })

const ExplanationBlock = Schema.Union([
  SupportedStatement,
  EditorialStatement
])

const Explanation = Schema.Struct({
  blocks:
    Schema.Array(ExplanationBlock)
      .check(Schema.isMinLength(1))
})
```

Then:

```ts
const Option = Schema.Struct({
  id: OptionId,
  text: NonEmptyText,
  rationale: Explanation
})
```

Schema establishes:

```text
Every option has a rationale.
Every supported rationale statement names >=1 claim.
```

The corpus gate establishes:

```text
Every ClaimId resolves.
Every referenced claim is publishable.
Every substantive claim ultimately resolves
to retained source lines.
```

That distinction is central.

# 8. Visual questions

The current project rules already require accessible pre-answer descriptions not to reveal the answer and complete descriptions after commitment.

Model those as separate fields, not one description with a mode flag:

```ts
const VisualPrompt = Schema.Struct({
  promptType: Schema.Literal("visual"),

  text: NonEmptyText,

  imageId: ImageId,

  neutralPreAnswerDescription:
    NonEmptyText,

  fullPostAnswerDescription:
    NonEmptyText,

  nonvisualEquivalent:
    NonEmptyText
})
```

This prevents accidental reuse of the same field for both states.

However, Schema cannot prove:

```text
"neutralPreAnswerDescription does not leak the answer"
```

That is semantic.

The correct model is:

```text
structural requirement
+
accessibility review targeting exact content digest
```

# 9. Reviews should be records, not booleans

Do not put:

```ts
rightsReviewed: true
securityReviewed: true
translationReviewed: true
```

inside content records.

Those booleans go stale immediately when content changes.

Use review records:

```ts
const Review = Schema.Struct({
  kind: Schema.Literal("review"),

  id: ReviewId,

  reviewType: Schema.Literals([
    "rights",
    "security",
    "accessibility",
    "translation",
    "editorial"
  ]),

  subjectKind: Schema.Literals([
    "image",
    "question",
    "hazardScene",
    "translation"
  ]),

  subjectId: NonEmptyText,

  subjectBasisDigest: ContentDigest,

  outcome: Schema.Literals([
    "passed",
    "failed"
  ]),

  reviewerId: ReviewerId,

  reviewedAt: Schema.DateFromString,

  policyVersion: PositiveInt
})
```

Then the publication gate asks:

```text
Does a passed review exist for:

  review type
  subject
  exact current basis digest
  acceptable policy version
?
```

If image bytes change:

```text
old digest != new digest
```

and the old rights review automatically ceases to satisfy the gate.

The same principle applies to translations and security reviews.

# 10. Source-line provenance

This needs stronger modeling than:

```ts
sourceId
lines: "44-48"
```

A source citation should resolve to an immutable observed source revision.

Recommended shape:

```ts
const SourceSpanRef = Schema.Struct({
  sourceId: SourceId,

  sourceRevisionDigest:
    ContentDigest,

  lineTableDigest:
    ContentDigest,

  startLine:
    PositiveInt,

  endLine:
    PositiveInt,

  selectedTextDigest:
    ContentDigest
}).check(
  Schema.makeFilter((s) =>
    s.startLine <= s.endLine ||
    "Invalid line range"
  )
)
```

The registry pass then checks:

```text
source exists
source revision exists
line table exists
range is in bounds
selected text digest matches
```

This protects against a future PDF/text extraction change causing an old:

```text
lines 44-48
```

to silently refer to different content.

# 11. Transformations in Effect 4

Effect 4 replaces the old transformation style with `Schema.decodeTo`.

The migration guide explicitly maps v3 transformations to v4 `decodeTo`, using either `SchemaTransformation` for ordinary transformations or `SchemaGetter.transformOrFail` for potentially failing/effectful conversion. ([GitHub][2])

Example:

```ts
import {
  Schema,
  SchemaTransformation
} from "effect"

const LowercaseIdentifier =
  Schema.String.pipe(
    Schema.decodeTo(
      Schema.String.check(
        Schema.isLowercased()
      ),
      SchemaTransformation.toLowerCase()
    )
  )
```

For this project, transformations should be used sparingly.

Good uses:

```text
ISO timestamp string -> Date
encoded legacy enum -> current enum
canonical URI representation
safe representation normalization
```

Bad uses:

```text
corpus migration
source lookup
claim resolution
rights lookup
security lookup
historical version lookup
```

In particular, **do not implement schema-version migration as one giant transformation**.

# 12. Encoding

One of the strongest reasons to make Schema authoritative is to use the same definition for decoding and encoding.

The v4 guide explicitly models:

```text
Encoded
    --decode-->
Type

Type
    --encode-->
Encoded
```

and Schema supports schemas whose runtime representation differs from their serialization representation.

For content publication, the important boundary should be:

```ts
const encoded =
  Schema.encodeSync(CurrentQuestion)(
    decodedQuestion
  )
```

Then canonicalize **that encoded form** before hashing.

Do not hash the arbitrary decoded JS object.

Use:

```text
Schema encoded value
        |
        v
canonical JSON serialization
        |
        v
SHA-256
```

The content compiler should only permit JSON-compatible publication schemas.

# 13. JSON Schema generation

Effect 4 supports deriving JSON Schema from Schema. The current Schema documentation describes generated tooling - including JSON Schema and Arbitrary generation - as derived from the Schema definition.

Use generated JSON Schema for:

```text
VS Code completion
editor validation
authoring forms
format documentation
external interoperability
```

But it must remain secondary.

Authority should be:

```text
Effect Schema decoder
+ corpus gates
```

not:

```text
JSON Schema validator
```

JSON Schema cannot represent many of the required rules:

```text
reference must resolve
claim must reach source lines
entry-level graph cannot reach H-tier concept
review digest must match current asset
published immutable tuple cannot change
```

So:

```text
Effect Schema
    -> generate JSON Schema

not

JSON Schema
    -> define Effect model
```

# 14. Recursive models

Effect 4 Schema supports recursive definitions through suspended schemas.

Use recursion for structures that actually nest within one value:

```text
page sections
structured explanations
hazard-scene groups
content blocks
```

For example conceptually:

```ts
interface Section {
  readonly kind: "section"
  readonly title: string
  readonly children:
    ReadonlyArray<PageNode>
}

type PageNode =
  | TextNode
  | FactRefNode
  | Section
```

with recursive children represented through `Schema.suspend`.

Do **not** recursively embed:

```text
Question -> Claim -> Source -> Question -> ...
```

Cross-record relations should always be IDs.

That keeps records independently:

* hashable;
* migratable;
* reviewable;
* reusable;
* content-addressable.

# 15. Mutable exam facts

This is one of the most important compiler gates.

The repository already maintains administration-sensitive facts such as:

* filing dates;
* fees;
* exam dates;
* jurisdiction participation;
* announcement qualifications;
* review mechanics;
* administration medium.

It also explicitly warns against treating unknown values like item count, weights, score conversion, or future cadence as established facts.

Do not permit this:

```ts
{
  kind: "paragraph",
  text:
    "The exam costs $50 and will be held August 22."
}
```

on an unversioned evergreen page.

Instead:

```ts
const FactRef = Schema.Struct({
  kind: Schema.Literal("factRef"),
  claimId: ClaimId,
  rendering: Schema.Literals([
    "inline",
    "sentence",
    "citation"
  ])
})
```

or:

```ts
const AnnouncementFieldRef =
  Schema.Struct({
    kind:
      Schema.Literal(
        "announcementFieldRef"
      ),

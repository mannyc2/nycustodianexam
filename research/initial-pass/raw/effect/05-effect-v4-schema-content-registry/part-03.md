    profileId:
      AnnouncementProfileId,

    field:
      Schema.Literals([
        "fee",
        "examDate",
        "filingDeadline"
      ])
  })
```

Then an evergreen page cannot become the source of truth for mutable data.

The compiler resolves the reference during generation.

# 16. Corpus registry

Once every file decodes, construct a registry:

```ts
interface Registry {
  readonly sources:
    ReadonlyMap<SourceId, Source>

  readonly claims:
    ReadonlyMap<ClaimId, Claim>

  readonly questions:
    ReadonlyMap<QuestionId, Question>

  readonly images:
    ReadonlyMap<ImageId, Image>

  readonly reviews:
    ReadonlyMap<ReviewId, Review>

  // etc.
}
```

But don't build it directly with:

```ts
new Map(records.map(...))
```

because duplicate IDs would overwrite each other.

Construction must initially use:

```text
ID -> [record, record, ...]
```

Then validate uniqueness.

Only after duplicate detection may it produce:

```text
ID -> record
```

# 17. Relational gates

I recommend these named passes, in this order:

```text
01 identity
02 references
03 source-integrity
04 provenance
05 conflicts
06 question-coherence
07 taxonomy
08 audience-boundary
09 visual-accessibility
10 rights
11 security
12 translations
13 pages
14 historical-immutability
15 publication-closure
```

### Identity

Check:

```text
duplicate IDs
duplicate revision identities
alias collisions
invalid revision progression
```

### References

Check:

```text
every reference resolves
reference kind is correct
reference is unambiguous
```

### Source integrity

Check:

```text
source revision exists
line span exists
range is valid
span digest matches
```

### Provenance

Check:

```text
verified claim -> support
supported prose -> claims
claim -> source lines
```

### Conflicts

Check:

```text
>= 2 retained alternatives
each alternative supported
resolution retains alternatives
```

### Question coherence

Check:

```text
all rationale claims usable
question answer does not depend on unresolved fact
confusion-set references valid
```

### Audience boundary

Traverse dependencies.

For every entry-level question:

```text
question
 -> explanation
 -> claim
 -> concept
 -> taxonomy
```

Reject any path that reaches an H/high-level-only concept.

The repository's current taxonomy explicitly classifies `H` as high-level only and excludes it from entry sessions.

A good diagnostic should show the graph path:

```text
AUDIENCE.HIGH_LEVEL_DEPENDENCY

question:q-123
 -> explanation:e-8
 -> claim:c-44
 -> concept:boiler-diagnosis

concept:boiler-diagnosis is high-level-only.
```

This is much better than merely saying:

```text
Question invalid.
```

# 18. Immutable versions

Separate four things:

```text
logical ID
record revision
schema version
payload digest
```

For example:

```json
{
  "id": "question:01K...",
  "revision": 3,
  "schemaVersion": 2,
  "...": "..."
}
```

Meaning:

```text
id
    identity of the question

revision
    content history of that question

schemaVersion
    serialized data model version

digest
    identity of these exact bytes
```

Do not conflate them.

The publication invariant should be:

```text
(kind, id, revision)
    -> exactly one payload digest forever
```

So:

```text
same tuple + same digest
    OK

same tuple + different digest
    fatal

higher revision + different digest
    OK
```

"Current" should be represented by the release manifest, not by mutating the old revision.

# 19. Schema versioning and migrations

Give each record family its own schema version.

Do not have:

```text
CorpusSchemaVersion = 19
```

forcing every kind through every migration.

Prefer:

```text
Question schema v3
Claim schema v5
Image schema v2
Translation schema v4
```

Migration pipeline:

```text
unknown
   |
   v
decode envelope
   |
   v
dispatch by schemaVersion
   |
   v
decode historical schema
   |
   v
V1 -> V2
   |
   v
decode V2
   |
   v
V2 -> V3
   |
   v
decode V3
```

Example:

```ts
const Envelope = Schema.Struct({
  kind: Schema.String,
  schemaVersion: Schema.Int,
  id: Schema.String
})
```

Then:

```ts
switch (envelope.schemaVersion) {
  case 1:
    return migrateV2(
      migrateV1(
        decodeV1(input)
      )
    )

  case 2:
    return migrateV2(
      decodeV2(input)
    )

  case 3:
    return decodeV3(input)
}
```

Each destination is decoded after migration.

A migration may mechanically transform representation.

It must not fabricate:

```text
source support
rights approval
security approval
accessibility approval
translation review
conflict resolution
```

If new schema semantics require information that cannot be derived:

```text
MIGRATION.AUTHOR_INPUT_REQUIRED
```

should fail the build.

# 20. Schema parsing errors

For the compiler, parse all records with all-error mode rather than the default fail-fast behavior.

Conceptually:

```ts
const decodeOptions = {
  errors: "all",
  onExcessProperty: "error"
} as const
```

This is particularly important for authored content because a record with five bad fields should normally report all five in one run.

Do not permit unknown keys silently.

A typo like:

```json
{
  "correctOptonId": "option:..."
}
```

must not be treated as "missing `correctOptionId` plus harmless extra metadata."

Effect's Schema error facilities should provide the structured issue path; the authoring parser should separately retain actual file ranges.

Resulting compiler diagnostic:

```text
content/questions/q-104.json:42:3

[STRUCT.UNKNOWN_PROPERTY]

Unknown property:
  correctOptonId

Did you mean:
  correctOptionId
```

# 21. Compiler diagnostics should be their own Schema

Define compiler diagnostics as ordinary Effect Schema data:

```ts
const Diagnostic =
  Schema.Struct({
    code: NonEmptyText,

    severity:
      Schema.Literals([
        "error",
        "warning",
        "info"
      ]),

    phase:
      Schema.Literals([
        "parse",
        "decode",
        "registry",
        "validate",
        "derive",
        "publish"
      ]),

    file:
      Schema.optionalKey(Schema.String),

    pointer:
      Schema.optionalKey(Schema.String),

    message:
      NonEmptyText,

    related:
      Schema.Array(RelatedDiagnostic)
  })
```

Emit:

```text
terminal output
diagnostics.json
optional SARIF
```

Stable project error codes matter more than stable Effect formatter prose.

Effect Schema internals can evolve through v4 RCs without changing:

```text
PROVENANCE.MISSING_SOURCE
AUDIENCE.HIGH_LEVEL_DEPENDENCY
RIGHTS.REVIEW_STALE
```

# 22. `ValidatedCorpus`

Introduce a type that cannot normally be constructed outside validation:

```ts
declare const ValidatedCorpusTypeId:
  unique symbol

interface ValidatedCorpus {
  readonly [ValidatedCorpusTypeId]:
    true

  readonly registry: Registry
}
```

Then:

```ts
function validateCorpus(

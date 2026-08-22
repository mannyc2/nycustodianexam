  registry: Registry
): Effect.Effect<
  ValidatedCorpus,
  PublicationRejected,
  PublishedHistory
>
```

and generators accept:

```ts
generateSearchIndex(
  corpus: ValidatedCorpus
)

generatePages(
  corpus: ValidatedCorpus
)

generatePack(
  corpus: ValidatedCorpus
)
```

not:

```ts
generatePages(registry)
```

This makes:

```text
relational validation
```

a type-level phase boundary in the compiler.

# 23. Use Effect for the compiler orchestration

The validation algorithms themselves should mostly be pure.

For example:

```ts
type Gate = (
  registry: Registry
) => ReadonlyArray<Diagnostic>
```

Then:

```ts
const diagnostics =
  [
    validateReferences,
    validateProvenance,
    validateAudience,
    validateRights
  ]
    .flatMap((gate) =>
      gate(registry)
    )
```

Effect should own real effects:

```text
read author files
read source snapshots
hash bytes
read previous publication manifest
write staging tree
atomically promote release root
```

and typed operational failures:

```text
SourceReadError
HistoryReadError
HashError
ArtifactWriteError
PublicationError
```

Author validation failures are better modeled as accumulated diagnostics than as thousands of values in the Effect error channel.

# 24. Generated outputs

I would generate all of these.

| Output                    | Recommendation |
| ------------------------- | -------------- |
| Validated JSON            | Yes            |
| Content-addressed records | Yes            |
| Derived counts            | Yes            |
| Search indexes            | Yes            |
| Static page inputs        | Yes            |
| Claim maps                | Yes            |
| Source maps               | Yes            |
| Sitemaps                  | Yes            |
| Image manifests           | Yes            |
| Offline pack manifests    | Yes            |
| JSON Schema               | Yes            |
| Diagnostics               | Yes            |
| Build manifest            | Yes            |

### Validated JSON

Only current Schema encoding.

```text
author representation
 -> migrate
 -> decode
 -> encode current Schema
 -> canonical JSON
```

### Content-addressed objects

Hash the exact canonical encoded bytes.

Recommended:

```text
sha256:<64 lowercase hex chars>
```

Store:

```text
objects/sha256/ab/abcdef...
```

### Derived counts

Never hand-author:

```text
question count
tool count
domain count
review coverage
translation coverage
```

Generate them from `ValidatedCorpus`.

### Search

Search indexes are disposable derived data.

Their manifest should include:

```text
input release digest
index format version
locale
tokenizer version
```

### Page input

Static HTML generation should consume a resolved `PageInput`, not arbitrary raw corpus records.

For question pages:

```ts
{
  preCommit: {
    prompt,
    options,
    neutralDescription
  },

  postCommit: {
    answer,
    rationales,
    fullDescription,
    sources
  }
}
```

This makes commit-before-reveal semantics much harder to accidentally violate.

### Claim/source maps

Generate both directions:

```text
question
 -> statements
 -> claims
 -> spans
 -> source

source
 -> spans
 -> claims
 -> questions/pages
```

This makes corrections and source withdrawal tractable.

### Image manifest

Include:

```text
image ID
original digest
variant digests
dimensions
media type
rights basis
usage records
current applicable reviews
```

### Offline packs

The pack manifest should contain a closed graph:

```text
pack ID
pack version
release root
object digests
object sizes
locales
compatibility version
previous/fallback root
```

The compiler should prove every object exists before publication.

# 25. Content-addressing

Do not rely on:

```ts
JSON.stringify(object)
```

alone as long-term identity unless you formally freeze the serialization procedure.

Use canonical JSON.

The principle should be:

```text
Schema.encode
     |
     v
canonical JSON
     |
     v
UTF-8 bytes
     |
     v
SHA-256
```

No build-time timestamps, filesystem traversal order, or host-specific information should enter object identity.

# 26. Testing strategy

Effect 4's Schema tooling can derive Arbitraries, so property testing is especially attractive for foundational schemas. The v4 Schema guide specifically identifies arbitrary generation as derived tooling from Schema.

You need five test layers.

### Schema fixture tests

For every record kind:

```text
minimum valid
full valid
missing required field
unknown property
wrong type
invalid ID
invalid union tag
invalid local relationship
```

### Property tests

For:

```text
IDs
line spans
revisions
encode/decode
canonicalization
manifest closure
```

Do not universally assert:

```ts
encode(decode(x)) === x
```

for lossy transformations.

Instead, only assert round-trip identity where that is part of the specific Schema's contract.

### Relational gate fixtures

At minimum:

```text
verified claim with no valid source span
conflict with missing alternative
dangling claim reference
multiple record definitions for one ID
question with stale security review
image with stale rights review
entry question -> H concept
reviewed translation -> changed source
mutable announcement fact in literal prose
immutable version overwrite
pack missing an object
```

### Migration fixtures

Every historical version receives permanent fixtures.

Test:

```text
old decode
every migration hop
new decode
semantic preservation
id preservation
no fabricated review state
```

### Determinism tests

Compile the same corpus with:

```text
different filesystem enumeration order
different Map insertion order
different timezone
different locale
clean cache
warm cache
```

and assert identical publication roots.

# 27. One additional Effect 4 consideration: pin the RC cohort

Because we're now explicitly choosing v4 rather than evaluating v3 versus v4, I would pin the Effect 4 RC cohort exactly while it remains prerelease:

```json
{
  "dependencies": {
    "effect": "4.0.0-rc.110"
  }
}
```

and match any Effect ecosystem packages to the same cohort where that package participates in v4's synchronized release train.

Effect 4 explicitly moved the ecosystem toward synchronized package versioning. ([GitHub][1]) Current ecosystem package listings show the `4.0.0-rc.110` line published as of August 20. ([npm][3])

I would **not** use:

```json
"effect": "^4.0.0-rc.0"
```

during RC development.

The compiler is publication-critical infrastructure. A fresh install should not silently consume a changed Schema API.

Once stable `4.x` is actually released and the project deliberately upgrades, this policy can be revisited.

# Final proposed architecture

The smallest robust design is:

```text
                    Authoring files
                         |
                         v
                  JSON/JSONC parser
                 unknown + locations
                         |
                         v
              Effect 4 Schema decode
         errors: all, excess props: error
                         |
                         v
                Historical migration
                         |
                         v
              Current-version records
                         |
                         v
                 Schema.encode
                         |
                         v
            Canonical encoded records
                         |
                         v
                  Registry build
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     references      provenance     versions
          |              |              |
          +------+-------+------+-------+
                 |              |
                 v              v
           audience gate    review gates
                 |              |
                 +------+-------+
                        |
                        v
                 ValidatedCorpus
                        |
       +----------------+----------------+
       |                |                |
       v                v                v
     pages           search          claim maps
       |                |                |
       +--------+-------+-------+--------+
                |               |
                v               v
             images           packs
                |               |
                +-------+-------+
                        |
                        v
              output Schema checks
                        |
                        v
                 canonical bytes
                        |
                        v
                    SHA-256
                        |
                        v
                 release manifest
                        |
                        v
               publish manifest last
```

The core rule I would put into the architecture decision is:

> **Effect 4 Schema is the authoritative model for individual encoded and decoded values. A corpus becomes publishable only after those values are assembled into a registry and pass explicit relational publication gates.**

That gives Effect Schema the central role it is good at without turning `Schema.check` into a hidden database/query system. For this corpus in particular, that boundary is what lets source provenance, contradictions, high-level exclusions, review freshness, translations, immutable history, and offline-pack closure remain explicit and auditable rather than being scattered through individual field validators.

[1]: https://github.com/Effect-TS/effect/blob/main/MIGRATION.md?utm_source=chatgpt.com "effect/MIGRATION.md at main · Effect-TS/effect · GitHub"
[2]: https://github.com/Effect-TS/effect/blob/main/migration/schema.md?utm_source=chatgpt.com "effect/migration/schema.md at main · Effect-TS/effect · GitHub"
[3]: https://www.npmjs.com/package/%40effect/vitest?activeTab=versions&utm_source=chatgpt.com "@effect/vitest - npm"

# Entity model

## Identity axes

Every durable entity separates:

```text
logical ID | record revision | schema version | encoded payload digest
```

`(kind, logical ID, revision)` is immutable once published. The release manifest
selects current revisions; history is never rewritten.

## Authoring and registry entities

| Entity | Required core | Structural Schema rules | Relational/publication rules |
|---|---|---|---|
| `SourceCitation` | ID, tier, title, publisher, canonical/archive URL, observed version, rights note | branded ID, explicit tier union, URL/string shape | immutable source revision exists; withdrawal retained |
| `SourceLine` | ID, source revision digest, line-table digest, range, selected-text digest, excerpt | positive ordered range, digests | range in bounds; selected digest matches retained line table |
| `SupportedClaim` | ID, localized statement, fact state, source-line IDs, tier, caveat | discriminated verified/conflicting/open/superseded state | verified closes to source lines; conflicts retain supported alternatives |
| `AnnouncementProfile` | ID/revision, jurisdiction/title/exam, test-plan compatibility, versioned facts | fact states as tagged union | verified facts sourced; histories non-overlapping; unresolved status rendered |
| `TestPlan` | stable plan ID/version, domains, compatibility | explicit version and domain IDs | never infer unpublished counts/weights/scoring |
| `ToolConcept` | ID, domain/family, launch scope, aliases, decisive features | branded references and explicit audience | entry graph cannot reach high-level-only concept |
| `ConfusionSet` | ID, directed concept pairs, rationale | nonempty pair list | concepts exist; directions valid and distinct |
| `Procedure` | ID, ordered steps, task scope, supported statements | recursive/ordered block schema where needed | each substantive rule closes to claims; no invented universal settings |
| `Question` | ID/revision, kind, prompt, options, one key, tags/scope, basis digest | one `correctOptionId`; unique option IDs; every option has rationale | claims resolve; compatibility, reviews, leak, and history pass |
| `QuestionOption` | ID, text, rationale, concept mapping | required rationale and nonempty supported blocks | distractor reasoning is source-usable and not contradictory |
| `Explanation` | ordered supported/editorial blocks | supported blocks require claim IDs | every substantive statement closes to publishable claims |
| `ImageAsset` | ID/revision, kind, bytes/viewBox/dimensions/checksum, neutral/full descriptions, rights/accessibility basis | descriptions and digest required | current rights/a11y reviews; nonvisual equivalent; no pre-answer leak |
| `GeometryAsset` | ID/revision, source/provenance, param model, decisive feature map | geometry manifest schema | rights/mechanical review; source/render checksums; no answer-bearing metadata |
| render/view manifest | asset/view IDs, renderer/version, parameters, output digests/dimensions | closed current-version schema | every referenced output exists; deterministic view policy |
| `HazardScene` | ID/revision, environment, zones, targets, decoys, neutral/full descriptions | zero or more targets; explicit zone order | feedback coverage, source closure, rights/a11y/security review |
| `HazardTarget` | ID, region/zone, observable and interpretive feedback, claim IDs | valid coordinate/zone shape | region in bounds; feedback/source closure |
| `SceneDecoy` | ID, region/zone, false-positive feedback | valid coordinate/zone shape | region in bounds; authored feedback and review |
| `TranslationRecord` | ID/revision, subject/basis digests, source/target locale, translated payload | locale and digest shape | subject exists; source basis current; passed translation review |
| `Review` | ID/type, subject, exact basis digest, outcome, reviewer, time, policy version | tagged type/outcome | passed current-basis review satisfies named gate; stale review never does |
| `ChangeLogEntry` | immutable change ID, subject versions, category, note, effective time | typed change category | published revisions form legal progression; correction retained |
| progress export/import envelope | schema version, scope, event IDs, object refs, checksum | strict decode and checksum shape | preview, dedupe, quarantine unknown refs; no entry/high-level merge |

## Generated entities

`ValidatedCorpus` is an opaque phase capability, not authoring data. It contains
the duplicate-free indexes plus the exact successful diagnostic/gate version.

Generated schemas include `PreCommitPageInput`, `PostCommitPageInput`,
`SearchDocument`, `SourceMap`, `ClaimMap`, `ImageManifest`, `ContentPackManifest`,
`ReleaseManifest`, `DiagnosticsReport`, and optional SARIF/GitHub annotations.

## Rejected modeling patterns

- optional booleans whose combinations encode fact or review state;
- `isCorrect` on each option;
- mutable `reviewed: true` fields on subject records;
- recursive embedded question→claim→source graphs;
- one global schema version for every record family;
- references resolved inside hidden `Schema.check` closures;
- hard-coded mutable exam facts inside evergreen prose.

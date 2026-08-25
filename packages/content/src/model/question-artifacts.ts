import { Schema } from "effect"
import { ArtifactPathSegment } from "./content-primitives.ts"
import {
  AuthoredQuestionTags,
  QuestionFactKind,
  SafeQuestionMembership
} from "./question-metadata.ts"
import { SourceReceipt, SupportedClaim } from "./source-evidence.ts"

export class QuestionOption extends Schema.Class<QuestionOption>(
  "@nycustodian/content/QuestionOption"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString
}) {}

export class QuestionRationale extends Schema.Class<QuestionRationale>(
  "@nycustodian/content/QuestionRationale"
)({
  optionId: Schema.NonEmptyString,
  message: Schema.NonEmptyString,
  claimIds: Schema.NonEmptyArray(ArtifactPathSegment)
}) {}

/** Exact question feedback shape published before source-line evidence was added. */
export class LegacyQuestionRationale extends Schema.Class<LegacyQuestionRationale>(
  "@nycustodian/content/LegacyQuestionRationale"
)({
  optionId: Schema.NonEmptyString,
  message: Schema.NonEmptyString
}) {}

/** Exact source reference shape embedded in the first M4 durable records. */
export class LegacyQuestionSourceReceipt extends Schema.Class<LegacyQuestionSourceReceipt>(
  "@nycustodian/content/LegacyQuestionSourceReceipt"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  locator: Schema.NonEmptyString
}) {}

export const QuestionOptionConcept = Schema.Struct({
  optionId: Schema.NonEmptyString,
  conceptId: Schema.NonEmptyString
})

export const QuestionOptionConceptMappings = Schema.NonEmptyArray(
  QuestionOptionConcept
).check(
  Schema.makeFilter((mappings) => {
    const optionIds = mappings.map((mapping) => mapping.optionId)
    const conceptIds = mappings.map((mapping) => mapping.conceptId)
    const issues: Array<Schema.FilterIssue> = []

    if (new Set(optionIds).size !== optionIds.length) {
      issues.push("option-to-concept mappings must use unique option ids")
    }
    if (new Set(conceptIds).size !== conceptIds.length) {
      issues.push("option-to-concept mappings must use unique concept ids")
    }

    return issues
  })
)

export { SourceReceipt } from "./source-evidence.ts"

export class AuthoredQuestion extends Schema.Class<AuthoredQuestion>(
  "@nycustodian/content/AuthoredQuestion"
)({
  schemaVersion: Schema.Literal(2),
  id: ArtifactPathSegment,
  version: Schema.Int,
  profileId: Schema.NonEmptyString,
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  claims: Schema.NonEmptyArray(SupportedClaim),
  sources: Schema.Array(SourceReceipt)
}) {}

export class LegacyPrecommitQuestion extends Schema.Class<LegacyPrecommitQuestion>(
  "@nycustodian/content/LegacyPrecommitQuestion"
)({
  schemaVersion: Schema.Literal(1),
  id: ArtifactPathSegment,
  profileId: Schema.NonEmptyString,
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption)
}) {}

export class PrecommitQuestion extends Schema.Class<PrecommitQuestion>(
  "@nycustodian/content/PrecommitQuestion"
)({
  schemaVersion: Schema.Literal(2),
  id: ArtifactPathSegment,
  version: Schema.Int,
  profileId: Schema.NonEmptyString,
  profileIds: Schema.optionalKey(Schema.NonEmptyArray(Schema.NonEmptyString)),
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption),
  memberships: Schema.optionalKey(Schema.Array(SafeQuestionMembership))
}) {}

export const ReleasedPrecommitQuestion = Schema.Union([
  LegacyPrecommitQuestion,
  PrecommitQuestion
])

export type ReleasedPrecommitQuestion = typeof ReleasedPrecommitQuestion.Type

export class LegacyPostcommitQuestion extends Schema.Class<LegacyPostcommitQuestion>(
  "@nycustodian/content/LegacyPostcommitQuestion"
)({
  schemaVersion: Schema.Literal(1),
  id: ArtifactPathSegment,
  optionConceptIds: Schema.optionalKey(QuestionOptionConceptMappings),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(LegacyQuestionRationale),
  sources: Schema.NonEmptyArray(LegacyQuestionSourceReceipt)
}) {}

export class PostcommitQuestion extends Schema.Class<PostcommitQuestion>(
  "@nycustodian/content/PostcommitQuestion"
)({
  schemaVersion: Schema.Literal(2),
  id: ArtifactPathSegment,
  version: Schema.Int,
  optionConceptIds: Schema.optionalKey(QuestionOptionConceptMappings),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  claims: Schema.NonEmptyArray(SupportedClaim),
  sources: Schema.NonEmptyArray(SourceReceipt),
  tags: Schema.optionalKey(AuthoredQuestionTags),
  objectiveId: Schema.optionalKey(ArtifactPathSegment),
  equivalenceGroupId: Schema.optionalKey(ArtifactPathSegment),
  factKind: Schema.optionalKey(QuestionFactKind)
}) {}

export const ReleasedPostcommitQuestion = Schema.Union([
  LegacyPostcommitQuestion,
  PostcommitQuestion
])

export type ReleasedPostcommitQuestion = typeof ReleasedPostcommitQuestion.Type

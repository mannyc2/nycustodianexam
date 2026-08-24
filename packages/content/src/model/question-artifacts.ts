import { Schema } from "effect"
import { ArtifactPathSegment } from "./content-primitives.ts"

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
  message: Schema.NonEmptyString
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

export class SourceReceipt extends Schema.Class<SourceReceipt>(
  "@nycustodian/content/SourceReceipt"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  locator: Schema.NonEmptyString
}) {}

export class AuthoredQuestion extends Schema.Class<AuthoredQuestion>(
  "@nycustodian/content/AuthoredQuestion"
)({
  schemaVersion: Schema.Literal(1),
  id: ArtifactPathSegment,
  profileId: Schema.NonEmptyString,
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  sources: Schema.Array(SourceReceipt)
}) {}

export class PrecommitQuestion extends Schema.Class<PrecommitQuestion>(
  "@nycustodian/content/PrecommitQuestion"
)({
  schemaVersion: Schema.Literal(1),
  id: ArtifactPathSegment,
  profileId: Schema.NonEmptyString,
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption)
}) {}

export class PostcommitQuestion extends Schema.Class<PostcommitQuestion>(
  "@nycustodian/content/PostcommitQuestion"
)({
  schemaVersion: Schema.Literal(1),
  id: ArtifactPathSegment,
  optionConceptIds: Schema.optionalKey(QuestionOptionConceptMappings),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  sources: Schema.NonEmptyArray(SourceReceipt)
}) {}

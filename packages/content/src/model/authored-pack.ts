import { Schema } from "effect"
import { ArtifactPathSegment, ContentLocale } from "./content-primitives.ts"
import { QuestionRationale } from "./question-artifacts.ts"

export class ContentSource extends Schema.Class<ContentSource>(
  "@nycustodian/content/ContentSource"
)({
  id: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  scope: Schema.NonEmptyString,
  publisher: Schema.optionalKey(Schema.NonEmptyString),
  url: Schema.optionalKey(Schema.NonEmptyString)
}) {}

export class AuthoredProfile extends Schema.Class<AuthoredProfile>(
  "@nycustodian/content/AuthoredProfile"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  jurisdiction: Schema.NonEmptyString,
  series: Schema.Literal("entry-level-custodians-janitors"),
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString)
}) {}

export class AuthoredTool extends Schema.Class<AuthoredTool>(
  "@nycustodian/content/AuthoredTool"
)({
  conceptId: Schema.NonEmptyString,
  family: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  useSummary: Schema.NonEmptyString,
  distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
  confusableConceptIds: Schema.Array(Schema.NonEmptyString),
  neutralDescription: Schema.NonEmptyString,
  fullDescription: Schema.NonEmptyString,
  practiceEligibility: Schema.Literals(["text-question", "atlas-only"])
}) {}

export class AuthoredPackQuestionOption extends Schema.Class<AuthoredPackQuestionOption>(
  "@nycustodian/content/AuthoredPackQuestionOption"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  conceptId: Schema.NonEmptyString
}) {}

export const PassedQuestionReview = Schema.Struct({
  content: Schema.Literal("passed"),
  security: Schema.Literal("passed"),
  accessibility: Schema.Literal("passed")
})

export class AuthoredPackQuestion extends Schema.Class<AuthoredPackQuestion>(
  "@nycustodian/content/AuthoredPackQuestion"
)({
  id: ArtifactPathSegment,
  profileIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(AuthoredPackQuestionOption),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  originalContentAttestation: Schema.Literal(true),
  review: PassedQuestionReview
}) {}

export class AuthoredContentPack extends Schema.Class<AuthoredContentPack>(
  "@nycustodian/content/AuthoredContentPack"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  sources: Schema.NonEmptyArray(ContentSource),
  profiles: Schema.NonEmptyArray(AuthoredProfile),
  tools: Schema.NonEmptyArray(AuthoredTool),
  questions: Schema.NonEmptyArray(AuthoredPackQuestion),
  sceneIds: Schema.NonEmptyArray(Schema.NonEmptyString)
}) {}

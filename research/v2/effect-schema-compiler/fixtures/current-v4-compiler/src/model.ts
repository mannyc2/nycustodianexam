import { Schema } from "effect"

const identifier = (prefix: string, brand: string) =>
  Schema.String
    .check(Schema.isPattern(new RegExp(`^${prefix}:[a-z0-9][a-z0-9._-]*$`)))
    .pipe(Schema.brand(brand))

export const SourceId = identifier("source", "SourceId")
export type SourceId = typeof SourceId.Type

export const ClaimId = identifier("claim", "ClaimId")
export type ClaimId = typeof ClaimId.Type

export const ConceptId = identifier("concept", "ConceptId")
export type ConceptId = typeof ConceptId.Type

export const ImageId = identifier("image", "ImageId")
export type ImageId = typeof ImageId.Type

export const QuestionId = identifier("question", "QuestionId")
export type QuestionId = typeof QuestionId.Type

export const OptionId = identifier("option", "OptionId")
export type OptionId = typeof OptionId.Type

export const ReviewId = identifier("review", "ReviewId")
export type ReviewId = typeof ReviewId.Type

export const ProfileId = identifier("profile", "ProfileId")
export type ProfileId = typeof ProfileId.Type

export const TranslationId = identifier("translation", "TranslationId")
export type TranslationId = typeof TranslationId.Type

export const ContentDigest = Schema.String
  .check(Schema.isPattern(/^sha256:[a-f0-9]{64}$/))
  .pipe(Schema.brand("ContentDigest"))
export type ContentDigest = typeof ContentDigest.Type

const NonEmptyText = Schema.String.check(Schema.isMinLength(1))
const PositiveInt = Schema.Int.check(Schema.isGreaterThan(0))

export class Source extends Schema.TaggedClass<Source>()("Source", {
  schemaVersion: Schema.Literal(1),
  id: SourceId,
  revision: PositiveInt,
  title: NonEmptyText,
  revisionDigest: ContentDigest,
  lineCount: PositiveInt
}) {}

export class SourceSpan extends Schema.TaggedClass<SourceSpan>()("SourceSpan", Schema.Struct({
  schemaVersion: Schema.Literal(1),
  id: identifier("span", "SourceSpanId"),
  sourceId: SourceId,
  sourceRevisionDigest: ContentDigest,
  startLine: PositiveInt,
  endLine: PositiveInt,
  selectedTextDigest: ContentDigest
}).check(Schema.makeFilter(
  (span) => span.startLine <= span.endLine,
  { title: "startLine <= endLine" }
))) {}

export class Claim extends Schema.TaggedClass<Claim>()("Claim", {
  schemaVersion: Schema.Literal(1),
  id: ClaimId,
  revision: PositiveInt,
  status: Schema.Literals(["verified", "conflicting", "open"]),
  text: NonEmptyText,
  supportSpanIds: Schema.Array(identifier("span", "SourceSpanId"))
}) {}

export class Concept extends Schema.TaggedClass<Concept>()("Concept", {
  schemaVersion: Schema.Literal(1),
  id: ConceptId,
  revision: PositiveInt,
  audience: Schema.Literals(["entry", "high-level"]),
  title: NonEmptyText
}) {}

export class Image extends Schema.TaggedClass<Image>()("Image", {
  schemaVersion: Schema.Literal(1),
  id: ImageId,
  revision: PositiveInt,
  basisDigest: ContentDigest,
  neutralPreAnswerDescription: NonEmptyText,
  fullPostAnswerDescription: NonEmptyText,
  nonvisualEquivalent: NonEmptyText
}) {}

const Explanation = Schema.Struct({
  text: NonEmptyText,
  claimIds: Schema.Array(ClaimId).check(Schema.isMinLength(1))
})

const Option = Schema.Struct({
  id: OptionId,
  text: NonEmptyText,
  rationale: Explanation
})

const TextPrompt = Schema.Struct({
  promptType: Schema.Literal("text"),
  text: NonEmptyText
})

const VisualPrompt = Schema.Struct({
  promptType: Schema.Literal("visual"),
  text: NonEmptyText,
  imageId: ImageId
})

const QuestionFields = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  id: QuestionId,
  revision: PositiveInt,
  audience: Schema.Literal("entry"),
  conceptIds: Schema.Array(ConceptId).check(Schema.isMinLength(1)),
  prompt: Schema.Union([TextPrompt, VisualPrompt]),
  options: Schema.Array(Option).check(Schema.isMinLength(2)),
  correctOptionId: OptionId
}).check(Schema.makeFilter((question) => {
  const optionIds = question.options.map((option) => option.id)
  return optionIds.length === new Set(optionIds).size && optionIds.includes(question.correctOptionId)
}, { title: "unique option IDs and one in-set correctOptionId" }))

export class Question extends Schema.TaggedClass<Question>()("Question", QuestionFields) {}

const VerifiedFact = Schema.Struct({
  status: Schema.Literal("verified"),
  claimId: ClaimId
})

const NotPublishedFact = Schema.Struct({
  status: Schema.Literal("not_published"),
  reason: NonEmptyText
})

const ConflictingFact = Schema.Struct({
  status: Schema.Literal("conflicting"),
  alternativeClaimIds: Schema.Array(ClaimId).check(Schema.isMinLength(2))
})

const SupersededFact = Schema.Struct({
  status: Schema.Literal("superseded"),
  previousClaimId: ClaimId,
  replacementClaimId: ClaimId
})

export class AnnouncementProfile extends Schema.TaggedClass<AnnouncementProfile>()("AnnouncementProfile", {
  schemaVersion: Schema.Literal(1),
  id: ProfileId,
  revision: PositiveInt,
  title: NonEmptyText,
  facts: Schema.Array(Schema.Union([
    VerifiedFact,
    NotPublishedFact,
    ConflictingFact,
    SupersededFact
  ])).check(Schema.isMinLength(1))
}) {}

export class Translation extends Schema.TaggedClass<Translation>()("Translation", {
  schemaVersion: Schema.Literal(1),
  id: TranslationId,
  revision: PositiveInt,
  subjectId: Schema.String,
  sourceLocale: Schema.Literal("en"),
  locale: Schema.String.check(Schema.isPattern(/^[a-z]{2}(?:-[A-Z]{2})?$/)),
  sourceBasisDigest: ContentDigest,
  basisDigest: ContentDigest,
  translatedText: NonEmptyText
}) {}

export class Review extends Schema.TaggedClass<Review>()("Review", {
  schemaVersion: Schema.Literal(1),
  id: ReviewId,
  revision: PositiveInt,
  reviewType: Schema.Literals(["source", "content", "security", "rights", "accessibility", "translation"]),
  subjectId: Schema.String,
  subjectBasisDigest: ContentDigest,
  outcome: Schema.Literals(["passed", "failed"]),
  policyVersion: PositiveInt
}) {}

export const RecordSchema = Schema.Union([
  Source,
  SourceSpan,
  Claim,
  Concept,
  Image,
  Question,
  AnnouncementProfile,
  Translation,
  Review
])

export type CorpusRecord = typeof RecordSchema.Type

export const CorpusFileSchema = Schema.Struct({
  formatVersion: Schema.Literal(1),
  records: Schema.Array(RecordSchema)
})

export type CorpusFile = typeof CorpusFileSchema.Type

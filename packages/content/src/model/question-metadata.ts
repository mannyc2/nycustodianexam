import { Schema } from "effect"
import { ArtifactPathSegment, Sha256 } from "./content-primitives.ts"

export const PracticeSetLength = Schema.Literals([45, 60, 90])

export const QuestionDomain = Schema.Literals([
  "cleaning-tools-and-uses",
  "minor-maintenance-and-repair",
  "health-and-safety"
])

export const EditorialDifficulty = Schema.Literals([
  "foundational",
  "contrast",
  "application"
])

export const AuthoredQuestionTags = Schema.Struct({
  domain: QuestionDomain,
  family: Schema.NonEmptyString,
  confusionSetIds: Schema.Array(ArtifactPathSegment),
  seriesScope: Schema.Literal("entry-level-custodians-janitors"),
  editorialDifficulty: EditorialDifficulty
})

/** Answer-independent pre-answer filter membership shared by every option. */
export const SafeQuestionMembership = Schema.Struct({
  filterKind: Schema.Literals(["domain", "family", "confusion-set"]),
  filterValue: Schema.NonEmptyString
})

export const QuestionFactKind = Schema.Literals([
  "use",
  "recognition-feature",
  "comparison-distinction",
  "safety-application"
])

export const AuthoredQuestionCapacity = Schema.Struct({
  objectiveId: ArtifactPathSegment,
  equivalenceGroupId: ArtifactPathSegment,
  factKind: QuestionFactKind
})

export const QuestionReviewReceipt = Schema.Struct({
  id: ArtifactPathSegment,
  reviewedAt: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  reviewerKind: Schema.Literal("ai-agent"),
  reviewMethod: Schema.Literal("agent-assisted-editorial-source-security-accessibility-review"),
  reviewedArtifactSha256: Sha256,
  evidenceClaimIds: Schema.NonEmptyArray(ArtifactPathSegment),
  outcomes: Schema.Struct({
    content: Schema.Literal("passed"),
    security: Schema.Literal("passed"),
    accessibility: Schema.Literal("passed")
  })
})

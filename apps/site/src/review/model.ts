import { PrecommitScene as PrecommitSceneSchema } from "@nycustodian/content/model"
import { Schema } from "effect"
import { HazardAttemptReceipt, QuestionAttemptReceipt } from "../attempt-receipt.ts"

const safePathSegment = "[a-z0-9][a-z0-9._-]*"

const ReviewQuestionItemUrl = Schema.String.check(
  Schema.isPattern(
    new RegExp(`^/review/session/${safePathSegment}/item/[1-9][0-9]*/$`),
    { expected: "an exact root-relative review-player path" }
  )
)

const ReviewHazardItemUrl = Schema.String.check(
  Schema.isPattern(
    new RegExp(`^/hazards/session/${safePathSegment}/scene/[1-9][0-9]*/$`),
    { expected: "an exact root-relative hazard-player path" }
  )
)

const UniqueOptionIds = Schema.NonEmptyArray(Schema.NonEmptyString).check(
  Schema.makeFilter((optionIds) =>
    new Set(optionIds).size === optionIds.length
      ? undefined
      : "review bootstrap option ids must be unique"
  )
)

export const ReviewQuestionBootstrap = Schema.Struct({
  id: Schema.NonEmptyString,
  optionIds: UniqueOptionIds,
  receipt: QuestionAttemptReceipt,
  itemUrl: ReviewQuestionItemUrl
})

export const ReviewSceneBootstrap = Schema.Struct({
  scene: PrecommitSceneSchema,
  visualReceipt: HazardAttemptReceipt,
  nonvisualReceipt: HazardAttemptReceipt,
  visualItemUrl: ReviewHazardItemUrl,
  nonvisualItemUrl: ReviewHazardItemUrl
})

export class ReviewQueueBootstrap extends Schema.Class<ReviewQueueBootstrap>(
  "@nycustodian/site/review/ReviewQueueBootstrap"
)({
  schemaVersion: Schema.Literal(1),
  questions: Schema.Array(ReviewQuestionBootstrap),
  scenes: Schema.Array(ReviewSceneBootstrap)
}) {}

export type ReviewQuestionSource = typeof ReviewQuestionBootstrap.Type
export type ReviewSceneSource = typeof ReviewSceneBootstrap.Type

export type ReviewReason =
  | { readonly tag: "flag" }
  | { readonly tag: "incorrect_answer" }
  | { readonly tag: "hazard_miss"; readonly inventoryId: string }
  | { readonly tag: "decoy_false_positive"; readonly inventoryId: string }
  | { readonly tag: "general_false_positive"; readonly markerId: string }

export type ReviewQueueItem = Readonly<{
  id: string
  attemptId: string
  committedAt: number
  itemUrl: string
  kind: "question" | "visual_hazard"
  reasons: ReadonlyArray<ReviewReason>
  reasonIds: ReadonlyArray<string>
}>

export type ReviewQuarantine = Readonly<{
  id: string
  attemptId: string
  kind: "question" | "visual_hazard"
  detail: string
}>

export interface ReviewQueueProjection {
  readonly attemptCount: number
  readonly items: ReadonlyArray<ReviewQueueItem>
  readonly quarantined: ReadonlyArray<ReviewQuarantine>
}

export type ReviewQueueState =
  | { readonly tag: "loading"; readonly action: "initial" | "retry" | "rebuild" }
  | {
      readonly tag: "ready"
      readonly items: ReadonlyArray<ReviewQueueItem>
      readonly quarantined: ReadonlyArray<ReviewQuarantine>
      readonly acknowledgingItemId: string | null
    }
  | { readonly tag: "empty"; readonly origin: "load" | "acknowledgement" }
  | {
      readonly tag: "recoverable_error"
      readonly operation: "load" | "acknowledge"
      readonly detail: string
      readonly items: ReadonlyArray<ReviewQueueItem>
      readonly quarantined: ReadonlyArray<ReviewQuarantine>
    }

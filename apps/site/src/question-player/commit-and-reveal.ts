import { PostcommitQuestion } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import type { QuestionAttemptReceipt } from "../attempt-receipt.ts"
import { VerifiedContent } from "../verified-content.ts"
import type { ReviewIntent } from "./state.ts"
import { QuestionPersistence } from "./persistence.ts"

export class RevealError extends Schema.TaggedError<RevealError>()("RevealError", {
  detail: Schema.String,
  cause: Schema.Unknown
}) {}

export class RevealContentMismatch extends Schema.TaggedError<RevealContentMismatch>()(
  "RevealContentMismatch",
  {
    detail: Schema.String,
    expectedQuestionId: Schema.String,
    receivedQuestionId: Schema.String
  }
) {}

const loadPostcommit = Effect.fn("QuestionWorkflow.loadPostcommit")(function*(
  receipt: QuestionAttemptReceipt,
  expectedQuestionId: string,
  expectedOptionIds: readonly string[]
) {
  const verifiedContent = yield* VerifiedContent
  const unknownPayload = yield* verifiedContent.loadJson(receipt).pipe(
    Effect.mapError(
      (cause) => new RevealError({ detail: "The explanation could not be loaded.", cause })
    )
  )

  const payload = yield* Schema.decodeUnknownEffect(PostcommitQuestion)(unknownPayload).pipe(
    Effect.mapError(
      (cause) => new RevealError({ detail: "The explanation payload was invalid.", cause })
    )
  )

  if (payload.id !== expectedQuestionId) {
    return yield* new RevealContentMismatch({
      detail: "The saved explanation did not match this question.",
      expectedQuestionId,
      receivedQuestionId: payload.id
    })
  }
  const expectedOptions = new Set(expectedOptionIds)
  const rationaleIds = payload.rationales.map((rationale) => rationale.optionId)
  const rationaleOptions = new Set(rationaleIds)
  const sourceLineIds = payload.sources.map((source) => source.id)
  const sourceLineIdSet = new Set(sourceLineIds)
  const claimIds = payload.claims.map((claim) => claim.id)
  const claimIdSet = new Set(claimIds)
  const citedClaimIds = new Set(
    payload.rationales.flatMap((rationale) => rationale.claimIds)
  )
  const hasExactRationaleClosure =
    expectedOptions.size === expectedOptionIds.length &&
    rationaleOptions.size === rationaleIds.length &&
    rationaleOptions.size === expectedOptions.size &&
    rationaleIds.every((optionId) => expectedOptions.has(optionId)) &&
    payload.rationales.every((rationale) => rationale.message.trim().length > 0)
  const hasRationaleClaimClosure =
    payload.rationales.every(
      (rationale) =>
        rationale.claimIds.length > 0 &&
        new Set(rationale.claimIds).size === rationale.claimIds.length &&
        rationale.claimIds.every((claimId) => claimIdSet.has(claimId))
    ) &&
    citedClaimIds.size === claimIdSet.size &&
    [...citedClaimIds].every((claimId) => claimIdSet.has(claimId))
  const hasClaimSourceLineClosure =
    new Set(claimIds).size === claimIds.length &&
    payload.claims.every((claim) =>
      claim.sourceLineIds.length > 0 &&
      new Set(claim.sourceLineIds).size === claim.sourceLineIds.length &&
      claim.sourceLineIds.every((sourceLineId) => {
        const receipt = payload.sources.find((source) => source.id === sourceLineId)
        return receipt !== undefined && receipt.supportedClaimIds.includes(claim.id)
      })
    ) &&
    new Set(payload.claims.flatMap((claim) => claim.sourceLineIds)).size === sourceLineIdSet.size
  const hasCompleteSources =
    payload.sources.length > 0 &&
    new Set(sourceLineIds).size === sourceLineIds.length &&
    payload.sources.every((source) =>
      [
        source.id,
        source.sourceId,
        source.title,
        source.publisher,
        source.version,
        source.rightsNotes,
        source.locator,
        source.excerpt
      ].every((value) => value.trim().length > 0)
    )

  if (
    !expectedOptions.has(payload.correctOptionId) ||
    !hasExactRationaleClosure ||
    !hasRationaleClaimClosure ||
    !hasClaimSourceLineClosure ||
    !hasCompleteSources
  ) {
    return yield* new RevealContentMismatch({
      detail: "The saved explanation was incomplete or did not match the available answer choices.",
      expectedQuestionId,
      receivedQuestionId: payload.id
    })
  }

  return payload
})

export const commitSelectionAndReveal = Effect.fn("QuestionWorkflow.commitSelectionAndReveal")(function*(input: {
  readonly receipt: QuestionAttemptReceipt
  readonly optionIds: readonly string[]
  readonly selectedOptionId: string
  readonly reviewIntent: ReviewIntent
}) {
  const verifiedContent = yield* VerifiedContent
  const availability = yield* verifiedContent.ensureAvailable(input.receipt).pipe(
    Effect.match({
      onFailure: (error) => ({ tag: "content_unavailable", error }) as const,
      onSuccess: () => ({ tag: "available" }) as const
    })
  )
  if (availability.tag === "content_unavailable") return availability

  const persistence = yield* QuestionPersistence
  const attempt = yield* persistence.commitAttempt({
    receipt: input.receipt,
    optionIds: input.optionIds,
    selectedOptionId: input.selectedOptionId,
    reviewIntent: input.reviewIntent
  })
  return yield* loadPostcommit(
    input.receipt,
    input.receipt.questionId,
    input.optionIds
  ).pipe(
    Effect.match({
      onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
      onSuccess: (payload) => ({ tag: "revealed", attempt, payload }) as const
    })
  )
})

export const restoreSelectionAndReveal = Effect.fn("QuestionWorkflow.restoreSelectionAndReveal")(function*(
  input: {
    readonly receipt: QuestionAttemptReceipt
    readonly optionIds: readonly string[]
  }
) {
  const persistence = yield* QuestionPersistence
  const attempt = yield* persistence.findAttempt(input)
  if (attempt === undefined) {
    const verifiedContent = yield* VerifiedContent
    return yield* verifiedContent.ensureAvailable(input.receipt).pipe(
      Effect.match({
        onFailure: (error) => ({ tag: "content_unavailable", error }) as const,
        onSuccess: () => undefined
      })
    )
  }
  return yield* loadPostcommit(
    input.receipt,
    input.receipt.questionId,
    input.optionIds
  ).pipe(
    Effect.match({
      onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
      onSuccess: (payload) => ({ tag: "revealed", attempt, payload }) as const
    })
  )
})

export const retryReveal = Effect.fn("QuestionWorkflow.retryReveal")(function*(
  input: {
    readonly receipt: QuestionAttemptReceipt
    readonly optionIds: readonly string[]
  }
) {
  const persistence = yield* QuestionPersistence
  const attempt = yield* persistence.findAttempt(input)
  if (attempt === undefined) {
    return yield* new RevealError({
      detail: "No matching durable answer exists for this release receipt.",
      cause: { receipt: input.receipt }
    })
  }
  return yield* loadPostcommit(
    input.receipt,
    input.receipt.questionId,
    input.optionIds
  )
})

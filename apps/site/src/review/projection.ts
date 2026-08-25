import {
  PostcommitQuestion as PostcommitQuestionSchema,
  PostcommitScene as PostcommitSceneSchema,
  type PostcommitQuestion
} from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import { sameHazardReceipt, sameQuestionReceipt } from "../attempt-receipt.ts"
import { assessVisualMarkers, hasValidPostcommitClosure } from "../hazard-player/assessment.ts"
import {
  HazardPersistence,
  hasBoundHazardReceipt,
  type HazardAttemptRecord
} from "../hazard-player/persistence.ts"
import {
  hasBoundQuestionReceipt,
  QuestionPersistence,
  type QuestionAttemptRecord
} from "../question-player/persistence.ts"
import { loadReviewContent } from "./content.ts"
import type {
  ReviewQuestionSource,
  ReviewQueueBootstrap,
  ReviewQueueItem,
  ReviewQueueProjection,
  ReviewQuarantine,
  ReviewReason,
  ReviewSceneSource
} from "./model.ts"
import {
  ReviewPersistence,
  reviewAcknowledgementId
} from "./persistence.ts"

export class ReviewProjectionError extends Schema.TaggedError<ReviewProjectionError>()(
  "ReviewProjectionError",
  {
    operation: Schema.Literals(["storage", "content", "projection", "acknowledge"]),
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

const projectionError = (
  operation: ReviewProjectionError["operation"],
  detail: string,
  cause: unknown
): ReviewProjectionError => new ReviewProjectionError({ operation, detail, cause })

export const reviewReasonId = (reason: ReviewReason): string => {
  switch (reason.tag) {
    case "flag":
      return "flag"
    case "directional_confusion":
      return `directional-confusion:${reason.correctConceptId}:${reason.selectedConceptId}`
    case "hazard_miss":
      return `hazard-miss:${reason.inventoryId}`
    case "decoy_false_positive":
      return `decoy-false-positive:${reason.inventoryId}`
    case "general_false_positive":
      return `general-false-positive:${reason.markerId}`
  }
}

const exactStringSet = (
  left: ReadonlyArray<string>,
  right: ReadonlyArray<string>
): boolean => {
  const leftSet = new Set(left)
  const rightSet = new Set(right)
  return leftSet.size === left.length &&
    rightSet.size === right.length &&
    leftSet.size === rightSet.size &&
    left.every((value) => rightSet.has(value))
}

const sameOrderedValues = <Value>(
  left: ReadonlyArray<Value>,
  right: ReadonlyArray<Value>
): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const itemWithReasons = (
  item: Omit<ReviewQueueItem, "reasonIds">,
  reasons: ReadonlyArray<ReviewReason>
): ReviewQueueItem => ({
  ...item,
  reasons: [...new Map(reasons.map((reason) => [reviewReasonId(reason), reason])).values()],
  reasonIds: [...new Set(reasons.map(reviewReasonId))].sort()
})

export const deriveQuestionReviewItem = Effect.fn(
  "ReviewProjection.deriveQuestionReviewItem"
)(function*(
  attempt: QuestionAttemptRecord,
  source: ReviewQuestionSource,
  payload: PostcommitQuestion
) {
  const optionIds = source.optionIds
  const mappings = payload.optionConceptIds
  const rationaleIds = payload.rationales.map((rationale) => rationale.optionId)

  if (
    payload.id !== source.id ||
    !optionIds.includes(attempt.selectedOptionId) ||
    !optionIds.includes(payload.correctOptionId) ||
    mappings === undefined ||
    !exactStringSet(mappings.map((mapping) => mapping.optionId), optionIds) ||
    !exactStringSet(rationaleIds, optionIds)
  ) {
    return yield* projectionError(
      "content",
      "Saved question feedback is missing or does not close over the attempted answer choices.",
      { attemptId: attempt.id, questionId: source.id }
    )
  }

  const reasons: Array<ReviewReason> = []
  if (attempt.reviewIntent === "flagged") reasons.push({ tag: "flag" })

  if (attempt.selectedOptionId !== payload.correctOptionId) {
    const selected = mappings.find((mapping) => mapping.optionId === attempt.selectedOptionId)
    const correct = mappings.find((mapping) => mapping.optionId === payload.correctOptionId)
    if (selected === undefined || correct === undefined) {
      return yield* projectionError(
        "content",
        "Saved question feedback cannot identify the selected and correct concepts.",
        { attemptId: attempt.id, questionId: source.id }
      )
    }
    reasons.push({
      tag: "directional_confusion",
      correctConceptId: correct.conceptId,
      selectedConceptId: selected.conceptId
    })
  }

  if (reasons.length === 0) return undefined
  return itemWithReasons(
    {
      id: `question:${attempt.id}`,
      attemptId: attempt.id,
      committedAt: attempt.committedAt,
      itemUrl: source.itemUrl,
      kind: "question",
      reasons
    },
    reasons
  )
})

export const deriveVisualHazardReviewItem = Effect.fn(
  "ReviewProjection.deriveVisualHazardReviewItem"
)(function*(
  attempt: HazardAttemptRecord,
  source: ReviewSceneSource,
  unknownPayload: unknown
) {
  const payload = yield* Schema.decodeUnknownEffect(PostcommitSceneSchema)(unknownPayload).pipe(
    Effect.mapError((cause) =>
      projectionError(
        "content",
        "Saved hazard feedback is invalid. No substitute scene was used.",
        cause
      )
    )
  )
  if (
    attempt.sceneId !== source.scene.id ||
    attempt.mode !== "visual" ||
    !hasValidPostcommitClosure(source.scene, payload)
  ) {
    return yield* projectionError(
      "content",
      "Saved hazard feedback does not match the exact attempted scene.",
      { attemptId: attempt.id, sceneId: source.scene.id }
    )
  }

  const assessment = assessVisualMarkers(attempt.markers, payload)
  const reasons: Array<ReviewReason> = assessment.missedInventoryIds.map((inventoryId) => ({
    tag: "hazard_miss" as const,
    inventoryId
  }))
  for (const marker of assessment.markers) {
    if (marker.kind === "decoy_false_positive" && marker.inventoryId !== undefined) {
      reasons.push({ tag: "decoy_false_positive", inventoryId: marker.inventoryId })
    } else if (marker.kind === "false_positive") {
      reasons.push({ tag: "general_false_positive", markerId: marker.marker.id })
    }
  }

  if (reasons.length === 0) return undefined
  return itemWithReasons(
    {
      id: `hazard:${attempt.id}`,
      attemptId: attempt.id,
      committedAt: attempt.committedAt,
      itemUrl: source.visualItemUrl,
      kind: "visual_hazard",
      reasons
    },
    reasons
  )
})

const loadQuestionItem = Effect.fn("ReviewProjection.loadQuestionItem")(function*(
  attempt: QuestionAttemptRecord,
  source: ReviewQuestionSource
) {
  const unknownPayload = yield* loadReviewContent(source.receipt).pipe(
    Effect.mapError((error) => projectionError("content", error.detail, error))
  )
  const payload = yield* Schema.decodeUnknownEffect(PostcommitQuestionSchema)(unknownPayload).pipe(
    Effect.mapError((cause) =>
      projectionError(
        "content",
        "Saved question feedback is invalid. No substitute item was used.",
        cause
      )
    )
  )
  return yield* deriveQuestionReviewItem(attempt, source, payload)
})

const loadHazardItem = Effect.fn("ReviewProjection.loadHazardItem")(function*(
  attempt: HazardAttemptRecord,
  source: ReviewSceneSource
) {
  const unknownPayload = yield* loadReviewContent(source.visualReceipt).pipe(
    Effect.mapError((error) => projectionError("content", error.detail, error))
  )
  return yield* deriveVisualHazardReviewItem(attempt, source, unknownPayload)
})

const uniqueMap = <Value>(
  entries: ReadonlyArray<readonly [string, Value]>,
  label: string
): Map<string, Value> => {
  const result = new Map<string, Value>()
  for (const [key, value] of entries) {
    if (result.has(key)) throw new Error(`Review bootstrap repeats ${label} ${key}`)
    result.set(key, value)
  }
  return result
}

type AttemptProjection =
  | { readonly tag: "projected"; readonly item: ReviewQueueItem | undefined }
  | { readonly tag: "quarantined"; readonly quarantine: ReviewQuarantine }

const containAttemptFailure = <Requirements>(
  attemptId: string,
  kind: ReviewQuarantine["kind"],
  effect: Effect.Effect<ReviewQueueItem | undefined, ReviewProjectionError, Requirements>
): Effect.Effect<AttemptProjection, never, Requirements> =>
  effect.pipe(
    Effect.match({
      onFailure: (error): AttemptProjection => ({
        tag: "quarantined",
        quarantine: {
          id: `${kind}:${attemptId}`,
          attemptId,
          kind,
          detail: error.detail
        }
      }),
      onSuccess: (item): AttemptProjection => ({ tag: "projected", item })
    })
  )

export const buildReviewQueue = Effect.fn("ReviewProjection.buildReviewQueue")(function*(
  bootstrap: ReviewQueueBootstrap
) {
  const questionPersistence = yield* QuestionPersistence
  const hazardPersistence = yield* HazardPersistence
  const reviewPersistence = yield* ReviewPersistence

  const [questionAttempts, hazardAttempts, acknowledgements] = yield* Effect.all([
    questionPersistence.listAttempts(),
    hazardPersistence.listAttempts(),
    reviewPersistence.listAcknowledgements()
  ]).pipe(
    Effect.mapError((error) =>
      projectionError(
        "storage",
        "The review queue could not read validated local study events.",
        error
      )
    )
  )

  const attemptCount = questionAttempts.length + hazardAttempts.length
  if (attemptCount === 0) {
    return { attemptCount, items: [], quarantined: [] } satisfies ReviewQueueProjection
  }

  const questionById = yield* Effect.try({
    try: () => uniqueMap(bootstrap.questions.map((source) => [source.id, source]), "question"),
    catch: (cause) =>
      projectionError("projection", "The review question bootstrap is inconsistent.", cause)
  })
  const sceneById = yield* Effect.try({
    try: () => uniqueMap(bootstrap.scenes.map((source) => [source.scene.id, source]), "scene"),
    catch: (cause) =>
      projectionError("projection", "The review scene bootstrap is inconsistent.", cause)
  })

  const questionEffects = questionAttempts.map((attempt) => {
    const source = questionById.get(attempt.questionId)
    const effect = !hasBoundQuestionReceipt(attempt)
      ? Effect.fail(
          projectionError(
            "content",
            "A saved question attempt predates release receipts and was quarantined without loading feedback.",
            { attemptId: attempt.id, questionId: attempt.questionId }
          )
        )
      : source === undefined
      ? Effect.fail(
          projectionError(
            "content",
            "A saved question is unavailable in this exact release. It was not substituted.",
            { attemptId: attempt.id, questionId: attempt.questionId }
          )
        )
      : !sameQuestionReceipt(attempt.receipt, source.receipt) ||
          !sameOrderedValues(attempt.optionIds, source.optionIds)
      ? Effect.fail(
          projectionError(
            "content",
            "A saved question receipt does not match this exact released item. It was not reinterpreted.",
            { attemptId: attempt.id, questionId: attempt.questionId }
          )
        )
      : loadQuestionItem(attempt, source)
    return containAttemptFailure(attempt.id, "question", effect)
  })
  const hazardEffects = hazardAttempts.map((attempt) => {
    const source = sceneById.get(attempt.sceneId)
    const expectedReceipt = source === undefined
      ? undefined
      : attempt.mode === "visual"
      ? source.visualReceipt
      : source.nonvisualReceipt
    const effect = !hasBoundHazardReceipt(attempt)
      ? Effect.fail(
          projectionError(
            "content",
            "A saved hazard attempt predates release receipts and was quarantined without loading feedback.",
            { attemptId: attempt.id, sceneId: attempt.sceneId }
          )
        )
      : source === undefined || expectedReceipt === undefined
        ? Effect.fail(
            projectionError(
              "content",
              "A saved hazard scene is unavailable in this exact release. It was not substituted.",
              { attemptId: attempt.id, sceneId: attempt.sceneId }
            )
          )
        : !sameHazardReceipt(attempt.receipt, expectedReceipt) ||
            !sameOrderedValues(
              attempt.allowedZoneOrders,
              source.scene.neutralPreAnswer.zones.map((zone) => zone.order)
            )
        ? Effect.fail(
            projectionError(
              "content",
              "A saved hazard receipt does not match this exact released scene. It was not reinterpreted.",
              { attemptId: attempt.id, sceneId: attempt.sceneId }
            )
          )
        : attempt.mode === "nonvisual"
        ? Effect.succeed(undefined)
        : loadHazardItem(attempt, source)
    return containAttemptFailure(attempt.id, "visual_hazard", effect)
  })

  const projected = yield* Effect.all(
    [...questionEffects, ...hazardEffects],
    { concurrency: "unbounded" }
  )
  const acknowledgedIds = new Set(acknowledgements.map((record) => record.id))
  const items = projected
    .flatMap((result) =>
      result.tag === "projected" && result.item !== undefined ? [result.item] : []
    )
    .filter((item) =>
      !acknowledgedIds.has(
        reviewAcknowledgementId({
          itemId: item.id,
          attemptId: item.attemptId,
          reasonIds: item.reasonIds
        })
      )
    )
    .sort((left, right) =>
      left.committedAt - right.committedAt || left.id.localeCompare(right.id)
    )
  const quarantined = projected
    .flatMap((result) => result.tag === "quarantined" ? [result.quarantine] : [])
    .sort((left, right) => left.id.localeCompare(right.id))

  return { attemptCount, items, quarantined } satisfies ReviewQueueProjection
})

export const acknowledgeReviewItem = Effect.fn(
  "ReviewProjection.acknowledgeReviewItem"
)(function*(item: ReviewQueueItem) {
  const reviews = yield* ReviewPersistence
  return yield* reviews.acknowledge({
    itemId: item.id,
    attemptId: item.attemptId,
    reasonIds: item.reasonIds
  }).pipe(
    Effect.mapError((error) =>
      projectionError(
        "acknowledge",
        "The review acknowledgement was not saved. The item remains due.",
        error
      )
    )
  )
})

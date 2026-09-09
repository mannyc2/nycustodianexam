import { resolveCustomReviewSource } from "../practice/review-source.ts"
import { Effect } from "effect"
import { questionAttemptId, sameHazardReceipt, sameQuestionReceipt } from "../attempt-receipt.ts"
import { HazardPersistence, type HazardAttemptRecord } from "../hazard-player/persistence.ts"
import { QuestionPersistence, type QuestionAttemptRecord } from "../question-player/persistence.ts"
import type { ReviewQuarantine, ReviewQueueBootstrap } from "../review/model.ts"
import { ReviewPersistence, type ReviewAcknowledgementRecord } from "../review/persistence.ts"
import type { StudyActivity, StudyActivityRow, UnavailableStudyAttempt } from "./model.ts"

export const projectStudyActivity = (
  bootstrap: ReviewQueueBootstrap,
  questions: ReadonlyArray<QuestionAttemptRecord>,
  hazards: ReadonlyArray<HazardAttemptRecord>,
  acknowledgements: ReadonlyArray<ReviewAcknowledgementRecord>
): StudyActivity => {
  const questionSources = new Map([...bootstrap.questions, ...(bootstrap.practiceQuestions ?? [])]
    .map((source) => [questionAttemptId(source.receipt), source]))
  const sceneSources = new Map(bootstrap.scenes.map((source) => [source.scene.id, source]))
  const rows: StudyActivityRow[] = []
  const unavailableAttempts: UnavailableStudyAttempt[] = []
  const attemptRows = new Map<string, StudyActivityRow>()
  let questionCount = 0
  let hazardCount = 0
  for (const attempt of questions) {
    const source = questionSources.get(attempt.id) ?? resolveCustomReviewSource(bootstrap.questions, attempt)
    if (source === undefined || attempt.receipt === undefined ||
      !sameQuestionReceipt(attempt.receipt, source.receipt) ||
      attempt.optionIds?.length !== source.optionIds.length ||
      !attempt.optionIds.every((id, index) => id === source.optionIds[index])) {
      unavailableAttempts.push({ id: attempt.id, recordedAt: attempt.committedAt, label: "Question attempt" })
      continue
    }
    const row: StudyActivityRow = {
      id: attempt.id,
      attemptId: attempt.id,
      kind: "questions",
      recordedAt: attempt.committedAt,
      label: `Question ${source.receipt.position}`,
      outcome: attempt.reviewIntent === "flagged" ? "Answer saved · flagged" : "Answer saved",
      href: source.itemUrl
    }
    rows.push(row)
    attemptRows.set(attempt.id, row)
    questionCount += 1
  }
  for (const attempt of hazards) {
    const source = sceneSources.get(attempt.sceneId)
    const unavailable = { id: attempt.id, recordedAt: attempt.committedAt, label: attempt.mode === "visual" ? "Visual hazard attempt" : "Keyboard hazard attempt" }
    if (source === undefined || attempt.receipt === undefined) {
      unavailableAttempts.push(unavailable)
      continue
    }
    const expected = attempt.mode === "visual" ? source.visualReceipt : source.nonvisualReceipt
    const zoneOrders = source.scene.neutralPreAnswer.zones.map((zone) => zone.order)
    if (!sameHazardReceipt(attempt.receipt, expected) ||
      attempt.allowedZoneOrders?.length !== zoneOrders.length ||
      !attempt.allowedZoneOrders.every((order, index) => order === zoneOrders[index])) {
      unavailableAttempts.push(unavailable)
      continue
    }
    const row: StudyActivityRow = {
      id: attempt.id,
      attemptId: attempt.id,
      kind: "hazards",
      recordedAt: attempt.committedAt,
      label: `Hazard scene ${expected.position}`,
      outcome: attempt.mode === "visual" ? "Visual response saved" : "Keyboard response saved",
      href: attempt.mode === "visual" ? source.visualItemUrl : source.nonvisualItemUrl
    }
    rows.push(row)
    attemptRows.set(attempt.id, row)
    hazardCount += 1
  }
  let reviewCount = 0
  for (const acknowledgement of acknowledgements) {
    const attempt = attemptRows.get(acknowledgement.attemptId)
    if (attempt === undefined) continue
    rows.push({
      id: acknowledgement.id,
      attemptId: acknowledgement.attemptId,
      kind: "reviews",
      recordedAt: acknowledgement.acknowledgedAt,
      label: `Review · ${attempt.label.toLowerCase()}`,
      outcome: "Review finished",
      href: attempt.href
    })
    reviewCount += 1
  }
  rows.sort((left, right) => right.recordedAt - left.recordedAt || left.id.localeCompare(right.id))
  return {
    rows,
    questionCount,
    hazardCount,
    reviewCount,
    unavailableAttempts: unavailableAttempts.sort((left, right) =>
      (right.recordedAt ?? 0) - (left.recordedAt ?? 0) || left.id.localeCompare(right.id))
  }
}

export const includeUnavailableReviews = (
  activity: StudyActivity,
  quarantined: ReadonlyArray<ReviewQuarantine>
): StudyActivity => {
  const unavailable = new Map(activity.unavailableAttempts.map((attempt) => [attempt.id, attempt]))
  for (const attempt of quarantined) {
    if (unavailable.has(attempt.attemptId)) continue
    unavailable.set(attempt.attemptId, {
      id: attempt.attemptId,
      recordedAt: attempt.committedAt ?? null,
      label: attempt.kind === "question" ? "Question attempt" : "Visual hazard attempt"
    })
  }
  return {
    ...activity,
    rows: activity.rows.flatMap((row) => !unavailable.has(row.attemptId)
      ? [row]
      : row.kind === "reviews" ? [{ ...row, href: null }] : []),
    unavailableAttempts: [...unavailable.values()].sort((left, right) =>
      (right.recordedAt ?? 0) - (left.recordedAt ?? 0) || left.id.localeCompare(right.id))
  }
}

export const loadStudyActivity = Effect.fn("Study.loadActivity")(function*(bootstrap: ReviewQueueBootstrap) {
  const questionPersistence = yield* QuestionPersistence
  const hazardPersistence = yield* HazardPersistence
  const reviewPersistence = yield* ReviewPersistence
  const [questions, hazards, acknowledgements] = yield* Effect.all([
    questionPersistence.listAttempts(),
    hazardPersistence.listAttempts(),
    reviewPersistence.listAcknowledgements()
  ], { concurrency: "unbounded" })
  return projectStudyActivity(bootstrap, questions, hazards, acknowledgements)
})

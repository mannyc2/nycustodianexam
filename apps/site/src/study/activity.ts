import { Effect } from "effect"
import { questionAttemptId, sameHazardReceipt, sameQuestionReceipt } from "../attempt-receipt.ts"
import { HazardPersistence, type HazardAttemptRecord } from "../hazard-player/persistence.ts"
import { QuestionPersistence, type QuestionAttemptRecord } from "../question-player/persistence.ts"
import type { ReviewQueueBootstrap } from "../review/model.ts"
import { ReviewPersistence, type ReviewAcknowledgementRecord } from "../review/persistence.ts"
import type { StudyActivity, StudyActivityRow } from "./model.ts"

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
  const attemptRows = new Map<string, StudyActivityRow>()
  let questionCount = 0
  let hazardCount = 0
  for (const attempt of questions) {
    const source = questionSources.get(attempt.id)
    if (source === undefined || attempt.receipt === undefined ||
      !sameQuestionReceipt(attempt.receipt, source.receipt) ||
      attempt.optionIds?.length !== source.optionIds.length ||
      !attempt.optionIds.every((id, index) => id === source.optionIds[index])) continue
    const row: StudyActivityRow = {
      id: attempt.id,
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
    if (source === undefined || attempt.receipt === undefined) continue
    const expected = attempt.mode === "visual" ? source.visualReceipt : source.nonvisualReceipt
    const zoneOrders = source.scene.neutralPreAnswer.zones.map((zone) => zone.order)
    if (!sameHazardReceipt(attempt.receipt, expected) ||
      attempt.allowedZoneOrders?.length !== zoneOrders.length ||
      !attempt.allowedZoneOrders.every((order, index) => order === zoneOrders[index])) continue
    const row: StudyActivityRow = {
      id: attempt.id,
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
    otherAttemptCount: questions.length + hazards.length - questionCount - hazardCount
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

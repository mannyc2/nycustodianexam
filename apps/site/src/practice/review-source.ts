import { questionAttemptId, type QuestionAttemptReceipt } from "../attempt-receipt.ts"
import type { ReviewQuestionSource } from "../review/model.ts"
import { resolvePracticeQuestion, type PracticeQuestionSource } from "./question-set.ts"

export const practiceInventoryFromReview = (sources: ReadonlyArray<ReviewQuestionSource>) => {
  if (sources.some(({ category }) => category === undefined)) return []
  return sources.map((source) => ({
    ...source,
    category: source.category!,
    itemUrl: source.itemUrl.replace("/review/session/", "/practice/session/").replace("/item/", "/question/")
  })) satisfies ReadonlyArray<PracticeQuestionSource>
}

export const resolveCustomReviewSource = (
  sources: ReadonlyArray<ReviewQuestionSource>,
  attempt: { readonly id: string; readonly questionId: string; readonly receipt?: QuestionAttemptReceipt }
): ReviewQuestionSource | undefined => {
  const receipt = attempt.receipt
  if (receipt === undefined || attempt.id !== questionAttemptId(receipt) || attempt.questionId !== receipt.questionId || !receipt.sessionId.startsWith("pb1.")) return undefined
  const step = resolvePracticeQuestion(practiceInventoryFromReview(sources), receipt)
  return step === undefined ? undefined : {
    ...step.source,
    receipt: step.receipt,
    itemUrl: step.href
  }
}

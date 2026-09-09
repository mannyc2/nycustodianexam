import type { QuestionAttemptReceipt } from "../attempt-receipt.ts"
import { parsePracticeSetId, selectPracticeSet, type PracticeSetSpec } from "./set.ts"

/** Compiled pre-answer inventory; never assembled from saved attempt contents. */
export interface PracticeQuestionSource {
  readonly id: string
  readonly category: string
  readonly receipt: QuestionAttemptReceipt
  readonly itemUrl: string
  readonly optionIds: ReadonlyArray<string>
}

export interface PracticeQuestionStep<T extends PracticeQuestionSource> {
  readonly source: T
  readonly receipt: QuestionAttemptReceipt
  readonly href: string
}

/** Retains a real generated document as the no-JavaScript navigation target. */
const stepHref = (source: PracticeQuestionSource, setId: string, position: number): string =>
  `${source.itemUrl}?set=${setId}&position=${position}`

export const assemblePracticeQuestions = <T extends PracticeQuestionSource>(
  inventory: ReadonlyArray<T>,
  spec: PracticeSetSpec
): ReadonlyArray<PracticeQuestionStep<T>> => {
  const first = inventory[0]
  if (first === undefined) throw new Error("Practice inventory is unavailable")
  for (const source of inventory) {
    if (source.receipt.questionId !== source.id ||
      source.receipt.releaseId !== first.receipt.releaseId ||
      source.receipt.packVersion !== first.receipt.packVersion ||
      !/^\/practice\/session\/[a-z0-9][a-z0-9._-]*\/question\/[1-9][0-9]*\/$/.test(source.itemUrl) ||
      source.itemUrl !== `/practice/session/${source.receipt.sessionId}/question/${source.receipt.position}/` ||
      source.receipt.postcommitPath !== `/content/vertical-slice/questions/${source.id}.postcommit.json` ||
      source.optionIds.length === 0 || new Set(source.optionIds).size !== source.optionIds.length) {
      throw new Error("Practice inventory does not have a coherent released question closure")
    }
  }
  const set = selectPracticeSet(inventory, first.receipt.releaseId, spec)
  return set.items.map((source, index) => ({
    source,
    receipt: { ...source.receipt, sessionId: set.id, position: index + 1 },
    href: stepHref(source, set.id, index + 1)
  }))
}

/**
 * Resolve a saved receipt only by regenerating its position from compiled safe
 * inventory. Matching a question ID alone is insufficient: every pinned object
 * coordinate must match before the caller may load feedback.
 */
export const resolvePracticeQuestion = <T extends PracticeQuestionSource>(
  inventory: ReadonlyArray<T>,
  receipt: QuestionAttemptReceipt
): PracticeQuestionStep<T> | undefined => {
  const spec = parsePracticeSetId(receipt.sessionId, [...new Set(inventory.map(({ category }) => category))])
  if (spec === undefined || !Number.isSafeInteger(receipt.position) || receipt.position <= 0) return undefined
  try {
    const step = assemblePracticeQuestions(inventory, spec)[receipt.position - 1]
    if (step === undefined) return undefined
    const expected = step.receipt
    return expected.questionId === receipt.questionId &&
      expected.releaseId === receipt.releaseId &&
      expected.packVersion === receipt.packVersion &&
      expected.sessionId === receipt.sessionId &&
      expected.position === receipt.position &&
      expected.postcommitPath === receipt.postcommitPath &&
      expected.postcommitBytes === receipt.postcommitBytes &&
      expected.postcommitSha256 === receipt.postcommitSha256 ? step : undefined
  } catch {
    return undefined
  }
}

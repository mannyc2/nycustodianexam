import { questionAttemptId, sameHazardReceipt } from "../attempt-receipt.ts"
import { resolveCustomReviewSource } from "../practice/review-source.ts"
import { resolveCustomHazardSource } from "../practice/hazard-set.ts"
import type { ReviewQueueBootstrap } from "./model.ts"

const uniqueMap = <Value>(entries: ReadonlyArray<readonly [string, Value]>, label: string): Map<string, Value> => {
  const result = new Map<string, Value>()
  for (const [key, value] of entries) {
    if (result.has(key)) throw new Error(`Review bootstrap repeats ${label} ${key}`)
    result.set(key, value)
  }
  return result
}

/** Both Review and activity navigation resolve against the same exact inventories. */
export const createReviewSourceIndex = (bootstrap: ReviewQueueBootstrap) => {
  const inventories = [bootstrap, ...(bootstrap.previousInventories ?? [])]
  const questionById = uniqueMap(bootstrap.questions.map(source => [source.id, source]), "question")
  const questionByAttempt = uniqueMap(inventories.flatMap(inventory => [...inventory.questions, ...(inventory.practiceQuestions ?? [])])
    .map(source => [questionAttemptId(source.receipt), source]), "question receipt")
  const sceneById = uniqueMap(bootstrap.scenes.map(source => [source.scene.id, source]), "scene")
  return {
    question: (attempt: Parameters<typeof resolveCustomReviewSource>[1]) => {
      const exact = questionByAttempt.get(attempt.id)
      if (exact !== undefined) return exact
      for (const inventory of inventories) {
        const source = resolveCustomReviewSource(inventory.questions, attempt)
        if (source !== undefined) return source
      }
      return questionById.get(attempt.questionId)
    },
    scene: (attempt: Parameters<typeof resolveCustomHazardSource>[1]) => {
      for (const inventory of inventories) {
        const source = resolveCustomHazardSource(inventory.scenes, attempt) ?? inventory.scenes.find(source =>
          attempt.receipt !== undefined && sameHazardReceipt(attempt.receipt, attempt.mode === "visual" ? source.visualReceipt : source.nonvisualReceipt)
        )
        if (source !== undefined) return source
      }
      return sceneById.get(attempt.sceneId)
    }
  }
}

import { expect, it } from "vitest"
import { questionAttemptId } from "../src/attempt-receipt.ts"
import { assemblePracticeQuestions } from "../src/practice/question-set.ts"
import { practiceInventoryFromReview, resolveCustomReviewSource } from "../src/practice/review-source.ts"
it("requires record identity and released content to agree before resolving custom feedback", () => {
  const sources = [{ id: "q-1", category: "Mixed", optionIds: ["a", "b"] as const,
    itemUrl: "/review/session/release-a/item/1/",
    receipt: { questionId: "q-1", releaseId: "release-a", packVersion: 1, sessionId: "release-a", position: 1,
      postcommitPath: "/content/vertical-slice/questions/q-1.postcommit.json", postcommitBytes: 100, postcommitSha256: "a".repeat(64) }
  }]
  const step = assemblePracticeQuestions(practiceInventoryFromReview(sources), { seed: "repeat", categories: ["Mixed"], length: 1 })[0]!
  const attempt = { id: questionAttemptId(step.receipt), questionId: "q-1", receipt: step.receipt }
  expect(resolveCustomReviewSource(sources, attempt)?.itemUrl).toBe(step.href)
  expect(resolveCustomReviewSource(sources, { ...attempt, id: "other" })).toBeUndefined()
  expect(resolveCustomReviewSource(sources, { ...attempt, questionId: "other" })).toBeUndefined()
  expect(resolveCustomReviewSource(sources.map(({ category, ...source }) => source), attempt)).toBeUndefined()
})

it("keeps historical custom links inside the exact receipt version", () => {
  const sources = [{ id: "q-1", category: "Mixed", optionIds: ["a", "b"] as const,
    itemUrl: "/history/release-a-v3/review/session/release-a/item/1/",
    receipt: { questionId: "q-1", releaseId: "release-a", packVersion: 3, sessionId: "release-a", position: 1,
      postcommitPath: "/content/vertical-slice/questions/q-1.postcommit.json", postcommitBytes: 100, postcommitSha256: "a".repeat(64) }
  }]
  const step = assemblePracticeQuestions(practiceInventoryFromReview(sources), { seed: "old", categories: ["Mixed"], length: 1 })[0]!
  const attempt = { id: questionAttemptId(step.receipt), questionId: "q-1", receipt: step.receipt }
  expect(resolveCustomReviewSource(sources, attempt)?.itemUrl).toMatch(/^\/history\/release-a-v3\/practice\//)
  expect(resolveCustomReviewSource(sources.map(source => ({ ...source, itemUrl: source.itemUrl.replace("-v3/", "-v4/") })), attempt)).toBeUndefined()
  expect(resolveCustomReviewSource(sources.map(source => ({ ...source, receipt: { ...source.receipt, postcommitSha256: "b".repeat(64) } })), attempt)).toBeUndefined()
})

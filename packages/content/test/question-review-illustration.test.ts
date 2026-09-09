import { describe, expect, it } from "vitest"
import pack from "../../../content/authoring/packs/launch-v1.json"
import { questionReviewSha256, type ReviewableQuestion } from "../src/compiler/question-review.ts"

const question = pack.questions[0] as ReviewableQuestion
const illustration = {
  conceptId: "test-reviewed-tool",
  masterSha256: "a".repeat(64),
  neutralDescription: "An isolated hand tool with a handle and metal head."
}

describe("illustrated question review closure", () => {
  it("preserves every existing text-question review receipt", () => {
    for (const item of pack.questions) {
      expect(questionReviewSha256(item as ReviewableQuestion, pack)).toBe(item.reviewReceipt.reviewedArtifactSha256)
    }
  })
  it("requires a new review when an illustration is attached or changed", () => {
    const reviewed = questionReviewSha256({ ...question, illustration }, pack)
    expect(reviewed).not.toBe(questionReviewSha256(question, pack))
    for (const changed of [
      { ...illustration, conceptId: "another-tool" },
      { ...illustration, masterSha256: "b".repeat(64) },
      { ...illustration, neutralDescription: "A changed accessible description." }
    ]) expect(questionReviewSha256({ ...question, illustration: changed }, pack)).not.toBe(reviewed)
  })
  it("uses canonical binding field order instead of input object insertion order", () => {
    expect(questionReviewSha256({ ...question, illustration: {
      neutralDescription: illustration.neutralDescription,
      masterSha256: illustration.masterSha256,
      conceptId: illustration.conceptId
    } }, pack)).toBe(questionReviewSha256({ ...question, illustration }, pack))
  })
})

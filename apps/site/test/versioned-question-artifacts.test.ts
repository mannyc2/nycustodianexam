import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import { matchesQuestionPostcommitPath, QuestionAttemptReceipt } from "../src/attempt-receipt.ts"
import { ReviewPracticeQuestionBootstrap } from "../src/review/model.ts"

const receipt = (postcommitPath: string) => ({
  releaseId: "release-a", packVersion: 5, sessionId: "release-a", position: 1,
  questionId: "q091", postcommitPath, postcommitBytes: 123, postcommitSha256: "a".repeat(64)
})
const base = "/content/vertical-slice/questions/"

describe("question artifact revision paths", () => {
  it("decodes legacy and revised receipts in Practice review inventories", () => {
    for (const directory of ["", "v2/", "v12/"]) {
      const value = receipt(`${base}${directory}q091.postcommit.json`)
      expect(Schema.decodeUnknownSync(QuestionAttemptReceipt)(value)).toEqual(value)
      expect(matchesQuestionPostcommitPath(value.postcommitPath, "q091")).toBe(true)
      expect(matchesQuestionPostcommitPath(value.postcommitPath, "q092")).toBe(false)
      expect(() => Schema.decodeUnknownSync(ReviewPracticeQuestionBootstrap)({
        id: "q091", optionIds: ["a", "b"], receipt: value,
        itemUrl: "/practice/session/release-a/question/1/"
      })).not.toThrow()
    }
  })
  it("rejects aliases, traversal, external URLs, and malformed artifact suffixes", () => {
    for (const path of [
      "v0/q091.postcommit.json", "v1/q091.postcommit.json", "v02/q091.postcommit.json",
      "v2/../q091.postcommit.json", "q091.postcommit.json?x=1", "q091XpostcommitXjson",
      "q091.precommit.json", "v2/q091.postcommit.json#fragment"
    ]) {
      expect(() => Schema.decodeUnknownSync(QuestionAttemptReceipt)(receipt(base + path))).toThrow()
      expect(matchesQuestionPostcommitPath(base + path, "q091")).toBe(false)
    }
    expect(matchesQuestionPostcommitPath(`https://other.test${base}q091.postcommit.json`, "q091")).toBe(false)
  })
})

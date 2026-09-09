import { describe, expect, it } from "vitest"
import { assemblePracticeQuestions, resolvePracticeQuestion } from "../src/practice/question-set.ts"

const inventory = Array.from({ length: 6 }, (_, index) => ({
  id: `q-${index}`, category: index < 3 ? "Cleaning" : "Mixed",
  itemUrl: `/practice/session/release-a/question/${index + 1}/`,
  optionIds: ["a", "b"],
  receipt: {
    questionId: `q-${index}`, releaseId: "release-a", packVersion: 1,
    sessionId: "release-a", position: index + 1,
    postcommitPath: `/content/vertical-slice/questions/q-${index}.postcommit.json`,
    postcommitBytes: 100 + index, postcommitSha256: String(index).repeat(64)
  }
}))
const spec = { seed: "repeat", categories: ["Cleaning", "Mixed"], length: 4 }

describe("custom question set receipt closure", () => {
  it("resolves every generated step independently from its saved receipt", () => {
    for (const step of assemblePracticeQuestions(inventory, spec)) {
      expect(resolvePracticeQuestion(inventory.toReversed(), step.receipt)).toEqual(step)
      expect(step.href).toBe(`${step.source.itemUrl}?set=${step.receipt.sessionId}&position=${step.receipt.position}`)
      expect(step.source.receipt.sessionId).toBe("release-a")
    }
  })
  it("rejects a different question or any changed content coordinate", () => {
    const receipt = assemblePracticeQuestions(inventory, spec)[0]!.receipt
    for (const change of [
      { questionId: "q-other" }, { releaseId: "release-b" }, { packVersion: 2 },
      { position: 2 }, { position: 0 }, { position: 5 }, { sessionId: "unknown" },
      { postcommitPath: "/other.json" }, { postcommitBytes: 999 }, { postcommitSha256: "f".repeat(64) }
    ]) expect(resolvePracticeQuestion(inventory, { ...receipt, ...change })).toBeUndefined()
  })
  it("does not reinterpret a missing item or a mixed release as a valid closure", () => {
    const receipt = assemblePracticeQuestions(inventory, spec)[0]!.receipt
    expect(resolvePracticeQuestion(inventory.filter((item) => item.id !== receipt.questionId), receipt)).toBeUndefined()
    expect(() => assemblePracticeQuestions(inventory.map((item, index) => index === 0
      ? { ...item, receipt: { ...item.receipt, packVersion: 2 } } : item), spec)).toThrow("coherent")
    expect(resolvePracticeQuestion([], receipt)).toBeUndefined()
  })
  it("rejects external or query-bearing inventory routes", () => {
    for (const itemUrl of ["https://other.test/", "/practice/session/release-a/question/1/?set=other"]) {
      expect(() => assemblePracticeQuestions([{ ...inventory[0]!, itemUrl }], {
        seed: "repeat", categories: ["Cleaning"], length: 1
      })).toThrow("coherent")
    }
  })
})

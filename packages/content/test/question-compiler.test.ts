import { describe, expect, it } from "vitest"
import { compileQuestion, stableJson } from "../src/compiler.ts"

const authored = {
  schemaVersion: 1,
  id: "q-1",
  profileId: "profile-1",
  prompt: "Choose.",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" }
  ],
  correctOptionId: "b",
  rationales: [
    { optionId: "a", message: "No" },
    { optionId: "b", message: "Yes" }
  ],
  sources: [{ id: "s", label: "Source", locator: "docs/source.md#L1" }]
} as const

describe("compileQuestion", () => {
  it("keeps answer material out of the precommit artifact", () => {
    const output = compileQuestion(authored)
    const precommit = stableJson(output.precommit)

    expect(precommit).not.toContain("correctOptionId")
    expect(precommit).not.toContain("rationales")
    expect(precommit).not.toContain("docs/source.md")
    expect(output.postcommit.correctOptionId).toBe("b")
    expect(output.postcommit.optionConceptIds).toBeUndefined()
  })

  it("rejects dangling correctness references", () => {
    expect(() => compileQuestion({ ...authored, correctOptionId: "missing" })).toThrow(
      "correctOptionId must reference an option"
    )
  })

  it("rejects rationale references that do not match an option", () => {
    expect(() => compileQuestion({
      ...authored,
      rationales: [
        ...authored.rationales,
        { optionId: "missing", message: "This rationale is not attached to an option." }
      ]
    })).toThrow("rationale option ids must reference options")
  })

  it("requires nonblank rationale text", () => {
    expect(() => compileQuestion({
      ...authored,
      rationales: [authored.rationales[0], { optionId: "b", message: "  " }]
    })).toThrow("rationale messages must not be blank")
  })

  it("requires at least one complete source receipt", () => {
    expect(() => compileQuestion({ ...authored, sources: [] })).toThrow(
      "at least one source receipt is required"
    )
    expect(() => compileQuestion({
      ...authored,
      sources: [{ id: "s", label: "Source", locator: " " }]
    })).toThrow("source receipt fields must not be blank")
  })
})

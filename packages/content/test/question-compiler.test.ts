import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import { compileQuestion, stableJson } from "../src/compiler.ts"
import {
  ReleasedPostcommitQuestion,
  ReleasedPrecommitQuestion
} from "../src/model.ts"

const authored = {
  schemaVersion: 2,
  id: "q-1",
  version: 1,
  profileId: "profile-1",
  prompt: "Choose.",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" }
  ],
  correctOptionId: "b",
  rationales: [
    { optionId: "a", message: "No", claimIds: ["claim-1"] },
    { optionId: "b", message: "Yes", claimIds: ["claim-1"] }
  ],
  claims: [{
    id: "claim-1",
    text: "The supported answer claim.",
    sourceLineIds: ["line-1"],
    evidenceTier: "maintained-editorial-synthesis",
    caveat: null
  }],
  sources: [{
    id: "line-1",
    sourceId: "source-1",
    title: "Source",
    publisher: "Publisher",
    evidenceTier: "maintained-editorial-synthesis",
    version: "1",
    rightsNotes: "Short project-authored excerpt.",
    locator: "docs/source.md#L1",
    excerpt: "The supported answer claim.",
    language: "en",
    verifiedOn: "2026-08-25",
    supportedClaimIds: ["claim-1"]
  }]
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
    expect(output.precommit.schemaVersion).toBe(2)
    expect(output.postcommit.schemaVersion).toBe(2)
  })

  it("decodes exact legacy artifacts without accepting rich fields under v1", () => {
    const legacyPrecommit = {
      schemaVersion: 1,
      id: "q-legacy",
      profileId: "profile-1",
      prompt: "Choose.",
      options: [{ id: "a", label: "A" }, { id: "b", label: "B" }]
    }
    const legacyPostcommit = {
      schemaVersion: 1,
      id: "q-legacy",
      correctOptionId: "a",
      rationales: [
        { optionId: "a", message: "Yes." },
        { optionId: "b", message: "No." }
      ],
      sources: [{ id: "source", label: "Source", locator: "section 1" }]
    }
    expect(Schema.decodeUnknownSync(
      ReleasedPrecommitQuestion,
      { onExcessProperty: "error" }
    )(legacyPrecommit)).toEqual(legacyPrecommit)
    expect(Schema.decodeUnknownSync(
      ReleasedPostcommitQuestion,
      { onExcessProperty: "error" }
    )(legacyPostcommit)).toEqual(legacyPostcommit)
    expect(() => Schema.decodeUnknownSync(
      ReleasedPostcommitQuestion,
      { onExcessProperty: "error" }
    )({
      ...legacyPostcommit,
      version: 2,
      rationales: legacyPostcommit.rationales.map((rationale) => ({
        ...rationale,
        claimIds: ["claim-1"]
      })),
      claims: authored.claims,
      sources: authored.sources
    })).toThrow()
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
        { optionId: "missing", message: "This rationale is not attached to an option.", claimIds: ["claim-1"] }
      ]
    })).toThrow("rationale option ids must reference options")
  })

  it("requires nonblank rationale text", () => {
    expect(() => compileQuestion({
      ...authored,
      rationales: [authored.rationales[0], { optionId: "b", message: "  ", claimIds: ["claim-1"] }]
    })).toThrow("rationale messages must not be blank")
  })

  it("requires at least one complete source receipt", () => {
    expect(() => compileQuestion({ ...authored, sources: [] })).toThrow(
      "at least one source receipt is required"
    )
    expect(() => compileQuestion({
      ...authored,
      sources: [{ ...authored.sources[0], locator: " " }]
    })).toThrow("source receipt fields must not be blank")
  })

  it("requires every rationale claim to resolve to the question source receipts", () => {
    expect(() => compileQuestion({
      ...authored,
      rationales: [
        authored.rationales[0],
        { ...authored.rationales[1], claimIds: ["missing"] }
      ]
    })).toThrow("rationale claim ids must reference question claims")
  })
})

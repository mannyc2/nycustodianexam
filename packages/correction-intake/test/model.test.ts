import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import { CorrectionReport } from "../src/model.ts"

const report = {
  schemaVersion: 1 as const,
  clientReceiptId: "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7",
  category: "fact" as const,
  subject: { pagePath: "/atlas/tool/pipe-wrench/" },
  summary: "The source title changed",
  details: "The linked agency page now uses a different title.",
  publicSourceUrl: "https://example.gov/source",
  affirmsNoSecureExamMaterial: true as const
}

describe("CorrectionReport", () => {
  it("accepts the bounded anonymous v1 contract", () => {
    expect(Schema.decodeUnknownSync(CorrectionReport)(report)).toEqual(report)
  })

  it("rejects insecure URLs, URL state, and unbounded text", () => {
    expect(() => Schema.decodeUnknownSync(CorrectionReport)({
      ...report,
      subject: { pagePath: "/atlas/?answer=1" }
    })).toThrow()
    expect(() => Schema.decodeUnknownSync(CorrectionReport)({
      ...report,
      publicSourceUrl: "http://example.gov/source"
    })).toThrow()
    expect(() => Schema.decodeUnknownSync(CorrectionReport)({
      ...report,
      details: "x".repeat(8_001)
    })).toThrow()
  })

  it("requires the explicit secure-material affirmation", () => {
    expect(() => Schema.decodeUnknownSync(CorrectionReport)({
      ...report,
      affirmsNoSecureExamMaterial: false
    })).toThrow()
  })
})

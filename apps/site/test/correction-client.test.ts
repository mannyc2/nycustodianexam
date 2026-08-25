import { describe, expect, it, vi } from "vitest"
import { submitCorrectionReport } from "../src/corrections/client.ts"
import {
  correctionReportFromDraft,
  emptyCorrectionDraft,
  CorrectionDraftRecord
} from "../src/corrections/model.ts"

const validDraft = () => new CorrectionDraftRecord({
  ...emptyCorrectionDraft("5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7", "/ny/"),
  summary: "A factual correction",
  details: "The current public source differs from this page.",
  publicSourceUrl: "https://example.gov/source",
  affirmsNoSecureExamMaterial: true
})

describe("local correction workflow", () => {
  it("turns a complete draft into the narrow anonymous request", () => {
    expect(correctionReportFromDraft(validDraft())).toEqual({
      schemaVersion: 1,
      clientReceiptId: "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7",
      category: "fact",
      subject: { pagePath: "/ny/" },
      summary: "A factual correction",
      details: "The current public source differs from this page.",
      publicSourceUrl: "https://example.gov/source",
      affirmsNoSecureExamMaterial: true
    })
  })

  it("never POSTs while intake status is disabled", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({
      schemaVersion: 1,
      mode: "disabled",
      acceptsReports: false
    }), { status: 200, headers: { "content-type": "application/json" } }))

    await expect(submitCorrectionReport(fetcher, correctionReportFromDraft(validDraft())))
      .resolves.toEqual({ tag: "inactive" })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]?.[0]).toBe("/api/corrections/status")
  })

  it("checks status, then returns an exact accepted receipt", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        schemaVersion: 1,
        mode: "active-v1",
        acceptsReports: true
      }), { status: 200, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        schemaVersion: 1,
        status: "accepted",
        clientReceiptId: "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7"
      }), { status: 202, headers: { "content-type": "application/json" } }))

    await expect(submitCorrectionReport(fetcher, correctionReportFromDraft(validDraft())))
      .resolves.toEqual({
        tag: "accepted",
        clientReceiptId: "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7"
      })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1]?.[0]).toBe("/api/corrections")
  })

  it("distinguishes a deliberately disabled POST from an active service outage", async () => {
    const activeStatus = () => new Response(JSON.stringify({
      schemaVersion: 1,
      mode: "active-v1",
      acceptsReports: true
    }), { status: 200, headers: { "content-type": "application/json" } })
    const disabled = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(activeStatus())
      .mockResolvedValueOnce(new Response(JSON.stringify({
        schemaVersion: 1,
        status: "error",
        code: "disabled"
      }), { status: 503, headers: { "content-type": "application/json" } }))
    const outage = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(activeStatus())
      .mockResolvedValueOnce(new Response(JSON.stringify({
        schemaVersion: 1,
        status: "error",
        code: "service-unavailable"
      }), { status: 503, headers: { "content-type": "application/json" } }))

    await expect(submitCorrectionReport(disabled, correctionReportFromDraft(validDraft())))
      .resolves.toEqual({ tag: "inactive" })
    await expect(submitCorrectionReport(outage, correctionReportFromDraft(validDraft())))
      .resolves.toEqual({
        tag: "failed",
        detail: "Correction intake is active but temporarily unavailable. Your local draft was retained."
      })
  })

  it("never misreports status transport or response failures as disabled intake", async () => {
    const networkFailure = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("offline"))
    const invalidStatus = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("not-json", {
      status: 200,
      headers: { "content-type": "application/json" }
    }))
    const serverFailure = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, {
      status: 502
    }))

    await expect(submitCorrectionReport(networkFailure, correctionReportFromDraft(validDraft())))
      .resolves.toMatchObject({ tag: "failed" })
    await expect(submitCorrectionReport(invalidStatus, correctionReportFromDraft(validDraft())))
      .resolves.toMatchObject({ tag: "failed" })
    await expect(submitCorrectionReport(serverFailure, correctionReportFromDraft(validDraft())))
      .resolves.toMatchObject({ tag: "failed" })
  })

  it("treats only an absent status route as dormant", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 404 }))

    await expect(submitCorrectionReport(fetcher, correctionReportFromDraft(validDraft())))
      .resolves.toEqual({ tag: "inactive" })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

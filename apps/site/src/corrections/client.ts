import {
  CorrectionAcceptedResponse,
  CorrectionErrorResponse,
  CorrectionStatusResponse,
  type CorrectionReportValue
} from "@nycustodian/correction-intake"
import { Schema } from "effect"

export type CorrectionSubmissionResult =
  | { readonly tag: "accepted"; readonly clientReceiptId: string }
  | { readonly tag: "inactive" }
  | { readonly tag: "rate-limited"; readonly retryAfterSeconds: number }
  | { readonly tag: "failed"; readonly detail: string }

const decodeJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json()
  } catch {
    throw new Error("The correction service returned an unreadable response")
  }
}

export type CorrectionIntakeStatus = "active" | "inactive" | "unknown"

export const fetchCorrectionIntakeStatus = async (
  fetcher: typeof fetch
): Promise<CorrectionIntakeStatus> => {
  let statusResponse: Response
  try {
    statusResponse = await fetcher("/api/corrections/status", {
      cache: "no-store",
      credentials: "omit",
      headers: { accept: "application/json" }
    })
  } catch {
    return "unknown"
  }
  if (statusResponse.status === 404) return "inactive"
  if (!statusResponse.ok) return "unknown"
  try {
    const status = Schema.decodeUnknownSync(CorrectionStatusResponse)(
      await decodeJson(statusResponse)
    )
    return status.acceptsReports && status.mode === "active-v1" ? "active" : "inactive"
  } catch {
    return "unknown"
  }
}

export const submitCorrectionReport = async (
  fetcher: typeof fetch,
  report: CorrectionReportValue
): Promise<CorrectionSubmissionResult> => {
  let statusResponse: Response
  try {
    statusResponse = await fetcher("/api/corrections/status", {
      cache: "no-store",
      credentials: "omit",
      headers: { accept: "application/json" }
    })
  } catch {
    return {
      tag: "failed",
      detail: "Correction intake status could not be verified. Your local draft was retained."
    }
  }
  if (statusResponse.status === 404) return { tag: "inactive" }
  if (!statusResponse.ok) {
    return {
      tag: "failed",
      detail: "Correction intake is temporarily unavailable. Your local draft was retained."
    }
  }

  try {
    const status = Schema.decodeUnknownSync(CorrectionStatusResponse)(
      await decodeJson(statusResponse)
    )
    if (!status.acceptsReports || status.mode !== "active-v1") return { tag: "inactive" }
  } catch {
    return {
      tag: "failed",
      detail: "Correction intake returned an invalid status. Your local draft was retained."
    }
  }

  let response: Response
  try {
    response = await fetcher("/api/corrections", {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(report)
    })
  } catch {
    return { tag: "failed", detail: "The network request failed. Your local draft was retained." }
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"))
    return {
      tag: "rate-limited",
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60
    }
  }
  if (response.status === 503) {
    try {
      const unavailable = Schema.decodeUnknownSync(CorrectionErrorResponse)(
        await decodeJson(response)
      )
      return unavailable.code === "disabled"
        ? { tag: "inactive" }
        : {
            tag: "failed",
            detail: "Correction intake is active but temporarily unavailable. Your local draft was retained."
          }
    } catch {
      return {
        tag: "failed",
        detail: "Correction intake is temporarily unavailable. Your local draft was retained."
      }
    }
  }
  if (!response.ok) {
    return {
      tag: "failed",
      detail: "The report was not accepted. Your local draft was retained."
    }
  }

  try {
    const accepted = Schema.decodeUnknownSync(CorrectionAcceptedResponse)(
      await decodeJson(response)
    )
    if (accepted.clientReceiptId !== report.clientReceiptId) {
      return { tag: "failed", detail: "The service returned a mismatched receipt. Your draft was retained." }
    }
    return { tag: "accepted", clientReceiptId: accepted.clientReceiptId }
  } catch {
    return { tag: "failed", detail: "The service returned an invalid receipt. Your draft was retained." }
  }
}

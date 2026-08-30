import { afterEach, describe, expect, it, vi } from "vitest"
import {
  LocalActionError,
  localFailureDetail,
  localFailureReport
} from "../src/local-failure-detail.ts"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("localFailureDetail", () => {
  it("preserves typed Effect error details and native error messages", () => {
    expect(localFailureDetail({ _tag: "TypedFailure", detail: "Specific recovery step." }, "fallback"))
      .toBe("Specific recovery step.")
    expect(localFailureDetail(new Error("Native failure."), "fallback"))
      .toBe("Native failure.")
    expect(localFailureDetail({ _tag: "UnknownFailure" }, "Safe fallback."))
      .toBe("Safe fallback.")
  })
})

describe("localFailureReport", () => {
  it("allows only explicitly reviewed learner-facing errors into public copy", () => {
    expect(localFailureReport(
      new LocalActionError("Go online before downloading or updating."),
      "The download failed."
    )).toEqual({
      message: "Go online before downloading or updating.",
      diagnostic: null
    })
  })

  it("keeps arbitrary native messages and typed details internal", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const native = localFailureReport(
      new DOMException("private quota sentinel", "QuotaExceededError"),
      "Your preferences were not saved."
    )
    const typed = localFailureReport(
      { _tag: "PersistenceError", detail: "private storage sentinel" },
      "Saved settings could not be read from this device."
    )

    expect(native).toEqual({
      message: "Your preferences were not saved.",
      diagnostic: null
    })
    expect(typed).toEqual({
      message: "Saved settings could not be read from this device.",
      diagnostic: null
    })
    expect(log).toHaveBeenCalledTimes(2)
  })
})

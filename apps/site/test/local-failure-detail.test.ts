import { describe, expect, it } from "vitest"
import { localFailureDetail } from "../src/local-failure-detail.ts"

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

import { describe, expect, it } from "vitest"
import { shouldReplaceSessionNavigation } from "../src/session-navigation.ts"

const gesture = (overrides: Partial<Parameters<typeof shouldReplaceSessionNavigation>[0]> = {}) => ({
  altKey: false,
  button: 0,
  ctrlKey: false,
  defaultPrevented: false,
  metaKey: false,
  shiftKey: false,
  ...overrides
})

const anchor = (overrides: Partial<Parameters<typeof shouldReplaceSessionNavigation>[1]> = {}) => ({
  download: "",
  href: "https://study.example/practice/session/launch-v1/question/2/",
  target: "",
  ...overrides
})

describe("intra-session navigation", () => {
  it("replaces an ordinary same-origin Previous or Next navigation", () => {
    expect(
      shouldReplaceSessionNavigation(gesture(), anchor(), "https://study.example")
    ).toBe(true)
  })

  it.each([
    gesture({ button: 1 }),
    gesture({ ctrlKey: true }),
    gesture({ metaKey: true }),
    gesture({ shiftKey: true }),
    gesture({ altKey: true }),
    gesture({ defaultPrevented: true })
  ])("preserves browser behavior for a modified gesture", (event) => {
    expect(
      shouldReplaceSessionNavigation(event, anchor(), "https://study.example")
    ).toBe(false)
  })

  it("does not replace external, download, or new-context links", () => {
    expect(
      shouldReplaceSessionNavigation(
        gesture(),
        anchor({ href: "https://other.example/question/2/" }),
        "https://study.example"
      )
    ).toBe(false)
    expect(
      shouldReplaceSessionNavigation(gesture(), anchor({ download: "question.html" }), "https://study.example")
    ).toBe(false)
    expect(
      shouldReplaceSessionNavigation(gesture(), anchor({ target: "_blank" }), "https://study.example")
    ).toBe(false)
  })
})

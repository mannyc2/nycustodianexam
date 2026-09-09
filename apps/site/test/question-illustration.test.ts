import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { QuestionIllustration } from "../src/question-illustration.tsx"

const illustration = {
  masterSha256: "a".repeat(64),
  neutralDescription: "A handle attached to a metal head.",
  derivatives: [
    { kind: "web" as const, path: "content/assets/derivatives/tools/t001-web.png", sha256: "b".repeat(64), bytes: 100 },
    { kind: "phone" as const, path: "content/assets/derivatives/tools/t001-phone.png", sha256: "c".repeat(64), bytes: 50 }
  ] as const
}

describe("question illustration view", () => {
  it("leaves existing text questions unchanged", () => {
    expect(renderToStaticMarkup(createElement(QuestionIllustration, { illustration: undefined }))).toBe("")
  })
  it("renders the retained neutral description and responsive reviewed URLs", () => {
    const html = renderToStaticMarkup(createElement(QuestionIllustration, { illustration }))
    expect(html).toContain('alt="A handle attached to a metal head."')
    expect(html).toContain('src="/content/assets/derivatives/tools/t001-web.png"')
    expect(html).toContain('srcSet="/content/assets/derivatives/tools/t001-phone.png"')
    expect(html).not.toContain("correctOptionId")
  })
})

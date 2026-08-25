import { PostcommitQuestion, PrecommitQuestion } from "@nycustodian/content/model"
import { createElement, createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { QuestionPlayerPieces } from "../src/question-player/react/player.tsx"
import {
  QuestionPlayerContract,
  type QuestionPlayerValue
} from "../src/question-player/react/context.tsx"
import { initialQuestionState, type QuestionScreenState } from "../src/question-player/state.ts"

const question = new PrecommitQuestion({
  schemaVersion: 2,
  id: "q-feedback",
  version: 1,
  profileId: "profile-1",
  prompt: "Choose an answer.",
  options: [
    { id: "a", label: "Answer A" },
    { id: "b", label: "Answer B" },
    { id: "c", label: "Answer C" },
    { id: "d", label: "Answer D" }
  ]
})

const payload = new PostcommitQuestion({
  schemaVersion: 2,
  id: question.id,
  version: 1,
  correctOptionId: "c",
  rationales: [
    { optionId: "a", message: "Rationale for A.", claimIds: ["claim-1"] },
    { optionId: "d", message: "Rationale for D.", claimIds: ["claim-1"] },
    { optionId: "c", message: "Rationale for C.", claimIds: ["claim-1"] },
    { optionId: "b", message: "Rationale for B.", claimIds: ["claim-1"] }
  ],
  claims: [{
    id: "claim-1",
    text: "Supported claim one.",
    sourceLineIds: ["line-1"],
    evidenceTier: "maintained-editorial-synthesis",
    caveat: "This construction-industry provision is cited as specific safety evidence."
  }],
  sources: [{
    id: "line-1",
    sourceId: "source-1",
    title: "Source one",
    publisher: "Publisher one",
    evidenceTier: "maintained-editorial-synthesis",
    version: "source revision 1",
    rightsNotes: "Project-authored test source.",
    locator: "docs/source.md#L1",
    excerpt: "Exact offline source excerpt for supported claim one.",
    language: "en",
    verifiedOn: "2026-08-25",
    supportedClaimIds: ["claim-1"]
  }]
})

const renderFeedback = (state: QuestionScreenState): string => {
  const value: QuestionPlayerValue = {
    question,
    state,
    actions: {
      selectOption: () => undefined,
      submitSelection: () => undefined,
      retryReveal: () => undefined,
      retryRestore: () => undefined,
      toggleFlag: () => undefined
    },
    meta: {
      instanceId: "question-q-feedback",
      errorHeadingRef: createRef(),
      outcomeHeadingRef: createRef(),
      statusId: "question-q-feedback-status",
      focusRequest: null,
      announcementRequest: null,
      acknowledgeViewRequest: () => undefined
    }
  }

  return renderToStaticMarkup(
    createElement(QuestionPlayerContract, {
      value,
      children: createElement(QuestionPlayerPieces.Feedback)
    })
  )
}

const occurrenceCount = (value: string, search: string): number =>
  value.split(search).length - 1

describe("question feedback", () => {
  it("keeps explanations and sources out of precommit feedback", () => {
    const html = renderFeedback(initialQuestionState())

    expect(html).toBe("")
    expect(html).not.toContain("Rationale for")
    expect(html).not.toContain("Source receipt")
    expect(html).not.toContain("construction-industry provision")
    expect(html).not.toContain("Exact offline source excerpt")
  })

  it("renders every rationale once in the required order after an incorrect answer", () => {
    const html = renderFeedback({
      tag: "revealed",
      selectedOptionId: "a",
      reviewIntent: "unflagged",
      payload
    })

    expect(html).toContain("<dt>Correct answer</dt><dd>Answer C</dd>")
    expect(html).toContain("<dt>Your answer</dt><dd>Answer A (incorrect)</dd>")

    const correctRationale = html.indexOf("Rationale for C.")
    const selectedRationale = html.indexOf("Rationale for A.")
    const firstOtherRationale = html.indexOf("Rationale for B.")
    const secondOtherRationale = html.indexOf("Rationale for D.")
    const sources = html.indexOf("Source receipt")

    expect(correctRationale).toBeGreaterThan(-1)
    expect(selectedRationale).toBeGreaterThan(correctRationale)
    expect(firstOtherRationale).toBeGreaterThan(selectedRationale)
    expect(secondOtherRationale).toBeGreaterThan(firstOtherRationale)
    expect(sources).toBeGreaterThan(secondOtherRationale)

    for (const optionId of ["A", "B", "C", "D"]) {
      expect(occurrenceCount(html, `Rationale for ${optionId}.`)).toBe(1)
    }
    expect(occurrenceCount(html, 'aria-label="Claims and sources for this explanation"')).toBe(4)
    expect(occurrenceCount(html, "line-1")).toBe(5)
    expect(occurrenceCount(html, "docs/source.md#L1")).toBe(5)
    expect(html).toContain("<strong>Scope note:</strong> This construction-industry provision")
    expect(html).toContain("Exact offline source excerpt for supported claim one.")
    expect(html).toContain("<dt>Publisher</dt><dd>Publisher one</dd>")
    expect(html).toContain("<dt>Source version</dt><dd>source revision 1</dd>")
    expect(html).toContain("<dt>Verified</dt><dd>2026-08-25</dd>")
  })

  it("does not duplicate the correct rationale when the learner chose it", () => {
    const html = renderFeedback({
      tag: "revealed",
      selectedOptionId: "c",
      reviewIntent: "flagged",
      payload
    })

    expect(html).toContain("<dt>Correct answer</dt><dd>Answer C</dd>")
    expect(html).toContain("<dt>Your answer</dt><dd>Answer C (correct)</dd>")
    expect(occurrenceCount(html, "Rationale for C.")).toBe(1)
    expect(html.indexOf("Rationale for C.")).toBeLessThan(html.indexOf("Rationale for A."))
    expect(html.indexOf("Rationale for D.")).toBeLessThan(html.indexOf("Source receipt"))
  })
})

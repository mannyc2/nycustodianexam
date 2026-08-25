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
  schemaVersion: 1,
  id: "q-feedback",
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
  schemaVersion: 1,
  id: question.id,
  correctOptionId: "c",
  rationales: [
    { optionId: "a", message: "Rationale for A." },
    { optionId: "d", message: "Rationale for D." },
    { optionId: "c", message: "Rationale for C." },
    { optionId: "b", message: "Rationale for B." }
  ],
  sources: [{ id: "source-1", label: "Source one", locator: "docs/source.md#L1" }]
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

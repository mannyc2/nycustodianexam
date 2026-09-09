import { describe, expect, it } from "vitest"
import {
  beginCommit,
  commitFailed,
  selectPresentation,
  initialQuestionState,
  questionContentUnavailable,
  selectOption,
  toggleReviewIntent
} from "../src/question-player/state.ts"

describe("question state machine", () => {
  it("preserves presentation through selection and a failed save, and locks it during commitment", () => {
    const nonvisual = selectPresentation(initialQuestionState(), "nonvisual")
    const selected = selectOption(nonvisual, "b")
    const committing = beginCommit(selected)
    expect(committing.presentation).toBe("nonvisual")
    expect(selectPresentation(committing, "visual")).toBe(committing)
    const retry = commitFailed(committing, "Storage failed")
    expect(retry.presentation).toBe("nonvisual")
    expect(selectPresentation(retry, "visual").presentation).toBe("visual")
  })

  it("cannot commit before a selection", () => {
    expect(beginCommit(initialQuestionState())).toEqual(initialQuestionState())
  })

  it("locks the selected answer into the committing state", () => {
    const selected = selectOption(initialQuestionState(), "pipe-wrench")
    expect(beginCommit(selected)).toMatchObject({
      tag: "committing",
      selectedOptionId: "pipe-wrench"
    })
  })

  it("models review intent without a component mode prop", () => {
    expect(toggleReviewIntent(initialQuestionState()).reviewIntent).toBe("flagged")
  })

  it("locks review intent once durable commitment begins", () => {
    const selected = selectOption(initialQuestionState(), "pipe-wrench")
    const committing = beginCommit(toggleReviewIntent(selected))
    expect(toggleReviewIntent(committing)).toBe(committing)
  })

  it("keeps unavailable content fail-closed to answer and commit transitions", () => {
    const unavailable = questionContentUnavailable(
      initialQuestionState(),
      "exact feedback unavailable"
    )
    expect(selectOption(unavailable, "pipe-wrench")).toBe(unavailable)
    expect(toggleReviewIntent(unavailable)).toBe(unavailable)
    expect(beginCommit(unavailable)).toBe(unavailable)
  })
})

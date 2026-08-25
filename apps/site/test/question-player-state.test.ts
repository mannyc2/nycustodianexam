import { describe, expect, it } from "vitest"
import {
  beginCommit,
  initialQuestionState,
  questionContentUnavailable,
  selectOption,
  toggleReviewIntent
} from "../src/question-player/state.ts"

describe("question state machine", () => {
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

import type { PostcommitQuestion } from "@nycustodian/content/model"

export type ReviewIntent = "unflagged" | "flagged"

export type QuestionScreenState =
  | {
      readonly tag: "ready"
      readonly selectedOptionId: string | null
      readonly reviewIntent: ReviewIntent
    }
  | {
      readonly tag: "restoring"
      readonly reviewIntent: ReviewIntent
    }
  | {
      readonly tag: "restore_failed"
      readonly reviewIntent: ReviewIntent
      readonly message: string
    }
  | {
      readonly tag: "content_unavailable"
      readonly reviewIntent: ReviewIntent
      readonly message: string
    }
  | {
      readonly tag: "committing"
      readonly selectedOptionId: string
      readonly reviewIntent: ReviewIntent
    }
  | {
      readonly tag: "commit_failed"
      readonly selectedOptionId: string
      readonly reviewIntent: ReviewIntent
      readonly message: string
    }
  | {
      readonly tag: "reveal_failed"
      readonly selectedOptionId: string
      readonly reviewIntent: ReviewIntent
      readonly message: string
    }
  | {
      readonly tag: "revealed"
      readonly selectedOptionId: string
      readonly reviewIntent: ReviewIntent
      readonly payload: PostcommitQuestion
    }

export const initialQuestionState = (): QuestionScreenState => ({
  tag: "ready",
  selectedOptionId: null,
  reviewIntent: "unflagged"
})

export const selectedOptionId = (state: QuestionScreenState): string | null => {
  switch (state.tag) {
    case "ready":
      return state.selectedOptionId
    case "committing":
    case "commit_failed":
    case "reveal_failed":
    case "revealed":
      return state.selectedOptionId
    case "restoring":
    case "restore_failed":
    case "content_unavailable":
      return null
  }
}

export const selectOption = (state: QuestionScreenState, optionId: string): QuestionScreenState => {
  switch (state.tag) {
    case "ready":
    case "commit_failed":
      return { tag: "ready", selectedOptionId: optionId, reviewIntent: state.reviewIntent }
    case "restoring":
    case "restore_failed":
    case "content_unavailable":
    case "committing":
    case "reveal_failed":
    case "revealed":
      return state
  }
}

export const toggleReviewIntent = (state: QuestionScreenState): QuestionScreenState =>
  state.tag === "ready" || state.tag === "commit_failed"
    ? {
        ...state,
        reviewIntent: state.reviewIntent === "flagged" ? "unflagged" : "flagged"
      }
    : state

export const beginCommit = (state: QuestionScreenState): QuestionScreenState => {
  if ((state.tag === "ready" || state.tag === "commit_failed") && state.selectedOptionId !== null) {
    return {
      tag: "committing",
      selectedOptionId: state.selectedOptionId,
      reviewIntent: state.reviewIntent
    }
  }
  return state
}

export const commitFailed = (
  state: QuestionScreenState,
  message: string
): QuestionScreenState =>
  state.tag === "committing"
    ? {
        tag: "commit_failed",
        selectedOptionId: state.selectedOptionId,
        reviewIntent: state.reviewIntent,
        message
      }
    : state

export const restoreFailed = (
  state: QuestionScreenState,
  message: string
): QuestionScreenState => ({
  tag: "restore_failed",
  reviewIntent: state.reviewIntent,
  message
})

export const questionContentUnavailable = (
  state: QuestionScreenState,
  message: string
): QuestionScreenState => ({
  tag: "content_unavailable",
  reviewIntent: state.reviewIntent,
  message
})

export const revealFailed = (
  state: QuestionScreenState,
  selectedId: string,
  message: string
): QuestionScreenState => ({
  tag: "reveal_failed",
  selectedOptionId: selectedId,
  reviewIntent: state.reviewIntent,
  message
})

export const revealQuestion = (
  state: QuestionScreenState,
  selectedId: string,
  payload: PostcommitQuestion
): QuestionScreenState => ({
  tag: "revealed",
  selectedOptionId: selectedId,
  reviewIntent: state.reviewIntent,
  payload
})

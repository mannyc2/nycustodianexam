import type { PrecommitQuestion } from "@nycustodian/content/model"
import type { Effect } from "effect"
import type { QuestionAttemptReceipt } from "../attempt-receipt.ts"
import { makeScreenStore, type ScreenSnapshot } from "../screen/store.ts"
import type { VerifiedContent } from "../verified-content.ts"
import type { QuestionPersistence } from "./persistence.ts"
import {
  beginCommit,
  commitFailed,
  initialQuestionState,
  questionContentUnavailable,
  revealFailed,
  revealQuestion,
  restoreFailed,
  selectOption,
  toggleReviewIntent,
  type QuestionScreenState
} from "./state.ts"
import type { QuestionFocusRequest } from "./view-requests.ts"
import {
  commitSelectionAndReveal,
  restoreSelectionAndReveal,
  retryReveal
} from "./commit-and-reveal.ts"

export interface EffectRunner {
  readonly runPromise: <A, E>(
    effect: Effect.Effect<A, E, QuestionPersistence | VerifiedContent>
  ) => Promise<A>
}

export type QuestionCommand =
  | { readonly tag: "select-option"; readonly optionId: string }
  | { readonly tag: "submit-selection" }
  | { readonly tag: "retry-reveal" }
  | { readonly tag: "retry-restore" }
  | { readonly tag: "toggle-flag" }

export type QuestionControllerSnapshot = ScreenSnapshot<
  QuestionScreenState,
  QuestionFocusRequest["target"]
>

export interface QuestionController {
  readonly question: PrecommitQuestion
  readonly getSnapshot: () => QuestionControllerSnapshot
  readonly getHydrationSnapshot: () => QuestionControllerSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly dispatch: (command: QuestionCommand) => void
  readonly acknowledgeViewRequest: (requestId: string) => void
  readonly start: () => void
  readonly dispose: () => void
}

const safeErrorMessage = (cause: unknown): string =>
  cause instanceof Error && cause.message.length > 0
    ? cause.message
    : "The local study operation could not be completed."

export const createQuestionController = (
  question: PrecommitQuestion,
  runtime: EffectRunner,
  receipt: QuestionAttemptReceipt
): QuestionController => {
  const optionIds = question.options.map((option) => option.id)
  const screen = makeScreenStore<QuestionScreenState, QuestionFocusRequest["target"]>({
    initialState: { tag: "restoring", reviewIntent: "unflagged" }
  })
  const publish = screen.publish

  const restore = (): void => {
    publish(
      { tag: "restoring", reviewIntent: screen.getSnapshot().state.reviewIntent },
      { announce: "Checking this device for a saved answer." }
    )
    void runtime
      .runPromise(restoreSelectionAndReveal({ receipt, optionIds }))
      .then((restored) => {
        if (restored === undefined) {
          publish(initialQuestionState())
          return
        }
        if (restored.tag === "content_unavailable") {
          publish(
            questionContentUnavailable(
              screen.getSnapshot().state,
              "Reconnect and reload this question so its exact released feedback can be verified before you answer."
            ),
            { focus: "commit-error" }
          )
          return
        }
        if (restored.tag === "revealed") {
          const restoredState = {
            ...screen.getSnapshot().state,
            reviewIntent: restored.attempt.reviewIntent
          }
          publish(
            revealQuestion(restoredState, restored.attempt.selectedOptionId, restored.payload),
            { focus: "outcome" }
          )
          return
        }
        const restoredState = {
          ...screen.getSnapshot().state,
          reviewIntent: restored.attempt.reviewIntent
        }
        publish(
          revealFailed(
            restoredState,
            restored.attempt.selectedOptionId,
            restored.error.detail
          ),
          { focus: "commit-error" }
        )
      })
      .catch((cause: unknown) => {
        console.error("Unable to restore the saved question", cause)
        publish(
          restoreFailed(
            screen.getSnapshot().state,
            "This question could not open study storage. Close other tabs if an update is blocked, then reload this question."
          ),
          { focus: "commit-error" }
        )
      })
  }

  const submit = (): void => {
    const state = screen.getSnapshot().state
    if ((state.tag !== "ready" && state.tag !== "commit_failed") || state.selectedOptionId === null) {
      return
    }
    const selectedId = state.selectedOptionId
    const reviewIntent = state.reviewIntent
    publish(beginCommit(state), { announce: "Saving your answer before revealing feedback." })
    void runtime
      .runPromise(
        commitSelectionAndReveal({
          receipt,
          optionIds,
          selectedOptionId: selectedId,
          reviewIntent
        })
      )
      .then((result) => {
        if (result.tag === "content_unavailable") {
          publish(
            questionContentUnavailable(
              screen.getSnapshot().state,
              "Reconnect and reload this question so its exact released feedback can be verified before you answer."
            ),
            { focus: "commit-error" }
          )
          return
        }
        if (result.tag === "revealed") {
          publish(revealQuestion(screen.getSnapshot().state, selectedId, result.payload), {
            focus: "outcome",
            announce: "Answer saved and feedback revealed."
          })
          return
        }
        publish(revealFailed(screen.getSnapshot().state, selectedId, result.error.detail), {
          focus: "commit-error"
        })
      })
      .catch((cause: unknown) => {
        publish(commitFailed(screen.getSnapshot().state, safeErrorMessage(cause)), {
          focus: "commit-error"
        })
      })
  }

  const retryPostcommit = (): void => {
    const state = screen.getSnapshot().state
    if (state.tag !== "reveal_failed") return
    const selectedId = state.selectedOptionId
    publish(
      { tag: "committing", selectedOptionId: selectedId, reviewIntent: state.reviewIntent },
      { announce: "Retrying the saved answer explanation." }
    )
    void runtime
      .runPromise(retryReveal({ receipt, optionIds }))
      .then((payload) => {
        publish(revealQuestion(screen.getSnapshot().state, selectedId, payload), { focus: "outcome" })
      })
      .catch((cause: unknown) => {
        publish(revealFailed(screen.getSnapshot().state, selectedId, safeErrorMessage(cause)), {
          focus: "commit-error"
        })
      })
  }

  return {
    question,
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    dispatch: (command) => {
      switch (command.tag) {
        case "select-option":
          publish(selectOption(screen.getSnapshot().state, command.optionId))
          return
        case "submit-selection":
          submit()
          return
        case "retry-reveal":
          retryPostcommit()
          return
        case "retry-restore":
          restore()
          return
        case "toggle-flag":
          publish(toggleReviewIntent(screen.getSnapshot().state))
          return
      }
    },
    acknowledgeViewRequest: screen.acknowledgeRequest,
    start: () => screen.start(restore),
    dispose: screen.dispose
  }
}

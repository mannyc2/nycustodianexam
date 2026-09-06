import { type FormEvent, type ReactNode } from "react"
import { selectedOptionId } from "../state.ts"
import { useQuestionPlayer } from "./context.tsx"

export const QuestionFrame = ({ children }: { readonly children: ReactNode }) => (
  <article className="question-card study-player" aria-labelledby="question-heading">
    {children}
  </article>
)

export const QuestionHeader = () => {
  const { actions, state } = useQuestionPlayer()
  const canChangeFlag = state.tag === "ready" || state.tag === "commit_failed"
  return (
    <div className="player-heading-row">
      <span className="player-position">Practice question · Text version</span>
      <button
        aria-pressed={state.reviewIntent === "flagged"}
        className="button button-secondary player-flag"
        disabled={!canChangeFlag}
        onClick={actions.toggleFlag}
        type="button"
      >
        <span aria-hidden="true">⚑</span>
        {state.reviewIntent === "flagged" ? "Flagged for review" : "Flag for review"}
      </button>
    </div>
  )
}

export const QuestionPrompt = () => {
  const { question } = useQuestionPlayer()
  return (
    <header className="question-prompt">
      <h1 id="question-heading">{question.prompt}</h1>
      <p>
        Choose one answer. You can change your selection until you save it.
      </p>
    </header>
  )
}

export const QuestionOptions = () => {
  const { actions, meta, question, state } = useQuestionPlayer()
  const selected = selectedOptionId(state)
  const locked = state.tag !== "ready" && state.tag !== "commit_failed"

  return (
    <fieldset aria-describedby={meta.statusId} disabled={locked}>
      <legend className="player-choice-legend">Answer choices</legend>
      <div className="answer-list">
        {question.options.map((option, index) => (
          <label className="answer-option" key={option.id}>
            <input
              checked={selected === option.id}
              name="answer"
              onChange={() => actions.selectOption(option.id)}
              type="radio"
              value={option.id}
            />
            <span aria-hidden="true" className="answer-letter">{String.fromCharCode(65 + index)}</span>
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export const QuestionForm = ({ children }: { readonly children: ReactNode }) => {
  const { actions, state } = useQuestionPlayer()
  const isRevealRetry = state.tag === "reveal_failed"
  const isRestoreRetry = state.tag === "restore_failed"

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isRestoreRetry) {
      window.location.reload()
    } else if (isRevealRetry) {
      actions.retryReveal()
    } else {
      actions.submitSelection()
    }
  }

  return (
    <form onSubmit={submit}>{children}</form>
  )
}

export const QuestionControls = () => {
  const { state } = useQuestionPlayer()
  const selected = selectedOptionId(state)
  const isRevealRetry = state.tag === "reveal_failed"
  const isRestoreRetry = state.tag === "restore_failed"

  return (
    <>
    {state.tag === "ready" && selected !== null ? (
      <p className="player-selection-note">Nothing is saved yet. Change your selection as often as you like, then press Save answer.</p>
    ) : null}
    <div className="question-controls player-action-bar">
      {state.tag === "revealed" ? (
        <a className="button button-primary" href="/atlas/">
          Open study tools
        </a>
      ) : (
        <button
          className="button button-primary"
          disabled={
            (!isRestoreRetry && selected === null) ||
            state.tag === "committing" ||
            state.tag === "restoring"
          }
          type="submit"
        >
          {state.tag === "committing"
            ? "Saving your answer…"
            : isRestoreRetry
              ? "Reload question"
              : isRevealRetry
              ? "Retry explanation"
              : "Save answer"}
        </button>
      )}
      <span className="player-action-note">{state.tag === "revealed"
        ? "Answer saved on this device"
        : "Your answer is saved before feedback appears"}</span>
    </div>
    </>
  )
}

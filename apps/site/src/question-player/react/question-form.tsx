import { type FormEvent, type ReactNode } from "react"
import { selectedOptionId } from "../state.ts"
import { useQuestionPlayer } from "./context.tsx"

export const QuestionFrame = ({ children }: { readonly children: ReactNode }) => (
  <article className="question-card" aria-labelledby="question-heading">
    {children}
  </article>
)

export const QuestionPrompt = () => {
  const { question } = useQuestionPlayer()
  return (
    <header className="question-prompt">
      <p className="eyebrow">Hand tools · one question</p>
      <h1 id="question-heading">{question.prompt}</h1>
      <p>Select one answer. Your choice is saved before the explanation is loaded.</p>
    </header>
  )
}

export const QuestionOptions = () => {
  const { actions, meta, question, state } = useQuestionPlayer()
  const selected = selectedOptionId(state)
  const locked = state.tag !== "ready" && state.tag !== "commit_failed"

  return (
    <fieldset aria-describedby={meta.statusId} disabled={locked}>
      <legend className="sr-only">Answer choices</legend>
      <div className="answer-list">
        {question.options.map((option) => (
          <label className="answer-option" key={option.id}>
            <input
              checked={selected === option.id}
              name="answer"
              onChange={() => actions.selectOption(option.id)}
              type="radio"
              value={option.id}
            />
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
  const { actions, state } = useQuestionPlayer()
  const selected = selectedOptionId(state)
  const isRevealRetry = state.tag === "reveal_failed"
  const isRestoreRetry = state.tag === "restore_failed"
  const canChangeFlag = state.tag === "ready" || state.tag === "commit_failed"

  return (
    <div className="question-controls">
      {state.tag === "revealed" ? (
        <a className="button button-primary" href="/atlas/">
          Open the tool atlas
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
            ? "Saving answer…"
            : isRestoreRetry
              ? "Reload question"
              : isRevealRetry
              ? "Retry explanation"
              : "Commit answer"}
        </button>
      )}
      <button
        aria-pressed={state.reviewIntent === "flagged"}
        className="button button-secondary"
        disabled={!canChangeFlag}
        onClick={actions.toggleFlag}
        type="button"
      >
        {state.reviewIntent === "flagged" ? "Flagged for review" : "Flag for review"}
      </button>
    </div>
  )
}

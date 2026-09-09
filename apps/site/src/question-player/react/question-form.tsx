import { QuestionIllustration } from "./illustration.tsx"
import { type FormEvent, type ReactNode } from "react"
import { selectedOptionId } from "../state.ts"
import { useQuestionPlayer } from "./context.tsx"

export const QuestionFrame = ({ children }: { readonly children: ReactNode }) => (
  <article className="question-card study-player" aria-labelledby="question-heading">
    {children}
  </article>
)

export const QuestionHeader = ({ positionLabel = "Practice question" }: { readonly positionLabel?: string }) => {
  const { actions, question, state } = useQuestionPlayer()
  const canChangeFlag = state.tag === "ready" || state.tag === "commit_failed"
  return (
    <div className="player-heading-row">
      <span className="player-position">{positionLabel} · {state.presentation === "nonvisual" ? "Nonvisual version" : question.illustration === undefined ? "Text version" : "Illustrated question"}</span>
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

export const QuestionVisualBody = () => {
  const { question } = useQuestionPlayer()
  return <><h1 id="question-heading">{question.prompt}</h1><QuestionIllustration illustration={question.illustration} /></>
}

export const QuestionNonvisualBody = () => {
  const { question } = useQuestionPlayer()
  const equivalent = question.illustration?.nonvisualEquivalent
  if (equivalent === undefined) return <p role="alert">The saved nonvisual version is unavailable for this question.</p>
  return <section className="question-nonvisual-body" aria-labelledby="question-heading">
    <h1 id="question-heading">{equivalent.prompt}</h1>
    <ol>{equivalent.observations.map((observation, index) => <li key={index}>{observation}</li>)}</ol>
  </section>
}

export const QuestionPrompt = () => {
  const { question, state, actions } = useQuestionPlayer()
  return (
    <header className="question-prompt">
      {state.presentation === "nonvisual" ? <QuestionNonvisualBody /> : <QuestionVisualBody />}
      {question.illustration?.nonvisualEquivalent === undefined ? null :
        <button type="button" className="button button-secondary question-presentation-toggle"
          disabled={state.tag !== "ready" && state.tag !== "commit_failed"}
          onClick={() => actions.selectPresentation(state.presentation === "nonvisual" ? "visual" : "nonvisual")}>
          {state.presentation === "nonvisual" ? "Use illustrated version" : "Use nonvisual version"}
        </button>}
      {state.tag === "revealed" && state.presentation !== undefined ?
        <p className="source-note">Answered using the {state.presentation === "nonvisual" ? "nonvisual" : "illustrated"} version.</p> : null}
      <p>
        {state.tag === "revealed"
          ? "Your answer is saved. Read the explanation, then continue when you are ready."
          : "Choose one answer. You can change your selection until you save it."}
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

export const QuestionControls = ({ nextHref }: { readonly nextHref?: string }) => {
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
        <>
        <a className="button button-secondary" href="/atlas/">Open study tools</a>
        <a className="button button-secondary" href="/report/">Report a correction</a>
        <a className="button button-primary player-continue" data-session-history={nextHref === undefined ? undefined : "replace"} href={nextHref ?? "/practice/"}>
          {nextHref === undefined ? "Return to Practice" : "Next question"}
        </a>
        </>
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
      {nextHref !== undefined && (state.tag === "ready" || state.tag === "commit_failed") ? <a className="button button-secondary" data-session-history="replace" href={nextHref}>Skip for now</a> : null}
      <span className="player-action-note">{state.tag === "revealed"
        ? "Answer saved on this device"
        : "Your answer is saved before feedback appears"}</span>
    </div>
    </>
  )
}

import type { ReactNode, RefObject } from "react"
import { QuestionIllustration } from "../../question-player/react/illustration.tsx"
import type { SimulationPlayerController, SimulationPlayerState } from "../controller.ts"
import type { SimulationSessionItem, SimulationResponse } from "../model.ts"

interface SimulationQuestionProps {
  readonly controller: SimulationPlayerController
  readonly state: Extract<SimulationPlayerState, { readonly tag: "ready" }>
  readonly item: SimulationSessionItem
  readonly position: number
  readonly response: SimulationResponse | undefined
  readonly answerEditBlocked: boolean
  readonly presentationToggleRef: RefObject<HTMLButtonElement | null>
}

export const SimulationQuestion = ({ controller, state, item, position, response, answerEditBlocked, presentationToggleRef, children }: SimulationQuestionProps & { readonly children: ReactNode }) => {
  const { session, saving, recoverableError } = state
  const illustration = "illustration" in item.question ? item.question.illustration : undefined
  const nonvisualEquivalent = illustration?.nonvisualEquivalent
  return <article className="question-card study-player" aria-labelledby="simulation-question-heading">
      <div className="player-heading-row">
        <span className="player-position">Question {position} of {session.actualLength}</span>
        <span className="player-mode-label">Practice simulation</span>
      </div>
      <header className="question-prompt">
        {children}
        {nonvisualEquivalent === undefined ? null : <>
          <p className="source-note">{response?.presentation === "nonvisual" ? "Nonvisual version" : "Illustrated version"}</p>
          <button ref={presentationToggleRef} type="button" className="button button-secondary question-presentation-toggle"
            disabled={session.status !== "active" || answerEditBlocked}
            onClick={() => controller.dispatch({ tag: "select-presentation", presentation: response?.presentation === "nonvisual" ? "visual" : "nonvisual" })}>
            {response?.presentation === "nonvisual" ? "Use illustrated version" : "Use nonvisual version"}
          </button>
        </>}
        <p>Choose one answer. You can edit it until final submission. Feedback is not loaded during the simulation.</p>
      </header>
      <fieldset disabled={session.status !== "active" || answerEditBlocked}>
        <legend className="player-choice-legend">Answer choices</legend>
        <div className="answer-list">
          {item.optionOrder.map((optionId, index) => {
            const option = item.question.options.find((candidate) => candidate.id === optionId)
            if (option === undefined) return null
            return <label className="answer-option" key={option.id}>
              <input
                checked={response?.selectedOptionId === option.id}
                name={`simulation-${item.question.id}`}
                onChange={() => controller.dispatch({ tag: "select-option", optionId: option.id })}
                type="radio"
                value={option.id}
              />
              <span aria-hidden="true" className="answer-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option.label}</span>
            </label>
          })}
        </div>
      </fieldset>
      <div className="question-controls player-action-bar">
        <button
          aria-pressed={response?.reviewIntent === "flagged"}
          className="button button-secondary"
          disabled={answerEditBlocked}
          onClick={() => controller.dispatch({ tag: "toggle-flag" })}
          type="button"
        >{response?.reviewIntent === "flagged" ? "Flagged for review" : "Flag this question"}</button>
        <span aria-live="polite" className="player-action-note">{saving
          ? "Saving locally…"
          : recoverableError === null
            ? "Saved on this device"
            : "Not yet saved; retry required"}</span>
      </div>
    </article>
}

export const SimulationVisualQuestion = (props: SimulationQuestionProps) => {
  const illustration = "illustration" in props.item.question ? props.item.question.illustration : undefined
  return <SimulationQuestion {...props}>
    <h1 id="simulation-question-heading">{props.item.question.prompt}</h1>
    <QuestionIllustration illustration={illustration} />
  </SimulationQuestion>
}

export const SimulationNonvisualQuestion = (props: SimulationQuestionProps) => {
  const illustration = "illustration" in props.item.question ? props.item.question.illustration : undefined
  const equivalent = illustration?.nonvisualEquivalent
  return <SimulationQuestion {...props}>
    {equivalent === undefined ? <h1 id="simulation-question-heading">The saved nonvisual question is unavailable.</h1> :
      <section className="question-nonvisual-body" aria-labelledby="simulation-question-heading">
        <h1 id="simulation-question-heading">{equivalent.prompt}</h1>
        <ol>{equivalent.observations.map((fact, index) => <li key={index}>{fact}</li>)}</ol>
      </section>}
  </SimulationQuestion>
}

export const SimulationQuestionRoute = (props: SimulationQuestionProps) => props.response?.presentation === "nonvisual"
  ? <SimulationNonvisualQuestion {...props} /> : <SimulationVisualQuestion {...props} />

import { useQuestionPlayer } from "./context.tsx"

export const QuestionFeedback = () => {
  const { actions, meta, question, state } = useQuestionPlayer()

  if (
    state.tag === "content_unavailable" ||
    state.tag === "restore_failed" ||
    state.tag === "commit_failed" ||
    state.tag === "reveal_failed"
  ) {
    return (
      <section className="feedback feedback-error" role="alert">
        <h2 ref={meta.errorHeadingRef} tabIndex={-1}>
          {state.tag === "content_unavailable"
            ? "Required study content is unavailable"
            : state.tag === "restore_failed"
            ? "Study storage is unavailable"
            : state.tag === "commit_failed"
              ? "Your answer was not saved"
              : "Your answer is saved"}
        </h2>
        <p>{state.message}</p>
        {state.tag === "commit_failed" ? <p>Check storage access, then commit again.</p> : null}
        {state.tag === "content_unavailable" ? (
          <button className="button button-secondary" onClick={actions.retryRestore} type="button">
            Check content again
          </button>
        ) : null}
      </section>
    )
  }

  if (state.tag !== "revealed") {
    return null
  }

  const correct = state.selectedOptionId === state.payload.correctOptionId
  const optionLabels = new Map(question.options.map((option) => [option.id, option.label]))
  const rationales = new Map(
    state.payload.rationales.map((rationale) => [rationale.optionId, rationale.message])
  )
  const orderedRationaleIds = [
    state.payload.correctOptionId,
    ...(correct ? [] : [state.selectedOptionId]),
    ...question.options
      .map((option) => option.id)
      .filter(
        (optionId) =>
          optionId !== state.payload.correctOptionId && optionId !== state.selectedOptionId
      )
  ]
  const optionLabel = (optionId: string): string =>
    optionLabels.get(optionId) ?? "Unavailable answer choice"

  return (
    <section className={correct ? "feedback feedback-correct" : "feedback feedback-review"}>
      <h2 ref={meta.outcomeHeadingRef} tabIndex={-1}>
        {correct ? "Correct" : "Review this one"}
      </h2>
      <dl className="feedback-answer-summary">
        <div>
          <dt>Correct answer</dt>
          <dd>{optionLabel(state.payload.correctOptionId)}</dd>
        </div>
        <div>
          <dt>Your answer</dt>
          <dd>
            {optionLabel(state.selectedOptionId)} ({correct ? "correct" : "incorrect"})
          </dd>
        </div>
      </dl>
      <section aria-labelledby={`${meta.instanceId}-rationales`} className="feedback-rationales">
        <h3 id={`${meta.instanceId}-rationales`}>Answer explanations</h3>
        <ol className="rationale-list">
          {orderedRationaleIds.map((optionId) => (
            <li key={optionId}>
              <h4>
                {optionId === state.payload.correctOptionId
                  ? "Correct answer"
                  : optionId === state.selectedOptionId
                    ? "Your answer"
                    : "Other answer"}
                : {optionLabel(optionId)}
              </h4>
              <p>{rationales.get(optionId) ?? "No rationale is available for this choice."}</p>
            </li>
          ))}
        </ol>
      </section>
      <details className="feedback-sources">
        <summary>Source receipt</summary>
        <ul>
          {state.payload.sources.map((source) => (
            <li key={source.id}>
              {source.label} <code>{source.locator}</code>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

export const QuestionStatus = () => {
  const { meta } = useQuestionPlayer()
  return (
    <p aria-atomic="true" aria-live="polite" className="sr-only" id={meta.statusId}>
      {meta.announcementRequest?.message ?? ""}
    </p>
  )
}

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
        {state.tag === "commit_failed" ? <p>Free up storage or close other tabs of this site, then submit again.</p> : null}
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
    state.payload.rationales.map((rationale) => [rationale.optionId, rationale])
  )
  const claims = new Map(state.payload.claims.map((claim) => [claim.id, claim]))
  const sources = new Map(state.payload.sources.map((source) => [source.id, source]))
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
        {correct
          ? `Correct — “${optionLabel(state.payload.correctOptionId)}” is the right answer.`
          : `Not correct — the right answer is “${optionLabel(state.payload.correctOptionId)}”.`}
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
          {orderedRationaleIds.map((optionId) => {
            const rationale = rationales.get(optionId)
            return (
              <li key={optionId}>
                <h4>
                  {optionId === state.payload.correctOptionId
                    ? "Correct answer"
                    : optionId === state.selectedOptionId
                      ? "Your answer"
                      : "Other answer"}
                  : {optionLabel(optionId)}
                </h4>
                <p>{rationale?.message ?? "No rationale is available for this choice."}</p>
                {rationale === undefined ? null : (
                  <ul aria-label="Claims and sources for this explanation" className="rationale-sources">
                    {rationale.claimIds.map((claimId) => {
                      const claim = claims.get(claimId)
                      return <li key={claimId}>
                        {claim === undefined ? (
                          <>Unavailable supported claim <code>{claimId}</code></>
                        ) : (
                          <>
                            <span>{claim.text}</span>
                            {claim.caveat === null ? null : (
                              <p className="claim-caveat">
                                <strong>Scope note:</strong> {claim.caveat}
                              </p>
                            )}
                            <ul>
                              {claim.sourceLineIds.map((sourceLineId) => {
                                const source = sources.get(sourceLineId)
                                return <li key={sourceLineId}>
                                  {source === undefined
                                    ? <>Unavailable source-line receipt <code>{sourceLineId}</code></>
                                    : <>{source.title} <code>{source.locator}</code></>}
                                </li>
                              })}
                            </ul>
                          </>
                        )}
                      </li>
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      </section>
      <details className="feedback-sources">
        <summary>Where this comes from</summary>
        <ul className="source-receipt-list">
          {state.payload.sources.map((source) => (
            <li key={source.id}>
              <p><code>{source.id}</code> — <strong>{source.title}</strong></p>
              <dl className="source-receipt-context">
                <div><dt>Publisher</dt><dd>{source.publisher}</dd></div>
                <div><dt>Source version</dt><dd>{source.version}</dd></div>
                <div><dt>Verified</dt><dd>{source.verifiedOn}</dd></div>
                <div><dt>Locator</dt><dd><code>{source.locator}</code></dd></div>
                <div><dt>Evidence</dt><dd>{source.evidenceTier}</dd></div>
              </dl>
              <blockquote className="source-receipt-excerpt">
                <p>{source.excerpt}</p>
              </blockquote>
              <p className="source-receipt-rights">{source.rightsNotes}</p>
              {source.url === undefined ? null : (
                <p>Source URL: <code>{source.url}</code></p>
              )}
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

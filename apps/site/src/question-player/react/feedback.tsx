import { sourceEvidenceTierLabel } from "../../public-content-labels.ts"
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
  const objectiveClaim = state.payload.objectiveId === undefined
    ? undefined
    : claims.get(state.payload.objectiveId)
  const hasAuthoredMixUp = (state.payload.tags?.confusionSetIds.length ?? 0) > 0
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
              </li>
            )
          })}
        </ol>
      </section>
      {objectiveClaim === undefined ? null : (
        <section className="feedback-claims">
          <h3>Key distinction</h3>
          <p>{objectiveClaim.text}</p>
          {objectiveClaim.caveat === null ? null : (
            <p className="claim-caveat"><strong>Scope note:</strong> {objectiveClaim.caveat}</p>
          )}
        </section>
      )}
      {hasAuthoredMixUp ? (
        <section className="feedback-confusion">
          <h3>Common mix-up</h3>
          <p>{correct
            ? objectiveClaim === undefined
              ? `Compare “${optionLabel(state.payload.correctOptionId)}” with the other answer choices in the answer explanations above.`
              : `Compare “${optionLabel(state.payload.correctOptionId)}” with the other answer choices using the key distinction above.`
            : objectiveClaim === undefined
              ? `You chose “${optionLabel(state.selectedOptionId)}.” Compare it with “${optionLabel(state.payload.correctOptionId)}” in the answer explanations above.`
              : `You chose “${optionLabel(state.selectedOptionId)}.” Compare it with “${optionLabel(state.payload.correctOptionId)}” using the key distinction above.`}</p>
        </section>
      ) : null}
      <details className="feedback-sources">
        <summary>Where this comes from</summary>
        <ul className="source-receipt-list">
          {state.payload.sources.map((source) => (
            <li key={source.id}>
              <p><strong>{source.publisher}</strong> — {source.title} (verified <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)</p>
              <dl className="source-receipt-context">
                <div><dt>Evidence</dt><dd>{sourceEvidenceTierLabel(source.evidenceTier)}</dd></div>
              </dl>
              <blockquote className="source-receipt-excerpt">
                <p>{source.excerpt}</p>
              </blockquote>
              <p className="source-receipt-rights">{source.rightsNotes}</p>
              {source.url === undefined ? null : (
                <p><a href={source.url} rel="external noopener">Open the source</a></p>
              )}
              <details className="source-note">
                <summary>Technical details</summary>
                <dl className="source-receipt-context">
                  <div><dt>Source version</dt><dd>{source.version}</dd></div>
                  <div><dt>Locator</dt><dd><code>{source.locator}</code></dd></div>
                  <div><dt>Source line ID</dt><dd><code>{source.id}</code></dd></div>
                  <div><dt>Source record ID</dt><dd><code>{source.sourceId}</code></dd></div>
                </dl>
              </details>
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

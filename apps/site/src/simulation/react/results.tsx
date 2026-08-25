import { useEffect, useRef, useSyncExternalStore } from "react"
import { createSimulationResultsController } from "../controller.ts"
import {
  formatSimulationElapsed,
  simulationElapsedMilliseconds
} from "../results.ts"
import { assessVisualMarkers } from "../../hazard-player/assessment.ts"
import { AnnotatedHazardScene } from "../../hazard-player/react/annotated-scene.tsx"
import {
  simulationItemId,
  type SimulationHazardResult,
  type SimulationHazardSessionItem,
  type SimulationQuestionResult,
  type SimulationSessionItem,
  type SimulationSubmittedAnswer
} from "../model.ts"

type ResultsController = ReturnType<typeof createSimulationResultsController>

const QuestionEvidence = ({ result }: { readonly result: SimulationQuestionResult }) => {
  const feedback = result.postcommit
  if (feedback.schemaVersion === 1) {
    return <details className="feedback-sources">
      <summary>Source receipts</summary>
      <p>This historical result preserves the source-reference format published with its release.</p>
      <ul>{feedback.sources.map((source) => <li key={source.id}>
        {source.label} <code>{source.locator}</code>
      </li>)}</ul>
    </details>
  }

  return <>
    <section className="feedback-claims">
      <h4>Supported claims</h4>
      <ul>{feedback.claims.map((claim) => <li key={claim.id}>
        <p>{claim.text}</p>
        <p><strong>Evidence tier:</strong> {claim.evidenceTier}</p>
        {claim.caveat === null ? null : <p><strong>Caveat:</strong> {claim.caveat}</p>}
      </li>)}</ul>
    </section>
    <details className="feedback-sources">
      <summary>Source-line receipts</summary>
      <ul>{feedback.sources.map((source) => <li key={source.id}>
        <p><strong>{source.title}</strong> — {source.publisher}, {source.version}</p>
        <p><code>{source.locator}</code> · verified {source.verifiedOn}</p>
        <blockquote>{source.excerpt}</blockquote>
        {source.url === undefined ? null : <p><a href={source.url} rel="external noopener">Open the source</a></p>}
      </li>)}</ul>
    </details>
  </>
}

const ResultActions = ({ flagged }: { readonly flagged: boolean }) => (
  <section>
    <h4>Review and source actions</h4>
    {flagged ? <p>
      Your flag is retained in this saved simulation result. Simulation flags are not
      automatically added to the separate due review queue.
    </p> : null}
    <nav aria-label="Review and source actions" className="question-controls">
      <a className="button button-secondary" href="/review/">Open the separate local review queue</a>
      <a className="button button-secondary" href="/transparency/sources/">
        Inspect source records
      </a>
    </nav>
  </section>
)

const QuestionResultFeedback = ({
  answer,
  item,
  result
}: {
  readonly answer: SimulationSubmittedAnswer
  readonly item: SimulationSessionItem
  readonly result: SimulationQuestionResult
}) => {
  const optionLabels = new Map(item.question.options.map((option) => [option.id, option.label]))
  const rationales = new Map(
    result.postcommit.rationales.map((rationale) => [rationale.optionId, rationale.message])
  )
  const selectedId = result.selectedOptionId
  const orderedRationaleIds = [
    result.correctOptionId,
    ...(selectedId === null || selectedId === result.correctOptionId ? [] : [selectedId]),
    ...item.optionOrder.filter(
      (optionId) => optionId !== result.correctOptionId && optionId !== selectedId
    )
  ]
  const optionLabel = (optionId: string | null): string =>
    optionId === null ? "No answer" : optionLabels.get(optionId) ?? "Unavailable answer choice"
  const decisiveRule = rationales.get(result.correctOptionId)
  const claimById = result.postcommit.schemaVersion === 2
    ? new Map(result.postcommit.claims.map((claim) => [claim.id, claim]))
    : new Map<string, never>()

  return <>
    <dl className="feedback-answer-summary">
      <div><dt>Your answer</dt><dd>{optionLabel(selectedId)}</dd></div>
      <div><dt>Correct answer</dt><dd>{optionLabel(result.correctOptionId)}</dd></div>
    </dl>
    <section className="feedback-rationales">
      <h4>Answer explanations</h4>
      <ol className="rationale-list">
        {orderedRationaleIds.map((optionId) => <li key={optionId}>
          <h5>{optionId === result.correctOptionId
            ? "Correct answer"
            : optionId === selectedId
              ? "Your answer"
              : "Other answer"}: {optionLabel(optionId)}</h5>
          <p>{rationales.get(optionId) ?? "No rationale is available for this choice."}</p>
          {result.postcommit.schemaVersion === 1 ? null : <ul>
            {result.postcommit.rationales
              .find((rationale) => rationale.optionId === optionId)?.claimIds
              .map((claimId) => {
                const claim = claimById.get(claimId)
                return claim === undefined ? null : <li key={claimId}>{claim.text}</li>
              })}
          </ul>}
        </li>)}
      </ol>
    </section>
    <section>
      <h4>Why this answer is correct</h4>
      <p>{decisiveRule ?? "The reviewed correct-answer rationale is unavailable."}</p>
    </section>
    <QuestionEvidence result={result} />
    <ResultActions flagged={answer.reviewIntent === "flagged"} />
  </>
}

const hazardRoleLabel = (role: "target" | "decoy" | "safe-background"): string => {
  switch (role) {
    case "target": return "Condition needing correction"
    case "decoy": return "Safe detail that may look suspicious"
    case "safe-background": return "Safe background detail"
  }
}

const VisualHazardResponseFeedback = ({
  answer,
  result
}: {
  readonly answer: SimulationSubmittedAnswer
  readonly result: SimulationHazardResult
}) => {
  const assessment = assessVisualMarkers(answer.markers ?? [], result.postcommit)
  return <section>
    {result.retainedVisualAsset === null
      ? <p role="alert">The exact retained scene image is unavailable.</p>
      : <AnnotatedHazardScene
          alt="Reviewed version of the submitted hazard scene"
          imageUrl={result.retainedVisualAsset.dataUrl}
          markers={answer.markers ?? []}
          payload={result.postcommit}
        />}
    <h4>Marker feedback</h4>
    {assessment.markers.length === 0 ? <p>You submitted no markers.</p> : <ol>
      {assessment.markers.map((marker) => {
        const target = result.postcommit.targets.find(
          (candidate) => candidate.id === marker.inventoryId
        )
        const decoy = result.postcommit.decoys.find(
          (candidate) => candidate.id === marker.inventoryId
        )
        return <li key={marker.marker.id}>
          <h5>Marker {marker.markerNumber}</h5>
          {marker.kind === "hit" ? <p><strong>Identified.</strong> {target === undefined
            ? "This marker corresponds to an authored condition needing correction."
            : `${target.condition}. Correction concept: ${target.correction}.`}</p>
            : marker.kind === "duplicate" ? <p><strong>Duplicate mark.</strong> {target === undefined
              ? "Another marker already identified this authored condition."
              : `Another marker already identified ${target.condition}.`}</p>
              : marker.kind === "decoy_false_positive" ? <p><strong>Decoy false positive.</strong> {decoy === undefined
                ? "The marked detail was an authored safe detail."
                : `${decoy.condition}; ${decoy.safeBecause}.`}</p>
                : <p>This mark did not correspond to an authored condition. The scene model does not invent meaning for an unauthored location.</p>}
        </li>
      })}
    </ol>}
    {assessment.missedInventoryIds.length === 0
      ? <p>No authored correction condition was left unidentified.</p>
      : <><h5>Conditions not marked</h5><ul>
        {assessment.missedInventoryIds.map((inventoryId) => {
          const target = result.postcommit.targets.find((candidate) => candidate.id === inventoryId)
          return target === undefined ? null : <li key={inventoryId}>
            {target.condition}. Correction concept: {target.correction}.
          </li>
        })}
      </ul></>}
  </section>
}

const NonvisualHazardResponseFeedback = ({
  answer,
  item,
  result
}: {
  readonly answer: SimulationSubmittedAnswer
  readonly item: SimulationHazardSessionItem
  readonly result: SimulationHazardResult
}) => {
  const selected = new Set(answer.selectedZoneOrders ?? [])
  return <section>
    <h4>Zone feedback</h4>
    <p>This zoned text activity is an equivalent knowledge task; it does not measure the same visual-recognition construct as placing markers on the image.</p>
    <ol>{item.scene.neutralPreAnswer.zones.map((zone) => <li key={zone.order}>
      <h5>Zone {zone.order}: {zone.label}</h5>
      <p>{selected.has(zone.order) ? "You selected this zone." : "You did not select this zone."}</p>
    </li>)}</ol>
    <h5>Complete zoned text equivalent</h5>
    <ul>{result.postcommit.nonvisualZonedEquivalent.map((statement) => <li
      key={`${statement.zone}:${statement.role}:${statement.statement}`}
    >
      <strong>{statement.zone} — {hazardRoleLabel(statement.role)}:</strong> {statement.statement}
    </li>)}</ul>
  </section>
}

const HazardResultFeedback = ({
  answer,
  item,
  result
}: {
  readonly answer: SimulationSubmittedAnswer
  readonly item: SimulationHazardSessionItem
  readonly result: SimulationHazardResult
}) => <>
  <p><strong>Your response:</strong> {result.answered
    ? `${result.hitCount} identified, ${result.missedCount} missed, ${result.decoyFalsePositiveCount + result.falsePositiveCount + result.duplicateCount} false-positive or duplicate marks`
    : "No hazards selected or marked"}</p>
  {item.mode === "visual"
    ? <VisualHazardResponseFeedback answer={answer} result={result} />
    : <NonvisualHazardResponseFeedback answer={answer} item={item} result={result} />}
  <section>
    <h4>Scene explanation and complete post-submission description</h4>
    <p>{result.postcommit.claim}</p>
    <h5>Conditions and immediate correction concepts</h5>
    {result.postcommit.fullPostAnswer.targets.length === 0
      ? <p>No condition needing correction was authored in this scene.</p>
      : <ul>{result.postcommit.fullPostAnswer.targets.map((target) => <li
        key={`${target.condition}:${target.correction}`}
      ><strong>{target.condition}.</strong> {target.correction}.</li>)}</ul>}
    <h5>Authored safe details and decoys</h5>
    <ul>
      {result.postcommit.fullPostAnswer.decoys.map((decoy) => <li
        key={`${decoy.condition}:${decoy.safeBecause}`}
      ><strong>{decoy.condition}:</strong> {decoy.safeBecause}.</li>)}
      {result.postcommit.fullPostAnswer.safeBackground.map((detail) => <li key={detail}>{detail}</li>)}
    </ul>
  </section>
  <details className="feedback-sources">
    <summary>Source receipts</summary>
    <ul>{result.postcommit.fullPostAnswer.sources.map((source) => <li key={source.id}>
      <a href={source.url} rel="external noopener">{source.title}</a>, {source.locator}. {source.scope}
    </li>)}</ul>
  </details>
  <ResultActions flagged={answer.reviewIntent === "flagged"} />
</>

export const SimulationResults = ({ controller }: { readonly controller: ResultsController }) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "results") headingRef.current?.focus()
    if (snapshot.focusRequest?.target === "error") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])
  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])
  const announcement = <p aria-live="polite" className="sr-only">{snapshot.announcementRequest?.message ?? ""}</p>

  if (snapshot.state.tag === "reconciling") {
    return <>{announcement}<section className="review-state" aria-busy="true">
      <h1>Reconciling your final submission</h1>
      <p>The final answer snapshot is already durable. Verified answer records are now being loaded to calculate practice-only results.</p>
    </section></>
  }
  if (snapshot.state.tag === "failure") {
    return <>{announcement}<section className="error-panel" role="alert">
      <h1 ref={errorRef} tabIndex={-1}>Results are not available yet</h1>
      <p>{snapshot.state.detail}</p>
      <p>Your final submission remains saved on this device. Retrying never creates a second submission.</p>
      <button className="button button-primary" onClick={controller.retry} type="button">Retry result reconciliation</button>
    </section></>
  }

  const { session, submission } = snapshot.state
  const results = submission.results ?? []
  const correct = submission.correctCount ?? 0
  const answered = submission.answers.filter((answer) =>
    answer.selectedOptionId !== null ||
    (answer.markers?.length ?? 0) > 0 ||
    (answer.selectedZoneOrders?.length ?? 0) > 0 ||
    answer.zeroHazardsConfirmed === true
  ).length
  const accuracy = session.actualLength === 0 ? 0 : Math.round((correct / session.actualLength) * 100)
  const elapsed = formatSimulationElapsed(simulationElapsedMilliseconds(session, submission))
  const resultsByQuestion = new Map(results.map((result) => [result.questionId, result]))
  const hazardResults = results.filter(
    (result) => result.kind === "hazard"
  ) as ReadonlyArray<SimulationHazardResult>
  const hazardFamilySamples = [...hazardResults.reduce((groups, result) => {
    const family = result.hazardFamily ?? "Zero-hazard control"
    const sample = groups.get(family) ?? { total: 0, correct: 0 }
    groups.set(family, {
      total: sample.total + 1,
      correct: sample.correct + (result.correct ? 1 : 0)
    })
    return groups
  }, new Map<string, { readonly total: number; readonly correct: number }>())]
    .sort(([left], [right]) => left.localeCompare(right))

  return <>
    {announcement}
    <section
      aria-labelledby="simulation-results-heading"
      className="hero simulation-results"
      data-simulation-profile-compatibility-key={session.profile.compatibilityKey}
      data-simulation-profile-id={session.profile.id}
      data-simulation-profile-version={session.profile.version}
    >
      <p className="eyebrow">Site-designed simulation result</p>
      <h1 id="simulation-results-heading" ref={headingRef} tabIndex={-1}>Raw practice accuracy: {correct} of {session.actualLength} ({accuracy}%)</h1>
      <p>{answered} answered · {session.actualLength - answered} unanswered · Elapsed time {elapsed}</p>
      <p><strong>Profile:</strong> {session.profile.label} · version {session.profile.version} · compatibility {session.profile.compatibilityKey}</p>
      <p><strong>This practice accuracy is not an official converted score or pass prediction.</strong> The item length and distribution are site-designed, not official.</p>
    </section>

    <section className="reference-card section-gap" aria-labelledby="actual-distribution-heading">
      <h2 id="actual-distribution-heading">Actual generated distribution</h2>
      <dl className="fact-list">
        {session.distribution.map((entry) => <div key={entry.label}>
          <dt>{entry.label}</dt><dd>{entry.count} item{entry.count === 1 ? "" : "s"}</dd>
        </div>)}
      </dl>
      {session.distribution.map((entry) => {
        const categoryResults = results.filter((result) => result.category === entry.label)
        const categoryCorrect = categoryResults.filter((result) => result.correct).length
        return <p key={`${entry.label}-metric`}><strong>{entry.label}:</strong> {categoryCorrect} correct of {categoryResults.length} (sample size {categoryResults.length})</p>
      })}
    </section>

    {session.format === "questions" ? null : <section className="reference-card section-gap" aria-labelledby="hazard-metrics-heading">
      <h2 id="hazard-metrics-heading">Hazard practice metrics</h2>
      <p>Visual and nonvisual metrics are reported separately and only for the {session.format === "visual-hazards" ? "visual marker" : "nonvisual zoned"} format sampled in this simulation.</p>
      <dl className="fact-list">
        <div><dt>Authored targets sampled</dt><dd>{hazardResults.reduce((total, result) => total + result.targetCount, 0)}</dd></div>
        <div><dt>Targets identified</dt><dd>{hazardResults.reduce((total, result) => total + result.hitCount, 0)}</dd></div>
        <div><dt>Targets missed</dt><dd>{hazardResults.reduce((total, result) => total + result.missedCount, 0)}</dd></div>
        <div><dt>Decoy false positives</dt><dd>{hazardResults.reduce((total, result) => total + result.decoyFalsePositiveCount, 0)}</dd></div>
        <div><dt>Other false positives</dt><dd>{hazardResults.reduce((total, result) => total + result.falsePositiveCount, 0)}</dd></div>
        <div><dt>Duplicate false positives</dt><dd>{hazardResults.reduce((total, result) => total + result.duplicateCount, 0)}</dd></div>
      </dl>
      <h3>Hazard-family samples</h3>
      <ul>{hazardFamilySamples.map(([family, sample]) => <li key={family}>
        <strong>{family}:</strong> {sample.correct} correct of {sample.total} (sample size {sample.total})
      </li>)}</ul>
    </section>}

    <section className="section-gap" aria-labelledby="question-results-heading">
      <h2 id="question-results-heading">Item results</h2>
      <nav aria-label="Item result navigation">
        <ol className="tag-list">
          {session.items.map((item) => <li key={`result-link-${simulationItemId(item)}`}>
            <a
              href={`#result-question-${item.position}`}
              onClick={(event) => {
                const href = event.currentTarget.hash
                const target = document.getElementById(href.slice(1))
                if (target === null) return
                event.preventDefault()
                window.history.pushState(null, "", href)
                target.focus()
                target.scrollIntoView({ block: "start" })
              }}
            >Review item {item.position}</a>
          </li>)}
        </ol>
      </nav>
      <ol className="result-list">
        {session.items.map((item, itemIndex) => {
          const itemId = simulationItemId(item)
          const result = resultsByQuestion.get(itemId)
          const answer = submission.answers[itemIndex]
          if ("question" in item) {
            const questionResult = result?.kind === "question" ? result : undefined
            return <li className="reference-card" key={itemId}>
              <h3 id={`result-question-${item.position}`} tabIndex={-1}>Question {item.position}: {questionResult?.correct ? "Correct" : questionResult?.selectedOptionId === null ? "Unanswered" : "Incorrect"}</h3>
              <p>{item.question.prompt}</p>
              {questionResult === undefined || answer === undefined
                ? <p role="alert">The immutable result closure for this item is unavailable.</p>
                : <QuestionResultFeedback answer={answer} item={item} result={questionResult} />}
            </li>
          }
          const hazardResult = result?.kind === "hazard" ? result : undefined
          return <li className="reference-card" key={itemId}>
            <h3 id={`result-question-${item.position}`} tabIndex={-1}>Hazard item {item.position}: {hazardResult?.correct ? "All authored targets identified without false positives" : hazardResult?.answered ? "Needs review" : "Unanswered"}</h3>
            <p>{item.scene.neutralPreAnswer.overview}</p>
            <p><strong>Format:</strong> {item.mode === "visual" ? "Visual marker task" : "Nonvisual zoned equivalent"}</p>
            <p><strong>Hazard family:</strong> {hazardResult?.hazardFamily ?? "Zero-hazard control"}</p>
            <p><strong>Targets:</strong> {hazardResult?.hitCount ?? 0} identified · {hazardResult?.missedCount ?? 0} missed · sample size {hazardResult?.targetCount ?? 0}</p>
            <p><strong>False positives:</strong> {hazardResult?.decoyFalsePositiveCount ?? 0} decoy · {hazardResult?.falsePositiveCount ?? 0} other · {hazardResult?.duplicateCount ?? 0} duplicate</p>
            {hazardResult === undefined || answer === undefined
              ? <p role="alert">The immutable result closure for this item is unavailable.</p>
              : <HazardResultFeedback answer={answer} item={item} result={hazardResult} />}
          </li>
        })}
      </ol>
    </section>
    <p className="section-gap"><a className="button button-primary" href="/simulations/">Create another simulation</a></p>
  </>
}

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
import {
  hazardFamilyLabel,
  sourceEvidenceTierLabel
} from "../../public-content-labels.ts"

type ResultsController = ReturnType<typeof createSimulationResultsController>

const QuestionEvidence = ({ result }: { readonly result: SimulationQuestionResult }) => {
  const feedback = result.postcommit
  if (feedback.schemaVersion === 1) {
    return <details className="feedback-sources">
      <summary>Where this comes from</summary>
      <p>This older saved result keeps the source-reference format published with its release.</p>
      <ul>{feedback.sources.map((source) => <li key={source.id}>
        {source.label} <code>{source.locator}</code>
      </li>)}</ul>
    </details>
  }

  return <details className="feedback-sources">
      <summary>Where this comes from</summary>
      <ul>{feedback.sources.map((source) => <li key={source.id}>
        <p><strong>{source.publisher}</strong> — {source.title} (verified <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)</p>
        <p><strong>Evidence:</strong> {sourceEvidenceTierLabel(source.evidenceTier)}</p>
        <blockquote>{source.excerpt}</blockquote>
        {source.url === undefined ? null : <p><a href={source.url} rel="external noopener">Open the source</a></p>}
        <details className="source-note">
          <summary>Technical details</summary>
          <dl>
            <div><dt>Source version</dt><dd>{source.version}</dd></div>
            <div><dt>Locator</dt><dd><code>{source.locator}</code></dd></div>
            <div><dt>Source line ID</dt><dd><code>{source.id}</code></dd></div>
            <div><dt>Source record ID</dt><dd><code>{source.sourceId}</code></dd></div>
          </dl>
        </details>
      </li>)}</ul>
    </details>
}

const ResultActions = ({ flagged }: { readonly flagged: boolean }) => (
  <section>
    <h4>Next steps</h4>
    {flagged ? <p>
      Your flag stays with this saved result. Simulation flags do not automatically enter
      your review queue.
    </p> : null}
    <nav aria-label="Review and source actions" className="question-controls">
      <a className="button button-secondary" href="/review/">Open your review queue</a>
      <a className="button button-secondary" href="/transparency/sources/">
        Browse sources
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
  const postcommit = result.postcommit
  const objectiveId = postcommit.schemaVersion === 2 ? postcommit.objectiveId : undefined
  const objectiveClaim = postcommit.schemaVersion === 2 && objectiveId !== undefined
    ? postcommit.claims.find((claim) => claim.id === objectiveId)
    : undefined
  const hasAuthoredMixUp = postcommit.schemaVersion === 2 &&
    (postcommit.tags?.confusionSetIds.length ?? 0) > 0

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
        </li>)}
      </ol>
    </section>
    {objectiveClaim === undefined ? null : <section className="feedback-claims">
      <h4>Key distinction</h4>
      <p>{objectiveClaim.text}</p>
      {objectiveClaim.caveat === null ? null : <p><strong>Scope note:</strong> {objectiveClaim.caveat}</p>}
    </section>}
    {hasAuthoredMixUp ? <section className="feedback-confusion">
      <h4>Common mix-up</h4>
      <p>{selectedId !== null && selectedId !== result.correctOptionId
        ? objectiveClaim === undefined
          ? `You chose “${optionLabel(selectedId)}.” Compare it with “${optionLabel(result.correctOptionId)}” in the answer explanations above.`
          : `You chose “${optionLabel(selectedId)}.” Compare it with “${optionLabel(result.correctOptionId)}” using the key distinction above.`
        : objectiveClaim === undefined
          ? `Compare “${optionLabel(result.correctOptionId)}” with the other answer choices in the answer explanations above.`
          : `Compare “${optionLabel(result.correctOptionId)}” with the other answer choices using the key distinction above.`}</p>
    </section> : null}
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
      ? <p role="alert">The saved scene image is unavailable.</p>
      : <AnnotatedHazardScene
          alt="The submitted hazard scene with answer outlines"
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
          {marker.kind === "hit" ? <p><strong>Hazard found.</strong> {target === undefined
            ? "This marker matches a condition that needs correction."
            : `${target.condition}. How to correct it: ${target.correction}.`}</p>
            : marker.kind === "duplicate" ? <p><strong>Already marked.</strong> {target === undefined
              ? "Another marker already covers this hazard."
              : `Another marker already covers ${target.condition}.`}</p>
              : marker.kind === "decoy_false_positive" ? <p><strong>Safe as shown.</strong> {decoy === undefined
                ? "The detail you marked is safe as depicted in this scene."
                : `${decoy.condition}; ${decoy.safeBecause}.`}</p>
                : <p>This mark does not match a recorded condition. It counts as an extra mark, but the site cannot say what that object means.</p>}
        </li>
      })}
    </ol>}
    {assessment.missedInventoryIds.length === 0
      ? <p>No hazard was left unmarked.</p>
      : <><h5>Hazards you missed</h5><ul>
        {assessment.missedInventoryIds.map((inventoryId) => {
          const target = result.postcommit.targets.find((candidate) => candidate.id === inventoryId)
          return target === undefined ? null : <li key={inventoryId}>
            {target.condition}. How to correct it: {target.correction}.
          </li>
        })}
      </ul></>}
  </section>
}

const NonvisualHazardResponseFeedback = ({
  answer,
  item
}: {
  readonly answer: SimulationSubmittedAnswer
  readonly item: SimulationHazardSessionItem
}) => {
  const selected = new Set(answer.selectedZoneOrders ?? [])
  return <section>
    <h4>Zone feedback</h4>
    <p>This text version covers the same knowledge, but it is not the same task as finding hazards on the image.</p>
    <ol>{item.scene.neutralPreAnswer.zones.map((zone) => <li key={zone.order}>
      <h5>Zone {zone.order}: {zone.label}</h5>
      <p>{selected.has(zone.order) ? "You selected this zone." : "You did not select this zone."}</p>
    </li>)}</ol>
  </section>
}

const NonvisualHazardPostcommitEquivalent = ({
  result
}: {
  readonly result: SimulationHazardResult
}) => <section>
  <h4>Full scene description by zone</h4>
  <p>This covers the same knowledge in text form; it is not the same task as marking the image.</p>
  <ul>{result.postcommit.nonvisualZonedEquivalent.map((statement) => <li
    key={`${statement.zone}:${statement.role}:${statement.statement}`}
  >
    <strong>{statement.zone} — {hazardRoleLabel(statement.role)}:</strong> {statement.statement}
  </li>)}</ul>
</section>

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
    ? `${result.hitCount} found, ${result.missedCount} missed, ${result.decoyFalsePositiveCount + result.falsePositiveCount + result.duplicateCount} extra or repeated marks`
    : "No hazards selected or marked"}</p>
  {item.mode === "visual"
    ? <VisualHazardResponseFeedback answer={answer} result={result} />
    : <NonvisualHazardResponseFeedback answer={answer} item={item} />}
  <details className="feedback-sources">
    <summary>Where this comes from</summary>
    <ul>{result.postcommit.fullPostAnswer.sources.map((source) => <li key={source.id}>
      <a href={source.url} rel="external noopener">{source.title}</a>, {source.locator}. {source.scope}
    </li>)}</ul>
  </details>
  <section>
    <h4>Scene explanation and full post-submission description</h4>
    <p>{result.postcommit.claim}</p>
    <h5>Hazards and how to correct them</h5>
    {result.postcommit.fullPostAnswer.targets.length === 0
      ? <p>This scene contains no hazard that needs correction.</p>
      : <ul>{result.postcommit.fullPostAnswer.targets.map((target) => <li
        key={`${target.condition}:${target.correction}`}
      ><strong>{target.condition}.</strong> {target.correction}.</li>)}</ul>}
    <h5>Details that are safe as shown</h5>
    <ul>
      {result.postcommit.fullPostAnswer.decoys.map((decoy) => <li
        key={`${decoy.condition}:${decoy.safeBecause}`}
      ><strong>{decoy.condition}:</strong> {decoy.safeBecause}.</li>)}
      {result.postcommit.fullPostAnswer.safeBackground.map((detail) => <li key={detail}>{detail}</li>)}
    </ul>
  </section>
  {item.mode === "nonvisual" ? <NonvisualHazardPostcommitEquivalent result={result} /> : null}
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
      <h1>Checking your final submission</h1>
      <p>Checking this device for a saved final submission. If one is found, its answer records will be used to calculate practice-only results.</p>
    </section></>
  }
  if (snapshot.state.tag === "failure") {
    return <>{announcement}<section className="error-panel" role="alert">
      <h1 ref={errorRef} tabIndex={-1}>Results are not available yet</h1>
      <p>{snapshot.state.detail}</p>
      <p>Retry only checks for a saved final submission; it does not create or resubmit one.</p>
      <button className="button button-primary" onClick={controller.retry} type="button">Retry loading results</button>
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
    const family = hazardFamilyLabel(result.hazardFamily)
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
      <p className="eyebrow">Practice simulation result</p>
      <h1 id="simulation-results-heading" ref={headingRef} tabIndex={-1}>Practice accuracy: {correct} of {session.actualLength} ({accuracy}%)</h1>
      <p>{answered} answered · {session.actualLength - answered} unanswered · Elapsed time {elapsed}</p>
      <p><strong>Profile:</strong> {session.profile.label}</p>
      <p><strong>This practice accuracy is not an official converted score or a pass prediction.</strong> The set length and mix are a site-designed distribution, not official exam counts.</p>
      <details className="source-note"><summary>Technical details</summary><p>Profile version {session.profile.version} · compatibility key <code>{session.profile.compatibilityKey}</code></p></details>
    </section>

    <section className="reference-card section-gap" aria-labelledby="actual-distribution-heading">
      <h2 id="actual-distribution-heading">What this set contained</h2>
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
      <p>Visual and keyboard hazard results are tracked separately; these numbers cover only the {session.format === "visual-hazards" ? "visual marker" : "keyboard zone"} format in this simulation.</p>
      <dl className="fact-list">
        <div><dt>Hazards in this set</dt><dd>{hazardResults.reduce((total, result) => total + result.targetCount, 0)}</dd></div>
        <div><dt>Hazards found</dt><dd>{hazardResults.reduce((total, result) => total + result.hitCount, 0)}</dd></div>
        <div><dt>Hazards missed</dt><dd>{hazardResults.reduce((total, result) => total + result.missedCount, 0)}</dd></div>
        <div><dt>Safe details marked as hazards</dt><dd>{hazardResults.reduce((total, result) => total + result.decoyFalsePositiveCount, 0)}</dd></div>
        <div><dt>Marks matching nothing in the scene</dt><dd>{hazardResults.reduce((total, result) => total + result.falsePositiveCount, 0)}</dd></div>
        <div><dt>Repeated marks on the same hazard</dt><dd>{hazardResults.reduce((total, result) => total + result.duplicateCount, 0)}</dd></div>
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
                ? <p role="alert">The saved result for this item is unavailable.</p>
                : <QuestionResultFeedback answer={answer} item={item} result={questionResult} />}
            </li>
          }
          const hazardResult = result?.kind === "hazard" ? result : undefined
          return <li className="reference-card" key={itemId}>
            <h3 id={`result-question-${item.position}`} tabIndex={-1}>Hazard item {item.position}: {hazardResult?.correct ? "Found every hazard with no extra marks" : hazardResult?.answered ? "Needs review" : "Unanswered"}</h3>
            <p>{item.scene.neutralPreAnswer.overview}</p>
            <p><strong>Format:</strong> {item.mode === "visual" ? "Visual marker task" : "Keyboard zone task"}</p>
            <p><strong>Hazard category:</strong> {hazardFamilyLabel(hazardResult?.hazardFamily ?? null)}</p>
            <p><strong>Hazards:</strong> {hazardResult?.hitCount ?? 0} found · {hazardResult?.missedCount ?? 0} missed · {hazardResult?.targetCount ?? 0} in this scene</p>
            <p><strong>Extra marks:</strong> {hazardResult?.decoyFalsePositiveCount ?? 0} on safe details · {hazardResult?.falsePositiveCount ?? 0} matching nothing · {hazardResult?.duplicateCount ?? 0} repeated</p>
            {hazardResult === undefined || answer === undefined
              ? <p role="alert">The saved result for this item is unavailable.</p>
              : <HazardResultFeedback answer={answer} item={item} result={hazardResult} />}
          </li>
        })}
      </ol>
    </section>
    <p className="section-gap"><a className="button button-primary" href="/simulations/">Create another simulation</a></p>
  </>
}

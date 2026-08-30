import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { sourceEvidenceTierLabel } from "../../public-content-labels.ts"
import type { PrintPreviewController, PrintPreviewState } from "../controller.ts"
import type {
  PrintJobRecord,
  PrintSceneAnswerV2,
  ReleasedPrintPacketSection
} from "../model.ts"

const sourceTechnicalDetails = (source: {
  readonly id: string
  readonly locator: string
  readonly sourceId: string
  readonly version: string
}) => (
  <details className="source-note">
    <summary>Technical details</summary>
    <dl>
      <div><dt>Source version</dt><dd>{source.version}</dd></div>
      <div><dt>Locator</dt><dd><code>{source.locator}</code></dd></div>
      <div><dt>Source line ID</dt><dd><code>{source.id}</code></dd></div>
      <div><dt>Source record ID</dt><dd><code>{source.sourceId}</code></dd></div>
    </dl>
  </details>
)

const printRoleLabel = (role: string): string =>
  role === "target"
    ? "Condition needing correction"
    : role === "decoy"
      ? "Safe detail that may look suspicious"
      : role === "safe-background"
        ? "Safe background detail"
        : role

const claimText = (
  answer: PrintSceneAnswerV2,
  claimId: string
): string => answer.claims.find((claim) => claim.id === claimId)?.text ??
  "The reviewed explanation is unavailable."

const CurrentHazardFeedback = ({
  answer,
  includeSources
}: {
  readonly answer: PrintSceneAnswerV2
  readonly includeSources: boolean
}) => (
  <>
    <p><strong>Scene classification:</strong> {answer.kind === "zero-hazard"
      ? "No condition needing correction is depicted."
      : `${answer.hazardFamily ?? "Hazard"} condition depicted.`}</p>
    <p><strong>Scene tags:</strong> {[
      answer.tags.domain,
      answer.tags.family,
      answer.tags.environment,
      answer.tags.hazardCategory,
      answer.tags.seriesScope,
      answer.tags.editorialDifficulty
    ].filter((value): value is string => value !== null).join("; ")}</p>
    <h4>Conditions needing correction</h4>
    {answer.targets.length === 0
      ? <p>None. This is a reviewed zero-hazard control scene.</p>
      : <ol>{answer.targets.map((target) => <li key={target.id}>
        <p><strong>Observed:</strong> {target.observableCondition}</p>
        <p><strong>Why unsafe:</strong> {claimText(answer, target.whyUnsafeClaimId)}</p>
        <p><strong>Likely consequence:</strong> {claimText(answer, target.likelyConsequenceClaimId)}</p>
        <p><strong>Immediate correction:</strong> {claimText(answer, target.immediateCorrectionClaimId)}</p>
        <p><strong>Concepts:</strong> {target.conceptIds.join("; ")}. <strong>Correction category:</strong> {target.correctionCategory}.</p>
      </li>)}</ol>}
    <h4>Details that are safe as shown</h4>
    <ul>{answer.decoys.map((decoy) => <li key={decoy.id}>
      <p><strong>Observed:</strong> {decoy.observableCondition}</p>
      <p><strong>Why it may look suspicious:</strong> {decoy.suspiciousBecause}</p>
      <p><strong>Why safe as depicted:</strong> {claimText(answer, decoy.safeAsDepictedClaimId)}</p>
      <p><strong>Condition that would make it unsafe:</strong> {claimText(answer, decoy.unsafeIfClaimId)}</p>
      <p><strong>Concepts:</strong> {decoy.conceptIds.join("; ")}.</p>
    </li>)}</ul>
    {answer.safeBackground.length === 0 ? null : <>
      <h4>Safe background details</h4>
      <ul>{answer.safeBackground.map((detail, index) => <li key={`${detail.zone}-${index}`}>
        <strong>{detail.zone}:</strong> {detail.observableCondition}
      </li>)}</ul>
    </>}
    <h4>Evidence claims</h4>
    <ul>{answer.claims.map((claim) => <li key={claim.id}>
      {claim.text} <span>(Evidence: {sourceEvidenceTierLabel(claim.evidenceTier)})</span>
      {claim.caveat === null ? null : <> <strong>Caveat:</strong> {claim.caveat}</>}
    </li>)}</ul>
    {!includeSources ? null : <>
      <h4>Where this comes from</h4>
      <ul>{answer.sources.map((source) => <li key={source.id}>
        <p><strong>{source.publisher}</strong> — {source.title} (verified <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)</p>
        <p><strong>Evidence:</strong> {sourceEvidenceTierLabel(source.evidenceTier)}</p>
        <blockquote><p>{source.excerpt}</p></blockquote>
        {source.scope === undefined ? null : <p><strong>Scope:</strong> {source.scope}</p>}
        {source.url === undefined ? null : <p><a href={source.url} rel="external noopener">Open the source</a></p>}
        {sourceTechnicalDetails(source)}
      </li>)}</ul>
    </>}
  </>
)

const announcementFactStateLabel = (
  state: "verified" | "not_published" | "unverified" | "conflicting" | "superseded" | "not_applicable"
): string => {
  switch (state) {
    case "verified": return "Verified"
    case "not_published": return "Not published"
    case "unverified": return "Unverified"
    case "conflicting": return "Conflicting published information"
    case "superseded": return "Superseded"
    case "not_applicable": return "Not applicable"
  }
}

const announcementFactCategoryLabel = (
  category: "filing_period" | "exam_date" | "fee" | "jurisdictions" | "qualifications" |
    "subjects" | "medium" | "counts" | "weights" | "scoring" | "review" |
    "form_identity" | "seniority_credit" | "preparer_identity" | "administration_status"
): string => {
  switch (category) {
    case "filing_period": return "Filing period"
    case "exam_date": return "Exam date"
    case "fee": return "Fee"
    case "jurisdictions": return "Jurisdictions"
    case "qualifications": return "Qualifications"
    case "subjects": return "Subjects"
    case "medium": return "Exam format"
    case "counts": return "Counts"
    case "weights": return "Weights"
    case "scoring": return "Scoring"
    case "review": return "Review process"
    case "form_identity": return "Exam form"
    case "seniority_credit": return "Seniority credit"
    case "preparer_identity": return "Exam preparer"
    case "administration_status": return "Administration status"
  }
}

const packetSection = (
  section: ReleasedPrintPacketSection,
  includeSources: boolean
) => {
  switch (section.tag) {
    case "answer-sheet":
      return (
        <section className="print-section print-answer-sheet" aria-labelledby="answer-sheet-heading">
          <h2 id="answer-sheet-heading">Blank answer sheet</h2>
          <table>
            <thead><tr><th scope="col">Question</th>{section.optionLabels.map((label) => <th scope="col" key={label}>Choice {label}</th>)}</tr></thead>
            <tbody>{section.questionNumbers.map((number) => <tr key={number}><th scope="row">Question {number}</th>{section.optionLabels.map((label) => <td key={label}><span aria-hidden="true" className="answer-mark">○</span><span className="sr-only">Mark choice {label}</span></td>)}</tr>)}</tbody>
          </table>
        </section>
      )
    case "questions":
      return (
        <section className="print-section print-question-section" aria-labelledby="question-packet-heading">
          <h2 id="question-packet-heading">Questions</h2>
          <ol className="print-question-list">
            {section.questions.map((question) => (
              <li key={question.id} className="print-question">
                <p>{question.prompt}</p>
                <ol className="print-option-list">
                  {question.options.map((option) => <li key={option.label} data-option-label={option.label}>{option.text}</li>)}
                </ol>
              </li>
            ))}
          </ol>
        </section>
      )
    case "answer-key":
      return (
        <section className="print-section print-answer-key" aria-labelledby="answer-key-heading">
          <h2 id="answer-key-heading">Answer key</h2>
          <table><thead><tr><th scope="col">Question</th><th scope="col">Correct choice</th></tr></thead><tbody>{section.answers.map((answer) => <tr key={answer.number}><th scope="row">{answer.number}</th><td>{answer.optionLabel}</td></tr>)}</tbody></table>
        </section>
      )
    case "explanations":
      return (
        <section className="print-section print-explanations" aria-labelledby="explanations-heading">
          <h2 id="explanations-heading">Explanations and source references</h2>
          {section.explanations.map((explanation) => (
            <article className="print-explanation" key={explanation.number}>
              <h3>Question {explanation.number}: choice {explanation.correctOptionLabel}</h3>
              <dl>{explanation.rationales.map((rationale) => <div key={rationale.optionLabel}>
                <dt>Choice {rationale.optionLabel}</dt><dd>{rationale.message}</dd>
              </div>)}</dl>
              {"claims" in explanation ? <><h4>Supported claims</h4><ul>{explanation.claims.map((claim) => <li key={claim.id}>
                {claim.text} <span>(Evidence: {sourceEvidenceTierLabel(claim.evidenceTier)})</span>
                {claim.caveat === null ? null : <> <strong>Caveat:</strong> {claim.caveat}</>}
              </li>)}</ul></> : null}
              {explanation.sources.length > 0 ? <><h4>{"claims" in explanation ? "Where this comes from" : "Source references"}</h4><ul>{explanation.sources.map((source) => <li key={source.id}>
                {"title" in source
                  ? <>
                    <p><strong>{source.publisher}</strong> — {source.title} (verified <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)</p>
                    <p><strong>Evidence:</strong> {sourceEvidenceTierLabel(source.evidenceTier)}</p>
                    <blockquote><p>{source.excerpt}</p></blockquote>
                    {source.url === undefined ? null : <p><a href={source.url} rel="external noopener">Open the source</a></p>}
                    {sourceTechnicalDetails(source)}
                  </>
                  : <>{source.label} — {source.locator}</>}
              </li>)}</ul></> : null}
            </article>
          ))}
        </section>
      )
    case "tool-family-cards":
      return (
        <section className="print-section print-tool-cards" aria-labelledby="tool-cards-heading">
          <h2 id="tool-cards-heading">Tool-family contrast cards</h2>
          {section.families.map((family) => (
            <article className="print-family-card" key={family.family}>
              <h3>{family.family}</h3>
              <div className="print-tool-grid">
                {family.tools.map((tool) => <section key={tool.id}>
                  <h4>{tool.canonicalTerm}</h4>
                  {tool.asset === null ? null : <img src={tool.asset.dataUrl} alt={tool.neutralDescription} />}
                  <p><strong>Supported use:</strong> {tool.useSummary}</p>
                  <p><strong>Decisive recognition cues:</strong> {tool.distinguishingFeatures.join("; ")}</p>
                </section>)}
              </div>
            </article>
          ))}
        </section>
      )
    case "hazard-worksheet":
      return (
        <section className="print-section print-hazard-worksheet" aria-labelledby="hazard-worksheet-heading">
          <h2 id="hazard-worksheet-heading">Blank hazard worksheet</h2>
          {section.scenes.map((scene, index) => <article className="print-hazard-page" key={scene.id}>
            <h3>Scene {index + 1}: {scene.environment}</h3>
            {scene.asset === null ? null : <img src={scene.asset.dataUrl} alt={scene.neutralOverview} />}
            <p>{scene.neutralOverview}</p>
            <ol>{scene.neutralZones.map((zone) => <li key={zone.order}><strong>{zone.label}:</strong> {zone.description}</li>)}</ol>
            <div className="print-response-space" aria-label={`Blank response space for scene ${index + 1}`}>
              <p>Conditions needing correction and proposed controls:</p>
              <span></span><span></span><span></span>
            </div>
          </article>)}
        </section>
      )
    case "annotated-hazard-answers":
      return (
        <section className="print-section print-hazard-answers" aria-labelledby="hazard-answers-heading">
          <h2 id="hazard-answers-heading">Annotated hazard-answer packet</h2>
          {section.scenes.map((scene, index) => {
            const current = "schemaVersion" in scene.answer
            const regions = current
              ? scene.answer.targets.map((region) => ({ key: region.id, polygons: region.polygons }))
              : scene.answer.targetRegions.map((region) => ({ key: region.inventoryId, polygons: region.polygons }))
            return <article className="print-hazard-page" key={scene.id}>
              <h3>Scene {index + 1}: {scene.environment}</h3>
              {scene.asset === null ? null : <figure className="print-annotated-scene">
                <img src={scene.asset.dataUrl} alt={`${scene.environment} scene with answer outlines`} />
                <svg aria-label="Hazard-region outlines" preserveAspectRatio="none" role="img" viewBox="0 0 100 100">
                  {regions.flatMap((region, regionIndex) =>
                    region.polygons.map((polygon, polygonIndex) => <polygon
                      key={`${region.key}-${polygonIndex}`}
                      points={polygon.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
                      vectorEffect="non-scaling-stroke"
                    ><title>{`Hazard region ${regionIndex + 1}`}</title></polygon>)
                  )}
                </svg>
              </figure>}
              {current
                ? <CurrentHazardFeedback answer={scene.answer} includeSources={includeSources} />
                : <>
                  <p><strong>Scene explanation:</strong> {scene.answer.claim}</p>
                  <ol>{scene.answer.targets.map((target) => <li key={target.id}><strong>{target.condition}</strong> — {target.correction}</li>)}</ol>
                  <h4>Details that are safe as shown</h4>
                  <ul>{scene.answer.decoys.map((decoy) => <li key={decoy.id}>{decoy.condition}: {decoy.safeBecause}</li>)}</ul>
                  {scene.answer.sourceReferences.length === 0 ? null : <><h4>Source references</h4><ul>{scene.answer.sourceReferences.map((source) => <li key={source.id}>{source.label} — {source.locator}</li>)}</ul></>}
                </>}
            </article>
          })}
        </section>
      )
    case "text-equivalent-scenes":
      return (
        <section className="print-section print-text-equivalent" aria-labelledby="text-equivalent-heading">
          <h2 id="text-equivalent-heading">Text-equivalent/nonvisual hazard set</h2>
          <p>This text version covers the same knowledge; it is not the same task as marking the image.</p>
          {section.scenes.map((scene, index) => <article className="print-hazard-page" key={scene.id}>
            <h3>Scene {index + 1}: {scene.environment}</h3>
            {"schemaVersion" in scene.answer
              ? <>
                <ol>
                  {scene.answer.targets.map((target) => <li key={target.id}><strong>{target.zone} · Condition needing correction:</strong> {target.observableCondition}</li>)}
                  {scene.answer.decoys.map((decoy) => <li key={decoy.id}><strong>{decoy.zone} · Safe detail that may look suspicious:</strong> {decoy.observableCondition}</li>)}
                  {scene.answer.safeBackground.map((detail, detailIndex) => <li key={`${detail.zone}-${detailIndex}`}><strong>{detail.zone} · Safe background detail:</strong> {detail.observableCondition}</li>)}
                </ol>
                <CurrentHazardFeedback answer={scene.answer} includeSources={includeSources} />
              </>
              : <>
                <p><strong>Scene explanation:</strong> {scene.answer.claim}</p>
                <ol>{scene.answer.nonvisualStatements.map((statement, statementIndex) => <li key={`${statement.zone}-${statementIndex}`}><strong>{statement.zone} · {printRoleLabel(statement.role)}:</strong> {statement.statement}</li>)}</ol>
                {scene.answer.sourceReferences.length === 0 ? null : <><h4>Source references</h4><ul>{scene.answer.sourceReferences.map((source) => <li key={source.id}>{source.label} — {source.locator}</li>)}</ul></>}
              </>}
          </article>)}
        </section>
      )
    case "announcement-profile-fact-sheet": {
      const factSheet = section.factSheet
      if (factSheet.schemaVersion === 1) {
        return (
          <section className="print-section print-profile-fact-sheet" aria-labelledby="profile-fact-sheet-heading">
            <h2 id="profile-fact-sheet-heading">Announcement-profile fact sheet</h2>
            <p><strong>{section.profileLabel}</strong> — {section.jurisdiction}</p>
            <p>Historical fact sheet; last reviewed {factSheet.lastReviewedOn}.</p>
            <details className="source-note">
              <summary>Technical details</summary>
              <p>Fact-sheet version {factSheet.version}.</p>
            </details>
            <p>{factSheet.controllingDocumentNotice}</p>
            <p>{factSheet.seriesScopeDisclaimer}</p>
            <h3>Verified facts</h3>
            <dl>{factSheet.verifiedFacts.map((fact) => <div key={fact.id}>
              <dt>{fact.label}</dt><dd>{fact.value}</dd>
              <dd><strong>Sources:</strong> {fact.sourceReferences.map((source) => `${source.label} — ${source.locator}`).join("; ")}</dd>
            </div>)}</dl>
            <h3>Explicit unknowns</h3>
            <dl>{factSheet.explicitUnknowns.map((fact) => <div key={fact.id}>
              <dt>{fact.label}</dt><dd>{fact.detail}</dd>
              <dd><strong>Sources:</strong> {fact.sourceReferences.map((source) => `${source.label} — ${source.locator}`).join("; ")}</dd>
            </div>)}</dl>
            <h3>Change history</h3>
            <ol>{factSheet.changeHistory.map((change) => <li key={`${change.version}-${change.changedOn}`}>
              Version {change.version}, {change.changedOn}: {change.summary}<br />
              <strong>Sources:</strong> {change.sourceReferences.map((source) => `${source.label} — ${source.locator}`).join("; ")}
            </li>)}</ol>
          </section>
        )
      }
      const sourceLineById = new Map(
        factSheet.sourceLines.map((sourceLine) => [sourceLine.id, sourceLine] as const)
      )
      const receipts = (sourceLineIds: ReadonlyArray<string>) => (
        <ul>{sourceLineIds.map((sourceLineId) => {
          const source = sourceLineById.get(sourceLineId)
          if (source === undefined) return <li key={sourceLineId}>Source information is unavailable.</li>
          return <li key={source.id}>
            <p><strong>{source.publisher}</strong> — {source.title} (verified <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)</p>
            <p><strong>Evidence:</strong> {sourceEvidenceTierLabel(source.evidenceTier)}</p>
            <blockquote><p>{source.excerpt}</p></blockquote>
            <p>Language: {source.language === "en" ? "English" : "Spanish"}. Rights: {source.rightsNotes}.</p>
            {source.url === undefined ? null : <p><a href={source.url} rel="external noopener">Open the source</a></p>}
            {sourceTechnicalDetails(source)}
          </li>
        })}</ul>
      )
      return (
        <section className="print-section print-profile-fact-sheet" aria-labelledby="profile-fact-sheet-heading">
          <h2 id="profile-fact-sheet-heading">Announcement-profile fact sheet</h2>
          <p><strong>{section.profileLabel}</strong> — {section.jurisdiction}</p>
          <p>Last reviewed {factSheet.lastReviewedOn}.</p>
          <details className="source-note">
            <summary>Technical details</summary>
            <p>Fact-sheet version {factSheet.version}.</p>
          </details>
          <p>{factSheet.controllingDocumentNotice}</p>
          <p>{factSheet.seriesScopeDisclaimer}</p>
          <h3>Facts by explicit publication state</h3>
          {factSheet.facts.map((fact) => <article key={fact.id} data-fact-state={fact.state}>
            <h4>{fact.label}</h4>
            <p><strong>Status:</strong> {announcementFactStateLabel(fact.state)}. <strong>Category:</strong> {announcementFactCategoryLabel(fact.category)}.</p>
            {fact.value === null ? null : <p><strong>Recorded value:</strong> {fact.value}</p>}
            {fact.detail === null ? null : <p><strong>Detail:</strong> {fact.detail}</p>}
            <p><strong>Applies to exam numbers:</strong> {fact.appliesToExamNumbers.join(", ")}. <strong>Reviewed:</strong> {fact.reviewedOn}.</p>
            <p><strong>Effective interval:</strong> {fact.effectiveFrom === null
              ? "none asserted"
              : `${fact.effectiveFrom} through ${fact.effectiveThrough ?? "current"}`}.</p>
            {fact.supersededByFactId === null ? null : <details className="source-note">
              <summary>Technical details</summary>
              <p><strong>Superseded by fact:</strong> <code>{fact.supersededByFactId}</code></p>
            </details>}
            {fact.conflictingValues.length === 0 ? null : <><h5>Published conflicting values</h5><ol>{fact.conflictingValues.map((candidate) => <li key={candidate.value}>
              <strong>{candidate.value}</strong>{receipts(candidate.sourceLineIds)}
            </li>)}</ol></>}
            {fact.sourceLineIds.length === 0 ? null : <><h5>Where this fact comes from</h5>{receipts(fact.sourceLineIds)}</>}
          </article>)}
          <h3>Change history</h3>
          <ol>{factSheet.changeHistory.map((change) => <li key={`${change.version}-${change.changedOn}`}>
            Version {change.version}, {change.changedOn}: {change.summary}
            {receipts(change.sourceLineIds)}
          </li>)}</ol>
        </section>
      )
    }
    case "correction-change-log-excerpt":
      return (
        <section className="print-section print-correction-excerpt" aria-labelledby="correction-excerpt-heading">
          <h2 id="correction-excerpt-heading">Correction and change-log excerpt</h2>
          {section.corrections.map((correction) => <article key={correction.id}>
            <h3>{correction.effectiveDate}</h3>
            <p>{correction.summary}</p>
            <p><strong>Sources:</strong> {correction.sourceReferences.map((source) => `${source.label} — ${source.locator}`).join("; ")}</p>
          </article>)}
        </section>
      )
  }
}

const readyJob = (state: PrintPreviewState): PrintJobRecord | undefined =>
  state.tag === "preview-ready" || state.tag === "stale" ||
  state.tag === "system-print-requested" || state.tag === "regenerating" ||
    state.tag === "regenerate-error" || state.tag === "request-print-error"
    ? state.job
    : undefined

export const PrintPreview = ({ controller }: { readonly controller: PrintPreviewController }) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const printDetailsState = useRef<ReadonlyArray<readonly [HTMLDetailsElement, boolean]> | null>(null)
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false)
  const job = readyJob(snapshot.state)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "preview-heading") headingRef.current?.focus()
    if (snapshot.focusRequest?.target === "error-summary") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeViewRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])

  useEffect(() => {
    const printMedia = window.matchMedia("print")
    const expandTechnicalDetails = (): void => {
      if (printDetailsState.current !== null) return
      const details = [...(previewRef.current?.querySelectorAll("details") ?? [])]
      printDetailsState.current = details.map((detail) => [detail, detail.open] as const)
      for (const detail of details) detail.open = true
    }
    const restoreTechnicalDetails = (): void => {
      const previous = printDetailsState.current
      if (previous === null) return
      for (const [detail, wasOpen] of previous) {
        if (detail.isConnected) detail.open = wasOpen
      }
      printDetailsState.current = null
    }
    const handlePrintMediaChange = (event: MediaQueryListEvent): void => {
      if (event.matches) expandTechnicalDetails()
      else restoreTechnicalDetails()
    }

    printMedia.addEventListener("change", handlePrintMediaChange)
    window.addEventListener("beforeprint", expandTechnicalDetails)
    window.addEventListener("afterprint", restoreTechnicalDetails)
    if (printMedia.matches) expandTechnicalDetails()

    return () => {
      printMedia.removeEventListener("change", handlePrintMediaChange)
      window.removeEventListener("beforeprint", expandTechnicalDetails)
      window.removeEventListener("afterprint", restoreTechnicalDetails)
      restoreTechnicalDetails()
    }
  }, [job?.id])
  const announcement = <p aria-live="polite" className="sr-only">{snapshot.announcementRequest?.message ?? ""}</p>

  if (snapshot.state.tag === "restoring") return <>{announcement}<p role="status">Restoring the saved print preview…</p></>
  if (snapshot.state.tag === "content-unavailable" || snapshot.state.tag === "recoverable-error") {
    return (
      <>{announcement}<section className="status-panel status-panel-danger" role="alert">
        <h1 ref={errorRef} tabIndex={-1}>Print preview unavailable</h1>
        <p>{snapshot.state.detail}</p>
        <p><a href="/print/">Return to the print center</a></p>
        {snapshot.state.tag === "recoverable-error" ? <button className="button" type="button" onClick={controller.retryRestore}>Retry</button> : null}
      </section></>
    )
  }
  if (job === undefined) return null

  const manifest = job.manifest
  return (
    <article
      className={`print-preview print-${manifest.settings.paper} print-margin-${manifest.settings.margin} print-size-${manifest.settings.printSize}${manifest.settings.grayscalePreview ? " print-grayscale" : ""}`}
      data-print-fingerprint={manifest.fingerprint}
      data-print-pairing-fingerprint={manifest.pairingFingerprint ?? undefined}
      ref={previewRef}
    >
      {announcement}
      <header className="print-preview-header">
        <p className="eyebrow">Saved print preview</p>
        <h1 ref={headingRef} tabIndex={-1}>{job.packet.title}</h1>
        <p className="print-original-statement"><strong>{job.packet.statement}</strong></p>
        <dl className="print-manifest-summary">
          <div><dt>Profile</dt><dd>{manifest.profile.label}</dd></div>
          <div><dt>Actual length</dt><dd>{manifest.actualLength}</dd></div>
          <div><dt>Distribution</dt><dd>Site-designed distribution: {manifest.actualDistribution.map((entry) => `${entry.label} ${entry.count}`).join(", ")}</dd></div>
          <div><dt>Estimated page count</dt><dd>{manifest.pageCount}</dd></div>
        </dl>
        <details className="source-note print-manifest-technical">
          <summary>Technical details</summary>
          <dl className="print-manifest-summary">
            <div><dt>Profile version</dt><dd>{manifest.profile.version}</dd></div>
            <div><dt>Content release</dt><dd><code>{manifest.releaseId}</code> · version {manifest.contentVersion}</dd></div>
            {manifest.pairingFingerprint === null ? null : <div><dt>Set pairing identifier</dt><dd><code>{manifest.pairingFingerprint}</code></dd></div>}
            <div><dt>Manifest fingerprint</dt><dd><code>{manifest.fingerprint}</code></dd></div>
          </dl>
        </details>
      </header>

      {job.status === "stale" ? <p className="status-panel status-panel-warning">This job references corrected or removed content. Regenerate it before printing.</p> : null}
      {snapshot.state.tag === "regenerating" ? <p className="status-panel" role="status">Regenerating this packet from the saved settings…</p> : null}
      {snapshot.state.tag === "regenerate-error" ? <section
        aria-labelledby="print-regenerate-error-heading"
        className="status-panel status-panel-danger"
        role="alert"
      >
        <h2 id="print-regenerate-error-heading" ref={errorRef} tabIndex={-1}>Print preview was not regenerated</h2>
        <p>{snapshot.state.detail}</p>
        <p>The previous saved preview remains available at this address.</p>
      </section> : null}
      {snapshot.state.tag === "request-print-error" ? <section
        aria-labelledby="print-request-error-heading"
        className="status-panel status-panel-danger"
        role="alert"
      >
        <h2 id="print-request-error-heading" ref={errorRef} tabIndex={-1}>System print did not open</h2>
        <p>{snapshot.state.detail}</p>
      </section> : null}
      {job.packet.warnings.map((warning) => <p className="print-warning" key={warning}>{warning}</p>)}
      {job.packet.sections.map((section, index) => <div
        className={index === 0 ? undefined : "print-appended-section"}
        key={section.tag}
      >{packetSection(section, manifest.settings.includeSources)}</div>)}

      <footer className="print-preview-actions screen-only">
        <p>System print and browser “Save as PDF” are the output path. Opening the dialog does not confirm that printing occurred.</p>
        <label>
          <input
            type="checkbox"
            checked={inspectionConfirmed}
            onChange={(event) => setInspectionConfirmed(event.target.checked)}
          /> I inspected browser print preview for clipping, page breaks, grayscale readability, source readability, and product separation.
        </label>
        <button
          className="button button-secondary"
          disabled={snapshot.state.tag === "regenerating"}
          onClick={controller.regenerate}
          type="button"
        >{snapshot.state.tag === "regenerating" ? "Regenerating…" : "Regenerate this packet"}</button>{" "}
        <button
          className="button"
          disabled={job.status === "stale" || snapshot.state.tag === "regenerating" || snapshot.state.tag === "regenerate-error" || !inspectionConfirmed}
          onClick={controller.requestSystemPrint}
          type="button"
        >Open system print</button>
        <p className="status-text" role="status" aria-live="polite">{snapshot.state.tag === "system-print-requested" ? "System print was requested; completion is not confirmed." : ""}</p>
      </footer>
    </article>
  )
}

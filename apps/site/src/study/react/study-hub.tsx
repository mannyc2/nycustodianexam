import { useEffect, useRef } from "react"
import { PracticeSessionSetup } from "../../practice/react/builder.tsx"
import { ActivityHistory } from "./history.tsx"
import { useStudy } from "./provider.tsx"

const studyIconPaths = {
  practice: <><path d="M7 3h10v18H7z" /><path d="M10 7h4M10 11h4M10 15h2" /></>,
  hazard: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  simulation: <><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2M9 2h6M12 2v3" /></>,
  print: <><path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6z" /><path d="M17 12h1" /></>,
  library: <><path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15" /></>
} as const

const StudyIcon = ({ kind }: { readonly kind: keyof typeof studyIconPaths }) =>
  <svg className="study-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{studyIconPaths[kind]}</svg>

export const StudyPresets = () => {
  const { state: { bootstrap } } = useStudy()
  const sets = bootstrap.practiceSets ?? (bootstrap.firstPractice === null ? [] : [bootstrap.firstPractice])
  return <section className="study-section" id="practice-sets" tabIndex={-1} aria-labelledby="practice-sets-heading">
    <div className="section-header"><h2 id="practice-sets-heading">Choose a practice set</h2><p>Get explanations after each answer, or save feedback until the end with a simulation.</p></div>
    <ul className="practice-preset-grid study-set-options" aria-label="Practice activities">
      {sets.map(set => <li key={set.length}><a className="practice-preset" href={set.href} aria-label={`Start ${set.length}`}>
        <StudyIcon kind="practice" /><h3>{set.length} questions</h3><p>Mixed topics · Untimed</p><span>Start {set.length} →</span>
      </a></li>)}
      <li><a className="practice-preset" href="/hazards/"><StudyIcon kind="hazard" /><h3>Hazard drill</h3><p>Spot hazards in workplace scenes.</p><span>Choose a drill →</span></a></li>
      <li><a className="practice-preset" href="/simulations/"><StudyIcon kind="simulation" /><h3>Full simulation</h3><p>Your timing, with feedback at the end.</p><span>Set up simulation →</span></a></li>
    </ul>
    <StudyPracticeBuilder />
    <p className="practice-print-link">Prefer paper? <a href="/print/">Print a practice set</a></p>
  </section>
}

export const StudyProgress = () => {
  const { state: { bootstrap, activityState } } = useStudy()
  return (<section className="study-section" aria-labelledby="study-progress-heading">
      <div className="section-header"><h2 id="study-progress-heading">Saved activity</h2></div>
      {activityState.tag === "unavailable" ? <div className="study-read-notice notice notice-warning"><h3>Progress is unavailable</h3><p>Your saved attempts could not be read. You can retry in Recent activity below.</p></div> :
        activityState.tag === "loading" ? <p className="study-read-notice" role="status">Reading your saved progress…</p> :
          <div className="study-progress-rows">
            <div><StudyIcon kind="practice" /><div><h3>Question practice</h3><p>Recognizing tools and choosing how to use them.</p><strong>{activityState.activity.questionCount === 0 ? "No saved answers in this release" : `${activityState.activity.questionCount} ${activityState.activity.questionCount === 1 ? "answer" : "answers"} saved`}</strong></div><a className="button button-secondary" href="#practice-sets">Practice questions</a></div>
            <div><StudyIcon kind="hazard" /><div><h3>Hazard scanning</h3><p>Identifying unsafe conditions in workplace scenes.</p><strong>{activityState.activity.hazardCount === 0 ? "No saved scene responses in this release" : `${activityState.activity.hazardCount} scene ${activityState.activity.hazardCount === 1 ? "response" : "responses"} saved`}</strong></div><a className="button button-secondary" href="/hazards/">Practice hazards</a></div>
            <div><StudyIcon kind="library" /><div><h3>Tool reference</h3><p>Compare how tools look, what they do, and where their uses differ.</p><strong>{bootstrap.toolCount} tools</strong></div><a className="button button-secondary" href="/atlas/">Browse tools</a></div>
          </div>}
      <p className="study-source-note">Kept in this browser on this device. Clearing browser data can delete your records. <a href="/settings/#export-local-data">Export a backup</a> to keep a copy.</p>
    </section>)
}

export const StudyReview = () => {
  const { state: { review }, meta: { reviewHeadingRef } } = useStudy()
  return (<section className="study-section" aria-labelledby="study-review-heading">
      <div className="section-header"><h2 id="study-review-heading" ref={reviewHeadingRef} tabIndex={-1}>Ready for review</h2></div>
      {review.tag === "loading" ? <p className="study-read-notice" role="status">Preparing review from your saved attempts…</p> :
        review.tag === "recoverable_error" ? <div className="study-read-notice notice notice-warning"><h3>Review could not be prepared</h3><p>Your saved attempts have not been changed.</p><a href="/review/">Open review recovery</a></div> :
          review.tag === "empty" ? <div className="empty-state"><h3 className="empty-state-heading">Nothing is waiting for review</h3><p>Missed or flagged questions and visual hazard mistakes appear here after you save an answer. Finished reviews stay in your history.</p><div className="empty-state-actions"><a href="/review/">How review works</a></div></div> :
            <div className="study-read-notice"><h3>{review.items.length} {review.items.length === 1 ? "item is" : "items are"} ready to revisit</h3><p>Read each explanation, then confirm Finish review when you are ready to remove it from the queue.</p>{review.quarantined.length > 0 ? <p>{review.quarantined.length} saved {review.quarantined.length === 1 ? "attempt is" : "attempts are"} unavailable.</p> : null}<dl className="figure-strip"><div><dt>Missed or misidentified</dt><dd>{review.items.filter((item) => item.reasons.some((reason) => reason.tag !== "flag")).length}</dd></div><div><dt>Flagged by you</dt><dd>{review.items.filter((item) => item.reasons.some((reason) => reason.tag === "flag")).length}</dd></div></dl><a className="button button-primary" href="/review/">Review your saved work</a></div>}
    </section>)
}

export const StudyCoverage = () => {
  const { state: { bootstrap, compact } } = useStudy()
  return <section className="study-section" id="covers" tabIndex={-1} aria-labelledby="study-coverage-heading">
    <div className="section-header"><h2 id="study-coverage-heading">What practice covers</h2></div>
    {compact ? <article className="study-read-notice study-coverage-compact">
      <h3>One bank of {bootstrap.questionCount}, the three announced areas</h3>
      <p>Cleaning tools and their uses; tools for minor maintenance and repair; health and safety in custodial work. Choosing a set length changes how many questions you answer, never the bank they come from.</p>
      <p>Reading an exam page does not select an exam or change your practice. Questions are original, with no secure or recalled test material. Saved activity keeps counts, not an official score.</p>
      <p className="study-source-note"><a href="/exams/">Read the subject plans and their sources</a>. Your official announcement governs your exam.</p>
      <a className="button button-secondary" href="/exams/">Compare with your announcement</a>
    </article> : <div className="study-coverage-grid">
      <article className="study-read-notice"><h3>One question bank, the three announced areas</h3>
        <p>{bootstrap.questionCount} original questions for the New York Entry-Level Custodians and Janitors series. Choosing a set length changes how many you answer, never the bank they come from.</p>
        <ol className="study-coverage-areas">
          <li><strong>Cleaning tools and their uses.</strong> Recognizing a tool from a drawing or a description, and matching it to the job.</li>
          <li><strong>Tools for minor maintenance and repair.</strong> Hand tools for small repairs and the signs a tool has become unsafe to use.</li>
          <li><strong>Health and safety in custodial work.</strong> Safe practices, chemicals, protective equipment, and what is wrong in a scene.</li>
        </ol><p className="study-source-note"><a href="/exams/">Read the subject plans and their sources</a>. Your official announcement governs your exam.</p>
      </article>
      <article className="study-read-notice"><h3>What it does not do</h3><ul>
        <li>It does not know which exam you are taking. Reading an exam page leaves your practice exactly as it is.</li>
        <li>It has no questions written for a single announcement, and no secure or recalled test material.</li>
        <li>Saved activity counts are records of your practice, never an official score or a prediction of one.</li>
      </ul><a className="button button-secondary" href="/exams/">Compare with your announcement</a></article>
    </div>}
  </section>
}

export const StudyHeader = () => {
  const { state: { unavailable }, actions: { retryActivity }, meta: { headingRef } } = useStudy()
  return <header className={`page-header study-hero practice-heading${unavailable ? " study-hero-unavailable" : ""}`}>
    <h1 id="study-heading" ref={headingRef} tabIndex={-1}>{unavailable ? "Your saved progress could not be read" : "Practice"}</h1>
    <p>{unavailable ? "Your saved attempts have not been changed. Retry reading your progress, or choose an activity below." : "Build confidence with original questions and workplace scenes, at your own pace."}</p>
    {unavailable ? <div><button className="button button-primary" type="button" onClick={retryActivity}>Retry reading progress</button></div> : null}
  </header>
}

export const StudyHistory = () => {
  const { state: { historyState }, actions: { retryActivity } } = useStudy()
  return <ActivityHistory state={historyState} onRetry={retryActivity} />
}
export const StudyPracticeBuilder = () => {
  const disclosure = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash === "#practice-builder" && disclosure.current !== null) disclosure.current.open = true
    }
    reveal()
    window.addEventListener("hashchange", reveal)
    return () => window.removeEventListener("hashchange", reveal)
  }, [])
  return <details className="practice-customize" ref={disclosure}>
    <summary>Customize a practice set<span>Choose topics, length, or a repeat set</span></summary>
    <PracticeSessionSetup />
  </details>
}
export const StudyHub = () => <div className="study-hub">
  <StudyHeader />
  <StudyPresets />
  <StudyProgress />
  <div className="study-activity-grid"><StudyReview /><StudyHistory /></div>
  <StudyCoverage />
</div>

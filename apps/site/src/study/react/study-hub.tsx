import { PracticeBuilder } from "../../practice/react/builder.tsx"
import { useEffect, useRef, useSyncExternalStore } from "react"
import type { ReviewController } from "../../review/controller.ts"
import { ActivityHistory } from "./history.tsx"
import type { StudyActivityState, StudyBootstrap } from "../model.ts"
import { includeUnavailableReviews } from "../activity.ts"

const studyIconPaths = {
  practice: <><path d="M7 3h10v18H7z" /><path d="M10 7h4M10 11h4M10 15h2" /></>,
  hazard: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  simulation: <><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2M9 2h6M12 2v3" /></>,
  print: <><path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6z" /><path d="M17 12h1" /></>,
  library: <><path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15" /></>
} as const

const StudyIcon = ({ kind }: { readonly kind: keyof typeof studyIconPaths }) =>
  <svg className="study-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{studyIconPaths[kind]}</svg>

const ways = [
  { icon: "practice", title: "Practice set", compactDescription: "Choose a question set", description: "Answer questions at your own pace. Read the explanation and sources after each saved answer.", href: "#practice-builder", action: "Choose a set" },
  { icon: "hazard", title: "Hazard practice", compactDescription: "Visual and keyboard scenes", description: "Look through a workplace scene and mark hazards, or use the keyboard zone version.", href: "/hazards/", action: "Explore the scenes" },
  { icon: "simulation", title: "Simulation", compactDescription: "Your own timing", description: "Choose a practice length and your own timing. Feedback waits until you finish.", href: "/simulations/", action: "Set up a simulation" },
  { icon: "print", title: "Print a set", compactDescription: "Paper, with answer key", description: "Study on paper, with questions and their answer key on separate pages.", href: "/print/", action: "Open print center" }
] as const

const compactQuery = "(max-width: 47.99rem)"
const subscribeCompactLayout = (onChange: () => void) => {
  const query = window.matchMedia(compactQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readCompactLayout = () => window.matchMedia(compactQuery).matches
const serverCompactLayout = () => false

export const StudyHub = ({ bootstrap, activityState, reviewController, onRetry }: {
  readonly bootstrap: StudyBootstrap
  readonly activityState: StudyActivityState
  readonly reviewController: ReviewController
  readonly onRetry: () => void
}) => {
  const compact = useSyncExternalStore(subscribeCompactLayout, readCompactLayout, serverCompactLayout)
  const review = useSyncExternalStore(reviewController.subscribe, reviewController.getSnapshot, reviewController.getHydrationSnapshot).state
  const historyState: StudyActivityState = activityState.tag === "ready" && (review.tag === "ready" || review.tag === "recoverable_error")
    ? { tag: "ready", activity: includeUnavailableReviews(activityState.activity, review.quarantined) }
    : activityState
  const activity = historyState.tag === "ready" ? historyState.activity : undefined
  const hasActivity = activity !== undefined && activity.questionCount + activity.hazardCount + activity.unavailableAttempts.length > 0
  const unavailable = activityState.tag === "unavailable"
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (unavailable) headingRef.current?.focus() }, [unavailable])
  const initialSectionFocus = useRef(false)
  useEffect(() => {
    if (initialSectionFocus.current || activityState.tag !== "ready" ||
      review.tag === "loading") return
    initialSectionFocus.current = true
    const targetId = window.location.hash.slice(1)
    if (targetId === "practice-builder" || targetId === "covers") {
      const section = document.getElementById(targetId)
      section?.focus({ preventScroll: true })
      section?.scrollIntoView({ block: "start" })
    }
  }, [activityState.tag, review.tag])
  const firstPractice = bootstrap.firstPractice
  const settingsLinks = <p className="study-settings-links"><a href="/settings/">Larger text and reduced motion</a>{compact ? null : <>{" · "}<a href="/offline/">Download for offline use</a></>}</p>
  const coverageLink = !unavailable && !hasActivity ? <a className="study-coverage-link" href="#covers">What practice covers</a> : null
  const waysSection = (<section className="study-section" aria-labelledby="study-ways-heading">
      <div className="section-header"><h2 id="study-ways-heading">Ways to practice</h2>{compact ? null : settingsLinks}</div>
      <ul className="task-cards study-ways-grid">{ways.map((way, index) => <li className={`task-card${index === 0 ? " task-card-primary" : ""}`} key={way.href}>
        <a className="task-card-link" href={way.href} aria-labelledby={`study-way-${way.icon}`}>
          <StudyIcon kind={way.icon} /><h3 className="task-card-title" id={`study-way-${way.icon}`}>{way.title}</h3>
          <p className="task-card-description">{way.description}</p><p className="task-card-compact-summary">{way.icon === "hazard" ? `${bootstrap.sceneCount} scenes` : way.compactDescription}</p>
          <span className={`task-card-cta button ${index === 0 ? "button-primary" : "button-secondary"}`}>{way.action}</span>
        </a>
      </li>)}</ul>
      {compact ? settingsLinks : null}
    </section>)
  const progressSection = (<section className="study-section" aria-labelledby="study-progress-heading">
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
  const reviewSection = (<section className="study-section" aria-labelledby="study-review-heading">
      <div className="section-header"><h2 id="study-review-heading">Ready for review</h2></div>
      {review.tag === "loading" ? <p className="study-read-notice" role="status">Preparing review from your saved attempts…</p> :
        review.tag === "recoverable_error" ? <div className="study-read-notice notice notice-warning"><h3>Review could not be prepared</h3><p>Your saved attempts have not been changed.</p><a href="/review/">Open review recovery</a></div> :
          review.tag === "empty" ? <div className="empty-state"><h3 className="empty-state-heading">Nothing is waiting for review</h3><p>Missed or flagged questions and visual hazard mistakes appear here after you save an answer. Finished reviews stay in your history.</p><div className="empty-state-actions"><a href="/review/">How review works</a></div></div> :
            <div className="study-read-notice"><h3>{review.items.length} {review.items.length === 1 ? "item is" : "items are"} ready to revisit</h3><p>Read each explanation, then confirm Finish review when you are ready to remove it from the queue.</p>{review.quarantined.length > 0 ? <p>{review.quarantined.length} saved {review.quarantined.length === 1 ? "attempt is" : "attempts are"} unavailable.</p> : null}<dl className="figure-strip"><div><dt>Missed or misidentified</dt><dd>{review.items.filter((item) => item.reasons.some((reason) => reason.tag !== "flag")).length}</dd></div><div><dt>Flagged by you</dt><dd>{review.items.filter((item) => item.reasons.some((reason) => reason.tag === "flag")).length}</dd></div></dl><a className="button button-primary" href="/review/">Review your saved work</a></div>}
    </section>)
  const coverageSection = <section className="study-section" id="covers" tabIndex={-1} aria-labelledby="study-coverage-heading">
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
  return <div className={`study-hub${hasActivity ? " study-returning" : " study-first-visit"}`}>
    <section className={`page-header study-hero${unavailable ? " study-hero-unavailable" : " page-header-prominent"}`} aria-labelledby="study-heading">
      <p className="eyebrow">{unavailable ? "Saved activity" : hasActivity ? "Practice and activity" : "Start here"}</p>
      <h1 id="study-heading" ref={headingRef} tabIndex={-1}>{unavailable ? "Your saved progress could not be read" : firstPractice === null ? "Choose your practice." : hasActivity ? `Start another set of ${firstPractice.length}.` : `Start with a set of ${firstPractice.length}.`}</h1>
      <p>{unavailable ? "The study data on this device did not load. Try reading it again, or choose a practice set below. Your saved attempts have not been changed." : hasActivity
        ? `${activity.questionCount + activity.hazardCount} saved answers and scene responses are on this device. Open any saved answer again to reread its explanation.`
        : `Original questions across all three subject areas, untimed, with the reasoning and its source after every saved answer. Every set is drawn from one question bank written for the ${bootstrap.profileLabel} series.`}</p>
      {compact ? coverageLink : null}
      <div className="question-controls">
        {unavailable ? <button className="button button-primary" type="button" onClick={onRetry}>Retry reading progress</button> : firstPractice === null ? <a className="button button-primary" href="#practice-sets">See available practice</a> : <a className="button button-primary" href={firstPractice.href}>{firstPractice.label}</a>}
        <a className="button button-secondary" href={unavailable ? "#practice-sets" : hasActivity ? "/review/" : "/hazards/"}>{unavailable ? "Choose a practice set" : hasActivity ? "Open your review queue" : "Practice spotting hazards"}</a>
        {compact ? null : coverageLink}
      </div>
      {unavailable ? null : <dl className="figure-strip">
        <div><dt>{hasActivity ? "Questions answered" : "Original questions"}</dt><dd>{hasActivity ? activity.questionCount : bootstrap.questionCount}</dd></div>
        <div><dt>{hasActivity ? "Scene responses" : "Hazard scenes"}</dt><dd>{hasActivity ? activity.hazardCount : bootstrap.sceneCount}</dd></div>
        <div><dt>{hasActivity ? "Finished reviews" : "Tools"}</dt><dd>{hasActivity ? activity.reviewCount : bootstrap.toolCount}</dd></div>
        {!hasActivity ? <div><dt>Subject areas</dt><dd>3, named for this series</dd></div> : null}
        {activity !== undefined && activity.unavailableAttempts.length > 0 ? <div><dt>Unavailable saved attempts</dt><dd>{activity.unavailableAttempts.length}</dd></div> : null}
      </dl>}
    </section>
    {hasActivity ? <>
      {reviewSection}
      {progressSection}
      <ActivityHistory state={historyState} onRetry={onRetry} />
      {coverageSection}
      {waysSection}
    </> : <>
      {compact ? null : coverageSection}
      {waysSection}
      {progressSection}
      <div className="study-activity-grid">
        {reviewSection}
        <ActivityHistory state={historyState} onRetry={onRetry} />
      </div>
      {compact ? coverageSection : null}
    </>}
    <PracticeBuilder sources={bootstrap.reviewQueue.questions} />
  </div>
}

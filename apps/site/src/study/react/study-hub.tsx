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
  { icon: "practice", title: "Practice set", description: "Answer questions at your own pace. Read the explanation and sources after each saved answer.", href: "#practice-sets", action: "Choose a set" },
  { icon: "hazard", title: "Hazard practice", description: "Look through a workplace scene and mark hazards, or use the keyboard zone version.", href: "/hazards/", action: "Explore the scenes" },
  { icon: "simulation", title: "Simulation", description: "Choose a practice length and your own timing. Feedback waits until you finish.", href: "/simulations/", action: "Set up a simulation" },
  { icon: "print", title: "Print a set", description: "Study on paper, with questions and their answer key on separate pages.", href: "/print/", action: "Open print center" }
] as const

export const StudyHub = ({ bootstrap, activityState, reviewController, onRetry }: {
  readonly bootstrap: StudyBootstrap
  readonly activityState: StudyActivityState
  readonly reviewController: ReviewController
  readonly onRetry: () => void
}) => {
  const review = useSyncExternalStore(reviewController.subscribe, reviewController.getSnapshot, reviewController.getHydrationSnapshot).state
  const historyState: StudyActivityState = activityState.tag === "ready" && (review.tag === "ready" || review.tag === "recoverable_error")
    ? { tag: "ready", activity: includeUnavailableReviews(activityState.activity, review.quarantined) }
    : activityState
  const activity = historyState.tag === "ready" ? historyState.activity : undefined
  const hasActivity = activity !== undefined && activity.questionCount + activity.hazardCount + activity.unavailableAttempts.length > 0
  const unavailable = activityState.tag === "unavailable"
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (unavailable) headingRef.current?.focus() }, [unavailable])
  const firstPractice = bootstrap.firstPractice
  const waysSection = (<section className="study-section" aria-labelledby="study-ways-heading">
      <div className="section-header"><h2 id="study-ways-heading">Practice formats</h2><p>Answer questions, find hazards, or make a worksheet.</p></div>
      <ul className="task-cards">{ways.map((way, index) => <li className={`task-card${index === 0 ? " task-card-primary" : ""}`} key={way.href}>
        <StudyIcon kind={way.icon} /><h3>{way.title}</h3><p>{way.description}</p>
        <a className={`button ${index === 0 ? "button-primary" : "button-secondary"}`} href={way.href}>{way.action}</a>
      </li>)}</ul>
    </section>)
  const progressSection = (<section className="study-section" aria-labelledby="study-progress-heading">
      <div className="section-header"><h2 id="study-progress-heading">Saved activity</h2><p>Activity for the current study material. Your answers and reviews stay in this browser. Clearing browser data can delete them. <a href="/settings/#export-local-data">Export a backup</a> to keep a copy.</p></div>
      {activityState.tag === "unavailable" ? <div className="study-read-notice notice notice-warning"><h3>Progress is unavailable</h3><p>Your saved attempts could not be read. You can retry in Recent activity below.</p></div> :
        activityState.tag === "loading" ? <p className="study-read-notice" role="status">Reading your saved progress…</p> :
          <div className="study-progress-rows">
            <div><StudyIcon kind="practice" /><div><h3>Question practice</h3><p>Recognizing tools and choosing how to use them.</p><strong>{activityState.activity.questionCount === 0 ? "No saved answers in this release" : `${activityState.activity.questionCount} ${activityState.activity.questionCount === 1 ? "answer" : "answers"} saved`}</strong></div><a href="#practice-sets">Practice questions</a></div>
            <div><StudyIcon kind="hazard" /><div><h3>Hazard scanning</h3><p>Identifying unsafe conditions in workplace scenes.</p><strong>{activityState.activity.hazardCount === 0 ? "No saved scene responses in this release" : `${activityState.activity.hazardCount} scene ${activityState.activity.hazardCount === 1 ? "response" : "responses"} saved`}</strong></div><a href="/hazards/">Practice hazards</a></div>
            <div><StudyIcon kind="library" /><div><h3>Tool reference</h3><p>Compare how tools look, what they do, and where their uses differ.</p><strong>{bootstrap.toolCount} tools</strong></div><a href="/atlas/">Browse tools</a></div>
          </div>}
    </section>)
  const reviewSection = (<section className="study-section" aria-labelledby="study-review-heading">
      <div className="section-header"><h2 id="study-review-heading">Ready for review</h2></div>
      {review.tag === "loading" ? <p className="study-read-notice" role="status">Preparing review from your saved attempts…</p> :
        review.tag === "recoverable_error" ? <div className="study-read-notice notice notice-warning"><h3>Review could not be prepared</h3><p>Your saved attempts have not been changed.</p><a href="/review/">Open review recovery</a></div> :
          review.tag === "empty" ? <div className="empty-state"><h3 className="empty-state-heading">Nothing is waiting for review</h3><p>Missed or flagged questions and visual hazard mistakes appear here after you save an answer. Finished reviews stay in your history.</p><div className="empty-state-actions"><a href="/review/">How review works</a></div></div> :
            <div className="study-read-notice"><h3>{review.items.length} {review.items.length === 1 ? "item is" : "items are"} ready to revisit</h3><p>Read each explanation, then confirm Finish review when you are ready to remove it from the queue.</p>{review.quarantined.length > 0 ? <p>{review.quarantined.length} saved {review.quarantined.length === 1 ? "attempt is" : "attempts are"} unavailable.</p> : null}<a className="button button-primary" href="/review/">Review your saved work</a></div>}
    </section>)
  return <div className="study-hub">
    <section className={`page-header study-hero${unavailable ? " study-hero-unavailable" : " page-header-prominent"}`} aria-labelledby="study-heading">
      <h1 id="study-heading" ref={headingRef} tabIndex={-1}>{unavailable ? "Your saved progress could not be read" : "Practice and activity"}</h1>
      <p>Practice for the {bootstrap.profileLabel} series. Start a set, review saved answers, or check your recent activity.</p>
      <p>{unavailable ? "The study data on this device did not load. Try reading it again, or choose a practice set below. Your saved attempts have not been changed." : hasActivity
        ? "Use your history to reopen saved explanations. Finished reviews stay in your history."
        : "These original questions are untimed. Each answer opens an explanation and its sources after it is saved."}</p>
      <div className="question-controls">
        {unavailable ? <button className="button button-primary" type="button" onClick={onRetry}>Retry reading progress</button> : firstPractice === null ? <a className="button button-primary" href="#practice-sets">See available practice</a> : <a className="button button-primary" href={firstPractice.href}>{firstPractice.label}</a>}
        <a className="button button-secondary" href={unavailable ? "#practice-sets" : hasActivity ? "/review/" : "/hazards/"}>{unavailable ? "Choose a practice set" : hasActivity ? "Open your review queue" : "Practice spotting hazards"}</a>
      </div>
      {unavailable ? null : <dl className="figure-strip">
        <div><dt>{hasActivity ? "Questions answered" : "Original questions"}</dt><dd>{hasActivity ? activity.questionCount : bootstrap.questionCount}</dd></div>
        <div><dt>{hasActivity ? "Scene responses" : "Hazard scenes"}</dt><dd>{hasActivity ? activity.hazardCount : bootstrap.sceneCount}</dd></div>
        <div><dt>{hasActivity ? "Finished reviews" : "Tools"}</dt><dd>{hasActivity ? activity.reviewCount : bootstrap.toolCount}</dd></div>
        {activity !== undefined && activity.unavailableAttempts.length > 0 ? <div><dt>Unavailable saved attempts</dt><dd>{activity.unavailableAttempts.length}</dd></div> : null}
      </dl>}
    </section>
    {hasActivity ? <>
      {reviewSection}
      {progressSection}
      <ActivityHistory state={historyState} onRetry={onRetry} />
      {waysSection}
    </> : <>
      {waysSection}
      {progressSection}
      <div className="study-activity-grid">
        {reviewSection}
        <ActivityHistory state={historyState} onRetry={onRetry} />
      </div>
    </>}
    <section className="study-section" aria-labelledby="study-exam-heading">
      <div className="section-header"><h2 id="study-exam-heading">Does this match your exam?</h2></div>
      <p>Compare the subjects in your official announcement with this site's entry-level study material. Higher-level series have different requirements.</p>
      <a href="/exams/">Read exam information</a>
    </section>
  </div>
}

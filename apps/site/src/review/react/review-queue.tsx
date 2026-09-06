import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ActivityHistory } from "../../study/react/history.tsx"
import { UnavailableAttempts } from "../../study/react/unavailable-attempts.tsx"
import { includeUnavailableReviews } from "../../study/activity.ts"
import type { StudyActivityState } from "../../study/model.ts"
import type { ReviewController } from "../controller.ts"
import type { ReviewQueueItem, ReviewReason } from "../model.ts"

const savedDateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

const reasonLabel = (reason: ReviewReason): string => {
  switch (reason.tag) {
    case "flag":
      return "You flagged this question for review."
    case "incorrect_answer":
      return "You answered this question incorrectly."
    case "hazard_miss":
      return "You missed a hazard in this scene."
    case "decoy_false_positive":
      return "You marked a detail that is safe as shown in this scene."
    case "general_false_positive":
      return "You marked a spot where this scene records no hazard."
  }
}

const ReviewReasons = ({ reasons }: { readonly reasons: ReadonlyArray<ReviewReason> }) => (
  <ul className="review-reason-list">
    {reasons.map((reason, index) => (
      <li key={`${reason.tag}-${index}`}>{reasonLabel(reason)}</li>
    ))}
  </ul>
)

const ReviewItem = ({
  acknowledging,
  disabled,
  item,
  onAcknowledge
}: {
  readonly acknowledging: boolean
  readonly disabled: boolean
  readonly item: ReviewQueueItem
  readonly onAcknowledge: (itemId: string) => void
}) => {
  const [confirming, setConfirming] = useState(false)
  const finishButton = useRef<HTMLButtonElement>(null)
  const confirmationHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (confirming) confirmationHeading.current?.focus() }, [confirming])
  return <li>
          <article className="review-item-card">
            <time className="history-date" dateTime={new Date(item.committedAt).toISOString()}>
              {savedDateFormat.format(item.committedAt)}
            </time>
            <div className="review-item-copy">
              <h3>{item.label ?? (item.kind === "question" ? "Saved question answer" : "Saved visual hazard response")}</h3>
              <ReviewReasons reasons={item.reasons} />
            </div>
            <div className="question-controls">
              <a className="button button-primary" href={item.itemUrl}>Read explanation</a>
              <button
                className="review-finish-action"
                disabled={disabled}
                ref={finishButton}
                aria-expanded={confirming}
                onClick={() => setConfirming(true)}
                type="button"
              >
                {acknowledging ? "Finishing review…" : "Finish review"}
              </button>
            </div>
            {confirming ? <div className="review-finish-confirmation" role="group" aria-label="Confirm finished review">
              <h4 ref={confirmationHeading} tabIndex={-1}>Finish this review?</h4>
              <p>This removes the item from your ready queue. Your saved answer and explanation stay in your history.</p>
              <div className="review-confirmation-actions">
                <button className="button button-primary" type="button" disabled={disabled} onClick={() => { setConfirming(false); onAcknowledge(item.id) }}>Confirm finish review</button>
                <button className="button button-secondary" type="button" disabled={disabled} onClick={() => { setConfirming(false); finishButton.current?.focus() }}>Keep in review</button>
              </div>
            </div> : null}
          </article>
        </li>
}

type ReviewScope = "all" | "missed" | "flagged"
const scopes: ReadonlyArray<{ readonly id: ReviewScope; readonly label: string }> = [
  { id: "all", label: "All" }, { id: "missed", label: "Missed" }, { id: "flagged", label: "Flagged" }
]
const inScope = (item: ReviewQueueItem, scope: ReviewScope): boolean =>
  scope === "all" || item.reasons.some((reason) => scope === "flagged" ? reason.tag === "flag" : reason.tag !== "flag")

export const ReviewQueueIsland = ({ controller, activityState, onRetryHistory }: {
  readonly controller: ReviewController
  readonly activityState: StudyActivityState
  readonly onRetryHistory: () => void
}) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const state = snapshot.state
  const [scope, setScope] = useState<ReviewScope>("all")
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null)
  const filteredHeadingRef = useRef<HTMLHeadingElement>(null)
  const queueHeadingRef = useRef<HTMLHeadingElement>(null)
  const acknowledgementFocusId = useRef<string | null>(null)
  const focusError = state.tag === "recoverable_error"
  const focusCompletedEmpty = state.tag === "empty" && state.origin === "acknowledgement"
  const items = state.tag === "ready" || state.tag === "recoverable_error" ? state.items : []
  const filtered = items.filter((item) => inScope(item, scope))
  const filteredEmpty = state.tag === "ready" && items.length > 0 && filtered.length === 0
  const missed = items.filter((item) => inScope(item, "missed")).length
  const flagged = items.filter((item) => inScope(item, "flagged")).length
  const busy = state.tag === "ready" && state.acknowledgingItemId !== null
  const quarantined = state.tag === "ready" || state.tag === "recoverable_error" ? state.quarantined : []
  const historyState = activityState.tag === "ready"
    ? { tag: "ready" as const, activity: includeUnavailableReviews(activityState.activity, quarantined) }
    : activityState

  useEffect(() => { if (focusError) errorHeadingRef.current?.focus() }, [focusError])
  useEffect(() => { if (focusCompletedEmpty) emptyHeadingRef.current?.focus() }, [focusCompletedEmpty])
  useEffect(() => { if (filteredEmpty) filteredHeadingRef.current?.focus() }, [filteredEmpty])
  useEffect(() => {
    const pendingId = acknowledgementFocusId.current
    if (pendingId === null || state.tag === "loading" || (state.tag === "ready" && state.acknowledgingItemId !== null)) return
    if (state.tag === "ready" && !state.items.some((item) => item.id === pendingId)) {
      acknowledgementFocusId.current = null
      if (filtered.length > 0) queueHeadingRef.current?.focus()
    } else if (state.tag === "empty" || state.tag === "recoverable_error") {
      acknowledgementFocusId.current = null
    }
  }, [state, filtered.length])

  return <div className="review-page">
    {state.tag === "recoverable_error" ? <section className="review-state review-error" aria-labelledby="review-error-heading" role="alert">
      <p className="eyebrow">Review · saved on this device</p>
      <h1 id="review-error-heading" ref={errorHeadingRef} tabIndex={-1}>{state.operation === "acknowledge" ? "Your finished review was not saved" : "Review queue could not be built"}</h1>
      <p>{state.operation === "acknowledge" ? "The change could not be written to this device's storage. The item stays in your queue." : "Your saved attempts could not be read from this device's storage."}</p>
      <p>No saved attempt was deleted or replaced.</p>
      {state.detail.length === 0 ? null : <details className="feedback-sources"><summary>Technical details</summary><p>{state.detail}</p></details>}
      <div className="question-controls">
        <button className="button button-primary" onClick={() => controller.dispatch({ tag: "retry" })} type="button">Retry</button>
        <button className="button button-secondary" onClick={() => controller.dispatch({ tag: "rebuild" })} type="button">Rebuild review queue</button>
        <a className="button button-secondary" href="/settings/#export-local-data">Export saved data</a>
      </div>
    </section> : <section className="page-header page-header-prominent study-hero" aria-labelledby="review-queue-heading">
      <p className="eyebrow">Review · saved on this device</p>
      <h1 id="review-queue-heading">{state.tag === "loading" ? "Loading your local review queue" : state.tag === "empty" ? "Your review queue is clear." : `${items.length} ${items.length === 1 ? "item" : "items"} to review`}</h1>
      <p>{state.tag === "loading" ? state.action === "rebuild" ? "Rebuilding from your saved attempts and finished reviews…" : "Reading the attempts saved on this device…" : state.tag === "empty" ? "Nothing is waiting for review. Try another practice set, explore a scene, or come back after your next saved answer." : "Revisit the questions you missed or flagged and the visual scenes that need another look. Untimed, with your original saved feedback."}</p>
      <div className="question-controls">
        {items[0] === undefined ? <a className="button button-primary" href="/practice/#practice-sets">Choose a practice set</a> : <a className="button button-primary" href={items[0].itemUrl}>Read first explanation</a>}
        <a className="button button-secondary" href="/practice/">Back to Study</a>
      </div>
      {state.tag === "loading" ? <span role="status" className="sr-only">Reading your review queue.</span> : <dl className="figure-strip">
        <div><dt>Ready for review</dt><dd>{items.length} {items.length === 1 ? "item" : "items"}</dd></div>
        <div><dt>Missed or misidentified</dt><dd>{missed}</dd></div>
        <div><dt>Flagged by you</dt><dd>{flagged}</dd></div>
        <div><dt>Storage</dt><dd className="study-scope-label">This device only</dd></div>
      </dl>}
    </section>}

    {state.tag === "empty" ? <section className="study-section" aria-labelledby="review-empty-heading">
      <div className="section-header"><h2>What is ready</h2></div>
      <div className="empty-state review-empty">
        <h3 className="empty-state-heading" id="review-empty-heading" ref={emptyHeadingRef} tabIndex={-1}>No review items are ready</h3>
        <p>Missed or flagged questions and mistakes in visual hazard scenes build this queue. Correct answers you did not flag, keyboard zone attempts, and finished reviews do not return here.</p>
        <div className="empty-state-actions"><a className="button button-primary" href="/practice/#practice-sets">Practice questions</a><a className="button button-secondary" href="/hazards/">Practice hazard scanning</a></div>
      </div>
    </section> : (state.tag === "ready" || state.tag === "recoverable_error") && items.length > 0 ? <section className="study-section" aria-labelledby="review-due-heading">
      <div className="section-header"><h2 id="review-due-heading" ref={queueHeadingRef} tabIndex={-1}>What is ready</h2><p>Read each explanation, then confirm Finish review when you are done.</p></div>
      <div className="tabs" role="tablist" aria-label="Review scope">{scopes.map((entry, index) => <button
        key={entry.id} id={`review-tab-${entry.id}`} role="tab" type="button"
        aria-selected={scope === entry.id} aria-controls="review-scope-panel" tabIndex={scope === entry.id ? 0 : -1}
        onClick={() => setScope(entry.id)}
        onKeyDown={(event) => {
          const next = event.key === "ArrowRight" ? (index + 1) % scopes.length : event.key === "ArrowLeft" ? (index + scopes.length - 1) % scopes.length : event.key === "Home" ? 0 : event.key === "End" ? scopes.length - 1 : undefined
          if (next === undefined) return
          event.preventDefault()
          const selected = scopes[next]
          if (selected === undefined) return
          setScope(selected.id)
          event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#review-tab-${selected.id}`)?.focus()
        }}
      >{entry.label}{" "}<span className="filter-count">{entry.id === "all" ? items.length : entry.id === "missed" ? missed : flagged}</span></button>)}</div>
      <div id="review-scope-panel" className={filtered.length > 0 ? "review-list-panel" : undefined} role="tabpanel" aria-labelledby={`review-tab-${scope}`}>
        <p className="review-scope-summary" role="status">Showing {filtered.length} {scope === "all" ? "review" : scope} {filtered.length === 1 ? "item" : "items"}, oldest saved answer first.</p>
        {filtered.length === 0 ? <div className="empty-state"><h3 className="empty-state-heading" ref={filteredHeadingRef} tabIndex={-1}>No {scope === "all" ? "review" : scope} items in this view</h3><p>{items.length > 0 ? "Choose All to return to the complete queue." : "Unavailable saved attempts are listed below."}</p>{items.length > 0 ? <div className="empty-state-actions"><button className="button button-secondary" type="button" onClick={() => setScope("all")}>Show all review items</button></div> : null}</div> : <ol className="review-queue-list">{filtered.map((item) => <ReviewItem key={item.id} acknowledging={state.tag === "ready" && state.acknowledgingItemId === item.id} disabled={state.tag === "recoverable_error" || busy} item={item} onAcknowledge={(itemId) => { acknowledgementFocusId.current = itemId; controller.dispatch({ tag: "acknowledge", itemId }) }} />)}</ol>}
      </div>
    </section> : null}
    <UnavailableAttempts attempts={historyState.tag === "ready" ? historyState.activity.unavailableAttempts : quarantined.map((entry) => ({ id: entry.attemptId, recordedAt: entry.committedAt ?? null, label: entry.kind === "question" ? "Question attempt" : "Visual hazard attempt" }))} headingId="review-unavailable-heading" />
    <ActivityHistory state={historyState} reviewsOnly onRetry={onRetryHistory} />
    <section className="study-section" aria-labelledby="review-how-heading">
      <div className="section-header"><h2 id="review-how-heading">How review works</h2></div>
      <dl className="review-rules">
        <div><dt>What gets queued</dt><dd>Missed and flagged questions, missed visual hazards, and safe details marked as hazards. An item can be both missed and flagged.</dd></div>
        <div><dt>When you finish</dt><dd>Confirm Finish review to remove the item from your ready queue. Your original answer and its explanation stay in your history.</dd></div>
        <div><dt>If an attempt is unavailable</dt><dd>It stays in your saved history with the information that can be read.</dd></div>
        <div><dt>Where it lives</dt><dd>On this device only. <a href="/settings/#export-local-data">Export a backup in Settings</a> to keep a copy.</dd></div>
      </dl>
      {state.tag !== "recoverable_error" ? <div className="question-controls"><button className="button button-secondary" disabled={state.tag === "loading" || busy} onClick={() => controller.dispatch({ tag: "rebuild" })} type="button">Rebuild review queue</button><a href="/practice/">Choose another way to study</a></div> : null}
    </section>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{busy ? "Saving your finished review." : state.tag === "ready" ? "Review queue ready." : ""}</p>
  </div>
}

import { hazardReviewPath } from "../../hazard-player/review-path.ts"
import { Fragment, useEffect, useRef, useState } from "react"
import type { StudyActivityRow, StudyActivityState } from "../model.ts"
import { UnavailableAttempts } from "./unavailable-attempts.tsx"

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
const kindLabels = { all: "All activity", questions: "Questions", hazards: "Hazards", reviews: "Reviews" } as const
const kinds = Object.keys(kindLabels) as Array<keyof typeof kindLabels>

export const ActivityHistory = ({
  state,
  reviewsOnly = false,
  onRetry
}: {
  readonly state: StudyActivityState
  readonly reviewsOnly?: boolean
  readonly onRetry: () => void
}) => {
  const [kind, setKind] = useState<keyof typeof kindLabels>("all")
  const [expanded, setExpanded] = useState(false)
  const filteredHeading = useRef<HTMLHeadingElement>(null)
  const allRows = state.tag === "ready"
    ? state.activity.rows.filter((row) => !reviewsOnly || row.kind === "reviews")
    : []
  const rows = kind === "all" ? allRows : allRows.filter((row) => row.kind === kind)
  const visible = expanded ? rows : rows.slice(0, 6)
  const filteredEmpty = state.tag === "ready" && allRows.length > 0 && rows.length === 0
  const hasUnavailableAttempts = state.tag === "ready" && state.activity.unavailableAttempts.length > 0
  useEffect(() => {
    if (filteredEmpty) filteredHeading.current?.focus()
  }, [filteredEmpty])
  const groups = new Map<string, StudyActivityRow[]>()
  for (const row of visible) {
    const month = monthFormat.format(row.recordedAt)
    const group = groups.get(month)
    if (group === undefined) groups.set(month, [row])
    else group.push(row)
  }

  return <section className="study-section" aria-labelledby={reviewsOnly ? "review-history-heading" : "study-history-heading"}>
    <div className="section-header">
      <h2 id={reviewsOnly ? "review-history-heading" : "study-history-heading"}>{reviewsOnly ? "Review history" : "Recent activity"}</h2>
    </div>
    {allRows.length >= 12 && !reviewsOnly ? <div className="tabs" role="tablist" aria-label="Activity kind">{kinds.map((value, index) => <button
      key={value} id={`history-tab-${value}`} type="button" role="tab"
      aria-selected={kind === value} aria-controls="study-history-panel" tabIndex={kind === value ? 0 : -1}
      onClick={() => { setKind(value); setExpanded(false) }}
      onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % kinds.length : event.key === "ArrowLeft" ? (index + kinds.length - 1) % kinds.length : event.key === "Home" ? 0 : event.key === "End" ? kinds.length - 1 : undefined
        if (next === undefined) return
        event.preventDefault()
        const selected = kinds[next]
        if (selected === undefined) return
        setKind(selected)
        setExpanded(false)
        event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#history-tab-${selected}`)?.focus()
      }}
    >{kindLabels[value]}{" "}<span className="filter-count">{value === "all" ? allRows.length : allRows.filter((row) => row.kind === value).length}</span></button>)}</div> : null}
    <div id={reviewsOnly ? "review-history-panel" : "study-history-panel"} role={allRows.length >= 12 && !reviewsOnly ? "tabpanel" : undefined} aria-labelledby={allRows.length >= 12 && !reviewsOnly ? `history-tab-${kind}` : undefined}>
    {state.tag === "loading" ? <div className="study-read-notice" role="status">Reading activity saved on this device…</div>
      : state.tag === "unavailable" ? <div className="study-read-notice notice notice-warning" role="status">
        <h3>Saved activity could not be read</h3>
        <p>Your history is unavailable. No saved attempt has been changed.</p>
        <button className="button button-secondary" onClick={onRetry} type="button">Retry reading history</button>
      </div>
      : allRows.length === 0 && hasUnavailableAttempts && !reviewsOnly ? null
      : rows.length === 0 ? <div className="empty-state">
        <h3 className="empty-state-heading" ref={filteredHeading} tabIndex={-1}>
          {filteredEmpty ? `No ${kindLabels[kind].toLowerCase()} in this history` : reviewsOnly ? "No finished reviews yet" : "No saved activity yet"}
        </h3>
        <p>{filteredEmpty ? "Try a different kind of activity to see your saved work." : reviewsOnly
          ? "Read an item's explanation, then confirm Finish review. Your finished reviews will appear here."
          : "Submit a question or hazard response to start your history. Activity stays on this device."}</p>
        {filteredEmpty ? <div className="empty-state-actions"><button className="button button-secondary" type="button" onClick={() => setKind("all")}>Show all activity</button></div> : null}
      </div>
      : <div className="history-list study-history">
        {[...groups].map(([month, group]) => <Fragment key={month}>
          {allRows.length > 6 ? <h3 className="history-group-label">{month}</h3> : null}
          <ul>{group.map((row) => <li className="history-row" key={row.id}>
            <time className="history-date" dateTime={new Date(row.recordedAt).toISOString()}>{dateFormat.format(row.recordedAt)}</time>
            <div className="history-session"><strong>{row.label}</strong><span>{kindLabels[row.kind]}</span></div>
            <span className="history-outcome">{row.outcome}</span>
            {row.href === null ? <span className="history-feedback-unavailable">Explanation unavailable</span> : <a href={row.kind === "hazards" ? hazardReviewPath(row.href) : row.href} aria-label={`Open saved feedback for ${row.label.toLowerCase()}`}>Feedback</a>}
          </li>)}</ul>
        </Fragment>)}
        {rows.length > 6 ? <div className="history-foot">
          <p role="status">Showing {visible.length} of {rows.length} saved activities.</p>
          <button className="button button-secondary" onClick={() => setExpanded(!expanded)} type="button">{expanded ? "Show fewer" : "Show all"}</button>
        </div> : null}
      </div>}
    </div>
    {state.tag === "ready" && !reviewsOnly ? <UnavailableAttempts attempts={state.activity.unavailableAttempts} headingId="study-unavailable-heading" /> : null}
  </section>
}

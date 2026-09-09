import type { Ref } from "react"
import type { UnavailableStudyAttempt } from "../model.ts"

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

export const UnavailableAttempts = ({ attempts, headingId, headingRef }: {
  readonly attempts: ReadonlyArray<UnavailableStudyAttempt>
  readonly headingRef?: Ref<HTMLHeadingElement>
  readonly headingId: string
}) => attempts.length === 0 ? null : <section className="study-section" aria-labelledby={headingId}>
  <div className="section-header"><h2 id={headingId} ref={headingRef} tabIndex={headingRef === undefined ? undefined : -1}>Unavailable saved attempts</h2></div>
  <div className="unavailable-attempts">
    <p>These records stay in your saved history. Only the information that can be read is shown here.</p>
    <ul>{attempts.map((attempt) => <li key={attempt.id}>
      {attempt.recordedAt === null ? null : <time className="history-date" dateTime={new Date(attempt.recordedAt).toISOString()}>{dateFormat.format(attempt.recordedAt)}</time>}
      <div><strong>{attempt.label}</strong><p>This saved attempt can’t be displayed.</p></div>
    </li>)}</ul>
  </div>
</section>

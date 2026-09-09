import { SimulationPlayerProvider, useSimulationPlayer } from "./player-provider.tsx"
import { SimulationQuestionProvider } from "./question-provider.tsx"
import { SimulationQuestionRoute } from "./question-item.tsx"
import { useEffect, useRef, useState } from "react"
import type { SimulationPlayerController } from "../controller.ts"
import {
  simulationItemId,
  simulationQuestionPath,
  type SimulationSessionRecord
} from "../model.ts"
import { SimulationHazardItem } from "./hazard-item.tsx"

const formatRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3_600)
  const minutes = Math.floor(seconds % 3_600 / 60)
  const remainder = seconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`
}

const SimulationTimer = ({
  retryRequired,
  saving,
  session,
  strictExpiryPending
}: {
  readonly retryRequired: boolean
  readonly saving: boolean
  readonly session: SimulationSessionRecord
  readonly strictExpiryPending: boolean
}) => {
  const { actions } = useSimulationPlayer()
  const [now, setNow] = useState(() => Date.now())
  const duration = session.timing.durationSeconds
  const remaining = session.timing.mode === "timed" && duration !== null
    ? Math.max(0, Math.ceil((session.createdAt + duration * 1_000 - now) / 1_000))
    : null

  useEffect(() => {
    if (remaining === null || remaining === 0) return
    const interval = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(interval)
  }, [remaining === null || remaining === 0])

  useEffect(() => {
    if (remaining === 0 && session.timing.autoSubmit) {
      actions.timerExpired()
    }
  }, [actions, remaining, session.timing.autoSubmit])

  if (remaining === null) {
    return <section className="reference-card" aria-label="Simulation timing"><p><strong>Untimed practice.</strong> No countdown or automatic submission is active.</p></section>
  }
  return <section className="reference-card simulation-timer" aria-label="Simulation timing">
    {session.timing.timerVisible
      ? <p data-simulation-timer><strong>Practice time remaining:</strong> <time>{formatRemaining(remaining)}</time></p>
      : <p data-simulation-timer-hidden><strong>Practice timer hidden.</strong> The deadline continues on this device.</p>}
    {remaining === 0 ? <p role="status">{session.timing.autoSubmit
      ? retryRequired
        ? "Practice time expired. Retry the local operation before automatic submission can continue."
        : strictExpiryPending && saving
          ? "Practice time expired. Automatic submission is waiting for the local queue to close."
          : "Practice time expired. Saving the opted-in final submission."
      : "Practice time expired. Answers remain editable because strict auto-submit is off."}</p> : null}
    <label className="simulation-timer-toggle">
    <input
      checked={session.timing.timerVisible}
      disabled={saving || retryRequired}
      onChange={() => actions.toggleTimer()}
      type="checkbox"
    /> Show the timer
    </label>
    <p className="field-hint">{session.timing.autoSubmit
      ? "Strict auto-submit is active for this saved simulation."
      : "Strict auto-submit is off; reaching zero does not submit."}</p>
  </section>
}

export const SimulationPlayer = ({
  controller,
  position
}: {
  readonly controller: SimulationPlayerController
  readonly position: number
}) => {
  return <SimulationPlayerProvider controller={controller}><SimulationPlayerView position={position} /></SimulationPlayerProvider>
}

const SimulationPlayerView = ({ position }: { readonly position: number }) => {
  const { state: snapshot, actions, meta: { errorRef, recoverableErrorRef, confirmationRef, presentationToggleRef } } = useSimulationPlayer()
  const currentItemRef = useRef<HTMLAnchorElement>(null)
  const announcement = <p aria-live="polite" className="sr-only">{snapshot.announcementRequest?.message ?? ""}</p>

  if (snapshot.state.tag === "restoring") {
    return <>{announcement}<section className="review-state" aria-busy="true">
      <h1>Restoring your simulation</h1>
      <p>Reading your saved simulation and responses from this device.</p>
    </section></>
  }
  if (snapshot.state.tag === "failure") {
    return <>{announcement}<section className="error-panel" role="alert">
      <h1 ref={errorRef} tabIndex={-1}>Simulation storage is unavailable</h1>
      <p>{snapshot.state.detail}</p>
      <button className="button button-primary" onClick={() => actions.retry()} type="button">Retry</button>
      <p><a href="/simulations/">Start a new simulation</a></p>
    </section></>
  }

  const { session } = snapshot.state
  const saving = snapshot.state.saving
  const recoverableError = snapshot.state.recoverableError
  const answerEditBlocked = saving || snapshot.state.strictExpiryPending ||
    recoverableError?.kind === "timer" || recoverableError?.kind === "submission"
  const item = session.items[position - 1]
  if (item === undefined) {
    return <section className="error-panel" role="alert"><h1>Question unavailable</h1><p>This position is outside your saved simulation.</p></section>
  }
  const itemId = simulationItemId(item)
  const response = session.responses.find((candidate) => candidate.questionId === itemId)
  const answered = session.responses.filter((candidate) =>
    candidate.selectedOptionId !== null ||
    (candidate.markers?.length ?? 0) > 0 ||
    (candidate.selectedZoneOrders?.length ?? 0) > 0 ||
    candidate.zeroHazardsConfirmed === true
  ).length
  const flagged = session.responses.filter((candidate) => candidate.reviewIntent === "flagged").length
  const navigationBlocked = saving || recoverableError !== null

  return <>
    {announcement}
    {recoverableError === null ? null : <section
      aria-labelledby="simulation-save-error-heading"
      className="status-panel status-panel-danger"
      role="alert"
    >
      <h2 id="simulation-save-error-heading" ref={recoverableErrorRef} tabIndex={-1}>{recoverableError.kind === "response"
        ? "Response not saved"
        : recoverableError.kind === "timer"
          ? "Timer preference not saved"
          : "Final submission not saved"}</h2>
      <p>{recoverableError.detail}</p>
      <p>{recoverableError.kind === "response"
        ? "Your selected answer and flag remain visible. Retry this exact local save, or make a different answer edit to replace it."
        : "The saved simulation remains available and this exact operation can be retried."}</p>
      <button
        className="button button-primary"
        onClick={() => actions.retrySave()}
        type="button"
      >{recoverableError.kind === "submission" ? "Retry final submission" : "Retry this exact local save"}</button>
    </section>}
    <p className="source-note simulation-profile-note">
      <strong>Study material: {session.profile.label}.</strong>{" "}
      <a href="/simulations/">Set up another simulation</a>.
    </p>
    <div className="simulation-workspace">
    <div className="simulation-main">
    {"question" in item ? <SimulationQuestionProvider
      state={{ snapshot: snapshot.state, item, position, response, answerEditBlocked }}
      meta={{ presentationToggleRef }}>
      <SimulationQuestionRoute />
    </SimulationQuestionProvider> : <SimulationHazardItem
      answerEditBlocked={session.status !== "active" || answerEditBlocked}
      item={item}
      position={position}
      response={response}
      saving={saving}
      total={session.actualLength}
      visualAssetUrl={snapshot.state.visualAssetUrl}
    />}
    <nav aria-label="Previous and next simulation items" className="simulation-step-actions">
      {position > 1 ? navigationBlocked
        ? <button className="button button-secondary" disabled type="button">← Previous</button>
        : <a className="button button-secondary" data-session-history="replace" href={simulationQuestionPath(session.id, position - 1)}>← Previous</a>
        : <span />}
      {position < session.actualLength ? navigationBlocked
        ? <button className="button button-primary" disabled type="button">Next item →</button>
        : <a className="button button-primary" data-session-history="replace" href={simulationQuestionPath(session.id, position + 1)}>Next item →</a>
        : <a className="button button-secondary" href="#simulation-items-heading">Review your answers</a>}
    </nav>
    </div>
    <aside className="simulation-rail" aria-label="Simulation progress and timing">
    <nav className="simulation-navigator" aria-label="Simulation items">
      <div className="player-heading-row">
        <h2 id="simulation-items-heading">Item {position} of {session.actualLength}</h2>
      </div>
      <p className="simulation-progress-label">{answered} recorded, {session.actualLength - answered} unanswered, {flagged} flagged. You are on item {position}.</p>
      <ol className="simulation-item-grid">
        {session.items.map((candidate) => {
          const candidateId = simulationItemId(candidate)
          const saved = session.responses.find((value) => value.questionId === candidateId)
          const savedAnswered = saved?.selectedOptionId !== null && saved?.selectedOptionId !== undefined ||
            (saved?.markers?.length ?? 0) > 0 ||
            (saved?.selectedZoneOrders?.length ?? 0) > 0 ||
            saved?.zeroHazardsConfirmed === true
          const label = [
            `${session.format === "questions" ? "Question" : "Hazard item"} ${candidate.position}`,
            candidate.position === position ? "current" : undefined,
            savedAnswered ? "answered" : "unanswered",
            saved?.reviewIntent === "flagged" ? "flagged" : undefined
          ].filter(Boolean).join(", ")
          return <li
            className="simulation-item"
            data-answered={savedAnswered || undefined}
            data-current={candidate.position === position || undefined}
            data-flagged={saved?.reviewIntent === "flagged" || undefined}
            key={candidateId}
          >
            {saving || recoverableError !== null
              ? <span aria-label={`${label}; navigation waits for local save`}>{candidate.position}<small aria-hidden="true">{saved?.reviewIntent === "flagged" ? "⚑" : savedAnswered ? "✓" : ""}</small></span>
              : <a
                  ref={candidate.position === position ? currentItemRef : undefined}
                  aria-current={candidate.position === position ? "step" : undefined}
                  aria-label={label}
                  data-session-history="replace"
                  href={simulationQuestionPath(session.id, candidate.position)}
                >{candidate.position}<small aria-hidden="true">{saved?.reviewIntent === "flagged" ? "⚑" : savedAnswered ? "✓" : ""}</small></a>}
          </li>
        })}
      </ol>
      <ul className="simulation-navigator-key">
        <li><span aria-hidden="true" className="simulation-key-recorded" /> Recorded</li>
        <li><span aria-hidden="true" className="simulation-key-unanswered" /> Unanswered</li>
        <li><span aria-hidden="true" className="simulation-key-flagged" /> Flagged ⚑</li>
        <li><span aria-hidden="true" className="simulation-key-current" /> Current</li>
      </ul>
      <button
        className="button button-primary"
        disabled={saving || recoverableError !== null}
        hidden={snapshot.state.confirmation}
        onClick={() => actions.openConfirmation()}
        type="button"
      >Review and submit simulation</button>
    {snapshot.state.confirmation && <section className="reference-card simulation-confirmation" aria-labelledby="final-submit-heading">
      <h2 id="final-submit-heading" ref={confirmationRef} tabIndex={-1}>Submit final answers?</h2>
      <p>{session.actualLength - answered} of {session.actualLength} items are unanswered and {flagged} are flagged. Unanswered items will count as unanswered in the practice result.</p>
      <p>After final submission, answers cannot be edited. The submission is saved locally before any answer or explanation content is requested.</p>
      <div className="question-controls">
        <button className="button button-primary" disabled={saving} onClick={() => actions.submitFinal()} type="button">Submit final answers</button>
        <button className="button button-secondary" disabled={saving} onClick={() => { actions.cancelConfirmation(); currentItemRef.current?.focus() }} type="button">Continue editing</button>
      </div>
    </section>}
    </nav>
    <SimulationTimer
      retryRequired={recoverableError !== null}
      saving={saving}
      session={session}
      strictExpiryPending={snapshot.state.strictExpiryPending}
    />
    </aside>
    </div>


  </>
}

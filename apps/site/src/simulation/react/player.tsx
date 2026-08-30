import { useEffect, useRef, useState, useSyncExternalStore } from "react"
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
  controller,
  retryRequired,
  saving,
  session,
  strictExpiryPending
}: {
  readonly controller: SimulationPlayerController
  readonly retryRequired: boolean
  readonly saving: boolean
  readonly session: SimulationSessionRecord
  readonly strictExpiryPending: boolean
}) => {
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
      controller.dispatch({ tag: "timer-expired" })
    }
  }, [controller, remaining, session.timing.autoSubmit])

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
    <button
      className="button button-secondary"
      disabled={saving || retryRequired}
      onClick={() => controller.dispatch({ tag: "toggle-timer" })}
      type="button"
    >{session.timing.timerVisible ? "Hide timer" : "Show timer"}</button>
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
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const errorRef = useRef<HTMLHeadingElement>(null)
  const recoverableErrorRef = useRef<HTMLHeadingElement>(null)
  const confirmationRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "error") errorRef.current?.focus()
    if (snapshot.focusRequest?.target === "recoverable-error") recoverableErrorRef.current?.focus()
    if (snapshot.focusRequest?.target === "confirmation") confirmationRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])
  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])
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
      <button className="button button-primary" onClick={() => controller.dispatch({ tag: "retry" })} type="button">Retry</button>
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
        onClick={() => controller.dispatch({ tag: "retry-save" })}
        type="button"
      >{recoverableError.kind === "submission" ? "Retry final submission" : "Retry this exact local save"}</button>
    </section>}
    <SimulationTimer
      controller={controller}
      retryRequired={recoverableError !== null}
      saving={saving}
      session={session}
      strictExpiryPending={snapshot.state.strictExpiryPending}
    />
    <p className="source-note">
      <strong>Practicing for: {session.profile.label}.</strong>{" "}
      <a href="/simulations/">Start a new simulation to choose a different profile</a>.
    </p>
    {"question" in item ? <article className="question-card" aria-labelledby="simulation-question-heading">
      <header className="question-prompt">
        <p className="eyebrow">Practice simulation · Question {position} of {session.actualLength}</p>
        <h1 id="simulation-question-heading">{item.question.prompt}</h1>
        <p>Choose one answer. You can edit it until final submission. Feedback is not loaded during the simulation.</p>
      </header>
      <fieldset disabled={session.status !== "active" || answerEditBlocked}>
        <legend className="sr-only">Answer choices</legend>
        <div className="answer-list">
          {item.optionOrder.map((optionId) => {
            const option = item.question.options.find((candidate) => candidate.id === optionId)
            if (option === undefined) return null
            return <label className="answer-option" key={option.id}>
              <input
                checked={response?.selectedOptionId === option.id}
                name={`simulation-${item.question.id}`}
                onChange={() => controller.dispatch({ tag: "select-option", optionId: option.id })}
                type="radio"
                value={option.id}
              />
              <span>{option.label}</span>
            </label>
          })}
        </div>
      </fieldset>
      <div className="question-controls">
        <button
          aria-pressed={response?.reviewIntent === "flagged"}
          className="button button-secondary"
          disabled={answerEditBlocked}
          onClick={() => controller.dispatch({ tag: "toggle-flag" })}
          type="button"
        >{response?.reviewIntent === "flagged" ? "Flagged for review" : "Flag this question"}</button>
        <span aria-live="polite" className="source-note">{saving
          ? "Saving locally…"
          : recoverableError === null
            ? "Saved on this device"
            : "Not yet saved; retry required"}</span>
      </div>
    </article> : <SimulationHazardItem
      answerEditBlocked={session.status !== "active" || answerEditBlocked}
      controller={controller}
      item={item}
      position={position}
      response={response}
      saving={saving}
      total={session.actualLength}
      visualAssetUrl={snapshot.state.visualAssetUrl}
    />}

    <nav className="simulation-navigator section-gap" aria-label="Simulation items">
      <h2>Item navigator</h2>
      <ol className="tag-list">
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
          return <li key={candidateId}>
            {saving || recoverableError !== null
              ? <span aria-label={`${label}; navigation waits for local save`}>{candidate.position}</span>
              : <a
                  aria-current={candidate.position === position ? "step" : undefined}
                  aria-label={label}
                  data-session-history="replace"
                  href={simulationQuestionPath(session.id, candidate.position)}
                >{candidate.position}</a>}
          </li>
        })}
      </ol>
      <p>{answered} answered · {session.actualLength - answered} unanswered</p>
      <button
        className="button button-primary"
        disabled={saving || recoverableError !== null}
        onClick={() => controller.dispatch({ tag: "open-confirmation" })}
        type="button"
      >Review and submit simulation</button>
    </nav>

    {snapshot.state.confirmation && <section className="reference-card section-gap" aria-labelledby="final-submit-heading">
      <h2 id="final-submit-heading" ref={confirmationRef} tabIndex={-1}>Submit final answers?</h2>
      <p>{answered} of {session.actualLength} items are answered. {session.actualLength - answered} unanswered items will count as unanswered in the practice result.</p>
      <p>After final submission, answers cannot be edited. The submission is saved locally before any answer or explanation content is requested.</p>
      <div className="question-controls">
        <button className="button button-primary" disabled={saving} onClick={() => controller.dispatch({ tag: "submit-final" })} type="button">Submit final answers</button>
        <button className="button button-secondary" disabled={saving} onClick={() => controller.dispatch({ tag: "cancel-confirmation" })} type="button">Continue editing</button>
      </div>
    </section>}
  </>
}

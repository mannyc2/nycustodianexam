import { useEffect, useRef, useSyncExternalStore } from "react"
import type { ReviewController } from "../controller.ts"
import type { ReviewQuarantine, ReviewQueueItem, ReviewReason } from "../model.ts"

const reasonLabel = (reason: ReviewReason): string => {
  switch (reason.tag) {
    case "flag":
      return "You explicitly flagged this question for review."
    case "directional_confusion":
      return `Directional confusion: correct ${reason.correctConceptId} → selected ${reason.selectedConceptId}.`
    case "hazard_miss":
      return `Missed authored hazard: ${reason.inventoryId}.`
    case "decoy_false_positive":
      return `Marked an authored safe decoy: ${reason.inventoryId}.`
    case "general_false_positive":
      return `Placed a general false-positive marker: ${reason.markerId}.`
  }
}

const ReviewReasons = ({ reasons }: { readonly reasons: ReadonlyArray<ReviewReason> }) => (
  <ul className="review-reason-list">
    {reasons.map((reason, index) => (
      <li key={`${reason.tag}-${index}`}>{reasonLabel(reason)}</li>
    ))}
  </ul>
)

const ReviewItems = ({
  acknowledgingItemId,
  disabled,
  items,
  onAcknowledge
}: {
  readonly acknowledgingItemId: string | null
  readonly disabled: boolean
  readonly items: ReadonlyArray<ReviewQueueItem>
  readonly onAcknowledge: (itemId: string) => void
}) => (
  <ol className="review-queue-list">
    {items.map((item) => {
      const acknowledging = acknowledgingItemId === item.id
      return (
        <li key={item.id}>
          <article className="review-item-card">
            <p className="eyebrow">
              {item.kind === "question" ? "Question review" : "Visual hazard review"}
            </p>
            <h3>{item.kind === "question" ? "Review the saved answer" : "Review the saved scene response"}</h3>
            <ReviewReasons reasons={item.reasons} />
            <div className="question-controls">
              <a className="button button-secondary" href={item.itemUrl}>Open saved feedback</a>
              <button
                className="button button-primary"
                disabled={disabled}
                onClick={() => onAcknowledge(item.id)}
                type="button"
              >
                {acknowledging ? "Saving acknowledgement…" : "Acknowledge review"}
              </button>
            </div>
          </article>
        </li>
      )
    })}
  </ol>
)

const ReviewQuarantines = ({
  quarantined
}: {
  readonly quarantined: ReadonlyArray<ReviewQuarantine>
}) => quarantined.length === 0 ? null : (
  <aside className="review-quarantine" aria-labelledby="review-quarantine-heading">
    <h3 id="review-quarantine-heading">Saved attempts needing attention</h3>
    <p>
      These attempts remain stored, but their exact feedback could not be verified. They were not
      replaced with another item.
    </p>
    <ul>
      {quarantined.map((entry) => (
        <li key={entry.id}>
          <strong>{entry.kind === "question" ? "Question attempt" : "Visual hazard attempt"}</strong>
          {`: ${entry.detail}`}
        </li>
      ))}
    </ul>
  </aside>
)

export const ReviewQueueIsland = ({ controller }: { readonly controller: ReviewController }) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const state = snapshot.state
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null)
  const focusError = state.tag === "recoverable_error"
  const focusCompletedEmpty = state.tag === "empty" && state.origin === "acknowledgement"

  useEffect(() => {
    if (focusError) errorHeadingRef.current?.focus()
  }, [focusError])

  useEffect(() => {
    if (focusCompletedEmpty) emptyHeadingRef.current?.focus()
  }, [focusCompletedEmpty])

  if (state.tag === "loading") {
    return (
      <section className="review-state" aria-labelledby="review-queue-heading">
        <h2 id="review-queue-heading">Loading your local review queue</h2>
        <p role="status">
          {state.action === "rebuild"
            ? "Rebuilding from saved attempts and review acknowledgements…"
            : "Reading validated attempts stored on this device…"}
        </p>
      </section>
    )
  }

  if (state.tag === "empty") {
    return (
      <section className="review-state review-empty" aria-labelledby="review-queue-heading">
        <h2 id="review-queue-heading" ref={emptyHeadingRef} tabIndex={-1}>No review items are due</h2>
        <p>
          This is a successful local result. Correct unflagged answers, nonvisual zone attempts,
          and explicitly acknowledged items do not create a due item here.
        </p>
        <div className="question-controls">
          <a className="button button-primary" href="/practice/">Practice questions</a>
          <a className="button button-secondary" href="/hazards/">Practice hazard scanning</a>
          <button
            className="button button-secondary"
            onClick={() => controller.dispatch({ tag: "rebuild" })}
            type="button"
          >
            Rebuild review queue
          </button>
        </div>
      </section>
    )
  }

  if (state.tag === "recoverable_error") {
    return (
      <section className="review-state review-error" aria-labelledby="review-error-heading" role="alert">
        <h2 id="review-error-heading" ref={errorHeadingRef} tabIndex={-1}>
          {state.operation === "acknowledge"
            ? "Review acknowledgement was not saved"
            : "Review queue could not be built"}
        </h2>
        <p>{state.detail}</p>
        <p>No saved attempt was deleted or replaced.</p>
        <div className="question-controls">
          <button
            className="button button-primary"
            onClick={() => controller.dispatch({ tag: "retry" })}
            type="button"
          >
            Retry
          </button>
          <button
            className="button button-secondary"
            onClick={() => controller.dispatch({ tag: "rebuild" })}
            type="button"
          >
            Rebuild review queue
          </button>
        </div>
        {state.items.length === 0 ? null : (
          <ReviewItems
            acknowledgingItemId={null}
            disabled={true}
            items={state.items}
            onAcknowledge={() => undefined}
          />
        )}
        <ReviewQuarantines quarantined={state.quarantined} />
      </section>
    )
  }

  return (
    <section className="review-state" aria-labelledby="review-queue-heading">
      <div className="review-heading-row">
        <div>
          <p className="eyebrow">Due from this device</p>
          <h2 id="review-queue-heading">
            {state.items.length} {state.items.length === 1 ? "item" : "items"} to review
          </h2>
        </div>
        <button
          className="button button-secondary"
          disabled={state.acknowledgingItemId !== null}
          onClick={() => controller.dispatch({ tag: "rebuild" })}
          type="button"
        >
          Rebuild review queue
        </button>
      </div>
      <p className="source-note">
        Opening feedback does not mark an item reviewed. Only the explicit acknowledgement below
        removes its current reason set from this queue.
      </p>
      {state.items.length === 0 ? null : (
        <ReviewItems
          acknowledgingItemId={state.acknowledgingItemId}
          disabled={state.acknowledgingItemId !== null}
          items={state.items}
          onAcknowledge={(itemId) => controller.dispatch({ tag: "acknowledge", itemId })}
        />
      )}
      <ReviewQuarantines quarantined={state.quarantined} />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {state.acknowledgingItemId === null ? "Review queue ready." : "Saving review acknowledgement."}
      </p>
    </section>
  )
}

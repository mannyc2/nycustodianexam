import { draftFromState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

export const HazardCommitControls = () => {
  const { actions, meta, mode, state } = useHazardPlayer()
  const draft = draftFromState(state)
  const selectedCount = mode === "visual"
    ? draft.markers.length
    : draft.selectedZoneOrders.length

  if (state.tag === "restoring") {
    return (
      <section aria-busy="true" aria-live="polite" className="hazard-player__commit-status">
        <h2>Restoring this scene</h2>
        <p>Checking durable study storage before accepting a new response.</p>
      </section>
    )
  }

  if (state.tag === "restore_failed") {
    return (
      <section className="feedback feedback-error" role="alert">
        <h2 ref={meta.errorHeadingRef} tabIndex={-1}>Study storage is unavailable</h2>
        <p>{state.message}</p>
        <button className="button button-primary" onClick={actions.retryRestore} type="button">
          Retry storage
        </button>
      </section>
    )
  }

  if (state.tag === "content_unavailable") {
    return (
      <section className="feedback feedback-error" role="alert">
        <h2 ref={meta.errorHeadingRef} tabIndex={-1}>
          Required study content is unavailable
        </h2>
        <p>{state.message}</p>
        <button className="button button-secondary" onClick={actions.retryRestore} type="button">
          Check content again
        </button>
      </section>
    )
  }

  if (state.tag === "asset_unavailable") return null

  if (state.tag === "confirm_zero") {
    return (
      <section aria-labelledby={`${meta.instanceId}-zero-heading`} className="hazard-player__zero-confirm">
        <h2 id={`${meta.instanceId}-zero-heading`} ref={meta.zeroHeadingRef} tabIndex={-1}>
          Submit without marking a concern?
        </h2>
        <p>
          This records that you chose no locations. It does not indicate whether this scene
          contains a condition that needs correction.
        </p>
        <button className="button button-primary" onClick={actions.confirmZero} type="button">
          Confirm and save no marks
        </button>
        <button className="button button-secondary" onClick={actions.cancelZero} type="button">
          Return to the scene
        </button>
      </section>
    )
  }

  if (state.tag === "reveal_failed") {
    return (
      <section className="feedback feedback-error" role="alert">
        <h2 ref={meta.errorHeadingRef} tabIndex={-1}>Your response is saved</h2>
        <p>{state.message}</p>
        <p>Your committed markers cannot be changed. Retrying loads only the matching feedback.</p>
        <button className="button button-primary" onClick={actions.retryReveal} type="button">
          Retry feedback
        </button>
      </section>
    )
  }

  if (state.tag === "revealed") return null

  return (
    <section
      aria-busy={state.tag === "committing"}
      aria-labelledby={`${meta.instanceId}-commit-heading`}
      className="hazard-player__commit"
    >
      <h2 id={`${meta.instanceId}-commit-heading`}>Save this response</h2>
      {state.tag === "commit_failed" ? (
        <div className="feedback feedback-error" role="alert">
          <h3 ref={meta.errorHeadingRef} tabIndex={-1}>Your response was not saved</h3>
          <p>{state.message}</p>
        </div>
      ) : null}
      <p>
        {selectedCount === 0
          ? "You have not marked a concern. Submitting opens a neutral confirmation."
          : `${selectedCount} ${selectedCount === 1 ? "location is" : "locations are"} ready to save.`}
      </p>
      <button
        className="button button-primary"
        disabled={state.tag === "committing"}
        onClick={state.tag === "commit_failed" ? actions.retryCommit : actions.requestCommit}
        type="button"
      >
        {state.tag === "committing"
          ? "Saving response…"
          : state.tag === "commit_failed"
            ? "Retry saving response"
            : "Submit scene response"}
      </button>
    </section>
  )
}

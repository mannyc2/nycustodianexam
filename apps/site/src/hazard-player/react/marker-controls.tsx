import type { ReactNode } from "react"
import { assessVisualMarkers, type MarkerAssessment } from "../assessment.ts"
import type { ReleasedPostcommitScene } from "../attempt.ts"
import { decoyFeedbackForScene, targetFeedbackForScene } from "../released-scene.ts"
import { draftFromState, isEditableHazardState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

const markerFeedback = (
  assessment: MarkerAssessment,
  payload: ReleasedPostcommitScene
): ReactNode => {
  if (assessment.kind === "false_positive") {
    return (
      <p>
        This mark does not match a recorded condition. It counts as an extra mark, but the site
        cannot say what that object means.
      </p>
    )
  }

  if (assessment.kind === "decoy_false_positive") {
    const decoy = decoyFeedbackForScene(payload, assessment.inventoryId)
    return (
      <p>
        <strong>Safe as shown.</strong>{" "}
        {decoy === undefined
          ? "The detail you marked is safe as depicted in this scene."
          : `${decoy.observableCondition.replace(/\.$/, "")}. Safe as depicted: ${decoy.safeAsDepicted}`}
      </p>
    )
  }

  const target = targetFeedbackForScene(payload, assessment.inventoryId)
  if (assessment.kind === "duplicate") {
    return (
      <p>
        <strong>Already marked.</strong>{" "}
        {target === undefined
          ? "Another marker already covers this hazard."
          : `Another marker already covers ${target.observableCondition}.`}
      </p>
    )
  }

  return (
    <p>
      <strong>Hazard found.</strong>{" "}
      {target === undefined
        ? "This marker matches a condition that needs correction."
        : `${target.observableCondition.replace(/\.$/, "")}. Immediate correction: ${target.immediateCorrection}`}
    </p>
  )
}

const markerStep = 0.025

export const HazardMarkerControls = () => {
  const { actions, meta, state } = useHazardPlayer()
  const editable = isEditableHazardState(state)
  const markers = draftFromState(state).markers
  const saved = state.tag === "revealed" || state.tag === "reveal_failed"
  const assessment = state.tag === "revealed" ? assessVisualMarkers(markers, state.payload) : null

  return (
    <section aria-labelledby={`${meta.instanceId}-marker-list`} className="hazard-player__markers">
      <h2 id={`${meta.instanceId}-marker-list`}>Your markers</h2>
      <p aria-live="polite">
        {markers.length === 0
          ? "No markers placed."
          : `${markers.length} ${markers.length === 1 ? "marker" : "markers"} placed.`}
      </p>
      {markers.length === 0 ? null : (
        <ol className="hazard-player__marker-list">
          {markers.map((marker, index) => (
            <li key={marker.id}>
              <p>
                <span aria-hidden="true" className="player-marker-number">{index + 1}</span>{" "}
                <strong>Marker {index + 1}</strong>: {Math.round(marker.x * 100)}% from the
                left, {Math.round(marker.y * 100)}% from the top
              </p>
              {saved ? null : <div aria-label={`Move marker ${index + 1}`} className="hazard-player__marker-moves">
                <button
                  aria-label={`Move marker ${index + 1} left`}
                  disabled={!editable}
                  onClick={() => actions.moveMarker(marker.id, -markerStep, 0)}
                  type="button"
                >
                  Left
                </button>
                <button
                  aria-label={`Move marker ${index + 1} right`}
                  disabled={!editable}
                  onClick={() => actions.moveMarker(marker.id, markerStep, 0)}
                  type="button"
                >
                  Right
                </button>
                <button
                  aria-label={`Move marker ${index + 1} up`}
                  disabled={!editable}
                  onClick={() => actions.moveMarker(marker.id, 0, -markerStep)}
                  type="button"
                >
                  Up
                </button>
                <button
                  aria-label={`Move marker ${index + 1} down`}
                  disabled={!editable}
                  onClick={() => actions.moveMarker(marker.id, 0, markerStep)}
                  type="button"
                >
                  Down
                </button>
                <button
                  aria-label={`Remove marker ${index + 1}`}
                  disabled={!editable}
                  onClick={() => actions.removeMarker(marker.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>}
              {state.tag === "revealed" && assessment?.markers[index] !== undefined ? (
                <div className={`hazard-player__marker-feedback hazard-marker-${assessment.markers[index].kind}`}>
                  {markerFeedback(assessment.markers[index], state.payload)}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

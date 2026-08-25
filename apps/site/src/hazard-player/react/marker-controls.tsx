import { draftFromState, isEditableHazardState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

const markerStep = 0.025

export const HazardMarkerControls = () => {
  const { actions, meta, state } = useHazardPlayer()
  const editable = isEditableHazardState(state)
  const markers = draftFromState(state).markers

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
                <strong>Marker {index + 1}</strong>: {Math.round(marker.x * 100)}% from the
                left, {Math.round(marker.y * 100)}% from the top
              </p>
              <div aria-label={`Move marker ${index + 1}`} className="hazard-player__marker-moves">
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
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

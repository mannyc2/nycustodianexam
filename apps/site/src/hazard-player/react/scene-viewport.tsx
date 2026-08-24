import {
  useCallback,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode
} from "react"
import { draftFromState, isEditableHazardState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

export const HazardFrame = ({ children }: { readonly children: ReactNode }) => (
  <article className="hazard-player" aria-labelledby="hazard-scene-heading">
    {children}
  </article>
)

export const HazardPrompt = () => {
  const { meta, mode, scene } = useHazardPlayer()
  return (
    <header className="hazard-player__prompt">
      <p className="eyebrow">Hazard laboratory · original practice scene</p>
      <h1 id="hazard-scene-heading" ref={meta.sceneHeadingRef} tabIndex={-1}>
        Inspect the {scene.environment}
      </h1>
      <p>{scene.neutralPreAnswer.overview}</p>
      <p>
        {mode === "visual"
          ? "Mark every location that concerns you. You may submit no markers after confirming that choice."
          : "Review each observable zone and select every area that concerns you. This text task is an equivalent knowledge activity, not the same visual-recognition task."}
      </p>
      <p>No feedback or expected count is available until your response is saved.</p>
    </header>
  )
}

export const HazardSceneViewport = () => {
  const { actions, meta, scene, state, visualAssetUrl } = useHazardPlayer()
  const [zoom, setZoom] = useState(1)
  const editable = isEditableHazardState(state)
  const draft = draftFromState(state)

  const addPointerMarker = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!editable || event.button !== 0) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return
      actions.addMarker(
        (event.clientX - bounds.left) / bounds.width,
        (event.clientY - bounds.top) / bounds.height
      )
    },
    [actions, editable]
  )

  if (visualAssetUrl === null) {
    return (
      <section className="feedback feedback-error" role="alert">
        <h2 ref={meta.errorHeadingRef} tabIndex={-1}>Released scene image unavailable</h2>
        <p>This activity cannot accept visual markers without its exact released image.</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="visual-scene-heading" className="hazard-player__visual">
      <h2 id="visual-scene-heading">Scene</h2>
      <div aria-label="Scene view controls" className="hazard-player__viewport-controls">
        <button
          className="button button-secondary"
          disabled={zoom <= 1}
          onClick={() => setZoom((current) => Math.max(1, current - 0.25))}
          type="button"
        >
          Zoom out
        </button>
        <button
          className="button button-secondary"
          disabled={zoom >= 2.5}
          onClick={() => setZoom((current) => Math.min(2.5, current + 0.25))}
          type="button"
        >
          Zoom in
        </button>
        <button
          className="button button-secondary"
          disabled={zoom === 1}
          onClick={() => setZoom(1)}
          type="button"
        >
          Reset view
        </button>
        <span aria-live="polite">{Math.round(zoom * 100)}% view</span>
      </div>
      <p id="scene-pointer-instructions">
        Pointer users may place a marker on the image. Keyboard and touch users can add a
        centered marker, then move it with the controls below.
      </p>
      <div
        className="hazard-player__viewport"
        style={{ maxWidth: "100%", overflow: "auto" }}
      >
        <div
          aria-describedby="scene-pointer-instructions"
          className="hazard-player__image-layer"
          onClick={addPointerMarker}
          style={{
            cursor: editable ? "crosshair" : "default",
            position: "relative",
            width: `${zoom * 100}%`
          }}
        >
          <img
            alt={scene.neutralPreAnswer.overview}
            draggable={false}
            src={visualAssetUrl}
            style={{ display: "block", height: "auto", width: "100%" }}
          />
          {draft.markers.map((marker, index) => (
            <span
              aria-hidden="true"
              className="hazard-player__marker"
              key={marker.id}
              style={{
                left: `${marker.x * 100}%`,
                position: "absolute",
                top: `${marker.y * 100}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
      <button
        className="button button-secondary"
        disabled={!editable}
        onClick={() => actions.addMarker(0.5, 0.5)}
        type="button"
      >
        Add marker at center
      </button>
    </section>
  )
}

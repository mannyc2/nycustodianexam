import {
  useCallback,
  useRef,
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
      <p className="eyebrow">Hazard practice · original scene</p>
      <h1 id="hazard-scene-heading" ref={meta.sceneHeadingRef} tabIndex={-1}>
        Inspect the {scene.environment}
      </h1>
      <p>{scene.neutralPreAnswer.overview}</p>
      <p>
        {mode === "visual"
          ? "Mark every location that concerns you. You may submit no markers after confirming that choice."
          : "Review each zone and select every area that concerns you. This text version covers the same knowledge, but it is not the same task as marking the image."}
      </p>
      <p>No feedback or expected count is available until your response is saved.</p>
    </header>
  )
}

export const HazardSceneViewport = () => {
  const { actions, meta, scene, state, visualAssetUrl } = useHazardPlayer()
  const [zoom, setZoom] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const editable = isEditableHazardState(state)
  const draft = draftFromState(state)

  const panViewport = useCallback((horizontal: -1 | 0 | 1, vertical: -1 | 0 | 1) => {
    const viewport = viewportRef.current
    if (viewport === null) return
    viewport.scrollBy({
      behavior: "auto",
      left: horizontal * Math.max(44, viewport.clientWidth * 0.4),
      top: vertical * Math.max(44, viewport.clientHeight * 0.4)
    })
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    viewportRef.current?.scrollTo({ behavior: "auto", left: 0, top: 0 })
  }, [])

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
    if (state.tag === "restoring") {
      return <p role="status">Loading the exact released scene…</p>
    }
    if (state.tag !== "asset_unavailable") return null
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
          aria-controls={`${meta.instanceId}-scene-viewport`}
          className="button button-secondary"
          disabled={zoom <= 1}
          onClick={() => panViewport(-1, 0)}
          type="button"
        >
          Pan left
        </button>
        <button
          aria-controls={`${meta.instanceId}-scene-viewport`}
          className="button button-secondary"
          disabled={zoom <= 1}
          onClick={() => panViewport(1, 0)}
          type="button"
        >
          Pan right
        </button>
        <button
          aria-controls={`${meta.instanceId}-scene-viewport`}
          className="button button-secondary"
          disabled={zoom <= 1}
          onClick={() => panViewport(0, -1)}
          type="button"
        >
          Pan up
        </button>
        <button
          aria-controls={`${meta.instanceId}-scene-viewport`}
          className="button button-secondary"
          disabled={zoom <= 1}
          onClick={() => panViewport(0, 1)}
          type="button"
        >
          Pan down
        </button>
        <button
          className="button button-secondary"
          disabled={zoom === 1}
          onClick={resetView}
          type="button"
        >
          Reset view
        </button>
        <span aria-live="polite">{Math.round(zoom * 100)}% view</span>
      </div>
      <p id="scene-pointer-instructions">
        Pointer users may place a marker on the image. Keyboard and touch users can add a
        centered marker, then move it with the controls below. Use the directional pan
        controls to inspect a zoomed scene without dragging.
      </p>
      <div
        aria-label="Pannable hazard scene"
        className="hazard-player__viewport"
        id={`${meta.instanceId}-scene-viewport`}
        ref={viewportRef}
        role="region"
        style={{
          aspectRatio: "3 / 2",
          maxWidth: "100%",
          overflow: "auto",
          overscrollBehavior: "contain"
        }}
        tabIndex={0}
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

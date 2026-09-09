import { NeutralSceneImage } from "./neutral-scene-image.tsx"
import { SceneViewportControls, useSceneViewport } from "./viewport-controls.tsx"
import {
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type ReactNode
} from "react"
import { draftFromState, isEditableHazardState } from "../state.ts"
import { AnnotatedHazardScene } from "./annotated-scene.tsx"
import { useHazardPlayer } from "./context.tsx"

export const HazardFrame = ({ children }: { readonly children: ReactNode }) => (
  <article className="hazard-player study-player" aria-labelledby="hazard-scene-heading">
    {children}
  </article>
)

export const HazardPrompt = ({ positionLabel = "Hazard practice" }: { readonly positionLabel?: string }) => {
  const { meta, mode, scene } = useHazardPlayer()
  return (
    <header className="hazard-player__prompt">
      <div className="player-heading-row">
        <span className="player-position">{positionLabel} · Original scene</span>
        <span className="player-mode-label">{mode === "visual" ? "Visual practice" : "Text version"}</span>
      </div>
      <h1 id="hazard-scene-heading" ref={meta.sceneHeadingRef} tabIndex={-1}>
        Inspect the {scene.environment}
      </h1>
      <p>{scene.neutralPreAnswer.overview}</p>
      <p>
        {mode === "visual"
          ? "Mark as many or as few places as you think need attention. Submitting no marks is a valid answer and asks for confirmation."
          : "Review each zone and select every area that concerns you. This text version covers the same knowledge, but it is not the same task as marking the image."}
      </p>
      <p className="player-selection-note">Inspect the whole scene. Feedback appears after you save your response.</p>
    </header>
  )
}

export const HazardSceneViewport = () => {
  const { actions, meta, scene, state, visualAssetUrl } = useHazardPlayer()
  const view = useSceneViewport()
  const { zoom, viewportRef } = view
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

  const displayedImageUrl = state.tag === "revealed"
    ? state.retainedVisualAsset?.dataUrl ?? visualAssetUrl
    : visualAssetUrl

  if (displayedImageUrl === null) {
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
      <SceneViewportControls viewportId={`${meta.instanceId}-scene-viewport`} view={view} />
      <p id="scene-pointer-instructions">
        {state.tag === "revealed"
          ? "Reviewed scene overlay. Numbered markers match the feedback list. Solid regions show conditions needing correction; dashed regions show details that are safe as depicted. Use zoom and pan to inspect the scene."
          : "Pointer users may place a marker on the image. Keyboard and touch users can add a centered marker, then move it with the controls below. Use the directional pan controls to inspect a zoomed scene without dragging."}
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
          {state.tag === "revealed" ? (
            <AnnotatedHazardScene
              alt={scene.neutralPreAnswer.overview}
              imageUrl={displayedImageUrl}
              markers={draft.markers}
              payload={state.payload}
            />
          ) : <NeutralSceneImage alt={scene.neutralPreAnswer.overview} imageUrl={displayedImageUrl} markers={draft.markers} />}

        </div>
      </div>
      {state.tag === "revealed" || state.tag === "reveal_failed" ? null : <button
        className="button button-secondary"
        disabled={!editable}
        onClick={() => actions.addMarker(0.5, 0.5)}
        type="button"
      >
        Add marker at center
      </button>}
    </section>
  )
}

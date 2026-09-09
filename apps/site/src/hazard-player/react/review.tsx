import type { ReactNode } from "react"
import { assessVisualMarkers } from "../assessment.ts"
import { useHazardPlayer } from "./context.tsx"
import { HazardCommitControls } from "./commit-controls.tsx"
import { HazardFrame, HazardSceneViewport } from "./scene-viewport.tsx"
import { HazardZoneNavigator } from "./zone-navigator.tsx"
import { HazardMarkerControls } from "./marker-controls.tsx"
import { HazardResults, HazardStatus } from "./results.tsx"

export const HazardReviewContext = () => {
  const { mode, state } = useHazardPlayer()
  if (state.tag !== "revealed") return null
  const assessment = mode === "visual" ? assessVisualMarkers(state.markers, state.payload) : null
  const safeMarks = assessment?.markers.filter(marker => marker.kind === "decoy_false_positive").length ?? 0
  const otherMarks = assessment?.markers.filter(marker => marker.kind === "false_positive").length ?? 0
  return <section className="notice" aria-labelledby="hazard-review-context-heading">
    <h2 id="hazard-review-context-heading">Review your saved response</h2>
    {assessment === null ? <p>Your written-zone choices are saved separately. Compare them with the full explanation; they are not scored against picture markers.</p> : <>
      <p>Compare your saved markers with the explanation for this exact scene.</p>
      <ul>
        <li>{assessment.missedInventoryIds.length} {assessment.missedInventoryIds.length === 1 ? "hazard" : "hazards"} left unmarked.</li>
        <li>{safeMarks} {safeMarks === 1 ? "mark" : "marks"} on details that are safe as shown.</li>
        <li>{otherMarks} {otherMarks === 1 ? "mark" : "marks"} where the scene records no hazard.</li>
      </ul>
    </>}
    <p>Reading this explanation does not finish a queued review. <a href="/review/">Return to Review</a> to finish it explicitly, or <a href="/practice/">return to saved activity</a>.</p>
  </section>
}

const HazardReviewFrame = ({ children }: { readonly children: ReactNode }) => {
  const { state, scene, meta } = useHazardPlayer()
  return <HazardFrame>
    <header className="hazard-player__prompt"><p className="player-position">Saved hazard review · Original scene</p><h1 id="hazard-scene-heading" ref={meta.sceneHeadingRef} tabIndex={-1}>Review the {scene.environment}</h1><p>{scene.neutralPreAnswer.overview}</p></header>
    {state.tag === "revealed" ? <><HazardReviewContext />{children}</> : state.tag === "ready" ? <section className="notice" aria-labelledby="hazard-review-missing-heading">
      <h2 id="hazard-review-missing-heading">Saved response unavailable</h2>
      <p>No saved response for this exact scene and task was found on this device. No replacement response was created.</p>
      <a href="/practice/">Return to saved activity</a>
    </section> : state.tag === "asset_unavailable" ? <HazardSceneViewport /> : <HazardCommitControls />}
    <HazardStatus />
  </HazardFrame>
}

export const VisualHazardReview = () => <HazardReviewFrame>
  <div className="hazard-player__workspace">
    <HazardSceneViewport />
    <div className="hazard-player__response-panel"><HazardMarkerControls /><HazardResults /></div>
  </div>
</HazardReviewFrame>

export const NonvisualHazardReview = () => <HazardReviewFrame>
  <div className="hazard-player__workspace">
    <HazardZoneNavigator />
    <div className="hazard-player__response-panel"><HazardResults /></div>
  </div>
</HazardReviewFrame>

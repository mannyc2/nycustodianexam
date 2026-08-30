import type { ReactNode } from "react"
import {
  assessSelectedZones,
  assessVisualMarkers,
  type MarkerAssessment
} from "../assessment.ts"
import type { ReleasedPostcommitScene } from "../attempt.ts"
import {
  decoyFeedbackForScene,
  targetFeedbackForScene,
  zonedStatementsForScene
} from "../released-scene.ts"
import { draftFromState } from "../state.ts"
import { AnnotatedHazardScene } from "./annotated-scene.tsx"
import { useHazardPlayer } from "./context.tsx"
import { HazardPostcommitEquivalent, HazardSceneFacts } from "./scene-feedback.tsx"

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
          : `${decoy.observableCondition}. Safe as depicted: ${decoy.safeAsDepicted}`}
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
        : `${target.observableCondition}. Immediate correction: ${target.immediateCorrection}`}
    </p>
  )
}

const VisualResults = ({
  imageUrl,
  payload,
  sceneAlt
}: {
  readonly imageUrl: string | null
  readonly payload: ReleasedPostcommitScene
  readonly sceneAlt: string
}) => {
  const { state } = useHazardPlayer()
  const markers = draftFromState(state).markers
  const assessment = assessVisualMarkers(markers, payload)

  return (
    <section aria-labelledby="visual-marker-feedback-heading">
      <h3 id="visual-marker-feedback-heading">Marker feedback</h3>
      {imageUrl === null
        ? <p role="alert">The saved scene image is unavailable.</p>
        : <AnnotatedHazardScene
            alt={sceneAlt}
            imageUrl={imageUrl}
            markers={markers}
            payload={payload}
          />}
      {assessment.markers.length === 0 ? (
        <p>You submitted no markers.</p>
      ) : (
        <ol>
          {assessment.markers.map((result) => (
            <li key={result.marker.id}>
              <h4>Marker {result.markerNumber}</h4>
              {markerFeedback(result, payload)}
            </li>
          ))}
        </ol>
      )}
      {assessment.missedInventoryIds.length === 0 ? (
        <p>No hazard was left unmarked.</p>
      ) : (
        <section aria-labelledby="missed-condition-heading">
          <h4 id="missed-condition-heading">Hazards you missed</h4>
          <ul>
            {assessment.missedInventoryIds.map((inventoryId) => {
              const target = targetFeedbackForScene(payload, inventoryId)
              return target === undefined ? null : (
                <li key={inventoryId}>
                  {target.observableCondition}. Immediate correction: {target.immediateCorrection}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </section>
  )
}

const NonvisualResults = ({ payload }: { readonly payload: ReleasedPostcommitScene }) => {
  const { scene, state } = useHazardPlayer()
  const zones = assessSelectedZones(draftFromState(state).selectedZoneOrders, scene)
  const postcommitLabels = new Set(
    zonedStatementsForScene(payload).map((statement) => statement.zone)
  )

  return (
    <section aria-labelledby="zone-feedback-heading">
      <h3 id="zone-feedback-heading">Zone feedback</h3>
      <p>
        This text version covers the same knowledge, but it is not the same task as finding
        hazards on the image.
      </p>
      <p>
        Your zone choices are saved exactly as you made them. They are not auto-matched or
        scored against the more detailed locations described below.
      </p>
      <ol>
        {zones.map((zone) => (
          <li key={zone.order}>
            <h4>Zone {zone.order}: {zone.label}</h4>
            <p>{zone.selected ? "You selected this zone." : "You did not select this zone."}</p>
            {postcommitLabels.has(zone.label) ? null : (
              <p>
                The full description below does not call out this exact zone. That does not
                make your choice right or wrong — read the full description to compare.
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export const HazardResults = () => {
  const { meta, mode, scene, state } = useHazardPlayer()
  if (state.tag !== "revealed") return null

  const assessment = mode === "visual"
    ? assessVisualMarkers(draftFromState(state).markers, state.payload)
    : null
  const targetCount = state.payload.targets.length
  const extraCount = assessment === null
    ? 0
    : assessment.markers.filter((marker) => marker.kind !== "hit").length
  const extraSummary = extraCount === 0
    ? "No extra or repeated marks were counted."
    : `${extraCount} ${extraCount === 1 ? "extra or repeated mark was" : "extra or repeated marks were"} counted.`
  const outcome = assessment === null
    ? "Response saved — compare your zone choices below."
    : targetCount === 0
      ? `This scene has no hazard to find. ${extraSummary}`
      : `You found ${targetCount - assessment.missedInventoryIds.length} of ${targetCount} ${targetCount === 1 ? "hazard" : "hazards"} in this scene. ${extraSummary}`

  return (
    <section className="hazard-player__results">
      <h2 ref={meta.outcomeHeadingRef} tabIndex={-1}>{outcome}</h2>
      <p>Your response was saved on this device before this feedback loaded.</p>
      {mode === "visual"
        ? <VisualResults
            imageUrl={state.retainedVisualAsset?.dataUrl ?? null}
            payload={state.payload}
            sceneAlt={scene.neutralPreAnswer.overview}
          />
        : <NonvisualResults payload={state.payload} />}
      <HazardSceneFacts payload={state.payload} />
      <HazardPostcommitEquivalent payload={state.payload} />
    </section>
  )
}

export const HazardStatus = () => {
  const { meta } = useHazardPlayer()
  return (
    <p aria-atomic="true" aria-live="polite" className="sr-only" id={meta.statusId}>
      {meta.announcementRequest?.message ?? ""}
    </p>
  )
}

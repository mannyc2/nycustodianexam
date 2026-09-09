import {
  assessSelectedZones,
  assessVisualMarkers
} from "../assessment.ts"
import type { ReleasedPostcommitScene } from "../attempt.ts"
import {
  targetFeedbackForScene,
  zonedStatementsForScene
} from "../released-scene.ts"
import { draftFromState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"
import { HazardPostcommitEquivalent, HazardSceneFacts } from "./scene-feedback.tsx"

const VisualResults = ({ payload }: { readonly payload: ReleasedPostcommitScene }) => {
  const { state } = useHazardPlayer()
  const markers = draftFromState(state).markers
  const assessment = assessVisualMarkers(markers, payload)

  return (
    <section aria-label="Unmarked hazards">
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
                  {target.observableCondition.replace(/\.$/, "")}. Immediate correction: {target.immediateCorrection}
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
  const { meta, mode, state } = useHazardPlayer()
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
        ? <VisualResults payload={state.payload} />
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

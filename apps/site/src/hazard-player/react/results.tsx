import type { ReactNode } from "react"
import {
  assessSelectedZones,
  assessVisualMarkers,
  type MarkerAssessment
} from "../assessment.ts"
import type { PostcommitScene } from "../attempt.ts"
import { draftFromState } from "../state.ts"
import { AnnotatedHazardScene } from "./annotated-scene.tsx"
import { useHazardPlayer } from "./context.tsx"

const markerFeedback = (
  assessment: MarkerAssessment,
  payload: PostcommitScene
): ReactNode => {
  if (assessment.kind === "false_positive") {
    return (
      <p>
        This mark does not match any condition recorded in this scene, so it is not scored as
        right or wrong.
      </p>
    )
  }

  if (assessment.kind === "decoy_false_positive") {
    const decoy = payload.decoys.find((candidate) => candidate.id === assessment.inventoryId)
    return (
      <p>
        <strong>Safe as shown.</strong>{" "}
        {decoy === undefined
          ? "The detail you marked is safe as depicted in this scene."
          : `${decoy.condition}; ${decoy.safeBecause}.`}
      </p>
    )
  }

  const target = payload.targets.find((candidate) => candidate.id === assessment.inventoryId)
  if (assessment.kind === "duplicate") {
    return (
      <p>
        <strong>Already marked.</strong>{" "}
        {target === undefined
          ? "Another marker already covers this hazard."
          : `Another marker already covers ${target.condition}.`}
      </p>
    )
  }

  return (
    <p>
      <strong>Hazard found.</strong>{" "}
      {target === undefined
        ? "This marker matches a condition that needs correction."
        : `${target.condition}. How to correct it: ${target.correction}.`}
    </p>
  )
}

const VisualResults = ({
  imageUrl,
  payload,
  sceneAlt
}: {
  readonly imageUrl: string | null
  readonly payload: PostcommitScene
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
              const target = payload.targets.find((candidate) => candidate.id === inventoryId)
              return target === undefined ? null : (
                <li key={target.condition}>
                  {target.condition}. How to correct it: {target.correction}.
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </section>
  )
}

const roleLabel = (role: "target" | "decoy" | "safe-background"): string => {
  switch (role) {
    case "target":
      return "Condition needing correction"
    case "decoy":
      return "Safe detail that may look suspicious"
    case "safe-background":
      return "Safe background detail"
  }
}

const NonvisualResults = ({ payload }: { readonly payload: PostcommitScene }) => {
  const { scene, state } = useHazardPlayer()
  const zones = assessSelectedZones(draftFromState(state).selectedZoneOrders, scene)
  const postcommitLabels = new Set(
    payload.nonvisualZonedEquivalent.map((statement) => statement.zone)
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

const PostcommitEquivalent = ({ payload }: { readonly payload: PostcommitScene }) => (
  <section aria-labelledby="complete-zoned-equivalent-heading">
    <h3 id="complete-zoned-equivalent-heading">Full scene description by zone</h3>
    <p>
      This covers the same knowledge in text form; it is not the same task as marking the image.
    </p>
    <ul>
      {payload.nonvisualZonedEquivalent.map((statement) => (
        <li key={`${statement.zone}:${statement.role}:${statement.statement}`}>
          <strong>{statement.zone} — {roleLabel(statement.role)}:</strong> {statement.statement}
        </li>
      ))}
    </ul>
  </section>
)

const FullFeedback = ({ payload }: { readonly payload: PostcommitScene }) => (
  <>
    <section aria-labelledby="scene-explanation-heading">
      <h3 id="scene-explanation-heading">Scene explanation</h3>
      <p>{payload.claim}</p>
      <h4>Hazards and how to correct them</h4>
      {payload.fullPostAnswer.targets.length === 0 ? (
        <p>This scene contains no hazard that needs correction.</p>
      ) : (
        <ul>
          {payload.fullPostAnswer.targets.map((target) => (
            <li key={`${target.condition}:${target.correction}`}>
              <strong>{target.condition}.</strong> {target.correction}.
            </li>
          ))}
        </ul>
      )}
      <h4>Details that are safe as shown</h4>
      <ul>
        {payload.fullPostAnswer.decoys.map((decoy) => (
          <li key={`${decoy.condition}:${decoy.safeBecause}`}>
            <strong>{decoy.condition}:</strong> {decoy.safeBecause}.
          </li>
        ))}
        {payload.fullPostAnswer.safeBackground.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </section>
    <PostcommitEquivalent payload={payload} />
    <details className="feedback-sources">
      <summary>Where this comes from</summary>
      <ul>
        {payload.fullPostAnswer.sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} rel="external noopener">{source.title}</a>, {source.locator}. {source.scope}
          </li>
        ))}
      </ul>
    </details>
  </>
)

export const HazardResults = () => {
  const { meta, mode, scene, state } = useHazardPlayer()
  if (state.tag !== "revealed") return null

  const assessment = mode === "visual"
    ? assessVisualMarkers(draftFromState(state).markers, state.payload)
    : null
  const targetCount = state.payload.targets.length
  const outcome = assessment === null
    ? "Response saved — compare your zone choices below."
    : targetCount === 0
      ? "This scene has no hazard to find. Your response is saved."
      : `You found ${targetCount - assessment.missedInventoryIds.length} of ${targetCount} ${targetCount === 1 ? "hazard" : "hazards"} in this scene.`

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
      <FullFeedback payload={state.payload} />
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

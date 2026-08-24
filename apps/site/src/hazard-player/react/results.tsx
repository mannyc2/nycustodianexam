import type { ReactNode } from "react"
import {
  assessSelectedZones,
  assessVisualMarkers,
  type MarkerAssessment
} from "../assessment.ts"
import type { PostcommitScene } from "../attempt.ts"
import { draftFromState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

const markerFeedback = (
  assessment: MarkerAssessment,
  payload: PostcommitScene
): ReactNode => {
  if (assessment.kind === "false_positive") {
    return (
      <p>
        This mark did not correspond to an authored condition. The scene model does not invent
        meaning for an unauthored location.
      </p>
    )
  }

  if (assessment.kind === "decoy_false_positive") {
    const decoy = payload.decoys.find((candidate) => candidate.id === assessment.inventoryId)
    return (
      <p>
        <strong>Decoy false positive.</strong>{" "}
        {decoy === undefined
          ? "The marked detail was an authored safe detail."
          : `${decoy.condition}; ${decoy.safeBecause}.`}
      </p>
    )
  }

  const target = payload.targets.find((candidate) => candidate.id === assessment.inventoryId)
  if (assessment.kind === "duplicate") {
    return (
      <p>
        <strong>Duplicate mark.</strong>{" "}
        {target === undefined
          ? "Another marker already identified this authored condition."
          : `Another marker already identified ${target.condition}.`}
      </p>
    )
  }

  return (
    <p>
      <strong>Identified.</strong>{" "}
      {target === undefined
        ? "This marker corresponds to an authored condition needing correction."
        : `${target.condition}. Correction concept: ${target.correction}.`}
    </p>
  )
}

const VisualResults = ({ payload }: { readonly payload: PostcommitScene }) => {
  const { state } = useHazardPlayer()
  const assessment = assessVisualMarkers(draftFromState(state).markers, payload)

  return (
    <section aria-labelledby="visual-marker-feedback-heading">
      <h3 id="visual-marker-feedback-heading">Marker feedback</h3>
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
        <p>No authored correction condition was left unidentified.</p>
      ) : (
        <section aria-labelledby="missed-condition-heading">
          <h4 id="missed-condition-heading">Conditions not marked</h4>
          <ul>
            {assessment.missedInventoryIds.map((inventoryId) => {
              const target = payload.targets.find((candidate) => candidate.id === inventoryId)
              return target === undefined ? null : (
                <li key={target.condition}>
                  {target.condition}. Correction concept: {target.correction}.
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
        This zoned text activity is an equivalent knowledge task; it does not measure the same
        visual-recognition construct as placing markers on the image.
      </p>
      <p>
        Your neutral zone selections are recorded separately from the more granular authored
        locations in the complete equivalent below. Labels are not fuzzy-matched or scored as
        though the two tasks were identical.
      </p>
      <ol>
        {zones.map((zone) => (
          <li key={zone.order}>
            <h4>Zone {zone.order}: {zone.label}</h4>
            <p>{zone.selected ? "You selected this zone." : "You did not select this zone."}</p>
            {postcommitLabels.has(zone.label) ? null : (
              <p>
                No post-answer location uses this exact structural-zone label. This does not
                classify your selection as safe or unsafe; use the complete equivalent below.
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
    <h3 id="complete-zoned-equivalent-heading">Complete zoned text equivalent</h3>
    <p>
      This is an equivalent knowledge presentation, not the same visual-recognition measure.
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
      <h4>Conditions and immediate correction concepts</h4>
      {payload.fullPostAnswer.targets.length === 0 ? (
        <p>No condition needing correction was authored in this scene.</p>
      ) : (
        <ul>
          {payload.fullPostAnswer.targets.map((target) => (
            <li key={`${target.condition}:${target.correction}`}>
              <strong>{target.condition}.</strong> {target.correction}.
            </li>
          ))}
        </ul>
      )}
      <h4>Authored safe details and decoys</h4>
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
      <summary>Source receipts</summary>
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
  const { meta, mode, state } = useHazardPlayer()
  if (state.tag !== "revealed") return null

  return (
    <section className="hazard-player__results">
      <h2 ref={meta.outcomeHeadingRef} tabIndex={-1}>Scene response recorded</h2>
      <p>Your response was durably saved before this feedback loaded.</p>
      {mode === "visual"
        ? <VisualResults payload={state.payload} />
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

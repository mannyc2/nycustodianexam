import type { HazardDraft, HazardMarker, PostcommitScene } from "./attempt.ts"
import type { RetainedImageAsset } from "../retained-image.ts"

export type HazardScreenState =
  | ({ readonly tag: "ready" } & HazardDraft)
  | ({ readonly tag: "confirm_zero" } & HazardDraft)
  | {
      readonly tag: "restoring"
    }
  | {
      readonly tag: "restore_failed"
      readonly message: string
    }
  | {
      readonly tag: "content_unavailable"
      readonly message: string
    }
  | {
      readonly tag: "asset_unavailable"
      readonly message: string
    }
  | ({ readonly tag: "committing" } & HazardDraft)
  | ({ readonly tag: "commit_failed"; readonly message: string } & HazardDraft)
  | ({ readonly tag: "reveal_failed"; readonly message: string } & HazardDraft)
  | ({
      readonly tag: "revealed"
      readonly payload: PostcommitScene
      readonly retainedVisualAsset: RetainedImageAsset | null
    } & HazardDraft)

const emptyDraft = (): HazardDraft => ({
  markers: [],
  selectedZoneOrders: [],
  nextMarkerNumber: 1
})

export const initialHazardState = (): HazardScreenState => ({
  tag: "ready",
  ...emptyDraft()
})

export const isEditableHazardState = (
  state: HazardScreenState
): state is Extract<HazardScreenState, { readonly tag: "ready" | "commit_failed" }> =>
  state.tag === "ready" || state.tag === "commit_failed"

export const draftFromState = (state: HazardScreenState): HazardDraft => {
  switch (state.tag) {
    case "ready":
    case "confirm_zero":
    case "committing":
    case "commit_failed":
    case "reveal_failed":
    case "revealed":
      return {
        markers: state.markers,
        selectedZoneOrders: state.selectedZoneOrders,
        nextMarkerNumber: state.nextMarkerNumber
      }
    case "restoring":
    case "restore_failed":
    case "content_unavailable":
    case "asset_unavailable":
      return emptyDraft()
  }
}

const editableDraft = (state: HazardScreenState): HazardDraft | undefined =>
  isEditableHazardState(state) ? draftFromState(state) : undefined

const clampCoordinate = (value: number): number => Math.min(1, Math.max(0, value))

export const addMarker = (
  state: HazardScreenState,
  point: { readonly x: number; readonly y: number }
): HazardScreenState => {
  const draft = editableDraft(state)
  if (draft === undefined || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return state

  const marker: HazardMarker = {
    id: `marker-${draft.nextMarkerNumber}`,
    x: clampCoordinate(point.x),
    y: clampCoordinate(point.y)
  }
  return {
    tag: "ready",
    ...draft,
    markers: [...draft.markers, marker],
    nextMarkerNumber: draft.nextMarkerNumber + 1
  }
}

export const moveMarker = (
  state: HazardScreenState,
  markerId: string,
  delta: { readonly x: number; readonly y: number }
): HazardScreenState => {
  const draft = editableDraft(state)
  if (draft === undefined || !Number.isFinite(delta.x) || !Number.isFinite(delta.y)) return state

  return {
    tag: "ready",
    ...draft,
    markers: draft.markers.map((marker) =>
      marker.id === markerId
        ? {
            ...marker,
            x: clampCoordinate(marker.x + delta.x),
            y: clampCoordinate(marker.y + delta.y)
          }
        : marker
    )
  }
}

export const removeMarker = (
  state: HazardScreenState,
  markerId: string
): HazardScreenState => {
  const draft = editableDraft(state)
  if (draft === undefined) return state
  return {
    tag: "ready",
    ...draft,
    markers: draft.markers.filter((marker) => marker.id !== markerId)
  }
}

export const toggleZone = (
  state: HazardScreenState,
  zoneOrder: number
): HazardScreenState => {
  const draft = editableDraft(state)
  if (draft === undefined || !Number.isInteger(zoneOrder) || zoneOrder < 0) return state
  const selected = new Set(draft.selectedZoneOrders)
  if (selected.has(zoneOrder)) selected.delete(zoneOrder)
  else selected.add(zoneOrder)
  return {
    tag: "ready",
    ...draft,
    selectedZoneOrders: [...selected].sort((left, right) => left - right)
  }
}

export const requestHazardCommit = (
  state: HazardScreenState,
  selectedCount: number
): HazardScreenState => {
  const draft = editableDraft(state)
  if (draft === undefined) return state
  return selectedCount === 0
    ? { tag: "confirm_zero", ...draft }
    : { tag: "committing", ...draft }
}

export const confirmZeroHazards = (state: HazardScreenState): HazardScreenState =>
  state.tag === "confirm_zero" ? { tag: "committing", ...draftFromState(state) } : state

export const cancelZeroConfirmation = (state: HazardScreenState): HazardScreenState =>
  state.tag === "confirm_zero" ? { tag: "ready", ...draftFromState(state) } : state

export const hazardCommitFailed = (
  state: HazardScreenState,
  message: string
): HazardScreenState =>
  state.tag === "committing"
    ? { tag: "commit_failed", ...draftFromState(state), message }
    : state

export const hazardRevealFailed = (
  state: HazardScreenState,
  draft: HazardDraft,
  message: string
): HazardScreenState => ({ tag: "reveal_failed", ...draft, message })

export const hazardRestoreFailed = (message: string): HazardScreenState => ({
  tag: "restore_failed",
  message
})

export const hazardContentUnavailable = (message: string): HazardScreenState => ({
  tag: "content_unavailable",
  message
})

export const hazardAssetUnavailable = (message: string): HazardScreenState => ({
  tag: "asset_unavailable",
  message
})

export const revealHazard = (
  draft: HazardDraft,
  payload: PostcommitScene,
  retainedVisualAsset: RetainedImageAsset | null
): HazardScreenState => ({ tag: "revealed", ...draft, payload, retainedVisualAsset })

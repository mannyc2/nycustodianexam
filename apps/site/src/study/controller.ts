import type { ReviewController } from "../review/controller.ts"
import type { ReviewQueueState } from "../review/model.ts"
import { makeScreenStore } from "../screen/store.ts"
import type { StudyActivity, StudyActivityState } from "./model.ts"

interface StudyState {
  readonly activityState: StudyActivityState
  readonly review: ReviewQueueState
}
export const createStudyController = (reviewController: ReviewController, loadActivity: () => Promise<StudyActivity>) => {
  const screen = makeScreenStore<StudyState, "heading" | "review">({ requestIdPrefix: "study-", initialState: {
    activityState: { tag: "loading" }, review: reviewController.getHydrationSnapshot().state
  } })
  let active = true
  let started = false
  let readRevision = 0
  let lastReviewState = reviewController.getHydrationSnapshot().state
  const publish = (patch: Partial<StudyState>, requestedFocus?: "heading" | "review"): void => {
    if (!active) return
    const snapshot = screen.getSnapshot()
    const state = { ...snapshot.state, ...patch }
    const focus = requestedFocus === "review" && state.activityState.tag === "unavailable"
      ? "heading" : requestedFocus ?? snapshot.focusRequest?.target
    screen.publish(state, focus === undefined ? undefined : { focus })
  }
  const unsubscribeReview = reviewController.subscribe(() => {
    const snapshot = reviewController.getSnapshot()
    if (snapshot.state === lastReviewState) return
    lastReviewState = snapshot.state
    publish({ review: snapshot.state }, snapshot.focusRequest === null ? undefined : "review")
    if (snapshot.focusRequest !== null) reviewController.acknowledgeRequest(snapshot.focusRequest.id)
  })
  const readActivity = (): void => {
    if (!active) return
    const revision = ++readRevision
    publish({ activityState: { tag: "loading" } })
    void loadActivity().then((activity) => {
      if (!active || revision !== readRevision) return
      publish({ activityState: { tag: "ready", activity } })
    }, () => {
      if (!active || revision !== readRevision) return
      publish({ activityState: { tag: "unavailable" } }, "heading")
    })
  }
  return {
    getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe, acknowledgeRequest: screen.acknowledgeRequest,
    actions: { retryActivity: readActivity },
    start: () => {
      if (started || !active) return
      started = true
      readActivity()
      reviewController.start()
    },
    dispose: () => {
      active = false
      readRevision += 1
      unsubscribeReview()
      reviewController.dispose()
      screen.dispose()
    }
  }
}
export type StudyController = ReturnType<typeof createStudyController>

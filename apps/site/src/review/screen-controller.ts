import { makeScreenStore } from "../screen/store.ts"
import type { StudyActivity, StudyActivityState } from "../study/model.ts"
import type { ReviewController, ReviewControllerSnapshot } from "./controller.ts"

interface ReviewScreenState {
  readonly queue: ReviewControllerSnapshot
  readonly activity: StudyActivityState
}

export const createReviewScreenController = (queue: ReviewController, loadActivity: () => Promise<StudyActivity>) => {
  const screen = makeScreenStore<ReviewScreenState, never>({ initialState: {
    queue: queue.getHydrationSnapshot(), activity: { tag: "loading" }
  } })
  let active = true
  let started = false
  let readRevision = 0
  const publishActivity = (activity: StudyActivityState): void => {
    if (active) screen.publish({ ...screen.getSnapshot().state, activity })
  }
  const retryHistory = (): void => {
    if (!active) return
    const revision = ++readRevision
    publishActivity({ tag: "loading" })
    void loadActivity().then((activity) => {
      if (active && revision === readRevision) publishActivity({ tag: "ready", activity })
    }, () => {
      if (active && revision === readRevision) publishActivity({ tag: "unavailable" })
    })
  }
  const unsubscribeQueue = queue.subscribe(() => {
    if (!active) return
    const previous = screen.getSnapshot().state
    const next = queue.getSnapshot()
    screen.publish({ ...previous, queue: next })
    // Focus acknowledgment changes the snapshot, not the queue's saved data.
    if (next.state === previous.queue.state) return
    const initialLoad = previous.queue.state.tag === "loading" && previous.queue.state.action === "initial"
    if (!initialLoad && (next.state.tag === "empty" || (next.state.tag === "ready" && next.state.acknowledgingItemId === null))) retryHistory()
  })
  return {
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    acknowledgeRequest: queue.acknowledgeRequest,
    dispatch: queue.dispatch,
    retryHistory,
    start: () => {
      if (!active || started) return
      started = true
      retryHistory()
      queue.start()
    },
    dispose: () => {
      if (!active) return
      active = false
      readRevision += 1
      unsubscribeQueue()
      queue.dispose()
      screen.dispose()
    }
  }
}
export type ReviewScreenController = ReturnType<typeof createReviewScreenController>

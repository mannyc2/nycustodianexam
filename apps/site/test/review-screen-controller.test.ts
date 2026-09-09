import { makeScreenStore } from "../src/screen/store.ts"
import type { ReviewQueueState } from "../src/review/model.ts"
import { describe, expect, it, vi } from "vitest"
import { createReviewScreenController } from "../src/review/screen-controller.ts"
import { createReviewController, type ReviewEffectRunner } from "../src/review/controller.ts"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import type { StudyActivity } from "../src/study/model.ts"

const activity: StudyActivity = { rows: [], questionCount: 0, hazardCount: 0, reviewCount: 0, unavailableAttempts: [] }
const fixture = () => {
  const reads: Array<{ resolve: (activity: StudyActivity) => void; reject: () => void }> = []
  const reviews: Array<{ resolve: (value: unknown) => void; reject: () => void }> = []
  const runPromise: ReviewEffectRunner["runPromise"] = <A>() => new Promise<A>((resolve, reject) => {
    reviews.push({ resolve: (value) => resolve(value as A), reject: () => reject(new Error("Review unavailable")) })
  })
  const review = createReviewController(new ReviewQueueBootstrap({ schemaVersion: 1, questions: [], scenes: [] }), { runPromise })
  const controller = createReviewScreenController(review, () => new Promise((resolve, reject) => {
    reads.push({ resolve, reject: () => reject(new Error("Activity unavailable")) })
  }))
  return { controller, reads, reviews, review }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve() }

describe("Review screen lifecycle", () => {
  it("does not reload finished history when the successful queue focus is acknowledged", async () => {
    const queue = makeScreenStore<ReviewQueueState, "error" | "queue" | "empty">({ initialState: { tag: "loading", action: "initial" } })
    const load = vi.fn(async () => activity)
    const controller = createReviewScreenController({ ...queue, start: () => {}, dispatch: () => {} }, load)
    controller.start()
    queue.publish({ tag: "empty", origin: "load" })
    queue.publish({ tag: "loading", action: "rebuild" })
    queue.publish({ tag: "empty", origin: "acknowledgement" }, { focus: "empty" })
    expect(load).toHaveBeenCalledTimes(2)
    const request = controller.getSnapshot().state.queue.focusRequest!
    controller.acknowledgeRequest(request.id)
    await flush()
    expect(controller.getSnapshot().state.queue.focusRequest).toBeNull()
    expect(load).toHaveBeenCalledTimes(2)
    controller.dispose()
  })
  it("loads once initially, refreshes after rebuild and ignores stale retries", async () => {
    const f = fixture()
    f.controller.start(); f.controller.start()
    f.reviews[0]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    expect(f.reads).toHaveLength(1)
    f.controller.dispatch({ tag: "rebuild" })
    f.reviews[1]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    expect(f.reads).toHaveLength(2)
    f.reads[1]!.resolve({ ...activity, reviewCount: 2 })
    await flush()
    f.reads[0]!.resolve(activity)
    await flush()
    expect(f.controller.getSnapshot().state.activity).toEqual({ tag: "ready", activity: { ...activity, reviewCount: 2 } })
    f.controller.dispose()
  })
  it("retains recovery focus through history completion without rereading on acknowledgment", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const f = fixture()
      f.controller.start()
      f.reviews[0]!.reject()
      await flush()
      const request = f.controller.getSnapshot().state.queue.focusRequest!
      expect(request.target).toBe("error")
      f.reads[0]!.reject()
      await flush()
      expect(f.controller.getSnapshot().state.activity.tag).toBe("unavailable")
      expect(f.controller.getSnapshot().state.queue.focusRequest).toEqual(request)
      f.controller.acknowledgeRequest(request.id)
      expect(f.controller.getSnapshot().state.queue.focusRequest).toBeNull()
      expect(f.reads).toHaveLength(1)
      f.controller.dispose()
    } finally { log.mockRestore() }
  })
  it("ignores pending completion and commands after disposal", async () => {
    const f = fixture()
    f.controller.start()
    f.controller.dispose(); f.controller.dispose()
    const snapshot = f.controller.getSnapshot()
    f.reads[0]!.resolve(activity)
    f.reviews[0]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    f.controller.retryHistory(); f.controller.start()
    f.controller.dispatch({ tag: "rebuild" })
    expect(f.controller.getSnapshot()).toBe(snapshot)
    expect(f.reads).toHaveLength(1)
    expect(f.reviews).toHaveLength(1)
  })
})

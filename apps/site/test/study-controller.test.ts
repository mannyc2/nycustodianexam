import { describe, expect, it, vi } from "vitest"
import { createStudyController } from "../src/study/controller.ts"
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
  const controller = createStudyController(review, () => new Promise((resolve, reject) => {
    reads.push({ resolve, reject: () => reject(new Error("Activity unavailable")) })
  }))
  return { controller, reads, reviews, review }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve() }

describe("Study controller activity and review lifecycle", () => {
  it("starts each reader once and ignores an older activity result after retry", async () => {
    const f = fixture()
    f.controller.start()
    f.controller.start()
    expect(f.reads).toHaveLength(1)
    expect(f.reviews).toHaveLength(1)
    f.controller.actions.retryActivity()
    f.reads[1]!.resolve({ ...activity, questionCount: 2 })
    await flush()
    f.reads[0]!.resolve(activity)
    f.reviews[0]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    expect(f.controller.getSnapshot().state.activityState).toEqual({ tag: "ready", activity: { ...activity, questionCount: 2 } })
    expect(f.controller.getSnapshot().state.review.tag).toBe("empty")
    expect(f.controller.getHydrationSnapshot().state.activityState.tag).toBe("loading")
  })
  it("retains unreadable activity and its focus request when review finishes later", async () => {
    const f = fixture()
    f.controller.start()
    f.reads[0]!.reject()
    await flush()
    f.reviews[0]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    expect(f.controller.getSnapshot().state.activityState.tag).toBe("unavailable")
    const request = f.controller.getSnapshot().focusRequest!
    expect(request.target).toBe("heading")
    f.controller.acknowledgeRequest(request.id)
    expect(f.controller.getSnapshot().focusRequest).toBeNull()
  })
  it("maps review recovery focus to the Review section without overriding an activity-read error", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      for (const unreadable of [false, true]) {
        const f = fixture()
        f.controller.start()
        if (unreadable) f.reads[0]!.reject()
        else f.reads[0]!.resolve(activity)
        await flush()
        f.reviews[0]!.reject()
        await flush()
        expect(f.controller.getSnapshot().focusRequest?.target).toBe(unreadable ? "heading" : "review")
        expect(f.review.getSnapshot().focusRequest).toBeNull()
      }
    } finally { log.mockRestore() }
  })
  it("disposes both readers and ignores late completions and retry commands", async () => {
    const f = fixture()
    f.controller.start()
    f.controller.dispose()
    const snapshot = f.controller.getSnapshot()
    f.reads[0]!.resolve(activity)
    f.reviews[0]!.resolve({ items: [], quarantined: [], attemptCount: 0 })
    await flush()
    f.controller.actions.retryActivity()
    f.controller.start()
    f.review.dispatch({ tag: "rebuild" })
    expect(f.controller.getSnapshot()).toBe(snapshot)
    expect(f.reads).toHaveLength(1)
    expect(f.reviews).toHaveLength(1)
  })
})

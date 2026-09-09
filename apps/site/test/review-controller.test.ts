import { describe, expect, it, vi } from "vitest"
import { createReviewController, type ReviewEffectRunner } from "../src/review/controller.ts"
import { ReviewQueueBootstrap, type ReviewQueueItem } from "../src/review/model.ts"

const item: ReviewQueueItem = { id: "review-1", attemptId: "attempt-1", committedAt: 1, itemUrl: "/review/session/example/item/1/", kind: "question", reasons: [{ tag: "incorrect_answer" }], reasonIds: ["incorrect_answer"] }
const projection = (items: ReadonlyArray<ReviewQueueItem>) => ({ attemptCount: 1, items, quarantined: [] })
const fixture = () => {
  const pending: Array<{ resolve: (value: unknown) => void; reject: (error: unknown) => void }> = []
  const runPromise: ReviewEffectRunner["runPromise"] = <A>() => new Promise<A>((resolve, reject) => {
    pending.push({ resolve: (value) => resolve(value as A), reject })
  })
  return { pending, controller: createReviewController(new ReviewQueueBootstrap({ schemaVersion: 1, questions: [], scenes: [] }), { runPromise }) }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve() }

describe("Review controller requests and lifecycle", () => {
  it("waits for acknowledgment and rebuild before requesting focus", async () => {
    const { controller, pending } = fixture()
    controller.start()
    pending[0]!.resolve(projection([item]))
    await flush()
    expect(controller.getSnapshot().focusRequest).toBeNull()
    controller.dispatch({ tag: "acknowledge", itemId: item.id })
    controller.dispatch({ tag: "acknowledge", itemId: item.id })
    expect(pending).toHaveLength(2)
    expect(controller.getSnapshot().focusRequest).toBeNull()
    pending[1]!.resolve(undefined)
    await flush()
    expect(controller.getSnapshot().state.tag).toBe("loading")
    pending[2]!.resolve(projection([]))
    await flush()
    expect(controller.getSnapshot().state).toEqual({ tag: "empty", origin: "acknowledgement" })
    const request = controller.getSnapshot().focusRequest!
    expect(request.target).toBe("empty")
    controller.acknowledgeRequest("stale-request")
    expect(controller.getSnapshot().focusRequest).toEqual(request)
    controller.acknowledgeRequest(request.id)
    expect(controller.getSnapshot().focusRequest).toBeNull()
    expect(controller.getHydrationSnapshot().state.tag).toBe("loading")
  })
  it("requests queue focus when only quarantined records remain", async () => {
    const { controller, pending } = fixture()
    controller.start()
    pending[0]!.resolve(projection([item]))
    await flush()
    controller.dispatch({ tag: "acknowledge", itemId: item.id })
    pending[1]!.resolve(undefined)
    await flush()
    pending[2]!.resolve({ ...projection([]), quarantined: [{ id: "unavailable", attemptId: "old", kind: "question", detail: "Unavailable" }] })
    await flush()
    expect(controller.getSnapshot().state.tag).toBe("ready")
    expect(controller.getSnapshot().focusRequest?.target).toBe("queue")
  })
  it("retains items and requests error focus when acknowledgment fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const { controller, pending } = fixture()
      controller.start()
      pending[0]!.resolve(projection([item]))
      await flush()
      controller.dispatch({ tag: "acknowledge", itemId: item.id })
      pending[1]!.reject(new Error("Storage unavailable"))
      await flush()
      expect(controller.getSnapshot().state).toMatchObject({ tag: "recoverable_error", operation: "acknowledge", items: [item] })
      expect(controller.getSnapshot().focusRequest?.target).toBe("error")
    } finally { log.mockRestore() }
  })
  it("ignores stale completion and stops new work after disposal", async () => {
    const { controller, pending } = fixture()
    controller.start()
    controller.dispatch({ tag: "rebuild" })
    pending[1]!.resolve(projection([item]))
    await flush()
    pending[0]!.resolve(projection([]))
    await flush()
    expect(controller.getSnapshot().state.tag).toBe("ready")
    controller.dispose()
    controller.dispatch({ tag: "acknowledge", itemId: item.id })
    controller.dispatch({ tag: "retry" })
    controller.dispatch({ tag: "rebuild" })
    controller.start()
    expect(pending).toHaveLength(2)
  })
})

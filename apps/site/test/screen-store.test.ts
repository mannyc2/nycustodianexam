import { describe, expect, it, vi } from "vitest"
import { makeScreenStore } from "../src/screen/store.ts"

describe("screen store", () => {
  it("publishes revisioned focus and announcement requests", () => {
    const store = makeScreenStore<number, "outcome">({
      initialState: 0,
      requestIdPrefix: "test-"
    })
    const listener = vi.fn()
    store.subscribe(listener)

    store.publish(1, { focus: "outcome", announce: "Ready" })

    expect(store.getSnapshot()).toEqual({
      state: 1,
      revision: 1,
      focusRequest: { id: "test-focus-1", target: "outcome" },
      announcementRequest: { id: "test-announce-1", message: "Ready" }
    })
    expect(listener).toHaveBeenCalledOnce()
  })

  it("acknowledges only the matching request without changing revision", () => {
    const store = makeScreenStore<number, "outcome">({ initialState: 0 })
    store.publish(1, { focus: "outcome", announce: "Ready" })

    store.acknowledgeRequest("unknown")
    store.acknowledgeRequest("focus-1")

    expect(store.getSnapshot()).toEqual({
      state: 1,
      revision: 1,
      focusRequest: null,
      announcementRequest: { id: "announce-1", message: "Ready" }
    })
  })

  it("initializes once and ignores publications after disposal", () => {
    const store = makeScreenStore<number, "outcome">({ initialState: 0 })
    const initialize = vi.fn(() => store.publish(1))

    store.start(initialize)
    store.start(initialize)
    store.dispose()
    store.publish(2)

    expect(initialize).toHaveBeenCalledOnce()
    expect(store.getSnapshot().state).toBe(1)
  })
})

import { describe, expect, it } from "vitest"
import {
  addMarker,
  cancelZeroConfirmation,
  confirmZeroHazards,
  hazardAssetUnavailable,
  hazardContentUnavailable,
  initialHazardState,
  moveMarker,
  removeMarker,
  requestHazardCommit,
  toggleZone
} from "../src/hazard-player/state.ts"

describe("hazard state machine", () => {
  it("requires an explicit second action before committing zero marks", () => {
    const confirmation = requestHazardCommit(initialHazardState(), 0)
    expect(confirmation.tag).toBe("confirm_zero")
    expect(confirmZeroHazards(confirmation).tag).toBe("committing")
    expect(cancelZeroConfirmation(confirmation).tag).toBe("ready")
  })

  it("keeps marker coordinates normalized through add and keyboard movement", () => {
    const added = addMarker(initialHazardState(), { x: 1.4, y: -0.2 })
    expect(added).toMatchObject({
      tag: "ready",
      markers: [{ id: "marker-1", x: 1, y: 0 }]
    })
    const moved = moveMarker(added, "marker-1", { x: -0.25, y: 0.5 })
    expect(moved).toMatchObject({ markers: [{ id: "marker-1", x: 0.75, y: 0.5 }] })
    expect(removeMarker(moved, "marker-1")).toMatchObject({ markers: [] })
  })

  it("tracks ordered nonvisual zone selections without creating an attempt", () => {
    const first = toggleZone(initialHazardState(), 4)
    const second = toggleZone(first, 1)
    expect(second).toMatchObject({ tag: "ready", selectedZoneOrders: [1, 4] })
    expect(toggleZone(second, 4)).toMatchObject({ selectedZoneOrders: [1] })
  })

  it("locks a nonempty response directly into committing", () => {
    const marked = addMarker(initialHazardState(), { x: 0.5, y: 0.5 })
    expect(requestHazardCommit(marked, 1).tag).toBe("committing")
  })

  it.each([
    hazardAssetUnavailable("asset unavailable"),
    hazardContentUnavailable("feedback unavailable")
  ])("keeps unavailable visual state fail-closed", (unavailable) => {
    expect(addMarker(unavailable, { x: 0.5, y: 0.5 })).toBe(unavailable)
    expect(toggleZone(unavailable, 1)).toBe(unavailable)
    expect(requestHazardCommit(unavailable, 1)).toBe(unavailable)
  })
})

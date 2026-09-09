import { describe, expect, it } from "vitest"
import { parsePracticeSetId, practiceSetId, selectPracticeSet } from "../src/practice/set.ts"

const inventory = Array.from({ length: 90 }, (_, index) => ({
  id: `q-${String(index).padStart(3, "0")}`,
  category: index < 30 ? "Cleaning" : index < 67 ? "Maintenance" : index < 72 ? "Safety" : "Mixed"
}))
const categories = ["Cleaning", "Maintenance", "Safety", "Mixed"]
const spec = { seed: "repeat this", categories, length: 45 }

describe("custom practice sets", () => {
  it("pins pb1 ordering so future algorithm edits cannot reinterpret saved set identities", () => {
    const set = selectPracticeSet(Array.from({ length: 6 }, (_, index) => ({
      id: `q-${index}`, category: "Mixed"
    })), "release-a", { seed: "known-order", categories: ["Mixed"], length: 6 })
    expect(set.id).toBe("pb1.1.6.006b006e006f0077006e002d006f0072006400650072")
    expect(set.items.map(({ id }) => id)).toEqual(["q-1", "q-5", "q-0", "q-3", "q-2", "q-4"])
  })
  it("reconstructs order despite inventory and category reordering", () => {
    const original = selectPracticeSet(inventory, "release-a", spec)
    const decoded = parsePracticeSetId(original.id, categories.toReversed())
    expect(decoded).toBeDefined()
    expect(selectPracticeSet(inventory.toReversed(), "release-a", decoded!)).toEqual(original)
    expect(new Set(original.items.map(({ id }) => id)).size).toBe(45)
    expect(inventory[0]?.id).toBe("q-000")
  })
  it("round-trips Unicode set codes through safe receipt IDs", () => {
    const seed = "中文 🧹 \ud800"
    const id = practiceSetId({ ...spec, seed }, categories)
    expect(id).toMatch(/^[a-z0-9][a-z0-9._-]*$/)
    expect(parsePracticeSetId(id, categories)?.seed).toBe(seed)
    expect(practiceSetId({ ...spec, seed: `  ${seed}  ` }, categories)).toBe(id)
  })
  it("changes order with the release or repeat code", () => {
    const original = selectPracticeSet(inventory, "release-a", spec)
    expect(selectPracticeSet(inventory, "release-b", spec).items).not.toEqual(original.items)
    expect(selectPracticeSet(inventory, "release-a", { ...spec, seed: "different" }).items).not.toEqual(original.items)
  })
  it("includes all matching items below presets, including mixed questions", () => {
    for (const [category, count] of [["Cleaning", 30], ["Maintenance", 37], ["Safety", 5], ["Mixed", 18]] as const) {
      const set = selectPracticeSet(inventory, "release-a", { ...spec, categories: [category], length: count })
      expect(set.items).toHaveLength(count)
      expect(set.items.every((item) => item.category === category)).toBe(true)
    }
  })
  it("never pads or silently shortens a request", () => {
    expect(() => selectPracticeSet(inventory, "release-a", { ...spec, categories: ["Cleaning"] })).toThrow("replacement length")
    expect(selectPracticeSet(inventory, "release-a", { ...spec, categories: ["Cleaning", "Maintenance"], length: 30 }).items).toHaveLength(30)
  })
  it("rejects invalid selections and duplicate inventory", () => {
    expect(() => practiceSetId({ ...spec, categories: ["Cleaning", "Cleaning"] }, categories)).toThrow()
    expect(() => practiceSetId({ ...spec, categories: ["Unknown"] }, categories)).toThrow()
    expect(() => selectPracticeSet([...inventory, inventory[0]!], "release-a", spec)).toThrow("duplicate")
    for (const length of [0, -1, 1.5, Infinity, NaN]) expect(() => practiceSetId({ ...spec, length }, categories)).toThrow()
  })
  it("rejects malformed and noncanonical identities", () => {
    const id = practiceSetId(spec, categories)
    for (const invalid of [id.replace("pb1", "pb2"), id.replace(".f.", ".0f."), id.replace(".f.", ".10."), "pb1.1.45.0020", "pb1.1.45.000", "x".repeat(1000)]) {
      expect(parsePracticeSetId(invalid, categories)).toBeUndefined()
    }
    expect(() => practiceSetId({ ...spec, seed: "x".repeat(129) }, categories)).toThrow()
    expect(() => practiceSetId({ ...spec, seed: " " }, categories)).toThrow()
  })
})

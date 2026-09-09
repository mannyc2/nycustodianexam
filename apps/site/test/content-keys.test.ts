import { expect, it } from "vitest"
import { keyedContent } from "../src/content-keys.ts"
const observationsWithKeys = (values: ReadonlyArray<string>) => keyedContent(values, text => text)

it("preserves observation identity across reordering and unrelated insertions", () => {
  const before = observationsWithKeys(["A", "B", "A"])
  const after = observationsWithKeys(["B", "C", "A", "A"])
  expect(after.map(value => value.value)).toEqual(["B", "C", "A", "A"])
  expect(after[0]?.key).toBe(before[1]?.key)
  expect(after[2]?.key).toBe(before[0]?.key)
  expect(after[3]?.key).toBe(before[2]?.key)
  expect(new Set(after.map(value => value.key)).size).toBe(after.length)
})

it("keeps arbitrary authored text intact without delimiter collisions", () => {
  const observations = ['A:1', 'A', 'A', '["A",1]', '']
  const keyed = observationsWithKeys(observations)
  expect(keyed.map(value => value.value)).toEqual(observations)
  expect(new Set(keyed.map(value => value.key)).size).toBe(observations.length)
  expect(observationsWithKeys([])).toEqual([])
})

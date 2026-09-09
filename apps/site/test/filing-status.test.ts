import { describe, expect, it } from "vitest"
import catalog from "../../../content/releases/vertical-slice/catalog.json"
import reviews from "../../../content/authoring/announcement-filing-status.json"
import { resolveFilingStatusReviews } from "../scripts/filing-status.ts"

const source = catalog as unknown as Parameters<typeof resolveFilingStatusReviews>[0]
describe("source-bound filing status", () => {
  it("resolves the two reviewed announcement statuses", () => {
    const result = resolveFilingStatusReviews(source)
    expect([...result.values()]).toEqual([
      { state: "closed", reviewedOn: "2026-08-25" },
      { state: "closed", reviewedOn: "2026-08-25" }
    ])
  })
  it("does not invent a status for an unclassified identity", () => {
    expect(resolveFilingStatusReviews(source, { schemaVersion: 1, reviews: [] }).size).toBe(0)
  })
  it("rejects changed source prose even when the fact ID and date are unchanged", () => {
    const changed = structuredClone(catalog)
    const fact = changed.profiles.flatMap(profile => profile.announcementFactSheet?.facts ?? []).find(entry => entry.id === "oc-filing-period")!
    fact.value = "A changed filing window."
    expect(() => resolveFilingStatusReviews(changed as unknown as typeof source)).toThrow(/Stale/)
  })
  it("rejects stale dates, wrong announcement bindings, and duplicate classifications", () => {
    const first = reviews.reviews[0]!
    for (const rows of [
      [{ ...first, reviewedOn: "2026-08-24" }],
      [{ ...first, examNumber: "61012026" }],
      [first, first]
    ]) expect(() => resolveFilingStatusReviews(source, { schemaVersion: 1, reviews: rows })).toThrow(/Stale/)
  })
  it("rejects malformed status values", () => {
    expect(() => resolveFilingStatusReviews(source, { schemaVersion: 1, reviews: [{ ...reviews.reviews[0], state: "guessed" }] })).toThrow(/Invalid/)
  })
})

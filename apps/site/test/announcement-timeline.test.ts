import { describe, expect, it } from "vitest"
import catalog from "../../../content/releases/vertical-slice/catalog.json"
import timeline from "../../../content/authoring/announcement-timeline.json"
import { resolveAnnouncementTimeline } from "../scripts/announcement-timeline.ts"
const facts = catalog.profiles.flatMap(profile => profile.announcementFactSheet?.facts ?? []) as Parameters<typeof resolveAnnouncementTimeline>[0]

describe("reviewed announcement timeline", () => {
  it("consolidates the shared date and preserves the scoped promotion deadline", () => {
    const entries = resolveAnnouncementTimeline(facts)
    expect(entries.map(entry => entry.date)).toEqual(["2026-06-11", "2026-07-01", "2026-07-05", "2026-08-22"])
    expect(entries[2]?.note).toContain("only")
    expect(entries[2]?.compactLabel).toContain("Jericho only")
    expect(entries[3]?.facts.map(fact => fact.id)).toEqual(["oc-exam-date", "promo-exam-date", "administration-status"])
    expect(entries[3]?.compactLabel).toContain("not confirmed held")
  })
  it("fails closed when deadline prose, scope, review date, or administration evidence changes", () => {
    for (const change of [{ value: "A different deadline" }, { appliesToExamNumbers: ["different"] }, { reviewedOn: "2026-09-09" }]) {
      expect(() => resolveAnnouncementTimeline(facts.map(fact => fact.id === "promo-filing-period" ? { ...fact, ...change } : fact))).toThrow(/Stale/)
    }
    expect(() => resolveAnnouncementTimeline(facts.map(fact => fact.id === "administration-status" ? { ...fact, detail: "Administration confirmed" } : fact))).toThrow(/Stale/)
  })
  it("rejects omitted or ambiguous facts and invalid authored dates", () => {
    expect(() => resolveAnnouncementTimeline(facts.filter(fact => fact.id !== "oc-exam-date"))).toThrow(/Stale|ambiguous/)
    expect(() => resolveAnnouncementTimeline([...facts, facts.find(fact => fact.id === "oc-exam-date")!])).toThrow(/ambiguous/)
    expect(() => resolveAnnouncementTimeline(facts, { ...timeline, entries: timeline.entries.slice(0, 3) })).toThrow(/omits/)
    expect(() => resolveAnnouncementTimeline(facts, { ...timeline, entries: timeline.entries.map(entry => ({ ...entry, date: "2026-02-31" })) })).toThrow(/Invalid.*date/)
  })
})

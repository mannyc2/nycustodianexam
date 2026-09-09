import { createHash } from "node:crypto"
import { Schema } from "effect"
import type { CatalogArtifact } from "@nycustodian/content/model"
import timeline from "../../../content/authoring/announcement-timeline.json"

type Fact = NonNullable<(typeof CatalogArtifact.Type)["profiles"][number]["announcementFactSheet"]>["facts"][number]
const Timeline = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  entries: Schema.NonEmptyArray(Schema.Struct({
    date: Schema.String.check(Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/)),
    label: Schema.NonEmptyString,
    compactLabel: Schema.NonEmptyString,
    kind: Schema.Literals(["opening", "filing-close", "exam-date"]),
    note: Schema.NonEmptyString,
    tone: Schema.Literals(["neutral", "warning"]),
    facts: Schema.NonEmptyArray(Schema.Struct({ id: Schema.NonEmptyString, sha256: Schema.String.check(Schema.isPattern(/^[a-f0-9]{64}$/)) }))
  }))
})

export const timelineFactDigest = (fact: Fact): string => createHash("sha256").update(JSON.stringify([
  fact.id, fact.category, fact.label, fact.state, fact.value, fact.detail,
  fact.reviewedOn, [...fact.appliesToExamNumbers].sort(), [...fact.sourceLineIds].sort()
])).digest("hex")

// Explicit presentation entries are reviewed against exact fact prose; dates
// and jurisdiction-specific deadlines are never guessed by parsing that prose.
export const resolveAnnouncementTimeline = (facts: readonly Fact[], input: unknown = timeline) => {
  const decoded = Schema.decodeUnknownSync(Timeline, { onExcessProperty: "error" })(input)
  const referenced = new Set<string>()
  for (const entry of decoded.entries) {
    if (!Number.isFinite(Date.parse(entry.date)) || new Date(entry.date).toISOString().slice(0, 10) !== entry.date) throw new Error("Invalid announcement timeline date")
    for (const reference of entry.facts) {
      const matches = facts.filter(fact => fact.id === reference.id)
      const fact = matches[0]
      if (matches.length !== 1 || fact === undefined || timelineFactDigest(fact) !== reference.sha256) {
        throw new Error(`Stale or ambiguous announcement timeline fact: ${reference.id}`)
      }
      referenced.add(reference.id)
    }
  }
  if (facts.some(fact => ["filing_period", "exam_date", "administration_status"].includes(fact.category) &&
    fact.state !== "superseded" && !referenced.has(fact.id))) {
    throw new Error("Announcement timeline omits a current date or administration fact")
  }
  return decoded.entries
}

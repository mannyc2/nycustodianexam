import { createHash } from "node:crypto"
import type { CatalogArtifact } from "@nycustodian/content/model"
import reviews from "../../../content/authoring/announcement-filing-status.json"

type Catalog = typeof CatalogArtifact.Type
type Fact = NonNullable<Catalog["profiles"][number]["announcementFactSheet"]>["facts"][number]
export type FilingStatusReview = { readonly state: "open" | "closed"; readonly reviewedOn: string }

export const filingFactDigest = (fact: Fact): string => createHash("sha256").update(JSON.stringify([
  fact.id, fact.category, fact.state, fact.value, fact.reviewedOn,
  [...fact.appliesToExamNumbers].sort(), [...fact.sourceLineIds].sort()
])).digest("hex")

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)

export const resolveFilingStatusReviews = (catalog: Catalog, input: unknown = reviews): ReadonlyMap<string, FilingStatusReview> => {
  if (!object(input) || input.schemaVersion !== 1 || !Array.isArray(input.reviews)) throw new Error("Invalid filing-status review ledger")
  const result = new Map<string, FilingStatusReview>()
  for (const row of input.reviews) {
    if (!object(row) || typeof row.profileId !== "string" || typeof row.examNumber !== "string" ||
      typeof row.factId !== "string" || typeof row.reviewedOn !== "string" || typeof row.factSha256 !== "string" ||
      (row.state !== "open" && row.state !== "closed")) throw new Error("Invalid filing-status review entry")
    const profile = catalog.profiles.find((entry) => entry.id === row.profileId)
    const identity = profile?.examIdentities.find((entry) => entry.examNumber === row.examNumber)
    const fact = profile?.announcementFactSheet?.facts.find((entry) => entry.id === row.factId)
    const key = `${row.profileId}:${row.examNumber}`
    if (identity === undefined || fact === undefined || fact.category !== "filing_period" || fact.state !== "verified" ||
      !fact.appliesToExamNumbers.includes(row.examNumber) || fact.reviewedOn !== row.reviewedOn ||
      filingFactDigest(fact) !== row.factSha256 || result.has(key)) {
      throw new Error(`Stale, duplicate, or unsupported filing-status review: ${key}`)
    }
    result.set(key, { state: row.state, reviewedOn: row.reviewedOn })
  }
  return result
}

import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import pack from "../../../content/authoring/packs/launch-v1.json"
import tools from "../../../content/authoring/visuals/releases/tools.json"
import comparisons from "../../../content/authoring/visuals/releases/comparisons.json"
import scenes from "../../../content/authoring/visuals/releases/scenes.json"
import { compileContentPack } from "../src/compiler.ts"
import { questionReviewSha256, type ReviewableQuestion } from "../src/compiler/question-review.ts"

const eligible = tools.find(release => release.publicationGate === null && pack.tools.some(tool => tool.conceptId === release.conceptId && tool.practiceEligibility === "text-question"))!
const binding = { conceptId: eligible.conceptId, masterSha256: eligible.master.sha256, neutralDescription: "An isolated tool viewed against a plain background." }
const compile = (illustration: typeof binding, updateReview = true) => {
  const authoredPack = structuredClone(pack)
  const first = { ...authoredPack.questions[0]!, illustration }
  if (updateReview) first.reviewReceipt.reviewedArtifactSha256 = questionReviewSha256(first as ReviewableQuestion, authoredPack)
  authoredPack.questions[0] = first
  return Effect.runPromise(compileContentPack({ authoredPack, acceptedTools: tools, acceptedComparisons: comparisons, acceptedScenes: scenes }))
}

describe("question illustration compilation", () => {
  it("publishes only neutral description and exact asset receipts", async () => {
    const compiled = await compile(binding)
    const stimulus = compiled.questions[0]!.precommit.illustration!
    expect(stimulus.masterSha256).toBe(eligible.master.sha256)
    expect(stimulus.derivatives).toEqual(eligible.derivatives.map(({ kind, sha256, bytes }) => ({ kind, sha256, bytes })))
    expect(Object.keys(stimulus).sort()).toEqual(["derivatives", "masterSha256", "neutralDescription"])
    expect(JSON.stringify(stimulus)).not.toContain(eligible.conceptId)
    expect(JSON.stringify(stimulus)).not.toContain("content/")
  })
  it("rejects an image added without a new editorial review", async () => {
    await expect(compile(binding, false)).rejects.toMatchObject({ stage: "relation", detail: expect.stringContaining("changed after its recorded review") })
  })
  it("rejects a reviewed binding to stale or absent artwork", async () => {
    await expect(compile({ ...binding, masterSha256: "f".repeat(64) })).rejects.toMatchObject({ stage: "relation", detail: expect.stringContaining("exact accepted") })
    await expect(compile({ ...binding, conceptId: "absent-tool" })).rejects.toMatchObject({ stage: "relation", detail: expect.stringContaining("exact accepted") })
  })
  it("rejects artwork reserved for reference-only use", async () => {
    const gated = tools.find(release => pack.tools.some(tool => tool.conceptId === release.conceptId && tool.practiceEligibility === "atlas-only"))!
    await expect(compile({ ...binding, conceptId: gated.conceptId, masterSha256: gated.master.sha256 })).rejects.toMatchObject({ stage: "relation", detail: expect.stringContaining("exact accepted") })
  })
})

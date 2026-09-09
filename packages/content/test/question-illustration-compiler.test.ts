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
type Binding = NonNullable<ReviewableQuestion["illustration"]>
const compile = (illustration: Binding, updateReview = true, reviewedIllustration: Binding = illustration) => {
  const authoredPack = structuredClone(pack)
  const first = { ...authoredPack.questions[0]!, illustration }
  if (updateReview) first.reviewReceipt.reviewedArtifactSha256 = questionReviewSha256({ ...first, illustration: reviewedIllustration } as ReviewableQuestion, authoredPack)
  const input = { ...authoredPack, questions: [first, ...authoredPack.questions.slice(1)] }
  return Effect.runPromise(compileContentPack({ authoredPack: input, acceptedTools: tools, acceptedComparisons: comparisons, acceptedScenes: scenes }))
}

describe("question illustration compilation", () => {
  it("publishes only neutral description and exact asset receipts", async () => {
    const compiled = await compile(binding)
    const stimulus = compiled.questions[0]!.precommit.illustration!
    for (const derivative of stimulus.derivatives) {
      expect(compiled.assets).toContainEqual(expect.objectContaining(derivative))
    }
    expect(stimulus.masterSha256).toBe(eligible.master.sha256)
    expect(stimulus.derivatives).toEqual(eligible.derivatives.map(({ kind, path, sha256, bytes }) => ({ kind, path, sha256, bytes })))
    expect(Object.keys(stimulus).sort()).toEqual(["derivatives", "masterSha256", "neutralDescription"])
    expect(JSON.stringify(stimulus)).not.toContain(eligible.conceptId)
    for (const derivative of stimulus.derivatives) expect(derivative.path).toMatch(/^content\/assets\/derivatives\/tools\/t[0-9]+-(?:web|phone|print)\.png$/)
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

describe("authored nonvisual question compilation", () => {
  const nonvisualEquivalent = {
    prompt: "Which tool matches these observable features?",
    observations: ["One handle joins a broad head.", "The head has a flat working face."]
  }
  const paired = { ...binding, nonvisualEquivalent }
  it("publishes the reviewed prompt and ordered facts in the neutral stimulus", async () => {
    const compiled = await compile(paired)
    const stimulus = compiled.questions[0]!.precommit.illustration!
    expect(stimulus.nonvisualEquivalent).toEqual(nonvisualEquivalent)
    expect(stimulus.derivatives).toEqual(eligible.derivatives.map(({ kind, path, sha256, bytes }) => ({ kind, path, sha256, bytes })))
    expect(Object.keys(stimulus.nonvisualEquivalent!).sort()).toEqual(["observations", "prompt"])
    expect(compiled.questions[0]!.precommit.options).toEqual(pack.questions[0]!.options.map(({ id, label }) => ({ id, label })))
  })
  it("rejects a prompt, fact, or fact order changed after review", async () => {
    for (const changed of [
      { ...nonvisualEquivalent, prompt: "A changed prompt." },
      { ...nonvisualEquivalent, observations: ["A changed feature.", nonvisualEquivalent.observations[1]!] },
      { ...nonvisualEquivalent, observations: [...nonvisualEquivalent.observations].reverse() }
    ]) await expect(compile({ ...paired, nonvisualEquivalent: changed }, true, paired)).rejects.toMatchObject({ stage: "relation", detail: expect.stringContaining("changed after its recorded review") })
  })
  it("rejects blank prompts and empty or blank observable facts", async () => {
    for (const invalid of [
      { ...nonvisualEquivalent, prompt: " " },
      { ...nonvisualEquivalent, observations: [] },
      { ...nonvisualEquivalent, observations: [" "] }
    ]) await expect(compile({ ...paired, nonvisualEquivalent: invalid })).rejects.toMatchObject({ stage: "schema" })
  })
})

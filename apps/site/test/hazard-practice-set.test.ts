import { expect, it } from "vitest"
import { hazardAttemptId } from "../src/attempt-receipt.ts"
import { assembleHazardDrill, resolveHazardDrill } from "../src/practice/hazard-set.ts"
import type { ReviewSceneSource } from "../src/review/model.ts"

const sources: ReadonlyArray<ReviewSceneSource> = Array.from({ length: 18 }, (_, index) => {
  const id = `s-${index}`
  const receipt = { releaseId: "release-a", packVersion: 1, sessionId: "release-a", position: index + 1,
    sceneId: id, postcommitPath: `/content/vertical-slice/scenes/${id}.postcommit.json`,
    postcommitBytes: 200 + index, postcommitSha256: "a".repeat(64), assetRevision: 1, assetMasterSha256: "b".repeat(64) }
  return {
    scene: { id, environment: "hallway", asset: { opaqueAssetId: id, revision: 1, masterSha256: "b".repeat(64), derivatives: [{ kind: "web", path: `content/assets/derivatives/scenes/${id}-web.png`, bytes: 100, sha256: "b".repeat(64) }] },
      neutralPreAnswer: { overview: "A workplace.", zones: [{ order: 1, label: "Floor", description: "A floor." }], policy: "Neutral." } },
    visualReceipt: { ...receipt, mode: "visual" }, nonvisualReceipt: { ...receipt, mode: "nonvisual", sessionId: "release-a-nonvisual" },
    visualItemUrl: `/hazards/session/release-a/scene/${index + 1}/`,
    nonvisualItemUrl: `/hazards/session/release-a-nonvisual/scene/${index + 1}/`
  }
})

it("reconstructs drills of 1, 5, 10 or all 18 unique scenes", () => {
  for (const length of [1, 5, 10, 18]) {
    const steps = assembleHazardDrill(sources, { seed: "repeat", length, mode: "visual" })
    expect(new Set(steps.map(({ source }) => source.scene.id)).size).toBe(length)
    for (const step of steps) expect(resolveHazardDrill(sources.toReversed(), {
      id: hazardAttemptId(step.receipt), sceneId: step.receipt.sceneId, mode: "visual", receipt: step.receipt
    })).toEqual(step)
  }
})
it("uses the same scene order but distinct saved responses for visual and keyboard drills", () => {
  const visual = assembleHazardDrill(sources, { seed: "repeat", length: 5, mode: "visual" })
  const keyboard = assembleHazardDrill(sources, { seed: "repeat", length: 5, mode: "nonvisual" })
  expect(visual.map(({ source }) => source.scene.id)).toEqual(keyboard.map(({ source }) => source.scene.id))
  expect(hazardAttemptId(visual[0]!.receipt)).not.toBe(hazardAttemptId(keyboard[0]!.receipt))
  expect(keyboard[0]!.href).toContain("/release-a-nonvisual/")
})
it("rejects changed receipt coordinates and out-of-capacity requests", () => {
  const step = assembleHazardDrill(sources, { seed: "repeat", length: 5, mode: "visual" })[0]!
  const attempt = { id: hazardAttemptId(step.receipt), sceneId: step.receipt.sceneId, mode: "visual" as const, receipt: step.receipt }
  for (const patch of [{ assetRevision: 2 }, { assetMasterSha256: "c".repeat(64) }, { postcommitBytes: 1 }, { releaseId: "other" }, { position: 6 }]) {
    const receipt = { ...step.receipt, ...patch }
    expect(resolveHazardDrill(sources, { ...attempt, receipt, id: hazardAttemptId(receipt) })).toBeUndefined()
  }
  expect(resolveHazardDrill(sources, { ...attempt, mode: "nonvisual" })).toBeUndefined()
  expect(() => assembleHazardDrill(sources, { seed: "repeat", length: 19, mode: "visual" })).toThrow()
})

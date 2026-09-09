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

it("reconstructs historical drills only under their receipt's own version prefix", () => {
  const historical = sources.map(source => ({ ...source,
    visualItemUrl: `/history/release-a-v1${source.visualItemUrl}`,
    nonvisualItemUrl: `/history/release-a-v1${source.nonvisualItemUrl}`
  }))
  for (const mode of ["visual", "nonvisual"] as const) {
    const step = assembleHazardDrill(historical, { seed: "old", length: 3, mode })[0]!
    const attempt = { id: hazardAttemptId(step.receipt), sceneId: step.receipt.sceneId, mode, receipt: step.receipt }
    expect(resolveHazardDrill(historical, attempt)?.href).toMatch(/^\/history\/release-a-v1\//)
    const wrongVersion = historical.map(source => ({ ...source, visualItemUrl: source.visualItemUrl.replace("-v1/", "-v2/") }))
    expect(resolveHazardDrill(wrongVersion, attempt)).toBeUndefined()
  }
})

it("guards setup commands and navigates to the exact selected modality once", async () => {
  const { createHazardBuilderController } = await import("../src/practice/hazard-builder-controller.ts")
  const paths: string[] = []
  const controller = createHazardBuilderController({ sources, navigate: path => { paths.push(path) } })
  for (const length of [0, -1, 1.5, 19, Number.NaN]) {
    controller.actions.setLength(length)
    controller.actions.start()
  }
  expect(paths).toHaveLength(0)
  controller.actions.setLength(5)
  controller.actions.setMode("nonvisual")
  controller.actions.setSeed("repeat")
  controller.actions.start()
  controller.actions.start()
  expect(paths).toEqual([assembleHazardDrill(sources, { seed: "repeat", length: 5, mode: "nonvisual" })[0]!.href])
  controller.dispose()
  const snapshot = controller.getSnapshot()
  controller.actions.setMode("visual")
  controller.actions.start()
  expect(controller.getSnapshot()).toBe(snapshot)
  expect(paths).toHaveLength(1)
})

it("focuses broken Hazard closure recovery without navigating", async () => {
  const { createHazardBuilderController } = await import("../src/practice/hazard-builder-controller.ts")
  let navigated = false
  const controller = createHazardBuilderController({ sources: sources.map(source => ({ ...source, visualItemUrl: "/wrong/" })), navigate: () => { navigated = true } })
  controller.actions.start()
  expect(navigated).toBe(false)
  expect(controller.getSnapshot().state.failure).toBe(true)
  expect(controller.getSnapshot().focusRequest?.target).toBe("failure")
  controller.actions.setSeed("retry")
  expect(controller.getSnapshot().state.failure).toBe(false)
  controller.dispose()
})

it("adds Review intent without changing historical drill coordinates", async () => {
  const { hazardReviewPath } = await import("../src/hazard-player/review-path.ts")
  const path = "/history/release-a-v1/hazards/session/release-a-nonvisual/scene/2/?set=custom-test&position=2#feedback"
  const review = hazardReviewPath(path)
  const url = new URL(review, "https://local.invalid")
  expect(url.pathname).toBe(new URL(path, "https://local.invalid").pathname)
  expect(url.searchParams.get("set")).toBe("custom-test")
  expect(url.searchParams.get("position")).toBe("2")
  expect(url.hash).toBe("#feedback")
  expect(url.searchParams.get("review")).toBe("1")
  expect(hazardReviewPath(review)).toBe(review)
})

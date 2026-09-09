import { matchesVersionedItemPath } from "../versioned-item-path.ts"
import { hazardAttemptId, sameHazardReceipt, type HazardAttemptReceipt } from "../attempt-receipt.ts"
import type { ReviewSceneSource } from "../review/model.ts"
import { parsePracticeSetId, selectPracticeSet } from "./set.ts"

const sceneCategory = "Workplace scenes"
export type HazardPracticeMode = "visual" | "nonvisual"

export const assembleHazardDrill = (
  sources: ReadonlyArray<ReviewSceneSource>,
  settings: { readonly seed: string; readonly length: number; readonly mode: HazardPracticeMode }
) => {
  const first = sources[0]
  if (first === undefined) throw new Error("Hazard scenes are unavailable")
  const inventory = sources.map((source) => {
    for (const mode of ["visual", "nonvisual"] as const) {
      const receipt = mode === "visual" ? source.visualReceipt : source.nonvisualReceipt
      const href = mode === "visual" ? source.visualItemUrl : source.nonvisualItemUrl
      if (receipt.mode !== mode || receipt.sceneId !== source.scene.id ||
        receipt.releaseId !== first.visualReceipt.releaseId || receipt.packVersion !== first.visualReceipt.packVersion ||
        receipt.assetRevision !== source.scene.asset.revision || receipt.assetMasterSha256 !== source.scene.asset.masterSha256 ||
        receipt.postcommitPath !== `/content/vertical-slice/scenes/${source.scene.asset.opaqueAssetId}.postcommit.json` ||
        !matchesVersionedItemPath(href, `/hazards/session/${receipt.sessionId}/scene/${receipt.position}/`, receipt)) {
        throw new Error("Hazard inventory does not match its released scene receipts")
      }
    }
    return { id: source.scene.id, category: sceneCategory, source }
  })
  const set = selectPracticeSet(inventory, first.visualReceipt.releaseId, {
    seed: settings.seed, length: settings.length, categories: [sceneCategory]
  })
  return set.items.map(({ source }, index) => {
    const canonicalReceipt = settings.mode === "visual" ? source.visualReceipt : source.nonvisualReceipt
    const itemUrl = settings.mode === "visual" ? source.visualItemUrl : source.nonvisualItemUrl
    const receipt = { ...canonicalReceipt, sessionId: set.id, position: index + 1 }
    return { source, canonicalReceipt, receipt, href: `${itemUrl}?set=${set.id}&position=${index + 1}` }
  })
}

export const resolveHazardDrill = (
  sources: ReadonlyArray<ReviewSceneSource>,
  attempt: { readonly id: string; readonly sceneId: string; readonly mode: HazardPracticeMode; readonly receipt?: HazardAttemptReceipt }
) => {
  const receipt = attempt.receipt
  if (receipt === undefined || attempt.id !== hazardAttemptId(receipt) ||
    attempt.sceneId !== receipt.sceneId || attempt.mode !== receipt.mode) return undefined
  const spec = parsePracticeSetId(receipt.sessionId, [sceneCategory])
  if (spec === undefined) return undefined
  try {
    const step = assembleHazardDrill(sources, { ...spec, mode: attempt.mode })[receipt.position - 1]
    return step !== undefined && sameHazardReceipt(step.receipt, receipt) ? step : undefined
  } catch {
    return undefined
  }
}

export const resolveCustomHazardSource = (
  sources: ReadonlyArray<ReviewSceneSource>,
  attempt: Parameters<typeof resolveHazardDrill>[1]
): ReviewSceneSource | undefined => {
  const step = resolveHazardDrill(sources, attempt)
  if (step === undefined) return undefined
  return attempt.mode === "visual"
    ? { ...step.source, visualReceipt: step.receipt, visualItemUrl: step.href }
    : { ...step.source, nonvisualReceipt: step.receipt, nonvisualItemUrl: step.href }
}

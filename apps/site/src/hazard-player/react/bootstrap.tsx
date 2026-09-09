import { ReviewSceneBootstrap } from "../../review/model.ts"
import { assembleHazardDrill } from "../../practice/hazard-set.ts"
import { parsePracticeSetId } from "../../practice/set.ts"
import { PrecommitScene } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import { createRoot } from "react-dom/client"
import { HazardAttemptReceipt, hazardAttemptId, sameHazardReceipt } from "../../attempt-receipt.ts"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { retainImageBlob } from "../../retained-image.ts"
import { installSessionNavigation } from "../../session-navigation.ts"
import {
  AssetContentReceipt,
  VerifiedContent
} from "../../verified-content.ts"
import {
  createHazardController,
  type LoadedHazardVisualAsset
} from "../controller.ts"
import {
  HazardPlayer,
  NonvisualHazardPractice,
  VisualHazardPractice
} from "./player.tsx"

const mount = document.querySelector<HTMLElement>("[data-hazard-player]")
const data = document.querySelector<HTMLScriptElement>("#hazard-scene-data")
const receiptData = document.querySelector<HTMLScriptElement>("#hazard-receipt-data")
const assetReceiptData = document.querySelector<HTMLScriptElement>("#hazard-asset-receipt-data")

if (
  mount === null ||
  data?.textContent === undefined ||
  data.textContent === null ||
  receiptData?.textContent === undefined ||
  receiptData.textContent === null
) {
  throw new Error("Hazard player bootstrap contract is incomplete")
}

const mode = mount.dataset.hazardMode
if (mode !== "visual" && mode !== "nonvisual") {
  throw new Error("Hazard player mode must be visual or nonvisual")
}

const scene = Schema.decodeUnknownSync(PrecommitScene)(JSON.parse(data.textContent))
let receipt = Schema.decodeUnknownSync(HazardAttemptReceipt)(JSON.parse(receiptData.textContent))
const expectedPostcommitPath =
  `/content/vertical-slice/scenes/${encodeURIComponent(scene.asset.opaqueAssetId)}.postcommit.json`
if (
  receipt.mode !== mode ||
  receipt.sceneId !== scene.id ||
  receipt.postcommitPath !== expectedPostcommitPath ||
  receipt.assetRevision !== scene.asset.revision ||
  receipt.assetMasterSha256 !== scene.asset.masterSha256
) {
  throw new Error("Hazard receipt does not match the released scene asset")
}

const visualAssetReceipt = (() => {
  if (mode === "nonvisual") return null
  if (assetReceiptData?.textContent === undefined || assetReceiptData.textContent === null) {
    throw new Error("Visual hazard asset receipt is missing")
  }
  const decoded = Schema.decodeUnknownSync(AssetContentReceipt)(
    JSON.parse(assetReceiptData.textContent)
  )
  const webDerivatives = scene.asset.derivatives.filter((candidate) => candidate.kind === "web")
  const webDerivative = webDerivatives.length === 1 ? webDerivatives[0] : undefined
  if (
    webDerivative === undefined ||
    decoded.path !== `/${webDerivative.path}` ||
    decoded.bytes !== webDerivative.bytes ||
    decoded.sha256 !== webDerivative.sha256
  ) {
    throw new Error("Visual hazard asset receipt does not match the exact web derivative")
  }
  return decoded
})()

const imageCanDecode = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(), { once: true })
    image.addEventListener(
      "error",
      () => reject(new Error("The verified scene bytes are not a decodable image.")),
      { once: true }
    )
    image.src = url
  })

const loadVisualAsset = async (): Promise<LoadedHazardVisualAsset | null> => {
  if (visualAssetReceipt === null) return null
  let url: string | null = null
  try {
    const blob = await appRuntime.runPromise(
      Effect.flatMap(VerifiedContent, (content) => content.loadAssetBlob(visualAssetReceipt))
    )
    const retained = await retainImageBlob(visualAssetReceipt, blob)
    url = URL.createObjectURL(blob)
    await imageCanDecode(url)
    return { url, retained }
  } catch {
    if (url !== null) URL.revokeObjectURL(url)
    return null
  }
}

let cleanup: (() => void) | undefined

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return
  cleanup?.()
})

const bootstrap = (): void => {
  let positionLabel = mount.dataset.positionLabel
  const params = new URLSearchParams(window.location.search)
  if (params.has("set") || params.has("position")) {
    try {
      if (params.getAll("set").length !== 1 || params.getAll("position").length !== 1) throw new Error("Ambiguous drill link")
      const spec = parsePracticeSetId(params.get("set")!, ["Workplace scenes"])
      const text = params.get("position")!
      const position = Schema.decodeUnknownSync(Schema.Int.check(Schema.isGreaterThan(0)))(Number(text))
      if (spec === undefined || String(position) !== text) throw new Error("Invalid drill configuration")
      const data = document.querySelector<HTMLScriptElement>("#hazard-drill-inventory")
      const sources = Schema.decodeUnknownSync(Schema.Array(ReviewSceneBootstrap))(JSON.parse(data?.textContent ?? "null"))
      const steps = assembleHazardDrill(sources, { ...spec, mode })
      const step = steps[position - 1]
      if (step === undefined || !sameHazardReceipt(step.canonicalReceipt, receipt) ||
        step.source.scene.id !== scene.id || new URL(step.href, window.location.origin).pathname !== window.location.pathname) throw new Error("Drill item does not match this scene")
      receipt = step.receipt
      positionLabel = `Scene ${position} of ${steps.length}`
      document.title = `${positionLabel} — Hazard practice`
      const navigation = document.querySelector<HTMLElement>('.directional-nav[aria-label="Hazard scene navigation"]')
      if (navigation !== null) {
        navigation.replaceChildren()
        for (const [target, label] of [[steps[position - 2], "← Previous scene"], [steps[position], "Next scene →"]] as const) {
          const node = document.createElement(target === undefined ? "span" : "a")
          node.textContent = target === undefined ? (label.startsWith("Next") ? "End of drill" : "") : label
          if (node instanceof HTMLAnchorElement && target !== undefined) {
            node.href = target.href
            node.dataset.sessionHistory = "replace"
          }
          navigation.append(node)
        }
      }
    } catch {
      const heading = document.createElement("h1")
      heading.textContent = "This hazard drill is unavailable"
      const detail = document.createElement("p")
      detail.textContent = "The drill link does not match this released scene. No response was saved."
      const link = document.createElement("a")
      link.href = "/hazards/"
      link.textContent = "Return to Hazard practice"
      mount.replaceChildren(heading, detail, link)
      document.querySelector('.directional-nav[aria-label="Hazard scene navigation"]')?.remove()
      return
    }
  }
  mount.dataset.hazardAttemptId = hazardAttemptId(receipt)
  const controller = createHazardController({
    scene,
    mode,
    receipt,
    runtime: appRuntime,
    visualAssetReceipt,
    loadVisualAsset,
    releaseVisualAssetUrl: (url) => URL.revokeObjectURL(url)
  })
  const root = createRoot(mount)
  const removeSessionNavigation = installSessionNavigation()

  root.render(
    <HazardPlayer.Provider controller={controller}>
      {mode === "visual" ? <VisualHazardPractice {...(positionLabel === undefined ? {} : { positionLabel })} /> : <NonvisualHazardPractice {...(positionLabel === undefined ? {} : { positionLabel })} />}
    </HazardPlayer.Provider>
  )

  queueMicrotask(() => controller.start())

  let cleanedUp = false
  cleanup = (): void => {
    if (cleanedUp) return
    cleanedUp = true
    removeSessionNavigation()
    root.unmount()
    controller.dispose()
    void disposeAppRuntime()
  }
}

bootstrap()

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js")
  })
}

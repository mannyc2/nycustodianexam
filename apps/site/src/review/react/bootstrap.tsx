import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { installSessionNavigation } from "../../session-navigation.ts"
import { ReviewQueueIsland } from "./review-queue.tsx"
import { createReviewController } from "../controller.ts"
import { ReviewQueueBootstrap } from "../model.ts"

const mount = document.querySelector<HTMLElement>("[data-review-queue]")
const data = document.querySelector<HTMLScriptElement>("#review-bootstrap-data")

if (mount === null || data?.textContent === undefined || data.textContent === null) {
  throw new Error("Review queue bootstrap contract is incomplete")
}

const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)(JSON.parse(data.textContent))

const questionIds = new Set<string>()
for (const question of bootstrap.questions) {
  if (
    questionIds.has(question.id) ||
    new Set(question.optionIds).size !== question.optionIds.length
  ) {
    throw new Error("Review bootstrap contains duplicate question or option identities")
  }
  questionIds.add(question.id)
  if (
    question.receipt.questionId !== question.id ||
    question.receipt.postcommitPath !==
      `/content/vertical-slice/questions/${encodeURIComponent(question.id)}.postcommit.json`
  ) {
    throw new Error("Review bootstrap question feedback path does not match its item ID")
  }
}

const sceneIds = new Set<string>()
for (const source of bootstrap.scenes) {
  if (sceneIds.has(source.scene.id)) {
    throw new Error("Review bootstrap contains a duplicate scene identity")
  }
  sceneIds.add(source.scene.id)
  const expectedPostcommitPath =
    `/content/vertical-slice/scenes/${encodeURIComponent(source.scene.asset.opaqueAssetId)}.postcommit.json`
  if (
    source.visualReceipt.sceneId !== source.scene.id ||
    source.nonvisualReceipt.sceneId !== source.scene.id ||
    source.visualReceipt.mode !== "visual" ||
    source.nonvisualReceipt.mode !== "nonvisual" ||
    source.visualReceipt.postcommitPath !== expectedPostcommitPath ||
    source.nonvisualReceipt.postcommitPath !== expectedPostcommitPath ||
    source.visualReceipt.postcommitBytes !== source.nonvisualReceipt.postcommitBytes ||
    source.visualReceipt.postcommitSha256 !== source.nonvisualReceipt.postcommitSha256 ||
    source.visualReceipt.assetRevision !== source.scene.asset.revision ||
    source.nonvisualReceipt.assetRevision !== source.scene.asset.revision ||
    source.visualReceipt.assetMasterSha256 !== source.scene.asset.masterSha256 ||
    source.nonvisualReceipt.assetMasterSha256 !== source.scene.asset.masterSha256
  ) {
    throw new Error("Review bootstrap scene feedback path does not match its opaque asset ID")
  }
}

const controller = createReviewController(bootstrap, appRuntime)
const root = createRoot(mount)
const removeSessionNavigation = installSessionNavigation()
root.render(<ReviewQueueIsland controller={controller} />)
queueMicrotask(() => controller.start())

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js")
  })
}

let cleanedUp = false
const cleanup = (): void => {
  if (cleanedUp) return
  cleanedUp = true
  removeSessionNavigation()
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return
  cleanup()
})

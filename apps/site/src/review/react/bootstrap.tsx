import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { installSessionNavigation } from "../../session-navigation.ts"
import { ReviewQueueIsland } from "./review-queue.tsx"
import { createReviewController } from "../controller.ts"
import { ReviewQueueBootstrap } from "../model.ts"
import { matchesQuestionPostcommitPath, questionAttemptId } from "../../attempt-receipt.ts"
import { loadStudyActivity } from "../../study/activity.ts"
import type { StudyActivityState } from "../../study/model.ts"

const mount = document.querySelector<HTMLElement>("[data-review-queue]")
const data = document.querySelector<HTMLScriptElement>("#review-bootstrap-data")

if (mount === null || data?.textContent === undefined || data.textContent === null) {
  throw new Error("Review queue bootstrap contract is incomplete")
}

const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)(JSON.parse(data.textContent))

const questionIds = new Set<string>()
for (const question of [...bootstrap.questions, ...(bootstrap.practiceQuestions ?? [])]) {
  const identity = questionAttemptId(question.receipt)
  if (
    questionIds.has(identity) ||
    new Set(question.optionIds).size !== question.optionIds.length
  ) {
    throw new Error("Review bootstrap contains duplicate question or option identities")
  }
  questionIds.add(identity)
  if (
    question.receipt.questionId !== question.id ||
    !matchesQuestionPostcommitPath(question.receipt.postcommitPath, question.id)
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
let activityState: StudyActivityState = { tag: "loading" }
let activityRead = 0
let cleanedUp = false
const render = (): void => {
  if (!cleanedUp) root.render(<ReviewQueueIsland controller={controller} activityState={activityState} onRetryHistory={readActivity} />)
}
const readActivity = (): void => {
  const revision = ++activityRead
  activityState = { tag: "loading" }
  render()
  void appRuntime.runPromise(loadStudyActivity(bootstrap)).then(
    (activity) => {
      if (cleanedUp || revision !== activityRead) return
      activityState = { tag: "ready", activity }
      render()
    },
    () => {
      if (cleanedUp || revision !== activityRead) return
      activityState = { tag: "unavailable" }
      render()
    }
  )
}
const unsubscribeHistory = controller.subscribe(() => {
  const state = controller.getSnapshot().state
  if (state.tag === "empty" || (state.tag === "ready" && state.acknowledgingItemId === null)) readActivity()
})
readActivity()
queueMicrotask(() => controller.start())

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js")
  })
}

const cleanup = (): void => {
  if (cleanedUp) return
  cleanedUp = true
  removeSessionNavigation()
  unsubscribeHistory()
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return
  cleanup()
})

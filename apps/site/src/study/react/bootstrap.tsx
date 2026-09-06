import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { createReviewController } from "../../review/controller.ts"
import { loadStudyActivity } from "../activity.ts"
import { StudyBootstrap, type StudyActivityState } from "../model.ts"
import { StudyHub } from "./study-hub.tsx"

const mount = document.querySelector<HTMLElement>("[data-study-hub]")
const data = document.querySelector<HTMLScriptElement>("#study-bootstrap-data")
if (mount === null || !data?.textContent) throw new Error("Study hub bootstrap contract is incomplete")
const bootstrap = Schema.decodeUnknownSync(StudyBootstrap)(JSON.parse(data.textContent))
const root = createRoot(mount)
const reviewController = createReviewController(bootstrap.reviewQueue, appRuntime)
let active = true
let readRevision = 0
let activityState: StudyActivityState = { tag: "loading" }
const render = (): void => {
  if (active) root.render(<StudyHub bootstrap={bootstrap} activityState={activityState} reviewController={reviewController} onRetry={readActivity} />)
}
const readActivity = (): void => {
  const revision = ++readRevision
  activityState = { tag: "loading" }
  render()
  void appRuntime.runPromise(loadStudyActivity(bootstrap.reviewQueue)).then(
    (activity) => {
      if (!active || revision !== readRevision) return
      activityState = { tag: "ready", activity }
      render()
    },
    () => {
      if (!active || revision !== readRevision) return
      activityState = { tag: "unavailable" }
      render()
    }
  )
}
readActivity()
queueMicrotask(() => reviewController.start())
window.addEventListener("pagehide", (event) => {
  if (event.persisted || !active) return
  active = false
  root.unmount()
  reviewController.dispose()
  void disposeAppRuntime()
})

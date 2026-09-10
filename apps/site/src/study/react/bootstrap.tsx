import { createPracticeBuilderController } from "../../practice/builder-controller.ts"
import { PracticeBuilderProvider } from "../../practice/react/builder-provider.tsx"
import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { createReviewController } from "../../review/controller.ts"
import { loadStudyActivity } from "../activity.ts"
import { StudyBootstrap } from "../model.ts"
import { StudyHub } from "./study-hub.tsx"
import { StudyProvider } from "./provider.tsx"
import { createStudyController } from "../controller.ts"

const mount = document.querySelector<HTMLElement>("[data-study-hub]")
const data = document.querySelector<HTMLScriptElement>("#study-bootstrap-data")
if (mount === null || !data?.textContent) throw new Error("Study hub bootstrap contract is incomplete")
const bootstrap = Schema.decodeUnknownSync(StudyBootstrap)(JSON.parse(data.textContent))
const builderController = createPracticeBuilderController({ sources: bootstrap.reviewQueue.questions, navigate: (path) => window.location.assign(path) })
const root = createRoot(mount)
const reviewController = createReviewController(bootstrap.reviewQueue, appRuntime)
const controller = createStudyController(reviewController, () => appRuntime.runPromise(loadStudyActivity(bootstrap.reviewQueue)))
root.render(<StudyProvider bootstrap={bootstrap} controller={controller}><PracticeBuilderProvider controller={builderController}><StudyHub /></PracticeBuilderProvider></StudyProvider>)
controller.start()
let active = true
window.addEventListener("pagehide", (event) => {
  if (event.persisted || !active) return
  active = false
  root.unmount()
  controller.dispose()
  builderController.dispose()
  void disposeAppRuntime()
})

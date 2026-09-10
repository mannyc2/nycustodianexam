import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { ReviewQueueBootstrap } from "../../review/model.ts"
import { createPracticeBuilderController } from "../builder-controller.ts"
import { PracticeBuilderProvider } from "./builder-provider.tsx"
import { PracticeSessionSetup } from "./builder.tsx"

const mount = document.querySelector<HTMLElement>("[data-practice-custom]")
const data = document.querySelector<HTMLScriptElement>("#practice-custom-data")
if (mount === null || !data?.textContent) throw new Error("Custom practice bootstrap contract is incomplete")
const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)(JSON.parse(data.textContent))
const controller = createPracticeBuilderController({ sources: bootstrap.questions, navigate: path => window.location.assign(path) })
const root = createRoot(mount)
root.render(<PracticeBuilderProvider controller={controller}><PracticeSessionSetup /></PracticeBuilderProvider>)
let active = true
window.addEventListener("pagehide", event => {
  if (event.persisted || !active) return
  active = false
  root.unmount()
  controller.dispose()
})

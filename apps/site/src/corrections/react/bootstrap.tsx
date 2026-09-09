import { createRoot } from "react-dom/client"
import { correctionRuntime, disposeCorrectionRuntime } from "../../correction-runtime.ts"
import { CorrectionForm } from "./correction-form.tsx"
import { CorrectionProvider } from "./provider.tsx"
import { createCorrectionController } from "../controller.ts"
import { fetchCorrectionIntakeStatus, submitCorrectionReport } from "../client.ts"

const mount = document.querySelector<HTMLElement>("[data-correction-form]")
if (mount === null) throw new Error("Correction form bootstrap contract is incomplete")

const root = createRoot(mount)
const controller = createCorrectionController(correctionRuntime, {
  createId: () => crypto.randomUUID(), now: () => Date.now(),
  checkIntake: () => fetchCorrectionIntakeStatus(fetch),
  submit: (report) => submitCorrectionReport(fetch, report),
  confirmDelete: (message) => window.confirm(message)
})
root.render(<CorrectionProvider controller={controller}><CorrectionForm /></CorrectionProvider>)
controller.start()

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  controller.dispose()
  root.unmount()
  void disposeCorrectionRuntime()
})

import { createRoot } from "react-dom/client"
import { correctionRuntime, disposeCorrectionRuntime } from "../../correction-runtime.ts"
import { CorrectionForm } from "./correction-form.tsx"

const mount = document.querySelector<HTMLElement>("[data-correction-form]")
if (mount === null) throw new Error("Correction form bootstrap contract is incomplete")

const root = createRoot(mount)
root.render(<CorrectionForm runtime={correctionRuntime} />)

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  root.unmount()
  void disposeCorrectionRuntime()
})

import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { createPrintBuilderController } from "../controller.ts"
import { createPrintJobId, PrintBuilderBootstrap } from "../model.ts"
import { PrintBuilder } from "./builder.tsx"

const mount = document.querySelector<HTMLElement>("[data-print-builder]")
const data = document.querySelector<HTMLScriptElement>("#print-builder-data")
if (mount === null || data?.textContent === undefined || data.textContent === null) {
  throw new Error("Print builder bootstrap contract is incomplete")
}

const bootstrap = Schema.decodeUnknownSync(PrintBuilderBootstrap)(JSON.parse(data.textContent))
const controller = createPrintBuilderController({
  bootstrap,
  runtime: appRuntime,
  createId: () => createPrintJobId(crypto.randomUUID()),
  navigate: (path) => window.location.assign(path)
})
const root = createRoot(mount)
root.render(<PrintBuilder bootstrap={bootstrap} controller={controller} />)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"))
}

let cleanedUp = false
const cleanup = (): void => {
  if (cleanedUp) return
  cleanedUp = true
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return
  cleanup()
})

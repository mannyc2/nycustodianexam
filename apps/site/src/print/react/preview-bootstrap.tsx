import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { createPrintPreviewController } from "../controller.ts"
import {
  createPrintJobId,
  parsePrintPreviewPath,
  PrintBuilderBootstrap
} from "../model.ts"
import { PrintPreview } from "./preview.tsx"

const mount = document.querySelector<HTMLElement>("[data-print-preview]")
const printJobId = parsePrintPreviewPath(window.location.pathname)
if (mount === null || printJobId === undefined) {
  throw new Error("Print preview bootstrap contract is incomplete")
}

let bootstrapPromise: Promise<PrintBuilderBootstrap> | undefined
const loadBootstrap = (): Promise<PrintBuilderBootstrap> => {
  bootstrapPromise ??= fetch("/print-bootstrap.json", {
    cache: "force-cache",
    credentials: "same-origin"
  }).then(async (response) => {
    if (!response.ok) throw new Error("Print inventory bootstrap is unavailable")
    return Schema.decodeUnknownSync(PrintBuilderBootstrap)(await response.json())
  })
  return bootstrapPromise
}
const controller = createPrintPreviewController({
  id: printJobId,
  loadBootstrap,
  runtime: appRuntime,
  createId: () => createPrintJobId(crypto.randomUUID()),
  replaceLocation: (path) => window.location.replace(path),
  openSystemPrint: () => window.print()
})
const root = createRoot(mount)
root.render(<PrintPreview controller={controller} />)
queueMicrotask(() => controller.start())

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

import { createRoot } from "react-dom/client"
import { decodeOfflinePackDescriptor } from "../model.ts"
import { disposeOfflinePackRuntime, offlinePackRuntime } from "../../offline-pack-runtime.ts"
import { OfflinePackManagerView } from "./pack-manager.tsx"
import { OfflineProvider } from "./provider.tsx"
import { createOfflineController } from "../controller.ts"
import { LocalActionError } from "../../local-failure-detail.ts"

const mount = document.querySelector<HTMLElement>("[data-offline-pack-manager]")
const headerMount = document.querySelector<HTMLElement>("[data-offline-header]")
const data = document.querySelector<HTMLScriptElement>("#offline-pack-descriptor")
if (mount === null || headerMount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Offline-pack bootstrap contract is incomplete")
}

const descriptor = decodeOfflinePackDescriptor(JSON.parse(data.textContent))
const root = createRoot(mount)
headerMount.replaceChildren()
const controller = createOfflineController(descriptor, offlinePackRuntime, {
  online: () => navigator.onLine !== false,
  ensureServiceWorker: async () => {
    if (!("serviceWorker" in navigator)) {
      throw new LocalActionError("This browser does not support the feature (a service worker) needed for offline navigation.")
    }
    await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    await navigator.serviceWorker.ready
  },
  estimateStorage: async () => {
    const estimate = await navigator.storage?.estimate?.()
    const persisted = await navigator.storage?.persisted?.()
    return { quota: estimate?.quota ?? null, usage: estimate?.usage ?? null, persisted: persisted ?? null }
  },
  requestPersistence: async () => navigator.storage?.persist === undefined ? null : navigator.storage.persist(),
  reload: () => location.reload()
})
root.render(<OfflineProvider controller={controller} headerMount={headerMount}><OfflinePackManagerView /></OfflineProvider>)
controller.start()

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  controller.dispose()
  root.unmount()
  void disposeOfflinePackRuntime()
})

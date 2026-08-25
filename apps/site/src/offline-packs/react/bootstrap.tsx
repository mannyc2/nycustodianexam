import { createRoot } from "react-dom/client"
import { decodeOfflinePackDescriptor } from "../model.ts"
import { disposeOfflinePackRuntime, offlinePackRuntime } from "../../offline-pack-runtime.ts"
import { OfflinePackManagerIsland } from "./pack-manager.tsx"

const mount = document.querySelector<HTMLElement>("[data-offline-pack-manager]")
const data = document.querySelector<HTMLScriptElement>("#offline-pack-descriptor")
if (mount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Offline-pack bootstrap contract is incomplete")
}

const descriptor = decodeOfflinePackDescriptor(JSON.parse(data.textContent))
const root = createRoot(mount)
root.render(<OfflinePackManagerIsland descriptor={descriptor} runtime={offlinePackRuntime} />)

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  root.unmount()
  void disposeOfflinePackRuntime()
})

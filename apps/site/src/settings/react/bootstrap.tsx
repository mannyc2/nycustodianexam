import { createRoot } from "react-dom/client"
import { decodeSettingsBootstrap } from "../model.ts"
import { disposeSettingsRuntime, settingsRuntime } from "../../settings-runtime.ts"
import { SettingsForm } from "./settings.tsx"
import { SettingsProvider } from "./provider.tsx"
import { createSettingsController } from "../controller.ts"
import { clearBootPreferences, saveBootPreferences } from "../preferences-boot.ts"

const mount = document.querySelector<HTMLElement>("[data-settings]")
const data = document.querySelector<HTMLScriptElement>("#settings-bootstrap-data")
if (mount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Settings bootstrap contract is incomplete")
}

const bootstrap = decodeSettingsBootstrap(JSON.parse(data.textContent))

const root = createRoot(mount)
const controller = createSettingsController(bootstrap, settingsRuntime, {
  applyPreferences: (stored) => (stored.updatedAt === 0 ? clearBootPreferences() : saveBootPreferences({
    schemaVersion: 1, largeText: stored.largeText, reduceMotion: stored.reduceMotion
  })).detail,
  download: (text, exportedAt) => {
    const href = URL.createObjectURL(new Blob([text], { type: "application/json" }))
    try {
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = `nycustodian-local-data-${new Date(exportedAt).toISOString().slice(0, 10)}.json`
      anchor.click()
    } finally { URL.revokeObjectURL(href) }
  }
})
root.render(<SettingsProvider controller={controller}><SettingsForm /></SettingsProvider>)
controller.start()
window.addEventListener("focus", controller.refreshSavedWork)
window.addEventListener("pageshow", controller.refreshSavedWork)

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  window.removeEventListener("focus", controller.refreshSavedWork)
  window.removeEventListener("pageshow", controller.refreshSavedWork)
  controller.dispose()
  root.unmount()
  void disposeSettingsRuntime()
})

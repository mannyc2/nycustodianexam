import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { SettingsBootstrap } from "../model.ts"
import { disposeSettingsRuntime, settingsRuntime } from "../../settings-runtime.ts"
import { SettingsIsland } from "./settings.tsx"

const mount = document.querySelector<HTMLElement>("[data-settings]")
const data = document.querySelector<HTMLScriptElement>("#settings-bootstrap-data")
if (mount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Settings bootstrap contract is incomplete")
}

const bootstrap = Schema.decodeUnknownSync(SettingsBootstrap)(JSON.parse(data.textContent))
if (
  new Set(bootstrap.questionIds).size !== bootstrap.questionIds.length ||
  new Set(bootstrap.sceneIds).size !== bootstrap.sceneIds.length
) {
  throw new Error("Settings bootstrap contains duplicate content references")
}

const root = createRoot(mount)
root.render(<SettingsIsland bootstrap={bootstrap} runtime={settingsRuntime} />)

let cleanedUp = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleanedUp) return
  cleanedUp = true
  root.unmount()
  void disposeSettingsRuntime()
})

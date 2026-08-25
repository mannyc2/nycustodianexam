import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { SimulationBootstrap } from "../model.ts"
import { SimulationSetup } from "./setup.tsx"

const mount = document.querySelector<HTMLElement>("[data-simulation-setup]")
const data = document.querySelector<HTMLScriptElement>("#simulation-bootstrap-data")
if (mount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Simulation setup bootstrap contract is incomplete")
}
const bootstrap = Schema.decodeUnknownSync(SimulationBootstrap)(JSON.parse(data.textContent))
const root = createRoot(mount)
root.render(<SimulationSetup bootstrap={bootstrap} navigate={(path) => window.location.assign(path)} runtime={appRuntime} />)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"))
}

let cleaned = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleaned) return
  cleaned = true
  root.unmount()
  void disposeAppRuntime()
})

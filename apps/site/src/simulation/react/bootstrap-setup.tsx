import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { SimulationBootstrap } from "../model.ts"
import { createSimulationSetupController } from "../setup-controller.ts"
import { createLocallyClosedSimulation } from "../controller.ts"
import { SimulationSetup } from "./setup.tsx"

const mount = document.querySelector<HTMLElement>("[data-simulation-setup]")
const data = document.querySelector<HTMLScriptElement>("#simulation-bootstrap-data")
if (mount === null || data?.textContent === null || data?.textContent === undefined) {
  throw new Error("Simulation setup bootstrap contract is incomplete")
}
const bootstrap = Schema.decodeUnknownSync(SimulationBootstrap)(JSON.parse(data.textContent))
const root = createRoot(mount)
const controller = createSimulationSetupController({
  bootstrap,
  createSessionId: () => `sim-${crypto.randomUUID().toLowerCase()}`,
  now: () => Date.now(),
  save: (session) => appRuntime.runPromise(createLocallyClosedSimulation(session)),
  navigate: (path) => window.location.assign(path)
})
root.render(<SimulationSetup controller={controller} />)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"))
}

let cleaned = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleaned) return
  cleaned = true
  controller.dispose()
  root.unmount()
  void disposeAppRuntime()
})

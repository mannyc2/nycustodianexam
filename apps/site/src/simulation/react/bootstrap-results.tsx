import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { createSimulationResultsController } from "../controller.ts"
import { parseSimulationRoute } from "../model.ts"
import { SimulationResults } from "./results.tsx"

const mount = document.querySelector<HTMLElement>("[data-simulation-results]")
const route = parseSimulationRoute(window.location.pathname)
if (mount === null || route?.tag !== "results") {
  throw new Error("Simulation results route contract is incomplete")
}
const controller = createSimulationResultsController({ runtime: appRuntime, sessionId: route.sessionId })
const root = createRoot(mount)
root.render(<SimulationResults controller={controller} />)
queueMicrotask(controller.start)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"))
}

let cleaned = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleaned) return
  cleaned = true
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
})

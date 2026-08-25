import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { installSessionNavigation } from "../../session-navigation.ts"
import { createSimulationPlayerController } from "../controller.ts"
import { parseSimulationRoute } from "../model.ts"
import { SimulationPlayer } from "./player.tsx"

const mount = document.querySelector<HTMLElement>("[data-simulation-player]")
const route = parseSimulationRoute(window.location.pathname)
if (mount === null || route?.tag !== "question") {
  throw new Error("Simulation player route contract is incomplete")
}
const controller = createSimulationPlayerController({
  runtime: appRuntime,
  sessionId: route.sessionId,
  position: route.position,
  replaceLocation: (path) => window.location.replace(path)
})
const root = createRoot(mount)
const removeSessionNavigation = installSessionNavigation()
root.render(<SimulationPlayer controller={controller} position={route.position} />)
queueMicrotask(controller.start)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"))
}

let cleaned = false
window.addEventListener("pagehide", (event) => {
  if (event.persisted || cleaned) return
  cleaned = true
  removeSessionNavigation()
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
})

import { createHazardBuilderController } from "../hazard-builder-controller.ts"
import { HazardBuilderProvider } from "./hazard-builder-provider.tsx"
import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { ReviewSceneBootstrap } from "../../review/model.ts"
import { HazardSessionSetup } from "./hazard-builder.tsx"

const mount = document.querySelector<HTMLElement>("[data-hazard-builder]")
const data = document.querySelector<HTMLScriptElement>("#hazard-builder-data")
if (mount === null || !data?.textContent) throw new Error("Hazard builder contract is incomplete")
const sources = Schema.decodeUnknownSync(Schema.Array(ReviewSceneBootstrap))(JSON.parse(data.textContent))
const controller = createHazardBuilderController({ sources, navigate: (path) => window.location.assign(path) })
const root = createRoot(mount)
root.render(<HazardBuilderProvider controller={controller}><HazardSessionSetup /></HazardBuilderProvider>)
window.addEventListener("pagehide", (event) => { if (!event.persisted) { root.unmount(); controller.dispose() } })

import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { ReviewSceneBootstrap } from "../../review/model.ts"
import { HazardBuilder } from "./hazard-builder.tsx"

const mount = document.querySelector<HTMLElement>("[data-hazard-builder]")
const data = document.querySelector<HTMLScriptElement>("#hazard-builder-data")
if (mount === null || !data?.textContent) throw new Error("Hazard builder contract is incomplete")
const sources = Schema.decodeUnknownSync(Schema.Array(ReviewSceneBootstrap))(JSON.parse(data.textContent))
const root = createRoot(mount)
root.render(<HazardBuilder sources={sources} />)
window.addEventListener("pagehide", (event) => { if (!event.persisted) root.unmount() })

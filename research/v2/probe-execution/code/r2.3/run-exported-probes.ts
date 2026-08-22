import { Effect } from "effect"
import layerReuse from "./layer-reuse.ts"
import webHandler from "./http-web-handler.ts"

const reuse = await Effect.runPromise(layerReuse as Effect.Effect<any>)
console.log("layer-reuse result:", JSON.stringify(reuse))
if (reuse.builds !== 1 || reuse.first.buildNumber !== 1 || reuse.second.buildNumber !== 1)
  throw new Error("layer reuse expectation failed")

const resp = await Effect.runPromise(webHandler as Effect.Effect<Response>)
const body = await resp.json()
console.log("web-handler status:", resp.status, "body:", JSON.stringify(body))
if (resp.status !== 200 || body.ok !== true) throw new Error("web handler expectation failed")
console.log("ALL EXPORTED PROBES PASS")

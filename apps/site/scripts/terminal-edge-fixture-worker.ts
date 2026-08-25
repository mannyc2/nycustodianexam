import {
  createAssetRouter,
  type AssetRouterEnvironment
} from "../src/asset-router.ts"
import { createWithdrawalRegistry } from "../src/withdrawal-registry.ts"

const fixtureRouter = createAssetRouter(createWithdrawalRegistry([{
  path: "/terminal-fixture/withdrawn/",
  publicMessage: "This fixture verifies a known withdrawal without publishing removed content.",
  recoveryPath: "/status/",
  recoveryLabel: "Open the recovery guide"
}]))

export default {
  fetch(request: Request, environment: AssetRouterEnvironment): Promise<Response> {
    if (new URL(request.url).pathname === "/terminal-fixture/service-unavailable/") {
      return fixtureRouter.fetch(request, {
        ASSETS: {
          fetch: async () => Promise.reject(
            new Error("injected fixture detail must never reach the response")
          )
        }
      })
    }
    return fixtureRouter.fetch(request, environment)
  }
}

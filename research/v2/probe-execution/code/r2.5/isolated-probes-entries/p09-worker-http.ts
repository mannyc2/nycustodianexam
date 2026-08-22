import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

const Routes = HttpRouter.add(
  "GET",
  "/health",
  Effect.gen(function*() {
    return yield* HttpServerResponse.json({ ok: true })
  })
)

const web = HttpRouter.toWebHandler(Routes, { disableLogger: true })

web.handler(new Request("https://worker.test/health")).then(async (response) => {
  document.body.dataset.p09 = String(response.status)
})

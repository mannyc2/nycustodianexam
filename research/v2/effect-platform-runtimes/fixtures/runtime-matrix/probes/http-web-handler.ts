import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

const Routes = HttpRouter.add(
  "GET",
  "/probe",
  HttpServerResponse.json({ ok: true })
)

const { handler, dispose } = HttpRouter.toWebHandler(Routes, {
  disableLogger: true
})

const program = Effect.acquireUseRelease(
  Effect.succeed(handler),
  (run) => Effect.promise(() => run(new Request("https://worker.test/probe"))),
  () => Effect.promise(dispose)
)

// Intended Bun/Node test harness entry. Not executed in this lane.
export default program

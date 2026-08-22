import { Context, Effect, Layer } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

let builds = 0

class ProbeState extends Context.Service<ProbeState, {
  readonly buildNumber: number
}>()("r23/ProbeState") {}

const ProbeStateLive = Layer.effect(
  ProbeState,
  Effect.sync(() => ProbeState.of({ buildNumber: ++builds }))
)

const Routes = HttpRouter.add(
  "GET",
  "/reuse",
  Effect.gen(function*() {
    const state = yield* ProbeState
    return yield* HttpServerResponse.json({ buildNumber: state.buildNumber })
  })
)

// rc.110: handler-required services must be part of the app layer passed to
// toWebHandler; Layer.provide at route level is consumed at construction only.
const web = HttpRouter.toWebHandler(Layer.mergeAll(Routes, ProbeStateLive), { disableLogger: true })

const program = Effect.acquireUseRelease(
  Effect.succeed(web.handler),
  (handler) => Effect.promise(async () => {
    const first = await handler(new Request("https://worker.test/reuse"))
    const second = await handler(new Request("https://worker.test/reuse"))
    return {
      first: await first.json(),
      second: await second.json(),
      builds
    }
  }),
  () => Effect.promise(web.dispose)
)

// Expected result: both responses report buildNumber 1 and `builds` is 1.
// Not executed in this lane.
export default program

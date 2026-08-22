import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

class Clock extends Context.Service<Clock, { readonly now: () => number }>()("p04/Clock") {}

const ClockLive = Layer.succeed(Clock, Clock.of({ now: () => Date.now() }))

const program = Effect.gen(function*() {
  const clock = yield* Clock
  return clock.now()
})

document.body.dataset.p04 = String(Effect.runSync(program.pipe(Effect.provide(ClockLive))))

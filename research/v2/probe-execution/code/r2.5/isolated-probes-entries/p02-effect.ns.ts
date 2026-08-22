import { Effect } from "effect"

const program = Effect.gen(function*() {
  yield* Effect.log("p02 basic workflow")
  return 21 * 2
})

document.body.dataset.p02 = String(Effect.runSync(program))

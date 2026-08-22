import { Context, Effect, Layer, Ref } from "effect"

export class BackgroundHeartbeat extends Context.Service<BackgroundHeartbeat, {
  readonly current: Effect.Effect<number>
}>()("@nycustodianexam/site/BackgroundHeartbeat") {
  static readonly layer = Layer.effect(
    BackgroundHeartbeat,
    Effect.gen(function*() {
      const ticks = yield* Ref.make(0)

      yield* Effect.forkScoped(
        Effect.gen(function*() {
          while (true) {
            yield* Effect.sleep("10 millis")
            yield* Ref.update(ticks, (value) => value + 1)
          }
        })
      )

      return BackgroundHeartbeat.of({
        current: Ref.get(ticks)
      })
    })
  )
}

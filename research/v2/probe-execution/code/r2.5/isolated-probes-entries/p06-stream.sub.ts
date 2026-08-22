import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

const program = Stream.range(1, 10).pipe(
  Stream.map((n) => n * n),
  Stream.runCollect
)

Effect.runPromise(program).then((chunk) => {
  document.body.dataset.p06 = String(chunk.length)
})

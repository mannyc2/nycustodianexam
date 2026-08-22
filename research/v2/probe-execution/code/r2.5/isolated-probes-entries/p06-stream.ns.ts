import { Effect, Stream } from "effect"

const program = Stream.range(1, 10).pipe(
  Stream.map((n) => n * n),
  Stream.runCollect
)

Effect.runPromise(program).then((chunk) => {
  document.body.dataset.p06 = String(chunk.length)
})

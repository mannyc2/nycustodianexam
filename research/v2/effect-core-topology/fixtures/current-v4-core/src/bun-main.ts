import { BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { BackgroundHeartbeat } from "./resource.js"
import { AttemptStore, commitSelectedAnswer } from "./services.js"

const AppLayer = Layer.mergeAll(
  AttemptStore.layerMemory,
  BackgroundHeartbeat.layer
)

const main = Effect.gen(function*() {
  const committed = yield* commitSelectedAnswer({
    attemptId: "attempt-1",
    sessionId: "session-1",
    questionId: "question-1",
    selectedOptionId: "option-b"
  })

  yield* Effect.logInfo("committed attempt", committed)
}).pipe(
  Effect.provide(AppLayer)
)

BunRuntime.runMain(main)

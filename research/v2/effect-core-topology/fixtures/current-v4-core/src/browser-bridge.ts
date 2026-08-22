import { Effect, Layer, ManagedRuntime } from "effect"
import { BackgroundHeartbeat } from "./resource.js"
import {
  AttemptStore,
  commitSelectedAnswer,
  type CommitAttempt
} from "./services.js"

const BrowserLayer = Layer.mergeAll(
  AttemptStore.layerMemory,
  BackgroundHeartbeat.layer
)

export const browserRuntime = ManagedRuntime.make(BrowserLayer)

export const commitFromClick = (input: CommitAttempt) =>
  browserRuntime.runPromise(commitSelectedAnswer(input))

export const readHeartbeatFromHost = () =>
  browserRuntime.runPromise(
    Effect.gen(function*() {
      const heartbeat = yield* BackgroundHeartbeat
      return yield* heartbeat.current
    })
  )

export const disposeBrowserRuntime = () => browserRuntime.dispose()

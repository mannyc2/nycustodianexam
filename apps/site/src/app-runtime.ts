import { Layer, ManagedRuntime } from "effect"
import { hazardPersistenceLive } from "./hazard-player/persistence.ts"
import { questionPersistenceLive } from "./question-player/persistence.ts"
import { reviewPersistenceLive } from "./review/persistence.ts"
import { appDatabaseLive } from "./study-storage/app-database.ts"
import { liveVerifiedContent } from "./verified-content.ts"

const persistenceLayer = Layer.mergeAll(
  questionPersistenceLive,
  hazardPersistenceLive,
  reviewPersistenceLive
).pipe(Layer.provide(appDatabaseLive))

const applicationLayer = Layer.mergeAll(
  persistenceLayer,
  liveVerifiedContent
)

export const appRuntime = ManagedRuntime.make(applicationLayer)

let disposal: Promise<void> | undefined

export const disposeAppRuntime = (): Promise<void> => {
  disposal ??= appRuntime.dispose()
  return disposal
}

import { Layer, ManagedRuntime } from "effect"
import { hazardPersistenceLive } from "./hazard-player/persistence.ts"
import { questionPersistenceLive } from "./question-player/persistence.ts"
import { reviewPersistenceLive } from "./review/persistence.ts"
import { dataTransferLive } from "./settings/data-transfer.ts"
import { settingsPersistenceLive } from "./settings/persistence.ts"
import { appDatabaseLive } from "./study-storage/app-database.ts"
import { liveVerifiedContent } from "./verified-content.ts"

const persistenceLayer = Layer.mergeAll(
  settingsPersistenceLive,
  questionPersistenceLive,
  hazardPersistenceLive,
  reviewPersistenceLive
).pipe(Layer.provide(appDatabaseLive))

export const settingsRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    persistenceLayer,
    dataTransferLive.pipe(Layer.provide(persistenceLayer)),
    liveVerifiedContent
  )
)

let disposal: Promise<void> | undefined

export const disposeSettingsRuntime = (): Promise<void> => {
  disposal ??= settingsRuntime.dispose()
  return disposal
}

import { Layer, ManagedRuntime } from "effect"
import { dataTransferLive } from "./settings/data-transfer.ts"
import { settingsPersistenceLive } from "./settings/persistence.ts"
import { appDatabaseLive } from "./study-storage/app-database.ts"

const persistenceLayer = settingsPersistenceLive.pipe(Layer.provide(appDatabaseLive))

export const settingsRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    persistenceLayer,
    dataTransferLive.pipe(Layer.provide(persistenceLayer))
  )
)

let disposal: Promise<void> | undefined

export const disposeSettingsRuntime = (): Promise<void> => {
  disposal ??= settingsRuntime.dispose()
  return disposal
}

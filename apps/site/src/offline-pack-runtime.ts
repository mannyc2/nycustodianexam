import { Layer, ManagedRuntime } from "effect"
import { offlinePackManagerLive } from "./offline-packs/manager.ts"
import { offlinePackPersistenceLive } from "./offline-packs/persistence.ts"
import { appDatabaseLive } from "./study-storage/app-database.ts"

const persistenceLayer = offlinePackPersistenceLive.pipe(Layer.provide(appDatabaseLive))

export const offlinePackRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    persistenceLayer,
    offlinePackManagerLive.pipe(Layer.provide(persistenceLayer))
  )
)

let disposal: Promise<void> | undefined

export const disposeOfflinePackRuntime = (): Promise<void> => {
  disposal ??= offlinePackRuntime.dispose()
  return disposal
}

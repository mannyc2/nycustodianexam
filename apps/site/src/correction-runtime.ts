import { Layer, ManagedRuntime } from "effect"
import { correctionDraftPersistenceLive } from "./corrections/persistence.ts"
import { appDatabaseLive } from "./study-storage/app-database.ts"

export const correctionRuntime = ManagedRuntime.make(
  correctionDraftPersistenceLive.pipe(Layer.provide(appDatabaseLive))
)

let disposal: Promise<void> | undefined

export const disposeCorrectionRuntime = (): Promise<void> => {
  disposal ??= correctionRuntime.dispose()
  return disposal
}

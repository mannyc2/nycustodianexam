import { Effect, Layer } from "effect"
import { makeConnectionOwner } from "./app-database/connection-owner.ts"
import { importLegacyDatabase } from "./app-database/legacy-import.ts"
import { AppDatabase } from "./app-database/storage-model.ts"

export {
  AppDatabase,
  AppDatabaseError,
  appDatabaseName,
  appDatabaseStores,
  appDatabaseVersion,
  legacyAppDatabaseNames,
  StudySessionRecord
} from "./app-database/storage-model.ts"
export type {
  LegacyDatabaseImport,
  LegacyImportReport,
  LegacyStoreImport
} from "./app-database/storage-model.ts"

export const appDatabaseLive = Layer.effect(
  AppDatabase,
  Effect.gen(function*() {
    const owner = yield* Effect.acquireRelease(
      Effect.sync(makeConnectionOwner),
      (owner) => Effect.sync(owner.dispose)
    )

    const closeForPageHide = () => owner.closeForPageHide()
    const reopenAfterPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      void Effect.runPromise(owner.connection).catch(() => undefined)
    }
    yield* Effect.acquireRelease(
      Effect.sync(() => {
        window.addEventListener("pagehide", closeForPageHide)
        window.addEventListener("pageshow", reopenAfterPageShow)
      }),
      () => Effect.sync(() => {
        window.removeEventListener("pagehide", closeForPageHide)
        window.removeEventListener("pageshow", reopenAfterPageShow)
      })
    )
    yield* owner.connection

    return AppDatabase.of({
      connection: owner.connection,
      importLegacyDatabase: (input) =>
        owner.connection.pipe(
          Effect.flatMap((database) => importLegacyDatabase(database, input))
        )
    })
  })
)

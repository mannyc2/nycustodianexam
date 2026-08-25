import { Clock, Context, Effect, Layer, Schema } from "effect"
import { localFailureDetail } from "../local-failure-detail.ts"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import {
  SitePreferencesRecord,
  decodeStoredSitePreferences,
  defaultSitePreferences,
  type ResetPreview,
  type ResetScope
} from "./model.ts"

export class SettingsPersistenceError extends Schema.TaggedError<SettingsPersistenceError>()(
  "SettingsPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class SettingsPersistence extends Context.Service<
  SettingsPersistence,
  {
    readonly connection: Effect.Effect<IDBDatabase, SettingsPersistenceError>
    readonly loadPreferences: () => Effect.Effect<SitePreferencesRecord, SettingsPersistenceError>
    readonly previewReset: (scope: ResetScope) => Effect.Effect<ResetPreview, SettingsPersistenceError>
    readonly reset: (preview: ResetPreview) => Effect.Effect<ResetPreview, SettingsPersistenceError>
    readonly savePreferences: (
      preferences: SitePreferencesRecord
    ) => Effect.Effect<SitePreferencesRecord, SettingsPersistenceError>
  }
>()("@nycustodian/site/SettingsPersistence") {}

const error = (operation: string, cause: unknown): SettingsPersistenceError =>
  new SettingsPersistenceError({
    operation,
    detail: localFailureDetail(cause, "Settings storage failed"),
    cause
  })

const databaseError = (cause: AppDatabaseError): SettingsPersistenceError =>
  error(cause.operation, cause)

const loadPreferences = (database: IDBDatabase): Promise<SitePreferencesRecord> =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction(appDatabaseStores.preferences, "readonly")
    const request = transaction.objectStore(appDatabaseStores.preferences).get("site-preferences")
    let result = defaultSitePreferences()
    request.onsuccess = () => {
      try {
        if (request.result !== undefined) {
          result = decodeStoredSitePreferences(request.result)
        }
      } catch (cause) {
        transaction.abort()
        reject(cause)
      }
    }
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Preference read aborted"))
  })

const savePreferences = (
  database: IDBDatabase,
  preferences: SitePreferencesRecord,
  updatedAt: number
): Promise<SitePreferencesRecord> => new Promise((resolve, reject) => {
  const transaction = database.transaction(appDatabaseStores.preferences, "readwrite")
  const saved = decodeStoredSitePreferences(new SitePreferencesRecord({ ...preferences, updatedAt }))
  transaction.objectStore(appDatabaseStores.preferences).put(saved)
  transaction.oncomplete = () => resolve(saved)
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Preference write aborted"))
})

export const storesForResetScope = (scope: ResetScope): ReadonlyArray<string> => {
  const study = [
    appDatabaseStores.questionAttempts,
    appDatabaseStores.questionSessions,
    appDatabaseStores.hazardAttempts,
    appDatabaseStores.hazardSessions,
    appDatabaseStores.reviewAcknowledgements,
    appDatabaseStores.simulationSessions,
    appDatabaseStores.simulationSubmissions,
    appDatabaseStores.printJobs
  ]
  switch (scope) {
    case "study-events": return study
    case "preferences": return [appDatabaseStores.preferences]
    case "correction-drafts": return [appDatabaseStores.correctionDrafts]
    case "transfer-quarantine": return [appDatabaseStores.transferQuarantine]
    case "all-portable-data": return [
      ...study,
      appDatabaseStores.preferences,
      appDatabaseStores.correctionDrafts,
      appDatabaseStores.transferQuarantine
    ]
  }
}

const previewReset = (database: IDBDatabase, scope: ResetScope): Promise<ResetPreview> =>
  new Promise((resolve, reject) => {
    const stores = storesForResetScope(scope)
    const transaction = database.transaction(stores, "readonly")
    const counts = new Map<string, number>()
    for (const store of stores) {
      const request = transaction.objectStore(store).count()
      request.onsuccess = () => counts.set(store, request.result)
    }
    transaction.oncomplete = () => {
      const records = stores.map((name) => ({ name, records: counts.get(name) ?? 0 }))
      resolve({
        scope,
        records: records.reduce((sum, entry) => sum + entry.records, 0),
        stores: records,
        excludesOfflinePacks: true
      })
    }
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Reset preview aborted"))
  })

const reset = (database: IDBDatabase, preview: ResetPreview): Promise<ResetPreview> =>
  new Promise((resolve, reject) => {
    const expectedStores = storesForResetScope(preview.scope)
    if (
      !preview.excludesOfflinePacks ||
      expectedStores.length !== preview.stores.length ||
      expectedStores.some((store, index) => preview.stores[index]?.name !== store)
    ) {
      reject(new Error("Reset preview no longer matches the requested scope"))
      return
    }
    const transaction = database.transaction(expectedStores, "readwrite")
    const counts = new Map<string, number>()
    let pendingCounts = expectedStores.length
    for (const store of expectedStores) {
      const count = transaction.objectStore(store).count()
      count.onsuccess = () => {
        counts.set(store, count.result)
        pendingCounts -= 1
        if (pendingCounts === 0) {
          for (const target of expectedStores) transaction.objectStore(target).clear()
        }
      }
    }
    transaction.oncomplete = () => {
      const stores = expectedStores.map((name) => ({ name, records: counts.get(name) ?? 0 }))
      resolve({
        scope: preview.scope,
        records: stores.reduce((sum, entry) => sum + entry.records, 0),
        stores,
        excludesOfflinePacks: true
      })
    }
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Scoped reset aborted"))
  })

const run = <A>(operation: string, effect: () => Promise<A>) => Effect.tryPromise({
  try: effect,
  catch: (cause) => error(operation, cause)
})

export const settingsPersistenceLive = Layer.effect(
  SettingsPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(Effect.mapError(databaseError))
    return SettingsPersistence.of({
      connection,
      loadPreferences: () => connection.pipe(
        Effect.flatMap((database) => run("load-preferences", () => loadPreferences(database)))
      ),
      previewReset: (scope) => connection.pipe(
        Effect.flatMap((database) => run("preview-reset", () => previewReset(database, scope)))
      ),
      reset: (preview) => connection.pipe(
        Effect.flatMap((database) => run("reset", () => reset(database, preview)))
      ),
      savePreferences: (preferences) => Effect.gen(function*() {
        const database = yield* connection
        const updatedAt = yield* Clock.currentTimeMillis
        return yield* run("save-preferences", () =>
          savePreferences(database, preferences, updatedAt)
        )
      })
    })
  })
)

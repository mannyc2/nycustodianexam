import { Effect } from "effect"
import {
  appDatabaseName,
  appDatabaseStores,
  appDatabaseVersion,
  databaseError,
  type AppDatabaseError
} from "./storage-model.ts"

const openDatabase = (
  onVersionChange: (database: IDBDatabase) => void
): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(appDatabaseName, appDatabaseVersion)
    request.onupgradeneeded = () => {
      const database = request.result
      for (const store of Object.values(appDatabaseStores)) {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: "id" })
        }
      }
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => onVersionChange(database)
      resolve(database)
    }
    request.onerror = () => reject(request.error)
  })

class StalePageConnection extends Error {}

export interface AppDatabaseConnectionOwner {
  readonly connection: Effect.Effect<IDBDatabase, AppDatabaseError>
  readonly closeForPageHide: () => void
  readonly dispose: () => void
}

export const makeConnectionOwner = (): AppDatabaseConnectionOwner => {
  let database: IDBDatabase | undefined
  let opening: Promise<IDBDatabase> | undefined
  let lifecycleEpoch = 0
  let disposed = false
  let invalidated = false

  const connectOnce = (): Promise<IDBDatabase> => {
    if (disposed) return Promise.reject(new Error("The app database owner is disposed"))
    if (invalidated) {
      return Promise.reject(
        new Error("A newer app version changed local storage; reload before continuing")
      )
    }
    if (database !== undefined) return Promise.resolve(database)
    if (opening !== undefined) return opening

    const openingEpoch = lifecycleEpoch
    const pending = openDatabase((changedDatabase) => {
      invalidated = true
      lifecycleEpoch += 1
      if (database === changedDatabase) database = undefined
      changedDatabase.close()
    }).then((openedDatabase) => {
      if (disposed || invalidated) {
        openedDatabase.close()
        throw new Error("The app database connection is no longer current")
      }
      if (openingEpoch !== lifecycleEpoch) {
        openedDatabase.close()
        throw new StalePageConnection("The page lifecycle changed while opening IndexedDB")
      }
      database = openedDatabase
      return openedDatabase
    })
    opening = pending
    const clearPending = () => {
      if (opening === pending) opening = undefined
    }
    void pending.then(clearPending, clearPending)
    return pending
  }

  const connect = async (): Promise<IDBDatabase> => {
    while (true) {
      try {
        return await connectOnce()
      } catch (cause) {
        if (cause instanceof StalePageConnection) continue
        throw cause
      }
    }
  }

  const connection = Effect.tryPromise({
    try: () => connect(),
    catch: (cause) => databaseError("access", cause)
  })

  return {
    connection,
    closeForPageHide: () => {
      lifecycleEpoch += 1
      database?.close()
      database = undefined
    },
    dispose: () => {
      disposed = true
      lifecycleEpoch += 1
      database?.close()
      database = undefined
    }
  }
}

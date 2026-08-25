import { Clock, Context, Effect, Layer, Schema } from "effect"
import { localFailureDetail } from "../local-failure-detail.ts"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import { CorrectionDraftRecord, decodeStoredCorrectionDraft } from "./model.ts"

export class CorrectionDraftPersistenceError extends Schema.TaggedError<CorrectionDraftPersistenceError>()(
  "CorrectionDraftPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class CorrectionDraftPersistence extends Context.Service<
  CorrectionDraftPersistence,
  {
    readonly findLatest: () => Effect.Effect<
      CorrectionDraftRecord | undefined,
      CorrectionDraftPersistenceError
    >
    readonly save: (
      draft: CorrectionDraftRecord
    ) => Effect.Effect<CorrectionDraftRecord, CorrectionDraftPersistenceError>
    readonly remove: (id: string) => Effect.Effect<void, CorrectionDraftPersistenceError>
  }
>()("@nycustodian/site/CorrectionDraftPersistence") {}

const storeName = appDatabaseStores.correctionDrafts

const persistenceError = (
  operation: string,
  cause: unknown
): CorrectionDraftPersistenceError => new CorrectionDraftPersistenceError({
  operation,
  detail: localFailureDetail(cause, "Local correction-draft storage failed"),
  cause
})

const databaseError = (cause: AppDatabaseError): CorrectionDraftPersistenceError =>
  persistenceError(cause.operation, cause)

const transactionPromise = <A>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (
    store: IDBObjectStore,
    complete: (value: A) => void,
    reject: (cause: unknown) => void
  ) => void
): Promise<A> => new Promise((resolve, reject) => {
  const transaction = database.transaction(storeName, mode)
  let hasResult = false
  let result: A | undefined
  operation(transaction.objectStore(storeName), (value) => {
    result = value
    hasResult = true
  }, reject)
  transaction.oncomplete = () => {
    if (!hasResult) {
      reject(new Error("Correction draft transaction completed without a result"))
      return
    }
    resolve(result as A)
  }
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Correction draft transaction aborted"))
})

const findLatest = (database: IDBDatabase): Promise<CorrectionDraftRecord | undefined> =>
  transactionPromise(database, "readonly", (store, resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      try {
        const drafts = request.result
          .map(decodeStoredCorrectionDraft)
          .sort((left, right) => right.updatedAt - left.updatedAt || left.id.localeCompare(right.id))
        resolve(drafts[0])
      } catch (cause) {
        reject(cause)
      }
    }
  })

const save = (
  database: IDBDatabase,
  draft: CorrectionDraftRecord,
  updatedAt: number
): Promise<CorrectionDraftRecord> => transactionPromise(
  database,
  "readwrite",
  (store, resolve, reject) => {
    const record = decodeStoredCorrectionDraft(new CorrectionDraftRecord({ ...draft, updatedAt }))
    const request = store.put(record)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(record)
  }
)

const remove = (database: IDBDatabase, id: string): Promise<void> =>
  transactionPromise(database, "readwrite", (store, resolve, reject) => {
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })

export const correctionDraftPersistenceLive = Layer.effect(
  CorrectionDraftPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(Effect.mapError(databaseError))
    return CorrectionDraftPersistence.of({
      findLatest: () => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => findLatest(database),
          catch: (cause) => persistenceError("find-latest", cause)
        }))
      ),
      save: (draft) => Effect.gen(function*() {
        const database = yield* connection
        const updatedAt = yield* Clock.currentTimeMillis
        return yield* Effect.tryPromise({
          try: () => save(database, draft, updatedAt),
          catch: (cause) => persistenceError("save", cause)
        })
      }),
      remove: (id) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => remove(database, id),
          catch: (cause) => persistenceError("remove", cause)
        }))
      )
    })
  })
)

import { Clock, Context, Effect, Layer, Schema } from "effect"
import {
  AppDatabase,
  appDatabaseStores,
  legacyAppDatabaseNames,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import { DurableTimestamp } from "../durable-values.ts"

export class ReviewAcknowledgementRecord extends Schema.Class<ReviewAcknowledgementRecord>(
  "@nycustodian/site/review/ReviewAcknowledgementRecord"
)({
  id: Schema.NonEmptyString,
  itemId: Schema.NonEmptyString,
  attemptId: Schema.NonEmptyString,
  reasonIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  acknowledgedAt: DurableTimestamp
}) {}

export class ReviewPersistenceError extends Schema.TaggedError<ReviewPersistenceError>()(
  "ReviewPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export interface AcknowledgeReviewInput {
  readonly itemId: string
  readonly attemptId: string
  readonly reasonIds: ReadonlyArray<string>
}

export class ReviewPersistence extends Context.Service<
  ReviewPersistence,
  {
    readonly acknowledge: (
      input: AcknowledgeReviewInput
    ) => Effect.Effect<ReviewAcknowledgementRecord, ReviewPersistenceError>
    readonly listAcknowledgements: () => Effect.Effect<
      ReadonlyArray<ReviewAcknowledgementRecord>,
      ReviewPersistenceError
    >
  }
>()("@nycustodian/site/review/ReviewPersistence") {}

const acknowledgementStore = appDatabaseStores.reviewAcknowledgements

const persistenceError = (operation: string, cause: unknown): ReviewPersistenceError =>
  new ReviewPersistenceError({
    operation,
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "IndexedDB review operation failed",
    cause
  })

const databasePersistenceError = (cause: AppDatabaseError): ReviewPersistenceError =>
  new ReviewPersistenceError({
    operation: cause.operation,
    detail: cause.detail,
    cause
  })

const normalizeReasonIds = (
  reasonIds: ReadonlyArray<string>
): readonly [string, ...Array<string>] => {
  if (
    reasonIds.length === 0 ||
    reasonIds.some((reasonId) => reasonId.length === 0) ||
    new Set(reasonIds).size !== reasonIds.length
  ) {
    throw new Error("A review acknowledgement requires unique non-empty reasons")
  }
  const sorted = [...reasonIds].sort()
  const first = sorted[0]
  if (first === undefined) throw new Error("A review acknowledgement requires a reason")
  return [first, ...sorted.slice(1)]
}

const lengthPrefixed = (value: string): string => `${value.length}:${value}`

export const reviewAcknowledgementId = (input: AcknowledgeReviewInput): string => {
  const reasons = normalizeReasonIds(input.reasonIds)
  return `review:${lengthPrefixed(input.itemId)}:${lengthPrefixed(input.attemptId)}:${reasons.map(lengthPrefixed).join("")}`
}

const sameStrings = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const decodeStoredReviewAcknowledgement = (
  record: unknown
): ReviewAcknowledgementRecord => {
  const decoded = Schema.decodeUnknownSync(
    ReviewAcknowledgementRecord,
    { onExcessProperty: "error" }
  )(record)
  if (!Number.isFinite(decoded.acknowledgedAt) || decoded.acknowledgedAt < 0) {
    throw new Error("A saved review acknowledgement has an invalid acknowledgement time")
  }
  const reasonIds = normalizeReasonIds(decoded.reasonIds)
  const expectedId = reviewAcknowledgementId({
    itemId: decoded.itemId,
    attemptId: decoded.attemptId,
    reasonIds
  })
  if (decoded.id !== expectedId || !sameStrings(decoded.reasonIds, reasonIds)) {
    throw new Error("A saved review acknowledgement has invalid event closure")
  }
  return decoded
}

const acknowledge = Effect.fn("ReviewPersistence.acknowledge")(function*(
  database: IDBDatabase,
  input: AcknowledgeReviewInput,
  acknowledgedAt: number
) {
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<ReviewAcknowledgementRecord>((resolve, reject) => {
        const reasonIds = normalizeReasonIds(input.reasonIds)
        const id = reviewAcknowledgementId({ ...input, reasonIds })
        const transaction = database.transaction(acknowledgementStore, "readwrite")
        const store = transaction.objectStore(acknowledgementStore)
        const request = store.get(id)
        let committed: ReviewAcknowledgementRecord | undefined

        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              committed = new ReviewAcknowledgementRecord({
                id,
                itemId: input.itemId,
                attemptId: input.attemptId,
                reasonIds,
                acknowledgedAt
              })
              store.put(committed)
              return
            }

            const existing = decodeStoredReviewAcknowledgement(request.result)
            if (
              existing.itemId !== input.itemId ||
              existing.attemptId !== input.attemptId ||
              !sameStrings(existing.reasonIds, reasonIds)
            ) {
              transaction.abort()
              reject(new Error("A review event ID already belongs to different acknowledgement data"))
              return
            }
            committed = existing
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (committed === undefined) {
            reject(new Error("Review acknowledgement completed without a record"))
            return
          }
          resolve(committed)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Review acknowledgement transaction aborted"))
      }),
    catch: (cause) => persistenceError("acknowledge", cause)
  })
})

const listAcknowledgements = Effect.fn("ReviewPersistence.listAcknowledgements")(function*(
  database: IDBDatabase
) {
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<ReadonlyArray<ReviewAcknowledgementRecord>>((resolve, reject) => {
        const transaction = database.transaction(acknowledgementStore, "readonly")
        const request = transaction.objectStore(acknowledgementStore).getAll()
        let decoded: ReadonlyArray<ReviewAcknowledgementRecord> | undefined

        request.onsuccess = () => {
          try {
            decoded = request.result
              .map(decodeStoredReviewAcknowledgement)
              .sort((left, right) =>
                left.acknowledgedAt - right.acknowledgedAt || left.id.localeCompare(right.id)
              )
          } catch (cause) {
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (decoded === undefined) {
            reject(new Error("Review event list completed without validated records"))
            return
          }
          resolve(decoded)
        }
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Review event list transaction aborted"))
      }),
    catch: (cause) => persistenceError("list-acknowledgements", cause)
  })
})

export const reviewPersistenceLive = Layer.effect(
  ReviewPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    yield* appDatabase.importLegacyDatabase({
      databaseName: legacyAppDatabaseNames.review,
      stores: [{
        sourceStore: acknowledgementStore,
        targetStore: acknowledgementStore,
        decodeRecord: decodeStoredReviewAcknowledgement
      }]
    }).pipe(Effect.mapError(databasePersistenceError))
    const connection = appDatabase.connection.pipe(
      Effect.mapError(databasePersistenceError)
    )

    return ReviewPersistence.of({
      acknowledge: Effect.fn("ReviewPersistence.acknowledge.live")(function*(input) {
        const database = yield* connection
        const acknowledgedAt = yield* Clock.currentTimeMillis
        return yield* acknowledge(database, input, acknowledgedAt)
      }),
      listAcknowledgements: Effect.fn("ReviewPersistence.listAcknowledgements.live")(function*() {
        const database = yield* connection
        return yield* listAcknowledgements(database)
      })
    })
  })
)

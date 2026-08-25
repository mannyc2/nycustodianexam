import { Clock, Context, Effect, Layer, Schema } from "effect"
import {
  HazardAttemptReceipt,
  hazardAttemptId,
  sameHazardReceipt,
  type HazardAttemptReceipt as HazardAttemptReceiptValue
} from "../attempt-receipt.ts"
import {
  AppDatabase,
  StudySessionRecord,
  appDatabaseStores,
  legacyAppDatabaseNames,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import type { HazardInputMode, HazardMarker } from "./attempt.ts"

const NormalizedCoordinate = Schema.Number.check(
  Schema.isBetween({ minimum: 0, maximum: 1 })
)

const ZoneOrders = Schema.Array(Schema.Natural).check(
  Schema.makeFilter((orders) =>
    new Set(orders).size === orders.length ? undefined : "a unique list of zone orders"
  )
)

export const PersistedHazardMarker = Schema.Struct({
  id: Schema.NonEmptyString,
  x: NormalizedCoordinate,
  y: NormalizedCoordinate
})

export class HazardAttemptRecord extends Schema.Class<HazardAttemptRecord>(
  "@nycustodian/site/hazard-player/HazardAttemptRecord"
)({
  id: Schema.NonEmptyString,
  sceneId: Schema.NonEmptyString,
  mode: Schema.Literals(["visual", "nonvisual"]),
  markers: Schema.Array(PersistedHazardMarker),
  selectedZoneOrders: Schema.Array(Schema.Natural),
  zeroHazardsConfirmed: Schema.Boolean,
  committedAt: Schema.Number,
  receipt: Schema.optionalKey(HazardAttemptReceipt),
  allowedZoneOrders: Schema.optionalKey(ZoneOrders)
}) {}

export class HazardPersistenceError extends Schema.TaggedError<HazardPersistenceError>()(
  "HazardPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export interface CommitHazardAttemptInput {
  readonly receipt: HazardAttemptReceiptValue
  readonly allowedZoneOrders: ReadonlyArray<number>
  readonly markers: ReadonlyArray<HazardMarker>
  readonly selectedZoneOrders: ReadonlyArray<number>
  readonly zeroHazardsConfirmed: boolean
}

export interface FindHazardAttemptInput {
  readonly receipt: HazardAttemptReceiptValue
  readonly allowedZoneOrders: ReadonlyArray<number>
}

export class HazardPersistence extends Context.Service<
  HazardPersistence,
  {
    readonly commitAttempt: (
      input: CommitHazardAttemptInput
    ) => Effect.Effect<HazardAttemptRecord, HazardPersistenceError>
    readonly findAttempt: (
      input: FindHazardAttemptInput
    ) => Effect.Effect<HazardAttemptRecord | undefined, HazardPersistenceError>
    readonly listAttempts: () => Effect.Effect<
      ReadonlyArray<HazardAttemptRecord>,
      HazardPersistenceError
    >
  }
>()("@nycustodian/site/hazard-player/HazardPersistence") {}

const attemptsStore = appDatabaseStores.hazardAttempts
const sessionsStore = appDatabaseStores.hazardSessions

const persistenceError = (operation: string, cause: unknown): HazardPersistenceError =>
  new HazardPersistenceError({
    operation,
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "IndexedDB operation failed",
    cause
  })

const databasePersistenceError = (cause: AppDatabaseError): HazardPersistenceError =>
  new HazardPersistenceError({
    operation: cause.operation,
    detail: cause.detail,
    cause
  })

const sameMarkers = (
  left: ReadonlyArray<HazardMarker>,
  right: ReadonlyArray<HazardMarker>
): boolean =>
  left.length === right.length &&
  left.every((marker, index) => {
    const other = right[index]
    return other !== undefined &&
      marker.id === other.id &&
      marker.x === other.x &&
      marker.y === other.y
  })

const sameNumbers = (left: ReadonlyArray<number>, right: ReadonlyArray<number>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const hasBoundHazardReceipt = (
  attempt: HazardAttemptRecord
): attempt is HazardAttemptRecord & {
  readonly receipt: HazardAttemptReceiptValue
  readonly allowedZoneOrders: ReadonlyArray<number>
} => attempt.receipt !== undefined && attempt.allowedZoneOrders !== undefined

const matchesExpectation = (
  existing: HazardAttemptRecord,
  input: FindHazardAttemptInput
): boolean =>
  hasBoundHazardReceipt(existing) &&
  sameHazardReceipt(existing.receipt, input.receipt) &&
  sameNumbers(existing.allowedZoneOrders, input.allowedZoneOrders)

const sameCommittedInput = (
  existing: HazardAttemptRecord,
  input: CommitHazardAttemptInput
): boolean =>
  matchesExpectation(existing, input) &&
  existing.zeroHazardsConfirmed === input.zeroHazardsConfirmed &&
  sameMarkers(existing.markers, input.markers) &&
  sameNumbers(existing.selectedZoneOrders, input.selectedZoneOrders)

const validateCommitInput = (
  input: CommitHazardAttemptInput
): HazardPersistenceError | undefined => {
  try {
    Schema.decodeUnknownSync(HazardAttemptReceipt)(input.receipt)
    Schema.decodeUnknownSync(ZoneOrders)(input.allowedZoneOrders)
  } catch (cause) {
    return persistenceError("validate-commit", cause)
  }
  const markersAreNormalized = input.markers.every(
    (marker) =>
      marker.id.length > 0 &&
      Number.isFinite(marker.x) &&
      marker.x >= 0 &&
      marker.x <= 1 &&
      Number.isFinite(marker.y) &&
      marker.y >= 0 &&
      marker.y <= 1
  )
  const zonesAreValid = input.selectedZoneOrders.every(
    (order) =>
      Number.isInteger(order) &&
      order >= 0 &&
      input.allowedZoneOrders.includes(order)
  )
  const markerIds = input.markers.map((marker) => marker.id)
  const selectedCount = input.receipt.mode === "visual"
    ? input.markers.length
    : input.selectedZoneOrders.length
  const modesDoNotMix = input.receipt.mode === "visual"
    ? input.selectedZoneOrders.length === 0
    : input.markers.length === 0

  if (
    !markersAreNormalized ||
    !zonesAreValid ||
    new Set(markerIds).size !== markerIds.length ||
    new Set(input.selectedZoneOrders).size !== input.selectedZoneOrders.length ||
    !modesDoNotMix ||
    input.zeroHazardsConfirmed !== (selectedCount === 0)
  ) {
    return persistenceError(
      "validate-commit",
      new Error("The hazard attempt was not valid for durable storage")
    )
  }
  return undefined
}

const commitAttempt = Effect.fn("HazardPersistence.commitAttempt")(function*(
  database: IDBDatabase,
  input: CommitHazardAttemptInput,
  committedAt: number
) {
  const invalid = validateCommitInput(input)
  if (invalid !== undefined) return yield* invalid

  return yield* Effect.tryPromise({
    try: () =>
      new Promise<HazardAttemptRecord>((resolve, reject) => {
        const transaction = database.transaction([attemptsStore, sessionsStore], "readwrite")
        const attempts = transaction.objectStore(attemptsStore)
        const sessions = transaction.objectStore(sessionsStore)
        const id = hazardAttemptId(input.receipt)
        const getRequest = attempts.get(id)
        let committed: HazardAttemptRecord | undefined

        getRequest.onsuccess = () => {
          try {
            if (getRequest.result === undefined) {
              committed = new HazardAttemptRecord({
                id,
                sceneId: input.receipt.sceneId,
                mode: input.receipt.mode,
                markers: [...input.markers],
                selectedZoneOrders: [...input.selectedZoneOrders],
                zeroHazardsConfirmed: input.zeroHazardsConfirmed,
                committedAt,
                receipt: input.receipt,
                allowedZoneOrders: [...input.allowedZoneOrders]
              })
              attempts.put(committed)
            } else {
              const existing = decodeStoredHazardAttempt(getRequest.result)
              if (!sameCommittedInput(existing, input)) {
                transaction.abort()
                reject(new Error("This hazard attempt already has a different committed response"))
                return
              }
              committed = existing
            }

            sessions.put({
              id: "active",
              latestAttemptId: id,
              updatedAt: committed.committedAt
            })
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        getRequest.onerror = () => reject(getRequest.error)
        transaction.oncomplete = () => {
          if (committed === undefined) {
            reject(new Error("Hazard attempt transaction completed without a record"))
            return
          }
          resolve(committed)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Hazard attempt transaction aborted"))
      }),
    catch: (cause) => persistenceError("commit-attempt", cause)
  })
})

const findAttempt = Effect.fn("HazardPersistence.findAttempt")(function*(
  database: IDBDatabase,
  input: FindHazardAttemptInput
) {
  try {
    Schema.decodeUnknownSync(HazardAttemptReceipt)(input.receipt)
    Schema.decodeUnknownSync(ZoneOrders)(input.allowedZoneOrders)
  } catch (cause) {
    return yield* persistenceError("validate-attempt-coordinate", cause)
  }
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<HazardAttemptRecord | undefined>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).get(hazardAttemptId(input.receipt))
        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              resolve(undefined)
              return
            }
            const attempt = decodeStoredHazardAttempt(request.result)
            if (!matchesExpectation(attempt, input)) {
              reject(new Error("The saved hazard attempt does not match this release receipt"))
              return
            }
            resolve(attempt)
          } catch (cause) {
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Hazard attempt read transaction aborted"))
      }),
    catch: (cause) => persistenceError("find-attempt", cause)
  })
})

export const decodeStoredHazardAttempt = (record: unknown): HazardAttemptRecord => {
  const attempt = Schema.decodeUnknownSync(
    HazardAttemptRecord,
    { onExcessProperty: "error" }
  )(record)
  if (!Number.isFinite(attempt.committedAt) || attempt.committedAt < 0) {
    throw new Error("A saved hazard attempt has an invalid commit time")
  }
  if ((attempt.receipt === undefined) !== (attempt.allowedZoneOrders === undefined)) {
    throw new Error("A saved hazard attempt has a partial release receipt closure")
  }
  const selectedCount = attempt.mode === "visual"
    ? attempt.markers.length
    : attempt.selectedZoneOrders.length
  const markerIds = attempt.markers.map((marker) => marker.id)
  const modesDoNotMix = attempt.mode === "visual"
    ? attempt.selectedZoneOrders.length === 0
    : attempt.markers.length === 0

  if (
    !modesDoNotMix ||
    attempt.zeroHazardsConfirmed !== (selectedCount === 0) ||
    new Set(markerIds).size !== markerIds.length ||
    new Set(attempt.selectedZoneOrders).size !== attempt.selectedZoneOrders.length
  ) {
    throw new Error("A saved hazard attempt has invalid response closure")
  }
  if (attempt.allowedZoneOrders !== undefined) {
    Schema.decodeUnknownSync(ZoneOrders)(attempt.allowedZoneOrders)
    if (
      attempt.mode === "nonvisual" &&
      !attempt.selectedZoneOrders.every((order) => attempt.allowedZoneOrders?.includes(order))
    ) {
      throw new Error("A saved hazard attempt is outside its released zone closure")
    }
  }
  if (attempt.receipt !== undefined) {
    if (
      attempt.sceneId !== attempt.receipt.sceneId ||
      attempt.mode !== attempt.receipt.mode ||
      attempt.id !== hazardAttemptId(attempt.receipt)
    ) {
      throw new Error("A saved hazard attempt has an invalid receipt identity")
    }
  } else if (!/^[a-zA-Z0-9._:-]{1,256}$/.test(attempt.id)) {
    throw new Error("A legacy hazard attempt has an invalid durable identity")
  }
  return attempt
}

const listAttempts = Effect.fn("HazardPersistence.listAttempts")(function*(
  database: IDBDatabase
) {
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<ReadonlyArray<HazardAttemptRecord>>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).getAll()
        let decoded: ReadonlyArray<HazardAttemptRecord> | undefined

        request.onsuccess = () => {
          try {
            decoded = request.result
              .map((record) =>
                decodeStoredHazardAttempt(record)
              )
              .sort((left, right) =>
                left.committedAt - right.committedAt || left.id.localeCompare(right.id)
              )
          } catch (cause) {
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (decoded === undefined) {
            reject(new Error("Hazard attempt list completed without validated records"))
            return
          }
          resolve(decoded)
        }
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Hazard attempt list transaction aborted"))
      }),
    catch: (cause) => persistenceError("list-attempts", cause)
  })
})

export const hazardPersistenceLive = Layer.effect(
  HazardPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    yield* appDatabase.importLegacyDatabase({
      databaseName: legacyAppDatabaseNames.hazard,
      stores: [
        {
          sourceStore: attemptsStore,
          targetStore: attemptsStore,
          decodeRecord: decodeStoredHazardAttempt
        },
        {
          sourceStore: sessionsStore,
          targetStore: sessionsStore,
          decodeRecord: Schema.decodeUnknownSync(StudySessionRecord)
        }
      ]
    }).pipe(Effect.mapError(databasePersistenceError))
    const connection = appDatabase.connection.pipe(
      Effect.mapError(databasePersistenceError)
    )

    return HazardPersistence.of({
      commitAttempt: Effect.fn("HazardPersistence.commitAttempt.live")(function*(input) {
        const database = yield* connection
        const committedAt = yield* Clock.currentTimeMillis
        return yield* commitAttempt(database, input, committedAt)
      }),
      findAttempt: Effect.fn("HazardPersistence.findAttempt.live")(function*(input) {
        const database = yield* connection
        return yield* findAttempt(database, input)
      }),
      listAttempts: Effect.fn("HazardPersistence.listAttempts.live")(function*() {
        const database = yield* connection
        return yield* listAttempts(database)
      })
    })
  })
)

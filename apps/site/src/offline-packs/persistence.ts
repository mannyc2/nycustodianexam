import { Context, Effect, Layer, Schema } from "effect"
import { localFailureDetail } from "../local-failure-detail.ts"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import {
  OfflinePackOperationRecord,
  OfflinePackRecord,
  decodeOfflinePackOperationRecord,
  decodeOfflinePackRecord,
  type OfflinePackRemovalImpact
} from "./model.ts"

export class OfflinePackPersistenceError extends Schema.TaggedError<OfflinePackPersistenceError>()(
  "OfflinePackPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class OfflinePackRemovalClaimBlocked extends Error {
  override readonly name = "OfflinePackRemovalClaimBlocked"

  constructor(
    readonly reason: "active-session-pin" | "confirmation-required",
    readonly impact: OfflinePackRemovalImpact
  ) {
    super(reason === "active-session-pin"
      ? `${impact.activeSessionPins} active session pin(s) require this exact pack.`
      : `${impact.historicalAttempts} historical attempt(s) require explicit removal confirmation.`)
  }
}

export class OfflinePackPersistence extends Context.Service<
  OfflinePackPersistence,
  {
    readonly beginActivation: (
      packId: string,
      generation: string,
      immutableFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<OfflinePackRecord, OfflinePackPersistenceError>
    readonly beginRemoval: (
      packId: string,
      generation: string,
      immutableFingerprint: string,
      confirmedHistoricalImpact: boolean,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<OfflinePackRecord, OfflinePackPersistenceError>
    readonly beginStage: (
      pack: OfflinePackRecord,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly completeStage: (
      pack: OfflinePackRecord,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<OfflinePackRecord, OfflinePackPersistenceError>
    readonly activate: (
      packId: string,
      generation: string,
      immutableFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly failActivation: (
      packId: string,
      generation: string,
      immutableFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly find: (
      packId: string
    ) => Effect.Effect<OfflinePackRecord | undefined, OfflinePackPersistenceError>
    readonly list: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly previewRemoval: (
      packId: string
    ) => Effect.Effect<OfflinePackRemovalImpact, OfflinePackPersistenceError>
    readonly putOperation: (
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly putPack: (
      pack: OfflinePackRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly reconcile: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly removePack: (
      packId: string,
      generation: string,
      immutableFingerprint: string
    ) => Effect.Effect<void, OfflinePackPersistenceError>
  }
>()("@nycustodian/site/OfflinePackPersistence") {}

const packStore = appDatabaseStores.offlinePacks
const operationStore = appDatabaseStores.offlinePackOperations

const persistenceError = (operation: string, cause: unknown): OfflinePackPersistenceError =>
  new OfflinePackPersistenceError({
    operation,
    detail: localFailureDetail(cause, "Offline-pack storage failed"),
    cause
  })

const databaseError = (cause: AppDatabaseError): OfflinePackPersistenceError =>
  persistenceError(cause.operation, cause)

const listPacks = (database: IDBDatabase): Promise<ReadonlyArray<OfflinePackRecord>> =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction(packStore, "readonly")
    const request = transaction.objectStore(packStore).getAll()
    let result: ReadonlyArray<OfflinePackRecord> | undefined
    request.onsuccess = () => {
      try {
        result = request.result
          .map(decodeOfflinePackRecord)
          .sort((left, right) =>
            right.descriptor.packVersion - left.descriptor.packVersion || left.id.localeCompare(right.id)
          )
      } catch (cause) {
        transaction.abort()
        reject(cause)
      }
    }
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => resolve(result ?? [])
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack list aborted"))
  })

const findPack = (
  database: IDBDatabase,
  packId: string
): Promise<OfflinePackRecord | undefined> => new Promise((resolve, reject) => {
  const transaction = database.transaction(packStore, "readonly")
  const request = transaction.objectStore(packStore).get(packId)
  let result: OfflinePackRecord | undefined
  request.onsuccess = () => {
    try {
      result = request.result === undefined
        ? undefined
        : decodeOfflinePackRecord(request.result)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve(result)
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack read aborted"))
})

const putOperationRecord = (
  database: IDBDatabase,
  operation: OfflinePackOperationRecord
): Promise<void> => new Promise((resolve, reject) => {
  const validated = decodeOfflinePackOperationRecord(operation)
  const transaction = database.transaction(operationStore, "readwrite")
  transaction.objectStore(operationStore).put(validated)
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack write aborted"))
})

const legalPackTransition = (
  previous: OfflinePackRecord["status"],
  next: OfflinePackRecord["status"]
): boolean =>
  (previous === "staging" && ["staging", "verifying", "quarantined"].includes(next)) ||
  (previous === "verifying" && ["staged", "quarantined"].includes(next))

const putPackRecord = (
  database: IDBDatabase,
  input: OfflinePackRecord
): Promise<void> => new Promise((resolve, reject) => {
  const record = decodeOfflinePackRecord(input)
  const transaction = database.transaction(packStore, "readwrite")
  const store = transaction.objectStore(packStore)
  const request = store.get(record.id)
  request.onsuccess = () => {
    try {
      if (request.result === undefined) {
        throw new Error("An offline-pack generation must be claimed before it is updated")
      }
      const current = decodeOfflinePackRecord(request.result)
      if (
        current.generation !== record.generation ||
        current.immutableFingerprint !== record.immutableFingerprint ||
        !legalPackTransition(current.status, record.status)
      ) {
        throw new Error("The offline-pack generation changed before its update committed")
      }
      store.put(record)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack update aborted"))
})

const beginStage = (
  database: IDBDatabase,
  input: OfflinePackRecord,
  inputOperation: OfflinePackOperationRecord
): Promise<void> => new Promise((resolve, reject) => {
  const record = decodeOfflinePackRecord(input)
  const operation = decodeOfflinePackOperationRecord(inputOperation)
  if (
    record.status !== "staging" ||
    operation.kind !== "stage" ||
    operation.phase !== "running" ||
    operation.packId !== record.id ||
    operation.generation !== record.generation ||
    operation.immutableFingerprint !== record.immutableFingerprint
  ) {
    reject(new Error("An offline-pack stage claim is not internally consistent"))
    return
  }
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packs = transaction.objectStore(packStore)
  const request = packs.get(record.id)
  request.onsuccess = () => {
    try {
      if (request.result !== undefined) {
        const current = decodeOfflinePackRecord(request.result)
        if (current.status !== "quarantined") {
          throw new Error("Another durable offline-pack generation already owns this pack ID")
        }
      }
      packs.put(record)
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack stage claim aborted"))
})

const completeStage = (
  database: IDBDatabase,
  input: OfflinePackRecord,
  inputOperation: OfflinePackOperationRecord
): Promise<OfflinePackRecord> => new Promise((resolve, reject) => {
  const record = decodeOfflinePackRecord(input)
  const operation = decodeOfflinePackOperationRecord(inputOperation)
  if (
    record.status !== "staged" ||
    operation.kind !== "stage" ||
    operation.phase !== "complete" ||
    operation.packId !== record.id ||
    operation.generation !== record.generation ||
    operation.immutableFingerprint !== record.immutableFingerprint
  ) {
    reject(new Error("An offline-pack stage completion is not internally consistent"))
    return
  }
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packs = transaction.objectStore(packStore)
  const request = packs.get(record.id)
  request.onsuccess = () => {
    try {
      if (request.result === undefined) throw new Error("The verifying pack no longer exists")
      const current = decodeOfflinePackRecord(request.result)
      if (
        current.status !== "verifying" ||
        current.generation !== record.generation ||
        current.immutableFingerprint !== record.immutableFingerprint
      ) {
        throw new Error("The offline-pack generation changed before staging completed")
      }
      packs.put(record)
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve(record)
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack stage completion aborted"))
})

const beginPackTransition = (
  database: IDBDatabase,
  input: {
    readonly packId: string
    readonly generation: string
    readonly immutableFingerprint: string
    readonly operation: OfflinePackOperationRecord
    readonly allowedStatuses: ReadonlyArray<OfflinePackRecord["status"]>
    readonly nextStatus: "activating" | "removing"
  }
): Promise<OfflinePackRecord> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(input.operation)
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packs = transaction.objectStore(packStore)
  const request = packs.get(input.packId)
  let claimed: OfflinePackRecord | undefined
  request.onsuccess = () => {
    try {
      if (request.result === undefined) throw new Error("The offline pack no longer exists")
      const current = decodeOfflinePackRecord(request.result)
      if (
        current.generation !== input.generation ||
        current.immutableFingerprint !== input.immutableFingerprint ||
        !input.allowedStatuses.includes(current.status) ||
        operation.packId !== current.id ||
        operation.generation !== current.generation ||
        operation.immutableFingerprint !== current.immutableFingerprint ||
        operation.phase !== "running" ||
        (input.nextStatus === "activating" ? operation.kind !== "activate" : operation.kind !== "remove")
      ) {
        throw new Error("The offline pack changed before its lifecycle transition was claimed")
      }
      claimed = decodeOfflinePackRecord(new OfflinePackRecord({
        ...current,
        status: input.nextStatus,
        detail: null
      }))
      packs.put(claimed)
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => {
    if (claimed === undefined) {
      reject(new Error("Offline-pack transition completed without a claimed record"))
      return
    }
    resolve(claimed)
  }
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack transition aborted"))
})

const beginRemovalTransition = (
  database: IDBDatabase,
  input: {
    readonly packId: string
    readonly generation: string
    readonly immutableFingerprint: string
    readonly confirmedHistoricalImpact: boolean
    readonly operation: OfflinePackOperationRecord
  }
): Promise<OfflinePackRecord> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(input.operation)
  const stores = [
    packStore,
    operationStore,
    appDatabaseStores.questionAttempts,
    appDatabaseStores.hazardAttempts
    // M4 integration must add the simulation-session store here. Session pin
    // creation and this removal claim must share the pack/session stores so
    // IndexedDB serializes the two possible winners.
  ]
  const transaction = database.transaction(stores, "readwrite")
  const packs = transaction.objectStore(packStore)
  const packRequest = packs.get(input.packId)
  const questionRequest = transaction.objectStore(appDatabaseStores.questionAttempts).getAll()
  const hazardRequest = transaction.objectStore(appDatabaseStores.hazardAttempts).getAll()
  let claimed: OfflinePackRecord | undefined

  const prepare = () => {
    if (
      packRequest.readyState !== "done" ||
      questionRequest.readyState !== "done" ||
      hazardRequest.readyState !== "done"
    ) return
    try {
      if (packRequest.result === undefined) throw new Error("The offline pack no longer exists")
      const current = decodeOfflinePackRecord(packRequest.result)
      if (
        current.generation !== input.generation ||
        current.immutableFingerprint !== input.immutableFingerprint ||
        !["staged", "retained", "quarantined"].includes(current.status) ||
        operation.packId !== current.id ||
        operation.generation !== current.generation ||
        operation.immutableFingerprint !== current.immutableFingerprint ||
        operation.kind !== "remove" ||
        operation.phase !== "running"
      ) {
        throw new Error("The offline pack changed before its removal was claimed")
      }
      const attempts = [
        ...questionRequest.result,
        ...hazardRequest.result
      ] as ReadonlyArray<AttemptCoordinate>
      const historicalAttempts = attempts.filter((attempt) =>
        attempt.receipt?.releaseId === current.descriptor.releaseId &&
        attempt.receipt.packVersion === current.descriptor.packVersion
      ).length
      const impact: OfflinePackRemovalImpact = {
        activeSessionPins: 0,
        historicalAttempts
      }
      if (!input.confirmedHistoricalImpact && historicalAttempts > 0) {
        throw new OfflinePackRemovalClaimBlocked("confirmation-required", impact)
      }
      claimed = decodeOfflinePackRecord(new OfflinePackRecord({
        ...current,
        status: "removing",
        detail: null
      }))
      packs.put(claimed)
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  packRequest.onsuccess = prepare
  questionRequest.onsuccess = prepare
  hazardRequest.onsuccess = prepare
  packRequest.onerror = () => reject(packRequest.error)
  questionRequest.onerror = () => reject(questionRequest.error)
  hazardRequest.onerror = () => reject(hazardRequest.error)
  transaction.oncomplete = () => {
    if (claimed === undefined) {
      reject(new Error("Offline-pack removal completed without a claimed record"))
      return
    }
    resolve(claimed)
  }
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack removal claim aborted"))
})

const activatePack = (
  database: IDBDatabase,
  packId: string,
  generation: string,
  immutableFingerprint: string,
  inputOperation: OfflinePackOperationRecord
): Promise<ReadonlyArray<OfflinePackRecord>> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(inputOperation)
  const transaction = database.transaction(
    [packStore, appDatabaseStores.meta, operationStore],
    "readwrite"
  )
  const packs = transaction.objectStore(packStore)
  const request = packs.getAll()
  let result: ReadonlyArray<OfflinePackRecord> | undefined
  request.onsuccess = () => {
    try {
      const current = request.result.map(decodeOfflinePackRecord)
      const target = current.find((pack) => pack.id === packId)
      if (
        target === undefined ||
        target.status !== "activating" ||
        target.generation !== generation ||
        target.immutableFingerprint !== immutableFingerprint ||
        operation.packId !== target.id ||
        operation.generation !== target.generation ||
        operation.immutableFingerprint !== target.immutableFingerprint ||
        operation.kind !== "activate" ||
        operation.phase !== "complete"
      ) {
        throw new Error("Only the exact claimed offline-pack generation can be activated")
      }
      const activatedAt = operation.updatedAt
      result = current.map((pack) => {
        const next = pack.id === packId
          ? decodeOfflinePackRecord(new OfflinePackRecord({
              ...pack,
              status: "active",
              activatedAt,
              detail: null
            }))
          : pack.status === "active"
          ? decodeOfflinePackRecord(new OfflinePackRecord({ ...pack, status: "retained" }))
          : pack
        packs.put(next)
        return next
      })
      transaction.objectStore(appDatabaseStores.meta).put({
        id: "active-offline-pack",
        packId,
        releaseId: target.descriptor.releaseId,
        packVersion: target.descriptor.packVersion,
        activatedAt
      })
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve(result ?? [])
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack activation aborted"))
})

const failActivation = (
  database: IDBDatabase,
  packId: string,
  generation: string,
  immutableFingerprint: string,
  inputOperation: OfflinePackOperationRecord
): Promise<void> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(inputOperation)
  if (operation.kind !== "activate" || operation.phase !== "failed" || operation.detail === null) {
    reject(new Error("A failed activation requires an exact failed operation receipt"))
    return
  }
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packs = transaction.objectStore(packStore)
  const request = packs.get(packId)
  request.onsuccess = () => {
    try {
      if (request.result === undefined) throw new Error("The activating pack no longer exists")
      const current = decodeOfflinePackRecord(request.result)
      if (
        current.status !== "activating" ||
        current.generation !== generation ||
        current.immutableFingerprint !== immutableFingerprint ||
        operation.packId !== current.id ||
        operation.generation !== current.generation ||
        operation.immutableFingerprint !== current.immutableFingerprint
      ) {
        throw new Error("The activating pack generation changed before quarantine")
      }
      packs.put(decodeOfflinePackRecord(new OfflinePackRecord({
        ...current,
        status: "quarantined",
        detail: operation.detail
      })))
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack quarantine aborted"))
})

interface AttemptCoordinate {
  readonly id?: unknown
  readonly receipt?: {
    readonly releaseId?: unknown
    readonly packVersion?: unknown
  }
}

const removalImpact = (
  database: IDBDatabase,
  packId: string
): Promise<OfflinePackRemovalImpact> => new Promise((resolve, reject) => {
  const stores = [
    packStore,
    appDatabaseStores.questionAttempts,
    appDatabaseStores.hazardAttempts
    // Question/hazard `active` session rows are latest-attempt projections, not
    // proof of a live session, so their attempts remain historical-impact only.
    // M4 integration requirement: count only simulation records whose durable
    // state can still resume without evaluation (active or submitted pending
    // reconciliation) as active pins; completed results are historical impact.
  ]
  const transaction = database.transaction(stores, "readonly")
  const requests = Object.fromEntries(
    stores.map((store) => [store, transaction.objectStore(store).getAll()])
  ) as Readonly<Record<string, IDBRequest<unknown[]>>>
  transaction.oncomplete = () => {
    try {
      const pack = (requests[packStore]?.result ?? [])
        .map(decodeOfflinePackRecord)
        .find((candidate) => candidate.id === packId)
      if (pack === undefined) throw new Error("The offline pack no longer exists")
      const attempts = [
        ...(requests[appDatabaseStores.questionAttempts]?.result ?? []),
        ...(requests[appDatabaseStores.hazardAttempts]?.result ?? [])
      ] as ReadonlyArray<AttemptCoordinate>
      const matches = attempts.filter((attempt) =>
        attempt.receipt?.releaseId === pack.descriptor.releaseId &&
        attempt.receipt.packVersion === pack.descriptor.packVersion
      )
      resolve({
        activeSessionPins: 0,
        historicalAttempts: matches.length
      })
    } catch (cause) {
      reject(cause)
    }
  }
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack impact read aborted"))
})

const reconcileOperations = (
  database: IDBDatabase,
  now: number
): Promise<ReadonlyArray<OfflinePackRecord>> => new Promise((resolve, reject) => {
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packsRequest = transaction.objectStore(packStore).getAll()
  const operationsRequest = transaction.objectStore(operationStore).getAll()
  let result: ReadonlyArray<OfflinePackRecord> | undefined
  const prepare = () => {
    if (packsRequest.readyState !== "done" || operationsRequest.readyState !== "done") return
    try {
      const operations = operationsRequest.result.map(decodeOfflinePackOperationRecord)
      const interrupted = operations.filter((operation) => operation.phase === "running")
      for (const operation of operations) {
        if (operation.phase !== "running") continue
        transaction.objectStore(operationStore).put(decodeOfflinePackOperationRecord(
          new OfflinePackOperationRecord({
          ...operation,
          phase: "failed",
          updatedAt: now,
          detail: "The page closed before this operation completed; retry explicitly."
          })
        ))
      }
      result = packsRequest.result.map((value) => {
        const pack = decodeOfflinePackRecord(value)
        const operation = interrupted.find((candidate) =>
          candidate.packId === pack.id &&
          candidate.generation === pack.generation &&
          candidate.immutableFingerprint === pack.immutableFingerprint &&
          (
            candidate.kind === "stage" && (pack.status === "staging" || pack.status === "verifying") ||
            candidate.kind === "activate" && pack.status === "activating" ||
            candidate.kind === "remove" && pack.status === "removing"
          )
        )
        if (operation === undefined) return pack
        const reconciled = decodeOfflinePackRecord(new OfflinePackRecord({
          ...pack,
          status: "quarantined",
          detail: "An interrupted pack operation requires an explicit retry."
        }))
        transaction.objectStore(packStore).put(reconciled)
        return reconciled
      })
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  packsRequest.onsuccess = prepare
  operationsRequest.onsuccess = prepare
  transaction.oncomplete = () => resolve(result ?? [])
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack reconciliation aborted"))
})

const removePackRecord = (
  database: IDBDatabase,
  packId: string,
  generation: string,
  immutableFingerprint: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [packStore, appDatabaseStores.meta],
      "readwrite"
    )
    const packs = transaction.objectStore(packStore)
    const packRequest = packs.get(packId)
    packRequest.onsuccess = () => {
      try {
        if (packRequest.result === undefined) throw new Error("The removing pack no longer exists")
        const current = decodeOfflinePackRecord(packRequest.result)
        if (
          current.status !== "removing" ||
          current.generation !== generation ||
          current.immutableFingerprint !== immutableFingerprint
        ) {
          throw new Error("The offline-pack generation changed before removal committed")
        }
        packs.delete(packId)
      } catch (cause) {
        transaction.abort()
        reject(cause)
      }
    }
    packRequest.onerror = () => reject(packRequest.error)
    const meta = transaction.objectStore(appDatabaseStores.meta)
    const request = meta.get("active-offline-pack")
    request.onsuccess = () => {
      if ((request.result as { readonly packId?: unknown } | undefined)?.packId === packId) {
        meta.delete("active-offline-pack")
      }
    }
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack removal aborted"))
  })

const effectTry = <A>(operation: string, run: () => Promise<A>) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => persistenceError(operation, cause)
  })

export const offlinePackPersistenceLive = Layer.effect(
  OfflinePackPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(Effect.mapError(databaseError))
    return OfflinePackPersistence.of({
      beginActivation: (packId, generation, immutableFingerprint, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("begin-activation", () =>
          beginPackTransition(database, {
            packId,
            generation,
            immutableFingerprint,
            operation,
            allowedStatuses: ["staged", "retained"],
            nextStatus: "activating"
          })
        ))
      ),
      beginRemoval: (packId, generation, immutableFingerprint, confirmedHistoricalImpact, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("begin-removal", () =>
          beginRemovalTransition(database, {
            packId,
            generation,
            immutableFingerprint,
            confirmedHistoricalImpact,
            operation
          })
        ))
      ),
      beginStage: (pack, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("begin-stage", () =>
          beginStage(database, pack, operation)
        ))
      ),
      completeStage: (pack, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("complete-stage", () =>
          completeStage(database, pack, operation)
        ))
      ),
      activate: (packId, generation, immutableFingerprint, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("activate", () =>
          activatePack(database, packId, generation, immutableFingerprint, operation)
        ))
      ),
      failActivation: (packId, generation, immutableFingerprint, operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("fail-activation", () =>
          failActivation(database, packId, generation, immutableFingerprint, operation)
        ))
      ),
      find: (packId) => connection.pipe(
        Effect.flatMap((database) => effectTry("find", () => findPack(database, packId)))
      ),
      list: () => connection.pipe(
        Effect.flatMap((database) => effectTry("list", () => listPacks(database)))
      ),
      previewRemoval: (packId) => connection.pipe(
        Effect.flatMap((database) => effectTry("preview-removal", () => removalImpact(database, packId)))
      ),
      putOperation: (operation) => connection.pipe(
        Effect.flatMap((database) => effectTry("put-operation", () =>
          putOperationRecord(database, operation)
        ))
      ),
      putPack: (pack) => connection.pipe(
        Effect.flatMap((database) => effectTry("put-pack", () =>
          putPackRecord(database, pack)
        ))
      ),
      reconcile: () => connection.pipe(
        Effect.flatMap((database) => effectTry("reconcile", () =>
          reconcileOperations(database, Date.now())
        ))
      ),
      removePack: (packId, generation, immutableFingerprint) => connection.pipe(
        Effect.flatMap((database) => effectTry("remove", () =>
          removePackRecord(database, packId, generation, immutableFingerprint)
        ))
      )
    })
  })
)

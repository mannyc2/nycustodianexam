import { Context, Effect, Layer, Schema } from "effect"
import { localFailureDetail } from "../local-failure-detail.ts"
import {
  AppDatabase,
  appDatabaseName,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import { decodeSimulationSessionRecordShape } from "../simulation/model.ts"
import {
  OfflinePackDescriptor,
  OfflinePackOrphanCacheRecord,
  OfflinePackOperationRecord,
  OfflinePackRecord,
  OfflinePackRetirementRecord,
  decodeOfflinePackDescriptor,
  decodeOfflinePackOrphanCacheRecord,
  decodeOfflinePackOperationRecord,
  decodeOfflinePackRecord,
  decodeOfflinePackRetirementRecord,
  offlinePackRetirementId,
  offlinePackOrphanCacheId,
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

export class OfflinePackStageClaimConflict extends Error {
  override readonly name = "OfflinePackStageClaimConflict"
}

export class OfflinePackRetiredClaimConflict extends Error {
  override readonly name = "OfflinePackRetiredClaimConflict"
}

export class OfflinePackPersistence extends Context.Service<
  OfflinePackPersistence,
  {
    readonly beginActivation: (
      claimId: string,
      generation: string,
      contentFingerprint: string,
      shellBuildFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<OfflinePackRecord, OfflinePackPersistenceError>
    readonly beginRemoval: (
      claimId: string,
      generation: string,
      contentFingerprint: string,
      shellBuildFingerprint: string,
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
      claimId: string,
      generation: string,
      contentFingerprint: string,
      shellBuildFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly failActivation: (
      claimId: string,
      generation: string,
      contentFingerprint: string,
      shellBuildFingerprint: string,
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly find: (
      claimId: string
    ) => Effect.Effect<OfflinePackRecord | undefined, OfflinePackPersistenceError>
    readonly list: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly listOrphanCaches: () => Effect.Effect<ReadonlyArray<OfflinePackOrphanCacheRecord>, OfflinePackPersistenceError>
    readonly previewRemoval: (
      claimId: string
    ) => Effect.Effect<OfflinePackRemovalImpact, OfflinePackPersistenceError>
    readonly putOperation: (
      operation: OfflinePackOperationRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly putPack: (
      pack: OfflinePackRecord
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly reconcile: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly forgetOrphanCache: (
      cacheName: string
    ) => Effect.Effect<void, OfflinePackPersistenceError>
    readonly retire: (
      descriptor: OfflinePackDescriptor,
      observedAt: number
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackPersistenceError>
    readonly removePack: (
      claimId: string,
      generation: string,
      contentFingerprint: string,
      shellBuildFingerprint: string
    ) => Effect.Effect<void, OfflinePackPersistenceError>
  }
>()("@nycustodian/site/OfflinePackPersistence") {}

const packStore = appDatabaseStores.offlinePacks
const operationStore = appDatabaseStores.offlinePackOperations

const assertPackNotRetired = (value: unknown, packId: string): void => {
  if (value === undefined) return
  const retirement = decodeOfflinePackRetirementRecord(value)
  if (retirement.packId === packId) {
    throw new OfflinePackRetiredClaimConflict(
      "This release has a durable retirement marker and cannot be used for a new session"
    )
  }
}

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
          .flatMap((value) => {
            try {
              return [decodeOfflinePackRecord(value)]
            } catch {
              // The read-only list remains available for cleanup paths. The
              // normal manager refresh calls reconcile first, which moves the
              // malformed row into durable migration quarantine.
              return []
            }
          })
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

const listOrphanCaches = (
  database: IDBDatabase
): Promise<ReadonlyArray<OfflinePackOrphanCacheRecord>> => new Promise((resolve, reject) => {
  const transaction = database.transaction(appDatabaseStores.meta, "readonly")
  const request = transaction.objectStore(appDatabaseStores.meta).getAll()
  let result: ReadonlyArray<OfflinePackOrphanCacheRecord> | undefined
  request.onsuccess = () => {
    try {
      result = request.result.flatMap((value) => {
        if (
          typeof value !== "object" || value === null ||
          !("id" in value) || typeof value.id !== "string" ||
          !value.id.startsWith("offline-pack-orphan-cache:")
        ) return []
        return [decodeOfflinePackOrphanCacheRecord(value)]
      })
    } catch (cause) {
      reject(cause)
    }
  }
  request.onerror = () => reject(request.error)
  transaction.oncomplete = () => resolve(result ?? [])
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Orphan cache read aborted"))
})

const forgetOrphanCache = (
  database: IDBDatabase,
  cacheName: string
): Promise<void> => new Promise((resolve, reject) => {
  const transaction = database.transaction(appDatabaseStores.meta, "readwrite")
  transaction.objectStore(appDatabaseStores.meta).delete(offlinePackOrphanCacheId(cacheName))
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Orphan cache cleanup aborted"))
})

const findPack = (
  database: IDBDatabase,
  claimId: string
): Promise<OfflinePackRecord | undefined> => new Promise((resolve, reject) => {
  const transaction = database.transaction(packStore, "readonly")
  const request = transaction.objectStore(packStore).get(claimId)
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

interface PackClaimCoordinate {
  readonly claimId: string
  readonly generation: string
  readonly contentFingerprint: string
  readonly shellBuildFingerprint: string
}

const matchesPackClaim = (
  pack: OfflinePackRecord,
  claim: PackClaimCoordinate
): boolean =>
  pack.id === claim.claimId &&
  pack.generation === claim.generation &&
  pack.contentFingerprint === claim.contentFingerprint &&
  pack.shellBuildFingerprint === claim.shellBuildFingerprint

const operationClaimsPack = (
  operation: OfflinePackOperationRecord,
  pack: OfflinePackRecord
): boolean =>
  operation.claimId === pack.id &&
  operation.packId === pack.packId &&
  operation.generation === pack.generation &&
  operation.contentFingerprint === pack.contentFingerprint &&
  operation.shellBuildFingerprint === pack.shellBuildFingerprint

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
        !matchesPackClaim(current, {
          claimId: record.id,
          generation: record.generation,
          contentFingerprint: record.contentFingerprint,
          shellBuildFingerprint: record.shellBuildFingerprint
        }) ||
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
    !operationClaimsPack(operation, record)
  ) {
    reject(new Error("An offline-pack stage claim is not internally consistent"))
    return
  }
  const transaction = database.transaction(
    [packStore, appDatabaseStores.meta, operationStore],
    "readwrite"
  )
  const packs = transaction.objectStore(packStore)
  const request = packs.getAll()
  const retirementRequest = transaction.objectStore(appDatabaseStores.meta).get(
    offlinePackRetirementId(record.packId)
  )
  const orphanRequest = transaction.objectStore(appDatabaseStores.meta).get(
    offlinePackOrphanCacheId(record.cacheName)
  )
  const prepare = () => {
    if (
      request.readyState !== "done" ||
      retirementRequest.readyState !== "done" ||
      orphanRequest.readyState !== "done"
    ) return
    try {
      assertPackNotRetired(retirementRequest.result, record.packId)
      if (orphanRequest.result !== undefined) {
        decodeOfflinePackOrphanCacheRecord(orphanRequest.result)
        throw new OfflinePackStageClaimConflict(
          "A quarantined orphan cache with this exact namespace requires cleanup first"
        )
      }
      const current = request.result.map(decodeOfflinePackRecord)
      if (current.some((pack) => pack.id === record.id)) {
        throw new OfflinePackStageClaimConflict(
          "This device-local offline-pack generation is already claimed"
        )
      }
      const samePack = current.filter((pack) => pack.packId === record.packId)
      if (samePack.some((pack) => pack.contentFingerprint !== record.contentFingerprint)) {
        throw new OfflinePackStageClaimConflict(
          "This stable pack ID is already bound to different portable content"
        )
      }
      if (samePack.some((pack) =>
        pack.status !== "quarantined" &&
        pack.shellBuildFingerprint === record.shellBuildFingerprint
      )) {
        throw new OfflinePackStageClaimConflict(
          "This application-shell build already has a usable local generation"
        )
      }
      packs.put(record)
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  request.onsuccess = prepare
  retirementRequest.onsuccess = prepare
  orphanRequest.onsuccess = prepare
  request.onerror = () => reject(request.error)
  retirementRequest.onerror = () => reject(retirementRequest.error)
  orphanRequest.onerror = () => reject(orphanRequest.error)
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
    !operationClaimsPack(operation, record)
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
        !matchesPackClaim(current, {
          claimId: record.id,
          generation: record.generation,
          contentFingerprint: record.contentFingerprint,
          shellBuildFingerprint: record.shellBuildFingerprint
        })
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
    readonly claimId: string
    readonly generation: string
    readonly contentFingerprint: string
    readonly shellBuildFingerprint: string
    readonly operation: OfflinePackOperationRecord
    readonly allowedStatuses: ReadonlyArray<OfflinePackRecord["status"]>
    readonly nextStatus: "activating" | "removing"
  }
): Promise<OfflinePackRecord> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(input.operation)
  const transaction = database.transaction(
    [packStore, appDatabaseStores.meta, operationStore],
    "readwrite"
  )
  const packs = transaction.objectStore(packStore)
  const request = packs.get(input.claimId)
  const meta = transaction.objectStore(appDatabaseStores.meta)
  let claimed: OfflinePackRecord | undefined
  let retirementRequest: IDBRequest<unknown> | undefined
  const prepare = () => {
    if (request.readyState !== "done") return
    if (retirementRequest === undefined) {
      try {
        if (request.result === undefined) throw new Error("The offline pack no longer exists")
        const current = decodeOfflinePackRecord(request.result)
        retirementRequest = meta.get(offlinePackRetirementId(current.packId))
        retirementRequest.onsuccess = prepare
        retirementRequest.onerror = () => reject(retirementRequest?.error)
      } catch (cause) {
        transaction.abort()
        reject(cause)
      }
      return
    }
    if (retirementRequest.readyState !== "done") return
    try {
      if (request.result === undefined) throw new Error("The offline pack no longer exists")
      const current = decodeOfflinePackRecord(request.result)
      if (input.nextStatus === "activating") {
        assertPackNotRetired(retirementRequest.result, current.packId)
      }
      if (
        !matchesPackClaim(current, input) ||
        !input.allowedStatuses.includes(current.status) ||
        !operationClaimsPack(operation, current) ||
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
  request.onsuccess = prepare
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
    readonly claimId: string
    readonly generation: string
    readonly contentFingerprint: string
    readonly shellBuildFingerprint: string
    readonly confirmedHistoricalImpact: boolean
    readonly operation: OfflinePackOperationRecord
  }
): Promise<OfflinePackRecord> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(input.operation)
  const stores = [
    packStore,
    appDatabaseStores.meta,
    operationStore,
    appDatabaseStores.questionAttempts,
    appDatabaseStores.hazardAttempts,
    appDatabaseStores.simulationSessions
  ]
  const transaction = database.transaction(stores, "readwrite")
  const packs = transaction.objectStore(packStore)
  const packRequest = packs.get(input.claimId)
  const meta = transaction.objectStore(appDatabaseStores.meta)
  const activeMetaRequest = meta.get("active-offline-pack")
  const questionRequest = transaction.objectStore(appDatabaseStores.questionAttempts).getAll()
  const hazardRequest = transaction.objectStore(appDatabaseStores.hazardAttempts).getAll()
  const simulationRequest = transaction.objectStore(appDatabaseStores.simulationSessions).getAll()
  let claimed: OfflinePackRecord | undefined

  const prepare = () => {
    if (
      packRequest.readyState !== "done" ||
      activeMetaRequest.readyState !== "done" ||
      questionRequest.readyState !== "done" ||
      hazardRequest.readyState !== "done" ||
      simulationRequest.readyState !== "done"
    ) return
    try {
      if (packRequest.result === undefined) throw new Error("The offline pack no longer exists")
      const current = decodeOfflinePackRecord(packRequest.result)
      if (
        !matchesPackClaim(current, input) ||
        !["staged", "active", "retained", "quarantined"].includes(current.status) ||
        !operationClaimsPack(operation, current) ||
        operation.kind !== "remove" ||
        operation.phase !== "running"
      ) {
        throw new Error("The offline pack changed before its removal was claimed")
      }
      const activeMeta = activeMetaRequest.result as { readonly claimId?: unknown } | undefined
      if (current.status === "active" && activeMeta?.claimId !== current.id) {
        throw new Error("The active offline-pack record and durable pointer disagree")
      }
      const attempts = [
        ...questionRequest.result,
        ...hazardRequest.result
      ] as ReadonlyArray<AttemptCoordinate>
      const historicalAttempts = attempts.filter((attempt) =>
        attempt.receipt?.releaseId === current.descriptor.releaseId &&
        attempt.receipt.packVersion === current.descriptor.packVersion
      ).length + simulationRequest.result.filter((session) =>
        isHistoricalSimulationSession(session, current)
      ).length
      const impact: OfflinePackRemovalImpact = {
        activeSessionPins: simulationRequest.result.filter((session) =>
          isExactSimulationSessionPin(session, current)
        ).length,
        historicalAttempts
      }
      if (impact.activeSessionPins > 0) {
        throw new OfflinePackRemovalClaimBlocked("active-session-pin", impact)
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
      if (activeMeta?.claimId === current.id) meta.delete("active-offline-pack")
      transaction.objectStore(operationStore).put(operation)
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  packRequest.onsuccess = prepare
  activeMetaRequest.onsuccess = prepare
  questionRequest.onsuccess = prepare
  hazardRequest.onsuccess = prepare
  simulationRequest.onsuccess = prepare
  packRequest.onerror = () => reject(packRequest.error)
  activeMetaRequest.onerror = () => reject(activeMetaRequest.error)
  questionRequest.onerror = () => reject(questionRequest.error)
  hazardRequest.onerror = () => reject(hazardRequest.error)
  simulationRequest.onerror = () => reject(simulationRequest.error)
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
  claimId: string,
  generation: string,
  contentFingerprint: string,
  shellBuildFingerprint: string,
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
      const target = current.find((pack) => pack.id === claimId)
      if (
        target === undefined ||
        target.status !== "activating" ||
        !matchesPackClaim(target, {
          claimId,
          generation,
          contentFingerprint,
          shellBuildFingerprint
        }) ||
        !operationClaimsPack(operation, target) ||
        operation.kind !== "activate" ||
        operation.phase !== "complete"
      ) {
        throw new Error("Only the exact claimed offline-pack generation can be activated")
      }
      const activatedAt = operation.updatedAt
      result = current.map((pack) => {
        const next = pack.id === claimId
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
        claimId,
        packId: target.packId,
        generation: target.generation,
        contentFingerprint: target.contentFingerprint,
        shellBuildFingerprint: target.shellBuildFingerprint,
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
  claimId: string,
  generation: string,
  contentFingerprint: string,
  shellBuildFingerprint: string,
  inputOperation: OfflinePackOperationRecord
): Promise<void> => new Promise((resolve, reject) => {
  const operation = decodeOfflinePackOperationRecord(inputOperation)
  if (operation.kind !== "activate" || operation.phase !== "failed" || operation.detail === null) {
    reject(new Error("A failed activation requires an exact failed operation receipt"))
    return
  }
  const transaction = database.transaction([packStore, operationStore], "readwrite")
  const packs = transaction.objectStore(packStore)
  const request = packs.get(claimId)
  request.onsuccess = () => {
    try {
      if (request.result === undefined) throw new Error("The activating pack no longer exists")
      const current = decodeOfflinePackRecord(request.result)
      if (
        current.status !== "activating" ||
        !matchesPackClaim(current, {
          claimId,
          generation,
          contentFingerprint,
          shellBuildFingerprint
        }) ||
        !operationClaimsPack(operation, current)
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

const isExactSimulationSessionPin = (
  value: unknown,
  pack: OfflinePackRecord
): boolean => {
  const session = decodeSimulationSessionRecordShape(value)
  const claim = session.packClaim
  return session.schemaVersion === 2 &&
    (session.status === "active" || session.status === "submitted") &&
    session.releaseId === pack.descriptor.releaseId &&
    session.packVersion === pack.descriptor.packVersion &&
    claim?.claimId === pack.id &&
    claim.packId === pack.packId &&
    claim.generation === pack.generation &&
    claim.contentFingerprint === pack.contentFingerprint &&
    claim.shellBuildFingerprint === pack.shellBuildFingerprint &&
    claim.releaseId === pack.descriptor.releaseId &&
    claim.packVersion === pack.descriptor.packVersion
}

const isHistoricalSimulationSession = (
  value: unknown,
  pack: OfflinePackRecord
): boolean => {
  const session = decodeSimulationSessionRecordShape(value)
  return session.status === "evaluated" &&
    session.releaseId === pack.descriptor.releaseId &&
    session.packVersion === pack.descriptor.packVersion
}

const removalImpact = (
  database: IDBDatabase,
  claimId: string
): Promise<OfflinePackRemovalImpact> => new Promise((resolve, reject) => {
  const stores = [
    packStore,
    appDatabaseStores.questionAttempts,
    appDatabaseStores.hazardAttempts,
    appDatabaseStores.simulationSessions
    // Question/hazard `active` session rows are latest-attempt projections, not
    // proof of a live session, so their attempts remain historical-impact only.
    // Only exact v2 simulation claims that can still resume without evaluation
    // are active pins; completed results are historical impact.
  ]
  const transaction = database.transaction(stores, "readonly")
  const requests = Object.fromEntries(
    stores.map((store) => [store, transaction.objectStore(store).getAll()])
  ) as Readonly<Record<string, IDBRequest<unknown[]>>>
  transaction.oncomplete = () => {
    try {
      const pack = (requests[packStore]?.result ?? [])
        .map(decodeOfflinePackRecord)
        .find((candidate) => candidate.id === claimId)
      if (pack === undefined) throw new Error("The offline pack no longer exists")
      const attempts = [
        ...(requests[appDatabaseStores.questionAttempts]?.result ?? []),
        ...(requests[appDatabaseStores.hazardAttempts]?.result ?? [])
      ] as ReadonlyArray<AttemptCoordinate>
      const matches = attempts.filter((attempt) =>
        attempt.receipt?.releaseId === pack.descriptor.releaseId &&
        attempt.receipt.packVersion === pack.descriptor.packVersion
      )
      const sessions = requests[appDatabaseStores.simulationSessions]?.result ?? []
      resolve({
        activeSessionPins: sessions.filter((session) =>
          isExactSimulationSessionPin(session, pack)
        ).length,
        historicalAttempts: matches.length + sessions.filter((session) =>
          isHistoricalSimulationSession(session, pack)
        ).length
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
  const quarantineStore = appDatabaseStores.migrationQuarantine
  const transaction = database.transaction(
    [packStore, operationStore, quarantineStore, appDatabaseStores.meta],
    "readwrite"
  )
  const packs = transaction.objectStore(packStore)
  const operationsStore = transaction.objectStore(operationStore)
  const packsRequest = packs.getAll()
  const packKeysRequest = packs.getAllKeys()
  const operationsRequest = operationsStore.getAll()
  const operationKeysRequest = operationsStore.getAllKeys()
  let result: ReadonlyArray<OfflinePackRecord> | undefined
  const quarantineInvalid = (
    sourceStore: string,
    key: IDBValidKey,
    value: unknown,
    cause: unknown
  ): void => {
    const keyLabel = key instanceof Date
      ? key.toISOString()
      : Array.isArray(key)
        ? JSON.stringify(key)
        : String(key)
    transaction.objectStore(quarantineStore).put({
      id: `offline-pack-reconcile:${encodeURIComponent(sourceStore)}:${encodeURIComponent(keyLabel)}`,
      sourceDatabase: appDatabaseName,
      sourceStore,
      targetStore: sourceStore,
      reason: "invalid-source-record",
      detail: localFailureDetail(cause, "Stored offline-pack data failed validation."),
      legacyRecord: value
    })
    const unsafeCacheName = sourceStore === packStore &&
      typeof value === "object" && value !== null &&
      "cacheName" in value && typeof value.cacheName === "string" &&
      value.cacheName.startsWith("nycustodian-pack-")
      ? value.cacheName
      : undefined
    if (unsafeCacheName !== undefined) {
      transaction.objectStore(appDatabaseStores.meta).put(
        decodeOfflinePackOrphanCacheRecord(new OfflinePackOrphanCacheRecord({
          id: offlinePackOrphanCacheId(unsafeCacheName),
          cacheName: unsafeCacheName,
          sourceKey: keyLabel.length > 0 ? keyLabel : "(empty key)",
          recordedAt: now
        }))
      )
    }
    transaction.objectStore(sourceStore).delete(key)
  }
  const prepare = () => {
    if (
      packsRequest.readyState !== "done" ||
      packKeysRequest.readyState !== "done" ||
      operationsRequest.readyState !== "done" ||
      operationKeysRequest.readyState !== "done"
    ) return
    try {
      const operations = operationsRequest.result.flatMap((value, index) => {
        try {
          return [decodeOfflinePackOperationRecord(value)]
        } catch (cause) {
          const key = operationKeysRequest.result[index]
          if (key === undefined) throw cause
          quarantineInvalid(operationStore, key, value, cause)
          return []
        }
      })
      const interrupted = operations.filter((operation) => operation.phase === "running")
      for (const operation of operations) {
        if (operation.phase !== "running") continue
        operationsStore.put(decodeOfflinePackOperationRecord(
          new OfflinePackOperationRecord({
            ...operation,
            phase: "failed",
            updatedAt: now,
            detail: "The page closed before this operation completed; retry explicitly."
          })
        ))
      }
      const validPacks = packsRequest.result.flatMap((value, index) => {
        try {
          return [decodeOfflinePackRecord(value)]
        } catch (cause) {
          const key = packKeysRequest.result[index]
          if (key === undefined) throw cause
          quarantineInvalid(packStore, key, value, cause)
          return []
        }
      })
      const transientStatuses = new Set<OfflinePackRecord["status"]>([
        "staging",
        "verifying",
        "activating",
        "removing"
      ])
      result = validPacks.map((pack) => {
        const operation = interrupted.find((candidate) =>
          operationClaimsPack(candidate, pack) &&
          (
            candidate.kind === "stage" && (pack.status === "staging" || pack.status === "verifying") ||
            candidate.kind === "activate" && pack.status === "activating" ||
            candidate.kind === "remove" && pack.status === "removing"
          )
        )
        if (operation === undefined && !transientStatuses.has(pack.status)) return pack
        const reconciled = decodeOfflinePackRecord(new OfflinePackRecord({
          ...pack,
          status: "quarantined",
          detail: operation === undefined
            ? "A pack lifecycle state had no valid operation receipt and requires explicit cleanup."
            : "An interrupted pack operation requires an explicit retry."
        }))
        packs.put(reconciled)
        return reconciled
      }).sort((left, right) =>
        right.descriptor.packVersion - left.descriptor.packVersion || left.id.localeCompare(right.id)
      )
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  packsRequest.onsuccess = prepare
  packKeysRequest.onsuccess = prepare
  operationsRequest.onsuccess = prepare
  operationKeysRequest.onsuccess = prepare
  packsRequest.onerror = () => reject(packsRequest.error)
  packKeysRequest.onerror = () => reject(packKeysRequest.error)
  operationsRequest.onerror = () => reject(operationsRequest.error)
  operationKeysRequest.onerror = () => reject(operationKeysRequest.error)
  transaction.oncomplete = () => resolve(result ?? [])
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack reconciliation aborted"))
})

const retirePack = (
  database: IDBDatabase,
  input: OfflinePackDescriptor,
  observedAt: number
): Promise<ReadonlyArray<OfflinePackRecord>> => new Promise((resolve, reject) => {
  const descriptor = decodeOfflinePackDescriptor(input)
  if (descriptor.lifecycle !== "retired") {
    reject(new Error("Only a trusted retired descriptor can create a retirement marker"))
    return
  }
  const transaction = database.transaction(
    [packStore, appDatabaseStores.meta],
    "readwrite"
  )
  const packs = transaction.objectStore(packStore)
  const meta = transaction.objectStore(appDatabaseStores.meta)
  const packsRequest = packs.getAll()
  const retirementId = offlinePackRetirementId(descriptor.id)
  const retirementRequest = meta.get(retirementId)
  const activeRequest = meta.get("active-offline-pack")
  let result: ReadonlyArray<OfflinePackRecord> | undefined
  const prepare = () => {
    if (
      packsRequest.readyState !== "done" ||
      retirementRequest.readyState !== "done" ||
      activeRequest.readyState !== "done"
    ) return
    try {
      if (retirementRequest.result !== undefined) {
        const existing = decodeOfflinePackRetirementRecord(retirementRequest.result)
        if (
          existing.packId !== descriptor.id ||
          existing.releaseId !== descriptor.releaseId ||
          existing.packVersion !== descriptor.packVersion
        ) {
          throw new Error("The durable retirement marker disagrees with the trusted release identity")
        }
      } else {
        meta.put(decodeOfflinePackRetirementRecord(new OfflinePackRetirementRecord({
          id: retirementId,
          packId: descriptor.id,
          releaseId: descriptor.releaseId,
          packVersion: descriptor.packVersion,
          lifecycle: "retired",
          observedAt
        })))
      }

      const current = packsRequest.result.map(decodeOfflinePackRecord)
      result = current.map((pack) => {
        if (pack.packId !== descriptor.id) return pack
        const next = pack.status === "active"
          ? decodeOfflinePackRecord(new OfflinePackRecord({
              ...pack,
              status: "retained",
              detail: null
            }))
          : ["staging", "verifying", "staged", "activating"].includes(pack.status)
          ? decodeOfflinePackRecord(new OfflinePackRecord({
              ...pack,
              status: "quarantined",
              detail: "This release was retired before the local operation could remain usable."
            }))
          : pack
        if (next !== pack) packs.put(next)
        return next
      }).sort((left, right) =>
        right.descriptor.packVersion - left.descriptor.packVersion || left.id.localeCompare(right.id)
      )
      const active = activeRequest.result as { readonly packId?: unknown } | undefined
      if (active?.packId === descriptor.id) meta.delete("active-offline-pack")
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  packsRequest.onsuccess = prepare
  retirementRequest.onsuccess = prepare
  activeRequest.onsuccess = prepare
  packsRequest.onerror = () => reject(packsRequest.error)
  retirementRequest.onerror = () => reject(retirementRequest.error)
  activeRequest.onerror = () => reject(activeRequest.error)
  transaction.oncomplete = () => resolve(result ?? [])
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Offline-pack retirement aborted"))
})

const removePackRecord = (
  database: IDBDatabase,
  claimId: string,
  generation: string,
  contentFingerprint: string,
  shellBuildFingerprint: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [packStore, appDatabaseStores.meta],
      "readwrite"
    )
    const packs = transaction.objectStore(packStore)
    const packRequest = packs.get(claimId)
    packRequest.onsuccess = () => {
      try {
        if (packRequest.result === undefined) throw new Error("The removing pack no longer exists")
        const current = decodeOfflinePackRecord(packRequest.result)
        if (
          current.status !== "removing" ||
          !matchesPackClaim(current, {
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint
          })
        ) {
          throw new Error("The offline-pack generation changed before removal committed")
        }
        packs.delete(claimId)
      } catch (cause) {
        transaction.abort()
        reject(cause)
      }
    }
    packRequest.onerror = () => reject(packRequest.error)
    const meta = transaction.objectStore(appDatabaseStores.meta)
    const request = meta.get("active-offline-pack")
    request.onsuccess = () => {
      if ((request.result as { readonly claimId?: unknown } | undefined)?.claimId === claimId) {
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
      beginActivation: (
        claimId,
        generation,
        contentFingerprint,
        shellBuildFingerprint,
        operation
      ) => connection.pipe(
        Effect.flatMap((database) => effectTry("begin-activation", () =>
          beginPackTransition(database, {
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint,
            operation,
            allowedStatuses: ["staged", "retained"],
            nextStatus: "activating"
          })
        ))
      ),
      beginRemoval: (
        claimId,
        generation,
        contentFingerprint,
        shellBuildFingerprint,
        confirmedHistoricalImpact,
        operation
      ) => connection.pipe(
        Effect.flatMap((database) => effectTry("begin-removal", () =>
          beginRemovalTransition(database, {
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint,
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
      activate: (
        claimId,
        generation,
        contentFingerprint,
        shellBuildFingerprint,
        operation
      ) => connection.pipe(
        Effect.flatMap((database) => effectTry("activate", () =>
          activatePack(
            database,
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint,
            operation
          )
        ))
      ),
      failActivation: (
        claimId,
        generation,
        contentFingerprint,
        shellBuildFingerprint,
        operation
      ) => connection.pipe(
        Effect.flatMap((database) => effectTry("fail-activation", () =>
          failActivation(
            database,
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint,
            operation
          )
        ))
      ),
      find: (claimId) => connection.pipe(
        Effect.flatMap((database) => effectTry("find", () => findPack(database, claimId)))
      ),
      list: () => connection.pipe(
        Effect.flatMap((database) => effectTry("list", () => listPacks(database)))
      ),
      listOrphanCaches: () => connection.pipe(
        Effect.flatMap((database) => effectTry("list-orphan-caches", () =>
          listOrphanCaches(database)
        ))
      ),
      previewRemoval: (claimId) => connection.pipe(
        Effect.flatMap((database) => effectTry("preview-removal", () => removalImpact(database, claimId)))
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
      forgetOrphanCache: (cacheName) => connection.pipe(
        Effect.flatMap((database) => effectTry("forget-orphan-cache", () =>
          forgetOrphanCache(database, cacheName)
        ))
      ),
      reconcile: () => connection.pipe(
        Effect.flatMap((database) => effectTry("reconcile", () =>
          reconcileOperations(database, Date.now())
        ))
      ),
      retire: (descriptor, observedAt) => connection.pipe(
        Effect.flatMap((database) => effectTry("retire", () =>
          retirePack(database, descriptor, observedAt)
        ))
      ),
      removePack: (
        claimId,
        generation,
        contentFingerprint,
        shellBuildFingerprint
      ) => connection.pipe(
        Effect.flatMap((database) => effectTry("remove", () =>
          removePackRecord(
            database,
            claimId,
            generation,
            contentFingerprint,
            shellBuildFingerprint
          )
        ))
      )
    })
  })
)

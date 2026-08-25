import { Effect } from "effect"
import {
  appDatabaseStores,
  databaseAbortError,
  databaseError,
  type AppDatabaseError,
  type AppDatabaseStore,
  type LegacyDatabaseImport,
  type LegacyImportReport,
  type LegacyStoreImport
} from "./storage-model.ts"

const readLegacyDatabase = (
  databaseName: string,
  storeNames: ReadonlyArray<string>,
  signal: AbortSignal
): Promise<Readonly<Record<string, ReadonlyArray<unknown>>>> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? databaseAbortError())
      return
    }

    let settled = false
    let missingDatabase = false
    let database: IDBDatabase | undefined
    let transaction: IDBTransaction | undefined
    const request = indexedDB.open(databaseName)
    const stopWaiting = () => {
      if (settled) return
      settled = true
      try {
        transaction?.abort()
      } catch {
        // The transaction may already be inactive.
      }
      database?.close()
      reject(signal.reason ?? databaseAbortError())
    }
    signal.addEventListener("abort", stopWaiting, { once: true })

    request.onupgradeneeded = (event) => {
      if (event.oldVersion !== 0) return
      missingDatabase = true
      request.transaction?.abort()
    }
    request.onerror = () => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", stopWaiting)
      if (missingDatabase) {
        resolve({})
        return
      }
      reject(request.error)
    }
    request.onsuccess = () => {
      database = request.result
      if (settled) {
        database.close()
        return
      }

      const availableStores = storeNames.filter((store) =>
        database?.objectStoreNames.contains(store)
      )
      if (availableStores.length === 0) {
        settled = true
        signal.removeEventListener("abort", stopWaiting)
        database.close()
        resolve({})
        return
      }

      const records: Record<string, ReadonlyArray<unknown>> = {}
      transaction = database.transaction(availableStores, "readonly")
      for (const store of availableStores) {
        const getAll = transaction.objectStore(store).getAll()
        getAll.onsuccess = () => {
          records[store] = getAll.result as ReadonlyArray<unknown>
        }
      }
      transaction.oncomplete = () => {
        if (settled) return
        settled = true
        signal.removeEventListener("abort", stopWaiting)
        database?.close()
        resolve(records)
      }
      transaction.onerror = () => {
        if (settled) return
        settled = true
        signal.removeEventListener("abort", stopWaiting)
        database?.close()
        reject(transaction?.error)
      }
      transaction.onabort = () => {
        if (settled) return
        settled = true
        signal.removeEventListener("abort", stopWaiting)
        database?.close()
        reject(transaction?.error ?? new Error(`Legacy database ${databaseName} read aborted`))
      }
    }
  })

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    )
  }
  return value
}

const sameRecord = (left: unknown, right: unknown): boolean =>
  JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))

interface PreparedLegacyRecord {
  readonly sourceStore: string
  readonly targetStore: AppDatabaseStore
  readonly record: Readonly<{ readonly id: string }>
  readonly decodeRecord: LegacyStoreImport["decodeRecord"]
}

interface QuarantineRecord {
  readonly id: string
  readonly sourceDatabase: string
  readonly sourceStore: string
  readonly targetStore: AppDatabaseStore
  readonly reason: "invalid-source-record" | "destination-conflict"
  readonly detail: string
  readonly legacyRecord: unknown
  readonly destinationRecord?: unknown
}

const quarantineId = (
  databaseName: string,
  sourceStore: string,
  targetStore: string,
  recordCoordinate: string
): string =>
  [databaseName, sourceStore, targetStore, recordCoordinate]
    .map(encodeURIComponent)
    .join(":")

const decodeDetail = (cause: unknown): string =>
  cause instanceof Error && cause.message.length > 0
    ? cause.message
    : "Legacy record failed validation"

const reconcileLegacyRecords = (
  database: IDBDatabase,
  input: LegacyDatabaseImport,
  recordsByStore: Readonly<Record<string, ReadonlyArray<unknown>>>,
  signal: AbortSignal
): Promise<LegacyImportReport> =>
  new Promise((resolve, reject) => {
    const prepared: Array<PreparedLegacyRecord> = []
    const quarantined: Array<QuarantineRecord> = []

    for (const storeImport of input.stores) {
      const records = recordsByStore[storeImport.sourceStore] ?? []
      records.forEach((record, index) => {
        try {
          const decoded = storeImport.decodeRecord(record)
          if (decoded.id.length === 0) throw new Error("Legacy record has no durable identity")
          prepared.push({
            sourceStore: storeImport.sourceStore,
            targetStore: storeImport.targetStore,
            record: decoded,
            decodeRecord: storeImport.decodeRecord
          })
        } catch (cause) {
          quarantined.push({
            id: quarantineId(
              input.databaseName,
              storeImport.sourceStore,
              storeImport.targetStore,
              `index-${index}`
            ),
            sourceDatabase: input.databaseName,
            sourceStore: storeImport.sourceStore,
            targetStore: storeImport.targetStore,
            reason: "invalid-source-record",
            detail: decodeDetail(cause),
            legacyRecord: record
          })
        }
      })
    }

    if (prepared.length === 0 && quarantined.length === 0) {
      resolve({ imported: 0, matched: 0, quarantined: 0 })
      return
    }
    if (signal.aborted) {
      reject(signal.reason ?? databaseAbortError())
      return
    }

    const writableStores = [
      ...new Set([
        ...prepared.map((record) => record.targetStore),
        appDatabaseStores.migrationQuarantine
      ])
    ]
    const transaction = database.transaction(writableStores, "readwrite")
    const quarantine = transaction.objectStore(appDatabaseStores.migrationQuarantine)
    let importedCount = 0
    let matchedCount = 0
    let quarantinedCount = quarantined.length
    let settled = false

    const stopWaiting = () => {
      if (settled) return
      settled = true
      try {
        transaction.abort()
      } catch {
        // The transaction may already be inactive.
      }
      reject(signal.reason ?? databaseAbortError())
    }
    signal.addEventListener("abort", stopWaiting, { once: true })

    for (const record of quarantined) quarantine.put(record)
    for (const candidate of prepared) {
      const destination = transaction.objectStore(candidate.targetStore)
      const get = destination.get(candidate.record.id)
      get.onsuccess = () => {
        if (get.result === undefined) {
          destination.add(candidate.record)
          importedCount += 1
          return
        }

        try {
          const existing = candidate.decodeRecord(get.result)
          if (sameRecord(existing, candidate.record)) {
            matchedCount += 1
            return
          }
        } catch {
          // Preserve destination truth and quarantine the valid legacy candidate.
        }

        quarantinedCount += 1
        quarantine.put({
          id: quarantineId(
            input.databaseName,
            candidate.sourceStore,
            candidate.targetStore,
            candidate.record.id
          ),
          sourceDatabase: input.databaseName,
          sourceStore: candidate.sourceStore,
          targetStore: candidate.targetStore,
          reason: "destination-conflict",
          detail: "Canonical storage already contains different data for this identity",
          legacyRecord: candidate.record,
          destinationRecord: get.result
        } satisfies QuarantineRecord)
      }
    }

    transaction.oncomplete = () => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", stopWaiting)
      resolve({
        imported: importedCount,
        matched: matchedCount,
        quarantined: quarantinedCount
      })
    }
    transaction.onerror = () => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", stopWaiting)
      reject(transaction.error)
    }
    transaction.onabort = () => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", stopWaiting)
      reject(transaction.error ?? new Error("Legacy study-storage reconciliation aborted"))
    }
  })

export const importLegacyDatabase = (
  database: IDBDatabase,
  input: LegacyDatabaseImport
): Effect.Effect<LegacyImportReport, AppDatabaseError> =>
  Effect.tryPromise({
    try: async (signal) => {
      const records = await readLegacyDatabase(
        input.databaseName,
        input.stores.map((store) => store.sourceStore),
        signal
      )
      return await reconcileLegacyRecords(database, input, records, signal)
    },
    catch: (cause) => databaseError(`import-legacy:${input.databaseName}`, cause)
  })

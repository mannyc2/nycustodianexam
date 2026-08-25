import { Context, Effect, Layer, Schema } from "effect"
import { localFailureDetail } from "../local-failure-detail.ts"
import {
  CorrectionDraftRecord,
  decodeStoredCorrectionDraft
} from "../corrections/model.ts"
import {
  HazardAttemptRecord,
  decodeStoredHazardAttempt
} from "../hazard-player/persistence.ts"
import {
  QuestionAttemptRecord,
  decodeStoredQuestionAttempt
} from "../question-player/persistence.ts"
import {
  ReviewAcknowledgementRecord,
  decodeStoredReviewAcknowledgement
} from "../review/persistence.ts"
import { appDatabaseStores } from "../study-storage/app-database.ts"
import { SitePreferencesRecord, decodeStoredSitePreferences } from "./model.ts"
import { SettingsPersistence } from "./persistence.ts"

const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

export class TransferPayload extends Schema.Class<TransferPayload>(
  "@nycustodian/site/settings/TransferPayload"
)({
  schemaVersion: Schema.Literal(1),
  exportedAt: Schema.Number,
  includesCorrectionDrafts: Schema.Boolean,
  questionAttempts: Schema.Array(QuestionAttemptRecord),
  hazardAttempts: Schema.Array(HazardAttemptRecord),
  reviewAcknowledgements: Schema.Array(ReviewAcknowledgementRecord),
  preferences: Schema.Array(SitePreferencesRecord),
  correctionDrafts: Schema.Array(CorrectionDraftRecord)
}) {}

export class DataTransferEnvelope extends Schema.Class<DataTransferEnvelope>(
  "@nycustodian/site/settings/DataTransferEnvelope"
)({
  schemaVersion: Schema.Literal(1),
  format: Schema.Literal("nycustodian-local-data"),
  checksumAlgorithm: Schema.Literal("SHA-256"),
  payload: TransferPayload,
  checksum: Sha256
}) {}

export interface KnownContentReferences {
  readonly questionIds: ReadonlySet<string>
  readonly sceneIds: ReadonlySet<string>
}

type ImportDecision = "insert" | "matched" | "conflict" | "unknown-reference"

interface ImportCandidate {
  readonly store: string
  readonly record: Readonly<{ readonly id: string }>
  readonly decision: ImportDecision
}

export interface ImportPreview {
  readonly checksum: string
  readonly exportedAt: number
  readonly includesCorrectionDrafts: boolean
  readonly insert: number
  readonly matched: number
  readonly conflicts: number
  readonly unknownReferences: number
  readonly byStore: ReadonlyArray<{
    readonly store: string
    readonly records: number
  }>
}

export interface ImportPlan {
  readonly preview: ImportPreview
  readonly candidates: ReadonlyArray<ImportCandidate>
  readonly known: {
    readonly questionIds: ReadonlyArray<string>
    readonly sceneIds: ReadonlyArray<string>
  }
}

export interface ImportResult {
  readonly imported: number
  readonly matched: number
  readonly quarantined: number
}

export class DataTransferError extends Schema.TaggedError<DataTransferError>()(
  "DataTransferError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class DataTransfer extends Context.Service<
  DataTransfer,
  {
    readonly applyImport: (
      plan: ImportPlan
    ) => Effect.Effect<ImportResult, DataTransferError>
    readonly createExport: (
      includeCorrectionDrafts: boolean
    ) => Effect.Effect<DataTransferEnvelope, DataTransferError>
    readonly previewImport: (
      text: string,
      known: KnownContentReferences
    ) => Effect.Effect<ImportPlan, DataTransferError>
  }
>()("@nycustodian/site/DataTransfer") {}

const transferStores = [
  appDatabaseStores.questionAttempts,
  appDatabaseStores.hazardAttempts,
  appDatabaseStores.reviewAcknowledgements,
  appDatabaseStores.preferences,
  appDatabaseStores.correctionDrafts
  // M4 integration requirement: include simulation sessions and submissions as
  // substantive progress, plus immutable print jobs as user-created portable
  // artifacts. An imported simulation with any unknown question reference is
  // quarantined whole; never write a partial session.
] as const

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    )
  }
  return value
}

export const canonicalJson = (value: unknown): string =>
  JSON.stringify(canonicalize(JSON.parse(JSON.stringify(value)) as unknown))

const browserSha256 = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

const sameRecord = (left: unknown, right: unknown): boolean =>
  canonicalJson(left) === canonicalJson(right)

const error = (operation: string, cause: unknown): DataTransferError =>
  new DataTransferError({
    operation,
    detail: localFailureDetail(cause, "Local data transfer failed"),
    cause
  })

const readStores = (
  database: IDBDatabase,
  stores: ReadonlyArray<string>
): Promise<Readonly<Record<string, ReadonlyArray<unknown>>>> => new Promise((resolve, reject) => {
  const transaction = database.transaction(stores, "readonly")
  const records: Record<string, ReadonlyArray<unknown>> = {}
  for (const store of stores) {
    const request = transaction.objectStore(store).getAll()
    request.onsuccess = () => {
      records[store] = request.result as ReadonlyArray<unknown>
    }
  }
  transaction.oncomplete = () => resolve(records)
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Portable data read aborted"))
})

const decodeRecords = <A>(
  decode: (record: unknown) => A,
  records: ReadonlyArray<unknown>
): ReadonlyArray<A> => records.map(decode)

const decodeTransferRecord = (
  store: string,
  record: unknown
): QuestionAttemptRecord | HazardAttemptRecord | ReviewAcknowledgementRecord |
  SitePreferencesRecord | CorrectionDraftRecord => {
  switch (store) {
    case appDatabaseStores.questionAttempts: return decodeStoredQuestionAttempt(record)
    case appDatabaseStores.hazardAttempts: return decodeStoredHazardAttempt(record)
    case appDatabaseStores.reviewAcknowledgements:
      return decodeStoredReviewAcknowledgement(record)
    case appDatabaseStores.preferences: return decodeStoredSitePreferences(record)
    case appDatabaseStores.correctionDrafts: return decodeStoredCorrectionDraft(record)
    default: throw new Error(`Portable transfer does not own store: ${store}`)
  }
}

export const createDataExport = async (
  database: IDBDatabase,
  includeCorrectionDrafts: boolean,
  now = Date.now(),
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<DataTransferEnvelope> => {
  const records = await readStores(database, transferStores)
  const payload = new TransferPayload({
    schemaVersion: 1,
    exportedAt: now,
    includesCorrectionDrafts: includeCorrectionDrafts,
    questionAttempts: decodeRecords(
      decodeStoredQuestionAttempt,
      records[appDatabaseStores.questionAttempts] ?? []
    ),
    hazardAttempts: decodeRecords(
      decodeStoredHazardAttempt,
      records[appDatabaseStores.hazardAttempts] ?? []
    ),
    reviewAcknowledgements: decodeRecords(
      decodeStoredReviewAcknowledgement,
      records[appDatabaseStores.reviewAcknowledgements] ?? []
    ),
    preferences: decodeRecords(
      decodeStoredSitePreferences,
      records[appDatabaseStores.preferences] ?? []
    ),
    correctionDrafts: includeCorrectionDrafts
      ? decodeRecords(
          decodeStoredCorrectionDraft,
          records[appDatabaseStores.correctionDrafts] ?? []
        )
      : []
  })
  return new DataTransferEnvelope({
    schemaVersion: 1,
    format: "nycustodian-local-data",
    checksumAlgorithm: "SHA-256",
    payload,
    checksum: await sha256(canonicalJson(payload))
  })
}

export const serializeDataExport = (envelope: DataTransferEnvelope): string =>
  `${JSON.stringify(envelope, null, 2)}\n`

const decodeEnvelope = async (
  text: string,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<DataTransferEnvelope> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (cause) {
    throw new Error(`Import is not valid JSON: ${cause instanceof Error ? cause.message : "parse failed"}`)
  }
  const envelope = Schema.decodeUnknownSync(
    DataTransferEnvelope,
    { onExcessProperty: "error" }
  )(parsed)
  const payload = new TransferPayload({
    ...envelope.payload,
    questionAttempts: envelope.payload.questionAttempts.map(decodeStoredQuestionAttempt),
    hazardAttempts: envelope.payload.hazardAttempts.map(decodeStoredHazardAttempt),
    reviewAcknowledgements: envelope.payload.reviewAcknowledgements
      .map(decodeStoredReviewAcknowledgement),
    preferences: envelope.payload.preferences.map(decodeStoredSitePreferences),
    correctionDrafts: envelope.payload.correctionDrafts.map(decodeStoredCorrectionDraft)
  })
  if (!Number.isFinite(payload.exportedAt) || payload.exportedAt < 0) {
    throw new Error("Import has an invalid export time")
  }
  const digest = await sha256(canonicalJson(payload))
  if (digest !== envelope.checksum) throw new Error("Import checksum does not match its payload")
  if (!payload.includesCorrectionDrafts && payload.correctionDrafts.length > 0) {
    throw new Error("Import claims to exclude correction drafts but contains draft records")
  }
  return new DataTransferEnvelope({ ...envelope, payload })
}

const candidatesFor = (
  envelope: DataTransferEnvelope
): ReadonlyArray<Omit<ImportCandidate, "decision">> => [
  ...envelope.payload.questionAttempts.map((record) => ({
    store: appDatabaseStores.questionAttempts,
    record
  })),
  ...envelope.payload.hazardAttempts.map((record) => ({
    store: appDatabaseStores.hazardAttempts,
    record
  })),
  ...envelope.payload.reviewAcknowledgements.map((record) => ({
    store: appDatabaseStores.reviewAcknowledgements,
    record
  })),
  ...envelope.payload.preferences.map((record) => ({
    store: appDatabaseStores.preferences,
    record
  })),
  ...envelope.payload.correctionDrafts.map((record) => ({
    store: appDatabaseStores.correctionDrafts,
    record
  }))
]

type AttemptRecord = QuestionAttemptRecord | HazardAttemptRecord

const isAttemptStore = (store: string): boolean =>
  store === appDatabaseStores.questionAttempts || store === appDatabaseStores.hazardAttempts

const attemptItemId = (record: AttemptRecord): string =>
  "questionId" in record ? record.questionId : record.sceneId

const decodedDestination = (
  destination: Readonly<Record<string, ReadonlyArray<unknown>>>
): Readonly<Record<string, ReadonlyArray<Readonly<{ readonly id: string }>>>> =>
  Object.fromEntries(transferStores.map((store) => [
    store,
    (destination[store] ?? []).map((record) => decodeTransferRecord(store, record))
  ]))

const uniqueAttemptsById = (
  attempts: ReadonlyArray<AttemptRecord>,
  label: string
): ReadonlyMap<string, AttemptRecord> => {
  const result = new Map<string, AttemptRecord>()
  for (const attempt of attempts) {
    if (result.has(attempt.id)) {
      throw new Error(`${label} contains an ambiguous attempt ID across attempt stores`)
    }
    result.set(attempt.id, attempt)
  }
  return result
}

const classifyCandidates = (
  incoming: ReadonlyArray<Omit<ImportCandidate, "decision">>,
  destination: Readonly<Record<string, ReadonlyArray<unknown>>>,
  known: KnownContentReferences
): ReadonlyArray<ImportCandidate> => {
  const decoded = decodedDestination(destination)
  const existingByStore: ReadonlyMap<string, ReadonlyMap<string, unknown>> = new Map(
    transferStores.map((store) => [
      store,
      new Map((decoded[store] ?? []).map((record) => [record.id, record] as const))
    ])
  )
  const incomingAttempts = incoming
    .filter((candidate) => isAttemptStore(candidate.store))
    .map((candidate) => candidate.record as AttemptRecord)
  const incomingAttemptById = uniqueAttemptsById(incomingAttempts, "Import")
  const destinationAttemptById = uniqueAttemptsById([
    ...(decoded[appDatabaseStores.questionAttempts] ?? []) as ReadonlyArray<QuestionAttemptRecord>,
    ...(decoded[appDatabaseStores.hazardAttempts] ?? []) as ReadonlyArray<HazardAttemptRecord>
  ], "Destination")
  const attemptDecisionById = new Map<string, ImportDecision>()

  for (const candidate of incoming.filter((entry) => isAttemptStore(entry.store))) {
    const attempt = candidate.record as AttemptRecord
    const unknown = candidate.store === appDatabaseStores.questionAttempts
      ? !known.questionIds.has((attempt as QuestionAttemptRecord).questionId)
      : !known.sceneIds.has((attempt as HazardAttemptRecord).sceneId)
    const existing = existingByStore.get(candidate.store)?.get(candidate.record.id)
    const decision: ImportDecision = unknown
      ? "unknown-reference"
      : existing === undefined
      ? "insert"
      : sameRecord(existing, candidate.record)
      ? "matched"
      : "conflict"
    attemptDecisionById.set(attempt.id, decision)
  }

  return incoming.map((candidate) => {
    if (isAttemptStore(candidate.store)) {
      return {
        ...candidate,
        decision: attemptDecisionById.get(candidate.record.id) ?? "unknown-reference"
      }
    }
    const existing = existingByStore.get(candidate.store)?.get(candidate.record.id)
    let hasUnknownReference = false
    if (candidate.store === appDatabaseStores.reviewAcknowledgements) {
      const acknowledgement = candidate.record as ReviewAcknowledgementRecord
      const incomingParent = incomingAttemptById.get(acknowledgement.attemptId)
      const incomingParentDecision = attemptDecisionById.get(acknowledgement.attemptId)
      const parent = incomingParent === undefined
        ? destinationAttemptById.get(acknowledgement.attemptId)
        : incomingParentDecision === "insert" || incomingParentDecision === "matched"
        ? incomingParent
        : undefined
      hasUnknownReference = parent === undefined ||
        attemptItemId(parent) !== acknowledgement.itemId
    }
    const decision: ImportDecision = hasUnknownReference
      ? "unknown-reference"
      : existing === undefined
      ? "insert"
      : sameRecord(existing, candidate.record)
      ? "matched"
      : "conflict"
    return { ...candidate, decision }
  })
}

export const previewDataImport = async (
  database: IDBDatabase,
  text: string,
  known: KnownContentReferences,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<ImportPlan> => {
  const envelope = await decodeEnvelope(text, sha256)
  const incoming = candidatesFor(envelope)
  const incomingKeys = incoming.map((candidate) =>
    `${candidate.store}:${encodeURIComponent(candidate.record.id)}`
  )
  if (new Set(incomingKeys).size !== incomingKeys.length) {
    throw new Error("Import contains duplicate record IDs within one store")
  }
  const destination = await readStores(database, transferStores)
  const candidates = classifyCandidates(incoming, destination, known)
  const byStore = [...new Set(candidates.map((candidate) => candidate.store))].map((store) => ({
    store,
    records: candidates.filter((candidate) => candidate.store === store).length
  }))
  return {
    preview: {
      checksum: envelope.checksum,
      exportedAt: envelope.payload.exportedAt,
      includesCorrectionDrafts: envelope.payload.includesCorrectionDrafts,
      insert: candidates.filter((candidate) => candidate.decision === "insert").length,
      matched: candidates.filter((candidate) => candidate.decision === "matched").length,
      conflicts: candidates.filter((candidate) => candidate.decision === "conflict").length,
      unknownReferences: candidates.filter((candidate) => candidate.decision === "unknown-reference").length,
      byStore
    },
    candidates,
    known: {
      questionIds: [...known.questionIds].sort(),
      sceneIds: [...known.sceneIds].sort()
    }
  }
}

const quarantineId = (checksum: string, store: string, recordId: string): string =>
  ["import", checksum, store, recordId].map(encodeURIComponent).join(":")

export const applyDataImport = (
  database: IDBDatabase,
  plan: ImportPlan
): Promise<ImportResult> => new Promise((resolve, reject) => {
  let incoming: ReadonlyArray<Omit<ImportCandidate, "decision">>
  try {
    const allowedStores = new Set<string>(transferStores)
    incoming = plan.candidates.map((candidate) => {
      if (!allowedStores.has(candidate.store)) {
        throw new Error(`Import plan contains an unowned store: ${candidate.store}`)
      }
      return {
        store: candidate.store,
        record: decodeTransferRecord(candidate.store, candidate.record)
      }
    })
    const keys = incoming.map((candidate) =>
      `${candidate.store}:${encodeURIComponent(candidate.record.id)}`
    )
    if (new Set(keys).size !== keys.length) {
      throw new Error("Import plan contains duplicate record IDs within one store")
    }
  } catch (cause) {
    reject(cause)
    return
  }
  const writableStores = [...transferStores, appDatabaseStores.transferQuarantine]
  const transaction = database.transaction(writableStores, "readwrite")
  const quarantine = transaction.objectStore(appDatabaseStores.transferQuarantine)
  const destinationRequests = Object.fromEntries(
    transferStores.map((store) => [store, transaction.objectStore(store).getAll()])
  ) as Readonly<Record<string, IDBRequest<unknown[]>>>
  let imported = 0
  let matched = 0
  let quarantined = 0
  let classified = false

  const prepare = () => {
    if (
      classified ||
      transferStores.some((store) => destinationRequests[store]?.readyState !== "done")
    ) return
    classified = true
    try {
      const destination = Object.fromEntries(
        transferStores.map((store) => [store, destinationRequests[store]?.result ?? []])
      )
      const candidates = classifyCandidates(incoming, destination, {
        questionIds: new Set(plan.known.questionIds),
        sceneIds: new Set(plan.known.sceneIds)
      })
      const currentByStore: ReadonlyMap<string, ReadonlyMap<string, unknown>> = new Map(
        transferStores.map((store) => [
          store,
          new Map((destination[store] ?? []).flatMap((record) => {
            const id = (record as { readonly id?: unknown }).id
            return typeof id === "string" ? [[id, record] as const] : []
          }))
        ])
      )
      for (const candidate of candidates) {
        const current = currentByStore.get(candidate.store)?.get(candidate.record.id)
        if (candidate.decision === "matched") {
          matched += 1
          continue
        }
        if (candidate.decision === "insert") {
          transaction.objectStore(candidate.store).add(candidate.record)
          imported += 1
          continue
        }
        quarantine.put({
          id: quarantineId(plan.preview.checksum, candidate.store, candidate.record.id),
          source: "portable-import",
          sourceChecksum: plan.preview.checksum,
          targetStore: candidate.store,
          reason: candidate.decision === "unknown-reference"
            ? "unknown-reference"
            : "destination-conflict",
          importedRecord: candidate.record,
          ...(candidate.decision === "conflict" && current !== undefined
            ? { destinationRecord: current }
            : {})
        })
        quarantined += 1
      }
    } catch (cause) {
      transaction.abort()
      reject(cause)
    }
  }
  for (const request of Object.values(destinationRequests)) {
    request.onsuccess = prepare
    request.onerror = () => reject(request.error)
  }
  transaction.oncomplete = () => resolve({ imported, matched, quarantined })
  transaction.onerror = () => reject(transaction.error)
  transaction.onabort = () => reject(transaction.error ?? new Error("Portable import aborted"))
})

export const dataTransferLive = Layer.effect(
  DataTransfer,
  Effect.gen(function*() {
    const settings = yield* SettingsPersistence
    const connection = settings.connection.pipe(
      Effect.mapError((cause) => error("connection", cause))
    )
    return DataTransfer.of({
      applyImport: (plan) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => applyDataImport(database, plan),
          catch: (cause) => error("apply-import", cause)
        }))
      ),
      createExport: (includeCorrectionDrafts) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => createDataExport(database, includeCorrectionDrafts),
          catch: (cause) => error("create-export", cause)
        }))
      ),
      previewImport: (text, known) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => previewDataImport(database, text, known),
          catch: (cause) => error("preview-import", cause)
        }))
      )
    })
  })
)

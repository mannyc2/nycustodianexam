import { Context, Effect, Layer, Schema } from "effect"
import type { AssetContentReceipt } from "../verified-content.ts"
import { localFailureDetail } from "../local-failure-detail.ts"
import { DurableTimestamp } from "../durable-values.ts"
import {
  CorrectionDraftRecord,
  decodeStoredCorrectionDraft
} from "../corrections/model.ts"
import {
  HazardAttemptRecord,
  decodeStoredHazardAttempt,
  hasBoundHazardReceipt
} from "../hazard-player/persistence.ts"
import {
  QuestionAttemptRecord,
  decodeStoredQuestionAttempt,
  hasBoundQuestionReceipt
} from "../question-player/persistence.ts"
import {
  ReviewAcknowledgementRecord,
  decodeStoredReviewAcknowledgement
} from "../review/persistence.ts"
import { PrintJobRecord } from "../print/model.ts"
import {
  decodeOfflinePackRecord,
  type OfflinePackRecord
} from "../offline-packs/model.ts"
import {
  SimulationSessionRecord,
  SimulationSubmissionRecord,
  simulationItemId
} from "../simulation/model.ts"
import {
  assertOfflinePackSupportsSimulationSession,
  simulationPackClaimForRecord
} from "../simulation/persistence.ts"
import { appDatabaseStores } from "../study-storage/app-database.ts"
import {
  TrustedReleaseContentError,
  type TrustedReleaseContentRegistry,
  canonicalTrustedReleaseContentRegistryJson,
  findTrustedReleaseContentEntry,
  verifyTrustedHazardContent,
  verifyTrustedQuestionContent
} from "../trusted-release-content.ts"
import { SitePreferencesRecord, decodeStoredSitePreferences } from "./model.ts"
import {
  decodePortablePrintJob,
  decodePortableSimulationSession,
  decodePortableSimulationSubmission,
  validatePortableHazardAttemptIntegrity,
  validatePortablePrintJobIntegrity,
  validatePortableSimulationSubmissionIntegrity
} from "./portable-record-integrity.ts"
import { SettingsPersistence } from "./persistence.ts"

const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

class TransferPayloadV1 extends Schema.Class<TransferPayloadV1>(
  "@nycustodian/site/settings/TransferPayloadV1"
)({
  schemaVersion: Schema.Literal(1),
  exportedAt: DurableTimestamp,
  includesCorrectionDrafts: Schema.Boolean,
  questionAttempts: Schema.Array(QuestionAttemptRecord),
  hazardAttempts: Schema.Array(HazardAttemptRecord),
  reviewAcknowledgements: Schema.Array(ReviewAcknowledgementRecord),
  preferences: Schema.Array(SitePreferencesRecord),
  correctionDrafts: Schema.Array(CorrectionDraftRecord)
}) {}

export class TransferPayload extends Schema.Class<TransferPayload>(
  "@nycustodian/site/settings/TransferPayload"
)({
  schemaVersion: Schema.Literal(2),
  exportedAt: DurableTimestamp,
  includesCorrectionDrafts: Schema.Boolean,
  questionAttempts: Schema.Array(QuestionAttemptRecord),
  hazardAttempts: Schema.Array(HazardAttemptRecord),
  reviewAcknowledgements: Schema.Array(ReviewAcknowledgementRecord),
  preferences: Schema.Array(SitePreferencesRecord),
  correctionDrafts: Schema.Array(CorrectionDraftRecord),
  simulationSessions: Schema.Array(SimulationSessionRecord),
  simulationSubmissions: Schema.Array(SimulationSubmissionRecord),
  printJobs: Schema.Array(PrintJobRecord)
}) {}

class DataTransferEnvelopeV1 extends Schema.Class<DataTransferEnvelopeV1>(
  "@nycustodian/site/settings/DataTransferEnvelopeV1"
)({
  schemaVersion: Schema.Literal(1),
  format: Schema.Literal("nycustodian-local-data"),
  checksumAlgorithm: Schema.Literal("SHA-256"),
  payload: TransferPayloadV1,
  checksum: Sha256
}) {}

export class DataTransferEnvelope extends Schema.Class<DataTransferEnvelope>(
  "@nycustodian/site/settings/DataTransferEnvelope"
)({
  schemaVersion: Schema.Literal(2),
  format: Schema.Literal("nycustodian-local-data"),
  checksumAlgorithm: Schema.Literal("SHA-256"),
  payload: TransferPayload,
  checksum: Sha256
}) {}

const WireEnvelope = Schema.Union([DataTransferEnvelopeV1, DataTransferEnvelope])

export type ImportDecision = "insert" | "matched" | "conflict" | "unknown-reference"

type TransferRecord =
  | QuestionAttemptRecord
  | HazardAttemptRecord
  | ReviewAcknowledgementRecord
  | SitePreferencesRecord
  | CorrectionDraftRecord
  | SimulationSessionRecord
  | SimulationSubmissionRecord
  | PrintJobRecord

interface ImportCandidateInput {
  readonly store: string
  readonly record: TransferRecord
  readonly trustedReference: boolean
}

interface ImportCandidate extends ImportCandidateInput {
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

const ImportPreviewSchema = Schema.Struct({
  checksum: Sha256,
  exportedAt: DurableTimestamp,
  includesCorrectionDrafts: Schema.Boolean,
  insert: Schema.Natural,
  matched: Schema.Natural,
  conflicts: Schema.Natural,
  unknownReferences: Schema.Natural,
  byStore: Schema.Array(Schema.Struct({
    store: Schema.NonEmptyString,
    records: Schema.Natural
  }))
})

const ImportPlanSchema = Schema.Struct({
  planVersion: Schema.Literal(1),
  sourceSchemaVersion: Schema.Literals([1, 2]),
  sourceChecksum: Sha256,
  normalizedChecksum: Sha256,
  registryChecksum: Sha256,
  resumableContentPins: Schema.Array(Schema.Struct({
    sessionId: Schema.NonEmptyString,
    contentFingerprint: Sha256
  })),
  payload: TransferPayload,
  preview: ImportPreviewSchema,
  seal: Sha256
})

export type ImportPlan = typeof ImportPlanSchema.Type

export interface ImportResult {
  readonly imported: number
  readonly matched: number
  readonly quarantined: number
}

export interface NormalizedDataTransfer {
  readonly sourceSchemaVersion: 1 | 2
  readonly sourceChecksum: string
  readonly normalizedChecksum: string
  readonly payload: TransferPayload
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
      plan: ImportPlan,
      registry: TrustedReleaseContentRegistry
    ) => Effect.Effect<ImportResult, DataTransferError>
    readonly createExport: (
      includeCorrectionDrafts: boolean
    ) => Effect.Effect<DataTransferEnvelope, DataTransferError>
    readonly previewImport: (
      text: string,
      registry: TrustedReleaseContentRegistry
    ) => Effect.Effect<ImportPlan, DataTransferError>
  }
>()("@nycustodian/site/DataTransfer") {}

const transferStores = [
  appDatabaseStores.questionAttempts,
  appDatabaseStores.hazardAttempts,
  appDatabaseStores.reviewAcknowledgements,
  appDatabaseStores.preferences,
  appDatabaseStores.correctionDrafts,
  appDatabaseStores.simulationSessions,
  appDatabaseStores.simulationSubmissions,
  appDatabaseStores.printJobs
] as const

const importReadStores = [
  ...transferStores,
  appDatabaseStores.offlinePacks
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

const assertSessionSubmissionState = (
  session: SimulationSessionRecord,
  submission: SimulationSubmissionRecord | undefined
): void => {
  if (session.status === "active") {
    if (submission !== undefined) {
      throw new Error(`Active simulation ${session.id} unexpectedly has a submission`)
    }
    return
  }
  if (submission === undefined) {
    throw new Error(`Completed simulation ${session.id} is missing its submission`)
  }
  if (
    (session.status === "submitted" &&
      (submission.status !== "submitted" || session.updatedAt !== submission.submittedAt)) ||
    (session.status === "evaluated" &&
      (submission.status !== "evaluated" || session.updatedAt !== submission.evaluatedAt))
  ) {
    throw new Error(`Simulation ${session.id} disagrees with its submission state`)
  }
}

const validateSimulationClosure = async (
  sessions: ReadonlyArray<SimulationSessionRecord>,
  unsafeSubmissions: ReadonlyArray<unknown>
): Promise<ReadonlyArray<SimulationSubmissionRecord>> => {
  const sessionById = new Map(sessions.map((session) => [session.id, session] as const))
  if (sessionById.size !== sessions.length) {
    throw new Error("Portable data repeats a simulation-session ID")
  }
  const submissions = unsafeSubmissions.map((value) => {
    const structurallyDecoded = Schema.decodeUnknownSync(
      SimulationSubmissionRecord,
      { onExcessProperty: "error" }
    )(value)
    const session = sessionById.get(structurallyDecoded.sessionId)
    if (session === undefined) {
      throw new Error(`Portable submission ${structurallyDecoded.id} has no session closure`)
    }
    return decodePortableSimulationSubmission(session, structurallyDecoded)
  })
  const submissionBySessionId = new Map<string, SimulationSubmissionRecord>()
  for (const submission of submissions) {
    if (submissionBySessionId.has(submission.sessionId)) {
      throw new Error(`Portable simulation ${submission.sessionId} has multiple submissions`)
    }
    submissionBySessionId.set(submission.sessionId, submission)
  }
  for (const session of sessions) {
    assertSessionSubmissionState(session, submissionBySessionId.get(session.id))
  }
  await Promise.all(submissions.map((submission) =>
    validatePortableSimulationSubmissionIntegrity(
      sessionById.get(submission.sessionId) as SimulationSessionRecord,
      submission
    )
  ))
  return submissions
}

const validatePayload = async (value: unknown): Promise<TransferPayload> => {
  const payload = Schema.decodeUnknownSync(
    TransferPayload,
    { onExcessProperty: "error" }
  )(value)
  const questionAttempts = decodeRecords(decodeStoredQuestionAttempt, payload.questionAttempts)
  const hazardAttempts = decodeRecords(decodeStoredHazardAttempt, payload.hazardAttempts)
  const reviewAcknowledgements = decodeRecords(
    decodeStoredReviewAcknowledgement,
    payload.reviewAcknowledgements
  )
  const preferences = decodeRecords(decodeStoredSitePreferences, payload.preferences)
  const correctionDrafts = decodeRecords(decodeStoredCorrectionDraft, payload.correctionDrafts)
  const simulationSessions = decodeRecords(
    decodePortableSimulationSession,
    payload.simulationSessions
  )
  const simulationSubmissions = await validateSimulationClosure(
    simulationSessions,
    payload.simulationSubmissions
  )
  const printJobs = decodeRecords(decodePortablePrintJob, payload.printJobs)

  if (!Number.isFinite(payload.exportedAt) || payload.exportedAt < 0) {
    throw new Error("Import has an invalid export time")
  }
  if (!payload.includesCorrectionDrafts && correctionDrafts.length > 0) {
    throw new Error("Import claims to exclude correction drafts but contains draft records")
  }
  await Promise.all(hazardAttempts.map(validatePortableHazardAttemptIntegrity))
  await Promise.all(printJobs.map(validatePortablePrintJobIntegrity))

  return new TransferPayload({
    ...payload,
    questionAttempts,
    hazardAttempts,
    reviewAcknowledgements,
    preferences,
    correctionDrafts,
    simulationSessions,
    simulationSubmissions,
    printJobs
  })
}

export const normalizeDataTransfer = async (
  text: string,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<NormalizedDataTransfer> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (cause) {
    throw new Error(`Import is not valid JSON: ${cause instanceof Error ? cause.message : "parse failed"}`)
  }
  const envelope = Schema.decodeUnknownSync(
    WireEnvelope,
    { onExcessProperty: "error" }
  )(parsed)

  // The source digest is intentionally checked against the exact decoded wire
  // payload before the only supported migration hop changes its shape.
  const sourceChecksum = await sha256(canonicalJson(envelope.payload))
  if (sourceChecksum !== envelope.checksum) {
    throw new Error("Import checksum does not match its payload")
  }

  const migrated = envelope.schemaVersion === 1
    ? {
        ...envelope.payload,
        schemaVersion: 2 as const,
        simulationSessions: [],
        simulationSubmissions: [],
        printJobs: []
      }
    : envelope.payload
  const payload = await validatePayload(migrated)
  return {
    sourceSchemaVersion: envelope.schemaVersion,
    sourceChecksum: envelope.checksum,
    normalizedChecksum: await sha256(canonicalJson(payload)),
    payload
  }
}

export const createDataExport = async (
  database: IDBDatabase,
  includeCorrectionDrafts: boolean,
  now = Date.now(),
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<DataTransferEnvelope> => {
  const records = await readStores(database, transferStores)
  const payload = await validatePayload({
    schemaVersion: 2,
    exportedAt: now,
    includesCorrectionDrafts: includeCorrectionDrafts,
    questionAttempts: records[appDatabaseStores.questionAttempts] ?? [],
    hazardAttempts: records[appDatabaseStores.hazardAttempts] ?? [],
    reviewAcknowledgements: records[appDatabaseStores.reviewAcknowledgements] ?? [],
    preferences: records[appDatabaseStores.preferences] ?? [],
    correctionDrafts: includeCorrectionDrafts
      ? records[appDatabaseStores.correctionDrafts] ?? []
      : [],
    simulationSessions: records[appDatabaseStores.simulationSessions] ?? [],
    simulationSubmissions: records[appDatabaseStores.simulationSubmissions] ?? [],
    printJobs: records[appDatabaseStores.printJobs] ?? []
  })
  return new DataTransferEnvelope({
    schemaVersion: 2,
    format: "nycustodian-local-data",
    checksumAlgorithm: "SHA-256",
    payload,
    checksum: await sha256(canonicalJson(payload))
  })
}

export const serializeDataExport = (envelope: DataTransferEnvelope): string =>
  `${JSON.stringify(envelope, null, 2)}\n`

const sameStringSet = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value) => right.includes(value))

const catchesUntrustedReference = (verify: () => void): boolean => {
  try {
    verify()
    return true
  } catch (cause) {
    if (cause instanceof TrustedReleaseContentError) return false
    throw cause
  }
}

const trustedQuestionAttempt = (
  registry: TrustedReleaseContentRegistry,
  attempt: QuestionAttemptRecord
): boolean => hasBoundQuestionReceipt(attempt) && catchesUntrustedReference(() => {
  verifyTrustedQuestionContent(registry, {
    receipt: attempt.receipt,
    optionIds: attempt.optionIds
  })
})

const trustedHazardAttempt = (
  registry: TrustedReleaseContentRegistry,
  attempt: HazardAttemptRecord
): boolean => hasBoundHazardReceipt(attempt) && catchesUntrustedReference(() => {
  const visualAssetReceipt: AssetContentReceipt | null | undefined =
    attempt.evaluation?.retainedVisualAsset?.receipt
  verifyTrustedHazardContent(registry, {
    receipt: attempt.receipt,
    allowedZoneOrders: attempt.allowedZoneOrders,
    ...(visualAssetReceipt === undefined ? {} : { visualAssetReceipt })
  })
})

const trustedSimulation = (
  registry: TrustedReleaseContentRegistry,
  session: SimulationSessionRecord
): boolean => session.items.every((item) => catchesUntrustedReference(() => {
  if ("question" in item) {
    verifyTrustedQuestionContent(registry, {
      receipt: item.receipt,
      optionIds: item.question.options.map((option) => option.id)
    })
    return
  }
  verifyTrustedHazardContent(registry, {
    receipt: item.receipt,
    allowedZoneOrders: item.scene.neutralPreAnswer.zones.map((zone) => zone.order),
    visualAssetReceipt: item.visualAsset
  })
}))

const trustedPrintJob = (
  registry: TrustedReleaseContentRegistry,
  job: PrintJobRecord
): boolean => {
  if (job.manifest.questions.length > 0) {
    return job.manifest.questions.every((question) => {
      const entry = findTrustedReleaseContentEntry(registry, {
        releaseId: job.manifest.releaseId,
        packVersion: job.manifest.contentVersion,
        variant: "question",
        itemId: question.questionId
      })
      return entry?.variant === "question" && sameStringSet(entry.optionIds, question.optionIds)
    })
  }
  const isHazardProduct = [
    "hazard-worksheet",
    "annotated-hazard-answer-packet",
    "text-equivalent-set"
  ].includes(job.manifest.settings.product)
  if (!isHazardProduct) return true
  return job.manifest.itemIds.every((itemId, index) => {
    const entry = findTrustedReleaseContentEntry(registry, {
      releaseId: job.manifest.releaseId,
      packVersion: job.manifest.contentVersion,
      variant: "hazard-visual",
      itemId
    })
    if (entry?.variant !== "hazard-visual") return false
    const asset = job.manifest.assets[index]
    return asset === undefined || sameRecord(asset, entry.visualAssetReceipt)
  })
}

export interface PortableSimulationRebindResult {
  readonly sessions: ReadonlyArray<SimulationSessionRecord>
  readonly eligibleResumableSessionIds: ReadonlySet<string>
}

const portableSessionWithoutDeviceClaim = (
  session: SimulationSessionRecord
): SimulationSessionRecord => {
  const { packClaim: _sourceDeviceClaim, ...portable } = session
  return decodePortableSimulationSession(new SimulationSessionRecord({
    ...portable,
    schemaVersion: 1
  }))
}

const destinationPackForSession = (
  session: SimulationSessionRecord,
  packs: ReadonlyArray<OfflinePackRecord>,
  expectedContentFingerprint?: string
): OfflinePackRecord | undefined => {
  const sourceContentFingerprint = expectedContentFingerprint ??
    session.packClaim?.contentFingerprint
  const allowedStatuses = new Set<OfflinePackRecord["status"]>(["active", "retained"])
  const ordered = [...packs]
    .filter((pack) => allowedStatuses.has(pack.status))
    .sort((left, right) => {
      const status = (left.status === "active" ? 0 : 1) -
        (right.status === "active" ? 0 : 1)
      return status || left.id.localeCompare(right.id)
    })
  return ordered.find((pack) => {
    if (
      sourceContentFingerprint !== undefined &&
      pack.contentFingerprint !== sourceContentFingerprint
    ) return false
    const claim = simulationPackClaimForRecord(pack)
    try {
      assertOfflinePackSupportsSimulationSession(pack, claim, session, allowedStatuses)
      return true
    } catch {
      return false
    }
  })
}

export const rebindPortableSimulationSessions = (
  unsafeSessions: ReadonlyArray<unknown>,
  unsafePacks: ReadonlyArray<unknown>,
  expectedContentFingerprintBySessionId: ReadonlyMap<string, string> = new Map()
): PortableSimulationRebindResult => {
  const sessions = unsafeSessions.map(decodePortableSimulationSession)
  const packs = unsafePacks.map(decodeOfflinePackRecord)
  const eligibleResumableSessionIds = new Set<string>()
  const rebound = sessions.map((session) => {
    if (session.status === "evaluated") return session
    const pack = destinationPackForSession(
      session,
      packs,
      expectedContentFingerprintBySessionId.get(session.id)
    )
    if (pack === undefined) return portableSessionWithoutDeviceClaim(session)
    eligibleResumableSessionIds.add(session.id)
    return decodePortableSimulationSession(new SimulationSessionRecord({
      ...session,
      schemaVersion: 2,
      packClaim: simulationPackClaimForRecord(pack)
    }))
  })
  return { sessions: rebound, eligibleResumableSessionIds }
}

const rebindTransferForDestination = async (
  transfer: NormalizedDataTransfer,
  unsafePacks: ReadonlyArray<unknown>,
  sha256: (value: string) => Promise<string>
): Promise<{
  readonly transfer: NormalizedDataTransfer
  readonly eligibleResumableSessionIds: ReadonlySet<string>
}> => {
  const rebound = rebindPortableSimulationSessions(
    transfer.payload.simulationSessions,
    unsafePacks
  )
  const payload = await validatePayload(new TransferPayload({
    ...transfer.payload,
    simulationSessions: rebound.sessions
  }))
  return {
    transfer: {
      ...transfer,
      normalizedChecksum: await sha256(canonicalJson(payload)),
      payload
    },
    eligibleResumableSessionIds: rebound.eligibleResumableSessionIds
  }
}

const candidatesFor = (
  payload: TransferPayload,
  registry: TrustedReleaseContentRegistry,
  eligibleResumableSessionIds?: ReadonlySet<string>
): ReadonlyArray<ImportCandidateInput> => [
  ...payload.questionAttempts.map((record) => ({
    store: appDatabaseStores.questionAttempts,
    record,
    trustedReference: trustedQuestionAttempt(registry, record)
  })),
  ...payload.hazardAttempts.map((record) => ({
    store: appDatabaseStores.hazardAttempts,
    record,
    trustedReference: trustedHazardAttempt(registry, record)
  })),
  ...payload.reviewAcknowledgements.map((record) => ({
    store: appDatabaseStores.reviewAcknowledgements,
    record,
    trustedReference: true
  })),
  ...payload.preferences.map((record) => ({
    store: appDatabaseStores.preferences,
    record,
    trustedReference: true
  })),
  ...payload.correctionDrafts.map((record) => ({
    store: appDatabaseStores.correctionDrafts,
    record,
    trustedReference: true
  })),
  ...payload.simulationSessions.map((record) => ({
    store: appDatabaseStores.simulationSessions,
    record,
    trustedReference: trustedSimulation(registry, record) &&
      (record.status === "evaluated" || eligibleResumableSessionIds?.has(record.id) === true)
  })),
  ...payload.simulationSubmissions.map((record) => ({
    store: appDatabaseStores.simulationSubmissions,
    record,
    trustedReference: true
  })),
  ...payload.printJobs.map((record) => ({
    store: appDatabaseStores.printJobs,
    record,
    trustedReference: trustedPrintJob(registry, record)
  }))
]

const candidateKey = (candidate: Pick<ImportCandidateInput, "store" | "record">): string =>
  `${candidate.store}:${encodeURIComponent(candidate.record.id)}`

const assertUniqueCandidates = (incoming: ReadonlyArray<ImportCandidateInput>): void => {
  const keys = incoming.map(candidateKey)
  if (new Set(keys).size !== keys.length) {
    throw new Error("Import contains duplicate record IDs within one store")
  }
}

type AttemptRecord = QuestionAttemptRecord | HazardAttemptRecord

const isAttemptStore = (store: string): boolean =>
  store === appDatabaseStores.questionAttempts || store === appDatabaseStores.hazardAttempts

const attemptItemId = (record: AttemptRecord): string =>
  "questionId" in record ? record.questionId : record.sceneId

const decodeDestination = (
  destination: Readonly<Record<string, ReadonlyArray<unknown>>>
): Readonly<Record<string, ReadonlyArray<TransferRecord>>> => {
  const simulationSessions = decodeRecords(
    decodePortableSimulationSession,
    destination[appDatabaseStores.simulationSessions] ?? []
  )
  const sessionById = new Map(simulationSessions.map((session) => [session.id, session] as const))
  const simulationSubmissions = (destination[appDatabaseStores.simulationSubmissions] ?? [])
    .map((value) => {
      const decoded = Schema.decodeUnknownSync(
        SimulationSubmissionRecord,
        { onExcessProperty: "error" }
      )(value)
      const session = sessionById.get(decoded.sessionId)
      if (session === undefined) {
        throw new Error(`Destination submission ${decoded.id} has no session closure`)
      }
      return decodePortableSimulationSubmission(session, decoded)
    })
  const submissionBySessionId = new Map(
    simulationSubmissions.map((submission) => [submission.sessionId, submission] as const)
  )
  if (submissionBySessionId.size !== simulationSubmissions.length) {
    throw new Error("Destination has multiple submissions for one simulation")
  }
  for (const session of simulationSessions) {
    assertSessionSubmissionState(session, submissionBySessionId.get(session.id))
  }
  return {
    [appDatabaseStores.questionAttempts]: decodeRecords(
      decodeStoredQuestionAttempt,
      destination[appDatabaseStores.questionAttempts] ?? []
    ),
    [appDatabaseStores.hazardAttempts]: decodeRecords(
      decodeStoredHazardAttempt,
      destination[appDatabaseStores.hazardAttempts] ?? []
    ),
    [appDatabaseStores.reviewAcknowledgements]: decodeRecords(
      decodeStoredReviewAcknowledgement,
      destination[appDatabaseStores.reviewAcknowledgements] ?? []
    ),
    [appDatabaseStores.preferences]: decodeRecords(
      decodeStoredSitePreferences,
      destination[appDatabaseStores.preferences] ?? []
    ),
    [appDatabaseStores.correctionDrafts]: decodeRecords(
      decodeStoredCorrectionDraft,
      destination[appDatabaseStores.correctionDrafts] ?? []
    ),
    [appDatabaseStores.simulationSessions]: simulationSessions,
    [appDatabaseStores.simulationSubmissions]: simulationSubmissions,
    [appDatabaseStores.printJobs]: decodeRecords(
      decodePortablePrintJob,
      destination[appDatabaseStores.printJobs] ?? []
    )
  }
}

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

export const dependentClosureDecision = (
  decisions: ReadonlyArray<ImportDecision>
): ImportDecision | undefined => decisions.includes("unknown-reference")
  ? "unknown-reference"
  : decisions.includes("conflict")
    ? "conflict"
    : undefined

export const classifyImportCandidates = (
  incoming: ReadonlyArray<ImportCandidateInput>,
  destination: Readonly<Record<string, ReadonlyArray<unknown>>>
): ReadonlyArray<ImportCandidate> => {
  assertUniqueCandidates(incoming)
  const decoded = decodeDestination(destination)
  const existingByStore: ReadonlyMap<string, ReadonlyMap<string, TransferRecord>> = new Map(
    transferStores.map((store) => [
      store,
      new Map((decoded[store] ?? []).map((record) => [record.id, record] as const))
    ])
  )
  const decisions = new Map<string, ImportDecision>()
  for (const candidate of incoming) {
    const existing = existingByStore.get(candidate.store)?.get(candidate.record.id)
    decisions.set(
      candidateKey(candidate),
      !candidate.trustedReference
        ? "unknown-reference"
        : existing === undefined
          ? "insert"
          : sameRecord(existing, candidate.record)
            ? "matched"
            : "conflict"
    )
  }

  const incomingAttempts = incoming
    .filter((candidate) => isAttemptStore(candidate.store))
    .map((candidate) => candidate.record as AttemptRecord)
  const incomingAttemptById = uniqueAttemptsById(incomingAttempts, "Import")
  const destinationAttemptById = uniqueAttemptsById([
    ...(decoded[appDatabaseStores.questionAttempts] ?? []) as ReadonlyArray<QuestionAttemptRecord>,
    ...(decoded[appDatabaseStores.hazardAttempts] ?? []) as ReadonlyArray<HazardAttemptRecord>
  ], "Destination")

  for (const candidate of incoming.filter((entry) =>
    entry.store === appDatabaseStores.reviewAcknowledgements
  )) {
    const acknowledgement = candidate.record as ReviewAcknowledgementRecord
    const incomingParent = incomingAttemptById.get(acknowledgement.attemptId)
    const incomingParentDecision = incoming.find((entry) =>
      isAttemptStore(entry.store) && entry.record.id === acknowledgement.attemptId
    )
    const parentDecision = incomingParentDecision === undefined
      ? undefined
      : decisions.get(candidateKey(incomingParentDecision))
    const parent = incomingParent === undefined
      ? destinationAttemptById.get(acknowledgement.attemptId)
      : parentDecision === "insert" || parentDecision === "matched"
        ? incomingParent
        : undefined
    if (parent === undefined || attemptItemId(parent) !== acknowledgement.itemId) {
      decisions.set(candidateKey(candidate), "unknown-reference")
    }
  }

  const incomingSessions = incoming.filter((candidate) =>
    candidate.store === appDatabaseStores.simulationSessions
  ) as ReadonlyArray<ImportCandidateInput & { readonly record: SimulationSessionRecord }>
  for (const sessionCandidate of incomingSessions) {
    const submissionCandidate = incoming.find((candidate) =>
      candidate.store === appDatabaseStores.simulationSubmissions &&
      (candidate.record as SimulationSubmissionRecord).sessionId === sessionCandidate.record.id
    )
    const closureCandidates = submissionCandidate === undefined
      ? [sessionCandidate]
      : [sessionCandidate, submissionCandidate]
    const closureDecisions = closureCandidates.map((candidate) =>
      decisions.get(candidateKey(candidate)) as ImportDecision
    )
    const propagated = dependentClosureDecision(closureDecisions)
    if (propagated !== undefined) {
      for (const candidate of closureCandidates) decisions.set(candidateKey(candidate), propagated)
    }
  }

  return incoming.map((candidate) => ({
    ...candidate,
    decision: decisions.get(candidateKey(candidate)) ?? "unknown-reference"
  }))
}

const previewFor = (
  transfer: NormalizedDataTransfer,
  candidates: ReadonlyArray<ImportCandidate>
): ImportPreview => {
  const byStore = [...new Set(candidates.map((candidate) => candidate.store))].map((store) => ({
    store,
    records: candidates.filter((candidate) => candidate.store === store).length
  }))
  return {
    checksum: transfer.sourceChecksum,
    exportedAt: transfer.payload.exportedAt,
    includesCorrectionDrafts: transfer.payload.includesCorrectionDrafts,
    insert: candidates.filter((candidate) => candidate.decision === "insert").length,
    matched: candidates.filter((candidate) => candidate.decision === "matched").length,
    conflicts: candidates.filter((candidate) => candidate.decision === "conflict").length,
    unknownReferences: candidates.filter((candidate) =>
      candidate.decision === "unknown-reference"
    ).length,
    byStore
  }
}

const importPlanSealInput = (plan: Omit<ImportPlan, "seal">): unknown => ({
  planVersion: plan.planVersion,
  sourceSchemaVersion: plan.sourceSchemaVersion,
  sourceChecksum: plan.sourceChecksum,
  normalizedChecksum: plan.normalizedChecksum,
  registryChecksum: plan.registryChecksum,
  resumableContentPins: plan.resumableContentPins,
  payload: plan.payload,
  preview: plan.preview
})

const deepFreeze = <A>(value: A): A => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child)
    Object.freeze(value)
  }
  return value
}

const registryChecksum = (
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string>
): Promise<string> => sha256(canonicalTrustedReleaseContentRegistryJson(registry))

export const previewDataImport = async (
  database: IDBDatabase,
  text: string,
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<ImportPlan> => {
  const decodedTransfer = await normalizeDataTransfer(text, sha256)
  const destination = await readStores(database, importReadStores)
  const rebound = await rebindTransferForDestination(
    decodedTransfer,
    destination[appDatabaseStores.offlinePacks] ?? [],
    sha256
  )
  const incoming = candidatesFor(
    rebound.transfer.payload,
    registry,
    rebound.eligibleResumableSessionIds
  )
  assertUniqueCandidates(incoming)
  const preview = previewFor(
    rebound.transfer,
    classifyImportCandidates(incoming, destination)
  )
  const sourceContentPins = decodedTransfer.payload.simulationSessions.flatMap((session) =>
    session.status !== "evaluated" && session.packClaim !== undefined
      ? [{ sessionId: session.id, contentFingerprint: session.packClaim.contentFingerprint }]
      : []
  )
  return sealDataImportPlan(
    rebound.transfer,
    preview,
    registry,
    sha256,
    sourceContentPins
  )
}

export const sealDataImportPlan = async (
  transfer: NormalizedDataTransfer,
  preview: ImportPreview,
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string> = browserSha256,
  resumableContentPins: ReadonlyArray<{
    readonly sessionId: string
    readonly contentFingerprint: string
  }> = transfer.payload.simulationSessions.flatMap((session) =>
    session.status !== "evaluated" && session.packClaim !== undefined
      ? [{ sessionId: session.id, contentFingerprint: session.packClaim.contentFingerprint }]
      : []
  )
): Promise<ImportPlan> => {
  const unsealed = {
    planVersion: 1 as const,
    sourceSchemaVersion: transfer.sourceSchemaVersion,
    sourceChecksum: transfer.sourceChecksum,
    normalizedChecksum: transfer.normalizedChecksum,
    registryChecksum: await registryChecksum(registry, sha256),
    resumableContentPins: [...resumableContentPins].sort((left, right) =>
      left.sessionId.localeCompare(right.sessionId)
    ),
    payload: transfer.payload,
    preview
  }
  const plan = Schema.decodeUnknownSync(
    ImportPlanSchema,
    { onExcessProperty: "error" }
  )({
    ...unsealed,
    seal: await sha256(canonicalJson(importPlanSealInput(unsealed)))
  })
  return deepFreeze(plan)
}

const revalidateImportPlan = async (
  unsafePlan: ImportPlan,
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string>
): Promise<ImportPlan> => {
  const plan = Schema.decodeUnknownSync(
    ImportPlanSchema,
    { onExcessProperty: "error" }
  )(unsafePlan)
  const payload = await validatePayload(plan.payload)
  const pinBySessionId = new Map(
    plan.resumableContentPins.map((pin) => [pin.sessionId, pin.contentFingerprint] as const)
  )
  if (pinBySessionId.size !== plan.resumableContentPins.length) {
    throw new Error("Import plan repeats a resumable content pin")
  }
  const sessionById = new Map(payload.simulationSessions.map((session) => [session.id, session]))
  for (const [sessionId, contentFingerprint] of pinBySessionId) {
    const session = sessionById.get(sessionId)
    if (
      session === undefined ||
      session.status === "evaluated" ||
      (session.packClaim !== undefined &&
        session.packClaim.contentFingerprint !== contentFingerprint)
    ) {
      throw new Error("Import plan has a content pin outside its resumable simulation closure")
    }
  }
  const currentRegistryChecksum = await registryChecksum(registry, sha256)
  if (currentRegistryChecksum !== plan.registryChecksum) {
    throw new Error("Import plan was created for a different trusted release registry")
  }
  if (await sha256(canonicalJson(payload)) !== plan.normalizedChecksum) {
    throw new Error("Import plan payload no longer matches its normalized checksum")
  }
  const unsealed = {
    planVersion: plan.planVersion,
    sourceSchemaVersion: plan.sourceSchemaVersion,
    sourceChecksum: plan.sourceChecksum,
    normalizedChecksum: plan.normalizedChecksum,
    registryChecksum: plan.registryChecksum,
    resumableContentPins: plan.resumableContentPins,
    payload,
    preview: plan.preview
  }
  if (await sha256(canonicalJson(importPlanSealInput(unsealed))) !== plan.seal) {
    throw new Error("Import plan seal is invalid; create a new preview")
  }
  if (
    plan.preview.checksum !== plan.sourceChecksum ||
    plan.preview.exportedAt !== payload.exportedAt ||
    plan.preview.includesCorrectionDrafts !== payload.includesCorrectionDrafts
  ) {
    throw new Error("Import plan preview is outside its payload closure")
  }
  assertUniqueCandidates(candidatesFor(payload, registry))
  return { ...plan, payload }
}

export const preflightDataImportPlan = async (
  plan: ImportPlan,
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<ImportPlan> => deepFreeze(await revalidateImportPlan(plan, registry, sha256))

const quarantineId = (checksum: string, store: string, recordId: string): string =>
  ["import", checksum, store, recordId].map(encodeURIComponent).join(":")

const applyClassifiedImport = (
  database: IDBDatabase,
  plan: ImportPlan,
  registry: TrustedReleaseContentRegistry
): Promise<ImportResult> => new Promise((resolve, reject) => {
  const writableStores = [
    ...importReadStores,
    appDatabaseStores.transferQuarantine
  ]
  const transaction = database.transaction(writableStores, "readwrite")
  const quarantine = transaction.objectStore(appDatabaseStores.transferQuarantine)
  const destinationRequests = Object.fromEntries(
    importReadStores.map((store) => [store, transaction.objectStore(store).getAll()])
  ) as Readonly<Record<string, IDBRequest<unknown[]>>>
  let imported = 0
  let matched = 0
  let quarantined = 0
  let classified = false

  const prepare = () => {
    if (
      classified ||
      importReadStores.some((store) => destinationRequests[store]?.readyState !== "done")
    ) return
    classified = true
    try {
      const destination = Object.fromEntries(
        importReadStores.map((store) => [store, destinationRequests[store]?.result ?? []])
      )
      const rebound = rebindPortableSimulationSessions(
        plan.payload.simulationSessions,
        destination[appDatabaseStores.offlinePacks] ?? [],
        new Map(plan.resumableContentPins.map((pin) => [
          pin.sessionId,
          pin.contentFingerprint
        ] as const))
      )
      const payload = new TransferPayload({
        ...plan.payload,
        simulationSessions: rebound.sessions
      })
      const incoming = candidatesFor(
        payload,
        registry,
        rebound.eligibleResumableSessionIds
      )
      const candidates = classifyImportCandidates(incoming, destination)
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
          id: quarantineId(plan.sourceChecksum, candidate.store, candidate.record.id),
          source: "portable-import",
          sourceChecksum: plan.sourceChecksum,
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

export const applyDataImport = async (
  database: IDBDatabase,
  plan: ImportPlan,
  registry: TrustedReleaseContentRegistry,
  sha256: (value: string) => Promise<string> = browserSha256
): Promise<ImportResult> => {
  // All schema, semantic, registry, and cryptographic work completes before
  // opening the one read-write transaction that reclassifies destination drift.
  const validated = await revalidateImportPlan(plan, registry, sha256)
  return applyClassifiedImport(database, validated, registry)
}

export const dataTransferLive = Layer.effect(
  DataTransfer,
  Effect.gen(function*() {
    const settings = yield* SettingsPersistence
    const connection = settings.connection.pipe(
      Effect.mapError((cause) => error("connection", cause))
    )
    return DataTransfer.of({
      applyImport: (plan, registry) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => applyDataImport(database, plan, registry),
          catch: (cause) => error("apply-import", cause)
        }))
      ),
      createExport: (includeCorrectionDrafts) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => createDataExport(database, includeCorrectionDrafts),
          catch: (cause) => error("create-export", cause)
        }))
      ),
      previewImport: (text, registry) => connection.pipe(
        Effect.flatMap((database) => Effect.tryPromise({
          try: () => previewDataImport(database, text, registry),
          catch: (cause) => error("preview-import", cause)
        }))
      )
    })
  })
)

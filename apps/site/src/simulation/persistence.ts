import {
  PostcommitScene,
  ReleasedPostcommitQuestion
} from "@nycustodian/content/model"
import { Clock, Context, Effect, Layer, Schema } from "effect"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import {
  SimulationSessionRecord,
  SimulationSubmissionRecord,
  decodeSimulationSessionRecordShape,
  decodeSimulationTimestamp,
  simulationItemId,
  simulationSubmissionId,
  type SimulationPinnedItem,
  type SimulationResponse,
  type SimulationResult,
  type SimulationSubmittedAnswer
} from "./model.ts"
import {
  decodeOfflinePackGenerationClaim,
  decodeOfflinePackRecord,
  decodeOfflinePackRetirementRecord,
  offlinePackRetirementId,
  type OfflinePackGenerationClaim,
  type OfflinePackRecord
} from "../offline-packs/model.ts"
import {
  evaluateHazardAnswer,
  hasValidQuestionPostcommitClosure
} from "./generation.ts"
import {
  decodeCanonicalBase64,
  decodeRetainedImage,
  sameAssetReceipt,
  sha256Bytes,
  validateRetainedImage
} from "../retained-image.ts"

export class SimulationPersistenceError extends Schema.TaggedError<SimulationPersistenceError>()(
  "SimulationPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export interface SaveSimulationResponseInput {
  readonly sessionId: string
  readonly questionId: string
  readonly selectedOptionId: string | null
  readonly markers?: ReadonlyArray<{ readonly id: string; readonly x: number; readonly y: number }>
  readonly selectedZoneOrders?: ReadonlyArray<number>
  readonly zeroHazardsConfirmed?: boolean
  readonly reviewIntent: "unflagged" | "flagged"
}

export interface CompleteSimulationInput {
  readonly sessionId: string
  readonly correctCount: number
  readonly results: ReadonlyArray<SimulationResult>
}

export class SimulationPersistence extends Context.Service<
  SimulationPersistence,
  {
    readonly createSession: (
      session: SimulationSessionRecord
    ) => Effect.Effect<SimulationSessionRecord, SimulationPersistenceError>
    readonly findSession: (
      sessionId: string
    ) => Effect.Effect<SimulationSessionRecord | undefined, SimulationPersistenceError>
    readonly saveResponse: (
      input: SaveSimulationResponseInput
    ) => Effect.Effect<SimulationSessionRecord, SimulationPersistenceError>
    readonly setPosition: (
      sessionId: string,
      position: number
    ) => Effect.Effect<SimulationSessionRecord, SimulationPersistenceError>
    readonly setTimerVisibility: (
      sessionId: string,
      timerVisible: boolean
    ) => Effect.Effect<SimulationSessionRecord, SimulationPersistenceError>
    readonly submit: (
      sessionId: string
    ) => Effect.Effect<SimulationSubmissionRecord, SimulationPersistenceError>
    readonly findSubmission: (
      sessionId: string
    ) => Effect.Effect<SimulationSubmissionRecord | undefined, SimulationPersistenceError>
    readonly complete: (
      input: CompleteSimulationInput
    ) => Effect.Effect<SimulationSubmissionRecord, SimulationPersistenceError>
  }
>()("@nycustodian/site/SimulationPersistence") {}

const sessionsStore = appDatabaseStores.simulationSessions
const submissionsStore = appDatabaseStores.simulationSubmissions

const persistenceError = (operation: string, cause: unknown): SimulationPersistenceError =>
  new SimulationPersistenceError({
    operation,
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "The local simulation operation failed",
    cause
  })

const databasePersistenceError = (cause: AppDatabaseError): SimulationPersistenceError =>
  new SimulationPersistenceError({
    operation: cause.operation,
    detail: cause.detail,
    cause
  })

const requestValue = <A>(request: IDBRequest<A>): Promise<A> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const transactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error("Simulation transaction aborted"))
  })

export const monotonicSimulationTimestamp = (
  wallClock: number,
  ...durableLowerBounds: ReadonlyArray<number>
): number => Math.max(
  decodeSimulationTimestamp(wallClock),
  ...durableLowerBounds.map(decodeSimulationTimestamp)
)

const validateResponseForItem = (
  item: SimulationPinnedItem,
  response: SimulationResponse | SimulationSubmittedAnswer
): void => {
  const markers = response.markers ?? []
  const selectedZoneOrders = response.selectedZoneOrders ?? []
  const zeroHazardsConfirmed = response.zeroHazardsConfirmed ?? false
  if (
    markers.length > 64 ||
    new Set(markers.map((marker) => marker.id)).size !== markers.length ||
    new Set(selectedZoneOrders).size !== selectedZoneOrders.length
  ) {
    throw new Error(`Saved response ${response.questionId} repeats a hazard coordinate`)
  }
  if ("question" in item) {
    if (
      (response.selectedOptionId !== null && !item.optionOrder.includes(response.selectedOptionId)) ||
      markers.length > 0 ||
      selectedZoneOrders.length > 0 ||
      zeroHazardsConfirmed
    ) {
      throw new Error(`Saved response ${response.questionId} is outside the question closure`)
    }
    return
  }
  const allowedZoneOrders = item.scene.neutralPreAnswer.zones.map((zone) => zone.order)
  const selectedCount = item.mode === "visual" ? markers.length : selectedZoneOrders.length
  if (
    response.selectedOptionId !== null ||
    (item.mode === "visual" && selectedZoneOrders.length > 0) ||
    (item.mode === "nonvisual" && markers.length > 0) ||
    selectedZoneOrders.some((order) => !allowedZoneOrders.includes(order)) ||
    zeroHazardsConfirmed && selectedCount > 0
  ) {
    throw new Error(`Saved response ${response.questionId} is outside the hazard closure`)
  }
}

export const validateSimulationSession = (value: unknown): SimulationSessionRecord => {
  const session = decodeSimulationSessionRecordShape(value)
  if (session.updatedAt < session.createdAt) {
    throw new Error("Session update time precedes its durable creation time")
  }
  const itemIds = session.items.map(simulationItemId)
  if (new Set(itemIds).size !== itemIds.length) throw new Error("Session repeats a pinned item")
  if (session.items.some((item, index) => item.position !== index + 1)) {
    throw new Error("Session positions are not contiguous")
  }
  if (session.actualLength !== session.items.length || session.advertisedLength !== session.items.length) {
    throw new Error("Session length does not match its pinned items")
  }
  const expectedDistribution = [...session.items.reduce((counts, item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    return counts
  }, new Map<string, number>())]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({ label, count }))
  if (JSON.stringify(session.distribution) !== JSON.stringify(expectedDistribution)) {
    throw new Error("Session distribution does not match its pinned item closure")
  }
  if (session.currentPosition < 1 || session.currentPosition > session.actualLength) {
    throw new Error("Session position is outside its pinned item closure")
  }
  if (
    session.selectedCategories.length === 0 ||
    JSON.stringify(session.selectedCategories) !==
      JSON.stringify([...session.selectedCategories].sort()) ||
    session.items.some((item) => !session.selectedCategories.includes(item.category))
  ) {
    throw new Error("Session items are outside the selected content mix")
  }
  if (
    (session.timing.mode === "untimed" &&
      (session.timing.durationSeconds !== null || session.timing.timerVisible || session.timing.autoSubmit)) ||
    (session.timing.mode === "timed" && session.timing.durationSeconds === null) ||
    (session.timing.durationSeconds !== null &&
      !Number.isSafeInteger(session.createdAt + session.timing.durationSeconds * 1_000))
  ) {
    throw new Error("Session timing settings are inconsistent")
  }
  for (const item of session.items) {
    const itemId = simulationItemId(item)
    const sharedReceiptMismatch = !item.profileIds.includes(session.profile.id) ||
      item.receipt.releaseId !== session.releaseId ||
      item.receipt.packVersion !== session.packVersion ||
      item.receipt.sessionId !== session.id ||
      item.receipt.position !== item.position
    if ("question" in item) {
      const optionIds = item.question.options.map((option) => option.id)
      if (
        session.format !== "questions" ||
        sharedReceiptMismatch ||
        item.receipt.questionId !== item.question.id ||
        !item.receipt.postcommitPath.endsWith(`/${item.question.id}.postcommit.json`) ||
        item.optionOrder.length !== optionIds.length ||
        item.optionOrder.some((id) => !optionIds.includes(id))
      ) {
        throw new Error(`Session item ${itemId} is outside its receipt or option closure`)
      }
    } else {
      const webDerivatives = item.scene.asset.derivatives.filter((derivative) => derivative.kind === "web")
      const webDerivative = webDerivatives.length === 1 ? webDerivatives[0] : undefined
      const visualAssetMismatch = item.mode === "visual"
        ? item.visualAsset === null ||
          webDerivative === undefined ||
          item.visualAsset.path !== `/${webDerivative.path}` ||
          item.visualAsset.bytes !== webDerivative.bytes ||
          item.visualAsset.sha256 !== webDerivative.sha256
        : item.visualAsset !== null
      if (
        session.format !== `${item.mode}-hazards` ||
        sharedReceiptMismatch ||
        item.receipt.sceneId !== item.scene.id ||
        !item.receipt.postcommitPath.endsWith(`/${item.scene.id}.postcommit.json`) ||
        item.receipt.mode !== item.mode ||
        item.receipt.assetRevision !== item.scene.asset.revision ||
        item.receipt.assetMasterSha256 !== item.scene.asset.masterSha256 ||
        visualAssetMismatch
      ) {
        throw new Error(`Session hazard ${itemId} is outside its receipt or asset closure`)
      }
    }
  }
  if (new Set(session.responses.map((response) => response.questionId)).size !== session.responses.length) {
    throw new Error("Session repeats a saved response")
  }
  for (const response of session.responses) {
    const item = session.items.find((candidate) => simulationItemId(candidate) === response.questionId)
    if (item === undefined) {
      throw new Error(`Saved response ${response.questionId} is outside the session closure`)
    }
    validateResponseForItem(item, response)
    if (response.updatedAt < session.createdAt || response.updatedAt > session.updatedAt) {
      throw new Error(`Saved response ${response.questionId} is outside the session time closure`)
    }
  }
  return session
}

const decodeBoundPostcommitBytes = (
  item: SimulationPinnedItem,
  result: SimulationResult
): Uint8Array => {
  const bytes = decodeCanonicalBase64(result.postcommitBase64)
  if (bytes.byteLength !== item.receipt.postcommitBytes) {
    throw new Error("Evaluated simulation feedback bytes do not match their pinned receipt")
  }
  const unknownPayload = JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  ) as unknown
  if ("question" in item) {
    if (result.kind !== "question") {
      throw new Error("Evaluated question feedback does not match its pinned receipt")
    }
    const payload = Schema.decodeUnknownSync(
      ReleasedPostcommitQuestion,
      { onExcessProperty: "error" }
    )(unknownPayload)
    if (JSON.stringify(payload) !== JSON.stringify(result.postcommit)) {
      throw new Error("Evaluated question feedback payload does not match its retained bytes")
    }
  } else {
    if (result.kind !== "hazard") {
      throw new Error("Evaluated hazard feedback does not match its pinned receipt")
    }
    const payload = Schema.decodeUnknownSync(PostcommitScene)(unknownPayload)
    if (JSON.stringify(payload) !== JSON.stringify(result.postcommit)) {
      throw new Error("Evaluated hazard feedback payload does not match its retained bytes")
    }
  }
  return bytes
}

const validateSimulationResultArtifactsIntegrity = async (
  session: SimulationSessionRecord,
  results: ReadonlyArray<SimulationResult>
): Promise<void> => {
  await Promise.all(results.map(async (result, index) => {
    const item = session.items[index]
    if (item === undefined) {
      throw new Error("Evaluated simulation feedback is outside its pinned receipt closure")
    }
    const bytes = decodeBoundPostcommitBytes(item, result)
    if (await sha256Bytes(bytes) !== item.receipt.postcommitSha256) {
      throw new Error("Evaluated simulation feedback digest does not match its pinned receipt")
    }
    if (result.kind === "hazard" && result.retainedVisualAsset !== null) {
      await validateRetainedImage(result.retainedVisualAsset)
    }
  }))
}

export const validateSimulationSubmission = (
  session: SimulationSessionRecord,
  value: unknown
): SimulationSubmissionRecord => {
  const submission = Schema.decodeUnknownSync(
    SimulationSubmissionRecord,
    { onExcessProperty: "error" }
  )(value)
  if (
    submission.id !== simulationSubmissionId(session.id) ||
    submission.sessionId !== session.id ||
    submission.submittedAt < session.createdAt ||
    submission.answers.length !== session.actualLength
  ) {
    throw new Error("Simulation submission identity is outside its session closure")
  }
  for (const [index, answer] of submission.answers.entries()) {
    const item = session.items[index]
    if (
      item === undefined ||
      answer.questionId !== simulationItemId(item)
    ) {
      throw new Error("Simulation submission answers are outside the ordered session closure")
    }
    validateResponseForItem(item, answer)
  }
  if (submission.status === "submitted") {
    if (
      submission.submittedAt < session.updatedAt ||
      submission.evaluatedAt !== undefined ||
      submission.results !== undefined ||
      submission.correctCount !== undefined
    ) {
      throw new Error("An unevaluated simulation submission has invalid time or contains result material")
    }
    return submission
  }
  if (
    submission.evaluatedAt === undefined ||
    submission.evaluatedAt < submission.submittedAt ||
    submission.evaluatedAt < session.updatedAt ||
    submission.results === undefined ||
    submission.correctCount === undefined ||
    submission.results.length !== session.actualLength
  ) {
    throw new Error("Evaluated simulation results are incomplete")
  }
  let countedCorrect = 0
  for (const [index, result] of submission.results.entries()) {
    const item = session.items[index]
    const answer = submission.answers[index]
    if (item === undefined || answer === undefined || result.questionId !== simulationItemId(item)) {
      throw new Error("Evaluated simulation results are outside the submitted answer closure")
    }
    decodeBoundPostcommitBytes(item, result)
    if ("question" in item) {
      if (
        result.kind !== "question" ||
        result.selectedOptionId !== answer.selectedOptionId ||
        !hasValidQuestionPostcommitClosure(item, result.postcommit) ||
        result.correctOptionId !== result.postcommit.correctOptionId ||
        result.category !== item.category ||
        result.correct !== (result.selectedOptionId === result.correctOptionId)
      ) {
        throw new Error("Evaluated question results are outside the submitted answer closure")
      }
    } else {
      if (result.kind !== "hazard") {
        throw new Error("Evaluated hazard results are outside the submitted response closure")
      }
      if (
        item.mode === "visual"
          ? item.visualAsset === null ||
            result.retainedVisualAsset === null ||
            !sameAssetReceipt(result.retainedVisualAsset.receipt, item.visualAsset)
          : result.retainedVisualAsset !== null
      ) {
        throw new Error("Evaluated hazard image is outside the submitted visual asset closure")
      }
      if (result.retainedVisualAsset !== null) decodeRetainedImage(result.retainedVisualAsset)
      let expected: ReturnType<typeof evaluateHazardAnswer>
      try {
        expected = evaluateHazardAnswer(item, answer, result.postcommit)
      } catch {
        throw new Error("Evaluated hazard results contain invalid self-contained feedback")
      }
      if (
        result.mode !== expected.mode ||
        result.category !== expected.category ||
        result.hazardFamily !== expected.hazardFamily ||
        result.answered !== expected.answered ||
        result.correct !== expected.correct ||
        result.targetCount !== expected.targetCount ||
        result.hitCount !== expected.hitCount ||
        result.missedCount !== expected.missedCount ||
        result.decoyFalsePositiveCount !== expected.decoyFalsePositiveCount ||
        result.falsePositiveCount !== expected.falsePositiveCount ||
        result.duplicateCount !== expected.duplicateCount
      ) {
        throw new Error("Evaluated hazard results are outside the submitted response closure")
      }
    }
    if (result.correct) countedCorrect += 1
  }
  if (submission.correctCount !== countedCorrect) {
    throw new Error("Evaluated simulation score does not match its result closure")
  }
  return submission
}

export const validateSimulationSubmissionIntegrity = async (
  session: SimulationSessionRecord,
  value: unknown
): Promise<SimulationSubmissionRecord> => {
  const submission = validateSimulationSubmission(session, value)
  if (submission.results !== undefined) {
    await validateSimulationResultArtifactsIntegrity(session, submission.results)
  }
  return submission
}

export const updateSimulationPosition = (
  session: SimulationSessionRecord,
  position: number
): SimulationSessionRecord => {
  if (session.status !== "active") {
    throw new Error("Submitted simulation position cannot be edited")
  }
  if (!Number.isSafeInteger(position) || position < 1 || position > session.actualLength) {
    throw new Error("The requested position is outside the pinned session")
  }
  return new SimulationSessionRecord({ ...session, currentPosition: position })
}

const validateSessionSubmissionStatus = (
  session: SimulationSessionRecord,
  submission: SimulationSubmissionRecord
): void => {
  if (
    (session.status === "active") ||
    (session.status === "submitted" && submission.status !== "submitted") ||
    (session.status === "evaluated" && submission.status !== "evaluated") ||
    (session.status === "submitted" && session.updatedAt !== submission.submittedAt) ||
    (session.status === "evaluated" && session.updatedAt !== submission.evaluatedAt)
  ) {
    throw new Error("Simulation session and submission states disagree")
  }
}

const activePackMetaKeys = [
  "activatedAt",
  "claimId",
  "contentFingerprint",
  "generation",
  "id",
  "packId",
  "packVersion",
  "releaseId",
  "shellBuildFingerprint"
] as const

const decodeActivePackClaim = (value: unknown): OfflinePackGenerationClaim => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("The active offline-pack pointer is unavailable")
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  if (
    record.id !== "active-offline-pack" ||
    JSON.stringify(keys) !== JSON.stringify(activePackMetaKeys)
  ) {
    throw new Error("The active offline-pack pointer has an invalid durable shape")
  }
  decodeSimulationTimestamp(record.activatedAt)
  return decodeOfflinePackGenerationClaim({
    claimId: record.claimId,
    packId: record.packId,
    generation: record.generation,
    contentFingerprint: record.contentFingerprint,
    shellBuildFingerprint: record.shellBuildFingerprint,
    releaseId: record.releaseId,
    packVersion: record.packVersion
  })
}

export const simulationPackClaimForRecord = (
  pack: OfflinePackRecord
): OfflinePackGenerationClaim => decodeOfflinePackGenerationClaim({
  claimId: pack.id,
  packId: pack.packId,
  generation: pack.generation,
  contentFingerprint: pack.contentFingerprint,
  shellBuildFingerprint: pack.shellBuildFingerprint,
  releaseId: pack.descriptor.releaseId,
  packVersion: pack.descriptor.packVersion
})

const sameGenerationClaim = (
  left: OfflinePackGenerationClaim,
  right: OfflinePackGenerationClaim
): boolean =>
  left.claimId === right.claimId &&
  left.packId === right.packId &&
  left.generation === right.generation &&
  left.contentFingerprint === right.contentFingerprint &&
  left.shellBuildFingerprint === right.shellBuildFingerprint &&
  left.releaseId === right.releaseId &&
  left.packVersion === right.packVersion

export const assertOfflinePackSupportsSimulationSession = (
  pack: OfflinePackRecord,
  claim: OfflinePackGenerationClaim,
  session: SimulationSessionRecord,
  allowedStatuses: ReadonlySet<OfflinePackRecord["status"]>
): void => {
  if (
    !allowedStatuses.has(pack.status) ||
    !sameGenerationClaim(simulationPackClaimForRecord(pack), claim) ||
    claim.releaseId !== session.releaseId ||
    claim.packVersion !== session.packVersion ||
    !pack.descriptor.compatibility.some((compatibility) =>
      compatibility.profileId === session.profile.id &&
      compatibility.compatibilityKey === session.profile.compatibilityKey
    )
  ) {
    throw new Error("The exact offline-pack generation is not usable for this simulation")
  }
  const receipts = new Map(
    pack.descriptor.receipts.map((receipt) => [receipt.path, receipt])
  )
  for (const item of session.items) {
    const postcommit = receipts.get(item.receipt.postcommitPath)
    if (
      postcommit?.kind !== "artifact" ||
      postcommit.bytes !== item.receipt.postcommitBytes ||
      postcommit.sha256 !== item.receipt.postcommitSha256
    ) {
      throw new Error("The exact offline-pack generation does not close over every result receipt")
    }
    if (!("question" in item) && item.visualAsset !== null) {
      const asset = receipts.get(item.visualAsset.path)
      if (
        asset?.kind !== "asset" ||
        asset.bytes !== item.visualAsset.bytes ||
        asset.sha256 !== item.visualAsset.sha256
      ) {
        throw new Error("The exact offline-pack generation does not close over every scene asset")
      }
    }
  }
}

const readClaimedPack = async (
  transaction: IDBTransaction,
  claim: OfflinePackGenerationClaim,
  session: SimulationSessionRecord,
  allowedStatuses: ReadonlySet<OfflinePackRecord["status"]>
): Promise<OfflinePackRecord> => {
  const value = await requestValue(
    transaction.objectStore(appDatabaseStores.offlinePacks).get(claim.claimId)
  )
  if (value === undefined) {
    throw new Error("The exact offline-pack generation is no longer stored on this device")
  }
  const pack = decodeOfflinePackRecord(value)
  assertOfflinePackSupportsSimulationSession(pack, claim, session, allowedStatuses)
  return pack
}

const readActivePackClaim = async (
  transaction: IDBTransaction,
  session: SimulationSessionRecord
): Promise<OfflinePackGenerationClaim> => {
  const value = await requestValue(
    transaction.objectStore(appDatabaseStores.meta).get("active-offline-pack")
  )
  const claim = decodeActivePackClaim(value)
  const retirementValue = await requestValue(
    transaction.objectStore(appDatabaseStores.meta).get(
      offlinePackRetirementId(claim.packId)
    )
  )
  if (retirementValue !== undefined) {
    decodeOfflinePackRetirementRecord(retirementValue)
    throw new Error("The active offline-pack release has been retired for new sessions")
  }
  await readClaimedPack(transaction, claim, session, new Set(["active"]))
  return claim
}

const bindSimulationSession = (
  session: SimulationSessionRecord,
  claim: OfflinePackGenerationClaim
): SimulationSessionRecord => validateSimulationSession(new SimulationSessionRecord({
  ...session,
  schemaVersion: 2,
  packClaim: claim
}))

const requireResumablePackPin = (session: SimulationSessionRecord): void => {
  if (session.status !== "evaluated" && session.schemaVersion !== 2) {
    throw new Error("This legacy simulation must be rebound to an exact local pack before it can change")
  }
}

const createSession = Effect.fn("SimulationPersistence.createSession")(function*(
  database: IDBDatabase,
  session: SimulationSessionRecord
) {
  const validated = validateSimulationSession(session)
  return yield* Effect.tryPromise({
    try: async () => {
      const transaction = database.transaction([
        appDatabaseStores.meta,
        appDatabaseStores.offlinePacks,
        sessionsStore
      ], "readwrite")
      const claim = validated.packClaim ?? await readActivePackClaim(transaction, validated)
      if (validated.packClaim !== undefined) {
        const activeClaim = await readActivePackClaim(transaction, validated)
        if (!sameGenerationClaim(activeClaim, validated.packClaim)) {
          transaction.abort()
          throw new Error("The prepared simulation pack generation is no longer active")
        }
      }
      const candidate = bindSimulationSession(validated, claim)
      const store = transaction.objectStore(sessionsStore)
      const existingValue = await requestValue(store.get(candidate.id))
      if (existingValue !== undefined) {
        const existing = validateSimulationSession(existingValue)
        if (JSON.stringify(existing) !== JSON.stringify(candidate)) {
          transaction.abort()
          throw new Error("The simulation id already belongs to different immutable settings")
        }
        await transactionDone(transaction)
        return existing
      }
      store.add(candidate)
      await transactionDone(transaction)
      return candidate
    },
    catch: (cause) => persistenceError("create-session", cause)
  })
})

const findSession = Effect.fn("SimulationPersistence.findSession")(function*(
  database: IDBDatabase,
  sessionId: string
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const transaction = database.transaction([
        appDatabaseStores.meta,
        appDatabaseStores.offlinePacks,
        sessionsStore
      ], "readwrite")
      const store = transaction.objectStore(sessionsStore)
      const value = await requestValue(store.get(sessionId))
      if (value === undefined) {
        await transactionDone(transaction)
        return undefined
      }
      let session = validateSimulationSession(value)
      if (session.status !== "evaluated") {
        if (session.packClaim === undefined) {
          session = bindSimulationSession(
            session,
            await readActivePackClaim(transaction, session)
          )
          store.put(session)
        } else {
          await readClaimedPack(
            transaction,
            session.packClaim,
            session,
            new Set(["active", "retained"])
          )
        }
      }
      await transactionDone(transaction)
      return session
    },
    catch: (cause) => persistenceError("find-session", cause)
  })
})

const updateSession = Effect.fn("SimulationPersistence.updateSession")(function*(
  database: IDBDatabase,
  sessionId: string,
  updatedAt: number,
  update: (
    session: SimulationSessionRecord,
    effectiveUpdatedAt: number
  ) => SimulationSessionRecord
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const transaction = database.transaction(sessionsStore, "readwrite")
      const store = transaction.objectStore(sessionsStore)
      const value = await requestValue(store.get(sessionId))
      if (value === undefined) throw new Error("The local simulation session was not found")
      const existing = validateSimulationSession(value)
      requireResumablePackPin(existing)
      const effectiveUpdatedAt = monotonicSimulationTimestamp(
        updatedAt,
        existing.createdAt,
        existing.updatedAt
      )
      const next = validateSimulationSession(new SimulationSessionRecord({
        ...update(existing, effectiveUpdatedAt),
        updatedAt: effectiveUpdatedAt
      }))
      store.put(next)
      await transactionDone(transaction)
      return next
    },
    catch: (cause) => persistenceError("update-session", cause)
  })
})

const submit = Effect.fn("SimulationPersistence.submit")(function*(
  database: IDBDatabase,
  sessionId: string,
  submittedAt: number
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const transaction = database.transaction([sessionsStore, submissionsStore], "readwrite")
      const sessions = transaction.objectStore(sessionsStore)
      const submissions = transaction.objectStore(submissionsStore)
      const sessionValue = await requestValue(sessions.get(sessionId))
      if (sessionValue === undefined) throw new Error("The local simulation session was not found")
      const session = validateSimulationSession(sessionValue)
      requireResumablePackPin(session)
      const id = simulationSubmissionId(sessionId)
      const existingValue = await requestValue(submissions.get(id))
      if (existingValue !== undefined) {
        const existing = validateSimulationSubmission(session, existingValue)
        validateSessionSubmissionStatus(session, existing)
        await transactionDone(transaction)
        return existing
      }
      if (session.status !== "active") {
        transaction.abort()
        throw new Error("A submitted session has no matching durable final snapshot")
      }
      const effectiveSubmittedAt = monotonicSimulationTimestamp(
        submittedAt,
        session.createdAt,
        session.updatedAt
      )
      const responseByQuestion = new Map(
        session.responses.map((response) => [response.questionId, response])
      )
      const answerValues = session.items.map((item) => {
        const itemId = simulationItemId(item)
        const response = responseByQuestion.get(itemId)
        return {
          questionId: itemId,
          selectedOptionId: response?.selectedOptionId ?? null,
          markers: response?.markers ?? [],
          selectedZoneOrders: response?.selectedZoneOrders ?? [],
          zeroHazardsConfirmed: response?.zeroHazardsConfirmed ?? false,
          reviewIntent: response?.reviewIntent ?? "unflagged" as const
        }
      })
      const firstAnswer = answerValues[0]
      if (firstAnswer === undefined) throw new Error("A simulation submission cannot be empty")
      const record = validateSimulationSubmission(session, new SimulationSubmissionRecord({
        schemaVersion: 1,
        id,
        sessionId,
        status: "submitted",
        answers: [firstAnswer, ...answerValues.slice(1)],
        submittedAt: effectiveSubmittedAt
      }))
      submissions.add(record)
      sessions.put(new SimulationSessionRecord({
        ...session,
        status: "submitted",
        updatedAt: effectiveSubmittedAt
      }))
      await transactionDone(transaction)
      return record
    },
    catch: (cause) => persistenceError("submit-session", cause)
  })
})

const findSubmission = Effect.fn("SimulationPersistence.findSubmission")(function*(
  database: IDBDatabase,
  sessionId: string
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const transaction = database.transaction([sessionsStore, submissionsStore], "readonly")
      const sessionValue = await requestValue(
        transaction.objectStore(sessionsStore).get(sessionId)
      )
      const submissionValue = await requestValue(
        transaction.objectStore(submissionsStore).get(simulationSubmissionId(sessionId))
      )
      await transactionDone(transaction)
      if (submissionValue === undefined) return undefined
      if (sessionValue === undefined) {
        throw new Error("A durable simulation submission has no matching session")
      }
      const session = validateSimulationSession(sessionValue)
      requireResumablePackPin(session)
      const submission = await validateSimulationSubmissionIntegrity(session, submissionValue)
      validateSessionSubmissionStatus(session, submission)
      return submission
    },
    catch: (cause) => persistenceError("find-submission", cause)
  })
})

const complete = Effect.fn("SimulationPersistence.complete")(function*(
  database: IDBDatabase,
  input: CompleteSimulationInput,
  evaluatedAt: number
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const validationTransaction = database.transaction(sessionsStore, "readonly")
      const validationSessionValue = await requestValue(
        validationTransaction.objectStore(sessionsStore).get(input.sessionId)
      )
      await transactionDone(validationTransaction)
      if (validationSessionValue === undefined) {
        throw new Error("Durable simulation session truth is unavailable")
      }
      const validationSession = validateSimulationSession(validationSessionValue)
      requireResumablePackPin(validationSession)
      await validateSimulationResultArtifactsIntegrity(validationSession, input.results)
      const transaction = database.transaction([sessionsStore, submissionsStore], "readwrite")
      const sessions = transaction.objectStore(sessionsStore)
      const submissions = transaction.objectStore(submissionsStore)
      const sessionValue = await requestValue(sessions.get(input.sessionId))
      const submissionValue = await requestValue(
        submissions.get(simulationSubmissionId(input.sessionId))
      )
      if (sessionValue === undefined || submissionValue === undefined) {
        throw new Error("Durable submission truth is unavailable")
      }
      const session = validateSimulationSession(sessionValue)
      requireResumablePackPin(session)
      if (JSON.stringify(session) !== JSON.stringify(validationSession)) {
        transaction.abort()
        throw new Error("The pinned simulation receipt closure changed during evaluation")
      }
      const submission = validateSimulationSubmission(session, submissionValue)
      validateSessionSubmissionStatus(session, submission)
      if (submission.status === "evaluated") {
        if (
          input.correctCount !== submission.correctCount ||
          JSON.stringify(input.results) !== JSON.stringify(submission.results)
        ) {
          transaction.abort()
          throw new Error("This simulation already has different immutable evaluated results")
        }
        await transactionDone(transaction)
        return submission
      }
      if (session.status !== "submitted") {
        transaction.abort()
        throw new Error("Only a submitted simulation can be evaluated")
      }
      if (
        input.results.length !== session.actualLength ||
        input.correctCount !== input.results.filter((result) => result.correct).length
      ) {
        transaction.abort()
        throw new Error("Simulation results do not close over the submitted session")
      }
      const firstResult = input.results[0]
      if (firstResult === undefined) throw new Error("A simulation result cannot be empty")
      const effectiveEvaluatedAt = monotonicSimulationTimestamp(
        evaluatedAt,
        session.createdAt,
        session.updatedAt,
        submission.submittedAt
      )
      const completed = validateSimulationSubmission(session, new SimulationSubmissionRecord({
        ...submission,
        status: "evaluated",
        evaluatedAt: effectiveEvaluatedAt,
        results: [firstResult, ...input.results.slice(1)],
        correctCount: input.correctCount
      }))
      submissions.put(completed)
      sessions.put(new SimulationSessionRecord({
        ...session,
        status: "evaluated",
        updatedAt: effectiveEvaluatedAt
      }))
      await transactionDone(transaction)
      return completed
    },
    catch: (cause) => persistenceError("complete-session", cause)
  })
})

export const simulationPersistenceLive = Layer.effect(
  SimulationPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(Effect.mapError(databasePersistenceError))

    return SimulationPersistence.of({
      createSession: Effect.fn("SimulationPersistence.createSession.live")(function*(session) {
        return yield* createSession(yield* connection, session)
      }),
      findSession: Effect.fn("SimulationPersistence.findSession.live")(function*(sessionId) {
        return yield* findSession(yield* connection, sessionId)
      }),
      saveResponse: Effect.fn("SimulationPersistence.saveResponse.live")(function*(input) {
        const updatedAt = yield* Clock.currentTimeMillis
        return yield* updateSession(
          yield* connection,
          input.sessionId,
          updatedAt,
          (session, effectiveUpdatedAt) => {
            if (session.status !== "active") throw new Error("Submitted answers cannot be edited")
            const item = session.items.find(
              (candidate) => simulationItemId(candidate) === input.questionId
            )
            if (item === undefined) {
              throw new Error("The edited response is outside the pinned session closure")
            }
            const response = {
              questionId: input.questionId,
              selectedOptionId: input.selectedOptionId,
              markers: input.markers ?? [],
              selectedZoneOrders: input.selectedZoneOrders ?? [],
              zeroHazardsConfirmed: input.zeroHazardsConfirmed ?? false,
              reviewIntent: input.reviewIntent,
              updatedAt: effectiveUpdatedAt
            }
            validateResponseForItem(item, response)
            const responses = session.responses.filter(
              (response) => response.questionId !== input.questionId
            )
            responses.push(response)
            const order = new Map(session.items.map((candidate) => [
              simulationItemId(candidate),
              candidate.position
            ]))
            responses.sort((left, right) =>
              (order.get(left.questionId) ?? 0) - (order.get(right.questionId) ?? 0)
            )
            return new SimulationSessionRecord({ ...session, responses })
          }
        )
      }),
      setPosition: Effect.fn("SimulationPersistence.setPosition.live")(function*(sessionId, position) {
        const updatedAt = yield* Clock.currentTimeMillis
        return yield* updateSession(
          yield* connection,
          sessionId,
          updatedAt,
          (session) => updateSimulationPosition(session, position)
        )
      }),
      setTimerVisibility: Effect.fn("SimulationPersistence.setTimerVisibility.live")(
        function*(sessionId, timerVisible) {
          const updatedAt = yield* Clock.currentTimeMillis
          return yield* updateSession(
            yield* connection,
            sessionId,
            updatedAt,
            (session) => {
              if (session.status !== "active") throw new Error("Submitted timer settings cannot be edited")
              if (session.timing.mode !== "timed") throw new Error("An untimed simulation has no timer")
              return new SimulationSessionRecord({
                ...session,
                timing: { ...session.timing, timerVisible }
              })
            }
          )
        }
      ),
      submit: Effect.fn("SimulationPersistence.submit.live")(function*(sessionId) {
        return yield* submit(yield* connection, sessionId, yield* Clock.currentTimeMillis)
      }),
      findSubmission: Effect.fn("SimulationPersistence.findSubmission.live")(function*(sessionId) {
        return yield* findSubmission(yield* connection, sessionId)
      }),
      complete: Effect.fn("SimulationPersistence.complete.live")(function*(input) {
        return yield* complete(yield* connection, input, yield* Clock.currentTimeMillis)
      })
    })
  })
)

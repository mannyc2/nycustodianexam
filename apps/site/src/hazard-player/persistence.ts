import {
  PostcommitScene,
  PrecommitScene as PrecommitSceneSchema
} from "@nycustodian/content/model"
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
import {
  AssetContentReceipt,
  type AssetContentReceipt as AssetContentReceiptValue
} from "../verified-content.ts"
import { DurableTimestamp, NormalizedCoordinate } from "../durable-values.ts"
import {
  RetainedImageAsset,
  decodeCanonicalBase64,
  decodeRetainedImage,
  sameAssetReceipt,
  sha256Bytes,
  validateRetainedImage
} from "../retained-image.ts"
import { hasValidPostcommitClosure } from "./assessment.ts"
import type {
  HazardInputMode,
  HazardMarker,
  PostcommitScene as PostcommitSceneValue,
  PrecommitScene
} from "./attempt.ts"

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

export class HazardEvaluationRecord extends Schema.Class<HazardEvaluationRecord>(
  "@nycustodian/site/hazard-player/HazardEvaluationRecord"
)({
  payload: PostcommitScene,
  postcommitBase64: Schema.String.check(
    Schema.isPattern(/^[A-Za-z0-9+/]*={0,2}$/, { expected: "canonical base64 postcommit bytes" })
  ),
  retainedVisualAsset: Schema.NullOr(RetainedImageAsset)
}) {}

export class HazardAttemptRecord extends Schema.Class<HazardAttemptRecord>(
  "@nycustodian/site/hazard-player/HazardAttemptRecord"
)({
  id: Schema.NonEmptyString,
  sceneId: Schema.NonEmptyString,
  mode: Schema.Literals(["visual", "nonvisual"]),
  markers: Schema.Array(PersistedHazardMarker),
  selectedZoneOrders: Schema.Array(Schema.Natural),
  zeroHazardsConfirmed: Schema.Boolean,
  committedAt: DurableTimestamp,
  receipt: Schema.optionalKey(HazardAttemptReceipt),
  allowedZoneOrders: Schema.optionalKey(ZoneOrders),
  evaluation: Schema.optionalKey(HazardEvaluationRecord)
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
  readonly scene: PrecommitScene
  readonly visualAssetReceipt: AssetContentReceiptValue | null
}

export interface CompleteHazardAttemptInput extends FindHazardAttemptInput {
  readonly attempt: HazardAttemptRecord
  readonly payload: PostcommitSceneValue
  readonly postcommitBase64: string
  readonly retainedVisualAsset: RetainedImageAsset | null
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
    readonly completeAttempt: (
      input: CompleteHazardAttemptInput
    ) => Effect.Effect<HazardAttemptRecord, HazardPersistenceError>
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

type HazardAttemptCoordinate = Pick<
  FindHazardAttemptInput,
  "receipt" | "allowedZoneOrders"
>

export const hasBoundHazardReceipt = (
  attempt: HazardAttemptRecord
): attempt is HazardAttemptRecord & {
  readonly receipt: HazardAttemptReceiptValue
  readonly allowedZoneOrders: ReadonlyArray<number>
} => attempt.receipt !== undefined && attempt.allowedZoneOrders !== undefined

const matchesExpectation = (
  existing: HazardAttemptRecord,
  input: HazardAttemptCoordinate
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

const sameAttemptResponse = (
  left: HazardAttemptRecord,
  right: HazardAttemptRecord
): boolean =>
  left.id === right.id &&
  left.sceneId === right.sceneId &&
  left.mode === right.mode &&
  left.zeroHazardsConfirmed === right.zeroHazardsConfirmed &&
  left.committedAt === right.committedAt &&
  sameMarkers(left.markers, right.markers) &&
  sameNumbers(left.selectedZoneOrders, right.selectedZoneOrders) &&
  left.receipt !== undefined &&
  right.receipt !== undefined &&
  sameHazardReceipt(left.receipt, right.receipt) &&
  left.allowedZoneOrders !== undefined &&
  right.allowedZoneOrders !== undefined &&
  sameNumbers(left.allowedZoneOrders, right.allowedZoneOrders)

const sameEvaluation = (
  left: HazardEvaluationRecord,
  right: HazardEvaluationRecord
): boolean => JSON.stringify(left) === JSON.stringify(right)

const visualReceiptForScene = (
  scene: PrecommitScene
): AssetContentReceiptValue | undefined => {
  const webDerivatives = scene.asset.derivatives.filter((derivative) => derivative.kind === "web")
  const webDerivative = webDerivatives.length === 1 ? webDerivatives[0] : undefined
  return webDerivative === undefined
    ? undefined
    : Schema.decodeUnknownSync(AssetContentReceipt)({
        path: `/${webDerivative.path}`,
        bytes: webDerivative.bytes,
        sha256: webDerivative.sha256
      })
}

const expectedPostcommitPath = (opaqueAssetId: string): string =>
  `/content/vertical-slice/scenes/${encodeURIComponent(opaqueAssetId)}.postcommit.json`

const validatePostcommitBinding = async (input: {
  readonly receipt: unknown
  readonly evaluation: unknown
}): Promise<{
  readonly receipt: HazardAttemptReceiptValue
  readonly evaluation: HazardEvaluationRecord
  readonly payload: PostcommitSceneValue
}> => {
  const receipt = Schema.decodeUnknownSync(HazardAttemptReceipt)(input.receipt)
  const evaluation = Schema.decodeUnknownSync(HazardEvaluationRecord)(input.evaluation)
  const postcommitBytes = decodeCanonicalBase64(evaluation.postcommitBase64)
  if (
    postcommitBytes.byteLength !== receipt.postcommitBytes ||
    await sha256Bytes(postcommitBytes) !== receipt.postcommitSha256
  ) {
    throw new Error("The saved hazard feedback bytes do not match their release receipt")
  }
  const payload = Schema.decodeUnknownSync(PostcommitScene)(
    JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(postcommitBytes)) as unknown
  )
  if (
    JSON.stringify(payload) !== JSON.stringify(evaluation.payload) ||
    receipt.postcommitPath !== expectedPostcommitPath(payload.opaqueAssetId)
  ) {
    throw new Error("The saved hazard feedback payload does not match its release receipt")
  }
  return { receipt, evaluation, payload }
}

export const validateHazardEvaluation = async (input: {
  readonly receipt: HazardAttemptReceiptValue
  readonly scene: PrecommitScene
  readonly visualAssetReceipt: AssetContentReceiptValue | null
  readonly evaluation: unknown
}): Promise<HazardEvaluationRecord> => {
  const scene = Schema.decodeUnknownSync(PrecommitSceneSchema)(input.scene)
  const sceneVisualReceipt = visualReceiptForScene(scene)
  const { evaluation, payload, receipt } = await validatePostcommitBinding(input)
  if (
    receipt.sceneId !== scene.id ||
    receipt.postcommitPath !== expectedPostcommitPath(scene.asset.opaqueAssetId) ||
    receipt.assetRevision !== scene.asset.revision ||
    receipt.assetMasterSha256 !== scene.asset.masterSha256 ||
    !hasValidPostcommitClosure(scene, payload)
  ) {
    throw new Error("The saved hazard evaluation is outside its released scene closure")
  }
  if (receipt.mode === "visual") {
    if (
      sceneVisualReceipt === undefined ||
      input.visualAssetReceipt === null ||
      !sameAssetReceipt(input.visualAssetReceipt, sceneVisualReceipt) ||
      evaluation.retainedVisualAsset === null ||
      !sameAssetReceipt(evaluation.retainedVisualAsset.receipt, sceneVisualReceipt)
    ) {
      throw new Error("The saved hazard image is outside its released derivative closure")
    }
    decodeRetainedImage(evaluation.retainedVisualAsset)
    await validateRetainedImage(evaluation.retainedVisualAsset)
  } else if (
    input.visualAssetReceipt !== null ||
    evaluation.retainedVisualAsset !== null
  ) {
    throw new Error("A nonvisual hazard evaluation cannot retain a visual asset")
  }
  return evaluation
}

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
              const existing = Schema.decodeUnknownSync(HazardAttemptRecord)(getRequest.result)
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

const completeAttempt = Effect.fn("HazardPersistence.completeAttempt")(function*(
  database: IDBDatabase,
  input: CompleteHazardAttemptInput
) {
  const evaluation = yield* Effect.tryPromise({
    try: async () => {
      const attempt = validateStoredAttempt(
        Schema.decodeUnknownSync(HazardAttemptRecord)(input.attempt)
      )
      if (!matchesExpectation(attempt, input)) {
        throw new Error("The hazard completion coordinate does not match its committed response")
      }
      return validateHazardEvaluation({
        receipt: input.receipt,
        scene: input.scene,
        visualAssetReceipt: input.visualAssetReceipt,
        evaluation: new HazardEvaluationRecord({
          payload: input.payload,
          postcommitBase64: input.postcommitBase64,
          retainedVisualAsset: input.retainedVisualAsset
        })
      })
    },
    catch: (cause) => persistenceError("validate-completion", cause)
  })

  return yield* Effect.tryPromise({
    try: () =>
      new Promise<HazardAttemptRecord>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readwrite")
        const attempts = transaction.objectStore(attemptsStore)
        const request = attempts.get(hazardAttemptId(input.receipt))
        let completed: HazardAttemptRecord | undefined

        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              transaction.abort()
              reject(new Error("No durable hazard response exists to complete"))
              return
            }
            const existing = validateStoredAttempt(
              Schema.decodeUnknownSync(HazardAttemptRecord)(request.result)
            )
            if (
              !matchesExpectation(existing, input) ||
              !sameAttemptResponse(existing, input.attempt)
            ) {
              transaction.abort()
              reject(new Error("The stored hazard response changed before completion"))
              return
            }
            if (
              existing.evaluation !== undefined &&
              !sameEvaluation(existing.evaluation, evaluation)
            ) {
              transaction.abort()
              reject(new Error("This hazard attempt already has different durable feedback"))
              return
            }
            completed = existing.evaluation === undefined
              ? new HazardAttemptRecord({ ...existing, evaluation })
              : existing
            if (existing.evaluation === undefined) attempts.put(completed)
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (completed === undefined) {
            reject(new Error("Hazard completion transaction ended without a record"))
            return
          }
          resolve(completed)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Hazard completion transaction aborted"))
      }),
    catch: (cause) => persistenceError("complete-attempt", cause)
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
    try: async () => {
      const attempt = await new Promise<HazardAttemptRecord | undefined>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).get(hazardAttemptId(input.receipt))
        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              resolve(undefined)
              return
            }
            const attempt = validateStoredAttempt(
              Schema.decodeUnknownSync(HazardAttemptRecord)(request.result)
            )
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
      })
      if (attempt?.evaluation !== undefined) {
        await validateHazardEvaluation({
          receipt: input.receipt,
          scene: input.scene,
          visualAssetReceipt: input.visualAssetReceipt,
          evaluation: attempt.evaluation
        })
      }
      return attempt
    },
    catch: (cause) => persistenceError("find-attempt", cause)
  })
})

const validateStoredAttempt = (attempt: HazardAttemptRecord): HazardAttemptRecord => {
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
  if (attempt.evaluation !== undefined) {
    if (!hasBoundHazardReceipt(attempt)) {
      throw new Error("A saved hazard evaluation is missing its release coordinate")
    }
    if (
      attempt.mode === "visual"
        ? attempt.evaluation.retainedVisualAsset === null
        : attempt.evaluation.retainedVisualAsset !== null
    ) {
      throw new Error("A saved hazard evaluation has invalid mode/image closure")
    }
    if (attempt.evaluation.retainedVisualAsset !== null) {
      decodeRetainedImage(attempt.evaluation.retainedVisualAsset)
    }
  }
  return attempt
}

const listAttempts = Effect.fn("HazardPersistence.listAttempts")(function*(
  database: IDBDatabase
) {
  return yield* Effect.tryPromise({
    try: async () => {
      const attempts = await new Promise<ReadonlyArray<HazardAttemptRecord>>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).getAll()
        let decoded: ReadonlyArray<HazardAttemptRecord> | undefined

        request.onsuccess = () => {
          try {
            decoded = request.result
              .map((record) =>
                validateStoredAttempt(Schema.decodeUnknownSync(HazardAttemptRecord)(record))
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
      })
      await Promise.all(attempts.flatMap((attempt) => {
        if (attempt.evaluation === undefined) return []
        if (!hasBoundHazardReceipt(attempt)) {
          return [Promise.reject(new Error(
            "A saved hazard evaluation is missing its release coordinate"
          ))]
        }
        return [Promise.all([
          validatePostcommitBinding({
            receipt: attempt.receipt,
            evaluation: attempt.evaluation
          }),
          attempt.evaluation.retainedVisualAsset === null
            ? Promise.resolve(null)
            : validateRetainedImage(attempt.evaluation.retainedVisualAsset)
        ])]
      }))
      return attempts
    },
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
          decodeRecord: (record) =>
            validateStoredAttempt(Schema.decodeUnknownSync(HazardAttemptRecord)(record))
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
      completeAttempt: Effect.fn("HazardPersistence.completeAttempt.live")(function*(input) {
        const database = yield* connection
        return yield* completeAttempt(database, input)
      }),
      listAttempts: Effect.fn("HazardPersistence.listAttempts.live")(function*() {
        const database = yield* connection
        return yield* listAttempts(database)
      })
    })
  })
)

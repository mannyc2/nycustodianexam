import { PostcommitScene as PostcommitSceneSchema } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import type { HazardAttemptReceipt } from "../attempt-receipt.ts"
import {
  encodeCanonicalBase64,
  retainImageBlob,
  type RetainedImageAsset
} from "../retained-image.ts"
import {
  VerifiedContent,
  type AssetContentReceipt
} from "../verified-content.ts"
import { hasValidPostcommitClosure } from "./assessment.ts"
import {
  HazardPersistence,
  type CommitHazardAttemptInput,
  type HazardAttemptRecord
} from "./persistence.ts"
import type {
  HazardDraft,
  HazardInputMode,
  HazardMarker,
  PrecommitScene
} from "./attempt.ts"

export class HazardRevealError extends Schema.TaggedError<HazardRevealError>()(
  "HazardRevealError",
  {
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class HazardContentMismatch extends Schema.TaggedError<HazardContentMismatch>()(
  "HazardContentMismatch",
  {
    detail: Schema.NonEmptyString,
    expectedOpaqueAssetId: Schema.NonEmptyString,
    receivedOpaqueAssetId: Schema.NonEmptyString
  }
) {}

export class HazardAttemptMismatch extends Schema.TaggedError<HazardAttemptMismatch>()(
  "HazardAttemptMismatch",
  {
    detail: Schema.NonEmptyString,
    attemptId: Schema.NonEmptyString
  }
) {}

const loadPostcommit = Effect.fn("HazardWorkflow.loadPostcommit")(function*(
  receipt: HazardAttemptReceipt,
  scene: PrecommitScene
) {
  const verifiedContent = yield* VerifiedContent
  const artifact = yield* verifiedContent.loadJsonArtifact(receipt).pipe(
    Effect.mapError(
      (cause) =>
      new HazardRevealError({
        detail: "The saved scene feedback could not be loaded.",
        cause
      })
    )
  )

  const payload = yield* Schema.decodeUnknownEffect(PostcommitSceneSchema)(artifact.value).pipe(
    Effect.mapError(
      (cause) =>
        new HazardRevealError({
          detail: "The saved scene feedback payload was invalid.",
          cause
        })
    )
  )

  if (!hasValidPostcommitClosure(scene, payload)) {
    return yield* new HazardContentMismatch({
      detail: "The saved scene feedback did not match this released scene.",
      expectedOpaqueAssetId: scene.asset.opaqueAssetId,
      receivedOpaqueAssetId: payload.opaqueAssetId
    })
  }

  return { payload, postcommitBase64: encodeCanonicalBase64(artifact.bytes) }
})

const nextMarkerNumber = (markers: ReadonlyArray<HazardMarker>): number => {
  let greatest = 0
  for (const marker of markers) {
    const match = /^marker-(\d+)$/.exec(marker.id)
    if (match === null) continue
    const number = Number(match[1])
    if (Number.isSafeInteger(number)) greatest = Math.max(greatest, number)
  }
  return greatest + 1
}

export const draftFromAttempt = (attempt: HazardAttemptRecord): HazardDraft => ({
  markers: attempt.markers,
  selectedZoneOrders: attempt.selectedZoneOrders,
  nextMarkerNumber: nextMarkerNumber(attempt.markers)
})

const receiptMatchesScene = (
  receipt: HazardAttemptReceipt,
  scene: PrecommitScene,
  mode: HazardInputMode
): boolean => {
  const expectedPostcommitPath =
    `/content/vertical-slice/scenes/${encodeURIComponent(scene.asset.opaqueAssetId)}.postcommit.json`
  return receipt.sceneId === scene.id &&
    receipt.mode === mode &&
    receipt.postcommitPath === expectedPostcommitPath &&
    receipt.assetRevision === scene.asset.revision &&
    receipt.assetMasterSha256 === scene.asset.masterSha256
}

const commitInput = (
  receipt: HazardAttemptReceipt,
  scene: PrecommitScene,
  mode: HazardInputMode,
  draft: HazardDraft
): CommitHazardAttemptInput => {
  const markers = mode === "visual" ? draft.markers : []
  const selectedZoneOrders = mode === "nonvisual" ? draft.selectedZoneOrders : []
  return {
    receipt,
    allowedZoneOrders: scene.neutralPreAnswer.zones.map((zone) => zone.order),
    markers,
    selectedZoneOrders,
    zeroHazardsConfirmed: markers.length + selectedZoneOrders.length === 0
  }
}

const completeHazardFeedback = Effect.fn("HazardWorkflow.completeHazardFeedback")(
  function*(input: {
    readonly attempt: HazardAttemptRecord
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
    readonly visualAssetReceipt: AssetContentReceipt | null
    readonly retainedVisualAsset?: RetainedImageAsset | null
    readonly payload: typeof PostcommitSceneSchema.Type
    readonly postcommitBase64: string
  }) {
    let retainedVisualAsset = input.retainedVisualAsset ?? null
    if (input.mode === "visual") {
      if (input.visualAssetReceipt === null) {
        return yield* new HazardRevealError({
          detail: "The exact released scene image receipt was unavailable.",
          cause: new Error("Missing visual asset receipt")
        })
      }
      if (retainedVisualAsset === null) {
        const visualAssetReceipt = input.visualAssetReceipt
        const verifiedContent = yield* VerifiedContent
        const blob = yield* verifiedContent.loadAssetBlob(visualAssetReceipt).pipe(
          Effect.mapError((cause) => new HazardRevealError({
            detail: "The exact released scene image could not be retained with this feedback.",
            cause
          }))
        )
        retainedVisualAsset = yield* Effect.tryPromise({
          try: () => retainImageBlob(visualAssetReceipt, blob),
          catch: (cause) => new HazardRevealError({
            detail: "The exact released scene image failed retained-asset verification.",
            cause
          })
        })
      }
    } else if (input.visualAssetReceipt !== null || retainedVisualAsset !== null) {
      return yield* new HazardRevealError({
        detail: "A nonvisual scene cannot retain a visual asset.",
        cause: new Error("Unexpected visual asset receipt")
      })
    }

    const persistence = yield* HazardPersistence
    const completed = yield* persistence.completeAttempt({
      attempt: input.attempt,
      receipt: input.receipt,
      allowedZoneOrders: input.scene.neutralPreAnswer.zones.map((zone) => zone.order),
      scene: input.scene,
      visualAssetReceipt: input.visualAssetReceipt,
      payload: input.payload,
      postcommitBase64: input.postcommitBase64,
      retainedVisualAsset
    })
    return {
      attempt: completed,
      payload: input.payload,
      retainedVisualAsset
    }
  }
)

const durableEvaluation = (attempt: HazardAttemptRecord) =>
  attempt.evaluation === undefined
    ? undefined
    : {
        attempt,
        payload: attempt.evaluation.payload,
        retainedVisualAsset: attempt.evaluation.retainedVisualAsset
      }

export const commitHazardAndReveal = Effect.fn("HazardWorkflow.commitHazardAndReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
    readonly draft: HazardDraft
    readonly visualAssetReceipt: AssetContentReceipt | null
    readonly retainedVisualAsset?: RetainedImageAsset | null
  }) {
    if (!receiptMatchesScene(input.receipt, input.scene, input.mode)) {
      return yield* new HazardAttemptMismatch({
        detail: "The hazard receipt did not match this released scene session.",
        attemptId: "uncommitted"
      })
    }
    const verifiedContent = yield* VerifiedContent
    const availability = yield* verifiedContent.ensureAvailable(input.receipt).pipe(
      Effect.match({
        onFailure: (error) => ({ tag: "content_unavailable", error }) as const,
        onSuccess: () => ({ tag: "available" }) as const
      })
    )
    if (availability.tag === "content_unavailable") return availability

    const persistence = yield* HazardPersistence
    const attempt = yield* persistence.commitAttempt(
      commitInput(input.receipt, input.scene, input.mode, input.draft)
    )
    return yield* loadPostcommit(input.receipt, input.scene).pipe(
      Effect.flatMap(({ payload, postcommitBase64 }) => completeHazardFeedback({
        attempt,
        receipt: input.receipt,
        scene: input.scene,
        mode: input.mode,
        visualAssetReceipt: input.visualAssetReceipt,
        retainedVisualAsset: input.retainedVisualAsset ?? null,
        payload,
        postcommitBase64
      })),
      Effect.match({
        onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
        onSuccess: (completed) => ({ tag: "revealed", ...completed }) as const
      })
    )
  }
)

export const restoreHazardAndReveal = Effect.fn("HazardWorkflow.restoreHazardAndReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
    readonly visualAssetReceipt: AssetContentReceipt | null
    readonly retainedVisualAsset?: RetainedImageAsset | null
  }) {
    if (!receiptMatchesScene(input.receipt, input.scene, input.mode)) {
      return yield* new HazardAttemptMismatch({
        detail: "The hazard receipt did not match this released scene session.",
        attemptId: "unrestored"
      })
    }
    const persistence = yield* HazardPersistence
    const attempt = yield* persistence.findAttempt({
      receipt: input.receipt,
      allowedZoneOrders: input.scene.neutralPreAnswer.zones.map((zone) => zone.order),
      scene: input.scene,
      visualAssetReceipt: input.visualAssetReceipt
    })
    if (attempt === undefined) {
      const verifiedContent = yield* VerifiedContent
      return yield* verifiedContent.ensureAvailable(input.receipt).pipe(
        Effect.match({
          onFailure: (error) => ({ tag: "content_unavailable", error }) as const,
          onSuccess: () => undefined
        })
      )
    }
    const evaluated = durableEvaluation(attempt)
    if (evaluated !== undefined) return { tag: "revealed", ...evaluated } as const
    return yield* loadPostcommit(input.receipt, input.scene).pipe(
      Effect.flatMap(({ payload, postcommitBase64 }) => completeHazardFeedback({
        attempt,
        receipt: input.receipt,
        scene: input.scene,
        mode: input.mode,
        visualAssetReceipt: input.visualAssetReceipt,
        retainedVisualAsset: input.retainedVisualAsset ?? null,
        payload,
        postcommitBase64
      })),
      Effect.match({
        onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
        onSuccess: (completed) => ({ tag: "revealed", ...completed }) as const
      })
    )
  }
)

export const retryHazardReveal = Effect.fn("HazardWorkflow.retryHazardReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
    readonly visualAssetReceipt: AssetContentReceipt | null
    readonly retainedVisualAsset?: RetainedImageAsset | null
  }) {
    if (!receiptMatchesScene(input.receipt, input.scene, input.mode)) {
      return yield* new HazardAttemptMismatch({
        detail: "The hazard receipt did not match this released scene session.",
        attemptId: "unretried"
      })
    }
    const persistence = yield* HazardPersistence
    const attempt = yield* persistence.findAttempt({
      receipt: input.receipt,
      allowedZoneOrders: input.scene.neutralPreAnswer.zones.map((zone) => zone.order),
      scene: input.scene,
      visualAssetReceipt: input.visualAssetReceipt
    })
    if (attempt === undefined) {
      return yield* new HazardAttemptMismatch({
        detail: "No matching durable hazard response exists for this release receipt.",
        attemptId: "missing"
      })
    }
    const evaluated = durableEvaluation(attempt)
    if (evaluated !== undefined) return evaluated
    const { payload, postcommitBase64 } = yield* loadPostcommit(input.receipt, input.scene)
    return yield* completeHazardFeedback({
      attempt,
      receipt: input.receipt,
      scene: input.scene,
      mode: input.mode,
      visualAssetReceipt: input.visualAssetReceipt,
      retainedVisualAsset: input.retainedVisualAsset ?? null,
      payload,
      postcommitBase64
    })
  }
)

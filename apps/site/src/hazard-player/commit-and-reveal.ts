import { PostcommitScene as PostcommitSceneSchema } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import type { HazardAttemptReceipt } from "../attempt-receipt.ts"
import { VerifiedContent } from "../verified-content.ts"
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
  const unknownPayload = yield* verifiedContent.loadJson(receipt).pipe(
    Effect.mapError(
      (cause) =>
      new HazardRevealError({
        detail: "The saved scene feedback could not be loaded.",
        cause
      })
    )
  )

  const payload = yield* Schema.decodeUnknownEffect(PostcommitSceneSchema)(unknownPayload).pipe(
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

  return payload
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
  return receipt.sceneId === scene.id &&
    receipt.mode === mode &&
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

export const commitHazardAndReveal = Effect.fn("HazardWorkflow.commitHazardAndReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
    readonly draft: HazardDraft
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
      Effect.match({
        onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
        onSuccess: (payload) => ({ tag: "revealed", attempt, payload }) as const
      })
    )
  }
)

export const restoreHazardAndReveal = Effect.fn("HazardWorkflow.restoreHazardAndReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
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
      allowedZoneOrders: input.scene.neutralPreAnswer.zones.map((zone) => zone.order)
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
    return yield* loadPostcommit(input.receipt, input.scene).pipe(
      Effect.match({
        onFailure: (error) => ({ tag: "reveal_failed", attempt, error }) as const,
        onSuccess: (payload) => ({ tag: "revealed", attempt, payload }) as const
      })
    )
  }
)

export const retryHazardReveal = Effect.fn("HazardWorkflow.retryHazardReveal")(
  function*(input: {
    readonly receipt: HazardAttemptReceipt
    readonly scene: PrecommitScene
    readonly mode: HazardInputMode
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
      allowedZoneOrders: input.scene.neutralPreAnswer.zones.map((zone) => zone.order)
    })
    if (attempt === undefined) {
      return yield* new HazardAttemptMismatch({
        detail: "No matching durable hazard response exists for this release receipt.",
        attemptId: "missing"
      })
    }
    return yield* loadPostcommit(input.receipt, input.scene)
  }
)

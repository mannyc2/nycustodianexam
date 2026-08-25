import { Effect } from "effect"
import type { ReviewQueueBootstrap } from "../review/model.ts"
import { buildReviewQueue } from "../review/projection.ts"

export interface ReviewRebuildReceipt {
  readonly attemptsRead: number
  readonly dueItems: number
  readonly quarantinedAttempts: number
}

/**
 * Settings owns the explicit recovery action, while the review capability owns
 * the one canonical derivation algorithm. The operation is deliberately
 * read-only: repeating it over the same append-only events yields the same
 * receipt and never creates an acknowledgement or another study event.
 */
export const rebuildReviewProjection = Effect.fn(
  "SettingsReviewRebuild.rebuildReviewProjection"
)(function*(bootstrap: ReviewQueueBootstrap) {
  const projection = yield* buildReviewQueue(bootstrap)
  return {
    attemptsRead: projection.attemptCount,
    dueItems: projection.items.length,
    quarantinedAttempts: projection.quarantined.length
  } satisfies ReviewRebuildReceipt
})

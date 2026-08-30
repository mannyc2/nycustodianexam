import type { Effect } from "effect"
import type { HazardPersistence } from "../hazard-player/persistence.ts"
import type { QuestionPersistence } from "../question-player/persistence.ts"
import type { VerifiedContent } from "../verified-content.ts"
import type {
  ReviewQueueBootstrap,
  ReviewQueueItem,
  ReviewQueueState
} from "./model.ts"
import type { ReviewPersistence } from "./persistence.ts"
import {
  acknowledgeReviewItem,
  buildReviewQueue,
  type ReviewProjectionError
} from "./projection.ts"

type ReviewRequirements =
  | QuestionPersistence
  | HazardPersistence
  | ReviewPersistence
  | VerifiedContent

export interface ReviewEffectRunner {
  readonly runPromise: <A, E>(
    effect: Effect.Effect<A, E, ReviewRequirements>
  ) => Promise<A>
}

export type ReviewCommand =
  | { readonly tag: "acknowledge"; readonly itemId: string }
  | { readonly tag: "retry" }
  | { readonly tag: "rebuild" }

export interface ReviewControllerSnapshot {
  readonly state: ReviewQueueState
  readonly revision: number
}

export interface ReviewController {
  readonly getSnapshot: () => ReviewControllerSnapshot
  readonly getHydrationSnapshot: () => ReviewControllerSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly dispatch: (command: ReviewCommand) => void
  readonly start: () => void
  readonly dispose: () => void
}

const errorDetail = (
  error: ReviewProjectionError,
  action: "load" | "acknowledge"
): string => {
  console.error("Review operation failed", error)
  return action === "acknowledge"
    ? "This item could not be removed from the current review list. Nothing in your history was changed — try again."
    : "The saved review list could not be prepared. Nothing in your history was changed — reload or try again."
}

export const createReviewController = (
  bootstrap: ReviewQueueBootstrap,
  runtime: ReviewEffectRunner
): ReviewController => {
  const hydrationSnapshot: ReviewControllerSnapshot = {
    state: { tag: "loading", action: "initial" },
    revision: 0
  }
  let snapshot = hydrationSnapshot
  let active = true
  let started = false
  let operationToken = 0
  const listeners = new Set<() => void>()

  const publish = (state: ReviewQueueState): void => {
    if (!active) return
    snapshot = { state, revision: snapshot.revision + 1 }
    listeners.forEach((listener) => listener())
  }

  const load = (
    action: "initial" | "retry" | "rebuild",
    emptyOrigin: "load" | "acknowledgement" = "load"
  ): void => {
    const token = ++operationToken
    publish({ tag: "loading", action })
    void runtime.runPromise(buildReviewQueue(bootstrap)).then(
      (projection) => {
        if (!active || token !== operationToken) return
        publish(
          projection.items.length === 0 && projection.quarantined.length === 0
            ? { tag: "empty", origin: emptyOrigin }
            : {
                tag: "ready",
                items: projection.items,
                quarantined: projection.quarantined,
                acknowledgingItemId: null
              }
        )
      },
      (error: ReviewProjectionError) => {
        if (!active || token !== operationToken) return
        publish({
          tag: "recoverable_error",
          operation: "load",
          detail: errorDetail(error, "load"),
          items: [],
          quarantined: []
        })
      }
    )
  }

  const acknowledge = (itemId: string): void => {
    const state = snapshot.state
    if (state.tag !== "ready" || state.acknowledgingItemId !== null) return
    const item = state.items.find((candidate) => candidate.id === itemId)
    if (item === undefined) return

    const token = ++operationToken
    publish({ ...state, acknowledgingItemId: item.id })
    void runtime.runPromise(acknowledgeReviewItem(item)).then(
      () => {
        if (!active || token !== operationToken) return
        load("rebuild", "acknowledgement")
      },
      (error: ReviewProjectionError) => {
        if (!active || token !== operationToken) return
        publish({
          tag: "recoverable_error",
          operation: "acknowledge",
          detail: errorDetail(error, "acknowledge"),
          items: state.items,
          quarantined: state.quarantined
        })
      }
    )
  }

  return {
    getSnapshot: () => snapshot,
    getHydrationSnapshot: () => hydrationSnapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    dispatch: (command) => {
      switch (command.tag) {
        case "acknowledge":
          acknowledge(command.itemId)
          return
        case "retry":
          load("retry")
          return
        case "rebuild":
          load("rebuild")
          return
      }
    },
    start: () => {
      if (started) return
      started = true
      load("initial")
    },
    dispose: () => {
      active = false
      operationToken += 1
      listeners.clear()
    }
  }
}

export const findReviewItem = (
  items: ReadonlyArray<ReviewQueueItem>,
  itemId: string
): ReviewQueueItem | undefined => items.find((item) => item.id === itemId)

import { createContext, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { includeUnavailableReviews } from "../../study/activity.ts"
import type { StudyActivityState } from "../../study/model.ts"
import type { ReviewController } from "../controller.ts"
import type { ReviewQueueItem } from "../model.ts"

type ReviewScope = "all" | "missed" | "flagged"
export const scopes: ReadonlyArray<{ readonly id: ReviewScope; readonly label: string }> = [
  { id: "all", label: "All" }, { id: "missed", label: "Missed" }, { id: "flagged", label: "Flagged" }
]
const inScope = (item: ReviewQueueItem, scope: ReviewScope): boolean =>
  scope === "all" || item.reasons.some((reason) => scope === "flagged" ? reason.tag === "flag" : reason.tag !== "flag")

export interface ReviewProviderProps {
  readonly controller: ReviewController
  readonly activityState: StudyActivityState
  readonly onRetryHistory: () => void
}
const useReviewValue = ({ controller, activityState, onRetryHistory }: ReviewProviderProps) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const state = snapshot.state
  const [scope, setScope] = useState<ReviewScope>("all")
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null)
  const filteredHeadingRef = useRef<HTMLHeadingElement>(null)
  const unavailableHeadingRef = useRef<HTMLHeadingElement>(null)
  const queueHeadingRef = useRef<HTMLHeadingElement>(null)
  const items = state.tag === "ready" || state.tag === "recoverable_error" ? state.items : []
  const filtered = items.filter((item) => inScope(item, scope))
  const filteredEmpty = state.tag === "ready" && items.length > 0 && filtered.length === 0
  const missed = items.filter((item) => inScope(item, "missed")).length
  const flagged = items.filter((item) => inScope(item, "flagged")).length
  const busy = state.tag === "ready" && state.acknowledgingItemId !== null
  const quarantined = state.tag === "ready" || state.tag === "recoverable_error" ? state.quarantined : []
  const historyState = activityState.tag === "ready"
    ? { tag: "ready" as const, activity: includeUnavailableReviews(activityState.activity, quarantined) }
    : activityState

  const unavailableAttempts = historyState.tag === "ready" ? historyState.activity.unavailableAttempts : quarantined.map((entry) => ({ id: entry.attemptId, recordedAt: entry.committedAt ?? null, label: entry.kind === "question" ? "Question attempt" : "Visual hazard attempt" }))

  useEffect(() => { if (filteredEmpty) filteredHeadingRef.current?.focus() }, [filteredEmpty])
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    if (request.target === "error") errorHeadingRef.current?.focus()
    if (request.target === "empty") emptyHeadingRef.current?.focus()
    if (request.target === "queue") {
      if (filtered.length > 0) queueHeadingRef.current?.focus()
      else (filteredHeadingRef.current ?? unavailableHeadingRef.current)?.focus()
    }
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest, filtered.length])

  return {
    state: { queue: state, scope, items, filtered, missed, flagged, busy, historyState, unavailableAttempts },
    actions: { setScope, retryHistory: onRetryHistory,
      retry: () => controller.dispatch({ tag: "retry" }),
      rebuild: () => controller.dispatch({ tag: "rebuild" }),
      acknowledge: (itemId: string) => controller.dispatch({ tag: "acknowledge", itemId })
    },
    meta: { errorHeadingRef, emptyHeadingRef, filteredHeadingRef, queueHeadingRef, unavailableHeadingRef }
  }
}
const ReviewContext = createContext<ReturnType<typeof useReviewValue> | null>(null)
export const useReviewQueue = () => {
  const value = use(ReviewContext)
  if (value === null) throw new Error("Review queue pieces require ReviewQueueProvider")
  return value
}
export const ReviewQueueProvider = ({ children, ...props }: ReviewProviderProps & { readonly children: ReactNode }) =>
  <ReviewContext value={useReviewValue(props)}>{children}</ReviewContext>

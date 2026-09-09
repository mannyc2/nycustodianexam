import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { StudyController } from "../controller.ts"
import type { StudyActivityState, StudyBootstrap } from "../model.ts"
import { includeUnavailableReviews } from "../activity.ts"

const compactQuery = "(max-width: 47.99rem)"
const subscribeCompactLayout = (onChange: () => void) => {
  const query = window.matchMedia(compactQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readCompactLayout = () => window.matchMedia(compactQuery).matches
const serverCompactLayout = () => false

export interface StudyProviderProps {
  readonly bootstrap: StudyBootstrap
  readonly controller: StudyController
}
const useStudyValue = ({ bootstrap, controller }: StudyProviderProps) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const { activityState, review } = snapshot.state
  const compact = useSyncExternalStore(subscribeCompactLayout, readCompactLayout, serverCompactLayout)
  const historyState: StudyActivityState = activityState.tag === "ready" && (review.tag === "ready" || review.tag === "recoverable_error")
    ? { tag: "ready", activity: includeUnavailableReviews(activityState.activity, review.quarantined) }
    : activityState
  const activity = historyState.tag === "ready" ? historyState.activity : undefined
  const hasActivity = activity !== undefined && activity.questionCount + activity.hazardCount + activity.unavailableAttempts.length > 0
  const unavailable = activityState.tag === "unavailable"
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    if (request.target === "heading") headingRef.current?.focus()
    else reviewHeadingRef.current?.focus()
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest])
  const initialSectionFocus = useRef(false)
  useEffect(() => {
    if (initialSectionFocus.current || activityState.tag !== "ready" ||
      review.tag === "loading") return
    initialSectionFocus.current = true
    const targetId = window.location.hash.slice(1)
    if (targetId === "practice-builder" || targetId === "covers") {
      const section = document.getElementById(targetId)
      section?.focus({ preventScroll: true })
      section?.scrollIntoView({ block: "start" })
    }
  }, [activityState.tag, review.tag])
  const activityView = hasActivity
    ? { hasActivity: true as const, activity }
    : { hasActivity: false as const, activity }
  return {
    state: { bootstrap, activityState, review, historyState, ...activityView, unavailable, compact, firstPractice: bootstrap.firstPractice },
    actions: controller.actions,
    meta: { headingRef, reviewHeadingRef }
  }
}
const StudyContext = createContext<ReturnType<typeof useStudyValue> | null>(null)
export const useStudy = () => {
  const value = use(StudyContext)
  if (value === null) throw new Error("Study pieces require StudyProvider")
  return value
}
export const StudyProvider = ({ children, ...props }: StudyProviderProps & { readonly children: ReactNode }) =>
  <StudyContext value={useStudyValue(props)}>{children}</StudyContext>

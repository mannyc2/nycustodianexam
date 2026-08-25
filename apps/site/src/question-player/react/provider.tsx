import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode
} from "react"
import {
  QuestionPlayerContext,
  type QuestionActions,
  type QuestionPlayerValue
} from "./context.tsx"
import type { QuestionController } from "../controller.ts"

export const QuestionPlayerProvider = ({
  children,
  controller
}: {
  readonly children: ReactNode
  readonly controller: QuestionController
}) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const instanceId = `question-${controller.question.id}`
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  const outcomeHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const request = snapshot.focusRequest
    if (request?.target === "commit-error") {
      errorHeadingRef.current?.focus()
    } else if (request?.target === "outcome") {
      outcomeHeadingRef.current?.focus()
    }
    if (request !== null) controller.acknowledgeViewRequest(request.id)
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    const request = snapshot.announcementRequest
    if (request !== null) controller.acknowledgeViewRequest(request.id)
  }, [controller, snapshot.announcementRequest])

  const actions: QuestionActions = useMemo(
    () => ({
      selectOption: (optionId) => controller.dispatch({ tag: "select-option", optionId }),
      submitSelection: () => controller.dispatch({ tag: "submit-selection" }),
      retryReveal: () => controller.dispatch({ tag: "retry-reveal" }),
      retryRestore: () => controller.dispatch({ tag: "retry-restore" }),
      toggleFlag: () => controller.dispatch({ tag: "toggle-flag" })
    }),
    [controller]
  )

  const value: QuestionPlayerValue = useMemo(
    () => ({
      question: controller.question,
      state: snapshot.state,
      actions,
      meta: {
        instanceId,
        errorHeadingRef,
        outcomeHeadingRef,
        statusId: `${instanceId}-status`,
        focusRequest: snapshot.focusRequest,
        announcementRequest: snapshot.announcementRequest,
        acknowledgeViewRequest: controller.acknowledgeViewRequest
      }
    }),
    [actions, controller, instanceId, snapshot]
  )

  return <QuestionPlayerContext value={value}>{children}</QuestionPlayerContext>
}

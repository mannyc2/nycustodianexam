import { createContext, use, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { SimulationPlayerController } from "../controller.ts"
import type { QuestionPresentation } from "../../question-presentation.ts"

const usePlayerValue = (controller: SimulationPlayerController) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const errorRef = useRef<HTMLHeadingElement>(null)
  const recoverableErrorRef = useRef<HTMLHeadingElement>(null)
  const confirmationRef = useRef<HTMLHeadingElement>(null)
  const presentationToggleRef = useRef<HTMLButtonElement>(null)
  const actions = useMemo(() => ({
    selectPresentation: (presentation: QuestionPresentation) => controller.dispatch({ tag: "select-presentation", presentation }),
    selectOption: (optionId: string) => controller.dispatch({ tag: "select-option", optionId }),
    addHazardMarker: (x: number, y: number) => controller.dispatch({ tag: "add-hazard-marker", x, y }),
    moveHazardMarker: (markerId: string, deltaX: number, deltaY: number) => controller.dispatch({ tag: "move-hazard-marker", markerId, deltaX, deltaY }),
    removeHazardMarker: (markerId: string) => controller.dispatch({ tag: "remove-hazard-marker", markerId }),
    toggleHazardZone: (zoneOrder: number) => controller.dispatch({ tag: "toggle-hazard-zone", zoneOrder }),
    toggleZeroHazards: () => controller.dispatch({ tag: "toggle-zero-hazards" }),
    toggleFlag: () => controller.dispatch({ tag: "toggle-flag" }),
    openConfirmation: () => controller.dispatch({ tag: "open-confirmation" }),
    cancelConfirmation: () => controller.dispatch({ tag: "cancel-confirmation" }),
    submitFinal: () => controller.dispatch({ tag: "submit-final" }),
    toggleTimer: () => controller.dispatch({ tag: "toggle-timer" }),
    timerExpired: () => controller.dispatch({ tag: "timer-expired" }),
    retrySave: () => controller.dispatch({ tag: "retry-save" }),
    retry: () => controller.dispatch({ tag: "retry" })
  }), [controller])

  useEffect(() => {
    if (snapshot.focusRequest?.target === "presentation-toggle") presentationToggleRef.current?.focus()
    if (snapshot.focusRequest?.target === "error") errorRef.current?.focus()
    if (snapshot.focusRequest?.target === "recoverable-error") recoverableErrorRef.current?.focus()
    if (snapshot.focusRequest?.target === "confirmation") confirmationRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])
  useEffect(() => {
    if (snapshot.announcementRequest !== null) controller.acknowledgeRequest(snapshot.announcementRequest.id)
  }, [controller, snapshot.announcementRequest])
  return { state: snapshot, actions, meta: { errorRef, recoverableErrorRef, confirmationRef, presentationToggleRef } }
}

const SimulationPlayerContext = createContext<ReturnType<typeof usePlayerValue> | null>(null)
export const useSimulationPlayer = () => {
  const value = use(SimulationPlayerContext)
  if (value === null) throw new Error("Simulation player pieces require SimulationPlayerProvider")
  return value
}

export const SimulationPlayerProvider = ({ controller, children }: {
  readonly controller: SimulationPlayerController
  readonly children: ReactNode
}) => <SimulationPlayerContext value={usePlayerValue(controller)}>{children}</SimulationPlayerContext>

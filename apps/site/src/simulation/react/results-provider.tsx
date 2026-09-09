import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { createSimulationResultsController } from "../controller.ts"

export type ResultsController = ReturnType<typeof createSimulationResultsController>
const useResultsValue = (controller: ResultsController) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "results") headingRef.current?.focus()
    if (snapshot.focusRequest?.target === "error") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])
  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])
  return { state: snapshot, actions: { retry: controller.retry }, meta: { headingRef, errorRef } }
}
const SimulationResultsContext = createContext<ReturnType<typeof useResultsValue> | null>(null)
export const useSimulationResults = () => {
  const value = use(SimulationResultsContext)
  if (value === null) throw new Error("Simulation results pieces require SimulationResultsProvider")
  return value
}
export const SimulationResultsProvider = ({ controller, children }: {
  readonly controller: ResultsController
  readonly children: ReactNode
}) => <SimulationResultsContext value={useResultsValue(controller)}>{children}</SimulationResultsContext>

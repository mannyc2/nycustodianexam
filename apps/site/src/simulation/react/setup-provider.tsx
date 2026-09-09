import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { SimulationSetupController } from "../setup-controller.ts"
const useSetupValue = (controller: SimulationSetupController) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const failureRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (snapshot.focusRequest?.target === "failure") failureRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])
  return { state: snapshot.state, actions: controller.actions, meta: { failureRef } }
}
const SetupContext = createContext<ReturnType<typeof useSetupValue> | null>(null)
export const useSimulationSetup = () => {
  const value = use(SetupContext)
  if (value === null) throw new Error("Simulation setup pieces require SimulationSetupProvider")
  return value
}
export const SimulationSetupProvider = ({ controller, children }: { readonly controller: SimulationSetupController; readonly children: ReactNode }) =>
  <SetupContext value={useSetupValue(controller)}>{children}</SetupContext>

import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { HazardBuilderController } from "../hazard-builder-controller.ts"
const useValue = (controller: HazardBuilderController) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const failureRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    failureRef.current?.focus()
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest])
  return { state: snapshot.state, actions: controller.actions, meta: { failureRef } }
}
const BuilderContext = createContext<ReturnType<typeof useValue> | null>(null)
export const useHazardBuilder = () => {
  const value = use(BuilderContext)
  if (value === null) throw new Error("HazardBuilder pieces require HazardBuilderProvider")
  return value
}
export const HazardBuilderProvider = ({ controller, children }: { readonly controller: HazardBuilderController; readonly children: ReactNode }) =>
  <BuilderContext value={useValue(controller)}>{children}</BuilderContext>

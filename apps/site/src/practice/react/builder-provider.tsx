import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { PracticeBuilderController } from "../builder-controller.ts"
const useValue = (controller: PracticeBuilderController) => {
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
export const usePracticeBuilder = () => {
  const value = use(BuilderContext)
  if (value === null) throw new Error("PracticeBuilder pieces require PracticeBuilderProvider")
  return value
}
export const PracticeBuilderProvider = ({ controller, children }: { readonly controller: PracticeBuilderController; readonly children: ReactNode }) =>
  <BuilderContext value={useValue(controller)}>{children}</BuilderContext>

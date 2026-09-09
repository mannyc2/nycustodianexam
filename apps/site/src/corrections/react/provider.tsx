import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { CorrectionController } from "../controller.ts"

const useCorrectionValue = (controller: CorrectionController) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const problemHeading = useRef<HTMLHeadingElement>(null)
  const receiptHeading = useRef<HTMLHeadingElement>(null)
  const formFields = useRef<HTMLFieldSetElement>(null)
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    const targets = { problem: problemHeading, receipt: receiptHeading, form: formFields }
    targets[request.target].current?.focus()
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest])
  return { state: snapshot.state, actions: controller.actions, meta: { problemHeading, receiptHeading, formFields } }
}
const CorrectionContext = createContext<ReturnType<typeof useCorrectionValue> | null>(null)
export const useCorrection = () => {
  const value = use(CorrectionContext)
  if (value === null) throw new Error("Correction pieces require CorrectionProvider")
  return value
}
export const CorrectionProvider = ({ controller, children }: { readonly controller: CorrectionController; readonly children: ReactNode }) =>
  <CorrectionContext value={useCorrectionValue(controller)}>{children}</CorrectionContext>

import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import type { SettingsController } from "../controller.ts"

const useSettingsValue = (controller: SettingsController) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const deleteTrigger = useRef<HTMLButtonElement>(null)
  const actionHeading = useRef<HTMLHeadingElement>(null)
  const problemHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const resetResultHeading = useRef<HTMLHeadingElement>(null)
  const rebuildErrorHeading = useRef<HTMLHeadingElement>(null)
  const rebuildResultHeading = useRef<HTMLHeadingElement>(null)
  const completionHeading = useRef<HTMLHeadingElement>(null)
  const largeText = useRef<HTMLInputElement>(null)
  const reduceMotion = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    const targets = {
      problem: problemHeading, importPreview: resultHeading, resetPreview: resetResultHeading,
      completion: completionHeading, rebuildError: rebuildErrorHeading, rebuildResult: rebuildResultHeading,
      action: actionHeading, deleteTrigger, largeText, reduceMotion
    }
    if (request.target !== "largeText" && request.target !== "reduceMotion" || document.activeElement === document.body) {
      targets[request.target].current?.focus()
    }
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest])
  return {
    state: snapshot.state,
    actions: controller.actions,
    meta: { deleteTrigger, actionHeading, problemHeading, resultHeading, resetResultHeading, rebuildErrorHeading, rebuildResultHeading, completionHeading, largeText, reduceMotion }
  }
}
const SettingsContext = createContext<ReturnType<typeof useSettingsValue> | null>(null)
export const useSettings = () => {
  const value = use(SettingsContext)
  if (value === null) throw new Error("Settings pieces require SettingsProvider")
  return value
}
export const SettingsProvider = ({ controller, children }: { readonly controller: SettingsController; readonly children: ReactNode }) =>
  <SettingsContext value={useSettingsValue(controller)}>{children}</SettingsContext>

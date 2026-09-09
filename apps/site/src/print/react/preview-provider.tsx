import { createContext, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import type { PrintPreviewController, PrintPreviewState } from "../controller.ts"
import type { PrintJobRecord } from "../model.ts"

const readyJob = (state: PrintPreviewState): PrintJobRecord | undefined =>
  state.tag === "preview-ready" || state.tag === "stale" ||
  state.tag === "system-print-requested" || state.tag === "requesting-print" || state.tag === "regenerating" ||
    state.tag === "regenerate-error" || state.tag === "request-print-error"
    ? state.job
    : undefined

const usePrintPreviewValue = ({ controller }: { readonly controller: PrintPreviewController }) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const printDetailsState = useRef<ReadonlyArray<readonly [HTMLDetailsElement, boolean]> | null>(null)
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false)
  const job = readyJob(snapshot.state)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "preview-heading") headingRef.current?.focus()
    if (snapshot.focusRequest?.target === "error-summary") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) controller.acknowledgeViewRequest(snapshot.focusRequest.id)
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])

  useEffect(() => {
    const printMedia = window.matchMedia("print")
    const expandTechnicalDetails = (): void => {
      if (printDetailsState.current !== null) return
      const details = [...(previewRef.current?.querySelectorAll("details") ?? [])]
      printDetailsState.current = details.map((detail) => [detail, detail.open] as const)
      for (const detail of details) detail.open = true
    }
    const restoreTechnicalDetails = (): void => {
      const previous = printDetailsState.current
      if (previous === null) return
      for (const [detail, wasOpen] of previous) {
        if (detail.isConnected) detail.open = wasOpen
      }
      printDetailsState.current = null
    }
    const handlePrintMediaChange = (event: MediaQueryListEvent): void => {
      if (event.matches) expandTechnicalDetails()
      else restoreTechnicalDetails()
    }

    printMedia.addEventListener("change", handlePrintMediaChange)
    window.addEventListener("beforeprint", expandTechnicalDetails)
    window.addEventListener("afterprint", restoreTechnicalDetails)
    if (printMedia.matches) expandTechnicalDetails()

    return () => {
      printMedia.removeEventListener("change", handlePrintMediaChange)
      window.removeEventListener("beforeprint", expandTechnicalDetails)
      window.removeEventListener("afterprint", restoreTechnicalDetails)
      restoreTechnicalDetails()
    }
  }, [job?.id])
  return {
    state: { snapshot, job, inspectionConfirmed },
    actions: { setInspectionConfirmed, retryRestore: controller.retryRestore, regenerate: controller.regenerate, requestSystemPrint: () => { if (inspectionConfirmed) controller.requestSystemPrint() } },
    meta: { headingRef, errorRef, previewRef }
  }
}
const PrintPreviewContext = createContext<ReturnType<typeof usePrintPreviewValue> | null>(null)
export const usePrintPreview = () => {
  const value = use(PrintPreviewContext)
  if (value === null) throw new Error("Print preview pieces require PrintPreviewProvider")
  return value
}
export interface PrintPreviewProviderProps { readonly controller: PrintPreviewController }
export const PrintPreviewProvider = ({ children, ...props }: PrintPreviewProviderProps & { readonly children: ReactNode }) =>
  <PrintPreviewContext value={usePrintPreviewValue(props)}>{children}</PrintPreviewContext>

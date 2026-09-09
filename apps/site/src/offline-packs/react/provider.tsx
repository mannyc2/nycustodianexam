import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { groupOfflinePackRecords, offlinePackAvailabilityState, type OfflineController } from "../controller.ts"

const useOfflineValue = (controller: OfflineController, headerMount: HTMLElement) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getHydrationSnapshot)
  const removalHeading = useRef<HTMLHeadingElement>(null)
  const removalTrigger = useRef<HTMLButtonElement | null>(null)
  const errorHeading = useRef<HTMLHeadingElement>(null)
  const storedPacksHeading = useRef<HTMLHeadingElement>(null)
  const descriptor = controller.descriptor
  const state = snapshot.state
  const availability = offlinePackAvailabilityState(groupOfflinePackRecords(state.packs, descriptor))
  useEffect(() => {
    const request = snapshot.focusRequest
    if (request === null) return
    const targets = { error: errorHeading, removal: removalHeading, removalTrigger, storedPacks: storedPacksHeading }
    targets[request.target].current?.focus()
    controller.acknowledgeRequest(request.id)
  }, [controller, snapshot.focusRequest])
  return {
    state: {
      ...state, descriptor, availability,
      currentShellBuildNeedsStage: availability === "absent" || availability === "retry" || availability === "update-available",
      availableForNewSessions: descriptor.lifecycle !== "retired",
      insufficientCapacity: state.storage.availability === "quota-limited",
      activePack: state.downloadsLoaded ? state.packs.find((pack) => pack.status === "active") : undefined,
      blocked: state.busy !== null || state.persisting
    },
    actions: {
      ...controller.actions,
      previewRemoval: (claimId: string, trigger: HTMLButtonElement) => {
        removalTrigger.current = trigger
        return controller.actions.previewRemoval(claimId)
      }
    },
    meta: { headerMount, removalHeading, errorHeading, storedPacksHeading }
  }
}
const OfflineContext = createContext<ReturnType<typeof useOfflineValue> | null>(null)
export const useOfflinePacks = () => {
  const value = use(OfflineContext)
  if (value === null) throw new Error("Offline pack pieces require OfflineProvider")
  return value
}
export const OfflineProvider = ({ controller, headerMount, children }: { readonly controller: OfflineController; readonly headerMount: HTMLElement; readonly children: ReactNode }) =>
  <OfflineContext value={useOfflineValue(controller, headerMount)}>{children}</OfflineContext>

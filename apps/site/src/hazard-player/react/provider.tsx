import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode
} from "react"
import {
  HazardPlayerContext,
  type HazardActions,
  type HazardPlayerValue
} from "./context.tsx"
import type { HazardController } from "../controller.ts"

export const HazardPlayerProvider = ({
  children,
  controller
}: {
  readonly children: ReactNode
  readonly controller: HazardController
}) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const instanceId = `hazard-${controller.scene.asset.opaqueAssetId}`
  const sceneHeadingRef = useRef<HTMLHeadingElement>(null)
  const zeroHeadingRef = useRef<HTMLHeadingElement>(null)
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  const outcomeHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const request = snapshot.focusRequest
    if (request?.target === "scene-heading") sceneHeadingRef.current?.focus()
    else if (request?.target === "zero-confirm") zeroHeadingRef.current?.focus()
    else if (request?.target === "commit-error") errorHeadingRef.current?.focus()
    else if (request?.target === "outcome") outcomeHeadingRef.current?.focus()
    if (request !== null) controller.acknowledgeViewRequest(request.id)
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    const request = snapshot.announcementRequest
    if (request !== null) controller.acknowledgeViewRequest(request.id)
  }, [controller, snapshot.announcementRequest])

  const actions: HazardActions = useMemo(
    () => ({
      addMarker: (x, y) => controller.dispatch({ tag: "add-marker", x, y }),
      moveMarker: (markerId, deltaX, deltaY) =>
        controller.dispatch({ tag: "move-marker", markerId, deltaX, deltaY }),
      removeMarker: (markerId) => controller.dispatch({ tag: "remove-marker", markerId }),
      toggleZone: (zoneOrder) => controller.dispatch({ tag: "toggle-zone", zoneOrder }),
      requestCommit: () => controller.dispatch({ tag: "request-commit" }),
      confirmZero: () => controller.dispatch({ tag: "confirm-zero" }),
      cancelZero: () => controller.dispatch({ tag: "cancel-zero" }),
      retryCommit: () => controller.dispatch({ tag: "retry-commit" }),
      retryReveal: () => controller.dispatch({ tag: "retry-reveal" }),
      retryRestore: () => controller.dispatch({ tag: "retry-restore" })
    }),
    [controller]
  )

  const value: HazardPlayerValue = useMemo(
    () => ({
      scene: controller.scene,
      mode: controller.mode,
      visualAssetUrl: controller.visualAssetUrl,
      state: snapshot.state,
      actions,
      meta: {
        instanceId,
        sceneHeadingRef,
        zeroHeadingRef,
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

  return <HazardPlayerContext value={value}>{children}</HazardPlayerContext>
}

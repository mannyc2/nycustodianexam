import { createContext, use, type ReactNode, type RefObject } from "react"
import type { HazardScreenState } from "../state.ts"
import type { HazardInputMode, PrecommitScene } from "../attempt.ts"
import type {
  HazardAnnouncementRequest,
  HazardFocusRequest
} from "../view-requests.ts"

export interface HazardActions {
  readonly addMarker: (x: number, y: number) => void
  readonly moveMarker: (markerId: string, deltaX: number, deltaY: number) => void
  readonly removeMarker: (markerId: string) => void
  readonly toggleZone: (zoneOrder: number) => void
  readonly requestCommit: () => void
  readonly confirmZero: () => void
  readonly cancelZero: () => void
  readonly retryCommit: () => void
  readonly retryReveal: () => void
  readonly retryRestore: () => void
}

export interface HazardMeta {
  readonly instanceId: string
  readonly sceneHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly zeroHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly errorHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly outcomeHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly statusId: string
  readonly focusRequest: HazardFocusRequest | null
  readonly announcementRequest: HazardAnnouncementRequest | null
  readonly acknowledgeViewRequest: (requestId: string) => void
}

export interface HazardPlayerValue {
  readonly scene: PrecommitScene
  readonly mode: HazardInputMode
  readonly visualAssetUrl: string | null
  readonly state: HazardScreenState
  readonly actions: HazardActions
  readonly meta: HazardMeta
}

export const HazardPlayerContext = createContext<HazardPlayerValue | null>(null)

export const useHazardPlayer = (): HazardPlayerValue => {
  const value = use(HazardPlayerContext)
  if (value === null) {
    throw new Error("HazardPlayer compound components require HazardPlayer.Provider")
  }
  return value
}

export const HazardPlayerContract = ({
  children,
  value
}: {
  readonly children: ReactNode
  readonly value: HazardPlayerValue
}) => <HazardPlayerContext value={value}>{children}</HazardPlayerContext>

import type {
  AnnouncementRequest,
  FocusRequest
} from "../screen/requests.ts"

export type HazardFocusTarget =
  | "scene-heading"
  | "zero-confirm"
  | "commit-error"
  | "outcome"

export type HazardFocusRequest = FocusRequest<HazardFocusTarget>
export type HazardAnnouncementRequest = AnnouncementRequest

import type {
  AnnouncementRequest,
  FocusRequest
} from "../screen/requests.ts"

export type QuestionFocusTarget = "commit-error" | "outcome"
export type QuestionFocusRequest = FocusRequest<QuestionFocusTarget>
export type QuestionAnnouncementRequest = AnnouncementRequest

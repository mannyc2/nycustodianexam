import type { PrecommitQuestion } from "@nycustodian/content/model"
import {
  createContext,
  use,
  type ReactNode,
  type RefObject
} from "react"
import type { QuestionScreenState } from "../state.ts"
import type {
  QuestionAnnouncementRequest,
  QuestionFocusRequest
} from "../view-requests.ts"

export interface QuestionActions {
  readonly selectOption: (optionId: string) => void
  readonly submitSelection: () => void
  readonly retryReveal: () => void
  readonly retryRestore: () => void
  readonly toggleFlag: () => void
}

export interface QuestionMeta {
  readonly instanceId: string
  readonly errorHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly outcomeHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly statusId: string
  readonly focusRequest: QuestionFocusRequest | null
  readonly announcementRequest: QuestionAnnouncementRequest | null
  readonly acknowledgeViewRequest: (requestId: string) => void
}

export interface QuestionPlayerValue {
  readonly question: PrecommitQuestion
  readonly state: QuestionScreenState
  readonly actions: QuestionActions
  readonly meta: QuestionMeta
}

export const QuestionPlayerContext = createContext<QuestionPlayerValue | null>(null)

export const useQuestionPlayer = (): QuestionPlayerValue => {
  const value = use(QuestionPlayerContext)
  if (value === null) {
    throw new Error("QuestionPlayer compound components require QuestionPlayer.Provider")
  }
  return value
}

export const QuestionPlayerContract = ({
  children,
  value
}: {
  readonly children: ReactNode
  readonly value: QuestionPlayerValue
}) => <QuestionPlayerContext value={value}>{children}</QuestionPlayerContext>

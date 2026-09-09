import type { ReactNode } from "react"
import { useQuestionPlayer } from "./context.tsx"
import {
  QuestionFeedback,
  QuestionStatus
} from "./feedback.tsx"
import {
  QuestionControls,
  QuestionForm,
  QuestionFrame,
  QuestionHeader,
  QuestionOptions,
  QuestionPrompt,
  QuestionVisualBody,
  QuestionNonvisualBody
} from "./question-form.tsx"
import { QuestionPlayerProvider } from "./provider.tsx"

export const QuestionPlayerPieces = {
  Frame: QuestionFrame,
  Header: QuestionHeader,
  Form: QuestionForm,
  Prompt: QuestionPrompt,
  Options: QuestionOptions,
  Controls: QuestionControls,
  Feedback: QuestionFeedback,
  Status: QuestionStatus
} as const

export const QuestionPlayer = {
  Provider: QuestionPlayerProvider,
  VisualBody: QuestionVisualBody,
  NonvisualBody: QuestionNonvisualBody,
  Frame: QuestionPlayerPieces.Frame,
  Header: QuestionPlayerPieces.Header,
  Form: QuestionPlayerPieces.Form,
  Prompt: QuestionPlayerPieces.Prompt,
  Choices: QuestionPlayerPieces.Options,
  CommitAction: QuestionPlayerPieces.Controls,
  Outcome: QuestionPlayerPieces.Feedback,
  CommitStatus: QuestionPlayerPieces.Status
} as const

interface PracticeQuestionProps { readonly positionLabel?: string; readonly nextHref?: string }

export const PracticeQuestion = ({ positionLabel, nextHref, children }: PracticeQuestionProps & { readonly children: ReactNode }) => (
  <QuestionPlayerPieces.Frame>
    <QuestionPlayerPieces.Header {...(positionLabel === undefined ? {} : { positionLabel })} />
    <QuestionPlayerPieces.Prompt>{children}</QuestionPlayerPieces.Prompt>
    <QuestionPlayerPieces.Form>
      <QuestionPlayerPieces.Options />
      <QuestionPlayerPieces.Feedback />
      <QuestionPlayerPieces.Controls {...(nextHref === undefined ? {} : { nextHref })} />
    </QuestionPlayerPieces.Form>
    <QuestionPlayerPieces.Status />
  </QuestionPlayerPieces.Frame>
)

export const PracticeVisualQuestion = (props: PracticeQuestionProps) => (
  <PracticeQuestion {...props}><QuestionPlayer.VisualBody /></PracticeQuestion>
)

export const PracticeNonvisualQuestion = (props: PracticeQuestionProps) => (
  <PracticeQuestion {...props}><QuestionPlayer.NonvisualBody /></PracticeQuestion>
)

export const PracticeQuestionRoute = (props: PracticeQuestionProps) => {
  const { state } = useQuestionPlayer()
  return state.presentation === "nonvisual"
    ? <PracticeNonvisualQuestion {...props} />
    : <PracticeVisualQuestion {...props} />
}

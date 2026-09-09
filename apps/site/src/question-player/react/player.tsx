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

interface PracticeQuestionProps { readonly positionLabel?: string; readonly nextHref?: string; readonly completionLink?: { readonly href: string; readonly label: string } }

export const PracticeQuestion = ({ positionLabel, nextHref, completionLink, children }: PracticeQuestionProps & { readonly children: ReactNode }) => (
  <QuestionPlayerPieces.Frame>
    <QuestionPlayerPieces.Header {...(positionLabel === undefined ? {} : { positionLabel })} />
    <QuestionPlayerPieces.Prompt>{children}</QuestionPlayerPieces.Prompt>
    <QuestionPlayerPieces.Form>
      <QuestionPlayerPieces.Options />
      <QuestionPlayerPieces.Feedback />
      <QuestionPlayerPieces.Controls {...(nextHref === undefined ? {} : { nextHref })} {...(completionLink === undefined ? {} : { completionLink })} />
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

const ReviewQuestionContext = () => {
  const { state } = useQuestionPlayer()
  if (state.tag !== "revealed") return <p className="source-note">Saved review details appear after the exact answer and explanation are restored.</p>
  const reasons = [
    ...(state.reviewIntent === "flagged" ? ["Flagged for review"] : []),
    ...(state.selectedOptionId !== state.payload.correctOptionId ? ["Answered incorrectly"] : [])
  ]
  return <p className="source-note review-question-context"><strong>Saved answer context:</strong> {reasons.length === 0
    ? "No incorrect-answer or flag reason is recorded for this answer."
    : reasons.join("; ") + "."} Opening this explanation does not finish a review.</p>
}

export const ReviewQuestion = ({ children, ...props }: PracticeQuestionProps & { readonly children: ReactNode }) => (
  <PracticeQuestion {...props} completionLink={{ href: "/review/", label: "Return to Review" }}><ReviewQuestionContext />{children}</PracticeQuestion>
)

export const ReviewVisualQuestion = (props: PracticeQuestionProps) => (
  <ReviewQuestion {...props}><QuestionPlayer.VisualBody /></ReviewQuestion>
)

export const ReviewNonvisualQuestion = (props: PracticeQuestionProps) => (
  <ReviewQuestion {...props}><QuestionPlayer.NonvisualBody /></ReviewQuestion>
)

export const ReviewQuestionRoute = (props: PracticeQuestionProps) => {
  const { state } = useQuestionPlayer()
  return state.presentation === "nonvisual"
    ? <ReviewNonvisualQuestion {...props} />
    : <ReviewVisualQuestion {...props} />
}

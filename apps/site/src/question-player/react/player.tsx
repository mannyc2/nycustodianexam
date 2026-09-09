import type { ReactNode } from "react"
import { useQuestionPlayer } from "./context.tsx"
import {
  QuestionFeedback,
  QuestionFeedbackFrame,
  QuestionOutcome,
  QuestionRationales,
  QuestionConfusionFeedback,
  QuestionSources,
  QuestionStatus
} from "./feedback.tsx"
import {
  QuestionControls,
  QuestionPosition,
  QuestionFlagAction,
  QuestionCommitAction,
  QuestionReviewActions,
  QuestionNavigation,
  QuestionSelectionNote,
  QuestionActionBar,
  QuestionSaveNotice,
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
  Position: QuestionPosition,
  FlagAction: QuestionFlagAction,
  CommitAction: QuestionCommitAction,
  ReviewActions: QuestionReviewActions,
  Navigation: QuestionNavigation,
  SelectionNote: QuestionSelectionNote,
  ActionBar: QuestionActionBar,
  SaveNotice: QuestionSaveNotice,
  FeedbackFrame: QuestionFeedbackFrame,
  Outcome: QuestionOutcome,
  Rationales: QuestionRationales,
  ConfusionFeedback: QuestionConfusionFeedback,
  Sources: QuestionSources,
  CommitStatus: QuestionPlayerPieces.Status
} as const

interface PracticeQuestionProps { readonly positionLabel?: string; readonly nextHref?: string; readonly completionLink?: { readonly href: string; readonly label: string } }

export const PracticeQuestion = ({ positionLabel, nextHref, completionLink, children }: PracticeQuestionProps & { readonly children: ReactNode }) => (
  <QuestionPlayerPieces.Frame>
    <QuestionPlayer.Header>
      <QuestionPlayer.Position {...(positionLabel === undefined ? {} : { positionLabel })} />
      <QuestionPlayer.FlagAction />
    </QuestionPlayer.Header>
    <QuestionPlayerPieces.Prompt>{children}</QuestionPlayerPieces.Prompt>
    <QuestionPlayerPieces.Form>
      <QuestionPlayerPieces.Options />
      <QuestionPlayer.FeedbackFrame>
        <QuestionPlayer.Outcome />
        <QuestionPlayer.Rationales />
        <QuestionPlayer.ConfusionFeedback />
        <QuestionPlayer.Sources />
      </QuestionPlayer.FeedbackFrame>
      <QuestionPlayer.SelectionNote />
      <QuestionPlayer.ActionBar>
        <QuestionPlayer.ReviewActions />
        <QuestionPlayer.CommitAction />
        <QuestionPlayer.Navigation {...(nextHref === undefined ? {} : { nextHref })} {...(completionLink === undefined ? {} : { completionLink })} />
        <QuestionPlayer.SaveNotice />
      </QuestionPlayer.ActionBar>
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

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
  QuestionPrompt
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
  Frame: QuestionPlayerPieces.Frame,
  Header: QuestionPlayerPieces.Header,
  Form: QuestionPlayerPieces.Form,
  Prompt: QuestionPlayerPieces.Prompt,
  Choices: QuestionPlayerPieces.Options,
  CommitAction: QuestionPlayerPieces.Controls,
  Outcome: QuestionPlayerPieces.Feedback,
  CommitStatus: QuestionPlayerPieces.Status
} as const

export const PracticeNonvisualQuestion = () => (
  <QuestionPlayerPieces.Frame>
    <QuestionPlayerPieces.Header />
    <QuestionPlayerPieces.Prompt />
    <QuestionPlayerPieces.Form>
      <QuestionPlayerPieces.Options />
      <QuestionPlayerPieces.Controls />
    </QuestionPlayerPieces.Form>
    <QuestionPlayerPieces.Feedback />
    <QuestionPlayerPieces.Status />
  </QuestionPlayerPieces.Frame>
)

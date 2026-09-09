import { keyedContent } from "../../content-keys.ts"
import type { ComponentProps, ReactNode } from "react"
import { QuestionIllustration } from "./illustration.tsx"

type Illustration = ComponentProps<typeof QuestionIllustration>["illustration"]

export const VisualQuestionBody = ({ prompt, illustration, headingId }: {
  readonly prompt: string
  readonly illustration: Illustration
  readonly headingId: string
}) => <><h1 id={headingId}>{prompt}</h1><QuestionIllustration illustration={illustration} /></>

export const NonvisualQuestionBody = ({ illustration, headingId, children }: {
  readonly illustration: Illustration
  readonly headingId: string
  readonly children: ReactNode
}) => {
  const equivalent = illustration?.nonvisualEquivalent
  if (equivalent === undefined) return children
  return <section className="question-nonvisual-body" aria-labelledby={headingId}>
    <h1 id={headingId}>{equivalent.prompt}</h1>
    <ol>{keyedContent(equivalent.observations, text => text).map(({ key, value: text }) => <li key={key}>{text}</li>)}</ol>
  </section>
}

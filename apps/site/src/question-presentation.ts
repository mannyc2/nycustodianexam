import { Schema } from "effect"

export const QuestionPresentation = Schema.Literals(["visual", "nonvisual"])
export type QuestionPresentation = typeof QuestionPresentation.Type
export const questionPresentationFields = (value: { readonly presentation?: QuestionPresentation }) =>
  value.presentation === undefined ? {} : { presentation: value.presentation }

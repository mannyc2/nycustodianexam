import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Option = Schema.Struct({ id: Schema.String, label: Schema.String })
const Question = Schema.Struct({
  id: Schema.String,
  version: Schema.String,
  prompt: Schema.String,
  options: Schema.NonEmptyArray(Option)
})

export const decodeQuestion = Effect.fn("QuestionPlayer.decodeQuestion")((input: unknown) =>
  Schema.decodeUnknownEffect(Question)(input)
)

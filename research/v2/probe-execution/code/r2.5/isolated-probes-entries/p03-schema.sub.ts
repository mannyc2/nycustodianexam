import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Question = Schema.Struct({
  id: Schema.String,
  prompt: Schema.String,
  choices: Schema.NonEmptyArray(Schema.String)
})

const decode = Effect.fn("p03.decode")((input: unknown) =>
  Schema.decodeUnknownEffect(Question)(input)
)

const decoded = Effect.runSync(decode({
  id: "q1", prompt: "p", choices: ["a", "b"]
}))
document.body.dataset.p03 = decoded.id

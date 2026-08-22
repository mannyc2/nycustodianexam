import * as Effect from "effect/Effect"
import { decodeQuestion } from "../effect-schema-boundary.ts"

const valid = {
  id: "q1", version: "2026-08-22",
  prompt: "Which tool loosens a threaded pipe fitting?",
  options: [{ id: "a", label: "Pipe wrench" }, { id: "b", label: "Cup plunger" }]
}
const invalid = { id: "q2", version: 3, prompt: "x", options: [] }

const main = Effect.gen(function*() {
  const ok = yield* decodeQuestion(valid)
  console.log("VALID decoded:", JSON.stringify(ok))
  const bad = yield* Effect.exit(decodeQuestion(invalid))
  console.log("INVALID exit tag:", bad._tag)
  if (bad._tag === "Failure") console.log("INVALID cause:", String(bad.cause).slice(0, 300))
})
await Effect.runPromise(main)

import { Effect, Schema } from "effect"
import {
  IndexedDb,
  IndexedDbDatabase,
  IndexedDbTable,
  IndexedDbVersion
} from "@effect/platform-browser"

const AttemptTable = IndexedDbTable.make({
  name: "attempt",
  schema: Schema.Struct({
    id: Schema.String,
    selected: Schema.String,
    committed: Schema.Boolean
  }),
  keyPath: "id"
})

const V1 = IndexedDbVersion.make(AttemptTable)

class ProbeDatabase extends IndexedDbDatabase.make(V1, (tx) =>
  tx.createObjectStore("attempt")) {}

const program = Effect.gen(function*() {
  const query = yield* ProbeDatabase.getQueryBuilder
  yield* query.withTransaction({ tables: ["attempt"], mode: "readwrite" })(
    query.from("attempt").insert({
      id: "attempt-001",
      selected: "B",
      committed: true
    })
  )
  return yield* query.from("attempt").select()
}).pipe(
  Effect.provide(ProbeDatabase.layer("r23-effect-indexeddb")),
  Effect.provide(IndexedDb.layerWindow)
)

// Intended real-browser entry. Not executed in this lane.
export default program

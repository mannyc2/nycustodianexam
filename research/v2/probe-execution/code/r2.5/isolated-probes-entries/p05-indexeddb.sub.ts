import * as IndexedDb from "@effect/platform-browser/IndexedDb"
import * as IndexedDbDatabase from "@effect/platform-browser/IndexedDbDatabase"
import * as IndexedDbTable from "@effect/platform-browser/IndexedDbTable"
import * as IndexedDbVersion from "@effect/platform-browser/IndexedDbVersion"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

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
    query.from("attempt").insert({ id: "p05", selected: "A", committed: true })
  )
  const rows = yield* query.from("attempt").select()
  return rows.length
}).pipe(
  Effect.provide(ProbeDatabase.layer("p05-db")),
  Effect.provide(IndexedDb.layerWindow)
)

Effect.runPromise(program).then((count) => {
  document.body.dataset.p05 = String(count)
})

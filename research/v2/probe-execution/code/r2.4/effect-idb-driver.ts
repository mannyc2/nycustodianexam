import { Effect } from "effect"
import program from "./browser-indexeddb.ts"
declare global { interface Window { __r24effect: unknown } }
Effect.runPromise(program as Effect.Effect<unknown>).then(
  (rows) => { window.__r24effect = { status: "ok", rows } },
  (err) => { window.__r24effect = { status: "error", error: String(err) } }
)

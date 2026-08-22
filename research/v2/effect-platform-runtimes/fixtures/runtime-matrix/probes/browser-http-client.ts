import { Effect, Fiber, Schema } from "effect"
import { BrowserHttpClient } from "@effect/platform-browser"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"

class Payload extends Schema.Class<Payload>("Payload")({
  ok: Schema.Boolean,
  value: Schema.String
}) {}

const baseUrl = (globalThis as { __R23_HTTP_BASE_URL__?: string }).__R23_HTTP_BASE_URL__ ?? "http://127.0.0.1:8765"

const typedStatusAndDecode = Effect.gen(function*() {
  const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
  return yield* client.get(`${baseUrl}/typed-json`).pipe(
    Effect.flatMap(HttpClientResponse.schemaBodyJson(Payload))
  )
})

const abort = Effect.gen(function*() {
  const client = yield* HttpClient.HttpClient
  const fiber = yield* Effect.fork(client.get(`${baseUrl}/slow`))
  yield* Effect.sleep("25 millis")
  return yield* Fiber.interrupt(fiber)
})

const program = Effect.all({ typedStatusAndDecode, abort }).pipe(
  Effect.provide(BrowserHttpClient.layer)
)

// Intended browser harness entry. Not executed in this lane.
export default program

import { BrowserHttpClient } from "@effect/platform-browser"
import { Effect } from "effect"
import { HttpClient, HttpClientRequest } from "effect/unstable/http"

const program = Effect.gen(function*() {
  yield* HttpClient.HttpClient
  const request = HttpClientRequest.get("https://example.invalid/probe").pipe(
    HttpClientRequest.setHeader("accept", "application/json")
  )
  return request.url
})

Effect.runPromise(program.pipe(Effect.provide(BrowserHttpClient.layerFetch))).then((url) => {
  document.body.dataset.p08 = url
})

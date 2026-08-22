import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient"
import * as Effect from "effect/Effect"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"

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

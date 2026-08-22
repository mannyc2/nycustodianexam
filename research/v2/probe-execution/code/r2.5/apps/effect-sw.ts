/// <reference lib="webworker" />
import { Effect } from "effect"

declare const self: ServiceWorkerGlobalScope

const CACHE = "r25-effect-sw-v1"
const PRECACHE = ["/", "/index.html"]

const precache = Effect.fn("sw.precache")(function*() {
  const cache = yield* Effect.promise(() => caches.open(CACHE))
  yield* Effect.promise(() => cache.addAll(PRECACHE))
})

const cleanup = Effect.fn("sw.cleanup")(function*() {
  const keys = yield* Effect.promise(() => caches.keys())
  yield* Effect.forEach(
    keys.filter((key) => key !== CACHE),
    (key) => Effect.promise(() => caches.delete(key)),
    { discard: true }
  )
})

const respond = Effect.fn("sw.respond")(function*(request: Request) {
  const cached = yield* Effect.promise(() => caches.match(request))
  if (cached !== undefined) return cached
  return yield* Effect.promise(() => fetch(request))
})

self.addEventListener("install", (event) => {
  event.waitUntil(Effect.runPromise(precache()))
})
self.addEventListener("activate", (event) => {
  event.waitUntil(Effect.runPromise(cleanup()))
})
self.addEventListener("fetch", (event) => {
  event.respondWith(Effect.runPromise(respond(event.request)))
})

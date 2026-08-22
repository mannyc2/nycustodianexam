const CACHE_NAME = "r25-native-v1"
const SHELL = ["/"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)))
})

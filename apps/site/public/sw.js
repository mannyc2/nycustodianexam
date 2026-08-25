const shellCache = "nycustodian-shell-__NYCUSTODIAN_CACHE_VERSION__"
const runtimeCache = "nycustodian-runtime-__NYCUSTODIAN_CACHE_VERSION__"
const ownedCachePrefixes = ["nycustodian-shell-", "nycustodian-runtime-"]
const activeCaches = new Set([shellCache, runtimeCache])
const shellUrls = [/*__PRECACHE_ASSETS__*/]

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(shellCache).then((cache) => cache.addAll(shellUrls)),
      caches.open(runtimeCache)
    ])
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              ownedCachePrefixes.some((prefix) => key.startsWith(prefix)) &&
              !activeCaches.has(key)
          )
          .map((key) => caches.delete(key))
      )
    )
  )
})

const matchCurrentCaches = async (request) => {
  const shell = await caches.open(shellCache)
  // Vite and some CDNs vary module responses on Origin. Precache requests do
  // not carry the later module request's Origin header, but the shell closure
  // is already restricted to exact same-origin URLs verified at build time.
  const shellResponse = await shell.match(request, { ignoreVary: true })
  if (shellResponse) return shellResponse

  const runtime = await caches.open(runtimeCache)
  return runtime.match(request)
}

const isAppVerifiedContent = (request) => {
  const url = new URL(request.url)
  return url.origin === self.location.origin &&
    (url.pathname.endsWith(".postcommit.json") || url.pathname.startsWith("/content/assets/"))
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  // Answer payloads and assessed scene assets are cached only after the app has
  // checked their manifest byte length and digest. A generic cache-first write
  // here could make one corrupt HTTP 200 permanently poison later retries.
  if (isAppVerifiedContent(event.request)) {
    event.respondWith(fetch(event.request))
    return
  }
  let cacheWrite = Promise.resolve()
  const response = matchCurrentCaches(event.request).then((cached) => {
    if (cached) return cached
    return fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = networkResponse.clone()
          cacheWrite = caches.open(runtimeCache).then((cache) =>
            cache.put(event.request, copy)
          )
        }
        return networkResponse
      })
      .catch(() =>
        event.request.mode === "navigate"
          ? matchCurrentCaches("/offline.html").then(
              (fallback) => fallback ?? Response.error()
            )
          : Response.error()
      )
  })

  event.respondWith(response)
  event.waitUntil(response.then(() => cacheWrite))
})

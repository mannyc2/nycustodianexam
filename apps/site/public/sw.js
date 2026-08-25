const shellCache = "nycustodian-shell-__NYCUSTODIAN_CACHE_VERSION__"
const runtimeCache = "nycustodian-runtime-__NYCUSTODIAN_CACHE_VERSION__"
const packPointerCache = "nycustodian-pack-pointer-v1"
const packPointerPath = "/__nycustodian_active_pack"
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

const matchActivePack = async (request) => {
  if (await caches.has(packPointerCache)) {
    const pointer = await caches.open(packPointerCache)
    const pointerResponse = await pointer.match(packPointerPath)
    if (pointerResponse) {
      const activePackCacheName = await pointerResponse.text()
      if (activePackCacheName.startsWith("nycustodian-pack-")) {
        const activePack = await caches.open(activePackCacheName)
        const packResponse = await activePack.match(request, { ignoreVary: true })
        if (packResponse) return packResponse
      }
    }
  }
}

const matchCurrentShell = async (request) => {
  const shell = await caches.open(shellCache)
  // Vite and some CDNs vary module responses on Origin. Precache requests do
  // not carry the later module request's Origin header, but the shell closure
  // is already restricted to exact same-origin URLs verified at build time.
  return shell.match(request, { ignoreVary: true })
}

const matchCurrentRuntime = async (request) => {
  const runtime = await caches.open(runtimeCache)
  return runtime.match(request)
}

const localSessionShell = (request) => {
  if (request.mode !== "navigate") return undefined
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return undefined
  if (/^\/simulations\/session\/sim-[a-z0-9][a-z0-9-]{7,63}\/question\/[1-9][0-9]*\/$/.test(url.pathname)) {
    return "/simulations/session/sim-shell0000/question/1/"
  }
  if (/^\/simulations\/session\/sim-[a-z0-9][a-z0-9-]{7,63}\/results\/$/.test(url.pathname)) {
    return "/simulations/session/sim-shell0000/results/"
  }
  if (/^\/print\/preview\/print-[a-z0-9][a-z0-9-]{7,63}\/$/.test(url.pathname)) {
    return "/print/preview/print-shell0000/"
  }
  return undefined
}

const isPackManagedContent = (request) => {
  const url = new URL(request.url)
  return url.origin === self.location.origin &&
    (url.pathname.startsWith("/content/vertical-slice/") ||
      url.pathname.startsWith("/content/assets/"))
}

const bypassesApplicationCaches = (request) => {
  const url = new URL(request.url)
  return request.cache === "no-store" ||
    (url.origin === self.location.origin && url.pathname.startsWith("/api/"))
}

const permitsRuntimeCaching = (response) => {
  const cacheControl = response.headers.get("cache-control") ?? ""
  return !cacheControl.split(",").some((directive) => directive.trim().toLowerCase() === "no-store")
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  if (bypassesApplicationCaches(event.request)) {
    event.respondWith(fetch(event.request))
    return
  }
  // Release artifacts and assessed scene assets enter a pack cache only after
  // the pack manager verifies their receipt. They never enter the generic
  // runtime cache. An explicitly active, exact pack is authoritative for these
  // URLs; callers can still request cache: "no-store" to require the network.
  if (isPackManagedContent(event.request)) {
    event.respondWith(matchActivePack(event.request).then(
      (cached) => cached ?? fetch(event.request)
    ))
    return
  }
  const sessionShell = localSessionShell(event.request)
  if (sessionShell !== undefined) {
    event.respondWith(
      matchCurrentShell(sessionShell).then((cached) => cached ??
        fetch(sessionShell).catch(() =>
          matchCurrentShell("/offline.html").then(
            (fallback) => fallback ?? Response.error()
          )
        ))
    )
    return
  }
  let cacheWrite = Promise.resolve()
  const response = matchCurrentShell(event.request).then((currentShellResponse) => {
    if (currentShellResponse) return currentShellResponse
    return fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse.ok &&
          new URL(event.request.url).origin === self.location.origin &&
          permitsRuntimeCaching(networkResponse)
        ) {
          const copy = networkResponse.clone()
          cacheWrite = caches.open(runtimeCache).then((cache) =>
            cache.put(event.request, copy)
          )
        }
        return networkResponse
      })
      .catch(async () => {
        const currentRuntimeResponse = await matchCurrentRuntime(event.request)
        if (currentRuntimeResponse) return currentRuntimeResponse

        // A retained pack is only an offline fallback for app/navigation URLs;
        // it must never mask the freshly installed shell or an online response.
        const packResponse = await matchActivePack(event.request)
        if (packResponse) return packResponse

        if (event.request.mode === "navigate") {
          return (await matchCurrentShell("/offline.html")) ?? Response.error()
        }
        return Response.error()
      })
  })

  event.respondWith(response)
  event.waitUntil(response.then(() => cacheWrite))
})

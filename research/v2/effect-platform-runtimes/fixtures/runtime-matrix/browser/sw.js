const CACHE_NAME = "r23-sw-v1";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.put("/sw-installed-marker", new Response("installed"));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const cache = await caches.open(CACHE_NAME);
    await cache.put("/sw-activated-marker", new Response("activated"));
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/sw-echo") {
    event.respondWith(Promise.resolve(new Response(JSON.stringify({
      handledBy: "service-worker",
      method: event.request.method
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    })));
  }
});

self.addEventListener("message", (event) => {
  const port = event.ports[0];
  event.waitUntil((async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
    port.postMessage({ messageLifetimeExtended: true });
  })());
});

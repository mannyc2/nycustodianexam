---

# 14. Final architecture recommendation

Use this capability graph:

```text
                    Shared application
                           |
        +------------------+------------------+
        |                  |                  |
 ContentPackSource  ContentRepository  ProgressRepository
        |                  |                  |
        |                  |                  |
   Browser HTTP          IndexedDB          IndexedDB
        |                  |                  |
        +----------- BrowserLive ------------+

Other shared services:

  Preferences
  ContentDigest
  CorrectionGateway
  Clock
  Random

Runtime-specific Layers:

  BrowserLive
  ServiceWorkerLive
  BuildLive
  WorkerLive
  Test
```

Use Effect Platform where it provides a real subsystem:

```text
HttpClient
Stream
Worker
Socket
build-time FileSystem / Path
```

Use project services where domain semantics matter:

```text
content
progress
preferences
integrity
connectivity
corrections
cross-tab coordination
```

Use native APIs where platform semantics should remain visible:

```text
DOM events
URL
Headers at native boundaries
File / Blob
IndexedDB implementation
Cache Storage
Service Worker lifecycle
BroadcastChannel
Web Locks
StorageManager
Web Crypto implementation
Cloudflare env bindings
```

That is the strongest Effect architecture here because it preserves:

* typed domain workflows;
* replaceable runtime adapters;
* real IndexedDB transactions;
* browser lifecycle truth;
* portable use cases;
* small initial dependency surface;
* a clean migration path to Effect v4's broader browser persistence support.

The wrong objective is to maximize the percentage of Web APIs represented by Effect Platform. The correct objective is to make Effect own **application semantics, failures, concurrency, and resource lifetimes** while leaving browser-native protocols visible where their exact behavior is part of correctness.

[1]: https://www.npmjs.com/package/effect?activeTab=versions
[2]: https://www.npmjs.com/package/%40effect%2Fplatform?activeTab=versions
[3]: https://www.npmjs.com/package/%40effect%2Fplatform-browser?activeTab=versions
[4]: https://www.npmjs.com/package/%40effect%2Fplatform-node?activeTab=versions
[5]: https://github.com/Effect-TS/effect/blob/main/packages/effect/package.json
[6]: https://github.com/Effect-TS/effect/tree/main/packages
[7]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[8]: https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
[9]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
[10]: https://effect-ts.github.io/effect/platform/HttpClient.ts.html
[11]: https://effect-ts.github.io/effect/platform-browser/BrowserStream.ts.html
[12]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
[13]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[14]: https://effect-ts.github.io/effect/platform-browser/BrowserKeyValueStore.ts.html
[15]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[16]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
[17]: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
[18]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
[19]: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
[20]: https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
[21]: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
[22]: https://effect-ts.github.io/effect/platform/HttpClientResponse.ts.html
[23]: https://github.com/Effect-TS/effect/blob/main/packages/platform-browser/src/BrowserHttpClient.ts
[24]: https://github.com/Effect-TS/effect/blob/main/MIGRATION.md
[25]: https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/
[26]: https://developers.cloudflare.com/workers/static-assets/
[27]: https://effect-ts.github.io/effect/platform-browser/index.ts.html
[28]: https://developers.cloudflare.com/workers/runtime-apis/cache/
[29]: https://developers.cloudflare.com/workers/runtime-apis/web-workers/

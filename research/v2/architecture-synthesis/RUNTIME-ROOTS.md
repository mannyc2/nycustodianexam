# Runtime roots

## Root matrix

| Root | Entry | Effect boundary | Native authority | Lifetime |
|---|---|---|---|---|
| static site generation | Vite/static build consuming compiler outputs | no browser Effect; Bun build scripts may call compiler as prior command | generated HTML/files | finite build |
| browser player | lazy module creates one `ManagedRuntime` | services/use cases/typed failures | DOM events, focus, viewport, Web values | app/island owner |
| content compiler | `BunRuntime.runMain(compileRelease)` | files/history/hash/write/publish | Bun process exit/signals | finite process |
| service worker | native module listeners | none initially; optional bounded per-event Effect | `waitUntil`, `respondWith`, Cache Storage | browser event-owned |
| optional Cloudflare Worker | native module `fetch(request, env, ctx)` | narrow Schema/use-case only | request/env/context, bindings, streams | request/isolate |
| tests | runner-specific roots | test Layers / exact runtime | browser/workerd/Bun runner semantics | test case/suite |

## Browser page

Static/reference routes contain semantic HTML and no interactive runtime. The
question/hazard/offline-manager entrypoints are separate lazy islands.

The player runtime is created once. DOM handlers translate events to semantic
commands and call the existing runtime. The runtime returns screen outcomes;
render/focus/live-region effects happen at the boundary. Disposal closes the
runtime only when its actual app/island owner ends.

Use native Web values (`Request`, `Response`, `URL`, `Blob`, `File`, streams) as
values. Wrap cohesive policies such as pack download or correction submission,
not every browser API function.

## Bun compiler

The compiler is a first-class app, not a hidden Vite callback. It receives
focused filesystem/path/crypto Layers, executes one finite program, returns a
nonzero process result for operational or publication failure, and never imports
DOM/workerd types.

## Service worker

The worker is not a smaller browser app. It owns response caching and offline
route behavior, not attempt/progress/session/pack activation truth. It may be
terminated after events, so no in-memory fiber or finalizer is correctness
authority. IndexedDB and idempotent protocols remain durable truth.

## Cloudflare

Default deployment is Cloudflare Static Assets with no Worker script. If a
correction endpoint is approved, create a distinct workerd root and workspace,
keep native request/env/context semantics, decode a narrow envelope, call one
Effect use case, enforce body/rate/abuse/idempotency policy, and test with the
workerd-backed toolchain. Do not adopt unstable HttpRouter/HttpApi for one POST.

## False portability prohibitions

- browser Cache Storage is not Cloudflare Cache;
- browser IndexedDB is not D1/KV/R2;
- service-worker fetch events are not module Worker fetch handlers;
- Bun filesystem is not a browser/workerd capability;
- BroadcastChannel and online events are hints, not durable/network truth;
- AbortSignal/Effect interruption is not provider rollback after commit.

# Effect Platform - Browser and Web-API Fit

**Research date:** August 20, 2026

## Executive decision

Effect Platform should be used selectively, not as a mandatory wrapper around the browser.

For `nycustodianexam`, the correct boundary is:

1. Use native Web APIs directly for pure value APIs, UI events, browser lifecycle APIs, and simple one-runtime operations.
2. Introduce project-owned Effect services where the application has meaningful domain semantics, invariants, alternate runtime implementations, or important failure behavior.
3. Use official Effect Platform abstractions where they provide substantial protocol behavior rather than merely renaming a global. The strongest examples are `HttpClient`, selected `KeyValueStore` uses, and potentially `Worker` or `Socket`.
4. Keep browser, build-process, and Cloudflare bindings in separate runtime-specific Layers.

The project may initially need `effect` and `@effect/platform` without needing much of `@effect/platform-browser`. The browser package becomes useful for preferences, optional runtime helpers, and future workers or sockets, but it is not a comprehensive browser-platform package.

---

# 1. Current package reality

| Package                       | Current state on August 20, 2026                                                                                                                                                                                          | Architectural consequence                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `effect`                      | The npm `latest` production line is `3.22.1`. ([npm][1])                                                                                                                                                                  | Use Effect v3 as the production baseline today unless the project explicitly accepts prerelease migration work.                                |
| `@effect/platform`            | Current v3 line is `0.97.1`. It contains generic HTTP, files, paths, KVS, sockets, workers, URL helpers, and related interfaces. ([npm][2])                                                                               | Install only when one of those abstractions is actually used. Import individual modules rather than treating it as a universal platform layer. |
| `@effect/platform-browser`    | Current v3 line is `0.77.1`. ([npm][3])                                                                                                                                                                                   | Production-usable, but narrow. It does not cover most browser APIs in this request.                                                            |
| `@effect/platform-node`       | Current v3 line is `0.108.1`. ([npm][4])                                                                                                                                                                                  | Appropriate for substantial Node build tools. It should never enter the browser dependency graph.                                              |
| Effect v4                     | The official source packages were at `4.0.0-rc.111`. The source has moved into release-candidate numbering, although some official README and migration text still calls it beta. It remains a prerelease.  ([GitHub][5]) | Do not base the initial production persistence architecture on v4 RC-only modules. Re-evaluate when v4 is stable.                              |
| `@effect/platform-browser` v4 | Still exists under the same package name and was also at `4.0.0-rc.111`. It adds browser crypto, persistence, and substantial IndexedDB modules.                                                                          | This is the likely future direction, but it is not yet the stable baseline.                                                                    |
| Cloudflare platform support   | There is no official general `@effect/platform-cloudflare` package in the current platform tree. Official Cloudflare-specific integrations include D1 and Durable Object SQLite packages.   ([GitHub][6])                 | Cloudflare `env` bindings, `ExecutionContext`, Assets, KV, R2, and request handling remain native or project-owned Layers.                     |

## Effect v4 organization

V4 makes a significant packaging change:

* Generic functionality formerly in `@effect/platform`, `@effect/rpc`, and other packages moves into the main `effect` package.
* Platform-specific implementations such as `@effect/platform-browser` and `@effect/platform-node` remain separate.
* All v4 ecosystem packages use matching versions.
* HTTP, persistence, workers, sockets, RPC, SQL, and several other subsystems currently live under `effect/unstable/*`. The migration guide explicitly allows more churn in those namespaces.

Therefore:

> Design project-owned service boundaries that can survive the v3-to-v4 migration, but use stable v3 implementations until v4 and the relevant browser modules are stable.

Do not mix v3 import organization with v4 RC packages.

---

# 2. Decision rule for native APIs versus services

A browser API deserves a project-owned Effect service when at least one of these is true:

* The operation has domain meaning, such as installing a content pack or appending a progress event.
* Several native operations must be atomic.
* Browser, build, Worker, and test implementations differ.
* Native errors need translation into stable application errors.
* The resource has a meaningful lifetime or concurrency policy.
* Tests need to inject behavior rather than merely exercise a pure value.
* The application needs to constrain how the capability may be used.

A direct native API is preferable when:

* It is a deterministic value API such as `URL`.
* It only appears at the browser UI boundary.
* A service would just rename one global method.
* There is no plausible alternate runtime implementation.
* Browser conformance itself is what should be tested.
* An Effect abstraction would erase useful platform semantics.

This distinction is important: **using a native API inside an Effect implementation is still good Effect architecture**. Effect does not require every global to become a `Context.Tag`.

Most of the core APIs in the matrix are mature across current browsers, including Fetch, Headers, File/Blob, Web Streams, WebSocket, Web Crypto, IndexedDB, Cache Storage, Service Workers, AbortSignal, and Web Workers. URLPattern and Cookie Store only reached the newer Baseline 2025 level; BroadcastChannel and Web Locks have been broadly available since 2022. ([MDN Web Docs][7]) ([MDN Web Docs][8])

The `online` and `offline` signals are explicitly only connectivity hints; they do not establish that the application server or a content URL is reachable. ([MDN Web Docs][9])

### Bundle terminology used below

Bundle cost is a qualitative marginal cost over an application already using core Effect and Schema:

* **None:** native API or pure project code.
* **Low:** small adapter or lightweight Effect module.
* **Medium:** HTTP, Stream, Worker, Socket, or another subsystem with meaningful supporting code.
* **High:** a new storage engine, WASM component, protocol stack, or duplicated abstraction.

Exact byte counts require a locked package set and a production Vite build. Package tarball size is not a useful substitute for the tree-shaken browser result.

---

# 3. Capability decision table

| Capability                     | Native                                                                                                                                            | Project Effect service                                                                                                   | Effect Platform                                                                                                                                                                                                                                         | Recommendation                                                                                                                                                   | Why                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |

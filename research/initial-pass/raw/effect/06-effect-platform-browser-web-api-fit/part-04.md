* Direct use throughout domain modules
* Cloudflare `env.ASSETS.fetch()`
* One-off browser operations where `fetch` plus Schema is materially simpler

## Evaluation

| Concern                         | Finding                                                                                                                                                                                                                                                                                                                               | Project decision                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Typed request/response workflow | `HttpClient` gives structured requests, typed transport/response errors, transforms, tracing hooks, and a response object. The payload is not automatically typed until decoded.                                                                                                                                                      | Useful at acquisition/API adapters. Do not expose raw `HttpClientResponse` to domain code.                                              |
| Retries                         | `retry` and `retryTransient` support Effect schedules and bounded attempts. ([Effect TS][10])                                                                                                                                                                                                                                         | Use bounded retries only for immutable/idempotent GET or HEAD requests. Do not blindly retry writes.                                    |
| Timeout                         | Core `Effect.timeout` or `timeoutFail` can cover request execution and response decoding.                                                                                                                                                                                                                                             | Put the timeout around both request and body consumption, not merely receipt of response headers.                                       |
| Interruption                    | The `HttpClient.make` contract receives an `AbortSignal`; the fetch implementation forwards it. ([Effect TS][10])                                                                                                                                                                                                                     | Fiber interruption should cancel the underlying browser request. Do not separately manage an application-wide AbortController.          |
| Status handling                 | Native Fetch resolves for HTTP 4xx and 5xx responses; those are not transport rejections. ([MDN Web Docs][21])                                                                                                                                                                                                                        | Apply `filterStatusOk` or a route-specific status policy before decoding.                                                               |
| Schema response decoding        | `schemaBodyJson`, `schemaJson`, and `schemaHeaders` turn response parsing into typed parse failures. ([Effect TS][22])                                                                                                                                                                                                                | Decode the manifest or pack representation immediately at the adapter boundary. Domain code receives admitted values only.              |
| Testability                     | An `HttpClient` service can be transformed or replaced in adapter tests.                                                                                                                                                                                                                                                              | Domain tests should usually replace `ContentPackSource`, not emulate HTTP. Fake `HttpClient` only when testing the HTTP adapter itself. |
| Browser integration             | In stable v3, browser Fetch integration is the generic `@effect/platform/FetchHttpClient`. Stable `BrowserHttpClient` is the XHR-specific implementation. In v4, the browser module re-exports the fetch Layer as `layerFetch`.  ([GitHub][23])                                                                                       | On v3, use `FetchHttpClient.layer`, not XHR, unless XHR-specific behavior is deliberately needed.                                       |
| Bundle impact                   | HTTP request/response models, error handling, tracing, cookies, headers, and stream support are a meaningful addition. There is no trustworthy universal marginal byte number. The v4 migration guide's approximately 6.3 KB core and 15 KB core-plus-Schema figures do not measure HttpClient and do not describe v3. ([GitHub][24]) | Classify as medium. Measure a locked Vite production build against a native-fetch adapter before final dependency acceptance.           |

## Recommended HTTP boundary

The domain should depend on something conceptually like:

```text
ContentPackSource
  getManifest(channel): Manifest
  downloadPack(reference): EncodedPack
```

The live browser implementation may use `HttpClient`, but:

* Retry policy belongs to the adapter.
* HTTP statuses belong to the adapter.
* ETag and caching policy belong to the adapter.
* Schema decoding belongs to the adapter.
* The domain sees a validated manifest or pack, not a `Response`.
* The repository decides whether and how the admitted pack is installed transactionally.

This preserves the option to replace `HttpClient` with direct native Fetch without changing domain or use-case code.

---

# 5. FileSystem and Path

## Browser runtime

### FileSystem

`@effect/platform/FileSystem` models a path-addressed filesystem with directories, stat information, permissions, links, file handles, temporary files, and related OS semantics.

That model does not belong in the browser application.

Browser operations should instead use:

* `File` and `Blob` for user-selected or generated objects
* IndexedDB for application persistence
* Cache Storage for cached HTTP responses
* File System Access APIs only in a dedicated optional import/export feature
* Object URLs only for temporary browser presentation or download

Do not make `ContentRepository` pretend to be `FileSystem`.

### Path

The generic Effect `Path` service is a POSIX-style path utility usable in multiple environments.

Nevertheless:

* A URL pathname is not a filesystem path.
* An IndexedDB key is not a filesystem path.
* A content-pack identifier is not a filesystem path.
* A Vite asset URL should use `URL`, not `Path`.

Using `Path` in browser code is justified only when the data format itself contains logical POSIX paths, such as archive members or a generated content tree.

## Build-time Node or Bun

This is where Effect FileSystem and Path genuinely fit.

Use `@effect/platform-node` or `@effect/platform-bun` for substantial Effectful tooling that:

* Reads canonical source content
* Validates content directories
* Produces deterministic generated assets
* Builds manifests
* Computes hashes
* Writes print-packet artifacts
* Uses temporary directories
* Executes external tools

For a tiny one-file Vite helper, native `node:fs/promises` and `node:path` may still be simpler. Do not force a Platform abstraction into a script with no sharing, composition, or typed failure benefit.

The key dependency rule is:

> Build modules may depend on Effect `FileSystem` and `Path`; browser modules must not import the Node or Bun implementation packages.

## Cloudflare Worker

Cloudflare now exposes a virtual `node:fs` and Web File System API, but the storage is request-local and ephemeral. Files do not persist or propagate between requests or Workers. ([Cloudflare Docs][25])

Therefore:

* Do not use `@effect/platform-node` merely because Node compatibility exists.
* Do not use Cloudflare's virtual filesystem for durable content, progress, assets, or application state.
* Do not use it as an intermediate abstraction over Assets.
* Prefer `ArrayBuffer`, `Blob`, and streams for request-local transformations.
* Use Assets, D1, KV, R2, or Durable Objects for their intended durable semantics.

Cloudflare Static Assets are served directly without invoking the Worker by default, and an optional `ASSETS` binding can be used when Worker code genuinely needs to fetch an asset. ([Cloudflare Docs][26])

| Runtime           | FileSystem                                                          | Path                                                    |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| Browser           | No Platform FileSystem. Native File/Blob and explicit repositories. | Native URL. Effect Path only for logical archive paths. |
| Build Node/Bun    | Yes, for substantial build tooling.                                 | Yes, for actual disk paths.                             |
| Cloudflare Worker | No durable filesystem. Avoid Node platform package.                 | Usually URL; Path only for request-local logical names. |

---

# 6. KeyValueStore and IndexedDB

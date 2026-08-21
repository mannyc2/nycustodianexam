# Cloudflare workerd HTTP options — Effect v4

## Current upstream status

At `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`, there is no dedicated Cloudflare/workerd runtime package and no Cloudflare-specific source adapter. Current runtime packages include browser, Bun, Deno, Node and node-shared implementations.

This is a useful constraint: workerd should not be treated as Bun/Node merely because Cloudflare supports selected Node compatibility APIs.

## Native Cloudflare boundary

The default runtime root remains Cloudflare's module Worker contract:

```ts
export default {
  async fetch(request, env, ctx) {
    // request-scoped application work
    return new Response(...)
  }
}
```

Keep these semantics truthful:

- `Request` / `Response` are Web boundary values;
- `env` carries Cloudflare bindings, not a generic process environment;
- `ctx.waitUntil()` is the explicit post-response lifetime extension;
- subrequest I/O belongs to the Cloudflare Request Context;
- isolate/module memory is an optimization, not durable authority;
- Cloudflare Cache API semantics remain Cloudflare-specific.

## Option A — native Fetch handler + Effect core

For the project's currently anticipated tiny corrections endpoint, this is the preferred baseline.

```text
fetch(request, env, ctx)
  -> native route/method check
  -> Schema decode untrusted payload
  -> Effect correction use case
       -> narrow binding-backed service
       -> typed expected errors
  -> Effect.runPromise at request boundary
  -> native Response
```

### Benefits

- minimal unstable Effect surface;
- Cloudflare runtime semantics are obvious;
- no server abstraction for a single endpoint;
- easy to remove backend entirely if corrections remain static/manual;
- Effect still owns domain validation, typed failures, dependency injection and resource/concurrency behavior where useful.

### Costs

- manual route/response composition;
- no generated typed client/OpenAPI contract;
- if the API grows, repeated HTTP plumbing may become real complexity.

## Option B — `effect/unstable/http`

Current v4 `HttpEffect.toWebHandler*` converts an Effect HTTP program to a Web handler returning `Promise<Response>`. Structurally that fits a Cloudflare module fetch boundary.

Possible topology:

```text
module fetch
  -> Cloudflare request-scoped services
  -> cached HttpEffect.toWebHandlerLayer(...)
       -> HttpRouter
       -> endpoint Effects
       -> project services
```

### Benefits

- Effect-native HTTP request/response model;
- router/middleware composition;
- request Scope and typed server errors;
- Web Request/Response bridge is already upstream;
- cleaner path if the backend grows beyond one trivial endpoint.

### Risks

- entire HTTP family is under `effect/unstable/http`;
- migration surface includes HttpRouter/HttpServerRequest/Response/middleware internals;
- Cloudflare cancellation must be tested: current `toWebHandler` subscribes to `request.signal` and interrupts the request fiber;
- incoming Worker request-signal behavior is gated by Cloudflare compatibility configuration;
- no official workerd adapter currently owns Cloudflare bindings/context/lifetime semantics.

**Decision:** acceptable behind one server boundary if complexity justifies it; not a default dependency for a one-endpoint backend.

## Option C — `effect/unstable/httpapi`

Current v4 source includes HttpApi models/builders/clients/endpoints/groups/middleware/schema/security and documentation support under `effect/unstable/httpapi`.

This becomes attractive if the project develops a real public API where shared typed contracts matter, for example:

- several endpoint groups;
- generated client contracts;
- OpenAPI/documentation needs;
- consistent typed error/status models;
- shared authentication/middleware;
- substantial browser/server contract reuse.

The current corrections use case does not meet that threshold.

**Decision:** defer. Re-evaluate only after concrete API growth.

## Fetch client inside workerd

Cloudflare's native `fetch` is request-context-sensitive. Do not hide that fact under a long-lived global HTTP service whose correctness assumes unrestricted background I/O.

If an Effect transport service needs subrequests:

```text
Request-scoped RemoteService
  -> native fetch in current Worker request context
```

An unstable `FetchHttpClient` provider is possible, but the service lifetime still must obey workerd Request Context rules.

## Background work

If a request produces non-critical background work:

```text
const promise = Effect.runPromise(backgroundEffect)
ctx.waitUntil(promise)
```

Only use this for work that is valid after the response and within Cloudflare's finite lifetime. Learner-critical local persistence is not a server background concern.

Do not fork an Effect fiber and assume it survives after the handler response if its Promise is not owned by `waitUntil()`.

## Cache API

Cloudflare's `caches` resembles browser Cache Storage syntactically but differs semantically:

- data-center-local;
- Cloudflare caching/header behavior;
- not global durable persistence;
- not the browser's offline cache lifecycle.

Therefore:

```text
Browser PackCache != Cloudflare EdgeCache
```

They may implement higher-level interfaces only if those interfaces describe genuinely shared product behavior. Do not create one low-level `CacheStorage` abstraction merely because both have `match`/`put`-like operations.

## Bindings

Cloudflare storage/services (KV, D1, Durable Objects, R2, service bindings, etc.) should enter Effect as narrow project capabilities when adopted:

```text
CorrectionsRepository
  -> D1/KV/etc binding provider
```

Do not expose raw `env` through the application. Conversely, do not wrap every binding before it has meaningful product semantics.

## Compatibility gates

If unstable Effect HTTP is adopted, pin and test at least:

- Workers compatibility date;
- `enable_request_signal` behavior for incoming `Request.signal` listeners;
- any request-signal passthrough needed for subrequests;
- streamed response/resource-scope behavior;
- client-abort interruption;
- `ctx.waitUntil()` interactions for intentionally backgrounded work.

## Recommendation

Current project baseline:

**native Cloudflare module handler + Schema + Effect use case + narrow binding services.**

Upgrade to unstable Effect HTTP/HttpApi only when server complexity—not portability aesthetics—pays for the migration risk.

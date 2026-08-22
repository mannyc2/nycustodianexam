# Cloudflare HTTP Options

## Product boundary

The maintained product contract justifies at most a very small dynamic backend initially:

- correction submissions;
- optional first-party analytics later;
- possible future announcement/admin refresh tooling.

Static acquisition/reference pages and immutable content assets remain Cloudflare Workers Static Assets where possible.

The correction endpoint requires:

- bounded request size;
- Schema validation;
- idempotency;
- rate limiting;
- no secure/recalled exam content;
- generic non-disclosing security errors;
- privacy-minimal metadata;
- operationally small deployment.

## Option comparison

| Criterion | A. Native module fetch + Effect use case | B. `effect/unstable/http` Web handler | C. `effect/unstable/httpapi` |
|---|---|---|---|
| Boundary truth | Exact Cloudflare `fetch(request, env, ctx)` | Converts Effect HTTP app to Web handler | Converts typed API algebra to server handler |
| Stability | Cloudflare stable Web boundary; Effect core RC | Explicitly unstable HTTP namespace | Explicitly unstable HttpApi namespace |
| Initial code/bundle | Smallest | Larger routing/protocol bridge | Largest contract/routing/tooling surface |
| One correction POST | Excellent fit | More machinery than needed | Poor fit |
| Multiple routes/middleware | Manual but still simple at low count | Strong fit | Strong fit when typed API program exists |
| Schema validation | Call Effect Schema directly | Available inside route | First-class endpoint schemas |
| Typed errors | Small explicit response mapper | HTTP response/error algebra | API error schemas/algebra |
| Generated clients/OpenAPI | No | No automatic requirement | Main differentiator |
| Streaming resource scope | Native streams/manual scope | Source confirms response-stream scope transfer | Available through HTTP stack |
| Request abort | Native signal mapped to request program | Source maps signal to fiber interruption | Uses HTTP bridge path |
| Cold-start risk | Lowest | Must measure Layer/runtime bundle | Highest; must measure |
| Workerd proof in this lane | Type/build only | Blocked | Not attempted |
| Recommendation | **Choose now** | Revisit after real complexity | Do not adopt now |

## Recommended Option A shape

```ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Native method/path/content-length/content-type checks.
    // 2. Decode the bounded body with Effect Schema.
    // 3. Run the narrow correction use case with request-scoped services.
    // 4. Map typed errors to a small non-disclosing response algebra.
    // 5. Return a native Response.
  }
}
```

This does not mean "do not use Effect." It means Effect begins at the meaningful use-case boundary instead of owning a one-route Web adapter for its own sake.

Possible services:

- `CorrectionRepository` if durable storage is introduced;
- `SubmissionRateLimiter` if provider rate limiting is not wholly outside code;
- `CorrectionNotifier` if moderation delivery exists;
- `RequestIdentity` only if a privacy-reviewed identity policy exists.

Do not create generic wrappers around `Request`, `Response`, `Headers`, `URL`, `env`, or `ctx`.

## Option B details

Current v4 source provides a Web handler bridge through `HttpRouter.toWebHandler` / `HttpEffect.toWebHandlerLayerWith`.

Source-confirmed behavior includes:

- lazy Layer build;
- cached handler/runtime construction after first request;
- optional memo map;
- explicit `dispose` function;
- conversion from Web `Request` to Effect server request;
- `Request.signal` abort listener that interrupts the request fiber;
- ClientAbort tracing annotation;
- request Scope closure after response completion;
- Scope transfer to streaming response bodies.

This is valuable when the backend has:

- several routes;
- shared authentication/rate-limit middleware;
- tracing/metrics policy;
- streaming resources;
- enough services that Layer composition clarity outweighs bundle/cold-start cost.

It is not automatically portable to Cloudflare just because it accepts and returns Web values. It still requires a workerd build/runtime test and provider-specific binding adapters.

## Option C details

Use HttpApi only when the project needs a maintained API contract with most of:

- multiple endpoint groups;
- shared endpoint middleware;
- generated clients;
- generated OpenAPI or equivalent documentation;
- common typed success/error schemas;
- versioned server contract;
- team ownership that can absorb unstable API migration.

One internal correction POST does not meet this threshold.

## Runtime and Layer construction

### Recommended topology

Module/isolate scope:

- construct environment-independent Schema, use-case Layers, logger configuration, and runtime once;
- cache the runtime/handler lazily if initialization performs work;
- expose teardown to tests.

Request scope:

- receive `request`, `env`, and `ctx`;
- create request metadata;
- inject binding-backed services for this request/environment;
- run one request fiber;
- close request scope after response or transfer it to a response stream.

Do not:

- rebuild the entire Layer graph on every request;
- capture request-specific `env` values permanently in module scope without proving identity/lifetime;
- store per-user/per-request mutable state globally;
- assume an isolate lives forever.

Cloudflare may reuse isolates and environment objects, but reuse is an optimization, not a durable state contract.

## Bindings

Keep Cloudflare binding identity at the adapter boundary.

Examples:

- a D1 binding may implement `CorrectionRepository`;
- a KV binding may implement a narrow announcement cache if later justified;
- an R2 binding may implement immutable object storage if the static asset model changes;
- a rate-limit binding may implement `SubmissionRateLimiter`.

None is required by the current research. Do not add D1, KV, R2, Durable Objects, or Queues preemptively.

## Abort behavior

The handler should observe `request.signal` where the chosen compatibility date/flag supports incoming abort notification.

Effect bridge behavior can interrupt the request fiber. Correctness still requires:

- correction idempotency keys;
- provider-specific confirmation or read-after-write when outcome is ambiguous;
- no assumption that a queue/database/external request rolled back;
- cleanup finalizers that are safe after partial completion.

The real-browser probe confirms AbortController and server disconnect behavior only. Actual Cloudflare disconnect behavior remains blocked.

## Streaming

The initial correction endpoint should return a small JSON response and should not stream.

For future streaming:

- keep a native `ReadableStream` at the Worker response edge;
- avoid buffering complete large bodies;
- ensure Effect Scope remains open until the stream closes/cancels;
- test client disconnect and backpressure in workerd;
- do not use streaming as a reason to adopt the full HTTP stack before a real need exists.

## Error serialization

Recommended public error classes:

- `invalid_request` with generic validation response;
- `too_large`;
- `rate_limited` with appropriate retry metadata;
- `conflict` for duplicate/idempotency mismatch;
- `temporarily_unavailable`;
- opaque `internal_error` request ID.

Do not serialize:

- Effect Cause internals;
- stack traces;
- provider errors;
- storage keys;
- moderation routing details;
- secure/recalled content.

Log richer internal diagnostics with privacy review and bounded retention.

## Testing

Required split:

1. pure Schema and domain/use-case tests;
2. Effect service/Layer tests with `@effect/vitest`;
3. direct handler tests using native `Request` / `Response`;
4. workerd-backed Workers Vitest tests with bindings;
5. rate-limit, size, malformed body, duplicate idempotency, provider timeout, and client-abort scenarios;
6. bundle and cold/warm measurements.

The Node TypeScript probe included in this lane verifies only the module Worker shape and Web behavior. It records `workerdRuntimeProof: false` and `effectLayerProof: false`.

## Decision

Choose **A: native module fetch handler plus a narrow Effect use case**.

Revisit Option B when backend complexity becomes concrete. Revisit Option C only when there is a real typed API program.

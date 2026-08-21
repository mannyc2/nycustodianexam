# Runtime roots

There is no universal root runtime. Each host owns one graph appropriate to its
lifetime and APIs.

## Bun content compiler

- finite executable;
- app-scoped Layer graph;
- Bun filesystem/process APIs stay in `apps/content-compiler`;
- `packages/content` contains portable models/invariants;
- execute with `BunRuntime.runMain`;
- use `Layer.launch` only if the process is intentionally long-running.

Do not hide the compiler inside Vite callbacks.

## Browser interactive root

```text
page bootstrap
  -> build BrowserAppLayer once
  -> ManagedRuntime.make
  -> host events use runPromise/runFork
  -> dispose when the application owner ends
```

The runtime exists only on interactive pages. Effect code never calls the runtime
to locate services; it yields them from the environment.

Process/application-scoped Layers may include the IndexedDB handle, active-pack
access, attempt/progress/review storage implementation, correction transport,
logging policy, and root-owned subscriptions/background fibers. Per-event values
are Effect inputs, not Layers.

## Imperative DOM/renderer boundary

The boundary converts host events to typed intents and renders screen state. It
must not decide correctness before durable commit, own storage transactions,
calculate review schedules, mutate content/session rules, or construct a runtime
per event.

## Service worker root

- separate Layer/runtime construction from the window;
- no shared Context, fibers, handles, or ManagedRuntime;
- attach event Effects to `respondWith`, `waitUntil`, or equivalent;
- treat module state as disposable;
- use durable storage/messages for coordination;
- keep workflows idempotent because termination may skip cleanup.

A process-wide ManagedRuntime is optional only if proven against the worker
lifecycle. Event-specific scoped Effects are often clearer.

## Cloudflare Worker root

Initial state: no Worker runtime; use Workers Static Assets.

If a correction endpoint is approved, a native fetch boundary decodes the request,
provides request/environment services to one Effect program, and translates typed
results to `Response`. Request values/resources stay request-scoped. `ctx.waitUntil`
owns post-response work. Do not assume finalizers run on eviction.

R2.3 decides whether current Effect HTTP abstractions add enough value over a tiny
native boundary.

## Tests

- pure module tests need no Effect runtime;
- service tests provide purpose-built Layers;
- Effect-time tests use TestClock;
- deterministic assembly tests pass explicit seed/algorithm version;
- host integration tests use host-specific roots;
- unit tests do not import the production root Layer.

## ManagedRuntime decision

Appropriate for a long-lived imperative browser bridge with one owner and explicit
disposal. Not appropriate inside Effect code, per event/request/test, on static
reference pages, or as a repository-wide service locator.

## Layer.launch decision

Appropriate when the whole long-lived process is represented by Layers. It is not
required for a finite compiler or every browser/service-worker event.

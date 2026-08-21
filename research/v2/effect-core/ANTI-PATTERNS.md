# Effect v4 Architecture Anti-Patterns

## Stale Effect v3 patterns

| Do not use | Use instead | Reason |
| --- | --- | --- |
| `Context.Tag`, `Context.GenericTag`, `Effect.Tag`, or `Effect.Service` for project services | `Context.Service` | These are v3 service-definition patterns; v4 consolidates service definitions under `Context.Service`. |
| Auto-generated `.Default` or `.Live` assumptions | Explicit `Layer.effect`, `Layer.succeed`, or scoped Layer values named `layer` and descriptive variants | v4 does not auto-generate those Layers from service constructors. |
| Service `dependencies` metadata | Explicit `Layer.provide` composition | Dependencies should be visible in the Layer graph. |
| Static proxy accessors on service classes | `yield* Service` in a generator | Explicit access preserves generic methods and keeps dependencies visible. |
| `Runtime<R>`, `Effect.runtime`, or `Runtime.run*` | `Context<R>`, `Effect.run*With`, root runners, or a justified `ManagedRuntime` | The v3 Runtime value is removed in v4. |
| `Effect.fork` | `Effect.forkChild` | The v4 name makes parent ownership explicit. |
| `Effect.forkDaemon` | `Effect.forkDetach` | This is the current v4 detached-fiber name; detachment still requires explicit lifetime ownership. |
| `Scope.extend` | `Scope.provide` | This is the v4 name for supplying an existing Scope. |
| A common `@effect/platform` dependency | Core `effect` modules plus the exact platform package required by each app | v4 consolidated common platform modules; runtime packages remain platform-specific. |
| Independently versioned Effect ecosystem packages | One exact aligned v4 version | v4 ecosystem packages are released as a matching set. |

## Service and Layer anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| A package per service | Keep related contracts in `packages/content` or `packages/study`; keep implementations in the owning app. |
| Generic `domain/application/infrastructure` or `ports/adapters` trees imposed everywhere | Feature- and capability-oriented modules with direct dependency direction. |
| `shared`, `common`, or `utils` as an unowned dumping ground | Put code with the feature whose semantics it implements; extract only after a real shared contract appears. |
| Turning every pure function into a service | Keep deterministic transforms, validation, selection, projection, and state transitions as ordinary functions. |
| Wrapping every browser or Bun API preemptively | Wrap only a narrow capability that needs typed errors, replacement, resource ownership, or cross-module policy. |
| One service per IndexedDB object store | Cohesive `ContentStore` and `StudyStore` contracts whose methods match required transactions. |
| A generic project key/value store leaking through portable code | Product operations such as atomic pack activation and answer-plus-checkpoint commit. |
| A global `AppServices` record passed manually | `Context.Service` requirements and a root-composed Layer. |
| Constructing Layers inside service methods or use cases | Define and reuse Layer values at module and runtime-root boundaries. |
| Factory functions that return a new Layer on every call without configuration need | Stable Layer values; parameterized constructors only for real runtime configuration or isolation. |
| Repeated nested `Effect.provide` as the visible architecture | Compose a named root Layer and provide it once. Shared v4 memoization is a safety net, not the design. |
| `Layer.provideMerge` everywhere | `Layer.provide` by default; expose an implementation dependency only when the caller genuinely needs it. |
| Hiding resource acquisition in plain object construction | `Layer.scoped`, `Effect.acquireRelease`, or another scoped constructor with an explicit owner. |
| Exporting raw `IDBDatabase`, `IDBTransaction`, `Response`, DOM, or Bun handles from portable service contracts | Return product values and typed errors; keep host objects in app implementations. |

## `Effect.fn` and control-flow anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| A reusable normal function whose body only returns `Effect.gen` | Named `Effect.fn`. |
| Anonymous spans for important service methods | `Effect.fn("Service.method")` or another stable descriptive name. |
| `Effect.fnUntraced` everywhere | Named traced functions by default; untraced only for justified internal hot paths. |
| Piping the function definition after `Effect.fn` when operators belong to the constructor | Pass supported operators to `Effect.fn`, and pipe returned Effects at call sites when appropriate. |
| `yield* Effect.fail(...)` followed by unreachable statements | `return yield* Effect.fail(...)`. |
| JavaScript `try`/`catch` around yielded Effect failures | Typed Effect recovery such as `catchTag`, `catchTags`, `result`, or explicit cause handling. |
| Running Effects from the middle of Effect code | Compose and return the Effect; call `run*` only at host roots and integration boundaries. |
| Converting every operation to Promise early | Keep Effects lazy internally; bridge to Promise at DOM, service-worker, Cloudflare, or other host APIs. |

## Error anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| String failures | Stable `Schema.TaggedError` variants for expected boundary failures. |
| One giant `AppError` union with no subsystem ownership | Narrow content, storage, transport, study, and compiler error families. |
| Catching all errors and returning an empty/default success | Recover only variants for which the caller has a correct policy. |
| Treating interruption as a normal retryable failure | Preserve interruption so parent Scope and host cancellation work. |
| Converting impossible invariants into expected user errors | Fail as defects with enough diagnostic context; prevent invalid states through Schema and pure constructors. |
| Persisting arbitrary JavaScript exceptions or full unknown causes | Persist stable serializable fields and safe diagnostic summaries. |
| Leaking platform-specific errors through portable service contracts | Normalize once at the implementation boundary. |
| Discarding checksum, version, or object identity when wrapping an error | Retain the fields needed to diagnose, retry, quarantine, or roll back safely. |
| Using a parent error with a generic `unknown` reason | Use a closed tagged reason union only when the abstraction intentionally groups those variants. |

## Scope and concurrency anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| `Effect.forkDetach` for ordinary background work | `forkChild`, `forkScoped`, `forkIn`, or an awaited concurrency combinator. |
| Fire-and-forget Promise calls from event handlers | Return/own the Promise through the host event, `waitUntil`, `respondWith`, or a root-owned fiber. |
| Fibers whose failures are never joined, awaited, logged, or supervised | Define result observation and failure policy at creation. |
| Assuming page unload, service-worker termination, or edge eviction will run finalizers | Make writes atomic and workflows idempotent; treat finalizers as best effort. |
| Holding an IndexedDB transaction open across unrelated asynchronous work | Gather required data first, then perform the smallest atomic transaction. |
| Letting pack activation race with another activation | Serialize activation and validate the complete staged version before one atomic pointer switch. |
| Rebinding an active study session to the newest pack automatically | Pin the session's pack version until the session ends or explicitly migrates. |
| Sharing a window fiber, Context, database handle, or ManagedRuntime with a service worker | Build separate roots in each global realm and share only durable data and portable code. |
| Treating service-worker module state as durable | Persist required state; the user agent may terminate and recreate the worker. |

## Runtime anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| A repository-wide global `ManagedRuntime` imported from arbitrary modules | One runtime root owned by each app entry. |
| Creating `ManagedRuntime` per click, request, message, transaction, or test | Use the existing root Context or event-specific scoped Effect. |
| Using `ManagedRuntime` as a service locator inside Effect code | Request services through the Effect environment. |
| Never disposing a browser or tool `ManagedRuntime` whose resources require cleanup | Give it one owner and call `dispose`/`disposeEffect` when that owner ends. |
| Running both `BrowserRuntime.runMain` and a second ManagedRuntime for the same graph | Choose one integration shape for that graph. |
| Loading an Effect runtime on static reference pages with no interactive behavior | Ship static HTML/CSS and load interactive code only where needed. |
| Hiding the content compiler inside Vite configuration callbacks | Keep a finite Bun app and invoke it explicitly in the build workflow. |
| Creating an empty Cloudflare Worker that only forwards static files | Use Workers Static Assets without a Worker script. |
| Assuming an official Effect Cloudflare platform adapter exists | Use a native module Worker boundary plus core Effect until an official compatible package actually exists and is evaluated. |
| Reusing browser root code unchanged in Cloudflare or a service worker | Define host-specific roots and cancellation/lifetime bridges. |

## Time, randomness, and determinism anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| `Date.now()` scattered through portable study and content logic | Effect Clock at effectful boundaries; pass explicit instants into pure functions. |
| Persisting monotonic clock readings | Persist Unix/UTC instants; use monotonic readings only for elapsed duration. |
| Ambient local timezone assumptions | Store UTC/epoch plus an explicit IANA zone when calendar meaning requires it. |
| `Math.random()` in study selection | Explicit seeded policy or Effect Random for non-durable runs. |
| Depending on Effect Random output for permanent replay compatibility | A project-owned, versioned pure PRNG and seed derivation. |
| Effect Random for tokens, digests, or security-sensitive identifiers | Web Crypto or the owning platform's cryptographic capability. |
| Tests that depend on wall clock or ambient random state | Controlled Clock and explicit seed/test Layer. |

## Dependency and stability anti-patterns

| Anti-pattern | Replacement |
| --- | --- |
| `effect` and platform/test packages on different RCs | One exact root catalog entry set with matching versions. |
| Range pins such as `^4.0.0-rc...` during the v4 prerelease | Exact versions and deliberate upgrade commits. |
| `effect/unstable/*` imports hidden deep in portable packages | An explicit documented decision at the smallest owning boundary with compatibility tests. |
| Adopting `BrowserPersistence.layerIndexedDb` as the product database without transaction analysis | A dedicated storage decision that proves pack activation, append-only attempts, and checkpoint atomicity. |
| Platform packages in `packages/content` or `packages/study` | Platform-neutral core packages; platform packages only in apps and tests that exercise hosts. |
| Production root Layers imported into unit tests | Purpose-built test Layers and test roots. |
| Adding libraries because an earlier Effect v3 memo used them | Re-evaluate against the exact pinned v4 source and current product requirement. |

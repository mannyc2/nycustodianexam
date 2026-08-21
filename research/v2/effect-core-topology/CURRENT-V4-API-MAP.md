# Current Effect v4 API map

Observation date: 2026-08-21

Pinned source: `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`

Package coordinates:

- `effect@4.0.0-rc.111`
- `@effect/platform-bun@4.0.0-rc.111` in the coordinated source tree
- Bun `1.4.0`

The status columns intentionally separate source existence, documented contract,
runtime observation, and project recommendation.

| Capability | Current v4 form | Namespace status | Evidence | Runtime observation | R2.1 use |
| --- | --- | --- | --- | --- | --- |
| Generator programs | `Effect.gen(function*() { ... })` | stable core | CONFIRMED in package source and AI guidance | BLOCKED | Use for multi-step Effects |
| Named effectful functions | `Effect.fn("Name")(function*() { ... })` | stable core | CONFIRMED; guidance says prefer it over functions returning `Effect.gen` | BLOCKED | Use for reusable service/use-case methods |
| Schema models | `Schema.Class`, `Schema.TaggedClass`, structs/unions | stable core | CONFIRMED | BLOCKED | Authoritative boundary and persisted models |
| Expected errors | `Schema.TaggedError<Self>()("Tag", fields)` | stable core | CONFIRMED | BLOCKED | Narrow subsystem error families |
| Services | `Context.Service<Self, Shape>()("id")` | stable core | CONFIRMED | BLOCKED | Cohesive capabilities only |
| Service access | `const service = yield* Service`; `Service.use` for narrow bridges | stable core | CONFIRMED | BLOCKED | Prefer `yield*` inside Effect code |
| Defaulted context | `Context.Reference<T>("id", { defaultValue })` | stable core | CONFIRMED | BLOCKED | Non-durable policy/default configuration only |
| Service identifiers | Stable explicit strings such as `@nycustodianexam/study/AttemptStore` | stable core | CONFIRMED | BLOCKED | Globally descriptive identifiers |
| Layer values | `Layer.succeed`, `Layer.effect`, scoped acquisition inside a Layer | stable core | CONFIRMED | BLOCKED | Explicit implementation ownership |
| Layer composition | `Layer.provide`, `Layer.merge`, `Layer.mergeAll` | stable core | CONFIRMED | BLOCKED | Compose once at each host root |
| Layer memoization | Shared Layer construction is memoized during one build | stable core | CONFIRMED in Layer model/source | BLOCKED | Safety property, not permission to rebuild per event |
| Long-running layer | `Layer.launch(layer)` returns a long-running Effect | stable core | CONFIRMED | BLOCKED | Server/worker process roots only when the whole app is a Layer |
| Resource lifecycle | `Effect.acquireRelease`; Layer-scoped acquisition; finalizers | stable core | CONFIRMED | BLOCKED | Database handles, subscriptions, background resources |
| Scope | `Scope`, `Effect.scoped`, scope-provided finalization | stable core | CONFIRMED | BLOCKED | One owner for each acquired resource |
| Child fibers | `Effect.forkChild`, `Effect.forkScoped`, `Effect.forkIn` | stable core | CONFIRMED | BLOCKED | Structured/background concurrency under a real owner |
| Detached fibers | `Effect.forkDetach` | stable core | CONFIRMED | BLOCKED | Reject by default; use only with explicit lifetime policy |
| Retry/repeat | `Schedule` combinators with `Effect.retry`/repeat operations | stable core | CONFIRMED | BLOCKED | Network retry and bounded background policies |
| Time | `Clock` and `DateTime` | stable core | CONFIRMED | BLOCKED | Effectful time at boundaries; pass explicit instants to pure logic |
| Randomness | `Random` | stable core | CONFIRMED | BLOCKED | Non-durable randomness; not permanent replay algorithm |
| Queueing | `Queue` | stable core | CONFIRMED | BLOCKED | Bounded in-memory coordination only |
| Broadcast | `PubSub` | stable core | CONFIRMED | BLOCKED | In-process fan-out only; not durable cross-realm state |
| Streaming | `Stream` | stable core | CONFIRMED | BLOCKED | Streaming workflows when backpressure/lifecycle justify it |
| Mutable state | `Ref`, `SynchronizedRef`, `SubscriptionRef` | stable core | CONFIRMED | BLOCKED | Ephemeral process state only |
| Browser bridge | `ManagedRuntime.make(layer)` with `runPromise`/`runFork`; dispose by owner | stable core | CONFIRMED | BLOCKED | One browser application runtime, not one per event |
| Bun process entry | `BunRuntime.runMain(effect)` from `@effect/platform-bun` | coordinated platform package | CONFIRMED in source | BLOCKED | Content-compiler executable root |
| Testing clock | `effect/testing` including `TestClock` | stable published export | CONFIRMED in package manifest/source | BLOCKED | Deterministic Effect-time tests |
| Effect Vitest integration | `@effect/vitest` coordinated source package | ecosystem package | SOURCE CONFIRMED; exact install not observed | BLOCKED | Evaluate in R2.8; Bun test remains distinct |

## Material changes from the v3 reports

1. All v3 service-definition forms (`Context.Tag`, `Context.GenericTag`,
   `Effect.Tag`, `Effect.Service`) converge on `Context.Service`.
2. Static proxy accessors are removed. Prefer `yield* Service`; use `Service.use`
   only at deliberately narrow call sites.
3. `Context.Service` does not auto-create `.Default` or `.Live` Layers.
   Implementations and dependencies are wired explicitly with Layer constructors
   and `Layer.provide`.
4. Service `dependencies` metadata is gone; the Layer graph is explicit.
5. `Context.Reference` now uses `Context.Reference<T>(id, options)`.
6. Current forking names make ownership explicit: child/scoped/in-scope/detached.
7. Runtime roots are host-specific. `ManagedRuntime` is an imperative bridge,
   not a universal repository-wide service locator.
8. Platform functionality is organized under current v4 source packages; the
   recommended architecture does not assume an old common `@effect/platform`
   package must wrap every browser API.

## Stability decision

The selected core APIs are release-candidate package APIs but stable exports, not
`effect/unstable/*` namespaces. The project should exact-pin the cohort and isolate
any future unstable adoption at the smallest owning app boundary with upgrade tests.

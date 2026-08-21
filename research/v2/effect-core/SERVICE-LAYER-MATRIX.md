# Service and Layer Matrix

## Rules

1. A service represents a cohesive capability, not a folder or one function.
2. Portable contracts live with the package that owns their product semantics.
3. Platform implementations live in the owning app.
4. Pure deterministic policy remains ordinary data and functions.
5. Layers are composed at runtime roots and are not constructed inside use cases.
6. Expected failures stay typed; defects and interruption are not converted into generic application errors.

## Initial project services

| Capability | Contract owner | Live implementation owner | Primary responsibility | Dependencies | Lifetime | Test strategy |
| --- | --- | --- | --- | --- | --- | --- |
| `ContentStore` | `packages/content` | `apps/site` | Persist validated immutable objects; stage packs; atomically activate a manifest; retain and recover the prior valid version; open version-pinned snapshots for active sessions | App-internal `LocalDatabase`; Clock only when timestamps are product data | Browser app root; transactions are operation-scoped | In-memory contract Layer for portable workflows; IndexedDB integration Layer in site tests |
| `StudyStore` | `packages/study` | `apps/site` | Append attempt events; atomically commit an answer and session checkpoint; read/write materialized progress, review state, sessions, settings, and correction drafts | App-internal `LocalDatabase`; Clock for persisted event instants | Browser app root; transactions are operation-scoped | In-memory contract Layer plus IndexedDB transaction/crash-recovery integration tests |
| `PackSource` | `packages/content` | `apps/site` | Discover a manifest and retrieve immutable content objects by version or digest; expose transport failures without owning validation or activation policy | Native fetch or a deliberately selected HTTP client; optional Clock for retry policy outside the transport method | Browser or service-worker root; each response body is operation-scoped | Deterministic fake Layer with recorded manifests, bytes, delays, and failures |
| `LocalDatabase` | App-internal to `apps/site` | `apps/site` | Open and migrate one IndexedDB database; expose narrowly controlled transaction execution to the two store implementations; close the handle when the owning runtime is disposed | Native IndexedDB | Browser root or termination-safe service-worker cache; transaction Scope is shorter | `fake-indexeddb` or real-browser integration; never exported from a portable package |

### Contract shape rules

- Service methods are named `Effect.fn` values in implementations.
- Contracts return product values and typed errors, not raw `IDBRequest`, `Response`, DOM, or Bun values.
- `ContentStore` and `StudyStore` expose operations aligned with required atomicity. They do not expose a generic key/value API.
- `PackSource` returns bytes or decoded transport envelopes only. Schema decoding, checksum verification, quarantine, compatibility, and activation remain content workflows.
- `LocalDatabase` is an implementation detail. Portable code must not require it.

## Use cases, not additional services

The following should begin as named `Effect.fn` workflows that require the services above:

| Workflow | Requirements | Why it is not a service initially |
| --- | --- | --- |
| Discover and install a content pack | `PackSource`, `ContentStore`, Clock | It is orchestration over existing capabilities and has no independent resource or implementation family. |
| Start or resume a study session | `ContentStore`, `StudyStore` | The policy and state transition are portable functions; services only load and commit state. |
| Commit answer before reveal | `StudyStore` plus pure study transition | Atomic persistence is a store operation; reveal is a result of successful commit, not another capability. |
| Rebuild materialized progress | `StudyStore` plus pure fold | It is a deterministic projection over append-only events. |
| Compile and publish a pack | Bun FileSystem, Bun Path, portable content validators | The finite compiler program can compose built-in capabilities directly. |

Promote one of these workflows to a service only if it gains a real alternate implementation, long-lived state/resource, or independently consumed contract.

## Effect and platform services used directly

| Service or module | Runtime owner | Project use | Project wrapper? |
| --- | --- | --- | --- |
| Clock | All roots and tests | Persisted instants, sleep, retry, timeout, scheduling | No. Add product helpers for timestamp representation, not a `ClockService` wrapper. |
| Random | Study simulations and tests | Seeded ephemeral random choices | No. Durable replay uses a project-owned versioned pure PRNG algorithm. |
| DateTime and `DateTime.CurrentTimeZone` | Browser/compiler roots when calendar interpretation is needed | UTC instants, explicit IANA zones, formatting inputs | No. Provide the intended zone at the root. |
| Effect logging | All roots | Structured operational logs and diagnostics | No custom logger service initially. |
| Bun FileSystem | Content compiler | Source reads, generated output, atomic publication staging | No. Provide `BunFileSystem.layer`. |
| Bun Path | Content compiler | Portable path operations under Bun | No. Provide `BunPath.layer`. |
| BrowserRuntime | Interactive page | Root fiber and pagehide interruption | Root adapter, not a service dependency. |
| BunRuntime | Content compiler | Signal-aware process root, reporting, exit management | Root adapter, not a service dependency. |
| `@effect/vitest` | Tests | Scoped Effect tests and shared test Layers | Test adapter, not production code. |
| Web Crypto | Owning browser/worker adapter | Cryptographic digests and security-sensitive identifiers | Prefer native or official platform capability at the boundary; do not use Random. |
| Native DOM, Cache API, service-worker events | `apps/site` | Host integration | Wrap only the narrow operations that need typed failure, replacement, or lifecycle control. |

Any adoption of `effect/unstable/http`, `effect/unstable/persistence`, or `effect/unstable/workers` requires a separate explicit decision because those paths may break before stable modules do.

## Not separate services initially

| Concern | Initial form |
| --- | --- |
| Content decoding and Schema validation | Pure Schema declarations and decode functions in `packages/content` |
| Checksum comparison and compatibility rules | Pure functions in `packages/content` |
| Session selection and state transitions | Pure functions in `packages/study` |
| Attempt-to-progress projection | Pure fold in `packages/study` |
| Review scheduling policy | Pure, versioned policy in `packages/study` |
| Settings, review queue, correction drafts | Cohesive methods of `StudyStore`, not one service each |
| HTTP retry policy | Named Effect workflow around `PackSource`, not hidden in all transport calls |
| Feature flags | Plain build/runtime configuration until dynamic replacement is required |
| Telemetry | Effect logging first; add a capability only after concrete first-party analytics requirements exist |
| Compiler source readers and writers | Bun FileSystem and Path directly until multiple source or publication backends exist |

## Layer graph

### Browser window

```text
LocalDatabase.layer
  -> ContentStore.layerNoDeps
  -> StudyStore.layerNoDeps

Browser transport
  -> PackSource.layer

BrowserStores
  = merge(ContentStore.layerNoDeps, StudyStore.layerNoDeps)
    then provide(LocalDatabase.layer)

BrowserLive
  = merge(BrowserStores, PackSource.layer, root configuration)
```

`LocalDatabase` is hidden after it is provided. `BrowserLive` exposes only the capabilities required by window workflows. The root Layer value is created once and supplied to one browser root program.

Prefer `BrowserRuntime.runMain` for the initial page architecture. Register DOM listeners with scoped acquisition and feed their events into Effect-managed queues or handlers owned by the root. A single `ManagedRuntime` is an alternative only for an unavoidable repeated imperative callback boundary; it must not become a second graph for the same services.

### Service worker

```text
native install / activate / fetch / message event
  -> event-specific Effect program
  -> event.respondWith(...) and/or event.waitUntil(...)
```

The service worker is a separate realm and runtime owner. It may reuse portable modules and app-local Layer constructors, but never a runtime value or live resource from the window. Cache correctness must survive host termination. A module-level Layer cache is acceptable only when abrupt loss and missing disposal do not affect correctness.

### Content compiler

```text
BunFileSystem.layer
BunPath.layer
compiler configuration
  -> CompilerLive
  -> finite compile-and-publish Effect
  -> BunRuntime.runMain
```

Do not create a generic project runtime Layer merely to re-export these built-in capabilities.

### Future Cloudflare Worker

```text
native module fetch handler
  -> request-specific Effect use case
  -> Promise<Response>

post-response work
  -> ctx.waitUntil(ownedPromise)
```

Request data, bindings, and abort ownership remain request-scoped. Process-wide Layers are justified only for safely reusable resources. No Worker app or Layer exists until a concrete endpoint is approved.

### Tests

- Pure content and study policy uses ordinary Vitest tests.
- Effect workflows use `@effect/vitest` `it.effect`.
- Suite-shared resources use `layer(...)` intentionally.
- Isolation-sensitive tests use `Layer.fresh`, a local memo map, or a fresh test Layer.
- Tests build test roots; they do not import the live browser or compiler root.

## Layer construction checklist

A root Layer is acceptable only when all answers are explicit:

- Which services does it expose?
- Which implementation dependencies does it hide?
- Which resources does its Scope own?
- When and how is it disposed?
- Does any child fiber outlive that Scope?
- Are all Effect ecosystem packages on the exact same v4 version?
- Does it import an unstable module, and is that instability documented and tested?

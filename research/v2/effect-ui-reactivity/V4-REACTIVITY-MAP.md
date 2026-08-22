# Effect v4 reactivity map

Coordinate: `effect@4.0.0-rc.111`, tag commit `648f566d7557e33abd8da8546c42aa93343e2db9`.

## Map

| Surface | Stability at coordinate | Contract | Good fit | Wrong fit | Lifecycle requirement |
|---|---|---|---|---|---|
| `Ref` | stable package surface | fiber-safe mutable value with atomic updates | small process-local workflow state | durable state, DOM field mirror, renderer | none beyond owners of effects that use it |
| `SynchronizedRef` | stable package surface | serializes effectful state updates | effectful critical section around in-memory state | generic form state | keep contention bounded; owner controls lifetime |
| `PubSub` | stable package surface | broadcasts each published value to scoped subscribers; bounded/dropping/sliding/unbounded/replay variants | fan-out events | current-value store, persistence | subscriber acquisition must be scoped; shutdown publisher |
| `Stream` | stable package surface | effectful pull/event source with backpressure and resource semantics | timers, online/offline events, pack progress, observable resources | one-shot button dispatch | run in child scope; interruption/finalizers close source |
| `ManagedRuntime` | stable package surface | builds/caches Layer context and runs many effects until disposal | one app runtime or bounded island runtime | runtime/Layer per event | dispose on app/island teardown |
| `Scope` | stable package surface | lifetime boundary with finalizers | route/island/resource ownership | global unbounded subscriptions | close deterministically on navigation/disposal |
| `effect/unstable/reactivity/Reactivity` | unstable | key invalidation, batching, scoped query/stream reruns; successful mutation invalidation | optional query/cache invalidation adapter | durable store, renderer, universal state graph | query/stream observers scoped; isolate API |
| `Atom` | unstable reactivity namespace | cached reactive value/effect/stream/lifecycle node | localized derived screen/query projection | durable authority, cross-tab truth | mount/subscription and registry disposal |
| `AtomRef` | unstable reactivity namespace | process-local observable mutable cell independent of registry | localized mutable UI projection | IndexedDB replacement | explicit unsubscribe |
| `AtomRegistry` | unstable reactivity namespace | per-registry cache, dependencies, mount, subscribe, set, refresh, reset, idle TTL, disposal | one renderer subtree/island when Atom is justified | implicit global app database | dispose registry or its Layer; no leaked mounts |
| `@effect/atom-react` | RC binding | registry context and React external-store hooks | React application already selected | reason to select React | provider/root cleanup; delayed remount-sensitive disposal |
| `@effect/atom-solid` | RC binding | registry values bridged to Solid signals | Solid application already selected | reason to select Solid | owner cleanup disposes bridge/subscription |
| `@effect/atom-vue` | RC binding | registry values bridged through Vue watch cleanup | Vue application already selected | reason to select Vue | injected/default registry and watch cleanup |

## Reactivity semantics that matter

The Reactivity service is an invalidation coordinator. A mutation invalidates registered keys only after success. Query and stream observers are scoped and rerun when matching keys invalidate. Batching coalesces invalidations. This is useful for stale-data refresh, but it does not grant durability or transactional ordering.

Atoms add cached values and dependency tracking inside one registry. Registry-local state can be recreated, discarded, or held until idle TTL. Therefore an Atom can project durable state, but it cannot define whether an attempt event was committed.

## Production posture

Use stable primitives when their semantics directly match the problem. Do not create one `Ref` per DOM property or one `PubSub` per control. Prefer ordinary immutable TypeScript snapshots for view state.

Treat the unstable reactivity/Atom cohort as an adapter seam:

```text
packages/ui-reactivity-adapter/
  registry.ts
  projections.ts
  renderer-binding.ts
```

The adapter may consume stable application services and produce screen projections. Domain models, persistence transaction semantics, and command contracts must not import unstable reactivity types.

## Bundle implications

Import cost depends on actual closure, tree-shaking, renderer binding, and framework peers. Source presence is not bundle proof. This lane prepared a Vite manifest-closure measurement but could not install or build packages. Numeric adoption gates remain BLOCKED and must be reconciled with R2.5.

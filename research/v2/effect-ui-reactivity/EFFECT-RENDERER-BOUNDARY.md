# Effect and renderer boundary

## Boundary contract

```text
DOM / renderer event
  -> semantic command
  -> dispatch bridge
  -> Effect use case in a long-lived ManagedRuntime
  -> typed result or immutable screen snapshot
  -> render
  -> explicit focus / live-region / scroll effect
```

The command vocabulary is semantic:

```ts
type Command =
  | { readonly type: "SelectAnswer"; readonly optionId: OptionId }
  | { readonly type: "CommitAnswer" }
  | { readonly type: "RetryCommit" }
  | { readonly type: "ToggleFlag" }
  | { readonly type: "NextItem" }
  | { readonly type: "PlaceHazardMarker"; readonly point: ScenePoint }
  | { readonly type: "DisposeIsland" }
```

Do not dispatch `SetButtonDisabled`, `SetCssClass`, or raw pointer movement into Effect.

## Runtime root

Construct services and Layers once:

```ts
const runtime = ManagedRuntime.make(AppLive)

const dispatch = <A>(effect: Effect.Effect<A, AppError, AppServices>) =>
  runtime.runPromise(effect)

addEventListener("pagehide", () => {
  void runtime.dispose()
}, { once: true })
```

In the real application, centralize this bridge. Do not scatter `runPromise` or `runFork`. Do not rebuild a Layer for each click.

For route/island lifetime:

- allocate a child Scope;
- acquire Streams, subscriptions, observers, and renderer roots in that Scope;
- interrupt route fibers and close the Scope on navigation;
- render no later result after disposal.

## Dispatch result

A useful bridge returns one of:

- a typed command result that the controller reduces into a snapshot;
- the next immutable snapshot directly;
- a stable subscription to snapshots owned by the island scope.

One-shot commands should remain one-shot callbacks. Use Stream only for a real sequence. Use PubSub only for genuine fan-out. Use Atom registry only when derived reactive projections reduce renderer integration complexity.

## Focus and live regions

The use case may request a semantic focus intent such as `error`, `outcome`, or `question`. The renderer resolves that intent after rendering the target. It acknowledges the handled revision so stale asynchronous focus work cannot run after a newer snapshot.

The use case or snapshot supplies announcement text. The renderer writes it to the designated live region. Do not encode result correctness in precommit `aria-label`, hidden nodes, data attributes, filenames, or static assets.

## Optional Atom bridge

If Atom is adopted, keep it at the projection boundary:

```text
Effect services / durable repositories
  -> renderer-neutral query/use case
  -> Atom projection in one island registry
  -> framework binding
```

Rules:

- one registry per intentional subtree/island, not an accidental global singleton;
- registry cache is disposable and reconstructable;
- domain/persistence packages do not import Atom;
- durable attempt settlement never depends on an Atom value;
- registry and framework root are disposed together;
- unstable imports are contained in one package/adapter.

## Callback, Stream, or Atom decision

| Need | Bridge |
|---|---|
| button submits one command | callback to named Effect use case |
| restore once | one Effect, then snapshot |
| timer/offline/progress sequence | scoped Stream or event-source service |
| several consumers need every event | scoped PubSub |
| framework subtree needs cached derived reactive queries | optional Atom registry |
| durable/cross-tab authority | IndexedDB service plus explicit synchronization, never Atom/Ref |

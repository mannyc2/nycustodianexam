# Current-v4 code sketches

These are architecture sketches against the pinned source coordinate. They are not
application implementation and were not compiled in this runner.

## Cohesive service and focused Layer

```ts
import { Context, Effect, Layer, Schema } from "effect"

class CommitAttemptError extends Schema.TaggedError<CommitAttemptError>()(
  "CommitAttemptError",
  { attemptId: Schema.String, cause: Schema.Defect() }
) {}

class AttemptStore extends Context.Service<AttemptStore, {
  readonly commitAttemptAndCheckpoint: (
    input: CommitInput
  ) => Effect.Effect<CommittedAttempt, CommitAttemptError>
}>()("@nycustodianexam/study/AttemptStore") {}

const AttemptStoreIndexedDb = Layer.effect(
  AttemptStore,
  Effect.gen(function*() {
    const database = yield* acquireDatabase
    const commitAttemptAndCheckpoint = Effect.fn(
      "AttemptStore.commitAttemptAndCheckpoint"
    )(function*(input: CommitInput) {
      return yield* runAtomicTransaction(database, input)
    })
    return AttemptStore.of({ commitAttemptAndCheckpoint })
  })
)
```

The implementation owns one atomic product operation, not a generic key/value API
or raw transaction escape hatch.

## Pure session assembly

```ts
export const assembleSession = (
  content: ContentSnapshot,
  policy: SessionPolicy,
  seed: SessionSeed,
  history: ReadonlyArray<AttemptSummary>
): SessionPlan => {
  // Pure versioned deterministic algorithm.
}
```

## Context.Reference default

```ts
export const CommitRetryLimit = Context.Reference<number>(
  "@nycustodianexam/study/CommitRetryLimit",
  { defaultValue: () => 2 }
)
```

This is a runtime default, not durable user settings or business state.

## Scoped background resource

```ts
const PackRefreshLayer = Layer.effect(
  PackRefresh,
  Effect.gen(function*() {
    const queue = yield* Queue.bounded<RefreshRequest>(1)
    yield* Effect.forkScoped(
      Stream.fromQueue(queue).pipe(
        Stream.mapEffect(processRefresh),
        Stream.runDrain
      )
    )
    return PackRefresh.of({
      request: (request) => Queue.offer(queue, request)
    })
  })
)
```

## Browser imperative bridge

```ts
const runtime = ManagedRuntime.make(BrowserAppLayer)
button.addEventListener("click", () => {
  void runtime.runPromise(commitSelectedAnswer(intent))
})
await runtime.dispose()
```

## Bun executable

```ts
import { BunRuntime } from "@effect/platform-bun"
BunRuntime.runMain(
  compileContentPack.pipe(Effect.provide(ContentCompilerLayer))
)
```

## Test substitution

```ts
const AttemptStoreTest = Layer.succeed(
  AttemptStore,
  AttemptStore.of({
    commitAttemptAndCheckpoint: (input) =>
      Effect.succeed(fakeCommittedAttempt(input))
  })
)
```

Unit tests provide the test Layer and do not import the production browser root.

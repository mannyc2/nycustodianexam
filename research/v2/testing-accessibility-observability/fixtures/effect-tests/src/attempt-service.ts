import { Context, Effect, Layer } from "effect"

export interface CommitInput {
  readonly attemptId: string
  readonly selectedOptionId: string
}

export interface CommitResult extends CommitInput {
  readonly committedAt: number
}

export class AttemptStore extends Context.Service<AttemptStore, {
  readonly commit: (input: CommitInput) => Effect.Effect<CommitResult>
}>()("@nycustodianexam/r2-8/AttemptStore") {}

export const TestAttemptStore = Layer.succeed(
  AttemptStore,
  AttemptStore.of({
    commit: (input) => Effect.succeed({ ...input, committedAt: 123 })
  })
)

export const commitSelected = Effect.fn("r2-8.commitSelected")(function*(input: CommitInput) {
  const store = yield* AttemptStore
  return yield* store.commit(input)
})

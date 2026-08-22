import { Context, Effect, Layer } from "effect"
import { DuplicateAttemptError } from "./errors.js"

export interface CommitAttempt {
  readonly attemptId: string
  readonly sessionId: string
  readonly questionId: string
  readonly selectedOptionId: string
}

export interface CommittedAttempt extends CommitAttempt {
  readonly committedAt: number
}

export class AttemptStore extends Context.Service<AttemptStore, {
  readonly commitAttempt: (
    input: CommitAttempt
  ) => Effect.Effect<CommittedAttempt, DuplicateAttemptError>
}>()("@nycustodianexam/study/AttemptStore") {
  static readonly layerMemory = Layer.effect(
    AttemptStore,
    Effect.gen(function*() {
      const attempts = new Map<string, CommittedAttempt>()

      const commitAttempt = Effect.fn("AttemptStore.commitAttempt")(
        function*(input: CommitAttempt) {
          if (attempts.has(input.attemptId)) {
            return yield* new DuplicateAttemptError({
              attemptId: input.attemptId
            })
          }

          const committed: CommittedAttempt = {
            ...input,
            committedAt: 0
          }
          attempts.set(input.attemptId, committed)
          return committed
        }
      )

      return AttemptStore.of({ commitAttempt })
    })
  )
}

export const commitSelectedAnswer = Effect.fn("commitSelectedAnswer")(
  function*(input: CommitAttempt) {
    const store = yield* AttemptStore
    return yield* store.commitAttempt(input)
  }
)

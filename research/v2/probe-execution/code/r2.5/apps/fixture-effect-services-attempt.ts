import { Context, Effect, Layer, ManagedRuntime, Schema } from "effect"

export class CommitRejected extends Schema.TaggedError<CommitRejected>()("CommitRejected", {
  reason: Schema.String
}) {}

export interface CommittedAttempt {
  readonly questionId: string
  readonly selectedIndex: number
  readonly correct: boolean
}

export class AttemptService extends Context.Service<AttemptService, {
  readonly commit: (questionId: string, selectedIndex: number, correctIndex: number) => Effect.Effect<CommittedAttempt, CommitRejected>
}>()("r25/AttemptService") {}

export const AttemptServiceLive = Layer.succeed(
  AttemptService,
  AttemptService.of({
    commit: Effect.fn("AttemptService.commit")(function*(questionId, selectedIndex, correctIndex) {
      if (selectedIndex < 0) {
        return yield* new CommitRejected({ reason: "no selection" })
      }
      return { questionId, selectedIndex, correct: selectedIndex === correctIndex }
    })
  })
)

const runtime = ManagedRuntime.make(AttemptServiceLive)

export const commitAttempt = (
  questionId: string,
  selectedIndex: number,
  correctIndex: number
): Promise<CommittedAttempt> =>
  runtime.runPromise(Effect.gen(function*() {
    const service = yield* AttemptService
    return yield* service.commit(questionId, selectedIndex, correctIndex)
  }))

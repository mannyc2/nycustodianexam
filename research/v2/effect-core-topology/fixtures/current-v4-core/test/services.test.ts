import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import {
  AttemptStore,
  commitSelectedAnswer,
  type CommittedAttempt
} from "../src/services.js"

describe("Layer substitution", () => {
  test("uses a purpose-built test Layer", async () => {
    const expected: CommittedAttempt = {
      attemptId: "test-attempt",
      sessionId: "test-session",
      questionId: "test-question",
      selectedOptionId: "test-option",
      committedAt: 123
    }

    const layerTest = Layer.succeed(
      AttemptStore,
      AttemptStore.of({
        commitAttempt: () => Effect.succeed(expected)
      })
    )

    const actual = await Effect.runPromise(
      commitSelectedAnswer({
        attemptId: "ignored",
        sessionId: "ignored",
        questionId: "ignored",
        selectedOptionId: "ignored"
      }).pipe(
        Effect.provide(layerTest)
      )
    )

    expect(actual).toEqual(expected)
  })
})

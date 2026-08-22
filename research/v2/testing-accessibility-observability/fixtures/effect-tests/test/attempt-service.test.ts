import { assert, it } from "@effect/vitest"
import { Effect, Fiber, Random } from "effect"
import { TestClock } from "effect/testing"
import { commitSelected, TestAttemptStore } from "../src/attempt-service.js"

it.effect("substitutes a test Layer", () =>
  commitSelected({ attemptId: "a-1", selectedOptionId: "o-2" }).pipe(
    Effect.provide(TestAttemptStore),
    Effect.tap((result) => Effect.sync(() => assert.strictEqual(result.committedAt, 123)))
  ))

it.effect("uses deterministic seeded random", () =>
  Effect.gen(function*() {
    const first = yield* Random.nextInt
    const second = yield* Random.nextInt
    assert.notStrictEqual(first, second)
  }).pipe(Random.withSeed("r2-8")))

it.effect("advances time without wall-clock sleep", () =>
  Effect.gen(function*() {
    let done = false
    const fiber = yield* Effect.gen(function*() {
      yield* Effect.sleep("1 minute")
      done = true
    }).pipe(Effect.forkChild)
    yield* TestClock.adjust("1 minute")
    yield* Fiber.join(fiber)
    assert.strictEqual(done, true)
  }).pipe(Effect.provide(TestClock.layer())))

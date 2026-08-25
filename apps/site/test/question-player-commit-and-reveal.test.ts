import { it } from "@effect/vitest"
import { deepStrictEqual, strictEqual } from "@effect/vitest/utils"
import { Effect, Layer } from "effect"
import { questionAttemptId, type QuestionAttemptReceipt } from "../src/attempt-receipt.ts"
import { QuestionAttemptRecord, QuestionPersistence } from "../src/question-player/persistence.ts"
import {
  commitSelectionAndReveal,
  restoreSelectionAndReveal
} from "../src/question-player/commit-and-reveal.ts"
import {
  VerifiedContent,
  VerifiedContentUnavailable
} from "../src/verified-content.ts"

const postcommitPayload = (id = "q-1") => ({
  schemaVersion: 1,
  id,
  correctOptionId: "b",
  rationales: [
    { optionId: "a", message: "No" },
    { optionId: "b", message: "Yes" }
  ],
  sources: [{ id: "s-1", label: "Source", locator: "docs/source.md#L1" }]
})

const noAttempts = () => Effect.succeed([])

const receipt: QuestionAttemptReceipt = {
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  postcommitPath: "/content/vertical-slice/questions/q-1.postcommit.json",
  postcommitBytes: 100,
  postcommitSha256: "a".repeat(64),
  questionId: "q-1"
}

const attempt = (
  input: Parameters<QuestionPersistence["Service"]["commitAttempt"]>[0]
): QuestionAttemptRecord => new QuestionAttemptRecord({
  id: questionAttemptId(input.receipt),
  questionId: input.receipt.questionId,
  selectedOptionId: input.selectedOptionId,
  reviewIntent: input.reviewIntent,
  committedAt: 1,
  receipt: input.receipt,
  optionIds: [...input.optionIds]
})

const verifiedLayer = (input: {
  readonly loadJson: () => unknown
  readonly onEnsure?: () => void
  readonly unavailable?: VerifiedContentUnavailable
}) => Layer.succeed(
  VerifiedContent,
  VerifiedContent.of({
    ensureAssetAvailable: () => Effect.die("not used"),
    ensureAvailable: (current) => {
      input.onEnsure?.()
      return input.unavailable === undefined
        ? Effect.succeed({ path: current.postcommitPath, source: "network-required" as const })
        : Effect.fail(input.unavailable)
    },
    loadAssetBlob: () => Effect.die("not used"),
    loadJson: () => Effect.sync(input.loadJson)
  })
)

it.effect("loads answer material only after the durable commit settles", () => {
  const sequence: Array<"availability" | "commit" | "load"> = []
  const testLayer = Layer.mergeAll(
    verifiedLayer({
      onEnsure: () => sequence.push("availability"),
      loadJson: () => {
        sequence.push("load")
        return postcommitPayload()
      }
    }),
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: (input) =>
          Effect.sync(() => {
            sequence.push("commit")
            return attempt(input)
          }),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: noAttempts
      })
    )
  )

  return Effect.gen(function*() {
    const result = yield* commitSelectionAndReveal({
      receipt,
      optionIds: ["a", "b"],
      selectedOptionId: "b",
      reviewIntent: "unflagged"
    }).pipe(Effect.provide(testLayer))

    strictEqual(result.tag, "revealed")
    deepStrictEqual(sequence, ["availability", "commit", "load"])
  })
})

it.effect("fails closed when the answer payload belongs to another question", () => {
  let commitCount = 0
  const testLayer = Layer.mergeAll(
    verifiedLayer({ loadJson: () => postcommitPayload("q-other") }),
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: (input) =>
          Effect.sync(() => {
            commitCount += 1
            return attempt(input)
          }),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: noAttempts
      })
    )
  )

  return Effect.gen(function*() {
    const result = yield* commitSelectionAndReveal({
      receipt,
      optionIds: ["a", "b"],
      selectedOptionId: "b",
      reviewIntent: "unflagged"
    }).pipe(Effect.provide(testLayer))

    strictEqual(commitCount, 1)
    strictEqual(result.tag, "reveal_failed")
    if (result.tag === "reveal_failed") {
      strictEqual(result.error._tag, "RevealContentMismatch")
      strictEqual(result.error.detail, "The saved explanation did not match this question.")
    }
  })
})

it.effect("fails closed when rationale references do not close over the available choices", () => {
  const testLayer = Layer.mergeAll(
    verifiedLayer({
      loadJson: () => ({
        ...postcommitPayload(),
        rationales: [{ optionId: "b", message: "Yes" }]
      })
    }),
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: (input) =>
          Effect.succeed(attempt(input)),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: noAttempts
      })
    )
  )

  return Effect.gen(function*() {
    const result = yield* commitSelectionAndReveal({
      receipt,
      optionIds: ["a", "b"],
      selectedOptionId: "b",
      reviewIntent: "unflagged"
    }).pipe(Effect.provide(testLayer))

    strictEqual(result.tag, "reveal_failed")
    if (result.tag === "reveal_failed") {
      strictEqual(result.error._tag, "RevealContentMismatch")
      strictEqual(
        result.error.detail,
        "The saved explanation was incomplete or did not match the available answer choices."
      )
    }
  })
})

it.effect("does not persist when the exact feedback becomes unavailable before commit", () => {
  let commitCount = 0
  let loadCount = 0
  const unavailable = new VerifiedContentUnavailable({
    reason: "known-offline-miss",
    detail: "offline",
    path: receipt.postcommitPath,
    cause: new Error("offline")
  })
  const testLayer = Layer.mergeAll(
    verifiedLayer({
      loadJson: () => {
        loadCount += 1
        return postcommitPayload()
      },
      unavailable
    }),
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: (input) => Effect.sync(() => {
          commitCount += 1
          return attempt(input)
        }),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: noAttempts
      })
    )
  )

  return Effect.gen(function*() {
    const result = yield* commitSelectionAndReveal({
      receipt,
      optionIds: ["a", "b"],
      selectedOptionId: "b",
      reviewIntent: "unflagged"
    }).pipe(Effect.provide(testLayer))

    strictEqual(result.tag, "content_unavailable")
    strictEqual(commitCount, 0)
    strictEqual(loadCount, 0)
  })
})

it.effect("preflights an unanswered restore without loading answer bytes", () => {
  let ensureCount = 0
  let loadCount = 0
  const testLayer = Layer.mergeAll(
    verifiedLayer({
      onEnsure: () => {
        ensureCount += 1
      },
      loadJson: () => {
        loadCount += 1
        return postcommitPayload()
      }
    }),
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: (input) => Effect.succeed(attempt(input)),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: noAttempts
      })
    )
  )

  return Effect.gen(function*() {
    const restored = yield* restoreSelectionAndReveal({
      receipt,
      optionIds: ["a", "b"]
    }).pipe(Effect.provide(testLayer))

    strictEqual(restored, undefined)
    strictEqual(ensureCount, 1)
    strictEqual(loadCount, 0)
  })
})

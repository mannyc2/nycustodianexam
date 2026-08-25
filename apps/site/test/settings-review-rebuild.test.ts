import { describe, expect, it } from "@effect/vitest"
import { PostcommitQuestion } from "@nycustodian/content/model"
import { Effect, Layer, Schema } from "effect"
import {
  questionAttemptId,
  type QuestionAttemptReceipt
} from "../src/attempt-receipt.ts"
import {
  HazardPersistence
} from "../src/hazard-player/persistence.ts"
import {
  QuestionAttemptRecord,
  QuestionPersistence
} from "../src/question-player/persistence.ts"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import {
  ReviewAcknowledgementRecord,
  ReviewPersistence,
  reviewAcknowledgementId
} from "../src/review/persistence.ts"
import { rebuildReviewProjection } from "../src/settings/review-rebuild.ts"
import { VerifiedContent } from "../src/verified-content.ts"

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

const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)({
  schemaVersion: 1,
  questions: [{
    id: "q-1",
    optionIds: ["a", "b"],
    receipt,
    itemUrl: "/review/session/release-1/item/1/"
  }],
  scenes: []
})

const attempt = new QuestionAttemptRecord({
  id: questionAttemptId(receipt),
  questionId: receipt.questionId,
  selectedOptionId: "b",
  reviewIntent: "flagged",
  committedAt: 1,
  receipt,
  optionIds: ["a", "b"]
})

const feedback = Schema.decodeUnknownSync(PostcommitQuestion)({
  schemaVersion: 2,
  id: receipt.questionId,
  version: 1,
  optionConceptIds: [
    { optionId: "a", conceptId: "tool-a" },
    { optionId: "b", conceptId: "tool-b" }
  ],
  correctOptionId: "b",
  rationales: [
    { optionId: "a", message: "Distractor rationale", claimIds: ["claim-1"] },
    { optionId: "b", message: "Correct rationale", claimIds: ["claim-1"] }
  ],
  claims: [{
    id: "claim-1",
    text: "The current feedback claim is supported by the source receipt.",
    sourceLineIds: ["line-1"],
    evidenceTier: "maintained-editorial-synthesis",
    caveat: null
  }],
  sources: [{
    id: "line-1",
    sourceId: "source-1",
    title: "Source",
    publisher: "Publisher",
    evidenceTier: "maintained-editorial-synthesis",
    version: "1",
    rightsNotes: "Project-authored test source.",
    locator: "section 1",
    excerpt: "The current feedback claim is supported by the source receipt.",
    language: "en",
    verifiedOn: "2026-08-25",
    supportedClaimIds: ["claim-1"]
  }]
})

interface Counters {
  hazardReads: number
  questionReads: number
  reviewReads: number
  feedbackReads: number
  writes: number
}

const layerFor = (counters: Counters) => Layer.mergeAll(
  Layer.succeed(
    QuestionPersistence,
    QuestionPersistence.of({
      commitAttempt: () => Effect.sync(() => {
        counters.writes += 1
        return attempt
      }),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: () => Effect.sync(() => {
        counters.questionReads += 1
        return [attempt]
      })
    })
  ),
  Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: () => Effect.die("unexpected hazard write"),
      findAttempt: () => Effect.succeed(undefined),
      completeAttempt: () => Effect.die("unexpected hazard write"),
      listAttempts: () => Effect.sync(() => {
        counters.hazardReads += 1
        return []
      })
    })
  ),
  Layer.succeed(
    ReviewPersistence,
    ReviewPersistence.of({
      acknowledge: (input) => Effect.sync(() => {
        counters.writes += 1
        return new ReviewAcknowledgementRecord({
          id: reviewAcknowledgementId(input),
          itemId: input.itemId,
          attemptId: input.attemptId,
          reasonIds: input.reasonIds as readonly [string, ...Array<string>],
          acknowledgedAt: 2
        })
      }),
      listAcknowledgements: () => Effect.sync(() => {
        counters.reviewReads += 1
        return []
      })
    })
  ),
  Layer.succeed(
    VerifiedContent,
    VerifiedContent.of({
      ensureAssetAvailable: () => Effect.die("not used"),
      ensureAvailable: () => Effect.die("not used"),
      loadAssetBlob: () => Effect.die("not used"),
      loadCachedAssetBlob: () => Effect.die("not used"),
      loadCachedJson: () => Effect.die("not used"),
      loadJsonArtifact: () => Effect.die("not used"),
      loadJson: () => Effect.sync(() => {
        counters.feedbackReads += 1
        return feedback
      })
    })
  )
)

describe("settings review projection rebuild", () => {
  it.effect("is a repeatable read of the canonical projection with no event writes", () => {
    const counters: Counters = {
      hazardReads: 0,
      questionReads: 0,
      reviewReads: 0,
      feedbackReads: 0,
      writes: 0
    }
    return Effect.gen(function*() {
      const first = yield* rebuildReviewProjection(bootstrap)
      const second = yield* rebuildReviewProjection(bootstrap)

      expect(first).toEqual({
        attemptsRead: 1,
        dueItems: 1,
        quarantinedAttempts: 0
      })
      expect(second).toEqual(first)
      expect(counters).toEqual({
        hazardReads: 2,
        questionReads: 2,
        reviewReads: 2,
        feedbackReads: 2,
        writes: 0
      })
    }).pipe(Effect.provide(layerFor(counters)))
  })
})

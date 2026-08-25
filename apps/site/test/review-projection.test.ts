import { describe, expect, it } from "@effect/vitest"
import {
  PostcommitQuestion,
  PostcommitScene,
  PrecommitScene
} from "@nycustodian/content/model"
import { Effect, Layer, Schema } from "effect"
import {
  hazardAttemptId,
  questionAttemptId,
  type HazardAttemptReceipt,
  type QuestionAttemptReceipt
} from "../src/attempt-receipt.ts"
import {
  HazardAttemptRecord,
  HazardPersistence
} from "../src/hazard-player/persistence.ts"
import { QuestionAttemptRecord, QuestionPersistence } from "../src/question-player/persistence.ts"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import { VerifiedContent } from "../src/verified-content.ts"
import {
  ReviewAcknowledgementRecord,
  ReviewPersistence,
  reviewAcknowledgementId
} from "../src/review/persistence.ts"
import {
  acknowledgeReviewItem,
  buildReviewQueue,
  deriveQuestionReviewItem,
  reviewReasonId
} from "../src/review/projection.ts"

const sha = "a".repeat(64)

const scene: typeof PrecommitScene.Type = {
  id: "s001",
  environment: "hallway",
  asset: {
    opaqueAssetId: "s001",
    revision: 1,
    masterSha256: sha,
    derivatives: [
      {
        kind: "web",
        path: "content/assets/derivatives/scenes/s001-web.png",
        bytes: 100,
        sha256: sha
      }
    ]
  },
  neutralPreAnswer: {
    overview: "A hallway with two observable areas.",
    zones: [
      { order: 1, label: "floor", description: "A tiled walking surface." },
      { order: 2, label: "wall", description: "A wall beside the route." }
    ],
    policy: "Neutral before commitment."
  }
}

const sceneFeedback: typeof PostcommitScene.Type = {
  id: "scene.original.hallway",
  opaqueAssetId: "s001",
  kind: "positive",
  hazardFamily: "slip-trip-fall",
  claim: "The walking surface needs correction.",
  sourceIds: ["source-1"],
  targets: [
    {
      id: "target-1",
      condition: "liquid across the walking route",
      correction: "control the area and dry the surface"
    }
  ],
  decoys: [
    {
      id: "decoy-1",
      condition: "fixed conduit beside the route",
      safeBecause: "it does not enter the walking surface"
    }
  ],
  targetRegions: [
    {
      inventoryId: "target-1",
      polygons: [[[0.1, 0.1], [0.4, 0.1], [0.4, 0.4], [0.1, 0.4]]]
    }
  ],
  decoyRegions: [
    {
      inventoryId: "decoy-1",
      polygons: [[[0.6, 0.6], [0.9, 0.6], [0.9, 0.9], [0.6, 0.9]]]
    }
  ],
  fullPostAnswer: {
    claim: "The walking surface needs correction.",
    targets: [
      {
        condition: "liquid across the walking route",
        correction: "control the area and dry the surface",
        sourceIds: ["source-1"]
      }
    ],
    decoys: [
      {
        condition: "fixed conduit beside the route",
        safeBecause: "it does not enter the walking surface"
      }
    ],
    safeBackground: ["closed door"],
    sources: [
      {
        id: "source-1",
        title: "Source title",
        url: "https://example.com/source",
        locator: "section 1",
        scope: "Walking surfaces."
      }
    ]
  },
  nonvisualZonedEquivalent: [
    { zone: "walking route", role: "target", statement: "liquid crosses the route" },
    { zone: "wall edge", role: "decoy", statement: "conduit remains beside the route" }
  ]
}

const questionFeedback = (includeMappings = true, correctOptionId = "b") =>
  Schema.decodeUnknownSync(PostcommitQuestion)({
    schemaVersion: 1,
    id: "q-1",
    ...(includeMappings
      ? {
          optionConceptIds: [
            { optionId: "b", conceptId: "tool.pipe-wrench" },
            { optionId: "a", conceptId: "tool.adjustable-wrench" }
          ]
        }
      : {}),
    correctOptionId,
    rationales: [
      { optionId: "b", message: "Correct rationale" },
      { optionId: "a", message: "Distractor rationale" }
    ],
    sources: [{ id: "source-1", label: "Source", locator: "section 1" }]
  })

const questionReceipt: QuestionAttemptReceipt = {
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  postcommitPath: "/content/vertical-slice/questions/q-1.postcommit.json",
  postcommitBytes: 100,
  postcommitSha256: "b".repeat(64),
  questionId: "q-1"
}

const hazardReceipt = (mode: "visual" | "nonvisual"): HazardAttemptReceipt => ({
  releaseId: "release-1",
  packVersion: 1,
  sessionId: mode === "visual" ? "release-1" : "release-1-nonvisual",
  position: 1,
  postcommitPath: "/content/vertical-slice/scenes/s001.postcommit.json",
  postcommitBytes: 200,
  postcommitSha256: "c".repeat(64),
  sceneId: "s001",
  mode,
  assetRevision: scene.asset.revision,
  assetMasterSha256: scene.asset.masterSha256
})

const visualReceipt = hazardReceipt("visual")
const nonvisualReceipt = hazardReceipt("nonvisual")

const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)({
  schemaVersion: 1,
  questions: [
    {
      id: "q-1",
      optionIds: ["a", "b"],
      receipt: questionReceipt,
      itemUrl: "/review/session/release-1/item/1/"
    }
  ],
  scenes: [
    {
      scene,
      visualReceipt,
      nonvisualReceipt,
      visualItemUrl: "/hazards/session/release-1/scene/1/",
      nonvisualItemUrl: "/hazards/session/release-1-nonvisual/scene/1/"
    }
  ]
})

const questionAttempt = new QuestionAttemptRecord({
  id: questionAttemptId(questionReceipt),
  questionId: "q-1",
  selectedOptionId: "a",
  reviewIntent: "flagged",
  committedAt: 1,
  receipt: questionReceipt,
  optionIds: ["a", "b"]
})

const visualAttempt = new HazardAttemptRecord({
  id: hazardAttemptId(visualReceipt),
  sceneId: "s001",
  mode: "visual",
  markers: [
    { id: "marker-1", x: 0.7, y: 0.7 },
    { id: "marker-2", x: 0.95, y: 0.1 }
  ],
  selectedZoneOrders: [],
  zeroHazardsConfirmed: false,
  committedAt: 2,
  receipt: visualReceipt,
  allowedZoneOrders: [1, 2]
})

const nonvisualAttempt = new HazardAttemptRecord({
  id: hazardAttemptId(nonvisualReceipt),
  sceneId: "s001",
  mode: "nonvisual",
  markers: [],
  selectedZoneOrders: [1],
  zeroHazardsConfirmed: false,
  committedAt: 3,
  receipt: nonvisualReceipt,
  allowedZoneOrders: [1, 2]
})

const layerFor = (input?: {
  readonly acknowledgements?: ReadonlyArray<ReviewAcknowledgementRecord>
  readonly hazardAttempts?: ReadonlyArray<HazardAttemptRecord>
  readonly questionAttempts?: ReadonlyArray<QuestionAttemptRecord>
  readonly requestedUrls?: Array<string>
}) => {
  const acknowledgements = input?.acknowledgements ?? []
  const requestedUrls = input?.requestedUrls ?? []
  return Layer.mergeAll(
    Layer.succeed(
      QuestionPersistence,
      QuestionPersistence.of({
        commitAttempt: () => Effect.die("not used"),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: () => Effect.succeed(input?.questionAttempts ?? [])
      })
    ),
    Layer.succeed(
      HazardPersistence,
      HazardPersistence.of({
        commitAttempt: () => Effect.die("not used"),
        findAttempt: () => Effect.succeed(undefined),
        listAttempts: () => Effect.succeed(input?.hazardAttempts ?? [])
      })
    ),
    Layer.succeed(
      ReviewPersistence,
      ReviewPersistence.of({
        acknowledge: (value) =>
          Effect.succeed(
            new ReviewAcknowledgementRecord({
              id: reviewAcknowledgementId(value),
              itemId: value.itemId,
              attemptId: value.attemptId,
              reasonIds: value.reasonIds as readonly [string, ...Array<string>],
              acknowledgedAt: 4
            })
          ),
        listAcknowledgements: () => Effect.succeed(acknowledgements)
      })
    ),
    Layer.succeed(
      VerifiedContent,
      VerifiedContent.of({
        ensureAssetAvailable: () => Effect.die("not used"),
        ensureAvailable: (receipt) =>
          Effect.succeed({ path: receipt.postcommitPath, source: "network-required" as const }),
        loadAssetBlob: () => Effect.die("not used"),
        loadJson: (receipt) =>
          Effect.sync(() => {
            requestedUrls.push(receipt.postcommitPath)
            return receipt.postcommitPath.includes("/questions/")
              ? questionFeedback()
              : sceneFeedback
          })
      })
    )
  )
}

describe("review projection", () => {
  it.effect("derives question and visual-hazard reasons only after durable attempts", () => {
    const requestedUrls: Array<string> = []
    return Effect.gen(function*() {
      const projection = yield* buildReviewQueue(bootstrap)

      expect(projection.attemptCount).toBe(3)
      expect([...requestedUrls].sort()).toEqual([
        "/content/vertical-slice/questions/q-1.postcommit.json",
        "/content/vertical-slice/scenes/s001.postcommit.json"
      ].sort())
      expect(projection.quarantined).toEqual([])
      expect(projection.items.map((item) => item.kind)).toEqual([
        "question",
        "visual_hazard"
      ])
      expect(projection.items[0]?.reasons).toEqual([
        { tag: "flag" },
        {
          tag: "directional_confusion",
          correctConceptId: "tool.pipe-wrench",
          selectedConceptId: "tool.adjustable-wrench"
        }
      ])
      expect(projection.items[1]?.reasons.map((reason) => reason.tag)).toEqual([
        "hazard_miss",
        "decoy_false_positive",
        "general_false_positive"
      ])
    }).pipe(
      Effect.provide(
        layerFor({
          hazardAttempts: [visualAttempt, nonvisualAttempt],
          questionAttempts: [questionAttempt],
          requestedUrls
        })
      )
    )
  })

  it.effect("does not request feedback when no durable attempt exists", () => {
    const requestedUrls: Array<string> = []
    return Effect.gen(function*() {
      const projection = yield* buildReviewQueue(bootstrap)
      expect(projection).toEqual({ attemptCount: 0, items: [], quarantined: [] })
      expect(requestedUrls).toEqual([])
    }).pipe(Effect.provide(layerFor({ requestedUrls })))
  })

  it.effect("quarantines unavailable attempts without hiding valid due items", () => {
    const retiredReceipt: QuestionAttemptReceipt = {
      ...questionReceipt,
      position: 2,
      questionId: "q-retired",
      postcommitPath: "/content/vertical-slice/questions/q-retired.postcommit.json",
      postcommitSha256: "d".repeat(64)
    }
    const unavailableAttempt = new QuestionAttemptRecord({
      id: questionAttemptId(retiredReceipt),
      questionId: "q-retired",
      selectedOptionId: "a",
      reviewIntent: "flagged",
      committedAt: 2,
      receipt: retiredReceipt,
      optionIds: ["a", "b"]
    })

    return Effect.gen(function*() {
      const projection = yield* buildReviewQueue(bootstrap)
      expect(projection.items).toHaveLength(1)
      expect(projection.items[0]?.attemptId).toBe(questionAttempt.id)
      expect(projection.quarantined).toEqual([
        {
          id: `question:${questionAttemptId(retiredReceipt)}`,
          attemptId: questionAttemptId(retiredReceipt),
          kind: "question",
          detail: "A saved question is unavailable in this exact release. It was not substituted."
        }
      ])
    }).pipe(
      Effect.provide(layerFor({ questionAttempts: [questionAttempt, unavailableAttempt] }))
    )
  })

  it.effect("quarantines a reused item ID under a different receipt before feedback fetch", () => {
    const requestedUrls: Array<string> = []
    const replacedReceipt: QuestionAttemptReceipt = {
      ...questionReceipt,
      packVersion: 2,
      postcommitSha256: "e".repeat(64)
    }
    const replacedAttempt = new QuestionAttemptRecord({
      ...questionAttempt,
      id: questionAttemptId(replacedReceipt),
      receipt: replacedReceipt
    })

    return Effect.gen(function*() {
      const projection = yield* buildReviewQueue(bootstrap)
      expect(projection.items).toEqual([])
      expect(projection.quarantined).toHaveLength(1)
      expect(projection.quarantined[0]?.detail).toContain("does not match this exact released item")
      expect(requestedUrls).toEqual([])
    }).pipe(
      Effect.provide(layerFor({ questionAttempts: [replacedAttempt], requestedUrls }))
    )
  })

  it.effect("keeps opposite directional confusions as distinct correct-to-selected events", () =>
    Effect.gen(function*() {
      const forward = yield* deriveQuestionReviewItem(
        questionAttempt,
        bootstrap.questions[0]!,
        questionFeedback()
      )
      const inverseAttempt = new QuestionAttemptRecord({
        ...questionAttempt,
        selectedOptionId: "b",
        reviewIntent: "unflagged"
      })
      const inverse = yield* deriveQuestionReviewItem(
        inverseAttempt,
        bootstrap.questions[0]!,
        questionFeedback(true, "a")
      )
      const forwardReason = forward?.reasons.find(
        (reason) => reason.tag === "directional_confusion"
      )
      const inverseReason = inverse?.reasons.find(
        (reason) => reason.tag === "directional_confusion"
      )
      expect(forwardReason).toEqual({
        tag: "directional_confusion",
        correctConceptId: "tool.pipe-wrench",
        selectedConceptId: "tool.adjustable-wrench"
      })
      expect(inverseReason).toEqual({
        tag: "directional_confusion",
        correctConceptId: "tool.adjustable-wrench",
        selectedConceptId: "tool.pipe-wrench"
      })
      expect(forwardReason === undefined ? undefined : reviewReasonId(forwardReason)).not.toBe(
        inverseReason === undefined ? undefined : reviewReasonId(inverseReason)
      )
    })
  )

  it.effect("fails truthfully when canonical question concept metadata is absent", () =>
    Effect.gen(function*() {
      const error = yield* deriveQuestionReviewItem(
        questionAttempt,
        bootstrap.questions[0]!,
        questionFeedback(false)
      ).pipe(Effect.flip)
      expect(error._tag).toBe("ReviewProjectionError")
      expect(error.operation).toBe("content")
    })
  )

  it.effect("uses attempt identity in idempotent acknowledgement IDs", () => {
    const item = {
      id: `question:${questionAttempt.id}`,
      attemptId: questionAttempt.id,
      committedAt: 1,
      itemUrl: "/review/session/release-1/item/1/",
      kind: "question" as const,
      reasons: [{ tag: "flag" as const }],
      reasonIds: ["flag"]
    }
    const ids = new Set<string>()
    const layer = Layer.succeed(
      ReviewPersistence,
      ReviewPersistence.of({
        acknowledge: (value) =>
          Effect.sync(() => {
            const id = reviewAcknowledgementId(value)
            ids.add(id)
            return new ReviewAcknowledgementRecord({
              id,
              itemId: value.itemId,
              attemptId: value.attemptId,
              reasonIds: ["flag"],
              acknowledgedAt: 1
            })
          }),
        listAcknowledgements: () => Effect.succeed([])
      })
    )

    return Effect.gen(function*() {
      yield* acknowledgeReviewItem(item)
      yield* acknowledgeReviewItem(item)
      expect(ids.size).toBe(1)
      expect(reviewAcknowledgementId({
        itemId: item.id,
        attemptId: "a-new-attempt",
        reasonIds: item.reasonIds
      })).not.toBe([...ids][0])
    }).pipe(Effect.provide(layer))
  })
})

describe("review bootstrap trust boundary", () => {
  it("rejects duplicate options and non-local or traversal-bearing URLs", () => {
    const base = {
      schemaVersion: 1,
      questions: [
        {
          id: "q-1",
          optionIds: ["a", "b"],
          receipt: questionReceipt,
          itemUrl: "/review/session/release-1/item/1/"
        }
      ],
      scenes: []
    }
    expect(() => Schema.decodeUnknownSync(ReviewQueueBootstrap)({
      ...base,
      questions: [{ ...base.questions[0]!, optionIds: ["a", "a"] }]
    })).toThrow()
    expect(() => Schema.decodeUnknownSync(ReviewQueueBootstrap)({
      ...base,
      questions: [{
        ...base.questions[0]!,
        receipt: {
          ...base.questions[0]!.receipt,
          postcommitPath: "https://evil.example/a.json"
        }
      }]
    })).toThrow()
    expect(() => Schema.decodeUnknownSync(ReviewQueueBootstrap)({
      ...base,
      questions: [{
        ...base.questions[0]!,
        receipt: {
          ...base.questions[0]!.receipt,
          postcommitPath: "/content/vertical-slice/questions/../q-1.postcommit.json"
        }
      }]
    })).toThrow()
  })
})

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
  schemaVersion: 2,
  version: 2,
  id: "s001",
  opaqueAssetId: "s001",
  kind: "positive",
  hazardFamily: "slip-trip-fall",
  tags: {
    domain: "health-and-safety",
    family: "hazard-scene",
    environment: "hallway",
    hazardCategory: "slip-trip-fall",
    seriesScope: "entry-level-custodians-janitors",
    editorialDifficulty: "application"
  },
  targets: [
    {
      id: "target-1",
      zone: "floor",
      polygons: [[[0.1, 0.1], [0.4, 0.1], [0.4, 0.4], [0.1, 0.4]]],
      observableCondition: "Liquid extends across the walking route.",
      conceptIds: ["wet-walking-surface"],
      correctionCategory: "isolate-and-dry",
      whyUnsafeClaimId: "claim-target-why",
      likelyConsequenceClaimId: "claim-target-consequence",
      immediateCorrectionClaimId: "claim-target-correction"
    }
  ],
  decoys: [
    {
      id: "decoy-1",
      zone: "wall",
      polygons: [[[0.6, 0.6], [0.9, 0.6], [0.9, 0.9], [0.6, 0.9]]],
      observableCondition: "Fixed conduit remains beside the route.",
      conceptIds: ["fixed-conduit"],
      suspiciousBecause: "It is close to the walking surface.",
      safeAsDepictedClaimId: "claim-decoy-safe",
      unsafeIfClaimId: "claim-decoy-unsafe-if"
    }
  ],
  safeBackground: [{ zone: "wall", observableCondition: "The door is closed and intact." }],
  claims: [
    {
      id: "claim-target-why",
      text: "Liquid makes the walking surface hazardous.",
      sourceLineIds: ["line-1"],
      evidenceTier: "official-primary",
      caveat: null
    },
    {
      id: "claim-target-consequence",
      text: "A person could slip and fall.",
      sourceLineIds: ["line-1"],
      evidenceTier: "official-primary",
      caveat: null
    },
    {
      id: "claim-target-correction",
      text: "Control the area and dry the surface.",
      sourceLineIds: ["line-1"],
      evidenceTier: "official-primary",
      caveat: null
    },
    {
      id: "claim-decoy-safe",
      text: "The conduit does not enter the walking surface.",
      sourceLineIds: ["line-1"],
      evidenceTier: "official-primary",
      caveat: null
    },
    {
      id: "claim-decoy-unsafe-if",
      text: "It would be unsafe if it entered the walking route.",
      sourceLineIds: ["line-1"],
      evidenceTier: "official-primary",
      caveat: null
    }
  ],
  sources: [
    {
      id: "line-1",
      sourceId: "source-1",
      title: "Source title",
      publisher: "Official publisher",
      evidenceTier: "official-primary",
      version: "Current test edition",
      rightsNotes: "Project-authored test source.",
      locator: "section 1, exact line",
      excerpt: "Walking surfaces must be kept in a safe condition.",
      language: "en",
      verifiedOn: "2026-08-30",
      supportedClaimIds: [
        "claim-target-why",
        "claim-target-consequence",
        "claim-target-correction",
        "claim-decoy-safe",
        "claim-decoy-unsafe-if"
      ],
      scope: "Walking surfaces.",
      sourceLocator: "section 1",
      url: "https://example.com/source"
    }
  ]
}

const questionFeedback = (includeMappings = true, correctOptionId = "b") =>
  Schema.decodeUnknownSync(PostcommitQuestion)({
    schemaVersion: 2,
    id: "q-1",
    version: 1,
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
      { optionId: "b", message: "Correct rationale", claimIds: ["claim-1"] },
      { optionId: "a", message: "Distractor rationale", claimIds: ["claim-1"] }
    ],
    claims: [{
      id: "claim-1",
      text: "Supported claim.",
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
      excerpt: "Supported claim.",
      language: "en",
      verifiedOn: "2026-08-25",
      supportedClaimIds: ["claim-1"]
    }]
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
        completeAttempt: () => Effect.die("not used"),
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
        loadCachedAssetBlob: () => Effect.die("not used"),
        loadCachedJson: () => Effect.die("not used"),
        loadJsonArtifact: () => Effect.die("not used"),
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
        { tag: "incorrect_answer" }
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
          detail:
            "This saved question is unavailable in the current study material. It remains stored and was not replaced with a different question."
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
      expect(projection.quarantined[0]?.detail).toContain("does not match the current version of the question")
      expect(requestedUrls).toEqual([])
    }).pipe(
      Effect.provide(layerFor({ questionAttempts: [replacedAttempt], requestedUrls }))
    )
  })

  it.effect("records incorrect answers without inventing directional concept relations", () =>
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
        (reason) => reason.tag === "incorrect_answer"
      )
      const inverseReason = inverse?.reasons.find(
        (reason) => reason.tag === "incorrect_answer"
      )
      expect(forwardReason).toEqual({ tag: "incorrect_answer" })
      expect(inverseReason).toEqual({ tag: "incorrect_answer" })
      expect(forwardReason === undefined ? undefined : reviewReasonId(forwardReason)).toBe(
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

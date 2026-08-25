import { it } from "@effect/vitest"
import { deepStrictEqual, strictEqual } from "@effect/vitest/utils"
import { Effect, Layer } from "effect"
import { hazardAttemptId, type HazardAttemptReceipt } from "../src/attempt-receipt.ts"
import {
  HazardAttemptRecord,
  HazardPersistence,
  HazardPersistenceError
} from "../src/hazard-player/persistence.ts"
import type {
  HazardDraft,
  PostcommitScene,
  PrecommitScene
} from "../src/hazard-player/attempt.ts"
import {
  assessSelectedZones,
  assessVisualMarkers,
  hasValidPostcommitClosure
} from "../src/hazard-player/assessment.ts"
import {
  commitHazardAndReveal,
  restoreHazardAndReveal
} from "../src/hazard-player/commit-and-reveal.ts"
import {
  VerifiedContent,
  VerifiedContentUnavailable
} from "../src/verified-content.ts"

const sha = "a".repeat(64)

const precommitScene = (): PrecommitScene => ({
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
})

const postcommitScene = (opaqueAssetId = "s001"): PostcommitScene => ({
  id: "scene.original.hallway",
  opaqueAssetId,
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
    { zone: "floor", role: "target", statement: "liquid crosses the route" },
    { zone: "wall", role: "decoy", statement: "conduit remains beside the route" }
  ]
})

const visualDraft: HazardDraft = {
  markers: [{ id: "marker-1", x: 0.2, y: 0.2 }],
  selectedZoneOrders: [],
  nextMarkerNumber: 2
}

const noAttempts = () => Effect.succeed([])

const verifiedLayer = Layer.succeed(
  VerifiedContent,
  VerifiedContent.of({
    ensureAssetAvailable: () => Effect.die("not used"),
    ensureAvailable: (current) =>
      Effect.succeed({ path: current.postcommitPath, source: "network-required" as const }),
    loadAssetBlob: () => Effect.die("not used"),
    loadJson: (current) =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(current.postcommitPath)
          if (!response.ok) throw new Error(`Feedback returned HTTP ${response.status}`)
          return response.json() as Promise<unknown>
        },
        catch: (cause) =>
          new VerifiedContentUnavailable({
            reason: "network-failure",
            detail: "test feedback unavailable",
            path: current.postcommitPath,
            cause
          })
      })
  })
)

const receipt = (mode: "visual" | "nonvisual"): HazardAttemptReceipt => ({
  releaseId: "release-1",
  packVersion: 1,
  sessionId: mode === "visual" ? "release-1" : "release-1-nonvisual",
  position: 1,
  postcommitPath: "/content/vertical-slice/scenes/s001.postcommit.json",
  postcommitBytes: 100,
  postcommitSha256: "b".repeat(64),
  sceneId: "s001",
  mode,
  assetRevision: 1,
  assetMasterSha256: sha
})

const attempt = (
  input: Parameters<HazardPersistence["Service"]["commitAttempt"]>[0],
  committedAt = 1
): HazardAttemptRecord =>
  new HazardAttemptRecord({
    id: hazardAttemptId(input.receipt),
    sceneId: input.receipt.sceneId,
    mode: input.receipt.mode,
    markers: [...input.markers],
    selectedZoneOrders: [...input.selectedZoneOrders],
    zeroHazardsConfirmed: input.zeroHazardsConfirmed,
    committedAt,
    receipt: input.receipt,
    allowedZoneOrders: [...input.allowedZoneOrders]
  })

it.effect("persists the complete marker response before requesting feedback", () => {
  const sequence: Array<"commit" | "fetch"> = []
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) =>
        Effect.sync(() => {
          sequence.push("commit")
          strictEqual(input.zeroHazardsConfirmed, false)
          deepStrictEqual(input.markers, visualDraft.markers)
          return attempt(input)
        }),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () => {
        sequence.push("fetch")
        return new Response(JSON.stringify(postcommitScene()), {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      },
      { preconnect: originalFetch.preconnect }
    )

    const result = yield* commitHazardAndReveal({
      receipt: receipt("visual"),
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(result.tag, "revealed")
    deepStrictEqual(sequence, ["commit", "fetch"])
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("persists explicit zero-zone confirmation before feedback", () => {
  const sequence: Array<"commit" | "fetch"> = []
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) =>
        Effect.sync(() => {
          sequence.push("commit")
          strictEqual(input.receipt.mode, "nonvisual")
          strictEqual(input.zeroHazardsConfirmed, true)
          deepStrictEqual(input.selectedZoneOrders, [])
          return attempt(input)
        }),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () => {
        sequence.push("fetch")
        return new Response(JSON.stringify(postcommitScene()), {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      },
      { preconnect: originalFetch.preconnect }
    )

    const result = yield* commitHazardAndReveal({
      receipt: receipt("nonvisual"),
      scene: precommitScene(),
      mode: "nonvisual",
      draft: { markers: [], selectedZoneOrders: [], nextMarkerNumber: 1 }
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(result.tag, "revealed")
    deepStrictEqual(sequence, ["commit", "fetch"])
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("does not request feedback when durable persistence fails", () => {
  let fetchCount = 0
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: () =>
        Effect.fail(
          new HazardPersistenceError({
            operation: "commit-attempt",
            detail: "quota unavailable",
            cause: new Error("quota unavailable")
          })
        ),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () => {
        fetchCount += 1
        return new Response(JSON.stringify(postcommitScene()))
      },
      { preconnect: originalFetch.preconnect }
    )

    const outcome = yield* commitHazardAndReveal({
      receipt: receipt("visual"),
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft
    }).pipe(
      Effect.provide(Layer.merge(layer, verifiedLayer)),
      Effect.match({ onFailure: () => "failed" as const, onSuccess: () => "succeeded" as const })
    )

    strictEqual(outcome, "failed")
    strictEqual(fetchCount, 0)
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("does not request postcommit content while restoring an unanswered scene", () => {
  let fetchCount = 0
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.succeed(attempt(input)),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () => {
        fetchCount += 1
        return new Response(JSON.stringify(postcommitScene()))
      },
      { preconnect: originalFetch.preconnect }
    )

    const restored = yield* restoreHazardAndReveal({
      receipt: receipt("visual"),
      scene: precommitScene(),
      mode: "visual"
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(restored, undefined)
    strictEqual(fetchCount, 0)
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("fails closed after commit when the feedback asset identity differs", () => {
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.succeed(attempt(input)),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () =>
        new Response(JSON.stringify(postcommitScene("s999")), {
          status: 200,
          headers: { "content-type": "application/json" }
        }),
      { preconnect: originalFetch.preconnect }
    )

    const result = yield* commitHazardAndReveal({
      receipt: receipt("visual"),
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(result.tag, "reveal_failed")
    if (result.tag === "reveal_failed") {
      strictEqual(result.error._tag, "HazardContentMismatch")
    }
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("does not persist when exact scene feedback is unavailable before commit", () => {
  let commitCount = 0
  const currentReceipt = receipt("visual")
  const unavailableLayer = Layer.succeed(
    VerifiedContent,
    VerifiedContent.of({
      ensureAssetAvailable: () => Effect.die("not used"),
      ensureAvailable: () =>
        Effect.fail(
          new VerifiedContentUnavailable({
            reason: "known-offline-miss",
            detail: "offline",
            path: currentReceipt.postcommitPath,
            cause: new Error("offline")
          })
        ),
      loadAssetBlob: () => Effect.die("not used"),
      loadJson: () => Effect.die("must not load")
    })
  )
  const persistenceLayer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.sync(() => {
        commitCount += 1
        return attempt(input)
      }),
      findAttempt: () => Effect.succeed(undefined),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    const result = yield* commitHazardAndReveal({
      receipt: currentReceipt,
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft
    }).pipe(Effect.provide(Layer.merge(persistenceLayer, unavailableLayer)))

    strictEqual(result.tag, "content_unavailable")
    strictEqual(commitCount, 0)
  })
})

it.effect("rejects incomplete or contradictory postcommit closure", () =>
  Effect.sync(() => {
    const scene = precommitScene()
    const payload = postcommitScene()
    const missingFullTarget: PostcommitScene = {
      ...payload,
      fullPostAnswer: { ...payload.fullPostAnswer, targets: [] }
    }
    const decoyStatement = payload.nonvisualZonedEquivalent.find(
      (statement) => statement.role === "decoy"
    )
    if (decoyStatement === undefined) {
      throw new Error("Test fixture requires one decoy statement")
    }
    const missingTargetStatement: PostcommitScene = {
      ...payload,
      nonvisualZonedEquivalent: [decoyStatement]
    }
    const unsafeSourceUrl: PostcommitScene = {
      ...payload,
      fullPostAnswer: {
        ...payload.fullPostAnswer,
        sources: [{
          ...payload.fullPostAnswer.sources[0],
          url: "http://example.com/source"
        }]
      }
    }
    const validZero: PostcommitScene = {
      ...payload,
      kind: "zero-hazard",
      hazardFamily: null,
      targets: [],
      targetRegions: [],
      fullPostAnswer: { ...payload.fullPostAnswer, targets: [] },
      nonvisualZonedEquivalent: [decoyStatement]
    }
    const invalidZeroFamily: PostcommitScene = {
      ...validZero,
      hazardFamily: "slip-trip-fall"
    }
    const invalidRegion: PostcommitScene = {
      ...payload,
      targetRegions: [{
        inventoryId: "target-1",
        polygons: [[[1.2, 0.1], [1.4, 0.1], [1.4, 0.4], [1.2, 0.4]]]
      }]
    }

    strictEqual(hasValidPostcommitClosure(scene, missingFullTarget), false)
    strictEqual(hasValidPostcommitClosure(scene, missingTargetStatement), false)
    strictEqual(hasValidPostcommitClosure(scene, unsafeSourceUrl), false)
    strictEqual(hasValidPostcommitClosure(scene, validZero), true)
    strictEqual(hasValidPostcommitClosure(scene, invalidZeroFamily), false)
    strictEqual(hasValidPostcommitClosure(scene, invalidRegion), false)
  })
)

it.effect("matches target regions one-to-one and distinguishes duplicate, decoy, and general marks", () =>
  Effect.sync(() => {
    const result = assessVisualMarkers(
      [
        { id: "marker-1", x: 0.2, y: 0.2 },
        { id: "marker-2", x: 0.3, y: 0.3 },
        { id: "marker-3", x: 0.7, y: 0.7 },
        { id: "marker-4", x: 0.5, y: 0.05 }
      ],
      postcommitScene()
    )
    deepStrictEqual(result.markers.map((marker) => marker.kind), [
      "hit",
      "duplicate",
      "decoy_false_positive",
      "false_positive"
    ])
    deepStrictEqual(result.missedInventoryIds, [])
  })
)

it.effect("keeps nonvisual zone choice separate from postcommit interpretation", () =>
  Effect.sync(() => {
    const zones = assessSelectedZones([2], precommitScene())
    deepStrictEqual(
      zones.map((zone) => ({
        order: zone.order,
        selected: zone.selected
      })),
      [
        { order: 1, selected: false },
        { order: 2, selected: true }
      ]
    )
  })
)

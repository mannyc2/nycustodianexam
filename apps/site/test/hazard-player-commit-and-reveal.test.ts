import { createHash } from "node:crypto"
import { it } from "@effect/vitest"
import { deepStrictEqual, strictEqual } from "@effect/vitest/utils"
import { Effect, Layer } from "effect"
import { hazardAttemptId, type HazardAttemptReceipt } from "../src/attempt-receipt.ts"
import {
  HazardAttemptRecord,
  HazardEvaluationRecord,
  HazardPersistence,
  HazardPersistenceError,
  validateHazardEvaluation
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
  type AssetContentReceipt,
  VerifiedContent,
  VerifiedContentUnavailable
} from "../src/verified-content.ts"
import {
  RetainedImageAsset,
  encodeCanonicalBase64,
  retainImageBlob
} from "../src/retained-image.ts"

const sha = "a".repeat(64)
const retainedPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
const retainedPngSha256 = "431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460"
const retainedPngBytes = Uint8Array.from(atob(retainedPngBase64), (value) => value.charCodeAt(0))
const visualAssetReceipt: AssetContentReceipt = {
  path: "/content/assets/derivatives/scenes/s001-web.png",
  bytes: retainedPngBytes.byteLength,
  sha256: retainedPngSha256
}
const visualAssetBlob = (): Blob => new Blob([retainedPngBytes], { type: "image/png" })

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
        bytes: visualAssetReceipt.bytes,
        sha256: visualAssetReceipt.sha256
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
  id: "s001",
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
    { zone: "floor", role: "target", statement: "liquid across the walking route" },
    {
      zone: "wall",
      role: "decoy",
      statement: "fixed conduit beside the route; it does not enter the walking surface."
    },
    { zone: "wall", role: "safe-background", statement: "closed door" }
  ]
})

const postcommitBytes = (opaqueAssetId = "s001"): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(postcommitScene(opaqueAssetId)))

const postcommitDigest = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex")

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
    loadAssetBlob: () => Effect.succeed(visualAssetBlob()),
    loadCachedAssetBlob: () => Effect.succeed(visualAssetBlob()),
    loadCachedJson: () => Effect.die("not used"),
    loadJsonArtifact: (current) =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(current.postcommitPath)
          if (!response.ok) throw new Error(`Feedback returned HTTP ${response.status}`)
          const bytes = new Uint8Array(await response.arrayBuffer())
          const value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown
          return { bytes, value }
        },
        catch: (cause) =>
          new VerifiedContentUnavailable({
            reason: "network-failure",
            detail: "test feedback unavailable",
            path: current.postcommitPath,
            cause
          })
      }),
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

const receipt = (
  mode: "visual" | "nonvisual",
  bytes = postcommitBytes()
): HazardAttemptReceipt => ({
  releaseId: "release-1",
  packVersion: 1,
  sessionId: mode === "visual" ? "release-1" : "release-1-nonvisual",
  position: 1,
  postcommitPath: "/content/vertical-slice/scenes/s001.postcommit.json",
  postcommitBytes: bytes.byteLength,
  postcommitSha256: postcommitDigest(bytes),
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

const completedAttempt = (
  input: Parameters<HazardPersistence["Service"]["completeAttempt"]>[0]
): HazardAttemptRecord => new HazardAttemptRecord({
  ...input.attempt,
  evaluation: new HazardEvaluationRecord({
    payload: input.payload,
    postcommitBase64: input.postcommitBase64,
    retainedVisualAsset: input.retainedVisualAsset
  })
})

it.effect("persists the complete marker response before requesting feedback", () => {
  const sequence: Array<"commit" | "fetch" | "complete"> = []
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
      completeAttempt: (input) => Effect.sync(() => {
        sequence.push("complete")
        return completedAttempt(input)
      }),
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
      draft: visualDraft,
      visualAssetReceipt
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(result.tag, "revealed")
    deepStrictEqual(sequence, ["commit", "fetch", "complete"])
  }).pipe(
    Effect.ensuring(
      Effect.sync(() => {
        globalThis.fetch = originalFetch
      })
    )
  )
})

it.effect("persists explicit zero-zone confirmation before feedback", () => {
  const sequence: Array<"commit" | "fetch" | "complete"> = []
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
      completeAttempt: (input) => Effect.sync(() => {
        sequence.push("complete")
        return completedAttempt(input)
      }),
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
      draft: { markers: [], selectedZoneOrders: [], nextMarkerNumber: 1 },
      visualAssetReceipt: null
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    strictEqual(result.tag, "revealed")
    deepStrictEqual(sequence, ["commit", "fetch", "complete"])
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
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
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
      draft: visualDraft,
      visualAssetReceipt
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

it.effect("keeps the response durable when the immutable feedback completion write fails", () => {
  const originalFetch = globalThis.fetch
  let durableAttempt: HazardAttemptRecord | undefined
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.sync(() => {
        durableAttempt = attempt(input)
        return durableAttempt
      }),
      findAttempt: () => Effect.succeed(durableAttempt),
      completeAttempt: () => Effect.fail(new HazardPersistenceError({
        operation: "complete-attempt",
        detail: "feedback completion unavailable",
        cause: new Error("feedback completion unavailable")
      })),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    globalThis.fetch = Object.assign(
      async () => new Response(JSON.stringify(postcommitScene()), {
        status: 200,
        headers: { "content-type": "application/json" }
      }),
      { preconnect: originalFetch.preconnect }
    )

    const result = yield* commitHazardAndReveal({
      receipt: receipt("visual"),
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft,
      visualAssetReceipt
    }).pipe(Effect.provide(Layer.merge(layer, verifiedLayer)))

    if (result.tag !== "reveal_failed") throw new Error("Expected feedback completion failure")
    strictEqual(result.attempt, durableAttempt)
    strictEqual(result.error._tag, "HazardPersistenceError")
    strictEqual(durableAttempt?.evaluation, undefined)
  }).pipe(
    Effect.ensuring(Effect.sync(() => {
      globalThis.fetch = originalFetch
    }))
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
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
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
      mode: "visual",
      visualAssetReceipt
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

it.effect("restores completed visual feedback after current verified content and cache are gone", () =>
  Effect.gen(function*() {
    const currentReceipt = receipt("visual")
    const committed = attempt({
      receipt: currentReceipt,
      allowedZoneOrders: [1, 2],
      markers: visualDraft.markers,
      selectedZoneOrders: [],
      zeroHazardsConfirmed: false
    })
    const retainedVisualAsset = yield* Effect.promise(() =>
      retainImageBlob(visualAssetReceipt, visualAssetBlob())
    )
    const evaluated = new HazardAttemptRecord({
      ...committed,
      evaluation: new HazardEvaluationRecord({
        payload: postcommitScene(),
        postcommitBase64: encodeCanonicalBase64(postcommitBytes()),
        retainedVisualAsset
      })
    })
    let verifiedContentReads = 0
    const countUnexpectedRead = <A>(): Effect.Effect<A> => Effect.sync(() => {
      verifiedContentReads += 1
      throw new Error("Historical restore must not read current verified content")
    })
    const persistenceLayer = Layer.succeed(
      HazardPersistence,
      HazardPersistence.of({
        commitAttempt: () => Effect.die("not used"),
        findAttempt: () => Effect.succeed(evaluated),
        completeAttempt: () => Effect.die("not used"),
        listAttempts: noAttempts
      })
    )
    const removedContentLayer = Layer.succeed(
      VerifiedContent,
      VerifiedContent.of({
        ensureAssetAvailable: countUnexpectedRead,
        ensureAvailable: countUnexpectedRead,
        loadAssetBlob: countUnexpectedRead,
        loadCachedAssetBlob: countUnexpectedRead,
        loadCachedJson: countUnexpectedRead,
        loadJsonArtifact: countUnexpectedRead,
        loadJson: countUnexpectedRead
      })
    )

    const restored = yield* restoreHazardAndReveal({
      receipt: currentReceipt,
      scene: precommitScene(),
      mode: "visual",
      visualAssetReceipt
    }).pipe(Effect.provide(Layer.merge(persistenceLayer, removedContentLayer)))

    strictEqual(restored?.tag, "revealed")
    if (restored?.tag === "revealed") {
      strictEqual(restored.retainedVisualAsset?.dataUrl, retainedVisualAsset.dataUrl)
      strictEqual(restored.payload.opaqueAssetId, "s001")
    }
    strictEqual(verifiedContentReads, 0)
  })
)

it.effect("rejects a payload-only mutation when the retained postcommit bytes are unchanged", () =>
  Effect.gen(function*() {
    const payload = postcommitScene()
    const mutatedPayload: PostcommitScene = {
      ...payload,
      fullPostAnswer: {
        ...payload.fullPostAnswer,
        safeBackground: ["different safe background"]
      }
    }
    const outcome = yield* Effect.tryPromise({
      try: () => validateHazardEvaluation({
        receipt: receipt("nonvisual"),
        scene: precommitScene(),
        visualAssetReceipt: null,
        evaluation: new HazardEvaluationRecord({
          payload: mutatedPayload,
          postcommitBase64: encodeCanonicalBase64(postcommitBytes()),
          retainedVisualAsset: null
        })
      }),
      catch: (cause) => cause
    }).pipe(Effect.match({
      onFailure: () => "rejected" as const,
      onSuccess: () => "accepted" as const
    }))

    strictEqual(outcome, "rejected")
  })
)

it.effect("rejects a same-length postcommit-byte mutation against the receipt digest", () =>
  Effect.gen(function*() {
    const originalBytes = postcommitBytes()
    const originalText = new TextDecoder().decode(originalBytes)
    const mutatedBytes = new TextEncoder().encode(originalText.replace("section 1", "section 2"))
    strictEqual(mutatedBytes.byteLength, originalBytes.byteLength)
    const outcome = yield* Effect.tryPromise({
      try: () => validateHazardEvaluation({
        receipt: receipt("nonvisual", originalBytes),
        scene: precommitScene(),
        visualAssetReceipt: null,
        evaluation: new HazardEvaluationRecord({
          payload: postcommitScene(),
          postcommitBase64: encodeCanonicalBase64(mutatedBytes),
          retainedVisualAsset: null
        })
      }),
      catch: (cause) => cause
    }).pipe(Effect.match({
      onFailure: () => "rejected" as const,
      onSuccess: () => "accepted" as const
    }))

    strictEqual(outcome, "rejected")
  })
)

it.effect("rejects postcommit bytes and digest receipt mutations", () =>
  Effect.gen(function*() {
    const exactReceipt = receipt("nonvisual")
    const evaluation = new HazardEvaluationRecord({
      payload: postcommitScene(),
      postcommitBase64: encodeCanonicalBase64(postcommitBytes()),
      retainedVisualAsset: null
    })
    const mutatedReceipts: ReadonlyArray<HazardAttemptReceipt> = [
      { ...exactReceipt, postcommitBytes: exactReceipt.postcommitBytes + 1 },
      { ...exactReceipt, postcommitSha256: "0".repeat(64) },
      { ...exactReceipt, postcommitPath: "/content/vertical-slice/scenes/s999.postcommit.json" }
    ]

    for (const mutatedReceipt of mutatedReceipts) {
      const outcome = yield* Effect.tryPromise({
        try: () => validateHazardEvaluation({
          receipt: mutatedReceipt,
          scene: precommitScene(),
          visualAssetReceipt: null,
          evaluation
        }),
        catch: (cause) => cause
      }).pipe(Effect.match({
        onFailure: () => "rejected" as const,
        onSuccess: () => "accepted" as const
      }))
      strictEqual(outcome, "rejected")
    }
  })
)

it.effect("accepts an exact BOM-bearing postcommit artifact", () =>
  Effect.gen(function*() {
    const jsonBytes = postcommitBytes()
    const bomBytes = new Uint8Array(jsonBytes.byteLength + 3)
    bomBytes.set([0xef, 0xbb, 0xbf])
    bomBytes.set(jsonBytes, 3)
    const postcommitBase64 = encodeCanonicalBase64(bomBytes)
    const validated = yield* Effect.promise(() => validateHazardEvaluation({
      receipt: receipt("nonvisual", bomBytes),
      scene: precommitScene(),
      visualAssetReceipt: null,
      evaluation: new HazardEvaluationRecord({
        payload: postcommitScene(),
        postcommitBase64,
        retainedVisualAsset: null
      })
    }))

    strictEqual(validated.postcommitBase64, postcommitBase64)
    deepStrictEqual(validated.payload, postcommitScene())
  })
)

it.effect("rejects a same-length retained-image bit flip against its durable digest", () =>
  Effect.gen(function*() {
    const retained = yield* Effect.promise(() =>
      retainImageBlob(visualAssetReceipt, visualAssetBlob())
    )
    const comma = retained.dataUrl.indexOf(",")
    const mutationIndex = comma + 12
    const original = retained.dataUrl[mutationIndex]
    if (original === undefined) throw new Error("Expected retained image base64 payload")
    const corrupted = new RetainedImageAsset({
      receipt: retained.receipt,
      dataUrl: `${retained.dataUrl.slice(0, mutationIndex)}${original === "A" ? "B" : "A"}${retained.dataUrl.slice(mutationIndex + 1)}`
    })
    const result = yield* Effect.tryPromise({
      try: () => validateHazardEvaluation({
        receipt: receipt("visual"),
        scene: precommitScene(),
        visualAssetReceipt,
        evaluation: new HazardEvaluationRecord({
          payload: postcommitScene(),
          postcommitBase64: encodeCanonicalBase64(postcommitBytes()),
          retainedVisualAsset: corrupted
        })
      }),
      catch: (cause) => cause
    }).pipe(Effect.match({
      onFailure: () => "rejected" as const,
      onSuccess: () => "accepted" as const
    }))
    strictEqual(result, "rejected")
  })
)

it.effect("rejects a scene-valid receipt whose postcommit path names another asset", () => {
  let commitCount = 0
  const persistenceLayer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.sync(() => {
        commitCount += 1
        return attempt(input)
      }),
      findAttempt: () => Effect.succeed(undefined),
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    const outcome = yield* commitHazardAndReveal({
      receipt: {
        ...receipt("visual"),
        postcommitPath: "/content/vertical-slice/scenes/s999.postcommit.json"
      },
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft,
      visualAssetReceipt
    }).pipe(
      Effect.provide(Layer.merge(persistenceLayer, verifiedLayer)),
      Effect.match({
        onFailure: (error) => error._tag,
        onSuccess: () => "unexpected-success"
      })
    )

    strictEqual(outcome, "HazardAttemptMismatch")
    strictEqual(commitCount, 0)
  })
})

it.effect("completes a response-only attempt through exact network asset fallback", () => {
  const currentReceipt = receipt("visual")
  const committed = attempt({
    receipt: currentReceipt,
    allowedZoneOrders: [1, 2],
    markers: visualDraft.markers,
    selectedZoneOrders: [],
    zeroHazardsConfirmed: false
  })
  let networkAssetReads = 0
  let cachedAssetReads = 0
  const persistenceLayer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: () => Effect.die("not used"),
      findAttempt: () => Effect.succeed(committed),
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
      listAttempts: noAttempts
    })
  )
  const cacheEvictedContentLayer = Layer.succeed(
    VerifiedContent,
    VerifiedContent.of({
      ensureAssetAvailable: () => Effect.die("not used"),
      ensureAvailable: () => Effect.die("not used"),
      loadAssetBlob: () => Effect.sync(() => {
        networkAssetReads += 1
        return visualAssetBlob()
      }),
      loadCachedAssetBlob: () => Effect.sync(() => {
        cachedAssetReads += 1
        throw new Error("The verified cache was evicted")
      }),
      loadCachedJson: () => Effect.die("not used"),
      loadJson: () => Effect.die("not used"),
      loadJsonArtifact: () => Effect.succeed({
        bytes: postcommitBytes(),
        value: postcommitScene()
      })
    })
  )

  return Effect.gen(function*() {
    const restored = yield* restoreHazardAndReveal({
      receipt: currentReceipt,
      scene: precommitScene(),
      mode: "visual",
      visualAssetReceipt
    }).pipe(Effect.provide(Layer.merge(persistenceLayer, cacheEvictedContentLayer)))

    strictEqual(restored?.tag, "revealed")
    strictEqual(networkAssetReads, 1)
    strictEqual(cachedAssetReads, 0)
    if (restored?.tag === "revealed") {
      strictEqual(restored.retainedVisualAsset?.receipt.path, visualAssetReceipt.path)
    }
  })
})

it.effect("fails closed after commit when the feedback asset identity differs", () => {
  const originalFetch = globalThis.fetch
  const layer = Layer.succeed(
    HazardPersistence,
    HazardPersistence.of({
      commitAttempt: (input) => Effect.succeed(attempt(input)),
      findAttempt: () => Effect.succeed(undefined),
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
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
      draft: visualDraft,
      visualAssetReceipt
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
      loadCachedAssetBlob: () => Effect.die("not used"),
      loadCachedJson: () => Effect.die("not used"),
      loadJsonArtifact: () => Effect.die("must not load"),
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
      completeAttempt: (input) => Effect.succeed(completedAttempt(input)),
      listAttempts: noAttempts
    })
  )

  return Effect.gen(function*() {
    const result = yield* commitHazardAndReveal({
      receipt: currentReceipt,
      scene: precommitScene(),
      mode: "visual",
      draft: visualDraft,
      visualAssetReceipt
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
    const zeroStatements = payload.nonvisualZonedEquivalent.filter(
      (statement) => statement.role !== "target"
    )
    const firstZeroStatement = zeroStatements[0]
    if (firstZeroStatement === undefined) throw new Error("Expected a zero-scene statement")
    const validZero: PostcommitScene = {
      ...payload,
      kind: "zero-hazard",
      hazardFamily: null,
      targets: [],
      targetRegions: [],
      fullPostAnswer: { ...payload.fullPostAnswer, targets: [] },
      nonvisualZonedEquivalent: [firstZeroStatement, ...zeroStatements.slice(1)]
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
    const unknownZoneStatements = payload.nonvisualZonedEquivalent.map((statement, index) =>
      index === 0 ? { ...statement, zone: "unreleased zone" } : statement
    )
    const firstUnknownZoneStatement = unknownZoneStatements[0]
    if (firstUnknownZoneStatement === undefined) throw new Error("Expected a zone statement")
    const unknownZone: PostcommitScene = {
      ...payload,
      nonvisualZonedEquivalent: [firstUnknownZoneStatement, ...unknownZoneStatements.slice(1)]
    }
    const contradictoryStatementValues = payload.nonvisualZonedEquivalent.map((statement) =>
      statement.role === "target"
        ? { ...statement, statement: "the floor is dry and clear" }
        : statement.role === "decoy"
          ? { ...statement, statement: "the conduit blocks the route" }
          : statement
    )
    const firstContradictoryStatement = contradictoryStatementValues[0]
    if (firstContradictoryStatement === undefined) {
      throw new Error("Expected a contradictory statement fixture")
    }
    const contradictoryStatements: PostcommitScene = {
      ...payload,
      nonvisualZonedEquivalent: [
        firstContradictoryStatement,
        ...contradictoryStatementValues.slice(1)
      ]
    }
    const sceneWithUnusedNeutralZone: PrecommitScene = {
      ...scene,
      neutralPreAnswer: {
        ...scene.neutralPreAnswer,
        zones: [
          ...scene.neutralPreAnswer.zones,
          { order: 3, label: "doorway", description: "A clear doorway." }
        ]
      }
    }

    strictEqual(hasValidPostcommitClosure(scene, missingFullTarget), false)
    strictEqual(hasValidPostcommitClosure(scene, missingTargetStatement), false)
    strictEqual(hasValidPostcommitClosure(scene, unsafeSourceUrl), false)
    strictEqual(hasValidPostcommitClosure(scene, validZero), true)
    strictEqual(hasValidPostcommitClosure(scene, invalidZeroFamily), false)
    strictEqual(hasValidPostcommitClosure(scene, invalidRegion), false)
    strictEqual(hasValidPostcommitClosure(scene, unknownZone), false)
    strictEqual(hasValidPostcommitClosure(scene, contradictoryStatements), false)
    strictEqual(hasValidPostcommitClosure(sceneWithUnusedNeutralZone, payload), true)
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

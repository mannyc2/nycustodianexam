import { createHash } from "node:crypto"
import { createElement } from "react"
import { readFileSync } from "node:fs"
import {
  PostcommitQuestion,
  PostcommitScene,
  PrecommitScene,
  ReleaseManifest
} from "@nycustodian/content/model"
import { renderToStaticMarkup } from "react-dom/server"
import { Effect, Schema } from "effect"
import { describe, expect, it, vi } from "vitest"
import {
  createLocallyClosedSimulation,
  createSimulationPlayerController,
  createSimulationResultsController,
  type SimulationEffectRunner,
  type SimulationPlayerController
} from "../src/simulation/controller.ts"
import { assembleSimulation, evaluateSimulation } from "../src/simulation/generation.ts"
import {
  SimulationBootstrap,
  SimulationSessionRecord,
  type SimulationSessionItem,
  SimulationSubmissionRecord,
  SimulationTimingSettings
} from "../src/simulation/model.ts"
import {
  SimulationPersistence,
  SimulationPersistenceError,
  validateSimulationSession,
  validateSimulationSubmission
} from "../src/simulation/persistence.ts"
import { SimulationPlayer } from "../src/simulation/react/player.tsx"
import { SimulationResults } from "../src/simulation/react/results.tsx"
import { VerifiedContent } from "../src/verified-content.ts"
import {
  decodeCanonicalBase64,
  encodeCanonicalBase64,
  retainImageBlob
} from "../src/retained-image.ts"

const sha = "a".repeat(64)
const releaseRoot = new URL("../../../content/releases/vertical-slice/", import.meta.url)
const releaseManifest = Schema.decodeUnknownSync(ReleaseManifest)(
  JSON.parse(readFileSync(new URL("manifest.json", releaseRoot), "utf8"))
)
const hazardScene = Schema.decodeUnknownSync(PrecommitScene)(
  JSON.parse(readFileSync(new URL("scenes/s001.precommit.json", releaseRoot), "utf8"))
)
const hazardSceneAnswer = Schema.decodeUnknownSync(PostcommitScene)(
  JSON.parse(readFileSync(new URL("scenes/s001.postcommit.json", releaseRoot), "utf8"))
)
const hazardArtifact = releaseManifest.artifacts.find(
  (artifact) => artifact.kind === "scene-postcommit" && artifact.itemId === hazardScene.id
)
const hazardAsset = hazardScene.asset.derivatives.find((asset) => asset.kind === "web")
if (hazardArtifact === undefined || hazardAsset === undefined) {
  throw new Error("The controller hazard fixture is outside the release manifest")
}
const hazardAssetBytes = new Uint8Array(readFileSync(
  new URL(`../../../${hazardAsset.path}`, import.meta.url)
))
const hazardPostcommitBytes = new Uint8Array(readFileSync(
  new URL(hazardArtifact.path, releaseRoot)
))

const postcommitArtifact = <A>(
  payload: A,
  bytes = new TextEncoder().encode(JSON.stringify(payload))
) => ({ payload, postcommitBase64: encodeCanonicalBase64(bytes) })

const withPostcommitReceipts = (
  session: SimulationSessionRecord,
  artifacts: ReadonlyArray<{ readonly postcommitBase64: string }>
): SimulationSessionRecord => validateSimulationSession({
  ...session,
  items: session.items.map((item, index) => {
    const artifact = artifacts[index]
    if (artifact === undefined) throw new Error("Missing postcommit artifact fixture")
    const bytes = decodeCanonicalBase64(artifact.postcommitBase64)
    return {
      ...item,
      receipt: {
        ...item.receipt,
        postcommitBytes: bytes.byteLength,
        postcommitSha256: createHash("sha256").update(bytes).digest("hex")
      }
    }
  })
})

const bootstrap = Schema.decodeUnknownSync(SimulationBootstrap)({
  schemaVersion: 1,
  releaseId: "release-1",
  packVersion: 1,
  profiles: [{
    id: "profile-1",
    label: "Entry-level custodians",
    version: 1,
    jurisdiction: "New York State",
    compatibilityKey: "profile-1-v1",
    disclaimer: "Original practice only."
  }],
  advertisedLengths: [2, 45],
  hazards: [{
    scene: hazardScene,
    visualReceipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1",
      position: 1,
      postcommitPath: `/content/vertical-slice/${hazardArtifact.path}`,
      postcommitBytes: hazardArtifact.bytes,
      postcommitSha256: hazardArtifact.sha256,
      sceneId: hazardScene.id,
      mode: "visual",
      assetRevision: hazardScene.asset.revision,
      assetMasterSha256: hazardScene.asset.masterSha256
    },
    nonvisualReceipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1-nonvisual",
      position: 1,
      postcommitPath: `/content/vertical-slice/${hazardArtifact.path}`,
      postcommitBytes: hazardArtifact.bytes,
      postcommitSha256: hazardArtifact.sha256,
      sceneId: hazardScene.id,
      mode: "nonvisual",
      assetRevision: hazardScene.asset.revision,
      assetMasterSha256: hazardScene.asset.masterSha256
    },
    visualAsset: {
      path: `/${hazardAsset.path}`,
      bytes: hazardAsset.bytes,
      sha256: hazardAsset.sha256
    },
    profileIds: ["profile-1"],
    category: hazardScene.environment
  }],
  inventory: ["q1", "q2"].map((id, index) => ({
    question: {
      schemaVersion: 1,
      id,
      profileId: "profile-1",
      prompt: `Prompt ${id}`,
      options: [
        { id: `${id}-a`, label: `Option A ${id}` },
        { id: `${id}-b`, label: `Option B ${id}` }
      ]
    },
    profileIds: ["profile-1"],
    receipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1",
      position: index + 1,
      postcommitPath: `/content/vertical-slice/questions/${id}.postcommit.json`,
      postcommitBytes: 10,
      postcommitSha256: sha,
      questionId: id
    },
    category: "Tools"
  }))
})

const questionItems = (session: SimulationSessionRecord): ReadonlyArray<SimulationSessionItem> =>
  session.items.map((item) => {
    if (!("question" in item)) throw new Error("Expected a question-only test simulation")
    return item
  })

const sessionFixture = (autoSubmit = true): SimulationSessionRecord => assembleSimulation({
  bootstrap,
  sessionId: "sim-12345678",
  profileId: "profile-1",
  length: 2,
  seed: "controller",
  selectedCategories: ["Tools"],
  timing: new SimulationTimingSettings({
    mode: "timed",
    durationSeconds: 1,
    timerVisible: true,
    autoSubmit
  }),
  now: 0
})

const hazardSessionFixture = (
  format: "visual-hazards" | "nonvisual-hazards"
): SimulationSessionRecord => assembleSimulation({
  bootstrap,
  sessionId: format === "visual-hazards" ? "sim-visual123" : "sim-nonvis123",
  profileId: "profile-1",
  format,
  length: 1,
  seed: format,
  selectedCategories: [hazardScene.environment],
  timing: new SimulationTimingSettings({
    mode: "untimed",
    durationSeconds: null,
    timerVisible: false,
    autoSubmit: false
  }),
  now: 0
})

const persistenceError = (detail: string): SimulationPersistenceError =>
  new SimulationPersistenceError({
    operation: "test",
    detail,
    cause: new Error(detail)
  })

const verifiedContent = (events: Array<string> = []) => VerifiedContent.of({
  ensureAssetAvailable: () => Effect.die("not used"),
  ensureAvailable: (receipt) => Effect.sync(() => {
    const questionId = /\/([^/]+)\.postcommit\.json$/.exec(receipt.postcommitPath)?.[1]
    if (questionId === undefined) throw new Error("Test receipt has no question identity")
    events.push(`available:${questionId}`)
    return { path: receipt.postcommitPath, source: "verified-cache" as const }
  }),
  loadAssetBlob: () => Effect.die("not used"),
  loadCachedAssetBlob: () => Effect.die("not used"),
  loadCachedJson: () => Effect.die("parsed-only result reads are forbidden"),
  loadJsonArtifact: (receipt) => Effect.sync(() => {
    const questionId = /\/([^/]+)\.postcommit\.json$/.exec(receipt.postcommitPath)?.[1]
    if (questionId === undefined) throw new Error("Test receipt has no question identity")
    events.push(`load:${questionId}`)
    const value = {
      schemaVersion: 1,
      id: questionId,
      correctOptionId: `${questionId}-a`,
      rationales: ["a", "b"].map((suffix) => ({
        optionId: `${questionId}-${suffix}`,
        message: `Rationale ${suffix}`
      })),
      sources: [{ id: "source", label: "Source", locator: "section 1" }]
    }
    return {
      bytes: new TextEncoder().encode(JSON.stringify(value)),
      value
    }
  }),
  loadJson: () => Effect.die("network result reads are forbidden")
})

const runtimeFor = (
  persistence: SimulationPersistence["Service"],
  content = verifiedContent()
): SimulationEffectRunner => ({
  runPromise: <A, E>(effect: Effect.Effect<A, E, SimulationPersistence | VerifiedContent>) =>
    Effect.runPromise(effect.pipe(
      Effect.provideService(SimulationPersistence, persistence),
      Effect.provideService(VerifiedContent, content)
    ))
})

const submitted = (session: SimulationSessionRecord): SimulationSubmissionRecord =>
  new SimulationSubmissionRecord({
    schemaVersion: 1,
    id: `${session.id}:final`,
    sessionId: session.id,
    status: "submitted",
    answers: questionItems(session).map((item) => ({
      questionId: item.question.id,
      selectedOptionId: null,
      reviewIntent: "unflagged"
    })) as [
      { readonly questionId: string; readonly selectedOptionId: null; readonly reviewIntent: "unflagged" },
      ...Array<{ readonly questionId: string; readonly selectedOptionId: null; readonly reviewIntent: "unflagged" }>
    ],
    submittedAt: 2
  })

const savedResponse = (
  session: SimulationSessionRecord,
  input: Parameters<SimulationPersistence["Service"]["saveResponse"]>[0]
): SimulationSessionRecord => new SimulationSessionRecord({
  ...session,
  responses: [{
    questionId: input.questionId,
    selectedOptionId: input.selectedOptionId,
    markers: input.markers ?? [],
    selectedZoneOrders: input.selectedZoneOrders ?? [],
    zeroHazardsConfirmed: input.zeroHazardsConfirmed ?? false,
    reviewIntent: input.reviewIntent,
    updatedAt: 1
  }],
  updatedAt: 1
})

describe("simulation player controller", () => {
  it("flags an unanswered hazard without converting the flag into an answer", async () => {
    for (const format of ["visual-hazards", "nonvisual-hazards"] as const) {
      let session = hazardSessionFixture(format)
      const saves: Array<Parameters<SimulationPersistence["Service"]["saveResponse"]>[0]> = []
      const persistence = SimulationPersistence.of({
        createSession: () => Effect.die("not used"),
        findSession: () => Effect.succeed(session),
        saveResponse: (input) => Effect.sync(() => {
          saves.push(input)
          session = savedResponse(session, input)
          return session
        }),
        setPosition: () => Effect.succeed(session),
        setTimerVisibility: () => Effect.die("not used"),
        submit: () => Effect.die("not used"),
        findSubmission: () => Effect.succeed(undefined),
        complete: () => Effect.die("not used")
      })
      const controller = createSimulationPlayerController({
        runtime: runtimeFor(persistence, VerifiedContent.of({
          ...verifiedContent(),
          loadCachedAssetBlob: () => Effect.succeed(new Blob(["scene"], { type: "image/png" }))
        })),
        sessionId: session.id,
        position: 1,
        replaceLocation: () => undefined
      })
      controller.start()
      await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("ready"))
      controller.dispatch({ tag: "toggle-flag" })
      await vi.waitFor(() => expect(saves).toHaveLength(1))
      expect(saves[0]).toMatchObject({
        selectedOptionId: null,
        markers: [],
        selectedZoneOrders: [],
        zeroHazardsConfirmed: false,
        reviewIntent: "flagged"
      })
      await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
        tag: "ready",
        session: { responses: [{ reviewIntent: "flagged" }] }
      }))
      const snapshot = controller.getSnapshot()
      const html = renderToStaticMarkup(createElement(SimulationPlayer, {
        controller: { ...controller, getHydrationSnapshot: () => snapshot },
        position: 1
      }))
      expect(html).toContain("0 answered · 1 unanswered")
      expect(html).toContain('aria-pressed="true"')
      controller.dispose()
    }
  })

  it("autosaves and restores visual markers and nonvisual zones without result reads", async () => {
    for (const format of ["visual-hazards", "nonvisual-hazards"] as const) {
      let session = hazardSessionFixture(format)
      let resultReads = 0
      const persistence = SimulationPersistence.of({
        createSession: () => Effect.die("not used"),
        findSession: () => Effect.succeed(session),
        saveResponse: (input) => Effect.sync(() => {
          session = savedResponse(session, input)
          return session
        }),
        setPosition: () => Effect.succeed(session),
        setTimerVisibility: () => Effect.die("not used"),
        submit: () => Effect.die("not used"),
        findSubmission: () => Effect.succeed(undefined),
        complete: () => Effect.die("not used")
      })
      const content = VerifiedContent.of({
        ...verifiedContent(),
        loadCachedAssetBlob: () => Effect.succeed(new Blob(["scene"], { type: "image/png" })),
        loadCachedJson: () => Effect.sync(() => {
          resultReads += 1
          return {}
        })
      })
      const makeController = () => createSimulationPlayerController({
        runtime: runtimeFor(persistence, content),
        sessionId: session.id,
        position: 1,
        replaceLocation: () => undefined
      })
      const controller = makeController()
      controller.start()
      await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("ready"))
      if (format === "visual-hazards") {
        expect(controller.getSnapshot().state).toMatchObject({
          tag: "ready",
          visualAssetUrl: expect.stringMatching(/^blob:/)
        })
        controller.dispatch({ tag: "add-hazard-marker", x: 0.5, y: 0.7 })
        await vi.waitFor(() => expect(session.responses[0]).toMatchObject({
          questionId: hazardScene.id,
          markers: [{ id: "marker-1", x: 0.5, y: 0.7 }]
        }))
      } else {
        const zoneOrder = hazardScene.neutralPreAnswer.zones[0]?.order
        if (zoneOrder === undefined) throw new Error("Expected a nonvisual zone")
        controller.dispatch({ tag: "toggle-hazard-zone", zoneOrder })
        await vi.waitFor(() => expect(session.responses[0]).toMatchObject({
          questionId: hazardScene.id,
          selectedZoneOrders: [zoneOrder]
        }))
      }
      controller.dispose()

      const restored = makeController()
      restored.start()
      await vi.waitFor(() => expect(restored.getSnapshot().state).toMatchObject({
        tag: "ready",
        session: { responses: [expect.objectContaining({ questionId: hazardScene.id })] }
      }))
      expect(resultReads).toBe(0)
      restored.dispose()
    }
  })

  it("holds strict expiry through an in-flight save and submits exactly once after it closes", async () => {
    let session = sessionFixture()
    let releaseSave: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      releaseSave = resolve
    })
    let submitCalls = 0
    const locations: Array<string> = []
    const persistence = SimulationPersistence.of({
      createSession: () => Effect.die("not used"),
      findSession: () => Effect.succeed(session),
      saveResponse: (input) => Effect.tryPromise({
        try: async () => {
          await gate
          session = savedResponse(session, input)
          return session
        },
        catch: () => persistenceError("save failed")
      }),
      setPosition: () => Effect.succeed(session),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.sync(() => {
        submitCalls += 1
        return submitted(session)
      }),
      findSubmission: () => Effect.succeed(undefined),
      complete: () => Effect.die("not used")
    })
    const controller = createSimulationPlayerController({
      runtime: runtimeFor(persistence),
      sessionId: session.id,
      position: 1,
      replaceLocation: (path) => locations.push(path)
    })
    controller.start()
    await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("ready"))

    controller.dispatch({ tag: "select-option", optionId: questionItems(session)[0]!.optionOrder[0]! })
    controller.dispatch({ tag: "timer-expired" })
    controller.dispatch({ tag: "timer-expired" })
    expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      saving: true,
      strictExpiryPending: true
    })
    expect(submitCalls).toBe(0)

    releaseSave?.()
    await vi.waitFor(() => expect(submitCalls).toBe(1))
    await vi.waitFor(() => expect(locations).toHaveLength(1))
    controller.dispatch({ tag: "timer-expired" })
    await Promise.resolve()
    expect(submitCalls).toBe(1)
  })

  it("retains an optimistic answer and flag after failure and retries the exact save", async () => {
    let session = new SimulationSessionRecord({
      ...sessionFixture(false),
      responses: [{
        questionId: "q1",
        selectedOptionId: "q1-a",
        reviewIntent: "unflagged",
        updatedAt: 0
      }]
    })
    let saveCalls = 0
    const persistence = SimulationPersistence.of({
      createSession: () => Effect.die("not used"),
      findSession: () => Effect.succeed(session),
      saveResponse: (input) => Effect.suspend(() => {
        saveCalls += 1
        if (saveCalls === 1) return Effect.fail(persistenceError("Injected local save failure"))
        session = savedResponse(session, input)
        return Effect.succeed(session)
      }),
      setPosition: () => Effect.succeed(session),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.succeed(undefined),
      complete: () => Effect.die("not used")
    })
    const controller = createSimulationPlayerController({
      runtime: runtimeFor(persistence),
      sessionId: session.id,
      position: 1,
      replaceLocation: () => undefined
    })
    controller.start()
    await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("ready"))
    controller.dispatch({ tag: "toggle-flag" })

    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      saving: false,
      recoverableError: { kind: "response", detail: "Injected local save failure" },
      session: {
        responses: [{ questionId: "q1", selectedOptionId: "q1-a", reviewIntent: "flagged" }]
      }
    }))
    expect(controller.getSnapshot().focusRequest?.target).toBe("recoverable-error")

    controller.dispatch({ tag: "retry-save" })
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      saving: false,
      recoverableError: null,
      session: {
        responses: [{ questionId: "q1", selectedOptionId: "q1-a", reviewIntent: "flagged" }]
      }
    }))
    expect(saveCalls).toBe(2)
    expect(session.responses[0]).toMatchObject({
      selectedOptionId: "q1-a",
      reviewIntent: "flagged"
    })
  })

  it("freezes post-deadline edits and retries the exact failed pre-deadline response", async () => {
    const base = sessionFixture()
    const currentItem = questionItems(base)[0]
    const selectedOptionId = currentItem?.optionOrder[0]
    const replacementOptionId = currentItem?.optionOrder[1]
    if (currentItem === undefined || selectedOptionId === undefined || replacementOptionId === undefined) {
      throw new Error("Expected two options on the current simulation item")
    }
    let session = new SimulationSessionRecord({
      ...base,
      responses: [{
        questionId: currentItem.question.id,
        selectedOptionId,
        reviewIntent: "unflagged",
        updatedAt: 0
      }]
    })
    let saveCalls = 0
    let submitCalls = 0
    const locations: Array<string> = []
    const persistence = SimulationPersistence.of({
      createSession: () => Effect.die("not used"),
      findSession: () => Effect.succeed(session),
      saveResponse: (input) => Effect.suspend(() => {
        saveCalls += 1
        if (saveCalls === 1) return Effect.fail(persistenceError("Injected local save failure"))
        session = savedResponse(session, input)
        return Effect.succeed(session)
      }),
      setPosition: () => Effect.succeed(session),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.sync(() => {
        submitCalls += 1
        return submitted(session)
      }),
      findSubmission: () => Effect.succeed(undefined),
      complete: () => Effect.die("not used")
    })
    const controller = createSimulationPlayerController({
      runtime: runtimeFor(persistence),
      sessionId: session.id,
      position: 1,
      replaceLocation: (path) => locations.push(path)
    })
    controller.start()
    await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("ready"))
    controller.dispatch({ tag: "toggle-flag" })
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      recoverableError: { kind: "response" },
      session: {
        responses: [{
          questionId: currentItem.question.id,
          selectedOptionId,
          reviewIntent: "flagged"
        }]
      }
    }))

    controller.dispatch({ tag: "timer-expired" })
    expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      strictExpiryPending: true
    })
    controller.dispatch({ tag: "select-option", optionId: replacementOptionId })
    controller.dispatch({ tag: "toggle-flag" })
    expect(controller.getSnapshot().state).toMatchObject({
      tag: "ready",
      strictExpiryPending: true,
      session: {
        responses: [{
          questionId: currentItem.question.id,
          selectedOptionId,
          reviewIntent: "flagged"
        }]
      }
    })
    expect(saveCalls).toBe(1)

    controller.dispatch({ tag: "retry-save" })
    await vi.waitFor(() => expect(submitCalls).toBe(1))
    await vi.waitFor(() => expect(locations).toHaveLength(1))
    expect(saveCalls).toBe(2)
    expect(session.responses[0]).toMatchObject({
      questionId: currentItem.question.id,
      selectedOptionId,
      reviewIntent: "flagged"
    })
  })
})

describe("self-contained evaluated simulation restoration", () => {
  const removedContent = (reads: { count: number }) => VerifiedContent.of({
    ensureAssetAvailable: () => Effect.die("verified cache was removed"),
    ensureAvailable: () => Effect.die("verified cache was removed"),
    loadAssetBlob: () => Effect.die("verified cache was removed"),
    loadCachedAssetBlob: () => Effect.sync(() => {
      reads.count += 1
      throw new Error("verified cache was removed")
    }),
    loadCachedJson: () => Effect.sync(() => {
      reads.count += 1
      throw new Error("verified cache was removed")
    }),
    loadJsonArtifact: () => Effect.sync(() => {
      reads.count += 1
      throw new Error("verified cache was removed")
    }),
    loadJson: () => Effect.die("network result reads are forbidden")
  })

  const restoreTwice = async (
    session: SimulationSessionRecord,
    submission: SimulationSubmissionRecord
  ): Promise<string> => {
    const reads = { count: 0 }
    const persistence = SimulationPersistence.of({
      createSession: () => Effect.die("not used"),
      findSession: () => Effect.succeed(session),
      saveResponse: () => Effect.die("not used"),
      setPosition: () => Effect.die("not used"),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.succeed(submission),
      complete: () => Effect.die("evaluated results must not be rewritten")
    })
    let html = ""
    for (let reload = 0; reload < 2; reload += 1) {
      const controller = createSimulationResultsController({
        runtime: runtimeFor(persistence, removedContent(reads)),
        sessionId: session.id
      })
      controller.start()
      await vi.waitFor(() => expect(controller.getSnapshot().state.tag).toBe("results"))
      const snapshot = controller.getSnapshot()
      html = renderToStaticMarkup(createElement(SimulationResults, {
        controller: { ...controller, getHydrationSnapshot: () => snapshot }
      }))
      controller.dispose()
    }
    expect(reads.count).toBe(0)
    return html
  }

  it("restores question rationales and sources after answer-pack cache removal", async () => {
    const initial = sessionFixture(false)
    const payloads = questionItems(initial).map((item) => Schema.decodeUnknownSync(
      PostcommitQuestion
    )({
      schemaVersion: 1,
      id: item.question.id,
      correctOptionId: item.optionOrder[0],
      rationales: item.question.options.map((option) => ({
        optionId: option.id,
        message: `Durable rationale for ${option.id}`
      })),
      sources: [{
        id: `source-${item.question.id}`,
        label: `Durable source ${item.question.id}`,
        locator: `section ${item.position}`
      }]
    }))
    const postcommit = payloads.map((payload) => postcommitArtifact(payload))
    const active = withPostcommitReceipts(initial, postcommit)
    const final = submitted(active)
    const evaluated = evaluateSimulation({ session: active, submission: final, postcommit })
    const session = new SimulationSessionRecord({
      ...active,
      status: "evaluated",
      updatedAt: 3
    })
    const submission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...final,
      status: "evaluated",
      evaluatedAt: 3,
      results: evaluated.results,
      correctCount: evaluated.correctCount
    })
    expect(validateSimulationSubmission(
      session,
      JSON.parse(JSON.stringify(submission))
    )).toEqual(submission)

    const html = await restoreTwice(session, submission)
    expect(html).toContain("Durable rationale for")
    expect(html).toContain("Durable source")
    expect(html).toContain("Why this answer is correct")
    expect(html).toContain("Open the separate local review queue")
  })

  it("restores hazard corrections, full descriptions, and sources after pack removal", async () => {
    const active = hazardSessionFixture("visual-hazards")
    const activeItem = active.items[0]
    if (activeItem === undefined || "question" in activeItem || activeItem.visualAsset === null) {
      throw new Error("Expected a visual hazard result fixture")
    }
    const final = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${active.id}:final`,
      sessionId: active.id,
      status: "submitted",
      submittedAt: 2,
      answers: [{
        questionId: hazardScene.id,
        selectedOptionId: null,
        markers: [{ id: "marker-1", x: 0.5, y: 0.7 }],
        selectedZoneOrders: [],
        zeroHazardsConfirmed: false,
        reviewIntent: "flagged"
      }]
    })
    const evaluated = evaluateSimulation({
      session: active,
      submission: final,
      postcommit: [postcommitArtifact(hazardSceneAnswer, hazardPostcommitBytes)],
      retainedVisualAssets: [await retainImageBlob(
        activeItem.visualAsset,
        new Blob([hazardAssetBytes], { type: "image/png" })
      )]
    })
    const session = new SimulationSessionRecord({
      ...active,
      status: "evaluated",
      updatedAt: 3
    })
    const submission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...final,
      status: "evaluated",
      evaluatedAt: 3,
      results: evaluated.results,
      correctCount: evaluated.correctCount
    })
    expect(validateSimulationSubmission(
      session,
      JSON.parse(JSON.stringify(submission))
    )).toEqual(submission)

    const firstTarget = hazardSceneAnswer.fullPostAnswer.targets[0]
    const firstSource = hazardSceneAnswer.fullPostAnswer.sources[0]
    if (firstTarget === undefined || firstSource === undefined) {
      throw new Error("Expected a positive hazard feedback fixture")
    }
    const html = await restoreTwice(session, submission)
    expect(html).toContain(hazardSceneAnswer.claim)
    expect(html).toContain(firstTarget.condition)
    expect(html).toContain(firstTarget.correction)
    expect(html).toContain(firstSource.title)
    expect(html).toContain("Reviewed scene overlay")
    expect(html).toContain("data:image/png;base64,")
    expect(html).toContain('data-marker-kind="')
    expect(html).toContain("Your flag is retained in this saved simulation result")
    expect(html).toContain("not automatically added to the separate due review queue")
    expect(html).not.toContain("Open your flagged review queue")
  })
})

describe("simulation local-content closure", () => {
  it("preflights the visual hazard answer and asset before durable creation without reading bytes", async () => {
    const session = hazardSessionFixture("visual-hazards")
    const events: Array<string> = []
    const persistence = SimulationPersistence.of({
      createSession: (value) => Effect.sync(() => {
        events.push("create")
        return value
      }),
      findSession: () => Effect.die("not used"),
      saveResponse: () => Effect.die("not used"),
      setPosition: () => Effect.die("not used"),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.die("not used"),
      complete: () => Effect.die("not used")
    })
    const content = VerifiedContent.of({
      ...verifiedContent(),
      ensureAvailable: (receipt) => Effect.sync(() => {
        events.push("answer-metadata")
        return { path: receipt.postcommitPath, source: "verified-cache" as const }
      }),
      ensureAssetAvailable: (receipt) => Effect.sync(() => {
        events.push("asset-metadata")
        return { path: receipt.path, source: "verified-cache" as const }
      }),
      loadCachedAssetBlob: () => Effect.sync(() => {
        events.push("asset-read")
        return new Blob()
      }),
      loadCachedJson: () => Effect.sync(() => {
        events.push("answer-read")
        return {}
      })
    })

    await runtimeFor(persistence, content).runPromise(createLocallyClosedSimulation(session))
    expect(events).toEqual(["answer-metadata", "asset-metadata", "create"])
  })

  it("checks every selected receipt without reading answer bytes before creating the session", async () => {
    const session = sessionFixture(false)
    const events: Array<string> = []
    const persistence = SimulationPersistence.of({
      createSession: (value) => Effect.sync(() => {
        events.push("create")
        return value
      }),
      findSession: () => Effect.die("not used"),
      saveResponse: () => Effect.die("not used"),
      setPosition: () => Effect.die("not used"),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.die("not used"),
      complete: () => Effect.die("not used")
    })

    await runtimeFor(persistence, verifiedContent(events)).runPromise(
      createLocallyClosedSimulation(session)
    )
    expect(events).toEqual(["available:q1", "available:q2", "create"])
  })

  it("does not create a session when a selected receipt identity mismatches", async () => {
    const base = sessionFixture(false)
    const first = questionItems(base)[0]
    if (first === undefined) throw new Error("Expected a first session item")
    const session = new SimulationSessionRecord({
      ...base,
      items: [{
        ...first,
        receipt: { ...first.receipt, questionId: "different-question" }
      }, ...base.items.slice(1)]
    })
    let created = false
    const persistence = SimulationPersistence.of({
      createSession: (value) => Effect.sync(() => {
        created = true
        return value
      }),
      findSession: () => Effect.die("not used"),
      saveResponse: () => Effect.die("not used"),
      setPosition: () => Effect.die("not used"),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.die("not used"),
      complete: () => Effect.die("not used")
    })
    const failure = await runtimeFor(persistence).runPromise(
      createLocallyClosedSimulation(session)
    ).catch((cause: unknown) => cause)
    expect(failure).toMatchObject({
      operation: "prepare-local-content",
      detail: expect.stringMatching(/valid release, profile, and receipt identity closure/)
    })
    expect(created).toBe(false)
  })

  it("does not create a session from online-but-uncached result receipts", async () => {
    const session = sessionFixture(false)
    let created = false
    const persistence = SimulationPersistence.of({
      createSession: (value) => Effect.sync(() => {
        created = true
        return value
      }),
      findSession: () => Effect.die("not used"),
      saveResponse: () => Effect.die("not used"),
      setPosition: () => Effect.die("not used"),
      setTimerVisibility: () => Effect.die("not used"),
      submit: () => Effect.die("not used"),
      findSubmission: () => Effect.die("not used"),
      complete: () => Effect.die("not used")
    })
    const uncached = VerifiedContent.of({
      ...verifiedContent(),
      ensureAvailable: (receipt) => Effect.succeed({
        path: receipt.postcommitPath,
        source: "network-required" as const
      })
    })

    const failure = await runtimeFor(persistence, uncached).runPromise(
      createLocallyClosedSimulation(session)
    ).catch((cause: unknown) => cause)
    expect(failure).toMatchObject({
      operation: "prepare-local-content",
      detail: expect.stringMatching(/not retained in the verified local content closure/)
    })
    expect(created).toBe(false)
  })
})

describe("recoverable simulation UI", () => {
  it("renders a focused alert, exact retry action, and the retained editable response", () => {
    const session = new SimulationSessionRecord({
      ...sessionFixture(false),
      responses: [{
        questionId: "q1",
        selectedOptionId: "q1-a",
        reviewIntent: "flagged",
        updatedAt: 1
      }]
    })
    const snapshot = {
      state: {
        tag: "ready" as const,
        session,
        confirmation: false,
        saving: false,
        strictExpiryPending: false,
        visualAssetUrl: null,
        recoverableError: {
          kind: "response" as const,
          detail: "Injected local save failure"
        }
      },
      revision: 1,
      focusRequest: { id: "focus-1", target: "recoverable-error" as const },
      announcementRequest: null
    }
    const controller: SimulationPlayerController = {
      getSnapshot: () => snapshot,
      getHydrationSnapshot: () => snapshot,
      subscribe: () => () => undefined,
      acknowledgeRequest: () => undefined,
      dispatch: () => undefined,
      start: () => undefined,
      dispose: () => undefined
    }
    const html = renderToStaticMarkup(createElement(SimulationPlayer, {
      controller,
      position: 1
    }))

    expect(html).toContain('role="alert"')
    expect(html).toContain("Response not saved")
    expect(html).toContain("Retry this exact local save")
    expect(html).toContain('aria-pressed="true"')
    expect(html).toMatch(/<input[^>]+checked=""[^>]+value="q1-a"/)
    expect(html).not.toContain("<fieldset disabled")
  })
})

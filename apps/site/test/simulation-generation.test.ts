import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import {
  PostcommitQuestion,
  PostcommitScene,
  PrecommitScene,
  ReleaseManifest
} from "@nycustodian/content/model"
import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  assembleSimulation,
  evaluateSimulation,
  simulationCapacity,
  simulationHazardCapacity
} from "../src/simulation/generation.ts"
import {
  SimulationBootstrap,
  SimulationSessionRecord,
  type SimulationSessionItem,
  SimulationSubmissionRecord,
  SimulationTimingSettings,
  parseSimulationRoute,
  simulationQuestionPath,
  simulationResultsPath
} from "../src/simulation/model.ts"
import {
  formatSimulationElapsed,
  simulationElapsedMilliseconds
} from "../src/simulation/results.ts"
import {
  monotonicSimulationTimestamp,
  updateSimulationPosition,
  validateSimulationSession,
  validateSimulationSubmission,
  validateSimulationSubmissionIntegrity
} from "../src/simulation/persistence.ts"
import {
  decodeCanonicalBase64,
  encodeCanonicalBase64,
  retainImageBlob
} from "../src/retained-image.ts"

const sha = "a".repeat(64)
const releaseRoot = new URL("../../../content/releases/vertical-slice/", import.meta.url)
const readReleaseJson = (path: string): unknown =>
  JSON.parse(readFileSync(new URL(path, releaseRoot), "utf8"))
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ""
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(binary)
}
const postcommitBytes = (payload: unknown): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(payload))
const postcommitArtifact = <A>(payload: A, bytes = postcommitBytes(payload)) => ({
  payload,
  postcommitBase64: encodeCanonicalBase64(bytes)
})
const sha256 = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex")
const releaseManifest = Schema.decodeUnknownSync(ReleaseManifest)(readReleaseJson("manifest.json"))
const releasedScene = Schema.decodeUnknownSync(PrecommitScene)(
  readReleaseJson("scenes/s001.precommit.json")
)
const releasedSceneAnswer = Schema.decodeUnknownSync(PostcommitScene)(
  readReleaseJson("scenes/s001.postcommit.json")
)
const releasedSceneArtifact = releaseManifest.artifacts.find(
  (artifact) => artifact.kind === "scene-postcommit" && artifact.itemId === releasedScene.id
)
const releasedSceneAsset = releasedScene.asset.derivatives.find(
  (asset) => asset.kind === "web"
)
if (releasedSceneArtifact === undefined || releasedSceneAsset === undefined) {
  throw new Error("The simulation hazard test fixture is outside the release manifest")
}
const releasedScenePostcommitBytes = new Uint8Array(readFileSync(
  new URL(releasedSceneArtifact.path, releaseRoot)
))
const releasedScenePostcommitArtifact = postcommitArtifact(
  releasedSceneAnswer,
  releasedScenePostcommitBytes
)
const releasedSceneAssetBytes = new Uint8Array(readFileSync(
  new URL(`../../../${releasedSceneAsset.path}`, import.meta.url)
))
const question = (id: string, position: number) => ({
  question: {
    schemaVersion: 1,
    id,
    profileId: "profile-1",
    prompt: `Prompt ${id}`,
    options: [
      { id: `${id}-a`, label: "A" },
      { id: `${id}-b`, label: "B" },
      { id: `${id}-c`, label: "C" }
    ]
  },
  profileIds: ["profile-1", "profile-2"],
  receipt: {
    releaseId: "release-1",
    packVersion: 1,
    sessionId: "release-1",
    position,
    postcommitPath: `/content/vertical-slice/questions/${id}.postcommit.json`,
    postcommitBytes: 10,
    postcommitSha256: sha,
    questionId: id
  },
  category: position === 1 ? "Cleaning tools" : "Hand tools"
})

const bootstrap = (reverse = false) => Schema.decodeUnknownSync(SimulationBootstrap)({
  schemaVersion: 1,
  releaseId: "release-1",
  packVersion: 1,
  profiles: [{
    id: "profile-1",
    label: "Entry-level custodians",
    version: 7,
    jurisdiction: "New York State",
    compatibilityKey: "profile-1-v1",
    disclaimer: "Original study content only."
  }, {
    id: "profile-2",
    label: "Nassau layer",
    version: 9,
    jurisdiction: "Nassau County",
    compatibilityKey: "profile-2-v1",
    disclaimer: "Original Nassau-compatible study content only."
  }],
  inventory: (reverse
    ? [question("question-3", 3), question("question-2", 2), question("question-1", 1)]
    : [question("question-1", 1), question("question-2", 2), question("question-3", 3)]),
  hazards: [],
  advertisedLengths: [3, 45, 60, 90]
})

const questionItems = (session: SimulationSessionRecord): ReadonlyArray<SimulationSessionItem> =>
  session.items.map((item) => {
    if (!("question" in item)) throw new Error("Expected a question-only test simulation")
    return item
  })

const bindPostcommitReceipts = (
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
        postcommitSha256: sha256(bytes)
      }
    }
  })
})

const questionPostcommit = (
  item: SimulationSessionItem,
  rationalePrefix = "Reviewed rationale"
): typeof PostcommitQuestion.Type => Schema.decodeUnknownSync(PostcommitQuestion)({
  schemaVersion: 1,
  id: item.question.id,
  correctOptionId: item.optionOrder[0],
  rationales: item.question.options.map((option) => ({
    optionId: option.id,
    message: `${rationalePrefix} for ${option.id}`
  })),
  sources: [{ id: "source", label: "Source", locator: "section" }]
})

const simulationSettings = {
  profileId: "profile-1",
  selectedCategories: ["Cleaning tools", "Hand tools"],
  timing: new SimulationTimingSettings({
    mode: "untimed",
    durationSeconds: null,
    timerVisible: false,
    autoSubmit: false
  })
} as const

const hazardBootstrap = (): SimulationBootstrap => Schema.decodeUnknownSync(SimulationBootstrap)({
  ...bootstrap(),
  hazards: [{
    scene: releasedScene,
    visualReceipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1",
      position: 1,
      postcommitPath: `/content/vertical-slice/${releasedSceneArtifact.path}`,
      postcommitBytes: releasedSceneArtifact.bytes,
      postcommitSha256: releasedSceneArtifact.sha256,
      sceneId: releasedScene.id,
      mode: "visual",
      assetRevision: releasedScene.asset.revision,
      assetMasterSha256: releasedScene.asset.masterSha256
    },
    nonvisualReceipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1-nonvisual",
      position: 1,
      postcommitPath: `/content/vertical-slice/${releasedSceneArtifact.path}`,
      postcommitBytes: releasedSceneArtifact.bytes,
      postcommitSha256: releasedSceneArtifact.sha256,
      sceneId: releasedScene.id,
      mode: "nonvisual",
      assetRevision: releasedScene.asset.revision,
      assetMasterSha256: releasedScene.asset.masterSha256
    },
    visualAsset: {
      path: `/${releasedSceneAsset.path}`,
      bytes: releasedSceneAsset.bytes,
      sha256: releasedSceneAsset.sha256
    },
    profileIds: ["profile-1", "profile-2"],
    category: releasedScene.environment
  }]
})

describe("deterministic simulation generation", () => {
  it("canonicalizes inventory before deterministic item and option shuffling", () => {
    const input = {
      bootstrap: bootstrap(),
      sessionId: "sim-12345678",
      length: 3,
      seed: "same-seed",
      ...simulationSettings,
      now: 100
    }
    const first = assembleSimulation(input)
    const second = assembleSimulation({ ...input, bootstrap: bootstrap(true) })
    const firstItems = questionItems(first)

    expect(first).toEqual(second)
    expect(firstItems.map((item) => item.question.id)).toHaveLength(3)
    expect(new Set(firstItems.map((item) => item.question.id))).toHaveLength(3)
    for (const item of firstItems) {
      expect(new Set(item.optionOrder)).toEqual(
        new Set(item.question.options.map((option) => option.id))
      )
      expect(item.receipt.sessionId).toBe(first.id)
      expect(item.receipt.position).toBe(item.position)
    }
  })

  it("reports exact unique capacity and refuses hidden repeats", () => {
    const source = bootstrap()
    expect(simulationCapacity(source.inventory, undefined, "profile-1")).toBe(3)
    expect(() => assembleSimulation({
      bootstrap: source,
      sessionId: "sim-12345678",
      length: 4,
      seed: "capacity",
      ...simulationSettings,
      now: 100
    })).toThrow(/only 3 are available/)
  })

  it("changes order for a different deterministic seed", () => {
    const shared = {
      bootstrap: bootstrap(),
      sessionId: "sim-12345678",
      length: 3,
      ...simulationSettings,
      now: 100
    }
    const left = assembleSimulation({ ...shared, seed: "left" })
    const right = assembleSimulation({ ...shared, seed: "right" })
    expect(JSON.stringify(left.items)).not.toBe(JSON.stringify(right.items))
  })

  it("trims deterministic seeds and rejects persisted seeds over the bounded input limit", () => {
    const shared = {
      bootstrap: bootstrap(),
      sessionId: "sim-seed12345",
      length: 2,
      ...simulationSettings,
      now: 100
    }
    expect(assembleSimulation({ ...shared, seed: "  bounded-seed  " }).seed).toBe("bounded-seed")
    expect(() => assembleSimulation({ ...shared, seed: "x".repeat(129) })).toThrow(
      /no longer than 128 code units/
    )
  })

  it("pins and evaluates visual and nonvisual hazard simulations as separate constructs", async () => {
    const source = hazardBootstrap()
    expect(simulationHazardCapacity(source.hazards, undefined, "profile-1")).toBe(1)
    const visual = assembleSimulation({
      bootstrap: source,
      sessionId: "sim-visual123",
      profileId: "profile-1",
      format: "visual-hazards",
      length: 1,
      seed: "visual",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    const visualItem = visual.items[0]
    if (visualItem === undefined || "question" in visualItem) {
      throw new Error("Expected a visual hazard simulation item")
    }
    if (visualItem.visualAsset === null) throw new Error("Expected a visual asset receipt")
    const retainedVisualAsset = await retainImageBlob(
      visualItem.visualAsset,
      new Blob([releasedSceneAssetBytes], { type: "image/png" })
    )
    expect(visualItem.mode).toBe("visual")
    expect(visualItem.visualAsset).toEqual(source.hazards[0]?.visualAsset)
    expect(visualItem.receipt).toMatchObject({
      sceneId: releasedScene.id,
      sessionId: visual.id,
      position: 1,
      mode: "visual"
    })
    const visualSubmission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${visual.id}:final`,
      sessionId: visual.id,
      status: "submitted",
      submittedAt: 200,
      answers: [{
        questionId: releasedScene.id,
        selectedOptionId: null,
        markers: [{ id: "marker-1", x: 0.5, y: 0.7 }],
        selectedZoneOrders: [],
        zeroHazardsConfirmed: false,
        reviewIntent: "unflagged"
      }]
    })
    const visualEvaluation = evaluateSimulation({
      session: visual,
      submission: visualSubmission,
      postcommit: [releasedScenePostcommitArtifact],
      retainedVisualAssets: [retainedVisualAsset]
    })
    expect(visualEvaluation).toMatchObject({
      correctCount: 1,
      results: [{
        kind: "hazard",
        mode: "visual",
        answered: true,
        targetCount: 1,
        hitCount: 1,
        missedCount: 0,
        decoyFalsePositiveCount: 0,
        falsePositiveCount: 0
      }]
    })
    const durableVisual = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...visualSubmission,
      status: "evaluated",
      evaluatedAt: 300,
      results: visualEvaluation.results,
      correctCount: visualEvaluation.correctCount
    })
    expect(validateSimulationSubmission(visual, durableVisual)).toEqual(durableVisual)
    await expect(validateSimulationSubmissionIntegrity(visual, durableVisual)).resolves.toEqual(
      durableVisual
    )
    const changedAssetBytes = new Uint8Array(releasedSceneAssetBytes)
    changedAssetBytes[changedAssetBytes.length - 1] =
      (changedAssetBytes[changedAssetBytes.length - 1] ?? 0) ^ 1
    const changedAssetDataUrl = `data:image/png;base64,${bytesToBase64(changedAssetBytes)}`
    await expect(validateSimulationSubmissionIntegrity(visual, {
      ...durableVisual,
      results: durableVisual.results?.map((result) => result.kind === "hazard"
        ? {
            ...result,
            retainedVisualAsset: result.retainedVisualAsset === null
              ? null
              : { ...result.retainedVisualAsset, dataUrl: changedAssetDataUrl }
          }
        : result)
    })).rejects.toThrow(/digest does not match/)
    expect(() => validateSimulationSubmission(visual, {
      ...durableVisual,
      results: durableVisual.results?.map((result) => result.kind === "hazard"
        ? {
            ...result,
            postcommit: { ...result.postcommit, opaqueAssetId: "different-scene" }
          }
        : result)
    })).toThrow(/payload does not match its retained bytes/)

    const nonvisual = assembleSimulation({
      bootstrap: source,
      sessionId: "sim-nonvis123",
      profileId: "profile-1",
      format: "nonvisual-hazards",
      length: 1,
      seed: "nonvisual",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    const nonvisualItem = nonvisual.items[0]
    if (nonvisualItem === undefined || "question" in nonvisualItem) {
      throw new Error("Expected a nonvisual hazard simulation item")
    }
    const targetLabel = releasedSceneAnswer.nonvisualZonedEquivalent.find(
      (statement) => statement.role === "target"
    )?.zone
    const targetZone = nonvisualItem.scene.neutralPreAnswer.zones.find(
      (zone) => zone.label === targetLabel
    )
    if (targetZone === undefined) throw new Error("Expected an exact target zone fixture")
    const nonvisualSubmission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${nonvisual.id}:final`,
      sessionId: nonvisual.id,
      status: "submitted",
      submittedAt: 200,
      answers: [{
        questionId: releasedScene.id,
        selectedOptionId: null,
        markers: [],
        selectedZoneOrders: [targetZone.order],
        zeroHazardsConfirmed: false,
        reviewIntent: "unflagged"
      }]
    })
    const nonvisualEvaluation = evaluateSimulation({
      session: nonvisual,
      submission: nonvisualSubmission,
      postcommit: [releasedScenePostcommitArtifact]
    })
    expect(nonvisualEvaluation).toMatchObject({
      correctCount: 1,
      results: [{
        kind: "hazard",
        mode: "nonvisual",
        answered: true,
        targetCount: 1,
        hitCount: 1,
        missedCount: 0,
        duplicateCount: 0
      }]
    })
    expect(nonvisualItem.visualAsset).toBeNull()
    expect(visualEvaluation.results[0]).not.toEqual(nonvisualEvaluation.results[0])
  })

  it("rejects hazard responses that cross their pinned visual/nonvisual closure", () => {
    const session = assembleSimulation({
      bootstrap: hazardBootstrap(),
      sessionId: "sim-hbound123",
      profileId: "profile-1",
      format: "visual-hazards",
      length: 1,
      seed: "hazard-boundary",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    expect(() => validateSimulationSession({
      ...session,
      responses: [{
        questionId: releasedScene.id,
        selectedOptionId: null,
        markers: [],
        selectedZoneOrders: [1],
        zeroHazardsConfirmed: false,
        reviewIntent: "unflagged",
        updatedAt: 100
      }]
    })).toThrow(/outside the hazard closure/)
  })

  it("recomputes distribution and binds each visual receipt to the pinned web derivative", () => {
    const questionSession = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-closure12",
      length: 3,
      seed: "distribution-closure",
      ...simulationSettings,
      now: 100
    })
    const firstDistribution = questionSession.distribution[0]
    const secondDistribution = questionSession.distribution[1]
    if (firstDistribution === undefined || secondDistribution === undefined) {
      throw new Error("Expected two distribution categories")
    }
    for (const distribution of [
      [{ ...firstDistribution, count: firstDistribution.count + 1 }, ...questionSession.distribution.slice(1)],
      [{ ...firstDistribution, label: `${firstDistribution.label} changed` }, ...questionSession.distribution.slice(1)],
      [firstDistribution, { ...firstDistribution, count: secondDistribution.count }, ...questionSession.distribution.slice(2)],
      [...questionSession.distribution].reverse()
    ]) {
      expect(() => validateSimulationSession({ ...questionSession, distribution })).toThrow(
        /distribution does not match/
      )
    }
    expect(() => validateSimulationSession({
      ...questionSession,
      selectedCategories: [...questionSession.selectedCategories].reverse()
    })).toThrow(/selected content mix/)

    const visual = assembleSimulation({
      bootstrap: hazardBootstrap(),
      sessionId: "sim-assetbind",
      profileId: "profile-1",
      format: "visual-hazards",
      length: 1,
      seed: "asset-closure",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    const item = visual.items[0]
    if (item === undefined || "question" in item || item.visualAsset === null) {
      throw new Error("Expected a visual hazard item")
    }
    const alternateDerivative = item.scene.asset.derivatives.find(
      (derivative) => derivative.kind !== "web"
    )
    if (alternateDerivative === undefined) throw new Error("Expected a non-web derivative")
    for (const visualAsset of [
      { ...item.visualAsset, path: `/${alternateDerivative.path}` },
      { ...item.visualAsset, bytes: item.visualAsset.bytes + 1 },
      { ...item.visualAsset, sha256: item.visualAsset.sha256 === "b".repeat(64) ? "c".repeat(64) : "b".repeat(64) }
    ]) {
      expect(() => validateSimulationSession({
        ...visual,
        items: [{ ...item, visualAsset }]
      })).toThrow(/receipt or asset closure/)
    }
    const webDerivative = item.scene.asset.derivatives.find((derivative) => derivative.kind === "web")
    if (webDerivative === undefined) throw new Error("Expected a web derivative")
    expect(() => validateSimulationSession({
      ...visual,
      items: [{
        ...item,
        scene: {
          ...item.scene,
          asset: {
            ...item.scene.asset,
            derivatives: [...item.scene.asset.derivatives, webDerivative]
          }
        }
      }]
    })).toThrow(/receipt or asset closure/)

    const nonvisual = assembleSimulation({
      bootstrap: hazardBootstrap(),
      sessionId: "sim-noasset12",
      profileId: "profile-1",
      format: "nonvisual-hazards",
      length: 1,
      seed: "nonvisual-asset-closure",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    const nonvisualItem = nonvisual.items[0]
    if (nonvisualItem === undefined || "question" in nonvisualItem) {
      throw new Error("Expected a nonvisual hazard item")
    }
    expect(() => validateSimulationSession({
      ...nonvisual,
      items: [{ ...nonvisualItem, visualAsset: item.visualAsset }]
    })).toThrow(/receipt or asset closure/)
  })

  it("scores unanswered items against total generated length and retains sample categories", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-12345678",
      length: 2,
      seed: "score",
      ...simulationSettings,
      now: 100
    })
    const items = questionItems(session)
    const first = items[0]
    const second = items[1]
    expect(first).toBeDefined()
    expect(second).toBeDefined()
    const submission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers: [
        { questionId: first?.question.id, selectedOptionId: first?.optionOrder[0], reviewIntent: "unflagged" },
        { questionId: second?.question.id, selectedOptionId: null, reviewIntent: "flagged" }
      ]
    })
    const answers = items.map((item, index) => Schema.decodeUnknownSync(PostcommitQuestion)({
      schemaVersion: 1,
      id: item.question.id,
      correctOptionId: index === 0 ? item.optionOrder[0] : item.optionOrder[1],
      rationales: item.question.options.map((option) => ({ optionId: option.id, message: "Reviewed rationale" })),
      sources: [{ id: "source", label: "Source", locator: "source#1" }]
    }))
    const evaluated = evaluateSimulation({
      session,
      submission,
      postcommit: answers.map((payload) => postcommitArtifact(payload))
    })
    expect(evaluated.correctCount).toBe(1)
    expect(evaluated.results).toHaveLength(2)
    expect(evaluated.results[1]).toMatchObject({ kind: "question", selectedOptionId: null })
  })

  it("does not infer directional confusion relations from option-to-concept mappings", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-confuse12",
      length: 2,
      seed: "directional-confusion",
      ...simulationSettings,
      now: 100
    })
    const items = questionItems(session)
    const answers = items.map((item) => ({
      questionId: item.question.id,
      selectedOptionId: item.optionOrder[1] ?? null,
      reviewIntent: "unflagged" as const
    }))
    const submission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers
    })
    const postcommit = items.map((item, index) => Schema.decodeUnknownSync(PostcommitQuestion)({
      schemaVersion: 1,
      id: item.question.id,
      correctOptionId: item.optionOrder[0],
      ...(index === 0 ? {
        optionConceptIds: item.optionOrder.map((optionId, optionIndex) => ({
          optionId,
          conceptId: `concept-${optionIndex}`
        }))
      } : {}),
      rationales: item.question.options.map((option) => ({
        optionId: option.id,
        message: `Rationale for ${option.id}`
      })),
      sources: [{ id: "source", label: "Source", locator: "section" }]
    }))
    const evaluated = evaluateSimulation({
      session,
      submission,
      postcommit: postcommit.map((payload) => postcommitArtifact(payload))
    })
    const results = evaluated.results.filter((result) => result.kind === "question")
    expect(results[0]).toMatchObject({
      correct: false,
      postcommit: {
        optionConceptIds: [
          { optionId: items[0]?.optionOrder[0], conceptId: "concept-0" },
          { optionId: items[0]?.optionOrder[1], conceptId: "concept-1" },
          { optionId: items[0]?.optionOrder[2], conceptId: "concept-2" }
        ]
      }
    })
  })

  it("parses only the scoped opaque simulation routes", () => {
    const id = "sim-12345678"
    expect(parseSimulationRoute(simulationQuestionPath(id, 2))).toEqual({
      tag: "question",
      sessionId: id,
      position: 2
    })
    expect(parseSimulationRoute(simulationResultsPath(id))).toEqual({ tag: "results", sessionId: id })
    expect(parseSimulationRoute("/simulations/session/not-safe/question/1/")).toBeUndefined()
  })

  it("derives a durable, non-negative elapsed result from session and submission timestamps", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-12345678",
      length: 2,
      seed: "elapsed",
      ...simulationSettings,
      now: 1_000
    })
    const submission = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 126_500,
      answers: questionItems(session).map((item) => ({
        questionId: item.question.id,
        selectedOptionId: null,
        reviewIntent: "unflagged"
      }))
    })
    expect(simulationElapsedMilliseconds(session, submission)).toBe(125_500)
    expect(formatSimulationElapsed(125_500)).toBe("2 min 5 sec")
    expect(formatSimulationElapsed(-1)).toBe("0 min 0 sec")
  })

  it("keeps current-position writes inside the active-session boundary", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-position12",
      length: 2,
      seed: "position",
      ...simulationSettings,
      now: 100
    })
    expect(updateSimulationPosition(session, 2).currentPosition).toBe(2)
    expect(() => updateSimulationPosition(
      new SimulationSessionRecord({ ...session, status: "submitted" }),
      1
    )).toThrow(/Submitted simulation position cannot be edited/)
  })

  it("clamps a rolled-back wall clock to durable simulation timestamps", () => {
    expect(monotonicSimulationTimestamp(50, 100, 125)).toBe(125)
    expect(monotonicSimulationTimestamp(150, 100, 125)).toBe(150)

    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => monotonicSimulationTimestamp(invalid, 100)).toThrow()
      expect(() => monotonicSimulationTimestamp(100, invalid)).toThrow()
    }

    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-clock1234",
      length: 2,
      seed: "clock-rollback",
      ...simulationSettings,
      now: 100
    })
    expect(() => validateSimulationSession({ ...session, updatedAt: 99 })).toThrow(
      /precedes its durable creation time/
    )
    expect(() => validateSimulationSession({
      ...session,
      updatedAt: 125,
      responses: [{
        questionId: questionItems(session)[0]?.question.id,
        selectedOptionId: null,
        reviewIntent: "unflagged",
        updatedAt: 126
      }]
    })).toThrow(/outside the session time closure/)
  })

  it("rejects malformed timing and durable timestamps across session, response, and result records", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-timeguard",
      length: 2,
      seed: "time-domain",
      ...simulationSettings,
      now: 100
    })
    const items = questionItems(session)
    const invalidTimes = [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      -1,
      Number.MAX_SAFE_INTEGER + 1
    ]

    for (const invalid of invalidTimes) {
      expect(() => validateSimulationSession({ ...session, createdAt: invalid })).toThrow()
      expect(() => validateSimulationSession({ ...session, updatedAt: invalid })).toThrow()
      expect(() => validateSimulationSession({
        ...session,
        updatedAt: 200,
        responses: [{
          questionId: items[0]?.question.id,
          selectedOptionId: null,
          reviewIntent: "unflagged",
          updatedAt: invalid
        }]
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(SimulationTimingSettings)({
        mode: "timed",
        durationSeconds: invalid,
        timerVisible: true,
        autoSubmit: true
      })).toThrow()
    }
    expect(() => Schema.decodeUnknownSync(SimulationTimingSettings)({
      mode: "timed",
      durationSeconds: 14_401,
      timerVisible: true,
      autoSubmit: true
    })).toThrow()

    const answers = items.map((item) => ({
      questionId: item.question.id,
      selectedOptionId: null,
      reviewIntent: "unflagged" as const
    }))
    const submitted = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers
    })
    const postcommit = items.map((item) => Schema.decodeUnknownSync(PostcommitQuestion)({
      schemaVersion: 1,
      id: item.question.id,
      correctOptionId: item.optionOrder[0],
      rationales: item.question.options.map((option) => ({
        optionId: option.id,
        message: `Reviewed rationale for ${option.id}`
      })),
      sources: [{ id: "source", label: "Source", locator: "source#time" }]
    }))
    const evaluatedValues = evaluateSimulation({
      session,
      submission: submitted,
      postcommit: postcommit.map((payload) => postcommitArtifact(payload))
    })
    const evaluated = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results: evaluatedValues.results,
      correctCount: evaluatedValues.correctCount
    })

    for (const invalid of invalidTimes) {
      expect(() => validateSimulationSubmission(session, {
        ...submitted,
        submittedAt: invalid
      })).toThrow()
      expect(() => validateSimulationSubmission(session, {
        ...evaluated,
        evaluatedAt: invalid
      })).toThrow()
    }
    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => validateSimulationSubmission(session, {
        ...evaluated,
        correctCount: invalid
      })).toThrow()
    }

    const responseAdvancedSession = validateSimulationSession({
      ...session,
      updatedAt: 250,
      responses: [{
        questionId: items[0]?.question.id,
        selectedOptionId: null,
        reviewIntent: "unflagged",
        updatedAt: 250
      }]
    })
    expect(() => validateSimulationSubmission(responseAdvancedSession, {
      ...submitted,
      submittedAt: 200
    })).toThrow(/result material|session closure/)
    expect(() => validateSimulationSubmission(responseAdvancedSession, {
      ...evaluated,
      evaluatedAt: 225
    })).toThrow(/incomplete/)
    expect(() => simulationElapsedMilliseconds(session, {
      ...submitted,
      submittedAt: 99
    })).toThrow(/precedes/)
  })

  it("filters the content mix before capacity and persists explicit timing settings", () => {
    const source = bootstrap()
    expect(simulationCapacity(source.inventory, ["Cleaning tools"])).toBe(1)
    const timing = new SimulationTimingSettings({
      mode: "timed",
      durationSeconds: 7_200,
      timerVisible: false,
      autoSubmit: true
    })
    const session = assembleSimulation({
      bootstrap: source,
      sessionId: "sim-12345678",
      profileId: "profile-1",
      length: 1,
      seed: "filtered",
      selectedCategories: ["Cleaning tools"],
      timing,
      now: 1_000
    })

    expect(session.items.map((item) => item.category)).toEqual(["Cleaning tools"])
    expect(session.selectedCategories).toEqual(["Cleaning tools"])
    expect(session.timing).toEqual(timing)
    expect(Schema.decodeUnknownSync(SimulationSessionRecord)(JSON.parse(JSON.stringify(session)))).toEqual(session)
    expect(() => assembleSimulation({
      bootstrap: source,
      sessionId: "sim-12345678",
      profileId: "profile-1",
      length: 1,
      seed: "invalid-timing",
      selectedCategories: ["Cleaning tools"],
      timing: new SimulationTimingSettings({
        mode: "untimed",
        durationSeconds: null,
        timerVisible: false,
        autoSubmit: true
      }),
      now: 1_000
    })).toThrow(/timing settings are inconsistent/)
  })

  it("scopes capacity and the persisted item closure to the explicitly selected profile", () => {
    const source = bootstrap()
    const scoped = Schema.decodeUnknownSync(SimulationBootstrap)({
      ...source,
      inventory: source.inventory.map((item, index) => ({
        ...item,
        profileIds: index === 0
          ? ["profile-1"]
          : index === 2
            ? ["profile-2"]
            : ["profile-1", "profile-2"]
      }))
    })
    expect(simulationCapacity(scoped.inventory, undefined, "profile-1")).toBe(2)
    expect(simulationCapacity(scoped.inventory, undefined, "profile-2")).toBe(2)

    const nassau = assembleSimulation({
      bootstrap: scoped,
      sessionId: "sim-nassau123",
      profileId: "profile-2",
      length: 2,
      seed: "nassau",
      selectedCategories: ["Hand tools"],
      timing: simulationSettings.timing,
      now: 100
    })

    expect(nassau.profile).toEqual({
      id: "profile-2",
      label: "Nassau layer",
      version: 9,
      jurisdiction: "Nassau County",
      compatibilityKey: "profile-2-v1",
      disclaimer: "Original Nassau-compatible study content only."
    })
    expect(nassau.items).toHaveLength(2)
    expect(nassau.items.every((item) => item.profileIds.includes("profile-2"))).toBe(true)
    expect(() => assembleSimulation({
      ...simulationSettings,
      bootstrap: scoped,
      sessionId: "sim-invalid12",
      profileId: "profile-1",
      length: 3,
      seed: "too-large",
      now: 100
    })).toThrow(/only 2 are available/)

    const statewide = assembleSimulation({
      bootstrap: source,
      sessionId: "sim-statewide1",
      profileId: "profile-1",
      length: 2,
      seed: "same-profile-settings",
      selectedCategories: ["Cleaning tools", "Hand tools"],
      timing: simulationSettings.timing,
      now: 100
    })
    const nassauWithSameSettings = assembleSimulation({
      bootstrap: source,
      sessionId: "sim-nassau567",
      profileId: "profile-2",
      length: 2,
      seed: "same-profile-settings",
      selectedCategories: ["Cleaning tools", "Hand tools"],
      timing: simulationSettings.timing,
      now: 100
    })
    expect(statewide.profile).toMatchObject({
      id: "profile-1",
      version: 7,
      compatibilityKey: "profile-1-v1"
    })
    expect(statewide).not.toEqual(nassauWithSameSettings)
    expect(Schema.decodeUnknownSync(SimulationSessionRecord)(
      JSON.parse(JSON.stringify(nassauWithSameSettings))
    ).profile).toEqual(nassauWithSameSettings.profile)
  })

  it("retains and verifies an exact BOM-bearing question postcommit artifact", async () => {
    const initial = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-bombytes1",
      length: 1,
      seed: "bom-byte-binding",
      ...simulationSettings,
      now: 100
    })
    const item = questionItems(initial)[0]
    if (item === undefined) throw new Error("Expected a question artifact fixture")
    const payload = questionPostcommit(item)
    const jsonBytes = postcommitBytes(payload)
    const bomBytes = new Uint8Array(jsonBytes.byteLength + 3)
    bomBytes.set([0xef, 0xbb, 0xbf])
    bomBytes.set(jsonBytes, 3)
    const artifact = postcommitArtifact(payload, bomBytes)
    const session = bindPostcommitReceipts(initial, [artifact])
    const submitted = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers: [{
        questionId: item.question.id,
        selectedOptionId: null,
        reviewIntent: "unflagged"
      }]
    })
    const evaluatedValues = evaluateSimulation({
      session,
      submission: submitted,
      postcommit: [artifact]
    })
    const evaluated = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results: evaluatedValues.results,
      correctCount: evaluatedValues.correctCount
    })

    expect(validateSimulationSubmission(session, evaluated)).toEqual(evaluated)
    await expect(validateSimulationSubmissionIntegrity(session, evaluated)).resolves.toEqual(
      evaluated
    )
    expect(evaluated.results?.[0]?.postcommitBase64).toBe(encodeCanonicalBase64(bomBytes))
  })

  it("rejects same-length schema-valid hazard byte and payload mutations", async () => {
    const initial = assembleSimulation({
      bootstrap: hazardBootstrap(),
      sessionId: "sim-hashbytes",
      profileId: "profile-1",
      format: "nonvisual-hazards",
      length: 1,
      seed: "hazard-byte-binding",
      selectedCategories: [releasedScene.environment],
      timing: simulationSettings.timing,
      now: 100
    })
    const item = initial.items[0]
    if (item === undefined || "question" in item) {
      throw new Error("Expected a nonvisual hazard artifact fixture")
    }
    const originalArtifact = postcommitArtifact(releasedSceneAnswer)
    const session = bindPostcommitReceipts(initial, [originalArtifact])
    const submitted = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers: [{
        questionId: item.scene.id,
        selectedOptionId: null,
        markers: [],
        selectedZoneOrders: [],
        zeroHazardsConfirmed: true,
        reviewIntent: "unflagged"
      }]
    })
    const exactValues = evaluateSimulation({
      session,
      submission: submitted,
      postcommit: [originalArtifact]
    })
    const exact = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results: exactValues.results,
      correctCount: exactValues.correctCount
    })
    await expect(validateSimulationSubmissionIntegrity(session, exact)).resolves.toEqual(exact)

    const firstClaimCharacter = releasedSceneAnswer.claim[0]
    if (firstClaimCharacter === undefined) throw new Error("Expected a non-empty hazard claim")
    const mutatedClaim =
      `${firstClaimCharacter === "A" ? "B" : "A"}${releasedSceneAnswer.claim.slice(1)}`
    const mutatedPayload = Schema.decodeUnknownSync(PostcommitScene)({
      ...releasedSceneAnswer,
      claim: mutatedClaim,
      fullPostAnswer: {
        ...releasedSceneAnswer.fullPostAnswer,
        claim: mutatedClaim
      }
    })
    const mutatedArtifact = postcommitArtifact(mutatedPayload)
    expect(decodeCanonicalBase64(mutatedArtifact.postcommitBase64)).toHaveLength(
      decodeCanonicalBase64(originalArtifact.postcommitBase64).byteLength
    )
    const mutatedValues = evaluateSimulation({
      session,
      submission: submitted,
      postcommit: [mutatedArtifact]
    })
    const mutated = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results: mutatedValues.results,
      correctCount: mutatedValues.correctCount
    })
    expect(validateSimulationSubmission(session, mutated)).toEqual(mutated)
    await expect(validateSimulationSubmissionIntegrity(session, mutated)).rejects.toThrow(
      /digest does not match its pinned receipt/
    )

    expect(() => validateSimulationSubmission(session, {
      ...exact,
      results: exact.results?.map((result) => result.kind === "hazard"
        ? { ...result, postcommit: mutatedPayload }
        : result)
    })).toThrow(/payload does not match its retained bytes/)
  })

  it("rejects swapped postcommit receipts and retained artifacts", async () => {
    const initial = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-swapbytes",
      length: 2,
      seed: "swapped-receipts",
      ...simulationSettings,
      now: 100
    })
    const items = questionItems(initial)
    const artifacts = items.map((item) => postcommitArtifact(questionPostcommit(item)))
    const session = bindPostcommitReceipts(initial, artifacts)
    const submitted = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers: items.map((item) => ({
        questionId: item.question.id,
        selectedOptionId: null,
        reviewIntent: "unflagged" as const
      }))
    })
    const evaluatedValues = evaluateSimulation({ session, submission: submitted, postcommit: artifacts })
    const evaluated = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results: evaluatedValues.results,
      correctCount: evaluatedValues.correctCount
    })
    await expect(validateSimulationSubmissionIntegrity(session, evaluated)).resolves.toEqual(evaluated)

    const firstItem = session.items[0]
    const secondItem = session.items[1]
    if (firstItem === undefined || secondItem === undefined) {
      throw new Error("Expected two pinned receipt fixtures")
    }
    const swappedReceiptSession = validateSimulationSession({
      ...session,
      items: session.items.map((item, index) => ({
        ...item,
        receipt: {
          ...item.receipt,
          postcommitBytes: index === 0
            ? secondItem.receipt.postcommitBytes
            : firstItem.receipt.postcommitBytes,
          postcommitSha256: index === 0
            ? secondItem.receipt.postcommitSha256
            : firstItem.receipt.postcommitSha256
        }
      }))
    })
    await expect(
      validateSimulationSubmissionIntegrity(swappedReceiptSession, evaluated)
    ).rejects.toThrow(/bytes|digest/)

    const resultValues = evaluated.results
    if (resultValues === undefined) throw new Error("Expected retained result artifacts")
    expect(() => validateSimulationSubmission(session, {
      ...evaluated,
      results: resultValues.map((result, index) => ({
        ...result,
        postcommitBase64: resultValues[index === 0 ? 1 : 0]?.postcommitBase64 ?? ""
      }))
    })).toThrow(/payload does not match its retained bytes/)
  })

  it("binds submitted answers and evaluated results to the exact ordered session closure", () => {
    const session = assembleSimulation({
      bootstrap: bootstrap(),
      sessionId: "sim-bound1234",
      length: 2,
      seed: "bound-submission",
      ...simulationSettings,
      now: 100
    })
    const items = questionItems(session)
    const answers = items.map((item, index) => ({
      questionId: item.question.id,
      selectedOptionId: index === 0 ? item.optionOrder[0] ?? null : null,
      reviewIntent: index === 0 ? "flagged" as const : "unflagged" as const
    }))
    const submitted = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      schemaVersion: 1,
      id: `${session.id}:final`,
      sessionId: session.id,
      status: "submitted",
      submittedAt: 200,
      answers
    })

    expect(validateSimulationSubmission(session, submitted)).toEqual(submitted)
    expect(() => validateSimulationSubmission(session, {
      ...submitted,
      id: "sim-different12:final"
    })).toThrow(/identity is outside/)
    expect(() => validateSimulationSubmission(session, {
      ...submitted,
      answers: [...submitted.answers].reverse()
    })).toThrow(/question closure|ordered session closure/)
    expect(() => validateSimulationSubmission(session, {
      ...submitted,
      answers: submitted.answers.map((answer, index) => index === 0
        ? { ...answer, selectedOptionId: "not-a-pinned-option" }
        : answer)
    })).toThrow(/question closure|ordered session closure/)

    const results = items.map((item, index) => {
      const correctOptionId = index === 0
        ? answers[index]?.selectedOptionId ?? item.optionOrder[0]
        : item.optionOrder[0]
      const postcommit = Schema.decodeUnknownSync(PostcommitQuestion)({
        schemaVersion: 1,
        id: item.question.id,
        correctOptionId,
        rationales: item.question.options.map((option) => ({
          optionId: option.id,
          message: `Reviewed rationale for ${option.id}`
        })),
        sources: [{ id: "source", label: "Source", locator: "source#1" }]
      })
      return {
        kind: "question" as const,
        questionId: item.question.id,
        selectedOptionId: answers[index]?.selectedOptionId ?? null,
        correctOptionId,
        correct: index === 0,
        category: item.category,
        postcommitBase64: postcommitArtifact(postcommit).postcommitBase64,
        postcommit
      }
    })
    const boundSession = validateSimulationSession({
      ...session,
      items: session.items.map((item, index) => {
        const result = results[index]
        if (result === undefined) throw new Error("Expected an evaluated result fixture")
        const bytes = postcommitBytes(result.postcommit)
        return {
          ...item,
          receipt: {
            ...item.receipt,
            postcommitBytes: bytes.byteLength,
            postcommitSha256: sha256(bytes)
          }
        }
      })
    })
    const evaluated = Schema.decodeUnknownSync(SimulationSubmissionRecord)({
      ...submitted,
      status: "evaluated",
      evaluatedAt: 300,
      results,
      correctCount: 1
    })
    expect(validateSimulationSubmission(boundSession, evaluated)).toEqual(evaluated)
    expect(() => validateSimulationSubmission(boundSession, {
      ...evaluated,
      results: [...(evaluated.results ?? [])].reverse()
    })).toThrow(/submitted answer closure/)
    expect(() => validateSimulationSubmission(boundSession, {
      ...evaluated,
      results: evaluated.results?.map((result, index) => index === 0
        ? { ...result, selectedOptionId: null }
        : result)
    })).toThrow(/submitted answer closure/)
    expect(() => validateSimulationSubmission(boundSession, {
      ...evaluated,
      correctCount: 0
    })).toThrow(/score does not match/)
  })
})

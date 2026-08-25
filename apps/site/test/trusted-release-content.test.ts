import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import { decodeSettingsBootstrap } from "../src/settings/model.ts"
import {
  TrustedReleaseContentError,
  canonicalTrustedReleaseContentRegistryJson,
  decodeTrustedReleaseContentRegistry,
  findTrustedReleaseContentEntry,
  trustedReleaseContentKey,
  verifyTrustedHazardContent,
  verifyTrustedQuestionContent
} from "../src/trusted-release-content.ts"

const questionPostcommitReceipt = {
  postcommitPath: "/content/vertical-slice/questions/question-1.postcommit.json",
  postcommitBytes: 101,
  postcommitSha256: "a".repeat(64)
} as const

const scenePostcommitReceipt = {
  postcommitPath: "/content/vertical-slice/scenes/scene-1.postcommit.json",
  postcommitBytes: 202,
  postcommitSha256: "b".repeat(64)
} as const

const visualAssetReceipt = {
  path: "/content/assets/derivatives/scenes/scene-1-web.png",
  bytes: 303,
  sha256: "c".repeat(64)
} as const

const rawEntries = () => [
  {
    releaseId: "release-1",
    packVersion: 1,
    variant: "question",
    itemId: "question-1",
    postcommitReceipt: questionPostcommitReceipt,
    optionIds: ["option-a", "option-b", "option-c"]
  },
  {
    releaseId: "release-1",
    packVersion: 1,
    variant: "hazard-visual",
    itemId: "scene-1",
    mode: "visual",
    postcommitReceipt: scenePostcommitReceipt,
    allowedZoneOrders: [1, 2, 3],
    assetRevision: 2,
    assetMasterSha256: "d".repeat(64),
    visualAssetReceipt
  },
  {
    releaseId: "release-1",
    packVersion: 1,
    variant: "hazard-nonvisual",
    itemId: "scene-1",
    mode: "nonvisual",
    postcommitReceipt: scenePostcommitReceipt,
    allowedZoneOrders: [1, 2, 3],
    assetRevision: 2,
    assetMasterSha256: "d".repeat(64),
    visualAssetReceipt: null
  }
]

const rawRegistry = () => ({
  schemaVersion: 1,
  scope: "trusted-release-content-registry",
  entries: rawEntries()
})

const registry = () => decodeTrustedReleaseContentRegistry(rawRegistry())

const questionReceipt = () => ({
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "session-1",
  position: 4,
  ...questionPostcommitReceipt,
  questionId: "question-1"
})

const hazardReceipt = (mode: "visual" | "nonvisual") => ({
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "session-1",
  position: 5,
  ...scenePostcommitReceipt,
  sceneId: "scene-1",
  mode,
  assetRevision: 2,
  assetMasterSha256: "d".repeat(64)
})

const rawReviewQueue = () => ({
  schemaVersion: 1,
  questions: [{
    id: "question-1",
    optionIds: ["option-a", "option-b", "option-c"],
    receipt: questionReceipt(),
    itemUrl: "/review/session/release-1/item/1/"
  }],
  scenes: [{
    scene: {
      id: "scene-1",
      environment: "hallway",
      asset: {
        opaqueAssetId: "scene-1",
        revision: 2,
        masterSha256: "d".repeat(64),
        derivatives: [{
          kind: "web",
          path: "content/assets/derivatives/scenes/scene-1-web.png",
          bytes: 303,
          sha256: "c".repeat(64)
        }]
      },
      neutralPreAnswer: {
        overview: "A hallway with three observable areas.",
        zones: [
          { order: 1, label: "floor", description: "The walking surface." },
          { order: 2, label: "wall", description: "The left wall." },
          { order: 3, label: "door", description: "A closed doorway." }
        ],
        policy: "Neutral before commitment."
      }
    },
    visualReceipt: hazardReceipt("visual"),
    nonvisualReceipt: hazardReceipt("nonvisual"),
    visualItemUrl: "/hazards/session/release-1/scene/1/",
    nonvisualItemUrl: "/hazards/session/release-1-nonvisual/scene/1/"
  }]
})

describe("trusted release-content registry", () => {
  it("strictly decodes an answer-free registry and keys every variant", () => {
    const decoded = registry()

    expect(trustedReleaseContentKey(decoded.entries[0])).toBe(
      "release-1:v1:question:question-1"
    )
    expect(findTrustedReleaseContentEntry(decoded, {
      releaseId: "release-1",
      packVersion: 1,
      variant: "hazard-visual",
      itemId: "scene-1"
    })?.variant).toBe("hazard-visual")

    const serialized = canonicalTrustedReleaseContentRegistryJson(decoded)
    for (const answerBearingKey of [
      "correctOptionId",
      "rationales",
      "targets",
      "decoys",
      "fullPostAnswer",
      "nonvisualZonedEquivalent"
    ]) {
      expect(serialized).not.toContain(answerBearingKey)
    }

    const reversed = decodeTrustedReleaseContentRegistry({
      ...rawRegistry(),
      entries: rawEntries().reverse()
    })
    expect(canonicalTrustedReleaseContentRegistryJson(reversed)).toBe(serialized)
  })

  it("rejects answer-bearing or otherwise excess fields at every nested boundary", () => {
    const withAnswer = rawRegistry()
    withAnswer.entries[0] = {
      ...withAnswer.entries[0],
      correctOptionId: "option-a"
    } as never
    expect(() => decodeTrustedReleaseContentRegistry(withAnswer)).toThrow()

    const withNestedAnswer = rawRegistry()
    withNestedAnswer.entries[0] = {
      ...withNestedAnswer.entries[0],
      postcommitReceipt: {
        ...questionPostcommitReceipt,
        rationales: [{ optionId: "option-a", text: "answer" }]
      }
    } as never
    expect(() => decodeTrustedReleaseContentRegistry(withNestedAnswer)).toThrow()
  })

  it("requires unique canonical keys and a closed, identical hazard-mode pair", () => {
    expect(() => decodeTrustedReleaseContentRegistry({
      ...rawRegistry(),
      entries: [...rawEntries(), rawEntries()[0]]
    })).toThrow(/duplicate key/)

    expect(() => decodeTrustedReleaseContentRegistry({
      ...rawRegistry(),
      entries: rawEntries().slice(0, 2)
    })).toThrow(/incomplete mode pair/)

    const divergentPair = rawEntries()
    divergentPair[2] = {
      ...divergentPair[2],
      allowedZoneOrders: [1, 3, 2]
    } as never
    expect(() => decodeTrustedReleaseContentRegistry({
      ...rawRegistry(),
      entries: divergentPair
    })).toThrow(/divergent mode pair/)

    const aliasedPath = rawEntries()
    aliasedPath[0] = {
      ...aliasedPath[0],
      postcommitReceipt: {
        ...questionPostcommitReceipt,
        postcommitPath: "/content/vertical-slice/questions/other.postcommit.json"
      }
    } as never
    expect(() => decodeTrustedReleaseContentRegistry({
      ...rawRegistry(),
      entries: aliasedPath
    })).toThrow(/non-canonical path/)
  })

  it("binds question coordinates, exact receipt bytes, and ordered option closure", () => {
    const decoded = registry()
    expect(verifyTrustedQuestionContent(decoded, {
      receipt: questionReceipt(),
      optionIds: ["option-a", "option-b", "option-c"]
    }).itemId).toBe("question-1")

    const receiptMutations = [
      { ...questionReceipt(), releaseId: "release-2" },
      { ...questionReceipt(), packVersion: 2 },
      { ...questionReceipt(), questionId: "question-2" },
      {
        ...questionReceipt(),
        postcommitPath: "/content/vertical-slice/questions/other.postcommit.json"
      },
      { ...questionReceipt(), postcommitBytes: 102 },
      { ...questionReceipt(), postcommitSha256: "e".repeat(64) }
    ]
    for (const receipt of receiptMutations) {
      expect(() => verifyTrustedQuestionContent(decoded, {
        receipt,
        optionIds: ["option-a", "option-b", "option-c"]
      })).toThrow(TrustedReleaseContentError)
    }
    for (const optionIds of [
      ["option-a", "option-c", "option-b"],
      ["option-a", "option-b"],
      ["option-a", "option-b", "option-c", "option-d"]
    ]) {
      expect(() => verifyTrustedQuestionContent(decoded, {
        receipt: questionReceipt(),
        optionIds
      })).toThrow(TrustedReleaseContentError)
    }
    expect(() => verifyTrustedQuestionContent(decoded, {
      receipt: questionReceipt(),
      optionIds: ["option-a", "option-a"]
    })).toThrow()
  })

  it("binds hazard mode, receipt, zone closure, asset master, and visual derivative", () => {
    const decoded = registry()
    expect(verifyTrustedHazardContent(decoded, {
      receipt: hazardReceipt("visual"),
      allowedZoneOrders: [1, 2, 3]
    }).variant).toBe("hazard-visual")
    expect(verifyTrustedHazardContent(decoded, {
      receipt: hazardReceipt("visual"),
      allowedZoneOrders: [1, 2, 3],
      visualAssetReceipt
    }).variant).toBe("hazard-visual")
    expect(verifyTrustedHazardContent(decoded, {
      receipt: hazardReceipt("nonvisual"),
      allowedZoneOrders: [1, 2, 3],
      visualAssetReceipt: null
    }).variant).toBe("hazard-nonvisual")

    const receiptMutations = [
      { ...hazardReceipt("visual"), releaseId: "release-2" },
      { ...hazardReceipt("visual"), packVersion: 2 },
      { ...hazardReceipt("visual"), sceneId: "scene-2" },
      {
        ...hazardReceipt("visual"),
        postcommitPath: "/content/vertical-slice/scenes/other.postcommit.json"
      },
      { ...hazardReceipt("visual"), postcommitBytes: 203 },
      { ...hazardReceipt("visual"), postcommitSha256: "e".repeat(64) },
      { ...hazardReceipt("visual"), assetRevision: 3 },
      { ...hazardReceipt("visual"), assetMasterSha256: "e".repeat(64) }
    ]
    for (const receipt of receiptMutations) {
      expect(() => verifyTrustedHazardContent(decoded, {
        receipt,
        allowedZoneOrders: [1, 2, 3]
      })).toThrow(TrustedReleaseContentError)
    }
    expect(() => verifyTrustedHazardContent(decoded, {
      receipt: hazardReceipt("visual"),
      allowedZoneOrders: [1, 3, 2]
    })).toThrow(TrustedReleaseContentError)

    for (const receipt of [
      { ...visualAssetReceipt, path: "/content/assets/derivatives/scenes/other-web.png" },
      { ...visualAssetReceipt, bytes: 304 },
      { ...visualAssetReceipt, sha256: "e".repeat(64) }
    ]) {
      expect(() => verifyTrustedHazardContent(decoded, {
        receipt: hazardReceipt("visual"),
        allowedZoneOrders: [1, 2, 3],
        visualAssetReceipt: receipt
      })).toThrow(TrustedReleaseContentError)
    }
    expect(() => verifyTrustedHazardContent(decoded, {
      receipt: hazardReceipt("nonvisual"),
      allowedZoneOrders: [1, 2, 3],
      visualAssetReceipt
    })).toThrow(TrustedReleaseContentError)
  })

  it("requires settings ID projections to close exactly over the embedded registry", () => {
    const value = {
      schemaVersion: 1,
      questionIds: ["question-1"],
      sceneIds: ["scene-1"],
      trustedReleaseContentRegistry: rawRegistry(),
      reviewQueue: rawReviewQueue()
    }
    expect(decodeSettingsBootstrap(value).trustedReleaseContentRegistry.entries).toHaveLength(3)
    expect(() => decodeSettingsBootstrap({
      ...value,
      questionIds: ["question-1", "question-2"]
    })).toThrow(/do not close/)
    expect(() => decodeSettingsBootstrap({
      ...value,
      sceneIds: ["scene-1", "scene-1"]
    })).toThrow(/do not close/)
    expect(() => decodeSettingsBootstrap({
      ...value,
      reviewQueue: {
        ...rawReviewQueue(),
        questions: [{
          ...rawReviewQueue().questions[0],
          receipt: {
            ...questionReceipt(),
            postcommitSha256: "e".repeat(64)
          }
        }]
      }
    })).toThrow(TrustedReleaseContentError)
  })

  it("publishes the generated launch registry without answer-bearing fields", async () => {
    const html = await readFile(new URL("../settings/index.html", import.meta.url), "utf8")
    const match = html.match(
      /<script id="settings-bootstrap-data" type="application\/json">([^<]+)<\/script>/
    )
    expect(match?.[1]).toBeDefined()
    const embedded = match?.[1]
    if (embedded === undefined) throw new Error("Generated settings bootstrap is missing")
    const decoded = decodeSettingsBootstrap(JSON.parse(embedded))

    expect(decoded.questionIds).toEqual(
      Array.from({ length: 90 }, (_, index) => `q${String(index + 1).padStart(3, "0")}`)
    )
    expect(decoded.sceneIds).toEqual(
      Array.from({ length: 18 }, (_, index) => `s${String(index + 1).padStart(3, "0")}`)
    )
    expect(decoded.trustedReleaseContentRegistry.entries).toHaveLength(126)
    for (const answerBearingKey of [
      "correctOptionId",
      "rationales",
      "targets",
      "decoys",
      "fullPostAnswer",
      "nonvisualZonedEquivalent"
    ]) {
      expect(embedded).not.toContain(answerBearingKey)
    }
  })
})

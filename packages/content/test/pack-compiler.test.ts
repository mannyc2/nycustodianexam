import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  compileContentPack,
  createReleaseManifest,
  renderReleaseArtifacts,
  stableJson,
  validateReleaseManifest,
  validateQuestionOptionConceptClosure,
  verifyLegacyQuestionCompatibilityFixture,
  type CompileContentPackInput,
  type CompiledContentPack
} from "../src/compiler.ts"

const repositoryRoot = new URL("../../../", import.meta.url)
const textEncoder = new TextEncoder()

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(fileURLToPath(new URL(path, repositoryRoot)), "utf8")) as unknown

const loadInput = async (): Promise<CompileContentPackInput> => ({
  authoredPack: await readJson("content/authoring/packs/launch-v1.json"),
  acceptedTools: await readJson("content/authoring/visuals/releases/tools.json"),
  acceptedScenes: await readJson("content/authoring/visuals/releases/scenes.json"),
  acceptedSceneRegions: await readJson("content/authoring/visuals/releases/regions.json"),
  acceptedSceneAccessibility: await readJson(
    "content/authoring/visuals/releases/accessibility.json"
  )
})

const sha256 = (text: string): string =>
  createHash("sha256").update(text).digest("hex")

const digestUtf8 = (text: string) => Effect.succeed({
  sha256: sha256(text),
  bytes: textEncoder.encode(text).byteLength
})

const keysIn = (value: unknown, keys = new Set<string>()): ReadonlySet<string> => {
  if (Array.isArray(value)) {
    for (const item of value) keysIn(item, keys)
  } else if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      keys.add(key)
      keysIn(item, keys)
    }
  }
  return keys
}

describe("compileContentPack", () => {
  let input: CompileContentPackInput
  let compiled: CompiledContentPack

  beforeAll(async () => {
    input = await loadInput()
    compiled = await Effect.runPromise(compileContentPack(input))
  })

  it("compiles the reviewed M1 tranche and every accepted hazard scene", () => {
    expect(compiled.catalog.tools).toHaveLength(4)
    expect(compiled.catalog.profiles).toHaveLength(1)
    expect(compiled.questions).toHaveLength(2)
    expect(compiled.scenes).toHaveLength(18)
    expect(compiled.scenes.map((scene) => scene.opaqueAssetId)).toEqual(
      Array.from({ length: 18 }, (_, index) => `s${String(index + 1).padStart(3, "0")}`)
    )
    expect(compiled.postcommit.scenes.filter((scene) => scene.kind === "positive")).toHaveLength(16)
    expect(compiled.postcommit.scenes.filter((scene) => scene.kind === "zero-hazard")).toHaveLength(2)
    expect(compiled.assets).toHaveLength(66)
  })

  it("keeps answer-bearing fields and semantic scene identities out of every precommit item", () => {
    const precommitArtifacts = renderReleaseArtifacts(compiled).filter(
      (artifact) => artifact.kind === "question-precommit" || artifact.kind === "scene-precommit"
    )
    const forbiddenKeys = [
      "conceptId",
      "optionConceptIds",
      "correctOptionId",
      "rationales",
      "sourceIds",
      "targets",
      "decoys",
      "targetRegions",
      "decoyRegions",
      "fullPostAnswer",
      "nonvisualZonedEquivalent",
      "hazardFamily",
      "claim",
      "reviewOverlay"
    ]

    expect(precommitArtifacts).toHaveLength(20)
    for (const artifact of precommitArtifacts) {
      const parsed = JSON.parse(artifact.text) as unknown
      const keys = keysIn(parsed)
      for (const key of forbiddenKeys) expect(keys.has(key)).toBe(false)
      if (artifact.kind === "scene-precommit") {
        expect(artifact.text).not.toContain("scene.")
      }
    }
  })

  it("renders one-scene and one-question runtime boundaries with no unrelated answers", () => {
    const artifacts = renderReleaseArtifacts(compiled)
    const sceneArtifacts = artifacts.filter((artifact) => artifact.itemId === "s001")
    const scenePostcommit = sceneArtifacts.find((artifact) => artifact.kind === "scene-postcommit")
    const questionArtifacts = artifacts.filter((artifact) => artifact.itemId === "tool-selection-002")
    const questionPostcommit = questionArtifacts.find(
      (artifact) => artifact.kind === "question-postcommit"
    )

    expect(sceneArtifacts.map((artifact) => artifact.path)).toEqual([
      "scenes/s001.precommit.json",
      "scenes/s001.postcommit.json"
    ])
    expect(scenePostcommit).toBeDefined()
    const scene = JSON.parse(scenePostcommit?.text ?? "null") as { id?: string; opaqueAssetId?: string }
    expect(scene).toMatchObject({ id: "scene.slip.hallway-wet-floor", opaqueAssetId: "s001" })
    expect(scenePostcommit?.text).not.toContain("scene.slip.lobby-raised-mat")
    expect(scenePostcommit?.text).not.toContain("questions")

    expect(questionArtifacts.map((artifact) => artifact.path)).toEqual([
      "questions/tool-selection-002.precommit.json",
      "questions/tool-selection-002.postcommit.json"
    ])
    expect(questionPostcommit?.text).toContain('"id": "tool-selection-002"')
    expect(questionPostcommit?.text).not.toContain("tool-selection-001")
    expect(questionPostcommit?.text).not.toContain("scenes")
  })

  it("publishes a complete option-to-concept mapping only in each question postcommit", () => {
    for (const question of compiled.questions) {
      const mappings = question.postcommit.optionConceptIds
      expect(mappings).toBeDefined()
      if (mappings === undefined) continue
      expect(mappings.map((mapping) => mapping.optionId)).toEqual(
        question.precommit.options.map((option) => option.id)
      )
      expect(new Set(mappings.map((mapping) => mapping.optionId)).size).toBe(
        question.precommit.options.length
      )
      expect(new Set(mappings.map((mapping) => mapping.conceptId)).size).toBe(
        question.precommit.options.length
      )

      const precommitText = stableJson(question.precommit)
      const postcommitText = stableJson(question.postcommit)
      expect(precommitText).not.toContain("optionConceptIds")
      expect(precommitText).not.toContain("conceptId")
      expect(postcommitText).toContain('"optionConceptIds"')
    }
  })

  it("rejects incomplete, dangling, and duplicate option-to-concept mappings", async () => {
    const optionIds = ["a", "b"]
    const validMappings = [
      { optionId: "a", conceptId: "tool.a" },
      { optionId: "b", conceptId: "tool.b" }
    ]

    await expect(
      Effect.runPromise(
        validateQuestionOptionConceptClosure("question-1", optionIds, validMappings.slice(0, 1))
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("cover every option exactly once")
    })

    await expect(
      Effect.runPromise(
        validateQuestionOptionConceptClosure("question-1", optionIds, [
          validMappings[0],
          { optionId: "missing", conceptId: "tool.b" }
        ])
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure"
    })

    await expect(
      Effect.runPromise(
        validateQuestionOptionConceptClosure("question-1", optionIds, [
          validMappings[0],
          { optionId: "a", conceptId: "tool.b" }
        ])
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "schema"
    })

    await expect(
      Effect.runPromise(
        validateQuestionOptionConceptClosure("question-1", optionIds, [
          validMappings[0],
          { optionId: "b", conceptId: "tool.a" }
        ])
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "schema"
    })

    await expect(
      Effect.runPromise(
        validateQuestionOptionConceptClosure("question-1", ["a", "a"], validMappings)
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("options must be unique")
    })
  })

  it("treats the old vertical slice as a checked, non-authoritative compatibility fixture", async () => {
    const fixture = await readJson("content/authoring/questions/vertical-slice.json")
    await expect(
      Effect.runPromise(
        verifyLegacyQuestionCompatibilityFixture(compiled.compatibilityQuestion, fixture)
      )
    ).resolves.toBeUndefined()

    const drifted = { ...(fixture as Record<string, unknown>), prompt: "Drifted prompt" }
    await expect(
      Effect.runPromise(
        verifyLegacyQuestionCompatibilityFixture(compiled.compatibilityQuestion, drifted)
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("non-authoritative")
    })
  })

  it("hash-binds the exact per-item artifact closure and byte-identical legacy aliases", async () => {
    const manifest = await Effect.runPromise(
      createReleaseManifest(compiled, digestUtf8)
    )
    const firstQuestionPrecommit = manifest.artifacts.find(
      (artifact) =>
        artifact.kind === "question-precommit" && artifact.itemId === "tool-selection-001"
    )
    const legacyPrecommit = manifest.artifacts.find(
      (artifact) => artifact.kind === "legacy-question-precommit"
    )

    expect(manifest.artifacts).toHaveLength(45)
    expect(
      manifest.artifacts.filter(
        (artifact) => artifact.itemId === "s001" && artifact.kind.startsWith("scene-")
      )
    ).toMatchObject([
      { path: "scenes/s001.precommit.json" },
      { path: "scenes/s001.postcommit.json" }
    ])
    expect(legacyPrecommit).toMatchObject({
      sha256: firstQuestionPrecommit?.sha256,
      bytes: firstQuestionPrecommit?.bytes
    })
  })

  it("rejects an incomplete item manifest and a non-identical legacy alias", async () => {
    const manifest = await Effect.runPromise(createReleaseManifest(compiled, digestUtf8))
    await expect(
      Effect.runPromise(
        validateReleaseManifest(
          compiled,
          {
            ...manifest,
            artifacts: manifest.artifacts.filter(
              (artifact) => artifact.path !== "scenes/s001.postcommit.json"
            )
          },
          digestUtf8
        )
      )
    ).rejects.toMatchObject({ _tag: "ContentValidationError", stage: "closure" })

    const changedAlias = manifest.artifacts.map((artifact) =>
      artifact.kind === "legacy-question-precommit"
        ? { ...artifact, sha256: "0".repeat(64) }
        : artifact
    )
    await expect(
      Effect.runPromise(
        validateReleaseManifest(compiled, { ...manifest, artifacts: changedAlias }, digestUtf8)
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("deterministic release bytes")
    })
  })

  it("rejects dangling rationale, master-region, zone-label, and nonvisual target relations", async () => {
    const missingRationale = structuredClone(input.authoredPack) as {
      questions: Array<{ rationales: Array<unknown> }>
    }
    missingRationale.questions[0]?.rationales.pop()
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: missingRationale }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("exactly one rationale")
    })

    const wrongMaster = structuredClone(input.acceptedSceneRegions) as Array<{
      masterSha256: string
    }>
    if (wrongMaster[0] !== undefined) wrongMaster[0].masterSha256 = "0".repeat(64)
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedSceneRegions: wrongMaster }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("another master hash")
    })

    const wrongZoneLabel = structuredClone(input.acceptedSceneRegions) as Array<{
      zoneOrder: Array<{ order: number; label: string }>
    }>
    const firstZone = wrongZoneLabel[0]?.zoneOrder[0]
    if (firstZone !== undefined) firstZone.label = "same order, different label"
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedSceneRegions: wrongZoneLabel }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("zone labels and orders")
    })

    const duplicateNeutralLabelAccessibility = structuredClone(
      input.acceptedSceneAccessibility
    ) as Array<{ neutralPreAnswer: { zones: Array<{ order: number; label: string }> } }>
    const duplicateNeutralLabelRegions = structuredClone(
      input.acceptedSceneRegions
    ) as Array<{ zoneOrder: Array<{ order: number; label: string }> }>
    const firstLabel = duplicateNeutralLabelAccessibility[0]?.neutralPreAnswer.zones[0]?.label
    if (
      firstLabel !== undefined &&
      duplicateNeutralLabelAccessibility[0]?.neutralPreAnswer.zones[1] !== undefined &&
      duplicateNeutralLabelRegions[0]?.zoneOrder[1] !== undefined
    ) {
      duplicateNeutralLabelAccessibility[0].neutralPreAnswer.zones[1].label = firstLabel
      duplicateNeutralLabelRegions[0].zoneOrder[1].label = firstLabel
    }
    await expect(Effect.runPromise(compileContentPack({
      ...input,
      acceptedSceneAccessibility: duplicateNeutralLabelAccessibility,
      acceptedSceneRegions: duplicateNeutralLabelRegions
    }))).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("zone labels and orders")
    })

    const unknownStatementZone = structuredClone(input.acceptedSceneAccessibility) as Array<{
      nonvisualZonedEquivalent: Array<{ zone: string }>
    }>
    if (unknownStatementZone[0]?.nonvisualZonedEquivalent[0] !== undefined) {
      unknownStatementZone[0].nonvisualZonedEquivalent[0].zone = "unknown released zone"
    }
    await expect(Effect.runPromise(compileContentPack({
      ...input,
      acceptedSceneAccessibility: unknownStatementZone
    }))).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("unknown neutral zone")
    })

    const missingNonvisualTarget = structuredClone(input.acceptedSceneAccessibility) as Array<{
      nonvisualZonedEquivalent: Array<{ role: string }>
    }>
    const firstAccessibility = missingNonvisualTarget[0]
    if (firstAccessibility !== undefined) {
      firstAccessibility.nonvisualZonedEquivalent =
        firstAccessibility.nonvisualZonedEquivalent.filter((statement) => statement.role !== "target")
    }
    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedSceneAccessibility: missingNonvisualTarget })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("nonvisual equivalent")
    })

    const contradictoryNonvisual = structuredClone(
      input.acceptedSceneAccessibility
    ) as Array<{
      nonvisualZonedEquivalent: Array<{ role: string; statement: string }>
    }>
    const targetStatement = contradictoryNonvisual[0]?.nonvisualZonedEquivalent.find(
      (statement) => statement.role === "target"
    )
    if (targetStatement !== undefined) targetStatement.statement = "contradictory safe text"
    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedSceneAccessibility: contradictoryNonvisual })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("exactly cover semantic inventories")
    })
  })
})

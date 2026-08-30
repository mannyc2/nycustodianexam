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

const readText = async (path: string): Promise<string> =>
  readFile(fileURLToPath(new URL(path, repositoryRoot)), "utf8")

const loadInput = async (): Promise<CompileContentPackInput> => ({
  authoredPack: await readJson("content/authoring/packs/launch-v1.json"),
  acceptedTools: await readJson("content/authoring/visuals/releases/tools.json"),
  acceptedComparisons: await readJson(
    "content/authoring/visuals/releases/comparisons.json"
  ),
  acceptedScenes: await readJson("content/authoring/visuals/releases/scenes.json")
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

type MutableReviewPack = {
  questions: Array<{ id: string; claimIds: string[] }>
  claims: Array<{
    id: string
    text: string
    caveat: null | string
    sourceLineIds: string[]
  }>
  sourceLines: Array<{
    id: string
    sourceId: string
    locator: string
    excerpt: string
    verifiedOn: string
  }>
  sources: Array<{
    id: string
    version: string
    url?: string
  }>
}

type ReviewEvidence = {
  claim: MutableReviewPack["claims"][number]
  line: MutableReviewPack["sourceLines"][number]
  source: MutableReviewPack["sources"][number]
}

const reviewEvidenceFor = (
  pack: MutableReviewPack,
  questionId: string
): ReviewEvidence => {
  const question = pack.questions.find((candidate) => candidate.id === questionId)
  const claim = pack.claims.find((candidate) => candidate.id === question?.claimIds[0])
  const line = pack.sourceLines.find((candidate) => candidate.id === claim?.sourceLineIds[0])
  const source = pack.sources.find((candidate) => candidate.id === line?.sourceId)
  if (question === undefined || claim === undefined || line === undefined || source === undefined) {
    throw new Error(`Review evidence fixture is incomplete for ${questionId}`)
  }
  return { claim, line, source }
}

describe("compileContentPack", () => {
  let input: CompileContentPackInput
  let compiled: CompiledContentPack

  beforeAll(async () => {
    input = await loadInput()
    compiled = await Effect.runPromise(compileContentPack(input))
  })

  it("keeps substantive Nassau prose in the curated authoring boundary", async () => {
    const [builder, curated] = await Promise.all([
      readText("content/authoring/packs/build-launch-v1.mjs"),
      readText("content/authoring/packs/launch-v1.curated.mjs")
    ])
    expect(builder).not.toContain("const nassauEvidence =")
    expect(builder).not.toContain("announcementFactSheet: {")
    expect(builder).not.toContain("claim.nassau.")
    expect(curated).toContain("export const nassauSources")
    expect(curated).toContain("export const nassauEvidence")
    expect(curated).toContain("export const launchProfiles")
  })

  it("retains every local Nassau source-line excerpt verbatim from its cited document", async () => {
    const [factbase, openItems] = await Promise.all([
      readText("docs/FACTBASE.md"),
      readText("docs/OPEN.md")
    ])
    const normalizeWhitespace = (value: string): string =>
      value.replace(/\s+/g, " ").trim()
    const documents = new Map([
      ["nassau.factbase", normalizeWhitespace(factbase)],
      ["nassau.open-items", normalizeWhitespace(openItems)]
    ])
    const expected = [
      {
        id: "line.nassau.admin-status-unknown",
        sourceId: "nassau.factbase",
        locator: "docs/FACTBASE.md — introductory current-status note",
        excerpt: "The announcements for exams 60112026 / 61012026 list 2026-08-22 as the exam date. That date has passed, but no official post-administration notice or result/list record was located in the 2026-08-25 read-only refresh, so actual administration status remains unconfirmed."
      },
      {
        id: "line.nassau.preparer-unknown",
        sourceId: "nassau.open-items",
        locator: "docs/OPEN.md — C1 preparer identity",
        excerpt: "This makes DCS preparation probable, but the announcement language itself does not expressly identify the preparer."
      },
      {
        id: "line.nassau.scoring-unknown",
        sourceId: "nassau.open-items",
        locator: "docs/OPEN.md — C2 item count/weighting/conversion",
        excerpt: "No controlling source located for item count, equal weighting, conversion formula, or unscored items."
      },
      {
        id: "line.nassau.section-minima-unknown",
        sourceId: "nassau.open-items",
        locator: "docs/OPEN.md — C8 section/subdivision passing minima",
        excerpt: "Rule allows such action with notice; no Custodian-specific exercise has been established."
      },
      {
        id: "line.nassau.review-form-unknown",
        sourceId: "nassau.open-items",
        locator: "docs/OPEN.md — C7 current Custodian review mechanics",
        excerpt: "Exact current logistics have not been published/recovered."
      },
      {
        id: "line.nassau.form-identity-unknown",
        sourceId: "nassau.open-items",
        locator: "docs/OPEN.md — C4 shared OC/promotion form identity",
        excerpt: "When Nassau administers OC and promotion Custodian exams on the same date with the same subject plan, do candidates receive the same booklet/form?"
      }
    ] as const
    const authoredPack = input.authoredPack as {
      sourceLines: Array<{
        id: string
        sourceId: string
        locator: string
        excerpt: string
      }>
    }
    const localLines = authoredPack.sourceLines.filter((line) =>
      documents.has(line.sourceId)
    )

    expect(localLines.map((line) => line.id).sort()).toEqual(
      expected.map((line) => line.id).sort()
    )
    for (const receipt of expected) {
      const line = localLines.find((candidate) => candidate.id === receipt.id)
      expect(line).toEqual(expect.objectContaining(receipt))
      expect(documents.get(receipt.sourceId)).toContain(
        normalizeWhitespace(receipt.excerpt)
      )
    }
  })

  it("compiles the complete English launch atlas, question bank, profiles, and scenes", () => {
    expect(compiled.catalog.tools).toHaveLength(65)
    expect(compiled.catalog.comparisons).toHaveLength(14)
    expect(compiled.catalog.comparisons.filter(
      (comparison) => comparison.scoredUseGate.length > 0
    )).toHaveLength(3)
    expect(compiled.catalog.profiles).toHaveLength(2)
    expect(compiled.catalog.profiles.find(
      (profile) => profile.id === "nassau-county-custodian-entry-level"
    )).toMatchObject({
      sourceIds: [
        "nys.dcs.entry-level-guide",
        "nassau.oc.60112026",
        "nassau.promo.61012026",
        "nassau.factbase",
        "nassau.open-items"
      ],
      examIdentityState: "verified",
      examIdentities: [
        { examNumber: "60112026", competitionType: "open-competitive" },
        { examNumber: "61012026", competitionType: "promotion" }
      ],
      competitionTypeState: "verified",
      competitionTypes: ["open-competitive", "promotion"],
      seriesLevel: "entry-level",
      testPlanCompatibility: {
        status: "compatible",
        compatibilityKey: "nassau-county-custodian-entry-level-v2"
      },
      contentAvailability: { status: "available", lastVerifiedOn: "2026-08-25" },
      announcementFactSheet: { version: 2, lastReviewedOn: "2026-08-25" }
    })
    const nassauFacts = compiled.catalog.profiles.find(
      (profile) => profile.id === "nassau-county-custodian-entry-level"
    )?.announcementFactSheet?.facts ?? []
    expect(new Set(nassauFacts.map((fact) => fact.state))).toEqual(
      new Set(["verified", "not_published", "unverified", "superseded"])
    )
    expect(nassauFacts.find((fact) => fact.id === "promo-jurisdictions-current")).toMatchObject({
      state: "verified",
      effectiveFrom: "2026-06-26",
      effectiveThrough: null,
      value: expect.stringContaining("43 jurisdictions")
    })
    expect(compiled.questions).toHaveLength(90)
    expect(new Set(compiled.questions.map(
      (question) => question.postcommit.objectiveId
    )).size).toBe(90)
    expect(new Set(compiled.questions.map(
      (question) => question.postcommit.equivalenceGroupId
    )).size).toBe(90)
    expect(compiled.questions.every((question) =>
      question.precommit.profileIds?.includes("nassau-county-custodian-entry-level") === true
    )).toBe(true)
    const authoredMembershipAudit = input.authoredPack as {
      tools: Array<{ conceptId: string; domain: string }>
      questions: Array<{
        id: string
        options: Array<{ conceptId: string }>
        tags: { domain: string }
      }>
    }
    const authoredToolByConceptId = new Map(
      authoredMembershipAudit.tools.map((tool) => [tool.conceptId, tool] as const)
    )
    const authoredQuestionById = new Map(
      authoredMembershipAudit.questions.map((question) => [question.id, question] as const)
    )
    for (const question of compiled.questions) {
      const authoredQuestion = authoredQuestionById.get(question.precommit.id)
      if (authoredQuestion === undefined) throw new Error("Compiled question has no authoring input")
      const everyDisplayedOptionSharesDomain = authoredQuestion.options.every((option) =>
        authoredToolByConceptId.get(option.conceptId)?.domain === authoredQuestion.tags.domain
      )
      expect(question.precommit.memberships?.filter(
        (membership) => membership.filterKind === "domain"
      )).toEqual(everyDisplayedOptionSharesDomain
        ? [{ filterKind: "domain", filterValue: authoredQuestion.tags.domain }]
        : [])
    }
    expect(compiled.questions.filter((question) =>
      question.precommit.memberships?.every(
        (membership) => membership.filterKind !== "domain"
      ) === true
    )).toHaveLength(18)
    expect(compiled.questions.find((question) => question.precommit.id === "q001")
      ?.precommit.memberships?.filter((membership) => membership.filterKind === "domain"))
      .toEqual([])
    expect(Object.fromEntries(
      ["use", "recognition-feature", "comparison-distinction", "safety-application"].map((factKind) => [
        factKind,
        compiled.questions.filter((question) => question.postcommit.factKind === factKind).length
      ])
    )).toEqual({
      use: 41,
      "recognition-feature": 26,
      "comparison-distinction": 11,
      "safety-application": 12
    })
    expect(new Set(compiled.questions.map(
      (question) => question.precommit.prompt.trim().toLocaleLowerCase("en-US")
    )).size).toBe(90)
    expect(compiled.catalog.tools.filter(
      (tool) => tool.practiceEligibility === "atlas-only"
    )).toHaveLength(12)
    expect(compiled.catalog.tools.filter(
      (tool) => tool.publicationGate !== null && tool.practiceEligibility !== "atlas-only"
    )).toHaveLength(0)
    expect(compiled.scenes).toHaveLength(18)
    expect(compiled.scenes.map((scene) => scene.opaqueAssetId)).toEqual(
      Array.from({ length: 18 }, (_, index) => `s${String(index + 1).padStart(3, "0")}`)
    )
    expect(compiled.catalog.schemaVersion).toBe(1)
    expect(compiled.precommit.schemaVersion).toBe(1)
    expect(compiled.postcommit.schemaVersion).toBe(2)
    expect(compiled.postcommit.scenes.every(
      (scene) =>
        scene.schemaVersion === 2 &&
        scene.version === 2 &&
        scene.tags.domain === "health-and-safety" &&
        scene.tags.family === "hazard-scene" &&
        scene.tags.seriesScope === "entry-level-custodians-janitors" &&
        scene.tags.editorialDifficulty === "application"
    )).toBe(true)
    expect(compiled.postcommit.scenes.filter((scene) => scene.kind === "positive")).toHaveLength(16)
    expect(compiled.postcommit.scenes.filter((scene) => scene.kind === "zero-hazard")).toHaveLength(2)
    const acceptedSceneEvidence = input.acceptedScenes as Array<{
      claims: Array<{ id: string }>
      sources: Array<{ id: string; sourceId: string }>
    }>
    const packedClaimIds = new Set(compiled.postcommit.claims.map((claim) => claim.id))
    const packedSourceLineIds = new Set(compiled.postcommit.sourceLines.map((line) => line.id))
    const packedSourceIds = new Set(compiled.postcommit.sources.map((source) => source.id))
    expect(acceptedSceneEvidence.every((scene) =>
      scene.claims.every((claim) => packedClaimIds.has(claim.id)) &&
      scene.sources.every(
        (source) =>
          packedSourceLineIds.has(source.id) && packedSourceIds.has(source.sourceId)
      )
    )).toBe(true)
    expect(compiled.assets).toHaveLength(291)
    const statewideCapacity = compiled.catalog.practiceCapacity.records.find(
      (record) =>
        record.profileId === "nys-entry-level-custodians-janitors" &&
        record.filterKind === "all"
    )
    expect(statewideCapacity).toMatchObject({
      questionCount: 90,
      availableSetLengths: [45, 60, 90]
    })

    const toolsByConceptId = new Map(
      compiled.catalog.tools.map((tool) => [tool.conceptId, tool] as const)
    )
    for (const question of compiled.questions) {
      const receiptLineIds = question.postcommit.sources.map((source) => source.id)
      const claimIds = question.postcommit.claims.map((claim) => claim.id)
      const rationaleClaimIds = [
        ...new Set(question.postcommit.rationales.flatMap((rationale) => rationale.claimIds))
      ]
      expect(new Set(rationaleClaimIds)).toEqual(new Set(claimIds))
      for (const rationale of question.postcommit.rationales) {
        expect(rationale.claimIds.length).toBeGreaterThan(0)
        expect(rationale.claimIds.every((claimId) => claimIds.includes(claimId))).toBe(true)
      }
      for (const claim of question.postcommit.claims) {
        expect(claim.sourceLineIds.every((lineId) => receiptLineIds.includes(lineId))).toBe(true)
        for (const lineId of claim.sourceLineIds) {
          expect(question.postcommit.sources.find(
            (source) => source.id === lineId
          )?.supportedClaimIds).toContain(claim.id)
        }
      }
      for (const mapping of question.postcommit.optionConceptIds ?? []) {
        expect(
          mapping.conceptId.startsWith("action.") ||
          toolsByConceptId.get(mapping.conceptId)?.practiceEligibility === "text-question"
        ).toBe(true)
      }
    }
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
      "claimIds",
      "claims",
      "tags",
      "objectiveId",
      "equivalenceGroupId",
      "factKind",
      "family",
      "confusionSetIds",
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

    expect(precommitArtifacts).toHaveLength(108)
    for (const artifact of precommitArtifacts) {
      const parsed = JSON.parse(artifact.text) as unknown
      const keys = keysIn(parsed)
      for (const key of forbiddenKeys) expect(keys.has(key)).toBe(false)
      if (artifact.kind === "scene-precommit") {
        expect(artifact.text).not.toContain("scene.")
      }
    }
  })

  it("accepts only the canonical version-2 scene release as compiler input", async () => {
    const unversionedScenes = structuredClone(input.acceptedScenes) as Array<{
      schemaVersion?: number
      version?: number
    }>
    if (unversionedScenes[0] !== undefined) {
      delete unversionedScenes[0].schemaVersion
      delete unversionedScenes[0].version
    }

    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes: unversionedScenes }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "schema",
      path: "acceptedScenes"
    })

    const sceneWithObsoleteField = structuredClone(input.acceptedScenes) as Array<{
      semanticManifest?: unknown
    }>
    if (sceneWithObsoleteField[0] !== undefined) {
      sceneWithObsoleteField[0].semanticManifest = { legacy: true }
    }

    await expect(
      Effect.runPromise(compileContentPack({
        ...input,
        acceptedScenes: sceneWithObsoleteField
      }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "schema",
      path: "acceptedScenes"
    })
  })

  it("requires the accepted scene ledger to exactly close over the authored scene ids", async () => {
    const acceptedScenes = structuredClone(input.acceptedScenes) as Array<{
      sceneId: string
      opaqueAssetId: string
      slot: number
    }>
    const extraScene = structuredClone(acceptedScenes[0])
    if (extraScene === undefined) throw new Error("Canonical scene fixture is empty")
    extraScene.sceneId = "scene.extra.unselected"
    extraScene.opaqueAssetId = "s999"
    extraScene.slot = 999
    acceptedScenes.push(extraScene)

    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      path: "acceptedScenes",
      detail: expect.stringContaining("exactly match authored scene ids")
    })
  })

  it("requires shared scene receipts to have identical metadata and set-equal claim support", async () => {
    type MutableReceipt = {
      id: string
      title: string
      supportedClaimIds: string[]
    }
    type MutableScene = { sources: MutableReceipt[] }
    const acceptedScenes = structuredClone(input.acceptedScenes) as MutableScene[]
    const receiptsById = new Map<string, MutableReceipt[]>()
    for (const scene of acceptedScenes) {
      for (const receipt of scene.sources) {
        const receipts = receiptsById.get(receipt.id) ?? []
        receipts.push(receipt)
        receiptsById.set(receipt.id, receipts)
      }
    }
    const sharedReceipts = [...receiptsById.values()].find(
      (receipts) => receipts.length > 1 && receipts[0]!.supportedClaimIds.length > 1
    )
    if (sharedReceipts?.[1] === undefined) {
      throw new Error("Canonical scene fixture requires a shared multi-claim receipt")
    }

    sharedReceipts[1].supportedClaimIds.reverse()
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes }))
    ).resolves.toMatchObject({ postcommit: { schemaVersion: 2 } })

    sharedReceipts[1].title = `${sharedReceipts[1].title} metadata drift`
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("conflicting global definitions")
    })
  })

  it("renders one-scene and one-question runtime boundaries with no unrelated answers", () => {
    const artifacts = renderReleaseArtifacts(compiled)
    const sceneArtifacts = artifacts.filter((artifact) => artifact.itemId === "s001")
    const scenePostcommit = sceneArtifacts.find((artifact) => artifact.kind === "scene-postcommit")
    const questionArtifacts = artifacts.filter((artifact) => artifact.itemId === "q002")
    const questionPostcommit = questionArtifacts.find(
      (artifact) => artifact.kind === "question-postcommit"
    )

    expect(sceneArtifacts.map((artifact) => artifact.path)).toEqual([
      "scenes/s001.precommit.json",
      "scenes/s001.postcommit.json"
    ])
    expect(scenePostcommit).toBeDefined()
    const scene = JSON.parse(scenePostcommit?.text ?? "null") as {
      schemaVersion?: number
      version?: number
      id?: string
      opaqueAssetId?: string
    }
    expect(scene).toMatchObject({
      schemaVersion: 2,
      version: 2,
      id: "scene.slip.hallway-wet-floor",
      opaqueAssetId: "s001"
    })
    expect(scenePostcommit?.text).not.toContain("scene.slip.lobby-raised-mat")
    expect(scenePostcommit?.text).not.toContain("questions")

    expect(questionArtifacts.map((artifact) => artifact.path)).toEqual([
      "questions/q002.precommit.json",
      "questions/q002.postcommit.json"
    ])
    expect(questionPostcommit?.text).toContain('"id": "q002"')
    expect(questionPostcommit?.text).not.toContain('"id": "q001"')
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
        artifact.kind === "question-precommit" && artifact.itemId === "q001"
    )
    const legacyPrecommit = manifest.artifacts.find(
      (artifact) => artifact.kind === "legacy-question-precommit"
    )

    expect(manifest.artifacts).toHaveLength(221)
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

  it("rejects dangling rationale and broken canonical scene zones, regions, claims, and sources", async () => {
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

    const outOfBoundsRegion = structuredClone(input.acceptedScenes) as Array<{
      targets: Array<{ polygons: Array<Array<number[]>> }>
    }>
    const firstPoint = outOfBoundsRegion[0]?.targets[0]?.polygons[0]?.[0]
    if (firstPoint !== undefined) firstPoint[0] = 1.01
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes: outOfBoundsRegion }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("out-of-bounds region")
    })

    const degenerateRegion = structuredClone(input.acceptedScenes) as Array<{
      targets: Array<{ polygons: Array<Array<number[]>> }>
    }>
    const firstPolygon = degenerateRegion[0]?.targets[0]?.polygons[0]
    if (firstPolygon !== undefined) firstPolygon.splice(1)
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes: degenerateRegion }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "schema",
      path: "acceptedScenes"
    })

    const unknownInventoryZone = structuredClone(input.acceptedScenes) as Array<{
      targets: Array<{ zone: string }>
    }>
    const firstTarget = unknownInventoryZone[0]?.targets[0]
    if (firstTarget !== undefined) firstTarget.zone = "unknown released zone"
    await expect(
      Effect.runPromise(compileContentPack({ ...input, acceptedScenes: unknownInventoryZone }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("unknown neutral zone")
    })

    const duplicateNeutralLabel = structuredClone(input.acceptedScenes) as Array<{
      neutralPreAnswer: { zones: Array<{ order: number; label: string }> }
    }>
    const firstLabel = duplicateNeutralLabel[0]?.neutralPreAnswer.zones[0]?.label
    if (
      firstLabel !== undefined &&
      duplicateNeutralLabel[0]?.neutralPreAnswer.zones[1] !== undefined
    ) {
      duplicateNeutralLabel[0].neutralPreAnswer.zones[1].label = firstLabel
    }
    await expect(Effect.runPromise(compileContentPack({
      ...input,
      acceptedScenes: duplicateNeutralLabel
    }))).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("unique labels")
    })

    const missingClaim = structuredClone(input.acceptedScenes) as Array<{
      claims: Array<{ id: string }>
    }>
    missingClaim[0]?.claims.pop()
    await expect(Effect.runPromise(compileContentPack({
      ...input,
      acceptedScenes: missingClaim
    }))).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("missing global claim")
    })

    const unpairedEvidenceEdge = structuredClone(input.acceptedScenes) as Array<{
      claims: Array<{ id: string; sourceLineIds: string[] }>
      sources: Array<{ id: string; supportedClaimIds: string[] }>
    }>
    const receiptCounts = new Map<string, number>()
    for (const scene of unpairedEvidenceEdge) {
      for (const receipt of scene.sources) {
        receiptCounts.set(receipt.id, (receiptCounts.get(receipt.id) ?? 0) + 1)
      }
    }
    const sceneWithUniqueReceipt = unpairedEvidenceEdge.find((scene) =>
      scene.sources.some((receipt) => receiptCounts.get(receipt.id) === 1)
    )
    const uniqueReceipt = sceneWithUniqueReceipt?.sources.find(
      (receipt) => receiptCounts.get(receipt.id) === 1
    )
    const originalClaimId = uniqueReceipt?.supportedClaimIds.find((claimId) =>
      sceneWithUniqueReceipt?.claims.some((claim) => claim.id === claimId)
    )
    const alternateClaim = sceneWithUniqueReceipt?.claims.find(
      (claim) => claim.id !== originalClaimId && !claim.sourceLineIds.includes(uniqueReceipt?.id ?? "")
    )
    if (
      uniqueReceipt === undefined ||
      originalClaimId === undefined ||
      alternateClaim === undefined
    ) {
      throw new Error("Canonical scene fixture requires one uniquely used source receipt")
    }
    uniqueReceipt.supportedClaimIds[
      uniqueReceipt.supportedClaimIds.indexOf(originalClaimId)
    ] = alternateClaim.id
    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedScenes: unpairedEvidenceEdge })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("bidirectional evidence edge")
    })

    const missingSourceMetadata = structuredClone(input.acceptedScenes) as Array<{
      sources: Array<{
        id: string
        scope?: string
        sourceLocator?: string
      }>
    }>
    const receiptIdWithoutScope = missingSourceMetadata[0]?.sources[0]?.id
    if (receiptIdWithoutScope !== undefined) {
      for (const scene of missingSourceMetadata) {
        const receipt = scene.sources.find((candidate) => candidate.id === receiptIdWithoutScope)
        if (receipt !== undefined) delete receipt.scope
      }
    }
    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedScenes: missingSourceMetadata })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("source scope and source locator")
    })
  })

  it("rejects a comparison panel that is not hash-bound to its accepted member masters", async () => {
    const wrongMemberHash = structuredClone(input.acceptedComparisons) as Array<{
      memberMasterHashes: Array<{ sha256: string }>
    }>
    const selected = wrongMemberHash.find(
      (comparison) =>
        (comparison as { id?: string }).id === "comparison.pipe-adjustable-wrench"
    )
    if (selected?.memberMasterHashes[0] !== undefined) {
      selected.memberMasterHashes[0].sha256 = "0".repeat(64)
    }
    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedComparisons: wrongMemberHash })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("another accepted master")
    })
  })

  it("keeps a comparison atlas-only whenever its scored-use gate is nonempty", async () => {
    const gatedComparisons = structuredClone(input.acceptedComparisons) as Array<{
      id: string
      scoredUseGate: string[]
    }>
    const selected = gatedComparisons.find(
      (comparison) => comparison.id === "comparison.pipe-adjustable-wrench"
    )
    if (selected === undefined) throw new Error("Launch comparison fixture is missing")
    selected.scoredUseGate = ["Test-only unresolved distinction gate."]

    await expect(
      Effect.runPromise(
        compileContentPack({ ...input, acceptedComparisons: gatedComparisons })
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("atlas-only comparison")
    })
  })

  it("enforces six-state Nassau facts, source closure, current-value uniqueness, and effective history", async () => {
    type MutableFact = {
      id: string
      category: string
      label: string
      state: string
      appliesToExamNumbers: string[]
      value: null | string
      detail: null | string
      reviewedOn: string
      effectiveFrom: null | string
      effectiveThrough: null | string
      sourceLineIds: string[]
      conflictingValues: Array<{ value: string; sourceLineIds: string[] }>
      supersededByFactId: null | string
    }
    type MutableProfile = {
      id: string
      examIdentityState: string
      sourceIds: string[]
      announcementFactSheet: null | {
        version: number
        facts: MutableFact[]
        changeHistory: Array<{ version: number; changedOn: string; sourceLineIds: string[] }>
      }
    }
    type MutablePack = { profiles: MutableProfile[] }
    const nassauFactSheet = (pack: MutablePack) => {
      const profile = pack.profiles.find(
        (candidate) => candidate.id === "nassau-county-custodian-entry-level"
      )
      if (profile?.announcementFactSheet === null || profile === undefined) {
        throw new Error("Nassau launch profile fixture is missing its fact sheet")
      }
      return profile.announcementFactSheet
    }

    const outsideReceipt = structuredClone(input.authoredPack) as MutablePack
    nassauFactSheet(outsideReceipt).facts[0]!.sourceLineIds = [
      "line.feature-fact.t001"
    ]
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: outsideReceipt }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("outside its profile receipt set")
    })

    const overlappingCurrent = structuredClone(input.authoredPack) as MutablePack
    const existingCount = nassauFactSheet(overlappingCurrent).facts.find(
      (fact) => fact.id === "official-item-count"
    )
    if (existingCount === undefined) throw new Error("Official count fixture is missing")
    nassauFactSheet(overlappingCurrent).facts.push({
      ...structuredClone(existingCount),
      id: "official-item-count-duplicate"
    })
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: overlappingCurrent }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("exactly one current fact-state wrapper")
    })

    const invalidState = structuredClone(input.authoredPack) as MutablePack
    const invalidCount = nassauFactSheet(invalidState).facts.find(
      (fact) => fact.id === "official-item-count"
    )
    if (invalidCount === undefined) throw new Error("Count-state fixture is missing")
    invalidCount.state = "verified"
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: invalidState }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("verified state contract")
    })

    const conflicting = structuredClone(input.authoredPack) as MutablePack
    const conflictingCount = nassauFactSheet(conflicting).facts.find(
      (fact) => fact.id === "official-item-count"
    )
    if (conflictingCount === undefined) throw new Error("Count-state fixture is missing")
    Object.assign(conflictingCount, {
      state: "conflicting",
      detail: "Two controlling records publish different counts.",
      sourceLineIds: [],
      conflictingValues: [
        { value: "80", sourceLineIds: ["line.nassau.oc-filing"] },
        { value: "90", sourceLineIds: ["line.nassau.promo-filing"] }
      ]
    })
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: conflicting }))
    ).resolves.toBeDefined()

    const malformedConflict = structuredClone(conflicting) as MutablePack
    const malformedCount = nassauFactSheet(malformedConflict).facts.find(
      (fact) => fact.id === "official-item-count"
    )
    if (malformedCount === undefined) throw new Error("Conflict fixture is missing")
    malformedCount.conflictingValues.pop()
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: malformedConflict }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("conflicting state contract")
    })

    const overlappingHistory = structuredClone(input.authoredPack) as MutablePack
    const originalJurisdictions = nassauFactSheet(overlappingHistory).facts.find(
      (fact) => fact.id === "promo-jurisdictions-original"
    )
    if (originalJurisdictions === undefined) throw new Error("Jurisdiction history is missing")
    originalJurisdictions.effectiveThrough = "2026-06-18"
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: overlappingHistory }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("overlapping effective history")
    })

    const nonSuccessorOverlap = structuredClone(input.authoredPack) as MutablePack
    const nonSuccessorFacts = nassauFactSheet(nonSuccessorOverlap).facts
    const overlapTemplate = nonSuccessorFacts.find(
      (fact) => fact.id === "promo-jurisdictions-original"
    )
    if (overlapTemplate === undefined) throw new Error("Jurisdiction history is missing")
    nonSuccessorFacts.push({
      ...structuredClone(overlapTemplate),
      id: "promo-jurisdictions-non-successor-overlap",
      detail: "Test-only record that points past the fact it overlaps.",
      effectiveFrom: "2026-06-12",
      effectiveThrough: "2026-06-13",
      supersededByFactId: "promo-jurisdictions-current"
    })
    await expect(
      Effect.runPromise(compileContentPack({
        ...input,
        authoredPack: nonSuccessorOverlap
      }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("overlapping effective history")
    })

    const staleHistory = structuredClone(input.authoredPack) as MutablePack
    nassauFactSheet(staleHistory).version = 3
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: staleHistory }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("fact-sheet history")
    })

    const invalidSeriesIdentity = structuredClone(input.authoredPack) as MutablePack
    const statewide = invalidSeriesIdentity.profiles.find(
      (profile) => profile.id === "nys-entry-level-custodians-janitors"
    )
    if (statewide === undefined) throw new Error("Statewide profile fixture is missing")
    statewide.examIdentityState = "verified"
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: invalidSeriesIdentity }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("not applicable")
    })
  })

  it("rejects authored rationales that no longer cover every question claim", async () => {
    type MutablePack = {
      questions: Array<{
        id: string
        claimIds: string[]
        rationales: Array<{ claimIds: string[] }>
      }>
    }
    const rationaleDrift = structuredClone(input.authoredPack) as MutablePack
    const selected = rationaleDrift.questions.find(
      (question) => question.id === "q001"
    )
    if (selected === undefined || selected.claimIds.length < 2) {
      throw new Error("Multi-claim launch question fixture is missing")
    }
    for (const rationale of selected.rationales) rationale.claimIds = [selected.claimIds[0]!]

    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: rationaleDrift }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("collectively cite every question claim")
    })
  })

  it.each([
    ["claim text", (evidence: ReviewEvidence) => {
      evidence.claim.text += " Changed after review."
    }],
    ["claim caveat", (evidence: ReviewEvidence) => {
      evidence.claim.caveat = evidence.claim.caveat === null
        ? "New scope caveat."
        : `${evidence.claim.caveat} Changed after review.`
    }],
    ["source-line locator", (evidence: ReviewEvidence) => {
      evidence.line.locator += " changed"
    }],
    ["source-line excerpt", (evidence: ReviewEvidence) => {
      evidence.line.excerpt += " Changed after review."
    }],
    ["source-line verification date", (evidence: ReviewEvidence) => {
      evidence.line.verifiedOn = "2026-08-24"
    }],
    ["source version", (evidence: ReviewEvidence) => {
      evidence.source.version += " changed"
    }],
    ["source URL", (evidence: ReviewEvidence) => {
      evidence.source.url = "https://example.invalid/review-drift"
    }]
  ] as const)("invalidates a question review when %s changes", async (_label, mutate) => {
    const changed = structuredClone(input.authoredPack) as MutableReviewPack
    const evidence = reviewEvidenceFor(changed, "q001")
    mutate(evidence)
    await expect(
      Effect.runPromise(compileContentPack({ ...input, authoredPack: changed }))
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "relation",
      detail: expect.stringContaining("resolved evidence changed")
    })
  })
})

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Effect, Schema } from "effect"
import { describe, expect, it, vi } from "vitest"
import {
  computePrintManifestFingerprint,
  computePrintPacketFingerprint,
  generatePrintJob,
  generatePrintManifest,
  printProductAvailability,
  printProductCapacity,
  printProductFilterOptions,
  PrintGenerationError
} from "../src/print/generation.ts"
import {
  PrintBuilderBootstrap,
  createPrintJobId,
  decodePrintJobId,
  PrintJobManifest,
  PrintJobRecord,
  PrintQuestionAnswer,
  PrintRetainedAsset,
  PrintSceneAnswer,
  PrintSettings,
  parsePrintPreviewPath,
  printPreviewPath,
  type SupportedPrintProduct
} from "../src/print/model.ts"
import { PrintPreview } from "../src/print/react/preview.tsx"
import {
  createPrintPreviewController,
  type PrintEffectRunner,
  type PrintPreviewController
} from "../src/print/controller.ts"
import {
  monotonicPrintTimestamp,
  validatePrintJobRecord,
  validatePrintJobRecordIntegrity
} from "../src/print/persistence.ts"
import { PrintPersistence } from "../src/print/persistence.ts"
import {
  createPrintJob,
  PrintLocalClosureError
} from "../src/print/workflow.ts"
import { VerifiedContent } from "../src/verified-content.ts"

const receipt = (id: string) => ({
  postcommitPath: `/content/release/${id}.postcommit.json`,
  postcommitBytes: 100,
  postcommitSha256: id.repeat(64).slice(0, 64).replace(/[^a-f0-9]/g, "a")
})

const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
const tinyPngSha256 = "431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460"

const assetReceipt = (id: string) => ({
  path: `/content/assets/derivatives/${id}-print.png`,
  bytes: 68,
  sha256: tinyPngSha256
})

const questions = ["q3", "q1", "q2"].map((id, questionIndex) => ({
  id,
  profileIds: ["profile-1"],
  category: questionIndex === 0 ? "Cleaning tools" : "Tool selection",
  prompt: `Prompt ${id}`,
  options: ["d", "b", "a", "c"].map((optionId) => ({
    id: `${id}-${optionId}`,
    label: `Option ${optionId.toUpperCase()} secret-${questionIndex}-${optionId}`
  })),
  answerReceipt: receipt(id)
}))

const bootstrap = new PrintBuilderBootstrap({
  schemaVersion: 1,
  releaseId: "release-7",
  contentVersion: 7,
  profiles: [{
    id: "profile-1",
    label: "Statewide entry-level",
    version: 3,
    jurisdiction: "New York State",
    compatibilityKey: "profile-1-v1",
    disclaimer: "Original practice only.",
    announcementFactSheet: null
  }],
  questions,
  tools: [
    {
      id: "adjustable-wrench",
      profileIds: ["profile-1"],
      canonicalTerm: "Adjustable wrench",
      family: "wrenches",
      useSummary: "Fits multiple fastener sizes.",
      distinguishingFeatures: ["Movable jaw"],
      neutralDescription: "An adjustable wrench on a plain background.",
      asset: assetReceipt("adjustable-wrench")
    },
    {
      id: "pipe-wrench",
      profileIds: ["profile-1"],
      canonicalTerm: "Pipe wrench",
      family: "wrenches",
      useSummary: "Grips round pipe.",
      distinguishingFeatures: ["Serrated jaws"],
      neutralDescription: "A pipe wrench on a plain background.",
      asset: assetReceipt("pipe-wrench")
    },
    {
      id: "fixed-wrench",
      profileIds: ["profile-1"],
      canonicalTerm: "Fixed wrench",
      family: "wrenches",
      useSummary: "Fits one fastener size.",
      distinguishingFeatures: ["Fixed opening"],
      neutralDescription: "A fixed wrench on a plain background.",
      asset: assetReceipt("fixed-wrench")
    },
    {
      id: "slip-joint-pliers",
      profileIds: ["profile-1"],
      canonicalTerm: "Slip-joint pliers",
      family: "pliers",
      useSummary: "Grips varied shapes.",
      distinguishingFeatures: ["Pivot with two positions"],
      neutralDescription: "Slip-joint pliers on a plain background.",
      asset: assetReceipt("slip-joint-pliers")
    }
  ],
  scenes: ["scene-1", "scene-2"].map((id, index) => ({
    id,
    profileIds: ["profile-1"],
    environment: index === 0 ? "hallway" : "storage room",
    neutralOverview: `Neutral overview ${index + 1}`,
    neutralZones: [{ order: 1, label: "floor", description: "The floor is visible." }],
    asset: assetReceipt(id),
    answerReceipt: receipt(id)
  })),
  corrections: []
})

const settings = (product: SupportedPrintProduct, count = 3) => new PrintSettings({
  profileId: "profile-1",
  product,
  count,
  seed: "same-seed",
  paper: "us-letter",
  margin: "standard",
  printSize: "normal",
  grayscalePreview: true,
  includeImages: false,
  answerKeyPlacement: "separate-job",
  includeExplanations: product === "explanations-and-sources",
  includeSources: true,
  filters: []
})

const answers = questions.map((question) => new PrintQuestionAnswer({
  questionId: question.id,
  correctOptionId: `${question.id}-c`,
  rationales: question.options.map((option) => ({
    optionId: option.id,
    message: `Rationale ${option.id}`
  })),
  sources: [{ id: `source-${question.id}`, label: `Source ${question.id}`, locator: `loc-${question.id}` }]
}))

const sceneAnswers = bootstrap.scenes.map((scene, index) => new PrintSceneAnswer({
  sceneId: scene.id,
  kind: "positive",
  hazardFamily: "housekeeping",
  claim: `Reviewed claim ${index + 1}`,
  targets: [{
    id: `target-${index + 1}`,
    condition: `Target condition ${index + 1}`,
    correction: `Correction ${index + 1}`
  }],
  decoys: [{
    id: `decoy-${index + 1}`,
    condition: `Safe condition ${index + 1}`,
    safeBecause: `Safe because ${index + 1}`
  }],
  targetRegions: [{
    inventoryId: `target-${index + 1}`,
    polygons: [[[0.1, 0.2], [0.8, 0.2], [0.8, 0.7]]]
  }],
  nonvisualStatements: [{
    zone: "floor",
    role: "target",
    statement: `Equivalent statement ${index + 1}`
  }],
  sourceReferences: [{
    id: `hazard-source-${index + 1}`,
    label: `Hazard source ${index + 1}`,
    locator: `section ${index + 1}`
  }]
}))

const retainedAssets = [...bootstrap.tools, ...bootstrap.scenes].map((source) =>
  new PrintRetainedAsset({
    receipt: source.asset,
    dataUrl: `data:image/png;base64,${tinyPngBase64}`
  }))

describe("deterministic print generation", () => {
  it("normalizes bounded seeds and shares one exact print-job route identity", () => {
    const normalized = generatePrintManifest({
      bootstrap,
      settings: {
        ...settings("multiple-choice-questions"),
        seed: "  print-seed  "
      } as PrintSettings
    })
    expect(normalized.settings.seed).toBe("print-seed")
    expect(() => generatePrintManifest({
      bootstrap,
      settings: {
        ...settings("multiple-choice-questions"),
        seed: "x".repeat(129)
      } as PrintSettings
    })).toThrow(/no longer than 128 code units/)

    const id = createPrintJobId("ABCDEF12-3456-7890-ABCD-EF1234567890")
    expect(id).toBe("print-abcdef12-3456-7890-abcd-ef1234567890")
    expect(decodePrintJobId(id)).toBe(id)
    expect(printPreviewPath(id)).toBe(`/print/preview/${id}/`)
    expect(parsePrintPreviewPath(printPreviewPath(id))).toBe(id)
    for (const invalid of ["print-short", "print-UPPERCASE12", `print-${"a".repeat(65)}`]) {
      expect(() => decodePrintJobId(invalid), invalid).toThrow()
      expect(parsePrintPreviewPath(`/print/preview/${invalid}/`), invalid).toBeUndefined()
    }
  })

  it("reproduces the same manifest independent of authored inventory order", () => {
    const first = generatePrintManifest({ bootstrap, settings: settings("multiple-choice-questions") })
    const reordered = new PrintBuilderBootstrap({ ...bootstrap, questions: [...questions].reverse() })
    const second = generatePrintManifest({ bootstrap: reordered, settings: settings("multiple-choice-questions") })

    expect(second).toEqual(first)
    expect(first.actualLength).toBe(3)
    expect(first.actualDistribution).toEqual([
      { label: "Cleaning tools", count: 1 },
      { label: "Tool selection", count: 2 }
    ])
    expect(Schema.decodeUnknownSync(PrintJobManifest)(JSON.parse(JSON.stringify(first)))).toEqual(first)
  })

  it("pins the same questions and option order for separately generated questions and key", () => {
    const questionManifest = generatePrintManifest({
      bootstrap,
      settings: settings("multiple-choice-questions", 2)
    })
    const keyManifest = generatePrintManifest({ bootstrap, settings: settings("answer-key", 2) })
    const explanationManifest = generatePrintManifest({
      bootstrap,
      settings: settings("explanations-and-sources", 2)
    })

    expect(keyManifest.questions).toEqual(questionManifest.questions)
    expect(explanationManifest.questions).toEqual(questionManifest.questions)
    expect(keyManifest.pairingFingerprint).toBe(questionManifest.pairingFingerprint)
    expect(explanationManifest.pairingFingerprint).toBe(questionManifest.pairingFingerprint)
    expect(keyManifest.fingerprint).not.toBe(questionManifest.fingerprint)
  })

  it("keeps item coordinates stable when only paper and accessibility output settings change", () => {
    const first = settings("multiple-choice-questions", 2)
    const reformatted = new PrintSettings({
      ...first,
      paper: "a4",
      margin: "wide",
      printSize: "large",
      grayscalePreview: false
    })

    const reformattedManifest = generatePrintManifest({ bootstrap, settings: reformatted })
    const firstManifest = generatePrintManifest({ bootstrap, settings: first })
    expect(reformattedManifest.questions).toEqual(firstManifest.questions)
    expect(reformattedManifest.pairingFingerprint).toBe(firstManifest.pairingFingerprint)
  })

  it("keeps answer-bearing bytes out of question and blank-sheet products", () => {
    const questionJob = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions"),
      answers
    })
    const blankJob = generatePrintJob({ bootstrap, settings: settings("blank-answer-sheet") })
    const serialized = `${JSON.stringify(questionJob)}${JSON.stringify(blankJob)}`

    expect(questionJob.packet.sections[0]?.tag).toBe("questions")
    expect(blankJob.packet.sections[0]?.tag).toBe("answer-sheet")
    expect(serialized).not.toContain("correctOptionId")
    expect(serialized).not.toContain("Rationale")
    expect(serialized).not.toContain("Source q")
  })

  it("creates answer and explanation packets as distinct immutable sections", () => {
    const key = generatePrintJob({ bootstrap, settings: settings("answer-key"), answers })
    const explanations = generatePrintJob({
      bootstrap,
      settings: settings("explanations-and-sources"),
      answers
    })

    expect(key.packet.sections).toHaveLength(1)
    expect(key.packet.sections[0]?.tag).toBe("answer-key")
    expect(JSON.stringify(key.packet)).not.toContain("Rationale")
    expect(explanations.packet.sections).toHaveLength(1)
    expect(explanations.packet.sections[0]?.tag).toBe("explanations")
    expect(JSON.stringify(explanations.packet)).toContain("Rationale")
  })

  it("appends a page-separable key and optional explanations to a paired question packet", () => {
    const appendedKey = new PrintSettings({
      ...settings("multiple-choice-questions"),
      answerKeyPlacement: "new-section",
      includeExplanations: false
    })
    const withKey = generatePrintJob({ bootstrap, settings: appendedKey, answers })
    expect(withKey.packet.sections.map((section) => section.tag)).toEqual([
      "questions",
      "answer-key"
    ])

    const withExplanations = generatePrintJob({
      bootstrap,
      settings: new PrintSettings({ ...appendedKey, includeExplanations: true }),
      answers
    })
    expect(withExplanations.packet.sections.map((section) => section.tag)).toEqual([
      "questions",
      "answer-key",
      "explanations"
    ])
    expect(withExplanations.manifest.pairingFingerprint).toBe(withKey.manifest.pairingFingerprint)
    expect(withExplanations.manifest.pageCount).toBeGreaterThan(withKey.manifest.pageCount)
  })

  it("rejects persisted section compositions outside the manifest contract", () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions")
    })
    const valid = new PrintJobRecord({
      id: "print-job-12345678",
      ...generated,
      status: "preview-ready",
      updatedAt: 1
    })
    expect(validatePrintJobRecord(valid)).toEqual(valid)

    const invalidComposition = {
      ...valid,
      packet: {
        ...valid.packet,
        sections: [...valid.packet.sections, { tag: "answer-key" as const, answers: [] }]
      }
    }
    expect(() => validatePrintJobRecord(invalidComposition)).toThrow(/invalid section composition/)

    const missingPairing = {
      ...valid,
      manifest: { ...valid.manifest, pairingFingerprint: null }
    }
    expect(() => validatePrintJobRecord(missingPairing)).toThrow(/invalid set-pairing closure/)
  })

  it("rejects tampered manifest, pairing, packet, and exact question coordinates on restore", () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions")
    })
    const valid = new PrintJobRecord({
      id: "print-job-12345678",
      ...generated,
      status: "preview-ready",
      updatedAt: 1
    })
    const questionsSection = valid.packet.sections[0]
    if (questionsSection?.tag !== "questions") throw new Error("Expected a question packet")

    expect(() => validatePrintJobRecord({
      ...valid,
      manifest: { ...valid.manifest, pageCount: valid.manifest.pageCount + 1 }
    })).toThrow(/invalid manifest fingerprint/)

    expect(() => validatePrintJobRecord({
      ...valid,
      manifest: {
        ...valid.manifest,
        pairingFingerprint: valid.manifest.pairingFingerprint === "0000000000000000"
          ? "1111111111111111"
          : "0000000000000000"
      }
    })).toThrow(/invalid set-pairing fingerprint/)

    const changedPromptPacket = {
      ...valid.packet,
      sections: [{
        ...questionsSection,
        questions: questionsSection.questions.map((question, index) =>
          index === 0 ? { ...question, prompt: `${question.prompt} changed` } : question
        )
      }]
    }
    expect(() => validatePrintJobRecord({ ...valid, packet: changedPromptPacket })).toThrow(
      /invalid packet fingerprint/
    )

    const renumberedPacketWithoutFingerprint = {
      ...valid.packet,
      sections: [{
        ...questionsSection,
        questions: questionsSection.questions.map((question, index) =>
          index === 0 ? { ...question, number: 99 } : question
        )
      }]
    }
    const renumberedPacket = {
      ...renumberedPacketWithoutFingerprint,
      fingerprint: computePrintPacketFingerprint(renumberedPacketWithoutFingerprint)
    }
    expect(() => validatePrintJobRecord({ ...valid, packet: renumberedPacket })).toThrow(
      /exact manifest coordinate closure/
    )

    const changedOptionPacketWithoutFingerprint = {
      ...valid.packet,
      sections: [{
        ...questionsSection,
        questions: questionsSection.questions.map((question, index) => index === 0
          ? {
              ...question,
              options: question.options.map((option, optionIndex) => optionIndex === 0
                ? { ...option, id: `${option.id}-changed` }
                : option)
            }
          : question)
      }]
    }
    const changedOptionPacket = {
      ...changedOptionPacketWithoutFingerprint,
      fingerprint: computePrintPacketFingerprint(changedOptionPacketWithoutFingerprint)
    }
    expect(() => validatePrintJobRecord({ ...valid, packet: changedOptionPacket })).toThrow(
      /exact manifest coordinate closure/
    )
  })

  it("rejects unsafe print timestamps and malformed persisted integer domains after refingerprinting", () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions")
    })
    const valid = new PrintJobRecord({
      id: "print-job-12345678",
      ...generated,
      status: "preview-ready",
      updatedAt: 100
    })
    const invalidIntegers = [0, -1, Number.MAX_SAFE_INTEGER + 1, Number.POSITIVE_INFINITY]

    expect(monotonicPrintTimestamp(50, 100)).toBe(100)
    expect(monotonicPrintTimestamp(150, 100)).toBe(150)
    for (const invalid of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      -1,
      Number.MAX_SAFE_INTEGER + 1
    ]) {
      expect(() => validatePrintJobRecord({ ...valid, updatedAt: invalid })).toThrow()
      expect(() => monotonicPrintTimestamp(invalid, 100)).toThrow()
      expect(() => monotonicPrintTimestamp(100, invalid)).toThrow()
    }

    for (const invalid of invalidIntegers) {
      expect(() => Schema.decodeUnknownSync(PrintBuilderBootstrap)({
        ...bootstrap,
        contentVersion: invalid
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(PrintBuilderBootstrap)({
        ...bootstrap,
        profiles: bootstrap.profiles.map((profile, index) => index === 0
          ? { ...profile, version: invalid }
          : profile)
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(PrintSettings)({
        ...settings("multiple-choice-questions"),
        count: invalid
      })).toThrow()

      for (const field of ["contentVersion", "actualLength", "pageCount"] as const) {
        const withoutFingerprint = { ...valid.manifest, [field]: invalid }
        const manifest = {
          ...withoutFingerprint,
          fingerprint: computePrintManifestFingerprint(withoutFingerprint)
        }
        expect(() => validatePrintJobRecord({ ...valid, manifest })).toThrow()
      }
    }

    const [firstDistribution, secondDistribution] = valid.manifest.actualDistribution
    if (firstDistribution === undefined || secondDistribution === undefined) {
      throw new Error("Expected a two-category print distribution fixture")
    }
    for (const counts of [[-1, 4], [0, 3]] as const) {
      const withoutFingerprint = {
        ...valid.manifest,
        actualDistribution: [
          { ...firstDistribution, count: counts[0] },
          { ...secondDistribution, count: counts[1] }
        ]
      }
      const manifest = {
        ...withoutFingerprint,
        fingerprint: computePrintManifestFingerprint(withoutFingerprint)
      }
      expect(() => validatePrintJobRecord({ ...valid, manifest })).toThrow()
    }

    const questionsSection = valid.packet.sections[0]
    if (questionsSection?.tag !== "questions") throw new Error("Expected a question packet")
    const withoutPacketFingerprint = {
      ...valid.packet,
      sections: [{
        ...questionsSection,
        questions: questionsSection.questions.map((question, index) => index === 0
          ? { ...question, number: 0 }
          : question)
      }]
    }
    const packet = {
      ...withoutPacketFingerprint,
      fingerprint: computePrintPacketFingerprint(withoutPacketFingerprint)
    }
    expect(() => validatePrintJobRecord({ ...valid, packet })).toThrow()
  })

  it("verifies retained image syntax, MIME, bytes, digest, and exact manifest closure", async () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: new PrintSettings({
        ...settings("hazard-worksheet", 2),
        includeImages: true
      }),
      retainedAssets
    })
    const valid = new PrintJobRecord({
      id: "print-images123",
      ...generated,
      status: "preview-ready",
      updatedAt: 100
    })
    await expect(validatePrintJobRecordIntegrity(valid)).resolves.toEqual(valid)
    const section = valid.packet.sections[0]
    if (section?.tag !== "hazard-worksheet") throw new Error("Expected a hazard worksheet")
    const firstScene = section.scenes[0]
    const secondScene = section.scenes[1]
    if (firstScene?.asset === null || firstScene?.asset === undefined ||
      secondScene?.asset === null || secondScene?.asset === undefined) {
      throw new Error("Expected two retained scene images")
    }
    const withFirstAsset = (
      asset: PrintRetainedAsset | null,
      scenes: typeof section.scenes = section.scenes
    ) => {
      const mappedScenes = scenes.map((scene, index) =>
        index === 0 ? { ...scene, asset } : scene
      )
      const firstMappedScene = mappedScenes[0]
      if (firstMappedScene === undefined) throw new Error("Expected a retained scene")
      const closedScenes: typeof section.scenes = [firstMappedScene, ...mappedScenes.slice(1)]
      const withoutFingerprint = {
        ...valid.packet,
        sections: [{
          ...section,
          scenes: closedScenes
        }]
      }
      return {
        ...withoutFingerprint,
        fingerprint: computePrintPacketFingerprint(withoutFingerprint)
      }
    }

    for (const dataUrl of [
      "data:image/png;base64,@@==",
      `${firstScene.asset.dataUrl}suffix`,
      firstScene.asset.dataUrl.replace("data:image/png", "data:image/jpeg"),
      "data:image/png;base64,AA=="
    ]) {
      const packet = withFirstAsset({ ...firstScene.asset, dataUrl })
      expect(() => validatePrintJobRecord({ ...valid, packet })).toThrow()
    }

    const binary = atob(tinyPngBase64)
    const changedBytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    changedBytes[changedBytes.length - 1] = (changedBytes[changedBytes.length - 1] ?? 0) ^ 1
    const changedDataUrl = `data:image/png;base64,${btoa(String.fromCharCode(...changedBytes))}`
    const digestPacket = withFirstAsset({ ...firstScene.asset, dataUrl: changedDataUrl })
    expect(() => validatePrintJobRecord({ ...valid, packet: digestPacket })).not.toThrow()
    await expect(validatePrintJobRecordIntegrity({ ...valid, packet: digestPacket })).rejects.toThrow(
      /digest does not match/
    )

    const swappedPacket = withFirstAsset({ ...firstScene.asset, receipt: secondScene.asset.receipt })
    expect(() => validatePrintJobRecord({ ...valid, packet: swappedPacket })).toThrow(
      /manifest asset closure/
    )
    const missingPacket = withFirstAsset(null)
    expect(() => validatePrintJobRecord({ ...valid, packet: missingPacket })).toThrow(
      /manifest asset closure/
    )
    const extraScenes: typeof section.scenes = [section.scenes[0]!, ...section.scenes]
    const extraPacketWithoutFingerprint = {
      ...valid.packet,
      sections: [{ ...section, scenes: extraScenes }]
    }
    const extraPacket = {
      ...extraPacketWithoutFingerprint,
      fingerprint: computePrintPacketFingerprint(extraPacketWithoutFingerprint)
    }
    expect(() => validatePrintJobRecord({ ...valid, packet: extraPacket })).toThrow(
      /manifest asset closure/
    )
  })

  it("fails truthfully for unavailable products, insufficient counts, and missing answers", () => {
    expect(printProductAvailability("hazard-worksheet", bootstrap, "profile-1")).toMatchObject({
      available: true,
      product: "hazard-worksheet"
    })
    expect(printProductAvailability("announcement-profile-fact-sheet", bootstrap, "profile-1")).toEqual({
      available: false,
      product: "announcement-profile-fact-sheet",
      reason: "No source-bound announcement fact history is published for this profile; a generic profile summary is not substituted."
    })
    expect(printProductAvailability("correction-change-log-excerpt", bootstrap, "profile-1")).toEqual({
      available: false,
      product: "correction-change-log-excerpt",
      reason: "No publishable structured correction or change-log record exists in this release."
    })
    expect(() => generatePrintManifest({
      bootstrap,
      settings: settings("multiple-choice-questions", 45)
    })).toThrow(PrintGenerationError)
    expect(() => generatePrintJob({ bootstrap, settings: settings("answer-key") })).toThrow(
      /answer material is unavailable/
    )
  })

  it("counts and selects complete compatible tool families rather than individual tools", () => {
    expect(printProductCapacity("tool-family-contrast-cards", bootstrap, "profile-1")).toBe(1)
    const configured = new PrintSettings({
      ...settings("tool-family-contrast-cards", 1),
      includeImages: true
    })
    const generated = generatePrintJob({ bootstrap, settings: configured, retainedAssets })

    expect(generated.manifest.itemIds).toEqual(["wrenches"])
    expect(generated.manifest.actualLength).toBe(1)
    expect(generated.manifest.assets).toHaveLength(3)
    expect(generated.packet.sections[0]).toMatchObject({
      tag: "tool-family-cards",
      families: [{ family: "wrenches" }]
    })
    const section = generated.packet.sections[0]
    expect(section?.tag === "tool-family-cards" ? section.families[0]?.tools : []).toHaveLength(3)
  })

  it("keeps the blank hazard worksheet answer-free and receipt-binds retained images", () => {
    const configured = new PrintSettings({
      ...settings("hazard-worksheet", 2),
      includeImages: true
    })
    const generated = generatePrintJob({
      bootstrap,
      settings: configured,
      sceneAnswers,
      retainedAssets
    })
    const serialized = JSON.stringify(generated)

    expect(generated.packet.sections[0]?.tag).toBe("hazard-worksheet")
    expect(generated.manifest.assets.map((asset) => asset.path).sort()).toEqual(
      bootstrap.scenes.map((scene) => scene.asset.path).sort()
    )
    expect(serialized).toContain(`data:image/png;base64,${tinyPngBase64}`)
    expect(serialized).not.toContain("Reviewed claim")
    expect(serialized).not.toContain("Target condition")
    expect(serialized).not.toContain("Correction 1")
    expect(serialized).not.toContain("answerReceipt")
    expect(serialized).not.toContain("postcommitPath")
  })

  it("generates separate annotated and text-equivalent hazard products", () => {
    const annotatedSettings = new PrintSettings({
      ...settings("annotated-hazard-answer-packet", 1),
      includeImages: true
    })
    const annotated = generatePrintJob({
      bootstrap,
      settings: annotatedSettings,
      sceneAnswers,
      retainedAssets
    })
    const text = generatePrintJob({
      bootstrap,
      settings: settings("text-equivalent-set", 1),
      sceneAnswers,
      retainedAssets
    })

    expect(annotated.packet.sections[0]?.tag).toBe("annotated-hazard-answers")
    expect(JSON.stringify(annotated.packet)).toContain("Correction")
    expect(JSON.stringify(annotated.packet)).toContain(`data:image/png;base64,${tinyPngBase64}`)
    expect(text.packet.sections[0]?.tag).toBe("text-equivalent-scenes")
    expect(text.manifest.assets).toEqual([])
    expect(JSON.stringify(text.packet)).toContain("Equivalent statement")
    expect(JSON.stringify(text.packet)).not.toContain("data:image")
  })

  it("applies published category filters before capacity and deterministic selection", () => {
    expect(printProductFilterOptions("multiple-choice-questions", bootstrap, "profile-1")).toEqual([
      "Cleaning tools",
      "Tool selection"
    ])
    expect(printProductCapacity(
      "multiple-choice-questions",
      bootstrap,
      "profile-1",
      ["Cleaning tools"]
    )).toBe(1)
    const filtered = new PrintSettings({
      ...settings("multiple-choice-questions", 1),
      filters: ["Cleaning tools"]
    })
    const manifest = generatePrintManifest({ bootstrap, settings: filtered })
    expect(manifest.itemIds).toEqual(["q3"])
    expect(manifest.actualDistribution).toEqual([{ label: "Cleaning tools", count: 1 }])
  })

  it("prints a source-bound announcement profile exactly when the selected profile supplies it", () => {
    const sourceReference = {
      id: "source-announcement",
      label: "Civil service announcement",
      locator: "announcement page 1"
    }
    const sourceBound = new PrintBuilderBootstrap({
      ...bootstrap,
      profiles: [{
        ...bootstrap.profiles[0]!,
        announcementFactSheet: {
          schemaVersion: 1,
          version: 2,
          lastReviewedOn: "2026-08-25",
          controllingDocumentNotice: "The current controlling announcement governs.",
          seriesScopeDisclaimer: "This fact sheet applies only to the named series.",
          verifiedFacts: [{
            id: "filing-window",
            label: "Filing window",
            value: "January 2 through January 30",
            sourceReferences: [sourceReference]
          }],
          explicitUnknowns: [{
            id: "item-count",
            label: "Official item count",
            detail: "Not stated in the controlling announcement.",
            sourceReferences: [sourceReference]
          }],
          changeHistory: [{
            version: 2,
            changedOn: "2026-08-25",
            summary: "Reviewed against the current announcement.",
            sourceReferences: [sourceReference]
          }]
        }
      }]
    })

    expect(printProductAvailability(
      "announcement-profile-fact-sheet",
      sourceBound,
      "profile-1"
    )).toMatchObject({ available: true })
    const generated = generatePrintJob({
      bootstrap: sourceBound,
      settings: settings("announcement-profile-fact-sheet", 1)
    })
    expect(generated.packet.sections[0]?.tag).toBe("announcement-profile-fact-sheet")
    expect(JSON.stringify(generated.packet)).toContain("January 2 through January 30")
    expect(JSON.stringify(generated.packet)).toContain("announcement page 1")
    expect(JSON.stringify(generated.packet)).toContain("Not stated in the controlling announcement")
  })
})

describe("semantic print preview", () => {
  it("restores a self-contained historical job before and without current inventory", async () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions")
    })
    const original = new PrintJobRecord({
      id: "print-history123",
      ...generated,
      status: "preview-ready",
      updatedAt: 1
    })
    const runtime: PrintEffectRunner = {
      runPromise: <A, E>(_effect: Effect.Effect<A, E, PrintPersistence | VerifiedContent>) =>
        Promise.resolve(original as A)
    }
    const loadBootstrap = vi.fn(() => Promise.reject(new Error("Current inventory unavailable")))
    const controller = createPrintPreviewController({
      id: original.id,
      loadBootstrap,
      runtime,
      createId: () => "print-regenerate12",
      replaceLocation: () => undefined,
      openSystemPrint: () => undefined
    })
    controller.start()
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "preview-ready",
      job: { id: original.id }
    }))
    expect(loadBootstrap).not.toHaveBeenCalled()

    controller.regenerate()
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "regenerate-error",
      job: { id: original.id },
      detail: "Current inventory unavailable"
    }))
    expect(loadBootstrap).toHaveBeenCalledTimes(1)
    controller.dispose()
  })

  it("retains the old preview and refuses to replace history for a mismatched regenerated job", async () => {
    const generated = generatePrintJob({
      bootstrap,
      settings: settings("multiple-choice-questions")
    })
    const original = new PrintJobRecord({
      id: "print-original123",
      ...generated,
      status: "preview-ready",
      updatedAt: 1
    })
    const mismatched = new PrintJobRecord({
      ...original,
      id: "print-different12",
      updatedAt: 2
    })
    const values: Array<PrintJobRecord | undefined> = [original, mismatched]
    const runtime: PrintEffectRunner = {
      runPromise: <A, E>(_effect: Effect.Effect<A, E, PrintPersistence | VerifiedContent>) =>
        Promise.resolve(values.shift() as A)
    }
    const replacements: Array<string> = []
    const controller = createPrintPreviewController({
      id: original.id,
      bootstrap,
      runtime,
      createId: () => "print-regenerated1",
      replaceLocation: (path) => replacements.push(path),
      openSystemPrint: () => undefined
    })
    controller.start()
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "preview-ready",
      job: { id: original.id }
    }))
    controller.regenerate()
    await vi.waitFor(() => expect(controller.getSnapshot().state).toMatchObject({
      tag: "regenerate-error",
      job: { id: original.id },
      detail: expect.stringMatching(/different print-job identity/)
    }))
    expect(replacements).toEqual([])
    controller.dispose()
  })

  it("renders required identity and print settings without introducing a key into a question packet", () => {
    const generated = generatePrintJob({ bootstrap, settings: settings("multiple-choice-questions") })
    const job = new PrintJobRecord({
      id: "print-job-12345678",
      ...generated,
      status: "preview-ready",
      updatedAt: 1
    })
    const snapshot = {
      state: { tag: "preview-ready" as const, job },
      revision: 1,
      focusRequest: null,
      announcementRequest: null
    }
    const controller: PrintPreviewController = {
      getSnapshot: () => snapshot,
      getHydrationSnapshot: () => snapshot,
      subscribe: () => () => undefined,
      start: () => undefined,
      retryRestore: () => undefined,
      regenerate: () => undefined,
      requestSystemPrint: () => undefined,
      acknowledgeViewRequest: () => undefined,
      dispose: () => undefined
    }
    const html = renderToStaticMarkup(createElement(PrintPreview, { controller }))

    expect(html).toContain("Original practice — not an official or past exam")
    expect(html).toContain("Statewide entry-level · version 3")
    expect(html).toContain("Site-designed distribution")
    expect(html).toContain("Set pairing identifier")
    expect(html).toContain(generated.manifest.pairingFingerprint ?? "missing pairing identifier")
    expect(html).toContain("print-us-letter")
    expect(html).toContain("print-size-normal")
    expect(html).not.toContain("Answer key")
    expect(html).not.toContain("Rationale")
  })
})

describe("print workflow local closure", () => {
  it("blocks an online-but-uncached answer before any byte read or partial job save", async () => {
    let availabilityChecks = 0
    let answerReads = 0
    let saves = 0
    const verifiedContent = VerifiedContent.of({
      ensureAssetAvailable: () => Effect.die("not used"),
      ensureAvailable: (receipt) => Effect.sync(() => {
        availabilityChecks += 1
        return {
          path: receipt.postcommitPath,
          source: availabilityChecks === 1 ? "verified-cache" as const : "network-required" as const
        }
      }),
      loadAssetBlob: () => Effect.die("network asset reads are forbidden"),
      loadCachedAssetBlob: () => Effect.die("not used"),
      loadCachedJson: () => Effect.sync(() => {
        answerReads += 1
        return {}
      }),
      loadJsonArtifact: () => Effect.die("network answer reads are forbidden"),
      loadJson: () => Effect.die("network answer reads are forbidden")
    })
    const persistence = PrintPersistence.of({
      savePrintJob: () => Effect.sync(() => {
        saves += 1
        throw new Error("A partial job must not be saved")
      }),
      findPrintJob: () => Effect.die("not used"),
      markStale: () => Effect.die("not used"),
      requestSystemPrint: () => Effect.die("not used")
    })

    const failure = await Effect.runPromise(createPrintJob({
      id: "print-job-12345678",
      bootstrap,
      settings: settings("answer-key", 2)
    }).pipe(
      Effect.provideService(VerifiedContent, verifiedContent),
      Effect.provideService(PrintPersistence, persistence)
    )).catch((cause: unknown) => cause)

    expect(failure).toBeInstanceOf(PrintLocalClosureError)
    expect(availabilityChecks).toBe(2)
    expect(answerReads).toBe(0)
    expect(saves).toBe(0)
  })
})

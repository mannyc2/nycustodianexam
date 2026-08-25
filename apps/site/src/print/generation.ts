import { Schema } from "effect"
import {
  PrintJobManifest,
  PrintPacket,
  PrintSettings,
  type PrintBuilderBootstrap,
  type PrintPacketSection,
  type PrintProduct,
  type PrintProductAvailability,
  type PrintQuestionAnswer,
  type PrintRetainedAsset,
  type PrintSceneAnswer,
  type SupportedPrintProduct
} from "./model.ts"

export const printAlgorithmId = "print-v1-fnv1a32-xorshift32" as const

const unsupportedReasons = {
  "correction-change-log-excerpt": "No publishable structured correction or change-log record exists in this release."
} as const

const questionProducts = new Set<PrintProduct>([
  "blank-answer-sheet",
  "multiple-choice-questions",
  "answer-key",
  "explanations-and-sources"
])
const hazardProducts = new Set<PrintProduct>([
  "hazard-worksheet",
  "annotated-hazard-answer-packet",
  "text-equivalent-set"
])

const compatible = <A extends { readonly profileIds: ReadonlyArray<string> }>(
  values: ReadonlyArray<A>,
  profileId: string
): ReadonlyArray<A> => values.filter((value) => value.profileIds.includes(profileId))

const eligibleContrastFamilies = (
  bootstrap: PrintBuilderBootstrap,
  profileId: string
) => {
  const tools = compatible(bootstrap.tools, profileId)
  const families = new Map<string, typeof tools>()
  for (const tool of tools) {
    const family = families.get(tool.family) ?? []
    families.set(tool.family, [...family, tool])
  }
  return [...families]
    .filter(([, members]) => members.length >= 2)
    .map(([family, members]) => ({ id: family, family, members }))
}

export const printProductCapacity = (
  product: PrintProduct,
  bootstrap: PrintBuilderBootstrap,
  profileId: string,
  filters: ReadonlyArray<string> = []
): number => {
  const selected = new Set(filters)
  if (questionProducts.has(product)) {
    return compatible(bootstrap.questions, profileId)
      .filter((question) => selected.size === 0 || selected.has(question.category)).length
  }
  if (product === "tool-family-contrast-cards") {
    return eligibleContrastFamilies(bootstrap, profileId)
      .filter((family) => selected.size === 0 || selected.has(family.family)).length
  }
  if (hazardProducts.has(product)) {
    return compatible(bootstrap.scenes, profileId)
      .filter((scene) => selected.size === 0 || selected.has(scene.environment)).length
  }
  if (product === "announcement-profile-fact-sheet") {
    return bootstrap.profiles.some((profile) =>
      profile.id === profileId && profile.announcementFactSheet !== null
    ) ? 1 : 0
  }
  if (product === "correction-change-log-excerpt") return bootstrap.corrections.length
  return 0
}

export const printProductFilterOptions = (
  product: PrintProduct,
  bootstrap: PrintBuilderBootstrap,
  profileId: string
): ReadonlyArray<string> => {
  const values = questionProducts.has(product)
    ? compatible(bootstrap.questions, profileId).map((question) => question.category)
    : product === "tool-family-contrast-cards"
      ? eligibleContrastFamilies(bootstrap, profileId).map((family) => family.family)
      : hazardProducts.has(product)
        ? compatible(bootstrap.scenes, profileId).map((scene) => scene.environment)
        : []
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

export const printProductAvailability = (
  product: PrintProduct,
  bootstrap: PrintBuilderBootstrap,
  profileId: string
): PrintProductAvailability => {
  if (
    product === "announcement-profile-fact-sheet" &&
    !bootstrap.profiles.some((profile) =>
      profile.id === profileId && profile.announcementFactSheet !== null
    )
  ) {
    return {
      product,
      available: false,
      reason: "No source-bound announcement fact history is published for this profile; a generic profile summary is not substituted."
    }
  }
  if (product === "correction-change-log-excerpt" && bootstrap.corrections.length === 0) {
    return { product, available: false, reason: unsupportedReasons[product] }
  }
  const capacity = printProductCapacity(product, bootstrap, profileId)
  if (capacity === 0) {
    const reason = product === "tool-family-contrast-cards"
      ? "No reviewed profile-compatible tool family has at least two released members."
      : "No compatible validated content is available for this print product."
    return { product, available: false, reason }
  }
  if (
    (product === "answer-key" || product === "explanations-and-sources") &&
    compatible(bootstrap.questions, profileId).some((question) => question.answerReceipt === null)
  ) {
    return { product, available: false, reason: "Exact reviewed question-answer receipts are incomplete." }
  }
  return { product, available: true, reason: null }
}

const fnv1a32 = (input: string, offset = 0x811c9dc5): number => {
  let hash = offset >>> 0
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

const randomSource = (seed: number): (() => number) => {
  let state = seed === 0 ? 0x9e3779b9 : seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0x1_0000_0000
  }
}

const shuffled = <A>(values: ReadonlyArray<A>, seed: number): Array<A> => {
  const output = [...values]
  const random = randomSource(seed)
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = output[index]
    const replacement = output[target]
    if (current === undefined || replacement === undefined) continue
    output[index] = replacement
    output[target] = current
  }
  return output
}

const compareIds = (left: { readonly id: string }, right: { readonly id: string }): number =>
  left.id.localeCompare(right.id)

const selectionGroup = (product: SupportedPrintProduct): string =>
  questionProducts.has(product) ? "questions" : hazardProducts.has(product) ? "hazards" : product

const canonicalSelection = (settings: PrintSettings): string => JSON.stringify({
  profileId: settings.profileId,
  group: selectionGroup(settings.product),
  count: settings.count,
  seed: settings.seed,
  filters: [...settings.filters].sort()
})

const fingerprint = (value: string): string => {
  const left = fnv1a32(value).toString(16).padStart(8, "0")
  const right = fnv1a32(value, 0x9e3779b9).toString(16).padStart(8, "0")
  return `${left}${right}`
}

export const printOptionLabel = (index: number): string => {
  let value = index + 1
  let result = ""
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

type PrintPairingFingerprintInput = Pick<
  PrintJobManifest,
  "releaseId" | "contentVersion" | "profile" | "settings" | "questions"
>

export const computePrintPairingFingerprint = (
  manifest: PrintPairingFingerprintInput
): string | null => questionProducts.has(manifest.settings.product)
  ? fingerprint(JSON.stringify({
      algorithmId: printAlgorithmId,
      coordinateKind: "question-set-pairing-v1",
      releaseId: manifest.releaseId,
      contentVersion: manifest.contentVersion,
      profileId: manifest.profile.id,
      count: manifest.settings.count,
      seed: manifest.settings.seed,
      filters: [...manifest.settings.filters].sort(),
      questions: manifest.questions
    }))
  : null

type PrintManifestFingerprintInput = Pick<
  PrintJobManifest,
  | "schemaVersion"
  | "algorithmId"
  | "pairingFingerprint"
  | "releaseId"
  | "contentVersion"
  | "profile"
  | "settings"
  | "questions"
  | "itemIds"
  | "assets"
  | "actualLength"
  | "actualDistribution"
  | "pageCount"
>

export const computePrintManifestFingerprint = (
  manifest: PrintManifestFingerprintInput
): string => fingerprint(JSON.stringify({
  schemaVersion: manifest.schemaVersion,
  algorithmId: manifest.algorithmId,
  pairingFingerprint: manifest.pairingFingerprint,
  releaseId: manifest.releaseId,
  contentVersion: manifest.contentVersion,
  profile: manifest.profile,
  settings: manifest.settings,
  questions: manifest.questions,
  itemIds: manifest.itemIds,
  assets: manifest.assets,
  actualLength: manifest.actualLength,
  actualDistribution: manifest.actualDistribution,
  pageCount: manifest.pageCount
}))

type PrintPacketFingerprintInput = Pick<
  PrintPacket,
  "schemaVersion" | "title" | "statement" | "sections" | "warnings"
>

export const computePrintPacketFingerprint = (
  packet: PrintPacketFingerprintInput
): string => fingerprint(JSON.stringify({
  schemaVersion: packet.schemaVersion,
  title: packet.title,
  statement: packet.statement,
  sections: packet.sections,
  warnings: packet.warnings
}))

const estimateProductPageCount = (
  product: SupportedPrintProduct,
  count: number,
  large: boolean
): number => {
  const perPage = product === "blank-answer-sheet"
    ? large ? 12 : 25
    : product === "answer-key"
      ? large ? 16 : 30
      : product === "tool-family-contrast-cards"
          ? large ? 1 : 2
          : product === "hazard-worksheet" || product === "annotated-hazard-answer-packet"
            ? 1
            : large ? 2 : 4
  return Math.max(1, Math.ceil(count / perPage))
}

const estimatePageCount = (settings: PrintSettings, count: number): number => {
  const large = settings.printSize === "large"
  const primary = estimateProductPageCount(settings.product, count, large)
  if (
    settings.product !== "multiple-choice-questions" ||
    settings.answerKeyPlacement !== "new-section"
  ) return primary
  return primary +
    estimateProductPageCount("answer-key", count, large) +
    (settings.includeExplanations
      ? estimateProductPageCount("explanations-and-sources", count, large)
      : 0)
}

export interface GeneratePrintJobInput {
  readonly bootstrap: PrintBuilderBootstrap
  readonly settings: PrintSettings
  readonly answers?: ReadonlyArray<PrintQuestionAnswer>
  readonly sceneAnswers?: ReadonlyArray<PrintSceneAnswer>
  readonly retainedAssets?: ReadonlyArray<PrintRetainedAsset>
}

export interface GeneratedPrintJob {
  readonly manifest: PrintJobManifest
  readonly packet: PrintPacket
}

export class PrintGenerationError extends Error {
  override readonly name = "PrintGenerationError"
}

const sourceInventory = (
  bootstrap: PrintBuilderBootstrap,
  settings: PrintSettings
): ReadonlyArray<{ readonly id: string }> => {
  const filters = new Set(settings.filters)
  if (questionProducts.has(settings.product)) {
    return compatible(bootstrap.questions, settings.profileId)
      .filter((question) => filters.size === 0 || filters.has(question.category))
  }
  if (settings.product === "tool-family-contrast-cards") {
    return eligibleContrastFamilies(bootstrap, settings.profileId)
      .filter((family) => filters.size === 0 || filters.has(family.family))
  }
  if (hazardProducts.has(settings.product)) {
    return compatible(bootstrap.scenes, settings.profileId)
      .filter((scene) => filters.size === 0 || filters.has(scene.environment))
  }
  if (settings.product === "announcement-profile-fact-sheet") {
    return profileWithFacts(bootstrap, settings.profileId) === undefined
      ? []
      : [{ id: settings.profileId }]
  }
  if (settings.product === "correction-change-log-excerpt") return bootstrap.corrections
  return []
}

const profileWithFacts = (bootstrap: PrintBuilderBootstrap, profileId: string) =>
  bootstrap.profiles.find((candidate) =>
    candidate.id === profileId && candidate.announcementFactSheet !== null
  )

export const generatePrintManifest = ({
  bootstrap,
  settings: unsafeSettings
}: GeneratePrintJobInput): PrintJobManifest => {
  const settings = Schema.decodeUnknownSync(PrintSettings)(unsafeSettings)
  if (settings.answerKeyPlacement === "new-section" && settings.product !== "multiple-choice-questions") {
    throw new PrintGenerationError("An appended answer key applies only to a multiple-choice question packet.")
  }
  if (
    settings.includeExplanations &&
    settings.product !== "multiple-choice-questions" &&
    settings.product !== "explanations-and-sources"
  ) {
    throw new PrintGenerationError("Explanation inclusion is not valid for this print product.")
  }
  if (
    settings.product === "multiple-choice-questions" &&
    settings.answerKeyPlacement === "separate-job" &&
    settings.includeExplanations
  ) {
    throw new PrintGenerationError("Question-only jobs cannot include explanations without an appended key section.")
  }
  const profile = bootstrap.profiles.find((candidate) => candidate.id === settings.profileId)
  if (profile === undefined) throw new PrintGenerationError("The selected print profile is unavailable.")
  const availability = printProductAvailability(settings.product, bootstrap, settings.profileId)
  if (!availability.available) throw new PrintGenerationError(availability.reason ?? "Print product unavailable.")

  const inventory = sourceInventory(bootstrap, settings)
  if (settings.count < 1 || settings.count > inventory.length) {
    throw new PrintGenerationError(`Choose a count from 1 through the available inventory of ${inventory.length}.`)
  }
  const identity = `${printAlgorithmId}\n${bootstrap.releaseId}\n${bootstrap.contentVersion}\n${canonicalSelection(settings)}`
  const selected = shuffled([...inventory].sort(compareIds), fnv1a32(identity)).slice(0, settings.count)
  const itemIds = selected.map((item) => item.id)
  const selectedQuestionById = new Map(bootstrap.questions.map((question) => [question.id, question]))
  const questions = questionProducts.has(settings.product)
    ? itemIds.map((questionId) => {
        const question = selectedQuestionById.get(questionId)
        if (question === undefined) throw new PrintGenerationError("Pinned question unavailable.")
        return {
          questionId,
          optionIds: shuffled(
            [...question.options].sort(compareIds),
            fnv1a32(`${identity}\n${questionId}`)
          ).map((option) => option.id)
        }
      })
    : []
  if (
    settings.product === "multiple-choice-questions" &&
    settings.answerKeyPlacement === "new-section" &&
    itemIds.some((id) => selectedQuestionById.get(id)?.answerReceipt === null)
  ) {
    throw new PrintGenerationError("Exact reviewed question-answer receipts are incomplete for the appended key.")
  }
  const distribution = new Map<string, number>()
  for (const id of itemIds) {
    const label = settings.product === "tool-family-contrast-cards"
      ? id
      : hazardProducts.has(settings.product)
        ? bootstrap.scenes.find((scene) => scene.id === id)?.environment ?? "Hazard scene"
        : questionProducts.has(settings.product)
          ? bootstrap.questions.find((question) => question.id === id)?.category ?? "Original multiple-choice"
          : settings.product === "announcement-profile-fact-sheet"
            ? "Source-bound announcement profile"
            : "Published corrections"
    distribution.set(label, (distribution.get(label) ?? 0) + 1)
  }
  const actualDistribution = [...distribution]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({ label, count }))
  const assets = settings.includeImages
    ? settings.product === "tool-family-contrast-cards"
      ? selected.flatMap((family) =>
          eligibleContrastFamilies(bootstrap, settings.profileId)
            .find((candidate) => candidate.id === family.id)?.members.map((tool) => tool.asset) ?? []
        )
      : settings.product === "hazard-worksheet" || settings.product === "annotated-hazard-answer-packet"
        ? itemIds.flatMap((id) => {
            const scene = bootstrap.scenes.find((candidate) => candidate.id === id)
            return scene === undefined ? [] : [scene.asset]
          })
        : []
    : []
  const withoutPairingFingerprint = {
    schemaVersion: 1 as const,
    algorithmId: printAlgorithmId,
    releaseId: bootstrap.releaseId,
    contentVersion: bootstrap.contentVersion,
    profile,
    settings,
    questions,
    itemIds,
    assets,
    actualLength: itemIds.length,
    actualDistribution,
    pageCount: estimatePageCount(settings, itemIds.length)
  }
  const withoutFingerprint = {
    ...withoutPairingFingerprint,
    pairingFingerprint: computePrintPairingFingerprint(withoutPairingFingerprint)
  }
  return new PrintJobManifest({
    ...withoutFingerprint,
    fingerprint: computePrintManifestFingerprint(withoutFingerprint)
  })
}

export const generatePrintJob = (input: GeneratePrintJobInput): GeneratedPrintJob => {
  const manifest = generatePrintManifest(input)
  return {
    manifest,
    packet: makePrintPacket(
      manifest,
      input.bootstrap,
      input.answers ?? [],
      input.sceneAnswers ?? [],
      input.retainedAssets ?? []
    )
  }
}

export const makePrintPacket = (
  manifest: PrintJobManifest,
  bootstrap: PrintBuilderBootstrap,
  answers: ReadonlyArray<PrintQuestionAnswer> = [],
  sceneAnswers: ReadonlyArray<PrintSceneAnswer> = [],
  retainedAssets: ReadonlyArray<PrintRetainedAsset> = []
): PrintPacket => {
  const questionById = new Map(bootstrap.questions.map((question) => [question.id, question]))
  const answerById = new Map(answers.map((answer) => [answer.questionId, answer]))
  const sceneById = new Map(bootstrap.scenes.map((scene) => [scene.id, scene]))
  const sceneAnswerById = new Map(sceneAnswers.map((answer) => [answer.sceneId, answer]))
  const retainedByPath = new Map(retainedAssets.map((asset) => [asset.receipt.path, asset]))
  const retainedAsset = (receipt: PrintRetainedAsset["receipt"]): PrintRetainedAsset | null => {
    if (!manifest.settings.includeImages) return null
    const retained = retainedByPath.get(receipt.path)
    if (retained === undefined || JSON.stringify(retained.receipt) !== JSON.stringify(receipt)) {
      throw new PrintGenerationError("A pinned print image is not available as exact verified retained bytes.")
    }
    return retained
  }
  const orderedQuestions = manifest.questions.map((coordinate) => {
    const question = questionById.get(coordinate.questionId)
    if (question === undefined) throw new PrintGenerationError("Pinned question unavailable.")
    return {
      question,
      options: coordinate.optionIds.map((optionId) => {
        const option = question.options.find((candidate) => candidate.id === optionId)
        if (option === undefined) throw new PrintGenerationError("Pinned option unavailable.")
        return option
      })
    }
  })
  const answerKeySection = (): PrintPacketSection => ({
    tag: "answer-key",
    answers: orderedQuestions.map(({ question, options }, index) => {
      const answer = answerById.get(question.id)
      if (answer === undefined) throw new PrintGenerationError("Reviewed answer material is unavailable.")
      const answerIndex = options.findIndex((option) => option.id === answer.correctOptionId)
      if (answerIndex < 0) throw new PrintGenerationError("Reviewed answer is outside option closure.")
      return { number: index + 1, optionLabel: printOptionLabel(answerIndex) }
    })
  })
  const explanationSection = (): PrintPacketSection => ({
    tag: "explanations",
    explanations: orderedQuestions.map(({ question, options }, index) => {
      const answer = answerById.get(question.id)
      if (answer === undefined) throw new PrintGenerationError("Reviewed explanation material is unavailable.")
      const answerIndex = options.findIndex((option) => option.id === answer.correctOptionId)
      if (answerIndex < 0) throw new PrintGenerationError("Reviewed answer is outside option closure.")
      return {
        number: index + 1,
        correctOptionLabel: printOptionLabel(answerIndex),
        rationales: options.map((option, optionIndex) => {
          const rationale = answer.rationales.find((candidate) => candidate.optionId === option.id)
          if (rationale === undefined) throw new PrintGenerationError("Reviewed rationale unavailable.")
          return { optionLabel: printOptionLabel(optionIndex), message: rationale.message }
        }),
        sources: manifest.settings.includeSources ? answer.sources : []
      }
    })
  })
  let section: PrintPacketSection
  const appendedSections: Array<PrintPacketSection> = []
  let title: string
  switch (manifest.settings.product) {
    case "blank-answer-sheet": {
      const maximumOptions = Math.max(...orderedQuestions.map(({ options }) => options.length))
      section = {
        tag: "answer-sheet",
        questionNumbers: orderedQuestions.map((_, index) => index + 1),
        optionLabels: Array.from({ length: maximumOptions }, (_, index) => printOptionLabel(index))
      }
      title = "Blank answer sheet"
      break
    }
    case "multiple-choice-questions":
      section = {
        tag: "questions",
        questions: orderedQuestions.map(({ question, options }, index) => ({
          number: index + 1,
          id: question.id,
          prompt: question.prompt,
          options: options.map((option, optionIndex) => ({
            id: option.id,
            label: printOptionLabel(optionIndex),
            text: option.label
          }))
        }))
      }
      if (manifest.settings.answerKeyPlacement === "new-section") {
        appendedSections.push(answerKeySection())
        if (manifest.settings.includeExplanations) appendedSections.push(explanationSection())
      }
      title = "Original multiple-choice practice"
      break
    case "answer-key":
      section = answerKeySection()
      title = "Answer key"
      break
    case "explanations-and-sources":
      section = explanationSection()
      title = "Explanations and source references"
      break
    case "tool-family-contrast-cards": {
      const familyValues = manifest.itemIds.map((family) => {
        const tools = compatible(bootstrap.tools, manifest.profile.id)
          .filter((tool) => tool.family === family)
          .sort(compareIds)
        if (tools.length < 2) throw new PrintGenerationError("Pinned contrast family is incomplete.")
        const values = tools.map((tool) => ({
          id: tool.id,
          canonicalTerm: tool.canonicalTerm,
          useSummary: tool.useSummary,
          distinguishingFeatures: tool.distinguishingFeatures,
          neutralDescription: tool.neutralDescription,
          asset: retainedAsset(tool.asset)
        }))
        const firstTool = values[0]
        const secondTool = values[1]
        if (firstTool === undefined || secondTool === undefined) {
          throw new PrintGenerationError("Contrast family requires at least two tools.")
        }
        return { family, tools: [firstTool, secondTool, ...values.slice(2)] as const }
      })
      const firstFamily = familyValues[0]
      if (firstFamily === undefined) throw new PrintGenerationError("Tool-family packet cannot be empty.")
      section = {
        tag: "tool-family-cards",
        families: [firstFamily, ...familyValues.slice(1)]
      }
      title = "Tool-family contrast cards"
      break
    }
    case "hazard-worksheet": {
      const scenes = manifest.itemIds.map((id) => {
        const scene = sceneById.get(id)
        if (scene === undefined) throw new PrintGenerationError("Pinned hazard scene unavailable.")
        return {
          id: scene.id,
          environment: scene.environment,
          neutralOverview: scene.neutralOverview,
          neutralZones: scene.neutralZones,
          asset: retainedAsset(scene.asset)
        }
      })
      const first = scenes[0]
      if (first === undefined) throw new PrintGenerationError("Hazard worksheet cannot be empty.")
      section = { tag: "hazard-worksheet", scenes: [first, ...scenes.slice(1)] }
      title = "Blank hazard worksheet"
      break
    }
    case "annotated-hazard-answer-packet": {
      const scenes = manifest.itemIds.map((id) => {
        const scene = sceneById.get(id)
        const answer = sceneAnswerById.get(id)
        if (scene === undefined || answer === undefined) throw new PrintGenerationError("Reviewed hazard answer unavailable.")
        return {
          id,
          environment: scene.environment,
          asset: retainedAsset(scene.asset),
          answer: {
            ...answer,
            sourceReferences: manifest.settings.includeSources ? answer.sourceReferences : []
          }
        }
      })
      const first = scenes[0]
      if (first === undefined) throw new PrintGenerationError("Hazard answer packet cannot be empty.")
      section = { tag: "annotated-hazard-answers", scenes: [first, ...scenes.slice(1)] }
      title = "Annotated hazard-answer packet"
      break
    }
    case "text-equivalent-set": {
      const scenes = manifest.itemIds.map((id) => {
        const scene = sceneById.get(id)
        const answer = sceneAnswerById.get(id)
        if (scene === undefined || answer === undefined) throw new PrintGenerationError("Reviewed nonvisual equivalent unavailable.")
        return {
          id,
          environment: scene.environment,
          answer: {
            ...answer,
            sourceReferences: manifest.settings.includeSources ? answer.sourceReferences : []
          }
        }
      })
      const first = scenes[0]
      if (first === undefined) throw new PrintGenerationError("Text-equivalent set cannot be empty.")
      section = { tag: "text-equivalent-scenes", scenes: [first, ...scenes.slice(1)] }
      title = "Text-equivalent hazard set"
      break
    }
    case "announcement-profile-fact-sheet": {
      const selectedProfile = profileWithFacts(bootstrap, manifest.profile.id)
      if (selectedProfile?.announcementFactSheet === null || selectedProfile === undefined) {
        throw new PrintGenerationError("Source-bound announcement facts are unavailable.")
      }
      section = {
        tag: "announcement-profile-fact-sheet",
        profileLabel: selectedProfile.label,
        jurisdiction: selectedProfile.jurisdiction,
        factSheet: selectedProfile.announcementFactSheet
      }
      title = "Announcement-profile fact sheet"
      break
    }
    case "correction-change-log-excerpt": {
      const correctionById = new Map(bootstrap.corrections.map((correction) => [correction.id, correction]))
      const corrections = manifest.itemIds.map((id) => {
        const correction = correctionById.get(id)
        if (correction === undefined) throw new PrintGenerationError("Pinned correction record unavailable.")
        return correction
      })
      const first = corrections[0]
      if (first === undefined) throw new PrintGenerationError("Correction excerpt cannot be empty.")
      section = { tag: "correction-change-log-excerpt", corrections: [first, ...corrections.slice(1)] }
      title = "Correction and change-log excerpt"
      break
    }
  }

  const withoutFingerprint = {
    schemaVersion: 1,
    title,
    statement: "Original practice — not an official or past exam",
    sections: [section, ...appendedSections],
    warnings: [
      "The page count is a deterministic layout estimate. Inspect browser print preview for clipping and page breaks before printing.",
      ...(manifest.settings.grayscalePreview
        ? ["Grayscale preview is active. Confirm every border, label, and distinction remains readable before printing."]
        : [])
    ]
  } as const
  return new PrintPacket({
    ...withoutFingerprint,
    fingerprint: computePrintPacketFingerprint(withoutFingerprint)
  })
}

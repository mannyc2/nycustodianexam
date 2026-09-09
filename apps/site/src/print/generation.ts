import { computePrintManifestFingerprint, computePrintPacketFingerprint, computePrintPairingFingerprint, printOptionLabel, printAlgorithmId, questionProducts, fnv1a32 } from "./identity.ts"
export { computePrintManifestFingerprint, computePrintPacketFingerprint, computePrintPairingFingerprint, printOptionLabel, printAlgorithmId } from "./identity.ts"
import { Schema } from "effect"
import {
  PrintJobManifest,
  PrintPacketV3,
  PrintSettings,
  type PrintBuilderBootstrap,
  type PrintPacketSectionV3,
  type PrintProduct,
  type PrintProductAvailability,
  type PrintQuestionAnswer,
  type ReleasedPrintPacket,
  type ReleasedPrintPacketSection,
  type PrintRetainedAsset,
  type PrintSceneAnswerV2,
  type SupportedPrintProduct
} from "./model.ts"
import { questionCategoryFromSafeMetadata } from "../question-category.ts"

const printQuestionCategory = (
  question: PrintBuilderBootstrap["questions"][number]
): string => questionCategoryFromSafeMetadata(question)

const unsupportedReasons = {
  "correction-change-log-excerpt": "No publishable structured correction or change-log record exists in this release."
} as const

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
    .map(([family, members]) => ({
      id: family,
      family,
      members: [...members].sort(compareIds)
    }))
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
      .filter((question) => selected.size === 0 || selected.has(printQuestionCategory(question))).length
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
    ? compatible(bootstrap.questions, profileId).map(printQuestionCategory)
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
      reason: "No reviewed announcement fact history is available for this profile; a generic profile summary is not substituted."
    }
  }
  if (product === "correction-change-log-excerpt" && bootstrap.corrections.length === 0) {
    return { product, available: false, reason: unsupportedReasons[product] }
  }
  const capacity = printProductCapacity(product, bootstrap, profileId)
  if (capacity === 0) {
    const reason = product === "tool-family-contrast-cards"
      ? "No reviewed tool family with at least two entries is available for this profile."
      : "No reviewed content for this profile is available for this print product."
    return { product, available: false, reason }
  }
  if (
    (product === "answer-key" || product === "explanations-and-sources") &&
    compatible(bootstrap.questions, profileId).some((question) => question.answerReceipt === null)
  ) {
    return { product, available: false, reason: "The reviewed answers and explanations needed for this product are unavailable." }
  }
  return { product, available: true, reason: null }
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
  readonly sceneAnswers?: ReadonlyArray<PrintSceneAnswerV2>
  readonly retainedAssets?: ReadonlyArray<PrintRetainedAsset>
}

export interface GeneratedPrintJob {
  readonly manifest: PrintJobManifest
  readonly packet: ReleasedPrintPacket
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
      .filter((question) => filters.size === 0 || filters.has(printQuestionCategory(question)))
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
  if (settings.questionPresentation !== undefined && settings.product !== "multiple-choice-questions") {
    throw new PrintGenerationError("Nonvisual question presentation applies only to a multiple-choice question packet.")
  }
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
  if (settings.questionPresentation === "nonvisual" && itemIds.some(id => {
    const illustration = bootstrap.questions.find(question => question.id === id)?.illustration
    return illustration !== undefined && illustration.nonvisualEquivalent === undefined
  })) throw new PrintGenerationError("A selected illustrated question has no authored nonvisual version. Choose illustrated output or another question set.")
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
          ? (() => {
              const question = bootstrap.questions.find((candidate) => candidate.id === id)
              return question === undefined
                ? "Original multiple-choice"
                : printQuestionCategory(question)
            })()
          : settings.product === "announcement-profile-fact-sheet"
            ? "Source-bound announcement profile"
            : "Published corrections"
    distribution.set(label, (distribution.get(label) ?? 0) + 1)
  }
  const actualDistribution = [...distribution]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({ label, count }))
  const assets = settings.product === "multiple-choice-questions"
    ? itemIds.flatMap(id => {
        const image = bootstrap.questions.find(question => question.id === id)?.illustration
        return image === undefined || settings.questionPresentation === "nonvisual" ? [] : [image.asset]
      })
    : settings.includeImages
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
  // A selected tool item is a whole family, but pagination counts its cards.
  const estimatedItemCount = settings.product === "tool-family-contrast-cards"
    ? eligibleContrastFamilies(bootstrap, settings.profileId)
      .filter((family) => itemIds.includes(family.id))
      .reduce((count, family) => count + family.members.length, 0)
    : itemIds.length
  const withoutPairingFingerprint = {
    schemaVersion: 3 as const,
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
    pageCount: estimatePageCount(settings, estimatedItemCount) +
      (settings.product === "tool-family-contrast-cards" ? 1 : 0)
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

// Approximate block layout in points using the print stylesheet's type sizes,
// 3.5-inch required images, spacing, and paper margins. Text wrapping uses an
// average glyph width; browser preview remains authoritative for pagination.
const estimateQuestionPages = (
  settings: PrintSettings,
  questions: Extract<ReleasedPrintPacketSection, { readonly tag: "questions" }>["questions"]
): number => {
  const large = settings.printSize === "large"
  const margin = settings.margin === "wide" ? 54 : 36
  const height = (settings.paper === "a4" ? 841.89 : 792) - margin * 2
  const width = (settings.paper === "a4" ? 595.28 : 612) - margin * 2 - 36
  const font = large ? 18 : 12
  const lineHeight = font * (large ? 1.55 : 1.5)
  const lines = (text: string) => Math.max(1, Math.ceil(text.length / (width / (font * 0.5))))
  const heading = large ? 44 : 36
  // Large metadata fills the opening sheet; normal metadata shares it with
  // short questions. These allowances include release and pairing details.
  let used = (large ? height : 450) + heading
  let pages = 1
  for (const [index, question] of questions.entries()) {
    const observations = question.observations ?? []
    // The facts use a single label line, 0.75rem list margins and 0.5rem
    // between facts; those fixed spaces do not grow to full large-print lines.
    const observationLines = observations.length === 0 ? 0 :
      1 + observations.reduce((total, fact) => total + lines(fact), 0)
    const observationSpacing = observations.length === 0 ? 0 :
      18 + Math.max(0, observations.length - 1) * 6
    const textLines = lines(question.prompt) + observationLines +
      question.options.reduce((total, option) => total + lines(option.text), 0)
    const block = textLines * lineHeight + observationSpacing + Math.max(0, question.options.length - 1) * 9 + 25.5 +
      (question.illustration === undefined ? 0 : 252 + 24)
    const gap = index === 0 ? 0 : 9
    if (used + gap + block > height) {
      pages += 1
      used = index === 0 ? heading : 0
    } else used += gap
    used += block
    while (used > height) { pages += 1; used -= height }
  }
  return pages
}

// Table estimates include the opening metadata, repeated column headings, cell
// padding and large-print label wrapping. Keep rows whole, as in the print CSS.
const estimateTablePages = (
  settings: PrintSettings,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "answer-sheet" | "answer-key" }>,
  standalone = true
): number => {
  const large = settings.printSize === "large"
  const margin = settings.margin === "wide" ? 54 : 36
  const height = (settings.paper === "a4" ? 841.89 : 792) - margin * 2
  const lineHeight = large ? 27.9 : 18
  const paddingAndBorder = 12.75
  // Answer-sheet labels can wrap in their five-column table. Reserving two
  // lines at large size is conservative for the shorter single-digit labels.
  const header = lineHeight * (large && section.tag === "answer-sheet" ? 2 : 1) + paddingAndBorder
  const row = section.tag === "answer-sheet"
    ? large ? lineHeight * 2 + paddingAndBorder : 21 + paddingAndBorder
    : lineHeight + paddingAndBorder
  const count = section.tag === "answer-sheet" ? section.questionNumbers.length : section.answers.length
  let pages = 1
  let used = (standalone ? large ? height : 450 : 0) + (large ? 44 : 36) + header
  for (let index = 0; index < count; index += 1) {
    if (used + row > height) {
      pages += 1
      used = header + (index === 0 ? large ? 44 : 36 : 0)
    }
    used += row
  }
  return pages
}

const estimateProsePages = (
  settings: PrintSettings,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "explanations" | "announcement-profile-fact-sheet" }>,
  standalone = true
): number => {
  const large = settings.printSize === "large"
  const margin = settings.margin === "wide" ? 54 : 36
  const height = (settings.paper === "a4" ? 841.89 : 792) - margin * 2
  const width = (settings.paper === "a4" ? 595.28 : 612) - margin * 2 - 60
  const font = large ? 18 : 12
  const line = font * (large ? 1.55 : 1.5)
  const paragraph = (text: string) => Math.max(1, Math.ceil(text.length / (width / (font * 0.5)))) * line + 12
  const sourceHeight = (source: {
    readonly publisher: string; readonly title: string; readonly excerpt: string
    readonly verifiedOn: string; readonly locator: string; readonly id: string
    readonly sourceId: string; readonly version: string; readonly url?: string
    readonly rightsNotes?: string
  }, includeRights = false) => paragraph(`${source.publisher} — ${source.title} (verified ${source.verifiedOn})`) +
    paragraph("Evidence: official evidence") + paragraph(source.excerpt) +
    (!includeRights || source.rightsNotes === undefined ? 0 : paragraph(`Language: English. Rights: ${source.rightsNotes}.`)) +
    (source.url === undefined ? 0 : paragraph(`Open the source (${source.url})`)) +
    // Technical receipts print even when their screen disclosure is closed.
    ["Source version", source.version, "Locator", source.locator,
      "Source line ID", source.id, "Source record ID", source.sourceId].reduce((sum, text) => sum + paragraph(text), 0)
  let points = (standalone ? large ? height : 450 : 0) + (large ? 44 : 36)
  if (section.tag === "explanations") {
    for (const explanation of section.explanations) {
      points += paragraph(`Question ${explanation.number}: choice ${explanation.correctOptionLabel}`)
      for (const rationale of explanation.rationales) points += paragraph(`Choice ${rationale.optionLabel}`) + paragraph(rationale.message)
      if ("claims" in explanation) {
        points += paragraph("Supported claims")
        for (const claim of explanation.claims) points += paragraph(`${claim.text} Evidence: ${claim.evidenceTier}. ${claim.caveat ?? ""}`)
      }
      if (explanation.sources.length > 0) points += paragraph("Where this comes from")
      for (const source of explanation.sources) points += "title" in source
        ? sourceHeight(source) : paragraph(`${source.label} — ${source.locator}`)
    }
  } else {
    const sheet = section.factSheet
    if (sheet.schemaVersion !== 2) return 1
    const sources = new Map(sheet.sourceLines.map(source => [source.id, source]))
    const receipts = (ids: ReadonlyArray<string>) => ids.reduce((total, id) => {
      const source = sources.get(id)
      return total + (source === undefined ? paragraph("Source information is unavailable.") : sourceHeight(source, true))
    }, 0)
    points += [section.profileLabel, section.jurisdiction, sheet.lastReviewedOn,
      `Fact-sheet version ${sheet.version}`, sheet.controllingDocumentNotice,
      sheet.seriesScopeDisclaimer, "Facts by explicit publication state"].reduce((sum, text) => sum + paragraph(text), 0)
    for (const fact of sheet.facts) {
      points += paragraph(fact.label) + paragraph(`Status: ${fact.state}. Category: ${fact.category}.`) +
        (fact.value === null ? 0 : paragraph(`Recorded value: ${fact.value}`)) +
        (fact.detail === null ? 0 : paragraph(`Detail: ${fact.detail}`)) +
        paragraph(`Applies to exam numbers: ${fact.appliesToExamNumbers.join(", ")}. Reviewed: ${fact.reviewedOn}.`) +
        paragraph(`Effective interval: ${fact.effectiveFrom ?? "none asserted"} through ${fact.effectiveThrough ?? "current"}.`) +
        (fact.supersededByFactId === null ? 0 : paragraph(`Superseded by fact: ${fact.supersededByFactId}`))
      for (const candidate of fact.conflictingValues) points += paragraph(candidate.value) + receipts(candidate.sourceLineIds)
      if (fact.sourceLineIds.length > 0) points += paragraph("Where this fact comes from") + receipts(fact.sourceLineIds)
    }
    points += paragraph("Change history")
    for (const change of sheet.changeHistory) points += paragraph(`Version ${change.version}, ${change.changedOn}: ${change.summary}`) + receipts(change.sourceLineIds)
  }
  return Math.max(1, Math.ceil(points / height))
}

// Estimate assembled questions and hazards, including required images and source text.
// This is not browser pagination: fonts and fragmentation can change the result.
export const finalizePrintJob = (
  manifest: PrintJobManifest,
  packet: PrintPacketV3
): GeneratedPrintJob => {
  const section = packet.sections[0]
  const large = manifest.settings.printSize === "large"
  const capacity = (large ? 1000 : 2400) * (manifest.settings.margin === "wide" ? 0.85 : 1)
  let pages = 1 // Metadata precedes hazard content on its own sheet.
  if (section?.tag === "questions") {
    pages = estimateQuestionPages(manifest.settings, section.questions) +
      estimatePageCount(manifest.settings, section.questions.length) -
      estimateProductPageCount("multiple-choice-questions", section.questions.length, large)
    const appendedKey = packet.sections.find(candidate => candidate.tag === "answer-key")
    if (appendedKey?.tag === "answer-key") {
      pages += estimateTablePages(manifest.settings, appendedKey, false) -
        estimateProductPageCount("answer-key", section.questions.length, large)
    }
    const appendedExplanations = packet.sections.find(candidate => candidate.tag === "explanations")
    if (appendedExplanations?.tag === "explanations") {
      pages += estimateProsePages(manifest.settings, appendedExplanations, false) -
        estimateProductPageCount("explanations-and-sources", section.questions.length, large)
    }
  } else if (section?.tag === "answer-sheet" || section?.tag === "answer-key") {
    pages = estimateTablePages(manifest.settings, section)
  } else if (section?.tag === "explanations" || section?.tag === "announcement-profile-fact-sheet") {
    pages = estimateProsePages(manifest.settings, section)
  } else if (section?.tag === "hazard-worksheet") {
    pages += section.scenes.length * (large ? 2 : 1)
  } else if (section?.tag === "annotated-hazard-answers" || section?.tag === "text-equivalent-scenes") {
    for (const scene of section.scenes) {
      const answer = scene.answer
      if (!("schemaVersion" in answer)) return { manifest, packet }
      const claims = new Map(answer.claims.map(claim => [claim.id, claim.text]))
      const feedback = [
        ...answer.targets.flatMap(target => [target.observableCondition,
          claims.get(target.whyUnsafeClaimId), claims.get(target.likelyConsequenceClaimId),
          claims.get(target.immediateCorrectionClaimId)]),
        ...answer.decoys.flatMap(decoy => [decoy.observableCondition, decoy.suspiciousBecause,
          claims.get(decoy.safeAsDepictedClaimId), claims.get(decoy.unsafeIfClaimId)]),
        ...answer.safeBackground.map(detail => detail.observableCondition),
        ...answer.claims.map(claim => claim.text + (claim.caveat ?? ""))
      ].join(" ")
      const imagePage = section.tag === "annotated-hazard-answers" && "asset" in scene && scene.asset !== null ? 1 : 0
      pages += imagePage + Math.max(1, Math.ceil((feedback.length + 400) / capacity))
      if (manifest.settings.includeSources) {
        // Each source has a heading, excerpt, scope, URL and technical receipt;
        // keep it together when it fits, as the print stylesheet does.
        pages += Math.ceil(answer.sources.reduce((total, source) =>
          total + Math.max(large ? 1 : 0.5,
            Object.values(source).filter(value => typeof value === "string").join(" ").length / capacity), 0))
      }
    }
  } else return { manifest, packet }
  const updated = { ...manifest, pageCount: pages }
  return { manifest: new PrintJobManifest({ ...updated, fingerprint: computePrintManifestFingerprint(updated) }), packet }
}

export const generatePrintJob = (input: GeneratePrintJobInput): GeneratedPrintJob => {
  const manifest = generatePrintManifest(input)
  return finalizePrintJob(manifest, makePrintPacket(
      manifest,
      input.bootstrap,
      input.answers ?? [],
      input.sceneAnswers ?? [],
      input.retainedAssets ?? []
    ))
}

export const makePrintPacket = (
  manifest: PrintJobManifest,
  bootstrap: PrintBuilderBootstrap,
  answers: ReadonlyArray<PrintQuestionAnswer> = [],
  sceneAnswers: ReadonlyArray<PrintSceneAnswerV2> = [],
  retainedAssets: ReadonlyArray<PrintRetainedAsset> = []
): PrintPacketV3 => {
  const questionById = new Map(bootstrap.questions.map((question) => [question.id, question]))
  const answerById = new Map(answers.map((answer) => [answer.questionId, answer]))
  const sceneById = new Map(bootstrap.scenes.map((scene) => [scene.id, scene]))
  const sceneAnswerById = new Map(sceneAnswers.map((answer) => [answer.opaqueAssetId, answer]))
  const retainedByPath = new Map(retainedAssets.map((asset) => [asset.receipt.path, asset]))
  const retainedAsset = (receipt: PrintRetainedAsset["receipt"]): PrintRetainedAsset | null => {
    if (!manifest.settings.includeImages && manifest.settings.product !== "multiple-choice-questions") return null
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
  const answerKeySection = (): PrintPacketSectionV3 => ({
    tag: "answer-key",
    answers: orderedQuestions.map(({ question, options }, index) => {
      const answer = answerById.get(question.id)
      if (answer === undefined) throw new PrintGenerationError("Reviewed answer material is unavailable.")
      const answerIndex = options.findIndex((option) => option.id === answer.correctOptionId)
      if (answerIndex < 0) throw new PrintGenerationError("Reviewed answer is outside option closure.")
      return { number: index + 1, optionLabel: printOptionLabel(answerIndex) }
    })
  })
  const explanationSection = (): PrintPacketSectionV3 => ({
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
          return {
            optionLabel: printOptionLabel(optionIndex),
            message: rationale.message,
            claimIds: rationale.claimIds
          }
        }),
        claims: answer.claims,
        sources: manifest.settings.includeSources ? answer.sources : []
      }
    })
  })
  let section: PrintPacketSectionV3
  const appendedSections: Array<PrintPacketSectionV3> = []
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
          prompt: manifest.settings.questionPresentation === "nonvisual"
            ? question.illustration?.nonvisualEquivalent?.prompt ?? question.prompt : question.prompt,
          ...(question.illustration === undefined ? {} : manifest.settings.questionPresentation === "nonvisual" ? {
            observations: question.illustration.nonvisualEquivalent!.observations
          } : { illustration: {
            neutralDescription: question.illustration.neutralDescription,
            asset: retainedAsset(question.illustration.asset)!
          } }),
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
      title = manifest.settings.questionPresentation === "nonvisual" ? "Original multiple-choice practice — nonvisual" : "Original multiple-choice practice"
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
        const members = eligibleContrastFamilies(bootstrap, manifest.profile.id)
          .find((candidate) => candidate.id === family)?.members
        if (members === undefined) {
          throw new PrintGenerationError("Pinned contrast family is incomplete.")
        }
        const values = members.map((tool) => ({
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
          answer
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
          answer
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
    schemaVersion: 3,
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
  return new PrintPacketV3({
    ...withoutFingerprint,
    fingerprint: computePrintPacketFingerprint(withoutFingerprint)
  })
}

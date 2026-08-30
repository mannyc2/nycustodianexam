import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import {
  applicationQuestions,
  comparisonQuestions,
  launchProfiles,
  nassauEvidence,
  nassauSources,
  statewideEvidence,
  statewideSources,
  toolFacts
} from "./launch-v1.curated.mjs"
import { questionReviews } from "./launch-v1.reviews.mjs"
import { optionPermutations } from "./launch-v1.option-order.mjs"

const repositoryRoot = new URL("../../../", import.meta.url)
const packUrl = new URL("content/authoring/packs/launch-v1.json", repositoryRoot)

const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, repositoryRoot), "utf8"))

const inventoryTools = await readJson("content/authoring/visuals/inventory/tools.json")
const acceptedTools = await readJson("content/authoring/visuals/releases/tools.json")
const acceptedComparisons = await readJson(
  "content/authoring/visuals/releases/comparisons.json"
)
const acceptedScenes = await readJson("content/authoring/visuals/releases/scenes.json")
const toolBriefs = [
  ...await readJson("content/authoring/visuals/briefs/tools/pilot.json"),
  ...await readJson("content/authoring/visuals/briefs/tools/remaining.json")
]

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const unique = (values) => [...new Set(values)]
const opaqueOrdinal = (prefix, index, width = 3) =>
  `${prefix}${String(index + 1).padStart(width, "0")}`

const inventoryById = new Map(inventoryTools.map((tool) => [tool.id, tool]))
const releaseById = new Map(acceptedTools.map((tool) => [tool.conceptId, tool]))
const briefById = new Map(toolBriefs.map((brief) => [brief.conceptId, brief]))
const factById = new Map(toolFacts.map((tool) => [tool.id, tool]))
const comparisonById = new Map(acceptedComparisons.map((entry) => [entry.id, entry]))

assert(inventoryTools.length === 65, "launch atlas requires exactly 65 inventory tools")
assert(acceptedTools.length === 65, "launch atlas requires exactly 65 accepted tool releases")
assert(toolBriefs.length === 65, "reviewed briefs must cover exactly 65 tools")
assert(toolFacts.length === 65, "curated facts must cover exactly 65 tools")
assert(factById.size === 65 && briefById.size === 65, "tool ids must be unique")
assert(
  inventoryTools.every((tool) =>
    factById.has(tool.id) && releaseById.has(tool.id) && briefById.has(tool.id)
  ),
  "facts, briefs, and accepted releases must close over the tool inventory"
)
assert(acceptedComparisons.length === 14, "launch atlas requires 14 accepted comparisons")
assert(acceptedScenes.length === 18, "launch pack requires 18 accepted scenes")
assert(applicationQuestions.length === 12, "launch requires 12 explicit safety applications")

const source = (id, title, publisher, evidenceTier, version, locator, scope, rightsNotes, url) => ({
  id,
  title,
  publisher,
  evidenceTier,
  version,
  locator,
  scope,
  rightsNotes,
  ...(url === undefined ? {} : { url })
})

const sources = [
  ...statewideSources,
  source(
    "scope.entry-level",
    "Entry-level custodians and janitors content scope",
    "NY Custodian Exam editorial project",
    "maintained-editorial-synthesis",
    "launch-v1 pack version 3",
    "docs/SCOPE.md#official-blueprint",
    "Defines the supported three-domain series and prohibits official-weighting claims.",
    "Repository-authored educational synthesis; no third-party text is republished."
  ),
  source(
    "editorial.tool-facts",
    "Reviewed launch tool facts and question blueprints",
    "NY Custodian Exam editorial project",
    "maintained-editorial-synthesis",
    "launch-v1 reviewed 2026-08-25",
    "content/authoring/packs/launch-v1.curated.mjs#toolFacts",
    "Exact use summaries, recognition cues, prompts, and distractor choices for the accepted atlas.",
    "Repository-authored educational synthesis."
  ),
  source(
    "visual.tool-briefs",
    "Reviewed tool illustration briefs",
    "NY Custodian Exam visual editorial project",
    "maintained-editorial-synthesis",
    "brief versions recorded per concept",
    "content/authoring/visuals/briefs/tools/",
    "Exact must-show recognition cues used to commission each original illustration.",
    "Repository-authored briefs; linked third-party references are not reproduced."
  ),
  source(
    "visual.tool-release",
    "Accepted tool visual release ledger",
    "NY Custodian Exam release process",
    "accepted-release-record",
    "accepted release 2026-08-23",
    "content/authoring/visuals/releases/tools.json",
    "Hash-bound accepted assets, derivative checks, and independent visual-review outcomes.",
    "Repository release metadata for original project assets."
  ),
  source(
    "visual.comparison-release",
    "Accepted comparison visual release ledger",
    "NY Custodian Exam release process",
    "accepted-release-record",
    "accepted release 2026-08-23",
    "content/authoring/visuals/releases/comparisons.json",
    "Accepted member sets, decisive distinctions, scored-use gates, and hash-bound assets.",
    "Repository release metadata for original project assets."
  ),
  ...nassauSources,
  source(
    "osha.portable-ladder-quickcard",
    "Portable Ladder Safety QuickCard",
    "Occupational Safety and Health Administration",
    "official-primary",
    "OSHA 3246 (2005); PDF footer OSHA 3246-10N-05",
    "Portable Ladder Safety QuickCard guidance bullets",
    "Portable-ladder inspection, climbing, positioning, and self-supporting configuration.",
    "U.S. government safety publication; short excerpts retained for offline citation.",
    "https://www.osha.gov/sites/default/files/publications/portable_ladder_qc.pdf"
  ),
  source(
    "osha.ladder-general-industry",
    "29 CFR 1910.23 Ladders",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1910.23(c)(8)",
    "General-industry stepladder cap and top-step requirement.",
    "U.S. government regulation; short excerpts retained for offline citation.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.23"
  ),
  source(
    "osha.ladder-construction",
    "29 CFR 1926.1053 Ladders — construction",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1926.1053",
    "Construction-industry ladder-clearance requirement used as specific safety evidence.",
    "U.S. government regulation; construction scope is preserved in the source and claim caveat.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1053"
  ),
  source(
    "osha.ppe-general",
    "29 CFR 1910.132 General requirements — PPE",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1910.132",
    "Hazard assessment, PPE selection, and damaged-PPE prohibition.",
    "U.S. government regulation; short excerpts retained for offline citation.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.132"
  ),
  source(
    "osha.eye-face-protection",
    "29 CFR 1910.133 Eye and face protection",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1910.133(a)(2)",
    "General-industry side protection where flying objects are a hazard.",
    "U.S. government regulation; short excerpts retained for offline citation.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.133"
  ),
  source(
    "osha.walking-working-surfaces",
    "29 CFR 1910.22 General requirements — walking-working surfaces",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1910.22",
    "Clean, orderly, and to-the-extent-feasible dry walking-working surfaces.",
    "U.S. government regulation; short excerpts retained for offline citation.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.22"
  ),
  source(
    "osha.hand-tools",
    "29 CFR 1926.301 Hand tools — construction",
    "Occupational Safety and Health Administration",
    "official-primary",
    "e-CFR-linked OSHA page accessed 2026-08-25",
    "29 CFR 1926.301(b)",
    "Construction-industry prohibition on using wrenches whose sprung jaws slip.",
    "U.S. government regulation; construction scope is preserved in the source and claim caveat.",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.301"
  )
]

const sourceLines = []
const claims = []
const addSingleLineClaim = ({ claimId, text, lineId, sourceId, locator, excerpt, evidenceTier, caveat = null }) => {
  sourceLines.push({
    id: lineId,
    sourceId,
    locator,
    excerpt,
    language: "en",
    verifiedOn: "2026-08-25",
    supportedClaimIds: [claimId]
  })
  claims.push({ id: claimId, text, sourceLineIds: [lineId], evidenceTier, caveat })
}

const toolClaimIds = new Map()
for (const [index, inventory] of inventoryTools.entries()) {
  const fact = factById.get(inventory.id)
  const brief = briefById.get(inventory.id)
  const release = releaseById.get(inventory.id)
  const suffix = release.opaqueAssetId
  const useClaimId = `claim.use.${suffix}`
  const featureClaimId = `claim.feature.${suffix}`
  const useLineId = `line.use.${suffix}`
  const featureFactLineId = `line.feature-fact.${suffix}`
  const featureBriefLineId = `line.feature-brief.${suffix}`
  const featureReleaseLineId = `line.feature-release.${suffix}`
  addSingleLineClaim({
    claimId: useClaimId,
    text: fact.useSummary,
    lineId: useLineId,
    sourceId: "editorial.tool-facts",
    locator: `toolFacts[${index}].useSummary (${inventory.id})`,
    excerpt: fact.useSummary,
    evidenceTier: "maintained-editorial-synthesis"
  })
  sourceLines.push(
    {
      id: featureFactLineId,
      sourceId: "editorial.tool-facts",
      locator: `toolFacts[${index}].features (${inventory.id})`,
      excerpt: fact.features.join("; "),
      language: "en",
      verifiedOn: "2026-08-25",
      supportedClaimIds: [featureClaimId]
    },
    {
      id: featureBriefLineId,
      sourceId: "visual.tool-briefs",
      locator: `${brief.briefId}#mustShow`,
      excerpt: brief.mustShow.join("; "),
      language: "en",
      verifiedOn: "2026-08-25",
      supportedClaimIds: [featureClaimId]
    },
    {
      id: featureReleaseLineId,
      sourceId: "visual.tool-release",
      locator: `tools.json#conceptId=${inventory.id}`,
      excerpt: JSON.stringify({
        productionStatus: release.productionStatus,
        technical: release.review.technical,
        phone: release.review.phone,
        print: release.review.print,
        securityLeak: release.review.securityLeak
      }),
      language: "en",
      verifiedOn: "2026-08-25",
      supportedClaimIds: [featureClaimId]
    }
  )
  claims.push({
    id: featureClaimId,
    text: `${release.canonicalTerm} is recognized by ${fact.features.join(" and ")}.`,
    sourceLineIds: [featureFactLineId, featureBriefLineId, featureReleaseLineId],
    evidenceTier: "accepted-release-record",
    caveat: "Recognition cues describe the accepted original illustration and do not imply a universal product silhouette."
  })
  toolClaimIds.set(inventory.id, { useClaimId, featureClaimId })
}

const comparisonClaimIds = new Map()
for (const comparison of acceptedComparisons) {
  const claimId = `claim.comparison.${comparison.opaqueAssetId}`
  addSingleLineClaim({
    claimId,
    text: comparison.decisiveDistinction,
    lineId: `line.comparison.${comparison.opaqueAssetId}`,
    sourceId: "visual.comparison-release",
    locator: `comparisons.json#id=${comparison.id}/decisiveDistinction`,
    excerpt: comparison.decisiveDistinction,
    evidenceTier: "accepted-release-record",
    caveat: comparison.scoredUseGate.length === 0
      ? null
      : comparison.scoredUseGate.join(" ")
  })
  comparisonClaimIds.set(comparison.id, claimId)
}

const applicationClaimIds = applicationQuestions.map((blueprint, index) => {
  const claimId = `claim.safety.${opaqueOrdinal("s", index)}`
  addSingleLineClaim({
    claimId,
    text: blueprint.claim,
    lineId: `line.safety.${opaqueOrdinal("s", index)}`,
    sourceId: blueprint.sourceId,
    locator: blueprint.locator,
    excerpt: blueprint.excerpt,
    evidenceTier: "official-primary",
    caveat: blueprint.caveat ?? null
  })
  return claimId
})

for (const evidence of [...statewideEvidence, ...nassauEvidence]) {
  addSingleLineClaim({
    ...evidence,
    evidenceTier: evidence.sourceId.startsWith("nassau.open")
      ? "maintained-editorial-synthesis"
      : evidence.sourceId === "nassau.factbase"
        ? "official-primary-synthesis"
        : "official-primary"
  })
}

const profiles = launchProfiles

const tools = inventoryTools.map((inventory) => {
  const fact = factById.get(inventory.id)
  const release = releaseById.get(inventory.id)
  const watchlistOrGated = inventory.evidenceTier.includes("C") || release.publicationGate !== null
  const claimIds = toolClaimIds.get(inventory.id)
  return {
    conceptId: inventory.id,
    domain: fact.domain,
    family: inventory.visualFamily,
    evidenceTier: inventory.evidenceTier,
    scopeStatus: watchlistOrGated ? "watchlist-or-gated" : "entry-level-supported",
    sourceIds: ["editorial.tool-facts", "visual.tool-briefs", "visual.tool-release"],
    useClaimId: claimIds.useClaimId,
    featureClaimId: claimIds.featureClaimId,
    useSummary: fact.useSummary,
    distinguishingFeatures: fact.features,
    confusableConceptIds: inventory.confusableIds,
    neutralDescription: `An original black line illustration showing ${fact.features.join(" and ")}; no brand or scale claim.`,
    fullDescription: `${release.canonicalTerm}: ${fact.useSummary} Accepted recognition cues: ${fact.features.join(" and ")}.`,
    practiceEligibility: watchlistOrGated ? "atlas-only" : "text-question"
  }
})

const eligibleIds = new Set(
  tools.filter((tool) => tool.practiceEligibility === "text-question").map((tool) => tool.conceptId)
)
assert(eligibleIds.size === 53, "exactly 53 launch tools must be eligible for text questions")

const profileIds = profiles.map((profile) => profile.id)
const optionFor = (conceptId) => ({
  label: releaseById.get(conceptId).canonicalTerm,
  conceptId
})
const comparisonForOptions = (conceptIds) =>
  acceptedComparisons
    .filter((comparison) =>
      comparison.scoredUseGate.length === 0 &&
      comparison.memberIds.includes(conceptIds[0]) &&
      comparison.memberIds.filter((memberId) => conceptIds.includes(memberId)).length >= 2
    )
    .map((comparison) => comparison.id)

const makeToolQuestion = (fact, factKind, ordinal) => {
  const isFeature = factKind === "recognition-feature"
  const distractors = isFeature ? fact.featureDistractors : fact.useDistractors
  const prompt = isFeature ? fact.featurePrompt : fact.usePrompt
  assert(prompt && distractors?.length === 3, `${fact.id} ${factKind} blueprint is incomplete`)
  const conceptIds = [fact.id, ...distractors]
  assert(unique(conceptIds).length === 4, `${fact.id} ${factKind} options must be unique`)
  assert(conceptIds.every((id) => eligibleIds.has(id)), `${fact.id} ${factKind} uses a gated option`)
  const orderedConceptIds = conceptIds
  const claimKey = isFeature ? "featureClaimId" : "useClaimId"
  const claimIds = unique(orderedConceptIds.map((id) => toolClaimIds.get(id)[claimKey]))
  return {
    prompt,
    options: orderedConceptIds.map(optionFor),
    correctConceptId: fact.id,
    rationales: orderedConceptIds.map((conceptId) => ({
      conceptId,
      message: isFeature
        ? `${releaseById.get(conceptId).canonicalTerm}: ${factById.get(conceptId).features.join("; ")}.`
        : `${releaseById.get(conceptId).canonicalTerm}: ${factById.get(conceptId).useSummary}`,
      claimIds: [toolClaimIds.get(conceptId)[claimKey]]
    })),
    claimIds,
    tags: {
      domain: fact.domain,
      family: inventoryById.get(fact.id).visualFamily,
      confusionSetIds: comparisonForOptions(conceptIds),
      seriesScope: "entry-level-custodians-janitors",
      editorialDifficulty: "foundational"
    },
    objectiveId: toolClaimIds.get(fact.id)[claimKey],
    factKind
  }
}

// These twelve use prompts exercised the same concept/direction as an accepted
// comparison or companion wrench item. They are replaced in v2 before release,
// so no migration is needed and each advertised slot has its own objective.
const replacedUseConceptIds = new Set([
  ...comparisonQuestions.map((question) => question.correctConceptId),
  "tool.adjustable-wrench"
])
assert(replacedUseConceptIds.size === 12, "the semantic-repeat replacement set must contain 12 concepts")

const useQuestions = toolFacts
  .filter((fact) => fact.usePrompt !== undefined && !replacedUseConceptIds.has(fact.id))
  .map((fact, index) => makeToolQuestion(fact, "use", index))
const featureQuestions = toolFacts
  .filter((fact) => fact.featurePrompt !== undefined)
  .map((fact, index) => makeToolQuestion(fact, "recognition-feature", index))

const contrastQuestions = comparisonQuestions.map((blueprint) => {
  const comparison = comparisonById.get(blueprint.comparisonId)
  assert(comparison !== undefined, `${blueprint.comparisonId} has no accepted comparison release`)
  assert(comparison.scoredUseGate.length === 0, `${blueprint.comparisonId} is gated from scoring`)
  assert(comparison.memberIds.includes(blueprint.correctConceptId), "comparison correct member is invalid")
  const claimId = comparisonClaimIds.get(comparison.id)
  return {
    prompt: blueprint.prompt,
    options: comparison.memberIds.map(optionFor),
    correctConceptId: blueprint.correctConceptId,
    rationales: comparison.memberIds.map((conceptId) => ({
      conceptId,
      message: conceptId === blueprint.correctConceptId
        ? blueprint.correctExplanation
        : blueprint.incorrectExplanations?.[conceptId] ?? blueprint.incorrectExplanation,
      claimIds: [claimId]
    })),
    claimIds: [claimId],
    tags: {
      domain: factById.get(blueprint.correctConceptId).domain,
      family: inventoryById.get(blueprint.correctConceptId).visualFamily,
      confusionSetIds: [comparison.id],
      seriesScope: "entry-level-custodians-janitors",
      editorialDifficulty: "contrast"
    },
    objectiveId: claimId,
    factKind: "comparison-distinction"
  }
})

const safetyQuestions = applicationQuestions.map((blueprint, index) => {
  const claimId = applicationClaimIds[index]
  return {
    prompt: blueprint.prompt,
    options: blueprint.options.map(([label], optionIndex) => ({
      label,
      conceptId: `action.${opaqueOrdinal("q", index)}.${String.fromCharCode(97 + optionIndex)}`
    })),
    correctConceptId: `action.${opaqueOrdinal("q", index)}.${String.fromCharCode(97 + blueprint.options.findIndex(([, correct]) => correct))}`,
    rationales: blueprint.options.map(([, correct], optionIndex) => ({
      conceptId: `action.${opaqueOrdinal("q", index)}.${String.fromCharCode(97 + optionIndex)}`,
      message: correct
        ? `Correct. ${blueprint.claim}`
        : `That response does not follow the cited safety objective. ${blueprint.claim}`,
      claimIds: [claimId]
    })),
    claimIds: [claimId],
    tags: {
      domain: "health-and-safety",
      family: blueprint.family,
      confusionSetIds: [],
      seriesScope: "entry-level-custodians-janitors",
      editorialDifficulty: "application"
    },
    objectiveId: claimId,
    factKind: "safety-application"
  }
})

const reviewEvidenceFor = (question) => {
  const claimById = new Map(claims.map((claim) => [claim.id, claim]))
  const sourceLineById = new Map(sourceLines.map((line) => [line.id, line]))
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const reviewedClaims = question.claimIds.map((claimId) => claimById.get(claimId))
  assert(reviewedClaims.every(Boolean), `${question.id} review evidence is missing a claim`)
  const reviewedLineIds = unique(reviewedClaims.flatMap((claim) => claim.sourceLineIds))
  const reviewedLines = reviewedLineIds.map((lineId) => sourceLineById.get(lineId))
  assert(reviewedLines.every(Boolean), `${question.id} review evidence is missing a source line`)
  const reviewedSourceIds = unique(reviewedLines.map((line) => line.sourceId))
  const reviewedSources = reviewedSourceIds.map((sourceId) => sourceById.get(sourceId))
  assert(reviewedSources.every(Boolean), `${question.id} review evidence is missing a source`)
  return {
    claims: reviewedClaims.map((claim) => ({
      id: claim.id,
      text: claim.text,
      sourceLineIds: [...claim.sourceLineIds],
      evidenceTier: claim.evidenceTier,
      caveat: claim.caveat
    })),
    sourceLines: reviewedLines.map((line) => ({
      id: line.id,
      sourceId: line.sourceId,
      locator: line.locator,
      excerpt: line.excerpt,
      language: line.language,
      verifiedOn: line.verifiedOn,
      supportedClaimIds: [...line.supportedClaimIds]
    })),
    sources: reviewedSources.map((source) => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      evidenceTier: source.evidenceTier,
      version: source.version,
      locator: source.locator,
      scope: source.scope,
      rightsNotes: source.rightsNotes,
      url: source.url ?? null
    }))
  }
}

const reviewText = (question) => JSON.stringify({
  schemaVersion: 1,
  id: question.id,
  version: question.version,
  profileIds: [...question.profileIds],
  prompt: question.prompt,
  options: question.options.map(({ id, label, conceptId }) => ({ id, label, conceptId })),
  correctOptionId: question.correctOptionId,
  rationales: question.rationales.map(({ optionId, message, claimIds }) => ({ optionId, message, claimIds: [...claimIds] })),
  claimIds: [...question.claimIds],
  tags: {
    domain: question.tags.domain,
    family: question.tags.family,
    confusionSetIds: [...question.tags.confusionSetIds],
    seriesScope: question.tags.seriesScope,
    editorialDifficulty: question.tags.editorialDifficulty
  },
  capacity: {
    objectiveId: question.capacity.objectiveId,
    equivalenceGroupId: question.capacity.equivalenceGroupId,
    factKind: question.capacity.factKind
  },
  originalContentAttestation: question.originalContentAttestation,
  evidence: reviewEvidenceFor(question)
})
const reviewDigest = (question) =>
  createHash("sha256").update(reviewText(question)).digest("hex")

const drafts = [...useQuestions, ...featureQuestions, ...contrastQuestions, ...safetyQuestions]
assert(optionPermutations.length === 90, "the authored option-order ledger must contain 90 rows")
const questionsWithoutReviews = drafts.map((unpermutedDraft, index) => {
  const id = opaqueOrdinal("q", index)
  const permutation = optionPermutations[index].filter(
    (value) => value < unpermutedDraft.options.length
  )
  assert(
    permutation.length === unpermutedDraft.options.length &&
      unique(permutation).length === unpermutedDraft.options.length &&
      permutation.every((value) => value >= 0 && value < unpermutedDraft.options.length),
    `${id} has an invalid authored option permutation`
  )
  const reorderedOptions = permutation.map((optionIndex) => unpermutedDraft.options[optionIndex])
  const rationaleByConcept = new Map(
    unpermutedDraft.rationales.map((rationale) => [rationale.conceptId, rationale])
  )
  const draft = {
    ...unpermutedDraft,
    options: reorderedOptions,
    rationales: reorderedOptions.map((option) => rationaleByConcept.get(option.conceptId))
  }
  const optionIds = draft.options.map((_, optionIndex) => String.fromCharCode(97 + optionIndex))
  const optionIdByConcept = new Map(
    draft.options.map((entry, optionIndex) => [entry.conceptId, optionIds[optionIndex]])
  )
  return {
    id,
    version: 1,
    profileIds,
    prompt: draft.prompt,
    options: draft.options.map((entry, optionIndex) => ({ id: optionIds[optionIndex], ...entry })),
    correctOptionId: optionIdByConcept.get(draft.correctConceptId),
    rationales: draft.rationales.map((rationale) => ({
      optionId: optionIdByConcept.get(rationale.conceptId),
      message: rationale.message,
      claimIds: rationale.claimIds
    })),
    claimIds: draft.claimIds,
    tags: draft.tags,
    capacity: {
      objectiveId: draft.objectiveId,
      equivalenceGroupId: opaqueOrdinal("eq", index),
      factKind: draft.factKind
    },
    originalContentAttestation: true
  }
})

assert(useQuestions.length === 41, "launch requires 41 non-redundant tool-use questions")
assert(featureQuestions.length === 26, "launch requires 26 recognition-feature questions")
assert(contrastQuestions.length === 11, "launch requires 11 ungated comparison questions")
assert(safetyQuestions.length === 12, "launch requires 12 safety-application questions")
assert(questionsWithoutReviews.length === 90, "launch requires exactly 90 reviewed questions")
assert(unique(questionsWithoutReviews.map((question) => question.prompt)).length === 90, "question prompts must be unique")
assert(unique(questionsWithoutReviews.map((question) => question.capacity.objectiveId)).length === 90, "semantic objectives must be unique")
assert(unique(questionsWithoutReviews.map((question) => question.capacity.equivalenceGroupId)).length === 90, "equivalence groups must be unique")

const reviewCandidates = questionsWithoutReviews.map((question) => ({
  id: question.id,
  reviewedArtifactSha256: reviewDigest(question)
}))
if (process.argv.includes("--review-candidates")) {
  console.log(JSON.stringify(reviewCandidates, null, 2))
  process.exit(0)
}

const reviewById = new Map(questionReviews.map((review) => [review.id, review]))
assert(reviewById.size === 90, "the explicit review ledger must contain exactly 90 unique records")
const questions = questionsWithoutReviews.map((question, index) => {
  const review = reviewById.get(question.id)
  assert(review !== undefined, `missing explicit review for ${question.id}`)
  assert(review.reviewedArtifactSha256 === reviewDigest(question), `${question.id} changed after review`)
  return {
    ...question,
    reviewReceipt: {
      id: opaqueOrdinal("r", index),
      reviewedAt: review.reviewedAt,
      reviewerKind: "ai-agent",
      reviewMethod: "agent-assisted-editorial-source-security-accessibility-review",
      reviewedArtifactSha256: review.reviewedArtifactSha256,
      evidenceClaimIds: question.claimIds,
      outcomes: review.outcomes
    }
  }
})

const pack = {
  schemaVersion: 1,
  packId: "launch-v1",
  version: 3,
  locale: "en",
  sources,
  sourceLines,
  claims,
  profiles,
  tools,
  comparisonIds: acceptedComparisons.map((comparison) => comparison.id),
  comparisonSourceIds: ["visual.comparison-release"],
  advertisedPracticeLengths: [45, 60, 90],
  questions,
  sceneIds: acceptedScenes.map((scene) => scene.sceneId)
}

const output = `${JSON.stringify(pack, null, 2)}\n`
if (process.argv.includes("--check")) {
  const current = await readFile(packUrl, "utf8")
  assert(current === output, "launch-v1.json is stale; run build-launch-v1.mjs")
} else {
  await writeFile(packUrl, output)
  console.log(
    `wrote launch-v1.json: ${tools.length} tools, ${pack.comparisonIds.length} comparisons, ` +
      `${questions.length} questions, ${pack.sceneIds.length} scenes`
  )
}

import { createHash } from "node:crypto"

export interface ReviewableQuestion {
  readonly id: string
  readonly version: number
  readonly profileIds: ReadonlyArray<string>
  readonly prompt: string
  readonly options: ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly conceptId: string
  }>
  readonly correctOptionId: string
  readonly rationales: ReadonlyArray<{
    readonly optionId: string
    readonly message: string
    readonly claimIds: ReadonlyArray<string>
  }>
  readonly claimIds: ReadonlyArray<string>
  readonly tags: {
    readonly domain: string
    readonly family: string
    readonly confusionSetIds: ReadonlyArray<string>
    readonly seriesScope: string
    readonly editorialDifficulty: string
  }
  readonly capacity: {
    readonly objectiveId: string
    readonly equivalenceGroupId: string
    readonly factKind: string
  }
  readonly originalContentAttestation: true
}

export interface QuestionReviewEvidence {
  readonly claims: ReadonlyArray<{
    readonly id: string
    readonly text: string
    readonly sourceLineIds: ReadonlyArray<string>
    readonly evidenceTier: string
    readonly caveat: string | null
  }>
  readonly sourceLines: ReadonlyArray<{
    readonly id: string
    readonly sourceId: string
    readonly locator: string
    readonly excerpt: string
    readonly language: string
    readonly verifiedOn: string
    readonly supportedClaimIds: ReadonlyArray<string>
  }>
  readonly sources: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly publisher: string
    readonly evidenceTier: string
    readonly version: string
    readonly locator: string
    readonly scope: string
    readonly rightsNotes: string
    readonly url?: string
  }>
}

const unique = (values: readonly string[]): readonly string[] => [...new Set(values)]

const exactEvidenceProjection = (
  question: ReviewableQuestion,
  evidence: QuestionReviewEvidence
) => {
  const claimById = new Map(evidence.claims.map((claim) => [claim.id, claim] as const))
  const sourceLineById = new Map(
    evidence.sourceLines.map((line) => [line.id, line] as const)
  )
  const sourceById = new Map(evidence.sources.map((source) => [source.id, source] as const))
  const claims = question.claimIds.map((claimId) => {
    const claim = claimById.get(claimId)
    if (claim === undefined) throw new Error(`Review projection is missing claim ${claimId}`)
    return claim
  })
  const sourceLineIds = unique(claims.flatMap((claim) => claim.sourceLineIds))
  const sourceLines = sourceLineIds.map((sourceLineId) => {
    const line = sourceLineById.get(sourceLineId)
    if (line === undefined) {
      throw new Error(`Review projection is missing source line ${sourceLineId}`)
    }
    return line
  })
  const sourceIds = unique(sourceLines.map((line) => line.sourceId))
  const sources = sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    if (source === undefined) throw new Error(`Review projection is missing source ${sourceId}`)
    return source
  })
  return {
    claims: claims.map((claim) => ({
      id: claim.id,
      text: claim.text,
      sourceLineIds: [...claim.sourceLineIds],
      evidenceTier: claim.evidenceTier,
      caveat: claim.caveat
    })),
    sourceLines: sourceLines.map((line) => ({
      id: line.id,
      sourceId: line.sourceId,
      locator: line.locator,
      excerpt: line.excerpt,
      language: line.language,
      verifiedOn: line.verifiedOn,
      supportedClaimIds: [...line.supportedClaimIds]
    })),
    sources: sources.map((source) => ({
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

/**
 * The exact reviewed projection. Keeping the field order explicit makes review
 * receipts reproducible across the authoring builder, Node tests, and Bun.
 */
export const questionReviewText = (
  question: ReviewableQuestion,
  evidence: QuestionReviewEvidence
): string =>
  JSON.stringify({
    schemaVersion: 1,
    id: question.id,
    version: question.version,
    profileIds: [...question.profileIds],
    prompt: question.prompt,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      conceptId: option.conceptId
    })),
    correctOptionId: question.correctOptionId,
    rationales: question.rationales.map((rationale) => ({
      optionId: rationale.optionId,
      message: rationale.message,
      claimIds: [...rationale.claimIds]
    })),
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
    evidence: exactEvidenceProjection(question, evidence)
  })

export const questionReviewSha256 = (
  question: ReviewableQuestion,
  evidence: QuestionReviewEvidence
): string =>
  createHash("sha256").update(questionReviewText(question, evidence)).digest("hex")
